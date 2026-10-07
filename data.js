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
  "version": "0.3.0-sample",
  "categories": [
    {
      "type": "health",
      "label": "Health",
      "subcategories": [
        {
          "id": "mental-health",
          "label": "Mental health",
          "topics": [
            "anxiety",
            "stress",
            "mood",
            "sleep"
          ]
        },
        {
          "id": "cognitive",
          "label": "Cognitive",
          "topics": [
            "attention",
            "memory",
            "alertness"
          ]
        },
        {
          "id": "respiratory",
          "label": "Respiratory",
          "topics": []
        },
        {
          "id": "skin",
          "label": "Skin",
          "topics": []
        },
        {
          "id": "pain-inflammation",
          "label": "Pain / Inflammation",
          "topics": []
        },
        {
          "id": "oral-dental",
          "label": "Oral / Dental",
          "topics": []
        },
        {
          "id": "digestive",
          "label": "Digestive",
          "topics": []
        },
        {
          "id": "immune",
          "label": "Immune",
          "topics": []
        },
        {
          "id": "cardiovascular",
          "label": "Cardiovascular",
          "topics": []
        },
        {
          "id": "metabolic",
          "label": "Metabolic",
          "topics": []
        },
        {
          "id": "wound",
          "label": "Wound",
          "topics": []
        }
      ]
    },
    {
      "type": "cleaning",
      "label": "Cleaning",
      "subcategories": [
        {
          "id": "surface",
          "label": "Surface cleaning",
          "topics": []
        },
        {
          "id": "odor",
          "label": "Deodorization / Odor",
          "topics": []
        },
        {
          "id": "air",
          "label": "Air / Environmental",
          "topics": []
        },
        {
          "id": "laundry",
          "label": "Laundry / Textiles",
          "topics": []
        }
      ]
    },
    {
      "type": "microbial",
      "label": "Microbial",
      "subcategories": [
        {
          "id": "bacteria",
          "label": "Bacteria",
          "topics": [
            "gram-positive",
            "gram-negative"
          ]
        },
        {
          "id": "fungi",
          "label": "Fungi",
          "topics": [
            "yeast",
            "mold",
            "dermatophytes"
          ]
        },
        {
          "id": "viruses",
          "label": "Viruses",
          "topics": []
        },
        {
          "id": "biofilms",
          "label": "Biofilms",
          "topics": []
        }
      ]
    },
    {
      "type": "pest",
      "label": "Pest / Repellent",
      "subcategories": [
        {
          "id": "mosquitoes",
          "label": "Mosquitoes",
          "topics": []
        },
        {
          "id": "ticks",
          "label": "Ticks",
          "topics": []
        },
        {
          "id": "fleas",
          "label": "Fleas",
          "topics": []
        },
        {
          "id": "flies",
          "label": "Flies",
          "topics": []
        },
        {
          "id": "mites",
          "label": "Mites",
          "topics": []
        },
        {
          "id": "ants",
          "label": "Ants",
          "topics": []
        },
        {
          "id": "moths",
          "label": "Moths",
          "topics": []
        }
      ]
    }
  ],
  "oils": [
    {
      "id": "lemon",
      "name": "Lemon",
      "latinName": "Citrus limon",
      "family": "Rutaceae",
      "plantPart": "Peel",
      "extraction": "Cold-pressed",
      "aroma": [
        "citrus",
        "bright",
        "clean"
      ],
      "color": "#f2c230",
      "description": "Cold-pressed from lemon peel. Dominated by limonene, which gives it the sharp citrus character used across cleaning, fragrance, and flavor work.",
      "uses": [
        "Surface freshening",
        "Deodorizing",
        "DIY cleaners"
      ],
      "safety": "Phototoxic on skin in sunlight; avoid undiluted topical use.",
      "constituents": [
        {
          "compoundId": "limonene",
          "range": {
            "min": 60,
            "max": 75
          }
        },
        {
          "compoundId": "beta-pinene",
          "range": {
            "min": 10,
            "max": 15
          }
        },
        {
          "compoundId": "gamma-terpinene",
          "range": {
            "min": 7,
            "max": 12
          }
        }
      ]
    },
    {
      "id": "lavender",
      "name": "Lavender",
      "latinName": "Lavandula angustifolia",
      "family": "Lamiaceae",
      "plantPart": "Flowering tops",
      "extraction": "Steam distillation",
      "aroma": [
        "floral",
        "herbaceous",
        "soft"
      ],
      "color": "#9b7ed9",
      "description": "Steam-distilled from flowering tops. Linalool and linalyl acetate drive its well-studied calming profile.",
      "uses": [
        "Bedding and linen",
        "Evening routines",
        "Aromatic blends"
      ],
      "safety": "Generally well tolerated; patch test for sensitive skin.",
      "constituents": [
        {
          "compoundId": "linalool",
          "range": {
            "min": 25,
            "max": 40
          }
        },
        {
          "compoundId": "linalyl-acetate",
          "range": {
            "min": 25,
            "max": 40
          }
        },
        {
          "compoundId": "beta-caryophyllene",
          "range": {
            "min": 3,
            "max": 8
          }
        }
      ]
    },
    {
      "id": "peppermint",
      "name": "Peppermint",
      "latinName": "Mentha piperita",
      "family": "Lamiaceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "mint",
        "cooling",
        "sharp"
      ],
      "color": "#4fc08d",
      "description": "Steam-distilled from leaves. Menthol activates cold receptors, which is why it reads as cooling on skin and airways.",
      "uses": [
        "Focus blends",
        "Foot and shoe freshening",
        "Head tension balms"
      ],
      "safety": "Keep away from young children; can irritate eyes and mucous membranes.",
      "constituents": [
        {
          "compoundId": "menthol",
          "range": {
            "min": 35,
            "max": 50
          }
        },
        {
          "compoundId": "menthone",
          "range": {
            "min": 15,
            "max": 30
          }
        },
        {
          "compoundId": "eucalyptol",
          "range": {
            "min": 4,
            "max": 8
          }
        }
      ]
    },
    {
      "id": "eucalyptus",
      "name": "Eucalyptus",
      "latinName": "Eucalyptus globulus",
      "family": "Myrtaceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "camphor",
        "clearing",
        "sharp"
      ],
      "color": "#6fb7a6",
      "description": "Steam-distilled from leaves. Very high in 1,8-cineole (eucalyptol), the compound behind its penetrating, clearing aroma.",
      "uses": [
        "Shower steamers",
        "Chest blends",
        "Room clearing"
      ],
      "safety": "Do not use near infants; keep diluted and away from eyes.",
      "constituents": [
        {
          "compoundId": "eucalyptol",
          "range": {
            "min": 70,
            "max": 85
          }
        },
        {
          "compoundId": "alpha-pinene",
          "range": {
            "min": 5,
            "max": 12
          }
        },
        {
          "compoundId": "limonene",
          "range": {
            "min": 2,
            "max": 6
          }
        }
      ]
    },
    {
      "id": "tea-tree",
      "name": "Tea Tree",
      "latinName": "Melaleuca alternifolia",
      "family": "Myrtaceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "medicinal",
        "green",
        "sharp"
      ],
      "color": "#8fc16f",
      "description": "Steam-distilled from leaves. Terpinen-4-ol is the signature compound behind its long-documented antimicrobial profile.",
      "uses": [
        "Surface cleaning blends",
        "Skin spot blends",
        "Deodorizing"
      ],
      "safety": "For external use; can irritate sensitive skin undiluted.",
      "constituents": [
        {
          "compoundId": "terpinen-4-ol",
          "range": {
            "min": 35,
            "max": 48
          }
        },
        {
          "compoundId": "gamma-terpinene",
          "range": {
            "min": 18,
            "max": 25
          }
        },
        {
          "compoundId": "alpha-terpinene",
          "range": {
            "min": 8,
            "max": 12
          }
        }
      ]
    },
    {
      "id": "frankincense",
      "name": "Frankincense",
      "latinName": "Boswellia serrata",
      "family": "Burseraceae",
      "plantPart": "Resin",
      "extraction": "Steam distillation",
      "aroma": [
        "resinous",
        "warm",
        "balsamic"
      ],
      "color": "#d9a45b",
      "description": "Steam-distilled from tree resin. Rich in alpha-pinene with a warm base that anchors blends and slows evaporation.",
      "uses": [
        "Meditation blends",
        "Skin blends",
        "Fixative in perfumery"
      ],
      "safety": "Generally well tolerated; patch test for sensitive skin.",
      "constituents": [
        {
          "compoundId": "alpha-pinene",
          "range": {
            "min": 30,
            "max": 45
          }
        },
        {
          "compoundId": "limonene",
          "range": {
            "min": 8,
            "max": 15
          }
        },
        {
          "compoundId": "beta-caryophyllene",
          "range": {
            "min": 4,
            "max": 8
          }
        }
      ]
    },
    {
      "id": "clove",
      "name": "Clove Bud",
      "latinName": "Syzygium aromaticum",
      "family": "Myrtaceae",
      "plantPart": "Buds",
      "extraction": "Steam distillation",
      "aroma": [
        "spicy",
        "warm",
        "intense"
      ],
      "color": "#c96f4a",
      "description": "Steam-distilled from dried buds. Eugenol dominates at very high levels, giving it the unmistakable warm spice character.",
      "uses": [
        "Spice blends",
        "Seasonal room blends",
        "Potpourri"
      ],
      "safety": "Potent; always dilute heavily. Can irritate skin and mucous membranes.",
      "constituents": [
        {
          "compoundId": "eugenol",
          "range": {
            "min": 75,
            "max": 85
          }
        },
        {
          "compoundId": "beta-caryophyllene",
          "range": {
            "min": 8,
            "max": 15
          }
        },
        {
          "compoundId": "alpha-humulene",
          "range": {
            "min": 2,
            "max": 5
          }
        }
      ]
    },
    {
      "id": "sweet-orange",
      "name": "Sweet Orange",
      "latinName": "Citrus sinensis",
      "family": "Rutaceae",
      "plantPart": "Peel",
      "extraction": "Cold-pressed",
      "aroma": [
        "citrus",
        "sweet",
        "juicy"
      ],
      "color": "#f59e42",
      "description": "Cold-pressed from orange peel. One of the highest limonene contents of any oil, with a rounder, sweeter profile than lemon.",
      "uses": [
        "Uplifting room blends",
        "Kitchen freshening",
        "Cleaning blends"
      ],
      "safety": "Mild phototoxicity risk; oxidized oil can irritate skin.",
      "constituents": [
        {
          "compoundId": "limonene",
          "range": {
            "min": 90,
            "max": 95
          }
        },
        {
          "compoundId": "myrcene",
          "range": {
            "min": 2,
            "max": 4
          }
        },
        {
          "compoundId": "alpha-pinene",
          "range": {
            "min": 0.5,
            "max": 2
          }
        }
      ]
    },
    {
      "id": "citronella",
      "name": "Citronella",
      "latinName": "Cymbopogon nardus",
      "family": "Poaceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "citrus",
        "lemony",
        "sharp"
      ],
      "color": "#b8c96f",
      "description": "Steam-distilled from tropical grass leaves. Citronellal-rich and long used as a botanical insect repellent, though human evidence shows short protection times versus DEET.",
      "uses": [
        "Outdoor blends",
        "Patio candles",
        "Travel spray"
      ],
      "safety": "For external use; can irritate sensitive skin undiluted.",
      "constituents": [
        {
          "compoundId": "citronellal",
          "range": {
            "min": 30,
            "max": 45
          }
        },
        {
          "compoundId": "geraniol",
          "range": {
            "min": 18,
            "max": 28
          }
        },
        {
          "compoundId": "limonene",
          "range": {
            "min": 5,
            "max": 12
          }
        }
      ]
    },
    {
      "id": "thyme",
      "name": "Thyme",
      "latinName": "Thymus vulgaris",
      "family": "Lamiaceae",
      "plantPart": "Leaves and flowers",
      "extraction": "Steam distillation",
      "aroma": [
        "medicinal",
        "herbal",
        "warm"
      ],
      "color": "#8aa653",
      "description": "Steam-distilled from leaves and flowers. Thymol chemotype is one of the most potent antimicrobial essential oils in laboratory testing.",
      "uses": [
        "Surface cleaning blends",
        "Diffusion",
        "Research reference"
      ],
      "safety": "Potent; always dilute heavily. Avoid in pregnancy.",
      "constituents": [
        {
          "compoundId": "thymol",
          "range": {
            "min": 35,
            "max": 55
          }
        },
        {
          "compoundId": "carvacrol",
          "range": {
            "min": 5,
            "max": 15
          }
        }
      ]
    },
    {
      "id": "oregano",
      "name": "Oregano",
      "latinName": "Origanum vulgare",
      "family": "Lamiaceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "spicy",
        "warm",
        "pungent"
      ],
      "color": "#6b8f4e",
      "description": "Steam-distilled from leaves. Dominated by carvacrol, with strong in-vitro antibacterial activity documented across reviews.",
      "uses": [
        "Surface cleaning blends",
        "Research reference"
      ],
      "safety": "Very potent skin irritant; heavy dilution required. Avoid in pregnancy.",
      "constituents": [
        {
          "compoundId": "carvacrol",
          "range": {
            "min": 60,
            "max": 78
          }
        },
        {
          "compoundId": "thymol",
          "range": {
            "min": 5,
            "max": 15
          }
        }
      ]
    },
    {
      "id": "lemongrass",
      "name": "Lemongrass",
      "latinName": "Cymbopogon citratus",
      "family": "Poaceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "lemony",
        "grassy",
        "bright"
      ],
      "color": "#cdd25f",
      "description": "Steam-distilled from tropical grass. Citral gives it an intense lemon character; studied in repellent blends including PMD-based formulas.",
      "uses": [
        "Outdoor blends",
        "Kitchen freshening",
        "Cleaning blends"
      ],
      "safety": "Can irritate skin undiluted; use well diluted.",
      "constituents": [
        {
          "compoundId": "citral",
          "range": {
            "min": 65,
            "max": 85
          }
        },
        {
          "compoundId": "myrcene",
          "range": {
            "min": 10,
            "max": 16
          }
        }
      ]
    },
    {
      "id": "lemon-eucalyptus",
      "name": "Lemon Eucalyptus",
      "latinName": "Corymbia citriodora",
      "family": "Myrtaceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "citrus",
        "eucalyptus",
        "clean"
      ],
      "color": "#7fc8a9",
      "description": "Steam-distilled from leaves. Very high in citronellal; the refined derivative PMD (p-menthane-3,8-diol) is the botanical repellent with the strongest human evidence base.",
      "uses": [
        "Outdoor blends",
        "Travel spray",
        "Research reference"
      ],
      "safety": "For external use; keep away from eyes. PMD products: follow label age guidance.",
      "constituents": [
        {
          "compoundId": "citronellal",
          "range": {
            "min": 70,
            "max": 85
          }
        },
        {
          "compoundId": "geraniol",
          "range": {
            "min": 4,
            "max": 10
          }
        }
      ]
    }
  ],
  "compounds": [
    {
      "id": "limonene",
      "name": "Limonene",
      "chemicalClass": "Monoterpene",
      "formula": "C10H16",
      "aroma": [
        "citrus"
      ],
      "description": "The defining compound of citrus peels. One of the most abundant terpenes in nature and widely studied for mood, stress, and cleaning applications."
    },
    {
      "id": "linalool",
      "name": "Linalool",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H18O",
      "aroma": [
        "floral",
        "soft"
      ],
      "description": "The calming backbone of lavender. Among the most researched terpenes for relaxation and sleep-related outcomes."
    },
    {
      "id": "linalyl-acetate",
      "name": "Linalyl Acetate",
      "chemicalClass": "Monoterpenoid",
      "formula": "C12H20O2",
      "aroma": [
        "floral",
        "fruity"
      ],
      "description": "Ester partner to linalool in lavender; contributes the sweet, rounded floral top note."
    },
    {
      "id": "menthol",
      "name": "Menthol",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H20O",
      "aroma": [
        "mint",
        "cooling"
      ],
      "description": "Activates TRPM8 cold receptors, producing the cooling sensation. The signature compound of peppermint."
    },
    {
      "id": "menthone",
      "name": "Menthone",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H18O",
      "aroma": [
        "minty",
        "fresh"
      ],
      "description": "Peppermint's secondary ketone; adds the sharp, fresh mint edge beneath menthol."
    },
    {
      "id": "eucalyptol",
      "name": "Eucalyptol (1,8-Cineole)",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H18O",
      "aroma": [
        "camphor"
      ],
      "description": "The penetrating compound in eucalyptus and rosemary. Studied for respiratory and anti-inflammatory applications."
    },
    {
      "id": "terpinen-4-ol",
      "name": "Terpinen-4-ol",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H18O",
      "aroma": [
        "peppery",
        "green"
      ],
      "description": "Tea tree's signature compound and the main driver of its documented antimicrobial activity."
    },
    {
      "id": "alpha-pinene",
      "name": "Alpha-Pinene",
      "chemicalClass": "Monoterpene",
      "formula": "C10H16",
      "aroma": [
        "pine",
        "resinous"
      ],
      "description": "The smell of pine forests. Common across conifers, frankincense, and rosemary; studied for alertness and respiratory effects."
    },
    {
      "id": "beta-pinene",
      "name": "Beta-Pinene",
      "chemicalClass": "Monoterpene",
      "formula": "C10H16",
      "aroma": [
        "woody",
        "pine"
      ],
      "description": "Alpha-pinene's close relative; contributes dry woody notes to citrus and conifer oils."
    },
    {
      "id": "beta-caryophyllene",
      "name": "Beta-Caryophyllene",
      "chemicalClass": "Sesquiterpene",
      "formula": "C15H24",
      "aroma": [
        "spicy",
        "woody"
      ],
      "description": "A dietary sesquiterpene (also in black pepper) notable for interacting with CB2 receptors. Found in clove, copaiba, and lavender."
    },
    {
      "id": "eugenol",
      "name": "Eugenol",
      "chemicalClass": "Phenylpropanoid",
      "formula": "C10H12O2",
      "aroma": [
        "clove",
        "warm spice"
      ],
      "description": "The warm spice of clove bud at up to 85%. Long used in dentistry; potent, so dilution matters. Not a terpene: a phenylpropanoid."
    },
    {
      "id": "gamma-terpinene",
      "name": "Gamma-Terpinene",
      "chemicalClass": "Monoterpene",
      "formula": "C10H16",
      "aroma": [
        "citrusy",
        "herbal"
      ],
      "description": "Common citrus and tea-tree constituent; contributes fresh herbal lift."
    },
    {
      "id": "alpha-terpinene",
      "name": "Alpha-Terpinene",
      "chemicalClass": "Monoterpene",
      "formula": "C10H16",
      "aroma": [
        "woody",
        "citrus"
      ],
      "description": "Tea tree and citrus constituent with a warm woody-citrus character."
    },
    {
      "id": "alpha-humulene",
      "name": "Alpha-Humulene",
      "chemicalClass": "Sesquiterpene",
      "formula": "C15H24",
      "aroma": [
        "woody",
        "earthy"
      ],
      "description": "Sesquiterpene in clove and hops; adds earthy depth."
    },
    {
      "id": "myrcene",
      "name": "Myrcene",
      "chemicalClass": "Monoterpene",
      "formula": "C10H16",
      "aroma": [
        "herbal",
        "balsamic"
      ],
      "description": "Common in citrus, hops, and cannabis; soft herbal-balsamic background note."
    },
    {
      "id": "citronellal",
      "name": "Citronellal",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H18O",
      "aroma": [
        "citrus",
        "lemon"
      ],
      "description": "The lemony aldehyde behind citronella and lemon eucalyptus. Basis of most botanical repellent research."
    },
    {
      "id": "geraniol",
      "name": "Geraniol",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H18O",
      "aroma": [
        "rosy",
        "citronella"
      ],
      "description": "Floral-rosy alcohol common in citronella, geranium, and palmarosa."
    },
    {
      "id": "thymol",
      "name": "Thymol",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H14O",
      "aroma": [
        "medicinal",
        "herbal"
      ],
      "description": "Potent antimicrobial phenol; the signature compound of thyme oil."
    },
    {
      "id": "carvacrol",
      "name": "Carvacrol",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H14O",
      "aroma": [
        "warm",
        "spicy"
      ],
      "description": "Oregano signature phenol with broad documented in-vitro antibacterial activity."
    },
    {
      "id": "cinnamaldehyde",
      "name": "Cinnamaldehyde",
      "chemicalClass": "Phenylpropanoid",
      "formula": "C9H8O",
      "aroma": [
        "cinnamon",
        "warm"
      ],
      "description": "The defining compound of cinnamon bark. Not a terpene: a phenylpropanoid."
    },
    {
      "id": "citral",
      "name": "Citral",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H16O",
      "aroma": [
        "lemony",
        "sharp"
      ],
      "description": "Neral plus geranial; the intense lemon punch of lemongrass oil."
    },
    {
      "id": "pmd",
      "name": "PMD (p-menthane-3,8-diol)",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H20O2",
      "aroma": [
        "minty",
        "fresh"
      ],
      "description": "Refined from lemon eucalyptus citronellal. The botanical repellent compound with the strongest human trial evidence."
    }
  ],
  "studies": [
    {
      "id": "komori-1995-citrus",
      "title": "Effects of citrus fragrance on immune function and depressive states",
      "authors": "Komori T, Fujiwara R, Tanida M, Nomura J, Yokoyama MM",
      "journal": "Neuroimmunomodulation",
      "year": 1995,
      "pubmedId": "8719697",
      "url": "https://pubmed.ncbi.nlm.nih.gov/8719697/",
      "studyType": "controlled-human-study",
      "context": "human",
      "evidenceLevel": "clinical",
      "oilIds": [
        "lemon"
      ],
      "compoundIds": [
        "limonene"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "mood"
        }
      ],
      "finding": "Citrus fragrance exposure was associated with normalized immune markers and reduced depressive scores in the study group.",
      "limitations": "Small sample; early study design."
    },
    {
      "id": "kasper-2010-silexan",
      "title": "Silexan, an orally administered Lavandula oil preparation, is effective in the treatment of subsyndromal anxiety disorder",
      "authors": "Kasper S, Gastpar M, Muller WE, et al.",
      "journal": "International Journal of Neuropsychopharmacology",
      "year": 2010,
      "pubmedId": "20587112",
      "url": "https://pubmed.ncbi.nlm.nih.gov/20587112/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "oilIds": [
        "lavender"
      ],
      "compoundIds": [
        "linalool",
        "linalyl-acetate"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "anxiety"
        }
      ],
      "finding": "Lavender oil preparation showed anxiolytic effects in subsyndromal anxiety in a randomized controlled trial.",
      "limitations": "Used a standardized oral preparation, not diffused oil."
    },
    {
      "id": "carson-2006-teatree",
      "title": "Melaleuca alternifolia (Tea Tree) Oil: a Review of Antimicrobial and Other Medicinal Properties",
      "authors": "Carson CF, Hammer KA, Riley TV",
      "journal": "Clinical Microbiology Reviews",
      "year": 2006,
      "pubmedId": "16428753",
      "url": "https://pubmed.ncbi.nlm.nih.gov/16428753/",
      "studyType": "narrative-review",
      "context": "in-vitro",
      "evidenceLevel": "review",
      "oilIds": [
        "tea-tree"
      ],
      "compoundIds": [
        "terpinen-4-ol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria"
        },
        {
          "type": "microbial",
          "subcategory": "fungi"
        }
      ],
      "finding": "Comprehensive review documenting tea tree oil's broad-spectrum antimicrobial activity, attributed largely to terpinen-4-ol.",
      "limitations": "Review of mostly in-vitro work; not clinical efficacy evidence."
    },
    {
      "id": "juergens-2003-cineole",
      "title": "Anti-inflammatory activity of 1,8-cineol (eucalyptol) in bronchial asthma: a double-blind placebo-controlled trial",
      "authors": "Juergens UR, Dethlefsen U, Steinkraus G, Gillissen A, Repges R, Vetter H",
      "journal": "Respiratory Medicine",
      "year": 2003,
      "pubmedId": "12657144",
      "url": "https://pubmed.ncbi.nlm.nih.gov/12657144/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "oilIds": [
        "eucalyptus"
      ],
      "compoundIds": [
        "eucalyptol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "respiratory"
        }
      ],
      "finding": "1,8-cineole showed anti-inflammatory effects in asthma patients in a controlled trial setting.",
      "limitations": "Tested isolated 1,8-cineole capsules, not eucalyptus oil."
    },
    {
      "id": "gertsch-2008-caryophyllene",
      "title": "Beta-caryophyllene is a dietary cannabinoid",
      "authors": "Gertsch J, Leonti M, Raduner S, et al.",
      "journal": "Proceedings of the National Academy of Sciences",
      "year": 2008,
      "pubmedId": "18574142",
      "url": "https://pubmed.ncbi.nlm.nih.gov/18574142/",
      "studyType": "mechanistic-study",
      "context": "animal",
      "evidenceLevel": "preclinical",
      "oilIds": [
        "clove",
        "lavender",
        "frankincense"
      ],
      "compoundIds": [
        "beta-caryophyllene"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "Beta-caryophyllene was identified as a selective CB2 receptor agonist with anti-inflammatory effects in animal models.",
      "limitations": "Animal and cell models; not human efficacy data."
    },
    {
      "id": "lillehei-halcon-2014",
      "title": "A Systematic Review of the Effect of Inhaled Essential Oils on Sleep",
      "authors": "Lillehei AS, Halcon LL",
      "journal": "Journal of Alternative and Complementary Medicine",
      "year": 2014,
      "doi": "10.1089/acm.2013.0311",
      "pubmedId": "24720812",
      "url": "https://pubmed.ncbi.nlm.nih.gov/24720812/",
      "studyType": "systematic-review",
      "context": "human",
      "evidenceLevel": "review",
      "sampleSize": null,
      "oilIds": [
        "lavender",
        "peppermint"
      ],
      "compoundIds": [
        "linalool",
        "menthol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "sleep"
        }
      ],
      "finding": "Across 15 studies, the majority reported improved sleep with inhaled essential oils, most commonly lavender, and no adverse events were reported.",
      "limitations": "Small sample sizes across included studies; stronger study designs needed (per the authors)."
    },
    {
      "id": "khanna-macdonald-levesque-2014",
      "title": "Peppermint Oil for the Treatment of Irritable Bowel Syndrome: A Systematic Review and Meta-analysis",
      "authors": "Khanna R, MacDonald JK, Levesque BG",
      "journal": "Journal of Clinical Gastroenterology",
      "year": 2014,
      "doi": "10.1097/MCG.0b013e3182a88357",
      "pubmedId": "24100754",
      "url": "https://pubmed.ncbi.nlm.nih.gov/24100754/",
      "studyType": "systematic-review",
      "context": "human",
      "evidenceLevel": "review",
      "sampleSize": 726,
      "oilIds": [
        "peppermint"
      ],
      "compoundIds": [
        "menthol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "digestive",
          "topic": "ibs"
        }
      ],
      "finding": "Peppermint oil outperformed placebo for global IBS symptoms (RR 2.23) and abdominal pain (RR 2.14) across 726 patients, with mild transient adverse events.",
      "limitations": "Substantial heterogeneity among trials; adverse events sparsely reported."
    },
    {
      "id": "bassett-pannowitz-barnetson-1990",
      "title": "A comparative study of tea-tree oil versus benzoylperoxide in the treatment of acne",
      "authors": "Bassett IB, Pannowitz DL, Barnetson RS",
      "journal": "Medical Journal of Australia",
      "year": 1990,
      "doi": "10.5694/j.1326-5377.1990.tb126150.x",
      "pubmedId": "2145499",
      "url": "https://pubmed.ncbi.nlm.nih.gov/2145499/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 124,
      "oilIds": [
        "tea-tree"
      ],
      "compoundIds": [
        "terpinen-4-ol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "skin",
          "topic": "acne"
        }
      ],
      "finding": "Both 5% tea tree oil gel and 5% benzoyl peroxide significantly reduced inflamed and non-inflamed acne lesions over three months, with tea tree showing slower onset but fewer side effects.",
      "limitations": "Single-blind design; older trial; acne lesion counts are observer-dependent."
    },
    {
      "id": "fradin-day-2002",
      "title": "Comparative efficacy of insect repellents against mosquito bites",
      "authors": "Fradin MS, Day JF",
      "journal": "New England Journal of Medicine",
      "year": 2002,
      "doi": "10.1056/NEJMoa011699",
      "pubmedId": "12097535",
      "url": "https://pubmed.ncbi.nlm.nih.gov/12097535/",
      "studyType": "controlled-human-study",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 15,
      "oilIds": [
        "citronella"
      ],
      "compoundIds": [
        "citronellal"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "mosquitoes",
          "topic": "repellency"
        }
      ],
      "finding": "NEGATIVE RESULT for botanical repellents: citronella-based products protected for under 20 minutes versus 301.5 minutes for 23.8% DEET, leading the authors to conclude non-DEET products cannot be relied on for prolonged protection.",
      "limitations": "Small sample (n=15) and laboratory-style arm tests; short-term testing only."
    },
    {
      "id": "gobel-schmidt-soyka-1994",
      "title": "Effect of peppermint and eucalyptus oil preparations on neurophysiological and experimental algesimetric headache parameters",
      "authors": "Göbel H, Schmidt G, Soyka D",
      "journal": "Cephalalgia",
      "year": 1994,
      "doi": "10.1046/j.1468-2982.1994.014003228.x",
      "pubmedId": "7954745",
      "url": "https://pubmed.ncbi.nlm.nih.gov/7954745/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 32,
      "oilIds": [
        "peppermint",
        "eucalyptus"
      ],
      "compoundIds": [
        "menthol",
        "eucalyptol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "pain-inflammation",
          "topic": "headache"
        }
      ],
      "finding": "Peppermint oil with ethanol significantly reduced headache sensitivity (analgesic effect), while the peppermint-eucalyptus-ethanol combination improved cognitive performance with a muscle-relaxing effect.",
      "limitations": "Small sample (n=32); laboratory algesimetric measures rather than real-world headache outcomes."
    },
    {
      "id": "alqareer-alyahya-andersson-2006",
      "title": "The effect of clove and benzocaine versus placebo as topical anesthetics",
      "authors": "Alqareer A, Alyahya A, Andersson L",
      "journal": "Journal of Dentistry",
      "year": 2006,
      "doi": "10.1016/j.jdent.2006.01.009",
      "pubmedId": "16530911",
      "url": "https://pubmed.ncbi.nlm.nih.gov/16530911/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 73,
      "oilIds": [
        "clove"
      ],
      "compoundIds": [
        "eugenol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "oral-dental",
          "topic": "toothache"
        }
      ],
      "finding": "Clove gel and 20% benzocaine produced significantly lower pain scores than placebos with no significant difference between the two, supporting clove gel as a topical anesthetic alternative.",
      "limitations": "Short-term pain scores only; single application; no dose-response testing."
    },
    {
      "id": "burt-2004",
      "title": "Essential oils: their antibacterial properties and potential applications in foods—a review",
      "authors": "Burt S",
      "journal": "International Journal of Food Microbiology",
      "year": 2004,
      "doi": "10.1016/j.ijfoodmicro.2004.03.022",
      "pubmedId": "15246235",
      "url": "https://pubmed.ncbi.nlm.nih.gov/15246235/",
      "studyType": "narrative-review",
      "context": "in-vitro",
      "evidenceLevel": "review",
      "sampleSize": null,
      "oilIds": [
        "thyme",
        "oregano"
      ],
      "compoundIds": [
        "thymol",
        "carvacrol",
        "eugenol",
        "cinnamaldehyde"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria",
          "topic": "gram-positive"
        },
        {
          "type": "microbial",
          "subcategory": "bacteria",
          "topic": "gram-negative"
        }
      ],
      "finding": "In vitro, thyme and oregano essential oils and their constituents (thymol, carvacrol, eugenol, cinnamaldehyde) inhibited Listeria, Salmonella, and E. coli O157:H7 at 0.2–10 µl/ml, though higher concentrations were required in foods.",
      "limitations": "Review of in-vitro work; food-matrix effects limit direct translation to products."
    },
    {
      "id": "graham-browne-cox-2003",
      "title": "Inhalation aromatherapy during radiotherapy: results of a placebo-controlled double-blind randomized trial",
      "authors": "Graham PH, Browne L, Cox H, et al.",
      "journal": "Journal of Clinical Oncology",
      "year": 2003,
      "doi": "10.1200/JCO.2003.10.126",
      "pubmedId": "12805340",
      "url": "https://pubmed.ncbi.nlm.nih.gov/12805340/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 313,
      "oilIds": [
        "lavender"
      ],
      "compoundIds": [
        "linalool"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "anxiety"
        }
      ],
      "finding": "NULL RESULT: in 313 radiotherapy patients, inhaled aromatherapy (lavender/bergamot/cedarwood) did not significantly reduce anxiety or depression versus carrier-oil controls.",
      "limitations": "Self-report outcome measures; radiotherapy setting may limit generalizability."
    },
    {
      "id": "buck-nidorf-addino-1994",
      "title": "Comparison of two topical preparations for the treatment of onychomycosis: Melaleuca alternifolia (tea tree) oil and clotrimazole",
      "authors": "Buck DS, Nidorf DM, Addino JG",
      "journal": "Journal of Family Practice",
      "year": 1994,
      "doi": "",
      "pubmedId": "8195735",
      "url": "https://pubmed.ncbi.nlm.nih.gov/8195735/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 117,
      "oilIds": [
        "tea-tree"
      ],
      "compoundIds": [
        "terpinen-4-ol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "fungi",
          "topic": "dermatophytes"
        }
      ],
      "finding": "After 6 months of twice-daily application in 117 patients with culture-proven toenail onychomycosis, 100% tea tree oil and 1% clotrimazole produced comparable culture cure (TT 18%, CL 11%) and partial-or-full clinical resolution (TT 60%, CL 61%).",
      "limitations": "High recurrence after treatment; no DOI on PubMed record; older trial."
    },
    {
      "id": "jaenson-garboui-palsson-2006",
      "title": "Repellency of oils of lemon eucalyptus, geranium, and lavender and the mosquito repellent MyggA natural to Ixodes ricinus (Acari: Ixodidae) in the laboratory and field",
      "authors": "Jaenson TGT, Garboui S, Pålsson K",
      "journal": "Journal of Medical Entomology",
      "year": 2006,
      "doi": "10.1603/0022-2585(2006)43[731:rooole]2.0.co;2",
      "pubmedId": "16892632",
      "url": "https://pubmed.ncbi.nlm.nih.gov/16892632/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lavender"
      ],
      "compoundIds": [
        "linalool",
        "pmd"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "ticks",
          "topic": "repellency"
        }
      ],
      "finding": "Lemon eucalyptus oil (C. citriodora, minimum 50% PMD) and lavender oil at 30% each showed 100% repellency against I. ricinus nymphs in lab bioassays, and 74–85% repellency on day 1 of field blanket-drag tests, declining to 42–45% by day 6.",
      "limitations": "Field repellency declined over days; blanket-dragging is an indirect measure of human protection."
    },
    {
      "id": "moore-darling-sihuincha-2007",
      "title": "A low-cost repellent for malaria vectors in the Americas: results of two field trials in Guatemala and Peru",
      "authors": "Moore SJ, Darling ST, Sihuincha M, Padilla N, Devine GJ",
      "journal": "Malaria Journal",
      "year": 2007,
      "doi": "10.1186/1475-2875-6-101",
      "pubmedId": "17678537",
      "url": "https://pubmed.ncbi.nlm.nih.gov/17678537/",
      "studyType": "controlled-human-study",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": null,
      "oilIds": [
        "lemongrass"
      ],
      "compoundIds": [
        "pmd"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "mosquitoes",
          "topic": "repellency"
        }
      ],
      "finding": "A low-cost PMD/lemongrass-oil repellent gave over 98% protection for 5 hours in Guatemala and 95% for 6 hours in Peru, significantly exceeding the 15–20% DEET controls (92% and 64%) under high biting pressure.",
      "limitations": "Single-night Latin-square trials per site; efficacy measured by landing counts, not malaria infection outcomes."
    },
    {
      "id": "sateriale-forgione-2024",
      "title": "Eco-Friendly Sanitization of Indoor Environments: Effectiveness of Thyme Essential Oil in Controlling Bioaerosol Levels and Disinfecting Surfaces",
      "authors": "Sateriale D, Forgione G, De Cristofaro GA, Continisio L, Pagliuca C, Colicchio R, et al.",
      "journal": "BioTech",
      "year": 2024,
      "doi": "10.3390/biotech13020012",
      "pubmedId": "38804294",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38804294/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "thyme"
      ],
      "compoundIds": [
        "thymol"
      ],
      "categories": [
        {
          "type": "cleaning",
          "subcategory": "surface",
          "topic": "disinfection"
        },
        {
          "type": "cleaning",
          "subcategory": "air",
          "topic": "bioaerosols"
        }
      ],
      "finding": "Aqueous thyme essential oil solutions (2.5% and 5%) applied by nebulization and direct contact reduced mesophilic and psychrophilic bacteria and environmental fungi in both air and on indoor surfaces.",
      "limitations": "Indoor trial settings; long-term efficacy and cost-effectiveness not assessed."
    }
  ],
  "sources": [
    {
      "id": "src-composition-note",
      "label": "Sample composition ranges: typical published GC-MS values; replace with cited sources in research pass.",
      "url": ""
    }
  ]
};
