/* ALL numeric safety limits and Shopify settings in fixture() are synthetic,
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
      product: {name: 'Custom Blend', price: 40, currency: 'USD', size: '8 oz',
        totalOilLoadPercent: 2, totalOilLoadSource: copy(source),
        totalOilMaxPercent: 3, totalOilMaxSource: copy(source),
        shopifyStoreUrl: 'https://test-only.myshopify.com', shopifyVariantId: '123456789', baseVersion: null}
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
  assert.equal(engine.evaluateSafety(value, data).requiresReview, true);
  assert.ok(codes(engine.evaluateSafety(value, data).blockers).includes(code));
  assert.throws(() => engine.encodeRecipe(value, data), engine.BlendValidationError);
  assert.throws(() => engine.cartPermalink(value, data), engine.BlendValidationError);
}
function blocked(data, code, value = recipe()) {
  const result = engine.evaluateSafety(value, data);
  assert.equal(result.requiresReview, true, code);
  assert.equal(Object.hasOwn(result, 'canPurchase'), false);
  assert.ok(codes(result.blockers).includes(code), JSON.stringify(result));
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
for (const key of Object.keys(recipe())) {
  const missing = recipe(); delete missing[key]; invalid(missing, 'recipe_shape');
}
invalid({...recipe(), v: '1'}, 'recipe_version');
invalid({...recipe(), v: 2}, 'recipe_version');
invalid({...recipe(), catalogVersion: 'old'}, 'catalog_version');
invalid({...recipe(), path: 'surprise'}, 'recipe_path');
invalid({...recipe(), petContext: 'false'}, 'pet_context');
invalid({...recipe(), name: 'a'.repeat(61)}, 'recipe_name');
invalid({...recipe(), name: '🌿'.repeat(61)}, 'recipe_name');
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
const cleanCheckout = engine.cartPermalink(staleOilsFirst, fixture());
assert.deepEqual(cleanCheckout.recipe.qualityIds, []);
assert.doesNotMatch(cleanCheckout.properties.Recipe, /Purported qualities|None selected/);
assert.deepEqual(staleOilsFirst.qualityIds, ['focus', 'calm'], 'Canonicalization must not mutate input');
// Shared v1 recipes survive the canonical topic migration without hidden aliases.
{
  const d = fixture();
  d.taxonomy = {version: 1, nodes: [{id: 'health-mental-health'}, {id: 'health-cognitive'}],
    aliases: {calm: 'health-mental-health', focus: 'health-cognitive', invalid: 'missing'}};
  const old = {...recipe(), path: 'qualities', qualityIds: ['calm', 'focus', 'health-mental-health']};
  const original = copy(old);
  const canonical = ['health-cognitive', 'health-mental-health'];
  assert.equal(engine.resolveQualityId('calm', d), 'health-mental-health');
  assert.equal(engine.resolveQualityId('invalid', d), null);
  assert.equal(engine.resolveQualityId('__proto__', d), null);
  assert.deepEqual(engine.validateRecipe(old, d).recipe.qualityIds, canonical);
  assert.deepEqual(engine.decodeRecipe(encoded(old), d).qualityIds, canonical);
  const code = engine.encodeRecipe(old, d);
  assert.deepEqual(JSON.parse(Buffer.from(code, 'base64url').toString('utf8')).qualityIds, canonical);
  assert.equal(engine.encodeRecipe(engine.decodeRecipe(code, d), d), code);
  assert.deepEqual(engine.cartPermalink(old, d).recipe.qualityIds, canonical);
  assert.deepEqual(engine.decodeRecipe(encoded({...old, path: 'oils'}), d).qualityIds, []);
  assert.deepEqual(old, original);
  invalid({...old, qualityIds: ['missing']}, 'unknown_quality', d);
  invalid({...old, qualityIds: ['calm', 'calm']}, 'duplicate_quality', d);
}
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
assert.equal(engine.evaluateSafety(recipe(), fixture()).blockers.length, 0);
// A sourced zero hard maximum prohibits any positive finished-product amount.
for (const kind of ['dermal', 'total']) {
  for (const load of [2, 1e-12, Number.MIN_VALUE]) {
    const d = fixture(); d.blendBuilder.product.totalOilLoadPercent = load;
    if (kind === 'dermal') d.oils[0].blend.dermalMaxPercent = 0;
    else d.blendBuilder.product.totalOilMaxPercent = 0;
    const value = {...recipe(), oils: [{id: 'alpha', percent: 0.01}, {id: 'beta', percent: 99.99}]};
    const code = kind + '_limit_exceeded';
    const result = blocked(d, code, value);
    assert.ok(!codes(result.blockers).includes(kind + '_limit_unknown'));
    const finding = result.blockers.find(item => item.code === code);
    assert.deepEqual(finding.source, source);
    assert.match(finding.message, kind === 'dermal' ? /is present in the finished spray, above its 0% dermal maximum/ : /contains essential oils, above the 0% total limit/);
    permalinkInvalid(d, code, value);
  }
  for (const load of [0, null, NaN, '2']) {
    const d = fixture(); d.blendBuilder.product.totalOilLoadPercent = load;
    if (kind === 'dermal') d.oils[0].blend.dermalMaxPercent = 0;
    else d.blendBuilder.product.totalOilMaxPercent = 0;
    const result = blocked(d, 'total_load_unknown');
    assert.ok(!codes(result.blockers).includes(kind + '_limit_exceeded'));
    assert.ok(engine.cartPermalink(recipe(), d).url, 'Unknown loads cannot establish a zero-cap violation');
  }
  const d = fixture();
  if (kind === 'dermal') d.oils[0].blend.dermalMaxPercent = 1 - 5e-11;
  else d.blendBuilder.product.totalOilMaxPercent = 2 - 5e-11;
  assert.equal(engine.evaluateSafety(recipe(), d).blockers.length, 0, 'Positive-cap comparison tolerance remains unchanged');
}
// Hard maxima are nonnegative numbers with resolved sources, not coerced values.
for (const kind of ['dermal', 'total']) {
  for (const bad of [-1, -Infinity, Infinity, NaN, '0', '2', false, null, undefined, 101]) {
    const d = fixture();
    if (kind === 'dermal') d.oils[0].blend.dermalMaxPercent = bad;
    else d.blendBuilder.product.totalOilMaxPercent = bad;
    const result = blocked(d, kind + '_limit_unknown');
    assert.ok(!codes(result.blockers).includes(kind + '_limit_exceeded'));
    assert.ok(engine.cartPermalink(recipe(), d).url, 'An invalid hard cap stays a manual-review finding');
  }
  for (const badSource of [null, 'unresolved-source', {label: 'No link'}]) {
    const d = fixture();
    if (kind === 'dermal') Object.assign(d.oils[0].blend, {dermalMaxPercent: 0, dermalMaxSource: badSource});
    else Object.assign(d.blendBuilder.product, {totalOilMaxPercent: 0, totalOilMaxSource: badSource});
    const result = blocked(d, kind + '_limit_unknown');
    assert.ok(!codes(result.blockers).includes(kind + '_limit_exceeded'));
    assert.ok(engine.cartPermalink(recipe(), d).url, 'An unsourced zero cap stays a manual-review finding');
  }
}
{
  const d = fixture(); d.oils[0].blend.dermalMaxPercent = 1;
  assert.equal(engine.evaluateSafety(recipe(), d).blockers.length, 0, '50% of a 2% oil load equals the 1% dermal maximum');
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
  assert.equal(engine.evaluateSafety(recipe(), d).blockers.length, 0, 'Total hard-cap equality passes');
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
{ const d = fixture(); d.oils[0].blend.dermalMaxSource = 'test-only-source'; assert.equal(engine.evaluateSafety(recipe(), d).blockers.length, 0); }
for (const availability of [null, 'unconfirmed', 'unavailable', true]) {
  const d = fixture(); d.oils[0].blend.availability = availability;
  assert.equal(engine.evaluateSafety(recipe(), d).blockers.length, 0, 'Stock is not a scientific finding');
  assert.ok(engine.cartPermalink(recipe(), d).url, 'Shopify handles actual product availability');
}
{ const d = fixture(); d.oils[0].blend.phototoxic = null; blocked(d, 'phototoxicity_unknown'); }
for (const status of [null, 'unverified', 'reviewed', true]) {
  const d = fixture(); d.oils[0].blend.safetyReviewStatus = status; blocked(d, 'safety_review_unapproved');
}
// Warnings remain distinct from hard caps and show the source threshold.
{
  const d = fixture(); d.oils[0].blend.cautionThresholds = [{percent: 0.9, reason: 'TEST-ONLY caution reason.', source: copy(source)}];
  const result = engine.evaluateSafety(recipe(), d);
  assert.equal(result.blockers.length, 0);
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
  assert.equal(result.blockers.length, 0);
  assert.equal(result.warnings.filter(row => row.code === 'oil_interaction').length, 1, 'Mirrored interactions deduplicated');
  assert.match(result.warnings.find(row => row.code === 'oil_interaction').message, /TEST-ONLY alpha \+ TEST-ONLY beta/);
  d.oils[0].blend.interactions[0].severity = 'blocker'; blocked(d, 'oil_interaction');
  d.oils[0].blend.interactions[0].withOilId = 'gamma';
  assert.equal(engine.evaluateSafety(recipe(), d).blockers.length, 0, 'Only selected pairs trigger interactions');
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
  assert.equal(engine.evaluateSafety(recipe(), d).blockers.length, 0, 'Pet context is explicit');
  blocked(d, 'pet_context_blocked', {...recipe(), petContext: true});
}
{ const d = fixture(); d.oils[0].blend.petSource = null; blocked(d, 'pet_context_blocked', {...recipe(), petContext: true}); }
assert.equal(engine.evaluateSafety({...recipe(), petContext: true}, fixture()).blockers.length, 0);

// A cart permalink has exactly one readable property and no client price override.
const payload = engine.cartPermalink(recipe(), fixture());
const url = new URL(payload.url);
assert.equal(url.origin, 'https://test-only.myshopify.com');
assert.equal(url.pathname, '/cart/123456789:1');
assert.deepEqual([...url.searchParams.keys()], ['properties']);
assert.match(url.searchParams.get('properties'), /^[A-Za-z0-9_-]+$/);
const properties = JSON.parse(Buffer.from(url.searchParams.get('properties'), 'base64url').toString('utf8'));
assert.deepEqual(properties, payload.properties);
assert.deepEqual(Object.keys(properties), ['Recipe']);
assert.match(properties.Recipe, /Name: Test-only recipe/);
assert.match(properties.Recipe, /Recipe schema: v1; catalog: 2026-10-18/);
assert.match(properties.Recipe, /Oil mixture \(relative portions, total 100%\): TEST-ONLY alpha \[alpha\] 50%; TEST-ONLY beta \[beta\] 50%/);
assert.match(properties.Recipe, /Product: Custom Blend, standard 8 oz/);
assert.match(properties.Recipe, /Manual formulation review required before fulfillment/);
assert.match(properties.Recipe, /not finished-product concentrations/);
assert.match(properties.Recipe, new RegExp('Recipe code: ' + payload.encodedRecipe + '$'));
assert.doesNotMatch(properties.Recipe, /Base version|Purported qualities|approved|safe|Finished spray concentrations|Finished spray oil load/);
assert.deepEqual(engine.decodeRecipe(payload.encodedRecipe, fixture()), payload.recipe);
assert.equal(engine.checkoutPayload, undefined, 'No obsolete backend payload API');
assert.equal(Object.hasOwn(payload, 'expectedPrice'), false);
assert.equal(Object.hasOwn(payload, 'endpoint'), false);
assert.equal(Object.hasOwn(engine.evaluateSafety(recipe(), fixture()), 'canPurchase'), false);
assert.equal(engine.evaluateSafety(recipe(), fixture()).requiresReview, true, 'Every formulation needs manual review');
assert.equal(context.BLEND_ENGINE.cartPermalink(recipe(), fixture()).url, payload.url, 'Pure browser implementation needs no URL/Buffer APIs');

// Unicode and URL punctuation round-trip inside one UTF-8 base64url JSON property.
{
  const d = fixture(); d.oils[0].name = '夜の香り 🌿 & café + 50% / <oil> #=';
  const value = {...unicode, name: '🌿'.repeat(60), petContext: true};
  const result = engine.cartPermalink(value, d);
  const href = new URL(result.url);
  assert.equal(href.searchParams.size, 1);
  const recovered = JSON.parse(Buffer.from(href.searchParams.get('properties'), 'base64url').toString('utf8'));
  assert.deepEqual(recovered, result.properties);
  assert.ok(recovered.Recipe.includes(d.oils[0].name + ' [alpha] 50%'));
  assert.ok(recovered.Recipe.includes(value.name));
  assert.match(recovered.Recipe, /Customer context: pets may be present/);
  assert.doesNotMatch(recovered.Recipe, /pet-safe|pet-safer|Purported qualities/);
  assert.deepEqual(engine.decodeRecipe(result.encodedRecipe, d), engine.validateRecipe(value, d).recipe);
  assert.equal(context.BLEND_ENGINE.cartPermalink(value, d).url, result.url);
}
const decimals = {...recipe(), oils: [{id: 'alpha', percent: 33.34}, {id: 'beta', percent: 33.33}, {id: 'gamma', percent: 33.33}]};
assert.match(engine.cartPermalink(decimals, fixture()).properties.Recipe, /\[alpha\] 33.34%/);
const five = {...recipe(), oils: fixture().oils.slice(0, 5).map(oil => ({id: oil.id, percent: 20}))};
assert.equal(engine.cartPermalink(five, fixture()).recipe.oils.length, 5);
assert.match(engine.cartPermalink({...recipe(), name: '   '}, fixture()).properties.Recipe, /^Name: Custom Blend\n/);

// Product and destination configuration are trusted separately from recipe input.
function permalinkInvalid(data, code, value = recipe()) {
  assert.throws(() => engine.cartPermalink(value, data), error =>
    error instanceof engine.BlendValidationError && codes(error.errors).includes(code), code);
}
for (const field of ['shopifyStoreUrl', 'shopifyVariantId']) {
  for (const missing of [undefined, null, '']) {
    const d = fixture(); d.blendBuilder.product[field] = missing;
    permalinkInvalid(d, field === 'shopifyStoreUrl' ? 'checkout_store_missing' : 'checkout_variant_missing');
    assert.equal(engine.evaluateSafety(recipe(), d).blockers.length, 0, 'Checkout configuration is not scientific safety');
  }
}
for (const store of [false, {}, [], 'http://test-only.myshopify.com', '//test-only.myshopify.com',
  'https://user:password@test-only.myshopify.com', 'https://test-only.myshopify.com@evil.example',
  'https://test-only.myshopify.com:443', 'https://test-only.myshopify.com:8443',
  'https://test-only.myshopify.com/cart', 'https://test-only.myshopify.com//',
  'https://test-only.myshopify.com?foo=1', 'https://test-only.myshopify.com/?foo=1',
  'https://test-only.myshopify.com#x', 'https://test-only.myshopify.com/#x',
  'https://test-only.myshopify.com\n', ' https://test-only.myshopify.com',
  'https://test-only.myshopify.com ', 'https://test-only.myshopify.com\\@evil.example',
  'https://test-only.myshopify.com%2f.evil.example', 'https://test-only..myshopify.com',
  'https://-bad.myshopify.com', 'https://bad-.myshopify.com', 'https://shop.myshopify.com.',
  'https://127.0.0.1', 'https://127.1', 'https://0x7f.0x1', 'https://2130706433',
  'https://[::1]', 'https://localhost', 'javascript:alert(1)',
  'https://' + 'a'.repeat(64) + '.myshopify.com', 'https://' + ('a'.repeat(63) + '.').repeat(4) + 'com']) {
  const d = fixture(); d.blendBuilder.product.shopifyStoreUrl = store;
  permalinkInvalid(d, 'checkout_store_missing');
}
for (const store of ['https://test-only.myshopify.com/', 'HTTPS://TEST-ONLY.MYSHOPIFY.COM', 'https://merchant.blend-fixture.test', 'https://xn--caf-dma.example']) {
  const d = fixture(); d.blendBuilder.product.shopifyStoreUrl = store;
  assert.equal(new URL(engine.cartPermalink(recipe(), d).url).origin, new URL(store).origin);
}
for (const variant of [0, -1, {}, [], true, '0', '00123', 'abc', 'gid://shopify/ProductVariant/123',
  '123:2', '123,456:1', '123?x=1', '123#x', '123\n', ' 123', '123 ', '+123', '-123', '1e3', '0x123', 1n,
  '1'.repeat(21), NaN, Infinity, 1.2, Number.MAX_SAFE_INTEGER + 1]) {
  const d = fixture(); d.blendBuilder.product.shopifyVariantId = variant;
  permalinkInvalid(d, 'checkout_variant_missing');
}
for (const variant of [1, 123456789, Number.MAX_SAFE_INTEGER, '12345678901234567890']) {
  const d = fixture(); d.blendBuilder.product.shopifyVariantId = variant;
  assert.equal(new URL(engine.cartPermalink(recipe(), d).url).pathname, '/cart/' + variant + ':1');
}
for (const [key, value] of [['price', 45], ['price', '40'], ['price', null], ['currency', 'CAD'], ['size', '4 oz'], ['name', 'Other product']]) {
  const d = fixture(); d.blendBuilder.product[key] = value;
  permalinkInvalid(d, 'product_configuration');
  assert.equal(engine.evaluateSafety(recipe(), d).blockers.length, 0);
}
{ const d = fixture(); delete d.blendBuilder.product; permalinkInvalid(d, 'product_configuration'); }
{ const d = fixture(); d.blendBuilder.product = null; permalinkInvalid(d, 'product_configuration'); }
for (const field of ['shopifyStoreUrl', 'shopifyVariantId', 'baseVersion', 'price', 'quantity', 'properties', 'requiresReview', 'canPurchase']) {
  invalid({...recipe(), [field]: 'forged'}, 'recipe_shape');
  assert.throws(() => engine.decodeRecipe(encoded({...recipe(), [field]: 'forged'}), fixture()), engine.BlendValidationError);
}
for (const base of [undefined, null]) {
  const d = fixture(); d.blendBuilder.product.baseVersion = base;
  assert.doesNotMatch(engine.cartPermalink(recipe(), d).properties.Recipe, /Base version/);
}
{
  const d = fixture(); d.blendBuilder.product.baseVersion = ' Test-only base α / v2 ';
  assert.match(engine.cartPermalink(recipe(), d).properties.Recipe, /Base version: Test-only base α \/ v2/);
}
for (const base of [false, 1, {}, '', ' ', 'x'.repeat(121), 'base\nversion']) {
  const d = fixture(); d.blendBuilder.product.baseVersion = base;
  permalinkInvalid(d, 'product_configuration');
}

// Missing research and stock data do not masquerade as an automated approval gate.
{
  const d = fixture();
  for (const field of ['totalOilLoadPercent', 'totalOilLoadSource', 'totalOilMaxPercent', 'totalOilMaxSource']) d.blendBuilder.product[field] = null;
  for (const oil of d.oils) Object.assign(oil.blend, {availability: 'unconfirmed', safetyReviewStatus: 'unverified',
    dermalMaxPercent: null, dermalMaxSource: null, phototoxic: null, petSafer: null, petSource: null,
    cautionThresholds: null, interactions: null});
  const value = {...recipe(), petContext: true};
  const findings = engine.evaluateSafety(value, d);
  assert.equal(findings.requiresReview, true); assert.ok(findings.blockers.length > 0);
  assert.ok(engine.cartPermalink(value, d).url);
}
// Known, sourced total/dermal caps and blocking interactions remain enforced.
{
  const d = fixture(); d.blendBuilder.product.totalOilLoadPercent = 3.01;
  permalinkInvalid(d, 'total_limit_exceeded');
  d.blendBuilder.product.totalOilLoadSource = null;
  assert.ok(engine.cartPermalink(recipe(), d).url, 'An unsourced load cannot establish a numeric violation');
}
{
  const d = fixture(); d.oils[0].blend.dermalMaxPercent = 0.99;
  permalinkInvalid(d, 'dermal_limit_exceeded');
  d.oils[0].blend.dermalMaxSource = null;
  assert.ok(engine.cartPermalink(recipe(), d).url, 'An unsourced cap is an unknown review finding');
}
{
  const d = fixture(); d.oils[0].blend.interactions = [{withOilId: 'beta', severity: 'blocker', reason: 'TEST-ONLY blocking interaction.', source: copy(source)}];
  permalinkInvalid(d, 'oil_interaction');
  d.oils[0].blend.interactions[0].severity = 'warning';
  assert.ok(engine.cartPermalink(recipe(), d).url, 'Warnings do not reject manual-review requests');
}
const immutableData = fixture(), immutableRecipe = recipe();
const savedData = copy(immutableData), savedRecipe = copy(immutableRecipe);
engine.evaluateSafety(immutableRecipe, immutableData); engine.cartPermalink(immutableRecipe, immutableData);
assert.deepEqual(immutableData, savedData); assert.deepEqual(immutableRecipe, savedRecipe);

// The production origin is verified, but no Custom Blend variant is invented.
const realContext = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../data.js'), 'utf8') + '\nthis.data = TERPENE_DATA;', realContext);
const data = realContext.data;
assert.ok(data.blendBuilder, 'Production blend configuration exists');
const oil = data.oils.find(row => row.blend && row.blend.enabled === true);
assert.ok(oil, 'Starter catalog contains enabled essential oils');
const realRecipe = {...recipe(), catalogVersion: data.blendBuilder.catalogVersion, oils: [{id: oil.id, percent: 100}]};
assert.equal(engine.validateRecipe(realRecipe, data).valid, true);
assert.equal(data.blendBuilder.product.price, 40);
assert.equal(data.blendBuilder.product.shopifyStoreUrl, 'https://sunnysshield.com');
assert.equal(data.blendBuilder.product.shopifyVariantId, null);
assert.equal(data.blendBuilder.product.baseVersion, null);
assert.equal(data.blendBuilder.product.totalOilLoadPercent, null);
for (const obsolete of ['checkoutEndpoint', 'checkoutAllowedHosts', 'serverValidationVerified']) assert.equal(Object.hasOwn(data.blendBuilder.product, obsolete), false);
blocked(data, 'total_load_unknown', realRecipe);
permalinkInvalid(data, 'checkout_variant_missing', realRecipe);
console.log('PASS: strict recipes, deterministic normalization, Unicode sharing, safe single-property Shopify cart permalinks, manual review and separate sourced scientific limits');
