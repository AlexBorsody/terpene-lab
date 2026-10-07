# Terpene Lab

Interactive essential oil and terpene data visualization explorer.

- **Oils tab**: search and select essential oils, see terpene composition charts.
- **Terpenes tab**: drill down into any terpene, see which oils contain it and at what percentage.
- **Network tab**: force-directed graph of every oil connected to its terpenes. Click any node to open it.
- **Studies tab**: published papers linked to oils and terpenes, with one-sentence findings and links.

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell |
| `styles.css` | Laboratory instrument theme (dark navy, amber, cream) |
| `app.js` | Rendering, charts (ECharts via CDN), interactions |
| `data.js` | **The dataset.** Schema documented at the top of the file. |

## Data workflow

`data.js` currently holds sample data (8 oils, 15 terpenes, 5 studies). Replace
`TERPENE_DATA` with the research output. The research agent must follow the
schema documented at the top of `data.js`:

- Only include studies that link to a real publication (PubMed, DOI, journal).
- Terpene percentages should be typical published composition ranges.
- Keep each study "finding" to what the paper actually reports. No medical claims beyond the paper.

## Run locally

```sh
cd terpene-lab
python3 -m http.server 8000
# open http://localhost:8000
```

(A plain `file://` open works for layout, but charts and data load most reliably over http.)

## Deploy

Any static host works. Vercel:

```sh
vercel --prod
```

No build step. Then embed in Shopify (see `shopify-embed.md`).

## Design rules

- No emojis anywhere in UI copy.
- No em dashes in UI copy. Use hyphens or colons.
- Laboratory look: dark navy, amber accents, cream text, mono for data.
