# Beyond Terpenes source review

Reviewed for issue #1, 2026-10-10. This is a curated literature pass, not exhaustive coverage or new testing. No product treatment claim is added.

## Identity and scope checks

- Oswald et al. 2021, DOI [10.1021/acsomega.1c04196](https://doi.org/10.1021/acsomega.1c04196), PMID 34869990: flowers from 13 cannabis cultivars, three hydrocarbon extracts and a plant-development series. GC×GC with TOF-MS, FID and sulfur chemiluminescence plus sensory assessment. Supports the prenylthiol/skunky-aroma example. Does not supply a universal distilled-oil percentage.
- Oswald et al. 2023, DOI [10.1021/acsomega.3c04496](https://doi.org/10.1021/acsomega.3c04496), PMID **37901519**: 31 ice-hash rosin extracts. Corrects the old record's erroneous PMID 37953763. Supports minor nonterpenoid aroma contributions in the studied extracts. Reclassified from health/cognition to analytical/sensory research.
- **Paryani et al.** 2024, DOI [10.1021/acsomega.4c03225](https://doi.org/10.1021/acsomega.4c03225), PMID 38973868: five ice-water hash rosin extracts from sibling phenotypes. Oswald is last author, not first. Analytical/sensory comparison, not steam-distilled-oil evidence. The reported 3-mercaptohexyl hexanoate has both thiol and carboxylic ester groups; it is not a thioester. No numerical oil inference is imported.
- Bautista, Yu and Tian 2021, DOI [10.1021/acsomega.1c00318](https://doi.org/10.1021/acsomega.1c00318), PMID 33681553: mini-review. Cannflavin A is a geranylated flavone, B a prenylated flavone. Plant/preparation evidence, not distilled-oil analysis or finished-product efficacy. Cannflavin A is not exclusive to cannabis.
- [ChEBI 78333](https://www.ebi.ac.uk/chebi/CHEBI:78333): linalyl acetate C12H20O2, monoterpenoid and acetate ester; lavender/bergamot occurrence.
- [ChEBI 47856](https://www.ebi.ac.uk/chebi/CHEBI:47856): citronellal C10H18O, monoterpenoid and aldehyde.
- [ChEBI 16731](https://www.ebi.ac.uk/chebi/CHEBI:16731): trans-cinnamaldehyde C9H8O, identity and aldehyde structure. The existing broader phenylpropanoid classification is retained.
- [PubChem citral 638011](https://pubchem.ncbi.nlm.nih.gov/compound/638011): geranial/neral mixture, no universal isomer ratio. PubChem pages challenged automated access in this implementation session; the independent taxonomy review supplied identity verification. ChEBI was directly accessible for the other existing examples.
- [IUPAC thiols](https://goldbook.iupac.org/terms/view/T06359): R-SH. A thiol is one kind of sulfur compound; not all volatile sulfur compounds are thiols.
- Pellati et al. 2018, DOI [10.3390/molecules23102639](https://doi.org/10.3390/molecules23102639): analytical context separating nonvolatile flavonoid analysis from volatile profiling. LC/HPLC and GC/headspace findings represent different fractions.

## Composition audit and limits

The starting dataset has no constituent-level source IDs. Its only composition source has an empty URL and describes sample ranges awaiting research. Some basis strings refer to ISO or GC-MS but do not identify a retrievable source. Those legacy values are preserved for audit and hidden from quantitative UI. They are not relabeled as verified findings or converted to zero. New quantitative data must identify botanical/sample scope, material, preparation, analytical method and measurement denominator.

All 28 oil profiles expose the four groups. An uncurated group says evidence not yet found, never absent. Do not assume the generic oil record or its existing constituent list is a batch certificate. Positive plant/extract findings remain explicitly labeled outside distilled-oil composition. Cold-pressed citrus can retain nonvolatile constituents; do not exclude flavonoids categorically from every essential oil, or confuse flavonoids with coumarins/furanocoumarins.

Rejected scope transfers: B. carterii / C. pyracanthoides resin papers do not establish B. serrata / C. myrrha oil composition. A B. serrata hexane-resin extract report is not a distilled-oil finding. No unverified resin/oil percentages were imported.

## Integrated per-oil coverage

The independent primary-source packets covered eighteen oils. A resin/wood pass was incomplete, so no positive records were invented for those oils. All profiles retain an explicit gap summary. Quantities not transcribed from source tables remain unplotted.

| Oil ID | Groups with records | Source IDs |
|---|---|---|
| lemon | aldehyde, ester, flavonoid, thiol | cx01, cx02, cx03 |
| lavender | aldehyde, ester | cx11, cx17 |
| peppermint | ester, flavonoid | peppermint-2012, peppermint-tincture-2020 |
| eucalyptus | ester, flavonoid | eucalyptus-2023, eucalyptus-extract-2023 |
| tea-tree | ester | tea-tree-2022 |
| frankincense | Evidence gap | No new verified record |
| clove | Evidence gap | No new verified record |
| sweet-orange | aldehyde, ester, flavonoid | cx04, cx05 |
| citronella | aldehyde, ester | citronella-2016 |
| thyme | aldehyde, ester, flavonoid | thyme-2016, thyme-extract-2022 |
| oregano | ester, flavonoid | oregano-2020, oregano-extract-2021 |
| lemongrass | aldehyde, ester, flavonoid | lemongrass-2014, lemongrass-infusion-2014 |
| lemon-eucalyptus | aldehyde, ester | lemon-eucalyptus-2004, lemon-eucalyptus-2007 |
| cinnamon | aldehyde, ester | cinnamon-2022 |
| myrrh | Evidence gap | No new verified record |
| rosemary | Evidence gap | No new verified record |
| pine | Evidence gap | No new verified record |
| palmarosa | aldehyde, ester | cx16, cx19 |
| copaiba | Evidence gap | No new verified record |
| grapefruit | aldehyde, flavonoid, thiol | cx07, cx08 |
| clary-sage | aldehyde, ester | cx12 |
| geranium | aldehyde, ester, flavonoid | cx13, cx18 |
| vitex | Evidence gap | No new verified record |
| bergamot | aldehyde, ester, flavonoid | cx09, cx10, cx21 |
| ylang-ylang | aldehyde, ester | cx14, cx15 |
| niaouli | Evidence gap | No new verified record |
| ravintsara | Evidence gap | No new verified record |
| cannabis | ester, flavonoid, thiol | bautista-2021, oswald-2021, oswald-2023, paryani-2024, pellati-2018 |

Source IDs resolve to full publication links and scope in `data.js`. Original source packets were reviewed independently and supplied during implementation; author/journal metadata for newly indexed papers was then checked with Crossref.

Selected additional limits: peppermint GC-FID values are uncorrected area percentages and semiquantitative. Orange PMF source CX04 uses micrograms/mL, grapefruit CX08 uses mg/g; neither is converted to a GC-area percentage. No PMF quantity is transcribed. Palmarosa CX16 is supplier-provided composition reproduced in a primary paper. Lavender and ylang-ylang method/fraction differences remain explicit. Tea-tree provisional terpinyl acetate is excluded. Grapefruit source CX07 includes an explicit study-specific non-detection for two named thiols, not a universal absence claim. Hexyl butanoate is not classified as a monoterpenoid; methional is a thioether aldehyde, not a thiol.
