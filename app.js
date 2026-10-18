/* Terpene Lab - UI logic. Reads TERPENE_DATA from data.js.
   Views: Oils, Compounds, Matrix, Domains, Network, Studies. */

const D = TERPENE_DATA;
const oilById = Object.fromEntries(D.oils.map(o => [o.id, o]));
const oilsByName = [...D.oils].sort((a, b) => a.name.localeCompare(b.name));
const compoundById = Object.fromEntries(D.compounds.map(c => [c.id, c]));
// Display the question each paper addresses without changing its stored taxonomy.
const BOTANICAL_LABELS = {
  composition: "Composition analysis",
  "nonvolatile-chemistry": "Flavonoid research"
};
const researchDomains = D.categories.flatMap(domain => domain.type === "botanical"
  ? domain.subcategories.map(sub => ({
      type: `${domain.type}:${sub.id}`,
      label: BOTANICAL_LABELS[sub.id] || sub.label,
      subcategories: [{ ...sub, label: BOTANICAL_LABELS[sub.id] || sub.label }]
    }))
  : [{ ...domain, label: domain.type === "sensory" ? "Aroma research" : domain.label }]);
const domainByType = Object.fromEntries([...D.categories, ...researchDomains].map(c => [c.type, c]));
// Keep older links and callers using the parent category working.
if (domainByType.botanical) domainByType.botanical = {
  ...domainByType.botanical, label: "Composition and flavonoid research"
};
function researchDomainId(category) {
  return category.type === "botanical" ? `${category.type}:${category.subcategory}` : category.type;
}
function matchesDomain(category, type) {
  return category.type === type || researchDomainId(category) === type;
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

function formatFormula(formula) {
  return esc(formula).replace(/(\d+)/g, "<sub>$1</sub>");
}

function subLabel(type, sub) {
  const d = domainByType[type];
  if (!d) return sub;
  const s = d.subcategories.find(x => x.id === sub);
  return BOTANICAL_LABELS[type === "botanical" ? sub : ""] || (s ? s.label : sub);
}

/* ---------- shared data helpers ---------- */
function studiesForOil(oilId) {
  return D.studies.filter(s => s.oilIds.includes(oilId));
}
function studiesForCompound(compoundId) {
  return D.studies.filter(s => s.compoundIds.includes(compoundId));
}
function domainsForOil(oilId) {
  const set = new Set();
  studiesForOil(oilId).forEach(s => s.categories.forEach(c => set.add(researchDomainId(c))));
  return [...set];
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
    routeUrl(tab);
  });
});

/* ---------- lightweight URL/history routing ---------- */
let routingFromHistory = false;
function routeUrl(tab, params = {}, replace = false) {
  if (routingFromHistory) return;
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  if (tab !== "blend") url.searchParams.delete("recipe");
  ["oil","compound","domain","sub"].forEach(k => {
    if (params[k]) url.searchParams.set(k, params[k]);
    else url.searchParams.delete(k);
  });
  history[replace ? "replaceState" : "pushState"]({ tab, ...params }, "", url);
}
function applyRoute() {
  const p = new URLSearchParams(location.search);
  const tab = p.get("tab") || "oils";
  routingFromHistory = true;
  switchTab(tab);
  const oil = p.get("oil"), compound = p.get("compound"), domain = p.get("domain"), sub = p.get("sub");
  if (tab === "oils" && oil && oilById[oil]) showOil(oil, true);
  else if (tab === "compounds" && compound && compoundById[compound]) showCompound(compound, true);
  else if (tab === "domains" && domain && domainByType[domain]) showDomain(domain, sub || null);
  else if (tab === "oils" || tab === "compounds") {
    const prefix = tab === "oils" ? "oil" : "compound";
    document.getElementById(prefix + "-list-view").classList.remove("hidden");
    document.getElementById(prefix + "-detail").classList.add("hidden");
    if (tab === "oils") renderOils(document.getElementById("oil-search").value);
    else renderCompounds();
  }
  routingFromHistory = false;
}
window.addEventListener("popstate", applyRoute);

function switchTab(tab) {
  document.querySelectorAll(".tab").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === tab));
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
function categoryChips(s) {
  return s.categories.map(c => {
    const topic = c.topic ? " / " + esc(c.topic) : "";
    const domain = domainByType[researchDomainId(c)];
    const label = domain ? domain.label : c.type;
    const sub = ["botanical", "sensory"].includes(c.type) ? "" : ": " + esc(subLabel(c.type, c.subcategory));
    return `<span class="catchip">${esc(label)}${sub}${topic}</span>`;
  }).join("");
}
function studyCard(s) {
  const oilTags = s.oilIds.map(id => oilById[id]
    ? `<button class="taglink" data-goto-oil="${id}">${esc(oilById[id].name)}</button>` : "").join("");
  const compTags = s.compoundIds.map(id => compoundById[id]
    ? `<button class="taglink" data-goto-compound="${id}">${esc(compoundById[id].name)}</button>` : "").join("");
  return `<div class="study">
    <div class="study-badge">${evidenceBadge(s)}</div>${s.material ? `<p class="hint">Material studied: ${esc(s.material)}</p>` : ""}
    <h4>${esc(s.title)}</h4>
    <p class="cite">${esc(s.authors)} &middot; ${esc(s.journal)} &middot; ${s.year}${s.pubmedId ? " &middot; PMID " + esc(s.pubmedId) : ""}</p>
    <p class="finding"><span class="finding-label">Finding</span>${esc(s.finding)}</p>
    ${s.limitations ? `<p class="limitations"><span class="finding-label">Limitations</span>${esc(s.limitations)}</p>` : ""}
    <div class="catchips">${categoryChips(s)}</div>
    <div class="tags">${oilTags}${compTags}<a class="ext read-paper" href="${esc(s.url)}" target="_blank" rel="noopener">Read paper</a></div>
  </div>`;
}
function bindStudyLinks(root) {
  root.querySelectorAll("[data-goto-oil]").forEach(b =>
    b.addEventListener("click", () => showOil(b.dataset.gotoOil)));
  root.querySelectorAll("[data-goto-compound]").forEach(b =>
    b.addEventListener("click", () => showCompound(b.dataset.gotoCompound)));
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

function renderPathwayForOil(oilId) {
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

  const linked = studiesForOil(oilId);
  const groups = [];
  researchDomains.forEach(domain => {
    domain.subcategories.forEach(sub => {
      const ss = linked.filter(s => s.categories.some(c => matchesDomain(c, domain.type) && c.subcategory === sub.id));
      if (ss.length) groups.push({ domain, sub, studies: ss });
    });
  });
  groups.sort((x,y) => y.studies.length - x.studies.length);

  const useWrap = document.getElementById("pathway-uses");
  useWrap.innerHTML = groups.length ? groups.map((g,i) => {
    const lvl = strongestLevel(g.studies);
    return `<button class="path-node use-node" data-path-use="${i}">
      <span><strong>${esc(g.sub.label)}</strong><small>${esc(g.domain.label)} · ${g.studies.length} paper${g.studies.length === 1 ? "" : "s"}</small></span>
      ${lvl ? `<span class="evidence-word evidence-${lvl}">${LEVEL_LABEL[lvl]}</span>` : ""}
    </button>`;
  }).join("") : `<p class="pathway-empty">No linked research yet</p>`;

  useWrap.querySelectorAll("[data-path-use]").forEach(b =>
    b.addEventListener("click", () => showPathwayEvidence(oil, groups[Number(b.dataset.pathUse)])));
  const evidence = document.getElementById("pathway-evidence");
  evidence.classList.add("hidden");
  evidence.innerHTML = "";
}

function showPathwayEvidence(oil, group) {
  if (!group) return;
  const evidence = document.getElementById("pathway-evidence");
  evidence.classList.remove("hidden");
  evidence.innerHTML = `<div class="pathway-evidence-head">
      <div><p class="eyebrow">${esc(group.domain.label)}</p><h3>${esc(oil.name)} → ${esc(group.sub.label)}</h3></div>
      <button type="button" class="back" id="pathway-close">Close</button>
    </div>
    <p class="pathway-proof-note">These papers describe research on the ingredient or its compounds. They are not evidence that a finished Sunny's Shield product produces the same effect.</p>
    ${group.studies.map(studyCard).join("")}`;
  bindStudyLinks(evidence);
  document.getElementById("pathway-close").addEventListener("click", () => evidence.classList.add("hidden"));
  evidence.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ================= OIL EXPLORER ================= */
function renderOils(filter) {
  const q = (filter || "").toLowerCase();
  const grid = document.getElementById("oil-grid");
  const domainFilter = document.getElementById("oil-domain-filter")?.value || "";
  const sort = document.getElementById("oil-sort")?.value || "az";
  const oils = D.oils.filter(o =>
    (o.name.toLowerCase().includes(q) || o.latinName.toLowerCase().includes(q)) &&
    (!domainFilter || studiesForOil(o.id).some(s => s.categories.some(c => matchesDomain(c, domainFilter))))
  ).sort((a,b) => {
    if (sort === "studies") return studiesForOil(b.id).length - studiesForOil(a.id).length || a.name.localeCompare(b.name);
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
    const n = studiesForOil(o.id).length;
    const domains = domainsForOil(o.id);
    return `<div class="card" data-oil="${o.id}" tabindex="0" role="button" aria-label="Explore ${esc(o.name)}">
      <div class="card-top">
        <div class="swatch" style="background:${o.color}"></div>
        <div><h3>${esc(o.name)}</h3><p class="latin">${esc(o.latinName)}</p></div>
      </div>
${top ? `<p class="top-terpene">Top compound: <b>${esc(top.compound.name)}</b></p>` : ""}
      <p class="sub"><strong class="study-count">${n} stud${n === 1 ? "y" : "ies"}</strong>${domains.length ? " on " + domains.map(d => esc(domainByType[d].label)).join(", ") : ""}</p>
    </div>`;
  }).join("") || `<p class="empty">No oils match.</p>`;
  grid.querySelectorAll(".card").forEach(c => {
    c.addEventListener("click", () => showOil(c.dataset.oil));
    c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showOil(c.dataset.oil); } });
  });
}
document.getElementById("oil-search").addEventListener("input", e => renderOils(e.target.value));
document.getElementById("oil-sort").addEventListener("change", () => renderOils(document.getElementById("oil-search").value));
document.getElementById("oil-domain-filter").addEventListener("change", () => renderOils(document.getElementById("oil-search").value));

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
  document.getElementById("oil-uses").innerHTML = o.uses.map(u => `<li>${esc(u)}</li>`).join("");
  document.getElementById("oil-safety").textContent = o.safety;

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
    ? domains.map(d => `<button class="catchip domain-filter-chip" data-domain-filter="${d}">${esc(domainByType[d].label)} <b>${studies.filter(s => s.categories.some(c => matchesDomain(c, d))).length}</b></button>`).join("")
    : `<span class="catchip dim">No categorized studies yet</span>`;
  document.querySelectorAll("#oil-domains [data-domain-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab("studies");
      document.getElementById("study-oil-filter").value = id;
      document.getElementById("study-domain-filter").value = btn.dataset.domainFilter;
      document.getElementById("study-compound-filter").value = "";
      document.getElementById("study-level-filter").value = "";
      document.getElementById("study-type-filter").value = "";
      document.getElementById("study-search").value = "";
      document.getElementById("study-class-filter").value = "";
      document.getElementById("study-group-filter").value = "";
      renderStudies();
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
  sWrap.innerHTML = studies.length ? studies.map(studyCard).join("")
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
  grid.innerHTML = list.map(c => {
    const n = oilsWithCompound(c.id).length;
    const s = studiesForCompound(c.id).length;
    return `<div class="card compound-card" data-c="${c.id}" tabindex="0" role="button" aria-label="Explore ${esc(c.name)}">
      ${c.showModel === false ? "" : `<div class="molecule3d" id="molecule3d-${c.id}" data-molecule-id="${c.id}" aria-label="Interactive 3D model of ${esc(c.name)}"><span>3D · drag to rotate</span></div>`}
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
  // a visual molecular model; formula and linked chemistry remain authoritative.
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
async function initMolecule3D(host) {
  if(!host || host.dataset.ready==="1") return;
  const compound=compoundById[host.dataset.moleculeId]; if(!compound)return;
  const THREE=await loadThree(); if(!THREE||!host.isConnected)return;
  host.dataset.ready="1";
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(34,1,.1,100); camera.position.z=8.6;
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.45));
  const resize=()=>{const w=Math.max(host.clientWidth,130),h=Math.max(host.clientHeight,130);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
  resize(); host.prepend(renderer.domElement); renderer.domElement.style.cssText="position:absolute;inset:0;width:100%;height:100%";
  scene.add(new THREE.AmbientLight(0xffffff,1.8)); const dl=new THREE.DirectionalLight(0xffffff,2);dl.position.set(4,5,7);scene.add(dl);
  const group=new THREE.Group();scene.add(group);const {atoms,bonds}=makePseudoStructure(compound);
  const ag=new THREE.SphereGeometry(.20,14,10),am=new THREE.MeshStandardMaterial({color:0x72b89a,roughness:.3}),bm=new THREE.MeshStandardMaterial({color:0xd9e7e1,roughness:.45});
  atoms.forEach(p=>{const m=new THREE.Mesh(ag,am);m.position.set(...p);group.add(m)});
  bonds.forEach(([a,b])=>{const p1=new THREE.Vector3(...atoms[a]),p2=new THREE.Vector3(...atoms[b]),mid=p1.clone().add(p2).multiplyScalar(.5),len=p1.distanceTo(p2),m=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,len,8),bm);m.position.copy(mid);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),p2.clone().sub(p1).normalize());group.add(m)});
  group.rotation.set(-.3,.5,.12);
  let drag=false,lx=0,ly=0,visible=true;
  renderer.domElement.addEventListener("pointerdown",e=>{drag=true;lx=e.clientX;ly=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);e.stopPropagation()});
  renderer.domElement.addEventListener("pointermove",e=>{if(!drag)return;group.rotation.y+=(e.clientX-lx)*.012;group.rotation.x+=(e.clientY-ly)*.012;lx=e.clientX;ly=e.clientY;e.stopPropagation()});
  renderer.domElement.addEventListener("pointerup",e=>{drag=false;e.stopPropagation()});renderer.domElement.addEventListener("click",e=>e.stopPropagation());
  new IntersectionObserver(x=>visible=x[0].isIntersecting,{threshold:.02}).observe(host);
  if("ResizeObserver"in window)new ResizeObserver(resize).observe(host);
  const frame=()=>{if(!host.isConnected){renderer.dispose();moleculeViewers.delete(compound.id);return}requestAnimationFrame(frame);if(visible){if(!drag)group.rotation.y+=.003;renderer.render(scene,camera)}};frame();
  moleculeViewers.set(compound.id,{renderer,host});
}
function initVisibleMolecules(){
  document.querySelectorAll(".molecule3d").forEach(host=>{
    const io=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){io.disconnect();initMolecule3D(host)}},{rootMargin:"220px"});
    io.observe(host);
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

  document.getElementById("compound-chemistry").innerHTML = `<p>${esc(c.volatility || "")} ${groupLinks(c)}</p>${sourceLinks(c.sourceIds)}`;
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

/* ================= EVIDENCE MATRIX ================= */
function matrixCell(oilId, domainType) {
  return D.studies.filter(s =>
    s.oilIds.includes(oilId) && s.categories.some(c => matchesDomain(c, domainType)));
}
function renderMatrix() {
  const table = document.getElementById("matrix-table");
  const q = (document.getElementById("matrix-search")?.value || "").trim().toLowerCase();
  const sort = document.getElementById("matrix-sort")?.value || "az";
  const domainFilter = document.getElementById("matrix-domain-filter")?.value || "";
  const domains = domainFilter ? [domainByType[domainFilter]].filter(Boolean) : researchDomains;
  const oils = D.oils.filter(o =>
    !q || o.name.toLowerCase().includes(q) || o.latinName.toLowerCase().includes(q)
  ).sort((x,y) => {
    if (sort === "studies") return studiesForOil(y.id).length - studiesForOil(x.id).length || x.name.localeCompare(y.name);
    return x.name.localeCompare(y.name);
  });
  const count = document.getElementById("matrix-count");
  if (count) count.textContent = oils.length + " plants";
  let html = `<thead><tr><th></th>${domains.map(d => `<th>${esc(d.label)}</th>`).join("")}</tr></thead><tbody>`;
  oils.forEach(o => {
    html += `<tr><th class="rowlabel"><span class="swatch sm" style="background:${o.color}"></span>${esc(o.name)}</th>`;
    domains.forEach(d => {
      const studies = matrixCell(o.id, d.type);
      const n = studies.length;
      html += `<td><button class="cell" data-oil="${o.id}" data-domain="${d.type}" ${n ? "" : "disabled"}>
        <span class="cell-n">${n}</span>
      </button></td>`;
    });
    html += `</tr>`;
  });
  table.innerHTML = html + `</tbody>`;
  table.querySelectorAll(".cell:not([disabled])").forEach(btn =>
    btn.addEventListener("click", () => {
      presetStudyFilters({ oil: btn.dataset.oil, domain: btn.dataset.domain });
      switchTab("studies");
    }));
}
["matrix-search","matrix-sort","matrix-domain-filter"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener(id === "matrix-search" ? "input" : "change", renderMatrix);
});

/* ================= DOMAIN EXPLORER ================= */
let domainState = { type: null, sub: null };
function domainStudyCount(type, sub) {
  return D.studies.filter(s => s.categories.some(c =>
    matchesDomain(c, type) && (!sub || c.subcategory === sub))).length;
}
function renderDomainTiles() {
  const wrap = document.getElementById("domain-tiles");
  wrap.classList.remove("hidden");
  document.getElementById("domain-detail").classList.add("hidden");
  wrap.innerHTML = researchDomains.map(d => {
    const n = domainStudyCount(d.type);
    return `<button class="domain-tile" data-domain="${d.type}">
      <h3>${esc(d.label)}</h3>
      <p class="domain-n">${n} stud${n === 1 ? "y" : "ies"}</p>
      ${d.subcategories.length > 1 ? `<p class="sub">${d.subcategories.map(s => esc(s.label)).slice(0, 5).join(" &middot; ")}${d.subcategories.length > 5 ? " &middot; ..." : ""}</p>` : ""}
    </button>`;
  }).join("");
  wrap.querySelectorAll(".domain-tile").forEach(b =>
    b.addEventListener("click", () => showDomain(b.dataset.domain, null)));
}
function showDomain(type, sub) {
  domainState = { type, sub };
  const d = domainByType[type];
  document.getElementById("domain-tiles").classList.add("hidden");
  const detail = document.getElementById("domain-detail");
  detail.classList.remove("hidden");
  document.getElementById("domain-name").textContent =
    d.label + (sub && subLabel(type, sub) !== d.label ? " / " + subLabel(type, sub) : "");

  const subs = document.getElementById("domain-subs");
  subs.innerHTML = d.subcategories.length > 1 ? `<button class="chip${!sub ? " on" : ""}" data-sub="">All</button>` +
    d.subcategories.map(s =>
      `<button class="chip${sub === s.id ? " on" : ""}" data-sub="${s.id}">${esc(subLabel(type, s.id))} <b>${domainStudyCount(type, s.id)}</b></button>`).join("") : "";
  subs.querySelectorAll(".chip").forEach(c =>
    c.addEventListener("click", () => showDomain(type, c.dataset.sub || null)));

  const match = s => s.categories.some(c =>
    matchesDomain(c, type) && (!sub || c.subcategory === sub));
  const studies = D.studies.filter(match);

  const oilCounts = {};
  studies.forEach(s => s.oilIds.forEach(id => { oilCounts[id] = (oilCounts[id] || 0) + 1; }));
  const oilRows = Object.entries(oilCounts)
    .map(([id, n]) => ({ oil: oilById[id], n }))
    .filter(r => r.oil)
    .sort((a, b) => b.n - a.n);
  document.getElementById("domain-oils").innerHTML = oilRows.length
    ? oilRows.map(r => `<button class="chip" data-oil="${r.oil.id}">
        <span class="swatch sm" style="background:${r.oil.color}"></span>${esc(r.oil.name)} <b>${r.n}</b></button>`).join("")
    : `<p class="empty">No oils with evidence here yet.</p>`;
  document.querySelectorAll("#domain-oils .chip").forEach(c =>
    c.addEventListener("click", () => showOil(c.dataset.oil)));

  const compCounts = {};
  studies.forEach(s => s.compoundIds.forEach(id => { compCounts[id] = (compCounts[id] || 0) + 1; }));
  const compRows = Object.entries(compCounts)
    .map(([id, n]) => ({ c: compoundById[id], n }))
    .filter(r => r.c)
    .sort((a, b) => b.n - a.n);
  document.getElementById("domain-compounds").innerHTML = compRows.length
    ? compRows.map(r => `<button class="chip" data-c="${r.c.id}">${esc(r.c.name)} <b>${r.n}</b></button>`).join("")
    : `<p class="empty">No compounds with evidence here yet.</p>`;
  document.querySelectorAll("#domain-compounds .chip").forEach(c =>
    c.addEventListener("click", () => showCompound(c.dataset.c)));

  const sWrap = document.getElementById("domain-studies");
  sWrap.innerHTML = studies.length ? studies.map(studyCard).join("")
    : `<p class="empty">No studies here yet.</p>`;
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
function presetStudyFilters(f) {
  if (f.oil !== undefined) document.getElementById("study-oil-filter").value = f.oil || "";
  if (f.domain !== undefined) document.getElementById("study-domain-filter").value = f.domain || "";
  if (f.compound !== undefined) document.getElementById("study-compound-filter").value = f.compound || "";
  renderStudies();
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
  const list = D.studies.filter(s =>
    ((!classF && !groupF) || (!classF && (s.chemicalGroups || []).includes(groupF)) || s.compoundIds.some(id => compoundById[id] && CHEMISTRY.matches(compoundById[id], "", classF, groupF))) &&
    (!oilF || s.oilIds.includes(oilF)) &&
    (!compF || s.compoundIds.includes(compF)) &&
    (!domF || s.categories.some(c => matchesDomain(c, domF))) &&
    (!lvlF || s.evidenceLevel === lvlF) &&
    (!typeF || s.studyType === typeF) &&
    ([s.title, s.finding, s.material || "", ...s.categories.map(c => [c.type, c.subcategory, c.topic, domainByType[researchDomainId(c)]?.label].join(" "))].join(" ").toLowerCase().includes(q)));
  document.getElementById("study-count").textContent = list.length + " studies";
  const wrap = document.getElementById("study-list");
  wrap.innerHTML = list.map(studyCard).join("") || `<p class="empty">No studies match.</p>`;
  bindStudyLinks(wrap);
}
["study-search", "study-oil-filter", "study-compound-filter",
 "study-domain-filter", "study-level-filter", "study-type-filter", "study-class-filter", "study-group-filter"
].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener(el.tagName === "SELECT" ? "change" : "input", renderStudies);
});

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
    `<option value="">All compounds</option>` + CHEMISTRY.compoundCategories.map(category => `<option value="${category.id}">${esc(category.label)}</option>`).join("");
  document.getElementById("study-class-filter").innerHTML =
    `<option value="">All classes</option>` + classes.map(c => `<option>${esc(c)}</option>`).join("");
  const groupOptions = `<option value="">All functional groups / families</option>` + CHEMISTRY.groups.map(g => `<option value="${g.id}">${esc(g.label)}</option>`).join("");
  document.getElementById("study-group-filter").innerHTML = groupOptions;
  document.getElementById("compound-beyond").innerHTML = beyondExplainer();
  bindChemistryLinks(document.getElementById("compound-beyond"));
  document.getElementById("study-oil-filter").innerHTML =
    `<option value="">All oils</option>` + oilsByName.map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join("");
  document.getElementById("study-compound-filter").innerHTML =
    `<option value="">All compounds</option>` + D.compounds.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  const researchOptions = researchDomains.map(d => `<option value="${d.type}">${esc(d.label)}</option>`).join("") +
    `<option value="botanical" hidden>${esc(domainByType.botanical.label)}</option>`;
  for (const id of ["study-domain-filter", "oil-domain-filter", "matrix-domain-filter"]) {
    document.getElementById(id).innerHTML = `<option value="">All research topics</option>` + researchOptions;
  }
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
  return CHEMISTRY.tags(compound).map(id => `<button class="chip" data-chem-group="${id}">${esc(CHEMISTRY.groups.find(g => g.id === id)?.label || id)}</button>`).join("");
}
function beyondExplainer() {
  return `<details class="beyond-terpenes"><summary>Beyond Terpenes: what else shapes plant chemistry?</summary>
    <p>A plant's scent is more than its terpenes. Tiny amounts of other volatile molecules can shape what we smell. Plants also contain nonvolatile compounds that belong to a different part of their chemistry.</p>
    <div class="chem-group-grid">${CHEMISTRY.groups.map(g => `<section><h4>${esc(g.label)}</h4><p>${esc(g.description)}</p><details><summary>Examples and chemistry</summary><p>${esc(g.details)}</p><div class="chips">${g.compoundIds.map(id => `<button class="chip" data-goto-compound="${id}">${esc(compoundById[id].name)}</button>`).join("")}<button class="chip" data-chem-group="${g.id}">Browse ${esc(g.label.toLowerCase())}</button></div>${sourceLinks(g.sourceIds)}</details></section>`).join("")}</div>
    <details><summary>How to read the evidence</summary><p>Functional groups overlap with primary chemical families. An aldehyde can also be a monoterpenoid. These groups are not additive slices of an oil.</p><p>Routine volatile-oil GC-MS may miss trace sulfur odorants. Sulfur-sensitive detection, GC×GC and sensory evaluation can provide different information. Typically nonvolatile flavonoids are commonly studied with LC/HPLC. Cold-pressed citrus oils can retain a nonvolatile fraction; it is shown separately from volatile fingerprints.</p><p>Published plant, oil and extract research is not testing of the finished Sunny's Shield formula. The records here are a curated selection, not exhaustive coverage.</p>${sourceLinks(['oswald-2021','oswald-2023','paryani-2024','bautista-2021'])}</details>
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
      return `<details class="chem-evidence"><summary>${esc(g.label)} <span>${[...new Set(entries.map(e => e.material))].map(esc).join("; ")}</span></summary>${entries.map(e => `<article><p class="chem-status">${evidenceStatus(e)}</p>${evidenceBody(e)}</article>`).join("")}<button class="chip" data-chem-group="${g.id}">Browse ${esc(g.label.toLowerCase())}</button></details>`;
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
