# Terpene Lab canonical dataset

`master-data.json` is the only maintained catalog and research dataset. `data.js` is a deterministic browser projection. Do not edit the generated file or maintain a second taxonomy/evidence list in application code.

## Build and verify

```sh
python3 scripts/build-data.py
python3 scripts/build-data.py --check
node tests/master-data.cjs
```

`--master PATH` and `--output PATH` support isolated fixtures. `--validate-only` validates without generating. `--legacy-json PATH` exports the original browser shape, without new taxonomy/evidence metadata. The tests also accept `--baseline PATH` for an exact comparison against the original snapshot and `--generated PATH` for an alternate output drift check. `--skip-drift` is for development only.

The one-time `scripts/migrate-master-data.cjs` imports an explicit original snapshot. It is not part of production builds, never consults the generated file, and refuses to replace an existing master unless explicitly forced. Re-running migration would discard later audits; ordinary edits must update the master directly.

## Document shape

- `schemaVersion`: data-contract version, currently 1.
- `taxonomyVersion`: taxonomy API version, currently 1.
- `version`: existing dataset release identifier.
- `blendBuilder`: original recipe/product configuration. Recipe version 1 and catalogVersion `2026-10-18` remain unchanged.
- `blendDefaults` (optional): exploratory builder defaults for every catalog oil. Default stock is unconfirmed; safety review, limits, phototoxicity and pet suitability remain unknown/unverified. Existing per-oil compatibility overlays are retained.
- `oils`: primary catalog records, each owning profile fields, constituent references, study links, nested uses, precautions, and unaudited legacy material.
- `registries`: shared `compounds`, `studies`, `sources`, `useNodes`, `evidenceAssertions`, `chemicalGroups`, and `chemicalTaxonomy` arrays, plus `editorialReferences` source lists.
- `migration`: immutable baseline fingerprint/counts and an explicit correction ledger.

An oil has:

```json
{
  "id": "lemon",
  "record": {"name": "Lemon", "latinName": "Citrus limon"},
  "constituents": [{"compoundId": "limonene", "range": {"min": 60, "max": 75}}],
  "chemicalEvidenceIds": ["chemical-lemon-1"],
  "studyLinks": [{"studyId": "komori-1995-citrus", "order": 0}],
  "uses": [{"useNodeId": "health", "evidenceIds": [], "children": []}],
  "precautions": {"legacySafety": "Original profile text", "reviewStatus": "unreviewed"},
  "legacy": {"uses": ["Original free-text profile uses"], "blend": {}}
}
```

This is a structural excerpt, not a complete or independently valid oil record. Profile fields and constituent ranges are preserved from the baseline. `studyLinks[].order` preserves the oil's position in the legacy study's `oilIds`; compound records use the same structure to preserve `compoundIds`. Those positions are unique and contiguous per study. Compound links are bibliographic associations and must never imply whole-oil efficacy.

`legacy.uses`, `precautions.legacySafety`, and `legacy.blend.qualityMappings` are unaudited compatibility content. Old `supportsSuggestion` flags are not an audit of the new assertions. No consumer may use them to grant research-match eligibility. Existing duplicate blend summaries remain explicitly historical pending source-based correction; they are not new canonical findings.

## Hierarchical use registry

Each use node has:

```json
{
  "id": "health-mental-health-anxiety",
  "label": "anxiety",
  "parentId": "health-mental-health",
  "aliases": ["health-mental-health-anxiety", "health:mental-health:anxiety", "health/mental-health/anxiety"],
  "legacyBindings": [{"type": "health", "subcategory": "mental-health", "topic": "anxiety"}],
  "declared": true
}
```

IDs match `^[a-z0-9][a-z0-9-]{0,63}$`. They are assigned once and persisted. Changing a label or parent must not regenerate an ID. Keep historical aliases and category bindings for old links. Alias collisions and duplicate bindings are errors. Slash/colon aliases derived from bindings use the same collision checker as explicit aliases, and the generator emits both into the canonical alias map. Bindings preserve original labels/path segments, including spaces in historical topics. A blank topic is represented by a parent-node binding with no `topic` key.

`parentId` is the authoritative hierarchy. Oil `uses` contains an explicit projection with `{useNodeId,evidenceIds,children}` at every depth. Ancestors can have their own assertions. Direct evidence IDs are stored only at the exact endpoint and must not be repeated on ancestors. No hard-coded depth or fixed list of root IDs exists. New nodes can have an empty `legacyBindings` array.

`declared` preserves the original legacy category declaration, including unused nodes. All original observed category paths are represented even if they were absent from those declarations. The initial migration retained 53 distinct used paths and 66 total nodes. Optional `displayLabel` and `navigationRoot` supply presentation metadata without application-specific category switches. By default, a parentless node is a navigation root.

Material, model, route, species, verification, and outcome are independent evidence facets. They must not be encoded as extra levels under use categories.

## Evidence assertions

A `study-use` assertion connects exactly one `oilId`, `studyId`, and `useNodeId`. Multiple uniquely identified assertions for the same tuple are supported, for example different arms, routes, populations, or opposite outcomes. Do not collapse them merely because those three IDs match.

Each has:

- `finding`, `limitations`: string or null. Null falls back to the canonical study fields. A nonnull assertion value describes a real scoped distinction or audited correction, not a duplicate general summary.
- `material`, `model`, `outcome`: object or null. Scoped audit fields may be added inside those objects. Null means unknown, never absence or a negative result.
- `route`, `species`: string or null.
- `relevance`: `unreviewed`, `direct`, `contextual`, or `excluded`.
- `verification`: `{status, sourceIds, urls, checkedAt, notes}`; references must resolve. Audit depth and source scope should be stated accurately.
- `researchMatch`: explicit boolean, false by default. True requires source-checked/source-verified status, direct relevance, and explicit material/model/outcome objects.
- Additional audited eligibility flags such as `supportsFunctionalUse` may distinguish composition research from functional-use evidence.

The generator checks structural eligibility, not the scientific truth of a source audit. Runtime resolvers must additionally preserve the audited scope, material, preparation, species, outcome, and use distinctions. A direct analytical composition study can match a composition topic without becoming efficacy evidence. A null/negative/mixed outcome remains discoverable as research and is not a benefit claim.

The study registry holds the single default finding, limitations, citation, and `useNodeIds`. The original nonstandard studyType/context strings are preserved; they are not coerced into an outdated header enum. Study-only/contextual oil links may have no use assertion. An assertion must have an oil-study link and its endpoint must be among the study's use nodes. Every assertion must appear exactly once in its oil's nested uses.

A `chemical-observation` assertion preserves a single original chemical evidence record under `observation`. It has an oil owner and source references, but never grants efficacy matching. It is listed in that oil's `chemicalEvidenceIds`. The initial migration preserved 53 such observations and created 286 unaudited study-use associations.

No evidence is inferred from free-text uses, constituent abundance, compound-study linkage, stock state, or a related botanical species.

## Chemical taxonomy and editorial associations

Chemical classification is a separate axis from uses. `registries.chemicalTaxonomy` is a flat array of category records with `id`, `label`, `parentId`, `selectable`, and `match`. Optional `groupId` references a record in `chemicalGroups` and supplies the functional-group identity for tags and group links.

Historical IDs such as `terpenes`, `class:Monoterpene`, and `group:ester` are retained verbatim. These chemical IDs may contain colons, uppercase letters, and spaces; the stricter use-node slug rule does not apply to this separate axis. Parent references must resolve and cycles/duplicate IDs are rejected.

A match object may contain `chemicalClasses`, `functionalGroups`, and `compoundIds` arrays, with OR semantics across all direct criteria. `includeDescendants: true` additionally unions matches from descendant categories. The terpene root uses that descendant rule; its five existing class children carry explicit class criteria. Flavonoid class membership in the flavonoid group is an explicit JSON rule. The separate Flavonoid class node is non-selectable so the existing UI has one selectable flavonoid category. Unknown classes/groups are not inferred into categories.

Adding a compound with a new chemical class and a matching category requires only canonical JSON changes and regeneration. There is no class-label, terpene-class, or special-flavonoid table in the production generator. Empty or unused categories may remain in the registry; consumers may omit categories with no matching compounds from their visible choices.

`registries.editorialReferences` maps named placements to arrays of source IDs. The existing four explainer citations live in `chemistryExplainerSourceIds`; every reference is validated against the source registry. This preserves editorial associations without a second hand-maintained list in application code.

## Citations

Studies are shared canonical publication records. A source with an exactly matching, unambiguous study URL retains its stable source ID and source-specific label/sample/method/extraction/limitations, but stores `studyRef` and `inheritedFields`, for example `["url"]`, instead of a second maintained citation field. The projection resolves those fields from the study. There is no fuzzy-title citation merging. Duplicate normalized DOI, normalized PMID, or exact publication URL across study records is rejected. DOI normalization removes a DOI resolver/doi: prefix and normalizes case; PubMed IDs normalize leading zeros. Sources may reference the same study through studyRef.

Study, source, and assertion verification links must be valid HTTPS URLs; DOI resolver URLs are supported. The existing empty unaudited source placeholder remains empty and does not become evidence. Constituent source IDs, compound functional groups, chemical taxonomy references, editorial references, blend source/oil/study references, and all core registry relationships are checked.

The initial migration deduplicated 33 exact citation URLs while retaining all 45 source records.

## Browser compatibility API

The generated `TERPENE_DATA` object retains the existing profile, studies, compounds, sources, chemical groups, product configuration, and recipe format. It adds:

- `D.taxonomy = {version, nodes, aliases}`; aliases is a direct alias-to-node-ID object.
- `D.evidenceAssertions`: shared typed assertions.
- `D.studies[].useNodeIds`: ordered endpoint IDs.
- `D.oils[].useTree`: the nested canonical uses projection.
- `D.oils[].evidenceIds`: all evidence owned by that oil, including chemical observations.
- `D.oils[].precautions`: canonical precaution metadata.
- `D.schemaVersion`.
- `D.chemicalTaxonomy = {version: 1, nodes}` and `D.editorialReferences`.

Legacy `D.oils[].uses` remains the original free-text array for old consumers. `D.categories` remains a legacy declaration adapter; new navigation must use `D.taxonomy`. The projection can render arbitrary-depth nodes even when no legacy category binding exists. `blendDefaults`, when configured, generates exploratory builder records for every oil. Legacy per-oil blend objects overlay those defaults to preserve old recipes/data; they do not activate their historical quality summaries.

## Lossless migration and deliberate corrections

The original baseline contains 28 oils, 34 compounds, 153 studies, 45 sources, 214 oil-study links, 240 compound-study links, 205 category assignments, 76 constituent entries, and 53 chemical observations. A fixed canonical JSON fingerprint protects every original field and array order, not only these counts.

Research corrections may change the browser projection only with a reversible ledger entry. Each entry has an ID, reason, source URLs, and `changes`. A change uses a path such as `["studies","stable-study-id","finding"]`; array records are addressed by stable ID. Field arrays can be recorded as a whole field. Record:

- `beforePresent`: false for a new field/record, otherwise true.
- `before`: the original value when present.
- `afterPresent`: false for a removed field/record, otherwise true.
- `afterDigest`: SHA-256 of the new value serialized as recursively key-sorted compact JSON.
- `beforeIndex`: required to restore a removed array record at its original position.

The test module exports `digest`, `loadGenerated`, `legacyProjection`, `reverseLedger`, and `counts` for audit tooling. Tests reverse the ledger, verify each after-digest, and require the exact original fingerprint. Undocumented drift cannot pass by changing only the stored baseline metadata. The complete original snapshot can additionally be supplied with `--baseline`.

Configuration expansions use a separate entry with `kind: "configuration"`, `provenance: "user-request"`, and a clear reason; they do not need an unrelated scientific citation. Assertions/taxonomy metadata that do not alter the legacy projection need no baseline correction entry. Scientific corrections retain original stable record IDs even when an old slug no longer accurately describes corrected metadata.
