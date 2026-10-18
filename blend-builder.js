/* Blend Builder: local recipes and a Shopify handoff for manual review. */
(() => {
  'use strict';
  const E = window.BLEND_ENGINE, data = TERPENE_DATA, config = data.blendBuilder;
  const root = document.getElementById('blend-builder');
  if (!root || !E || !config) return;
  const oils = data.oils.filter(o => o.blend?.enabled);
  const byId = Object.fromEntries(oils.map(o => [o.id, o]));
  const compounds = Object.fromEntries(data.compounds.map(c => [c.id, c]));
  const qualities = config.qualities;
  const STORAGE = 'terpene-lab:blend:v1';
  const priceLabel = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(config.product.price);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
  const initial = () => ({v:1,catalogVersion:config.catalogVersion,name:'My custom blend',path:'qualities',qualityIds:[],petContext:false,oils:[]});
  let recipe = initial(), generated = false, chosenPath = false, saved = [], search = '', storageError = false;
  let lastLink = null, restoreError = '';
  try {
    const local = JSON.parse(localStorage.getItem(STORAGE) || 'null');
    if (local && Array.isArray(local.saved)) saved = local.saved.filter(s => typeof s === 'string').slice(0,12);
    if (local?.draft) {
      // Drafts may intentionally have an unfinished total; never treat them as validated recipes.
      const d = local.draft;
      if (Object.keys(d).length === 7 && ['v','catalogVersion','name','path','qualityIds','petContext','oils'].every(k => Object.hasOwn(d,k)) && d.v === 1 && d.catalogVersion === config.catalogVersion && ['qualities','oils'].includes(d.path) &&
          typeof d.name === 'string' && Array.from(d.name).length <= 60 && typeof d.petContext === 'boolean' &&
          Array.isArray(d.qualityIds) && new Set(d.qualityIds).size === d.qualityIds.length && d.qualityIds.every(id => qualities.some(q => q.id === id)) &&
          Array.isArray(d.oils) && d.oils.length <= 5 && new Set(d.oils.map(o => o.id)).size === d.oils.length &&
          d.oils.every(o => o && Object.keys(o).length === 2 && typeof o.id === 'string' && Object.hasOwn(byId,o.id) && Number.isFinite(o.percent) && o.percent >= 0 && o.percent <= 100)) {
        recipe = {...initial(),...d,qualityIds:d.path==='oils' ? [] : d.qualityIds}; chosenPath = true;
      }
    }
  } catch { storageError = true; }
  function readLink(force = false) {
    const p = new URLSearchParams(location.search), encoded = p.get('recipe');
    if (!encoded) { lastLink = null; return; }
    if (p.get('tab') !== 'blend' || (!force && encoded === lastLink)) return;
    lastLink = encoded;
    try { recipe = E.decodeRecipe(encoded,data); chosenPath = true; generated = true; restoreError = ''; }
    catch (error) { generated=false; restoreError = 'This recipe link could not be loaded. It may be damaged or use an older catalog. Your current draft has not been replaced.'; }
  }
  readLink();
  function persist() {
    try { localStorage.setItem(STORAGE,JSON.stringify({draft:recipe,saved})); storageError = false; }
    catch { storageError = true; }
    const notice = document.getElementById('blend-storage-note');
    if (notice) notice.textContent = storageError ? 'Browser storage is unavailable. Copy a share link to keep a finished recipe.' : 'Draft stays in this browser. Saved recipes need no account.';
  }
  function announce(message, error = false) {
    const el = document.getElementById('blend-status');
    el.textContent = message; el.classList.toggle('is-error',error);
  }
  function labels(oil) { return [...new Set(oil.blend.qualityMappings.filter(m => m.supportsSuggestion !== false).map(m => qualities.find(q => q.id === m.qualityId)?.label).filter(Boolean))]; }
  function total() { return Math.round(recipe.oils.reduce((sum,o) => sum + o.percent,0)*100)/100; }
  function sourceLink(source) {
    if (typeof source === 'string') source = data.sources.find(s => s.id === source) || source;
    const url = safeUrl(typeof source === 'string' ? source : source?.url);
    const text = typeof source === 'string' ? source : source?.label || source?.title || 'Source';
    return url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>` : esc(text || 'No verified data yet');
  }
  root.innerHTML = `
    <div class="blend-hero">
      <div><p class="blend-eyebrow">THE FORMULA IS YOURS</p><h2>Create a custom blend.</h2>
        <p class="blend-intro">Start with a quality or an essential oil. Explore the chemistry, shape the aroma, and see the evidence and cautions together.</p></div>
      <div class="blend-product"><span class="blend-product-size">SUNNY'S SHIELD / 8 OZ</span><strong>${esc(priceLabel)}<span> per custom blend</span></strong><p>Standard bottle, base and label.</p><span class="blend-pill">Manual review before mixing</span></div>
    </div>
    <p id="blend-link-error" class="blend-message is-error" role="alert" ${restoreError ? '' : 'hidden'}>${esc(restoreError)}</p>
    <div class="blend-step-title"><span>01</span><h3>Choose your starting point</h3></div>
    <div class="blend-paths" role="group" aria-label="Choose a starting point">
      <button type="button" data-blend-path="qualities"><span class="blend-path-kicker">QUALITIES FIRST</span><strong>Find your direction</strong><span>Explore oils linked to purported calm, focus, sleep or uplifting qualities.</span><span class="blend-path-arrow" aria-hidden="true">↗</span></button>
      <button type="button" data-blend-path="oils"><span class="blend-path-kicker">OILS FIRST</span><strong>Follow your curiosity</strong><span>Pick familiar oils, then discover their aromas, chemistry and research.</span><span class="blend-path-arrow" aria-hidden="true">↗</span></button>
    </div>
    <div id="blend-workspace" hidden>
      <div class="blend-step-title"><span>02</span><h3>Make it your own</h3><span class="blend-step-note">UP TO 5 ESSENTIAL OILS</span></div>
      <div class="blend-work-grid">
        <section class="blend-catalog" aria-labelledby="blend-catalog-title">
          <h4 id="blend-catalog-title">Explore the oils</h4>
          <div id="blend-quality-picker"><p class="blend-small">Choose purported qualities to see relevant research matches.</p><div id="blend-qualities" class="blend-quality-buttons" role="group" aria-label="Purported qualities"></div></div>
          <label class="blend-search-label" for="blend-search">Search the starter collection</label>
          <input id="blend-search" type="search" placeholder="Oil name or aroma..." autocomplete="off">
          <p id="blend-catalog-count" class="blend-small"></p><div id="blend-oil-catalog" class="blend-oil-catalog"></div>
          <p class="blend-small blend-catalog-footnote">A starter collection for exploration. Stock and suitability for the finished spray still need review.</p>
        </section>
        <section class="blend-mixer" aria-labelledby="blend-mixer-title">
          <div class="blend-mixer-top"><h4 id="blend-mixer-title">Your formula sketch</h4><span id="blend-selected-count" class="blend-small"></span></div>
          <label for="blend-name" class="blend-input-label">Recipe name</label><input id="blend-name" maxlength="120" aria-describedby="blend-name-help" value="${esc(recipe.name)}" autocomplete="off">
          <p id="blend-name-help" class="blend-small">Up to 60 characters. Recipe names are visible in shared links.</p><div id="blend-selected"></div>
          <div class="blend-total-row"><span>Oil-blend total</span><strong id="blend-total"></strong></div>
          <div id="blend-composition" class="blend-composition" aria-hidden="true"></div>
          <p id="blend-total-help" class="blend-small" aria-live="polite"></p>
          <button type="button" id="blend-normalize" class="blend-text-button">Balance to 100%</button>
          <p class="blend-proportion-note">Percentages describe the relative portions of the essential-oil blend. They are not the concentration in the finished spray or instructions for mixing a product.</p>
          <label class="blend-pets"><input type="checkbox" id="blend-pets" ${recipe.petContext ? 'checked' : ''}><span>Will be used around pets<small>Flags missing or unsuitable pet-safety data.</small></span></label>
          <p id="blend-pet-warning" class="blend-inline-warning" hidden>Pet-safety review is required. This builder does not establish that a blend is safe for animals.</p>
          <button type="button" id="blend-generate" class="blend-primary">Explore this blend <span aria-hidden="true">→</span></button>
          <p id="blend-status" class="blend-message" role="status" aria-live="polite"></p>
          <p id="blend-storage-note" class="blend-small"></p>
        </section>
      </div>
    </div>
    <section id="blend-results" class="blend-results" aria-labelledby="blend-results-title" hidden></section>
    <section class="blend-saved" aria-labelledby="blend-saved-title"><h3 id="blend-saved-title">Your saved recipes</h3><div id="blend-saved-list"></div><button type="button" id="blend-reset" class="blend-text-button">Start a new blend</button></section>`;
  function renderPaths() {
    root.querySelectorAll('[data-blend-path]').forEach(b => b.setAttribute('aria-pressed',String(chosenPath && b.dataset.blendPath === recipe.path)));
    document.getElementById('blend-workspace').hidden = !chosenPath;
    document.getElementById('blend-quality-picker').hidden = recipe.path !== 'qualities';
    document.getElementById('blend-qualities').innerHTML = qualities.map(q => `<button type="button" class="blend-quality" data-quality="${esc(q.id)}" aria-pressed="${recipe.qualityIds.includes(q.id)}" title="${esc(q.description)}">${esc(q.label)}</button>`).join('');
  }
  function renderCatalog() {
    const matchQuality = oil => !recipe.qualityIds.length || recipe.path !== 'qualities' || oil.blend.qualityMappings.some(m => m.supportsSuggestion !== false && recipe.qualityIds.includes(m.qualityId));
    const matching = oils.filter(o => matchQuality(o) && `${o.name} ${o.latinName} ${o.aroma.join(' ')}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));
    document.getElementById('blend-catalog-count').textContent = `${matching.length} oils${recipe.path === 'qualities' && recipe.qualityIds.length ? ' with matching research topics' : ' in the starter collection'}. Research matches are not effectiveness rankings.`;
    document.getElementById('blend-oil-catalog').innerHTML = matching.map(o => {
      const selected = recipe.oils.some(s=>s.id===o.id), qualityLabels = labels(o);
      return `<article class="blend-oil-card ${selected ? 'is-selected' : ''}"><div class="blend-oil-heading"><div><h5>${esc(o.name)}</h5><p class="blend-latin">${esc(o.latinName)}</p></div><span class="blend-oil-swatch" style="--oil-color:${/^#[0-9a-f]{3,8}$/i.test(o.color) ? o.color : '#72b89a'}" aria-hidden="true"></span></div><p class="blend-aroma">${esc(o.aroma.join(' · '))}</p><p class="blend-small">${qualityLabels.length ? 'Purported: '+esc(qualityLabels.join(', ')) : 'Limited research: no verified quality mapping yet.'}</p><button type="button" data-add-oil="${esc(o.id)}" ${selected || recipe.oils.length>=5 ? 'disabled' : ''}>${selected ? 'Added to your blend' : recipe.oils.length>=5 ? '5-oil limit reached' : '+ Add oil'}</button></article>`;
    }).join('') || '<p class="blend-empty">No oils match this search. Try another aroma or quality.</p>';
  }
  function renderSelected() {
    document.getElementById('blend-selected-count').textContent = recipe.oils.length + ' / 5 oils';
    document.getElementById('blend-selected').innerHTML = recipe.oils.map(entry => {
      const o=byId[entry.id]; return `<div class="blend-portion"><div class="blend-portion-heading"><label for="blend-percent-${o.id}">${esc(o.name)}</label><button type="button" data-remove-oil="${o.id}" aria-label="Remove ${esc(o.name)}">Remove</button></div><div class="blend-portion-controls"><input type="range" min="0" max="100" step="0.01" value="${entry.percent}" data-portion-range="${o.id}" aria-label="${esc(o.name)} relative portion" aria-describedby="blend-total-help"><span><input id="blend-percent-${o.id}" type="number" min="0" max="100" step="0.01" value="${entry.percent}" data-portion="${o.id}" inputmode="decimal" aria-label="${esc(o.name)} relative percentage" aria-describedby="blend-total-help">%</span></div></div>`;
    }).join('') || '<div class="blend-empty"><span aria-hidden="true">＋</span><p>Add your first oil.<br>A little curiosity goes a long way.</p></div>';
    renderSummary();
  }
  function renderSummary() {
    const value=total();
    document.getElementById('blend-total').textContent=value+'%';
    document.getElementById('blend-total').classList.toggle('is-error',value!==100 && recipe.oils.length>0);
    document.getElementById('blend-total-help').textContent=!recipe.oils.length ? 'Choose 1 to 5 oils to begin.' : value===100 && recipe.oils.every(o=>o.percent>0) ? '100% of the oil blend. Ready to explore.' : recipe.oils.some(o=>o.percent<=0) ? 'Give every oil a positive portion, or remove oils set to 0%.' : 'Use positive portions adding to 100%, or choose Balance to 100%.';
    document.getElementById('blend-normalize').disabled=!recipe.oils.length || !recipe.oils.every(o=>o.percent>0);
    document.getElementById('blend-composition').innerHTML=recipe.oils.map((o,i)=>`<span style="flex-grow:${o.percent};background:var(--blend-segment-${i})" title="${esc(byId[o.id].name)} ${o.percent}%"></span>`).join('');
    document.getElementById('blend-pet-warning').hidden=!recipe.petContext;
    persist();
  }
  function warningList(items) { return items.map(item=>`<li>${esc(item.message)}${item.source ? `<span class="blend-source">Source: ${sourceLink(item.source)}</span>` : ''}</li>`).join(''); }
  function combinedWarnings(warnings) {
    const result=[], groups=new Map();
    for (const warning of warnings) {
      const oil=warning.code==='sensitization_note' && warning.oilIds?.length===1 ? byId[warning.oilIds[0]] : null;
      if (!oil?.blend.sensitizationNotes) { result.push(warning); continue; }
      const note=oil.blend.sensitizationNotes.trim();
      if (!groups.has(note)) { const group={...warning,oilIds:[],message:''}; groups.set(note,group); result.push(group); }
      const group=groups.get(note);group.oilIds.push(oil.id);
      group.message=group.oilIds.map(id=>byId[id].name).join(' + ')+': '+note;
    }
    return result;
  }
  function oilProfile(entry) {
    const oil=byId[entry.id], b=oil.blend;
    const constituents=oil.constituents.map(c=>`<li><span>${esc(compounds[c.compoundId]?.name || c.compoundId)}</span><span>${CHEMISTRY.quantified(c) ? `${c.range.min}-${c.range.max}% in cited sample` : 'No verified range yet'}</span></li>`).join('');
    const mappings=b.qualityMappings;
    return `<article class="blend-profile"><header><div><p class="blend-eyebrow">ESSENTIAL OIL / ${entry.percent}% OF BLEND</p><h4>${esc(oil.name)}</h4><p class="blend-latin">${esc(oil.latinName)}</p></div><span class="blend-pill">${esc(oil.aroma.join(' · '))}</span></header><div class="blend-profile-columns"><div><h5>Purported qualities & research</h5>${mappings.length ? mappings.map(m=>`<div class="blend-research"><p><strong>${esc(qualities.find(q=>q.id===m.qualityId)?.label || m.qualityId)}</strong><span class="blend-evidence-tier">${esc(m.evidenceTier)}</span></p><p>${esc(m.summary)}</p>${m.limitations ? `<p class="blend-small">Limitations: ${esc(m.limitations)}</p>` : ''}${safeUrl(m.url) ? `<a href="${esc(safeUrl(m.url))}" target="_blank" rel="noopener noreferrer">Read study${m.pmid ? ' · PMID '+esc(m.pmid) : ''}</a>` : '<p class="blend-small">No verified source link yet.</p>'}</div>`).join('') : '<p>Limited research. No verified data yet for these purported qualities.</p>'}</div><div class="blend-profile-cautions"><h5>Cautions & evidence gaps</h5><p>${b.dermalMaxPercent===null ? 'No verified leave-on dermal maximum yet. Suitability for the finished spray needs manual review.' : `Documented maximum in the finished product: ${esc(b.dermalMaxPercent)}%.`}</p>${b.dermalMaxSource ? `<p>Limit source: ${sourceLink(b.dermalMaxSource)}</p>` : ''}<p>${b.petSafer===true && b.petSource ? 'Pet context still requires species and exposure review.' : 'Pet suitability: no verified pet-safer approval.'}</p><p>${esc(b.sensitizationNotes || 'Sensitization data: no verified data yet.')}</p><p>${b.phototoxic===null ? 'Phototoxicity: no verified data yet for the supplied preparation.' : b.phototoxic ? 'Phototoxicity flagged. Preparation and exposure limits require review.' : 'No phototoxicity flag recorded; this is not a safety guarantee.'}</p><p>Interaction review applies to the whole blend. Missing information never means no risk.</p></div></div><div class="blend-constituents"><h5>Cataloged major constituents</h5><ul>${constituents || '<li>No verified data yet.</li>'}</ul><p class="blend-small">Whole essential oils contain more than terpenes. These are literature records, not a batch analysis or a complete chemical composition.</p></div></article>`;
  }
  function renderResults() {
    const section=document.getElementById('blend-results');
    if (!generated) { section.hidden=true; return; }
    const valid=E.validateRecipe(recipe,data);
    if (!valid.valid || root.querySelector('input:invalid')) { section.hidden=true; generated=false; return; }
    const safety=E.evaluateSafety(recipe,data);
    let cart=null, orderMessage='Shopify ordering is being set up. Save your recipe for now.';
    try { cart=E.cartPermalink(recipe,data); } catch(error) {
      if (error.errors?.some(item=>['total_limit_exceeded','dermal_limit_exceeded','oil_interaction'].includes(item.code))) orderMessage='Resolve the sourced limit or interaction warnings before ordering.';
    }
    const priorityBlockers=safety.blockers.filter(item=>['total_limit_exceeded','dermal_limit_exceeded','pet_context_blocked','oil_interaction'].includes(item.code));
    const mapped=[...new Set(recipe.oils.flatMap(o=>labels(byId[o.id])))];
    section.hidden=false;
    section.innerHTML=`<div class="blend-step-title"><span>03</span><h3 id="blend-results-title" tabindex="-1">${esc(recipe.name || 'Your custom blend')}</h3><span class="blend-step-note">RECIPE V1</span></div>
      <div class="blend-results-lead"><section class="blend-result-summary"><p class="blend-eyebrow">YOUR BLEND AT A GLANCE</p><h4>${recipe.oils.map(o=>esc(byId[o.id].name)).join(' + ')}</h4><ul class="blend-recipe-list">${recipe.oils.map(o=>`<li><span>${esc(byId[o.id].name)}</span><strong>${o.percent}%</strong></li>`).join('')}</ul><p>Purported qualities: ${mapped.length ? esc(mapped.join(', ')) : 'no verified mappings yet'}.</p><p class="blend-small">These proportions describe only the oil mixture. ${Number.isFinite(config.product.totalOilLoadPercent) ? 'Configured final spray oil concentration: '+esc(config.product.totalOilLoadPercent)+'% (subject to manual formulation review).' : 'Final spray concentration has not been set.'}</p></section>
      <section class="blend-result-cautions" aria-labelledby="blend-cautions-title"><p class="blend-eyebrow">CAUTIONS COME WITH THE RESEARCH</p><h4 id="blend-cautions-title">Review before mixing</h4><p>Ingredient research does not validate this blend or the finished spray. No medical or therapeutic benefit is claimed.</p>${recipe.petContext ? '<p class="blend-inline-warning">Pet context is on. Do not assume this blend is safe around pets.</p>' : ''}<ul>${warningList([...priorityBlockers,...combinedWarnings(safety.warnings)])}</ul><p>Every custom recipe is reviewed before mixing. Final concentration, ingredient suitability and stock are confirmed during that review.</p></section></div>
      <div class="blend-recipe-actions"><button type="button" id="blend-save" class="blend-primary">Save recipe</button><button type="button" id="blend-share" class="blend-secondary">Copy share link</button><span id="blend-action-status" role="status" aria-live="polite"></span></div>
      <div id="blend-share-fallback" hidden><label for="blend-share-url">Copy this recipe link</label><input id="blend-share-url" readonly></div>
      <p class="blend-small">Saved on this device. Anyone with your link can see the recipe and its name.</p>
      <div class="blend-profile-list">${recipe.oils.map(oilProfile).join('')}</div>
      <section class="blend-checkout" aria-labelledby="blend-checkout-title"><div><p class="blend-eyebrow">CUSTOM BLEND / SUNNY'S SHIELD</p><h4 id="blend-checkout-title">Your recipe. Our standard 8 oz spray.</h4><p>${esc(priceLabel)} per bottle · Standard base, bottle and label.</p><p class="blend-small">Your recipe name, oil proportions and pet context travel with the order for manual review before mixing. Shopify handles payment and shipping.</p><p class="blend-small">Cosmetic use only. No medical claims.</p></div><div>${cart ? `<a id="blend-checkout" class="blend-primary" href="${esc(cart.url)}" target="_top" rel="noreferrer" aria-describedby="blend-checkout-status">Continue to Shopify · ${esc(priceLabel)}</a><p id="blend-checkout-status" class="blend-small">Opens Shopify checkout for this recipe. Check the cart contents before paying.</p>` : `<p id="blend-checkout-status" class="blend-order-pending" role="status">${esc(orderMessage)}</p>`}</div></section>
      ${safety.blockers.length ? `<section class="blend-review-requirements"><h4>What still needs review</h4><ul>${warningList(safety.blockers)}</ul></section>` : ''}`;
  }
  function renderSaved() {
    document.getElementById('blend-saved-list').innerHTML=saved.length ? saved.map((encoded,index)=>{
      try { const item=E.decodeRecipe(encoded,data); return `<div class="blend-saved-item"><div><strong>${esc(item.name)}</strong><p class="blend-small">${item.oils.map(o=>`${esc(byId[o.id].name)} ${o.percent}%`).join(' · ')}</p></div><div><button type="button" data-load-recipe="${index}">Load</button><button type="button" data-delete-recipe="${index}" aria-label="Delete saved recipe ${esc(item.name)}">Delete</button></div></div>`; }
      catch { return `<div class="blend-saved-item"><p>Recipe from an older or unavailable catalog. Rebuild it with current data.</p><button type="button" data-delete-recipe="${index}" aria-label="Delete unavailable saved recipe">Delete</button></div>`; }
    }).join('') : '<p class="blend-small">Finish a blend, then save it here or keep a share link.</p>';
  }
  function refresh() {
    document.getElementById('blend-name').value=recipe.name;
    document.getElementById('blend-name').setCustomValidity(Array.from(recipe.name).length>60?'Use a recipe name of at most 60 characters.':'');
    document.getElementById('blend-pets').checked=recipe.petContext;
    renderPaths();renderCatalog();renderSelected();renderResults();renderSaved();
  }
  function updated(message) { renderCatalog();renderSelected();renderResults();if(message)announce(message); }
  root.addEventListener('click',async event=>{
    const checkout=event.target.closest('#blend-checkout');
    if (checkout) {
      // Revalidate the current recipe on handoff; the configured Shopify variant owns the price.
      try {
        if (root.querySelector('input:invalid')) throw new Error('Correct the highlighted percentage or recipe name before continuing.');
        checkout.href=E.cartPermalink(recipe,data).url;persist();
      }
      catch(error) { event.preventDefault();renderResults();announce(error.message,true); }
      return;
    }
    const button=event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.blendPath) {
      recipe.path=button.dataset.blendPath;
      // The oils-first path has no quality picker; never retain hidden selections.
      if (recipe.path==='oils') recipe.qualityIds=[];
      chosenPath=true;renderPaths();renderCatalog();persist();renderResults();
    }
    if (button.dataset.quality) { const id=button.dataset.quality; recipe.qualityIds=recipe.qualityIds.includes(id) ? recipe.qualityIds.filter(q=>q!==id) : [...recipe.qualityIds,id];renderPaths();renderCatalog();persist();renderResults();root.querySelector(`[data-quality="${id}"]`)?.focus(); }
    if (button.dataset.addOil) {
      if (recipe.oils.length>=5 || recipe.oils.some(o=>o.id===button.dataset.addOil)) return;
      if (recipe.oils.some(o=>o.percent<=0)) { announce('Give each existing oil a positive portion, or remove it, before adding another oil.',true); return; }
      const share=100/(recipe.oils.length+1);
      const sum=total();
      try { recipe.oils=E.normalizePercentages([...recipe.oils.map(o=>({id:o.id,percent:sum>0 ? Math.round(o.percent/sum*(100-share)*100)/100 : Math.round((100-share)/recipe.oils.length*100)/100})),{id:button.dataset.addOil,percent:Math.round(share*100)/100}]); } catch(error) { announce(error.message,true); return; }
      updated(`${byId[button.dataset.addOil].name} added. Existing portions adjusted proportionally.`);root.querySelector(`[data-portion="${button.dataset.addOil}"]`)?.focus();
    }
    if (button.dataset.removeOil) { recipe.oils=recipe.oils.filter(o=>o.id!==button.dataset.removeOil);if(recipe.oils.length && recipe.oils.every(o=>o.percent>0)) { try { recipe.oils=E.normalizePercentages(recipe.oils); } catch(error) { updated(error.message); return; } } updated('Oil removed. Check the remaining portions total 100%.');(root.querySelector('[data-portion]') || root.querySelector('[data-add-oil]:not(:disabled)'))?.focus(); }
    if (button.id==='blend-normalize') { try { recipe.oils=E.normalizePercentages(recipe.oils);updated('Portions balanced to 100%.'); } catch(error) {announce(error.message,true);} }
    if (button.id==='blend-generate') {
      const result=E.validateRecipe(recipe,data);
      if (root.querySelector('input:invalid')) { announce('Correct the highlighted percentage or recipe name before continuing.',true); root.querySelector('input:invalid').focus(); return; }
      if (!result.valid) {announce(result.errors.map(e=>e.message).join(' '),true);return;}
      recipe=result.recipe;generated=true;renderResults();document.getElementById('blend-results-title').focus();
      document.getElementById('blend-results').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
      announce('Research and cautions are ready. This recipe still needs formulation review.');persist();
    }
    if (button.id==='blend-save') { try {const encoded=E.encodeRecipe(recipe,data);saved=[encoded,...saved.filter(s=>s!==encoded)].slice(0,12);persist();renderSaved();document.getElementById('blend-action-status').textContent=storageError?'Could not save to this browser. Copy a share link instead.':'Recipe saved on this device.';}catch(error){document.getElementById('blend-action-status').textContent=error.message;} }
    if (button.id==='blend-share') {
      try {const url=new URL(location.pathname,location.origin);url.searchParams.set('tab','blend');url.searchParams.set('recipe',E.encodeRecipe(recipe,data));
        try {await navigator.clipboard.writeText(url.href);document.getElementById('blend-action-status').textContent='Recipe link copied.';}
        catch {document.getElementById('blend-share-fallback').hidden=false;const input=document.getElementById('blend-share-url');input.value=url.href;input.focus();input.select();document.getElementById('blend-action-status').textContent='Select and copy the recipe link below.';}
      } catch(error){document.getElementById('blend-action-status').textContent=error.message;}
    }
    if (button.dataset.loadRecipe!==undefined) {try{recipe=E.decodeRecipe(saved[Number(button.dataset.loadRecipe)],data);chosenPath=true;generated=true;search='';document.getElementById('blend-search').value='';refresh();announce('Saved recipe loaded and checked against the current catalog.');}catch(error){announce(error.message,true);} }
    if (button.dataset.deleteRecipe!==undefined) {saved.splice(Number(button.dataset.deleteRecipe),1);persist();renderSaved();announce('Saved recipe deleted from this device.');}
    if (button.id==='blend-reset') {recipe=initial();chosenPath=false;generated=false;search='';document.getElementById('blend-search').value='';const url=new URL(location.href);url.searchParams.delete('recipe');history.replaceState({},'',url);lastLink=null;restoreError='';document.getElementById('blend-link-error').hidden=true;refresh();root.querySelector('[data-blend-path]').focus();}
  });
  root.addEventListener('input',event=>{
    const el=event.target;
    if(el.id==='blend-search'){search=el.value;renderCatalog();return;}
    if(el.id==='blend-name'){el.setCustomValidity(Array.from(el.value).length>60?'Use a recipe name of at most 60 characters.':'');recipe.name=el.value;persist();renderResults();return;}
    const id=el.dataset.portion || el.dataset.portionRange;
    if(id){const value=el.value===''?0:Number(el.value);if(!Number.isFinite(value)||value<0||value>100){el.setCustomValidity('Use a percentage from 0 to 100.');generated=false;renderResults();announce('Each portion must be between 0 and 100%.',true);return;}if(Math.abs(value*100-Math.round(value*100))>1e-7){el.setCustomValidity('Use up to two decimal places.');generated=false;renderResults();announce('Use up to two decimal places for each portion.',true);return;}el.setCustomValidity('');recipe.oils.find(o=>o.id===id).percent=Math.round(value*100)/100;const partner=root.querySelector(el.dataset.portion?`[data-portion-range="${id}"]`:`[data-portion="${id}"]`);partner.value=recipe.oils.find(o=>o.id===id).percent;partner.setCustomValidity('');renderSummary();renderResults();}
  });
  root.addEventListener('change',event=>{if(event.target.id==='blend-pets'){recipe.petContext=event.target.checked;renderSummary();renderResults();}});
  window.addEventListener('popstate',()=>{readLink(true);refresh();document.getElementById('blend-link-error').hidden=!restoreError;document.getElementById('blend-link-error').textContent=restoreError;});
  refresh();
})();
