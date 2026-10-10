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

GitHub Pages publishes the root of `main` automatically, with no build step.
The existing URL is `https://alexborsody.github.io/terpene-lab/`.

The standalone page uses the full viewport and includes a link back to
`https://sunnysshield.com/`. Inside an iframe, or with `?embed=1`, it retains
the compact embed layout. App assets, the web manifest, and the service worker
use relative paths so both the project URL and a custom-domain root work.

### Custom-domain cutover

The planned domain is `lab.sunnysshield.com`. Keep the existing URL active
until DNS access and the cutover are ready. Do not add a `CNAME` file early:
GitHub Pages redirects the existing site to the configured custom domain.

1. Verify domain ownership in GitHub when possible.
2. When ready to coordinate both sides, set the repository's Pages custom
   domain to `lab.sunnysshield.com` and create the DNS CNAME record `lab`
   pointing to `alexborsody.github.io` (no repository path).
3. Confirm DNS and HTTPS, then enable Enforce HTTPS when GitHub offers it.
4. Check the app, asset URLs, deep links, and existing Shopify embeds on desktop
   and mobile before updating storefront links to the new address.

See [GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
and `shopify-embed.md`.

## Design rules

- No emojis in UI copy.
- No em dashes in UI copy. Use hyphens or colons.
- Laboratory instrument look: dark navy, amber accents, cream text, monospace for data.
- Evidence levels must always be visible next to counts. Never show a generic "science-backed" score.

