# Terpene Lab - Product & Visualization Spec

## 1. Vision

Build the definitive interactive evidence map for essential oils and their constituent compounds.

The experience should let a user move naturally through four questions:

1. **What is in this oil?**
2. **Which oils contain this terpene or compound?**
3. **What has this oil or compound actually been studied for?**
4. **How strong and relevant is that evidence?**

The product is not a marketing-claim generator. It is an explorable research interface that connects:

**Essential oils -> chemical constituents -> published studies -> evidence categories -> practical research domains**

It must work as a standalone data visualization and as an embeddable Sunny's Shield science experience in Shopify.

The visual language is **plant science / laboratory instrument**, not wellness-blog infographic.

---

## 2. Research pipeline

The data is built in four passes. Do not design the final visualization around incomplete sample data.

### Phase 1 - Essential oil catalog

First gather the essential oils.

Initial Sunny's Shield oils are the priority, but the architecture must support a much larger catalog.

Each oil record contains:

- common name
- Latin/binomial name
- plant family
- plant part
- extraction method
- geographic/source notes when relevant
- aroma descriptors
- short neutral description
- safety notes
- constituent profile
- references for composition data

Example:

```js
{
  id: "lavender",
  name: "Lavender",
  latinName: "Lavandula angustifolia",
  family: "Lamiaceae",
  plantPart: "Flowering tops",
  extraction: "Steam distillation",
  aroma: ["floral", "herbaceous", "soft"],
  description: "1-2 neutral sentences.",
  safety: "Evidence-based safety note.",
  constituents: [
    {
      compoundId: "linalool",
      range: { min: 20, max: 45 },
      basis: "typical published GC-MS range",
      sourceIds: ["source-id"]
    }
  ]
}
```

Composition should use **ranges**, not false single-number precision, unless a specific batch GC-MS report is being represented.

### Phase 2 - Compound / terpene catalog

Break each oil into its important chemical constituents.

The system should not artificially restrict itself to strict terpenes. Essential oils contain important terpenoids, phenylpropanoids and other volatile compounds such as eugenol and cinnamaldehyde. The UI can use the friendly umbrella term "terpenes & compounds" while retaining chemically correct classes in the data.

```js
{
  id: "eugenol",
  name: "Eugenol",
  chemicalClass: "Phenylpropanoid",
  formula: "C10H12O2",
  aroma: ["clove", "warm", "spicy"],
  description: "Neutral chemical description.",
  sourceIds: ["source-id"]
}
```

Required relationships:

- oil -> constituent
- constituent -> oils containing it
- constituent -> studies
- oil -> studies

### Phase 3 - Study collection

Collect published studies for either:

- an essential oil / botanical preparation
- an isolated constituent
- combinations when scientifically relevant

Study schema:

```js
{
  id: "stable-study-id",
  title: "Full title",
  authors: "Author list",
  journal: "Journal",
  year: 2025,
  doi: "optional DOI",
  pubmedId: "optional PMID",
  url: "canonical publication URL",
  studyType: "randomized-controlled-trial",
  model: "human",
  sampleSize: 120,
  oilIds: ["lavender"],
  compoundIds: ["linalool"],
  categories: [
    { type: "health", subcategory: "mental-health", topic: "anxiety" }
  ],
  finding: "One-sentence faithful summary of the paper.",
  limitations: "Short limitations note where useful.",
  evidenceLevel: "clinical"
}
```

Rules:

- Every study needs a real source URL.
- Prefer PubMed, DOI or the journal/publisher.
- Never infer a finished-product claim from an ingredient study.
- Distinguish human, animal, in-vitro and review evidence.
- Do not collapse "antimicrobial in vitro" into "treats infection."
- Record negative or null studies, not only positive studies.
- Deduplicate reviews and duplicate database records.

### Phase 4 - Evidence categorization

Studies are tagged into a controlled taxonomy. Categories describe **research domains**, not Sunny's Shield claims.

#### Health / medical

Subcategories:

- mental health
  - anxiety
  - stress
  - mood
  - sleep
- neurological / cognitive
  - attention
  - memory
  - alertness
- respiratory
- dermatology / skin
- pain / inflammation
- oral / dental
- digestive / gastrointestinal
- immune / inflammatory response
- cardiovascular
- metabolic
- wound research
- other clinical research

#### Cleaning / environmental

- surface cleaning
- soil / residue removal
- deodorization / odor
- air / environmental applications
- laundry / textiles
- biofilm-related surface research

#### Microbial

Organism-level tagging is important.

- bacteria
  - gram-positive
  - gram-negative
  - species / strain where available
- fungi
  - yeast
  - mold
  - dermatophytes
- viruses
- biofilms

#### Pest / repellent

- mosquitoes
- ticks
- fleas
- flies
- mites
- ants
- moths
- other insects
- rodents / vertebrate pests where actual evidence exists

#### Additional evidence domains

Add only when supported by meaningful literature:

- antioxidant
- food preservation
- agricultural / plant protection
- sensory / aroma / perception

---

## 3. Evidence quality model

This is essential. A PubMed link alone does not make two studies equally strong.

Each study receives:

### Study type

- systematic review / meta-analysis
- randomized controlled trial
- controlled human study
- observational human study
- animal study
- in-vitro study
- chemical / mechanistic study
- review / narrative review

### Evidence context

- human
- animal
- in vitro
- environmental / surface
- agricultural
- mechanistic

### Evidence level

Use a simple UI tier, derived from study metadata rather than manually used as a marketing score:

- **Clinical** - human intervention or clinical evidence
- **Preclinical** - animal or mechanistic biological evidence
- **Laboratory** - in-vitro, organism, surface or chemical testing
- **Review** - synthesis of prior literature

The interface must always expose the underlying study type. Never show a generic "science-backed" score with no explanation.

---

## 4. Core visualization model

The central insight: this dataset is a **network**, not a spreadsheet.

There are four node types:

**OILS -> COMPOUNDS -> EVIDENCE DOMAINS -> STUDIES**

The best experience should provide multiple coordinated views of the same graph rather than one giant visualization.

---

## 5. Primary user experience

### View A - Evidence Atlas (default landing view)

This is the hero visualization.

Layout:

- Essential oils appear as the first layer.
- Selecting an oil reveals its major compounds.
- Compounds connect to research-domain nodes such as Health, Microbial, Cleaning and Pest.
- Domain nodes display the number of linked studies.
- Selecting a domain opens the relevant studies in a detail panel.

Think **interactive evidence map**, not a decorative node cloud.

Interaction:

1. User taps Lavender.
2. Major compounds animate/highlight: Linalool, Linalyl acetate, etc.
3. Research domains supported by linked papers illuminate.
4. User taps "Mental health."
5. The graph filters to the relevant compounds and studies.
6. Study drawer shows human vs laboratory evidence and citations.

Desktop can use a horizontal network. Mobile should become a stepped drill-down rather than squeezing the entire network onto the screen.

### View B - Oil Explorer

A browsable oil catalog.

Each oil card shows:

- botanical name
- aroma
- plant part
- extraction
- top 3-5 constituents
- small composition visualization
- number of studies
- research-domain coverage

Opening an oil produces a full profile.

#### Oil profile

1. **Composition fingerprint**
   - horizontal bars or radial fingerprint for major constituents
   - ranges rather than false exact percentages
2. **Research coverage**
   - compact domain matrix
3. **Evidence by domain**
   - clinical / preclinical / laboratory counts
4. **Studies**
   - filterable bibliography

### View C - Compound Explorer

Invert the relationship.

A user selects **Limonene**, **Linalool**, **Eugenol**, etc. and sees:

- chemical class
- molecular formula
- aroma
- oils containing it
- typical abundance in each oil
- research domains
- studies directly investigating the compound

The key visualization is a ranked "found in" bar chart plus an evidence-domain map.

### View D - Evidence Matrix

This is the serious comparison tool.

Rows: oils or compounds.

Columns: research domains / subdomains.

Cell encoding:

- **color intensity = number of relevant studies**
- small marker / segmented edge = evidence context (clinical, preclinical, laboratory, review)

Clicking a cell opens the exact papers behind it.

Example:

| | Mental health | Skin | Bacteria | Fungi | Odor | Mosquito |
|---|---|---|---|---|---|---|
| Lavender | strong | medium | medium | medium | low | low |
| Clove | low | low | strong | strong | medium | medium |
| Lemon | low | low | medium | medium | medium | low |

Do not literally label cells "strong" based only on study count. The visual encoding uses count and study type; the user can inspect the papers.

This view is ideal for researchers and for website screenshots.

### View E - Research Domain Explorer

Start from a question instead of an ingredient.

Landing tiles:

- Health
- Cleaning
- Microbial
- Pest / Repellent

Selecting **Microbial -> Fungi** shows:

- oils with relevant evidence
- compounds with relevant evidence
- organisms studied
- evidence type distribution
- study list

Selecting **Health -> Mental health -> Anxiety** produces the same structure.

This is likely the most intuitive consumer view.

### View F - Study Library

A research browser, not just a long list.

Filters:

- oil
- compound
- domain
- subcategory
- organism / topic
- human / animal / in-vitro
- study type
- year
- positive / null / mixed finding when captured

Study cards show:

- title
- year / journal
- evidence badge
- ingredient / compound tags
- one-sentence finding
- limitations
- source link

---

## 6. Coordinated interactions

All views share state.

If a user selects **Clove** in Oil Explorer and switches to Evidence Matrix, Clove remains selected.

Global filter state:

- selected oils
- selected compounds
- evidence domain
- subcategory/topic
- evidence context
- year range

Every visualization should answer "why am I seeing this?" and provide a path to the underlying papers.

---

## 7. Visual design

### Art direction

**Plant science put to work.**

Blend:

- modern laboratory instrument
- botanical field guide
- scientific journal figure
- Sunny's Shield visual system

Avoid:

- wellness-blog cards
- cartoon molecule icons
- rainbow network graphs
- excessive glassmorphism
- fake medical UI
- decorative charts with no quantitative meaning

### Palette

Base:

- cream / warm laboratory paper
- deep forest / navy
- cobalt accent
- amber / botanical accent

Use category colors sparingly and consistently.

### Typography

- editorial serif for botanical/oil names and major headings
- clean sans-serif for interface
- monospace for formulas, percentages, PMIDs and quantitative values

---

## 8. Mobile behavior

Mobile is a first-class requirement because the experience will be reached from Instagram and Shopify.

Do not shrink desktop charts.

On mobile:

- Evidence Atlas becomes sequential drill-down cards.
- Matrix gets horizontal scrolling with frozen row labels.
- Study filters become a compact filter drawer.
- Detail panels become bottom sheets / stacked sections.
- Composition charts remain touch-friendly.
- Every chart element is tappable, not hover-dependent.

---

## 9. Data architecture

Current `data.js` can remain the initial source of truth, but the schema should be normalized enough to avoid duplicating studies across oils.

Recommended top-level structure:

```js
const TERPENE_DATA = {
  oils: [],
  compounds: [],
  studies: [],
  categories: [],
  sources: []
}
```

Relationships are IDs.

A separate `sources` collection stores composition and taxonomy references that are not themselves studies.

Do not store category claims directly on oils. Oil category coverage is **derived from linked studies**. This preserves provenance.

---

## 10. Research provenance

Every displayed fact should be traceable.

Composition values need sources just as efficacy studies do.

Source types:

- GC-MS composition paper
- pharmacopoeia / monograph
- systematic review
- clinical paper
- laboratory paper
- authoritative botanical database

The UI should distinguish:

**Composition source** from **effect/evidence study**.

---

## 11. Sunny's Shield integration

The visualization is broader than the product.

Sunny's Shield should appear as a subtle curated layer, not as the scientific conclusion.

Optional toggle:

**"Show Sunny's Shield ingredients"**

When enabled:

- ingredients used in the current formula highlight
- all other oils remain available
- the evidence continues to describe ingredient research, not finished-product efficacy

This keeps the tool credible and makes it genuinely useful beyond marketing.

Future option: once finished-product lab testing exists, Sunny's Shield becomes its own node with its own direct studies/tests, visually distinguished from ingredient evidence.

---

## 12. MVP vs later

### MVP

Build these first:

1. Oil Explorer
2. Compound drill-down
3. Evidence Domain Explorer
4. Study Library with evidence-type filters
5. Oil x domain Evidence Matrix

These deliver most of the value without requiring an exotic visualization engine.

### V2

6. Full Evidence Atlas network
7. organism-level microbial explorer
8. comparison mode (oil vs oil / compound vs compound)
9. evidence timeline
10. Sunny's Shield formula overlay
11. export/shareable research cards

### V3

- finished-product lab evidence
- batch-specific GC-MS overlays
- citation export
- research update pipeline
- richer quantitative meta-analysis where the underlying literature supports it

---

## 13. Definition of done for research phases

### Oil complete when

- taxonomy verified
- plant part verified
- extraction documented
- aroma documented
- major composition captured with source(s)
- safety note sourced

### Compound complete when

- identity and class verified
- formula verified
- oil relationships established
- aroma documented where meaningful

### Study complete when

- canonical citation exists
- linked oils/compounds are correct
- study type is classified
- evidence context is classified
- category/topic tags assigned
- finding is faithful to paper
- limitations captured where useful

---

## 14. Key product principle

The visualization must never ask the user to trust Sunny's Shield's interpretation.

It should let them move from:

**plant -> molecule -> research area -> paper**

and inspect the evidence themselves.

That is the differentiator.

The product should feel less like "here are our claims" and more like:

**"Here is the chemistry. Here is the research. Explore it."**
