/* Terpene Lab - UI logic. Reads TERPENE_DATA from data.js.
   Views: Oils, Compounds, Matrix, Domains, Network, Studies. */

const D = TERPENE_DATA;
const oilById = Object.fromEntries(D.oils.map(o => [o.id, o]));
const compoundById = Object.fromEntries(D.compounds.map(c => [c.id, c]));
const domainByType = Object.fromEntries(D.categories.map(c => [c.type, c]));

const LEVEL_ORDER = { clinical: 0, preclinical: 1, laboratory: 2, review: 3 };
const LEVEL_LETTER = { clinical: "C", preclinical: "P", laboratory: "L", review: "R" };
const LEVEL_LABEL = {
  clinical: "Clinical",
  preclinical: "Preclinical",
  laboratory: "Laboratory",
  review: "Review"
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
  return s ? s.label : sub;
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
  studiesForOil(oilId).forEach(s => s.categories.forEach(c => set.add(c.type)));
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
  return D.oils
    .map(o => {
      const hit = o.constituents.find(c => c.compoundId === compoundId);
      return hit ? { oil: o, range: hit.range } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.range.max - a.range.max);
}
function topConstituent(oil) {
  if (!oil.constituents.length) return null;
  const c = oil.constituents.reduce((a, b) => (b.range.max > a.range.max ? b : a));
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
  });
});
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
    document.getElementById(btn.dataset.backto).classList.remove("hidden");
    btn.closest(".detail, #domain-detail").classList.add("hidden");
    disposeCharts();
  });
});

/* ---------- study cards ---------- */
function evidenceBadge(s) {
  return `<span class="lvl lvl-${s.evidenceLevel}">${LEVEL_LETTER[s.evidenceLevel]}</span>
    <span class="lvl-text">${LEVEL_LABEL[s.evidenceLevel]} &middot; ${esc(prettyStudyType(s.studyType))} &middot; ${esc(s.context)}</span>`;
}
function prettyStudyType(t) {
  return t.split("-").join(" ");
}
function categoryChips(s) {
  return s.categories.map(c => {
    const topic = c.topic ? " / " + esc(c.topic) : "";
    return `<span class="catchip">${esc(domainByType[c.type] ? domainByType[c.type].label : c.type)}: ${esc(subLabel(c.type, c.subcategory))}${topic}</span>`;
  }).join("");
}
function studyCard(s) {
  const oilTags = s.oilIds.map(id => oilById[id]
    ? `<button class="taglink" data-goto-oil="${id}">${esc(oilById[id].name)}</button>` : "").join("");
  const compTags = s.compoundIds.map(id => compoundById[id]
    ? `<button class="taglink" data-goto-compound="${id}">${esc(compoundById[id].name)}</button>` : "").join("");
  return `<div class="study">
    <div class="study-badge">${evidenceBadge(s)}</div>
    <h4>${esc(s.title)}</h4>
    <p class="cite">${esc(s.authors)} &middot; ${esc(s.journal)} &middot; ${s.year}${s.pubmedId ? " &middot; PMID " + esc(s.pubmedId) : ""}</p>
    <p class="finding"><span class="finding-label">Finding</span>${esc(s.finding)}</p>
    ${s.limitations ? `<p class="limitations"><span class="finding-label">Limitations</span>${esc(s.limitations)}</p>` : ""}
    <div class="catchips">${categoryChips(s)}</div>
    <div class="tags">${oilTags}${compTags}<a class="ext" href="${esc(s.url)}" target="_blank" rel="noopener">Read paper</a></div>
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
  // rows: [{name, min, max, color?, id?}]
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
          const r = rows[rows.length - 1 - p.dataIndex];
          return r.min + "-" + r.max + "%";
        }
      }
    }],
    tooltip: {
      trigger: "item",
      formatter: p => {
        const r = rows[rows.length - 1 - p.dataIndex];
        return `${esc(r.name)}: <b>${r.min}-${r.max}%</b>${onClick ? "<br>Click to drill down" : ""}`;
      }
    }
  });
  if (onClick) chart.on("click", p => {
    const r = rows[rows.length - 1 - p.dataIndex];
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
  plantWrap.innerHTML = D.oils.map(o =>
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
      <span class="compound-copy"><strong>${esc(comp.name)}</strong><small>${esc(comp.formula)} · ${esc(comp.chemicalClass)} · ${k.range.min}-${k.range.max}%</small></span>
    </button>`;
  }).join("");
  compoundWrap.querySelectorAll("[data-path-compound]").forEach(b =>
    b.addEventListener("click", () => showCompound(b.dataset.pathCompound)));

  const linked = studiesForOil(oilId);
  const groups = [];
  D.categories.forEach(domain => {
    domain.subcategories.forEach(sub => {
      const ss = linked.filter(s => s.categories.some(c => c.type === domain.type && c.subcategory === sub.id));
      if (ss.length) groups.push({ domain, sub, studies: ss });
    });
  });
  groups.sort((x,y) => y.studies.length - x.studies.length);

  const useWrap = document.getElementById("pathway-uses");
  useWrap.innerHTML = groups.length ? groups.map((g,i) => {
    const lvl = strongestLevel(g.studies);
    return `<button class="path-node use-node" data-path-use="${i}">
      <span><strong>${esc(g.sub.label)}</strong><small>${esc(g.domain.label)} · ${g.studies.length} paper${g.studies.length === 1 ? "" : "s"}</small></span>
      ${lvl ? `<span class="lvl lvl-${lvl} sm">${LEVEL_LETTER[lvl]}</span>` : ""}
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
  const oils = D.oils.filter(o =>
    o.name.toLowerCase().includes(q) || o.latinName.toLowerCase().includes(q));
  document.getElementById("oil-count").textContent = oils.length + " oils";
  grid.innerHTML = oils.map(o => {
    const top = topConstituent(o);
    const n = studiesForOil(o.id).length;
    const domains = domainsForOil(o.id);
    return `<div class="card" data-oil="${o.id}">
      <div class="card-top">
        <div class="swatch" style="background:${o.color}"></div>
        <div><h3>${esc(o.name)}</h3><p class="latin">${esc(o.latinName)}</p></div>
      </div>
      <p class="sub">${esc(o.plantPart)} &middot; ${esc(o.extraction)}</p>
      ${top ? `<p class="top-terpene">Top compound: <b>${esc(top.compound.name)}</b> ${top.range.min}-${top.range.max}%</p>` : ""}
      <p class="sub">${n} stud${n === 1 ? "y" : "ies"}${domains.length ? " &middot; " + domains.map(d => esc(domainByType[d].label)).join(", ") : ""}</p>
    </div>`;
  }).join("") || `<p class="empty">No oils match.</p>`;
  grid.querySelectorAll(".card").forEach(c =>
    c.addEventListener("click", () => showOil(c.dataset.oil)));
}
document.getElementById("oil-search").addEventListener("input", e => renderOils(e.target.value));

function showOil(id) {
  const o = oilById[id];
  if (!o) return;
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
    .map(c => ({
      id: c.compoundId,
      name: compoundById[c.compoundId] ? compoundById[c.compoundId].name : c.compoundId,
      min: c.range.min, max: c.range.max
    }))
    .sort((a, b) => b.max - a.max);
  rangeBarChart(document.getElementById("oil-chart"), rows, o.color, showCompound);

  const chips = document.getElementById("oil-compound-chips");
  chips.innerHTML = rows.map(r =>
    `<button class="chip" data-c="${r.id}">${esc(r.name)} <b>${r.min}-${r.max}%</b></button>`).join("");
  chips.querySelectorAll(".chip").forEach(c =>
    c.addEventListener("click", () => showCompound(c.dataset.c)));

  const studies = studiesForOil(id);
  const domains = domainsForOil(id);
  document.getElementById("oil-domains").innerHTML = domains.length
    ? domains.map(d => `<span class="catchip">${esc(domainByType[d].label)} <b>${studies.filter(s => s.categories.some(c => c.type === d)).length}</b></span>`).join("")
    : `<span class="catchip dim">No categorized studies yet</span>`;
  const ec = evidenceCounts(studies);
  document.getElementById("oil-evidence").innerHTML =
    `<span class="evlabel">Evidence:</span> ` +
    ["clinical", "preclinical", "laboratory", "review"]
      .map(l => `<span class="lvl lvl-${l}">${LEVEL_LETTER[l]}</span> ${ec[l]}`)
      .join(" &nbsp; ");

  const sWrap = document.getElementById("oil-studies");
  sWrap.innerHTML = studies.length ? studies.map(studyCard).join("")
    : `<p class="empty">No studies linked yet.</p>`;
  bindStudyLinks(sWrap);
}

/* ================= COMPOUND EXPLORER ================= */
function renderCompounds() {
  const q = document.getElementById("compound-search").value.toLowerCase();
  const cls = document.getElementById("compound-class-filter").value;
  const grid = document.getElementById("compound-grid");
  const list = D.compounds.filter(c =>
    (!cls || c.chemicalClass === cls) &&
    (c.name.toLowerCase().includes(q) || c.formula.toLowerCase().includes(q)));
  document.getElementById("compound-count").textContent = list.length + " compounds";
  grid.innerHTML = list.map(c => {
    const n = oilsWithCompound(c.id).length;
    const s = studiesForCompound(c.id).length;
    return `<div class="card compound-card" data-c="${c.id}">
      ${c.id === "limonene" ? '<div class="molecule3d" id="limonene-3d" aria-label="Interactive 3D model of limonene"><span>3D · drag to rotate</span></div>' : ""}
      <h3>${esc(c.name)}</h3>
      <div class="compound-chemline">
        <span class="molecule-glyph molecule-glyph-large" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        <span class="formula-chip">${formatFormula(c.formula)}</span>
      </div>
      <p class="sub">${esc(c.chemicalClass)}</p>
      <p class="sub">${n} oil${n === 1 ? "" : "s"} &middot; ${s} stud${s === 1 ? "y" : "ies"}</p>
    </div>`;
  }).join("") || `<p class="empty">No compounds match.</p>`;
  grid.querySelectorAll(".card").forEach(el =>
    el.addEventListener("click", () => showCompound(el.dataset.c)));
  requestAnimationFrame(initLimonene3D);
}
document.getElementById("compound-search").addEventListener("input", renderCompounds);
document.getElementById("compound-class-filter").addEventListener("change", renderCompounds);

/* ---------- 3D molecule prototype: limonene ---------- */
let limonene3D = null;
function initLimonene3D() {
  const host = document.getElementById("limonene-3d");
  if (!host || limonene3D || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 8.2);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.prepend(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.AmbientLight(0xffffff, 1.7));
  const light = new THREE.DirectionalLight(0xffffff, 2.2);
  light.position.set(4, 5, 7); scene.add(light);
  const rim = new THREE.DirectionalLight(0x72b89a, 1.6);
  rim.position.set(-5, -2, 4); scene.add(rim);

  // Compact 3D ball-and-stick representation of C10H16 limonene.
  // Carbon skeleton coordinates preserve the cyclohex-1-ene ring,
  // methyl substituent and isopropenyl side chain. Hydrogens are omitted
  // at card size to keep the model readable.
  const atoms = [
    [-1.45, .55, .18],[-.65,1.35,-.15],[.55,1.22,.18],[1.28,.25,-.12],
    [.72,-.95,.2],[-.55,-1.15,-.18],[-1.75,1.65,.3],[1.7,-1.45,-.2],
    [2.8,-1.05,.25],[1.55,-2.65,.2]
  ];
  const bonds = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[4,7],[7,8],[7,9]];
  const atomGeo = new THREE.SphereGeometry(.24, 20, 14);
  const atomMat = new THREE.MeshStandardMaterial({color:0x72b89a,roughness:.28,metalness:.18});
  atoms.forEach(p => { const m=new THREE.Mesh(atomGeo,atomMat);m.position.set(...p);group.add(m); });
  const bondMat = new THREE.MeshStandardMaterial({color:0xd9e7e1,roughness:.4,metalness:.08});
  function bond(a,b,offset=0){
    const p1=new THREE.Vector3(...atoms[a]), p2=new THREE.Vector3(...atoms[b]);
    const mid=p1.clone().add(p2).multiplyScalar(.5), len=p1.distanceTo(p2);
    const g=new THREE.CylinderGeometry(.075,.075,len,10), m=new THREE.Mesh(g,bondMat);
    m.position.copy(mid); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),p2.clone().sub(p1).normalize());
    if(offset){ const side=new THREE.Vector3(0,0,1).applyQuaternion(m.quaternion).multiplyScalar(offset);m.position.add(side); }
    group.add(m);
  }
  bonds.forEach(([a,b])=>bond(a,b));
  // Two double bonds in limonene.
  bond(1,2,.14); bond(7,8,.14);
  group.rotation.set(-.35,.45,.15);

  let dragging=false,lastX=0,lastY=0,visible=true;
  renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);e.stopPropagation();});
  renderer.domElement.addEventListener("pointermove",e=>{if(!dragging)return;group.rotation.y+=(e.clientX-lastX)*.012;group.rotation.x+=(e.clientY-lastY)*.012;lastX=e.clientX;lastY=e.clientY;e.stopPropagation();});
  renderer.domElement.addEventListener("pointerup",e=>{dragging=false;e.stopPropagation();});
  renderer.domElement.addEventListener("click",e=>e.stopPropagation());

  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:.05});io.observe(host);
  function frame(){ requestAnimationFrame(frame); if(!visible)return; if(!dragging)group.rotation.y+=.004; renderer.render(scene,camera); }
  frame();
  limonene3D={renderer,group,host};
}

function showCompound(id) {
  const c = compoundById[id];
  if (!c) return;
  switchTab("compounds");
  document.getElementById("compound-list-view").classList.add("hidden");
  document.getElementById("compound-detail").classList.remove("hidden");
  document.getElementById("compound-name").textContent = c.name;
  document.getElementById("compound-formula").innerHTML = formatFormula(c.formula);
  document.getElementById("compound-class").textContent = c.chemicalClass;
  document.getElementById("compound-desc").textContent = c.description;
  document.getElementById("compound-aroma").textContent = c.aroma.join(", ");

  const rows = oilsWithCompound(id).map(r => ({
    id: r.oil.id, name: r.oil.name,
    min: r.range.min, max: r.range.max, color: r.oil.color
  }));
  if (rows.length) rangeBarChart(document.getElementById("compound-oils-chart"), rows, "#5fc6b5", showOil);
  else document.getElementById("compound-oils-chart").innerHTML = `<p class="empty">No oils reference this compound yet.</p>`;

  const studies = studiesForCompound(id);
  const sWrap = document.getElementById("compound-studies");
  sWrap.innerHTML = studies.length ? studies.map(studyCard).join("")
    : `<p class="empty">No studies linked yet.</p>`;
  bindStudyLinks(sWrap);
}

/* ================= EVIDENCE MATRIX ================= */
function matrixCell(oilId, domainType) {
  return D.studies.filter(s =>
    s.oilIds.includes(oilId) && s.categories.some(c => c.type === domainType));
}
function renderMatrix() {
  const table = document.getElementById("matrix-table");
  const domains = D.categories;
  const maxCount = Math.max(1, ...D.oils.flatMap(o =>
    domains.map(d => matrixCell(o.id, d.type).length)));
  let html = `<thead><tr><th></th>${domains.map(d => `<th>${esc(d.label)}</th>`).join("")}</tr></thead><tbody>`;
  D.oils.forEach(o => {
    html += `<tr><th class="rowlabel"><span class="swatch sm" style="background:${o.color}"></span>${esc(o.name)}</th>`;
    domains.forEach(d => {
      const studies = matrixCell(o.id, d.type);
      const n = studies.length;
      const alpha = n ? 0.15 + 0.75 * (n / maxCount) : 0.04;
      const lvl = strongestLevel(studies);
      html += `<td><button class="cell" data-oil="${o.id}" data-domain="${d.type}"
        style="background:rgba(232,160,32,${alpha.toFixed(2)})" ${n ? "" : "disabled"}>
        <span class="cell-n">${n}</span>${lvl ? `<span class="lvl lvl-${lvl} sm">${LEVEL_LETTER[lvl]}</span>` : ""}
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

/* ================= DOMAIN EXPLORER ================= */
let domainState = { type: null, sub: null };
function domainStudyCount(type, sub) {
  return D.studies.filter(s => s.categories.some(c =>
    c.type === type && (!sub || c.subcategory === sub))).length;
}
function renderDomainTiles() {
  const wrap = document.getElementById("domain-tiles");
  wrap.classList.remove("hidden");
  document.getElementById("domain-detail").classList.add("hidden");
  wrap.innerHTML = D.categories.map(d => {
    const n = domainStudyCount(d.type);
    return `<button class="domain-tile" data-domain="${d.type}">
      <h3>${esc(d.label)}</h3>
      <p class="domain-n">${n} stud${n === 1 ? "y" : "ies"}</p>
      <p class="sub">${d.subcategories.map(s => esc(s.label)).slice(0, 5).join(" &middot; ")}${d.subcategories.length > 5 ? " &middot; ..." : ""}</p>
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
    d.label + (sub ? " / " + subLabel(type, sub) : "");

  const subs = document.getElementById("domain-subs");
  subs.innerHTML = `<button class="chip${!sub ? " on" : ""}" data-sub="">All</button>` +
    d.subcategories.map(s =>
      `<button class="chip${sub === s.id ? " on" : ""}" data-sub="${s.id}">${esc(s.label)} <b>${domainStudyCount(type, s.id)}</b></button>`).join("");
  subs.querySelectorAll(".chip").forEach(c =>
    c.addEventListener("click", () => showDomain(type, c.dataset.sub || null)));

  const match = s => s.categories.some(c =>
    c.type === type && (!sub || c.subcategory === sub));
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
  D.oils.forEach(o => nodes.push({
    id: "oil:" + o.id, name: o.name, category: 0,
    symbolSize: 26, itemStyle: { color: o.color }
  }));
  D.compounds.forEach(c => {
    const n = oilsWithCompound(c.id).length;
    if (!n) return;
    nodes.push({
      id: "compound:" + c.id, name: c.name, category: 1,
      symbolSize: 12 + n * 4, itemStyle: { color: "#5fc6b5" }
    });
  });
  D.oils.forEach(o => o.constituents.forEach(k => {
    if (compoundById[k.compoundId] && nodes.some(n => n.id === "compound:" + k.compoundId))
      links.push({ source: "oil:" + o.id, target: "compound:" + k.compoundId });
  }));
  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      formatter: p => p.dataType === "edge"
        ? `${esc(p.data.source.replace("oil:", ""))} contains ${esc(p.data.target.replace("compound:", ""))}`
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
  const list = D.studies.filter(s =>
    (!oilF || s.oilIds.includes(oilF)) &&
    (!compF || s.compoundIds.includes(compF)) &&
    (!domF || s.categories.some(c => c.type === domF)) &&
    (!lvlF || s.evidenceLevel === lvlF) &&
    (!typeF || s.studyType === typeF) &&
    (s.title.toLowerCase().includes(q) || s.finding.toLowerCase().includes(q)));
  document.getElementById("study-count").textContent = list.length + " studies";
  const wrap = document.getElementById("study-list");
  wrap.innerHTML = list.map(studyCard).join("") || `<p class="empty">No studies match.</p>`;
  bindStudyLinks(wrap);
}
["study-search", "study-oil-filter", "study-compound-filter",
 "study-domain-filter", "study-level-filter", "study-type-filter"
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
  document.getElementById("compound-class-filter").innerHTML =
    `<option value="">All classes</option>` + classes.map(c => `<option>${esc(c)}</option>`).join("");
  document.getElementById("study-oil-filter").innerHTML =
    `<option value="">All oils</option>` + D.oils.map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join("");
  document.getElementById("study-compound-filter").innerHTML =
    `<option value="">All compounds</option>` + D.compounds.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  document.getElementById("study-domain-filter").innerHTML =
    `<option value="">All domains</option>` + D.categories.map(d => `<option value="${d.type}">${esc(d.label)}</option>`).join("");
  const types = [...new Set(D.studies.map(s => s.studyType))].sort();
  document.getElementById("study-type-filter").innerHTML =
    `<option value="">All study types</option>` + types.map(t => `<option value="${t}">${esc(prettyStudyType(t))}</option>`).join("");
  renderOils("");
  renderCompounds();
  renderStudies();

  // Explicitly initialize whichever tab the HTML marks active. This prevents
  // the first view from depending on a user switching tabs.
  const active = document.querySelector(".tab.active");
  if (active) switchTab(active.dataset.tab);
  const activeTab = document.querySelector(".tab.active");
  if (activeTab) switchTab(activeTab.dataset.tab);
})();