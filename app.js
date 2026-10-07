/* Terpene Lab - UI logic. Reads TERPENE_DATA from data.js. */

const D = TERPENE_DATA;
const oilById = Object.fromEntries(D.oils.map(o => [o.id, o]));
const terpById = Object.fromEntries(D.terpenes.map(t => [t.id, t]));

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

/* ---------- tabs ---------- */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.getElementById("tab-" + tab).classList.add("active");
    disposeCharts();
    if (tab === "network") renderNetwork();
  });
});

document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.back;
    document.getElementById("oil-detail") && document.getElementById("oil-detail").classList.add("hidden");
    document.getElementById("terpene-detail") && document.getElementById("terpene-detail").classList.add("hidden");
    document.getElementById("oil-grid").classList.remove("hidden");
    document.getElementById("terpene-grid").classList.remove("hidden");
    document.querySelector(".toolbar").style.display = "";
    disposeCharts();
  });
});

/* ---------- oils ---------- */
function topTerpene(oil) {
  if (!oil.terpenes.length) return null;
  const t = oil.terpenes.reduce((a, b) => (b.percent > a.percent ? b : a));
  return { terp: terpById[t.terpeneId], percent: t.percent };
}

function renderOils(filter) {
  const q = (filter || "").toLowerCase();
  const grid = document.getElementById("oil-grid");
  const oils = D.oils.filter(o =>
    o.name.toLowerCase().includes(q) || o.latinName.toLowerCase().includes(q));
  document.getElementById("oil-count").textContent = oils.length + " oils";
  grid.innerHTML = oils.map(o => {
    const top = topTerpene(o);
    return `<div class="card" data-oil="${o.id}">
      <div class="card-top">
        <div class="swatch" style="background:${o.color}"></div>
        <div><h3>${esc(o.name)}</h3><p class="latin">${esc(o.latinName)}</p></div>
      </div>
      <p class="sub">${esc(o.plantPart)} &middot; ${esc(o.aroma)}</p>
      ${top ? `<p class="top-terpene">Top terpene: <b>${esc(top.terp.name)}</b> ${top.percent}%</p>` : ""}
    </div>`;
  }).join("") || `<p class="empty">No oils match.</p>`;
  grid.querySelectorAll(".card").forEach(c =>
    c.addEventListener("click", () => showOil(c.dataset.oil)));
}

document.getElementById("oil-search").addEventListener("input", e => renderOils(e.target.value));

function studyCard(s) {
  const oilTags = s.oilIds.map(id => oilById[id] ? `<button class="taglink" data-goto-oil="${id}">${esc(oilById[id].name)}</button>` : "").join("");
  const terpTags = s.terpeneIds.map(id => terpById[id] ? `<button class="taglink" data-goto-terp="${id}">${esc(terpById[id].name)}</button>` : "").join("");
  return `<div class="study">
    <h4>${esc(s.title)}</h4>
    <p class="cite">${esc(s.authors)} &middot; ${esc(s.journal)} &middot; ${s.year}</p>
    <p class="finding"><span class="finding-label">Finding</span>${esc(s.finding)}</p>
    <div class="tags">${oilTags}${terpTags}<a class="ext" href="${esc(s.url)}" target="_blank" rel="noopener">Read paper</a></div>
  </div>`;
}

function bindStudyLinks(root) {
  root.querySelectorAll("[data-goto-oil]").forEach(b =>
    b.addEventListener("click", () => showOil(b.dataset.gotoOil)));
  root.querySelectorAll("[data-goto-terp]").forEach(b =>
    b.addEventListener("click", () => showTerpene(b.dataset.gotoTerp)));
}

function studiesForOil(oilId) { return D.studies.filter(s => s.oilIds.includes(oilId)); }
function studiesForTerpene(terpId) { return D.studies.filter(s => s.terpeneIds.includes(terpId)); }

function showOil(id) {
  const o = oilById[id];
  if (!o) return;
  document.querySelector('[data-tab="oils"]').click();
  document.getElementById("oil-grid").classList.add("hidden");
  document.getElementById("oil-detail").classList.remove("hidden");
  document.getElementById("oil-swatch").style.background = o.color;
  document.getElementById("oil-name").textContent = o.name;
  document.getElementById("oil-latin").textContent = o.latinName;
  document.getElementById("oil-desc").textContent = o.description;
  document.getElementById("oil-part").textContent = o.plantPart;
  document.getElementById("oil-aroma").textContent = o.aroma;
  document.getElementById("oil-uses").innerHTML = o.uses.map(u => `<li>${esc(u)}</li>`).join("");
  document.getElementById("oil-safety").textContent = o.safety;

  const rows = o.terpenes
    .map(t => ({ name: terpById[t.terpeneId] ? terpById[t.terpeneId].name : t.terpeneId, id: t.terpeneId, percent: t.percent }))
    .sort((a, b) => b.percent - a.percent);

  const chartEl = document.getElementById("oil-chart");
  const chart = echarts.init(chartEl);
  charts.push(chart);
  chart.setOption({
    backgroundColor: "transparent",
    grid: { left: 8, right: 60, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "value", max: 100, axisLabel: { color: "#9aa7bd", formatter: "{value}%" }, splitLine: { lineStyle: { color: "#1b2740" } } },
    yAxis: { type: "category", data: rows.map(r => r.name).reverse(), axisLabel: { color: "#f2ead8" }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: "bar",
      data: rows.map(r => r.percent).reverse(),
      itemStyle: { color: o.color, borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: "right", color: "#f2ead8", formatter: "{c}%" },
      barWidth: "55%"
    }],
    tooltip: { trigger: "item", formatter: p => `${esc(p.name)}: <b>${p.value}%</b><br>Click to drill down` }
  });
  chart.on("click", p => {
    const row = rows[p.dataIndex];
    if (row) showTerpene(row.id);
  });

  const chips = document.getElementById("oil-terpene-chips");
  chips.innerHTML = rows.map(r =>
    `<button class="chip" data-terp="${r.id}">${esc(r.name)} <b>${r.percent}%</b></button>`).join("");
  chips.querySelectorAll(".chip").forEach(c =>
    c.addEventListener("click", () => showTerpene(c.dataset.terp)));

  const sWrap = document.getElementById("oil-studies");
  const studies = studiesForOil(id);
  sWrap.innerHTML = studies.length
    ? studies.map(studyCard).join("")
    : `<p class="empty">No studies linked yet.</p>`;
  bindStudyLinks(sWrap);
}

/* ---------- terpenes ---------- */
function renderTerpenes() {
  const q = document.getElementById("terpene-search").value.toLowerCase();
  const cls = document.getElementById("terpene-class-filter").value;
  const grid = document.getElementById("terpene-grid");
  const list = D.terpenes.filter(t =>
    (!cls || t.class === cls) &&
    (t.name.toLowerCase().includes(q) || t.formula.toLowerCase().includes(q)));
  document.getElementById("terpene-count").textContent = list.length + " terpenes";
  grid.innerHTML = list.map(t => {
    const n = D.oils.filter(o => o.terpenes.some(x => x.terpeneId === t.id)).length;
    return `<div class="card" data-terp="${t.id}">
      <h3>${esc(t.name)}</h3>
      <p style="margin:8px 0"><span class="formula-chip">${esc(t.formula)}</span></p>
      <p class="sub">${esc(t.class)} &middot; ${n} oil${n === 1 ? "" : "s"}</p>
    </div>`;
  }).join("") || `<p class="empty">No terpenes match.</p>`;
  grid.querySelectorAll(".card").forEach(c =>
    c.addEventListener("click", () => showTerpene(c.dataset.terp)));
}

document.getElementById("terpene-search").addEventListener("input", renderTerpenes);
document.getElementById("terpene-class-filter").addEventListener("change", renderTerpenes);

function oilsWithTerpene(terpId) {
  return D.oils
    .map(o => {
      const hit = o.terpenes.find(t => t.terpeneId === terpId);
      return hit ? { oil: o, percent: hit.percent } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.percent - a.percent);
}

function showTerpene(id) {
  const t = terpById[id];
  if (!t) return;
  document.querySelector('[data-tab="terpenes"]').click();
  document.getElementById("terpene-grid").classList.add("hidden");
  document.getElementById("terpene-detail").classList.remove("hidden");
  document.getElementById("terpene-name").textContent = t.name;
  document.getElementById("terpene-formula").textContent = t.formula;
  document.getElementById("terpene-class").textContent = t.class;
  document.getElementById("terpene-desc").textContent = t.description;
  document.getElementById("terpene-aroma").textContent = t.aroma;

  const rows = oilsWithTerpene(id);
  const chartEl = document.getElementById("terpene-oils-chart");
  const chart = echarts.init(chartEl);
  charts.push(chart);
  chart.setOption({
    backgroundColor: "transparent",
    grid: { left: 8, right: 60, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "value", max: 100, axisLabel: { color: "#9aa7bd", formatter: "{value}%" }, splitLine: { lineStyle: { color: "#1b2740" } } },
    yAxis: { type: "category", data: rows.map(r => r.oil.name).reverse(), axisLabel: { color: "#f2ead8" }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: "bar",
      data: rows.map(r => ({ value: r.percent, itemStyle: { color: r.oil.color } })).reverse(),
      label: { show: true, position: "right", color: "#f2ead8", formatter: "{c}%" },
      barWidth: "55%",
      itemStyle: { borderRadius: [0, 4, 4, 0] }
    }],
    tooltip: { trigger: "item", formatter: p => `${esc(p.name)}: <b>${p.value}%</b><br>Click to open oil` }
  });
  chart.on("click", p => {
    const row = rows[p.dataIndex];
    if (row) showOil(row.oil.id);
  });

  const sWrap = document.getElementById("terpene-studies");
  const studies = studiesForTerpene(id);
  sWrap.innerHTML = studies.length
    ? studies.map(studyCard).join("")
    : `<p class="empty">No studies linked yet.</p>`;
  bindStudyLinks(sWrap);
}

/* ---------- network ---------- */
function renderNetwork() {
  const el = document.getElementById("network-chart");
  const chart = echarts.init(el);
  charts.push(chart);

  const nodes = [];
  const links = [];
  D.oils.forEach(o => nodes.push({
    id: "oil:" + o.id, name: o.name, category: 0,
    symbolSize: 26, itemStyle: { color: o.color }
  }));
  D.terpenes.forEach(t => {
    const n = oilsWithTerpene(t.id).length;
    if (!n) return;
    nodes.push({
      id: "terp:" + t.id, name: t.name, category: 1,
      symbolSize: 12 + n * 4, itemStyle: { color: "#5fc6b5" }
    });
  });
  D.oils.forEach(o => o.terpenes.forEach(t => {
    if (terpById[t.terpeneId] && nodes.some(n => n.id === "terp:" + t.terpeneId))
      links.push({ source: "oil:" + o.id, target: "terp:" + t.terpeneId, value: t.percent });
  }));

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: { formatter: p => p.dataType === "edge"
      ? `${esc(p.data.source.replace("oil:",""))} to ${esc(p.data.target.replace("terp:",""))}: <b>${p.data.value}%</b>`
      : esc(p.name) },
    legend: [{ data: ["Oils", "Terpenes"], textStyle: { color: "#9aa7bd" }, bottom: 0 }],
    series: [{
      type: "graph",
      layout: "force",
      data: nodes,
      links: links,
      categories: [{ name: "Oils" }, { name: "Terpenes" }],
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
    else showTerpene(id);
  });
}

/* ---------- studies ---------- */
function renderStudies() {
  const q = document.getElementById("study-search").value.toLowerCase();
  const oilF = document.getElementById("study-oil-filter").value;
  const terpF = document.getElementById("study-terpene-filter").value;
  const list = D.studies.filter(s =>
    (!oilF || s.oilIds.includes(oilF)) &&
    (!terpF || s.terpeneIds.includes(terpF)) &&
    (s.title.toLowerCase().includes(q) || s.finding.toLowerCase().includes(q)));
  document.getElementById("study-count").textContent = list.length + " studies";
  const wrap = document.getElementById("study-list");
  wrap.innerHTML = list.map(studyCard).join("") || `<p class="empty">No studies match.</p>`;
  bindStudyLinks(wrap);
}

document.getElementById("study-search").addEventListener("input", renderStudies);
document.getElementById("study-oil-filter").addEventListener("change", renderStudies);
document.getElementById("study-terpene-filter").addEventListener("change", renderStudies);

/* ---------- init ---------- */
(function init() {
  const classes = [...new Set(D.terpenes.map(t => t.class))].sort();
  document.getElementById("terpene-class-filter").innerHTML =
    `<option value="">All classes</option>` + classes.map(c => `<option>${esc(c)}</option>`).join("");
  document.getElementById("study-oil-filter").innerHTML =
    `<option value="">All oils</option>` + D.oils.map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join("");
  document.getElementById("study-terpene-filter").innerHTML =
    `<option value="">All terpenes</option>` + D.terpenes.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
  renderOils("");
  renderTerpenes();
  renderStudies();
})();
