# Terpene Lab

Interactive essential oil evidence explorer. Plant to molecule to paper.

## Views

- **Oils**: oil explorer with composition fingerprint (range bars), research coverage, evidence summary, studies.
- **Compounds**: terpene and compound drill-downs (chemically correct classes, not just "terpenes"), found-in charts, studies.
- **Matrix**: oils x research domains heatmap. Color intensity is study count; the letter marks the strongest evidence level (C clinical, P preclinical, L laboratory, R review). Click a cell to see the papers.
- **Domains**: start from a research question (Health, Cleaning, Microbial, Pest) and drill to subcategories, then oils, compounds, and papers.
- **Network**: force-directed oil-compound graph. Click any node to open it.
- **Studies**: filterable research library (oil, compound, domain, evidence level, study type).

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell |
| `styles.css` | Laboratory instrument theme |
| `app.js` | Rendering, charts (ECharts via CDN), interactions |
| `chemistry.js` | Shared classification, search and quantitative-provenance guards |
| `data.js` | **The dataset.** Full schema documented at the top of the file. |
| `spec.md` | Product and visualization spec (source of truth). |

## Data model

`data.js` holds `TERPENE_DATA`: `{ version, categories, oils, compounds, studies, sources }`.

- Composition uses source-verified, sample-specific **ranges** (`{min, max}`) where available. Unknown or unaudited quantities say **Not quantified** and produce no numerical bars. Existing unsourced legacy ranges remain in data for audit but are not displayed.
- Compounds carry chemically correct classes (Monoterpene, Sesquiterpene, Phenylpropanoid, ...). The UI says "terpenes and compounds".
- Every study has `studyType`, `context` (human/animal/in-vitro/...), and `evidenceLevel` (clinical/preclinical/laboratory/review).
- Studies are tagged with use categories: `{type, subcategory, topic}` where type is health, cleaning, microbial, or pest.
- Oil category coverage is **derived from linked studies**, never stored on oils.
- `sources` holds composition/taxonomy references separately from efficacy studies. Both are discoverable from oil and compound details.
- `chemicalGroups` supplies the four Beyond Terpenes explainers. `functionalGroups` on compounds supports overlapping aldehyde, ester and thiol browsing while preserving `chemicalClass`. Flavonoids are a primary family, not a functional group.
- `oils[].chemicalEvidence` records material-specific published evidence separately from `constituents`. Every oil displays all four groups, including explicit evidence gaps. Plant material, extracts, volatile oil and nonvolatile oil fractions are kept distinct.
- The Compounds tab has one category filter for chemical families and overlapping functional groups, including a terpenes-and-terpenoids umbrella. The Studies library can combine primary class, functional group/family, oil, compound, topic/domain and evidence filters. Aroma studies have their own sensory domain; analytical results are not efficacy claims.

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

After one successful online visit, the app shell, full local `data.js` research
summaries and self-hosted ECharts 5.5.1 are available offline. External paper
links and Wikimedia photos still require a connection. We do not cache publisher
pages or return app HTML for failed assets. ECharts' license is in `vendor/`.

The service worker precaches an entire release with SHA-256 verification and
bypasses HTTP caches during installation. It refuses partial/mixed deployments.
The active release stays consistent until an update is accepted or all its tabs
close. The Lab checks for updates on return to the tab, reconnect, and hourly;
“Update available: refresh Lab” activates the ready release and reloads open
standalone tabs. Navigation URLs survive refresh; transient unsaved filter input
may reset. Only caches belonging to the Lab are cleaned up. In an iframe or
`?embed=1`, install/status/update controls and new worker registration are disabled.

**After changing any shipped app, data, icon or manifest file:**

```sh
python3 scripts/build-pwa.py
node tests/chemistry.cjs
node tests/research-labels-unit.cjs
# With Playwright available, plus Chrome or CHROME_PATH:
node tests/pwa.cjs
# Existing UI suites additionally need the local HTTP server:
node tests/browser.cjs
node tests/research-labels.cjs
```

Commit regenerated `index.html` and `sw.js` with the changed assets.
The script stamps content-specific script/style URLs to avoid stale HTTP caches. CI checks the generated
release and regression tests before merging. The PWA suite serves its own isolated
copies at root and `/terpene-lab/`, simulates offline reopening, a corrupt partial
rollout, waiting/accepted upgrades, and unrelated-cache preservation.

See `shopify-embed.md` for storefront embedding.

## Design rules

- No emojis in UI copy.
- No em dashes in UI copy. Use hyphens or colons.
- Laboratory instrument look: dark navy, amber accents, cream text, monospace for data.
- Evidence levels must always be visible next to counts. Never show a generic "science-backed" score.


## Beyond Terpenes evidence and verification

The per-oil collection is a curated literature review, not exhaustive coverage or a chemical analysis of Sunny's Shield. Missing evidence does not establish absence. Cold-pressed citrus may retain nonvolatile flavonoids; these findings stay outside volatile fingerprints. See `research/beyond-terpenes-source-review.md` for scientific checks and limitations.

Run the data regression checks with `node tests/chemistry.cjs`. For browser checks, start the local server above, make Playwright available, then run `node tests/browser.cjs`. Set `PLAYWRIGHT_MODULE` to an installed module path, `CHROME_PATH` to a Chrome executable and `TEST_URL` to another local port as needed. The browser suite covers 320, 390, 768 and 1440 pixel widths in standalone/embed modes, combined filters, keyboard navigation, deep links and missing quantities.

Research-topic labels are a presentation layer over the original study categories. Composition analysis, flavonoid research and aroma research stay distinct across the oil cards, study filters and matrix. Run `node tests/research-labels-unit.cjs` for deterministic renderer, filter and alphabetical-selector checks. Run `node tests/research-labels.cjs` with the same browser environment variables for responsive layouts and browser interactions.
