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
| `data.js` | **The dataset.** Full schema documented at the top of the file. |
| `spec.md` | Product and visualization spec (source of truth). |

## Data model

`data.js` holds `TERPENE_DATA`: `{ version, categories, oils, compounds, studies, sources }`.

- Composition uses **ranges** (`{min, max}`), not false single-number precision.
- Compounds carry chemically correct classes (Monoterpene, Sesquiterpene, Phenylpropanoid, ...). The UI says "terpenes and compounds".
- Every study has `studyType`, `context` (human/animal/in-vitro/...), and `evidenceLevel` (clinical/preclinical/laboratory/review).
- Studies are tagged with use categories: `{type, subcategory, topic}` where type is health, cleaning, microbial, or pest.
- Oil category coverage is **derived from linked studies**, never stored on oils.
- `sources` holds composition/taxonomy references separately from efficacy studies.

Research rules: real publication URLs only (PubMed/DOI/journal). Findings stay faithful to the paper. Record null studies. Never infer finished-product claims from ingredient studies.

## Run locally

```sh
cd terpene-lab
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Any static host works (no build step). Vercel: `vercel --prod`. Then embed in Shopify; see `shopify-embed.md`.

## Design rules

- No emojis in UI copy.
- No em dashes in UI copy. Use hyphens or colons.
- Laboratory instrument look: dark navy, amber accents, cream text, monospace for data.
- Evidence levels must always be visible next to counts. Never show a generic "science-backed" score.
