/*
 * Pure custom-blend validation. No DOM, network, or checkout side effects.
 * Browser: window.BLEND_ENGINE. Node: require('./blend-engine.js').
 *
 * Recipe v1 contains ONLY v, catalogVersion, name, path, qualityIds,
 * petContext, and oils [{id, percent}]. Percent is the relative share of the
 * essential-oil portion, with up to two decimal places. It is NOT the finished
 * spray concentration. Names are at most 60 Unicode code points.
 *
 * Source: {label, url: 'https://...'}, or an ID in data.sources.
 * cautionThresholds: [{percent, reason, source}] where percent is a
 * finished-product concentration, distinct from the hard dermal maximum.
 * interactions: [{withOilId, severity: 'warning'|'blocker', reason, source}].
 * Optional sensitizationRisk: 'high' enables an explicitly labeled combination
 * warning; free-form sensitizationNotes are never interpreted as numeric data.
 * Review findings are descriptive, not an automatic safety certification.
 * A manual formulation review is required for every custom blend.
 *
 * validateRecipe -> {valid, errors, recipe: canonicalRecipe|null}.
 * encodeRecipe / decodeRecipe / normalizePercentages / cartPermalink throw
 * BlendValidationError (with .errors) on invalid input.
 * evaluateSafety -> {requiresReview: true, blockers, warnings}.
 * cartPermalink -> {url, recipe, properties: {Recipe: string}, encodedRecipe}.
 * Product/store/variant come only from the trusted catalog configuration, never
 * the recipe. Shopify sets the real variant price and checks its availability.
 * The encoded recipe is editable customer input, not signed manufacturing
 * approval. No backend, authentication, tokens, or network calls are required.
 */
(function (root, factory) {
  'use strict';
  var engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  if (root) root.BLEND_ENGINE = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var MAX_OILS = 5;
  var MAX_NAME_LENGTH = 60;
  var MAX_ENCODED_LENGTH = 4096;
  var MAX_JSON_BYTES = 3072;
  var RECIPE_KEYS = ['v', 'catalogVersion', 'name', 'path', 'qualityIds', 'petContext', 'oils'];
  var ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
  var own = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };
  var object = function (value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) &&
      Object.prototype.toString.call(value) === '[object Object]';
  };
  var text = function (value) { return typeof value === 'string' && value.trim().length > 0; };
  var dense = function (value) {
    return Array.isArray(value) && Array.from({length: value.length}, function (_, index) { return own(value, index); }).every(Boolean);
  };
  var validPercent = function (value) {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 100;
  };
  var validSafetyMaximum = function (value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
  };
  var basisPoints = function (value) {
    if (!validPercent(value)) return null;
    var points = Math.round(value * 100);
    return points > 0 && Math.abs(value * 100 - points) < 1e-8 ? points : null;
  };
  var issue = function (code, message, extras) {
    return Object.assign({code: code, message: message}, extras || {});
  };
  function BlendValidationError(errors) {
    this.name = 'BlendValidationError';
    this.message = errors.map(function (error) { return error.message; }).join(' ');
    this.errors = errors;
    if (Error.captureStackTrace) Error.captureStackTrace(this, BlendValidationError);
  }
  BlendValidationError.prototype = Object.create(Error.prototype);
  BlendValidationError.prototype.constructor = BlendValidationError;
  var fail = function (code, message) { throw new BlendValidationError([issue(code, message)]); };
  function exactKeys(value, keys) {
    return object(value) && Object.keys(value).length === keys.length &&
      keys.every(function (key) { return own(value, key); });
  }
  function entriesErrors(entries) {
    var errors = [];
    if (!Array.isArray(entries) || entries.length < 1 || entries.length > MAX_OILS) {
      return [issue('oil_count', 'Choose between one and five essential oils.')];
    }
    if (!dense(entries)) return [issue('oil_shape', 'Every selected oil must contain an ID and percentage.')];
    var seen = new Set();
    entries.forEach(function (entry) {
      if (!exactKeys(entry, ['id', 'percent'])) {
        errors.push(issue('oil_shape', 'Each oil must contain only an ID and percentage.'));
        return;
      }
      if (typeof entry.id !== 'string' || !ID_PATTERN.test(entry.id)) {
        errors.push(issue('oil_id', 'An essential-oil ID is malformed.'));
      } else if (seen.has(entry.id)) {
        errors.push(issue('duplicate_oil', 'An essential oil can appear only once.', {oilIds: [entry.id]}));
      }
      seen.add(entry.id);
      if (basisPoints(entry.percent) === null) {
        errors.push(issue('oil_percentage', 'Every oil share must be greater than 0 and at most 100, with up to two decimal places.',
          typeof entry.id === 'string' ? {oilIds: [entry.id]} : {}));
      }
    });
    return errors;
  }

  function normalizePercentages(entries) {
    var errors = entriesErrors(entries);
    if (errors.length) throw new BlendValidationError(errors);
    var total = entries.reduce(function (sum, entry) { return sum + basisPoints(entry.percent); }, 0);
    var rows = entries.map(function (entry, index) {
      var scaled = basisPoints(entry.percent) * 10000 / total;
      return {id: entry.id, index: index, points: Math.floor(scaled), remainder: scaled - Math.floor(scaled)};
    });
    var remaining = 10000 - rows.reduce(function (sum, row) { return sum + row.points; }, 0);
    var ranked = rows.slice().sort(function (a, b) {
      return b.remainder - a.remainder || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    });
    for (var i = 0; i < remaining; i += 1) ranked[i].points += 1;
    if (rows.some(function (row) { return row.points === 0; })) {
      fail('normalization_precision', 'An oil would round to 0%. Increase its share or remove it before normalizing.');
    }
    return rows.map(function (row) { return {id: row.id, percent: row.points / 100}; });
  }

  function catalogInfo(data) {
    var topicRows = object(data) && object(data.taxonomy) ? data.taxonomy.nodes :
      object(data) && object(data.blendBuilder) ? data.blendBuilder.qualities : null;
    if (!object(data) || !object(data.blendBuilder) || data.blendBuilder.version !== '1' ||
        !text(data.blendBuilder.catalogVersion) || !Array.isArray(data.oils) ||
        !Array.isArray(topicRows) || !dense(data.oils) || !dense(topicRows)) return null;
    var oils = new Map();
    var qualities = new Set();
    var qualityAliases = new Map();
    var invalid = false;
    data.oils.forEach(function (oil) {
      if (!object(oil) || typeof oil.id !== 'string' || !ID_PATTERN.test(oil.id) || oils.has(oil.id)) invalid = true;
      else oils.set(oil.id, oil);
    });
    topicRows.forEach(function (quality) {
      if (!object(quality) || typeof quality.id !== 'string' || !ID_PATTERN.test(quality.id) || qualities.has(quality.id)) invalid = true;
      else { qualities.add(quality.id); qualityAliases.set(quality.id, quality.id); }
    });
    if (object(data.taxonomy) && object(data.taxonomy.aliases)) {
      Object.keys(data.taxonomy.aliases).forEach(function (alias) {
        var target = data.taxonomy.aliases[alias];
        if (ID_PATTERN.test(alias) && qualities.has(target)) qualityAliases.set(alias, target);
      });
    }
    return invalid ? null : {config: data.blendBuilder, oils: oils, qualities: qualities, qualityAliases: qualityAliases};
  }
  function resolveQualityId(id, data) {
    var catalog = catalogInfo(data);
    return catalog && typeof id === 'string' && ID_PATTERN.test(id) ? catalog.qualityAliases.get(id) || null : null;
  }
  function validateRecipe(recipe, data) {
    var errors = [];
    var catalog = catalogInfo(data);
    if (!catalog) errors.push(issue('catalog_invalid', 'The blend catalog is missing, malformed, or uses an unsupported version.'));
    if (!exactKeys(recipe, RECIPE_KEYS)) {
      errors.push(issue('recipe_shape', 'The recipe has missing or unexpected fields.'));
      return {valid: false, errors: errors, recipe: null};
    }
    if (recipe.v !== 1) errors.push(issue('recipe_version', 'This recipe version is not supported.'));
    if (typeof recipe.catalogVersion !== 'string' || !catalog || recipe.catalogVersion !== catalog.config.catalogVersion) {
      errors.push(issue('catalog_version', 'This recipe uses a different catalog version. Rebuild it with the current catalog before continuing.'));
    }
    var nameValid = typeof recipe.name === 'string' && Array.from(recipe.name).length <= MAX_NAME_LENGTH &&
      !/[\u0000-\u001f\u007f]/.test(recipe.name);
    if (nameValid) {
      try { encodeURIComponent(recipe.name); } catch (_) { nameValid = false; }
    }
    if (!nameValid) errors.push(issue('recipe_name', 'Use a blend name of at most 60 characters without control characters.'));
    if (recipe.path !== 'qualities' && recipe.path !== 'oils') errors.push(issue('recipe_path', 'Choose the qualities or oils starting path.'));
    if (typeof recipe.petContext !== 'boolean') errors.push(issue('pet_context', 'Pet context must be true or false.'));
    if (!Array.isArray(recipe.qualityIds) || recipe.qualityIds.length > 16 || !dense(recipe.qualityIds)) {
      errors.push(issue('quality_ids', 'The selected qualities must be a short list of catalog IDs.'));
    } else {
      var seen = new Set();
      recipe.qualityIds.forEach(function (id) {
        if (typeof id !== 'string' || !ID_PATTERN.test(id) || !catalog || !catalog.qualityAliases.has(id)) {
          errors.push(issue('unknown_quality', 'A selected research topic is not in the current catalog.'));
        } else if (seen.has(id)) errors.push(issue('duplicate_quality', 'A quality can be selected only once.'));
        seen.add(id);
      });
    }
    var oilErrors = entriesErrors(recipe.oils);
    errors = errors.concat(oilErrors);
    if (!oilErrors.length) {
      var total = recipe.oils.reduce(function (sum, entry) { return sum + basisPoints(entry.percent); }, 0);
      if (total !== 10000) errors.push(issue('percentage_total', 'Essential-oil shares must total exactly 100%.'));
      recipe.oils.forEach(function (entry) {
        var oil = catalog && catalog.oils.get(entry.id);
        if (!oil) errors.push(issue('unknown_oil', 'An essential oil is not in the current catalog.', {oilIds: [entry.id]}));
        else if (!object(oil.blend) || oil.blend.enabled !== true) {
          errors.push(issue('disabled_oil', (oil.name || entry.id) + ' is not enabled for custom blends.', {oilIds: [entry.id]}));
        }
      });
    }
    if (errors.length) return {valid: false, errors: errors, recipe: null};
    var canonical = {
      v: 1, catalogVersion: catalog.config.catalogVersion, name: recipe.name.trim(), path: recipe.path,
      // Normalize older oils-first drafts/links without retaining invisible qualities.
      qualityIds: recipe.path === 'oils' ? [] : Array.from(new Set(recipe.qualityIds.map(function (id) { return catalog.qualityAliases.get(id); }))).sort(), petContext: recipe.petContext,
      oils: recipe.oils.map(function (entry) { return {id: entry.id, percent: basisPoints(entry.percent) / 100}; })
        .sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; })
    };
    return {valid: true, errors: [], recipe: canonical};
  }

  function utf8Bytes(value) {
    var encoded = encodeURIComponent(value);
    var bytes = [];
    for (var i = 0; i < encoded.length; i += 1) {
      if (encoded[i] === '%') { bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16)); i += 2; }
      else bytes.push(encoded.charCodeAt(i));
    }
    return bytes;
  }
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function base64Encode(bytes) {
    var result = '';
    for (var i = 0; i < bytes.length; i += 3) {
      var n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0);
      result += alphabet[(n >>> 18) & 63] + alphabet[(n >>> 12) & 63];
      if (i + 1 < bytes.length) result += alphabet[(n >>> 6) & 63];
      if (i + 2 < bytes.length) result += alphabet[n & 63];
    }
    return result;
  }
  function base64Decode(value) {
    var bytes = [];
    var bits = 0;
    var accumulator = 0;
    for (var i = 0; i < value.length; i += 1) {
      accumulator = (accumulator << 6) | alphabet.indexOf(value[i]);
      bits += 6;
      if (bits >= 8) { bits -= 8; bytes.push((accumulator >>> bits) & 255); }
    }
    // Reject noncanonical trailing bits rather than silently changing payloads.
    if (base64Encode(bytes) !== value) fail('share_encoding', 'This blend link has invalid encoding.');
    return bytes;
  }
  function encodeRecipe(recipe, data) {
    var result = validateRecipe(recipe, data);
    if (!result.valid) throw new BlendValidationError(result.errors);
    var bytes = utf8Bytes(JSON.stringify(result.recipe));
    if (bytes.length > MAX_JSON_BYTES) fail('share_size', 'This blend recipe is too large to share.');
    return base64Encode(bytes);
  }
  function decodeRecipe(encoded, data) {
    if (typeof encoded !== 'string' || !encoded.length || encoded.length > MAX_ENCODED_LENGTH) {
      fail('share_size', 'This blend link is empty or too large.');
    }
    if (!/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) fail('share_encoding', 'This blend link has invalid encoding.');
    var bytes = base64Decode(encoded);
    if (bytes.length > MAX_JSON_BYTES) fail('share_size', 'This blend recipe is too large.');
    var parsed;
    try {
      var json = decodeURIComponent(bytes.map(function (byte) { return '%' + byte.toString(16).padStart(2, '0'); }).join(''));
      parsed = JSON.parse(json);
    } catch (_) { fail('share_format', 'This blend link does not contain a valid UTF-8 recipe.'); }
    var result = validateRecipe(parsed, data);
    if (!result.valid) throw new BlendValidationError(result.errors);
    return result.recipe;
  }

  function resolveSource(value, data) {
    var source = value;
    if (typeof value === 'string') {
      source = (Array.isArray(data.sources) ? data.sources : []).find(function (row) { return row && row.id === value; });
    }
    if (!object(source) || !text(source.label) || typeof source.url !== 'string' ||
        !/^https:\/\/[^\s/?#:@]+(?::\d+)?(?:[/?#][^\s]*)?$/.test(source.url)) return null;
    return {label: source.label.trim(), url: source.url};
  }
  function storeOrigin(value) {
    // Accept only an HTTPS DNS origin, with an optional single root slash.
    // In particular, do not allow credentials, ports, IP literals, URL syntax
    // tricks, paths, queries, or fragments in a configured destination.
    if (typeof value !== 'string') return null;
    var match = /^https:\/\/([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+)\/?$/i.exec(value);
    if (!match || match[0] !== value || match[1].length > 253) return null;
    var hostname = match[1].toLowerCase();
    var tld = hostname.split('.').pop();
    // Numeric/hexadecimal last labels can be interpreted as IPv4 by browsers.
    if (!/^[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(tld)) return null;
    return 'https://' + hostname;
  }
  function validVariant(value) {
    return (typeof value === 'string' && /^[1-9]\d{0,19}$/.test(value) && !/\D/.test(value)) ||
      (typeof value === 'number' && Number.isSafeInteger(value) && value > 0);
  }
  function formattedPercent(value) { return String(Math.round(value * 1000000) / 1000000) + '%'; }

  function evaluateSafety(recipe, data) {
    var validation = validateRecipe(recipe, data);
    if (!validation.valid) return {requiresReview: true, blockers: validation.errors, warnings: []};
    recipe = validation.recipe;
    var catalog = catalogInfo(data);
    var product = object(catalog.config.product) ? catalog.config.product : {};
    var blockers = [];
    var warnings = [];
    var load = product.totalOilLoadPercent;
    var loadSource = resolveSource(product.totalOilLoadSource, data);
    var loadKnown = validPercent(load) && !!loadSource;
    var totalMax = product.totalOilMaxPercent;
    var totalMaxSource = resolveSource(product.totalOilMaxSource, data);
    if (!loadKnown) blockers.push(issue('total_load_unknown', 'The finished spray oil concentration and its formulation source require manual review.'));
    if (!validSafetyMaximum(totalMax) || !totalMaxSource) {
      blockers.push(issue('total_limit_unknown', 'The finished spray total oil-load safety limit and its source have not been verified.'));
    } else if (loadKnown && (totalMax === 0 || load > totalMax + 1e-10)) {
      blockers.push(issue('total_limit_exceeded', (totalMax === 0 ?
        'The finished spray contains essential oils, above the 0% total limit.' :
        'The finished spray contains ' + formattedPercent(load) + ' essential oils, above the ' + formattedPercent(totalMax) + ' total limit.') +
        ' Source: ' + totalMaxSource.label + '.', {source: totalMaxSource}));
    }
    var selectedIds = new Set(recipe.oils.map(function (entry) { return entry.id; }));
    var selected = recipe.oils.map(function (entry) { return {entry: entry, oil: catalog.oils.get(entry.id)}; });
    var seenInteractions = new Set();
    selected.forEach(function (row) {
      var oil = row.oil;
      var blend = oil.blend;
      var name = text(oil.name) ? oil.name : oil.id;
      var extras = {oilIds: [oil.id]};
      var concentration = loadKnown ? row.entry.percent * load / 100 : null;
      var maximum = blend.dermalMaxPercent;
      var maximumSource = resolveSource(blend.dermalMaxSource, data);
      if (blend.safetyReviewStatus !== 'approved') blockers.push(issue('safety_review_unapproved', name + ': the finished-spray safety review has not been approved.', extras));
      // Valid recipes and known loads are strictly positive: a zero cap must
      // block even when concentration arithmetic underflows or is below tolerance.
      if (!validSafetyMaximum(maximum) || !maximumSource) {
        blockers.push(issue('dermal_limit_unknown', name + ': no verified leave-on spray dermal maximum and source are available.', extras));
      } else if (loadKnown && (maximum === 0 || concentration > maximum + 1e-10)) {
        blockers.push(issue('dermal_limit_exceeded', name + (maximum === 0 ?
          ' is present in the finished spray, above its 0% dermal maximum.' :
          ' is ' + formattedPercent(concentration) + ' of the finished spray, above its ' + formattedPercent(maximum) + ' dermal maximum.') +
          ' Source: ' + maximumSource.label + '.', {oilIds: [oil.id], source: maximumSource}));
      }
      if (typeof blend.phototoxic !== 'boolean') blockers.push(issue('phototoxicity_unknown', name + ': phototoxicity review is missing.', extras));
      else if (blend.phototoxic) warnings.push(issue('phototoxic_oil', name + ' is flagged for phototoxicity. Its formulation and exposure restrictions require care.', extras));
      if (text(blend.sensitizationNotes)) warnings.push(issue('sensitization_note', name + ': ' + blend.sensitizationNotes.trim(), extras));
      if (recipe.petContext) {
        var petSource = resolveSource(blend.petSource, data);
        if (blend.petSafer !== true || !petSource) {
          blockers.push(issue('pet_context_blocked', name + (blend.petSafer === false ? ': not marked pet-safer for this use.' : ': no verified pet-safer assessment for this use.') +
            ' Pet species, exposure, and the finished formulation need review.', Object.assign({}, extras, petSource ? {source: petSource} : {})));
        }
      }
      if (!Array.isArray(blend.cautionThresholds) || !dense(blend.cautionThresholds)) {
        blockers.push(issue('caution_data_invalid', name + ': caution-threshold review data is missing or malformed.', extras));
      } else blend.cautionThresholds.forEach(function (threshold) {
        var source = object(threshold) ? resolveSource(threshold.source, data) : null;
        if (!object(threshold) || !validPercent(threshold.percent) || !text(threshold.reason) || !source) {
          blockers.push(issue('caution_data_invalid', name + ': a caution threshold lacks a verified finished-product percentage, reason, or source.', extras));
        } else if (loadKnown && concentration > threshold.percent + 1e-10) {
          warnings.push(issue('caution_threshold_exceeded', name + ' is ' + formattedPercent(concentration) + ' of the finished spray, above the ' +
            formattedPercent(threshold.percent) + ' caution threshold: ' + threshold.reason + ' Source: ' + source.label + '.', {oilIds: [oil.id], source: source}));
        }
      });
      if (!Array.isArray(blend.interactions) || !dense(blend.interactions)) {
        blockers.push(issue('interaction_data_invalid', name + ': interaction-review data is missing or malformed.', extras));
      } else blend.interactions.forEach(function (interaction) {
        var source = object(interaction) ? resolveSource(interaction.source, data) : null;
        if (!object(interaction) || typeof interaction.withOilId !== 'string' || !catalog.oils.has(interaction.withOilId) ||
            interaction.withOilId === oil.id || !['warning', 'blocker'].includes(interaction.severity) || !text(interaction.reason) || !source) {
          blockers.push(issue('interaction_data_invalid', name + ': an interaction record is incomplete or unverified.', extras));
          return;
        }
        if (!selectedIds.has(interaction.withOilId)) return;
        var other = catalog.oils.get(interaction.withOilId);
        var pair = [oil.id, other.id].sort();
        var key = pair.join('|') + '|' + interaction.severity + '|' + interaction.reason + '|' + source.url;
        if (seenInteractions.has(key)) return;
        seenInteractions.add(key);
        var message = name + ' + ' + (other.name || other.id) + ': ' + interaction.reason + ' Source: ' + source.label + '.';
        (interaction.severity === 'blocker' ? blockers : warnings).push(issue('oil_interaction', message, {oilIds: pair, source: source}));
      });
    });
    [['phototoxic', 'combined_phototoxicity', 'phototoxicity'], ['sensitizationRisk', 'combined_sensitization', 'high sensitization risk']].forEach(function (rule) {
      var matching = selected.filter(function (row) { return row.oil.blend[rule[0]] === (rule[0] === 'phototoxic' ? true : 'high'); });
      if (matching.length > 1) warnings.push(issue(rule[1], matching.map(function (row) { return row.oil.name || row.oil.id; }).join(' + ') +
        ': multiple selected oils are flagged for ' + rule[2] + '. Individual maximums do not establish combined-formulation safety.',
        {oilIds: matching.map(function (row) { return row.oil.id; })}));
    });
    if (recipe.petContext) warnings.push(issue('pet_context_scope', 'A pet-safer assessment is context-specific and is not a claim that this spray is safe to apply to pets.'));
    return {requiresReview: true, blockers: blockers, warnings: warnings};
  }

  function cartPermalink(recipe, data) {
    var validation = validateRecipe(recipe, data);
    if (!validation.valid) throw new BlendValidationError(validation.errors);
    var canonical = validation.recipe;
    var catalog = catalogInfo(data);
    var product = object(catalog.config.product) ? catalog.config.product : {};
    var origin = storeOrigin(product.shopifyStoreUrl);
    var errors = [];
    if (!text(product.name) || product.name.length > 120 || /[\u0000-\u001f\u007f]/.test(product.name) ||
        typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price <= 0 ||
        typeof product.currency !== 'string' || !/^[A-Z]{3}$/.test(product.currency) || !text(product.size) || product.size.length > 80 || /[\u0000-\u001f\u007f]/.test(product.size)) {
      errors.push(issue('product_configuration', 'The catalog needs a product name, positive price, currency code and bottle size.'));
    }
    if (!origin) errors.push(issue('checkout_store_missing', 'A verified HTTPS Shopify store URL is required to continue to Shopify.'));
    if (!validVariant(product.shopifyVariantId)) errors.push(issue('checkout_variant_missing', 'A verified Custom Blend Shopify variant is required to continue to Shopify.'));
    if (product.baseVersion !== undefined && product.baseVersion !== null &&
        (typeof product.baseVersion !== 'string' || !product.baseVersion.trim() ||
         product.baseVersion.length > 120 || /[\u0000-\u001f\u007f]/.test(product.baseVersion))) {
      errors.push(issue('product_configuration', 'A supplied base version must be a short, nonempty text identifier.'));
    }
    if (errors.length) throw new BlendValidationError(errors);
    // Only explicitly sourced, known formulation violations prevent a request.
    // Missing review/load/pet data remains visible for manual review, not a
    // requirement for checkout or an implicit claim that the recipe is safe.
    var knownViolations = evaluateSafety(canonical, data).blockers.filter(function (finding) {
      return ['total_limit_exceeded', 'dermal_limit_exceeded', 'oil_interaction'].includes(finding.code);
    });
    if (knownViolations.length) throw new BlendValidationError(knownViolations);
    var encoded = encodeRecipe(canonical, data);
    var lines = [
      'Name: ' + (canonical.name || 'Custom Blend'),
      'Recipe schema: v' + canonical.v + '; catalog: ' + canonical.catalogVersion,
      'Oil mixture (relative portions, total 100%): ' + canonical.oils.map(function (entry) {
        var oil = catalog.oils.get(entry.id);
        return (text(oil.name) ? oil.name.trim() : entry.id) + ' [' + entry.id + '] ' + formattedPercent(entry.percent);
      }).join('; '),
      'Product: ' + product.name.trim() + ', ' + product.size.trim()
    ];
    if (product.baseVersion != null) lines.push('Base version: ' + product.baseVersion.trim());
    if (canonical.petContext) lines.push('Customer context: pets may be present. Species and exposure require review.');
    lines.push('Manual formulation review required before fulfillment. Oil shares are relative portions of the oil mixture, not finished-product concentrations.');
    lines.push('Recipe code: ' + encoded);
    var properties = {Recipe: lines.join('\n')};
    var encodedProperties;
    try { encodedProperties = base64Encode(utf8Bytes(JSON.stringify(properties))); }
    catch (_) { fail('product_configuration', 'The product recipe metadata must contain valid Unicode text.'); }
    return {
      url: origin + '/cart/' + String(product.shopifyVariantId) + ':1?properties=' + encodedProperties,
      recipe: canonical,
      properties: properties,
      encodedRecipe: encoded
    };
  }
  return Object.freeze({
    normalizePercentages: normalizePercentages, validateRecipe: validateRecipe,
    encodeRecipe: encodeRecipe, decodeRecipe: decodeRecipe, evaluateSafety: evaluateSafety,
    cartPermalink: cartPermalink, resolveQualityId: resolveQualityId, BlendValidationError: BlendValidationError,
    limits: Object.freeze({maxOils: MAX_OILS, maxNameLength: MAX_NAME_LENGTH, maxEncodedLength: MAX_ENCODED_LENGTH})
  });
});
