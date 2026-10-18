/* ============================================================================
   TERPENE LAB - data file
   ----------------------------------------------------------------------------
   SAMPLE DATA v0.2 - implements the spec.md schema. Replace with research.

   Top-level: { version, blendBuilder, categories, oils, compounds, studies, sources }

   categories: controlled taxonomy of research domains.
     { type, label, subcategories: [{ id, label, topics: [] }] }

   oils:
     { id, name, latinName, family, plantPart, extraction, aroma: [],
       color, description, uses: [], safety,
       constituents: [{ compoundId, range: {min, max}, basis, sourceIds: [],
         material, sample, extraction, method }], chemicalEvidence: [], blend? }
     Composition uses RANGES, not false single-number precision.

   blendBuilder: versioned, descriptive starter catalog and product configuration.
     product totalOilLoadPercent and totalOilMaxPercent refer to the finished
     product, not to percentages within the essential-oil portion.
     product.shopifyStoreUrl is the verified storefront origin; shopifyVariantId
     stays null until the $40 USD / standard 8 oz Custom Blend variant is verified.
     Cart permalinks carry one readable Recipe property and require manual review.
     baseVersion is optional; null means no base identifier has been supplied.
   oils[].blend: opt-in builder records. Missing/null safety values mean unknown,
     never safe. availability:'unconfirmed' is not an inventory assertion.
     qualityMappings: { qualityId, evidenceTier, summary, studyId, pmid, url,
       limitations, supportsSuggestion }. Counterevidence remains visible;
       supportsSuggestion:false must not count as positive recommendation support.
     safetyReviewStatus:'unverified' means no leave-on formulation clearance.
     legacySafetyNotes are preserved for audit only and are not verified limits.
     Empty interactions/cautionThresholds mean no validated entries yet, not none
     exist. researchGaps describe missing evidence in this catalog only.

   compounds (terpenes & compounds):
     { id, name, chemicalClass, functionalGroups: [], aliases: [],
       formula, aroma: [], description, volatility, sourceIds: [] }

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
  "version": "0.8.0-beyond-terpenes",
  "blendBuilder": {
    "version": "1",
    "catalogVersion": "2026-10-18",
    "qualities": [
      {
        "id": "calm",
        "label": "Calm",
        "description": "Explore the purported calm quality and the limits of ingredient research on relaxation-related experiences. No finished-spray effect is established."
      },
      {
        "id": "focus",
        "label": "Focus",
        "description": "Explore the purported focus quality through short-term aroma, attention and memory research. Findings can be mixed and do not establish everyday performance benefits."
      },
      {
        "id": "sleep",
        "label": "Sleep / wind-down",
        "description": "Explore the purported sleep / wind-down quality. Ingredient sleep studies do not establish that this cosmetic spray improves sleep or treats a sleep condition."
      },
      {
        "id": "uplifting",
        "label": "Uplifting",
        "description": "Explore the purported uplifting quality through limited studies of subjective contentment and mood. These are not claims of a lasting mood benefit from the spray."
      }
    ],
    "product": {
      "name": "Custom Blend",
      "price": 40,
      "currency": "USD",
      "size": "8 oz",
      "totalOilLoadPercent": null,
      "totalOilLoadSource": null,
      "totalOilMaxPercent": null,
      "totalOilMaxSource": null,
      "shopifyStoreUrl": "https://sunnysshield.com",
      "shopifyVariantId": null,
      "baseVersion": null
    },
    "starterOilIds": [
      "lavender",
      "rosemary",
      "peppermint",
      "lemon",
      "sweet-orange",
      "bergamot",
      "ylang-ylang",
      "frankincense"
    ]
  },
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
    },
    {
      "type": "sensory",
      "label": "Aroma / Sensory",
      "subcategories": [
        {
          "id": "aroma-chemistry",
          "label": "Aroma chemistry",
          "topics": [
            "volatile compounds",
            "sensory perception"
          ]
        }
      ]
    },
    {
      "type": "botanical",
      "label": "Botanical chemistry",
      "subcategories": [
        {
          "id": "nonvolatile-chemistry",
          "label": "Nonvolatile chemistry",
          "topics": [
            "flavonoid chemistry"
          ]
        },
        {
          "id": "composition",
          "label": "Composition analysis",
          "topics": [
            "essential-oil composition",
            "flavonoid analysis"
          ]
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
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "quantified",
          "compoundIds": [
            "geranyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Kibris cultivar Citrus limon peel oil; cold-pressed comparison column",
          "extraction": "cold pressing",
          "method": "GC/GC-MS extraction comparison",
          "finding": "Geranyl acetate was reported in the cold-pressed Kibris column.",
          "sourceIds": [
            "cx01"
          ],
          "valueState": "transcribed",
          "range": {
            "min": 0.56,
            "max": 0.56
          },
          "basis": "Relative chromatographic peak-area %, not mass percentage; cited sample only",
          "analyte": "Geranyl acetate",
          "limitations": "Cultivar-specific. Hydrodistilled and supercritical-extract columns are separate samples."
        },
        {
          "group": "aldehyde",
          "status": "reported-unquantified",
          "compoundIds": [
            "citral",
            "citronellal"
          ],
          "material": "Essential oil",
          "sample": "Kibris cultivar Citrus limon peel oil; cold-pressed comparison column",
          "extraction": "cold pressing",
          "method": "GC/GC-MS extraction comparison",
          "finding": "Octanal, nonanal, decanal, neral, geranial and citronellal were reported. Source-specific numbers are not imported.",
          "sourceIds": [
            "cx01"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Cultivar-specific. Hydrodistilled and supercritical-extract columns are separate samples."
        },
        {
          "group": "thiol",
          "status": "reported-unquantified",
          "compoundIds": [
            "prenylthiol"
          ],
          "material": "Peel solvent extract",
          "sample": "Lisbon cultivar Citrus limon peel solvent extract",
          "extraction": "solvent extraction of peel",
          "method": "Analytical identification and structural characterization",
          "finding": "Prenylthiol and a thiol-bearing acetate ester were identified in Lisbon peel extract. This leaves a gap for cold-pressed oil.",
          "sourceIds": [
            "cx02"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Peel extract is not cold-pressed commercial lemon essential oil."
        },
        {
          "group": "flavonoid",
          "status": "not-found",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Authentic lemon and orange essential-oil profiles",
          "extraction": "Oil preparations compared in publication",
          "method": "HPLC-UV-MS and GC comparison",
          "finding": "No direct positive PMF record for cold-pressed lemon oil is established by this curated source.",
          "sourceIds": [
            "cx03"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Selected lemon samples lacked PMFs. Coumarins and furanocoumarins are not flavonoids; non-detection is not universal absence."
        }
      ],
      "blend": {
        "enabled": true,
        "availability": "unconfirmed",
        "qualityMappings": [
          {
            "qualityId": "calm",
            "evidenceTier": "human clinical",
            "summary": "Research relevant to the purported calm quality: a small randomized study reported lower test-anxiety scores after a brief exposure to lemon essential-oil aroma than in its control group.",
            "studyId": "lemon-test-anxiety-2022",
            "pmid": "35190270",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35190270/",
            "limitations": "46 nursing students and one acute test setting. This is whole lemon oil, not isolated limonene; the result does not establish treatment of anxiety or lasting relaxation. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          }
        ],
        "dermalMaxPercent": null,
        "dermalMaxSource": null,
        "cautionThresholds": [],
        "phototoxic": null,
        "sensitizationNotes": "No verified sensitization assessment yet for this oil in the proposed leave-on spray. Legacy profile notes are unaudited and do not establish formulation safety.",
        "petSafer": null,
        "petSource": null,
        "interactions": [],
        "safetyReviewStatus": "unverified",
        "legacySafetyNotes": "Phototoxic on skin in sunlight; avoid undiluted topical use.",
        "legacySafetyNotesVerified": false,
        "researchGaps": [
          "Earlier citrus-fragrance research is not treated as lemon-only evidence for an uplifting quality.",
          "No verified focus, sleep or uplifting mapping for this oil is provided in the starter catalog."
        ],
        "relatedStudyIds": [
          "komori-1995-citrus"
        ]
      }
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
            "max": 38
          },
          "basis": "ISO 11024 specification cited in GC-MS study"
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
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "reported-unquantified",
          "compoundIds": [
            "linalyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Lavender steam-distilled/hydrodistilled comparison",
          "extraction": "Dry steam distillation and hydrodistillation, kept separate",
          "method": "GC-MS comparison",
          "finding": "Linalyl acetate, lavandulyl acetate and hexyl butanoate occur in the extraction comparison. Sample-column values are not imported.",
          "sourceIds": [
            "cx17"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Scale, drying and method vary together. Column-specific amounts are not imported."
        },
        {
          "group": "ester",
          "status": "reported-unquantified",
          "compoundIds": [
            "geranyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Lavandula angustifolia aerial-parts oil from Xinjiang",
          "extraction": "hydrodistillation",
          "method": "GC-MS, preparative GC and NMR",
          "finding": "Bornyl formate, bornyl acetate, neryl acetate and geranyl acetate were reported in the hydrodistilled study oil.",
          "sourceIds": [
            "cx11"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Different preparation from the catalog steam-distilled oil. Reported elemental S8 is not an organic thiol; replication/provenance is unresolved."
        },
        {
          "group": "aldehyde",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Lavandula angustifolia aerial-parts oil from Xinjiang",
          "extraction": "hydrodistillation",
          "method": "GC-MS, preparative GC and NMR",
          "finding": "Cuminaldehyde and phellandral were reported in hydrodistilled aerial-parts oil. This is not an exact steam-oil claim.",
          "sourceIds": [
            "cx11"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Different preparation from the catalog steam-distilled oil. Reported elemental S8 is not an organic thiol; replication/provenance is unresolved."
        }
      ],
      "blend": {
        "enabled": true,
        "availability": "unconfirmed",
        "qualityMappings": [
          {
            "qualityId": "calm",
            "evidenceTier": "human clinical",
            "summary": "Research relevant to the purported calm quality: a trial of lavender aromatherapy massage reported lower salivary cortisol immediately after treatment than usual care.",
            "studyId": "chen-chou-2017",
            "pmid": "28783372",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28783372/",
            "limitations": "Whole lavender oil was used with massage in 52 pregnant participants. There was no massage-only comparison, so the contribution of the oil cannot be separated from massage. Cortisol is not a direct measure of feeling calm. This does not establish safety during pregnancy. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          },
          {
            "qualityId": "calm",
            "evidenceTier": "human clinical",
            "summary": "Counterevidence for the purported calm quality: a randomized trial of a lavender, bergamot and cedarwood aroma mixture did not show benefit; the carrier-only group had lower anxiety scores than the fragrant groups at treatment completion.",
            "studyId": "graham-browne-cox-2003",
            "pmid": "12805340",
            "url": "https://pubmed.ncbi.nlm.nih.gov/12805340/",
            "limitations": "This was a multi-oil intervention in 313 radiotherapy patients. Its findings cannot be assigned to lavender alone or generalized to everyday cosmetic use. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": false
          },
          {
            "qualityId": "sleep",
            "evidenceTier": "review",
            "summary": "Research relevant to the purported sleep / wind-down quality: a review combining 11 randomized trials reported better adult sleep-quality scores with lavender essential-oil interventions overall.",
            "studyId": "shen-2026-lavender-sleep-meta",
            "pmid": "40600743",
            "url": "https://pubmed.ncbi.nlm.nih.gov/40600743/",
            "limitations": "Review of whole-oil interventions, not isolated linalool. Study quality, routes, concentrations and duration varied; some subgroup results were not significant. This does not establish treatment of insomnia or an effective spray formulation. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          }
        ],
        "dermalMaxPercent": null,
        "dermalMaxSource": null,
        "cautionThresholds": [],
        "phototoxic": null,
        "sensitizationNotes": "No verified sensitization assessment yet for this oil in the proposed leave-on spray. Legacy profile notes are unaudited and do not establish formulation safety.",
        "petSafer": null,
        "petSource": null,
        "interactions": [],
        "safetyReviewStatus": "unverified",
        "legacySafetyNotes": "Generally well tolerated; patch test for sensitive skin.",
        "legacySafetyNotesVerified": false,
        "researchGaps": [
          "No verified finished-product study or tested custom-blend ratio is provided in this catalog.",
          "Standardized oral lavender preparations and isolated-compound findings are not used as evidence that this topical spray has the same effects."
        ],
        "relatedStudyIds": []
      }
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
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "quantified",
          "compoundIds": [
            "menthyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Hydrodistilled air-dried flowering aerial parts of Mentha piperita, Fars, Iran",
          "extraction": "hydrodistillation",
          "method": "GC-MS identification and GC-FID uncorrected peak-area percentages; semiquantitative",
          "finding": "Menthyl acetate was reported in the study oil.",
          "sourceIds": [
            "peppermint-2012"
          ],
          "analyte": "Menthyl acetate",
          "range": {
            "min": 15.1,
            "max": 15.1
          },
          "basis": "Uncorrected GC-FID peak-area %, semiquantitative, not mass percentage; cited sample only",
          "valueState": "transcribed",
          "limitations": "The hydrodistilled study sample is not the catalog steam-distilled product. No human efficacy inference."
        },
        {
          "group": "flavonoid",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Plant extract / infusion",
          "sample": "23 commercial peppermint tinctures from Polish pharmacies",
          "extraction": "Commercial alcoholic leaf tinctures, some with added oil",
          "method": "HPLC-DAD and U(H)PLC-ESI-MS with standards",
          "finding": "Eriocitrin and luteolin-7-O-rutinoside were reported. Flavonoids cannot be attributed to the added oil fraction.",
          "sourceIds": [
            "peppermint-tincture-2020"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil."
        }
      ],
      "blend": {
        "enabled": true,
        "availability": "unconfirmed",
        "qualityMappings": [
          {
            "qualityId": "focus",
            "evidenceTier": "human clinical",
            "summary": "Research relevant to the purported focus quality: peppermint whole-oil aroma was associated with better memory measures and higher self-rated alertness in a laboratory study.",
            "studyId": "moss-2008-peppermint-cognition",
            "pmid": "18041606",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18041606/",
            "limitations": "Single-session aroma exposure in healthy volunteers. This is whole-oil evidence, not a trial of isolated menthol, and does not establish improved everyday work or study performance. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          }
        ],
        "dermalMaxPercent": null,
        "dermalMaxSource": null,
        "cautionThresholds": [],
        "phototoxic": null,
        "sensitizationNotes": "No verified sensitization assessment yet for this oil in the proposed leave-on spray. Legacy profile notes are unaudited and do not establish formulation safety.",
        "petSafer": null,
        "petSource": null,
        "interactions": [],
        "safetyReviewStatus": "unverified",
        "legacySafetyNotes": "Keep away from young children; can irritate eyes and mucous membranes.",
        "legacySafetyNotesVerified": false,
        "researchGaps": [
          "A general sleep review is linked to peppermint elsewhere in the catalog, but its overall result is not used as a peppermint-specific sleep benefit.",
          "No verified calm, sleep or uplifting mapping for this oil is provided in the starter catalog."
        ],
        "relatedStudyIds": [
          "lillehei-halcon-2014"
        ]
      }
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
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "quantified",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Commercial Hanus oil from fresh Eucalyptus globulus leaves cultivated in Spain",
          "extraction": "steam distillation",
          "method": "GC-MS and GC-FID; relative peak areas",
          "finding": "Isobutyl isobutyrate was reported in the commercial sample.",
          "sourceIds": [
            "eucalyptus-2023"
          ],
          "analyte": "Isobutyl isobutyrate",
          "range": {
            "min": 0.1,
            "max": 0.1
          },
          "basis": "Relative chromatographic peak-area %, not a mass percentage; applies only to the cited sample",
          "valueState": "transcribed",
          "limitations": "Single commercial sample. 1,8-cineole is a cyclic ether, not an epoxide."
        },
        {
          "group": "flavonoid",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Plant extract / infusion",
          "sample": "Eucalyptus globulus leaves from Haman-gun, Republic of Korea",
          "extraction": "Water/ethanol extraction",
          "method": "LC-Q-TOF/MS and HPLC with standards",
          "finding": "Epicatechin, isoquercitrin and quercitrin were reported in leaf extracts.",
          "sourceIds": [
            "eucalyptus-extract-2023"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil."
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
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "not-found",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Commercial Melaleuca alternifolia oil supplied in Slovakia, from young branches and leaves",
          "extraction": "steam distillation",
          "method": "GC-MS and GC-FID; relative peak areas",
          "finding": "This curated source does not verify an ester record for this profile. Its reporting threshold is not an absence test.",
          "sourceIds": [
            "tea-tree-2022"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Table excludes constituents below 0.1%. It cannot establish absence of trace compounds."
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
      ],
      "chemicalEvidence": [],
      "blend": {
        "enabled": true,
        "availability": "unconfirmed",
        "qualityMappings": [],
        "dermalMaxPercent": null,
        "dermalMaxSource": null,
        "cautionThresholds": [],
        "phototoxic": null,
        "sensitizationNotes": "No verified sensitization assessment yet for this oil in the proposed leave-on spray. Legacy profile notes are unaudited and do not establish formulation safety.",
        "petSafer": null,
        "petSource": null,
        "interactions": [],
        "safetyReviewStatus": "unverified",
        "legacySafetyNotes": "Generally well tolerated; patch test for sensitive skin.",
        "legacySafetyNotesVerified": false,
        "researchGaps": [
          "Limited research: no verified calm, focus, sleep or uplifting mapping for frankincense is provided in this starter catalog.",
          "The linked procedural lavender/frankincense trial has insufficient outcome detail in the catalog to support a quality recommendation.",
          "The linked topical-foot fatigue pilot found no significant benefit. It does not establish an uplifting quality or a benefit from this spray."
        ],
        "relatedStudyIds": [
          "aydinli-2026-lavender-frankincense-biopsy",
          "reis-2023-frankincense-fatigue"
        ]
      }
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
      ],
      "chemicalEvidence": []
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
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "detected-unquantified",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Cold-pressed Citrus sinensis orange peel oil, separate from tangor samples",
          "extraction": "cold pressing",
          "method": "Volatile profiling comparison",
          "finding": "Neryl acetate (called nerol acetate in the paper) was reported in the cold-pressed orange comparison. No concentration is imported.",
          "sourceIds": [
            "cx05"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Orange and tangor are distinct samples; enrichment versus hydrodistillation is not a universal quantity."
        },
        {
          "group": "aldehyde",
          "status": "detected-unquantified",
          "compoundIds": [
            "citral"
          ],
          "material": "Essential oil",
          "sample": "Cold-pressed Citrus sinensis orange peel oil, separate from tangor samples",
          "extraction": "cold pressing",
          "method": "Volatile profiling comparison",
          "finding": "Hexanal, 2-hexenal and neral (beta-citral) were reported in the orange oil comparison.",
          "sourceIds": [
            "cx05"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Orange and tangor are distinct samples; enrichment versus hydrodistillation is not a universal quantity."
        },
        {
          "group": "flavonoid",
          "status": "reported-unquantified",
          "compoundIds": [
            "nobiletin"
          ],
          "material": "Essential oil: nonvolatile fraction",
          "sample": "Commercial and crude cold-pressed orange oils, nonvolatile fraction",
          "extraction": "cold pressing",
          "method": "GC-MS with authentic polymethoxyflavone standards",
          "finding": "Tangeretin, sinensetin and nobiletin were verified with standards in cold-pressed orange oils. Source quantities are not imported.",
          "sourceIds": [
            "cx04"
          ],
          "valueState": "source_values_not_imported",
          "sourceQuantityNote": "Source measurements use micrograms per milliliter; values are not transcribed here.",
          "limitations": "Commercial, crude and compounded samples are separate; do not merge them into a typical range."
        }
      ],
      "blend": {
        "enabled": true,
        "availability": "unconfirmed",
        "qualityMappings": [
          {
            "qualityId": "calm",
            "evidenceTier": "human clinical",
            "summary": "Research relevant to the purported calm quality: a trial reported lower anxiety scores with sweet-orange essential-oil inhalation than a water control during labor.",
            "studyId": "nascimento-2025-sweet-orange-labor",
            "pmid": "39577393",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39577393/",
            "limitations": "Single-blind trial in 84 participants at one center. The labor setting limits generalization, and the study does not establish safety of this spray during pregnancy or a general uplifting effect. The intervention was whole oil, not isolated limonene. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          }
        ],
        "dermalMaxPercent": null,
        "dermalMaxSource": null,
        "cautionThresholds": [],
        "phototoxic": null,
        "sensitizationNotes": "No verified sensitization assessment yet for this oil in the proposed leave-on spray. Legacy profile notes are unaudited and do not establish formulation safety.",
        "petSafer": null,
        "petSource": null,
        "interactions": [],
        "safetyReviewStatus": "unverified",
        "legacySafetyNotes": "Mild phototoxicity risk; oxidized oil can irritate skin.",
        "legacySafetyNotesVerified": false,
        "researchGaps": [
          "No verified focus, sleep or uplifting mapping for this oil is provided in the starter catalog.",
          "Existing free-text phototoxicity and skin notes have not been validated for the supplied oil or the proposed formulation."
        ],
        "relatedStudyIds": []
      }
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
      ],
      "chemicalEvidence": [
        {
          "group": "aldehyde",
          "status": "quantified",
          "compoundIds": [
            "citronellal"
          ],
          "material": "Essential oil",
          "sample": "Cymbopogon nardus leaves collected July 2013 in a Brazilian medicinal-plant garden",
          "extraction": "hydrodistillation",
          "method": "GC-MS; retention indices and spectral matching; relative composition",
          "finding": "Citronellal was reported in this C. nardus sample.",
          "sourceIds": [
            "citronella-2016"
          ],
          "analyte": "Citronellal",
          "range": {
            "min": 27.87,
            "max": 27.87
          },
          "basis": "Relative chromatographic peak-area %, not a mass percentage; applies only to the cited sample",
          "valueState": "transcribed",
          "limitations": "C. nardus is not interchangeable with C. winterianus. Sample differs from catalog steam-distillation label; assignments rely on GC-MS matching."
        },
        {
          "group": "aldehyde",
          "status": "reported-unquantified",
          "compoundIds": [
            "citral"
          ],
          "material": "Essential oil",
          "sample": "Cymbopogon nardus leaves collected July 2013 in a Brazilian medicinal-plant garden",
          "extraction": "hydrodistillation",
          "method": "GC-MS; retention indices and spectral matching; relative composition",
          "finding": "Neral, geranial, octanal, decanal and (Z)-4-decenal were also reported. No combined citral percentage is inferred.",
          "sourceIds": [
            "citronella-2016"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "C. nardus is not interchangeable with C. winterianus. Sample differs from catalog steam-distillation label; assignments rely on GC-MS matching."
        },
        {
          "group": "ester",
          "status": "reported-unquantified",
          "compoundIds": [
            "geranyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Cymbopogon nardus leaves collected July 2013 in a Brazilian medicinal-plant garden",
          "extraction": "hydrodistillation",
          "method": "GC-MS; retention indices and spectral matching; relative composition",
          "finding": "Citronellyl acetate, geranyl acetate and citronellyl butyrate were reported. Source values have not been imported here.",
          "sourceIds": [
            "citronella-2016"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "C. nardus is not interchangeable with C. winterianus. Sample differs from catalog steam-distillation label; assignments rely on GC-MS matching."
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
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "quantified",
          "compoundIds": [
            "linalyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Sample #1: Nyons, France, Thymus vulgaris linalool chemotype, air-dried aerial parts, May 2015",
          "extraction": "steam distillation",
          "method": "GC-MS with retention-index/spectral matching; selected chiral GC",
          "finding": "Linalyl acetate was measured in sample #1.",
          "sourceIds": [
            "thyme-2016"
          ],
          "analyte": "Linalyl acetate",
          "range": {
            "min": 14.26,
            "max": 14.26
          },
          "basis": "Relative chromatographic peak-area %, not a mass percentage; applies only to the cited sample",
          "valueState": "transcribed",
          "limitations": "Chemotype-specific findings. Literature profiles in the paper are not additional measured samples."
        },
        {
          "group": "ester",
          "status": "quantified",
          "compoundIds": [
            "geranyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Sample #3: Jablanicki, Serbia, Thymus vulgaris geraniol chemotype, air-dried aerial parts, May 2015",
          "extraction": "steam distillation",
          "method": "GC-MS with retention-index/spectral matching; selected chiral GC",
          "finding": "Geranyl acetate was measured in sample #3.",
          "sourceIds": [
            "thyme-2016"
          ],
          "analyte": "Geranyl acetate",
          "range": {
            "min": 16.72,
            "max": 16.72
          },
          "basis": "Relative chromatographic peak-area %, not a mass percentage; applies only to the cited sample",
          "valueState": "transcribed",
          "limitations": "Chemotype-specific findings. Literature profiles in the paper are not additional measured samples."
        },
        {
          "group": "aldehyde",
          "status": "reported-unquantified",
          "compoundIds": [
            "citral"
          ],
          "material": "Essential oil",
          "sample": "Four directly measured Thymus vulgaris chemotypes from France and Serbia, May 2015, air-dried aerial parts",
          "extraction": "steam distillation",
          "method": "GC-MS with retention-index/spectral matching; selected chiral GC",
          "finding": "Neral, geranial and nonanal appear in one or more directly measured chemotypes; decanal has a trace entry. Individual column values are not imported. These findings do not apply to every thyme oil.",
          "sourceIds": [
            "thyme-2016"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Chemotype-specific findings. Literature profiles in the paper are not additional measured samples."
        },
        {
          "group": "flavonoid",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Plant extract / infusion",
          "sample": "Commercial Polish Thymus vulgaris herb, aqueous polyphenol-enriched extracts",
          "extraction": "Aqueous extraction and polyphenol fractionation",
          "method": "UHPLC-MS and HPLC-PDA",
          "finding": "Luteolin-7-O-beta-glucuronide and apigenin-7-O-beta-glucoside were reported. The paper did not show a clear apoptotic effect for common-thyme extract; no treatment claim is inferred.",
          "sourceIds": [
            "thyme-extract-2022"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil."
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
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "quantified",
          "compoundIds": [
            "linalyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Dried flowering aerial parts of Origanum vulgare, Socoroma/Putre, Chile, November 2019",
          "extraction": "hydrodistillation",
          "method": "GC-MS; relative composition; retention-index/library matching with selected standards",
          "finding": "Linalyl acetate was reported in the studied regional profile.",
          "sourceIds": [
            "oregano-2020"
          ],
          "analyte": "Linalyl acetate",
          "range": {
            "min": 7.2,
            "max": 7.2
          },
          "basis": "Relative chromatographic peak-area %, not a mass percentage; applies only to the cited sample",
          "valueState": "transcribed",
          "limitations": "Regional oil profile, not universal oregano composition. Colorimetric total phenolics do not identify named flavonoids."
        },
        {
          "group": "flavonoid",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Plant extract / infusion",
          "sample": "Origanum vulgare from the Atacama Desert Andean region",
          "extraction": "Ethanolic extraction",
          "method": "UHPLC-DAD with commercial standards",
          "finding": "Luteolin, naringenin, rutin and apigenin were reported.",
          "sourceIds": [
            "oregano-extract-2021"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil."
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
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "quantified",
          "compoundIds": [
            "geranyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Cymbopogon citratus leaf/aerial material, Chiffa/Blida, Algeria, May 2013",
          "extraction": "steam distillation",
          "method": "GC-MS/GC-FID; uncorrected normalized peak-area percentages",
          "finding": "Geranyl acetate was reported in the study oil.",
          "sourceIds": [
            "lemongrass-2014"
          ],
          "analyte": "Geranyl acetate",
          "range": {
            "min": 4.3,
            "max": 4.3
          },
          "basis": "Relative chromatographic peak-area %, not a mass percentage; applies only to the cited sample",
          "valueState": "transcribed",
          "limitations": "Fresh/dried feedstock is inconsistent in the paper. Correct isomer names: geranial is E/trans; neral is Z/cis. Animal/in-vitro evidence is not human efficacy."
        },
        {
          "group": "aldehyde",
          "status": "reported-unquantified",
          "compoundIds": [
            "citral",
            "citronellal"
          ],
          "material": "Essential oil",
          "sample": "Cymbopogon citratus leaf/aerial material, Chiffa/Blida, Algeria, May 2013",
          "extraction": "steam distillation",
          "method": "GC-MS/GC-FID; uncorrected normalized peak-area percentages",
          "finding": "The study reported geranial and neral separately, alongside citronellal. No universal citral ratio is inferred.",
          "sourceIds": [
            "lemongrass-2014"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Fresh/dried feedstock is inconsistent in the paper. Correct isomer names: geranial is E/trans; neral is Z/cis. Animal/in-vitro evidence is not human efficacy."
        },
        {
          "group": "flavonoid",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Plant extract / infusion",
          "sample": "Cymbopogon citratus leaf infusion and isolated glycosides",
          "extraction": "Aqueous infusion and compound isolation",
          "method": "NMR structural characterization",
          "finding": "Cynaroside and isoorientin were identified in the leaf-infusion research.",
          "sourceIds": [
            "lemongrass-infusion-2014"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil."
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
      ],
      "chemicalEvidence": [
        {
          "group": "aldehyde",
          "status": "reported-unquantified",
          "compoundIds": [
            "citronellal"
          ],
          "material": "Essential oil",
          "sample": "Chinese Corymbia citriodora leaf oil, commercial product 800319, Kurt Kitzing",
          "extraction": "Sample-specific extraction not reported",
          "method": "GC-FID/GC-MS; relative GC-FID peak areas",
          "finding": "Citronellal was reported; the source has a numerical value but sample-specific extraction is not established, so no composition number is imported.",
          "sourceIds": [
            "lemon-eucalyptus-2007"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "General introduction on steam distillation does not establish preparation of this sample. Rutin/quercetin assay comparators are not oil constituents. Not a PMD-rich processed product."
        },
        {
          "group": "ester",
          "status": "reported-unquantified",
          "compoundIds": [
            "geranyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Chinese Corymbia citriodora leaf oil, commercial product 800319, Kurt Kitzing",
          "extraction": "Sample-specific extraction not reported",
          "method": "GC-FID/GC-MS; relative GC-FID peak areas",
          "finding": "Isobutyl isobutyrate, citronellyl acetate and geranyl acetate were reported; values are not imported because preparation provenance is incomplete.",
          "sourceIds": [
            "lemon-eucalyptus-2007"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "General introduction on steam distillation does not establish preparation of this sample. Rutin/quercetin assay comparators are not oil constituents. Not a PMD-rich processed product."
        },
        {
          "group": "ester",
          "status": "detected-unquantified",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Corymbia citriodora leaf oil from Réunion Island",
          "extraction": "hydrodistillation",
          "method": "GC and GC-MS on polar and nonpolar columns",
          "finding": "Citronellyl citronellate was reported as a trace constituent; no numerical amount was obtained.",
          "sourceIds": [
            "lemon-eucalyptus-2004"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Trace ester reported; numerical concentration not available in the accessible abstract."
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
      ],
      "chemicalEvidence": [
        {
          "group": "aldehyde",
          "status": "quantified",
          "compoundIds": [
            "cinnamaldehyde"
          ],
          "material": "Essential oil",
          "sample": "Commercial Laszlo Cinnamomum zeylanicum stem-bark oil, manufacturer-reported Sri Lankan origin",
          "extraction": "manufacturer-reported steam distillation",
          "method": "GC-MS/GC-FID; normalized peak areas, retention-index/library matching",
          "finding": "(E)-Cinnamaldehyde was reported in this bark-oil sample.",
          "sourceIds": [
            "cinnamon-2022"
          ],
          "analyte": "(E)-Cinnamaldehyde",
          "range": {
            "min": 77.42,
            "max": 77.42
          },
          "basis": "Relative chromatographic peak-area %, not a mass percentage; applies only to the cited sample",
          "valueState": "transcribed",
          "limitations": "C. zeylanicum is a synonym of C. verum. Bark differs from leaf/root oils. Canine isolates were tested in vitro, not in a treatment trial."
        },
        {
          "group": "ester",
          "status": "quantified",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Commercial Laszlo Cinnamomum zeylanicum stem-bark oil, manufacturer-reported Sri Lankan origin",
          "extraction": "manufacturer-reported steam distillation",
          "method": "GC-MS/GC-FID; normalized peak areas, retention-index/library matching",
          "finding": "(E)-Cinnamyl acetate was reported in the bark oil.",
          "sourceIds": [
            "cinnamon-2022"
          ],
          "analyte": "(E)-Cinnamyl acetate",
          "range": {
            "min": 4.5,
            "max": 4.5
          },
          "basis": "Relative chromatographic peak-area %, not a mass percentage; applies only to the cited sample",
          "valueState": "transcribed",
          "limitations": "C. zeylanicum is a synonym of C. verum. Bark differs from leaf/root oils. Canine isolates were tested in vitro, not in a treatment trial."
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
      ],
      "chemicalEvidence": []
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
      ],
      "chemicalEvidence": [],
      "blend": {
        "enabled": true,
        "availability": "unconfirmed",
        "qualityMappings": [
          {
            "qualityId": "focus",
            "evidenceTier": "human clinical",
            "summary": "Research relevant to the purported focus quality: rosemary whole-oil aroma improved some memory-quality measures and relative alertness in a laboratory study, but also slowed memory speed.",
            "studyId": "moss-cook-2003",
            "pmid": "12690999",
            "url": "https://pubmed.ncbi.nlm.nih.gov/12690999/",
            "limitations": "Mixed outcomes after a single brief exposure in healthy adults. Better results on some tasks do not establish general cognitive enhancement. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          },
          {
            "qualityId": "focus",
            "evidenceTier": "human clinical",
            "summary": "Research relevant to the purported focus quality: after rosemary whole-oil aroma exposure, blood 1,8-cineole levels correlated with performance on some cognitive tasks.",
            "studyId": "moss-oliver-2012-cineole",
            "pmid": "23983963",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23983963/",
            "limitations": "Small correlational study of 20 volunteers. The exposure was whole rosemary oil; measuring one constituent does not establish that isolated 1,8-cineole caused the results, or that other oils containing it have the same effect. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          },
          {
            "qualityId": "uplifting",
            "evidenceTier": "human clinical",
            "summary": "Research relevant to the purported uplifting quality: the rosemary-aroma group reported greater contentment than the no-aroma control group after cognitive testing.",
            "studyId": "moss-cook-2003",
            "pmid": "12690999",
            "url": "https://pubmed.ncbi.nlm.nih.gov/12690999/",
            "limitations": "Subjective mood finding from one short laboratory exposure in healthy adults, alongside mixed cognitive outcomes. This is not evidence for treatment of a mood condition or a lasting change in mood. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          }
        ],
        "dermalMaxPercent": null,
        "dermalMaxSource": null,
        "cautionThresholds": [],
        "phototoxic": null,
        "sensitizationNotes": "No verified sensitization assessment yet for this oil in the proposed leave-on spray. Legacy profile notes are unaudited and do not establish formulation safety.",
        "petSafer": null,
        "petSource": null,
        "interactions": [],
        "safetyReviewStatus": "unverified",
        "legacySafetyNotes": "Avoid in pregnancy and with epilepsy; may raise blood pressure.",
        "legacySafetyNotesVerified": false,
        "researchGaps": [
          "Studies of swallowed rosemary leaf or powder are not treated as evidence for rosemary essential oil in a spray.",
          "No verified calm or sleep mapping for this oil is provided in the starter catalog."
        ],
        "relatedStudyIds": []
      }
    },
    {
      "id": "pine",
      "name": "Scots Pine",
      "latinName": "Pinus sylvestris",
      "family": "Pinaceae",
      "plantPart": "Needles and twigs",
      "extraction": "Steam distillation",
      "aroma": [
        "pine",
        "resinous",
        "fresh"
      ],
      "color": "#4e7d5b",
      "description": "Steam-distilled from needles and twigs. Rich in alpha- and beta-pinene; studied for bactericidal and biofilm-dispersal activity.",
      "uses": [
        "Surface cleaning blends",
        "Forest diffusion",
        "Research reference"
      ],
      "safety": "For external use; can irritate sensitive skin undiluted.",
      "constituents": [
        {
          "compoundId": "alpha-pinene",
          "range": {
            "min": 35,
            "max": 50
          }
        },
        {
          "compoundId": "beta-pinene",
          "range": {
            "min": 12,
            "max": 22
          }
        },
        {
          "compoundId": "limonene",
          "range": {
            "min": 4,
            "max": 10
          }
        }
      ],
      "chemicalEvidence": []
    },
    {
      "id": "palmarosa",
      "name": "Palmarosa",
      "latinName": "Cymbopogon martinii",
      "family": "Poaceae",
      "plantPart": "Grass",
      "extraction": "Steam distillation",
      "aroma": [
        "rosy",
        "floral",
        "sweet"
      ],
      "color": "#b98a9e",
      "description": "Steam-distilled from tropical grass. Very high in geraniol; top performer against cat fleas and scabies mites in comparative screens.",
      "uses": [
        "Outdoor blends",
        "Skin blends",
        "Research reference"
      ],
      "safety": "Generally well tolerated; patch test for sensitive skin.",
      "constituents": [
        {
          "compoundId": "geraniol",
          "range": {
            "min": 70,
            "max": 85
          }
        },
        {
          "compoundId": "linalool",
          "range": {
            "min": 0.8,
            "max": 3.8
          },
          "basis": "Published GC-MS profiles"
        }
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "reported-unquantified",
          "compoundIds": [
            "geranyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Cymbopogon martinii palmarosa biomass oils across agronomic treatments and harvests",
          "extraction": "steam distillation",
          "method": "GC-MS",
          "finding": "Geranyl acetate was measured in steam-distilled palmarosa biomass oil.",
          "sourceIds": [
            "cx19"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Treatments and harvests are distinct samples, not a retail oil specification."
        },
        {
          "group": "ester",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Cymbopogon martini var. motia oil, batch OF012293",
          "extraction": "steam distillation",
          "method": "Supplier-provided GC-MS composition reproduced in the publication",
          "finding": "Supplier-provided composition listed neryl formate, neryl acetate, geranyl butyrate, geranyl caproate and geranyl caprylate. Quantities are not imported.",
          "sourceIds": [
            "cx16"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Composition was not independently remeasured by the authors. Clinical isolates do not make this a clinical trial."
        },
        {
          "group": "aldehyde",
          "status": "reported-unquantified",
          "compoundIds": [
            "citral"
          ],
          "material": "Essential oil",
          "sample": "Cymbopogon martini var. motia oil, batch OF012293",
          "extraction": "steam distillation",
          "method": "Supplier-provided GC-MS composition reproduced in the publication",
          "finding": "Supplier-provided composition listed neral and geranial. Quantities are not imported.",
          "sourceIds": [
            "cx16"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Composition was not independently remeasured by the authors. Clinical isolates do not make this a clinical trial."
        }
      ]
    },
    {
      "id": "copaiba",
      "name": "Copaiba",
      "latinName": "Copaifera reticulata",
      "family": "Fabaceae",
      "plantPart": "Resin (oleoresin)",
      "extraction": "Steam distillation",
      "aroma": [
        "woody",
        "balsamic",
        "mild"
      ],
      "color": "#a08b6d",
      "description": "Steam-distilled oleoresin. Exceptionally rich in beta-caryophyllene; strongest residual efficacy against cat fleas in comparative testing.",
      "uses": [
        "Outdoor blends",
        "Research reference"
      ],
      "safety": "Generally well tolerated; patch test for sensitive skin.",
      "constituents": [
        {
          "compoundId": "beta-caryophyllene",
          "range": {
            "min": 40,
            "max": 60
          }
        },
        {
          "compoundId": "alpha-humulene",
          "range": {
            "min": 5,
            "max": 12
          }
        }
      ],
      "chemicalEvidence": []
    },
    {
      "id": "grapefruit",
      "name": "Grapefruit",
      "latinName": "Citrus paradisi",
      "family": "Rutaceae",
      "plantPart": "Peel",
      "extraction": "Cold-pressed",
      "aroma": [
        "citrus",
        "fresh",
        "bitter"
      ],
      "color": "#f0d060",
      "description": "Cold-pressed from peel. Limonene-dominant like other citrus; botanical source of nootkatone, the 14-day tick repellent.",
      "uses": [
        "Uplifting blends",
        "Cleaning blends",
        "Research reference"
      ],
      "safety": "Phototoxic risk; avoid sun exposure after topical use.",
      "constituents": [
        {
          "compoundId": "limonene",
          "range": {
            "min": 90,
            "max": 96
          }
        },
        {
          "compoundId": "myrcene",
          "range": {
            "min": 1,
            "max": 3
          }
        }
      ],
      "chemicalEvidence": [
        {
          "group": "thiol",
          "status": "detected-unquantified",
          "compoundIds": [
            "grapefruit-thiol"
          ],
          "material": "Essential oil",
          "sample": "Cold-pressed Citrus paradisi oil studied in aroma-impact analysis",
          "extraction": "cold pressing",
          "method": "Time-intensity GC-olfactometry and GC-MS",
          "finding": "4-Mercapto-4-methyl-2-pentanol was detected, with low aroma activity in the tested oil.",
          "sourceIds": [
            "cx07"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Aroma intensity is not concentration. Non-detection of particular thiols applies only to the studied samples."
        },
        {
          "group": "thiol",
          "status": "not-detected",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Cold-pressed Citrus paradisi oil studied in aroma-impact analysis",
          "extraction": "cold pressing",
          "method": "Time-intensity GC-olfactometry and GC-MS",
          "finding": "The study did not detect 1-p-menthene-8-thiol or 4-mercapto-4-methyl-2-pentanone in its samples.",
          "sourceIds": [
            "cx07"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Aroma intensity is not concentration. Non-detection of particular thiols applies only to the studied samples."
        },
        {
          "group": "aldehyde",
          "status": "detected-unquantified",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Cold-pressed Citrus paradisi oil studied in aroma-impact analysis",
          "extraction": "cold pressing",
          "method": "Time-intensity GC-olfactometry and GC-MS",
          "finding": "Methional, dodecanal, trans-4,5-epoxy-(E)-2-decenal and beta-sinensal were reported. Methional is an aldehyde and a thioether, not a thiol.",
          "sourceIds": [
            "cx07"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Aroma intensity is not concentration. Non-detection of particular thiols applies only to the studied samples."
        },
        {
          "group": "flavonoid",
          "status": "reported-unquantified",
          "compoundIds": [
            "nobiletin"
          ],
          "material": "Essential oil: nonvolatile fraction",
          "sample": "Varietal and commercial cold-pressed grapefruit oils, nonvolatile fraction",
          "extraction": "cold pressing",
          "method": "Validated UHPLC-MS/MS",
          "finding": "Nobiletin, heptamethoxyflavone and tangeretin were quantified in the source. Individual sample quantities are not imported here.",
          "sourceIds": [
            "cx08"
          ],
          "valueState": "source_values_not_imported",
          "sourceQuantityNote": "Source measurements use milligrams per gram; values are not transcribed here.",
          "limitations": "Commercial oils varied. Analytical quality-control findings do not establish clinical safety for arbitrary uses."
        }
      ]
    },
    {
      "id": "clary-sage",
      "name": "Clary Sage",
      "latinName": "Salvia sclarea",
      "family": "Lamiaceae",
      "plantPart": "Flowering tops",
      "extraction": "Steam distillation",
      "aroma": [
        "herbaceous",
        "floral",
        "musky"
      ],
      "color": "#8a9ec9",
      "description": "Steam-distilled from flowering tops. Linalyl acetate dominant; tested against cat flea life stages.",
      "uses": [
        "Evening blends",
        "Research reference"
      ],
      "safety": "Avoid with alcohol; generally well tolerated otherwise.",
      "constituents": [
        {
          "compoundId": "linalyl-acetate",
          "range": {
            "min": 60,
            "max": 75
          }
        },
        {
          "compoundId": "linalool",
          "range": {
            "min": 13.46,
            "max": 30.43
          },
          "basis": "EFSA batch data and published GC-MS studies"
        }
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "quantified",
          "compoundIds": [
            "linalyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "One commercial Salvia sclarea branches/leaves oil",
          "extraction": "producer-reported steam distillation",
          "method": "GC/GC-MS; relative chromatographic composition",
          "finding": "Linalyl acetate (called linalool acetate in the paper) was reported.",
          "sourceIds": [
            "cx12"
          ],
          "valueState": "transcribed",
          "range": {
            "min": 49.1,
            "max": 49.1
          },
          "basis": "Relative chromatographic peak-area %, not mass percentage; cited sample only",
          "analyte": "Linalyl acetate",
          "limitations": "Single commercial sample; nonclinical assays do not establish human benefits."
        },
        {
          "group": "ester",
          "status": "reported-unquantified",
          "compoundIds": [
            "geranyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "One commercial Salvia sclarea branches/leaves oil",
          "extraction": "producer-reported steam distillation",
          "method": "GC/GC-MS; relative chromatographic composition",
          "finding": "Bornyl, neryl and geranyl acetates were also reported; geranyl formate was a trace entry.",
          "sourceIds": [
            "cx12"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Single commercial sample; nonclinical assays do not establish human benefits."
        },
        {
          "group": "aldehyde",
          "status": "detected-unquantified",
          "compoundIds": [
            "citral"
          ],
          "material": "Essential oil",
          "sample": "One commercial Salvia sclarea branches/leaves oil",
          "extraction": "producer-reported steam distillation",
          "method": "GC/GC-MS; relative chromatographic composition",
          "finding": "Neral was reported as trace. The trace entry is not assigned zero or a numerical bar.",
          "sourceIds": [
            "cx12"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Single commercial sample; nonclinical assays do not establish human benefits."
        }
      ]
    },
    {
      "id": "geranium",
      "name": "Geranium",
      "latinName": "Pelargonium graveolens",
      "family": "Geraniaceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "rosy",
        "floral",
        "green"
      ],
      "color": "#c9758f",
      "description": "Steam-distilled from leaves. Citronellol and geraniol rich; third most effective oil against scabies mites in a ten-oil screen.",
      "uses": [
        "Skin blends",
        "Floral blends",
        "Research reference"
      ],
      "safety": "Generally well tolerated; patch test for sensitive skin.",
      "constituents": [
        {
          "compoundId": "citronellol",
          "range": {
            "min": 25,
            "max": 40
          }
        },
        {
          "compoundId": "geraniol",
          "range": {
            "min": 10,
            "max": 20
          }
        },
        {
          "compoundId": "linalool",
          "range": {
            "min": 2.45,
            "max": 11.68
          },
          "basis": "Published GC-MS profiles across origins"
        }
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Commercial Pelargonium graveolens fresh-plant-material oil",
          "extraction": "steam distillation",
          "method": "GC-MS; relative chromatographic composition",
          "finding": "Citronellyl formate, geranyl formate, citronellyl acetate, citronellyl propionate, citronellyl pentanoate and geranyl valerate were reported.",
          "sourceIds": [
            "cx13"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "One producer/sample, not a universal composition range."
        },
        {
          "group": "aldehyde",
          "status": "reported-unquantified",
          "compoundIds": [
            "citronellal",
            "citral"
          ],
          "material": "Essential oil",
          "sample": "Commercial Pelargonium graveolens fresh-plant-material oil",
          "extraction": "steam distillation",
          "method": "GC-MS; relative chromatographic composition",
          "finding": "Citronellal, neral and geranial were reported in this oil.",
          "sourceIds": [
            "cx13"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "One producer/sample, not a universal composition range."
        },
        {
          "group": "flavonoid",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Leaf solvent extract",
          "sample": "Pelargonium graveolens methanol-aqueous leaf extract",
          "extraction": "methanol-aqueous extraction",
          "method": "UHPLC-HRMS",
          "finding": "Flavonoids were profiled at class level in the leaf extract, separate from the oil.",
          "sourceIds": [
            "cx18"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Leaf-extract findings do not establish flavonoids in steam-distilled geranium oil."
        }
      ]
    },
    {
      "id": "vitex",
      "name": "Vitex",
      "latinName": "Vitex negundo",
      "family": "Lamiaceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "herbaceous",
        "camphor"
      ],
      "color": "#7d9b6a",
      "description": "Steam-distilled from leaves. Larvicidal against Aedes aegypti and Culex mosquitoes at 50 to 125 ppm.",
      "uses": [
        "Outdoor blends",
        "Research reference"
      ],
      "safety": "For external use; limited safety data — dilute well.",
      "constituents": [
        {
          "compoundId": "eucalyptol",
          "range": {
            "min": 15,
            "max": 30
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
          "compoundId": "alpha-pinene",
          "range": {
            "min": 5,
            "max": 12
          }
        }
      ],
      "chemicalEvidence": []
    },
    {
      "id": "bergamot",
      "name": "Bergamot",
      "latinName": "Citrus bergamia",
      "family": "Rutaceae",
      "plantPart": "Peel",
      "extraction": "Cold-pressed",
      "aroma": [
        "citrus",
        "floral",
        "sweet"
      ],
      "color": "#d4b855",
      "description": "Cold-pressed from peel. Limonene and linalyl acetate rich; reduced exam anxiety in a 57-student RCT.",
      "uses": [
        "Anxiety blends",
        "Uplifting blends",
        "Research reference"
      ],
      "safety": "Phototoxic risk; avoid sun exposure after topical use.",
      "constituents": [
        {
          "compoundId": "limonene",
          "range": {
            "min": 35,
            "max": 50
          }
        },
        {
          "compoundId": "linalyl-acetate",
          "range": {
            "min": 22,
            "max": 36
          }
        },
        {
          "compoundId": "linalool",
          "range": {
            "min": 3,
            "max": 15
          },
          "basis": "ISO 3520 Calabrian-type specification"
        }
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "quantified",
          "compoundIds": [
            "linalyl-acetate"
          ],
          "material": "Essential oil",
          "sample": "Cold-pressed ripe Turkish bergamot peel oil",
          "extraction": "cold pressing",
          "method": "Capillary GC and GC-MS; chromatographic composition",
          "finding": "Linalyl acetate was reported in the cold-pressed ripe Turkish oil.",
          "sourceIds": [
            "cx21"
          ],
          "valueState": "transcribed",
          "range": {
            "min": 36.3,
            "max": 36.3
          },
          "basis": "Relative chromatographic peak-area %, not mass percentage; cited sample only",
          "analyte": "Linalyl acetate",
          "limitations": "Ripeness and season affect composition; this value is not universal."
        },
        {
          "group": "aldehyde",
          "status": "reported-unquantified",
          "compoundIds": [
            "citral"
          ],
          "material": "Essential oil",
          "sample": "Liquid bergamot essential oil and its separately measured headspace",
          "extraction": "Sample-specific extraction not verified",
          "method": "Quantitative GC-MS/GC-FID",
          "finding": "Neral and geranial were reported in the liquid oil; sample-specific extraction is not verified, so no numerical value is imported.",
          "sourceIds": [
            "cx10"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Liquid composition is not inhaled-headspace composition. Extraction provenance is incomplete."
        },
        {
          "group": "flavonoid",
          "status": "reported-unquantified",
          "compoundIds": [
            "nobiletin"
          ],
          "material": "Essential oil: nonvolatile fraction",
          "sample": "Femminello, Castagnaro and Fantastico bergamot peel oils, nonvolatile fraction",
          "extraction": "manual cold pressing",
          "method": "LC-MS/PDA",
          "finding": "Sinensetin, nobiletin, tetra-O-methylscutellarein and tangeretin were identified in the nonvolatile oil fraction. Cultivar-specific quantities are not imported.",
          "sourceIds": [
            "cx09"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Cultivar-specific findings, not juice or a bergamot-polyphenol supplement."
        }
      ],
      "blend": {
        "enabled": true,
        "availability": "unconfirmed",
        "qualityMappings": [
          {
            "qualityId": "calm",
            "evidenceTier": "human clinical",
            "summary": "Research relevant to the purported calm quality: students using bergamot whole-oil aroma stones reported lower state-anxiety scores before examinations than students using water stones.",
            "studyId": "wakui-2026-bergamot-exam-anxiety",
            "pmid": "42755326",
            "url": "https://pubmed.ncbi.nlm.nih.gov/42755326/",
            "limitations": "Open-label, single-center trial with 57 students over three days. Expectations may influence self-reports. The study does not establish a safe dermal concentration or an effect from isolated constituents. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          },
          {
            "qualityId": "uplifting",
            "evidenceTier": "human clinical",
            "summary": "Research relevant to the purported uplifting quality: the bergamot-aroma group had higher subjective-happiness scores on the day before the exam; broader depression, anxiety and stress scores did not differ significantly between groups.",
            "studyId": "wakui-2026-bergamot-exam-anxiety",
            "pmid": "42755326",
            "url": "https://pubmed.ncbi.nlm.nih.gov/42755326/",
            "limitations": "Secondary, time-specific self-reported finding in a small open-label student trial. It does not establish a general or lasting mood benefit. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          }
        ],
        "dermalMaxPercent": null,
        "dermalMaxSource": null,
        "cautionThresholds": [],
        "phototoxic": null,
        "sensitizationNotes": "No verified sensitization assessment yet for this oil in the proposed leave-on spray. Legacy profile notes are unaudited and do not establish formulation safety.",
        "petSafer": null,
        "petSource": null,
        "interactions": [],
        "safetyReviewStatus": "unverified",
        "legacySafetyNotes": "Phototoxic risk; avoid sun exposure after topical use.",
        "legacySafetyNotesVerified": false,
        "researchGaps": [
          "No verified focus or sleep mapping for this oil is provided in the starter catalog.",
          "Extraction method, furocoumarin content and the actual supplier specification require review before phototoxicity or dermal limits can be assigned."
        ],
        "relatedStudyIds": [
          "graham-browne-cox-2003"
        ]
      }
    },
    {
      "id": "ylang-ylang",
      "name": "Ylang-Ylang",
      "latinName": "Cananga odorata",
      "family": "Annonaceae",
      "plantPart": "Flowers",
      "extraction": "Steam distillation",
      "aroma": [
        "floral",
        "sweet",
        "exotic"
      ],
      "color": "#dfa0c8",
      "description": "Steam-distilled from flowers. Lowered blood pressure and self-rated tension in human trials.",
      "uses": [
        "Evening blends",
        "Floral blends",
        "Research reference"
      ],
      "safety": "Strong scent; dilute well; can cause headaches in sensitive users.",
      "constituents": [
        {
          "compoundId": "linalool",
          "range": {
            "min": 2,
            "max": 19
          },
          "basis": "ISO 3063 specification cited by EFSA"
        },
        {
          "compoundId": "beta-caryophyllene",
          "range": {
            "min": 5,
            "max": 12
          }
        }
      ],
      "chemicalEvidence": [
        {
          "group": "ester",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Cananga odorata flower oils; steam-water comparison sample",
          "extraction": "steam-water distillation",
          "method": "GC-MS/FID extraction comparison",
          "finding": "Benzyl acetate, methyl benzoate, cinnamyl acetate and benzyl benzoate characterize studied oils, including the steam-water sample.",
          "sourceIds": [
            "cx15"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Steam-water differs from dry steam, hydrodistillation and microwave methods; do not combine columns."
        },
        {
          "group": "aldehyde",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Essential oil",
          "sample": "Early and late hydrodistilled Cananga odorata flower fractions from Mayotte",
          "extraction": "hydrodistillation with time fractions",
          "method": "GC×GC-TOFMS; spectra, retention indices and elution-zone assignments",
          "finding": "Benzaldehyde and phenylacetaldehyde were reported in time fractions; heptanal occurred in the early fraction. No whole-oil quantity is inferred.",
          "sourceIds": [
            "cx14"
          ],
          "valueState": "source_values_not_imported",
          "limitations": "Fractions differ; not a single steam-distilled whole oil. Compound assignments depend on the reported analytical methods."
        }
      ],
      "blend": {
        "enabled": true,
        "availability": "unconfirmed",
        "qualityMappings": [
          {
            "qualityId": "calm",
            "evidenceTier": "human clinical",
            "summary": "Research relevant to the purported calm quality: participants receiving ylang-ylang whole oil through the skin rated themselves calmer and more relaxed than the control group.",
            "studyId": "hongratanaworakit-2006-ylang-ylang-transdermal",
            "pmid": "16807875",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16807875/",
            "limitations": "Short-term controlled study in 40 healthy volunteers. No dose-response was established. Perceived relaxation does not establish improved sleep or focus, and the study is not a leave-on-spray safety assessment. No evidence of the effectiveness or safety of this finished spray or a custom combination is established by this study.",
            "supportsSuggestion": true
          }
        ],
        "dermalMaxPercent": null,
        "dermalMaxSource": null,
        "cautionThresholds": [],
        "phototoxic": null,
        "sensitizationNotes": "No verified sensitization assessment yet for this oil in the proposed leave-on spray. Legacy profile notes are unaudited and do not establish formulation safety.",
        "petSafer": null,
        "petSource": null,
        "interactions": [],
        "safetyReviewStatus": "unverified",
        "legacySafetyNotes": "Strong scent; dilute well; can cause headaches in sensitive users.",
        "legacySafetyNotesVerified": false,
        "researchGaps": [
          "No verified focus, sleep or uplifting mapping for this oil is provided in the starter catalog.",
          "A whole-oil study does not establish the same result for isolated linalool or another oil that contains it."
        ],
        "relatedStudyIds": []
      }
    },
    {
      "id": "niaouli",
      "name": "Niaouli",
      "latinName": "Melaleuca quinquenervia",
      "family": "Myrtaceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "camphor",
        "fresh",
        "medicinal"
      ],
      "color": "#6fa87c",
      "description": "Steam-distilled from leaves. Cineole-rich tea tree relative; selective cytotoxicity against lung cancer cells in vitro.",
      "uses": [
        "Respiratory blends",
        "Research reference"
      ],
      "safety": "For external use; dilute well.",
      "constituents": [
        {
          "compoundId": "eucalyptol",
          "range": {
            "min": 25,
            "max": 45
          }
        },
        {
          "compoundId": "alpha-pinene",
          "range": {
            "min": 15,
            "max": 25
          }
        }
      ],
      "chemicalEvidence": []
    },
    {
      "id": "ravintsara",
      "name": "Ravintsara",
      "latinName": "Cinnamomum camphora",
      "family": "Lauraceae",
      "plantPart": "Leaves",
      "extraction": "Steam distillation",
      "aroma": [
        "camphor",
        "fresh",
        "eucalyptus"
      ],
      "color": "#a3c48d",
      "description": "Steam-distilled from leaves (cineole chemotype, not camphor chemotype). Anti-MRSA activity in vitro.",
      "uses": [
        "Respiratory blends",
        "Research reference"
      ],
      "safety": "For external use; use the cineole chemotype, not camphor chemotype.",
      "constituents": [
        {
          "compoundId": "eucalyptol",
          "range": {
            "min": 45,
            "max": 60
          }
        },
        {
          "compoundId": "alpha-pinene",
          "range": {
            "min": 4,
            "max": 10
          }
        }
      ],
      "chemicalEvidence": []
    },
    {
      "id": "cannabis",
      "name": "Cannabis",
      "latinName": "Cannabis sativa",
      "family": "Cannabaceae",
      "plantPart": "Flowers and aerial parts",
      "extraction": "Steam distillation / volatile oil isolation",
      "aroma": [
        "herbal",
        "resinous",
        "citrus",
        "pine"
      ],
      "color": "#72b89a",
      "description": "A terpene-rich aromatic plant whose volatile profile shares many compounds with familiar botanicals across the Terpene Lab. Composition varies substantially by cultivar and growing conditions.",
      "uses": [
        "Aromatic research",
        "Terpene chemistry"
      ],
      "safety": "Volatile-oil composition varies substantially by cultivar and preparation. Ingredient research should not be generalized to cannabinoid-rich cannabis extracts.",
      "constituents": [
        {
          "compoundId": "myrcene",
          "range": {
            "min": 10,
            "max": 35
          },
          "basis": "Representative cultivar-dependent volatile profile range"
        },
        {
          "compoundId": "beta-caryophyllene",
          "range": {
            "min": 5,
            "max": 25
          },
          "basis": "Representative cultivar-dependent volatile profile range"
        },
        {
          "compoundId": "limonene",
          "range": {
            "min": 2,
            "max": 15
          },
          "basis": "Representative cultivar-dependent volatile profile range"
        },
        {
          "compoundId": "alpha-pinene",
          "range": {
            "min": 1,
            "max": 10
          },
          "basis": "Representative cultivar-dependent volatile profile range"
        },
        {
          "compoundId": "beta-pinene",
          "range": {
            "min": 1,
            "max": 8
          },
          "basis": "Representative cultivar-dependent volatile profile range"
        },
        {
          "compoundId": "alpha-humulene",
          "range": {
            "min": 1,
            "max": 8
          },
          "basis": "Representative cultivar-dependent volatile profile range"
        }
      ],
      "chemicalEvidence": [
        {
          "group": "thiol",
          "status": "reported-unquantified",
          "compoundIds": [
            "prenylthiol"
          ],
          "material": "Plant material and hydrocarbon extracts",
          "sample": "Cannabis flowers and concentrated extracts studied by Oswald et al.",
          "extraction": "Flower headspace and hydrocarbon extraction, not steam distillation",
          "method": "GC×GC with TOF-MS, FID, sulfur chemiluminescence and sensory evaluation",
          "finding": "Prenylthiol was identified in studied flowers and extracts. The paper reports sample-specific measurements; no general essential-oil percentage is imported here.",
          "sourceIds": [
            "oswald-2021"
          ]
        },
        {
          "group": "ester",
          "status": "reported-unquantified",
          "compoundIds": [],
          "material": "Ice-hash rosin extracts",
          "extraction": "Ice-water hash and rosin processing, not steam distillation",
          "method": "GC×GC and sensory assessment",
          "finding": "Minor esters and sulfur volatiles were associated with aroma differences in the studied rosin extracts. This is extract evidence, not an essential-oil fingerprint.",
          "sourceIds": [
            "oswald-2023",
            "paryani-2024"
          ]
        },
        {
          "group": "flavonoid",
          "status": "reported-unquantified",
          "compoundIds": [
            "cannflavin-a"
          ],
          "material": "Plant material and reviewed preparations",
          "extraction": "Multiple preparations reviewed; not distilled oil",
          "method": "Literature review; LC/HPLC is relevant to nonvolatile constituents",
          "finding": "Cannflavin A and B are flavones described in Cannabis sativa plant research. This establishes no composition percentage for distilled oil.",
          "sourceIds": [
            "bautista-2021",
            "pellati-2018"
          ]
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
      "description": "A floral, fruity monoterpenoid that is also an acetate ester, reported in lavender and bergamot oils.",
      "functionalGroups": [
        "ester"
      ],
      "volatility": "volatile",
      "sourceIds": [
        "chebi-linalyl-acetate"
      ]
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
      "description": "A warm, spicy compound reported in clove bud oil. Long used in dentistry; potent, so dilution matters. Not a terpene: a phenylpropanoid."
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
      "description": "A lemon-scented monoterpenoid with an aldehyde group, reported in citronella and lemon eucalyptus oils.",
      "functionalGroups": [
        "aldehyde"
      ],
      "volatility": "volatile",
      "sourceIds": [
        "chebi-citronellal"
      ]
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
      "description": "A cinnamon-scented phenylpropanoid with an aldehyde group, reported in cinnamon bark oil.",
      "functionalGroups": [
        "aldehyde"
      ],
      "volatility": "volatile",
      "sourceIds": [
        "chebi-cinnamaldehyde"
      ]
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
      "description": "A mixture of geranial and neral, two monoterpenoid aldehydes associated with the lemony aroma of lemongrass.",
      "functionalGroups": [
        "aldehyde"
      ],
      "volatility": "volatile",
      "aliases": [
        "geranial",
        "neral"
      ],
      "sourceIds": [
        "pubchem-citral"
      ]
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
    },
    {
      "id": "nootkatone",
      "name": "Nootkatone",
      "chemicalClass": "Sesquiterpenoid",
      "formula": "C15H22O",
      "aroma": [
        "grapefruit",
        "woody"
      ],
      "description": "Grapefruit-derived sesquiterpenoid; repelled 100% of Ixodes scapularis nymphs through 14 days in field trials."
    },
    {
      "id": "citronellol",
      "name": "Citronellol",
      "chemicalClass": "Monoterpenoid",
      "formula": "C10H20O",
      "aroma": [
        "rosy",
        "citronella"
      ],
      "description": "Rosy alcohol prominent in geranium and citronella; softer counterpart to citronellal."
    },
    {
      "id": "prenylthiol",
      "name": "3-Methyl-2-butene-1-thiol",
      "aliases": [
        "prenylthiol",
        "3-methylbut-2-ene-1-thiol"
      ],
      "chemicalClass": "Organosulfur compound",
      "functionalGroups": [
        "thiol"
      ],
      "formula": "C5H10S",
      "aroma": [
        "sulfurous",
        "skunky"
      ],
      "volatility": "volatile",
      "description": "A trace thiol associated with skunky aroma in studied cannabis flowers and concentrated extracts. These findings do not describe a steam-distilled oil or the finished Sunny's Shield formula.",
      "sourceIds": [
        "oswald-2021",
        "cx02"
      ],
      "showModel": false
    },
    {
      "id": "cannflavin-a",
      "name": "Cannflavin A",
      "chemicalClass": "Flavonoid",
      "functionalGroups": [],
      "formula": "C26H28O6",
      "aroma": [
        "Not generally an aroma molecule"
      ],
      "volatility": "typically nonvolatile",
      "description": "A geranylated flavone reported in Cannabis sativa plant material. It is included as broader botanical chemistry, separate from volatile-oil composition.",
      "sourceIds": [
        "bautista-2021"
      ],
      "showModel": false
    },
    {
      "id": "menthyl-acetate",
      "name": "Menthyl acetate",
      "formula": "C12H22O2",
      "chemicalClass": "Monoterpenoid",
      "functionalGroups": [
        "ester"
      ],
      "aroma": [
        "Aroma not summarized in this record"
      ],
      "description": "A monoterpenoid ester reported in the linked essential-oil analyses. See material-specific records for sample and method.",
      "sourceIds": [
        "peppermint-2012"
      ],
      "volatility": "volatile",
      "showModel": false
    },
    {
      "id": "geranyl-acetate",
      "name": "Geranyl acetate",
      "formula": "C12H20O2",
      "chemicalClass": "Monoterpenoid",
      "functionalGroups": [
        "ester"
      ],
      "aroma": [
        "Aroma not summarized in this record"
      ],
      "description": "A monoterpenoid ester reported in the linked essential-oil analyses. See material-specific records for sample and method.",
      "sourceIds": [
        "lemongrass-2014"
      ],
      "volatility": "volatile",
      "showModel": false
    },
    {
      "id": "grapefruit-thiol",
      "name": "4-Mercapto-4-methyl-2-pentanol",
      "aliases": [
        "grapefruit thiol"
      ],
      "formula": "C6H14OS",
      "chemicalClass": "Organosulfur compound",
      "functionalGroups": [
        "thiol"
      ],
      "aroma": [
        "Low aroma activity in the studied grapefruit oil"
      ],
      "volatility": "volatile",
      "description": "A thiol reported in the aroma analysis of cold-pressed grapefruit oil. Its sample-specific sensory activity is not a composition percentage.",
      "sourceIds": [
        "cx07"
      ],
      "showModel": false
    },
    {
      "id": "nobiletin",
      "name": "Nobiletin",
      "formula": "C21H22O8",
      "chemicalClass": "Flavonoid",
      "functionalGroups": [],
      "aroma": [
        "Not generally an aroma molecule"
      ],
      "volatility": "typically nonvolatile",
      "description": "A polymethoxyflavone reported in nonvolatile fractions of cold-pressed citrus oils. It is kept separate from volatile aroma fingerprints.",
      "sourceIds": [
        "cx04",
        "cx08",
        "cx09"
      ],
      "showModel": false
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
    },
    {
      "id": "tea-tree-dandruff-2002",
      "title": "Treatment of dandruff with 5% tea tree oil shampoo",
      "authors": "Satchell AC, Saurajen A, Bell C, Barnetson RSC",
      "journal": "Journal of the American Academy of Dermatology",
      "year": 2002,
      "doi": "10.1067/mjd.2002.122734",
      "pubmedId": "12451368",
      "url": "https://pubmed.ncbi.nlm.nih.gov/12451368/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 126,
      "oilIds": [
        "tea-tree"
      ],
      "compoundIds": [
        "terpinen-4-ol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "skin"
        }
      ],
      "finding": "In a randomized trial, 5% tea tree oil shampoo improved the dandruff severity score by 41% versus 11% with placebo after four weeks.",
      "limitations": "Specific 5% shampoo formulation; results do not establish effects of other tea-tree products."
    },
    {
      "id": "tea-tree-acne-2007",
      "title": "The efficacy of 5% topical tea tree oil gel in mild to moderate acne vulgaris: a randomized, double-blind placebo-controlled study",
      "authors": "Enshaieh S, Jooya A, Siadat AH, Iraji F",
      "journal": "Indian Journal of Dermatology, Venereology and Leprology",
      "year": 2007,
      "doi": "10.4103/0378-6323.30646",
      "pubmedId": "17314442",
      "url": "https://pubmed.ncbi.nlm.nih.gov/17314442/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 60,
      "oilIds": [
        "tea-tree"
      ],
      "compoundIds": [
        "terpinen-4-ol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "skin"
        }
      ],
      "finding": "In 60 participants, 5% tea tree oil gel produced significantly greater improvement in acne lesion counts and severity than placebo over 45 days.",
      "limitations": "Specific topical gel and acne population; does not establish efficacy of diluted sprays or other formulations."
    },
    {
      "id": "rosemary-students-2018",
      "title": "Effects of Rosmarinus officinalis L. on memory performance, anxiety, depression, and sleep quality in university students: A randomized clinical trial",
      "authors": "Nematolahi P, Mehrabani M, Karami-Mohajeri S, Dabaghzadeh F",
      "journal": "Complementary Therapies in Clinical Practice",
      "year": 2018,
      "doi": "10.1016/j.ctcp.2017.11.004",
      "pubmedId": "29389474",
      "url": "https://pubmed.ncbi.nlm.nih.gov/29389474/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 68,
      "oilIds": [
        "rosemary"
      ],
      "compoundIds": [],
      "categories": [
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "memory"
        },
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "anxiety"
        },
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "mood"
        },
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "sleep"
        }
      ],
      "finding": "Oral rosemary powder for one month was associated with improvements in prospective and retrospective memory, anxiety, depression and several sleep-quality measures versus placebo.",
      "limitations": "Studied oral rosemary powder, not rosemary essential oil or inhalation."
    },
    {
      "id": "lemon-test-anxiety-2022",
      "title": "Effectiveness of lemon essential oil in reducing test anxiety in nursing students",
      "authors": "Bahçecik N, et al.",
      "journal": "Explore",
      "year": 2022,
      "doi": "10.1016/j.explore.2022.02.003",
      "pubmedId": "35190270",
      "url": "https://pubmed.ncbi.nlm.nih.gov/35190270/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 46,
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
          "topic": "anxiety"
        }
      ],
      "finding": "Fifteen minutes of lemon essential-oil inhalation reduced test-anxiety scores in nursing students compared with control.",
      "limitations": "Small student sample and acute exposure; does not establish treatment of anxiety disorders."
    },
    {
      "id": "commercial-eo-antibiofilm-2023",
      "title": "Antibacterial and Antibiofilm Effects of Different Samples of Five Commercially Available Essential Oils",
      "authors": "Muntean D, et al.",
      "journal": "Antibiotics",
      "year": 2023,
      "doi": "",
      "pubmedId": "37508287",
      "url": "https://pubmed.ncbi.nlm.nih.gov/37508287/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "oregano",
        "eucalyptus",
        "rosemary",
        "clove",
        "peppermint"
      ],
      "compoundIds": [
        "eugenol",
        "carvacrol",
        "thymol",
        "eucalyptol",
        "menthol"
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
      "finding": "Commercial oregano, eucalyptus, rosemary, clove and peppermint oil samples showed antibacterial and antibiofilm activity against tested S. aureus, E. coli and P. aeruginosa, with substantial sample-to-sample variation.",
      "limitations": "In-vitro study at relatively high concentrations; commercial oil composition varied substantially."
    },
    {
      "id": "washing-liquids-eo-2011",
      "title": "Lavender, tea tree and lemon oils as antimicrobials in washing liquids and soft body balms",
      "authors": "Kunicka-Styczyńska A, Sikora M, Kalemba D",
      "journal": "International Journal of Cosmetic Science",
      "year": 2011,
      "doi": "10.1111/j.1468-2494.2010.00582.x",
      "pubmedId": "20572887",
      "url": "https://pubmed.ncbi.nlm.nih.gov/20572887/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lavender",
        "tea-tree",
        "lemon"
      ],
      "compoundIds": [
        "linalool",
        "terpinen-4-ol",
        "limonene"
      ],
      "categories": [
        {
          "type": "cleaning",
          "subcategory": "surface"
        },
        {
          "type": "microbial",
          "subcategory": "bacteria"
        },
        {
          "type": "microbial",
          "subcategory": "fungi"
        }
      ],
      "finding": "Lavender, tea tree and lemon essential oils were evaluated as antimicrobial ingredients in washing liquid and body-balm formulations against bacteria and Candida.",
      "limitations": "Formulation-specific laboratory testing; not finished Sunny's Shield evidence."
    },
    {
      "id": "eo-pseudomonas-biofilm-2022",
      "title": "Chemical Composition and Antibacterial Activity of Liquid and Volatile Phase of Essential Oils against Planktonic and Biofilm-Forming Cells of Pseudomonas aeruginosa",
      "authors": "Brożyna M, et al.",
      "journal": "Molecules",
      "year": 2022,
      "doi": "",
      "pubmedId": "35807343",
      "url": "https://pubmed.ncbi.nlm.nih.gov/35807343/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "tea-tree",
        "rosemary",
        "eucalyptus",
        "lavender"
      ],
      "compoundIds": [
        "terpinen-4-ol",
        "eucalyptol",
        "linalool"
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
      "finding": "Across seven oils tested against P. aeruginosa, liquid and volatile rosemary and tea tree oils showed notable antibiofilm activity in the reported assays.",
      "limitations": "In-vitro study; activity differed between liquid and vapor phases and cannot be extrapolated to clinical efficacy."
    },
    {
      "id": "eo-staph-biofilm-2021",
      "title": "The Antimicrobial and Antibiofilm In Vitro Activity of Liquid and Vapour Phases of Selected Essential Oils against Staphylococcus aureus",
      "authors": "Brożyna M, et al.",
      "journal": "Pathogens",
      "year": 2021,
      "doi": "10.3390/pathogens10091207",
      "pubmedId": "34578239",
      "url": "https://pubmed.ncbi.nlm.nih.gov/34578239/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "tea-tree",
        "rosemary",
        "eucalyptus",
        "lavender"
      ],
      "compoundIds": [
        "terpinen-4-ol",
        "eucalyptol",
        "linalool"
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
      "finding": "Liquid and vapor phases of selected essential oils were tested against 16 biofilm-forming S. aureus strains, demonstrating oil- and phase-dependent antimicrobial and antibiofilm activity.",
      "limitations": "Laboratory biofilm models only; effectiveness varied substantially by oil and assay."
    },
    {
      "id": "tick-eo-2024",
      "title": "Comparative analysis of essential oil efficacy against the Asian longhorned tick Haemaphysalis longicornis (Acari: Ixodidae)",
      "authors": "Kim D, et al.",
      "journal": "Journal article",
      "year": 2024,
      "doi": "",
      "pubmedId": "38835262",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38835262/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "clove",
        "eucalyptus",
        "lavender",
        "peppermint"
      ],
      "compoundIds": [
        "eugenol",
        "eucalyptol",
        "linalool",
        "menthol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "ticks"
        }
      ],
      "finding": "Clove, eucalyptus, lavender and mint oils showed concentration-dependent acaricidal and repellent activity against Asian longhorned ticks; clove performed strongly in the reported assays.",
      "limitations": "Laboratory/host-attachment model against one tick species; not a human-use repellent trial."
    },
    {
      "id": "lone-star-tick-eo-2024",
      "title": "Repellent activity of essential oils to the Lone Star tick, Amblyomma americanum",
      "authors": "Bissinger BW, et al.",
      "journal": "Journal article",
      "year": 2024,
      "doi": "",
      "pubmedId": "38711138",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38711138/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "clove",
        "oregano",
        "peppermint"
      ],
      "compoundIds": [
        "eugenol",
        "carvacrol",
        "menthol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "ticks"
        }
      ],
      "finding": "In contact repellency assays against Lone Star tick nymphs, clove ranked highest among the natural oils tested, with oregano and peppermint also evaluated.",
      "limitations": "Bioassay evidence against one tick species; does not establish duration or safety of a consumer repellent formulation."
    },
    {
      "id": "mosquito-eo-repellency-1998",
      "title": "Efficacy of plant extracts and oils as mosquito repellents",
      "authors": "Jaenson TGT, Pålsson K, Borg-Karlson AK",
      "journal": "Phytomedicine",
      "year": 1998,
      "doi": "10.1016/S0944-7113(98)80072-X",
      "pubmedId": "23195905",
      "url": "https://pubmed.ncbi.nlm.nih.gov/23195905/",
      "studyType": "controlled-human-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "clove",
        "eucalyptus",
        "lavender",
        "peppermint"
      ],
      "compoundIds": [
        "eugenol",
        "eucalyptol",
        "linalool",
        "menthol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "mosquitoes"
        }
      ],
      "finding": "Laboratory and field testing of multiple natural products found good mosquito repellency for several extracts and oils, including eucalyptus, with activity varying by product and mosquito species.",
      "limitations": "Older comparative repellent work with heterogeneous natural products; formulation and exposure details limit direct product comparisons."
    },
    {
      "id": "menthol-migraine-2010",
      "title": "Cutaneous application of menthol 10% solution as an abortive treatment of migraine without aura: a randomised, double-blind, placebo-controlled, crossed-over study",
      "authors": "Borhani Haghighi A, et al.",
      "journal": "International Journal of Clinical Practice",
      "year": 2010,
      "doi": "",
      "pubmedId": "20456191",
      "url": "https://pubmed.ncbi.nlm.nih.gov/20456191/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 35,
      "oilIds": [
        "peppermint"
      ],
      "compoundIds": [
        "menthol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "In a crossover study of 35 patients and 118 migraine attacks, topical 10% menthol solution was evaluated for pain-free and pain-relief migraine endpoints versus a low-concentration control.",
      "limitations": "Tested isolated menthol solution rather than peppermint oil; small crossover study."
    },
    {
      "id": "cineole-copd-2009",
      "title": "Concomitant therapy with Cineole (Eucalyptole) reduces exacerbations in COPD: a placebo-controlled double-blind trial",
      "authors": "Worth H, Schacher C, Dethlefsen U",
      "journal": "Respiratory Research",
      "year": 2009,
      "doi": "",
      "pubmedId": "19624838",
      "url": "https://pubmed.ncbi.nlm.nih.gov/19624838/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 242,
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
      "finding": "In 242 patients with stable COPD, six months of oral cineole adjunct therapy reduced the combined frequency, severity and duration of exacerbations compared with placebo.",
      "limitations": "Oral purified cineole adjunct therapy, not eucalyptus oil or inhaled use."
    },
    {
      "id": "cineole-rhinosinusitis-2004",
      "title": "Therapy for acute nonpurulent rhinosinusitis with cineole: results of a double-blind, randomized, placebo-controlled trial",
      "authors": "Kehrl W, Sonnemann U, Dethlefsen U",
      "journal": "Laryngoscope",
      "year": 2004,
      "doi": "10.1097/00005537-200404000-00027",
      "pubmedId": "15064633",
      "url": "https://pubmed.ncbi.nlm.nih.gov/15064633/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 152,
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
      "finding": "Oral cineole produced significantly greater reductions in a rhinosinusitis symptom-sum score than placebo after four and seven days.",
      "limitations": "Purified oral cineole, not eucalyptus essential oil or topical/inhaled use."
    },
    {
      "id": "cineole-bronchitis-2013",
      "title": "Efficacy of cineole in patients suffering from acute bronchitis: a placebo-controlled double-blind trial",
      "authors": "Fischer J, Dethlefsen U",
      "journal": "Cough",
      "year": 2013,
      "doi": "10.1186/1745-9974-9-25",
      "pubmedId": "24261680",
      "url": "https://pubmed.ncbi.nlm.nih.gov/24261680/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 242,
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
      "finding": "A multicenter placebo-controlled trial evaluated 600 mg/day oral cineole for ten days in 242 patients with acute bronchitis and reported faster improvement in bronchitis symptoms.",
      "limitations": "Purified oral cineole; not evidence for eucalyptus-oil spray or inhalation."
    },
    {
      "id": "cineole-asthma-2012",
      "title": "Patients with asthma benefit from concomitant therapy with cineole: a placebo-controlled, double-blind trial",
      "authors": "Worth H, Dethlefsen U",
      "journal": "Journal of Asthma",
      "year": 2012,
      "doi": "10.3109/02770903.2012.717657",
      "pubmedId": "22978309",
      "url": "https://pubmed.ncbi.nlm.nih.gov/22978309/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 247,
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
      "finding": "In 247 asthma patients, six months of oral cineole adjunct therapy was evaluated for lung function, asthma symptoms and quality of life versus placebo.",
      "limitations": "Purified oral cineole as adjunct therapy; not eucalyptus essential oil and not a replacement for asthma treatment."
    },
    {
      "id": "carvacrol-asthma-2021",
      "title": "Carvacrol improves pulmonary function tests, oxidant/antioxidant parameters and cytokine levels in asthmatic patients: A randomized, double-blind, clinical trial",
      "authors": "Ghorani V, Alavinezhad A, Rajabi O, Boskabady MH",
      "journal": "Phytomedicine",
      "year": 2021,
      "doi": "10.1016/j.phymed.2021.153539",
      "pubmedId": "33773189",
      "url": "https://pubmed.ncbi.nlm.nih.gov/33773189/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 33,
      "oilIds": [
        "oregano"
      ],
      "compoundIds": [
        "carvacrol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "respiratory"
        },
        {
          "type": "health",
          "subcategory": "immune"
        }
      ],
      "finding": "In 33 moderate asthma patients, oral carvacrol adjunct therapy improved respiratory symptoms, pulmonary-function measures and several inflammatory/oxidative markers versus baseline and placebo.",
      "limitations": "Small trial of purified oral carvacrol used alongside routine asthma medication; not oregano oil."
    },
    {
      "id": "carvacrol-asthma-phase2-2018",
      "title": "Possible therapeutic effect of carvacrol on asthmatic patients: A randomized, double blind, placebo-controlled, Phase II clinical trial",
      "authors": "Alavinezhad A, Khazdair MR, Boskabady MH",
      "journal": "Phytotherapy Research",
      "year": 2018,
      "doi": "10.1002/ptr.5967",
      "pubmedId": "29193478",
      "url": "https://pubmed.ncbi.nlm.nih.gov/29193478/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 23,
      "oilIds": [
        "oregano"
      ],
      "compoundIds": [
        "carvacrol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "respiratory"
        },
        {
          "type": "health",
          "subcategory": "immune"
        }
      ],
      "finding": "In a small phase II trial, two months of oral carvacrol improved pulmonary-function measures and reduced several respiratory symptoms and inflammatory markers compared with placebo.",
      "limitations": "Small study of purified oral carvacrol; not oregano essential oil."
    },
    {
      "id": "carvacrol-safety-2021",
      "title": "Safety and tolerability of carvacrol in healthy subjects: a phase I clinical study",
      "authors": "Ghorani V, et al.",
      "journal": "Drug and Chemical Toxicology",
      "year": 2021,
      "doi": "10.1080/01480545.2018.1538233",
      "pubmedId": "30486682",
      "url": "https://pubmed.ncbi.nlm.nih.gov/30486682/",
      "studyType": "controlled-human-study",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": null,
      "oilIds": [
        "oregano"
      ],
      "compoundIds": [
        "carvacrol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "respiratory"
        }
      ],
      "finding": "One month of oral carvacrol at 1 or 2 mg/kg/day was generally tolerated in healthy subjects; measured laboratory values remained within normal ranges despite several statistically significant changes.",
      "limitations": "Safety/tolerability study of purified oral carvacrol, not evidence of oregano-oil efficacy."
    },
    {
      "id": "tea-tree-systematic-review-2000",
      "title": "Tea tree oil: a systematic review of randomized clinical trials",
      "authors": "Ernst E, Huntley A",
      "journal": "Forschende Komplementärmedizin",
      "year": 2000,
      "doi": "",
      "pubmedId": "10800248",
      "url": "https://pubmed.ncbi.nlm.nih.gov/10800248/",
      "studyType": "systematic-review",
      "context": "human",
      "evidenceLevel": "review",
      "sampleSize": null,
      "oilIds": [
        "tea-tree"
      ],
      "compoundIds": [
        "terpinen-4-ol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "skin"
        }
      ],
      "finding": "A systematic review located four randomized trials and judged tea-tree-oil evidence for acne and fungal infections promising but not compelling at that time.",
      "limitations": "Older review with only four trials; later studies should be considered separately."
    },
    {
      "id": "moridpour-2024-cinnamon",
      "title": "The effect of cinnamon supplementation on glycemic control in patients with type 2 diabetes mellitus: An updated systematic review and dose-response meta-analysis of randomized controlled trials",
      "authors": "Moridpour AH, Kavyani Z, Khosravi S, et al.",
      "journal": "Phytotherapy Research",
      "year": 2024,
      "doi": "10.1002/ptr.8026",
      "pubmedId": "37818728",
      "url": "https://pubmed.ncbi.nlm.nih.gov/37818728/",
      "studyType": "systematic-review",
      "context": "human",
      "evidenceLevel": "review",
      "sampleSize": null,
      "oilIds": [
        "cinnamon"
      ],
      "compoundIds": [
        "cinnamaldehyde"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "metabolic"
        }
      ],
      "finding": "Across 24 RCTs, cinnamon supplementation significantly reduced fasting blood sugar, HOMA-IR, and HbA1c versus control, with no significant change in serum insulin.",
      "limitations": "High heterogeneity across trials; cinnamon preparations and doses varied."
    },
    {
      "id": "moss-oliver-2012-cineole",
      "title": "Plasma 1,8-cineole correlates with cognitive performance following exposure to rosemary essential oil aroma",
      "authors": "Moss M, Oliver L",
      "journal": "Therapeutic Advances in Psychopharmacology",
      "year": 2012,
      "doi": "10.1177/2045125312436573",
      "pubmedId": "23983963",
      "url": "https://pubmed.ncbi.nlm.nih.gov/23983963/",
      "studyType": "observational-human-study",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 20,
      "oilIds": [
        "rosemary"
      ],
      "compoundIds": [
        "eucalyptol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "attention"
        }
      ],
      "finding": "Higher blood 1,8-cineole levels after rosemary aroma exposure correlated with better speed and accuracy on cognitive tasks, with no speed-accuracy trade-off.",
      "limitations": "Correlational design, n=20, single exposure session."
    },
    {
      "id": "pengelly-2012-rosemary",
      "title": "Short-term study on the effects of rosemary on cognitive function in an elderly population",
      "authors": "Pengelly A, Snow J, Mills SY, et al.",
      "journal": "Journal of Medicinal Food",
      "year": 2012,
      "doi": "10.1089/jmf.2011.0005",
      "pubmedId": "21877951",
      "url": "https://pubmed.ncbi.nlm.nih.gov/21877951/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 28,
      "oilIds": [
        "rosemary"
      ],
      "compoundIds": [
        "eucalyptol",
        "camphor"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "alertness"
        },
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "memory"
        }
      ],
      "finding": "MIXED DOSE RESPONSE: 750 mg dried rosemary leaf improved speed of memory in older adults, while 6000 mg significantly impaired cognitive performance and alertness.",
      "limitations": "Dried leaf powder, not essential oil; acute single-dose effects only."
    },
    {
      "id": "han-2006-dysmenorrhea",
      "title": "Effect of aromatherapy on symptoms of dysmenorrhea in college students: a randomized placebo-controlled clinical trial",
      "authors": "Han SH, Hur MH, Buckle J, et al.",
      "journal": "Journal of Alternative and Complementary Medicine",
      "year": 2006,
      "doi": "10.1089/acm.2006.12.535",
      "pubmedId": "16884344",
      "url": "https://pubmed.ncbi.nlm.nih.gov/16884344/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": null,
      "oilIds": [
        "lavender"
      ],
      "compoundIds": [
        "linalool"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "Topical aromatherapy with a lavender, clary sage, and rose blend significantly reduced menstrual cramp severity versus placebo.",
      "limitations": "Three-oil blend tested; individual oil effects not isolated; clary sage and rose not in dataset."
    },
    {
      "id": "akula-2021-lemongrass",
      "title": "Anti-Plaque and Anti-Gingivitis Efficacy of 0.25% Lemongrass Oil and 0.2% Chlorhexidine Mouthwash in Children",
      "authors": "Akula S, Nagarathna J, Srinath K",
      "journal": "Frontiers in Dentistry",
      "year": 2021,
      "doi": "10.18502/fid.v18i32.7237",
      "pubmedId": "35965722",
      "url": "https://pubmed.ncbi.nlm.nih.gov/35965722/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 60,
      "oilIds": [
        "lemongrass"
      ],
      "compoundIds": [
        "citral"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "oral-dental"
        }
      ],
      "finding": "0.25% lemongrass oil mouthwash reduced plaque and gingival indices in children comparably to 0.2% chlorhexidine over 21 days.",
      "limitations": "n=60 children; 21-day follow-up; no adult data."
    },
    {
      "id": "smith-2011-labor",
      "title": "Aromatherapy for pain management in labour",
      "authors": "Smith CA, Collins CT, Crowther CA",
      "journal": "Cochrane Database of Systematic Reviews",
      "year": 2011,
      "doi": "10.1002/14651858.CD009215",
      "pubmedId": "21735438",
      "url": "https://pubmed.ncbi.nlm.nih.gov/21735438/",
      "studyType": "systematic-review",
      "context": "human",
      "evidenceLevel": "review",
      "sampleSize": 535,
      "oilIds": [
        "lavender",
        "frankincense",
        "lemongrass"
      ],
      "compoundIds": [
        "linalool"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "NULL RESULT: across 2 trials (535 women), aromatherapy showed no difference versus control for labor pain intensity, assisted vaginal birth, or caesarean section.",
      "limitations": "Only 2 trials; authors concluded evidence is insufficient for practice recommendations."
    },
    {
      "id": "anderson-2004-ponv",
      "title": "Aromatherapy with peppermint, isopropyl alcohol, or placebo is equally effective in relieving postoperative nausea",
      "authors": "Anderson LA, Gross JB",
      "journal": "Journal of PeriAnesthesia Nursing",
      "year": 2004,
      "doi": "10.1016/j.jopan.2003.11.001",
      "pubmedId": "14770380",
      "url": "https://pubmed.ncbi.nlm.nih.gov/14770380/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 33,
      "oilIds": [
        "peppermint"
      ],
      "compoundIds": [
        "menthol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "digestive"
        }
      ],
      "finding": "NULL RESULT for peppermint: nausea scores fell equally with peppermint, isopropyl alcohol, and saline placebo; authors attributed relief to controlled breathing rather than aroma.",
      "limitations": "n=33; saline placebo equally effective, suggesting non-specific effects."
    },
    {
      "id": "satchell-2002-tinea",
      "title": "Treatment of interdigital tinea pedis with 25% and 50% tea tree oil solution: a randomized, placebo-controlled, blinded study",
      "authors": "Satchell AC, Saurajen A, Bell C, et al.",
      "journal": "Australasian Journal of Dermatology",
      "year": 2002,
      "doi": "10.1046/j.1440-0960.2002.00590.x",
      "pubmedId": "12121393",
      "url": "https://pubmed.ncbi.nlm.nih.gov/12121393/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 158,
      "oilIds": [
        "tea-tree"
      ],
      "compoundIds": [
        "terpinen-4-ol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "skin"
        },
        {
          "type": "microbial",
          "subcategory": "fungi",
          "topic": "dermatophytes"
        }
      ],
      "finding": "In 158 patients, tea tree oil solution improved clinical symptoms of interdigital tinea pedis versus placebo in a blinded RCT.",
      "limitations": "Symptom improvement exceeded mycological cure rates."
    },
    {
      "id": "mohammed-aggad-2025",
      "title": "Evaluation of Antibacterial Activity in Some Algerian Essential Oils and Selection of Thymus vulgaris as a Potential Biofilm and Quorum Sensing Inhibitor Against Pseudomonas aeruginosa",
      "authors": "Mohammed Aggad FZ, Ilias F, Elghali F, et al.",
      "journal": "Chemistry and Biodiversity",
      "year": 2025,
      "doi": "10.1002/cbdv.202402691",
      "pubmedId": "39777967",
      "url": "https://pubmed.ncbi.nlm.nih.gov/39777967/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "thyme"
      ],
      "compoundIds": [
        "thymol",
        "carvacrol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria",
          "topic": "gram-negative"
        },
        {
          "type": "microbial",
          "subcategory": "biofilms"
        }
      ],
      "finding": "Thyme oil rich in thymol inhibited biofilm formation and quorum-sensing virulence factors in a hospital Pseudomonas aeruginosa strain, with docking data suggesting thymol and carvacrol bind its quorum-sensing receptors.",
      "limitations": "In-vitro only; single hospital strain."
    },
    {
      "id": "anees-2026",
      "title": "Antibacterial and anti-biofilm activities of thyme oil, oregano oil, and their combination against Klebsiella pneumoniae and Acinetobacter baumannii polymicrobial biofilms",
      "authors": "Anees TMM, Suchithra KV, Shetty AV, et al.",
      "journal": "Antonie van Leeuwenhoek",
      "year": 2026,
      "doi": "10.1007/s10482-026-02284-z",
      "pubmedId": "41854771",
      "url": "https://pubmed.ncbi.nlm.nih.gov/41854771/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "thyme",
        "oregano"
      ],
      "compoundIds": [
        "thymol",
        "carvacrol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria",
          "topic": "gram-negative"
        },
        {
          "type": "microbial",
          "subcategory": "biofilms"
        }
      ],
      "finding": "Thyme and oregano oils acted synergistically to disrupt dual-species Klebsiella pneumoniae and Acinetobacter baumannii biofilms by over 90%, downregulating biofilm-associated genes.",
      "limitations": "In-vitro; no human data."
    },
    {
      "id": "jurado-2023",
      "title": "Essential oils of Pinus sylvestris, Citrus limon and Origanum vulgare exhibit high bactericidal and anti-biofilm activities against Neisseria gonorrhoeae and Streptococcus suis",
      "authors": "Jurado P, Uruen C, Martinez S, et al.",
      "journal": "Biomedicine and Pharmacotherapy",
      "year": 2023,
      "doi": "10.1016/j.biopha.2023.115703",
      "pubmedId": "37857249",
      "url": "https://pubmed.ncbi.nlm.nih.gov/37857249/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "pine",
        "lemon",
        "oregano"
      ],
      "compoundIds": [
        "alpha-pinene",
        "beta-pinene",
        "limonene",
        "carvacrol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria",
          "topic": "gram-negative"
        },
        {
          "type": "microbial",
          "subcategory": "biofilms"
        }
      ],
      "finding": "Scots pine and lemon oils showed strong bactericidal and biofilm-dispersal activity against multidrug-resistant Neisseria gonorrhoeae, attributed to alpha/beta-pinene and limonene acting on the bacterial outer membrane.",
      "limitations": "In-vitro; clinical relevance untested."
    },
    {
      "id": "tuan-2025",
      "title": "Innovative antifungal strategies: enhanced biofilm inhibition of Candida albicans by a modified tea tree oil formulation",
      "authors": "Tuan DA, Uyen PVN, Khuon NV, et al.",
      "journal": "Frontiers in Microbiology",
      "year": 2024,
      "doi": "10.3389/fmicb.2024.1518598",
      "pubmedId": "39881994",
      "url": "https://pubmed.ncbi.nlm.nih.gov/39881994/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
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
          "topic": "yeast"
        },
        {
          "type": "microbial",
          "subcategory": "biofilms"
        }
      ],
      "finding": "Tea tree oil inhibited Candida albicans biofilm formation but could not eradicate more than 50 percent of mature biofilm at the concentrations tested.",
      "limitations": "In-vitro; mature-biofilm eradication not achieved."
    },
    {
      "id": "francisconi-2020",
      "title": "Antibiofilm efficacy of tea tree oil and of its main component terpinen-4-ol against Candida albicans",
      "authors": "Francisconi RS, Huacho PMM, Tonon CC, et al.",
      "journal": "Brazilian Oral Research",
      "year": 2020,
      "doi": "10.1590/1807-3107bor-2020.vol34.0050",
      "pubmedId": "32578760",
      "url": "https://pubmed.ncbi.nlm.nih.gov/32578760/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
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
          "topic": "yeast"
        },
        {
          "type": "microbial",
          "subcategory": "biofilms"
        }
      ],
      "finding": "Tea tree oil and terpinen-4-ol interfered with Candida albicans biofilm formation in a 60-second rinse simulation, supporting potential use in oral candidiasis.",
      "limitations": "In-vitro; brief-exposure model only."
    },
    {
      "id": "garozzo-2009",
      "title": "In vitro antiviral activity of Melaleuca alternifolia essential oil",
      "authors": "Garozzo A, Timpanaro R, Bisignano B, et al.",
      "journal": "Letters in Applied Microbiology",
      "year": 2009,
      "doi": "10.1111/j.1472-765X.2009.02740.x",
      "pubmedId": "19843207",
      "url": "https://pubmed.ncbi.nlm.nih.gov/19843207/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "tea-tree"
      ],
      "compoundIds": [
        "terpinen-4-ol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "viruses"
        }
      ],
      "finding": "Tea tree oil and terpinen-4-ol inhibited influenza A H1N1 replication below cytotoxic doses, with no virucidal activity and no effect on the other viruses tested.",
      "limitations": "In-vitro; influenza only among the viruses screened."
    },
    {
      "id": "najar-2022",
      "title": "Screening of the essential oil effects on human H1N1 influenza virus infection: an in vitro study in MDCK cells",
      "authors": "Najar B, Nardi V, Stincarelli MA, et al.",
      "journal": "Natural Product Research",
      "year": 2022,
      "doi": "10.1080/14786419.2021.1944137",
      "pubmedId": "34176386",
      "url": "https://pubmed.ncbi.nlm.nih.gov/34176386/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "eucalyptus",
        "rosemary"
      ],
      "compoundIds": [
        "eucalyptol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "viruses"
        }
      ],
      "finding": "Among 19 oils screened, eucalyptus and rosemary oils showed anti-H1N1 activity with low cytotoxicity, with eucalyptol correlating positively with cell viability.",
      "limitations": "In-vitro screening; no human data."
    },
    {
      "id": "pellegrini-2023",
      "title": "Virucidal Activity of Lemon Essential Oil against Feline Calicivirus Used as Surrogate for Norovirus",
      "authors": "Pellegrini F, Camero M, Catella C, et al.",
      "journal": "Antibiotics",
      "year": 2023,
      "doi": "10.3390/antibiotics12020322",
      "pubmedId": "36830233",
      "url": "https://pubmed.ncbi.nlm.nih.gov/36830233/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lemon"
      ],
      "compoundIds": [
        "limonene",
        "citral"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "viruses"
        }
      ],
      "finding": "Lemon essential oil significantly reduced feline calicivirus infectivity, a cultivable surrogate for human norovirus, suggesting surface-sanitizing potential.",
      "limitations": "Surrogate virus in-vitro; not tested against human norovirus."
    },
    {
      "id": "gilling-2014",
      "title": "Antiviral efficacy and mechanisms of action of oregano essential oil and its primary component carvacrol against murine norovirus",
      "authors": "Gilling DH, Kitajima M, Torrey JR, et al.",
      "journal": "Journal of Applied Microbiology",
      "year": 2014,
      "doi": "10.1111/jam.12453",
      "pubmedId": "24779581",
      "url": "https://pubmed.ncbi.nlm.nih.gov/24779581/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "oregano"
      ],
      "compoundIds": [
        "carvacrol"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "viruses"
        }
      ],
      "finding": "Carvacrol inactivated murine norovirus within one hour by disrupting the viral capsid, outperforming oregano oil and suggesting use as a surface sanitizer.",
      "limitations": "Surrogate virus in-vitro; high concentrations required."
    },
    {
      "id": "guynot-2003",
      "title": "Antifungal activity of volatile compounds generated by essential oils against fungi commonly causing deterioration of bakery products",
      "authors": "Guynot ME, Ramos AJ, Seto L, et al.",
      "journal": "Journal of Applied Microbiology",
      "year": 2003,
      "doi": "10.1046/j.1365-2672.2003.01927.x",
      "pubmedId": "12694455",
      "url": "https://pubmed.ncbi.nlm.nih.gov/12694455/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "cinnamon",
        "clove",
        "thyme",
        "lemongrass"
      ],
      "compoundIds": [
        "cinnamaldehyde",
        "eugenol",
        "thymol",
        "citral"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "fungi",
          "topic": "mold"
        }
      ],
      "finding": "Vapours of cinnamon, clove, lemongrass, and thyme oils completely inhibited bakery-spoilage molds including Aspergillus and Penicillium species.",
      "limitations": "Vapour-phase lab model; efficacy dropped in real food matrices."
    },
    {
      "id": "farouk-2022",
      "title": "Highly Durable Antibacterial Properties of Cellulosic Fabric via beta-Cyclodextrin/Essential Oils Inclusion Complex",
      "authors": "Farouk A, Sharaf S, Refaie R, et al.",
      "journal": "Polymers",
      "year": 2022,
      "doi": "10.3390/polym14224899",
      "pubmedId": "36433025",
      "url": "https://pubmed.ncbi.nlm.nih.gov/36433025/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lavender",
        "lemon",
        "rosemary"
      ],
      "compoundIds": [
        "linalool",
        "limonene",
        "eucalyptol"
      ],
      "categories": [
        {
          "type": "cleaning",
          "subcategory": "laundry"
        }
      ],
      "finding": "Cotton fabric treated with cyclodextrin-encapsulated lavender, lemon, and rosemary oils retained antibacterial activity through multiple wash cycles.",
      "limitations": "Textile-finishing lab study; no worn-garment testing."
    },
    {
      "id": "semeniuc-2017",
      "title": "Antibacterial activity and interactions of plant essential oil combinations against Gram-positive and Gram-negative bacteria",
      "authors": "Semeniuc CA, Pop CR, Rotar AM, et al.",
      "journal": "Food and Drug Analysis",
      "year": 2017,
      "doi": "10.1016/j.jfda.2016.06.002",
      "pubmedId": "28911683",
      "url": "https://pubmed.ncbi.nlm.nih.gov/28911683/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
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
          "type": "microbial",
          "subcategory": "bacteria",
          "topic": "gram-negative"
        }
      ],
      "finding": "NULL/MIXED RESULT: parsley and lovage oils showed no inhibition against any tested bacteria, and most thyme-oil combinations were antagonistic rather than synergistic.",
      "limitations": "Food-bacteria panel only; disc-diffusion screening."
    },
    {
      "id": "chaves-campos-2026",
      "title": "In vitro insecticidal and repellent activity of Cymbopogon essential oils and geraniol against cat flea.",
      "authors": "de Oliveira Chaves JK, Campos DR, Santos Soares EFM, et al.",
      "journal": "Vet Parasitol",
      "year": 2026,
      "doi": "10.1016/j.vetpar.2026.110886",
      "pubmedId": "42579967",
      "url": "https://pubmed.ncbi.nlm.nih.gov/42579967/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "citronella",
        "lemongrass",
        "palmarosa"
      ],
      "compoundIds": [
        "geraniol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "fleas"
        }
      ],
      "finding": "Geraniol showed the lowest LC50 values against cat flea eggs, pupae, adults, and whole life-cycle inhibition, while Cymbopogon martinii (palmarosa) oil was most potent against larvae and kept repellency at 90% or higher for 48 hours.",
      "limitations": "In vitro filter-paper assays only; no animal or field data."
    },
    {
      "id": "lima-campos-2024",
      "title": "Insecticidal and Repellent Activity of Essential Oils from Copaifera reticulata, Citrus paradisi, Lavandula hybrida and Salvia sclarea Against Immature and Adult Stages of Ctenocephalides felis felis.",
      "authors": "Lima EAS, Campos DR, Soares EFMS, et al.",
      "journal": "Acta Parasitol",
      "year": 2024,
      "doi": "10.1007/s11686-024-00874-3",
      "pubmedId": "39147955",
      "url": "https://pubmed.ncbi.nlm.nih.gov/39147955/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "copaiba",
        "grapefruit",
        "lavender",
        "clary-sage"
      ],
      "compoundIds": [
        "beta-caryophyllene",
        "linalool",
        "linalyl-acetate",
        "limonene"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "fleas"
        }
      ],
      "finding": "All four oils showed insecticidal and repellent activity against cat flea life stages in vitro, with beta-caryophyllene-rich copaiba oil showing the strongest residual efficacy.",
      "limitations": "In vitro only; Lavandula hybrida (lavandin) mapped to lavender; no host-animal testing."
    },
    {
      "id": "walton-2004-scabies",
      "title": "Acaricidal activity of Melaleuca alternifolia (tea tree) oil: in vitro sensitivity of sarcoptes scabiei var hominis to terpinen-4-ol.",
      "authors": "Walton SF, McKinnon M, Pizzutto S, et al.",
      "journal": "Arch Dermatol",
      "year": 2004,
      "doi": "10.1001/archderm.140.5.563",
      "pubmedId": "15148100",
      "url": "https://pubmed.ncbi.nlm.nih.gov/15148100/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "tea-tree"
      ],
      "compoundIds": [
        "terpinen-4-ol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "mites"
        }
      ],
      "finding": "Five percent tea tree oil and its component terpinen-4-ol were highly effective at reducing scabies mite survival times in vitro, comparable to 5% permethrin and ivermectin.",
      "limitations": "In vitro continuous-exposure assay; mites from a single crusted-scabies patient."
    },
    {
      "id": "fang-2016-scabies",
      "title": "In vitro activity of ten essential oils against Sarcoptes scabiei.",
      "authors": "Fang F, Candy K, Melloul E, et al.",
      "journal": "Parasit Vectors",
      "year": 2016,
      "doi": "10.1186/s13071-016-1889-3",
      "pubmedId": "27876081",
      "url": "https://pubmed.ncbi.nlm.nih.gov/27876081/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "clove",
        "palmarosa",
        "geranium",
        "tea-tree",
        "lavender",
        "eucalyptus"
      ],
      "compoundIds": [
        "eugenol",
        "geraniol",
        "linalool",
        "terpinen-4-ol",
        "eucalyptol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "mites"
        }
      ],
      "finding": "In contact assays 1% clove oil killed all scabies mites within 20 minutes and palmarosa within 50 minutes; efficacy order was clove, palmarosa, geranium, tea tree, then lavender.",
      "limitations": "Mites from experimentally infected pigs; in vitro only."
    },
    {
      "id": "cai-2025-dustmite",
      "title": "Biotoxicity of essential oil of Eucalyptus citriodora Hook (Myrtaceae) to dust mites.",
      "authors": "Cai H, Xie P, Zhang X, et al.",
      "journal": "Front Plant Sci",
      "year": 2025,
      "doi": "10.3389/fpls.2025.1708798",
      "pubmedId": "41424559",
      "url": "https://pubmed.ncbi.nlm.nih.gov/41424559/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lemon-eucalyptus"
      ],
      "compoundIds": [
        "citronellal"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "mites"
        }
      ],
      "finding": "Eucalyptus citriodora oil showed strong contact-fumigant toxicity to both house dust mite species, with citronellal the most toxic constituent and 100% vapor-phase mortality.",
      "limitations": "Laboratory bioassays at high applied doses; no bedroom-scale testing."
    },
    {
      "id": "george-2026-fireant",
      "title": "Repellent effect of oregano essential oil and carvacrol analogs against imported fire ants.",
      "authors": "George G, Shah FM, Ali A, et al.",
      "journal": "Pest Manag Sci",
      "year": 2026,
      "doi": "10.1002/ps.70297",
      "pubmedId": "41099098",
      "url": "https://pubmed.ncbi.nlm.nih.gov/41099098/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "oregano"
      ],
      "compoundIds": [
        "carvacrol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "ants"
        }
      ],
      "finding": "Oregano oil strongly repelled red and hybrid imported fire ants, with carvacrol (minimum repellent dose 0.98 ug/g) identified as the primary active constituent.",
      "limitations": "Laboratory repellency assays; no field colony-level data."
    },
    {
      "id": "holloway-2024-argentineant",
      "title": "Common Home Remedies Do Not Deter Argentine Ants, Linepithema humile (Hymenoptera: Formicidae), from a Preferred Harborage.",
      "authors": "Holloway JB, Suiter DR, Davis JW, et al.",
      "journal": "Insects",
      "year": 2024,
      "doi": "10.3390/insects15100768",
      "pubmedId": "39452344",
      "url": "https://pubmed.ncbi.nlm.nih.gov/39452344/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "peppermint",
        "rosemary"
      ],
      "compoundIds": [
        "menthol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "ants"
        }
      ],
      "finding": "MIXED RESULT: tansy, cucumber, and soybean-extract home remedies failed to deter Argentine ants even at 4 to 10 times the recommended dose, while 1% peppermint oil was the most deterrent treatment and fresh rosemary and spearmint leaves also deterred harboring.",
      "limitations": "Laboratory harborage assay; short 2 to 4 hour observation window."
    },
    {
      "id": "trongtokit-2005-mosquito",
      "title": "Comparative repellency of 38 essential oils against mosquito bites.",
      "authors": "Trongtokit Y, Rongsriyam Y, Komalamisra N, et al.",
      "journal": "Phytother Res",
      "year": 2005,
      "doi": "10.1002/ptr.1637",
      "pubmedId": "16041723",
      "url": "https://pubmed.ncbi.nlm.nih.gov/16041723/",
      "studyType": "controlled-human-study",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": null,
      "oilIds": [
        "citronella",
        "clove"
      ],
      "compoundIds": [
        "eugenol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "mosquitoes"
        }
      ],
      "finding": "Of 38 oils screened on human forearms, only undiluted citronella, patchouli, clove, and makaen oils gave 2 hours of complete repellency against Aedes aegypti, with clove lasting longest (2 to 4 hours) across three mosquito species; no oil at 10 to 50% lasted 2 hours.",
      "limitations": "Small volunteer panel; laboratory forearm assay, not field conditions."
    },
    {
      "id": "chandrasekaran-2019-vitex",
      "title": "Larvicidal activity of essential oil from Vitex negundo and Vitex trifolia on dengue vector mosquito Aedes aegypti.",
      "authors": "Chandrasekaran T, Thyagarajan A, Santhakumari PG, et al.",
      "journal": "Rev Soc Bras Med Trop",
      "year": 2019,
      "doi": "10.1590/0037-8682-0459-2018",
      "pubmedId": "31365621",
      "url": "https://pubmed.ncbi.nlm.nih.gov/31365621/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "vitex"
      ],
      "compoundIds": [
        "eucalyptol",
        "beta-caryophyllene"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "mosquitoes",
          "topic": "larvicide"
        }
      ],
      "finding": "Vitex trifolia and Vitex negundo oils killed Aedes aegypti and Culex quinquefasciatus larvae at 50 to 125 ppm, with LC50 values around 51 to 58 ppm for Ae. aegypti.",
      "limitations": "Laboratory larval assays; no field or non-target testing."
    },
    {
      "id": "mitra-2020-epa25b",
      "title": "Efficacy of Active Ingredients From the EPA 25(B) List in Reducing Attraction of Aedes aegypti (Diptera: Culicidae) to Humans.",
      "authors": "Mitra S, Rodriguez SD, Vulcan J, et al.",
      "journal": "J Med Entomol",
      "year": 2020,
      "doi": "10.1093/jme/tjz178",
      "pubmedId": "31612914",
      "url": "https://pubmed.ncbi.nlm.nih.gov/31612914/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "rosemary"
      ],
      "compoundIds": [
        "eucalyptol",
        "camphor"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "mosquitoes"
        }
      ],
      "finding": "NULL RESULT: rosemary oil showed no significant repellency against Aedes aegypti in the study's attraction assay, unlike peppermint oil which strongly reduced attraction at the first time point.",
      "limitations": "Single laboratory assay design; short observation window."
    },
    {
      "id": "schulze-2011-ticks",
      "title": "Experimental use of two standard tick collection methods to evaluate the relative effectiveness of several plant-derived and synthetic repellents against Ixodes scapularis and Amblyomma americanum (Acari: Ixodidae).",
      "authors": "Schulze TL, Jordan RA, Dolan MC",
      "journal": "J Econ Entomol",
      "year": 2011,
      "doi": "10.1603/ec10421",
      "pubmedId": "22299371",
      "url": "https://pubmed.ncbi.nlm.nih.gov/22299371/",
      "studyType": "in-vitro-study",
      "context": "environmental",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "grapefruit",
        "oregano"
      ],
      "compoundIds": [
        "nootkatone",
        "carvacrol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "ticks"
        }
      ],
      "finding": "In field-plot tick drags, nootkatone and a permethrin standard each repelled 100% of Ixodes scapularis nymphs through 14 days, slightly outperforming carvacrol (90.7%) and a plant-oil product (97.7%).",
      "limitations": "Field-plot evaluation, not a controlled lab assay; nootkatone tested as an isolated compound rather than as grapefruit oil."
    },
    {
      "id": "gaudet-2024-tickseeking",
      "title": "Lemongrass essential oil and DEET inhibit attractant detection in infected and non-infected Ixodes scapularis ticks.",
      "authors": "Gaudet K, Anholeto LA, Hillier NK, et al.",
      "journal": "Curr Res Insect Sci",
      "year": 2024,
      "doi": "10.1016/j.cris.2024.100096",
      "pubmedId": "39386116",
      "url": "https://pubmed.ncbi.nlm.nih.gov/39386116/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lemongrass"
      ],
      "compoundIds": [
        "citral",
        "geraniol"
      ],
      "categories": [
        {
          "type": "pest",
          "subcategory": "ticks"
        }
      ],
      "finding": "Exposure to lemongrass oil, citral, or geraniol significantly impaired adult female Ixodes scapularis ticks' ability to detect and respond to host attractant, regardless of pathogen infection status.",
      "limitations": "Electrophysiology and Y-tube lab assays; behavioral disruption rather than bite prevention was measured."
    },
    {
      "id": "nascimento-2025-sweet-orange-labor",
      "title": "Effectiveness of aromatherapy with sweet orange oil (Citrus sinensis L.) in relieving pain and anxiety during labor.",
      "authors": "Nascimento JC, et al.",
      "journal": "Explore (NY)",
      "year": 2025,
      "doi": "10.1016/j.explore.2024.103081",
      "pubmedId": "39577393",
      "url": "https://pubmed.ncbi.nlm.nih.gov/39577393/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 84,
      "oilIds": [
        "sweet-orange"
      ],
      "compoundIds": [
        "limonene"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "mental-health"
        },
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "Sweet orange inhalation significantly reduced labor pain intensity over time (p=0.0411) and anxiety (p<0.0001) versus a distilled-water placebo, while also lowering maternal blood pressure, heart rate, respiratory rate and fetal heart rate.",
      "limitations": "Single-blind, single-center Brazilian trial; labor setting limits generalizability."
    },
    {
      "id": "wakui-2026-bergamot-exam-anxiety",
      "title": "Evaluation of the Anxiety-Reducing Effects of Aroma Stones with Bergamot Essential Oil before Examinations: A Randomized Controlled Trial.",
      "authors": "Wakui N, et al.",
      "journal": "J Integr Complement Med",
      "year": 2026,
      "doi": "10.1177/27683605261488658",
      "pubmedId": "42755326",
      "url": "https://pubmed.ncbi.nlm.nih.gov/42755326/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 57,
      "oilIds": [
        "bergamot"
      ],
      "compoundIds": [
        "limonene",
        "linalyl-acetate",
        "linalool"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "mental-health"
        }
      ],
      "finding": "Bergamot aroma stones used for 3 days before examinations significantly lowered state anxiety scores versus water-stone controls on all three days (Cohen's d > 0.8) with no reported adverse events.",
      "limitations": "Open-label, single-center design; 57 students; short 3-day intervention."
    },
    {
      "id": "hongratanaworakit-2006-ylang-ylang-transdermal",
      "title": "Relaxing effect of ylang ylang oil on humans after transdermal absorption.",
      "authors": "Hongratanaworakit T, et al.",
      "journal": "Phytother Res",
      "year": 2006,
      "doi": "10.1002/ptr.1950",
      "pubmedId": "16807875",
      "url": "https://pubmed.ncbi.nlm.nih.gov/16807875/",
      "studyType": "controlled-human-study",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 40,
      "oilIds": [
        "ylang-ylang"
      ],
      "compoundIds": [
        "linalool"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "mental-health"
        },
        {
          "type": "health",
          "subcategory": "cardiovascular"
        }
      ],
      "finding": "Transdermal ylang ylang oil significantly decreased blood pressure and increased skin temperature in 40 healthy volunteers, who also rated themselves calmer and more relaxed than the control group.",
      "limitations": "Short-term transdermal exposure; no dose-response tested."
    },
    {
      "id": "napavichayanun-2024-lavender-ylang-ylang-blood-pressure",
      "title": "Effect of Lavandula angustifolia and Cananga odorata on decrease of blood pressure in high blood pressure volunteers: A randomized controlled trial.",
      "authors": "Napavichayanun S, et al.",
      "journal": "Explore (NY)",
      "year": 2024,
      "doi": "10.1016/j.explore.2023.11.013",
      "pubmedId": "38087747",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38087747/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 34,
      "oilIds": [
        "lavender",
        "ylang-ylang"
      ],
      "compoundIds": [
        "linalool",
        "linalyl-acetate"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "cardiovascular"
        },
        {
          "type": "health",
          "subcategory": "mental-health"
        }
      ],
      "finding": "Sticker pads containing lavender and ylang ylang oils worn for 14 days significantly reduced systolic blood pressure and pulse rate versus placebo in volunteers with high blood pressure, with no adverse reactions.",
      "limitations": "34 high-BP volunteers in efficacy phase; longer-term effects unknown."
    },
    {
      "id": "sienkiewicz-2014-geranium-wound-bacteria",
      "title": "The antibacterial activity of geranium oil against Gram-negative bacteria isolated from difficult-to-heal wounds.",
      "authors": "Sienkiewicz M, et al.",
      "journal": "Burns",
      "year": 2014,
      "doi": "10.1016/j.burns.2013.11.002",
      "pubmedId": "24290961",
      "url": "https://pubmed.ncbi.nlm.nih.gov/24290961/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "geranium"
      ],
      "compoundIds": [
        "geraniol",
        "linalool"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "bacteria",
          "topic": "gram-negative"
        },
        {
          "type": "health",
          "subcategory": "wound"
        }
      ],
      "finding": "Geranium oil inhibited the growth of Gram-negative clinical strains isolated from difficult-to-heal wounds, suggesting it may be a useful component of therapy against resistant wound pathogens.",
      "limitations": "In vitro study only; clinical wound efficacy and safety not tested."
    },
    {
      "id": "androutsopoulou-2021-rose-geranium-preservative",
      "title": "Evaluation of Essential Oils and Extracts of Rose Geranium and Rose Petals as Natural Preservatives in Terms of Toxicity, Antimicrobial, and Antiviral Activity.",
      "authors": "Androutsopoulou C, et al.",
      "journal": "Pathogens",
      "year": 2021,
      "doi": "10.3390/pathogens10040494",
      "pubmedId": "33921899",
      "url": "https://pubmed.ncbi.nlm.nih.gov/33921899/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "geranium"
      ],
      "compoundIds": [
        "geraniol",
        "linalool"
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
        },
        {
          "type": "microbial",
          "subcategory": "fungi",
          "topic": "mold"
        },
        {
          "type": "microbial",
          "subcategory": "viruses"
        }
      ],
      "finding": "MIXED RESULT: 5% rose geranium essential oil showed no antibacterial activity (though 100% oil was strongly effective against E. coli), while it and the rose geranium extracts showed antifungal activity against Aspergillus niger and dose-dependent antiviral activity, with no toxicity at tested dilutions.",
      "limitations": "In vitro study only; antibacterial efficacy highly concentration-dependent."
    },
    {
      "id": "amrita-2023-palmarosa-bioactivities",
      "title": "Underutilized Plant Cymbopogan martinii Derived Essential Oil Is Excellent Source of Bioactives with Diverse Biological Activities.",
      "authors": "Amrita, et al.",
      "journal": "Russ Agric Sci",
      "year": 2023,
      "doi": "10.3103/S1068367423010044",
      "pubmedId": "37124716",
      "url": "https://pubmed.ncbi.nlm.nih.gov/37124716/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "palmarosa"
      ],
      "compoundIds": [
        "geraniol"
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
        },
        {
          "type": "microbial",
          "subcategory": "fungi",
          "topic": "mold"
        },
        {
          "type": "health",
          "subcategory": "metabolic"
        },
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "Palmarosa essential oil, with geraniol as its major component, showed antibacterial, antifungal, anti-inflammatory and alpha-amylase-inhibitory (antidiabetic) activity in vitro along with strong antioxidant capacity.",
      "limitations": "In vitro and biochemical assays only; no animal or human data."
    },
    {
      "id": "fikry-2025-niaouli-lung-cancer",
      "title": "Chemical Composition and Anti-Lung Cancer Activities of Melaleuca quinquenervia Leaf Essential Oil: Integrating Gas Chromatography-Mass Spectrometry (GC/MS) Profiling, Network Pharmacology, and Molecular Docking.",
      "authors": "Fikry E, et al.",
      "journal": "Pharmaceuticals (Basel)",
      "year": 2025,
      "doi": "10.3390/ph18060771",
      "pubmedId": "40573169",
      "url": "https://pubmed.ncbi.nlm.nih.gov/40573169/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "niaouli"
      ],
      "compoundIds": [
        "eucalyptol",
        "alpha-pinene"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "immune"
        }
      ],
      "finding": "Niaouli leaf essential oil (1,8-cineole 31.57%, alpha-pinene isomers 21.26%) showed selective cytotoxicity against A549 lung cancer cells (IC50 18.09 ug/mL), inhibited cell migration, and induced apoptosis and G0-G1 cell-cycle arrest.",
      "limitations": "In vitro cytotoxicity only; anticancer activity has no dedicated category in the taxonomy so tagged as immune; no animal or pharmacokinetic validation yet."
    },
    {
      "id": "chen-2020-ravintsara-mrsa",
      "title": "Metabolomics analysis to evaluate the antibacterial activity of the essential oil from the leaves of Cinnamomum camphora (Linn.) Presl.",
      "authors": "Chen J, et al.",
      "journal": "J Ethnopharmacol",
      "year": 2020,
      "doi": "10.1016/j.jep.2020.112652",
      "pubmedId": "32035880",
      "url": "https://pubmed.ncbi.nlm.nih.gov/32035880/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "ravintsara"
      ],
      "compoundIds": [
        "linalool",
        "eucalyptol",
        "camphor"
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
      "finding": "Cinnamomum camphora leaf essential oil showed anti-MRSA activity (MIC 0.8 mg/mL, MBC 1.6 mg/mL), damaging bacterial cell membranes and disrupting amino acid metabolism according to GC-MS metabolomics.",
      "limitations": "In vitro study only; chemotype-dependent composition may vary."
    },
    {
      "id": "frank-2009-frankincense-bladder-cancer",
      "title": "Frankincense oil derived from Boswellia carteri induces tumor cell specific cytotoxicity.",
      "authors": "Frank MB, et al.",
      "journal": "BMC Complement Altern Med",
      "year": 2009,
      "doi": "10.1186/1472-6882-9-6",
      "pubmedId": "19296830",
      "url": "https://pubmed.ncbi.nlm.nih.gov/19296830/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "frankincense"
      ],
      "compoundIds": [
        "alpha-pinene",
        "limonene"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "immune"
        }
      ],
      "finding": "Frankincense oil suppressed viability of J82 bladder transitional carcinoma cells but not normal urothelial cells, activating genes for cell-cycle arrest, growth suppression and apoptosis.",
      "limitations": "In vitro study only; intravesical delivery and human safety not tested; tagged as immune (no oncology category in taxonomy)."
    },
    {
      "id": "hovijitra-2016-cinnamon-candida",
      "title": "Effect of essential oils prepared from Thai culinary herbs on sessile Candida albicans cultures.",
      "authors": "Hovijitra RS, et al.",
      "journal": "J Oral Sci",
      "year": 2016,
      "doi": "10.2334/josnusd.15-0736",
      "pubmedId": "27665976",
      "url": "https://pubmed.ncbi.nlm.nih.gov/27665976/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "cinnamon"
      ],
      "compoundIds": [
        "cinnamaldehyde"
      ],
      "categories": [
        {
          "type": "microbial",
          "subcategory": "fungi",
          "topic": "yeast"
        },
        {
          "type": "microbial",
          "subcategory": "biofilms"
        }
      ],
      "finding": "Cinnamon bark essential oil was potently fungicidal against both planktonic and sessile (biofilm) Candida albicans, though sessile MICs were 8 to 16 times higher than planktonic MICs.",
      "limitations": "In vitro study only; much higher concentrations needed against biofilms than planktonic cells."
    },
    {
      "id": "khalil-2020-myrrh-mdr-bacteria",
      "title": "Bactericidal activity of Myrrh extracts and two dosage forms against standard bacterial strains and multidrug-resistant clinical isolates with GC/MS profiling.",
      "authors": "Khalil N, et al.",
      "journal": "AMB Express",
      "year": 2020,
      "doi": "10.1186/s13568-020-0958-3",
      "pubmedId": "31993779",
      "url": "https://pubmed.ncbi.nlm.nih.gov/31993779/",
      "studyType": "in-vitro-study",
      "context": "in-vitro",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
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
          "subcategory": "bacteria",
          "topic": "gram-positive"
        },
        {
          "type": "microbial",
          "subcategory": "bacteria",
          "topic": "gram-negative"
        },
        {
          "type": "health",
          "subcategory": "oral-dental"
        }
      ],
      "finding": "Myrrh essential oil achieved greater than 99.999% killing of Staphylococcus aureus and Pseudomonas aeruginosa within 2 hours, showed bactericidal activity against multidrug-resistant clinical isolates, and a 5% myrrh mouthwash killed about 99.999% of S. aureus in saliva within 30 minutes.",
      "limitations": "In vitro study only; cytotoxicity data limited to cell lines."
    },
    {
      "id": "seifi-2014-lavender-anxiety-null",
      "title": "The effect of lavender essential oil on anxiety level in patients undergoing coronary artery bypass graft surgery: A double-blinded randomized clinical trial.",
      "authors": "Seifi Z, et al.",
      "journal": "Iran J Nurs Midwifery Res",
      "year": 2014,
      "doi": "",
      "pubmedId": "25558253",
      "url": "https://pubmed.ncbi.nlm.nih.gov/25558253/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 60,
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
          "subcategory": "mental-health"
        }
      ],
      "finding": "NULL RESULT: Lavender essential oil inhalation produced no statistically significant difference in anxiety scores versus a distilled-water placebo in patients after coronary artery bypass graft surgery, although anxiety decreased in both groups.",
      "limitations": "60 patients; 2-day intervention in acute post-surgical setting; results may not generalize."
    },
    {
      "id": "moss-2008-peppermint-cognition",
      "title": "Modulation of cognitive performance and mood by aromas of peppermint and ylang-ylang",
      "authors": "Moss M, Hewitt S, Moss L, Wesnes K",
      "journal": "International Journal of Neuroscience",
      "year": 2008,
      "doi": "10.1080/00207450601042094",
      "pubmedId": "18041606",
      "url": "https://pubmed.ncbi.nlm.nih.gov/18041606/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 144,
      "oilIds": [
        "peppermint"
      ],
      "compoundIds": [
        "menthol"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "memory"
        },
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "alertness"
        },
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "mood"
        }
      ],
      "finding": "In 144 healthy volunteers, peppermint aroma enhanced memory measures and increased subjective alertness compared with ylang-ylang and no-aroma conditions.",
      "limitations": "Acute laboratory aroma exposure in healthy volunteers; does not establish treatment effects or effects of a finished product."
    },
    {
      "id": "alkanat-2023-frankincense-myrrh-backpain",
      "title": "The effects of massage with frankincense and myrrh oil in chronic low back pain: A three-arm randomised controlled trial",
      "authors": "Özdemir Alkanat H, Özdemir Ü, Kulaklı F",
      "journal": "Explore",
      "year": 2023,
      "doi": "10.1016/j.explore.2023.04.004",
      "pubmedId": "37121835",
      "url": "https://pubmed.ncbi.nlm.nih.gov/37121835/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 91,
      "oilIds": [
        "frankincense",
        "myrrh"
      ],
      "compoundIds": [],
      "categories": [
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "Twice-weekly massage using frankincense and myrrh essential oils produced greater reductions in pain and disability scores than jojoba-oil massage or no massage in adults with chronic low back pain.",
      "limitations": "Combination intervention; cannot separate effects of frankincense from myrrh, and massage is a co-intervention."
    },
    {
      "id": "ozdemir-2024-frankincense-myrrh-comfort",
      "title": "The effect of back massage with frankincense and myrrh oil before the cardiac electrophysiological procedure on back pain intensity and comfort: A single-blind randomized controlled trial",
      "authors": "Özdemir Ü, Taşcı S, Döner A, Özdemir Alkanat H, İnanç MT",
      "journal": "Explore",
      "year": 2024,
      "doi": "10.1016/j.explore.2023.09.007",
      "pubmedId": "37783585",
      "url": "https://pubmed.ncbi.nlm.nih.gov/37783585/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 90,
      "oilIds": [
        "frankincense",
        "myrrh"
      ],
      "compoundIds": [],
      "categories": [
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "Frankincense-and-myrrh aromatherapy massage increased several comfort measures versus comparator groups, but post-procedure pain scores did not significantly differ between groups.",
      "limitations": "Mixed result; combination oils plus massage prevents attribution to either oil alone. Authors called for more rigorous pain research."
    },
    {
      "id": "reis-2023-frankincense-fatigue",
      "title": "Cancer-Related Fatigue: A Pilot Study Evaluating the Effect of Frankincense Essential Oil in Patients With Cancer Receiving Chemotherapy",
      "authors": "Reis D, et al.",
      "journal": "Cancer Nursing",
      "year": 2023,
      "doi": "10.1097/NCC.0000000000001080",
      "pubmedId": "35245227",
      "url": "https://pubmed.ncbi.nlm.nih.gov/35245227/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 70,
      "oilIds": [
        "frankincense"
      ],
      "compoundIds": [],
      "categories": [
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "fatigue"
        }
      ],
      "finding": "Frankincense oil applied to the feet around chemotherapy did not significantly reduce cancer-related fatigue compared with carrier-oil control.",
      "limitations": "Pilot trial; negative result. Topical-foot application and oncology population limit generalization."
    },
    {
      "id": "nialeila-2020-myrrh-frankincense-wound",
      "title": "Episiotomy wound healing by Commiphora myrrha and Boswellia carteri in primiparous women: A randomized controlled trial",
      "authors": "Nialeila F, et al.",
      "journal": "Journal of Ethnopharmacology",
      "year": 2021,
      "doi": "10.1016/j.jep.2020.113396",
      "pubmedId": "32971163",
      "url": "https://pubmed.ncbi.nlm.nih.gov/32971163/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 90,
      "oilIds": [
        "myrrh",
        "frankincense"
      ],
      "compoundIds": [],
      "categories": [
        {
          "type": "health",
          "subcategory": "wound"
        }
      ],
      "finding": "A randomized trial evaluated myrrh- and frankincense-based sitz baths for episiotomy wound healing in 90 primiparous women and reported improved healing outcomes versus control.",
      "limitations": "Herbal sitz-bath preparations are not equivalent to essential-oil sprays; each botanical was used as a specific clinical preparation."
    },
    {
      "id": "aydinli-2026-lavender-frankincense-biopsy",
      "title": "Aromatherapy effects on pain and anxiety during transrectal ultrasound-guided prostate biopsy: A randomized controlled trial",
      "authors": "Aydınlı B, et al.",
      "journal": "Journal article",
      "year": 2026,
      "pubmedId": "42302879",
      "url": "https://pubmed.ncbi.nlm.nih.gov/42302879/",
      "studyType": "randomized-controlled-trial",
      "context": "human",
      "evidenceLevel": "clinical",
      "sampleSize": 120,
      "oilIds": [
        "lavender",
        "frankincense"
      ],
      "compoundIds": [
        "linalool"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "mental-health",
          "topic": "anxiety"
        },
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "In 120 men undergoing prostate biopsy, lavender and frankincense aromatherapy delivered by nebulizer were compared with placebo for procedural anxiety and pain.",
      "limitations": "Procedure-specific clinical setting; separate oil groups should be interpreted from the full paper before making comparative claims."
    },
    {
      "id": "cannabis-terpenes-review-2020",
      "title": "Cannabis sativa terpenes are cannabimimetic and selectively enhance cannabinoid activity",
      "authors": "LaVigne JE, Hecksel R, Keresztes A, Streicher JM",
      "journal": "Scientific Reports",
      "year": 2021,
      "doi": "10.1038/s41598-021-87740-8",
      "pubmedId": "33888729",
      "url": "https://pubmed.ncbi.nlm.nih.gov/33888729/",
      "studyType": "animal-study",
      "context": "animal",
      "evidenceLevel": "preclinical",
      "sampleSize": null,
      "oilIds": [
        "cannabis"
      ],
      "compoundIds": [
        "alpha-humulene",
        "geraniol",
        "linalool",
        "beta-pinene"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "pain-inflammation"
        }
      ],
      "finding": "Selected terpenes found in Cannabis sativa produced cannabinoid-like behavioral effects in mice and interacted with cannabinoid signaling in experimental models.",
      "limitations": "Preclinical mouse and cellular work on selected isolated terpenes; does not establish effects of cannabis aroma, essential oil, or a finished product in humans."
    },
    {
      "id": "cannabis-terpene-profiles-2022",
      "title": "Terpene Synthases and Terpene Variation in Cannabis sativa",
      "authors": "Booth JK, Bohlmann J",
      "journal": "Plant Science / phytochemistry research",
      "year": 2019,
      "pubmedId": "30690172",
      "url": "https://pubmed.ncbi.nlm.nih.gov/30690172/",
      "studyType": "review",
      "context": "plant",
      "evidenceLevel": "review",
      "sampleSize": null,
      "oilIds": [
        "cannabis"
      ],
      "compoundIds": [
        "myrcene",
        "limonene",
        "alpha-pinene",
        "beta-pinene",
        "linalool",
        "beta-caryophyllene",
        "alpha-humulene"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "plant chemistry"
        }
      ],
      "finding": "Reviews the diverse monoterpenes and sesquiterpenes produced by Cannabis sativa and the terpene synthases underlying cultivar-dependent aroma profiles.",
      "limitations": "Plant chemistry review, not evidence of therapeutic efficacy."
    },
    {
      "id": "cannabis-terpene-diversity-2016",
      "title": "Terpenes in Cannabis sativa - From plant genome to humans",
      "authors": "Booth JK, Page JE, Bohlmann J",
      "journal": "Plant Science",
      "year": 2017,
      "doi": "10.1016/j.plantsci.2017.03.018",
      "pubmedId": "28602488",
      "url": "https://pubmed.ncbi.nlm.nih.gov/28602488/",
      "studyType": "review",
      "context": "plant",
      "evidenceLevel": "review",
      "sampleSize": null,
      "oilIds": [
        "cannabis"
      ],
      "compoundIds": [
        "myrcene",
        "limonene",
        "alpha-pinene",
        "beta-pinene",
        "linalool",
        "beta-caryophyllene",
        "alpha-humulene"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "plant chemistry"
        }
      ],
      "finding": "Reviews Cannabis sativa terpene biosynthesis, genetic diversity, ecological roles, and potential relevance of volatile terpenes to human exposure.",
      "limitations": "Narrative plant-science review; potential human relevance should not be interpreted as demonstrated clinical benefit."
    },
    {
      "id": "cannabis-aroma-chemistry-2023",
      "title": "Minor, Nonterpenoid Volatile Compounds Drive the Aroma Differences of Exotic Cannabis",
      "authors": "Oswald IW, et al.",
      "journal": "ACS Omega",
      "year": 2023,
      "doi": "10.1021/acsomega.3c04496",
      "pubmedId": "37901519",
      "url": "https://pubmed.ncbi.nlm.nih.gov/37901519/",
      "studyType": "analytical-sensory-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": 31,
      "oilIds": [
        "cannabis"
      ],
      "compoundIds": [
        "myrcene",
        "limonene",
        "beta-caryophyllene"
      ],
      "categories": [
        {
          "type": "sensory",
          "subcategory": "aroma-chemistry",
          "topic": "volatile compounds"
        }
      ],
      "finding": "Chemical and sensory analysis showed that cannabis aroma differences cannot be explained by dominant terpenes alone; minor volatile compounds make important contributions.",
      "limitations": "Thirty-one ice-hash rosin extracts; not steam-distilled essential oil, efficacy evidence or a finished-product analysis.",
      "material": "Ice-hash rosin extracts",
      "chemicalGroups": [
        "thiol",
        "ester"
      ]
    },
    {
      "id": "cannabis-volatile-classification-2022",
      "title": "The phytochemical diversity of commercial Cannabis in the United States",
      "authors": "Smith CJ, et al.",
      "journal": "PLoS ONE",
      "year": 2022,
      "pubmedId": "35446892",
      "url": "https://pubmed.ncbi.nlm.nih.gov/35446892/",
      "studyType": "observational-study",
      "context": "plant",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "cannabis"
      ],
      "compoundIds": [
        "myrcene",
        "limonene",
        "beta-caryophyllene",
        "alpha-pinene",
        "linalool"
      ],
      "categories": [
        {
          "type": "health",
          "subcategory": "cognitive",
          "topic": "plant chemistry"
        }
      ],
      "finding": "Large-scale chemical profiling of commercial Cannabis samples demonstrated substantial phytochemical diversity and showed that conventional strain labels poorly capture underlying chemistry.",
      "limitations": "Commercial-sample chemistry study; not clinical evidence and includes cannabinoids as well as volatile chemistry."
    },
    {
      "id": "cannabis-sulfur-aroma-2021",
      "title": "Identification of a New Family of Prenylated Volatile Sulfur Compounds in Cannabis Revealed by Comprehensive Two-Dimensional Gas Chromatography",
      "authors": "Oswald IWH, et al.",
      "journal": "ACS Omega",
      "year": 2021,
      "doi": "10.1021/acsomega.1c04196",
      "pubmedId": "34869990",
      "url": "https://pubmed.ncbi.nlm.nih.gov/34869990/",
      "studyType": "analytical-sensory-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "cannabis"
      ],
      "compoundIds": [
        "prenylthiol"
      ],
      "categories": [
        {
          "type": "sensory",
          "subcategory": "aroma-chemistry",
          "topic": "sulfur volatiles"
        }
      ],
      "finding": "Chemical analysis and sensory assessment associated prenylthiol with skunky aroma in the cannabis flowers and concentrated extracts studied.",
      "limitations": "Flowers from 13 cultivars and three hydrocarbon extracts, plus a plant-development series. Not a steam-distilled oil analysis or efficacy study.",
      "material": "Flowers and hydrocarbon extracts"
    },
    {
      "id": "cannabis-aroma-chemistry-2024",
      "title": "Nonterpenoid Chemical Diversity of Cannabis Phenotypes Predicts Differentiated Aroma Characteristics",
      "authors": "Paryani TR, et al.",
      "journal": "ACS Omega",
      "year": 2024,
      "doi": "10.1021/acsomega.4c03225",
      "pubmedId": "38973868",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38973868/",
      "studyType": "analytical-sensory-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": 5,
      "oilIds": [
        "cannabis"
      ],
      "compoundIds": [],
      "categories": [
        {
          "type": "sensory",
          "subcategory": "aroma-chemistry",
          "topic": "minor nonterpenoid volatiles"
        }
      ],
      "finding": "Analytical and sensory comparisons linked minor nonterpenoid differences with aroma differences among sibling cannabis phenotypes.",
      "limitations": "Five ice-water hash rosin extracts. Small analytical/sensory comparison, not distilled oil or product efficacy evidence.",
      "material": "Ice-water hash rosin extracts",
      "chemicalGroups": [
        "thiol",
        "ester"
      ]
    },
    {
      "id": "cannflavins-review-2021",
      "title": "Flavonoids in Cannabis sativa: Biosynthesis, Bioactivities, and Biotechnology",
      "authors": "Bautista JL, Yu S, Tian L",
      "journal": "ACS Omega",
      "year": 2021,
      "doi": "10.1021/acsomega.1c00318",
      "pubmedId": "33681553",
      "url": "https://pubmed.ncbi.nlm.nih.gov/33681553/",
      "studyType": "narrative-review",
      "context": "mechanistic",
      "evidenceLevel": "review",
      "sampleSize": null,
      "oilIds": [
        "cannabis"
      ],
      "compoundIds": [
        "cannflavin-a"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "nonvolatile-chemistry",
          "topic": "flavonoid chemistry"
        }
      ],
      "finding": "Reviews the biosynthesis and research literature on cannflavins in Cannabis sativa.",
      "limitations": "Review of plant compounds and experimental research, not a distilled-oil analysis or clinical evidence for the finished formula.",
      "material": "Plant material and reviewed preparations"
    },
    {
      "id": "composition-peppermint-2012",
      "title": "Chemical Composition, Antifungal and Antibiofilm Activities of the Essential Oil of Mentha piperita L.",
      "authors": "Saharkhiz Mohammad Jamal, Motamedi Marjan, Zomorodian Kamiar et al.",
      "journal": "ISRN Pharmaceutics",
      "year": 2012,
      "doi": "10.5402/2012/718645",
      "url": "https://doi.org/10.5402/2012/718645",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "peppermint"
      ],
      "compoundIds": [
        "menthyl-acetate"
      ],
      "chemicalGroups": [
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Menthyl acetate was reported in the study oil.",
      "limitations": "The hydrodistilled study sample is not the catalog steam-distilled product. No human efficacy inference. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Essential oil; Hydrodistilled air-dried flowering aerial parts of Mentha piperita, Fars, Iran"
    },
    {
      "id": "composition-eucalyptus-2023",
      "title": "Chemical Composition and Biological Activities of Eucalyptus globulus Essential Oil",
      "authors": "Čmiková Natália, Galovičová Lucia, Schwarzová Marianna et al.",
      "journal": "Plants",
      "year": 2023,
      "doi": "10.3390/plants12051076",
      "url": "https://doi.org/10.3390/plants12051076",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "eucalyptus"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Isobutyl isobutyrate was reported in the commercial sample.",
      "limitations": "Single commercial sample. 1,8-cineole is a cyclic ether, not an epoxide. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Essential oil; Commercial Hanus oil from fresh Eucalyptus globulus leaves cultivated in Spain"
    },
    {
      "id": "composition-citronella-2016",
      "title": "Essential Oil of Cymbopogon nardus (L.) Rendle: A Strategy to Combat Fungal Infections Caused by Candida Species",
      "authors": "De Toledo Luciani, Ramos Matheus, Spósito Larissa et al.",
      "journal": "International Journal of Molecular Sciences",
      "year": 2016,
      "doi": "10.3390/ijms17081252",
      "url": "https://doi.org/10.3390/ijms17081252",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "citronella"
      ],
      "compoundIds": [
        "citronellal",
        "citral",
        "geranyl-acetate"
      ],
      "chemicalGroups": [
        "aldehyde",
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Citronellal was reported in this C. nardus sample.",
      "limitations": "C. nardus is not interchangeable with C. winterianus. Sample differs from catalog steam-distillation label; assignments rely on GC-MS matching. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Essential oil; Cymbopogon nardus leaves collected July 2013 in a Brazilian medicinal-plant garden"
    },
    {
      "id": "composition-thyme-2016",
      "title": "Essential Oil Characterization of Thymus vulgaris from Various Geographical Locations",
      "authors": "Satyal Prabodh, Murray Brittney, McFeeters Robert et al.",
      "journal": "Foods",
      "year": 2016,
      "doi": "10.3390/foods5040070",
      "url": "https://doi.org/10.3390/foods5040070",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "thyme"
      ],
      "compoundIds": [
        "linalyl-acetate",
        "geranyl-acetate",
        "citral"
      ],
      "chemicalGroups": [
        "ester",
        "aldehyde"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Linalyl acetate was measured in sample #1.",
      "limitations": "Chemotype-specific findings. Literature profiles in the paper are not additional measured samples. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Essential oil; Four directly measured Thymus vulgaris chemotypes from France and Serbia, May 2015, air-dried aerial parts"
    },
    {
      "id": "composition-oregano-2020",
      "title": "Antioxidant and Antibacterial Capacities of Origanum vulgare L. Essential Oil from the Arid Andean Region of Chile and its Chemical Characterization by GC-MS",
      "authors": "Simirgiotis Mario J., Burton Daniel, Parra Felipe et al.",
      "journal": "Metabolites",
      "year": 2020,
      "doi": "10.3390/metabo10100414",
      "url": "https://doi.org/10.3390/metabo10100414",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "oregano"
      ],
      "compoundIds": [
        "linalyl-acetate"
      ],
      "chemicalGroups": [
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Linalyl acetate was reported in the studied regional profile.",
      "limitations": "Regional oil profile, not universal oregano composition. Colorimetric total phenolics do not identify named flavonoids. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Essential oil; Dried flowering aerial parts of Origanum vulgare, Socoroma/Putre, Chile, November 2019"
    },
    {
      "id": "composition-lemongrass-2014",
      "title": "Lemon grass (Cymbopogon citratus) essential oil as a potent anti-inflammatory and antifungal drugs",
      "authors": "Boukhatem Mohamed Nadjib, Ferhat Mohamed Amine, Kameli Abdelkrim et al.",
      "journal": "Libyan Journal of Medicine",
      "year": 2014,
      "doi": "10.3402/ljm.v9.25431",
      "url": "https://doi.org/10.3402/ljm.v9.25431",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lemongrass"
      ],
      "compoundIds": [
        "geranyl-acetate",
        "citral",
        "citronellal"
      ],
      "chemicalGroups": [
        "ester",
        "aldehyde"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Geranyl acetate was reported in the study oil.",
      "limitations": "Fresh/dried feedstock is inconsistent in the paper. Correct isomer names: geranial is E/trans; neral is Z/cis. Animal/in-vitro evidence is not human efficacy. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Essential oil; Cymbopogon citratus leaf/aerial material, Chiffa/Blida, Algeria, May 2013"
    },
    {
      "id": "composition-lemon-eucalyptus-2007",
      "title": "Chemical Composition, Olfactory Evaluation and Antioxidant Effects of the Leaf Essential Oil of Corymbia citriodora (Hook) from China",
      "authors": "Jirovetz Leopold, Bail Stefanie, Buchbauer Gerhard et al.",
      "journal": "Natural Product Communications",
      "year": 2007,
      "doi": "10.1177/1934578X0700200518",
      "url": "https://doi.org/10.1177/1934578X0700200518",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lemon-eucalyptus"
      ],
      "compoundIds": [
        "citronellal",
        "geranyl-acetate"
      ],
      "chemicalGroups": [
        "aldehyde",
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Citronellal was reported; the source has a numerical value but sample-specific extraction is not established, so no composition number is imported.",
      "limitations": "General introduction on steam distillation does not establish preparation of this sample. Rutin/quercetin assay comparators are not oil constituents. Not a PMD-rich processed product. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Essential oil; Chinese Corymbia citriodora leaf oil, commercial product 800319, Kurt Kitzing"
    },
    {
      "id": "composition-lemon-eucalyptus-2004",
      "title": "GC/MS Analysis of the Volatile Constituents of Corymbia citriodora Hook. from Réunion Island",
      "authors": "Vernin G. A., Parkanyi C., Cozzolino F. et al.",
      "journal": "Journal of Essential Oil Research",
      "year": 2004,
      "doi": "10.1080/10412905.2004.9698798",
      "url": "https://doi.org/10.1080/10412905.2004.9698798",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lemon-eucalyptus"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Citronellyl citronellate was reported as a trace constituent; no numerical amount was obtained.",
      "limitations": "Trace ester reported; numerical concentration not available in the accessible abstract. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Essential oil; Corymbia citriodora leaf oil from Réunion Island"
    },
    {
      "id": "composition-cinnamon-2022",
      "title": "Anti-Staphylococcal Activity of Cinnamomum zeylanicum Essential Oil against Planktonic and Biofilm Cells Isolated from Canine Otological Infections",
      "authors": "Albuquerque Vinicius de Queiroz, Soares Maria Janeila Carvalho, Matos Maria Nágila Carneiro et al.",
      "journal": "Antibiotics",
      "year": 2022,
      "doi": "10.3390/antibiotics11010004",
      "url": "https://doi.org/10.3390/antibiotics11010004",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "cinnamon"
      ],
      "compoundIds": [
        "cinnamaldehyde"
      ],
      "chemicalGroups": [
        "aldehyde",
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "(E)-Cinnamaldehyde was reported in this bark-oil sample.",
      "limitations": "C. zeylanicum is a synonym of C. verum. Bark differs from leaf/root oils. Canine isolates were tested in vitro, not in a treatment trial. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Essential oil; Commercial Laszlo Cinnamomum zeylanicum stem-bark oil, manufacturer-reported Sri Lankan origin"
    },
    {
      "id": "composition-peppermint-tincture-2020",
      "title": "Analysis of Polyphenolic Composition of a Herbal Medicinal Product: Peppermint Tincture",
      "authors": "Bodalska Agnieszka, Kowalczyk Adam, Włodarczyk Maciej et al.",
      "journal": "Molecules",
      "year": 2020,
      "doi": "10.3390/molecules25010069",
      "url": "https://doi.org/10.3390/molecules25010069",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "peppermint"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "flavonoid"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "flavonoid analysis"
        }
      ],
      "finding": "Eriocitrin and luteolin-7-O-rutinoside were reported. Flavonoids cannot be attributed to the added oil fraction.",
      "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Plant extract / infusion; 23 commercial peppermint tinctures from Polish pharmacies"
    },
    {
      "id": "composition-eucalyptus-extract-2023",
      "title": "Characterization of Chemical Composition and Antioxidant Activity of Eucalyptus globulus Leaves under Different Extraction Conditions",
      "authors": "Park Jae Yeon, Kim Ju Yeon, Son Yun Gon et al.",
      "journal": "Applied Sciences",
      "year": 2023,
      "doi": "10.3390/app13179984",
      "url": "https://doi.org/10.3390/app13179984",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "eucalyptus"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "flavonoid"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "flavonoid analysis"
        }
      ],
      "finding": "Epicatechin, isoquercitrin and quercitrin were reported in leaf extracts.",
      "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Plant extract / infusion; Eucalyptus globulus leaves from Haman-gun, Republic of Korea"
    },
    {
      "id": "composition-thyme-extract-2022",
      "title": "Modulatory Impact of Lamiaceae Metabolites on Apoptosis of Human Leukemia Cells",
      "authors": "Berdowska Izabela, Zieliński Bogdan, Matusiewicz Małgorzata et al.",
      "journal": "Frontiers in Pharmacology",
      "year": 2022,
      "doi": "10.3389/fphar.2022.867709",
      "url": "https://doi.org/10.3389/fphar.2022.867709",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "thyme"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "flavonoid"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "flavonoid analysis"
        }
      ],
      "finding": "Luteolin-7-O-beta-glucuronide and apigenin-7-O-beta-glucoside were reported. The paper did not show a clear apoptotic effect for common-thyme extract; no treatment claim is inferred.",
      "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Plant extract / infusion; Commercial Polish Thymus vulgaris herb, aqueous polyphenol-enriched extracts"
    },
    {
      "id": "composition-oregano-extract-2021",
      "title": "UHPLC-DAD Characterization of Origanum vulgare L. from Atacama Desert Andean Region and Antioxidant, Antibacterial and Enzyme Inhibition Activities",
      "authors": "Parra Claudio, Muñoz Patricio, Bustos Luis et al.",
      "journal": "Molecules",
      "year": 2021,
      "doi": "10.3390/molecules26072100",
      "url": "https://doi.org/10.3390/molecules26072100",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "oregano"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "flavonoid"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "flavonoid analysis"
        }
      ],
      "finding": "Luteolin, naringenin, rutin and apigenin were reported.",
      "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Plant extract / infusion; Origanum vulgare from the Atacama Desert Andean region"
    },
    {
      "id": "composition-lemongrass-infusion-2014",
      "title": "Chemical characterization and anti-inflammatory activity of luteolin glycosides isolated from lemongrass",
      "authors": "Francisco Vera, Figueirinha Artur, Costa Gustavo et al.",
      "journal": "Journal of Functional Foods",
      "year": 2014,
      "doi": "10.1016/j.jff.2014.07.003",
      "url": "https://doi.org/10.1016/j.jff.2014.07.003",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lemongrass"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "flavonoid"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "flavonoid analysis"
        }
      ],
      "finding": "Cynaroside and isoorientin were identified in the leaf-infusion research.",
      "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil. This record summarizes chemical evidence; biological results are not inferred from the title.",
      "material": "Plant extract / infusion; Cymbopogon citratus leaf infusion and isolated glycosides"
    },
    {
      "id": "composition-cx01",
      "title": "Comparison of lemon oil composition after using different extraction methods",
      "authors": "Gök Aslı, İsmail Kirbaşlar Ş., Gülay Kirbaşlar F.",
      "journal": "Journal of Essential Oil Research",
      "year": 2015,
      "doi": "10.1080/10412905.2014.982872",
      "url": "https://doi.org/10.1080/10412905.2014.982872",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lemon"
      ],
      "compoundIds": [
        "geranyl-acetate",
        "citral",
        "citronellal"
      ],
      "chemicalGroups": [
        "ester",
        "aldehyde"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Geranyl acetate was reported in the cold-pressed Kibris column.",
      "limitations": "Cultivar-specific. Hydrodistilled and supercritical-extract columns are separate samples. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Kibris cultivar Citrus limon peel oil; cold-pressed comparison column"
    },
    {
      "id": "composition-cx02",
      "title": "Identification, Synthesis, and Characterization of Novel Sulfur-Containing Volatile Compounds from the In-Depth Analysis of Lisbon Lemon Peels (Citrus limon L. Burm. f. cv. Lisbon)",
      "authors": "Cannon Robert J., Kazimierski Arkadiusz, Curto Nicole L. et al.",
      "journal": "Journal of Agricultural and Food Chemistry",
      "year": 2015,
      "doi": "10.1021/jf505177r",
      "url": "https://doi.org/10.1021/jf505177r",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lemon"
      ],
      "compoundIds": [
        "prenylthiol"
      ],
      "chemicalGroups": [
        "thiol"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Prenylthiol and a thiol-bearing acetate ester were identified in Lisbon peel extract. This leaves a gap for cold-pressed oil.",
      "limitations": "Peel extract is not cold-pressed commercial lemon essential oil. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Peel solvent extract; Lisbon cultivar Citrus limon peel solvent extract"
    },
    {
      "id": "composition-cx03",
      "title": "Authenticity analysis of citrus essential oils by HPLC-UV-MS on oxygenated heterocyclic components",
      "authors": "Fan Hao, Wu Qingli, Simon James E. et al.",
      "journal": "Journal of Food and Drug Analysis",
      "year": 2015,
      "doi": "10.1016/j.jfda.2014.05.008",
      "url": "https://doi.org/10.1016/j.jfda.2014.05.008",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lemon"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "flavonoid"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "flavonoid analysis"
        }
      ],
      "finding": "No direct positive PMF record for cold-pressed lemon oil is established by this curated source.",
      "limitations": "Selected lemon samples lacked PMFs. Coumarins and furanocoumarins are not flavonoids; non-detection is not universal absence. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Authentic lemon and orange essential-oil profiles"
    },
    {
      "id": "composition-cx04",
      "title": "Authenticity Analysis of Cold-Pressed Orange Essential Oils by GC/MS on Polymethoxyflavone Components",
      "authors": "Yang Kai-Min, Chen Chih-Wei, Chen Min-Hung et al.",
      "journal": "Agriculture",
      "year": 2023,
      "doi": "10.3390/agriculture13010179",
      "url": "https://doi.org/10.3390/agriculture13010179",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "sweet-orange"
      ],
      "compoundIds": [
        "nobiletin"
      ],
      "chemicalGroups": [
        "flavonoid"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "flavonoid analysis"
        }
      ],
      "finding": "Tangeretin, sinensetin and nobiletin were verified with standards in cold-pressed orange oils. Source quantities are not imported.",
      "limitations": "Commercial, crude and compounded samples are separate; do not merge them into a typical range. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil: nonvolatile fraction; Commercial and crude cold-pressed orange oils, nonvolatile fraction"
    },
    {
      "id": "composition-cx05",
      "title": "The effects of different extraction methods on essential oils from orange and tangor: From the peel to the essential oil",
      "authors": "Park Min Kyung, Cha Ji Yoon, Kang Min‐Cheol et al.",
      "journal": "Food Science & Nutrition",
      "year": 2024,
      "doi": "10.1002/fsn3.3785",
      "url": "https://doi.org/10.1002/fsn3.3785",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "sweet-orange"
      ],
      "compoundIds": [
        "citral"
      ],
      "chemicalGroups": [
        "ester",
        "aldehyde"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Neryl acetate (called nerol acetate in the paper) was reported in the cold-pressed orange comparison. No concentration is imported.",
      "limitations": "Orange and tangor are distinct samples; enrichment versus hydrodistillation is not a universal quantity. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Cold-pressed Citrus sinensis orange peel oil, separate from tangor samples"
    },
    {
      "id": "composition-cx07",
      "title": "Characterization of aroma-impact compounds in cold-pressed grapefruit oil using time-intensity GC-olfactometry and GC-MS",
      "authors": "Lin Jianming, Rouseff Russell L.",
      "journal": "Flavour and Fragrance Journal",
      "year": 2001,
      "doi": "10.1002/ffj.1041",
      "url": "https://doi.org/10.1002/ffj.1041",
      "studyType": "analytical-sensory-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "grapefruit"
      ],
      "compoundIds": [
        "grapefruit-thiol"
      ],
      "chemicalGroups": [
        "thiol",
        "aldehyde"
      ],
      "categories": [
        {
          "type": "sensory",
          "subcategory": "aroma-chemistry",
          "topic": "aroma analysis"
        }
      ],
      "finding": "4-Mercapto-4-methyl-2-pentanol was detected, with low aroma activity in the tested oil.",
      "limitations": "Aroma intensity is not concentration. Non-detection of particular thiols applies only to the studied samples. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Cold-pressed Citrus paradisi oil studied in aroma-impact analysis"
    },
    {
      "id": "composition-cx08",
      "title": "An Ultrahigh-Performance Liquid Chromatography Coupled with Tandem Mass Spectrometry (UHPLC-MS/MS) Method for Toxicity and Safety Level Assessment of Oxygen Heterocyclic Compounds and Terpene in Cold-Pressed Grapefruit Essential Oils",
      "authors": "Zahiruddin Sultan, Wang Yan-Hong, Kothapalli Hari Babu et al.",
      "journal": "ACS Omega",
      "year": 2025,
      "doi": "10.1021/acsomega.5c03454",
      "url": "https://doi.org/10.1021/acsomega.5c03454",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "grapefruit"
      ],
      "compoundIds": [
        "nobiletin"
      ],
      "chemicalGroups": [
        "flavonoid"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "flavonoid analysis"
        }
      ],
      "finding": "Nobiletin, heptamethoxyflavone and tangeretin were quantified in the source. Individual sample quantities are not imported here.",
      "limitations": "Commercial oils varied. Analytical quality-control findings do not establish clinical safety for arbitrary uses. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil: nonvolatile fraction; Varietal and commercial cold-pressed grapefruit oils, nonvolatile fraction"
    },
    {
      "id": "composition-cx09",
      "title": "Determination of new bioflavonoids in bergamot (Citrus bergamia) peel oil by liquid chromatography coupled to tandem ion trap-time-of-flight mass spectrometry",
      "authors": "Donato Paola, Bonaccorsi Ivana, Russo Marina et al.",
      "journal": "Flavour and Fragrance Journal",
      "year": 2014,
      "doi": "10.1002/ffj.3188",
      "url": "https://doi.org/10.1002/ffj.3188",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "bergamot"
      ],
      "compoundIds": [
        "nobiletin"
      ],
      "chemicalGroups": [
        "flavonoid"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "flavonoid analysis"
        }
      ],
      "finding": "Sinensetin, nobiletin, tetra-O-methylscutellarein and tangeretin were identified in the nonvolatile oil fraction. Cultivar-specific quantities are not imported.",
      "limitations": "Cultivar-specific findings, not juice or a bergamot-polyphenol supplement. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil: nonvolatile fraction; Femminello, Castagnaro and Fantastico bergamot peel oils, nonvolatile fraction"
    },
    {
      "id": "composition-cx10",
      "title": "Aromatherapy: composition of the gaseous phase at equilibrium with liquid bergamot essential oil",
      "authors": "Leggio Antonella, Leotta Vanessa, Belsito Emilia Lucia et al.",
      "journal": "Chemistry Central Journal",
      "year": 2017,
      "doi": "10.1186/s13065-017-0340-y",
      "url": "https://doi.org/10.1186/s13065-017-0340-y",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "bergamot"
      ],
      "compoundIds": [
        "citral"
      ],
      "chemicalGroups": [
        "aldehyde"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Neral and geranial were reported in the liquid oil; sample-specific extraction is not verified, so no numerical value is imported.",
      "limitations": "Liquid composition is not inhaled-headspace composition. Extraction provenance is incomplete. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Liquid bergamot essential oil and its separately measured headspace"
    },
    {
      "id": "composition-cx11",
      "title": "Study on Lavender Essential Oil Chemical Compositions by GC-MS and Improved pGC",
      "authors": "Dong Guangyao, Bai Xiaohui, Aimila Aoken et al.",
      "journal": "Molecules",
      "year": 2020,
      "doi": "10.3390/molecules25143166",
      "url": "https://doi.org/10.3390/molecules25143166",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lavender"
      ],
      "compoundIds": [
        "geranyl-acetate"
      ],
      "chemicalGroups": [
        "ester",
        "aldehyde"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Bornyl formate, bornyl acetate, neryl acetate and geranyl acetate were reported in the hydrodistilled study oil.",
      "limitations": "Different preparation from the catalog steam-distilled oil. Reported elemental S8 is not an organic thiol; replication/provenance is unresolved. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Lavandula angustifolia aerial-parts oil from Xinjiang"
    },
    {
      "id": "composition-cx12",
      "title": "Salvia sclarea Essential Oil Chemical Composition and Biological Activities",
      "authors": "Kačániová Miroslava, Vukovic Nenad L., Čmiková Natália et al.",
      "journal": "International Journal of Molecular Sciences",
      "year": 2023,
      "doi": "10.3390/ijms24065179",
      "url": "https://doi.org/10.3390/ijms24065179",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "clary-sage"
      ],
      "compoundIds": [
        "linalyl-acetate",
        "geranyl-acetate",
        "citral"
      ],
      "chemicalGroups": [
        "ester",
        "aldehyde"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Linalyl acetate (called linalool acetate in the paper) was reported.",
      "limitations": "Single commercial sample; nonclinical assays do not establish human benefits. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; One commercial Salvia sclarea branches/leaves oil"
    },
    {
      "id": "composition-cx13",
      "title": "An In-Depth Study on the Chemical Composition and Biological Effects of Pelargonium graveolens Essential Oil",
      "authors": "Kačániová Miroslava, Vukic Milena, Vukovic Nenad L. et al.",
      "journal": "Foods",
      "year": 2024,
      "doi": "10.3390/foods13010033",
      "url": "https://doi.org/10.3390/foods13010033",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "geranium"
      ],
      "compoundIds": [
        "citronellal",
        "citral"
      ],
      "chemicalGroups": [
        "ester",
        "aldehyde"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Citronellyl formate, geranyl formate, citronellyl acetate, citronellyl propionate, citronellyl pentanoate and geranyl valerate were reported.",
      "limitations": "One producer/sample, not a universal composition range. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Commercial Pelargonium graveolens fresh-plant-material oil"
    },
    {
      "id": "composition-cx14",
      "title": "Improvement of Ylang-Ylang Essential Oil Characterization by GC×GC-TOFMS",
      "authors": "Brokl Michał, Fauconnier Marie-Laure, Benini Céline et al.",
      "journal": "Molecules",
      "year": 2013,
      "doi": "10.3390/molecules18021783",
      "url": "https://doi.org/10.3390/molecules18021783",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "ylang-ylang"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "aldehyde"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Benzaldehyde and phenylacetaldehyde were reported in time fractions; heptanal occurred in the early fraction. No whole-oil quantity is inferred.",
      "limitations": "Fractions differ; not a single steam-distilled whole oil. Compound assignments depend on the reported analytical methods. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Early and late hydrodistilled Cananga odorata flower fractions from Mayotte"
    },
    {
      "id": "composition-cx15",
      "title": "Improving the Quality of Ylang-Ylang Essential Oils Through Microwave-Assisted Extraction Compared to Conventional Extraction Methods",
      "authors": "Chakira Abacar, Soria Christian, Lallemand Laura et al.",
      "journal": "Plants",
      "year": 2025,
      "doi": "10.3390/plants14203217",
      "url": "https://doi.org/10.3390/plants14203217",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "ylang-ylang"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Benzyl acetate, methyl benzoate, cinnamyl acetate and benzyl benzoate characterize studied oils, including the steam-water sample.",
      "limitations": "Steam-water differs from dry steam, hydrodistillation and microwave methods; do not combine columns. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Cananga odorata flower oils; steam-water comparison sample"
    },
    {
      "id": "composition-cx16",
      "title": "Antibacterial Activity of Palmarosa Essential Oil and Geraniol Against Clinical Isolates from Respiratory, Skin, and Soft Tissue Infections",
      "authors": "Cebollada Pilar, Alvarado Elena, Seral Cristina et al.",
      "journal": "Pharmaceutics",
      "year": 2026,
      "doi": "10.3390/pharmaceutics18010039",
      "url": "https://doi.org/10.3390/pharmaceutics18010039",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "palmarosa"
      ],
      "compoundIds": [
        "citral"
      ],
      "chemicalGroups": [
        "ester",
        "aldehyde"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Supplier-provided composition listed neryl formate, neryl acetate, geranyl butyrate, geranyl caproate and geranyl caprylate. Quantities are not imported.",
      "limitations": "Composition was not independently remeasured by the authors. Clinical isolates do not make this a clinical trial. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Cymbopogon martini var. motia oil, batch OF012293"
    },
    {
      "id": "composition-cx17",
      "title": "Impact of Extraction Scale and Method on the Chemical Profile of Essential Oils: A Comparative Study Between Laboratory Hydrodistillation and Semi-Industrial Dry Steam Distillation",
      "authors": "Léva Norbert, Gál Emese",
      "journal": "Molecules",
      "year": 2026,
      "doi": "10.3390/molecules31122105",
      "url": "https://doi.org/10.3390/molecules31122105",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "lavender"
      ],
      "compoundIds": [
        "linalyl-acetate"
      ],
      "chemicalGroups": [
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Linalyl acetate, lavandulyl acetate and hexyl butanoate occur in the extraction comparison. Sample-column values are not imported.",
      "limitations": "Scale, drying and method vary together. Column-specific amounts are not imported. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Lavender steam-distilled/hydrodistilled comparison"
    },
    {
      "id": "composition-cx18",
      "title": "Pelargonium graveolens: Towards In-Depth Metabolite Profiling, Antioxidant and Enzyme-Inhibitory Potential",
      "authors": "Gevrenova Reneta, Zengin Gokhan, Balabanova Vessela et al.",
      "journal": "Plants",
      "year": 2024,
      "doi": "10.3390/plants13182612",
      "url": "https://doi.org/10.3390/plants13182612",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "geranium"
      ],
      "compoundIds": [],
      "chemicalGroups": [
        "flavonoid"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "flavonoid analysis"
        }
      ],
      "finding": "Flavonoids were profiled at class level in the leaf extract, separate from the oil.",
      "limitations": "Leaf-extract findings do not establish flavonoids in steam-distilled geranium oil. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Leaf solvent extract; Pelargonium graveolens methanol-aqueous leaf extract"
    },
    {
      "id": "composition-cx19",
      "title": "Ethanol and High-Value Terpene Co-Production from Lignocellulosic Biomass of Cymbopogon flexuosus and Cymbopogon martinii",
      "authors": "Joyce Blake L., Zheljazkov Valtcho D., Sykes Robert et al.",
      "journal": "PLOS ONE",
      "year": 2015,
      "doi": "10.1371/journal.pone.0139195",
      "url": "https://doi.org/10.1371/journal.pone.0139195",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "palmarosa"
      ],
      "compoundIds": [
        "geranyl-acetate"
      ],
      "chemicalGroups": [
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Geranyl acetate was measured in steam-distilled palmarosa biomass oil.",
      "limitations": "Treatments and harvests are distinct samples, not a retail oil specification. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Cymbopogon martinii palmarosa biomass oils across agronomic treatments and harvests"
    },
    {
      "id": "composition-cx21",
      "title": "The Compositions of Turkish Bergamot Oils Produced by Cold-Pressing and Steam Distillation",
      "authors": "Kirbaslar F. Gülay, Kirbaslar S. Ismail, Dramur Umur",
      "journal": "Journal of Essential Oil Research",
      "year": 2001,
      "doi": "10.1080/10412905.2001.9699710",
      "url": "https://doi.org/10.1080/10412905.2001.9699710",
      "studyType": "analytical-study",
      "context": "laboratory",
      "evidenceLevel": "laboratory",
      "sampleSize": null,
      "oilIds": [
        "bergamot"
      ],
      "compoundIds": [
        "linalyl-acetate"
      ],
      "chemicalGroups": [
        "ester"
      ],
      "categories": [
        {
          "type": "botanical",
          "subcategory": "composition",
          "topic": "essential-oil composition"
        }
      ],
      "finding": "Linalyl acetate was reported in the cold-pressed ripe Turkish oil.",
      "limitations": "Ripeness and season affect composition; this value is not universal. This record summarizes chemical evidence, not efficacy inferred from the publication title.",
      "material": "Essential oil; Cold-pressed ripe Turkish bergamot peel oil"
    }
  ],
  "sources": [
    {
      "id": "src-composition-note",
      "label": "Sample composition ranges: typical published GC-MS values; replace with cited sources in research pass.",
      "url": ""
    },
    {
      "id": "oswald-2021",
      "label": "Oswald et al. (2021): prenylated volatile sulfur compounds in cannabis",
      "url": "https://doi.org/10.1021/acsomega.1c04196",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Cannabis flowers and concentrated hydrocarbon extracts",
      "method": "GC×GC with TOF-MS, FID and sulfur chemiluminescence; sensory evaluation"
    },
    {
      "id": "oswald-2023",
      "label": "Oswald et al. (2023): minor nonterpenoid volatiles and aroma",
      "url": "https://doi.org/10.1021/acsomega.3c04496",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Cannabis ice-hash rosin extracts",
      "method": "GC×GC and sensory evaluation"
    },
    {
      "id": "paryani-2024",
      "label": "Paryani et al. (2024): nonterpenoid diversity and aroma",
      "url": "https://doi.org/10.1021/acsomega.4c03225",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Cannabis ice-hash rosin extracts",
      "method": "GC×GC and sensory panel"
    },
    {
      "id": "bautista-2021",
      "label": "Bautista, Yu and Tian (2021): flavonoids in Cannabis sativa",
      "url": "https://doi.org/10.1021/acsomega.1c00318",
      "type": "chemistry-review",
      "evidenceLevel": "review",
      "material": "Plant material and preparations reviewed; not distilled oil",
      "method": "Literature review"
    },
    {
      "id": "chebi-linalyl-acetate",
      "label": "ChEBI: linalyl acetate, ester and monoterpenoid",
      "url": "https://www.ebi.ac.uk/chebi/CHEBI:78333",
      "type": "taxonomy"
    },
    {
      "id": "chebi-citronellal",
      "label": "ChEBI: citronellal, aldehyde and monoterpenoid",
      "url": "https://www.ebi.ac.uk/chebi/CHEBI:47856",
      "type": "taxonomy"
    },
    {
      "id": "chebi-cinnamaldehyde",
      "label": "ChEBI: (E)-cinnamaldehyde identity",
      "url": "https://www.ebi.ac.uk/chebi/CHEBI:16731",
      "type": "taxonomy"
    },
    {
      "id": "pubchem-citral",
      "label": "PubChem: citral",
      "url": "https://pubchem.ncbi.nlm.nih.gov/compound/638011",
      "type": "taxonomy"
    },
    {
      "id": "iupac-thiol",
      "label": "IUPAC Gold Book: thiols",
      "url": "https://goldbook.iupac.org/terms/view/T06359",
      "type": "taxonomy"
    },
    {
      "id": "pellati-2018",
      "label": "Pellati et al. (2018): nonpsychoactive constituents and analytical methods",
      "url": "https://doi.org/10.3390/molecules23102639",
      "type": "chemistry-review"
    },
    {
      "id": "peppermint-2012",
      "label": "Chemical Composition, Antifungal and Antibiofilm Activities of the Essential Oil of Mentha piperita L. (2012)",
      "url": "https://doi.org/10.5402/2012/718645",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Essential oil",
      "sample": "Hydrodistilled air-dried flowering aerial parts of Mentha piperita, Fars, Iran",
      "extraction": "hydrodistillation",
      "method": "GC-MS identification and GC-FID uncorrected peak-area percentages; semiquantitative",
      "limitations": "The hydrodistilled study sample is not the catalog steam-distilled product. No human efficacy inference."
    },
    {
      "id": "eucalyptus-2023",
      "label": "Chemical Composition and Biological Activities of Eucalyptus globulus Essential Oil (2023)",
      "url": "https://doi.org/10.3390/plants12051076",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Essential oil",
      "sample": "Commercial Hanus oil from fresh Eucalyptus globulus leaves cultivated in Spain",
      "extraction": "steam distillation",
      "method": "GC-MS and GC-FID; relative peak areas",
      "limitations": "Single commercial sample. 1,8-cineole is a cyclic ether, not an epoxide."
    },
    {
      "id": "tea-tree-2022",
      "label": "Chemical and Biological Characterization of Melaleuca alternifolia Essential Oil (2022)",
      "url": "https://doi.org/10.3390/plants11040558",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Essential oil",
      "sample": "Commercial Melaleuca alternifolia oil supplied in Slovakia, from young branches and leaves",
      "extraction": "steam distillation",
      "method": "GC-MS and GC-FID; relative peak areas",
      "limitations": "Table excludes constituents below 0.1%. It cannot establish absence of trace compounds."
    },
    {
      "id": "citronella-2016",
      "label": "Essential Oil of Cymbopogon nardus (L.) Rendle: A Strategy to Combat Fungal Infections Caused by Candida Species (2016)",
      "url": "https://doi.org/10.3390/ijms17081252",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Essential oil",
      "sample": "Cymbopogon nardus leaves collected July 2013 in a Brazilian medicinal-plant garden",
      "extraction": "hydrodistillation",
      "method": "GC-MS; retention indices and spectral matching; relative composition",
      "limitations": "C. nardus is not interchangeable with C. winterianus. Sample differs from catalog steam-distillation label; assignments rely on GC-MS matching."
    },
    {
      "id": "thyme-2016",
      "label": "Essential Oil Characterization of Thymus vulgaris from Various Geographical Locations (2016)",
      "url": "https://doi.org/10.3390/foods5040070",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Essential oil",
      "sample": "Four directly measured Thymus vulgaris chemotypes from France and Serbia, May 2015, air-dried aerial parts",
      "extraction": "steam distillation",
      "method": "GC-MS with retention-index/spectral matching; selected chiral GC",
      "limitations": "Chemotype-specific findings. Literature profiles in the paper are not additional measured samples."
    },
    {
      "id": "oregano-2020",
      "label": "Antioxidant and Antibacterial Capacities of Origanum vulgare L. Essential Oil from the Arid Andean Region of Chile and its Chemical Characterization by GC-MS (2020)",
      "url": "https://doi.org/10.3390/metabo10100414",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Essential oil",
      "sample": "Dried flowering aerial parts of Origanum vulgare, Socoroma/Putre, Chile, November 2019",
      "extraction": "hydrodistillation",
      "method": "GC-MS; relative composition; retention-index/library matching with selected standards",
      "limitations": "Regional oil profile, not universal oregano composition. Colorimetric total phenolics do not identify named flavonoids."
    },
    {
      "id": "lemongrass-2014",
      "label": "Lemon grass (Cymbopogon citratus) essential oil as a potent anti-inflammatory and antifungal drugs (2014)",
      "url": "https://doi.org/10.3402/ljm.v9.25431",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Essential oil",
      "sample": "Cymbopogon citratus leaf/aerial material, Chiffa/Blida, Algeria, May 2013",
      "extraction": "steam distillation",
      "method": "GC-MS/GC-FID; uncorrected normalized peak-area percentages",
      "limitations": "Fresh/dried feedstock is inconsistent in the paper. Correct isomer names: geranial is E/trans; neral is Z/cis. Animal/in-vitro evidence is not human efficacy."
    },
    {
      "id": "lemon-eucalyptus-2007",
      "label": "Chemical Composition, Olfactory Evaluation and Antioxidant Effects of the Leaf Essential Oil of Corymbia citriodora (Hook) from China (2007)",
      "url": "https://doi.org/10.1177/1934578X0700200518",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Essential oil",
      "sample": "Chinese Corymbia citriodora leaf oil, commercial product 800319, Kurt Kitzing",
      "extraction": "Sample-specific extraction not reported",
      "method": "GC-FID/GC-MS; relative GC-FID peak areas",
      "limitations": "General introduction on steam distillation does not establish preparation of this sample. Rutin/quercetin assay comparators are not oil constituents. Not a PMD-rich processed product."
    },
    {
      "id": "lemon-eucalyptus-2004",
      "label": "GC/MS Analysis of the Volatile Constituents of Corymbia citriodora Hook. from Réunion Island (2004)",
      "url": "https://doi.org/10.1080/10412905.2004.9698798",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Essential oil",
      "sample": "Corymbia citriodora leaf oil from Réunion Island",
      "extraction": "hydrodistillation",
      "method": "GC and GC-MS on polar and nonpolar columns",
      "limitations": "Trace ester reported; numerical concentration not available in the accessible abstract."
    },
    {
      "id": "cinnamon-2022",
      "label": "Anti-Staphylococcal Activity of Cinnamomum zeylanicum Essential Oil against Planktonic and Biofilm Cells Isolated from Canine Otological Infections (2022)",
      "url": "https://doi.org/10.3390/antibiotics11010004",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Essential oil",
      "sample": "Commercial Laszlo Cinnamomum zeylanicum stem-bark oil, manufacturer-reported Sri Lankan origin",
      "extraction": "manufacturer-reported steam distillation",
      "method": "GC-MS/GC-FID; normalized peak areas, retention-index/library matching",
      "limitations": "C. zeylanicum is a synonym of C. verum. Bark differs from leaf/root oils. Canine isolates were tested in vitro, not in a treatment trial."
    },
    {
      "id": "peppermint-tincture-2020",
      "label": "Analysis of Polyphenolic Composition of a Herbal Medicinal Product: Peppermint Tincture (2020)",
      "url": "https://doi.org/10.3390/molecules25010069",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Plant extract / infusion",
      "sample": "23 commercial peppermint tinctures from Polish pharmacies",
      "extraction": "Commercial alcoholic leaf tinctures, some with added oil",
      "method": "HPLC-DAD and U(H)PLC-ESI-MS with standards",
      "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil."
    },
    {
      "id": "eucalyptus-extract-2023",
      "label": "Characterization of Chemical Composition and Antioxidant Activity of Eucalyptus globulus Leaves under Different Extraction Conditions (2023)",
      "url": "https://doi.org/10.3390/app13179984",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Plant extract / infusion",
      "sample": "Eucalyptus globulus leaves from Haman-gun, Republic of Korea",
      "extraction": "Water/ethanol extraction",
      "method": "LC-Q-TOF/MS and HPLC with standards",
      "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil."
    },
    {
      "id": "thyme-extract-2022",
      "label": "Modulatory Impact of Lamiaceae Metabolites on Apoptosis of Human Leukemia Cells (2022)",
      "url": "https://doi.org/10.3389/fphar.2022.867709",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Plant extract / infusion",
      "sample": "Commercial Polish Thymus vulgaris herb, aqueous polyphenol-enriched extracts",
      "extraction": "Aqueous extraction and polyphenol fractionation",
      "method": "UHPLC-MS and HPLC-PDA",
      "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil."
    },
    {
      "id": "oregano-extract-2021",
      "label": "UHPLC-DAD Characterization of Origanum vulgare L. from Atacama Desert Andean Region and Antioxidant, Antibacterial and Enzyme Inhibition Activities (2021)",
      "url": "https://doi.org/10.3390/molecules26072100",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Plant extract / infusion",
      "sample": "Origanum vulgare from the Atacama Desert Andean region",
      "extraction": "Ethanolic extraction",
      "method": "UHPLC-DAD with commercial standards",
      "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil."
    },
    {
      "id": "lemongrass-infusion-2014",
      "label": "Chemical characterization and anti-inflammatory activity of luteolin glycosides isolated from lemongrass (2014)",
      "url": "https://doi.org/10.1016/j.jff.2014.07.003",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "material": "Plant extract / infusion",
      "sample": "Cymbopogon citratus leaf infusion and isolated glycosides",
      "extraction": "Aqueous infusion and compound isolation",
      "method": "NMR structural characterization",
      "limitations": "Not an essential-oil finding. Any source quantities are not imported here and cannot be attributed to distilled oil."
    },
    {
      "id": "cx01",
      "label": "Comparison of lemon oil composition after using different extraction methods (2015)",
      "url": "https://doi.org/10.1080/10412905.2014.982872",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Kibris cultivar Citrus limon peel oil; cold-pressed comparison column",
      "extraction": "cold pressing",
      "method": "GC/GC-MS extraction comparison",
      "limitations": "Cultivar-specific. Hydrodistilled and supercritical-extract columns are separate samples."
    },
    {
      "id": "cx02",
      "label": "Identification, Synthesis, and Characterization of Novel Sulfur-Containing Volatile Compounds from the In-Depth Analysis of Lisbon Lemon Peels (Citrus limon L. Burm. f. cv. Lisbon) (2015)",
      "url": "https://doi.org/10.1021/jf505177r",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Lisbon cultivar Citrus limon peel solvent extract",
      "extraction": "solvent extraction of peel",
      "method": "Analytical identification and structural characterization",
      "limitations": "Peel extract is not cold-pressed commercial lemon essential oil."
    },
    {
      "id": "cx03",
      "label": "Authenticity analysis of citrus essential oils by HPLC-UV-MS on oxygenated heterocyclic components (2015)",
      "url": "https://doi.org/10.1016/j.jfda.2014.05.008",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Authentic lemon and orange essential-oil profiles",
      "extraction": "Oil preparations compared in publication",
      "method": "HPLC-UV-MS and GC comparison",
      "limitations": "Selected lemon samples lacked PMFs. Coumarins and furanocoumarins are not flavonoids; non-detection is not universal absence."
    },
    {
      "id": "cx04",
      "label": "Authenticity Analysis of Cold-Pressed Orange Essential Oils by GC/MS on Polymethoxyflavone Components (2023)",
      "url": "https://doi.org/10.3390/agriculture13010179",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Commercial and crude cold-pressed orange oils, nonvolatile fraction",
      "extraction": "cold pressing",
      "method": "GC-MS with authentic polymethoxyflavone standards",
      "limitations": "Commercial, crude and compounded samples are separate; do not merge them into a typical range."
    },
    {
      "id": "cx05",
      "label": "The effects of different extraction methods on essential oils from orange and tangor: From the peel to the essential oil (2024)",
      "url": "https://doi.org/10.1002/fsn3.3785",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Cold-pressed Citrus sinensis orange peel oil, separate from tangor samples",
      "extraction": "cold pressing",
      "method": "Volatile profiling comparison",
      "limitations": "Orange and tangor are distinct samples; enrichment versus hydrodistillation is not a universal quantity."
    },
    {
      "id": "cx07",
      "label": "Characterization of aroma-impact compounds in cold-pressed grapefruit oil using time-intensity GC-olfactometry and GC-MS (2001)",
      "url": "https://doi.org/10.1002/ffj.1041",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Cold-pressed Citrus paradisi oil studied in aroma-impact analysis",
      "extraction": "cold pressing",
      "method": "Time-intensity GC-olfactometry and GC-MS",
      "limitations": "Aroma intensity is not concentration. Non-detection of particular thiols applies only to the studied samples."
    },
    {
      "id": "cx08",
      "label": "An Ultrahigh-Performance Liquid Chromatography Coupled with Tandem Mass Spectrometry (UHPLC-MS/MS) Method for Toxicity and Safety Level Assessment of Oxygen Heterocyclic Compounds and Terpene in Cold-Pressed Grapefruit Essential Oils (2025)",
      "url": "https://doi.org/10.1021/acsomega.5c03454",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Varietal and commercial cold-pressed grapefruit oils, nonvolatile fraction",
      "extraction": "cold pressing",
      "method": "Validated UHPLC-MS/MS",
      "limitations": "Commercial oils varied. Analytical quality-control findings do not establish clinical safety for arbitrary uses."
    },
    {
      "id": "cx09",
      "label": "Determination of new bioflavonoids in bergamot (Citrus bergamia) peel oil by liquid chromatography coupled to tandem ion trap-time-of-flight mass spectrometry (2014)",
      "url": "https://doi.org/10.1002/ffj.3188",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Femminello, Castagnaro and Fantastico bergamot peel oils, nonvolatile fraction",
      "extraction": "manual cold pressing",
      "method": "LC-MS/PDA",
      "limitations": "Cultivar-specific findings, not juice or a bergamot-polyphenol supplement."
    },
    {
      "id": "cx10",
      "label": "Aromatherapy: composition of the gaseous phase at equilibrium with liquid bergamot essential oil (2017)",
      "url": "https://doi.org/10.1186/s13065-017-0340-y",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Liquid bergamot essential oil and its separately measured headspace",
      "extraction": "Sample-specific extraction not verified",
      "method": "Quantitative GC-MS/GC-FID",
      "limitations": "Liquid composition is not inhaled-headspace composition. Extraction provenance is incomplete."
    },
    {
      "id": "cx11",
      "label": "Study on Lavender Essential Oil Chemical Compositions by GC-MS and Improved pGC (2020)",
      "url": "https://doi.org/10.3390/molecules25143166",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Lavandula angustifolia aerial-parts oil from Xinjiang",
      "extraction": "hydrodistillation",
      "method": "GC-MS, preparative GC and NMR",
      "limitations": "Different preparation from the catalog steam-distilled oil. Reported elemental S8 is not an organic thiol; replication/provenance is unresolved."
    },
    {
      "id": "cx12",
      "label": "Salvia sclarea Essential Oil Chemical Composition and Biological Activities (2023)",
      "url": "https://doi.org/10.3390/ijms24065179",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "One commercial Salvia sclarea branches/leaves oil",
      "extraction": "producer-reported steam distillation",
      "method": "GC/GC-MS; relative chromatographic composition",
      "limitations": "Single commercial sample; nonclinical assays do not establish human benefits."
    },
    {
      "id": "cx13",
      "label": "An In-Depth Study on the Chemical Composition and Biological Effects of Pelargonium graveolens Essential Oil (2024)",
      "url": "https://doi.org/10.3390/foods13010033",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Commercial Pelargonium graveolens fresh-plant-material oil",
      "extraction": "steam distillation",
      "method": "GC-MS; relative chromatographic composition",
      "limitations": "One producer/sample, not a universal composition range."
    },
    {
      "id": "cx14",
      "label": "Improvement of Ylang-Ylang Essential Oil Characterization by GC×GC-TOFMS (2013)",
      "url": "https://doi.org/10.3390/molecules18021783",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Early and late hydrodistilled Cananga odorata flower fractions from Mayotte",
      "extraction": "hydrodistillation with time fractions",
      "method": "GC×GC-TOFMS; spectra, retention indices and elution-zone assignments",
      "limitations": "Fractions differ; not a single steam-distilled whole oil. Compound assignments depend on the reported analytical methods."
    },
    {
      "id": "cx15",
      "label": "Improving the Quality of Ylang-Ylang Essential Oils Through Microwave-Assisted Extraction Compared to Conventional Extraction Methods (2025)",
      "url": "https://doi.org/10.3390/plants14203217",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Cananga odorata flower oils; steam-water comparison sample",
      "extraction": "steam-water distillation",
      "method": "GC-MS/FID extraction comparison",
      "limitations": "Steam-water differs from dry steam, hydrodistillation and microwave methods; do not combine columns."
    },
    {
      "id": "cx16",
      "label": "Antibacterial Activity of Palmarosa Essential Oil and Geraniol Against Clinical Isolates from Respiratory, Skin, and Soft Tissue Infections (2026)",
      "url": "https://doi.org/10.3390/pharmaceutics18010039",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Cymbopogon martini var. motia oil, batch OF012293",
      "extraction": "steam distillation",
      "method": "Supplier-provided GC-MS composition reproduced in the publication",
      "limitations": "Composition was not independently remeasured by the authors. Clinical isolates do not make this a clinical trial."
    },
    {
      "id": "cx17",
      "label": "Impact of Extraction Scale and Method on the Chemical Profile of Essential Oils: A Comparative Study Between Laboratory Hydrodistillation and Semi-Industrial Dry Steam Distillation (2026)",
      "url": "https://doi.org/10.3390/molecules31122105",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Lavender steam-distilled/hydrodistilled comparison",
      "extraction": "Dry steam distillation and hydrodistillation, kept separate",
      "method": "GC-MS comparison",
      "limitations": "Scale, drying and method vary together. Column-specific amounts are not imported."
    },
    {
      "id": "cx18",
      "label": "Pelargonium graveolens: Towards In-Depth Metabolite Profiling, Antioxidant and Enzyme-Inhibitory Potential (2024)",
      "url": "https://doi.org/10.3390/plants13182612",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Pelargonium graveolens methanol-aqueous leaf extract",
      "extraction": "methanol-aqueous extraction",
      "method": "UHPLC-HRMS",
      "limitations": "Leaf-extract findings do not establish flavonoids in steam-distilled geranium oil."
    },
    {
      "id": "cx19",
      "label": "Ethanol and High-Value Terpene Co-Production from Lignocellulosic Biomass of Cymbopogon flexuosus and Cymbopogon martinii (2015)",
      "url": "https://doi.org/10.1371/journal.pone.0139195",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Cymbopogon martinii palmarosa biomass oils across agronomic treatments and harvests",
      "extraction": "steam distillation",
      "method": "GC-MS",
      "limitations": "Treatments and harvests are distinct samples, not a retail oil specification."
    },
    {
      "id": "cx21",
      "label": "The Compositions of Turkish Bergamot Oils Produced by Cold-Pressing and Steam Distillation (2001)",
      "url": "https://doi.org/10.1080/10412905.2001.9699710",
      "type": "composition-study",
      "evidenceLevel": "laboratory",
      "sample": "Cold-pressed ripe Turkish bergamot peel oil",
      "extraction": "cold pressing",
      "method": "Capillary GC and GC-MS; chromatographic composition",
      "limitations": "Ripeness and season affect composition; this value is not universal."
    }
  ],
  "chemicalGroups": [
    {
      "id": "aldehyde",
      "label": "Aldehydes",
      "description": "A fragrant functional group found across chemical families. Citral gives lemongrass its lemony character; cinnamaldehyde is associated with cinnamon.",
      "details": "An aldehyde contains a terminal carbonyl group (-CHO). Citral is a mixture of geranial and neral. Citral and citronellal remain monoterpenoids; cinnamaldehyde remains a phenylpropanoid.",
      "compoundIds": [
        "citral",
        "citronellal",
        "cinnamaldehyde"
      ],
      "sourceIds": [
        "pubchem-citral",
        "chebi-citronellal",
        "chebi-cinnamaldehyde"
      ]
    },
    {
      "id": "ester",
      "label": "Esters",
      "description": "Many volatile esters contribute floral or fruity notes. Linalyl acetate is an example associated with lavender and bergamot.",
      "details": "An ester functional group can overlap with a primary chemical family. Linalyl acetate is both a monoterpenoid and an acetate ester. Not all esters are volatile or fragrant.",
      "compoundIds": [
        "linalyl-acetate"
      ],
      "sourceIds": [
        "chebi-linalyl-acetate"
      ]
    },
    {
      "id": "thiol",
      "label": "Thiols",
      "description": "Some sulfur-containing volatiles affect aroma at trace levels. Examples have been reported in grapefruit oil and in cannabis flower or extract research.",
      "details": "Thiols contain a sulfur-hydrogen (-SH) group. Other volatile sulfur compounds include sulfides and thioesters, so not every sulfur volatile is a thiol.",
      "compoundIds": [
        "grapefruit-thiol",
        "prenylthiol"
      ],
      "sourceIds": [
        "oswald-2021",
        "iupac-thiol",
        "cx07",
        "cx02"
      ]
    },
    {
      "id": "flavonoid",
      "label": "Flavonoids",
      "description": "Typically nonvolatile plant polyphenols. They belong to broader plant chemistry and are not generally aroma molecules or dominant constituents of steam-distilled oils.",
      "details": "Cannflavins illustrate plant-material chemistry. Nobiletin is documented in nonvolatile fractions of some cold-pressed citrus oils. These findings stay separate from volatile fingerprints. LC/HPLC methods are commonly used for flavonoids.",
      "compoundIds": [
        "nobiletin",
        "cannflavin-a"
      ],
      "sourceIds": [
        "bautista-2021",
        "pellati-2018",
        "cx04",
        "cx08",
        "cx09"
      ]
    }
  ]
};
