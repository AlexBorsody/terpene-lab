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
  "version": "0.5.1-research",
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
      "plantPart": "Aerial parts",
      "extraction": "Steam distillation",
      "aroma": [
        "herbal",
        "sharp",
        "phenolic"
      ],
      "color": "#71834c",
      "description": "A strongly aromatic oil whose chemotype can be dominated by carvacrol or thymol, with p-cymene and gamma-terpinene commonly present.",
      "uses": [
        "Research on microbial and biofilm activity",
        "Aromatic blends"
      ],
      "safety": "Potent and potentially irritating; chemotype and dilution matter.",
      "constituents": [
        {
          "compoundId": "carvacrol",
          "range": {
            "min": 20,
            "max": 80
          },
          "basis": "Chemotype-dependent published range"
        },
        {
          "compoundId": "thymol",
          "range": {
            "min": 1,
            "max": 25
          },
          "basis": "Chemotype-dependent published range"
        },
        {
          "compoundId": "p-cymene",
          "range": {
            "min": 3,
            "max": 20
          },
          "basis": "Chemotype-dependent published range"
        },
        {
          "compoundId": "gamma-terpinene",
          "range": {
            "min": 2,
            "max": 15
          },
          "basis": "Chemotype-dependent published range"
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
    },
    {
      "id": "cinnamon",
      "name": "Cinnamon Bark",
      "latinName": "Cinnamomum verum",
      "family": "Lauraceae",
      "plantPart": "Bark",
      "extraction": "Steam distillation",
      "aroma": [
        "warm",
        "woody",
        "spicy"
      ],
      "color": "#a95f45",
      "description": "Bark essential oil is typically dominated by cinnamaldehyde. Composition varies by Cinnamomum species, origin, and extraction.",
      "uses": [
        "Aromatic blends",
        "Research on microbial and biofilm activity"
      ],
      "safety": "Highly potent and irritating at inappropriate concentrations; requires careful dilution.",
      "constituents": [
        {
          "compoundId": "cinnamaldehyde",
          "range": {
            "min": 55,
            "max": 80
          },
          "basis": "Representative published bark-oil range; species and source dependent"
        },
        {
          "compoundId": "eugenol",
          "range": {
            "min": 2,
            "max": 10
          },
          "basis": "Representative bark-oil range; species and source dependent"
        }
      ]
    },
    {
      "id": "myrrh",
      "name": "Myrrh",
      "latinName": "Commiphora myrrha",
      "family": "Burseraceae",
      "plantPart": "Oleo-gum-resin",
      "extraction": "Steam distillation",
      "aroma": [
        "resinous",
        "earthy",
        "warm"
      ],
      "color": "#9b6545",
      "description": "Resin-derived aromatic material rich in furanosesquiterpenes; chemical profile varies substantially by Commiphora species and extraction.",
      "uses": [
        "Resinous aromatic blends",
        "Research on fungal activity"
      ],
      "safety": "Composition and safety depend on species and preparation; use appropriately diluted and avoid unsupported therapeutic use.",
      "constituents": [
        {
          "compoundId": "furanoeudesma-1-3-diene",
          "range": {
            "min": 15,
            "max": 45
          },
          "basis": "Representative literature range; highly source dependent"
        },
        {
          "compoundId": "curzerene",
          "range": {
            "min": 5,
            "max": 25
          },
          "basis": "Representative literature range; highly source dependent"
        }
      ]
    },
    {
      "aroma": [
        "herbaceous",
        "camphor",
        "clear"
      ],
      "color": "#6f9e7a",
      "constituents": [
        {
          "compoundId": "eucalyptol",
          "range": {
            "max": 50,
            "min": 35
          }
        },
        {
          "compoundId": "camphor",
          "range": {
            "max": 25,
            "min": 10
          }
        },
        {
          "compoundId": "alpha-pinene",
          "range": {
            "max": 20,
            "min": 10
          }
        }
      ],
      "description": "Steam-distilled from leaves. High in eucalyptol and camphor; the most researched oil for memory and alertness effects.",
      "extraction": "Steam distillation",
      "family": "Lamiaceae",
      "id": "rosemary",
      "latinName": "Rosmarinus officinalis",
      "name": "Rosemary",
      "plantPart": "Leaves",
      "safety": "Avoid in pregnancy and with epilepsy; may raise blood pressure.",
      "uses": [
        "Focus blends",
        "Study blends",
        "Morning diffusion"
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
    },
    {
      "id": "p-cymene",
      "name": "p-Cymene",
      "chemicalClass": "Monoterpene",
      "formula": "C10H14",
      "aroma": [
        "citrus",
        "herbal",
        "woody"
      ],
      "description": "A common aromatic monoterpene in oregano and thyme oils and a biosynthetic relative of carvacrol and thymol."
    },
    {
      "id": "furanoeudesma-1-3-diene",
      "name": "Furanoeudesma-1,3-diene",
      "chemicalClass": "Furanosesquiterpene",
      "formula": "C15H20O",
      "aroma": [
        "resinous",
        "myrrh"
      ],
      "description": "A characteristic furanosesquiterpene reported in Commiphora myrrh preparations."
    },
    {
      "id": "curzerene",
      "name": "Curzerene",
      "chemicalClass": "Furanosesquiterpene",
      "formula": "C15H20O",
      "aroma": [
        "resinous",
        "warm"
      ],
      "description": "A furanosesquiterpene reported in myrrh and other aromatic botanicals."
    },
    {
      "aroma": [
        "camphor",
        "sharp"
      ],
      "chemicalClass": "Monoterpenoid",
      "description": "Sharp, cooling compound prominent in rosemary; stimulating in aroma studies.",
      "formula": "C10H16O",
      "id": "camphor",
      "name": "Camphor"
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
    },
    {
      "id": "shen-2026-lavender-sleep-meta",
      "title": "The Sleep-Enhancing Effect of Lavender Essential Oil in Adults: A Systematic Review and Meta-Analysis",
      "authors": "Shen H, Zhang LJ, Zhu WY",
      "journal": "Holistic Nursing Practice",
      "year": 2026,
      "doi": "10.1097/HNP.0000000000000734",
      "pubmedId": "40600743",
      "url": "https://pubmed.ncbi.nlm.nih.gov/40600743/",
      "studyType": "systematic-review",
      "context": "human",
      "evidenceLevel": "review",
      "sampleSize": 628,
      "oilIds": [
        "lavender"
      ],
      "compoundIds": [],
      "categories": [
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "sleep"
        }
      ],
      "finding": "Meta-analysis of 11 randomized controlled trials reported a statistically significant improvement in adult sleep quality associated with lavender essential-oil interventions.",
      "limitations": "The authors noted limitations in the quantity and quality of included studies; interventions and routes varied."
    },
    {
      "id": "ribeiro-2024-eugenol-antibiofilm-review",
      "title": "Eugenol as a promising antibiofilm and anti-quorum sensing agent: A systematic review",
      "authors": "Ribeiro TAN, et al.",
      "journal": "Microbial Pathogenesis",
      "year": 2024,
      "doi": "10.1016/j.micpath.2024.106937",
      "pubmedId": "39293727",
      "url": "https://pubmed.ncbi.nlm.nih.gov/39293727/",
      "studyType": "systematic-review",
      "context": "in-vitro",
      "evidenceLevel": "review",
      "oilIds": [
        "clove"
      ],
      "compoundIds": [
        "eugenol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria"
        },
        {
          "type": "microbial",
          "subcategory": "biofilms"
        }
      ],
      "finding": "Systematic review of 14 eligible studies reported antibacterial, antibiofilm, anti-virulence and anti-quorum-sensing activity for eugenol across multiple bacterial strains.",
      "limitations": "Predominantly laboratory evidence; does not establish clinical or finished-product efficacy."
    },
    {
      "id": "pinto-2009-clove-antifungal",
      "title": "Antifungal activity of the clove essential oil from Syzygium aromaticum on Candida, Aspergillus and dermatophyte species",
      "authors": "Pinto E, Vale-Silva L, Cavaleiro C, Salgueiro L",
      "journal": "Journal of Medical Microbiology",
      "year": 2009,
      "doi": "10.1099/jmm.0.010538-0",
      "pubmedId": "19589904",
      "url": "https://pubmed.ncbi.nlm.nih.gov/19589904/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "oilIds": [
        "clove"
      ],
      "compoundIds": [
        "eugenol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "fungi",
          "topic": "yeast"
        },
        {
          "type": "microbial",
          "subcategory": "fungi",
          "topic": "mold"
        },
        {
          "type": "microbial",
          "subcategory": "fungi",
          "topic": "dermatophytes"
        }
      ],
      "finding": "Clove essential oil and eugenol inhibited tested Candida, Aspergillus and dermatophyte strains; experiments implicated fungal membrane damage and reduced ergosterol.",
      "limitations": "In-vitro study; results do not establish treatment efficacy in humans."
    },
    {
      "id": "firmino-2018-cinnamon-biofilm",
      "title": "Antibacterial and Antibiofilm Activities of Cinnamomum Sp. Essential Oil and Cinnamaldehyde: Antimicrobial Activities",
      "authors": "Firmino DF, et al.",
      "journal": "The Scientific World Journal",
      "year": 2018,
      "doi": "10.1155/2018/7405736",
      "pubmedId": "29977171",
      "url": "https://pubmed.ncbi.nlm.nih.gov/29977171/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "oilIds": [
        "cinnamon"
      ],
      "compoundIds": [
        "cinnamaldehyde"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria"
        },
        {
          "type": "microbial",
          "subcategory": "biofilms"
        }
      ],
      "finding": "C. zeylanicum and C. cassia bark oils and cinnamaldehyde exhibited antibacterial and antibiofilm activity against tested bacterial biofilms.",
      "limitations": "In-vitro concentrations and biofilm models do not establish efficacy of a consumer spray."
    },
    {
      "id": "kacaniova-2024-lemon",
      "title": "Citrus limon Essential Oil: Chemical Composition and Selected Biological Properties Focusing on Antimicrobial, Antibiofilm, Insecticidal Activity and Preservative Effect",
      "authors": "Kacaniova M, et al.",
      "journal": "Plants",
      "year": 2024,
      "doi": "10.3390/plants13040524",
      "pubmedId": "38498554",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38498554/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "oilIds": [
        "lemon"
      ],
      "compoundIds": [
        "limonene",
        "beta-pinene",
        "gamma-terpinene"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria"
        },
        {
          "type": "microbial",
          "subcategory": "fungi"
        },
        {
          "type": "microbial",
          "subcategory": "biofilms"
        },
        {
          "type": "pest",
          "subcategory": "flies"
        }
      ],
      "finding": "Lemon essential oil was characterized as 60.7% limonene, 12.6% beta-pinene and 10.3% gamma-terpinene and showed antimicrobial, antibiofilm and insecticidal activity in the reported laboratory and food-model assays.",
      "limitations": "Laboratory and food-model evidence; composition is batch-specific and not a universal lemon-oil percentage."
    },
    {
      "id": "obistioiu-2023-boswellia",
      "title": "Boswellia Essential Oil: Natural Antioxidant as an Effective Antimicrobial and Anti-Inflammatory Agent",
      "authors": "Obistioiu D, et al.",
      "journal": "Antioxidants",
      "year": 2023,
      "doi": "10.3390/antiox12101807",
      "pubmedId": "37891886",
      "url": "https://pubmed.ncbi.nlm.nih.gov/37891886/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "oilIds": [
        "frankincense"
      ],
      "compoundIds": [
        "alpha-pinene",
        "limonene"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria"
        },
        {
          "type": "microbial",
          "subcategory": "fungi"
        },
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "A commercial mixed-Boswellia essential oil dominated by alpha-pinene and limonene showed antimicrobial, antioxidant and anti-inflammatory activity in laboratory assays.",
      "limitations": "Commercial mixture of several Boswellia species; laboratory evidence only."
    },
    {
      "id": "mahboubi-2016-myrrh-dermatophyte",
      "title": "The anti-dermatophyte activity of Commiphora molmol",
      "authors": "Mahboubi M, Mohammad Taghizadeh Kashani L",
      "journal": "Pharmaceutical Biology",
      "year": 2016,
      "doi": "10.3109/13880209.2015.1072831",
      "pubmedId": "26427766",
      "url": "https://pubmed.ncbi.nlm.nih.gov/26427766/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "oilIds": [
        "myrrh"
      ],
      "compoundIds": [
        "furanoeudesma-1-3-diene",
        "curzerene"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "fungi",
          "topic": "dermatophytes"
        },
        {
          "type": "health",
          "subcategory": "skin"
        }
      ],
      "finding": "Myrrh essential oil and extract were evaluated against Trichophyton and Microsporum dermatophytes and showed antifungal activity in vitro.",
      "limitations": "In-vitro evidence; preparation and species identity matter and results do not establish clinical treatment efficacy."
    },
    {
      "id": "guo-2024-oregano-listeria",
      "title": "Inhibitory effect and mechanism of oregano essential oil on Listeria monocytogenes cells, toxins and biofilms",
      "authors": "Guo P, et al.",
      "journal": "Microbial Pathogenesis",
      "year": 2024,
      "doi": "10.1016/j.micpath.2024.106801",
      "pubmedId": "39025378",
      "url": "https://pubmed.ncbi.nlm.nih.gov/39025378/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "oilIds": [
        "oregano"
      ],
      "compoundIds": [
        "carvacrol",
        "thymol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria"
        },
        {
          "type": "microbial",
          "subcategory": "biofilms"
        },
        {
          "type": "cleaning",
          "subcategory": "surface"
        }
      ],
      "finding": "Oregano essential oil inhibited L. monocytogenes in laboratory assays and reduced biofilm coverage on glass slides; mechanistic experiments implicated multiple cellular effects.",
      "limitations": "Laboratory and food-model evidence; does not establish efficacy at consumer-product concentrations."
    },
    {
      "authors": "Moss M, Cook J, Wesnes K, Duckett P",
      "categories": [
        {
          "subcategory": "cognitive",
          "topic": "memory",
          "type": "health"
        }
      ],
      "compoundIds": [
        "eucalyptol",
        "alpha-pinene",
        "linalool"
      ],
      "context": "human",
      "doi": "10.1080/00207450390161903",
      "evidenceLevel": "clinical",
      "finding": "Rosemary aroma significantly improved overall memory quality and secondary memory versus controls, while lavender impaired working memory and slowed reaction times on memory and attention tasks.",
      "id": "moss-cook-2003",
      "journal": "International Journal of Neuroscience",
      "limitations": "Healthy young adults; single brief exposure; laboratory setting.",
      "oilIds": [
        "rosemary",
        "lavender"
      ],
      "pubmedId": "12690999",
      "sampleSize": 144,
      "studyType": "randomized-controlled-trial",
      "title": "Aromas of rosemary and lavender essential oils differentially affect cognition and mood in healthy adults",
      "url": "https://pubmed.ncbi.nlm.nih.gov/12690999/",
      "year": 2003
    },
    {
      "authors": "Chen PJ, Chou CC, Yang L, Tsai YL, et al.",
      "categories": [
        {
          "subcategory": "mental-health",
          "topic": "stress",
          "type": "health"
        },
        {
          "subcategory": "immune",
          "type": "health"
        }
      ],
      "compoundIds": [
        "linalool"
      ],
      "context": "human",
      "doi": "10.1089/acm.2016.0426",
      "evidenceLevel": "clinical",
      "finding": "Lavender aromatherapy massage lowered salivary cortisol and raised IgA immediately after treatment in pregnant women, with higher baseline IgA at 32 and 36 weeks versus study entry.",
      "id": "chen-chou-2017",
      "journal": "Journal of Alternative and Complementary Medicine",
      "limitations": "n=52; massage confound: aromatherapy massage compared against usual care, not massage alone.",
      "oilIds": [
        "lavender"
      ],
      "pubmedId": "28783372",
      "sampleSize": 52,
      "studyType": "randomized-controlled-trial",
      "title": "Effects of Aromatherapy Massage on Pregnant Women's Stress and Immune Function: A Longitudinal, Prospective, Randomized Controlled Trial",
      "url": "https://pubmed.ncbi.nlm.nih.gov/28783372/",
      "year": 2017
    },
    {
      "authors": "Can Çiçek S, Demir Ş, Yılmaz D, Açıkgöz A, et al.",
      "categories": [
        {
          "subcategory": "cardiovascular",
          "type": "health"
        }
      ],
      "compoundIds": [
        "linalool"
      ],
      "context": "human",
      "doi": "10.1097/HNP.0000000000000526",
      "evidenceLevel": "clinical",
      "finding": "Lavender aromatherapy by inhalation and foot massage reduced blood pressure, heart rate, serum cortisol, and anxiety in patients with essential hypertension.",
      "id": "can-cicek-2022",
      "journal": "Holistic Nursing Practice",
      "limitations": "Sample size not verifiable from abstract; single-center trial.",
      "oilIds": [
        "lavender"
      ],
      "pubmedId": "35708557",
      "sampleSize": null,
      "studyType": "randomized-controlled-trial",
      "title": "The Effect of Aromatherapy on Blood Pressure and Stress Responses by Inhalation and Foot Massage in Patients With Essential Hypertension: Randomized Clinical Trial",
      "url": "https://pubmed.ncbi.nlm.nih.gov/35708557/",
      "year": 2022
    },
    {
      "authors": "Mori HM, Kawanami H, Kawahata H, Aoki M, et al.",
      "categories": [
        {
          "subcategory": "wound",
          "type": "health"
        }
      ],
      "compoundIds": [
        "linalool"
      ],
      "context": "animal",
      "doi": "10.1186/s12906-016-1128-7",
      "evidenceLevel": "preclinical",
      "finding": "Topical lavender oil accelerated wound closure in rats from day 4 to 10, increasing TGF-beta expression, fibroblast numbers, and type I and III collagen.",
      "id": "mori-kawanami-2016",
      "journal": "BMC Complementary and Alternative Medicine",
      "limitations": "Rat model; no human wound-healing data.",
      "oilIds": [
        "lavender"
      ],
      "pubmedId": "27229681",
      "sampleSize": null,
      "studyType": "animal-study",
      "title": "Wound healing potential of lavender oil by acceleration of granulation and wound contraction through induction of TGF-β in a rat model",
      "url": "https://pubmed.ncbi.nlm.nih.gov/27229681/",
      "year": 2016
    },
    {
      "authors": "Schnitzler P, Schön K, Reichling J",
      "categories": [
        {
          "subcategory": "viruses",
          "type": "microbial"
        }
      ],
      "compoundIds": [
        "terpinen-4-ol",
        "eucalyptol"
      ],
      "context": "in-vitro",
      "doi": "",
      "evidenceLevel": "laboratory",
      "finding": "Tea tree oil reduced HSV-1 and HSV-2 plaque formation by 98.2% and 93.0% at noncytotoxic concentrations, acting before or during viral adsorption; eucalyptus oil showed weaker activity.",
      "id": "schnitzler-schon-2001",
      "journal": "Pharmazie",
      "limitations": "In-vitro cell culture only; active antiviral components unidentified.",
      "oilIds": [
        "tea-tree",
        "eucalyptus"
      ],
      "pubmedId": "11338678",
      "sampleSize": null,
      "studyType": "in-vitro-study",
      "title": "Antiviral activity of Australian tea tree oil and eucalyptus oil against herpes simplex virus in cell culture",
      "url": "https://pubmed.ncbi.nlm.nih.gov/11338678/",
      "year": 2001
    },
    {
      "authors": "Lee JH, Kim YG, Lee J, et al.",
      "categories": [
        {
          "subcategory": "biofilms",
          "type": "microbial"
        }
      ],
      "compoundIds": [
        "carvacrol",
        "thymol"
      ],
      "context": "in-vitro",
      "doi": "10.1111/jam.13602",
      "evidenceLevel": "laboratory",
      "finding": "Carvacrol-rich oregano oil and thymol-rich thyme oil inhibited uropathogenic E. coli biofilm formation at subinhibitory concentrations and reduced fimbriae, swarming motility, and hemagglutination.",
      "id": "lee-kim-2017",
      "journal": "Journal of Applied Microbiology",
      "limitations": "In-vitro; no human or clinical data.",
      "oilIds": [
        "oregano",
        "thyme"
      ],
      "pubmedId": "28980415",
      "sampleSize": null,
      "studyType": "in-vitro-study",
      "title": "Carvacrol-rich oregano oil and thymol-rich thyme red oil inhibit biofilm formation and the virulence of uropathogenic Escherichia coli",
      "url": "https://pubmed.ncbi.nlm.nih.gov/28980415/",
      "year": 2017
    },
    {
      "authors": "Kumar P, Mishra S, Malik A, Satya S, et al.",
      "categories": [
        {
          "subcategory": "flies",
          "type": "pest"
        }
      ],
      "compoundIds": [
        "menthol",
        "eucalyptol",
        "citral"
      ],
      "context": "environmental",
      "doi": "10.1111/j.1365-2915.2011.00945.x",
      "evidenceLevel": "laboratory",
      "finding": "Peppermint oil was the most effective housefly repellent of six oils screened, and formulated peppermint and eucalyptus oils cut fly density 96-98% in field trials.",
      "id": "kumar-mishra-2011",
      "journal": "Medical and Veterinary Entomology",
      "limitations": "Laboratory bioassays with limited field validation; not a human-use repellent trial.",
      "oilIds": [
        "peppermint",
        "eucalyptus",
        "lemongrass"
      ],
      "pubmedId": "21338379",
      "sampleSize": null,
      "studyType": "in-vitro-study",
      "title": "Repellent, larvicidal and pupicidal properties of essential oils and their formulations against the housefly, Musca domestica",
      "url": "https://pubmed.ncbi.nlm.nih.gov/21338379/",
      "year": 2011
    },
    {
      "authors": "Hur MH, Park J, Maddock-Jennings W, Kim DO, Lee MS",
      "categories": [
        {
          "subcategory": "odor",
          "type": "cleaning"
        }
      ],
      "compoundIds": [
        "terpinen-4-ol",
        "menthol",
        "limonene"
      ],
      "context": "human",
      "doi": "10.1002/ptr.2127",
      "evidenceLevel": "clinical",
      "finding": "An essential-oil mouthwash (tea tree, peppermint, lemon) reduced oral malodour and volatile sulphur compounds in ICU patients significantly more than benzydamine at one hour.",
      "id": "hur-park-2007",
      "journal": "Phytotherapy Research",
      "limitations": "n=32; single ICU; follow-up only one hour.",
      "oilIds": [
        "tea-tree",
        "peppermint",
        "lemon"
      ],
      "pubmedId": "17380550",
      "sampleSize": 32,
      "studyType": "controlled-human-study",
      "title": "Reduction of mouth malodour and volatile sulphur compounds in intensive care patients using an essential oil mouthwash",
      "url": "https://pubmed.ncbi.nlm.nih.gov/17380550/",
      "year": 2007
    },
    {
      "authors": "Ball EL, Owen-Booth B, Gray A, Shenkin SD, et al.",
      "categories": [
        {
          "subcategory": "cognitive",
          "topic": "memory",
          "type": "health"
        }
      ],
      "compoundIds": [
        "linalool"
      ],
      "context": "human",
      "doi": "10.1002/14651858.CD003150.pub3",
      "evidenceLevel": "review",
      "finding": "NULL RESULT: across 12 included trials, the Cochrane reviewers found no convincing evidence that aromatherapy benefits people with dementia, with very low certainty throughout.",
      "id": "ball-owen-booth-2020",
      "journal": "Cochrane Database of Systematic Reviews",
      "limitations": "Very low certainty evidence; inconsistent outcomes and poor harms reporting across trials.",
      "oilIds": [
        "lavender"
      ],
      "pubmedId": "32813272",
      "sampleSize": null,
      "studyType": "systematic-review",
      "title": "Aromatherapy for dementia",
      "url": "https://pubmed.ncbi.nlm.nih.gov/32813272/",
      "year": 2020
    },
    {
      "authors": "Kuriyama H, Watanabe S, Nakaya T, Shigemori I, et al.",
      "categories": [
        {
          "subcategory": "immune",
          "type": "health"
        }
      ],
      "compoundIds": [
        "linalool"
      ],
      "context": "human",
      "doi": "10.1093/ecam/neh087",
      "evidenceLevel": "clinical",
      "finding": "Aromatherapy massage increased peripheral blood lymphocytes, CD8+, and CD16+ cells compared with carrier-oil massage in 11 healthy adults.",
      "id": "kuriyama-watanabe-2005",
      "journal": "Evidence-Based Complementary and Alternative Medicine",
      "limitations": "n=11; preliminary; blend also contained cypress and sweet marjoram oils.",
      "oilIds": [
        "lavender"
      ],
      "pubmedId": "15937558",
      "sampleSize": 11,
      "studyType": "controlled-human-study",
      "title": "Immunological and Psychological Benefits of Aromatherapy Massage",
      "url": "https://pubmed.ncbi.nlm.nih.gov/15937558/",
      "year": 2005
    },
    {
      "authors": "Shiina Y, Funabashi N, Lee K, Toyoda T, et al.",
      "categories": [
        {
          "subcategory": "cardiovascular",
          "type": "health"
        }
      ],
      "compoundIds": [
        "linalool"
      ],
      "context": "human",
      "doi": "10.1016/j.ijcard.2007.06.064",
      "evidenceLevel": "clinical",
      "finding": "Lavender aromatherapy reduced serum cortisol and improved coronary flow velocity reserve in healthy men.",
      "id": "shiina-funabashi-2008",
      "journal": "International Journal of Cardiology",
      "limitations": "Small sample; acute effects only; healthy men.",
      "oilIds": [
        "lavender"
      ],
      "pubmedId": "17689755",
      "sampleSize": null,
      "studyType": "randomized-controlled-trial",
      "title": "Relaxation effects of lavender aromatherapy improve coronary flow velocity reserve in healthy men evaluated by transthoracic Doppler echocardiography",
      "url": "https://pubmed.ncbi.nlm.nih.gov/17689755/",
      "year": 2008
    },
    {
      "authors": "Ghaderi F, Solhjou N",
      "categories": [
        {
          "subcategory": "mental-health",
          "topic": "anxiety",
          "type": "health"
        }
      ],
      "compoundIds": [
        "linalool"
      ],
      "context": "human",
      "doi": "10.1016/j.ctcp.2020.101182",
      "evidenceLevel": "clinical",
      "finding": "Lavender aromatherapy during dental treatment lowered salivary cortisol, pulse rate, and injection pain scores in children aged 7 to 9.",
      "id": "ghaderi-solhjou-2020",
      "journal": "Complementary Therapies in Clinical Practice",
      "limitations": "n=24 crossover; pediatric dental setting only.",
      "oilIds": [
        "lavender"
      ],
      "pubmedId": "32891272",
      "sampleSize": 24,
      "studyType": "randomized-controlled-trial",
      "title": "The effects of lavender aromatherapy on stress and pain perception in children during dental treatment: A randomized clinical trial",
      "url": "https://pubmed.ncbi.nlm.nih.gov/32891272/",
      "year": 2020
    },
    {
      "authors": "Bikmoradi A, Seifi Z, Poorolajal J, Araghchian M, et al.",
      "categories": [
        {
          "subcategory": "mental-health",
          "topic": "stress",
          "type": "health"
        }
      ],
      "compoundIds": [
        "linalool"
      ],
      "context": "human",
      "doi": "10.1016/j.ctim.2014.12.001",
      "evidenceLevel": "clinical",
      "finding": "NULL RESULT: lavender inhalation aromatherapy had no significant effect on mental stress or vital signs after coronary bypass surgery, except for systolic blood pressure.",
      "id": "bikmoradi-seifi-2015",
      "journal": "Complementary Therapies in Medicine",
      "limitations": "n=60; single center; two-day intervention only.",
      "oilIds": [
        "lavender"
      ],
      "pubmedId": "26051567",
      "sampleSize": 60,
      "studyType": "randomized-controlled-trial",
      "title": "Effect of inhalation aromatherapy with lavender essential oil on stress and vital signs in patients undergoing coronary artery bypass surgery: A single-blinded randomized clinical trial",
      "url": "https://pubmed.ncbi.nlm.nih.gov/26051567/",
      "year": 2015
    },
    {
      "id": "halder-2011-clove-memory",
      "title": "Clove oil reverses learning and memory deficits in scopolamine-treated mice",
      "authors": "Halder S, Mehta AK, Kar R, Mustafa M, Mediratta PK, Sharma KK",
      "journal": "Planta Medica",
      "year": 2011,
      "doi": "10.1055/s-0030-1250605",
      "pubmedId": "21157682",
      "url": "https://pubmed.ncbi.nlm.nih.gov/21157682/",
      "studyType": "animal-study",
      "context": "animal",
      "evidenceLevel": "preclinical",
      "sampleSize": null,
      "oilIds": [
        "clove"
      ],
      "compoundIds": [
        "eugenol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "memory"
        }
      ],
      "finding": "In scopolamine-treated mice, repeated clove-oil pretreatment significantly reversed measures of acquisition and retention memory impairment in elevated-plus-maze and passive-avoidance tasks.",
      "limitations": "Mouse model using injected clove oil and pharmacologically induced memory impairment; does not establish cognitive benefit in humans or from normal aromatic use."
    },
    {
      "id": "halder-2012-clove-acute-cognition",
      "title": "Acute effect of essential oil of Eugenia caryophyllata on cognition and pain in mice",
      "authors": "Halder S, Mehta AK, Mediratta PK, Sharma KK",
      "journal": "Naunyn-Schmiedeberg's Archives of Pharmacology",
      "year": 2012,
      "doi": "10.1007/s00210-012-0742-2",
      "pubmedId": "22453493",
      "url": "https://pubmed.ncbi.nlm.nih.gov/22453493/",
      "studyType": "animal-study",
      "context": "animal",
      "evidenceLevel": "preclinical",
      "sampleSize": null,
      "oilIds": [
        "clove"
      ],
      "compoundIds": [
        "eugenol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "memory"
        },
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "Acute clove-oil administration significantly improved scopolamine-induced retention-memory deficits in mice at tested doses; the study also evaluated analgesic effects.",
      "limitations": "Mouse model with intraperitoneal administration and scopolamine-induced impairment; not evidence of human cognitive enhancement."
    },
    {
      "id": "eugenol-2021-memory-neurogenesis",
      "title": "Effects of Eugenol on Memory Performance, Neurogenesis, and Dendritic Complexity of Neurons in Mice Analyzed by Behavioral Tests and Golgi Staining of Brain Tissue",
      "authors": "Irie Y, et al.",
      "journal": "International Journal of Molecular Sciences",
      "year": 2021,
      "pubmedId": "34434006",
      "url": "https://pubmed.ncbi.nlm.nih.gov/34434006/",
      "studyType": "animal-study",
      "context": "animal",
      "evidenceLevel": "preclinical",
      "sampleSize": 21,
      "oilIds": [
        "clove"
      ],
      "compoundIds": [
        "eugenol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "memory"
        }
      ],
      "finding": "Oral eugenol increased spatial and recognition-memory measures in mice and was associated with increased neurogenesis and dendritic complexity in hippocampal regions, although Morris-water-maze escape latency was not significantly changed.",
      "limitations": "Small mouse study of isolated eugenol; findings do not establish cognitive benefit in humans or from clove-oil aroma."
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
