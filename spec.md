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


---

## 15. Research backlog - ChatGPT pass 1 (2026-10-06)

Curated papers found in a separate PubMed pass that are not in the current data.js sample. This is a research backlog, not finished-product evidence or website claim copy. Verify full bibliographic metadata and exact botanical/extraction context before importing.

### Clove / eugenol

- **Eugenol as a promising antibiofilm and anti-quorum sensing agent: A systematic review**. PMID 39293727. DOI 10.1016/j.micpath.2024.106937. https://pubmed.ncbi.nlm.nih.gov/39293727/  
  Evidence: systematic review. Tags: microbial/bacteria, biofilms, oral-dental, surface/biofilm. Summary: review of 14 eligible studies reported antibacterial, antibiofilm, anti-virulence and anti-quorum-sensing activity for eugenol across multiple bacterial strains.

- **Chemical Composition, In Vitro and In Situ Antimicrobial and Antibiofilm Activities of Syzygium aromaticum (Clove) Essential Oil**. PMID 34685994. https://pubmed.ncbi.nlm.nih.gov/34685994/  
  Evidence: laboratory plus food model. Tags: bacteria, fungi, biofilms, environmental, food preservation. Summary: clove EO containing 82.4% eugenol and 14.0% (E)-caryophyllene showed antimicrobial activity; vapor-phase oil inhibited Penicillium in a bread model.

- **Antibacterial and antibiofilm activity of essential oil of clove against Listeria monocytogenes and Salmonella Enteritidis**. PMID 33947265. https://pubmed.ncbi.nlm.nih.gov/33947265/  
  Evidence: in-vitro. Tags: bacteria, biofilms, surface research. Summary: clove EO inhibited both organisms and reduced initial adhesion and established biofilms; eugenol was the major constituent.

- **In vitro activity of eugenol against Candida albicans biofilms**. PMID 17356790. DOI 10.1007/s11046-007-0097-2. https://pubmed.ncbi.nlm.nih.gov/17356790/  
  Evidence: in-vitro. Tags: fungi/yeast, biofilms. Summary: eugenol showed activity against C. albicans in preformed biofilms and affected adhesion, subsequent biofilm formation and morphogenesis.

- **Antifungal activity of clove essential oil on Candida, Aspergillus and dermatophyte species**. PMID 19589904. DOI 10.1099/jmm.0.010538-0. https://pubmed.ncbi.nlm.nih.gov/19589904/  
  Evidence: in-vitro. Tags: fungi/yeast, mold, dermatophytes. Summary: clove EO and eugenol inhibited all tested strains; mechanistic work implicated membrane damage and reduced ergosterol.

- **Antibacterial and antibiofilm activities of eugenol from clove leaf essential oil against Porphyromonas gingivalis**. PMID 29101062. DOI 10.1016/j.micpath.2017.10.054. https://pubmed.ncbi.nlm.nih.gov/29101062/  
  Evidence: in-vitro. Tags: oral-dental, bacteria, biofilms. Summary: eugenol damaged membrane integrity, inhibited biofilm formation and reduced preformed biofilm.

### Cinnamon / cinnamaldehyde

- **Antibacterial and Antibiofilm Activities of Cinnamomum Sp. Essential Oil and Cinnamaldehyde**. PMID 29977171. DOI 10.1155/2018/7405736. https://pubmed.ncbi.nlm.nih.gov/29977171/  
  Evidence: in-vitro. Tags: bacteria, biofilms. Summary: C. zeylanicum and C. cassia bark oils and cinnamaldehyde showed antibacterial and antibiofilm activity; cinnamaldehyde was the major constituent.

- **Antimicrobial activities of cinnamon oil and cinnamaldehyde from Cinnamomum cassia**. PMID 16710900. https://pubmed.ncbi.nlm.nih.gov/16710900/  
  Evidence: in-vitro. Tags: bacteria, yeast, mold, dermatophytes. Summary: cinnamon oil and cinnamaldehyde inhibited tested Gram-positive and Gram-negative bacteria, Candida, filamentous molds and dermatophytes.

- **Antibacterial effects of cinnamon bark essential oil on Porphyromonas gingivalis**. PMID 29325862. https://pubmed.ncbi.nlm.nih.gov/29325862/  
  Evidence: in-vitro. Tags: oral-dental, bacteria, biofilms. Summary: cinnamon bark EO and cinnamaldehyde impaired membrane integrity and inhibited P. gingivalis biofilm formation.

- **Fungicidal and inhibitory efficacy of cinnamon and lemongrass essential oils on Candida albicans biofilm established on acrylic resin**. PMID 33468317. https://pubmed.ncbi.nlm.nih.gov/33468317/  
  Evidence: laboratory surface model. Tags: fungi/yeast, biofilms, surface research, oral-dental. Summary: cinnamon EO reduced established C. albicans biofilm on PMMA dental acrylic, dependent on concentration and exposure time.

### Lemon / limonene

- **Citrus limon Essential Oil: Chemical Composition and Selected Biological Properties Focusing on Antimicrobial, Antibiofilm, Insecticidal Activity and Preservative Effect**. PMID 38498554. https://pubmed.ncbi.nlm.nih.gov/38498554/  
  Evidence: in-vitro plus in-situ food models. Tags: bacteria, fungi, biofilms, pest/insects, food preservation. Composition in this study: limonene 60.7%, beta-pinene 12.6%, gamma-terpinene 10.3%. Summary: lemon EO showed antibacterial/antibiofilm activity and vapor-phase inhibition of selected microorganisms; insecticidal and preservative effects were also evaluated.

- **Antifungal and anti-biofilm potential of limonene and linalool against Candida albicans and Candida tropicalis**. PMID 40620215. https://pubmed.ncbi.nlm.nih.gov/40620215/  
  Evidence: in-vitro isolated compounds. Tags: fungi/yeast, biofilms. Summary: limonene and linalool showed antifungal and antibiofilm activity; their combination was additive in the reported assays.

### Lavender / linalool

- **The Sleep-Enhancing Effect of Lavender Essential Oil in Adults: A Systematic Review and Meta-Analysis**. PMID 40600743. https://pubmed.ncbi.nlm.nih.gov/40600743/  
  Evidence: systematic review/meta-analysis of RCTs. Tags: health/mental-health/sleep. Summary: 11 RCTs totaling 628 adults were included; pooled results reported a statistically significant improvement in sleep quality associated with lavender EO interventions. Route/formulation heterogeneity must be checked before route-specific statements.

- **Evaluating the Antimicrobial and Antibiofilm Efficacy of Lavender Essential Oil and Linalool on Dual Candida/Staphylococcus Biofilms**. PMID 40406870. DOI 10.1002/vms3.70407. https://pubmed.ncbi.nlm.nih.gov/40406870/  
  Evidence: in-vitro veterinary isolates. Tags: bacteria, fungi/yeast, biofilms. Summary: lavender EO and linalool showed antimicrobial and antibiofilm activity against Staphylococcus and Candida isolates, including dual biofilms.

- **Antimicrobial Activity of Lavender Essential Oil from Lavandula angustifolia: In Vitro and In Silico Evaluation**. PMID 40723959. https://pubmed.ncbi.nlm.nih.gov/40723959/  
  Evidence: in-vitro plus in-silico. Tags: bacteria. Summary: a linalool/linalyl-acetate chemotype showed concentration-dependent antibacterial activity against E. coli, with more moderate/weak activity against other tested organisms.

### Frankincense / Boswellia

- **Boswellia Essential Oil: Natural Antioxidant as an Effective Antimicrobial and Anti-Inflammatory Agent**. PMID 37891886. https://pubmed.ncbi.nlm.nih.gov/37891886/  
  Evidence: in-vitro plus docking. Tags: bacteria, fungi/yeast, pain-inflammation, antioxidant. Summary: mixed-Boswellia EO dominated by alpha-pinene and limonene showed antimicrobial, antioxidant and anti-inflammatory activity in laboratory assays.

- **Chemical composition and antimicrobial activity of Boswellia serrata oleo-gum-resin essential oil extracted by superheated steam**. PMID 35200079. DOI 10.1080/14786419.2022.2044327. https://pubmed.ncbi.nlm.nih.gov/35200079/  
  Evidence: GC-MS plus in-vitro. Tags: bacteria, fungi. Summary: composition varied with extraction temperature; alpha-pinene was the major compound and extracts showed antibacterial and antifungal activity.

- **Frankincense and myrrh essential oils and burn incense fume against micro-inhabitants of sacral ambients**. PMID 29530608. https://pubmed.ncbi.nlm.nih.gov/29530608/  
  Evidence: laboratory plus environmental air. Tags: bacteria, fungi, environmental/air. Summary: B. carteri EO vapor reduced viable airborne bacterial and fungal counts in the studied environments. Do not conflate incense smoke exposure with EO spray evidence.

- **In-Vitro and In-Vivo Antibacterial Effects of Frankincense Oil against Multidrug-Resistant Pathogens**. PMID 36358246. https://pubmed.ncbi.nlm.nih.gov/36358246/  
  Evidence: in-vitro plus animal. Tags: bacteria, respiratory. Summary: important mixed/negative evidence: authors reported frankincense oil did not show a very potent inhibitory effect against MRSA or MDR P. aeruginosa and did not enhance the tested antibiotics.

### Myrrh / Commiphora

- **Antifungal activity of Myrrh gum resin against pathogenic Candida spp**. PMID 39344721. https://pubmed.ncbi.nlm.nih.gov/39344721/  
  Evidence: in-vitro. Tags: fungi/yeast. Summary: myrrh preparations inhibited tested Candida isolates; authors called for additional efficacy, toxicity and safety research before clinical application.

- **The anti-dermatophyte activity of Commiphora molmol**. PMID 26427766. DOI 10.3109/13880209.2015.1072831. https://pubmed.ncbi.nlm.nih.gov/26427766/  
  Evidence: in-vitro. Tags: fungi/dermatophytes, dermatology/skin. Summary: myrrh essential oil and ethanol extract were evaluated against Trichophyton and Microsporum dermatophytes and showed antifungal activity.

- **Wound Pathogens: Investigating Antimicrobial Activity of Commercial Essential Oil Combinations against Reference Strains**. PMID 30362637. https://pubmed.ncbi.nlm.nih.gov/30362637/  
  Evidence: in-vitro combination study. Tags: bacteria, wound research. Summary: sandalwood plus myrrh showed noteworthy broad-spectrum activity and synergy against several reference wound pathogens. Combination evidence cannot be attributed to myrrh alone.

### Oregano / carvacrol / thymol

- **Inhibitory effect and mechanism of oregano essential oil on Listeria monocytogenes cells, toxins and biofilms**. PMID 39025378. DOI 10.1016/j.micpath.2024.106801. https://pubmed.ncbi.nlm.nih.gov/39025378/  
  Evidence: in-vitro plus food model. Tags: bacteria, biofilms, surface research, food preservation. Summary: oregano EO inhibited Listeria, reduced biofilm coverage on glass slides and affected multiple cellular mechanisms; docking implicated carvacrol and thymol.

- **Chemical Composition, Antibacterial and Antibiofilm Actions of Oregano Essential Oil against Salmonella Typhimurium and Listeria monocytogenes**. PMID 37569162. https://pubmed.ncbi.nlm.nih.gov/37569162/  
  Evidence: in-vitro. Tags: bacteria, biofilms. Summary: oregano EO showed antibacterial and antibiofilm activity; GC-MS identified thymol, p-cymene, gamma-terpinene and carvacrol as major constituents.

- **Oregano essential oil inhibits Candida spp. biofilms**. PMID 33915040. https://pubmed.ncbi.nlm.nih.gov/33915040/  
  Evidence: in-vitro. Tags: fungi/yeast, biofilms. Summary: oregano EO inhibited Candida adhesion, biofilm formation and established biofilms, including dual C. albicans + S. aureus biofilms.

- **The natural plant compound carvacrol as an antimicrobial and anti-biofilm agent: mechanisms, synergies and bio-inspired anti-infective materials**. PMID 30067078. https://pubmed.ncbi.nlm.nih.gov/30067078/  
  Evidence: review. Tags: bacteria, fungi, biofilms. Summary: review describes broad antimicrobial and antibiofilm evidence for carvacrol across Gram-positive bacteria, Gram-negative bacteria and fungi.

- **Origanum Essential Oil and Antifungal Activity: A Systematic Review**. PMID 39948037. DOI 10.1002/cbdv.202402296. https://pubmed.ncbi.nlm.nih.gov/39948037/  
  Evidence: systematic review. Tags: fungi/yeast, mold. Summary: review identified Candida, Aspergillus and Penicillium among the most studied fungi and highlighted carvacrol, thymol, p-cymene and gamma-terpinene as important constituents.

### Research-quality note

This first pass intentionally includes:
- systematic reviews/meta-analyses
- direct oil studies
- isolated-compound studies
- environmental/surface studies
- a meaningful negative/mixed frankincense result

That mix is deliberate. The evidence map should show **what kind of evidence exists**, not merely accumulate favorable citations.
