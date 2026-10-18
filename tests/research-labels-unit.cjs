// Exercise the production renderers with a minimal DOM adapter; no browser required.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
const htmlIds = new Set([...fs.readFileSync('index.html', 'utf8').matchAll(/id="([^"]+)"/g)].map(match => match[1]));
// Exercise the retained pathway renderer even though its panel is not mounted.
for (const id of ['pathway-plants', 'pathway-compounds', 'pathway-uses', 'pathway-evidence']) htmlIds.add(id);
function element(id) {
  const classes = new Set();
  if (!elements.has(id)) elements.set(id, {
    value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
    tagName: id.includes('filter') || id.includes('sort') ? 'SELECT' : 'DIV',
    classList: {
      add: name => classes.add(name), remove: name => classes.delete(name),
      contains: name => classes.has(name),
      toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name)
    },
    addEventListener() {}, querySelectorAll() { return []; }, querySelector() { return null; }, scrollIntoView() {}
  });
  return elements.get(id);
}
const window = { addEventListener() {}, location: { href: 'https://example.test/' } };
window.self = window.top = window;
const context = vm.createContext({
  document: {
    getElementById: id => htmlIds.has(id) ? element(id) : null, querySelectorAll: () => [],
    querySelector: selector => selector === '.tab.active' ? null : element(selector),
    addEventListener() {}
  },
  window, location: { search: '' }, history: { pushState() {}, replaceState() {} },
  URL, URLSearchParams, requestAnimationFrame: callback => callback(),
  echarts: { init: () => ({ setOption() {}, on() {}, dispose() {} }) }
});
for (const file of ['data.js', 'chemistry.js', 'research.js', 'app.js']) vm.runInContext(fs.readFileSync(file === 'data.js' ? process.env.TEST_DATA_FILE || file : file, 'utf8'), context, { filename: file });
const run = code => vm.runInContext(code, context);
const snapshot = run('JSON.stringify(D)');
const categoryOptions = [...element('compound-category-filter').innerHTML.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)].map(match => ({ id: match[1], label: match[2] }));
assert.deepEqual(categoryOptions[0], { id: '', label: 'All compounds' });
assert.equal(new Set(categoryOptions.map(option => option.label)).size, categoryOptions.length);
assert.ok(!htmlIds.has('compound-class-filter') && !htmlIds.has('compound-group-filter'));
for (const option of categoryOptions) {
  element('compound-category-filter').value = option.id;
  run('renderCompounds()');
  const expected = run(`D.compounds.filter(compound => CHEMISTRY.matchesCategory(compound, ${JSON.stringify(option.id)})).length`);
  assert.ok(expected > 0, option.label);
  assert.equal(element('compound-count').textContent, `${expected} compounds`, option.label);
}
element('compound-category-filter').value = 'group:aldehyde';
element('compound-search').value = 'neral';
run('renderCompounds()');
assert.equal(element('compound-count').textContent, '1 compounds');
assert.ok(element('compound-grid').innerHTML.includes('data-c="citral"'));
element('compound-category-filter').value = 'group:ester';
run('renderCompounds()');
assert.equal(element('compound-count').textContent, '0 compounds');
element('compound-search').value = '';
element('compound-category-filter').value = '';
run('renderCompounds()');
assert.equal(element('compound-count').textContent, `${run('D.compounds.length')} compounds`);
// Derive expected counts independently from the shared taxonomy and assertion data.
// Audits may add overlapping tags; category totals are never an additive shortcut.
const data = JSON.parse(snapshot);
const descendants = id => {
  const found = new Set([id]);
  let size;
  do { size = found.size; data.taxonomy.nodes.forEach(node => { if (found.has(node.parentId)) found.add(node.id); }); } while (size !== found.size);
  return found;
};
const expectedStudyIds = id => { const nodes = descendants(id); return [...new Set(data.studies.filter(study => study.useNodeIds.some(nodeId => nodes.has(nodeId))).map(study => study.id))]; };
const expectedOilStudyIds = (oilId, id) => { const nodes = descendants(id); return [...new Set(data.evidenceAssertions.filter(a => a.kind === 'study-use' && a.oilId === oilId && nodes.has(a.useNodeId)).map(a => a.studyId))]; };
const counts = {
  composition: expectedStudyIds('botanical-composition').length,
  flavonoids: expectedStudyIds('botanical-nonvolatile-chemistry').length,
  aroma: expectedStudyIds('sensory').length,
  botanical: expectedStudyIds('botanical').length
};
assert.equal(run('D.categories.find(c => c.type === "botanical").label'), 'Botanical chemistry');
assert.ok(run('D.studies.every(s => s.categories.every(c => domainByType[researchDomainId(c)]))'));
assert.ok(counts.flavonoids > 0);
assert.equal(run('domainStudyCount("botanical")'), counts.botanical);
assert.ok(run('R.resolve("botanical-bioactivity")'), 'Audited bioactivity branch is included without a renderer edit');
assert.ok(element('oil-grid').innerHTML.includes('Composition analysis'));
assert.ok(run('R.nodes.length > 0'), 'Generated taxonomy is loaded before app.js');
assert.ok(!element('oil-grid').innerHTML.includes('Botanical chemistry'));
assert.ok(run('domainsForOil("cannabis").map(R.label).includes("Flavonoid research")'));
assert.ok(run('domainsForOil("cannabis").map(R.label).includes("Aroma research")'));
const options = [...element('study-oil-filter').innerHTML.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)].map(match => ({ id: match[1], label: match[2] }));
assert.deepEqual(options[0], { id: '', label: 'All oils' });
assert.equal(options.length, run('D.oils.length') + 1);
const names = options.slice(1).map(option => option.label);
assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
const cannabis = options.findIndex(option => option.id === 'cannabis');
assert.equal(options[cannabis - 1].label, 'Bergamot');
assert.equal(options[cannabis + 1].label, 'Cinnamon Bark');
run('renderPathway("cannabis")');
const pathwayIds = [...element('pathway-plants').innerHTML.matchAll(/data-path-oil="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(pathwayIds, options.slice(1).map(option => option.id));
for (const [id, label, count] of [
  ['botanical:composition', 'Composition analysis', counts.composition],
  ['botanical:nonvolatile-chemistry', 'Flavonoid research', counts.flavonoids],
  ['sensory', 'Aroma research', counts.aroma],
  ['botanical', run('R.label("botanical")'), counts.botanical]
]) {
  for (const filter of ['study-domain-filter', 'oil-domain-filter', 'matrix-domain-filter']) assert.ok(element(filter).innerHTML.includes(`value="${id}"`));
  element('study-domain-filter').value = id;
  run('renderStudies()');
  assert.equal(element('study-count').textContent, `${count} studies`);
  if (id !== 'botanical') {
    element('study-domain-filter').value = '';
    element('study-search').value = label;
    run('renderStudies()');
    assert.equal(element('study-count').textContent, `${count} studies`);
    element('study-search').value = '';
  }
  run(`showDomain(${JSON.stringify(id)}, null)`);
  assert.equal((element('domain-studies').innerHTML.match(/class="study"/g) || []).length, count);
}
element('oil-domain-filter').value = 'botanical:nonvolatile-chemistry';
run('renderOils("")');
assert.equal(element('oil-count').textContent, `${data.oils.filter(oil => expectedOilStudyIds(oil.id, 'botanical-nonvolatile-chemistry').length).length} oils`);
assert.ok(element('oil-grid').innerHTML.includes('data-oil="cannabis"'));
assert.equal(run('matrixCell("cannabis", "botanical:composition").length'), expectedOilStudyIds('cannabis', 'botanical-composition').length);
assert.equal(run('matrixCell("cannabis", "botanical:nonvolatile-chemistry").length'), expectedOilStudyIds('cannabis', 'botanical-nonvolatile-chemistry').length);
assert.equal(run('matrixCell("clary-sage", "botanical:composition").length'), expectedOilStudyIds('clary-sage', 'botanical-composition').length);
run('showDomain("botanical", "nonvolatile-chemistry")');
assert.equal((element('domain-studies').innerHTML.match(/class="study"/g) || []).length, counts.flavonoids);
for (const [compound, heading, linkCount, hasChart] of [
  ['limonene', 'Found in these oils', 9, false],
  ['nobiletin', 'Found in these oils', 3, false],
  ['cannflavin-a', 'Reported in other materials', 1, false],
  ['prenylthiol', 'Reported in other materials', 2, false],
  ['pmd', 'Oil evidence', 0, false],
  ['linalyl-acetate', 'Found in these oils', 5, true]
]) {
  run(`showCompound(${JSON.stringify(compound)})`);
  assert.equal(element('compound-occurrence-heading').textContent, heading, compound);
  assert.equal((element('compound-oil-links').innerHTML.match(/data-goto-oil=/g) || []).length, linkCount, compound);
  assert.equal(element('compound-oils-chart').classList.contains('hidden'), !hasChart, compound);
  assert.equal(element('compound-chart-note').classList.contains('hidden'), !hasChart, compound);
  if (heading === 'Reported in other materials') {
    assert.ok(element('compound-oil-links').innerHTML.includes('Cannabis'));
    assert.ok(element('compound-occurrence-note').textContent.includes("Essential-oil presence isn't established"));
  }
}
run('showCompound("pmd")');
assert.equal(element('compound-occurrence-note').textContent, 'No oil relationships are recorded here yet.');
assert.equal(element('compound-oils-chart').classList.contains('hidden'), true, 'Hide a previous compound chart on repeat navigation');
const previousOilName = element('oil-name').textContent;
const previousCompoundName = element('compound-name').textContent;
for (const id of ['constructor', '__proto__']) {
  run(`showOil(${JSON.stringify(id)}); showCompound(${JSON.stringify(id)})`);
  assert.equal(element('oil-name').textContent, previousOilName, 'Unknown prototype-shaped oil ID does not enter detail rendering');
  assert.equal(element('compound-name').textContent, previousCompoundName, 'Unknown prototype-shaped compound ID does not enter detail rendering');
  assert.equal(run(`oilById[${JSON.stringify(id)}]`), undefined);
  assert.equal(run(`compoundById[${JSON.stringify(id)}]`), undefined);
}
assert.equal(run('JSON.stringify(D)'), snapshot, 'Rendering and sorting must not mutate source data');
run('showOil("cannabis")');
assert.ok(element('oil-studies').innerHTML.includes('Oil-specific source assessment'));
assert.ok(element('oil-studies').innerHTML.includes('Library-linked evidence; applicability not independently verified'));
assert.ok(fs.readFileSync('index.html', 'utf8').includes('Legacy uses · unverified'));
assert.ok(fs.readFileSync('index.html', 'utf8').includes('Legacy safety notes · unverified'));
// High-risk applicability and oil-specific results must be visible before disclosure.
function visibleContext(studyId, oilId, nodeId) {
  const card = run(`studyCard(D.studies.find(study => study.id === ${JSON.stringify(studyId)}), ${JSON.stringify(oilId)}, ${JSON.stringify(nodeId)})`);
  const visible = card.match(/<div class="research-scope">([\s\S]*?)<\/div>/)?.[1];
  assert.ok(visible, `${oilId}: visible source applicability`);
  assert.ok(card.indexOf('<div class="research-scope">') < card.indexOf('<details'), 'Applicability must not require expanding details');
  assert.equal((card.match(/class="finding"/g) || []).length, 1, 'The paper finding remains a single block');
  return visible;
}
const juergens = data.evidenceAssertions.find(a => a.oilId === 'eucalyptus' && a.studyId === 'juergens-2003-cineole');
assert.equal(juergens.material.kind, 'isolated-compound');
assert.equal(juergens.route, null, 'Library-only routes stay unverified; the reported oral preparation remains visible in material');
const cineoleContext = visibleContext('juergens-2003-cineole', 'eucalyptus', 'health-respiratory');
assert.ok(cineoleContext.includes('Medicinal oral 1,8-cineole preparations'));
assert.ok(cineoleContext.includes('Library-linked evidence; applicability not independently verified'));
assert.ok(!cineoleContext.includes('Source-reviewed direct research'));
const myrrhContext = visibleContext('nialeila-2020-myrrh-frankincense-wound', 'myrrh', 'health-wound');
const frankincenseContext = visibleContext('nialeila-2020-myrrh-frankincense-wound', 'frankincense', 'health-wound');
assert.ok(myrrhContext.includes('Myrrh-extract sitz baths improved REEDA healing scores'));
assert.ok(!myrrhContext.includes('Frankincense-extract sitz baths did not'));
assert.ok(frankincenseContext.includes('Frankincense-extract sitz baths did not significantly differ from betadine'));
assert.ok(frankincenseContext.includes('Boswellia carteri extract sitz bath'));
assert.ok(!frankincenseContext.includes('Myrrh-extract sitz baths improved'));
const contraryContext = visibleContext('moss-2008-peppermint-cognition', 'ylang-ylang', 'health-cognitive-memory');
assert.ok(contraryContext.includes('Source-reviewed direct research'), 'Verified contrary evidence is not mislabeled unverified/contextual');
assert.ok(/impaired|worsened|reduced|negative/i.test(contraryContext), 'The adverse cognitive result is visible without disclosure');
assert.ok(!contraryContext.includes('applicability not independently verified'));
console.log('PASS: visible isolated-compound/oral applicability and distinct Faraji per-oil findings outside collapsed details');
// A distinct filled action must retain the real paper URL and native link behavior.
const papers = run('D.studies.map(studyCard).join("")');
assert.equal((papers.match(/class="ext read-paper"/g) || []).length, run('D.studies.length'));
assert.equal((papers.match(/target="_blank" rel="noopener">Read paper<\/a>/g) || []).length, run('D.studies.length'));
const css = fs.readFileSync('styles.css', 'utf8');
const actionStyle = css.match(/\.study \.tags \.read-paper \{([^}]+)\}/)[1];
assert.ok(/min-height:\s*44px/.test(actionStyle));
assert.ok(/background:\s*#efbd69/.test(actionStyle));
assert.ok(/color:\s*var\(--bg\)/.test(actionStyle));
assert.ok(/max-width:\s*100%/.test(actionStyle));
assert.ok(/\.read-paper:focus-visible\s*\{[^}]*outline:\s*3px solid/.test(css));
function luminance(hex) {
  const rgb = hex.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return rgb.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}
for (const background of ['#efbd69', '#f7cd86', '#dfac55']) {
  const contrast = (luminance(background) + 0.05) / (luminance('#0b1220') + 0.05);
  assert.ok(contrast >= 7, `Read paper contrast ${contrast.toFixed(2)}:1`);
}
console.log(`PASS: shared-taxonomy renderer/filter regression; legacy aliases, alphabetic selectors and immutable source data`);
console.log('PASS: filled Read paper action, 44px minimum target, keyboard focus and AAA text contrast');
console.log('PASS: visible oil/material links, hidden empty charts, plant-only/empty evidence and repeat navigation');

// A changed app shell must not load stale JavaScript after deployment.
const html = fs.readFileSync('index.html', 'utf8');
const worker = fs.readFileSync('sw.js', 'utf8');
const assets = JSON.parse(worker.match(/const ASSETS = (\{[\s\S]*?\});/)[1]);
const { createHash } = require('node:crypto');
for (const asset of (process.env.SKIP_RELEASE_CHECK ? [] : ['index.html', 'styles.css', 'data.js', 'chemistry.js', 'research.js', 'app.js', 'pwa.js'])) {
  assert.equal(assets[asset], createHash('sha256').update(fs.readFileSync(asset)).digest('hex'), `Offline release integrity: ${asset}`);
  if (asset !== 'index.html') assert.ok(html.includes(`${asset}?v=${assets[asset].slice(0,16)}`), `Fresh HTTP asset URL: ${asset}`);
}
if (!process.env.SKIP_RELEASE_CHECK) console.log('PASS: offline release matches current HTML, styles, scripts and research');
