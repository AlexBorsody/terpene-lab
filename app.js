/* Terpene Lab - UI logic. Reads TERPENE_DATA from data.js.
   Views: Oils, Compounds, Matrix, Domains, Network, Studies. */

const D = TERPENE_DATA;
const oilById = Object.assign(Object.create(null), Object.fromEntries(D.oils.map(o => [o.id, o])));
const oilsByName = [...D.oils].sort((a, b) => a.name.localeCompare(b.name));
const compoundById = Object.assign(Object.create(null), Object.fromEntries(D.compounds.map(c => [c.id, c])));
// Every research label and hierarchy comes from the shared master taxonomy.
const R = RESEARCH.create(D);
const researchDomains = R.roots().map(node => ({ ...node, type: node.id, label: R.label(node.id) }));
function resolveUse(type, sub) {
  return sub ? R.resolve({ type, subcategory: sub }) || R.resolve(sub) : R.resolve(type);
}
function researchDomainId(category) {
  const id = R.resolve(category);
  if (!id) return null;
  return [...R.ancestors(id), R.node(id)].reverse().find(node => researchDomains.some(root => root.id === node.id))?.id || id;
}
function matchesDomain(category, type) {
  const id = R.resolve(category), wanted = R.resolve(type);
  return !!(id && wanted && R.descendants(wanted).includes(id));
}
const domainByType = Object.fromEntries(R.nodes.flatMap(node =>
  [node.id, ...(node.aliases || [])].map(id => [id, { ...node, type: node.id, label: R.label(node.id) }])));

// Keep the original filter IDs and legacy values for links and integrations.
// Only navigation roots are offered initially; descendants are disclosed one
// level at a time, with a breadcrumb back to any ancestor.
const topicFilterIds = ["study-domain-filter", "oil-domain-filter", "matrix-domain-filter"];
function topicOptions(selected = null) {
  // Native selects can expose hidden options to assistive technology. Aliases
  // belong in the resolver, never in the menu. Retain only a selected descendant.
  const selectedId = R.resolve(selected);
  const nodes = [...researchDomains];
  if (selectedId && !nodes.some(node => node.id === selectedId)) nodes.push(R.node(selectedId));
  return `<option value="">All research topics</option>` + nodes.map(node =>
    `<option value="${esc(node.id)}">${esc(researchDomains.some(root => root.id === node.id) ? R.label(node.id) : R.breadcrumb(node.id))}</option>`).join("");
}
function topicBreadcrumb(id, attribute, includeAll = true) {
  const chain = id ? [...R.ancestors(id), R.node(id)] : [];
  return (includeAll ? `<button type="button" class="topic-crumb" ${attribute}="">All topics</button>` : "") +
    chain.map((node, index) => `<span aria-hidden="true">›</span><button type="button" class="topic-crumb" ${attribute}="${esc(node.id)}"${index === chain.length - 1 ? ' aria-current="true"' : ""}>${esc(R.label(node.id))}</button>`).join("");
}
function syncTopicFilter(id) {
  const select = document.getElementById(id), host = document.getElementById(id + "-navigation");
  if (!select || !host) return;
  const nodeId = R.resolve(select.value);
  if (host.dataset.topicNode === (nodeId || "")) return;
  host.dataset.topicNode = nodeId || "";
  host.classList.toggle("hidden", !nodeId);
  if (!nodeId) { host.innerHTML = ""; return; }
  const children = R.children(nodeId);
  host.innerHTML = `<nav class="topic-breadcrumb" aria-label="Research topic path">${topicBreadcrumb(nodeId, "data-filter-node")}</nav>` +
    (children.length ? `<label class="topic-child-label">Narrow topic<select class="topic-child-select" aria-label="Narrow ${esc(R.label(nodeId))}"><option value="">All within ${esc(R.label(nodeId))}</option>${children.map(node => `<option value="${esc(node.id)}">${esc(R.label(node.id))}</option>`).join("")}</select></label>` : "");
  host.querySelectorAll("[data-filter-node]").forEach(button => button.addEventListener("click", () => setTopicFilter(id, button.dataset.filterNode, true)));
  const childSelect = host.querySelector(".topic-child-select");
  if (childSelect) childSelect.addEventListener("change", () => { if (childSelect.value) setTopicFilter(id, childSelect.value, true); });
}
function setTopicFilter(id, value, render = false) {
  const select = document.getElementById(id), nodeId = R.resolve(value);
  select.innerHTML = topicOptions(nodeId);
  select.value = nodeId || "";
  syncTopicFilter(id);
  if (render) {
    if (id === "oil-domain-filter") { renderOils(document.getElementById("oil-search").value); routeUrl("oils", { domain: R.resolve(value) }); }
    if (id === "matrix-domain-filter") { renderMatrix(); routeMatrix(); }
    if (id === "study-domain-filter") { renderStudies(); routeStudyFilters(); }
    const host = document.getElementById(id + "-navigation");
    host?.querySelector(".topic-child-select, [aria-current]")?.focus();
  }
}

const LEVEL_ORDER = { clinical: 0, preclinical: 1, laboratory: 2, review: 3 };
const LEVEL_LETTER = { clinical: "C", preclinical: "P", laboratory: "L", review: "R" };
const LEVEL_LABEL = {
  clinical: "Studied in people",
  preclinical: "Early research",
  laboratory: "Lab research",
  review: "Research summary"
};

let charts = [];
function disposeCharts() {
  charts.forEach(c => { try { c.dispose(); } catch (e) {} });
  charts = [];
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Decorative, local SVG symbols keep interface icons available offline.
function uiIcon(name) {
  return `<svg class="ui-icon" aria-hidden="true" focusable="false"><use href="#lab-icon-${esc(name)}"/></svg>`;
}

function formatFormula(formula) {
  return esc(formula).replace(/(\d+)/g, "<sub>$1</sub>");
}

function subLabel(type, sub) { return R.label(resolveUse(type, sub)) || sub || type; }

/* ---------- shared data helpers ---------- */
function studiesForOil(oilId, useId = null) {
  return R.studiesForOil(oilId, useId, { eligibleOnly: false });
}
function studiesForCompound(compoundId) {
  return D.studies.filter(s => (s.compoundIds || []).includes(compoundId));
}
function domainsForOil(oilId) {
  return researchDomains.filter(node => studiesForOil(oilId, node.id).length).map(node => node.id);
}
function sourceTopicNodes(study, oilId = null, useId = null) {
  if (!oilId) return R.studyNodes(study);
  return [...new Set(R.assertions(oilId, study.id, useId).map(assertion => R.resolve(assertion.useNodeId)).filter(Boolean))].map(id => R.node(id));
}
function evidenceCounts(studies) {
  const c = { clinical: 0, preclinical: 0, laboratory: 0, review: 0 };
  studies.forEach(s => { if (c[s.evidenceLevel] !== undefined) c[s.evidenceLevel]++; });
  return c;
}
function strongestLevel(studies) {
  let best = null;
  studies.forEach(s => {
    if (best === null || LEVEL_ORDER[s.evidenceLevel] < LEVEL_ORDER[best]) best = s.evidenceLevel;
  });
  return best;
}
function oilsWithCompound(compoundId) {
  return CHEMISTRY.oilRelationships(compoundId);
}
function quantityLabel(range) {
  return (range.min === range.max ? range.min : range.min + "-" + range.max) + "%";
}
function topConstituent(oil) {
  const verified = oil.constituents.filter(CHEMISTRY.quantified);
  if (!verified.length) return null;
  const c = verified.reduce((a, b) => (b.range.max > a.range.max ? b : a));
  return { compound: compoundById[c.compoundId], range: c.range };
}

/* ---------- tabs ---------- */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    // Direct tab clicks always return to the browse/list state. Detail views
    // are opened only by selecting an item, so Oils/Compounds can never appear
    // blank or stranded after navigating from another view.
    if (tab === "oils") {
      document.getElementById("oil-list-view").classList.remove("hidden");
      document.getElementById("oil-detail").classList.add("hidden");
      renderOils(document.getElementById("oil-search").value);
    }
    if (tab === "compounds") {
      document.getElementById("compound-list-view").classList.remove("hidden");
      document.getElementById("compound-detail").classList.add("hidden");
      renderCompounds();
    }
    switchTab(tab);
    if (tab === "studies") routeStudyFilters();
    else if (tab === "matrix") routeMatrix();
    else if (tab === "oils") {
      const filter = document.getElementById(tab === "oils" ? "oil-domain-filter" : "matrix-domain-filter");
      routeUrl(tab, { domain: R.resolve(filter?.value) });
    } else routeUrl(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
});

/* ---------- lightweight URL/history routing ---------- */
let routingFromHistory = false;
function routeUrl(tab, params = {}, replace = false) {
  if (routingFromHistory) return;
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  if (tab !== "blend") url.searchParams.delete("recipe");
  ["oil","compound","domain","sub","matrixMode","matrixGroup","matrixOil","matrixChemical","matrixSearch","matrixSort","inspect"].forEach(k => {
    if (params[k]) url.searchParams.set(k, params[k]);
    else url.searchParams.delete(k);
  });
  if (!replace && url.href === window.location.href) return;
  history[replace ? "replaceState" : "pushState"]({ tab, ...params }, "", url);
}
function applyRoute() {
  const p = new URLSearchParams(location.search);
  const tab = p.get("tab") || (p.has("oil") ? "oils" : p.has("compound") ? "compounds" : p.has("domain") ? "domains" : "blend");
  routingFromHistory = true;
  switchTab(tab);
  const oil = p.get("oil"), compound = p.get("compound"), domain = p.get("domain"), sub = p.get("sub");
  if (tab === "oils" && oil && oilById[oil]) showOil(oil, true);
  else if (tab === "compounds" && compound && compoundById[compound]) showCompound(compound, true);
  else if (tab === "domains" && resolveUse(domain, sub)) showDomain(domain, sub || null);
  else if (tab === "studies") {
    document.getElementById("study-oil-filter").value = oil || "";
    document.getElementById("study-compound-filter").value = compound || "";
    setTopicFilter("study-domain-filter", resolveUse(domain, sub));
    renderStudies();
  } else if (tab === "matrix") {
    matrixState.mode = matrixModes.includes(p.get("matrixMode")) ? p.get("matrixMode") : 'oil-topics';
    matrixState.group = matrixGroups().some(group => group.id === p.get('matrixGroup')) ? p.get('matrixGroup') : matrixGroups()[0]?.id;
    matrixState.oil = oilById[p.get('matrixOil')] ? p.get('matrixOil') : '';
    matrixState.chemical = CHEMISTRY.compoundCategories.some(group => group.id === p.get('matrixChemical')) ? p.get('matrixChemical') : '';
    matrixState.inspection = p.get('inspect') || '';
    document.getElementById('matrix-search').value = p.get('matrixSearch') || '';
    document.getElementById('matrix-sort').value = p.get('matrixSort') === 'studies' ? 'studies' : 'az';
    setTopicFilter("matrix-domain-filter", resolveUse(domain, sub));
    renderMatrix();
  }
  else if (tab === "oils" || tab === "compounds") {
    const prefix = tab === "oils" ? "oil" : "compound";
    document.getElementById(prefix + "-list-view").classList.remove("hidden");
    document.getElementById(prefix + "-detail").classList.add("hidden");
    if (tab === "oils") { setTopicFilter("oil-domain-filter", resolveUse(domain, sub)); renderOils(document.getElementById("oil-search").value); }
    else renderCompounds();
  }
  routingFromHistory = false;
}
window.addEventListener("popstate", applyRoute);

function switchTab(tab) {
  const section = ['oils', 'studies', 'compounds', 'domains'].includes(tab) ? 'oils' : ['matrix', 'network'].includes(tab) ? 'visualize' : 'blend';
  document.querySelectorAll(".tab").forEach(button => {
    const active = button.dataset.section ? button.dataset.section === section : button.dataset.tab === tab;
    button.classList.toggle("active", active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-section-nav]').forEach(nav => { nav.hidden = nav.dataset.sectionNav !== section; });
  document.querySelectorAll(".tab-panel").forEach(p =>
    p.classList.toggle("active", p.id === "tab-" + tab));
  disposeCharts();
  if (tab === "pathway") renderPathway();
  if (tab === "network") renderNetwork();
  if (tab === "matrix") renderMatrix();
  if (tab === "domains") renderDomainTiles();
}

document.querySelectorAll("[data-backto]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.backto;
    document.getElementById(target).classList.remove("hidden");
    btn.closest(".detail, #domain-detail").classList.add("hidden");
    disposeCharts();
    routeUrl(target.includes("oil") ? "oils" : target.includes("compound") ? "compounds" : "domains", {}, true);
  });
});

/* ---------- study cards ---------- */
function evidenceBadge(s) {
  const plain = {
    clinical: "Studied in people",
    preclinical: "Early research",
    laboratory: "Lab research",
    review: "Research summary"
  };
  const context = {
    human: "People",
    animal: "Animals",
    "in-vitro": "Lab",
    environmental: "Real-world / environmental"
  };
  return `<span class="evidence-word evidence-${s.evidenceLevel}">${plain[s.evidenceLevel] || LEVEL_LABEL[s.evidenceLevel]}</span>
    <span class="lvl-text">${esc(prettyStudyType(s.studyType))} · ${esc(context[s.context] || s.context)}</span>`;
}
function prettyStudyType(t) {
  return t.split("-").join(" ");
}
function sourceTopicLabel(id) {
  const node = R.node(id);
  return node ? [...R.ancestors(id).filter(parent => parent.navigationRoot !== false), node].map(item => R.label(item.id)).join(" › ") : R.label(id);
}
function categoryChips(s, oilId = null, useId = null) {
  return sourceTopicNodes(s, oilId, useId).map(node =>
    `<button type="button" class="catchip" data-goto-use="${esc(node.id)}" title="Explore this source topic">${esc(sourceTopicLabel(node.id))}</button>`).join("");
}
function qualifierText(value) {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.map(qualifierText).filter(Boolean).join(", ");
  if (typeof value === "object") return Object.entries(value).filter(([key]) => !["sourceIds", "urls"].includes(key)).map(([key, item]) => `${key}: ${qualifierText(item)}`).join(" · ");
  return String(value);
}
function researchQualifiers(record) {
  const fields = [["material", "Material"], ["model", "Model"], ["outcome", "Outcome"], ["route", "Route"], ["species", "Species"], ["relevance", "Relevance"]];
  return fields.map(([key, label]) => qualifierText(record[key]) ? `<p><b>${label}:</b> ${esc(qualifierText(record[key]))}</p>` : "").join("");
}
function assertionStatus(assertion) {
  const checked = ['source-checked', 'source-verified'].includes(assertion.verification?.status);
  if (checked && assertion.relevance === 'direct') return 'Source-reviewed direct research';
  if (checked && assertion.relevance === 'contextual') return 'Source-reviewed contextual evidence';
  if (checked) return 'Source reviewed; oil applicability unverified';
  return 'Library-linked evidence; applicability not independently verified';
}
function assertionContext(s, oilId, useId) {
  if (!oilId) return "";
  const assertions = R.assertions(oilId, s.id, useId);
  if (!assertions.length) return `<p class="hint research-context">Catalog link only. No oil-specific topic assessment is recorded.</p>`;
  return `<details class="research-assessments"><summary>Oil-specific source assessment · ${esc(oilById[oilId]?.name || oilId)}</summary>${assertions.map(a => `<div class="research-assessment">
    <p><b>${esc(R.breadcrumb(a.useNodeId) || "Unmapped research topic")}</b> · ${esc(assertionStatus(a))}</p>
    ${researchQualifiers(a)}${a.finding ? `<p><b>Oil-specific finding:</b> ${esc(a.finding)}</p>` : ""}${a.limitations ? `<p><b>Limitations:</b> ${esc(a.limitations)}</p>` : ""}
    ${a.verification ? `<p class="hint"><b>Verification:</b> ${esc(qualifierText(a.verification))}</p>` : ""}
    </div>`).join("")}</details>`;
}
function visibleAssertionContext(s, oilId, useId) {
  if (!oilId) return "";
  const assertions = R.assertions(oilId, s.id, useId);
  if (!assertions.length) return '<p class="research-scope">Catalog association only; oil-specific material and applicability have not been reviewed.</p>';
  const uniqueText = values => [...new Set(values.filter(Boolean))];
  const labels = uniqueText(assertions.map(assertionStatus));
  const materials = uniqueText(assertions.map(a => a.material?.label || a.material?.kind || (typeof a.material === "string" ? a.material : "")));
  const models = uniqueText(assertions.map(a => a.model?.label || a.model?.kind || (typeof a.model === "string" ? a.model : "")));
  const findings = uniqueText(assertions.map(a => a.finding));
  const outcomes = uniqueText(assertions.map(a => a.outcome?.label || a.outcome?.direction));
  return `<div class="research-scope"><p><b>For ${esc(oilById[oilId]?.name || oilId)}:</b> ${esc(labels.join(" · "))}</p>
    <p><b>Material:</b> ${esc(materials.join("; ") || "Not verified")}<br><b>Model:</b> ${esc(models.join("; ") || "Not verified")}${outcomes.length ? `<br><b>Reported outcome:</b> ${esc(outcomes.join("; "))}` : ""}</p>
    ${findings.map(finding => `<p><b>Oil-specific finding:</b> ${esc(finding)}</p>`).join("")}</div>`;
}
function studyCard(s, scope = {}, useIds = null) {
  const oilId = typeof scope === "string" ? scope : scope?.oilId || null;
  const useId = typeof scope === "string" || scope === null ? useIds : scope?.useId || null;
  const oilTags = (s.oilIds || []).map(id => oilById[id]
    ? `<button class="taglink" data-goto-oil="${esc(id)}">${esc(oilById[id].name)}</button>` : "").join("");
  const compTags = (s.compoundIds || []).map(id => compoundById[id]
    ? `<button class="taglink" data-goto-compound="${esc(id)}">${esc(compoundById[id].name)}</button>` : "").join("");
  return `<div class="study" data-study-id="${esc(s.id)}">
    <div class="study-badge">${evidenceBadge(s)}</div>
    <div class="study-qualifiers">${researchQualifiers(s)}</div>
    <h4>${esc(s.title)}</h4>
    <p class="cite">${esc(s.authors)} &middot; ${esc(s.journal)} &middot; ${s.year}${s.pubmedId ? " &middot; PMID " + esc(s.pubmedId) : ""}</p>
    ${visibleAssertionContext(s, oilId, useId)}
    <p class="finding"><span class="finding-label">Paper finding</span>${esc(s.finding)}</p>
    ${s.limitations ? `<p class="limitations"><span class="finding-label">Limitations</span>${esc(s.limitations)}</p>` : ""}
    <div class="catchips" aria-label="Source-tagged research topics">${categoryChips(s, oilId, useId)}</div>
    ${s.summaryReview ? `<p class="hint source-review">${s.summaryReview.status === "full-text-screened" ? "Full text screened" : s.summaryReview.status === "abstract-screened" ? "Abstract screened" : "Citation checked; abstract unavailable"} · ${esc(s.summaryReview.checkedAt)}. Oil-specific checks are shown separately.</p>` : ""}
    ${assertionContext(s, oilId, useId)}
    <div class="tags">${oilTags}${compTags}<a class="ext read-paper" href="${esc(s.url)}" target="_blank" rel="noopener">Read paper</a></div>
  </div>`;
}
function bindStudyLinks(root) {
  root.querySelectorAll("[data-goto-oil]").forEach(b =>
    b.addEventListener("click", () => showOil(b.dataset.gotoOil)));
  root.querySelectorAll("[data-goto-compound]").forEach(b =>
    b.addEventListener("click", () => showCompound(b.dataset.gotoCompound)));
  root.querySelectorAll("[data-goto-use]").forEach(b =>
    b.addEventListener("click", () => showDomain(b.dataset.gotoUse)));
}

/* ---------- range bar chart ---------- */
function rangeBarChart(el, rows, barColor, onClick) {
  // rows: [{name, min, max, color?, id?}]. Never initialize a chart for missing data.
  rows = rows.filter(r => CHEMISTRY.validRange(r));
  el.innerHTML = "";
  if (!rows.length) {
    el.innerHTML = `<p class="empty">Not quantified: no source-verified values available for this view.</p>`;
    return null;
  }
  const chart = echarts.init(el);
  charts.push(chart);
  const names = rows.map(r => r.name).reverse();
  const data = rows.map((r, i) => ({
    value: [rows.length - 1 - i, r.min, r.max],
    itemStyle: { color: r.color || barColor }
  }));
  chart.setOption({
    backgroundColor: "transparent",
    grid: { left: 8, right: 70, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: "value", max: 100,
      axisLabel: { color: "#9aa7bd", formatter: "{value}%" },
      splitLine: { lineStyle: { color: "#1b2740" } }
    },
    yAxis: {
      type: "category", data: names,
      axisLabel: { color: "#f2ead8" },
      axisLine: { show: false }, axisTick: { show: false }
    },
    series: [{
      type: "custom",
      renderItem: (params, api) => {
        const idx = api.value(0);
        const min = api.value(1), max = api.value(2);
        const p1 = api.coord([min, idx]);
        const p2 = api.coord([max, idx]);
        const h = Math.max(api.size([0, 1])[1] * 0.45, 6);
        return {
          type: "rect",
          shape: { x: p1[0], y: p1[1] - h / 2, width: Math.max(p2[0] - p1[0], 2), height: h },
          style: api.style({ stroke: "rgba(0,0,0,0)" })
        };
      },
      encode: { x: [1, 2], y: 0 },
      data: data,
      label: {
        show: true, position: "right", color: "#f2ead8", fontFamily: "monospace",
        formatter: p => {
          const r = rows[p.dataIndex];
          return (r.min === r.max ? r.min : r.min + "-" + r.max) + "%";
        }
      }
    }],
    tooltip: {
      trigger: "item",
      formatter: p => {
        const r = rows[p.dataIndex];
        return `${esc(r.name)}: <b>${quantityLabel(r)}</b>${r.record ? `<br>${esc(r.record.sample)}<br>${esc(r.record.material)} · ${esc(r.record.extraction)}<br>${esc(r.record.method)}<br>${esc(r.record.basis)}${sourceLinks(r.record.sourceIds)}` : ""}${onClick ? "<br>Click to drill down" : ""}`;
      }
    }
  });
  if (onClick) chart.on("click", p => {
    const r = rows[p.dataIndex];
    if (r && r.id) onClick(r.id);
  });
  return chart;
}


/* ================= PLANT -> COMPOUNDS -> USES ================= */
let pathwayOil = null;

function renderPathway(selectedId) {
  const plantWrap = document.getElementById("pathway-plants");
  if (!plantWrap) return;
  const selected = selectedId || pathwayOil || (D.oils[0] && D.oils[0].id);
  pathwayOil = selected;
  plantWrap.innerHTML = oilsByName.map(o =>
    `<button class="path-node plant-node${o.id === selected ? " selected" : ""}" data-path-oil="${o.id}">
      <span class="swatch sm" style="background:${o.color}"></span>
      <span><strong>${esc(o.name)}</strong><small>${esc(o.latinName)}</small></span>
    </button>`).join("");
  plantWrap.querySelectorAll("[data-path-oil]").forEach(b =>
    b.addEventListener("click", () => renderPathway(b.dataset.pathOil)));
  renderPathwayForOil(selected);
}

function renderPathwayForOil(oilId, useId = null) {
  const oil = oilById[oilId];
  if (!oil) return;
  const compoundWrap = document.getElementById("pathway-compounds");
  compoundWrap.innerHTML = oil.constituents.map(k => {
    const comp = compoundById[k.compoundId];
    if (!comp) return "";
    return `<button class="path-node compound-node" data-path-compound="${comp.id}">
      <span class="molecule-glyph" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      <span class="compound-copy"><strong>${esc(comp.name)}</strong><small>${esc(comp.formula)} · ${esc(comp.chemicalClass)} · ${CHEMISTRY.quantified(k) ? `${k.range.min}-${k.range.max}%` : "Not quantified"}</small></span>
    </button>`;
  }).join("");
  compoundWrap.querySelectorAll("[data-path-compound]").forEach(b =>
    b.addEventListener("click", () => showCompound(b.dataset.pathCompound)));

  const selectedUse = R.resolve(useId);
  const groups = (selectedUse ? R.children(selectedUse) : R.roots()).map(node => ({ node, studies: studiesForOil(oilId, node.id) })).filter(group => group.studies.length);
  const useWrap = document.getElementById("pathway-uses");
  useWrap.innerHTML = (selectedUse ? `<nav class="topic-breadcrumb" aria-label="Pathway research topics">${topicBreadcrumb(selectedUse, "data-path-parent")}</nav>` : "") +
    (groups.length ? groups.map(g => `<button class="path-node use-node" data-path-use="${esc(g.node.id)}">
      <span><strong>${esc(R.label(g.node.id))}</strong><small>${g.studies.length} linked paper${g.studies.length === 1 ? "" : "s"}${R.children(g.node.id).length ? " · Explore topics" : ""}</small></span>
    </button>`).join("") : `<p class="pathway-empty">${selectedUse ? "No narrower topics with linked research" : "No linked research yet"}</p>`);
  useWrap.querySelectorAll("[data-path-use]").forEach(button => button.addEventListener("click", () => renderPathwayForOil(oilId, button.dataset.pathUse)));
  useWrap.querySelectorAll("[data-path-parent]").forEach(button => button.addEventListener("click", () => renderPathwayForOil(oilId, button.dataset.pathParent)));
  const evidence = document.getElementById("pathway-evidence");
  evidence.classList.toggle("hidden", !selectedUse);
  evidence.innerHTML = "";
  if (selectedUse) showPathwayEvidence(oil, { node: R.node(selectedUse), studies: studiesForOil(oilId, selectedUse) });
}

function showPathwayEvidence(oil, group) {
  if (!group) return;
  const evidence = document.getElementById("pathway-evidence");
  evidence.classList.remove("hidden");
  evidence.innerHTML = `<div class="pathway-evidence-head">
      <div><p class="eyebrow">${esc(R.breadcrumb(group.node.id))}</p><h3>${esc(oil.name)} → ${esc(R.label(group.node.id))}</h3></div>
      <button type="button" class="back" id="pathway-close">Close</button>
    </div>
    <p class="pathway-proof-note">Source-tagged research associations include context-only records. Inspect the material, model and oil-specific assessment. These papers do not establish efficacy of a finished Sunny's Shield product.</p>
    ${group.studies.map(study => studyCard(study, { oilId: oil.id, useId: group.node.id })).join("")}`;
  bindStudyLinks(evidence);
  document.getElementById("pathway-close").addEventListener("click", () => evidence.classList.add("hidden"));
}

/* ================= OIL EXPLORER ================= */
function renderOils(filter) {
  const q = (filter || "").toLowerCase();
  const grid = document.getElementById("oil-grid");
  const domainFilter = document.getElementById("oil-domain-filter")?.value || "";
  const sort = document.getElementById("oil-sort")?.value || "az";
  syncTopicFilter("oil-domain-filter");
  const oils = D.oils.filter(o =>
    (o.name.toLowerCase().includes(q) || o.latinName.toLowerCase().includes(q) || o.aroma.some(note => note.toLowerCase().includes(q))) &&
    (!domainFilter || studiesForOil(o.id, domainFilter).length)
  ).sort((a,b) => {
    if (sort === "studies") return studiesForOil(b.id, domainFilter || null).length - studiesForOil(a.id, domainFilter || null).length || a.name.localeCompare(b.name);
    if (sort === "domains") return domainsForOil(b.id).length - domainsForOil(a.id).length || a.name.localeCompare(b.name);
    if (sort === "compound") {
      const ac = topConstituent(a)?.compound?.name || "";
      const bc = topConstituent(b)?.compound?.name || "";
      return ac.localeCompare(bc) || a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });
  document.getElementById("oil-count").textContent = oils.length + " oils";
  grid.innerHTML = oils.map(o => {
    const top = topConstituent(o);
    const n = studiesForOil(o.id, domainFilter || null).length;
    const domains = domainFilter ? [R.resolve(domainFilter)] : domainsForOil(o.id);
    return `<div class="card" data-oil="${o.id}" tabindex="0" role="button" aria-label="Explore ${esc(o.name)}">
      <div class="card-top">
        <div class="oil-emblem" style="--oil-color:${esc(o.color)}">${uiIcon("oils")}</div>
        <div><h3>${esc(o.name)}</h3><p class="latin">${esc(o.latinName)}</p></div>
      </div>
${top ? `<p class="top-terpene">Top compound: <b>${esc(top.compound.name)}</b></p>` : ""}
      <p class="oil-card-aroma">${uiIcon("aroma")}<span>${o.aroma.map(esc).join(" · ")}</span></p>
      <p class="sub"><strong class="study-count">${n} stud${n === 1 ? "y" : "ies"}</strong>${domains.length ? " on " + domains.map(d => esc(R.label(d))).join(", ") : ""}</p>
      <div class="oil-card-footer"><span>${esc(o.plantPart)}</span>${uiIcon("arrow")}</div>
    </div>`;
  }).join("") || `<p class="empty">No oils match.</p>`;
  grid.querySelectorAll(".card").forEach(c => {
    c.addEventListener("click", () => showOil(c.dataset.oil));
    c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showOil(c.dataset.oil); } });
  });
}
document.getElementById("oil-search").addEventListener("input", e => renderOils(e.target.value));
document.getElementById("oil-sort").addEventListener("change", () => renderOils(document.getElementById("oil-search").value));
document.getElementById("oil-domain-filter").addEventListener("change", e => setTopicFilter("oil-domain-filter", e.target.value, true));

function showOil(id, fromRoute = false) {
  const o = oilById[id];
  if (!o) return;
  if (!fromRoute) routeUrl("oils", { oil: id });
  switchTab("oils");
  document.getElementById("oil-list-view").classList.add("hidden");
  document.getElementById("oil-detail").classList.remove("hidden");
  document.getElementById("oil-swatch").style.background = o.color;
  document.getElementById("oil-name").textContent = o.name;
  document.getElementById("oil-latin").textContent = o.latinName;
  document.getElementById("oil-desc").textContent = o.description;
  document.getElementById("oil-family").textContent = o.family || "-";
  document.getElementById("oil-part").textContent = o.plantPart;
  document.getElementById("oil-extraction").textContent = o.extraction;
  document.getElementById("oil-aroma").textContent = o.aroma.join(", ");
  const legacyUses = o.legacy?.uses || (Array.isArray(o.uses) && o.uses.every(item => typeof item === "string") ? o.uses : []);
  document.getElementById("oil-uses").innerHTML = legacyUses.map(use => `<li>${esc(use)}</li>`).join("") || `<li>No legacy use text retained.</li>`;
  document.getElementById("oil-safety").textContent = o.precautions?.legacySafety || o.safety || "No reviewed safety guidance is recorded.";

  const rows = o.constituents
    .filter(CHEMISTRY.quantified)
    .map(c => ({
      id: c.compoundId,
      name: compoundById[c.compoundId] ? compoundById[c.compoundId].name : c.compoundId,
      min: c.range.min, max: c.range.max
    }))
    .sort((a, b) => b.max - a.max);
  rangeBarChart(document.getElementById("oil-chart"), rows, o.color, showCompound);

  const chips = document.getElementById("oil-compound-chips");
  chips.innerHTML = o.constituents.map(r =>
    `<button class="chip" data-c="${r.compoundId}">${esc(compoundById[r.compoundId]?.name || r.compoundId)} <b>${CHEMISTRY.quantified(r) ? `${r.range.min}-${r.range.max}%` : "Not quantified"}</b></button>`).join("");
  chips.querySelectorAll(".chip").forEach(c =>
    c.addEventListener("click", () => showCompound(c.dataset.c)));
  document.getElementById("oil-beyond").innerHTML = o.constituents.filter(CHEMISTRY.quantified).map(e => `<details class="chem-evidence"><summary>Quantitative source: ${esc(compoundById[e.compoundId]?.name)}</summary>${evidenceBody(e)}</details>`).join("") + beyondExplainer() + oilChemistry(o);
  bindChemistryLinks(document.getElementById("oil-beyond"));

  const studies = studiesForOil(id);
  const domains = domainsForOil(id);
  document.getElementById("oil-domains").innerHTML = domains.length
    ? domains.map(id => `<button class="catchip domain-filter-chip" data-domain-filter="${esc(id)}">${esc(R.label(id))} <b>${studiesForOil(o.id, id).length}</b></button>`).join("")
    : `<span class="catchip dim">No oil-specific topic associations yet</span>`;
  document.querySelectorAll("#oil-domains [data-domain-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      ["study-level-filter", "study-type-filter", "study-search", "study-class-filter", "study-group-filter"].forEach(id => { document.getElementById(id).value = ""; });
      presetStudyFilters({ oil: o.id, domain: btn.dataset.domainFilter, compound: "" });
      switchTab("studies");
      document.getElementById("tab-studies").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  const ec = evidenceCounts(studies);
  document.getElementById("oil-evidence").innerHTML =
    `<span class="evlabel">Evidence:</span> ` +
    ["clinical", "preclinical", "laboratory", "review"]
      .map(l => `<span class="evidence-word lvl-${l}">${LEVEL_LABEL[l]}</span> <b>${ec[l]}</b>`)
      .join(" <span class=\"evidence-sep\">·</span> ");

  const sWrap = document.getElementById("oil-studies");
  sWrap.innerHTML = studies.length ? studies.map(study => studyCard(study, { oilId: id })).join("")
    : `<p class="empty">No studies linked yet.</p>`;
  bindStudyLinks(sWrap);
}

/* ================= COMPOUND EXPLORER ================= */
function renderCompounds() {
  const q = document.getElementById("compound-search").value.toLowerCase();
  const category = document.getElementById("compound-category-filter").value;
  const grid = document.getElementById("compound-grid");
  const list = D.compounds.filter(c => CHEMISTRY.matches(c, q) && CHEMISTRY.matchesCategory(c, category));
  document.getElementById("compound-count").textContent = list.length + " compounds";
  disposeMoleculeViewers();
  grid.innerHTML = list.map(c => {
    const n = oilsWithCompound(c.id).length;
    const s = studiesForCompound(c.id).length;
    return `<div class="card compound-card" data-c="${c.id}" tabindex="0" role="button" aria-label="Explore ${esc(c.name)}"${c.showModel === false ? "" : ` aria-describedby="molecule-note-${c.id}"`}>
      ${c.showModel === false ? "" : `<div class="molecule3d" id="molecule3d-${c.id}" data-molecule-id="${c.id}" role="img" aria-label="Illustrative 3D sketch for ${esc(c.name)}. Not a validated molecular structure. Loading illustration."><span class="molecule-status">Loading illustration</span><span class="molecule-disclaimer" id="molecule-note-${c.id}">Illustrative sketch.<br>Not a validated molecular structure.</span></div>`}
      <h3>${esc(c.name)}</h3>
      <div class="compound-chemline"><span class="formula-chip">${formatFormula(c.formula)}</span></div>
      <p class="sub">${esc(c.chemicalClass)}${CHEMISTRY.tags(c).length ? " · " + CHEMISTRY.tags(c).map(esc).join(", ") : ""}</p>
      <p class="sub">${n} oil${n === 1 ? "" : "s"} &middot; ${s} stud${s === 1 ? "y" : "ies"}</p>
    </div>`;
  }).join("") || `<p class="empty">No compounds match.</p>`;
  grid.querySelectorAll(".card").forEach(el => {
    el.addEventListener("click", () => showCompound(el.dataset.c));
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showCompound(el.dataset.c); } });
  });
  requestAnimationFrame(initVisibleMolecules);
}
document.getElementById("compound-search").addEventListener("input", renderCompounds);
document.getElementById("compound-category-filter").addEventListener("change", renderCompounds);

/* ---------- lightweight 3D compound viewers ---------- */
const moleculeViewers = new Map();
const moleculeObservers = new Map();
let threeLoading = null;
const formulaCounts = f => {
  const out={C:0,H:0,O:0}; let m;
  const re=/([CHO])(\d*)/g;
  while((m=re.exec(f))) out[m[1]] = +(m[2]||1);
  return out;
};
async function loadThree() {
  if (window.THREE) return window.THREE;
  if (!threeLoading) threeLoading=import("https://cdn.jsdelivr.net/npm/three@0.170.0/+esm").then(m=>(window.THREE=m,m)).catch(()=>null);
  return threeLoading;
}
function makePseudoStructure(compound) {
  const n=formulaCounts(compound.formula).C || 10, atoms=[];
  // Deterministic compact carbon skeleton seeded by compound id. The viewer is
  // an illustrative sketch, not validated molecular connectivity or geometry.
  let seed=[...compound.id].reduce((a,ch)=>((a*31+ch.charCodeAt(0))>>>0),2166136261);
  const rnd=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  const ringish=!/myrcene|linalool|geraniol|citronell|citral|cinnamaldehyde/.test(compound.id);
  for(let i=0;i<n;i++){
    const a=ringish ? (i%Math.min(n,6))/Math.min(n,6)*Math.PI*2 : i*.72;
    const branch=Math.floor(i/6);
    atoms.push(ringish && i<6
      ? [Math.cos(a)*1.35,Math.sin(a)*1.35,(rnd()-.5)*.55]
      : [(i-(n-1)/2)*.48,(rnd()-.5)*1.5,(rnd()-.5)*1.15+branch*.2]);
  }
  const bonds=[];
  for(let i=1;i<n;i++) bonds.push([i-1,i]);
  if(ringish&&n>=6){bonds.splice(5,1);bonds.push([5,0]);for(let i=6;i<n;i++)bonds.push([Math.min(5,i-5),i]);}
  return {atoms,bonds};
}
function disposeMoleculeViewers() {
  moleculeObservers.forEach(observer => observer.disconnect());
  moleculeObservers.clear();
  moleculeViewers.forEach(viewer => viewer.dispose());
}
function setMoleculeStatus(host, compound, status) {
  host.querySelector(".molecule-status").textContent = status;
  host.setAttribute("aria-label", `Illustrative 3D sketch for ${compound.name}. Not a validated molecular structure. ${status}`);
}
async function initMolecule3D(host) {
  if (!host || !host.isConnected || host.dataset.ready) return;
  const compound = compoundById[host.dataset.moleculeId];
  if (!compound) return;
  host.dataset.ready = "loading";
  let renderer, visibilityObserver, resizeObserver, frameId = null, stopped = false;
  const resources = [], listeners = [];
  // Cleanup must also work after a partially constructed or failed renderer.
  const safely = action => { try { action(); } catch (_) {} };
  const dispose = () => {
    if (stopped) return;
    stopped = true;
    if (frameId !== null) safely(() => cancelAnimationFrame(frameId));
    safely(() => visibilityObserver?.disconnect());
    safely(() => resizeObserver?.disconnect());
    listeners.forEach(([target, type, handler]) => safely(() => target.removeEventListener(type, handler)));
    resources.forEach(resource => safely(() => resource.dispose()));
    safely(() => renderer?.dispose());
    safely(() => renderer?.domElement.remove());
    moleculeViewers.delete(host);
    delete host.dataset.ready;
  };
  const unavailable = () => {
    dispose();
    if (!host.isConnected) return;
    host.dataset.ready = "unavailable";
    setMoleculeStatus(host, compound, "3D illustration unavailable");
  };
  const listen = (target, type, handler) => {
    target.addEventListener(type, handler);
    listeners.push([target, type, handler]);
  };
  const keep = resource => { resources.push(resource); return resource; };
  moleculeViewers.set(host, { dispose });
  try {
    const THREE = await loadThree();
    if (stopped) return;
    if (!host.isConnected) { dispose(); return; }
    if (!THREE) { unavailable(); return; }
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
    camera.position.z = 8.6;
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.45));
    const resize = () => {
      const w = Math.max(host.clientWidth, 130), h = Math.max(host.clientHeight, 130);
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize();
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.prepend(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const dl = new THREE.DirectionalLight(0xffffff, 2); dl.position.set(4, 5, 7); scene.add(dl);
    const group = new THREE.Group(); scene.add(group);
    const { atoms, bonds } = makePseudoStructure(compound);
    const ag = keep(new THREE.SphereGeometry(.20, 14, 10));
    const am = keep(new THREE.MeshStandardMaterial({ color: 0x72b89a, roughness: .3 }));
    const bm = keep(new THREE.MeshStandardMaterial({ color: 0xd9e7e1, roughness: .45 }));
    atoms.forEach(p => { const m = new THREE.Mesh(ag, am); m.position.set(...p); group.add(m); });
    bonds.forEach(([a, b]) => {
      const p1 = new THREE.Vector3(...atoms[a]), p2 = new THREE.Vector3(...atoms[b]);
      const mid = p1.clone().add(p2).multiplyScalar(.5), len = p1.distanceTo(p2);
      const m = new THREE.Mesh(keep(new THREE.CylinderGeometry(.055, .055, len, 8)), bm);
      m.position.copy(mid); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize()); group.add(m);
    });
    group.rotation.set(-.3, .5, .12);
    let drag = false, lx = 0, ly = 0, visible = true;
    listen(renderer.domElement, "pointerdown", e => {
      drag = true; lx = e.clientX; ly = e.clientY;
      safely(() => renderer.domElement.setPointerCapture(e.pointerId)); e.stopPropagation();
    });
    listen(renderer.domElement, "pointermove", e => {
      if (!drag) return;
      group.rotation.y += (e.clientX - lx) * .012; group.rotation.x += (e.clientY - ly) * .012;
      lx = e.clientX; ly = e.clientY; e.stopPropagation();
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => listen(renderer.domElement, type, e => { drag = false; e.stopPropagation(); }));
    listen(renderer.domElement, "click", e => e.stopPropagation());
    listen(renderer.domElement, "webglcontextlost", e => { e.preventDefault(); unavailable(); });
    if ("IntersectionObserver" in window) {
      visibilityObserver = new IntersectionObserver(entries => { visible = !!entries[0]?.isIntersecting; }, { threshold: .02 });
      visibilityObserver.observe(host);
    }
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        if (stopped) return;
        if (!host.isConnected) { dispose(); return; }
        try { resize(); } catch (_) { unavailable(); }
      });
      resizeObserver.observe(host);
    }
    const frame = () => {
      frameId = null;
      if (stopped) return;
      if (!host.isConnected) { dispose(); return; }
      try {
        if (visible) { if (!drag) group.rotation.y += .003; renderer.render(scene, camera); }
        frameId = requestAnimationFrame(frame);
      } catch (_) { unavailable(); }
    };
    frame();
    if (!stopped) {
      host.dataset.ready = "1";
      setMoleculeStatus(host, compound, "Drag to rotate");
    }
  } catch (_) { unavailable(); }
}
function initVisibleMolecules() {
  document.querySelectorAll(".molecule3d").forEach(host => {
    if (!host.isConnected || host.dataset.ready || moleculeObservers.has(host)) return;
    if (!("IntersectionObserver" in window)) { void initMolecule3D(host); return; }
    const observer = new IntersectionObserver(entries => {
      if (!host.isConnected || entries.some(entry => entry.isIntersecting)) {
        observer.disconnect(); moleculeObservers.delete(host);
        if (host.isConnected) void initMolecule3D(host);
      }
    }, { rootMargin: "220px" });
    moleculeObservers.set(host, observer);
    observer.observe(host);
  });
}

function showCompound(id, fromRoute = false) {
  const c = compoundById[id];
  if (!c) return;
  if (!fromRoute) routeUrl("compounds", { compound: id });
  switchTab("compounds");
  document.getElementById("compound-list-view").classList.add("hidden");
  document.getElementById("compound-detail").classList.remove("hidden");
  document.getElementById("compound-name").textContent = c.name;
  document.getElementById("compound-formula").innerHTML = formatFormula(c.formula);
  document.getElementById("compound-class").textContent = c.chemicalClass;
  document.getElementById("compound-desc").textContent = c.description;
  document.getElementById("compound-aroma").textContent = c.aroma.join(", ");

  document.getElementById("compound-chemistry").innerHTML = `<p>${esc(c.volatility || "")} ${groupLinks(c)}</p>${sourceLinks(c.sourceIds)}${c.identityReview ? `<p class="hint">Formula checked against <a href="${esc(c.identityReview.sourceUrl)}" target="_blank" rel="noopener">${esc(c.identityReview.provider)}</a>. ${esc(c.identityReview.scope)}</p>` : ""}`;
  bindChemistryLinks(document.getElementById("compound-chemistry"));
  const relationships = oilsWithCompound(id);
  const materialRecords = D.oils.flatMap(oil => (oil.chemicalEvidence || [])
    .filter(record => (record.compoundIds || []).includes(id)).map(record => ({ oil, record })));
  const otherMaterials = [...new Map(materialRecords.filter(({ record }) =>
    !["Essential oil", "Essential oil: nonvolatile fraction"].includes(record.material) &&
    ["quantified", "reported-unquantified", "detected-unquantified"].includes(record.status) &&
    CHEMISTRY.hasSources(record)
  ).map(item => [item.oil.id + ":" + item.record.material, item])).values()];
  const rows = relationships.filter(r => r.record.material === "Essential oil" && CHEMISTRY.quantified(r.record)).map(r => ({
    id: r.oil.id, name: r.oil.name + " (cited sample)",
    min: r.range.min, max: r.range.max, color: r.oil.color, record: r.record
  }));
  const chart = document.getElementById("compound-oils-chart");
  chart.classList.toggle("hidden", !rows.length);
  chart.innerHTML = "";
  if (rows.length) rangeBarChart(chart, rows, "#5fc6b5", showOil);
  document.getElementById("compound-chart-note").classList.toggle("hidden", !rows.length);
  document.getElementById("compound-occurrence-heading").textContent = relationships.length
    ? "Found in these oils" : otherMaterials.length ? "Reported in other materials" : "Oil evidence";
  const note = document.getElementById("compound-occurrence-note");
  note.textContent = relationships.length
    ? (rows.length ? "" : "No verified percentages are available here.")
    : otherMaterials.length ? "Essential-oil presence isn't established by these reports."
    : "No oil relationships are recorded here yet.";
  note.classList.toggle("hidden", !note.textContent);
  const oilLinks = document.getElementById("compound-oil-links");
  oilLinks.innerHTML = relationships.length
    ? relationships.map(r => `<button class="chip" data-goto-oil="${r.oil.id}">${esc(r.oil.name)} · ${CHEMISTRY.quantified(r.record) ? `${quantityLabel(r.range)} in cited sample` : "Not quantified"}${r.kind === "nonvolatile-oil" ? " · nonvolatile fraction" : ""}</button>`).join("")
    : otherMaterials.map(({ oil, record }) => `<button class="chip" data-goto-oil="${oil.id}">${esc(oil.name)} · ${esc(record.material)}</button>`).join("");
  bindStudyLinks(oilLinks);
  const material = document.getElementById("compound-material-evidence");
  material.innerHTML = materialRecords.map(({ oil, record }) =>
    `<details class="chem-evidence"><summary>${esc(oil.name)} · ${esc(record.material)} · ${evidenceStatus(record)}</summary>${evidenceBody(record)}<button class="chip" data-goto-oil="${oil.id}">Open ${esc(oil.name)}</button></details>`).join("");
  bindChemistryLinks(material);

  const studies = studiesForCompound(id);
  const sWrap = document.getElementById("compound-studies");
  sWrap.innerHTML = studies.length ? studies.map(studyCard).join("")
    : `<p class="empty">No studies linked yet.</p>`;
  bindStudyLinks(sWrap);
}

/* ================= CANONICAL RELATIONSHIP MATRIX ================= */
const matrixState = { mode: 'oil-topics', group: D.taxonomy.matrixGroups?.[0]?.id || 'unclassified', oil: '', chemical: '', inspection: '' };
const matrixModes = ['oil-topics', 'oil-compounds', 'compound-topics', 'study-topics'];
function matrixGroups() {
  const groups = [...(D.taxonomy.matrixGroups || [])];
  if (!groups.some(group => group.id === 'unclassified') && R.children().some(node => !node.matrixGroupId)) groups.push({ id: 'unclassified', label: 'Unclassified topics', description: 'These taxonomy roots have no display family assigned yet. Their records remain available here.' });
  return groups;
}
function matrixGroupFor(value) {
  return [...R.ancestors(value), R.node(value)].find(node => node?.matrixGroupId)?.matrixGroupId || 'unclassified';
}
function routeMatrix(replace = false) {
  routeUrl('matrix', { domain: R.resolve(document.getElementById('matrix-domain-filter').value), matrixMode: matrixState.mode, matrixGroup: matrixState.group, matrixOil: matrixState.oil, matrixChemical: matrixState.chemical, matrixSearch: document.getElementById('matrix-search').value, matrixSort: document.getElementById('matrix-sort').value, inspect: matrixState.inspection }, replace);
}
function matrixCell(oilId, domainType) { return studiesForOil(oilId, domainType); }
function matrixPapers(kind, id, topic = null) {
  if (kind === 'oil') return studiesForOil(id, topic);
  if (kind === 'compound') return studiesForCompound(id).filter(study => !topic || R.matchesStudy(study, topic));
  return D.studies.filter(study => study.id === id && (!topic || R.matchesStudy(study, topic)));
}
function matrixRecords(oilId, compoundId) {
  const oil = oilById[oilId];
  if (!oil) return [];
  return [...oil.constituents.filter(row => row.compoundId === compoundId).map(record => ({ record, kind: 'catalog' })),
    ...(oil.chemicalEvidence || []).filter(record => (record.compoundIds || []).includes(compoundId)).map(record => ({ record, kind: 'observation' }))];
}
function matrixRecordLabel(records) {
  if (!records.length) return '—';
  const measured = records.filter(({record}) => CHEMISTRY.quantified(record));
  const quantified = measured.filter(({record}) => ['Essential oil', 'Essential oil: nonvolatile fraction'].includes(record.material));
  if (measured.length && !quantified.length) return 'Other material';
  if (quantified.length === 1) return quantityLabel(quantified[0].record.range);
  if (quantified.length > 1) return quantified.length + ' samples';
  if (records.every(({record}) => record.status === 'not-detected')) return 'Not detected';
  if (records.every(({record}) => record.status === 'not-found' || record.status === 'not-reviewed')) return 'Unreviewed';
  if (records.every(({record}) => record.material && !['Essential oil', 'Essential oil: nonvolatile fraction'].includes(record.material))) return 'Other material';
  return records.some(({record}) => CHEMISTRY.hasSources(record)) ? 'Reported' : 'Catalog only';
}
function matrixSelect(inspection) {
  matrixState.inspection = inspection;
  renderMatrixInspector(); routeMatrix();
  document.getElementById('matrix-inspector-title')?.focus?.();
  document.getElementById('matrix-inspector')?.scrollIntoView?.({block:'start'});
}
function matrixBindInspector(host) {
  // Linked entities stay in the master explorer. Full-profile actions outside
  // paper cards remain available when the separate library view is wanted.
  for (const kind of ['oil', 'compound']) host.querySelectorAll(`[data-goto-${kind}]:not([data-matrix-profile])`).forEach(button => {
    button.setAttribute('data-matrix-inspect', `${kind}/${button.getAttribute('data-goto-' + kind)}`);
    button.removeAttribute('data-goto-' + kind);
  });
  host.querySelectorAll('[data-matrix-inspect]').forEach(button => button.addEventListener('click', () => matrixSelect(button.dataset.matrixInspect)));
  host.querySelectorAll('[data-matrix-focus]').forEach(button => button.addEventListener('click', () => {
    matrixState.mode = 'oil-compounds'; matrixState.oil = button.dataset.matrixFocus; matrixState.inspection = '';
    document.getElementById('matrix-search').value = ''; renderMatrix(); routeMatrix();
    document.getElementById('matrix-title')?.focus?.();
    document.getElementById('matrix-title')?.scrollIntoView?.({block:'start'});
  }));
  host.querySelectorAll('[data-matrix-close]').forEach(button => button.addEventListener('click', () => {
    matrixState.inspection = ''; renderMatrixInspector(); routeMatrix(); document.getElementById('matrix-title')?.focus?.();
  }));
  host.querySelectorAll('[data-goto-use]').forEach(button => {
    const topic = button.dataset.gotoUse;
    button.setAttribute('data-matrix-topic-link', topic);
    button.addEventListener('click', () => {
      if (matrixState.mode === 'oil-compounds') matrixState.mode = 'oil-topics';
      matrixState.inspection = '';
      setTopicFilter('matrix-domain-filter', topic, true);
      document.getElementById('matrix-title')?.focus?.();
      document.getElementById('matrix-title')?.scrollIntoView?.({block:'start'});
    });
    button.removeAttribute('data-goto-use');
  });
  bindChemistryLinks(host);
}
function matrixPaperList(studies, oilId = null, useId = null) {
  return studies.length ? studies.map(study => studyCard(study, {oilId, useId})).join('') : '<p class="empty">No linked papers for this relationship. This is a data gap, not evidence of no effect.</p>';
}
function renderMatrixInspector() {
  const host = document.getElementById('matrix-inspector');
  if (!host) return;
  host.hidden = !matrixState.inspection;
  if (host.hidden) { host.innerHTML = ''; return; }
  const [kind, id, target] = matrixState.inspection.split('/');
  let title = '', intro = '', body = '';
  if (kind === 'oil' && oilById[id]) {
    const oil = oilById[id], papers = studiesForOil(id);
    title = oil.name;
    intro = `${esc(oil.latinName)} · ${esc(oil.plantPart)} · ${esc(oil.extraction)}`;
    const compounds = D.compounds.map(compound => ({compound, records:matrixRecords(id, compound.id)})).filter(row => row.records.length);
    body = `<p>${esc(oil.description)}</p><div class="matrix-detail-actions"><button class="chip" data-matrix-focus="${esc(id)}">${uiIcon('compounds')}Compare this oil’s compounds</button><button class="chip" data-matrix-profile data-goto-oil="${esc(id)}">Full oil profile</button></div>
      <h4>Compounds and material records</h4><p class="hint">A catalog association, a measured oil sample and a report in other plant material are different kinds of evidence. Open a compound relationship to inspect the distinction.</p>
      <div class="matrix-records">${compounds.map(({compound,records}) => `<button data-matrix-inspect="relationship/${esc(id)}/${esc(compound.id)}"><span>${esc(compound.name)}<small>${formatFormula(compound.formula)}</small></span><span>${esc(matrixRecordLabel(records))} ${uiIcon('arrow')}</span></button>`).join('') || '<p>No constituent relationships are recorded.</p>'}</div>
      <details class="matrix-evidence-disclosure"><summary>All chemical observations · ${(oil.chemicalEvidence || []).length}</summary>${(oil.chemicalEvidence || []).map(record => `<article class="chem-evidence"><h4>${esc(record.analyte || record.group)}</h4>${evidenceBody(record)}</article>`).join('') || '<p>No chemical observations recorded.</p>'}</details>
      <details class="matrix-evidence-disclosure"><summary>Precautions · ${esc(oil.precautions?.reviewStatus || 'unreviewed')}</summary><p class="hint">Historical catalog notes; not a verified formulation limit or interaction assessment.</p><p>${esc(oil.precautions?.legacySafety || 'No reviewed safety guidance recorded.')}</p></details>
      <h4>Linked papers · ${papers.length}</h4>${matrixPaperList(papers, id)}`;
  } else if (kind === 'relationship' && oilById[id] && compoundById[target]) {
    title = `${oilById[id].name} → ${compoundById[target].name}`;
    intro = 'Every recorded observation for this oil–compound relationship. Sample percentages are not universal composition or finished-product concentrations.';
    const records = matrixRecords(id, target);
    body = `<div class="matrix-detail-actions"><button class="chip" data-matrix-inspect="oil/${esc(id)}">${esc(oilById[id].name)}</button><button class="chip" data-matrix-inspect="compound/${esc(target)}">All ${esc(compoundById[target].name)} connections</button></div>` +
      (records.map(({record,kind}) => kind === 'catalog' ? `<article class="chem-evidence"><h4>Catalog constituent</h4><p>${CHEMISTRY.quantified(record) ? `${quantityLabel(record.range)} in the cited sample.` : 'No source-qualified percentage is available for this catalog entry. Historical ranges are not plotted.'}</p>${sourceLinks(record.sourceIds || [])}</article>` : `<article class="chem-evidence"><h4>${esc(evidenceStatus(record))}</h4>${evidenceBody(record)}</article>`).join('') || '<p>No recorded relationship.</p>');
  } else if (kind === 'compound' && compoundById[id]) {
    const compound = compoundById[id], papers = studiesForCompound(id);
    title = compound.name; intro = `${esc(compound.formula)} · ${esc(compound.chemicalClass)}`;
    const oils = D.oils.map(oil => ({oil, records:matrixRecords(oil.id, id)})).filter(row => row.records.length);
    body = `<p>${esc(compound.description)}</p><button class="chip" data-matrix-profile data-goto-compound="${esc(id)}">Full compound profile</button><h4>Oil and material connections</h4><div class="matrix-records">${oils.map(({oil,records}) => `<button data-matrix-inspect="relationship/${esc(oil.id)}/${esc(id)}"><span>${esc(oil.name)}</span><span>${esc(matrixRecordLabel(records))} ${uiIcon('arrow')}</span></button>`).join('') || '<p>No oil/material connection recorded.</p>'}</div><h4>Compound bibliography · ${papers.length}</h4><p class="hint">These papers may study whole oils, isolated compounds or other preparations. A bibliography link does not establish that the compound caused an oil’s effects.</p>${matrixPaperList(papers)}`;
  } else if (['oil-topic', 'compound-topic'].includes(kind) && R.node(target) && (kind === 'oil-topic' ? oilById[id] : compoundById[id])) {
    const isOil = kind === 'oil-topic', entity = isOil ? oilById[id] : compoundById[id];
    const papers = matrixPapers(isOil ? 'oil' : 'compound', id, target);
    title = `${entity.name} → ${R.label(target)}`;
    intro = isOil ? 'Oil-specific evidence, including contextual materials and uncertain associations. Read the actual outcome and limitations.' : 'Compound-linked bibliography for this topic. It does not establish whole-oil or isolated-compound efficacy.';
    body = `<p class="matrix-inspector-path">${esc(R.breadcrumb(target))} · ${papers.length} unique papers</p>${matrixPaperList(papers, isOil ? id : null, target)}`;
  } else if (kind === 'sources') {
    title = 'Source registry'; intro = 'Composition, taxonomy and other source records referenced by the canonical dataset. Publication records remain in the Studies × topics view.';
    body = D.sources.map(source => `<article class="chem-evidence"><h4>${esc(source.label || source.title || source.id)}</h4>${sourceLinks([source.id])}<details><summary>Canonical source metadata</summary><pre>${esc(JSON.stringify(source, null, 2))}</pre></details></article>`).join('');
  } else if (kind === 'study') {
    const study = D.studies.find(row => row.id === id);
    if (study) { title = 'Publication record'; intro = 'The source, reported finding and scoped oil assessments.'; body = matrixPaperList([study]) + '<h4>Oil-specific assessments</h4>' + (study.oilIds || []).map(oilId => assertionContext(study, oilId, null)).join(''); }
  }
  if (!title) { title = 'Record unavailable'; body = '<p>This selection does not match the current canonical data.</p>'; }
  host.innerHTML = `<header><div><p class="section-kicker">Inside the matrix</p><h3 id="matrix-inspector-title" tabindex="-1">${esc(title)}</h3><p>${intro}</p></div><button class="back" data-matrix-close>Close details</button></header><div class="matrix-inspector-body">${body}</div>`;
  matrixBindInspector(host);
}
function renderMatrix() {
  const table = document.getElementById('matrix-table');
  const groupSelect = document.getElementById('matrix-group-filter'), topicSelect = document.getElementById('matrix-domain-filter');
  const q = (document.getElementById('matrix-search').value || '').trim().toLowerCase();
  const sort = document.getElementById('matrix-sort').value || 'az';
  const topics = matrixState.mode !== 'oil-compounds', oilRows = matrixState.mode.startsWith('oil-');
  const selected = topics ? R.node(topicSelect.value) : null;
  if (selected) matrixState.group = matrixGroupFor(selected.id);
  const groups = matrixGroups();
  if (!groups.some(group => group.id === matrixState.group)) matrixState.group = groups[0]?.id || 'unclassified';
  const group = groups.find(group => group.id === matrixState.group);
  groupSelect.innerHTML = groups.map(group => `<option value="${esc(group.id)}">${esc(group.label)}</option>`).join(''); groupSelect.value = matrixState.group;
  const roots = R.children().filter(node => matrixGroupFor(node.id) === matrixState.group);
  const options = selected && !roots.some(node => node.id === selected.id) ? [...roots, selected] : roots;
  topicSelect.innerHTML = '<option value="">All in this family</option>' + options.map(node => `<option value="${esc(node.id)}">${esc(node.parentId ? R.breadcrumb(node.id) : R.label(node.id))}</option>`).join('');
  topicSelect.value = selected?.id || '';
  syncTopicFilter('matrix-domain-filter');
  document.getElementById('matrix-domain-filter-navigation').hidden = !topics;
  for (const id of ['matrix-group-control','matrix-topic-control']) document.getElementById(id).hidden = !topics;
  document.getElementById('matrix-chemical-control').hidden = topics;
  document.getElementById('matrix-oil-control').hidden = !oilRows;
  const oilFilter = document.getElementById('matrix-oil-filter');
  oilFilter.innerHTML = '<option value="">All oils</option>' + oilsByName.map(oil => `<option value="${esc(oil.id)}">${esc(oil.name)}</option>`).join(''); oilFilter.value = matrixState.oil;
  const chemicalFilter = document.getElementById('matrix-chemical-filter');
  chemicalFilter.innerHTML = '<option value="">All compounds</option>' + CHEMISTRY.compoundCategories.map(group => `<option value="${esc(group.id)}">${esc(group.label)}</option>`).join(''); chemicalFilter.value = matrixState.chemical;
  document.querySelectorAll('[data-matrix-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.matrixView === matrixState.mode)));
  const inventory = document.getElementById('matrix-inventory');
  inventory.innerHTML = `${D.oils.length} oils · ${D.compounds.length} compounds · ${R.nodes.length} topic terms · ${D.studies.length} papers · <button data-matrix-inspect="sources">${D.sources.length} source records</button>`;
  matrixBindInspector(inventory);
  const matrixKey = topics ? [
    group?.description,
    oilRows ? 'Counts = linked papers, not effectiveness scores.' : matrixState.mode === 'compound-topics' ? 'Counts = bibliography links, not proof of a compound’s effects.' : '● = paper tagged with this topic or a subtopic.',
    'Parent counts include subtopics. Overlapping columns cannot be added.'
  ] : [
    'Percentages = cited samples only.',
    'Catalog only = no source-qualified measurement.',
    'Other material = plant or extract evidence.',
    '— = no recorded link, not chemical absence.'
  ];
  document.getElementById('matrix-context').innerHTML = matrixKey.filter(Boolean).map(text => `<li>${esc(text)}</li>`).join('');
  const columns = topics ? selected ? [selected, ...R.children(selected.id)] : roots : D.compounds.filter(compound => CHEMISTRY.matchesCategory(compound, matrixState.chemical));
  const kind = oilRows ? 'oil' : matrixState.mode === 'compound-topics' ? 'compound' : 'study';
  let rows = (oilRows ? D.oils : kind === 'compound' ? D.compounds : D.studies).filter(row => (!oilRows || !matrixState.oil || row.id === matrixState.oil) && (!q || [row.name, row.latinName, row.title, row.formula, row.authors, row.pubmedId, row.doi].filter(Boolean).join(' ').toLowerCase().includes(q)));
  rows.sort((a,b) => (sort === 'studies' ? matrixPapers(kind,b.id).length - matrixPapers(kind,a.id).length : 0) || (a.name || a.title).localeCompare(b.name || b.title));
  document.getElementById('matrix-count').textContent = `${rows.length} ${kind === 'oil' ? 'oil' : kind === 'compound' ? 'compound' : 'paper'}${rows.length === 1 ? '' : 's'} × ${columns.length} columns`;
  let html = `<caption class="matrix-caption">${topics ? group?.label || 'Research topics' : 'Oil–compound records'}</caption><thead><tr><th scope="col" class="rowlabel">${kind === 'oil' ? 'Essential oil' : kind === 'compound' ? 'Compound' : 'Publication'}<small>Select a name to explore</small></th>${columns.map(column => `<th scope="col"><button ${topics ? 'data-matrix-topic' : 'data-matrix-inspect'}="${topics ? esc(column.id) : 'compound/' + esc(column.id)}">${esc(topics ? R.label(column.id) : column.name)}${topics && R.children(column.id).length ? '<small>Explore subtopics ↓</small>' : !topics ? `<small>${formatFormula(column.formula)}</small>` : ''}</button></th>`).join('')}</tr></thead><tbody>`;
  rows.forEach(row => {
    html += `<tr><th scope="row" class="rowlabel"><button data-matrix-inspect="${kind}/${esc(row.id)}">${oilRows ? `<span class="swatch sm" style="background:${esc(row.color)}"></span>` : ''}${esc(row.name || row.title)}<small>${esc(oilRows ? row.latinName : kind === 'compound' ? row.formula : `${row.year} · ${row.journal}`)}</small></button></th>`;
    columns.forEach(column => {
      const records = topics ? [] : matrixRecords(row.id,column.id), papers = topics ? matrixPapers(kind,row.id,column.id) : [];
      const present = topics ? papers.length : records.length;
      const inspection = topics ? kind === 'study' ? `study/${row.id}` : `${kind}-topic/${row.id}/${column.id}` : `relationship/${row.id}/${column.id}`;
      const value = topics ? kind === 'study' ? present ? '●' : '—' : String(present) : matrixRecordLabel(records);
      const label = topics ? `${row.name || row.title}, ${R.label(column.id)}: ${papers.length} linked papers` : `${row.name}, ${column.name}: ${value}`;
      html += `<td><button class="cell${topics ? '' : ' composition-cell'}" data-oil="${oilRows ? esc(row.id) : ''}" data-domain="${topics ? esc(column.id) : ''}" data-matrix-inspect="${esc(inspection)}" aria-label="${esc(label)}" ${present ? '' : 'disabled'}><span class="cell-n">${esc(value)}</span></button></td>`;
    });
    html += '</tr>';
  });
  table.innerHTML = html + '</tbody>';
  if (!rows.length) table.innerHTML += `<tfoot><tr><td colspan="${columns.length + 1}">No rows match. Clear the search or oil filter.</td></tr></tfoot>`;
  table.querySelectorAll('[data-matrix-topic]').forEach(button => button.addEventListener('click', () => { matrixState.inspection = ''; setTopicFilter('matrix-domain-filter',button.dataset.matrixTopic,true); }));
  table.querySelectorAll('[data-matrix-inspect]:not([disabled])').forEach(button => button.addEventListener('click', () => matrixSelect(button.dataset.matrixInspect)));
  renderMatrixInspector();
}
document.querySelectorAll('[data-matrix-view]').forEach(button => button.addEventListener('click', () => { matrixState.mode = button.dataset.matrixView; matrixState.inspection = ''; renderMatrix(); routeMatrix(); }));
for (const id of ['matrix-search', 'matrix-sort']) document.getElementById(id)?.addEventListener(id === 'matrix-search' ? 'input' : 'change', () => { renderMatrix(); routeMatrix(id === 'matrix-search'); });
document.getElementById('matrix-group-filter')?.addEventListener('change', event => { matrixState.group = event.target.value; matrixState.inspection = ''; document.getElementById('matrix-domain-filter').value = ''; renderMatrix(); routeMatrix(); });
document.getElementById('matrix-oil-filter')?.addEventListener('change', event => { matrixState.oil = event.target.value; matrixState.inspection = ''; renderMatrix(); routeMatrix(); });
document.getElementById('matrix-chemical-filter')?.addEventListener('change', event => { matrixState.chemical = event.target.value; matrixState.inspection = ''; renderMatrix(); routeMatrix(); });
document.getElementById('matrix-domain-filter').addEventListener('change', event => { matrixState.inspection = ''; setTopicFilter('matrix-domain-filter',event.target.value,true); });


/* ================= DOMAIN EXPLORER ================= */
let domainState = { type: null, sub: null };
function domainStudyCount(type, sub) {
  const id = resolveUse(type, sub);
  return id ? R.countStudies(id) : 0;
}
function renderDomainTiles() {
  const wrap = document.getElementById("domain-tiles");
  wrap.classList.remove("hidden");
  document.getElementById("domain-detail").classList.add("hidden");
  wrap.innerHTML = R.roots().map(node => {
    const count = R.countStudies(node.id), children = R.children(node.id);
    return `<button class="domain-tile" data-domain="${esc(node.id)}">
      <span class="domain-icon">${uiIcon("domains")}</span><h3>${esc(R.label(node.id))}</h3>
      <p class="domain-n">${count} stud${count === 1 ? "y" : "ies"}</p>
      ${children.length ? `<p class="sub">${children.slice(0, 5).map(child => esc(R.label(child.id))).join(" &middot; ")}${children.length > 5 ? " &middot; …" : ""}</p>` : ""}
    </button>`;
  }).join("");
  wrap.querySelectorAll(".domain-tile").forEach(button => button.addEventListener("click", () => showDomain(button.dataset.domain)));
}
function showDomain(type, sub) {
  const id = resolveUse(type, sub), node = R.node(id);
  if (!node) return;
  switchTab("domains");
  domainState = { type: id, sub: null };
  routeUrl("domains", { domain: id });
  document.getElementById("domain-tiles").classList.add("hidden");
  document.getElementById("domain-detail").classList.remove("hidden");
  document.getElementById("domain-name").textContent = R.label(id);
  const crumbs = document.getElementById("domain-breadcrumb");
  if (crumbs) {
    crumbs.innerHTML = topicBreadcrumb(id, "data-domain-parent");
    crumbs.querySelectorAll("[data-domain-parent]").forEach(button => button.addEventListener("click", () => {
      if (button.dataset.domainParent) showDomain(button.dataset.domainParent);
      else { renderDomainTiles(); routeUrl("domains"); }
    }));
  }
  const children = R.children(id), subs = document.getElementById("domain-subs");
  subs.innerHTML = children.map(child => `<button class="chip" data-sub="${esc(child.id)}">${esc(R.label(child.id))} <b>${R.countStudies(child.id)}</b></button>`).join("");
  subs.querySelectorAll(".chip").forEach(button => button.addEventListener("click", () => showDomain(button.dataset.sub)));
  const studies = D.studies.filter(study => R.matchesStudy(study, id));
  // Oil/topic edges come only from assertions, never a study's Cartesian set
  // of oils and categories. Counts deduplicate papers at every depth.
  const oilRows = D.oils.map(oil => ({ oil, n: studiesForOil(oil.id, id).length })).filter(row => row.n).sort((a, b) => b.n - a.n || a.oil.name.localeCompare(b.oil.name));
  const oilWrap = document.getElementById("domain-oils");
  oilWrap.innerHTML = oilRows.length ? oilRows.map(({ oil, n }) => `<button class="chip" data-oil="${esc(oil.id)}"><span class="swatch sm" style="background:${oil.color}"></span>${esc(oil.name)} <b>${n}</b></button>`).join("") : `<p class="empty">No oil-specific topic associations here yet.</p>`;
  oilWrap.querySelectorAll(".chip").forEach(button => button.addEventListener("click", () => showOil(button.dataset.oil)));
  const compRows = D.compounds.map(compound => ({ compound, n: studies.filter(study => (study.compoundIds || []).includes(compound.id)).length })).filter(row => row.n).sort((a, b) => b.n - a.n || a.compound.name.localeCompare(b.compound.name));
  const compWrap = document.getElementById("domain-compounds");
  compWrap.innerHTML = compRows.length ? compRows.map(({ compound, n }) => `<button class="chip" data-c="${esc(compound.id)}">${esc(compound.name)} <b>${n}</b></button>`).join("") : `<p class="empty">No compounds linked to these papers yet.</p>`;
  compWrap.querySelectorAll(".chip").forEach(button => button.addEventListener("click", () => showCompound(button.dataset.c)));
  const sWrap = document.getElementById("domain-studies");
  sWrap.innerHTML = studies.length ? studies.map(studyCard).join("") : `<p class="empty">No studies here yet.</p>`;
  bindStudyLinks(sWrap);
}

/* ================= NETWORK ================= */
function renderNetwork() {
  const el = document.getElementById("network-chart");
  const chart = echarts.init(el);
  charts.push(chart);
  const nodes = [], links = [];
  const relationships = D.compounds.flatMap(compound =>
    oilsWithCompound(compound.id).map(relationship => ({ ...relationship, compound })));
  D.oils.forEach(o => nodes.push({
    id: "oil:" + o.id, name: o.name, category: 0,
    symbolSize: 26, itemStyle: { color: o.color }
  }));
  D.compounds.forEach(c => {
    const n = relationships.filter(r => r.compound.id === c.id).length;
    if (!n) return;
    nodes.push({
      id: "compound:" + c.id, name: c.name, category: 1,
      symbolSize: 12 + n * 4, itemStyle: { color: "#5fc6b5" }
    });
  });
  relationships.forEach(r => links.push({
    source: "oil:" + r.oil.id, target: "compound:" + r.compound.id,
    kind: r.kind,
    description: `${r.oil.name} / ${r.compound.name}: ${r.kind === "nonvolatile-oil" ? "reported in a nonvolatile oil fraction" : r.kind === "catalog" ? "catalog relationship; quantity not verified" : "reported in a cited oil sample"}`,
    sample: r.record.sample || "",
    lineStyle: r.kind === "nonvolatile-oil" ? { type: "dashed", color: "#efbd69", width: 2 } : undefined
  }));
  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      formatter: p => p.dataType === "edge"
        ? `${esc(p.data.description)}${p.data.sample ? "<br>" + esc(p.data.sample) : ""}`
        : esc(p.name)
    },
    legend: [{ data: ["Oils", "Compounds"], textStyle: { color: "#9aa7bd" }, bottom: 0 }],
    series: [{
      type: "graph", layout: "force",
      data: nodes, links: links,
      categories: [{ name: "Oils" }, { name: "Compounds" }],
      roam: true,
      label: { show: true, color: "#f2ead8", fontSize: 11 },
      force: { repulsion: 160, edgeLength: 90 },
      lineStyle: { color: "#26334f", width: 1.5 },
      emphasis: { focus: "adjacency" }
    }]
  });
  chart.on("click", p => {
    if (p.dataType !== "node") return;
    const [kind, id] = p.data.id.split(":");
    if (kind === "oil") showOil(id);
    else showCompound(id);
  });
}

/* ================= STUDY LIBRARY ================= */
function routeStudyFilters() {
  routeUrl("studies", { oil: document.getElementById("study-oil-filter").value, compound: document.getElementById("study-compound-filter").value, domain: R.resolve(document.getElementById("study-domain-filter").value) });
}
function presetStudyFilters(f) {
  if (f.oil !== undefined) document.getElementById("study-oil-filter").value = f.oil || "";
  if (f.domain !== undefined) setTopicFilter("study-domain-filter", f.domain);
  if (f.compound !== undefined) document.getElementById("study-compound-filter").value = f.compound || "";
  renderStudies();
  routeStudyFilters();
}
function renderStudies() {
  const q = document.getElementById("study-search").value.toLowerCase();
  const oilF = document.getElementById("study-oil-filter").value;
  const compF = document.getElementById("study-compound-filter").value;
  const domF = document.getElementById("study-domain-filter").value;
  const lvlF = document.getElementById("study-level-filter").value;
  const typeF = document.getElementById("study-type-filter").value;
  const classF = document.getElementById("study-class-filter").value;
  const groupF = document.getElementById("study-group-filter").value;
  syncTopicFilter("study-domain-filter");
  const oilStudyIds = oilF ? new Set(studiesForOil(oilF, domF || null).map(study => study.id)) : null;
  const list = D.studies.filter(s =>
    ((!classF && !groupF) || (!classF && (s.chemicalGroups || []).includes(groupF)) || (s.compoundIds || []).some(id => compoundById[id] && CHEMISTRY.matches(compoundById[id], "", classF, groupF))) &&
    (!oilStudyIds || oilStudyIds.has(s.id)) &&
    (!compF || (s.compoundIds || []).includes(compF)) &&
    (oilF || !domF || R.matchesStudy(s, domF)) &&
    (!lvlF || s.evidenceLevel === lvlF) &&
    (!typeF || s.studyType === typeF) &&
    ([s.title, s.finding, s.material, s.model, s.outcome, s.limitations, s.route, s.species, s.relevance, ...sourceTopicNodes(s, oilF || null, domF || null).map(node => sourceTopicLabel(node.id))].map(qualifierText).join(" ").toLowerCase().includes(q)));
  document.getElementById("study-count").textContent = list.length + " studies";
  const wrap = document.getElementById("study-list");
  wrap.innerHTML = list.map(study => studyCard(study, { oilId: oilF, useId: domF })).join("") || `<p class="empty">No studies match.</p>`;
  bindStudyLinks(wrap);
}
["study-search", "study-oil-filter", "study-compound-filter", "study-level-filter", "study-type-filter", "study-class-filter", "study-group-filter"].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => { renderStudies(); routeStudyFilters(); });
});
document.getElementById("study-domain-filter").addEventListener("change", e => setTopicFilter("study-domain-filter", e.target.value, true));

/* ---------- init ---------- */
(function init() {
  // Overview stats existed in an earlier layout. Keep init compatible with
  // both versions so missing optional UI never prevents the main tab rendering.
  const statOils = document.getElementById("stat-oils");
  const statCompounds = document.getElementById("stat-compounds");
  const statStudies = document.getElementById("stat-studies");
  const statClinical = document.getElementById("stat-clinical");
  if (statOils) statOils.textContent = D.oils.length;
  if (statCompounds) statCompounds.textContent = D.compounds.length;
  if (statStudies) statStudies.textContent = D.studies.length;
  if (statClinical) statClinical.textContent = D.studies.filter(s => s.evidenceLevel === "clinical").length;
  const classes = [...new Set(D.compounds.map(c => c.chemicalClass))].sort();
  document.getElementById("compound-category-filter").innerHTML =
    `<option value="">All compounds</option>` + CHEMISTRY.compoundCategories.map(category => `<option value="${esc(category.id)}">${esc(category.label)}</option>`).join("");
  document.getElementById("study-class-filter").innerHTML =
    `<option value="">All classes</option>` + classes.map(c => `<option>${esc(c)}</option>`).join("");
  const groupOptions = `<option value="">All functional groups / families</option>` + CHEMISTRY.groups.map(g => `<option value="${esc(g.id)}">${esc(g.label)}</option>`).join("");
  document.getElementById("study-group-filter").innerHTML = groupOptions;
  document.getElementById("compound-beyond").innerHTML = beyondExplainer();
  bindChemistryLinks(document.getElementById("compound-beyond"));
  document.getElementById("study-oil-filter").innerHTML =
    `<option value="">All oils</option>` + oilsByName.map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join("");
  document.getElementById("study-compound-filter").innerHTML =
    `<option value="">All compounds</option>` + D.compounds.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  topicFilterIds.forEach(id => { document.getElementById(id).innerHTML = topicOptions(); });
  const types = [...new Set(D.studies.map(s => s.studyType))].sort();
  document.getElementById("study-type-filter").innerHTML =
    `<option value="">All study types</option>` + types.map(t => `<option value="${t}">${esc(prettyStudyType(t))}</option>`).join("");
  const compoundSort = document.querySelector('#oil-sort option[value="compound"]');
  compoundSort.disabled = compoundSort.hidden = !D.oils.some(topConstituent);
  document.getElementById("oil-sort").value = "az";
  renderOils("");
  renderCompounds();
  renderStudies();

  // Explicitly initialize whichever tab the HTML marks active. This prevents
  // the first view from depending on a user switching tabs.
  const initialParams = new URLSearchParams(location.search);
  if (initialParams.has("tab") || initialParams.has("oil") || initialParams.has("compound") || initialParams.has("domain")) {
    applyRoute();
  } else {
    const activeTab = document.querySelector(".tab.active");
    if (activeTab) {
      switchTab(activeTab.dataset.tab);
      routeUrl(activeTab.dataset.tab, {}, true);
    }
  }
})();
/* ---------- Beyond Terpenes: qualitative evidence stays outside range charts ---------- */
function sourceLinks(ids = []) {
  const sources = [...new Set(ids)].map(id => CHEMISTRY.sources[id]).filter(s => s && /^https:\/\//.test(s.url));
  return sources.length ? `<ul class="chem-sources">${sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a> <span>${esc(s.type || "Composition / taxonomy source")}${s.evidenceLevel ? " · " + esc(s.evidenceLevel) : ""}</span></li>`).join("")}</ul>` : "";
}
function groupLinks(compound) {
  return CHEMISTRY.tags(compound).map(id => `<button class="chip" data-chem-group="${esc(id)}">${esc(CHEMISTRY.groups.find(g => g.id === id)?.label || id)}</button>`).join("");
}
function beyondExplainer() {
  return `<details class="beyond-terpenes"><summary>Beyond Terpenes: what else shapes plant chemistry?</summary>
    <p>A plant's scent is more than its terpenes. Tiny amounts of other volatile molecules can shape what we smell. Plants also contain nonvolatile compounds that belong to a different part of their chemistry.</p>
    <div class="chem-group-grid">${CHEMISTRY.groups.map(g => `<section><h4>${esc(g.label)}</h4><p>${esc(g.description)}</p><details><summary>Examples and chemistry</summary><p>${esc(g.details)}</p><div class="chips">${g.compoundIds.map(id => `<button class="chip" data-goto-compound="${id}">${esc(compoundById[id].name)}</button>`).join("")}<button class="chip" data-chem-group="${esc(g.id)}">Browse ${esc(g.label.toLowerCase())}</button></div>${sourceLinks(g.sourceIds)}</details></section>`).join("")}</div>
    <details><summary>How to read the evidence</summary><p>Functional groups overlap with primary chemical families. An aldehyde can also be a monoterpenoid. These groups are not additive slices of an oil.</p><p>Routine volatile-oil GC-MS may miss trace sulfur odorants. Sulfur-sensitive detection, GC×GC and sensory evaluation can provide different information. Typically nonvolatile flavonoids are commonly studied with LC/HPLC. Cold-pressed citrus oils can retain a nonvolatile fraction; it is shown separately from volatile fingerprints.</p><p>Published plant, oil and extract research is not testing of the finished Sunny's Shield formula. The records here are a curated selection, not exhaustive coverage.</p>${sourceLinks(D.editorialReferences?.chemistryExplainerSourceIds || [])}</details>
  </details>`;
}
function evidenceStatus(e) {
  if (e.status === "quantified" && CHEMISTRY.quantified(e)) return "Quantified in cited sample";
  if (e.status === "not-detected") return "Not detected in this study";
  if (e.status === "not-found" || e.status === "not-reviewed") return "Evidence not yet found";
  if (e.status === "detected-unquantified") return "Detected · Not quantified here";
  return "Reported · Not quantified here";
}
function evidenceBody(e) {
  return `${e.analyte ? `<p><strong>${esc(e.analyte)}</strong></p>` : ""}<p>${esc(e.finding)}</p>
    ${CHEMISTRY.quantified(e) ? `<p>Reported value: <b>${e.range.min === e.range.max ? e.range.min : e.range.min + "-" + e.range.max}%</b> chromatographic area in this sample.</p>` : `<p class="hint">${e.status === "not-detected" ? "A study-specific result is not universal absence." : "Not quantified here; source measurements may be available."}</p>`}
    <div class="chips">${(e.compoundIds || []).filter(id => compoundById[id]).map(id => `<button class="chip" data-goto-compound="${id}">${esc(compoundById[id].name)}</button>`).join("")}</div>
    <details class="chem-source-details"><summary>Sample, method and source</summary><p class="chem-context"><b>Material:</b> ${esc(e.material || "Not specified")}${e.sample ? " · " + esc(e.sample) : ""}<br><b>Preparation:</b> ${esc(e.extraction || "Not recorded")}<br><b>Method:</b> ${esc(e.method || "Not recorded")}${e.basis ? "<br><b>Measurement basis:</b> " + esc(e.basis) : ""}</p>${e.limitations ? `<p class="hint">${esc(e.limitations)}</p>` : ""}${e.sourceQuantityNote ? `<p class="hint">${esc(e.sourceQuantityNote)}</p>` : ""}${sourceLinks(e.sourceIds)}</details>`;
}
function oilChemistry(oil) {
  const positive = e => !["not-found", "not-reviewed"].includes(e.status);
  const documented = CHEMISTRY.groups.filter(g => CHEMISTRY.evidenceFor(oil, g.id).some(positive));
  const gaps = CHEMISTRY.groups.filter(g => !CHEMISTRY.evidenceFor(oil, g.id).some(positive));
  const reviewedGaps = (oil.chemicalEvidence || []).filter(e => !positive(e));
  return `<details class="oil-chemistry" aria-label="Additional chemistry evidence for ${esc(oil.name)}"><summary>Extra compounds in ${esc(oil.name)} <span>${documented.length ? documented.length + " groups with published evidence" : "Evidence not yet curated"}</span></summary>
    <p class="hint">Literature findings for the named material, not a test of the finished formula.</p>${documented.map(g => {
      const entries = CHEMISTRY.evidenceFor(oil, g.id).filter(positive);
      return `<details class="chem-evidence"><summary>${esc(g.label)} <span>${[...new Set(entries.map(e => e.material))].map(esc).join("; ")}</span></summary>${entries.map(e => `<article><p class="chem-status">${evidenceStatus(e)}</p>${evidenceBody(e)}</article>`).join("")}<button class="chip" data-chem-group="${esc(g.id)}">Browse ${esc(g.label.toLowerCase())}</button></details>`;
    }).join("")}
    ${gaps.length ? `<p class="hint">Evidence not yet found: ${gaps.map(g => esc(g.label.toLowerCase())).join(", ")}. This is a gap in this collection, not proof of absence.</p>` : ""}
    ${reviewedGaps.length ? `<details class="chem-source-details"><summary>Sources checked for remaining gaps</summary>${reviewedGaps.map(evidenceBody).join("")}</details>` : ""}
  </details>`;
}
function bindChemistryLinks(root) {
  bindStudyLinks(root);
  root.querySelectorAll('[data-chem-group]').forEach(button => button.addEventListener('click', () => {
    document.getElementById('compound-search').value = '';
    document.getElementById('compound-category-filter').value = 'group:' + button.dataset.chemGroup;
    document.getElementById('compound-list-view').classList.remove('hidden');
    document.getElementById('compound-detail').classList.add('hidden');
    switchTab('compounds');
    routeUrl('compounds');
    renderCompounds();
    document.getElementById('compound-category-filter').focus();
  }));
}

// Disclosures can change chart width and iframe content height after first render.
function refreshLayout() {
  requestAnimationFrame(() => {
    charts.forEach(chart => { if (!chart.isDisposed()) chart.resize(); });
    if (window.self !== window.top) {
      window.parent.postMessage({ type: 'sunnys-terpene-lab:height', height: Math.ceil(document.body.getBoundingClientRect().height) }, '*');
    }
  });
}
document.addEventListener('toggle', refreshLayout, true);
window.addEventListener('resize', refreshLayout);
if ('ResizeObserver' in window) new ResizeObserver(refreshLayout).observe(document.body);
