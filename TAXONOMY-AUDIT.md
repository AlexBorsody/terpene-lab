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
