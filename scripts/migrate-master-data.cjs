#!/usr/bin/env node
/* One-time, conservative migration. Production builds read only master-data.json. */
'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const input = process.argv[2];
const output = process.argv[3] || path.join(__dirname, '..', 'master-data.json');
if (!input) throw new Error('Usage: node scripts/migrate-master-data.cjs baseline.snapshot.json [master-data.json]');
if (fs.existsSync(output) && !process.argv.includes('--force')) throw new Error('Refusing to replace existing master; use --force only for an intentional fresh migration.');
const baseline = JSON.parse(fs.readFileSync(input, 'utf8'));
const copy = value => JSON.parse(JSON.stringify(value));
const stable = value => JSON.stringify(value, function (key, val) {
  return val && typeof val === 'object' && !Array.isArray(val)
    ? Object.fromEntries(Object.keys(val).sort().map(k => [k, val[k]])) : val;
});
const hash = value => crypto.createHash('sha256').update(stable(value)).digest('hex');
const nodes = [], paths = new Map(), ids = new Set();
function binding(parts) { return Object.fromEntries(['type', 'subcategory', 'topic'].slice(0, parts.length).map((key, i) => [key, parts[i]])); }
function ensureNode(parts, label, declared = false) {
  const key = JSON.stringify(parts);
  if (paths.has(key)) {
    const node = paths.get(key);
    if (declared) node.declared = true;
    if (label !== undefined) node.label = label;
    return node;
  }
  const parent = parts.length > 1 ? ensureNode(parts.slice(0, -1)) : null;
  let id = parts.join('-').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (id.length > 64 || ids.has(id)) id = id.slice(0, 47).replace(/-$/g, '') + '-' + hash(parts).slice(0, 16);
  if (ids.has(id)) throw new Error('Unexpected taxonomy ID collision: ' + id);
  const node = {id, label: label === undefined ? parts.at(-1) : label, parentId: parent?.id || null,
    aliases: [...new Set([id, parts.join(':'), parts.join('/')])], legacyBindings: [binding(parts)], declared};
  if (id === 'sensory') node.displayLabel = 'Aroma research';
  if (id === 'botanical') { node.displayLabel = 'Composition and flavonoid research'; node.navigationRoot = false; }
  if (id === 'botanical-composition') { node.displayLabel = 'Composition analysis'; node.navigationRoot = true; }
  if (id === 'botanical-nonvolatile-chemistry') { node.displayLabel = 'Flavonoid research'; node.navigationRoot = true; }
  nodes.push(node); paths.set(key, node); ids.add(id); return node;
}
for (const category of baseline.categories) {
  ensureNode([category.type], category.label, true);
  for (const sub of category.subcategories) {
    ensureNode([category.type, sub.id], sub.label, true);
    for (const topic of sub.topics) ensureNode([category.type, sub.id, topic], topic, true);
  }
}
for (const study of baseline.studies) for (const category of study.categories) {
  ensureNode([category.type, category.subcategory, category.topic].filter(value => value !== undefined));
}
const evidence = [];
const oils = baseline.oils.map(oil => {
  const record = copy(oil); for (const key of ['id', 'uses', 'safety', 'constituents', 'chemicalEvidence', 'blend']) delete record[key];
  const result = {id: oil.id, record, constituents: copy(oil.constituents), chemicalEvidenceIds: [], studyLinks: [], uses: [],
    precautions: {legacySafety: oil.safety, reviewStatus: 'unreviewed'}, legacy: {uses: copy(oil.uses)}};
  if ('blend' in oil) result.legacy.blend = copy(oil.blend);
  for (const [index, observation] of oil.chemicalEvidence.entries()) {
    const id = 'chemical-' + oil.id + '-' + (index + 1);
    evidence.push({id, kind: 'chemical-observation', oilId: oil.id, observation: copy(observation),
      researchMatch: false, verification: {status: 'legacy-source-record', sourceIds: copy(observation.sourceIds), urls: [], checkedAt: null, notes: null}});
    result.chemicalEvidenceIds.push(id);
  }
  return result;
});
const byOil = new Map(oils.map(oil => [oil.id, oil]));
const compounds = baseline.compounds.map(compound => ({...copy(compound), studyLinks: []}));
const byCompound = new Map(compounds.map(compound => [compound.id, compound]));
const studies = baseline.studies.map(study => {
  const record = copy(study); delete record.oilIds; delete record.compoundIds; delete record.categories;
  record.useNodeIds = study.categories.map(category => ensureNode([category.type, category.subcategory, category.topic].filter(value => value !== undefined)).id);
  for (const [order, oilId] of study.oilIds.entries()) {
    byOil.get(oilId).studyLinks.push({studyId: study.id, order});
    for (const useNodeId of record.useNodeIds) evidence.push({
      id: 'use-' + hash([oilId, study.id, useNodeId]).slice(0, 24), kind: 'study-use', oilId, studyId: study.id, useNodeId,
      finding: null, limitations: null, material: null, model: null, outcome: null, route: null, species: null,
      relevance: 'unreviewed', researchMatch: false,
      verification: {status: 'unreviewed', sourceIds: [], urls: [], checkedAt: null,
        notes: 'Imported oil–study–category association; not a source-verified match for this oil or finished product.'}
    });
  }
  for (const [order, compoundId] of study.compoundIds.entries()) byCompound.get(compoundId).studyLinks.push({studyId: study.id, order});
  return record;
});
const nodeById = new Map(nodes.map(node => [node.id, node]));
for (const oil of oils) {
  const local = new Map();
  function insert(nodeId) {
    if (local.has(nodeId)) return local.get(nodeId);
    const node = nodeById.get(nodeId), branch = {useNodeId: nodeId, evidenceIds: [], children: []};
    local.set(nodeId, branch);
    (node.parentId ? insert(node.parentId).children : oil.uses).push(branch);
    return branch;
  }
  for (const assertion of evidence) if (assertion.kind === 'study-use' && assertion.oilId === oil.id) insert(assertion.useNodeId).evidenceIds.push(assertion.id);
  const order = new Map(nodes.map((node, index) => [node.id, index]));
  function sortBranches(branches) { branches.sort((a, b) => order.get(a.useNodeId) - order.get(b.useNodeId)); branches.forEach(branch => sortBranches(branch.children)); }
  sortBranches(oil.uses);
}
const sources = baseline.sources.map(source => {
  const record = copy(source);
  const matches = studies.filter(study => source.url && study.url === source.url);
  if (matches.length === 1) {
    record.studyRef = matches[0].id; record.inheritedFields = [];
    for (const key of ['url', 'doi', 'pubmedId']) if (key in record && record[key] === matches[0][key]) { record.inheritedFields.push(key); delete record[key]; }
  }
  return record;
});
const counts = {oils: oils.length, compounds: compounds.length, studies: studies.length, sources: sources.length,
  oilStudyLinks: baseline.studies.reduce((n, s) => n + s.oilIds.length, 0),
  compoundStudyLinks: baseline.studies.reduce((n, s) => n + s.compoundIds.length, 0),
  tagAssignments: baseline.studies.reduce((n, s) => n + s.categories.length, 0),
  constituents: baseline.oils.reduce((n, o) => n + o.constituents.length, 0),
  chemicalEvidence: baseline.oils.reduce((n, o) => n + o.chemicalEvidence.length, 0)};
// Historical UI rules are captured once during migration, then maintained only in
// the master registry. The production generator never reads these migration values.
const historicalTerpeneClasses = new Set(['Monoterpene', 'Monoterpenoid', 'Sesquiterpene', 'Sesquiterpenoid', 'Furanosesquiterpene']);
const historicalClassLabels = {Monoterpene: 'Monoterpenes', Monoterpenoid: 'Monoterpenoids',
  Sesquiterpene: 'Sesquiterpenes', Sesquiterpenoid: 'Sesquiterpenoids', Furanosesquiterpene: 'Furanosesquiterpenes',
  Phenylpropanoid: 'Phenylpropanoids', 'Organosulfur compound': 'Organosulfur compounds', Flavonoid: 'Flavonoids'};
const chemicalTaxonomy = [{id: 'terpenes', label: 'Terpenes and terpenoids', parentId: null, selectable: true, match: {includeDescendants: true}}];
for (const chemicalClass of [...new Set(compounds.map(compound => compound.chemicalClass))]) chemicalTaxonomy.push({
  id: 'class:' + chemicalClass, label: historicalClassLabels[chemicalClass] || chemicalClass,
  parentId: historicalTerpeneClasses.has(chemicalClass) ? 'terpenes' : null,
  selectable: chemicalClass !== 'Flavonoid', match: {chemicalClasses: [chemicalClass]}
});
for (const group of baseline.chemicalGroups) chemicalTaxonomy.push({id: 'group:' + group.id, label: group.label,
  parentId: null, selectable: true, groupId: group.id,
  match: {...(group.id === 'flavonoid' ? {chemicalClasses: ['Flavonoid']} : {}), functionalGroups: [group.id]}
});
const editorialReferences = {chemistryExplainerSourceIds: ['oswald-2021', 'oswald-2023', 'paryani-2024', 'bautista-2021']};
const master = {schemaVersion: 1, taxonomyVersion: 1, version: baseline.version, blendBuilder: copy(baseline.blendBuilder),
  oils, registries: {compounds, studies, sources, useNodes: nodes, evidenceAssertions: evidence, chemicalGroups: copy(baseline.chemicalGroups), chemicalTaxonomy, editorialReferences},
  migration: {baselineDigest: hash(baseline), baselineCounts: counts, correctionLedger: [],
    note: 'Legacy profile uses, safety text and blend quality summaries are retained for compatibility and are not independent verified evidence. Baseline assertions remain unmatched until an explicit source audit.'}};
fs.writeFileSync(output, JSON.stringify(master, null, 2) + '\n');
console.log(JSON.stringify({output, counts, taxonomyNodes: nodes.length, evidenceAssertions: evidence.length, inheritedCitations: sources.filter(s => s.studyRef).length}, null, 2));
