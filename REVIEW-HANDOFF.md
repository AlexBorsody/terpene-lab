# Terpene Lab: independent review handoff

## Start here

Review [PR #13](https://github.com/AlexBorsody/terpene-lab/pull/13), including its final commit, review discussion and checks. The migration starts from main commit [`eb8a5b7eeb70e29c8bb53e0fbedeadb0554738f1`](https://github.com/AlexBorsody/terpene-lab/commit/eb8a5b7eeb70e29c8bb53e0fbedeadb0554738f1); the first implementation commit is [`a40476c838e222721f66816b39e3650c6a0c75bd`](https://github.com/AlexBorsody/terpene-lab/commit/a40476c838e222721f66816b39e3650c6a0c75bd). Follow the PR's final head/merge SHA rather than assuming that first commit is the release.

Live site: <https://lab.sunnysshield.com/>. Builder: <https://lab.sunnysshield.com/?tab=blend>. Do not assume that a published page has the latest service worker; verify the current release and accept the Lab update when offered.

The owner requested one canonical JSON dataset, oil-first by default, reusable hierarchical use terms, normalized relationships that can later support reverse/visual views, and dynamic data-driven site controls. This pass changes the data plumbing and existing views. A new visualizer or CMS service is not implemented.

This handoff is a review map, not an instruction to trust the implementation. Independently inspect the scientific scope, migration, generated artifacts, UI behavior and release evidence.

## Authoritative files and flow

1. Edit **`master-data.json` only** for maintained catalog, taxonomy, research associations, chemical category metadata and blend configuration.
2. Read **`master-data-schema.md`** for the exact schema, stable IDs, alias rules, oil use-tree projection, assertion scope, source inheritance and correction-ledger contract.
3. Run **`python3 scripts/build-data.py`**. It validates the master and deterministically generates `data.js` for the existing static app. `--check` rejects drift.
4. **`research.js`** resolves aliases, arbitrary-depth trees, per-oil evidence joins and unique-paper counts. **`chemistry.js`** consumes canonical chemical-category metadata and retains quantitative-provenance guards.
5. **`app.js`** uses those shared indexes in Oils, Compounds, Matrix, Uses/Domains, Studies and the retained Pathway. **`blend-builder.js`** uses the same research data across all 28 oils; **`blend-engine.js`** validates/migrates recipes and creates the separately configured cart permalink.
6. Run **`python3 scripts/build-pwa.py`** after shipped asset changes. Commit `data.js`, stamped `index.html`, and `sw.js` together. The offline release contains both the master and generated data, the shared resolver and self-hosted chart library.

`data.js` is generated, not another source to maintain. Historical JSON batches under `research/`, legacy profile summaries and old builder quality mappings are preserved audit material, not active sources of topic eligibility. The one-time migration/audit import scripts are not normal build steps; the published master builds without their original external audit packets.

## Structure and invariants to inspect

- Oils are the document's primary tree records. Their constituents, nested uses, study links, chemical evidence and precautions reference shared registries inside the same document.
- The use-term registry's `parentId` is authoritative. Each oil's nested `uses` is a validated projection; direct assertions appear at their exact endpoint, not redundantly on every ancestor. Reparenting must update that projection without changing stable IDs.
- A `study-use` assertion has one oil, paper and endpoint plus independent material, model, outcome, route, species, relevance and verification facets. Multiple arms/outcomes can share the same tuple under different assertion IDs.
- A global paper tag is not automatically applicable to every oil linked to that paper. Compound bibliography links are not whole-oil efficacy edges. Chemical observations remain a different assertion type.
- `researchMatch: true` means source-reviewed direct relevance to a research topic. It does not mean benefit, safety or product efficacy. Verified negative cognition and cellular-mechanism findings remain research matches; `supportsFunctionalUse` and explicit outcomes preserve the distinction.
- Unknown and library-only evidence stay explicit. Unverified routes are null; composition endpoints use a not-applicable route. Do not reintroduce keyword inference that carries one assay's route/model to another endpoint.
- Study counts deduplicate paper IDs across multiple tags. Broad parent selection includes descendants and parent-level attachments. Multi-selected builder topics use a union, not a score.
- Alias collisions, dangling references, cycles, duplicate citation identities, malformed HTTPS links and stale generated files fail validation. The correction ledger reverses deliberate changes to the exact baseline fingerprint.

## Baseline and current scope

| Record or association | Baseline | This pass |
|---|---:|---:|
| Oils | 28 | 28 |
| Compounds | 34 | 34 |
| Studies | 153 | 156 |
| Composition/taxonomy source records | 45 | 45 |
| Oil-study links | 214 | 222 |
| Original compound-study links | 240 | Preserved |
| Original constituent records | 76 | Preserved |
| Chemical observations | 53 | 53 |
| Scoped study-use assertions | Not previously explicit | 340 |
| Canonical use terms | 53 distinct used legacy paths | 89 nodes, including ancestors/unused terms/new endpoints |
| Reviewed direct research-topic assertions | Not comparable to old quality flags | 80 |

All original record IDs and oil-study links are retained. Citation/source inheritance preserves the 45 source IDs while avoiding a second maintained copy of an exactly matched publication URL. The declared legacy taxonomy and undeclared legacy tag paths are migrated rather than dropped.

All 214 original oil-study links received a mapping review. **45 of those links, representing 39 papers, received a targeted primary-source recheck; the other 169 were library-reviewed.** This is not a claim that every original publication was independently re-read or that the literature search is exhaustive. The three newly added papers were primary-verified, and recovered associations carry their own verification depth.

## Scientific cases to inspect closely

- **Faraji / stable ID `nialeila-2020-myrrh-frankincense-wound`:** separate extract sitz baths. Myrrh had a positive reported result; frankincense did not significantly differ from betadine. The frankincense was *B. carteri*, not the catalog's *B. serrata*. Neither is distilled-oil spray evidence.
- **`moss-2008-peppermint-cognition`:** peppermint and ylang-ylang have different outcomes. Ylang-ylang calmness coexists with worse memory/alertness. Those unfavorable results must remain visible and not be labeled unverified simply because they are not a desired effect.
- **`mori-kawanami-2016`:** lavender wound research is an animal model.
- **Han 2017, DOI `10.1016/j.biopen.2017.01.003`:** commercial frankincense oil in human fibroblast cultures, with species not established. Reduced inflammatory markers coexist with reduced proliferation/collagen III. No clinical skin, anti-aging or collagen-benefit claim.
- **Yang 2021, PMID `34540881`:** citrus oil/fraction soil removal on oil-soiled gauze is a limited bench assay. It is distinct from antimicrobial reduction and does not validate a diluted cleaning product or disinfectant.
- **Panahi 2015, PMID `25842469`:** a rosemary-containing scalp lotion study with no vehicle control. A nonsignificant between-group difference does not establish equivalence to minoxidil; the total oil loading was not established.
- **Composition papers reused for biological endpoints:** retain analytical observations separately from culture, insect, animal or environmental assays, even within the same publication.
- **Oral cineole, isolated carvacrol, clove gel, combinations, mismatched lemongrass species and ravintsara chemotypes:** contextual preparation/species distinctions must not disappear in broad parent views or the builder.
- **Cleaning taxonomy corrections:** oral malodor, antimicrobial preservation, textile finishing and biofilm assays are not automatically soil removal or household cleaning evidence.

Inspect both the master assertions and the actual rendered scope labels. Publication-level findings remain visible alongside the selected oil's material, model, reported outcome and scoped finding; full provenance is progressively disclosed.

## Reproduce verification

Use Python 3 and Node.js 22 or newer. Unit/integrity checks require no network:

```sh
python3 scripts/build-data.py --check
node tests/master-data.cjs
node tests/research-audit.cjs
node tests/research.cjs
node tests/blend-engine.cjs
node tests/chemistry.cjs
node tests/research-labels-unit.cjs
node tests/pwa-updates.cjs
python3 scripts/build-pwa.py
git diff --exit-code -- data.js index.html sw.js
```

The canonical suite has 78 checks in ordinary mode; supplying the exact original snapshot adds a separate baseline comparison. The focused research suite has 29 checks. Numbers may grow with later fixes; read the actual run output.

For browser checks, install the pinned Playwright release used by `.github/workflows/test.yml`, install Chromium, set `CHROME_PATH` to its executable and start `python3 -m http.server 8000` in another terminal:

```sh
node tests/pwa.cjs
node tests/browser.cjs
node tests/research-labels.cjs
node tests/taxonomy-browser.cjs
node tests/blend-browser.cjs
node tests/blend-checkout.cjs
```

`tests/pwa.cjs` and `tests/taxonomy-browser.cjs` serve isolated fixtures themselves. The remaining suites use the local HTTP server. Checkout fixtures intercept external navigation and writes; they must never create a merchant order or collect payment.

Review the [PR checks](https://github.com/AlexBorsody/terpene-lab/pull/13/checks) and [Actions runs](https://github.com/AlexBorsody/terpene-lab/actions). The first submitted runs are [PR run 39142265078](https://github.com/AlexBorsody/terpene-lab/actions/runs/39142265078) and [push run 39142255995](https://github.com/AlexBorsody/terpene-lab/actions/runs/39142255995); use the latest run on the final head, not an earlier result. Screenshots are retained by the workflow. Local Chromium was blocked by the execution sandbox during implementation, so actual browser sign-off depends on CI and live verification.

### High-value acceptance tests

- Add a root and four-level branch solely in a cloned master, plus parent/leaf/multi-tag assertions; regenerate. Check every relevant control, breadcrumb, count and oil/compound/study path without editing JavaScript.
- Rename and reparent stable terms; preserve aliases and verify old deep links. Reject ambiguous binding-derived aliases and unknown references.
- Put different oil-specific endpoints on the same paper and prove broad/global joins do not invent the other oil's use.
- Verify mixed, negative, contextual and unknown evidence at both leaf and parent scope; confirm visible applicability is not hidden in details.
- Load old recipe-v1 shares/drafts/saves using calm/focus/sleep/uplifting. Re-save without duplicates. Switch to oils-first, save/share/Back/load and prove invisible topics do not survive.
- Test zero portions, add/remove/normalize, invalid-number correction, Unicode names, keyboard focus, five-oil limit and exact 100% relative total.
- Tab away and back from filtered Studies, Oils and Matrix; inspect the URL, Back/Forward, reload and embed behavior.
- Inspect 320/390/768/1440-pixel standalone/embedded layouts and source links. Verify precaution prominence, touch targets and keyboard disclosure controls.
- At root and project paths, install/cache, go offline, open the dynamic builder and papers, save/reload, then simulate corrupt and valid releases. Verify atomic rejection, accepted update, URL preservation and unrelated-cache protection.

## Remaining merchant dependencies

Product configuration remains **Custom Blend, $40 USD, standard 8 oz**, canonical store origin `https://sunnysshield.com`, and `shopifyVariantId: null`. No real Buy link is enabled. A verified actual Custom variant/store availability is the technical handoff dependency. No actual order, merchant order-property display or payment has been verified.

The base composition/version, finished-product total oil load, validated formulation bounds and available inventory are still unconfirmed. These are reproducible-fulfillment inputs, separate from the variant. Do not invent them or infer stock from an oil's presence in the research catalog. Relative oil portions totaling 100% are not finished-product concentrations.

The approved commercial model is manual recipe review before mixing. `blend-builder-integration.md` documents the single readable Recipe line-item property and token-free Shopify cart permalink. A client-generated URL is not enforcement or safety certification; the merchant must review changed/missing recipe properties and suitability before fulfillment. No extra backend or Shopify Plus requirement is introduced by this pass.
