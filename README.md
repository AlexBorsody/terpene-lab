# Terpene Lab

Interactive essential oil evidence explorer. Plant to molecule to paper.

For an independent engineering/scientific review of the canonical migration, start with [REVIEW-HANDOFF.md](REVIEW-HANDOFF.md).

## Views

The main navigation is **Blend Builder · Oils · Visualize**. Oils contains Browse oils, Studies, Compounds and Uses; Visualize contains Matrix and Network. Existing view URLs remain valid, including filtered and detail links.

- **Blend Builder** (first tab and default landing view): research-topics-first or oils-first custom oil recipes from the merchant’s assortment, written evidence and precautions, saved drafts and versioned share links. $40 / 8 oz custom product, manually reviewed before mixing; a Shopify cart permalink carries the recipe to the published Custom Blend product. See [integration and launch requirements](blend-builder-integration.md).

- **Oils**: oil explorer with composition fingerprint (range bars), research coverage, evidence summary, studies.
- **Compounds**: terpene and compound drill-downs (chemically correct classes, not just "terpenes"), found-in charts, studies.
- **Matrix**: master relationship explorer for the canonical dataset. Switch among oils × topics, oils × compounds, compounds × topics, and studies × topics. Canonical families separate uses/outcomes, composition/sensory research, and other biological assays. Column headers descend the hierarchy; names and cells open oil/compound records, scoped papers, chemical observations and sources in place. Counts are unique papers, not effectiveness scores; percentages are source-qualified sample measurements. Filters and open details are shareable URL state.
- **Domains**: start from any canonical research topic and follow its nested topics, oils, compounds, and papers. Options and counts come from the same hierarchical terms used throughout the Lab.
- **Network**: force-directed oil-compound graph. Click any node to open it.
- **Studies**: filterable research library (oil, compound, domain, evidence level, study type).

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell |
| `styles.css` | Laboratory instrument theme |
| `app.js` | Rendering, self-hosted ECharts, interactions |
| `chemistry.js` | Shared classification, search and quantitative-provenance guards |
| `master-data.json` | **The single canonical dataset.** Oil-first records, shared registries, hierarchical uses, scoped evidence and provenance. |
| `data.js` | Generated browser compatibility projection; do not edit by hand. |
| `research.js` | Shared arbitrary-depth topic resolution, aliases, scoped evidence joins and deduplicated counts. |
| `scripts/build-data.py` | Validates the master and deterministically generates `data.js`. |
| `master-data-schema.md` | Canonical schema, migration rules and authoring guide. |
| `spec.md` | Product and visualization spec (source of truth). |

## Data model

Edit `master-data.json`, then run `python3 scripts/build-data.py`. Its oil-rooted tree references shared compounds, studies, sources and hierarchical use terms. Parent/child term IDs and many-to-many evidence references allow reverse views without duplicated papers. See [the schema and authoring guide](master-data-schema.md).

- Stable IDs, aliases and legacy bindings preserve existing links and recipe v1. Renaming or reparenting a term does not change its ID.
- Topics describe research endpoints. Material, model, route, species, outcome and verification depth are independent facets. A human-cell experiment is not clinical evidence.
- Each oil/study/topic assertion is scoped independently. Opposite results for different oils, contextual extracts, compound-only research and unknown preparation remain distinguishable. Global study tags never automatically become oil-specific claims.
- Builder research matches require explicit source-checked relevance. Other related material stays visible as contextual evidence. All 33 oils remain in research; 26 are offered in the builder. Merchant assortment is separate from research coverage and final fulfillment review.
- New hierarchy branches and chemical categories are data changes. Shared resolvers derive filters, breadcrumbs, chips, counts and builder topics, including arbitrary depths and multi-tag records. Counts deduplicate papers.
- Composition uses source-verified, sample-specific ranges where available. Unknown or unaudited quantities show **Not quantified** and produce no numerical bars. Historical quantities, uses, safety prose and old builder summaries remain preserved for audit, not promoted to verified evidence.
- `chemicalTaxonomy` defines chemical-family and functional-group browsing separately from the use hierarchy. Material-specific chemical observations remain separate from volatile composition fingerprints and functional-use evidence.
- Exact citation duplicates share study references while source-specific sample/method/limitations remain intact. No fuzzy-title merging is used.

The current master contains 33 oils, 42 compounds, 176 studies, 50 source records, 98 use terms and 245 oil-study links. The October 18 independent review checked all 156 preceding publication identities, screened 154 available abstracts and added one full-text-checked controlled study. All compound formulas were cross-checked. Publication identity and abstract screening are separate from oil-specific applicability: 87 oil-paper pairs have source checks, while other links retain their recorded review depth. Full-text composition tables and finished-product safety limits are not universally verified. A reversible correction ledger preserves all 153 original studies, original associations and the exact baseline. See the [October 19 taxonomy audit](TAXONOMY-AUDIT.md) for current mappings, filter semantics, sources and verification boundaries.

Research rules: real publication URLs only (PubMed/DOI/journal). Findings stay faithful to the paper. Record null studies. Never infer finished-product claims from ingredient studies.

## Run locally

```sh
cd terpene-lab
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

GitHub Pages publishes the root of `main` automatically, with no build step.
The existing URL is `https://alexborsody.github.io/terpene-lab/`.

The standalone page uses the full viewport and includes a link back to
`https://sunnysshield.com/`. Inside an iframe, or with `?embed=1`, it retains
the compact embed layout. App assets, the web manifest, and the service worker
use relative paths so both the project URL and a custom-domain root work.

### Progressive web app

The live HTTPS domain is `https://lab.sunnysshield.com/` (two consecutive s characters).
GitHub Pages publishes the repository root on `main`; `CNAME` preserves that domain.

The manifest has relative identity, start URL and scope for both custom-domain root
and GitHub project paths. PNG icons derive from the existing `shield-icon.svg`;
the dedicated maskable icon keeps the entire mark inside the safe area. iOS uses
a 180px Apple touch icon. Install with the browser's install action, the Lab's
install button when supported, or Safari's Share > Add to Home Screen.

After one successful online visit, the app shell, canonical `master-data.json`, generated `data.js` research
summaries and self-hosted ECharts 5.5.1 are available offline. External paper
links and Wikimedia photos still require a connection. We do not cache publisher
pages or return app HTML for failed assets. ECharts' license is in `vendor/`.

The service worker precaches an entire release with SHA-256 verification and
bypasses HTTP caches during installation. It refuses partial/mixed deployments.
A verified release calls `skipWaiting()` and activates automatically. The Lab
checks on page load, return to the tab, reconnect, and every minute. Controller
changes reload open standalone tabs once; no update-button click is required. Navigation URLs survive refresh; transient unsaved filter input
may reset. Only caches belonging to the Lab are cleaned up. In an iframe or
`?embed=1`, install/status/update controls and new worker registration are disabled.

**After changing any shipped app, data, icon or manifest file:**

```sh
python3 scripts/build-data.py
python3 scripts/build-data.py --check
python3 scripts/build-pwa.py
node tests/master-data.cjs
node tests/research.cjs
node tests/research-audit.cjs
node tests/blend-engine.cjs
node tests/chemistry.cjs
node tests/research-labels-unit.cjs
# With Playwright available, plus Chrome or CHROME_PATH:
node tests/pwa.cjs
# Existing UI suites additionally need the local HTTP server:
node tests/browser.cjs
node tests/research-labels.cjs
node tests/taxonomy-browser.cjs
node tests/blend-browser.cjs
node tests/blend-checkout.cjs
```

Commit regenerated `data.js`, `index.html` and `sw.js` with the changed master/assets. CI rejects projection drift, dangling references, invalid hierarchy or an inconsistent offline release.
The script stamps content-specific script/style URLs to avoid stale HTTP caches. CI checks the generated
release and regression tests before merging. The PWA suite serves its own isolated
copies at root and `/terpene-lab/`, simulates offline reopening, a corrupt partial
rollout, automatic upgrades and saved-recipe preservation, and unrelated-cache preservation.

See `shopify-embed.md` for storefront embedding.

## Design rules

- No emojis in UI copy.
- No em dashes in UI copy. Use hyphens or colons.
- Laboratory instrument look: dark navy, amber accents, cream text, monospace for data.
- Evidence levels must always be visible next to counts. Never show a generic "science-backed" score.


## Beyond Terpenes evidence and verification

The per-oil collection is a curated literature review, not exhaustive coverage or a chemical analysis of Sunny's Shield. Missing evidence does not establish absence. Cold-pressed citrus may retain nonvolatile flavonoids; these findings stay outside volatile fingerprints. See `research/beyond-terpenes-source-review.md` for scientific checks and limitations.

Run the data regression checks with `node tests/chemistry.cjs`. For browser checks, start the local server above, make Playwright available, then run `node tests/browser.cjs`. Set `PLAYWRIGHT_MODULE` to an installed module path, `CHROME_PATH` to a Chrome executable and `TEST_URL` to another local port as needed. The browser suite covers 320, 390, 768 and 1440 pixel widths in standalone/embed modes, combined filters, keyboard navigation, deep links and missing quantities.

Research topics and display labels are canonical hierarchical terms shared by every view. Composition analysis, flavonoid research and aroma research stay distinct across the oil cards, study filters and matrix. Run `node tests/research-labels-unit.cjs` for deterministic renderer, filter and alphabetical-selector checks. Run `node tests/research-labels.cjs` with the same browser environment variables for responsive layouts and browser interactions.

The requested Atlas cedarwood, German and Roman chamomile, sandalwood and ginger records include species-specific composition and scoped research. Ravintsara, Vitex, Bergamot, Copaiba, Grapefruit, Lemon Eucalyptus and Niaouli remain in research, with `legacy.blend.enabled: false` excluding them only from the store assortment. The published $40 Custom Blend variant is `67698909052973`.
