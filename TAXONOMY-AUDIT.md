# Taxonomy and Builder audit — 19 October 2026

## What changed

The Builder count included all scoped oil–study links, while its visible catalog excluded links without the `researchMatch` flag. Matrix used the complete bibliography. That made Attention and Scent Chemistry count oils that disappeared when selected. Both now use the same scoped bibliography; material, model and unfavorable outcomes remain visible. A research association is not a benefit claim.

- One canonical hierarchy: `master-data.json` → generated `data.js` → `research.js`, used by Builder, Matrix, oil profiles and study navigation.
- Builder retains only merchant-stocked oils. Research retains all 33 oils. Counts therefore need not be identical across these two catalog scopes; topic IDs, labels, ancestry and per-oil papers must be identical.
- Multiple Builder selections default to **All selected**; **Any selected** is explicit. Selecting a child replaces its selected ancestor. No empty-result fallback to the entire catalog.
- Empty stocked topics are omitted from the Builder; canonical nodes remain available for research and future additions.
- Reset choices clears topic filters and search, preserves the blend, and persists the cleared selection.
- Removed the bottle/base/label copy. Update availability is prominent instead of buried in the footer.

## Research corrections

| Record | Correction |
|---|---|
| Scent chemistry | Renamed the misleading “Aroma research” display label. This branch concerns odor chemistry; aromatherapy outcomes remain under their measured endpoints. |
| Kumar 2011 | Housefly experiment no longer creates a tick relationship. [Primary record](https://pubmed.ncbi.nlm.nih.gov/21338379/) |
| Kačániová 2024 lemon | Corrected fly tag to the experimentally tested *Harmonia axyridis* beetle. Checked full-text methods and mortality table; this is not a repellency assay. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC10893099/) |
| Francisconi 2020 | Replaced an incorrect lemon/thyme summary with the actual tea-tree/terpinen-4-ol Candida experiment. [Primary record](https://pubmed.ncbi.nlm.nih.gov/32578760/) |
| Holloway 2024 | Rosemary treatment was fresh leaves, not essential oil. [Primary record](https://pubmed.ncbi.nlm.nih.gov/39452344/) |
| Jurado 2023 | Oregano's relevant organism was Gram-positive *S. suis*, not the Gram-negative gonococcus tested with pine/lemon. [Primary record](https://pubmed.ncbi.nlm.nih.gov/37857249/) |
| Tuan 2025 | Corrected tea-tree material to essential oil; retained the limitation that mature biofilms were not effectively eradicated. [Primary record](https://pubmed.ncbi.nlm.nih.gov/39881994/) |
| Clove cognition | Verified two injected-mouse experiments and a separate oral isolated-eugenol experiment. Visible in cognition, explicitly contextual to consumer use. Added the separately measured acute pain endpoint. [2011](https://pubmed.ncbi.nlm.nih.gov/21157682/), [2012](https://pubmed.ncbi.nlm.nih.gov/22453493/), [eugenol](https://pubmed.ncbi.nlm.nih.gov/34434006/) |
| Rosemary attention | Verified the 20-person correlation study; no controlled efficacy claim. [Primary record](https://pubmed.ncbi.nlm.nih.gov/23983963/) |
| Lavender attention | Added the measured adverse attention result. Unfavorable findings are discoverable, not silently excluded. [Primary record](https://pubmed.ncbi.nlm.nih.gov/12690999/) |
| Endpoint placement | Moved sweet-orange labor anxiety, bergamot exam anxiety, null lavender anxiety and null peppermint postoperative nausea to their precise leaves. Restored measured sleep, dental needle-pain and Gram-positive endpoints. |
| Thyme sanitation | Restored surface-disinfection and air-sanitation application tags alongside microbial-count endpoints. These are complementary views of the same study, not duplicate publications. [Primary record](https://pubmed.ncbi.nlm.nih.gov/38804294/) |
| New oregano study | Added controlled food-contact-surface vapor research, including its surviving-organism limitation. [Primary record](https://pubmed.ncbi.nlm.nih.gov/38667047/) |
| New tea-tree study | Added the 112-adult hand-hygiene trial under its own endpoint; no equivalence-to-alcohol, infection-prevention or surface-disinfection inference. [Primary record](https://pubmed.ncbi.nlm.nih.gov/33950544/) |

Projection changes have reversible entries in the canonical correction ledger. Stable oil, study and existing topic IDs are preserved.

## Verification scope

`tests/catalog-consistency.cjs` independently traverses the canonical parent IDs and assertions for every oil/topic combination, then checks every pair of topics in both All and Any modes. Browser regressions exercise every nonempty stocked topic, counts, visibility, parent replacement, search, reset, persistence and contextual evidence.

This is a complete structural consistency audit and targeted primary-source correction pass, **not** an exhaustive systematic review or full-text authentication of every evidence assertion. Primary indexed records were refreshed for 165 existing PubMed publications; older source-review status remains explicit where an oil-specific endpoint was not independently reverified. Concentration, interaction and finished-product safety review remain separate unresolved work; this release does not certify those fields or turn animal, compound or antimicrobial laboratory findings into product claims.

## Follow-up: treatment-arm integrity — 19 October 2026

Nine existing publications received a further scoped mapping review. Eight were checked against their primary indexed abstracts through Europe PMC; the Atlas cedar paper was checked in full text. This pass adds measured endpoints to existing papers rather than padding the bibliography.

- **Göbel 1994:** eucalyptus's combination arm had little effect on pain sensitivity; it must not inherit peppermint–ethanol's analgesic result. Added the measured cognitive-performance association for both blend components, without inventing attention or memory subtypes. [Primary record](https://pubmed.ncbi.nlm.nih.gov/7954745/)
- **Han 2006:** moved the blend's pain mapping to **Menstrual cramps**, verified the 67-person sample, and preserved the three-oil intervention and species distinction. [Primary record](https://pubmed.ncbi.nlm.nih.gov/16884344/)
- **Hur 2007:** all three oil links now explicitly describe the combined mouthwash and fixed day-one/day-two treatment order. [Primary record](https://pubmed.ncbi.nlm.nih.gov/17380550/)
- **Nematolahi 2018:** separated questionnaire endpoints; sleep latency and duration did not improve significantly. Removed the redundant parent cognitive assertion; memory still rolls up to cognition. Oral herb results remain contextual to essential oil. [Primary record](https://pubmed.ncbi.nlm.nih.gov/29389474/)
- **Kasper 2010 / Juergens 2003:** verified the oral formulation routes and kept them distinct from inhalation, retail lavender oil and whole eucalyptus oil. The latter tested isolated cineole. [Lavender](https://pubmed.ncbi.nlm.nih.gov/20512042/), [cineole](https://pubmed.ncbi.nlm.nih.gov/12645832/)
- **Kuriyama 2005:** kept the three-oil massage intervention explicit; added the absent null between-treatment anxiety/depression findings. Immune biomarkers are not infection-prevention evidence. [Primary record](https://pubmed.ncbi.nlm.nih.gov/15937558/)
- **Napavichayanun 2024:** replaced unsupported broad mental-health mappings with **Quality of life**. Distinguished the 56-person healthy-volunteer phase from the 34-person blood-pressure phase; both oils remain combination evidence. [Primary record](https://pubmed.ncbi.nlm.nih.gov/38087747/)
- **Galovičová 2022:** biofilm protein-profile changes do not demonstrate biofilm eradication; live firebug mortality is an animal experiment, not an in-vitro culture assay. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC8839266/)

Both new endpoints are canonical JSON nodes. Builder, Matrix, oil profiles and study navigation inherit their hierarchy through the shared resolver. Regression checks preserve the different arm outcomes and prevent quality-of-life evidence from becoming a mental-health match.

Remaining work: library-reviewed associations still need oil-specific source checks; compound associations, exact composition provenance, concentrations and safety fields are not certified by this pass. An abstract screen is not a full-text review. Existing unresolved associations were not promoted merely because a publication was retrieved.
