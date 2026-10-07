/* ============================================================================
   TERPENE LAB - data file
   ----------------------------------------------------------------------------
   SAMPLE DATA v0.2 - implements the spec.md schema. Replace with research.

   Top-level: { version, categories, oils, compounds, studies, sources }

   categories: controlled taxonomy of research domains.
     { type, label, subcategories: [{ id, label, topics: [] }] }

   oils:
     { id, name, latinName, family, plantPart, extraction, aroma: [],
       color, description, uses: [], safety,
       constituents: [{ compoundId, range: {min, max}, basis }] }
     Composition uses RANGES, not false single-number precision.

   compounds (terpenes & compounds):
     { id, name, chemicalClass, formula, aroma: [], description }

   studies:
     { id, title, authors, journal, year, doi, pubmedId, url,
       studyType, context, evidenceLevel, sampleSize,
       oilIds: [], compoundIds: [],
       categories: [{ type, subcategory, topic }],
       finding, limitations }
     studyType: systematic-review | randomized-controlled-trial |
       controlled-human-study | observational-human-study | animal-study |
       in-vitro-study | mechanistic-study | narrative-review
     context: human | animal | in-vitro | environmental | agricultural |
       mechanistic
     evidenceLevel: clinical | preclinical | laboratory | review

   sources: composition/taxonomy references (not efficacy studies).
     { id, label, url }

   RULES: real publication URLs only. finding = what the paper reports.
   Record null/negative studies too. Never infer finished-product claims
   from ingredient studies.
   ========================================================================== */

const TERPENE_DATA = {
  version: "0.2.0-sample",

  categories: [
    {
      type: "health", label: "Health",
      subcategories: [
        { id: "mental-health", label: "Mental health", topics: ["anxiety", "stress", "mood", "sleep"] },
        { id: "cognitive", label: "Cognitive", topics: ["attention", "memory", "alertness"] },
        { id: "respiratory", label: "Respiratory", topics: [] },
        { id: "skin", label: "Skin", topics: [] },
        { id: "pain-inflammation", label: "Pain / Inflammation", topics: [] },
        { id: "oral-dental", label: "Oral / Dental", topics: [] },
        { id: "digestive", label: "Digestive", topics: [] },
        { id: "immune", label: "Immune", topics: [] },
        { id: "cardiovascular", label: "Cardiovascular", topics: [] },
        { id: "metabolic", label: "Metabolic", topics: [] },
        { id: "wound", label: "Wound", topics: [] }
      ]
    },
    {
      type: "cleaning", label: "Cleaning",
      subcategories: [
        { id: "surface", label: "Surface cleaning", topics: [] },
        { id: "odor", label: "Deodorization / Odor", topics: [] },
        { id: "air", label: "Air / Environmental", topics: [] },
        { id: "laundry", label: "Laundry / Textiles", topics: [] }
      ]
    },
    {
      type: "microbial", label: "Microbial",
      subcategories: [
        { id: "bacteria", label: "Bacteria", topics: ["gram-positive", "gram-negative"] },
        { id: "fungi", label: "Fungi", topics: ["yeast", "mold", "dermatophytes"] },
        { id: "viruses", label: "Viruses", topics: [] },
        { id: "biofilms", label: "Biofilms", topics: [] }
      ]
    },
    {
      type: "pest", label: "Pest / Repellent",
      subcategories: [
        { id: "mosquitoes", label: "Mosquitoes", topics: [] },
        { id: "ticks", label: "Ticks", topics: [] },
        { id: "fleas", label: "Fleas", topics: [] },
        { id: "flies", label: "Flies", topics: [] },
        { id: "mites", label: "Mites", topics: [] },
        { id: "ants", label: "Ants", topics: [] },
        { id: "moths", label: "Moths", topics: [] }
      ]
    }
  ],

  oils: [
    {
      id: "lemon", name: "Lemon", latinName: "Citrus limon", family: "Rutaceae",
      plantPart: "Peel", extraction: "Cold-pressed",
      aroma: ["citrus", "bright", "clean"], color: "#f2c230",
      description: "Cold-pressed from lemon peel. Dominated by limonene, which gives it the sharp citrus character used across cleaning, fragrance, and flavor work.",
      uses: ["Surface freshening", "Deodorizing", "DIY cleaners"],
      safety: "Phototoxic on skin in sunlight; avoid undiluted topical use.",
      constituents: [
        { compoundId: "limonene", range: { min: 60, max: 75 } },
        { compoundId: "beta-pinene", range: { min: 10, max: 15 } },
        { compoundId: "gamma-terpinene", range: { min: 7, max: 12 } }
      ]
    },
    {
      id: "lavender", name: "Lavender", latinName: "Lavandula angustifolia", family: "Lamiaceae",
      plantPart: "Flowering tops", extraction: "Steam distillation",
      aroma: ["floral", "herbaceous", "soft"], color: "#9b7ed9",
      description: "Steam-distilled from flowering tops. Linalool and linalyl acetate drive its well-studied calming profile.",
      uses: ["Bedding and linen", "Evening routines", "Aromatic blends"],
      safety: "Generally well tolerated; patch test for sensitive skin.",
      constituents: [
        { compoundId: "linalool", range: { min: 25, max: 40 } },
        { compoundId: "linalyl-acetate", range: { min: 25, max: 40 } },
        { compoundId: "beta-caryophyllene", range: { min: 3, max: 8 } }
      ]
    },
    {
      id: "peppermint", name: "Peppermint", latinName: "Mentha piperita", family: "Lamiaceae",
      plantPart: "Leaves", extraction: "Steam distillation",
      aroma: ["mint", "cooling", "sharp"], color: "#4fc08d",
      description: "Steam-distilled from leaves. Menthol activates cold receptors, which is why it reads as cooling on skin and airways.",
      uses: ["Focus blends", "Foot and shoe freshening", "Head tension balms"],
      safety: "Keep away from young children; can irritate eyes and mucous membranes.",
      constituents: [
        { compoundId: "menthol", range: { min: 35, max: 50 } },
        { compoundId: "menthone", range: { min: 15, max: 30 } },
        { compoundId: "eucalyptol", range: { min: 4, max: 8 } }
      ]
    },
    {
      id: "eucalyptus", name: "Eucalyptus", latinName: "Eucalyptus globulus", family: "Myrtaceae",
      plantPart: "Leaves", extraction: "Steam distillation",
      aroma: ["camphor", "clearing", "sharp"], color: "#6fb7a6",
      description: "Steam-distilled from leaves. Very high in 1,8-cineole (eucalyptol), the compound behind its penetrating, clearing aroma.",
      uses: ["Shower steamers", "Chest blends", "Room clearing"],
      safety: "Do not use near infants; keep diluted and away from eyes.",
      constituents: [
        { compoundId: "eucalyptol", range: { min: 70, max: 85 } },
        { compoundId: "alpha-pinene", range: { min: 5, max: 12 } },
        { compoundId: "limonene", range: { min: 2, max: 6 } }
      ]
    },
    {
      id: "tea-tree", name: "Tea Tree", latinName: "Melaleuca alternifolia", family: "Myrtaceae",
      plantPart: "Leaves", extraction: "Steam distillation",
      aroma: ["medicinal", "green", "sharp"], color: "#8fc16f",
      description: "Steam-distilled from leaves. Terpinen-4-ol is the signature compound behind its long-documented antimicrobial profile.",
      uses: ["Surface cleaning blends", "Skin spot blends", "Deodorizing"],
      safety: "For external use; can irritate sensitive skin undiluted.",
      constituents: [
        { compoundId: "terpinen-4-ol", range: { min: 35, max: 48 } },
        { compoundId: "gamma-terpinene", range: { min: 18, max: 25 } },
        { compoundId: "alpha-terpinene", range: { min: 8, max: 12 } }
      ]
    },
    {
      id: "frankincense", name: "Frankincense", latinName: "Boswellia serrata", family: "Burseraceae",
      plantPart: "Resin", extraction: "Steam distillation",
      aroma: ["resinous", "warm", "balsamic"], color: "#d9a45b",
      description: "Steam-distilled from tree resin. Rich in alpha-pinene with a warm base that anchors blends and slows evaporation.",
      uses: ["Meditation blends", "Skin blends", "Fixative in perfumery"],
      safety: "Generally well tolerated; patch test for sensitive skin.",
      constituents: [
        { compoundId: "alpha-pinene", range: { min: 30, max: 45 } },
        { compoundId: "limonene", range: { min: 8, max: 15 } },
        { compoundId: "beta-caryophyllene", range: { min: 4, max: 8 } }
      ]
    },
    {
      id: "clove", name: "Clove Bud", latinName: "Syzygium aromaticum", family: "Myrtaceae",
      plantPart: "Buds", extraction: "Steam distillation",
      aroma: ["spicy", "warm", "intense"], color: "#c96f4a",
      description: "Steam-distilled from dried buds. Eugenol dominates at very high levels, giving it the unmistakable warm spice character.",
      uses: ["Spice blends", "Seasonal room blends", "Potpourri"],
      safety: "Potent; always dilute heavily. Can irritate skin and mucous membranes.",
      constituents: [
        { compoundId: "eugenol", range: { min: 75, max: 85 } },
        { compoundId: "beta-caryophyllene", range: { min: 8, max: 15 } },
        { compoundId: "alpha-humulene", range: { min: 2, max: 5 } }
      ]
    },
    {
      id: "sweet-orange", name: "Sweet Orange", latinName: "Citrus sinensis", family: "Rutaceae",
      plantPart: "Peel", extraction: "Cold-pressed",
      aroma: ["citrus", "sweet", "juicy"], color: "#f59e42",
      description: "Cold-pressed from orange peel. One of the highest limonene contents of any oil, with a rounder, sweeter profile than lemon.",
      uses: ["Uplifting room blends", "Kitchen freshening", "Cleaning blends"],
      safety: "Mild phototoxicity risk; oxidized oil can irritate skin.",
      constituents: [
        { compoundId: "limonene", range: { min: 90, max: 95 } },
        { compoundId: "myrcene", range: { min: 2, max: 4 } },
        { compoundId: "alpha-pinene", range: { min: 0.5, max: 2 } }
      ]
    }
  ],

  compounds: [
    { id: "limonene", name: "Limonene", chemicalClass: "Monoterpene", formula: "C10H16", aroma: ["citrus"], description: "The defining compound of citrus peels. One of the most abundant terpenes in nature and widely studied for mood, stress, and cleaning applications." },
    { id: "linalool", name: "Linalool", chemicalClass: "Monoterpenoid", formula: "C10H18O", aroma: ["floral", "soft"], description: "The calming backbone of lavender. Among the most researched terpenes for relaxation and sleep-related outcomes." },
    { id: "linalyl-acetate", name: "Linalyl Acetate", chemicalClass: "Monoterpenoid", formula: "C12H20O2", aroma: ["floral", "fruity"], description: "Ester partner to linalool in lavender; contributes the sweet, rounded floral top note." },
    { id: "menthol", name: "Menthol", chemicalClass: "Monoterpenoid", formula: "C10H20O", aroma: ["mint", "cooling"], description: "Activates TRPM8 cold receptors, producing the cooling sensation. The signature compound of peppermint." },
    { id: "menthone", name: "Menthone", chemicalClass: "Monoterpenoid", formula: "C10H18O", aroma: ["minty", "fresh"], description: "Peppermint's secondary ketone; adds the sharp, fresh mint edge beneath menthol." },
    { id: "eucalyptol", name: "Eucalyptol (1,8-Cineole)", chemicalClass: "Monoterpenoid", formula: "C10H18O", aroma: ["camphor"], description: "The penetrating compound in eucalyptus and rosemary. Studied for respiratory and anti-inflammatory applications." },
    { id: "terpinen-4-ol", name: "Terpinen-4-ol", chemicalClass: "Monoterpenoid", formula: "C10H18O", aroma: ["peppery", "green"], description: "Tea tree's signature compound and the main driver of its documented antimicrobial activity." },
    { id: "alpha-pinene", name: "Alpha-Pinene", chemicalClass: "Monoterpene", formula: "C10H16", aroma: ["pine", "resinous"], description: "The smell of pine forests. Common across conifers, frankincense, and rosemary; studied for alertness and respiratory effects." },
    { id: "beta-pinene", name: "Beta-Pinene", chemicalClass: "Monoterpene", formula: "C10H16", aroma: ["woody", "pine"], description: "Alpha-pinene's close relative; contributes dry woody notes to citrus and conifer oils." },
    { id: "beta-caryophyllene", name: "Beta-Caryophyllene", chemicalClass: "Sesquiterpene", formula: "C15H24", aroma: ["spicy", "woody"], description: "A dietary sesquiterpene (also in black pepper) notable for interacting with CB2 receptors. Found in clove, copaiba, and lavender." },
    { id: "eugenol", name: "Eugenol", chemicalClass: "Phenylpropanoid", formula: "C10H12O2", aroma: ["clove", "warm spice"], description: "The warm spice of clove bud at up to 85%. Long used in dentistry; potent, so dilution matters. Not a terpene: a phenylpropanoid." },
    { id: "gamma-terpinene", name: "Gamma-Terpinene", chemicalClass: "Monoterpene", formula: "C10H16", aroma: ["citrusy", "herbal"], description: "Common citrus and tea-tree constituent; contributes fresh herbal lift." },
    { id: "alpha-terpinene", name: "Alpha-Terpinene", chemicalClass: "Monoterpene", formula: "C10H16", aroma: ["woody", "citrus"], description: "Tea tree and citrus constituent with a warm woody-citrus character." },
    { id: "alpha-humulene", name: "Alpha-Humulene", chemicalClass: "Sesquiterpene", formula: "C15H24", aroma: ["woody", "earthy"], description: "Sesquiterpene in clove and hops; adds earthy depth." },
    { id: "myrcene", name: "Myrcene", chemicalClass: "Monoterpene", formula: "C10H16", aroma: ["herbal", "balsamic"], description: "Common in citrus, hops, and cannabis; soft herbal-balsamic background note." }
  ],

  studies: [
    {
      id: "komori-1995-citrus",
      title: "Effects of citrus fragrance on immune function and depressive states",
      authors: "Komori T, Fujiwara R, Tanida M, Nomura J, Yokoyama MM",
      journal: "Neuroimmunomodulation", year: 1995,
      pubmedId: "8719697",
      url: "https://pubmed.ncbi.nlm.nih.gov/8719697/",
      studyType: "controlled-human-study", context: "human", evidenceLevel: "clinical",
      oilIds: ["lemon"], compoundIds: ["limonene"],
      categories: [{ type: "health", subcategory: "mental-health", topic: "mood" }],
      finding: "Citrus fragrance exposure was associated with normalized immune markers and reduced depressive scores in the study group.",
      limitations: "Small sample; early study design."
    },
    {
      id: "kasper-2010-silexan",
      title: "Silexan, an orally administered Lavandula oil preparation, is effective in the treatment of subsyndromal anxiety disorder",
      authors: "Kasper S, Gastpar M, Muller WE, et al.",
      journal: "International Journal of Neuropsychopharmacology", year: 2010,
      pubmedId: "20587112",
      url: "https://pubmed.ncbi.nlm.nih.gov/20587112/",
      studyType: "randomized-controlled-trial", context: "human", evidenceLevel: "clinical",
      oilIds: ["lavender"], compoundIds: ["linalool", "linalyl-acetate"],
      categories: [{ type: "health", subcategory: "mental-health", topic: "anxiety" }],
      finding: "Lavender oil preparation showed anxiolytic effects in subsyndromal anxiety in a randomized controlled trial.",
      limitations: "Used a standardized oral preparation, not diffused oil."
    },
    {
      id: "carson-2006-teatree",
      title: "Melaleuca alternifolia (Tea Tree) Oil: a Review of Antimicrobial and Other Medicinal Properties",
      authors: "Carson CF, Hammer KA, Riley TV",
      journal: "Clinical Microbiology Reviews", year: 2006,
      pubmedId: "16428753",
      url: "https://pubmed.ncbi.nlm.nih.gov/16428753/",
      studyType: "narrative-review", context: "in-vitro", evidenceLevel: "review",
      oilIds: ["tea-tree"], compoundIds: ["terpinen-4-ol"],
      categories: [
        { type: "microbial", subcategory: "bacteria" },
        { type: "microbial", subcategory: "fungi" }
      ],
      finding: "Comprehensive review documenting tea tree oil's broad-spectrum antimicrobial activity, attributed largely to terpinen-4-ol.",
      limitations: "Review of mostly in-vitro work; not clinical efficacy evidence."
    },
    {
      id: "juergens-2003-cineole",
      title: "Anti-inflammatory activity of 1,8-cineol (eucalyptol) in bronchial asthma: a double-blind placebo-controlled trial",
      authors: "Juergens UR, Dethlefsen U, Steinkraus G, Gillissen A, Repges R, Vetter H",
      journal: "Respiratory Medicine", year: 2003,
      pubmedId: "12657144",
      url: "https://pubmed.ncbi.nlm.nih.gov/12657144/",
      studyType: "randomized-controlled-trial", context: "human", evidenceLevel: "clinical",
      oilIds: ["eucalyptus"], compoundIds: ["eucalyptol"],
      categories: [{ type: "health", subcategory: "respiratory" }],
      finding: "1,8-cineole showed anti-inflammatory effects in asthma patients in a controlled trial setting.",
      limitations: "Tested isolated 1,8-cineole capsules, not eucalyptus oil."
    },
    {
      id: "gertsch-2008-caryophyllene",
      title: "Beta-caryophyllene is a dietary cannabinoid",
      authors: "Gertsch J, Leonti M, Raduner S, et al.",
      journal: "Proceedings of the National Academy of Sciences", year: 2008,
      pubmedId: "18574142",
      url: "https://pubmed.ncbi.nlm.nih.gov/18574142/",
      studyType: "mechanistic-study", context: "animal", evidenceLevel: "preclinical",
      oilIds: ["clove", "lavender", "frankincense"], compoundIds: ["beta-caryophyllene"],
      categories: [{ type: "health", subcategory: "pain-inflammation" }],
      finding: "Beta-caryophyllene was identified as a selective CB2 receptor agonist with anti-inflammatory effects in animal models.",
      limitations: "Animal and cell models; not human efficacy data."
    }
  ],

  sources: [
    { id: "src-composition-note", label: "Sample composition ranges: typical published GC-MS values; replace with cited sources in research pass.", url: "" }
  ]
};
