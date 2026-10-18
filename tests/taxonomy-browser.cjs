/* JSON-only taxonomy expansion, scoped associations, and arbitrary-depth UI regression. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { execFileSync, spawnSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'terpene-taxonomy-'));
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'master-data.json'), 'utf8'));
const ids = ['fixture-topic', 'fixture-system', 'fixture-model', 'fixture-leaf', 'fixture-sibling'];
const labels = ['Fixture research', 'Fixture system', 'Fixture model', 'Fixture leaf', 'Fixture sibling'];
const parents = [null, ids[0], ids[1], ids[2], ids[2]];
ids.forEach((id, i) => fixture.registries.useNodes.push({ id, label: labels[i], parentId: parents[i], aliases: [], legacyBindings: [], declared: false }));
const seed = fixture.registries.studies[0];
function addStudy(id, tags, oilIds, compoundIds) {
  const record = { ...JSON.parse(JSON.stringify(seed)), id, title: id, doi: `10.9999/${id}`, pubmedId: String(900000000 + fixture.registries.studies.length), url: `https://example.org/research/${id}`, finding: 'A fixture-only finding; not a real clinical claim.', useNodeIds: tags };
  delete record.citationReview; delete record.summaryReview; // Synthetic paper has no real source review.
  fixture.registries.studies.push(record);
  oilIds.forEach((oilId, order) => fixture.oils.find(oil => oil.id === oilId).studyLinks.push({ studyId: id, order }));
  compoundIds.forEach((compoundId, order) => fixture.registries.compounds.find(compound => compound.id === compoundId).studyLinks.push({ studyId: id, order }));
}
addStudy('fixture-shared', [ids[3], ids[4]], ['lemon', 'lavender'], ['limonene']);
addStudy('fixture-parent', [ids[0]], ['lemon'], []);
addStudy('fixture-multitag', [ids[3], ids[4]], ['lemon'], ['limonene']);
function addAssertion(oilId, studyId, useNodeId, direct) {
  const id = `assert-${oilId}-${studyId}-${useNodeId}`;
  fixture.registries.evidenceAssertions.push({ id, kind: 'study-use', oilId, studyId, useNodeId, researchMatch: direct,
    finding: 'Scoped fixture finding', limitations: 'Fixture limitation', material: { kind: 'essential-oil', label: 'Fixture material' },
    model: { label: 'Fixture experimental model' }, outcome: { direction: 'null', label: 'Fixture measured outcome' },
    route: 'Fixture route', species: 'Fixture species', relevance: direct ? 'direct' : 'unreviewed',
    verification: { status: direct ? 'source-checked' : 'unreviewed', sourceIds: [], urls: [], checkedAt: null, notes: 'Synthetic regression fixture' } });
  const oil = fixture.oils.find(oil => oil.id === oilId);
  const chain = [], byId = new Map(fixture.registries.useNodes.map(node => [node.id, node]));
  let node = byId.get(useNodeId);
  while (node) { chain.unshift(node.id); node = byId.get(node.parentId); }
  let branches = oil.uses;
  chain.forEach((nodeId, index) => {
    let branch = branches.find(item => item.useNodeId === nodeId);
    if (!branch) { branch = { useNodeId: nodeId, evidenceIds: [], children: [] }; branches.push(branch); }
    if (index === chain.length - 1) branch.evidenceIds.push(id);
    branches = branch.children;
  });
}
addAssertion('lemon', 'fixture-shared', ids[3], true);
addAssertion('lavender', 'fixture-shared', ids[4], false);
addAssertion('lemon', 'fixture-parent', ids[0], false);
addAssertion('lemon', 'fixture-multitag', ids[3], true);
addAssertion('lemon', 'fixture-multitag', ids[4], true);
const masterPath = path.join(temp, 'master.json'), generatedPath = path.join(temp, 'data.js');
fs.writeFileSync(masterPath, JSON.stringify(fixture));
execFileSync('python3', [path.join(root, 'scripts/build-data.py'), '--master', masterPath, '--output', generatedPath]);
const invalid = structuredClone(fixture);
invalid.registries.studies.find(study => study.id === 'fixture-shared').useNodeIds.push('fixture-unknown');
const invalidPath = path.join(temp, 'invalid.json');
fs.writeFileSync(invalidPath, JSON.stringify(invalid));
const invalidResult = spawnSync('python3', [path.join(root, 'scripts/build-data.py'), '--master', invalidPath, '--validate-only'], { encoding: 'utf8' });
assert.notEqual(invalidResult.status, 0, 'Unknown master tags must fail validation');
assert.match(invalidResult.stderr, /unknown reference/);
// Also exercise graceful rendering if a stale/third-party projection has an unknown tag.
const generated = fs.readFileSync(generatedPath, 'utf8') + '\nTERPENE_DATA.studies.find(s => s.id === "fixture-shared").useNodeIds.push("fixture-unknown");';
// Exercise every production renderer independently of browser availability.
const vm = require('node:vm');
const elements = new Map();
const htmlIds = new Set([...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/id="([^"]+)"/g)].map(match => match[1]));
['pathway-plants', 'pathway-compounds', 'pathway-uses', 'pathway-evidence', 'pathway-close'].forEach(id => htmlIds.add(id));
function element(id) {
  if (!elements.has(id)) {
    const classes = new Set();
    elements.set(id, { value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
      tagName: id.includes('filter') || id.includes('sort') ? 'SELECT' : 'DIV',
      classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value), toggle: (value, on) => on ? classes.add(value) : classes.delete(value) },
      addEventListener() {}, querySelectorAll() { return []; }, querySelector() { return null; }, scrollIntoView() {} });
  }
  return elements.get(id);
}
const windowStub = { addEventListener() {}, location: { href: 'https://example.test/' } };
windowStub.self = windowStub.top = windowStub;
const context = vm.createContext({
  document: { getElementById: id => htmlIds.has(id) ? element(id) : null, querySelectorAll: () => [], querySelector: selector => selector === '.tab.active' ? null : element(selector), addEventListener() {} },
  window: windowStub, location: { search: '' }, history: { pushState() {}, replaceState() {} }, URL, URLSearchParams,
  requestAnimationFrame: callback => callback(), echarts: { init: () => ({ setOption() {}, on() {}, dispose() {} }) }
});
vm.runInContext(generated, context, { filename: 'generated-fixture-data.js' });
for (const file of ['chemistry.js', 'research.js', 'app.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
const run = code => vm.runInContext(code, context);
const snapshot = run('JSON.stringify(D)');
assert.equal(run('R.countStudies("fixture-topic")'), 3);
assert.equal(run('R.countStudies("fixture-leaf")'), 2);
assert.equal(run('R.countStudies("fixture-unknown")'), 0);
assert.equal(run('R.matchesStudy(D.studies.find(s => s.id === "fixture-shared"), ["fixture-leaf", "fixture-sibling"])'), true);
assert.equal(run('R.matchesStudy(D.studies.find(s => s.id === "fixture-shared"), "fixture-unknown")'), false);
run('renderDomainTiles()'); assert.ok(element('domain-tiles').innerHTML.includes('data-domain="fixture-topic"'));
run('showDomain("fixture-topic")'); assert.equal((element('domain-studies').innerHTML.match(/class="study"/g) || []).length, 3);
run('showDomain("fixture-leaf")'); assert.equal((element('domain-studies').innerHTML.match(/class="study"/g) || []).length, 2);
assert.ok(element('domain-oils').innerHTML.includes('data-oil="lemon"'));
assert.ok(!element('domain-oils').innerHTML.includes('data-oil="lavender"'));
assert.equal((element('domain-breadcrumb').innerHTML.match(/data-domain-parent=/g) || []).length, 5);
assert.equal(run('matrixCell("lemon", "fixture-leaf").length'), 2);
assert.equal(run('matrixCell("lavender", "fixture-leaf").length'), 0);
run('setTopicFilter("study-domain-filter", "fixture-leaf"); renderStudies()'); assert.equal(element('study-count').textContent, '2 studies');
element('study-oil-filter').value = 'lavender'; run('renderStudies()'); assert.equal(element('study-count').textContent, '0 studies');
element('study-oil-filter').value = 'lemon'; run('renderStudies()'); assert.equal(element('study-count').textContent, '2 studies');
for (const text of ['Fixture material', 'Fixture experimental model', 'Fixture measured outcome', 'Scoped fixture finding', 'Fixture limitation', 'Fixture species', 'Fixture route']) assert.ok(element('study-list').innerHTML.includes(text));
assert.ok(!element('study-list').innerHTML.includes('data-goto-use="fixture-sibling"'));
run('showCompound("limonene")'); assert.ok(element('compound-studies').innerHTML.includes('data-goto-use="fixture-leaf"'));
run('showOil("lemon")'); assert.ok(element('oil-domains').innerHTML.includes('data-domain-filter="fixture-topic"'));
run('renderPathway("lemon"); renderPathwayForOil("lemon", "fixture-topic")'); assert.equal((element('pathway-evidence').innerHTML.match(/class="study"/g) || []).length, 3);
run('renderPathwayForOil("lemon", "fixture-leaf")'); assert.equal((element('pathway-evidence').innerHTML.match(/class="study"/g) || []).length, 2);
assert.equal(run('JSON.stringify(D)'), snapshot, 'Rendering must not mutate the master projection');
console.log('PASS: JSON-only deep taxonomy in every renderer; scoped assertions; multi-tag dedup; parent attachments; unknown-tag safety; source qualifiers');
if (process.env.TAXONOMY_UNIT_ONLY) { fs.rmSync(temp, { recursive: true, force: true }); process.exit(0); }
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/data.js') { res.setHeader('content-type', 'application/javascript'); res.end(generated); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  try { res.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); }
  catch { res.writeHead(404); res.end(); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ serviceWorkers: 'block' });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/?tab=domains`);
    assert.equal(await page.locator('[data-domain="fixture-topic"]').count(), 1, 'JSON root appears without a JavaScript edit');
    assert.equal(await page.locator('[data-domain="fixture-topic"] .domain-n').textContent(), '3 studies', 'Multi-tags deduplicate');
    await page.locator('[data-domain="fixture-topic"]').click();
    assert.equal(await page.locator('#domain-studies .study').count(), 3, 'Parent-level attachments remain included');
    assert.equal(await page.locator('#domain-subs [data-sub="fixture-system"]').count(), 1);
    await page.locator('#domain-subs [data-sub="fixture-system"]').click();
    await page.locator('#domain-subs [data-sub="fixture-model"]').click();
    await page.locator('#domain-subs [data-sub="fixture-leaf"]').click();
    assert.equal(await page.locator('#domain-name').textContent(), 'Fixture leaf');
    assert.equal(await page.locator('#domain-studies .study').count(), 2);
    assert.equal(await page.locator('#domain-oils [data-oil="lemon"]').count(), 1);
    assert.equal(await page.locator('#domain-oils [data-oil="lavender"]').count(), 0, 'No Cartesian oil/topic inference');
    assert.equal(await page.locator('#domain-compounds [data-c="limonene"]').count(), 1);
    assert.equal(await page.locator('#domain-breadcrumb [data-domain-parent]').count(), 5, 'Four levels plus all-topics crumb');
    await page.goBack(); assert.equal(await page.locator('#domain-name').textContent(), 'Fixture model');
    await page.goForward(); assert.equal(await page.locator('#domain-name').textContent(), 'Fixture leaf');
    await page.locator('#domain-compounds [data-c="limonene"]').click();
    assert.equal(await page.locator('#compound-name').textContent(), 'Limonene');
    assert.equal(await page.locator('#compound-studies [data-study-id="fixture-shared"] [data-goto-use="fixture-leaf"]').count(), 1);
    await page.goBack(); assert.equal(await page.locator('#domain-name').textContent(), 'Fixture leaf');
    await page.goto(`${base}/?tab=studies`);
    assert.equal(await page.locator('#study-domain-filter option[value="fixture-leaf"]').count(), 0, 'Only roots offered at first; hidden native options can leak to accessibility');
    await page.locator('#study-domain-filter').selectOption('fixture-topic');
    assert.equal(await page.locator('#study-list .study').count(), 3);
    for (const id of ['fixture-system', 'fixture-model', 'fixture-leaf']) await page.locator('#study-domain-filter-navigation .topic-child-select').selectOption(id);
    assert.equal(await page.locator('#study-list .study').count(), 2);
    assert.equal(await page.locator('#study-domain-filter-navigation .topic-child-select').count(), 0);
    await page.locator('#study-oil-filter').selectOption('lavender');
    assert.equal(await page.locator('#study-list .study').count(), 0, 'Study oil filter uses scoped assertion join');
    await page.locator('#study-oil-filter').selectOption('lemon');
    assert.equal(await page.locator('#study-list .study').count(), 2);
    const card = page.locator('#study-list [data-study-id="fixture-shared"]');
    assert.equal(await card.locator('.research-scope').isVisible(), true);
    assert.equal(await card.locator('.research-scope').evaluate(node => !!node.closest('details')), false);
    assert.ok((await card.locator('.research-scope').innerText()).includes('Scoped fixture finding'));
    await card.locator('.research-assessments summary').click();
    for (const text of ['Fixture material', 'Fixture experimental model', 'Fixture measured outcome', 'Fixture route', 'Fixture species', 'Scoped fixture finding', 'Fixture limitation', 'Source-reviewed direct research']) assert.ok((await card.innerText()).includes(text), text);
    assert.equal(await card.locator('[data-goto-use="fixture-sibling"]').count(), 0, 'Oil-specific card hides unrelated paper tags');
    assert.equal(await page.locator('[data-goto-use="fixture-unknown"]').count(), 0);
    await page.locator('#study-domain-filter-navigation [data-filter-node="fixture-topic"]').click();
    assert.equal(await page.locator('#study-list .study').count(), 3);
    await page.locator('#study-list [data-study-id="fixture-parent"] .research-assessments summary').click();
    assert.ok((await page.locator('#study-list [data-study-id="fixture-parent"]').innerText()).includes('Library-linked evidence; applicability not independently verified'));
    await page.goto(`${base}/?tab=studies`); await page.locator('#study-search').fill('Fixture leaf');
    assert.equal(await page.locator('#study-list .study').count(), 2, 'New labels are searchable');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const embed of [false, true]) {
        await page.goto(`${base}/?tab=studies&oil=lemon&domain=fixture-leaf${embed ? '&embed=1' : ''}`);
        assert.equal(await page.locator('#study-list .study').count(), 2);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `No overflow at ${width}; embed ${embed}`);
      }
    }
    await page.goto(`${base}/?tab=oils&domain=fixture-leaf`);
    assert.equal(await page.locator('#oil-grid .card').count(), 1);
    await page.locator('#oil-grid [data-oil="lemon"]').click();
    assert.equal(await page.locator('#oil-domains [data-domain-filter="fixture-topic"]').count(), 1);
    await page.locator('#oil-domains [data-domain-filter="fixture-topic"]').click();
    assert.equal(await page.locator('#study-list .study').count(), 3);
    await page.goto(`${base}/?tab=matrix&domain=fixture-leaf`);
    assert.equal((await page.locator('#matrix-table [data-oil="lemon"][data-domain="fixture-leaf"]').innerText()).trim(), '2');
    assert.equal((await page.locator('#matrix-table [data-oil="lavender"][data-domain="fixture-leaf"]').innerText()).trim(), '0');
    await page.locator('#matrix-table [data-oil="lemon"][data-domain="fixture-leaf"]').click();
    assert.equal(await page.locator('#matrix-inspector .study').count(), 2);
    assert.equal(await page.locator('#tab-matrix').isVisible(), true);
    assert.equal(await page.locator('#matrix-group-filter').inputValue(), 'unclassified', 'Unassigned JSON roots remain discoverable');
    await page.goBack(); assert.equal(await page.locator('#matrix-inspector').isVisible(), false);
    // Retained Pathway works with the same hierarchy, even if not mounted in this shell.
    await page.evaluate(() => {
      for (const id of ['pathway-plants', 'pathway-compounds', 'pathway-uses', 'pathway-evidence']) {
        const div = document.createElement('div'); div.id = id; document.body.appendChild(div);
      }
      renderPathway('lemon');
    });
    await page.locator('#pathway-uses [data-path-use="fixture-topic"]').click();
    assert.equal(await page.locator('#pathway-evidence .study').count(), 3);
    for (const id of ['fixture-system', 'fixture-model', 'fixture-leaf']) await page.locator(`#pathway-uses [data-path-use="${id}"]`).click();
    assert.equal(await page.locator('#pathway-evidence .study').count(), 2);
    assert.equal(await page.locator('#pathway-uses [data-path-parent]').count(), 5);
    assert.deepEqual(errors, []);
    await browser.close();
    console.log('PASS: JSON-only four-level taxonomy; progressive filters; parent attachments; multi-tag deduplication; scoped oil joins; unknown tags; all Lab views; history; mobile/embed; retained Pathway');
  } catch (error) { await browser.close(); throw error; }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { server.close(); fs.rmSync(temp, { recursive: true, force: true }); });
