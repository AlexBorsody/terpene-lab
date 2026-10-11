const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
    args: ['--no-sandbox']
  });
  const page = await browser.newPage({ serviceWorkers: 'block' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = process.env.TEST_URL || 'http://127.0.0.1:8000';
  await page.goto(base);
  const oilOptions = await page.locator('#study-oil-filter option').evaluateAll(options => options.map(option => ({ value: option.value, label: option.textContent })));
  assert.deepEqual(oilOptions[0], { value: '', label: 'All oils' });
  const oilNames = oilOptions.slice(1).map(option => option.label);
  assert.deepEqual(oilNames, [...oilNames].sort((a, b) => a.localeCompare(b)));
  const cannabisIndex = oilOptions.findIndex(option => option.value === 'cannabis');
  assert.equal(oilOptions[cannabisIndex - 1].label, 'Bergamot');
  assert.equal(oilOptions[cannabisIndex + 1].label, 'Cinnamon Bark');
  const counts = await page.evaluate(() => ({
    composition: D.studies.filter(s => s.categories.some(c => c.type === 'botanical' && c.subcategory === 'composition')).length,
    flavonoids: D.studies.filter(s => s.categories.some(c => c.type === 'botanical' && c.subcategory === 'nonvolatile-chemistry')).length,
    aroma: D.studies.filter(s => s.categories.some(c => c.type === 'sensory')).length,
    originalLabel: D.categories.find(c => c.type === 'botanical').label,
    allTopicsMapped: D.studies.every(s => s.categories.every(c => domainByType[researchDomainId(c)]))
  }));
  assert.equal(counts.originalLabel, 'Botanical chemistry', 'Stored taxonomy is unchanged');
  assert.equal(counts.allTopicsMapped, true);
  assert.equal(counts.flavonoids, 1);
  for (const width of [320, 390, 412, 768, 1440]) {
    await page.setViewportSize({ width, height: 915 });
    for (const embed of [false, true]) {
      await page.goto(`${base}/?tab=oils${embed ? '&embed=1' : ''}`);
      assert.equal(await page.locator('[data-oil="clary-sage"] .sub').innerText(), '2 studies on Pest / Repellent, Composition analysis');
      const cannabis = await page.locator('[data-oil="cannabis"] .sub').innerText();
      assert.ok(cannabis.includes('Aroma research, Flavonoid research'));
      assert.ok(!cannabis.includes('Composition analysis'), 'A flavonoid review is not an analytical study');
      assert.ok(!(await page.locator('#oil-grid').innerText()).includes('Botanical chemistry'));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `Overflow at ${width}, embed ${embed}`);
      if (width === 412 && !embed && process.env.LABEL_SCREENSHOT) {
        await page.locator('[data-oil="clary-sage"]').scrollIntoViewIfNeeded();
        await page.screenshot({ path: process.env.LABEL_SCREENSHOT });
      }
    }
  }
  await page.goto(`${base}/?tab=compounds`);
  assert.equal(await page.locator('#compound-list-view .toolbar select').count(), 1);
  const categories = await page.locator('#compound-category-filter option').evaluateAll(options => options.map(option => ({ value: option.value, label: option.textContent })));
  assert.deepEqual(categories[0], { value: '', label: 'All compounds' });
  assert.equal(new Set(categories.map(category => category.label)).size, categories.length);
  for (const category of categories) {
    await page.locator('#compound-category-filter').selectOption(category.value);
    const expected = await page.evaluate(value => D.compounds.filter(compound => CHEMISTRY.matchesCategory(compound, value)).length, category.value);
    assert.ok(expected > 0, category.label);
    assert.equal(await page.locator('#compound-grid .card').count(), expected);
  }
  await page.locator('#compound-category-filter').selectOption('group:aldehyde');
  await page.locator('#compound-search').fill('neral');
  assert.equal(await page.locator('#compound-grid .card').count(), 1);
  await page.locator('#compound-category-filter').selectOption('group:ester');
  assert.equal(await page.locator('#compound-grid .card').count(), 0);
  await page.locator('#compound-search').fill('');
  await page.locator('#compound-category-filter').selectOption('');
  assert.equal(await page.locator('#compound-grid .card').count(), await page.evaluate(() => D.compounds.length));
  await page.goto(`${base}/?tab=studies`);
  for (const width of [320, 390, 412, 1440]) {
    await page.setViewportSize({ width, height: 915 });
    const paper = page.locator('#study-list .read-paper').first();
    await paper.focus();
    const appearance = await paper.evaluate(link => ({
      height: link.getBoundingClientRect().height,
      background: getComputedStyle(link).backgroundColor,
      color: getComputedStyle(link).color,
      outline: getComputedStyle(link).outlineStyle,
      href: link.href,
      target: link.target
    }));
    assert.ok(appearance.height >= 44);
    assert.equal(appearance.background, 'rgb(239, 189, 105)');
    assert.equal(appearance.color, 'rgb(11, 18, 32)');
    assert.equal(appearance.outline, 'solid');
    assert.ok(appearance.href.startsWith('https://'));
    assert.equal(appearance.target, '_blank');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `Study overflow at ${width}`);
  }
  for (const [id, label, count] of [
    ['botanical:composition', 'Composition analysis', counts.composition],
    ['botanical:nonvolatile-chemistry', 'Flavonoid research', counts.flavonoids],
    ['sensory', 'Aroma research', counts.aroma]
  ]) {
    await page.locator('#study-domain-filter').selectOption(id);
    assert.equal(await page.locator('#study-domain-filter option:checked').innerText(), label);
    assert.equal(await page.locator('#study-list .study').count(), count);
    assert.ok(!(await page.locator('#study-list .catchips').allTextContents()).join(' ').includes('Botanical chemistry'));
    await page.locator('#study-domain-filter').selectOption('');
    await page.locator('#study-search').fill(label);
    assert.equal(await page.locator('#study-list .study').count(), count, `Search the displayed label: ${label}`);
    await page.locator('#study-search').fill('');
  }
  await page.evaluate(() => presetStudyFilters({ domain: 'botanical' }));
  assert.equal(await page.locator('#study-list .study').count(), counts.composition + counts.flavonoids);
  await page.goto(`${base}/?tab=oils&oil=clary-sage`);
  await page.locator('#oil-domains [data-domain-filter="botanical:composition"]').click();
  assert.equal(await page.locator('#study-list .study').count(), 1);
  assert.ok((await page.locator('#study-list').innerText()).includes('Salvia sclarea Essential Oil Chemical Composition'));
  await page.getByRole('button', { name: 'Oils', exact: true }).click();
  assert.equal(await page.locator('#oil-grid').isVisible(), true);
  await page.locator('#oil-domain-filter').selectOption('botanical:nonvolatile-chemistry');
  assert.equal(await page.locator('#oil-grid .card').count(), 1);
  assert.ok((await page.locator('#oil-grid').innerText()).includes('Cannabis'));
  await page.goto(`${base}/?tab=matrix`);
  await page.locator('#matrix-domain-filter').selectOption('botanical:nonvolatile-chemistry');
  assert.ok((await page.locator('#matrix-table thead').innerText()).includes('Flavonoid research'));
  const cell = page.locator('#matrix-table [data-oil="cannabis"][data-domain="botanical:nonvolatile-chemistry"]');
  assert.equal((await cell.innerText()).trim(), '1');
  await cell.click();
  assert.equal(await page.locator('#study-list .study').count(), 1);
  assert.ok((await page.locator('#study-list').innerText()).includes('Flavonoids in Cannabis sativa'));
  await page.goto(`${base}/?tab=domains`);
  await page.locator('[data-domain="botanical:composition"]').click();
  assert.equal(await page.locator('#domain-name').innerText(), 'Composition analysis');
  assert.equal(await page.locator('#domain-studies .study').count(), counts.composition);
  assert.equal(await page.locator('#domain-subs button').count(), 0, 'Do not repeat a single topic as a second filter');
  await page.goto(`${base}/?tab=domains&domain=botanical&sub=nonvolatile-chemistry`);
  assert.equal(await page.locator('#domain-studies .study').count(), 1, 'Old taxonomy links still work');
  assert.ok((await page.locator('#domain-name').innerText()).includes('Flavonoid research'));
  for (const [compound, heading, count] of [
    ['limonene', 'Found in these oils', 9],
    ['nobiletin', 'Found in these oils', 3],
    ['cannflavin-a', 'Reported in other materials', 1],
    ['pmd', 'Oil evidence', 0]
  ]) {
    await page.goto(`${base}/?tab=compounds&compound=${compound}`);
    assert.equal(await page.locator('#compound-occurrence-heading').innerText(), heading);
    assert.equal(await page.locator('#compound-oil-links button').count(), count);
    assert.equal(await page.locator('#compound-oils-chart').isVisible(), false);
    assert.equal(await page.locator('#compound-chart-note').isVisible(), false);
  }
  await page.goto(`${base}/?tab=compounds&compound=cannflavin-a`);
  const materialLink = page.locator('#compound-oil-links [data-goto-oil="cannabis"]');
  assert.ok((await materialLink.innerText()).includes('Plant material'));
  await materialLink.click();
  assert.equal(await page.locator('#oil-name').innerText(), 'Cannabis');
  await page.goBack();
  assert.equal(await page.locator('#compound-name').innerText(), 'Cannflavin A');
  assert.equal(await page.locator('#compound-oils-chart').isVisible(), false);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(`PASS: specific research labels; ${counts.composition} composition, ${counts.flavonoids} flavonoid and ${counts.aroma} aroma studies; mobile/embed layouts, search, filters, drill-downs and legacy links`);
})().catch(error => { console.error(error); process.exit(1); });
