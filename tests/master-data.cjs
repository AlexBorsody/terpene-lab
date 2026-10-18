'use strict';
/* Canonical-data invariants and compatibility contract. No external service needed. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const BASELINE_DIGEST = 'da7bfc1289f92e46576493c7c144c9684537258e7f447f5f31da3241f395837e';
const BASELINE_COUNTS = {oils: 28, compounds: 34, studies: 153, sources: 45,
  oilStudyLinks: 214, compoundStudyLinks: 240, tagAssignments: 205, constituents: 76, chemicalEvidence: 53};
const copy = value => JSON.parse(JSON.stringify(value));
function stableStringify(value) {
  return JSON.stringify(value, function (key, val) {
    return val && typeof val === 'object' && !Array.isArray(val)
      ? Object.fromEntries(Object.keys(val).sort().map(k => [k, val[k]])) : val;
  });
}
const digest = value => crypto.createHash('sha256').update(stableStringify(value)).digest('hex');
function loadGenerated(file) {
  return JSON.parse(vm.runInNewContext(fs.readFileSync(file, 'utf8') + '\nJSON.stringify(TERPENE_DATA)', {}, {timeout: 1000}));
}
function legacyProjection(data) {
  const result = copy(data);
  for (const key of ['taxonomy', 'evidenceAssertions', 'schemaVersion', 'chemicalTaxonomy', 'editorialReferences']) delete result[key];
  for (const oil of result.oils) for (const key of ['useTree', 'evidenceIds', 'precautions']) delete oil[key];
  for (const study of result.studies) delete study.useNodeIds;
  return result;
}
function location(document, segments) {
  assert.ok(Array.isArray(segments) && segments.length >= 1, 'Ledger path must be a nonempty array');
  let parent = document;
  for (const segment of segments.slice(0, -1)) {
    if (Array.isArray(parent)) {
      const index = parent.findIndex(record => record && typeof record === 'object' && record.id === segment);
      assert.notEqual(index, -1, 'Ledger path has unknown ID ' + segment);
      parent = parent[index];
    } else {
      assert.ok(Object.hasOwn(parent, segment), 'Ledger path has unknown field ' + segment);
      parent = parent[segment];
    }
  }
  const final = segments.at(-1);
  const key = Array.isArray(parent) ? parent.findIndex(record => record?.id === final) : final;
  const present = Array.isArray(parent) ? key !== -1 : Object.hasOwn(parent, key);
  return {parent, key, present, value: present ? parent[key] : undefined};
}
function reverseLedger(current, ledger) {
  const restored = copy(current);
  assert.ok(Array.isArray(ledger), 'Correction ledger must be an array');
  const ids = new Set();
  for (const entry of ledger) {
    assert.ok(entry.id && !ids.has(entry.id), 'Correction ledger IDs must be unique'); ids.add(entry.id);
    assert.ok(typeof entry.reason === 'string' && entry.reason.trim(), 'Correction requires a reason');
    if (entry.kind === 'configuration') assert.equal(entry.provenance, 'user-request', 'Configuration change requires explicit user-request provenance');
    else assert.ok(Array.isArray(entry.sourceUrls) && entry.sourceUrls.length && entry.sourceUrls.every(url => /^https?:\/\//.test(url)), 'Research correction requires source URLs');
    assert.ok(Array.isArray(entry.changes), 'Correction requires changes array');
  }
  for (const entry of [...ledger].reverse()) for (const change of [...entry.changes].reverse()) {
    const found = location(restored, change.path);
    const afterPresent = change.afterPresent !== false;
    assert.equal(found.present, afterPresent, 'Correction after-presence mismatch: ' + change.path.join('/'));
    if (afterPresent) assert.equal(digest(found.value), change.afterDigest, 'Correction after-digest mismatch: ' + change.path.join('/'));
    const beforePresent = change.beforePresent !== false;
    if (!beforePresent) {
      if (Array.isArray(found.parent)) found.parent.splice(found.key, 1);
      else delete found.parent[found.key];
    } else if (Array.isArray(found.parent)) {
      if (found.present) found.parent[found.key] = copy(change.before);
      else {
        assert.ok(Number.isInteger(change.beforeIndex), 'Restoring removed record needs beforeIndex');
        found.parent.splice(change.beforeIndex, 0, copy(change.before));
      }
    } else found.parent[found.key] = copy(change.before);
  }
  return restored;
}
function counts(data) {
  return {oils: data.oils.length, compounds: data.compounds.length, studies: data.studies.length, sources: data.sources.length,
    oilStudyLinks: data.studies.reduce((n, record) => n + record.oilIds.length, 0),
    compoundStudyLinks: data.studies.reduce((n, record) => n + record.compoundIds.length, 0),
    tagAssignments: data.studies.reduce((n, record) => n + record.categories.length, 0),
    constituents: data.oils.reduce((n, record) => n + record.constituents.length, 0),
    chemicalEvidence: data.oils.reduce((n, record) => n + record.chemicalEvidence.length, 0)};
}
function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'terpene-master-'));
  let checks = 0;
  try {
    const master = JSON.parse(fs.readFileSync(path.join(ROOT, 'master-data.json'), 'utf8'));
    const generate = (...args) => spawnSync('python3', [path.join(ROOT, 'scripts/build-data.py'), ...args], {encoding: 'utf8'});
    const first = path.join(tmp, 'first.js'), second = path.join(tmp, 'second.js');
    for (const output of [first, second]) {
      const result = generate('--output', output);
      assert.equal(result.status, 0, result.stderr); checks++;
    }
    assert.equal(fs.readFileSync(first, 'utf8'), fs.readFileSync(second, 'utf8'), 'Output is not byte-reproducible'); checks++;
    const generatedIndex = process.argv.indexOf('--generated');
    const target = generatedIndex < 0 ? path.join(ROOT, 'data.js') : path.resolve(process.argv[generatedIndex + 1]);
    if (!process.argv.includes('--skip-drift')) {
      const check = generate('--output', target, '--check'); assert.equal(check.status, 0, check.stderr); checks++;
    }
    const data = loadGenerated(first), legacy = legacyProjection(data);
    const restored = reverseLedger(legacy, master.migration.correctionLedger);
    assert.equal(master.migration.baselineDigest, BASELINE_DIGEST, 'Original migration baseline fingerprint must not be rewritten'); checks++;
    assert.equal(digest(restored), master.migration.baselineDigest, 'Lossless baseline fingerprint mismatch: undocumented legacy data change'); checks++;
    assert.deepEqual(counts(restored), BASELINE_COUNTS); checks++;
    assert.deepEqual(master.migration.baselineCounts, BASELINE_COUNTS); checks++;

    // Exercise the actual migration CLI in a copied temporary project. The
    // script's __dirname-based default can never point at the production master.
    const migrationProject = path.join(tmp, 'migration-project');
    fs.mkdirSync(path.join(migrationProject, 'scripts'), {recursive: true});
    const migrationScript = path.join(migrationProject, 'scripts', 'migrate-master-data.cjs');
    fs.copyFileSync(path.join(ROOT, 'scripts', 'migrate-master-data.cjs'), migrationScript);
    fs.writeFileSync(path.join(migrationProject, 'baseline.json'), JSON.stringify(restored));
    const productionMasterBefore = fs.readFileSync(path.join(ROOT, 'master-data.json'), 'utf8');
    const defaultMaster = path.join(migrationProject, 'master-data.json');
    const explicitMaster = path.join(migrationProject, 'explicit-master.json');
    const migrate = (...args) => spawnSync(process.execPath, [migrationScript, ...args], {cwd: migrationProject, encoding: 'utf8'});
    function migrated(result, output) {
      assert.equal(result.status, 0, result.stderr);
      assert.equal(JSON.parse(fs.readFileSync(output, 'utf8')).migration.baselineDigest, BASELINE_DIGEST);
      assert.ok(!fs.existsSync(path.join(migrationProject, '--force')), '--force must never become an output filename');
      checks++;
    }
    migrated(migrate('baseline.json'), defaultMaster);
    for (const [args, output] of [
      [['baseline.json'], defaultMaster],
      [['baseline.json', 'explicit-master.json'], explicitMaster]
    ]) {
      fs.writeFileSync(output, 'TEST-ONLY existing master sentinel');
      const result = migrate(...args);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Refusing to replace existing master/);
      assert.equal(fs.readFileSync(output, 'utf8'), 'TEST-ONLY existing master sentinel'); checks++;
    }
    migrated(migrate('baseline.json', '--force'), defaultMaster);
    migrated(migrate('--force', 'baseline.json'), defaultMaster);
    migrated(migrate('baseline.json', 'explicit-master.json', '--force'), explicitMaster);
    migrated(migrate('baseline.json', '--force', 'explicit-master.json'), explicitMaster);
    migrated(migrate('--force', 'baseline.json', 'explicit-master.json'), explicitMaster);
    migrated(migrate('baseline.json', 'new-explicit-master.json'), path.join(migrationProject, 'new-explicit-master.json'));
    fs.writeFileSync(path.join(migrationProject, '-baseline.json'), JSON.stringify(restored));
    migrated(migrate('--', '-baseline.json', '-explicit-master.json'), path.join(migrationProject, '-explicit-master.json'));
    for (const args of [[], ['--force'], ['--unknown', 'baseline.json'], ['baseline.json', '--froce'],
      ['baseline.json', 'unused-output.json', 'extra-output.json'], [''], ['baseline.json', '']]) {
      const beforeFiles = fs.readdirSync(migrationProject).sort();
      const beforeDefault = fs.readFileSync(defaultMaster, 'utf8');
      const result = migrate(...args);
      assert.equal(result.status, 2, 'Invalid CLI arguments must fail before migration: ' + JSON.stringify(args));
      assert.match(result.stderr, /Usage:/);
      assert.deepEqual(fs.readdirSync(migrationProject).sort(), beforeFiles, 'Invalid arguments must not create files');
      assert.equal(fs.readFileSync(defaultMaster, 'utf8'), beforeDefault, 'Invalid arguments must not overwrite the default master'); checks++;
    }
    assert.equal(fs.readFileSync(path.join(ROOT, 'master-data.json'), 'utf8'), productionMasterBefore, 'CLI regression tests must never modify production master'); checks++;
    const baselineIndex = process.argv.indexOf('--baseline');
    if (baselineIndex >= 0) {
      const baseline = JSON.parse(fs.readFileSync(process.argv[baselineIndex + 1], 'utf8'));
      assert.deepEqual(restored, baseline, 'Roundtrip differs from the complete baseline snapshot'); checks++;
    }
    assert.equal(data.blendBuilder.catalogVersion, '2026-10-18');
    assert.equal(data.blendBuilder.version, '1');
    assert.deepEqual(data.blendBuilder.product, restored.blendBuilder.product, 'Product configuration changed'); checks++;
    assert.equal(data.taxonomy.aliases['botanical:composition'], 'botanical-composition');
    assert.equal(data.taxonomy.aliases['sensory/aroma-chemistry/sulfur volatiles'], 'sensory-aroma-chemistry-sulfur-volatiles'); checks++;
    assert.ok(data.taxonomy.nodes.some(node => node.id === 'sensory-aroma-chemistry-sensory-perception' && node.declared));
    const legacyPaths = new Set(restored.studies.flatMap(study => study.categories.map(binding => [binding.type, binding.subcategory, binding.topic].filter(value => value !== undefined).join('/'))));
    assert.equal(legacyPaths.size, 53);
    for (const legacyPath of legacyPaths) assert.ok(data.taxonomy.aliases[legacyPath], 'Missing original taxonomy path alias: ' + legacyPath); checks++;
    const fixturePath = path.join(tmp, 'fixture.json');
    function fixture(change, valid, pattern) {
      const fixture = copy(master); change(fixture);
      fs.writeFileSync(fixturePath, JSON.stringify(fixture));
      const result = generate('--master', fixturePath, '--validate-only');
      if (valid) assert.equal(result.status, 0, result.stderr);
      else {
        assert.notEqual(result.status, 0, 'Invalid fixture was accepted');
        if (pattern) assert.match(result.stderr, pattern);
      }
      checks++;
    }
    fixture(m => m.oils.push(copy(m.oils[0])), false, /duplicate/);
    fixture(m => m.registries.compounds.push(copy(m.registries.compounds[0])), false, /duplicate/);
    fixture(m => m.registries.studies.push(copy(m.registries.studies[0])), false, /duplicate/);
    fixture(m => m.registries.sources.push(copy(m.registries.sources[0])), false, /duplicate/);
    fixture(m => m.registries.evidenceAssertions.push(copy(m.registries.evidenceAssertions[0])), false, /duplicate/);
    fixture(m => m.registries.useNodes[0].parentId = 'not-a-node', false, /orphan/);
    fixture(m => m.registries.useNodes[0].parentId = m.registries.useNodes.find(n => n.parentId === m.registries.useNodes[0].id).id, false, /cycle/);
    fixture(m => m.registries.useNodes[0].id = 'Bad ID!', false, /Invalid use node/);
    fixture(m => m.registries.useNodes[1].aliases.push(m.registries.useNodes[0].id), false, /Ambiguous/);
    fixture(m => m.registries.useNodes[0].legacyBindings[0].type = 42, false, /binding values must be nonempty strings/);
    fixture(m => {
      m.registries.useNodes.push({id: 'fixture-alias-a', label: 'Fixture A', parentId: null, aliases: ['fixture-path'], legacyBindings: [], declared: false});
      m.registries.useNodes.push({id: 'fixture-alias-b', label: 'Fixture B', parentId: null, aliases: [], legacyBindings: [{type: 'fixture-path'}], declared: false});
    }, false, /Ambiguous taxonomy alias/);
    fixture(m => {
      m.registries.useNodes.push({id: 'fixture-binding-only', label: 'Fixture binding only', parentId: null, aliases: [], legacyBindings: [{type: 'fixture-path-only'}], declared: false});
    }, true);
    const aliasOutput = path.join(tmp, 'binding-alias.js');
    assert.equal(generate('--master', fixturePath, '--output', aliasOutput).status, 0);
    const aliasData = loadGenerated(aliasOutput);
    assert.equal(aliasData.taxonomy.aliases['fixture-path-only'], 'fixture-binding-only');
    assert.equal(require('../research.js').create(aliasData).resolve('fixture-path-only'), 'fixture-binding-only');
    assert.equal(require('../blend-engine.js').resolveQualityId('fixture-path-only', aliasData), 'fixture-binding-only'); checks++;

    fixture(m => m.oils[0].constituents[0].compoundId = 'missing', false, /unknown reference/);
    fixture(m => m.oils[0].studyLinks[0].studyId = 'missing', false, /unknown reference/);
    fixture(m => m.oils[0].constituents[0].sourceIds = ['unknown-source'], false, /unknown reference/);
    fixture(m => m.registries.compounds[0].functionalGroups = ['unknown-group'], false, /unknown reference/);
    fixture(m => m.blendDefaults.relatedStudyIds = ['unknown-study'], false, /unknown reference/);
    fixture(m => m.oils.find(o => o.legacy.blend).legacy.blend.dermalMaxSource = 'unknown-source', false, /unknown source reference/);
    fixture(m => m.oils.find(o => o.legacy.blend).legacy.blend.interactions = [{withOilId: 'unknown-oil'}], false, /unknown interaction oil/);
    fixture(m => m.registries.studies[0].url = 'http://example.test/insecure', false, /valid HTTPS URL/);
    fixture(m => m.registries.studies[0].url = 'https://', false, /valid HTTPS URL/);
    fixture(m => m.registries.sources.find(s => !s.studyRef).url = 42, false, /valid HTTPS URL/);
    fixture(m => m.registries.studies[0].url = 'https://doi.org/' + m.registries.studies[0].doi, true);
    fixture(m => m.registries.studies[0].url = 'https://doi.org/10.0000/test-only-fixture', false, /citation URL and DOI disagree/);
    fixture(m => m.registries.studies[0].url = 'https://pubmed.ncbi.nlm.nih.gov/8719697/', false, /citation URL and PubMed ID disagree/);
    fixture(m => {
      m.registries.studies[0].pubmedId = '8719697';
      m.registries.studies[0].url = 'https://pubmed.ncbi.nlm.nih.gov/8719697/';
    }, false, /identifiers differ from reviewed source/);
    fixture(m => m.registries.compounds[0].formula = 'C1H1', false, /formula differs from reviewed identity/);
    fixture(m => m.blendBuilder.product.price = '40', false, /positive finite number/);
    fixture(m => m.blendBuilder.product.currency = 'US', false, /currency code/);
    fixture(m => Object.assign(m.blendBuilder.product, {name:'Configured blend',price:45.5,currency:'CAD',size:'4 oz'}), true);
    fixture(m => {
      const original = m.registries.studies.find(s => s.doi), next = m.registries.studies.find(s => s.id !== original.id);
      next.doi = 'https://doi.org/' + original.doi.toUpperCase();
    }, false, /Duplicate publication doi/);
    fixture(m => {
      const original = m.registries.studies.find(s => s.pubmedId), next = m.registries.studies.find(s => s.id !== original.id);
      next.pubmedId = '00' + original.pubmedId;
    }, false, /Duplicate publication pubmedId/);
    fixture(m => m.registries.studies[1].url = m.registries.studies[0].url, false, /Duplicate publication url/);

    fixture(m => m.oils[0].studyLinks[0].order = 10000, false, /contiguous/);
    fixture(m => m.registries.sources.find(s => s.studyRef).studyRef = 'missing', false, /unknown studyRef/);
    fixture(m => m.registries.sources.find(s => s.studyRef).url = 'https://example.test/duplicate', false, /duplicate canonical citation/);
    const useAssertion = m => m.registries.evidenceAssertions.find(a => a.kind === 'study-use');
    for (const value of [42, 'not-a-url', 'http://example.test/paper', 'https://', 'https://exam ple.test/paper', 'https://.', 'https://example..test/paper', 'https://-bad.test/paper']) {
      fixture(m => useAssertion(m).verification.urls = [value], false, /valid HTTPS URL/);
    }

    const findBranch = (branches, id) => { for (const branch of branches) { if (branch.useNodeId === id) return branch; const child = findBranch(branch.children, id); if (child) return child; } };
    fixture(m => useAssertion(m).studyId = 'missing', false, /unknown studyId/);
    fixture(m => useAssertion(m).useNodeId = 'missing', false, /unknown useNodeId/);
    fixture(m => useAssertion(m).researchMatch = undefined, false, /explicit boolean/);
    fixture(m => { const a = useAssertion(m); a.researchMatch = true; a.verification.status = 'unreviewed'; }, false, /source verification/);
    const activeAssertion = m => m.registries.evidenceAssertions.find(a => a.kind === 'study-use' && a.researchMatch);
    for (const relevance of ['whole-oil', 'whole-oil-direct']) {
      fixture(m => { activeAssertion(m).material.relevance = relevance; }, true);
    }
    const incompatibleMaterials = new Set([
      'related-preparation', 'different-extraction', 'different-plant-part', 'unknown', '', null, undefined,
      ...master.registries.evidenceAssertions.filter(a => a.kind === 'study-use').map(a => a.material?.relevance)
        .filter(value => !['whole-oil', 'whole-oil-direct'].includes(value))
    ]);
    for (const relevance of incompatibleMaterials) {
      fixture(m => { activeAssertion(m).material.relevance = relevance; }, false, /researchMatch needs compatible material relevance/);
      fixture(m => {
        const a = activeAssertion(m); a.material.relevance = relevance; a.relevance = 'contextual'; a.researchMatch = false;
      }, true); // Uncertain or different preparations remain discoverable as contextual research.
    }
    const mismatchedStudyAssertions = master.registries.evidenceAssertions.filter(a => a.kind === 'study-use' && (
      (a.oilId === 'lemon' && a.studyId === 'kiecolt-glaser-2008-olfactory') ||
      (a.oilId === 'cinnamon' && a.studyId === 'guynot-2003')
    ));
    assert.equal(mismatchedStudyAssertions.length, 6, 'Cover all five lemon endpoints and the cinnamon plant-part mismatch'); checks++;
    for (const original of mismatchedStudyAssertions) {
      assert.equal(original.researchMatch, false);
      assert.equal(original.relevance, 'contextual');
      assert.ok(['different-extraction', 'different-plant-part'].includes(original.material.relevance)); checks++;
      fixture(m => {
        const a = m.registries.evidenceAssertions.find(a => a.id === original.id);
        a.relevance = 'direct'; a.researchMatch = true;
      }, false, /researchMatch needs compatible material relevance/);
    }
    for (const studyId of ['tea-tree-acne-2007', 'tea-tree-dandruff-2002']) {
      const original = master.registries.evidenceAssertions.find(a => a.studyId === studyId && a.researchMatch);
      assert.ok(original, 'Keep reviewed single-oil topical formulations eligible');
      assert.equal(original.material.kind, 'single-oil-topical-formulation'); checks++;
      fixture(m => {
        const a = m.registries.evidenceAssertions.find(a => a.id === original.id);
        a.material.relevance = 'whole-oil-direct';
      }, true);
    }
    fixture(m => m.registries.evidenceAssertions.find(a => a.kind === 'chemical-observation').researchMatch = true, false, /cannot be efficacy matches/);
    fixture(m => { const a = useAssertion(m); const oil = m.oils.find(o => o.id === a.oilId); findBranch(oil.uses, a.useNodeId).evidenceIds = []; }, false, /use tree and evidence registry differ/);
    fixture(m => { const oil = m.oils.find(o => o.uses.length); oil.uses.push(copy(oil.uses[0])); }, false, /duplicate/);
    fixture(m => { const oil = m.oils.find(o => o.uses.some(b => b.children.length)); const branch = oil.uses.find(b => b.children.length); oil.uses.push(branch.children.shift()); }, false, /ancestry/);
    fixture(m => {
      const original = useAssertion(m), next = copy(original); next.id = 'test-second-arm'; next.finding = 'TEST-ONLY distinct arm finding';
      m.registries.evidenceAssertions.push(next);
      findBranch(m.oils.find(o => o.id === next.oilId).uses, next.useNodeId).evidenceIds.push(next.id);
    }, true); // Same oil + study + endpoint may have multiple arms.
    fixture(m => {
      const original = useAssertion(m), next = copy(original); next.id = 'test-parent-node-assertion';
      next.useNodeId = m.registries.useNodes.find(node => node.id === original.useNodeId).parentId;
      assert.ok(next.useNodeId);
      const study = m.registries.studies.find(s => s.id === next.studyId);
      if (!study.useNodeIds.includes(next.useNodeId)) study.useNodeIds.push(next.useNodeId);
      m.registries.evidenceAssertions.push(next);
      findBranch(m.oils.find(o => o.id === next.oilId).uses, next.useNodeId).evidenceIds.push(next.id);
    }, true); // Parent-level attachments are real endpoints.
    fixture(m => {
      const original = useAssertion(m), next = copy(original); next.id = 'test-four-level-assertion';
      const names = ['test-root', 'test-level-two', 'test-level-three', 'test-level-four'];
      names.forEach((id, i) => m.registries.useNodes.push({id, label: id, parentId: i ? names[i - 1] : null, aliases: [id + '-alias'], legacyBindings: [], declared: false}));
      next.useNodeId = names[3]; m.registries.evidenceAssertions.push(next);
      m.registries.studies.find(s => s.id === next.studyId).useNodeIds.push(next.useNodeId);
      const oil = m.oils.find(o => o.id === next.oilId); let branches = oil.uses;
      names.forEach((id, i) => { const branch = {useNodeId: id, evidenceIds: i === 3 ? [next.id] : [], children: []}; branches.push(branch); branches = branch.children; });
    }, true); // No hard-coded depth or fixed root enum.
    fixture(m => { m.registries.useNodes[0].label = 'Changed display label'; }, true); // IDs survive label changes.
    fixture(m => {
      const a = useAssertion(m); const oil = m.oils.find(o => o.id === a.oilId);
      for (const old of m.registries.evidenceAssertions.filter(e => e.kind === 'study-use' && e.oilId === oil.id && e.studyId === a.studyId)) {
        const branch = findBranch(oil.uses, old.useNodeId); branch.evidenceIds = branch.evidenceIds.filter(id => id !== old.id);
      }
      m.registries.evidenceAssertions = m.registries.evidenceAssertions.filter(e => !(e.kind === 'study-use' && e.oilId === oil.id && e.studyId === a.studyId));
    }, true); // Bibliographic/contextual oil links need not assert functional effects.
    fixture(m => {
      m.blendDefaults = {enabled: true, availability: 'unconfirmed', qualityMappings: [], dermalMaxPercent: null, dermalMaxSource: null, phototoxic: null, petSafer: null, petSource: null, safetyReviewStatus: 'unverified', legacySafetyNotesVerified: false};
    }, true);
    const defaultsOutput = path.join(tmp, 'defaults.js');
    const defaultsResult = generate('--master', fixturePath, '--output', defaultsOutput); assert.equal(defaultsResult.status, 0, defaultsResult.stderr);
    const defaultsData = loadGenerated(defaultsOutput);
    assert.ok(defaultsData.oils.every(oil => oil.blend.enabled && oil.blend.availability === 'unconfirmed' && oil.blend.safetyReviewStatus === 'unverified'));
    assert.ok(defaultsData.oils.every(oil => oil.blend.legacySafetyNotes === oil.safety)); checks++;
    fixture(m => { m.blendDefaults = {availability: 'available'}; }, false, /inventory must remain unconfirmed/);
    fixture(m => m.registries.chemicalTaxonomy.push(copy(m.registries.chemicalTaxonomy[0])), false, /duplicate/);
    fixture(m => m.registries.chemicalTaxonomy[0].parentId = 'missing', false, /orphan chemical/);
    fixture(m => m.registries.chemicalTaxonomy[0].parentId = m.registries.chemicalTaxonomy[0].id, false, /Chemical taxonomy cycle/);
    fixture(m => m.registries.chemicalTaxonomy[0].match.unknownRule = [], false, /unknown chemical match/);
    fixture(m => m.registries.chemicalTaxonomy[0].match.chemicalClasses = 'wrong', false, /string array/);
    fixture(m => m.registries.chemicalTaxonomy.find(n => n.groupId).groupId = 'unknown', false, /unknown chemical groupId/);
    fixture(m => m.registries.editorialReferences.chemistryExplainerSourceIds.push('unknown'), false, /unknown reference/);
    fixture(m => {
      const compound = copy(m.registries.compounds[0]); compound.id = 'test-new-chemical'; compound.name = 'TEST-ONLY new chemical'; compound.chemicalClass = 'TEST-ONLY Ketone'; compound.studyLinks = [];
      m.registries.compounds.push(compound);
      m.registries.chemicalTaxonomy.push({id: 'class:TEST-ONLY Ketone', label: 'TEST-ONLY ketones', parentId: null, selectable: true, match: {chemicalClasses: ['TEST-ONLY Ketone']}});
    }, true);
    const chemicalOutput = path.join(tmp, 'chemical.js');
    assert.equal(generate('--master', fixturePath, '--output', chemicalOutput).status, 0);
    const chemicalData = loadGenerated(chemicalOutput);
    assert.equal(chemicalData.compounds.find(c => c.id === 'test-new-chemical').chemicalClass, 'TEST-ONLY Ketone');
    assert.deepEqual(chemicalData.chemicalTaxonomy.nodes.find(n => n.id === 'class:TEST-ONLY Ketone').match.chemicalClasses, ['TEST-ONLY Ketone']); checks++;
    assert.deepEqual(data.editorialReferences.chemistryExplainerSourceIds, ['oswald-2021', 'oswald-2023', 'paryani-2024', 'bautista-2021']); checks++;
    const corrected = copy(restored), sampleId = corrected.studies[0].id, before = corrected.studies[0].finding;
    corrected.studies[0].finding = 'TEST-ONLY corrected finding';
    const ledger = [{id: 'test-correction', reason: 'TEST-ONLY fixture', sourceUrls: ['https://example.test/source'], changes: [
      {path: ['studies', sampleId, 'finding'], beforePresent: true, before, afterPresent: true, afterDigest: digest(corrected.studies[0].finding)}
    ]}];
    assert.deepEqual(reverseLedger(corrected, ledger), restored); checks++;
    ledger[0].changes[0].afterDigest = 'wrong'; assert.throws(() => reverseLedger(corrected, ledger), /after-digest/); checks++;
    fs.appendFileSync(first, '// manual drift\n');
    assert.notEqual(generate('--output', first, '--check').status, 0); checks++;
    console.log(`master-data: ${checks} checks passed; baseline ${BASELINE_COUNTS.oils} oils / ${BASELINE_COUNTS.studies} studies preserved; ${data.taxonomy.nodes.length} taxonomy nodes / ${data.evidenceAssertions.length} assertions.`);
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
}
module.exports = {stableStringify, digest, loadGenerated, legacyProjection, reverseLedger, counts};
if (require.main === module) main();
