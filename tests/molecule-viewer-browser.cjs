const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const { createThreeStub } = require('./molecule-viewer-fixture.cjs');
const base = process.env.TEST_URL || 'http://127.0.0.1:8000';
const origin = new URL(base).origin;
const dependency = 'https://cdn.jsdelivr.net/npm/three@0.170.0/+esm';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), args: ['--no-sandbox'] });
  try {
    for (const width of [320, 390]) for (const mode of ['success', 'constructor-failure', 'dependency-failure', 'init-failure', 'render-failure']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
      let dependencyRequests = 0;
      // Never contact the CDN, even if a test setup accidentally misses a stub.
      await context.route('**/*', route => {
        if (new URL(route.request().url()).origin === origin) return route.continue();
        if (route.request().url() === dependency) dependencyRequests++;
        return route.abort('failed');
      });
      if (mode !== 'dependency-failure') await context.addInitScript({ content:
        `window.__moleculeFixture = (${createThreeStub.toString()})(() => document.createElement('canvas'), ${JSON.stringify(mode)}); window.THREE = window.__moleculeFixture.THREE;`
      });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/?tab=compounds`);
      const host = page.locator('.molecule3d').first();
      await page.waitForFunction(() => ['1', 'unavailable'].includes(document.querySelector('.molecule3d')?.dataset.ready));
      const successful = mode === 'success';
      assert.equal(await host.getAttribute('data-ready'), successful ? '1' : 'unavailable');
      assert.match(await host.getAttribute('aria-label'), /Illustrative 3D sketch.*Not a validated molecular structure/);
      assert.equal(await host.locator('..').getAttribute('aria-describedby'), await host.locator('.molecule-disclaimer').getAttribute('id'));
      assert.match(await host.locator('.molecule-disclaimer').innerText(), /Illustrative sketch\.\s*Not a validated molecular structure\./);
      assert.equal(await host.locator('.molecule-status').innerText(), successful ? 'Drag to rotate' : '3D illustration unavailable');
      assert.equal(await host.locator('canvas').count(), successful ? 1 : 0);
      assert.equal(await host.evaluate(el => getComputedStyle(el).cursor), successful ? 'grab' : 'pointer');
      assert.equal(await host.evaluate(el => getComputedStyle(el).touchAction), successful ? 'none' : 'auto');
      if (!successful) assert.doesNotMatch(await host.innerText(), /drag/i);
      const bounds = await host.evaluate(el => {
        const host = el.getBoundingClientRect(), status = el.querySelector('.molecule-status').getBoundingClientRect(), note = el.querySelector('.molecule-disclaimer').getBoundingClientRect();
        return { labelsFit: status.top >= host.top && status.left >= host.left && status.right <= host.right && note.bottom <= host.bottom && note.left >= host.left && note.right <= host.right,
          noOverlap: status.bottom < note.top, fontSize: parseFloat(getComputedStyle(el.querySelector('.molecule-disclaimer')).fontSize) };
      });
      assert.ok(bounds.labelsFit && bounds.noOverlap, `${mode} labels fit at ${width}px`);
      assert.ok(bounds.fontSize >= 11);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      if (['success', 'constructor-failure'].includes(mode)) await page.locator('.compound-card').first().screenshot({ path: `/tmp/terpene-molecule-${mode}-${width}.png` });
      if (mode === 'dependency-failure') assert.equal(dependencyRequests, 1, 'Concurrent viewers share one failed dependency request');
      else assert.equal(dependencyRequests, 0);
      if (successful) {
        const snapshot = await page.evaluate(() => JSON.stringify(D));
        await page.evaluate(() => { window.__oldMoleculeCanvas = document.querySelector('.molecule3d canvas'); window.__oldRenderers = window.__moleculeFixture.stats.constructors; });
        await page.locator('#compound-search').fill('limonene');
        await page.waitForFunction(() => document.querySelector('.molecule3d')?.dataset.ready === '1');
        assert.equal(await page.locator('.molecule3d').count(), 1);
        assert.equal(await page.evaluate(() => window.__oldMoleculeCanvas.isConnected), false);
        assert.equal(await page.evaluate(() => window.__moleculeFixture.stats.rendererDisposals >= window.__oldRenderers), true);
        assert.equal(await page.evaluate(() => JSON.stringify(D)), snapshot, 'Viewer replacement does not mutate source metadata');
        // Context loss removes the canvas and interaction cue, without a page error.
        await page.locator('.molecule3d canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
        assert.equal(await page.locator('.molecule3d').getAttribute('data-ready'), 'unavailable');
        assert.equal(await page.locator('.molecule3d canvas').count(), 0);
      } else {
        // A fallback stays a usable compound card, including its label area.
        await host.click();
        assert.equal(await page.locator('#compound-detail').isVisible(), true);
      }
      assert.deepEqual(errors, [], `${mode}: no uncaught error at ${width}px`);
      await context.close();
    }
    // Resolve the real import after a host is detached; never recreate a stale canvas.
    const context = await browser.newContext({ serviceWorkers: 'block' });
    let releaseDependency;
    const released = new Promise(resolve => { releaseDependency = resolve; });
    const names = ['Scene', 'PerspectiveCamera', 'AmbientLight', 'DirectionalLight', 'Group', 'Mesh', 'SphereGeometry', 'CylinderGeometry', 'MeshStandardMaterial', 'Vector3', 'WebGLRenderer'];
    const moduleBody = `const fixture = (${createThreeStub.toString()})(() => document.createElement('canvas')); window.__moleculeFixture = fixture; const THREE = fixture.THREE; ${names.map(name => `export const ${name} = THREE.${name};`).join('\n')}`;
    await context.route('**/*', async route => {
      if (new URL(route.request().url()).origin === origin) return route.continue();
      if (route.request().url() !== dependency) return route.abort('failed');
      await released;
      return route.fulfill({ status: 200, contentType: 'application/javascript', headers: { 'access-control-allow-origin': '*' }, body: moduleBody });
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/?tab=compounds`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.molecule3d')?.dataset.ready === 'loading');
    await page.evaluate(() => { window.__detachedMoleculeHost = document.querySelector('.molecule3d'); window.__detachedMoleculeHost.remove(); });
    releaseDependency();
    await page.waitForFunction(() => window.__moleculeFixture && !window.__detachedMoleculeHost.dataset.ready);
    assert.equal(await page.evaluate(() => window.__detachedMoleculeHost.querySelector('canvas') === null), true);
    assert.deepEqual(errors, []);
    await context.close();
    console.log('PASS: browser viewer success/failure labels, 320/390px fit, fallback navigation, context loss, re-render cleanup and delayed-import detachment without CDN access');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
