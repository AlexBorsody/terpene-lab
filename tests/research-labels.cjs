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
  assert.equal(oilOptions[cannabisIndex + 1].label, 'Cedarwood (Atlas)');
  const counts = await page.evaluate(() => {
    const descendants = id => {
      const nodes = new Set([id]); let size;
      do { size = nodes.size; D.taxonomy.nodes.forEach(node => { if (nodes.has(node.parentId)) nodes.add(node.id); }); } while (size !== nodes.size);
      return nodes;
    };
    const countStudies = id => { const nodes = descendants(id); return new Set(D.studies.filter(study => study.useNodeIds.some(nodeId => nodes.has(nodeId))).map(study => study.id)).size; };
    const countOilStudies = (oilId, id) => { const nodes = descendants(id); return new Set(D.evidenceAssertions.filter(a => a.kind === 'study-use' && a.oilId === oilId && nodes.has(a.useNodeId)).map(a => a.studyId)).size; };
    return {
      composition: countStudies('botanical-composition'), flavonoids: countStudies('botanical-nonvolatile-chemistry'),
      aroma: countStudies('sensory'), botanical: countStudies('botanical'),
      claryComposition: countOilStudies('clary-sage', 'botanical-composition'),
      cannabisFlavonoids: countOilStudies('cannabis', 'botanical-nonvolatile-chemistry'),
      flavonoidOils: D.oils.filter(oil => countOilStudies(oil.id, 'botanical-nonvolatile-chemistry')).length,
      originalLabel: D.categories.find(c => c.type === 'botanical').label,
      allTopicsMapped: D.studies.every(s => s.categories.every(c => domainByType[researchDomainId(c)]))
    };
  });
  assert.equal(counts.originalLabel, 'Botanical chemistry', 'Legacy category labels are retained in compatibility data');
  assert.equal(counts.allTopicsMapped, true);
  assert.ok(counts.flavonoids > 0);
  for (const width of [320, 390, 412, 768, 1440]) {
    await page.setViewportSize({ width, height: 915 });
    for (const embed of [false, true]) {
      await page.goto(`${base}/?tab=oils${embed ? '&embed=1' : ''}`);
      assert.ok((await page.locator('[data-oil="clary-sage"] .sub').innerText()).includes('Composition analysis'));
      const cannabis = await page.locator('[data-oil="cannabis"] .sub').innerText();
      assert.ok(cannabis.includes('Scent chemistry'));
      assert.ok(cannabis.includes('Flavonoid research'));
      assert.ok(cannabis.includes('Composition analysis'), 'Audited chemical-profile papers appear alongside flavonoid research');
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
    const luminance = color => color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const light=luminance(appearance.background), dark=luminance(appearance.color);
    assert.ok((Math.max(light,dark)+.05)/(Math.min(light,dark)+.05)>=7,'Read-paper text retains AAA contrast');
    assert.equal(appearance.outline, 'solid');
    assert.ok(appearance.href.startsWith('https://'));
    assert.equal(appearance.target, '_blank');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `Study overflow at ${width}`);
  }
  for (const [id, label, count] of [
    ['botanical-composition', 'Composition analysis', counts.composition],
    ['botanical-nonvolatile-chemistry', 'Flavonoid research', counts.flavonoids],
    ['sensory', 'Scent chemistry', counts.aroma]
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
  assert.equal(await page.locator('#study-list .study').count(), counts.botanical);
  await page.goto(`${base}/?tab=oils&oil=clary-sage`);
  await page.locator('#oil-domains [data-domain-filter="botanical-composition"]').click();
  assert.equal(await page.locator('#study-list .study').count(), counts.claryComposition);
  assert.ok((await page.locator('#study-list').innerText()).includes('Salvia sclarea Essential Oil Chemical Composition'));
  await page.getByRole('button', { name: 'Oils', exact: true }).click();
  assert.equal(await page.locator('#oil-grid').isVisible(), true);
  await page.locator('#oil-domain-filter').selectOption('botanical-nonvolatile-chemistry');
  assert.equal(await page.locator('#oil-grid .card').count(), counts.flavonoidOils);
  assert.ok((await page.locator('#oil-grid').innerText()).includes('Cannabis'));
  await page.goto(`${base}/?tab=matrix`);
  await page.locator('#matrix-group-filter').selectOption('composition');
  await page.locator('#matrix-domain-filter').selectOption('botanical');
  await page.locator('#matrix-domain-filter-navigation .topic-child-select').selectOption('botanical-nonvolatile-chemistry');
  assert.ok((await page.locator('#matrix-table thead').textContent()).includes('Flavonoid research'));
  const cell = page.locator('#matrix-table [data-oil="cannabis"][data-domain="botanical-nonvolatile-chemistry"]');
  assert.equal((await cell.innerText()).trim(), String(counts.cannabisFlavonoids));
  await cell.click();
  assert.equal(await page.locator('#tab-matrix').isVisible(), true);
  assert.equal(await page.locator('#matrix-inspector .study').count(), counts.cannabisFlavonoids);
  assert.ok((await page.locator('#matrix-inspector').innerText()).includes('Flavonoids in Cannabis sativa'));
  await page.goto(`${base}/?tab=domains`);
  await page.locator('[data-domain="botanical-composition"]').click();
  assert.equal(await page.locator('#domain-name').innerText(), 'Composition analysis');
  assert.equal(await page.locator('#domain-studies .study').count(), counts.composition);
  assert.equal(await page.locator('#domain-subs button').count(), await page.evaluate(() => R.children('botanical:composition').length), 'Show only immediate descendants');
  await page.goto(`${base}/?tab=domains&domain=botanical&sub=nonvolatile-chemistry`);
  assert.equal(await page.locator('#domain-studies .study').count(), counts.flavonoids, 'Old taxonomy links still work across the audited multitag catalog');
  assert.ok((await page.locator('#domain-name').innerText()).includes('Flavonoid research'));
  for (const [compound, heading, count] of [
    ['limonene', 'Found in these oils', 9],
    ['nobiletin', 'Found in these oils', 3],
    ['cannflavin-a', 'Reported in other materials', 1],
    ['pmd', 'Oil evidence', 0]
  ]) {
    await page.goto(`${base}/?tab=compounds&compound=${compound}`);
    assert.equal(await page.locator('#compound-occurrence-heading').textContent(), heading);
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
  // Applicability caveats are visible before opening assessment details.
  await page.goto(`${base}/?tab=studies&oil=eucalyptus&domain=health-respiratory`);
  const cineole = page.locator('#study-list [data-study-id="juergens-2003-cineole"]');
  assert.equal(await cineole.locator('.research-scope').isVisible(), true);
  assert.equal(await cineole.locator('.research-scope').evaluate(node => !!node.closest('details')), false);
  assert.equal(await cineole.locator('.research-assessments').getAttribute('open'), null);
  const cineoleText = await cineole.locator('.research-scope').innerText();
  assert.ok(cineoleText.includes('Medicinal oral 1,8-cineole preparations'));
  assert.ok(cineoleText.includes('Library-linked evidence; applicability not independently verified'));
  assert.ok(!cineoleText.includes('Source-reviewed direct research'));
  for (const [oil, finding, wrongFinding, material] of [
    ['myrrh', 'Myrrh-extract sitz baths improved REEDA healing scores', 'Frankincense-extract sitz baths did not', 'Commiphora myrrha extract sitz bath'],
    ['frankincense', 'Frankincense-extract sitz baths did not significantly differ from betadine', 'Myrrh-extract sitz baths improved', 'Boswellia carteri extract sitz bath']
  ]) {
    await page.goto(`${base}/?tab=studies&oil=${oil}&domain=health-wound`);
    const paper = page.locator('#study-list [data-study-id="nialeila-2020-myrrh-frankincense-wound"]');
    const scope = paper.locator('.research-scope');
    assert.equal(await scope.isVisible(), true);
    assert.equal(await scope.evaluate(node => !!node.closest('details')), false);
    assert.equal(await paper.locator('.research-assessments').getAttribute('open'), null);
    const text = await scope.innerText();
    assert.ok(text.includes(finding)); assert.ok(text.includes(material)); assert.ok(!text.includes(wrongFinding));
    assert.equal(await paper.locator('.finding').count(), 1);
  }
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(`PASS: specific research labels; ${counts.composition} composition, ${counts.flavonoids} flavonoid and ${counts.aroma} aroma studies; mobile/embed layouts, search, filters, drill-downs and legacy links`);
})().catch(error => { console.error(error); process.exit(1); });
