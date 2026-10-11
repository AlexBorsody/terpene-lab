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
    addEventListener() {}, querySelectorAll() { return []; }, scrollIntoView() {}
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
for (const file of ['data.js', 'chemistry.js', 'app.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
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
const counts = run(`({
  composition: domainStudyCount('botanical:composition'),
  flavonoids: domainStudyCount('botanical:nonvolatile-chemistry'),
  aroma: domainStudyCount('sensory')
})`);
assert.equal(run('D.categories.find(c => c.type === "botanical").label'), 'Botanical chemistry');
assert.ok(run('D.studies.every(s => s.categories.every(c => domainByType[researchDomainId(c)]))'));
assert.equal(counts.flavonoids, 1);
assert.equal(run('domainStudyCount("botanical")'), counts.composition + counts.flavonoids);
assert.ok(element('oil-grid').innerHTML.includes('2 studies</strong> on Pest / Repellent, Composition analysis'));
assert.ok(!element('oil-grid').innerHTML.includes('Botanical chemistry'));
assert.equal(run('domainsForOil("cannabis").map(id => domainByType[id].label).join(", ")'), 'Health, Aroma research, Flavonoid research');
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
  ['botanical', 'Composition and flavonoid research', counts.composition + counts.flavonoids]
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
assert.equal(element('oil-count').textContent, '1 oils');
assert.ok(element('oil-grid').innerHTML.includes('data-oil="cannabis"'));
assert.equal(run('matrixCell("cannabis", "botanical:composition").length'), 0);
assert.equal(run('matrixCell("cannabis", "botanical:nonvolatile-chemistry").length'), 1);
assert.equal(run('matrixCell("clary-sage", "botanical:composition").length'), 1);
run('showDomain("botanical", "nonvolatile-chemistry")');
assert.equal((element('domain-studies').innerHTML.match(/class="study"/g) || []).length, 1);
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
assert.equal(run('JSON.stringify(D)'), snapshot, 'Rendering and sorting must not mutate source data');
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
console.log(`PASS: renderer/filter regression for ${counts.composition} composition, ${counts.flavonoids} flavonoid and ${counts.aroma} aroma studies; alphabetic selectors and unchanged taxonomy`);
console.log('PASS: filled Read paper action, 44px minimum target, keyboard focus and AAA text contrast');
console.log('PASS: visible oil/material links, hidden empty charts, plant-only/empty evidence and repeat navigation');
