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
  version: "0.2.1-research",

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
    },
    {
      id: "cinnamon", name: "Cinnamon Bark", latinName: "Cinnamomum verum", family: "Lauraceae",
      plantPart: "Bark", extraction: "Steam distillation",
      aroma: ["warm", "woody", "spicy"], color: "#a95f45",
      description: "Bark essential oil is typically dominated by cinnamaldehyde. Composition varies by Cinnamomum species, origin, and extraction.",
      uses: ["Aromatic blends", "Research on microbial and biofilm activity"],
      safety: "Highly potent and irritating at inappropriate concentrations; requires careful dilution.",
      constituents: [
        { compoundId: "cinnamaldehyde", range: { min: 55, max: 80 }, basis: "Representative published bark-oil range; species and source dependent" },
        { compoundId: "eugenol", range: { min: 2, max: 10 }, basis: "Representative bark-oil range; species and source dependent" }
      ]
    },
    {
      id: "myrrh", name: "Myrrh", latinName: "Commiphora myrrha", family: "Burseraceae",
      plantPart: "Oleo-gum-resin", extraction: "Steam distillation",
      aroma: ["resinous", "earthy", "warm"], color: "#9b6545",
      description: "Resin-derived aromatic material rich in furanosesquiterpenes; chemical profile varies substantially by Commiphora species and extraction.",
      uses: ["Resinous aromatic blends", "Research on fungal activity"],
      safety: "Composition and safety depend on species and preparation; use appropriately diluted and avoid unsupported therapeutic use.",
      constituents: [
        { compoundId: "furanoeudesma-1-3-diene", range: { min: 15, max: 45 }, basis: "Representative literature range; highly source dependent" },
        { compoundId: "curzerene", range: { min: 5, max: 25 }, basis: "Representative literature range; highly source dependent" }
      ]
    },
    {
      id: "oregano", name: "Oregano", latinName: "Origanum vulgare", family: "Lamiaceae",
      plantPart: "Aerial parts", extraction: "Steam distillation",
      aroma: ["herbal", "sharp", "phenolic"], color: "#71834c",
      description: "A strongly aromatic oil whose chemotype can be dominated by carvacrol or thymol, with p-cymene and gamma-terpinene commonly present.",
      uses: ["Research on microbial and biofilm activity", "Aromatic blends"],
      safety: "Potent and potentially irritating; chemotype and dilution matter.",
      constituents: [
        { compoundId: "carvacrol", range: { min: 20, max: 80 }, basis: "Chemotype-dependent published range" },
        { compoundId: "thymol", range: { min: 1, max: 25 }, basis: "Chemotype-dependent published range" },
        { compoundId: "p-cymene", range: { min: 3, max: 20 }, basis: "Chemotype-dependent published range" },
        { compoundId: "gamma-terpinene", range: { min: 2, max: 15 }, basis: "Chemotype-dependent published range" }
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
    { id: "myrcene", name: "Myrcene", chemicalClass: "Monoterpene", formula: "C10H16", aroma: ["herbal", "balsamic"], description: "Common in citrus, hops, and cannabis; soft herbal-balsamic background note." },
    { id: "cinnamaldehyde", name: "Cinnamaldehyde", chemicalClass: "Phenylpropanoid aldehyde", formula: "C9H8O", aroma: ["cinnamon", "warm", "spicy"], description: "The major aromatic constituent of many cinnamon bark oils and a frequently studied antimicrobial and antibiofilm compound." },
    { id: "carvacrol", name: "Carvacrol", chemicalClass: "Monoterpenoid phenol", formula: "C10H14O", aroma: ["oregano", "warm", "phenolic"], description: "A major constituent of carvacrol-rich oregano chemotypes, widely investigated in laboratory antimicrobial and antibiofilm research." },
    { id: "thymol", name: "Thymol", chemicalClass: "Monoterpenoid phenol", formula: "C10H14O", aroma: ["herbal", "phenolic"], description: "An isomer of carvacrol found in thyme and some oregano chemotypes; frequently studied for antimicrobial activity." },
    { id: "p-cymene", name: "p-Cymene", chemicalClass: "Monoterpene", formula: "C10H14", aroma: ["citrus", "herbal", "woody"], description: "A common aromatic monoterpene in oregano and thyme oils and a biosynthetic relative of carvacrol and thymol." },
    { id: "furanoeudesma-1-3-diene", name: "Furanoeudesma-1,3-diene", chemicalClass: "Furanosesquiterpene", formula: "C15H20O", aroma: ["resinous", "myrrh"], description: "A characteristic furanosesquiterpene reported in Commiphora myrrh preparations." },
    { id: "curzerene", name: "Curzerene", chemicalClass: "Furanosesquiterpene", formula: "C15H20O", aroma: ["resinous", "warm"], description: "A furanosesquiterpene reported in myrrh and other aromatic botanicals." }
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
    },
    {
      id: "shen-2026-lavender-sleep-meta",
      title: "The Sleep-Enhancing Effect of Lavender Essential Oil in Adults: A Systematic Review and Meta-Analysis",
      authors: "Shen H, Zhang LJ, Zhu WY",
      journal: "Holistic Nursing Practice", year: 2026,
      doi: "10.1097/HNP.0000000000000734", pubmedId: "40600743",
      url: "https://pubmed.ncbi.nlm.nih.gov/40600743/",
      studyType: "systematic-review", context: "human", evidenceLevel: "review", sampleSize: 628,
      oilIds: ["lavender"], compoundIds: [],
      categories: [{ type: "health", subcategory: "mental-health", topic: "sleep" }],
      finding: "Meta-analysis of 11 randomized controlled trials reported a statistically significant improvement in adult sleep quality associated with lavender essential-oil interventions.",
      limitations: "The authors noted limitations in the quantity and quality of included studies; interventions and routes varied."
    },
    {
      id: "ribeiro-2024-eugenol-antibiofilm-review",
      title: "Eugenol as a promising antibiofilm and anti-quorum sensing agent: A systematic review",
      authors: "Ribeiro TAN, et al.",
      journal: "Microbial Pathogenesis", year: 2024,
      doi: "10.1016/j.micpath.2024.106937", pubmedId: "39293727",
      url: "https://pubmed.ncbi.nlm.nih.gov/39293727/",
      studyType: "systematic-review", context: "in-vitro", evidenceLevel: "review",
      oilIds: ["clove"], compoundIds: ["eugenol"],
      categories: [{ type: "microbial", subcategory: "bacteria" }, { type: "microbial", subcategory: "biofilms" }],
      finding: "Systematic review of 14 eligible studies reported antibacterial, antibiofilm, anti-virulence and anti-quorum-sensing activity for eugenol across multiple bacterial strains.",
      limitations: "Predominantly laboratory evidence; does not establish clinical or finished-product efficacy."
    },
    {
      id: "pinto-2009-clove-antifungal",
      title: "Antifungal activity of the clove essential oil from Syzygium aromaticum on Candida, Aspergillus and dermatophyte species",
      authors: "Pinto E, Vale-Silva L, Cavaleiro C, Salgueiro L",
      journal: "Journal of Medical Microbiology", year: 2009,
      doi: "10.1099/jmm.0.010538-0", pubmedId: "19589904",
      url: "https://pubmed.ncbi.nlm.nih.gov/19589904/",
      studyType: "in-vitro-study", context: "in-vitro", evidenceLevel: "laboratory",
      oilIds: ["clove"], compoundIds: ["eugenol"],
      categories: [{ type: "microbial", subcategory: "fungi", topic: "yeast" }, { type: "microbial", subcategory: "fungi", topic: "mold" }, { type: "microbial", subcategory: "fungi", topic: "dermatophytes" }],
      finding: "Clove essential oil and eugenol inhibited tested Candida, Aspergillus and dermatophyte strains; experiments implicated fungal membrane damage and reduced ergosterol.",
      limitations: "In-vitro study; results do not establish treatment efficacy in humans."
    },
    {
      id: "firmino-2018-cinnamon-biofilm",
      title: "Antibacterial and Antibiofilm Activities of Cinnamomum Sp. Essential Oil and Cinnamaldehyde: Antimicrobial Activities",
      authors: "Firmino DF, et al.",
      journal: "The Scientific World Journal", year: 2018,
      doi: "10.1155/2018/7405736", pubmedId: "29977171",
      url: "https://pubmed.ncbi.nlm.nih.gov/29977171/",
      studyType: "in-vitro-study", context: "in-vitro", evidenceLevel: "laboratory",
      oilIds: ["cinnamon"], compoundIds: ["cinnamaldehyde"],
      categories: [{ type: "microbial", subcategory: "bacteria" }, { type: "microbial", subcategory: "biofilms" }],
      finding: "C. zeylanicum and C. cassia bark oils and cinnamaldehyde exhibited antibacterial and antibiofilm activity against tested bacterial biofilms.",
      limitations: "In-vitro concentrations and biofilm models do not establish efficacy of a consumer spray."
    },
    {
      id: "kacaniova-2024-lemon",
      title: "Citrus limon Essential Oil: Chemical Composition and Selected Biological Properties Focusing on Antimicrobial, Antibiofilm, Insecticidal Activity and Preservative Effect",
      authors: "Kacaniova M, et al.",
      journal: "Plants", year: 2024,
      doi: "10.3390/plants13040524", pubmedId: "38498554",
      url: "https://pubmed.ncbi.nlm.nih.gov/38498554/",
      studyType: "in-vitro-study", context: "environmental", evidenceLevel: "laboratory",
      oilIds: ["lemon"], compoundIds: ["limonene", "beta-pinene", "gamma-terpinene"],
      categories: [{ type: "microbial", subcategory: "bacteria" }, { type: "microbial", subcategory: "fungi" }, { type: "microbial", subcategory: "biofilms" }, { type: "pest", subcategory: "flies" }],
      finding: "Lemon essential oil was characterized as 60.7% limonene, 12.6% beta-pinene and 10.3% gamma-terpinene and showed antimicrobial, antibiofilm and insecticidal activity in the reported laboratory and food-model assays.",
      limitations: "Laboratory and food-model evidence; composition is batch-specific and not a universal lemon-oil percentage."
    },
    {
      id: "obistioiu-2023-boswellia",
      title: "Boswellia Essential Oil: Natural Antioxidant as an Effective Antimicrobial and Anti-Inflammatory Agent",
      authors: "Obistioiu D, et al.",
      journal: "Antioxidants", year: 2023,
      doi: "10.3390/antiox12101807", pubmedId: "37891886",
      url: "https://pubmed.ncbi.nlm.nih.gov/37891886/",
      studyType: "in-vitro-study", context: "in-vitro", evidenceLevel: "laboratory",
      oilIds: ["frankincense"], compoundIds: ["alpha-pinene", "limonene"],
      categories: [{ type: "microbial", subcategory: "bacteria" }, { type: "microbial", subcategory: "fungi" }, { type: "health", subcategory: "pain-inflammation" }],
      finding: "A commercial mixed-Boswellia essential oil dominated by alpha-pinene and limonene showed antimicrobial, antioxidant and anti-inflammatory activity in laboratory assays.",
      limitations: "Commercial mixture of several Boswellia species; laboratory evidence only."
    },
    {
      id: "mahboubi-2016-myrrh-dermatophyte",
      title: "The anti-dermatophyte activity of Commiphora molmol",
      authors: "Mahboubi M, Mohammad Taghizadeh Kashani L",
      journal: "Pharmaceutical Biology", year: 2016,
      doi: "10.3109/13880209.2015.1072831", pubmedId: "26427766",
      url: "https://pubmed.ncbi.nlm.nih.gov/26427766/",
      studyType: "in-vitro-study", context: "in-vitro", evidenceLevel: "laboratory",
      oilIds: ["myrrh"], compoundIds: ["furanoeudesma-1-3-diene", "curzerene"],
      categories: [{ type: "microbial", subcategory: "fungi", topic: "dermatophytes" }, { type: "health", subcategory: "skin" }],
      finding: "Myrrh essential oil and extract were evaluated against Trichophyton and Microsporum dermatophytes and showed antifungal activity in vitro.",
      limitations: "In-vitro evidence; preparation and species identity matter and results do not establish clinical treatment efficacy."
    },
    {
      id: "guo-2024-oregano-listeria",
      title: "Inhibitory effect and mechanism of oregano essential oil on Listeria monocytogenes cells, toxins and biofilms",
      authors: "Guo P, et al.",
      journal: "Microbial Pathogenesis", year: 2024,
      doi: "10.1016/j.micpath.2024.106801", pubmedId: "39025378",
      url: "https://pubmed.ncbi.nlm.nih.gov/39025378/",
      studyType: "in-vitro-study", context: "in-vitro", evidenceLevel: "laboratory",
      oilIds: ["oregano"], compoundIds: ["carvacrol", "thymol"],
      categories: [{ type: "microbial", subcategory: "bacteria" }, { type: "microbial", subcategory: "biofilms" }, { type: "cleaning", subcategory: "surface" }],
      finding: "Oregano essential oil inhibited L. monocytogenes in laboratory assays and reduced biofilm coverage on glass slides; mechanistic experiments implicated multiple cellular effects.",
      limitations: "Laboratory and food-model evidence; does not establish efficacy at consumer-product concentrations."
    }
  ],

  sources: [
    { id: "src-composition-note", label: "Sample composition ranges: typical published GC-MS values; replace with cited sources in research pass.", url: "" }
  ]
};
