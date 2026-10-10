/* Shared chemistry rules. Quantitative composition requires explicit provenance. */
const CHEMISTRY = (() => {
  const groups = TERPENE_DATA.chemicalGroups;
  const sources = Object.fromEntries(TERPENE_DATA.sources.map(s => [s.id, s]));
  const hasSources = record => Array.isArray(record.sourceIds) && record.sourceIds.length > 0 &&
    record.sourceIds.every(id => /^https:\/\//.test(sources[id]?.url || ''));
  const validRange = range => range && Number.isFinite(range.min) && Number.isFinite(range.max) &&
    range.min >= 0 && range.max >= range.min && range.max <= 100;
  const quantified = record => Boolean((!record.status || record.status === "quantified") && validRange(record.range) && hasSources(record) &&
    record.material && record.sample && record.extraction && record.method && record.basis);
  const tags = compound => [...(compound.functionalGroups || []),
    ...(compound.chemicalClass === 'Flavonoid' ? ['flavonoid'] : [])];
  const matches = (compound, query = '', primary = '', group = '') =>
    (!primary || compound.chemicalClass === primary) && (!group || tags(compound).includes(group)) &&
    [compound.name, compound.formula, compound.chemicalClass, compound.description,
      ...(compound.aliases || []), ...tags(compound)].join(' ').toLowerCase().includes(query.trim().toLowerCase());
  const evidenceFor = (oil, group) => (oil.chemicalEvidence || []).filter(e => e.group === group);
  return { groups, sources, hasSources, validRange, quantified, tags, matches, evidenceFor };
})();
