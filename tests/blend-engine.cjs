/* ALL numeric safety limits and checkout settings in fixture() are synthetic,
 * test-only values. They are not formulation recommendations or production data.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const engine = require('../blend-engine.js');
const copy = value => JSON.parse(JSON.stringify(value));
const source = {label: 'TEST-ONLY synthetic safety review', url: 'https://example.test/synthetic-review'};
function fixture() {
  return {
    sources: [{id: 'test-only-source', ...source}],
    blendBuilder: {
      version: '1', catalogVersion: '2026-10-18',
      qualities: [{id: 'calm', label: 'Calm'}, {id: 'focus', label: 'Focus'}],
      product: {name: 'Custom Blend', price: 45, currency: 'USD', size: '8 oz',
        totalOilLoadPercent: 2, totalOilLoadSource: copy(source),
        totalOilMaxPercent: 3, totalOilMaxSource: copy(source),
        shopifyVariantId: '123456789', checkoutEndpoint: '/apps/test-only-blend/checkout',
        checkoutAllowedHosts: ['test-only.myshopify.com'], serverValidationVerified: true}
    },
    oils: ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta'].map(id => ({
      id, name: 'TEST-ONLY ' + id,
      blend: {enabled: true, availability: 'available', safetyReviewStatus: 'approved', qualityMappings: [],
        dermalMaxPercent: 2, dermalMaxSource: copy(source), cautionThresholds: [],
        phototoxic: false, sensitizationNotes: 'TEST-ONLY fixture note.', petSafer: true,
        petSource: copy(source), interactions: []}
    }))
  };
}
function recipe() {
  return {v: 1, catalogVersion: '2026-10-18', name: 'Test-only recipe', path: 'oils',
    qualityIds: [], petContext: false, oils: [{id: 'alpha', percent: 50}, {id: 'beta', percent: 50}]};
}
const codes = result => result.map(item => item.code);
function invalid(value, code, data = fixture()) {
  const result = engine.validateRecipe(value, data);
  assert.equal(result.valid, false, code);
  assert.equal(result.recipe, null);
  assert.ok(codes(result.errors).includes(code), JSON.stringify(result));
  assert.equal(engine.evaluateSafety(value, data).canPurchase, false);
  assert.throws(() => engine.encodeRecipe(value, data), engine.BlendValidationError);
  assert.throws(() => engine.checkoutPayload(value, data), engine.BlendValidationError);
}
function blocked(data, code, value = recipe()) {
  const result = engine.evaluateSafety(value, data);
  assert.equal(result.canPurchase, false, code);
  assert.ok(codes(result.blockers).includes(code), JSON.stringify(result));
  assert.throws(() => engine.checkoutPayload(value, data), engine.BlendValidationError);
  return result;
}
function encoded(value) { return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url'); }

// Exact basis-point validation, max-five enforcement, and deterministic rounding.
assert.deepEqual(engine.normalizePercentages([{id: 'gamma', percent: 1}, {id: 'alpha', percent: 1}, {id: 'beta', percent: 1}]),
  [{id: 'gamma', percent: 33.33}, {id: 'alpha', percent: 33.34}, {id: 'beta', percent: 33.33}]);
assert.deepEqual(engine.normalizePercentages([{id: 'alpha', percent: 20}, {id: 'beta', percent: 80}]),
  [{id: 'alpha', percent: 20}, {id: 'beta', percent: 80}]);
assert.deepEqual(engine.normalizePercentages([{id: 'alpha', percent: 0.01}]), [{id: 'alpha', percent: 100}]);
assert.throws(() => engine.normalizePercentages([{id: 'alpha', percent: 0.01}, {id: 'beta', percent: 100}, {id: 'gamma', percent: 100}, {id: 'delta', percent: 100}, {id: 'epsilon', percent: 100}]), engine.BlendValidationError);
for (const values of [[], [{id: 'alpha', percent: 0}], [{id: 'alpha', percent: NaN}],
  [{id: 'alpha', percent: 0.001}], [{id: 'alpha', percent: '50'}],
  [{id: 'alpha', percent: 50}, {id: 'alpha', percent: 50}]]) {
  assert.throws(() => engine.normalizePercentages(values), engine.BlendValidationError);
}
for (let count = 1; count <= 5; count++) {
  for (let sample = 0; sample < 40; sample++) {
    const rows = Array.from({length: count}, (_, i) => ({id: 'test-' + i, percent: 1 + ((sample * 11 + i * 7) % 90)}));
    const normalized = engine.normalizePercentages(rows);
    assert.equal(normalized.reduce((sum, row) => sum + Math.round(row.percent * 100), 0), 10000);
    assert.ok(normalized.every(row => row.percent > 0));
    assert.deepEqual(engine.normalizePercentages(normalized), normalized);
  }
}
assert.equal(engine.validateRecipe(recipe(), fixture()).valid, true);
assert.equal(engine.validateRecipe({...recipe(), oils: [{id: 'alpha', percent: 33.34}, {id: 'beta', percent: 33.33}, {id: 'gamma', percent: 33.33}]}, fixture()).valid, true);
invalid(null, 'recipe_shape');
invalid([], 'recipe_shape');
invalid({...recipe(), checkoutEndpoint: 'https://example.test/bypass'}, 'recipe_shape');
const missing = recipe(); delete missing.petContext; invalid(missing, 'recipe_shape');
invalid({...recipe(), v: '1'}, 'recipe_version');
invalid({...recipe(), v: 2}, 'recipe_version');
invalid({...recipe(), catalogVersion: 'old'}, 'catalog_version');
invalid({...recipe(), path: 'surprise'}, 'recipe_path');
invalid({...recipe(), petContext: 'false'}, 'pet_context');
invalid({...recipe(), name: 'a'.repeat(61)}, 'recipe_name');
invalid({...recipe(), name: 'test\nname'}, 'recipe_name');
invalid({...recipe(), name: '\ud800'}, 'recipe_name');
invalid({...recipe(), name: {}}, 'recipe_name');
invalid({...recipe(), qualityIds: ['unknown']}, 'unknown_quality');
invalid({...recipe(), qualityIds: ['calm', 'calm']}, 'duplicate_quality');
invalid({...recipe(), qualityIds: 'calm'}, 'quality_ids');
invalid({...recipe(), qualityIds: Array(17).fill('calm')}, 'quality_ids');
invalid({...recipe(), qualityIds: [null]}, 'unknown_quality');
invalid({...recipe(), oils: []}, 'oil_count');
invalid({...recipe(), oils: [{id: 'alpha', percent: 100}, ,]}, 'oil_shape');
invalid({...recipe(), qualityIds: [,]}, 'quality_ids');
assert.throws(() => engine.normalizePercentages([,]), engine.BlendValidationError);
invalid({...recipe(), oils: fixture().oils.map(oil => ({id: oil.id, percent: 10}))}, 'oil_count');
invalid({...recipe(), oils: [{id: 'alpha', percent: 50}, {id: 'alpha', percent: 50}]}, 'duplicate_oil');
invalid({...recipe(), oils: [{id: 'not-a-real-oil', percent: 100}]}, 'unknown_oil');
invalid({...recipe(), oils: [{id: '__proto__', percent: 100}]}, 'oil_id');
invalid({...recipe(), oils: [{id: 'alpha', percent: 99.99}]}, 'percentage_total');
invalid({...recipe(), oils: [{id: 'alpha', percent: 100, dermalMaxPercent: 100}]}, 'oil_shape');
for (const percent of [0, -1, 101, NaN, Infinity, -Infinity, '100', null, 99.999, {}, true]) {
  invalid({...recipe(), oils: [{id: 'alpha', percent}]}, 'oil_percentage');
}
{ const d = fixture(); d.oils[0].blend.enabled = false; invalid(recipe(), 'disabled_oil', d); }
{ const d = fixture(); d.oils[0].blend.enabled = 'true'; invalid(recipe(), 'disabled_oil', d); }
{ const d = fixture(); d.oils.push(copy(d.oils[0])); invalid(recipe(), 'catalog_invalid', d); }
{ const d = fixture(); d.blendBuilder.version = '2'; invalid(recipe(), 'catalog_invalid', d); }

// Share payloads are canonical, bounded, UTF-8-safe, and revalidated on import.
const unicode = {...recipe(), path: 'qualities', name: ' 夜の香り 🌿 café <blend> ', qualityIds: ['focus', 'calm']};
const before = copy(unicode);
const shared = engine.encodeRecipe(unicode, fixture());
assert.match(shared, /^[A-Za-z0-9_-]+$/);
assert.deepEqual(engine.decodeRecipe(shared, fixture()), {...unicode, name: unicode.name.trim(), qualityIds: ['calm', 'focus']});
assert.deepEqual(unicode, before, 'Engine must not mutate supplied recipes');
assert.equal(engine.encodeRecipe({...unicode, oils: unicode.oils.slice().reverse()}, fixture()), shared);
assert.equal(engine.encodeRecipe(engine.decodeRecipe(shared, fixture()), fixture()), shared);
// Oils-first cannot retain invisible selected qualities, including older links.
const staleOilsFirst = {...recipe(), qualityIds: ['focus', 'calm']};
assert.deepEqual(engine.validateRecipe(staleOilsFirst, fixture()).recipe.qualityIds, []);
assert.deepEqual(engine.decodeRecipe(encoded(staleOilsFirst), fixture()).qualityIds, []);
assert.deepEqual(JSON.parse(Buffer.from(engine.encodeRecipe(staleOilsFirst, fixture()), 'base64url').toString('utf8')).qualityIds, []);
const cleanCheckout = engine.checkoutPayload(staleOilsFirst, fixture());
assert.deepEqual(cleanCheckout.recipe.qualityIds, []);
assert.equal(cleanCheckout.items[0].properties['Purported qualities'], 'None selected');
assert.deepEqual(staleOilsFirst.qualityIds, ['focus', 'calm'], 'Canonicalization must not mutate input');
assert.equal(engine.validateRecipe({...recipe(), name: '🌿'.repeat(60)}, fixture()).valid, true);
for (const bad of ['', null, 2, 'a'.repeat(4097), 'a', 'a=', 'a+b/', '#blend=abc', 'ab', Buffer.from([0xff]).toString('base64url'), encoded(null), encoded({})]) {
  assert.throws(() => engine.decodeRecipe(bad, fixture()), engine.BlendValidationError, String(bad));
}
for (const value of [
  {...recipe(), oils: [{id: 'alpha', percent: 0}, {id: 'beta', percent: 100}]},
  {...recipe(), oils: [{id: 'unknown', percent: 100}]},
  {...recipe(), petContext: 'false'}, {...recipe(), v: 9}, {...recipe(), catalogVersion: 'old'},
  {...recipe(), extra: true}, {...recipe(), name: 'x'.repeat(5000)}
]) assert.throws(() => engine.decodeRecipe(encoded(value), fixture()), engine.BlendValidationError);
{ const d = fixture(); d.oils[0].blend.enabled = false; assert.throws(() => engine.decodeRecipe(shared, d), engine.BlendValidationError); }
// Works with no Buffer, TextEncoder, atob, btoa, or CommonJS in the browser.
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../blend-engine.js'), 'utf8'), context);
assert.ok(context.BLEND_ENGINE);
assert.equal(context.BLEND_ENGINE.encodeRecipe(unicode, fixture()), shared);
assert.equal(context.BLEND_ENGINE.decodeRecipe(shared, fixture()).name, unicode.name.trim());

// Finished-product concentration, never relative oil share, governs hard limits.
assert.equal(engine.evaluateSafety(recipe(), fixture()).canPurchase, true);
{
  const d = fixture(); d.oils[0].blend.dermalMaxPercent = 1;
  assert.equal(engine.evaluateSafety(recipe(), d).canPurchase, true, '50% of a 2% oil load equals the 1% dermal maximum');
  const r = {...recipe(), oils: [{id: 'alpha', percent: 50.01}, {id: 'beta', percent: 49.99}]};
  const result = blocked(d, 'dermal_limit_exceeded', r);
  const message = result.blockers.find(item => item.code === 'dermal_limit_exceeded').message;
  assert.match(message, /TEST-ONLY alpha/); assert.match(message, /1\.0002%/); assert.match(message, /1% dermal maximum/); assert.match(message, /TEST-ONLY synthetic safety review/);
  assert.deepEqual(result.blockers.find(item => item.code === 'dermal_limit_exceeded').source, source);
}
{
  const d = fixture(); d.blendBuilder.product.totalOilLoadPercent = 3.01;
  blocked(d, 'total_limit_exceeded');
  d.blendBuilder.product.totalOilLoadPercent = 3;
  assert.equal(engine.evaluateSafety(recipe(), d).canPurchase, true, 'Total hard-cap equality passes');
}
for (const field of ['totalOilLoadPercent', 'totalOilLoadSource']) {
  const d = fixture(); d.blendBuilder.product[field] = null; blocked(d, 'total_load_unknown');
}
for (const field of ['totalOilMaxPercent', 'totalOilMaxSource']) {
  const d = fixture(); d.blendBuilder.product[field] = null; blocked(d, 'total_limit_unknown');
}
for (const bad of ['2', false, NaN, Infinity, -1, 0, 101]) {
  const d = fixture(); d.blendBuilder.product.totalOilLoadPercent = bad; blocked(d, 'total_load_unknown');
}
for (const field of ['dermalMaxPercent', 'dermalMaxSource']) {
  const d = fixture(); d.oils[0].blend[field] = null; blocked(d, 'dermal_limit_unknown');
}
for (const badSource of ['unresolved-source', {label: 'No link'}, {label: 'Unsafe link', url: 'javascript:alert(1)'}, {label: '', url: 'https://example.test'}]) {
  const d = fixture(); d.oils[0].blend.dermalMaxSource = badSource; blocked(d, 'dermal_limit_unknown');
}
{ const d = fixture(); d.oils[0].blend.dermalMaxSource = 'test-only-source'; assert.equal(engine.evaluateSafety(recipe(), d).canPurchase, true); }
for (const availability of [null, 'unconfirmed', 'unavailable', true]) {
  const d = fixture(); d.oils[0].blend.availability = availability; blocked(d, 'oil_unavailable');
}
{ const d = fixture(); d.oils[0].blend.phototoxic = null; blocked(d, 'phototoxicity_unknown'); }
for (const status of [null, 'unverified', 'reviewed', true]) {
  const d = fixture(); d.oils[0].blend.safetyReviewStatus = status; blocked(d, 'safety_review_unapproved');
}
for (const hosts of [null, [], ['*'], ['https://shop.example.test'], ['shop.example.test:443'], ['shop.example.test/path'],
  ['.example.test'], ['-bad.example.test'], ['127.0.0.1'], ['shop.example.test', 'SHOP.example.test'], [,]]) {
  const d = fixture(); d.blendBuilder.product.checkoutAllowedHosts = hosts; blocked(d, 'checkout_hosts_missing');
}
for (const field of ['shopifyVariantId', 'checkoutEndpoint', 'serverValidationVerified']) {
  const d = fixture(); d.blendBuilder.product[field] = null;
  blocked(d, {shopifyVariantId: 'checkout_variant_missing', checkoutEndpoint: 'checkout_endpoint_missing', serverValidationVerified: 'server_validation_unverified'}[field]);
}
for (const endpoint of ['https://user:secret@example.test/checkout', 'javascript:alert(1)', '//example.test/checkout', 'http://example.test/checkout', '/\\example.test/checkout']) {
  const d = fixture(); d.blendBuilder.product.checkoutEndpoint = endpoint; blocked(d, 'checkout_endpoint_missing');
}
for (const variant of [0, -1, {}, true, '0', 'abc', Number.MAX_SAFE_INTEGER + 1]) {
  const d = fixture(); d.blendBuilder.product.shopifyVariantId = variant; blocked(d, 'checkout_variant_missing');
}
for (const [key, value] of [['price', 46], ['currency', 'CAD'], ['size', '4 oz'], ['name', 'Other product']]) {
  const d = fixture(); d.blendBuilder.product[key] = value; blocked(d, 'product_configuration');
}

// Warnings remain distinct from hard caps and show the source threshold.
{
  const d = fixture(); d.oils[0].blend.cautionThresholds = [{percent: 0.9, reason: 'TEST-ONLY caution reason.', source: copy(source)}];
  const result = engine.evaluateSafety(recipe(), d);
  assert.equal(result.canPurchase, true);
  const warning = result.warnings.find(row => row.code === 'caution_threshold_exceeded');
  assert.ok(warning); assert.match(warning.message, /0.9% caution threshold/); assert.deepEqual(warning.source, source);
  d.oils[0].blend.cautionThresholds[0].percent = 1;
  assert.ok(!codes(engine.evaluateSafety(recipe(), d).warnings).includes('caution_threshold_exceeded'));
  d.oils[0].blend.cautionThresholds[0].source = null; blocked(d, 'caution_data_invalid');
}
for (const field of ['cautionThresholds', 'interactions']) {
  const d = fixture(); d.oils[0].blend[field] = null;
  blocked(d, field === 'interactions' ? 'interaction_data_invalid' : 'caution_data_invalid');
}
{
  const d = fixture(); const interaction = {withOilId: 'beta', severity: 'warning', reason: 'TEST-ONLY combined risk.', source: copy(source)};
  d.oils[0].blend.interactions = [interaction];
  d.oils[1].blend.interactions = [{...interaction, withOilId: 'alpha'}];
  const result = engine.evaluateSafety(recipe(), d);
  assert.equal(result.canPurchase, true);
  assert.equal(result.warnings.filter(row => row.code === 'oil_interaction').length, 1, 'Mirrored interactions deduplicated');
  assert.match(result.warnings.find(row => row.code === 'oil_interaction').message, /TEST-ONLY alpha \+ TEST-ONLY beta/);
  d.oils[0].blend.interactions[0].severity = 'blocker'; blocked(d, 'oil_interaction');
  d.oils[0].blend.interactions[0].withOilId = 'gamma';
  assert.equal(engine.evaluateSafety(recipe(), d).canPurchase, true, 'Only selected pairs trigger interactions');
  d.oils[0].blend.interactions[0].withOilId = 'nonexistent'; blocked(d, 'interaction_data_invalid');
}
{
  const d = fixture(); d.oils[0].blend.phototoxic = true; d.oils[1].blend.phototoxic = true;
  d.oils[0].blend.sensitizationRisk = 'high'; d.oils[1].blend.sensitizationRisk = 'high';
  const result = engine.evaluateSafety(recipe(), d);
  assert.ok(codes(result.warnings).includes('combined_phototoxicity'));
  assert.ok(codes(result.warnings).includes('combined_sensitization'));
}
for (const petSafer of [null, false, 'true']) {
  const d = fixture(); d.oils[0].blend.petSafer = petSafer;
  assert.equal(engine.evaluateSafety(recipe(), d).canPurchase, true, 'Pet context is explicit');
  blocked(d, 'pet_context_blocked', {...recipe(), petContext: true});
}
{ const d = fixture(); d.oils[0].blend.petSource = null; blocked(d, 'pet_context_blocked', {...recipe(), petContext: true}); }
assert.equal(engine.evaluateSafety({...recipe(), petContext: true}, fixture()).canPurchase, true);

// Payload supports transparent fulfillment and declares its client-only trust.
const payload = engine.checkoutPayload(recipe(), fixture());
assert.equal(payload.endpoint, '/apps/test-only-blend/checkout');
assert.deepEqual(payload.expectedPrice, {amount: 45, currency: 'USD'});
assert.deepEqual(payload.validation, {mode: 'client-only', requiresServerValidation: true});
assert.equal(payload.items.length, 1); assert.equal(payload.items[0].id, '123456789'); assert.equal(payload.items[0].quantity, 1);
assert.match(payload.items[0].properties['Essential-oil shares'], /alpha.*50%/);
assert.match(payload.items[0].properties['Finished spray concentrations'], /alpha: 1%/);
assert.match(payload.items[0].properties['Product format'], /8 oz/);
assert.equal(payload.items[0].properties['Recipe code'], payload.encodedRecipe);
assert.deepEqual(engine.decodeRecipe(payload.encodedRecipe, fixture()), payload.recipe);
const immutableData = fixture(), immutableRecipe = recipe();
const savedData = copy(immutableData), savedRecipe = copy(immutableRecipe);
engine.evaluateSafety(immutableRecipe, immutableData); engine.checkoutPayload(immutableRecipe, immutableData);
assert.deepEqual(immutableData, savedData); assert.deepEqual(immutableRecipe, savedRecipe);

// Current production research gaps must never become a purchasable blend.
const realContext = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../data.js'), 'utf8') + '\nthis.data = TERPENE_DATA;', realContext);
if (realContext.data.blendBuilder) {
  const data = realContext.data;
  const oil = data.oils.find(row => row.blend && row.blend.enabled === true);
  assert.ok(oil, 'Starter catalog contains enabled essential oils');
  const realRecipe = {...recipe(), catalogVersion: data.blendBuilder.catalogVersion, oils: [{id: oil.id, percent: 100}]};
  assert.equal(engine.validateRecipe(realRecipe, data).valid, true);
  blocked(data, 'total_load_unknown', realRecipe);
  assert.equal(data.blendBuilder.product.totalOilLoadPercent, null);
  assert.equal(data.blendBuilder.product.serverValidationVerified, false);
}
console.log('PASS: blend normalization, strict validation, Unicode sharing, fail-closed finished-product safety, pet context, interactions and client-only checkout payload');
