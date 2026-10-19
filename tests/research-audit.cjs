'use strict';
/* Source-audit regression tests: facts, scope, provenance and conservative matches. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {loadGenerated, legacyProjection, reverseLedger, digest} = require('./master-data.cjs');
const root = path.resolve(__dirname, '..');
const master = JSON.parse(fs.readFileSync(path.join(root, 'master-data.json'), 'utf8'));
const regs = master.registries;
const studies = new Map(regs.studies.map(s => [s.id, s]));
const oils = new Map(master.oils.map(o => [o.id, o]));
const assertions = regs.evidenceAssertions.filter(a => a.kind === 'study-use');
const rows = (studyId, oilId) => assertions.filter(a => a.studyId === studyId && (!oilId || a.oilId === oilId));
const node = (a, text) => a.useNodeId.includes(text);
let checks = 0;
function test(name, run) { run(); checks++; }
function all(list, predicate, message) {
  assert.ok(list.length, 'Expected records: ' + message);
  assert.ok(list.every(predicate), message);
}

test('Canonical inventories and unique publications', () => {
  assert.equal(master.oils.length, 33); assert.equal(regs.compounds.length, 42);
  assert.equal(regs.studies.length, 174); assert.equal(regs.sources.length, 50);
  assert.equal(new Set(regs.studies.map(s => s.id)).size, 174);
  for (const field of ['doi', 'pubmedId']) {
    const values = regs.studies.map(s => s[field]?.toLowerCase()).filter(Boolean);
    assert.equal(new Set(values).size, values.length, 'Duplicate publication ' + field);
  }
});
test('Every oil has linked, independently scoped evidence', () => {
  for (const oil of master.oils) {
    assert.ok(oil.studyLinks.length); assert.ok(oil.uses.length);
    all(assertions.filter(a => a.oilId === oil.id), a => oil.studyLinks.some(l => l.studyId === a.studyId), oil.id);
    assert.equal(oil.precautions.reviewStatus, 'unreviewed');
    assert.equal(oil.legacy.usesVerification, 'unverified-legacy');
  }
});
test('Research gate is strictly boolean, verified, direct and explicitly faceted', () => {
  for (const a of assertions) {
    assert.equal(typeof a.researchMatch, 'boolean');
    assert.ok(a.material && a.model && a.outcome);
    assert.ok(Object.hasOwn(a, 'finding') && Object.hasOwn(a, 'limitations'));
    if (!a.researchMatch) continue;
    assert.ok(['source-checked', 'source-verified'].includes(a.verification.status));
    assert.equal(a.relevance, 'direct');
    assert.ok(['essential-oil', 'single-oil-topical-formulation'].includes(a.material.kind));
    assert.ok(!['oral', 'injection'].includes(a.route));
    assert.notEqual(a.material.speciesMatch, 'different-species');
    assert.notEqual(a.outcome.direction, 'unverified');
  }
});
test('Unverified is unknown, not a null or adverse study conclusion', () => {
  all(assertions.filter(a => a.verification.status === 'library-reviewed'), a => !a.researchMatch && a.outcome.direction === 'unverified', 'library-only evidence remains unknown');
  all(assertions.filter(a => a.outcome.direction === 'negative'), a => a.verification.status === 'source-checked', 'negative outcomes need source checking');
});
test('Verified public provenance contains no private paths', () => {
  all(assertions.filter(a => a.verification.status === 'source-checked'), a =>
    a.verification.checkedAt === '2026-10-18' && a.verification.urls.length && a.verification.urls.every(u => /^https:\/\//.test(u)), 'public primary URLs and check date');
  assert.doesNotMatch(JSON.stringify(master), /\/workspace\/|\/agent_notes\/|provenancePacket|dream_notes/);
});
test('Targeted source checking is distinct from complete library coverage', () => {
  assert.equal(master.migration.audit.baselineOilStudyRelations, 214);
  assert.equal(master.migration.audit.primaryCheckedExistingRelations, 45);
  assert.equal(master.migration.audit.libraryReviewedOnlyExistingRelations, 169);
  assert.equal(master.migration.audit.newPrimaryPublications, 3);
  const primaryPairs = new Set(assertions.filter(a => a.verification.status === 'source-checked').map(a => a.oilId + '/' + a.studyId));
  assert.equal(primaryPairs.size, 81); // Prior 51, nine corrected existing pairs, two new-paper oil relations.
});
test('Every publication has an independent citation check, separate from endpoint verification', () => {
  all(regs.studies, s => s.citationReview.status === 'identity-checked' && s.citationReview.checkedAt === '2026-10-18', 'citation review');
  assert.equal(regs.studies.filter(s => s.summaryReview.status === 'abstract-screened').length, 163);
  assert.deepEqual(regs.studies.filter(s => s.summaryReview.status === 'abstract-unavailable').map(s => s.id), ['composition-lemongrass-infusion-2014', 'composition-cx01']);
  assert.ok(assertions.some(a => a.verification.status === 'library-reviewed'), 'Abstract screening must not silently promote every oil-specific edge');
  all(regs.studies.filter(s => s.citationReview.provider === 'Crossref'), s => s.citationReview.sourceUrl.startsWith('https://api.crossref.org/works/'), 'Fallback provenance must identify the provider actually used');
});
test('Seven incorrect PubMed destinations are corrected without changing stable study IDs', () => {
  for (const [id, pmid] of Object.entries({
    'komori-1995-citrus': '8646568', 'kasper-2010-silexan': '20512042',
    'carson-2006-teatree': '16418522', 'juergens-2003-cineole': '12645832',
    'cannabis-terpene-profiles-2022': '32591428', 'cannabis-terpene-diversity-2016': '31084880',
    'cannabis-volatile-classification-2022': '35588111'
  })) {
    const s = studies.get(id);
    assert.equal(s.pubmedId, pmid); assert.equal(s.url, `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`);
    assert.equal(s.citationReview.pubmedId, pmid);
  }
  assert.equal(studies.get('cannabis-terpene-profiles-2022').evidenceLevel, 'laboratory');
});
test('Tick papers do not become fly evidence', () => {
  for (const id of ['tick-eo-2024', 'lone-star-tick-eo-2024']) {
    assert.ok(!studies.get(id).useNodeIds.some(n => n.startsWith('pest-flies')));
    all(rows(id), a => !a.useNodeId.startsWith('pest-flies'), id);
  }
  assert.match(studies.get('lone-star-tick-eo-2024').finding, /only patchouli/i);
});
test('Biochemistry is not cognition, and model labels do not split memory endpoints', () => {
  const research = require('../research.js').create(loadGenerated(path.join(root, 'data.js')));
  assert.ok(!research.descendants('health-cognitive').includes('health-cognitive-plant-chemistry'));
  assert.ok(research.descendants('botanical-composition').includes('health-cognitive-plant-chemistry'));
  assert.equal(research.resolve('botanical:bioactivity:animal-cognition'), 'health-cognitive-memory');
  for (const id of ['halder-2011-clove-memory','halder-2012-clove-acute-cognition'])
    all(rows(id), a => a.useNodeId === 'health-cognitive-memory' && a.model.kind === 'animal' && !a.researchMatch, id);
});
test('Moss 2003 retains slower rosemary memory responses and adverse lavender outcomes', () => {
  all(rows('moss-cook-2003', 'rosemary'), a => a.outcome.direction === 'mixed' && a.researchMatch && !a.supportsFunctionalUse && /slowed/.test(a.finding), 'rosemary mixed result');
  all(rows('moss-cook-2003', 'lavender'), a => a.outcome.direction === 'negative' && a.researchMatch && /worsened/.test(a.finding), 'lavender adverse result');
  assert.doesNotMatch(rows('moss-cook-2003', 'rosemary')[0].model.label, /20|correlation/);
});
test('Radiotherapy anxiety was worse than carrier, not merely nonsignificant', () => {
  all(rows('graham-browne-cox-2003'), a => a.outcome.direction === 'negative' && a.material.kind === 'combination' && !a.researchMatch, 'blend-level unfavorable outcome');
  assert.match(studies.get('graham-browne-cox-2003').finding, /carrier oil alone/);
  assert.match(studies.get('ball-owen-booth-2020').finding, /13 trials.*708/);
});
test('Rosemary hybrids and cinnamon leaf remain different from catalog materials', () => {
  all(rows('najar-2022','rosemary'), a => a.material.speciesMatch === 'different-species' && !a.researchMatch, 'rosemary hybrids');
  all(rows('guynot-2003','cinnamon'), a => a.material.relevance === 'different-plant-part' && !a.researchMatch, 'cinnamon leaf');
  assert.match(studies.get('guynot-2003').finding, /much more limited/);
});
test('New controlled study retains null outcomes and different lemon extraction', () => {
  const id = 'kiecolt-glaser-2008-olfactory';
  all(rows(id, 'lemon'), a => !a.researchMatch && a.material.relevance === 'different-extraction', 'steam-extracted lemon versus cold-pressed catalog');
  all(rows(id, 'lavender'), a => a.researchMatch && !a.supportsFunctionalUse && ['null','mechanistic-mixed'].includes(a.outcome.direction), 'direct lavender research without a benefit claim');
  assert.equal(rows(id, 'lemon').find(a => node(a,'mood')).outcome.direction, 'positive-in-studied-model');
  assert.equal(rows(id, 'lavender').find(a => node(a,'mood')).outcome.direction, 'null');
  assert.equal(studies.get(id).summaryReview.status, 'full-text-screened');
});
test('Every compound has formula provenance, including ambiguous name-search results', () => {
  all(regs.compounds, c => c.identityReview.formula === c.formula && c.identityReview.sourceUrl.startsWith('https://'), 'formula provenance');
  assert.equal(regs.compounds.find(c => c.id === 'furanoeudesma-1-3-diene').formula, 'C15H18O');
  const curzerene = regs.compounds.find(c => c.id === 'curzerene');
  assert.equal(curzerene.formula, 'C15H20O'); assert.equal(curzerene.identityReview.provider, 'NIST Chemistry WebBook');
  assert.match(regs.compounds.find(c => c.id === 'citral').identityReview.scope, /mixture/);
});
test('Faraji attribution and opposite extract outcomes are preserved', () => {
  const id = 'nialeila-2020-myrrh-frankincense-wound';
  assert.match(studies.get(id).authors, /^Faraji A/);
  all(rows(id, 'myrrh'), a => a.outcome.direction === 'positive' && a.route === 'topical-sitz-bath' && !a.researchMatch, 'myrrh extract');
  all(rows(id, 'frankincense'), a => a.outcome.direction === 'null' && a.species === 'Boswellia carteri' && !a.researchMatch, 'frankincense null result');
  all(rows(id), a => a.material.kind === 'botanical-extract', 'not essential oils');
  assert.match(studies.get(id).finding, /did not differ significantly/);
});
test('Moss peppermint and ylang arms cannot borrow each other’s outcome', () => {
  const id = 'moss-2008-peppermint-cognition';
  all(rows(id, 'peppermint'), a => a.researchMatch && a.outcome.direction === 'positive-in-studied-model' && a.route === 'inhalation', 'peppermint acute research');
  all(rows(id, 'ylang-ylang').filter(a => node(a, 'cognitive')), a => a.researchMatch && a.supportsFunctionalUse === false && a.outcome.direction === 'negative', 'ylang cognition adverse direction remains a direct topic match');
  all(rows(id, 'ylang-ylang').filter(a => node(a, 'calm')), a => a.researchMatch && a.outcome.direction === 'mixed', 'ylang calm with countervailing outcomes');
  assert.match(studies.get(id).finding, /impaired memory/);
});
test('Primary citation metadata corrected while stable IDs survive', () => {
  const c = studies.get('commercial-eo-antibiofilm-2023');
  assert.match(c.authors, /^Neagu R/); assert.equal(c.doi, '10.3390/antibiotics12071191');
  const cannabis = studies.get('cannabis-terpenes-review-2020');
  assert.equal(cannabis.pubmedId, '33859287');
  assert.equal(cannabis.url, 'https://pubmed.ncbi.nlm.nih.gov/33859287/');
});
test('Only Yang’s actual soil-removal assays use cleaning tags', () => {
  all(assertions.filter(a => a.useNodeId.startsWith('cleaning')), a => a.studyId === 'yang-2021-citrus-cleaning' && a.useNodeId === 'cleaning-surface-soil-removal', 'cleaning endpoint precision');
  all(rows('yang-2021-citrus-cleaning'), a => a.researchMatch && a.route === 'bench-soil-removal' && a.material.kind === 'essential-oil', 'crude-oil arms separated from fractions');
  assert.deepEqual(rows('yang-2021-citrus-cleaning').map(a => a.oilId).sort(), ['grapefruit', 'lemon', 'sweet-orange']);
  assert.match(studies.get('yang-2021-citrus-cleaning').limitations, /Visual endpoint/);
});
test('Preservation, textile finishing and oral odor retain correct domains', () => {
  all(rows('washing-liquids-eo-2011'), a => a.useNodeId.startsWith('microbial') && !a.researchMatch, 'formulated preservative challenge');
  all(rows('farouk-2022'), a => a.useNodeId.startsWith('microbial') && !a.researchMatch, 'antimicrobial textile finish');
  all(rows('hur-park-2007'), a => a.useNodeId.startsWith('health-oral-dental') && !a.researchMatch, 'oral odor blend');
});
test('Cellular cytotoxicity never becomes immune support', () => {
  for (const id of ['frank-2009-frankincense-bladder-cancer', 'fikry-2025-niaouli-lung-cancer'])
    all(rows(id), a => a.useNodeId === 'botanical-bioactivity-cellular-cytotoxicity' && a.supportsFunctionalUse === false && a.researchMatch === (id === 'fikry-2025-niaouli-lung-cancer'), id);
  all(rows('han-2017-frankincense-fibroblasts'), a => !a.researchMatch && a.relevance === 'contextual', 'unreported frankincense species');
  assert.match(studies.get('han-2017-frankincense-fibroblasts').finding, /collagen III.*declined/i);
  assert.match(studies.get('han-2017-frankincense-fibroblasts').limitations, /not clinical benefit or collagen boosting/);
});
test('Microbial isolates are not clinical wound or skin benefits', () => {
  all(rows('mahboubi-2016-myrrh-dermatophyte'), a => a.useNodeId.startsWith('microbial-fungi'), 'myrrh dermatophytes');
  all(rows('sienkiewicz-2014-geranium-wound-bacteria'), a => a.useNodeId.startsWith('microbial-bacteria'), 'geranium wound-source isolates');
  all(rows('composition-cinnamon-2022'), a => a.model.kind !== 'human', 'canine isolates remain laboratory');
});
test('Single-oil topical trials preserve precise clinical preparation', () => {
  const acne = rows('tea-tree-acne-2007'); const dandruff = rows('tea-tree-dandruff-2002');
  all(acne, a => a.researchMatch && a.useNodeId === 'health-skin-acne' && a.material.kind === 'single-oil-topical-formulation' && a.route === 'topical', 'tea-tree gel acne');
  all(dandruff, a => a.researchMatch && a.useNodeId === 'health-skin-dandruff' && a.material.kind === 'single-oil-topical-formulation', 'tea-tree shampoo dandruff');
});
test('Rosemary scalp lotion keeps its comparative limitations', () => {
  all(rows('panahi-2015-rosemary-alopecia'), a => !a.researchMatch && a.relevance === 'contextual' && a.route === 'topical', 'specific scalp lotion');
  const s = studies.get('panahi-2015-rosemary-alopecia');
  assert.match(s.finding, /no significant between-group difference/i);
  assert.match(s.limitations, /does not prove equivalence/);
  assert.match(s.finding, /Itching increased/);
});
test('Isolated compounds and oral products never match whole-oil functional uses', () => {
  const ids = ['gertsch-2008-caryophyllene','eugenol-2021-memory-neurogenesis','menthol-migraine-2010','carvacrol-asthma-2021','carvacrol-asthma-phase2-2018','carvacrol-safety-2021','schulze-2011-ticks','cannabis-terpenes-review-2020'];
  for (const id of ids) all(rows(id), a => !a.researchMatch && a.material.kind === 'isolated-compound', id);
  for (const id of ['kasper-2010-silexan','moridpour-2024-cinnamon','khanna-macdonald-levesque-2014'])
    all(rows(id), a => !a.researchMatch, id);
});
test('Injection, related species and chemotype mismatches stay contextual', () => {
  for (const id of ['halder-2011-clove-memory','halder-2012-clove-acute-cognition'])
    all(rows(id), a => !a.researchMatch && a.model.kind === 'animal' && a.route === null && a.routeVerification.status === 'unverified', id);
  all(rows('lima-campos-2024','lavender'), a => !a.researchMatch, 'lavandin differs from lavender');
  all(rows('chaves-campos-2026','lemongrass'), a => !a.researchMatch, 'C. flexuosus differs from C. citratus');
  all(rows('chen-2020-ravintsara-mrsa'), a => !a.researchMatch, 'ravintsara chemotype mismatch');
  all(rows('obistioiu-2023-boswellia'), a => !a.researchMatch, 'Boswellia mixture lacks catalog serrata');
});
test('Clove gel has exact dental needle endpoint and no oil match', () => {
  all(rows('alqareer-alyahya-andersson-2006'), a => !a.researchMatch && a.useNodeId === 'health-oral-dental-needle-insertion-pain' && a.material.kind === 'botanical-preparation', 'clove gel');
});
test('Composition-topic matches cannot imply functional-use efficacy', () => {
  all(assertions.filter(a => a.useNodeId.startsWith('botanical-composition') && a.researchMatch), a => a.supportsFunctionalUse === false && a.model.kind === 'analytical' && a.outcome.direction === 'analytical-not-efficacy', 'analytical facets');
  for (const id of ['composition-cx12','composition-cx13','composition-peppermint-2012','composition-eucalyptus-2023','composition-lemongrass-2014','composition-citronella-2016','composition-cinnamon-2022','composition-cx16'])
    assert.ok(rows(id).some(a => a.researchMatch && a.supportsFunctionalUse), 'Same-paper biological endpoints retained for ' + id);
});
test('Lemongrass animal skin and culture models remain separate', () => {
  all(rows('composition-lemongrass-2014').filter(a => a.useNodeId.startsWith('health')), a => a.model.kind === 'animal' && a.route === 'topical', 'mouse model');
  all(rows('composition-lemongrass-2014').filter(a => a.useNodeId.startsWith('microbial')), a => a.model.kind === 'in-vitro', 'fungal cultures');
});
test('Named species cannot accidentally become an exposure route', () => {
  all(rows('pinto-2009-clove-antifungal'), a => a.route === 'in-vitro-exposure' && a.material.kind === 'essential-oil', 'Syzygium aromaticum is not aroma inhalation');
  for (const id of ['lee-kim-2017','guo-2024-oregano-listeria','sateriale-forgione-2024'])
    all(rows(id), a => a.material.kind === 'essential-oil', 'Extraction qualifier must not be parsed as an extract: ' + id);
});
test('Recovered blend components remain contextual and retain the checked result', () => {
  all(rows('han-2006-dysmenorrhea','clary-sage'), a => !a.researchMatch && a.material.kind === 'combination', 'clary blend');
  all(rows('graham-browne-cox-2003','bergamot'), a => !a.researchMatch && a.outcome.direction === 'negative', 'bergamot blend unfavorable anxiety result');
});
test('Legacy profile and builder text never become active audited evidence', () => {
  assert.equal(master.blendDefaults.availability, 'unconfirmed');
  assert.equal(master.blendDefaults.safetyReviewStatus, 'unverified');
  assert.deepEqual(master.blendDefaults.qualityMappings, []);
  all(master.oils.filter(o => o.legacy.blend), o => o.legacy.blend.activeEvidenceSource === false, 'old eight-oil summaries inactive');
  assert.equal(master.blendBuilder.version, '1'); assert.equal(master.blendBuilder.catalogVersion, '2026-10-18');
  for (const [alias, id] of Object.entries({calm:'health-mental-health',focus:'health-cognitive',sleep:'health-mental-health-sleep',uplifting:'health-mental-health-mood'}))
    assert.ok(regs.useNodes.find(n => n.id === id).aliases.includes(alias));
});
test('Route and model facets are explicit, scoped and independently verified', () => {
  const research = require('../research.js').create(loadGenerated(path.join(root, 'data.js')));
  const chemistryNodes = new Set([...research.descendants('botanical-composition'), ...research.descendants('botanical-nonvolatile-chemistry')]);
  for (const a of assertions) {
    assert.ok(a.routeVerification && a.model.verification && a.model.scope);
    const chemicalOnly = chemistryNodes.has(a.useNodeId) || a.route === 'not-applicable';
    if (chemicalOnly) {
      assert.equal(a.route, 'not-applicable');
      assert.equal(a.model.kind, 'analytical');
      assert.equal(a.routeVerification.status, 'not-applicable');
    } else if (a.verification.status === 'library-reviewed') {
      assert.equal(a.route, null, 'Unverified route: ' + a.id);
      assert.equal(a.routeVerification.status, 'unverified');
      assert.equal(a.model.verification, 'library-reported-unverified');
    } else if (a.route !== null) {
      assert.equal(a.routeVerification.status, 'source-checked');
      assert.equal(a.model.verification, 'source-checked');
    }
    if (a.model.kind.startsWith('mixed-')) assert.equal(a.route, null, 'Mixed experimental systems have no single inferred route');
  }
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'scripts/apply-research-audit.py'), 'utf8'), /def route_for|route_for\(/);
});
test('Direct topic matching is independent of favorable outcome', () => {
  all(assertions.filter(a => a.relevance === 'direct' && ['source-checked','source-verified'].includes(a.verification.status)), a => a.researchMatch === true, 'all directly studied topics remain discoverable');
  all(assertions.filter(a => ['negative','null','mechanistic','mechanistic-mixed'].includes(a.outcome.direction)), a => a.supportsFunctionalUse === false, 'adverse, null and mechanistic outcomes do not imply functional benefit');
  all(rows('fikry-2025-niaouli-lung-cancer'), a => a.researchMatch && a.outcome.direction === 'mechanistic' && a.supportsFunctionalUse === false, 'niaouli cell research remains visible without immune or clinical claim');
});
test('Mixed cannabis systems never inherit a cell-only exposure route', () => {
  all(rows('cannabis-terpenes-review-2020'), a => a.route === null && a.model.kind === 'mixed-preclinical' && a.model.scope === 'mixed', 'separate mouse and cell methods');
});
test('Same-paper composition, fungal and animal exposures stay separate', () => {
  const id = 'composition-lemongrass-2014';
  all(rows(id).filter(a => a.useNodeId.startsWith('botanical-composition')), a => a.route === 'not-applicable' && a.model.kind === 'analytical', 'no biological route for composition');
  all(rows(id).filter(a => a.useNodeId.startsWith('microbial')), a => a.route === 'laboratory-contact-and-vapor' && a.model.kind === 'in-vitro', 'fungal-assay exposure');
  all(rows(id).filter(a => a.useNodeId.startsWith('health')), a => a.route === 'topical' && a.model.kind === 'animal', 'topical mouse experiment');
});
test('Air, surfaces, fungi and biofilms cannot borrow method labels', () => {
  all(rows('sateriale-forgione-2024').filter(a => a.useNodeId === 'microbial-environmental-counts-air'), a => a.route === 'experimental-nebulization' && a.model.kind === 'environmental', 'air endpoint');
  all(rows('sateriale-forgione-2024').filter(a => a.useNodeId === 'microbial-environmental-counts-surfaces'), a => a.route === 'laboratory-surface-contact' && a.model.kind === 'environmental', 'surface endpoint');
  all(rows('composition-eucalyptus-2023').filter(a => a.useNodeId === 'microbial-biofilms'), a => a.route === null && !a.model.label.includes('vapor'), 'biofilm method does not inherit fungal vapor method');
  all(rows('composition-cx16').filter(a => a.useNodeId === 'microbial-bacteria'), a => a.model.kind === 'in-vitro' && /separate endpoint/.test(a.model.label), 'clinical bacterial isolates do not inherit mammalian toxicity model');
});
test('Source-backed correction ledger reverses to the exact lossless baseline', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'terpene-audit-'));
  try {
    const out = path.join(tmp, 'generated.js');
    const result = spawnSync('python3', [path.join(root,'scripts/build-data.py'), '--output',out], {encoding:'utf8'});
    assert.equal(result.status, 0, result.stderr);
    const data = loadGenerated(out), restored = reverseLedger(legacyProjection(data), master.migration.correctionLedger);
    assert.equal(digest(restored), master.migration.baselineDigest);
    for (const s of restored.studies) {
      assert.ok(studies.has(s.id), 'Lost canonical study ' + s.id);
      for (const oid of s.oilIds) assert.ok(oils.get(oid).studyLinks.some(l => l.studyId === s.id), 'Lost oil-study relation ' + oid + '/' + s.id);
    }
    assert.deepEqual({...data.blendBuilder.product,shopifyVariantId:null}, restored.blendBuilder.product);
    assert.equal(data.oils.filter(o => o.blend).length, 33);
    assert.equal(master.migration.correctionLedger.find(e => e.id === 'source-audit-2026-10-18').instructions.length, 36);
  } finally { fs.rmSync(tmp, {recursive:true,force:true}); }
});
test('Merchant assortment is independent of the complete research library', () => {
  const data=loadGenerated(path.join(root,'data.js'));
  for (const id of ['ravintsara','vitex','bergamot','copaiba','grapefruit','lemon-eucalyptus','niaouli']) {
    const oil=data.oils.find(o=>o.id===id);
    assert.equal(oil.blend.enabled,false); assert.ok(oil.evidenceIds.length);
    assert.ok(data.studies.some(s=>s.oilIds.includes(id)));
  }
  for(const id of ['cedarwood-atlas','chamomile-german','chamomile-roman','sandalwood','ginger']) {
    assert.equal(data.oils.find(o=>o.id===id).blend.enabled,true);
    assert.ok(data.oils.find(o=>o.id===id).constituents.length);
    assert.ok(assertions.filter(a=>a.oilId===id).length>=3);
  }
  assert.equal(data.oils.filter(o=>o.blend.enabled).length,26);
});
test('New oil research preserves material, species, negative results and specific pests', () => {
  all(rows('can-2012-german-chamomile-behavior'), a=>a.outcome.direction==='negative' && !a.researchMatch, 'mouse anxiety result');
  all(rows('wang-2020-ginger-composition').filter(a=>a.useNodeId==='microbial-bacteria'), a=>!a.researchMatch && a.material.kind==='botanical-extract', 'CO2 extraction');
  all(rows('zargaran-2018-chamomile-migraine'), a=>!a.researchMatch && a.material.kind==='botanical-preparation', 'oleogel not distilled oil');
  all(rows('2025-ginger-peppermint-lavender-nausea'), a=>!a.researchMatch && a.material.kind==='combination' && a.outcome.direction==='mixed', 'blend cannot establish single-oil effects');
  all(rows('moy-2012-sandalwood-acne-regimen'), a=>!a.researchMatch && a.material.speciesMatch==='unverified', 'salicylic acid and unverified sandalwood species');
  all(rows('galovicova-2022-atlas-cedar-bioactivity').filter(a=>a.useNodeId.startsWith('pest')), a=>a.useNodeId==='pest-plant-bugs-pyrrhocoris-apterus', 'firebugs do not become mosquitoes');
  assert.match(studies.get('el-assri-2025-roman-chamomile-bioactivity').limitations,/disagree/);
});
console.log(`research-audit: ${checks} checks passed; ${assertions.length} scoped study assertions, ${assertions.filter(a => a.researchMatch).length} research-topic matches.`);
