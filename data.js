/* ============================================================================
   TERPENE LAB - data file
   ----------------------------------------------------------------------------
   SAMPLE DATA v0.1 - replace and extend with real research output.

   SCHEMA (give this to the research agent; output must be one JSON object
   assigned to TERPENE_DATA):

   {
     "version": "0.2.0",
     "oils": [
       {
         "id": "lemon",              // slug, unique
         "name": "Lemon",
         "latinName": "Citrus limon",
         "plantPart": "Peel",
         "aroma": "Bright, clean citrus",
         "color": "#f2c230",         // accent used in charts
         "description": "1-2 sentences.",
         "uses": ["Surface freshening", "..."],
         "safety": "One sentence, e.g. phototoxicity notes.",
         "terpenes": [
           { "terpeneId": "limonene", "percent": 68 }   // typical % range
         ]
       }
     ],
     "terpenes": [
       {
         "id": "limonene",
         "name": "Limonene",
         "class": "Monoterpene",     // Monoterpene | Sesquiterpene | etc.
         "formula": "C10H16",
         "aroma": "Citrus",
         "description": "1-2 sentences."
       }
     ],
     "studies": [
       {
         "id": "komori-1995-citrus",
         "title": "Full paper title.",
         "authors": "Komori T, et al.",
         "journal": "Neuroimmunomodulation",
         "year": 1995,
         "url": "https://pubmed.ncbi.nlm.nih.gov/xxx/",
         "finding": "One sentence on what the study found. No medical claims beyond the paper.",
         "oilIds": ["lemon"],
         "terpeneIds": ["limonene"]
       }
     ]
   }

   RULES FOR RESEARCH OUTPUT:
   - Only include studies that link to a real publication (PubMed, DOI, journal).
   - Terpene percentages should be typical published composition ranges.
   - Keep "finding" to what the paper actually reports.
   ========================================================================== */

const TERPENE_DATA = {
  version: "0.1.0-sample",

  oils: [
    {
      id: "lemon",
      name: "Lemon",
      latinName: "Citrus limon",
      plantPart: "Peel",
      aroma: "Bright, clean citrus",
      color: "#f2c230",
      description: "Cold-pressed from lemon peel. Dominated by limonene, which gives it the sharp citrus character used across cleaning, fragrance, and flavor work.",
      uses: ["Surface freshening", "Deodorizing", "DIY cleaners"],
      safety: "Phototoxic on skin in sunlight; avoid undiluted topical use.",
      terpenes: [
        { terpeneId: "limonene", percent: 68 },
        { terpeneId: "beta-pinene", percent: 12 },
        { terpeneId: "gamma-terpinene", percent: 9 }
      ]
    },
    {
      id: "lavender",
      name: "Lavender",
      latinName: "Lavandula angustifolia",
      plantPart: "Flowering tops",
      aroma: "Floral, herbaceous, calm",
      color: "#9b7ed9",
      description: "Steam-distilled from flowering tops. Linalool and linalyl acetate drive its well-studied calming profile.",
      uses: ["Bedding and linen", "Evening routines", "Aromatic blends"],
      safety: "Generally well tolerated; patch test for sensitive skin.",
      terpenes: [
        { terpeneId: "linalool", percent: 35 },
        { terpeneId: "linalyl-acetate", percent: 32 },
        { terpeneId: "beta-caryophyllene", percent: 5 }
      ]
    },
    {
      id: "peppermint",
      name: "Peppermint",
      latinName: "Mentha piperita",
      plantPart: "Leaves",
      aroma: "Sharp, cooling mint",
      color: "#4fc08d",
      description: "Steam-distilled from leaves. Menthol activates cold receptors, which is why it reads as cooling on skin and airways.",
      uses: ["Focus blends", "Foot and shoe freshening", "Head tension balms"],
      safety: "Keep away from young children; can irritate eyes and mucous membranes.",
      terpenes: [
        { terpeneId: "menthol", percent: 42 },
        { terpeneId: "menthone", percent: 22 },
        { terpeneId: "eucalyptol", percent: 6 }
      ]
    },
    {
      id: "eucalyptus",
      name: "Eucalyptus",
      latinName: "Eucalyptus globulus",
      plantPart: "Leaves",
      aroma: "Camphoraceous, clearing",
      color: "#6fb7a6",
      description: "Steam-distilled from leaves. Very high in 1,8-cineole (eucalyptol), the compound behind its penetrating, clearing aroma.",
      uses: ["Shower steamers", "Chest blends", "Room clearing"],
      safety: "Do not use near infants; keep diluted and away from eyes.",
      terpenes: [
        { terpeneId: "eucalyptol", percent: 78 },
        { terpeneId: "alpha-pinene", percent: 9 },
        { terpeneId: "limonene", percent: 4 }
      ]
    },
    {
      id: "tea-tree",
      name: "Tea Tree",
      latinName: "Melaleuca alternifolia",
      plantPart: "Leaves",
      aroma: "Medicinal, green, sharp",
      color: "#8fc16f",
      description: "Steam-distilled from leaves. Terpinen-4-ol is the signature compound behind its long-documented antimicrobial profile.",
      uses: ["Surface cleaning blends", "Skin spot blends", "Deodorizing"],
      safety: "For external use; can irritate sensitive skin undiluted.",
      terpenes: [
        { terpeneId: "terpinen-4-ol", percent: 40 },
        { terpeneId: "gamma-terpinene", percent: 22 },
        { terpeneId: "alpha-terpinene", percent: 10 }
      ]
    },
    {
      id: "frankincense",
      name: "Frankincense",
      latinName: "Boswellia serrata",
      plantPart: "Resin",
      aroma: "Warm, resinous, balsamic",
      color: "#d9a45b",
      description: "Steam-distilled from tree resin. Rich in alpha-pinene with a warm base that anchors blends and slows evaporation.",
      uses: ["Meditation blends", "Skin blends", "Fixative in perfumery"],
      safety: "Generally well tolerated; patch test for sensitive skin.",
      terpenes: [
        { terpeneId: "alpha-pinene", percent: 38 },
        { terpeneId: "limonene", percent: 12 },
        { terpeneId: "beta-caryophyllene", percent: 6 }
      ]
    },
    {
      id: "clove",
      name: "Clove Bud",
      latinName: "Syzygium aromaticum",
      plantPart: "Buds",
      aroma: "Warm, spicy, intense",
      color: "#c96f4a",
      description: "Steam-distilled from dried buds. Eugenol dominates at very high levels, giving it the unmistakable warm spice character.",
      uses: ["Spice blends", "Seasonal room blends", "Potpourri"],
      safety: "Potent; always dilute heavily. Can irritate skin and mucous membranes.",
      terpenes: [
        { terpeneId: "eugenol", percent: 80 },
        { terpeneId: "beta-caryophyllene", percent: 12 },
        { terpeneId: "alpha-humulene", percent: 3 }
      ]
    },
    {
      id: "sweet-orange",
      name: "Sweet Orange",
      latinName: "Citrus sinensis",
      plantPart: "Peel",
      aroma: "Sweet, juicy citrus",
      color: "#f59e42",
      description: "Cold-pressed from orange peel. One of the highest limonene contents of any oil, with a rounder, sweeter profile than lemon.",
      uses: ["Uplifting room blends", "Kitchen freshening", "Cleaning blends"],
      safety: "Mild phototoxicity risk; oxidized oil can irritate skin.",
      terpenes: [
        { terpeneId: "limonene", percent: 92 },
        { terpeneId: "myrcene", percent: 3 },
        { terpeneId: "alpha-pinene", percent: 1 }
      ]
    }
  ],

  terpenes: [
    {
      id: "limonene",
      name: "Limonene",
      class: "Monoterpene",
      formula: "C10H16",
      aroma: "Citrus",
      description: "The defining compound of citrus peels. One of the most abundant terpenes in nature and widely studied for mood, stress, and cleaning applications."
    },
    {
      id: "linalool",
      name: "Linalool",
      class: "Monoterpenoid",
      formula: "C10H18O",
      aroma: "Floral, soft",
      description: "The calming backbone of lavender. Among the most researched terpenes for relaxation and sleep-related outcomes."
    },
    {
      id: "linalyl-acetate",
      name: "Linalyl Acetate",
      class: "Monoterpenoid",
      formula: "C12H20O2",
      aroma: "Floral, fruity",
      description: "Ester partner to linalool in lavender; contributes the sweet, rounded floral top note."
    },
    {
      id: "menthol",
      name: "Menthol",
      class: "Monoterpenoid",
      formula: "C10H20O",
      aroma: "Cooling mint",
      description: "Activates TRPM8 cold receptors, producing the cooling sensation. The signature compound of peppermint."
    },
    {
      id: "menthone",
      name: "Menthone",
      class: "Monoterpenoid",
      formula: "C10H18O",
      aroma: "Minty, fresh",
      description: "Peppermint's secondary ketone; adds the sharp, fresh mint edge beneath menthol."
    },
    {
      id: "eucalyptol",
      name: "Eucalyptol (1,8-Cineole)",
      class: "Monoterpenoid",
      formula: "C10H18O",
      aroma: "Camphoraceous",
      description: "The penetrating compound in eucalyptus and rosemary. Studied for respiratory and anti-inflammatory applications."
    },
    {
      id: "terpinen-4-ol",
      name: "Terpinen-4-ol",
      class: "Monoterpenoid",
      formula: "C10H18O",
      aroma: "Peppery, green",
      description: "Tea tree's signature compound and the main driver of its documented antimicrobial activity."
    },
    {
      id: "alpha-pinene",
      name: "Alpha-Pinene",
      class: "Monoterpene",
      formula: "C10H16",
      aroma: "Pine, resinous",
      description: "The smell of pine forests. Common across conifers, frankincense, and rosemary; studied for alertness and respiratory effects."
    },
    {
      id: "beta-pinene",
      name: "Beta-Pinene",
      class: "Monoterpene",
      formula: "C10H16",
      aroma: "Woody pine",
      description: "Alpha-pinene's close relative; contributes dry woody notes to citrus and conifer oils."
    },
    {
      id: "beta-caryophyllene",
      name: "Beta-Caryophyllene",
      class: "Sesquiterpene",
      formula: "C15H24",
      aroma: "Spicy, woody",
      description: "A dietary sesquiterpene (also in black pepper) notable for interacting with CB2 receptors. Found in clove, copaiba, and lavender."
    },
    {
      id: "eugenol",
      name: "Eugenol",
      class: "Phenylpropanoid",
      formula: "C10H12O2",
      aroma: "Warm clove spice",
      description: "The warm spice of clove bud at up to 80%+. Long used in dentistry; potent, so dilution matters."
    },
    {
      id: "gamma-terpinene",
      name: "Gamma-Terpinene",
      class: "Monoterpene",
      formula: "C10H16",
      aroma: "Citrusy, herbal",
      description: "Common citrus and tea-tree constituent; contributes fresh herbal lift."
    },
    {
      id: "alpha-terpinene",
      name: "Alpha-Terpinene",
      class: "Monoterpene",
      formula: "C10H16",
      aroma: "Woody, citrus",
      description: "Tea tree and citrus constituent with a warm woody-citrus character."
    },
    {
      id: "alpha-humulene",
      name: "Alpha-Humulene",
      class: "Sesquiterpene",
      formula: "C15H24",
      aroma: "Woody, earthy",
      description: "Sesquiterpene in clove and hops; adds earthy depth."
    },
    {
      id: "myrcene",
      name: "Myrcene",
      class: "Monoterpene",
      formula: "C10H16",
      aroma: "Herbal, balsamic",
      description: "Common in citrus, hops, and cannabis; soft herbal-balsamic background note."
    }
  ],

  studies: [
    {
      id: "komori-1995-citrus",
      title: "Effects of citrus fragrance on immune function and depressive states",
      authors: "Komori T, Fujiwara R, Tanida M, Nomura J, Yokoyama MM",
      journal: "Neuroimmunomodulation",
      year: 1995,
      url: "https://pubmed.ncbi.nlm.nih.gov/8719697/",
      finding: "Citrus fragrance exposure was associated with normalized immune markers and reduced depressive scores in the study group.",
      oilIds: ["lemon"],
      terpeneIds: ["limonene"]
    },
    {
      id: "kasper-2010-silexan",
      title: "Efficacy of orally administered Silexan (lavender oil) in anxiety disorders",
      authors: "Kasper S, Gastpar M, Müller WE, et al.",
      journal: "International Journal of Neuropsychopharmacology",
      year: 2010,
      url: "https://pubmed.ncbi.nlm.nih.gov/20587112/",
      finding: "Lavender oil preparation showed anxiolytic effects in generalized anxiety in randomized controlled trials.",
      oilIds: ["lavender"],
      terpeneIds: ["linalool", "linalyl-acetate"]
    },
    {
      id: "carson-2006-teatree",
      title: "Melaleuca alternifolia (Tea Tree) Oil: a Review of Antimicrobial and Other Medicinal Properties",
      authors: "Carson CF, Hammer KA, Riley TV",
      journal: "Clinical Microbiology Reviews",
      year: 2006,
      url: "https://pubmed.ncbi.nlm.nih.gov/16428753/",
      finding: "Comprehensive review documenting tea tree oil's broad-spectrum antimicrobial activity, attributed largely to terpinen-4-ol.",
      oilIds: ["tea-tree"],
      terpeneIds: ["terpinen-4-ol"]
    },
    {
      id: "juergens-2003-cineole",
      title: "Anti-inflammatory activity of 1,8-cineol (eucalyptol) in bronchial asthma",
      authors: "Juergens UR, Dethlefsen U, Steinkraus G, Gillissen A, Repges R, Vetter H",
      journal: "Respiratory Medicine",
      year: 2003,
      url: "https://pubmed.ncbi.nlm.nih.gov/12657144/",
      finding: "1,8-cineole showed anti-inflammatory effects in asthma patients in a controlled trial setting.",
      oilIds: ["eucalyptus"],
      terpeneIds: ["eucalyptol"]
    },
    {
      id: "gertsch-2008-caryophyllene",
      title: "Beta-caryophyllene is a dietary cannabinoid",
      authors: "Gertsch J, Leonti M, Raduner S, et al.",
      journal: "Proceedings of the National Academy of Sciences",
      year: 2008,
      url: "https://pubmed.ncbi.nlm.nih.gov/18574142/",
      finding: "Beta-caryophyllene was identified as a selective CB2 receptor agonist, a first for a common dietary terpene.",
      oilIds: ["clove", "lavender", "frankincense"],
      terpeneIds: ["beta-caryophyllene"]
    }
  ]
};
