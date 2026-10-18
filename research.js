/* Shared, read-only research indexes. The generated data comes from master-data.json.
 * Topic relationships describe what was studied, never product efficacy or safety.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RESEARCH = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const unique = values => [...new Set(values)];
  const categoryKey = value => value && typeof value === 'object'
    ? [value.type, value.subcategory, value.topic].filter(part => typeof part === 'string' && part.length).join('/') : '';
  function create(data) {
    const taxonomy = data.taxonomy || {nodes: [], aliases: {}};
    const nodes = Array.isArray(taxonomy.nodes) ? taxonomy.nodes : [];
    const byId = new Map(nodes.map(node => [node.id, node]));
    const aliases = new Map(Object.entries(taxonomy.aliases || {}));
    const childrenByParent = new Map();
    nodes.forEach(node => {
      aliases.set(node.id, node.id);
      (node.aliases || []).forEach(alias => aliases.set(alias, node.id));
      (node.legacyBindings || []).forEach(binding => {
        const key = categoryKey(binding);
        if (key) { aliases.set(key, node.id); aliases.set(key.replaceAll('/', ':'), node.id); }
      });
      const parent = node.parentId || null;
      if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
      childrenByParent.get(parent).push(node);
    });
    function resolve(value) {
      const key = typeof value === 'string' ? value : categoryKey(value);
      const id = aliases.get(key);
      return id && byId.has(id) ? id : null;
    }
    const node = value => byId.get(resolve(value)) || null;
    const label = value => { const found = node(value); return found ? found.displayLabel || found.label : 'Unmapped research topic'; };
    function children(value = null) {
      const id = value === null ? null : resolve(value);
      if (value !== null && !id) return [];
      return (childrenByParent.get(id) || []).slice();
    }
    function ancestors(value) {
      const result = [], visited = new Set();
      let current = node(value);
      while (current && current.parentId && !visited.has(current.parentId)) {
        visited.add(current.parentId);
        current = byId.get(current.parentId);
        if (current) result.unshift(current);
      }
      return result;
    }
    function flatten(value = null) {
      const result = [], visited = new Set();
      const visit = current => {
        if (visited.has(current.id)) return;
        visited.add(current.id); result.push(current);
        children(current.id).forEach(visit);
      };
      if (value === null) children(null).forEach(visit);
      else { const current = node(value); if (current) visit(current); }
      return result;
    }
    const descendantCache = new Map();
    const descendants = (value, includeSelf = true) => {
      const id=resolve(value); if(!id)return [];
      if(!descendantCache.has(id))descendantCache.set(id,flatten(id).map(item=>item.id));
      return descendantCache.get(id).slice(includeSelf?0:1);
    };
    const breadcrumb = value => { const current = node(value); return current ? [...ancestors(value), current].map(item => label(item.id)).join(' › ') : label(value); };
    const roots = () => flatten().filter(item => item.navigationRoot === true || (!item.parentId && item.navigationRoot !== false));
    function selectedIds(value) {
      if (value === null || value === undefined || value === '') return null;
      const values = Array.isArray(value) ? value : [value];
      if (!values.length) return null;
      return new Set(values.flatMap(item => { const id = resolve(item); return id ? descendants(id) : []; }));
    }
    function studyNodes(study) {
      const ids = Array.isArray(study.useNodeIds) ? study.useNodeIds : (study.categories || []).map(resolve);
      return unique(ids.filter(id => byId.has(id))).map(id => byId.get(id));
    }
    function matchesStudy(study, value) {
      const wanted = selectedIds(value);
      return wanted === null || studyNodes(study).some(item => wanted.has(item.id));
    }
    const studies = Array.isArray(data.studies) ? data.studies : [];
    const studyById = new Map(studies.map(study => [study.id, study]));
    const evidence = (data.evidenceAssertions || []).filter(item => item.kind === 'study-use');
    const evidenceByOil = new Map();
    evidence.forEach(item => {
      if (!evidenceByOil.has(item.oilId)) evidenceByOil.set(item.oilId, []);
      evidenceByOil.get(item.oilId).push(item);
    });
    function assertions(oilId, studyId = null, value = null) {
      const wanted = selectedIds(value);
      return (evidenceByOil.get(oilId) || []).filter(item =>
        (!studyId || item.studyId === studyId) && studyById.has(item.studyId) &&
        byId.has(item.useNodeId) && (wanted === null || wanted.has(item.useNodeId)));
    }
    function studiesForOil(oilId, value = null, options = {}) {
      const filtered = assertions(oilId, null, value).filter(item => !options.eligibleOnly || item.researchMatch === true);
      const ids = new Set(filtered.map(item => item.studyId));
      // A bibliography link remains visible even when its material or use is
      // unresolved. It never becomes an eligible topic match by association.
      if (selectedIds(value) === null && !options.eligibleOnly) {
        studies.forEach(study => { if ((study.oilIds || []).includes(oilId)) ids.add(study.id); });
      }
      return studies.filter(study => ids.has(study.id));
    }
    function countStudies(value = null, options = {}) {
      const scoped = options.oilId ? studiesForOil(options.oilId,value,options) : null;
      const allowed = scoped ? new Set(scoped.map(study=>study.id)) : null;
      const source = options.studies || scoped || studies;
      return new Set(source.filter(study => allowed ? allowed.has(study.id) : matchesStudy(study,value)).map(study => study.id)).size;
    }
    function matchingOilIds(value = null, options = {eligibleOnly: true}) {
      return (data.oils || []).filter(oil => studiesForOil(oil.id, value, options).length > 0).map(oil => oil.id);
    }
    const countOils = (value = null, options = {eligibleOnly: true}) => matchingOilIds(value, options).length;
    function unknownStudyTags(study) {
      const values = Array.isArray(study.useNodeIds) ? study.useNodeIds : study.categories || [];
      return values.filter(value => !resolve(value));
    }
    return Object.freeze({nodes, resolve, node, label, children, ancestors, descendants,
      flatten, breadcrumb, roots, studyNodes, matchesStudy, assertions, studiesForOil,
      countStudies, matchingOilIds, countOils, unknownStudyTags});
  }
  return Object.freeze({create});
});
