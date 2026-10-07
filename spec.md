# Terpene Lab — Spec

## 1. Vision

The ultimate essential oil data visualization. A user selects essential oils,
drills down into each terpene, and browses published studies on the oils and
terpenes. Studies are organized by use category so the tool answers "what is
this researched for" at a glance. Embeddable in Shopify.

Status: v1 scaffold is live in this repo (oil explorer, terpene drill-down,
oil-terpene network graph, studies browser). This spec drives v2: the full
data model and category system.

## 2. Data model

All data lives in `data.js` as the `TERPENE_DATA` object. Research output must
match this schema exactly.

### 2.1 Oils

```js
{
  id: "lemon",                 // slug, unique
  name: "Lemon",
  latinName: "Citrus limon",
  plantPart: "Peel",
  aroma: "Bright, clean citrus",
  color: "#f2c230",            // chart accent
  description: "1-2 sentences.",
  uses: ["Surface freshening"],// plain-language uses
  safety: "One sentence.",
  terpenes: [
    { terpeneId: "limonene", percent: 68 }  // typical published range
  ]
}
```

Phase 1 goal: catalog ALL essential oils in common use, not just the v1 sample
of 8. Each oil gets the full field set above.

### 2.2 Terpenes

```js
{
  id: "limonene",
  name: "Limonene",
  class: "Monoterpene",        // Monoterpene | Sesquiterpene | Monoterpenoid | Phenylpropanoid | ...
  formula: "C10H16",
  aroma: "Citrus",
  description: "1-2 sentences."
}
```

Phase 2 goal: break every oil down by its terpene profile. Percentages are
typical published composition ranges. Every `terpeneId` referenced by an oil
must exist in this list.

### 2.3 Studies

```js
{
  id: "komori-1995-citrus",
  title: "Full paper title.",
  authors: "Komori T, et al.",
  journal: "Neuroimmunomodulation",
  year: 1995,
  url: "https://pubmed.ncbi.nlm.nih.gov/8719697/",
  finding: "One sentence, only what the paper reports.",
  oilIds: ["lemon"],
  terpeneIds: ["limonene"],
  categories: [
    { type: "medical-health", subcategory: "mental-health" },
    { type: "cleaning" }
  ]
}
```

Phase 3 goal: collect all studies for the oils and terpenes. Rules:

- Only studies with a real publication link (PubMed, DOI, journal page).
- `finding` states what the paper found. No medical claims beyond the paper.
- A study may link to multiple oils and multiple terpenes.
- A study may carry multiple category tags (see 2.4).

### 2.4 Use categories (controlled vocabulary)

Every study gets one or more category tags. Types are fixed; subcategories
are a starter list and may grow during research.

**medical-health** (subcategories):
- respiratory
- skin (dermatological)
- pain-inflammation
- mental-health (anxiety, stress, sleep)
- digestive
- immune
- cardiovascular
- cognitive (focus, memory, alertness)
- oral-dental
- hormonal

**cleaning** (no subcategories for now; add surface, laundry, air, dish if
the research supports it):
- General surface and home cleaning research.

**antimicrobial** (fighting microbes, subcategories):
- bacteria
- fungi
- viruses

**pest-repellent** (subcategories):
- insects
- rodents
- (extend as research dictates)

Category tag format in data: `{ type: "<type>", subcategory: "<sub>" }`.
The `subcategory` key is omitted when a type has no subcategories.

## 3. Build phases

1. **Oil catalog.** Gather all essential oils with full field sets (2.1).
   Research in progress via ChatGPT.
2. **Terpene breakdown.** Terpene profile per oil with percentages (2.2).
3. **Study collection.** Published studies linked to oils and terpenes (2.3).
4. **Study categorization.** Tag every study with use categories (2.4).
5. **Visualization design.** Alex defines the views. Data hooks the views
   will need: filter studies by category/subcategory, show category coverage
   per oil (which use categories each oil has research in), oil-by-category
   matrix, category landing views.
6. **Build and embed.** Implement the views, deploy static, Shopify iframe
   embed (see shopify-embed.md).

## 4. Visualization

Views to be defined by Alex. Current v1 views (oil grid, composition bars,
terpene drill-down, network graph, study list) stay as the foundation.
Planned data-driven additions once categories land:

- Category filter chips on the Studies tab.
- Per-oil "researched for" category badges.
- Oil x use-category coverage matrix (heatmap).
- Category landing views (e.g. open "pest-repellent" to see oils, terpenes,
  and studies behind it).

## 5. Shopify embed

Static hosting (Vercel) plus iframe in a Shopify Custom liquid section.
Full instructions in shopify-embed.md. `data.js` stays the single source of
truth so content updates never touch theme code.

## 6. Open questions

- How many oils make the v2 catalog cutoff (all known vs. top 50 by use)?
- Do we need study quality tiers (RCT vs. in-vitro vs. review)?
- Should categories also apply to oils directly, or only via their studies?
  (Current decision: only via studies, so every claim is backed by a paper.)

## 7. Copy and design rules

- No emojis in UI copy.
- No em dashes in UI copy. Use hyphens or colons.
- Laboratory instrument look: dark navy, amber accents, cream text,
  monospace for data.
