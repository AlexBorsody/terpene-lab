/* Blend Builder: local recipes and a Shopify handoff for manual review. */
(() => {
  'use strict';
  const E = window.BLEND_ENGINE, data = TERPENE_DATA, config = data.blendBuilder;
  const research = window.RESEARCH?.create(data);
  const root = document.getElementById('blend-builder');
  if (!root || !E || !config || !research) return;
  const oils = data.oils.filter(o => o.blend?.enabled);
  const byId = Object.fromEntries(oils.map(o => [o.id, o]));
  const compounds = Object.fromEntries(data.compounds.map(c => [c.id, c]));
  const STORAGE = 'terpene-lab:blend:v1';
  const priceLabel = new Intl.NumberFormat('en-US',{style:'currency',currency:config.product.currency}).format(config.product.price);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
  const initial = () => ({v:1,catalogVersion:config.catalogVersion,name:'My custom blend',path:'qualities',qualityIds:[],petContext:false,oils:[]});
  let recipe = initial(), generated = false, chosenPath = false, saved = [], search = '', storageError = false;
  let lastLink = null, restoreError = '', filterMode = 'all';
  try {
    const local = JSON.parse(localStorage.getItem(STORAGE) || 'null');
    if (local?.filterMode === 'any') filterMode = 'any';
    if (local && Array.isArray(local.saved)) saved = local.saved.filter(s => typeof s === 'string').slice(0,12);
    if (local?.draft) {
      // Drafts may intentionally have an unfinished total; never treat them as validated recipes.
      const d = local.draft;
      if (Object.keys(d).length === 7 && ['v','catalogVersion','name','path','qualityIds','petContext','oils'].every(k => Object.hasOwn(d,k)) && d.v === 1 && d.catalogVersion === config.catalogVersion && ['qualities','oils'].includes(d.path) &&
          typeof d.name === 'string' && Array.from(d.name).length <= 60 && typeof d.petContext === 'boolean' &&
          Array.isArray(d.qualityIds) && new Set(d.qualityIds).size === d.qualityIds.length && d.qualityIds.every(id => E.resolveQualityId(id,data)) &&
          Array.isArray(d.oils) && d.oils.length <= 5 && new Set(d.oils.map(o => o.id)).size === d.oils.length &&
          d.oils.every(o => o && Object.keys(o).length === 2 && typeof o.id === 'string' && Object.hasOwn(byId,o.id) && Number.isFinite(o.percent) && o.percent >= 0 && o.percent <= 100)) {
        recipe = {...initial(),...d,qualityIds:d.path==='oils' ? [] : [...new Set(d.qualityIds.map(id=>E.resolveQualityId(id,data)))]}; chosenPath = true;
      } else if (Array.isArray(d.oils) && d.oils.some(o=>o && !byId[o.id])) {
        localStorage.setItem(STORAGE+':unavailable-draft',JSON.stringify(d));
        restoreError = 'Your previous blend contains oils we no longer offer. Choose from the current collection to start again.';
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
    try { localStorage.setItem(STORAGE,JSON.stringify({draft:recipe,saved,filterMode})); storageError = false; }
    catch { storageError = true; }
    const notice = document.getElementById('blend-storage-note');
    if (notice) notice.textContent = storageError ? 'Couldn’t save your draft. Copy a recipe link to keep it.' : '';
  }
  function announce(message, error = false) {
    const el = document.getElementById('blend-status');
    el.textContent = message; el.classList.toggle('is-error',error);
  }
  function labels(oil) {
    const roots = research.roots();
    const rows = research.assertions(oil.id);
    return roots.filter(topic=>rows.some(row=>research.descendants(topic.id).includes(row.useNodeId))).map(topic=>research.label(topic.id));
  }
  function activeTopics() { return recipe.path==='qualities' ? recipe.qualityIds : []; }
  function studyHref(oilId) {
    const url=new URL(location.pathname,location.origin);url.searchParams.set('tab','studies');url.searchParams.set('oil',oilId);
    if(activeTopics().length===1)url.searchParams.set('domain',activeTopics()[0]);
    if(new URLSearchParams(location.search).get('embed')==='1')url.searchParams.set('embed','1');
    return url.href;
  }
  function total() { return Math.round(recipe.oils.reduce((sum,o) => sum + o.percent,0)*100)/100; }
  function sourceLink(source) {
    if (typeof source === 'string') source = data.sources.find(s => s.id === source) || source;
    const url = safeUrl(typeof source === 'string' ? source : source?.url);
    const text = typeof source === 'string' ? source : source?.label || source?.title || 'Source';
    return url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>` : esc(text || 'No verified data yet');
  }
  root.innerHTML = `
    <div class="blend-hero">
      <div><p class="blend-eyebrow">Sunny’s Shield / Blend studio</p><h2>Build your blend.</h2>
        <ul class="blend-intro"><li>Up to 5 oils</li><li>Your proportions</li><li>Made for you</li></ul></div>
      <div class="blend-product"><svg class="blend-bottle" viewBox="0 0 80 120" aria-hidden="true" focusable="false"><rect x="26" y="6" width="28" height="14" rx="2"/><path d="M30 20v13c0 7-15 8-15 20v51c0 6 4 10 10 10h30c6 0 10-4 10-10V53c0-12-15-13-15-20V20M32 10v6m8-6v6m8-6v6"/><rect x="23" y="53" width="34" height="39" rx="1"/><path d="M33 82 48 63c-15 0-20 9-13 16 8 3 14-4 13-16M28 99h24"/></svg><div class="blend-product-copy"><span class="blend-product-size">${esc(config.product.name)} / ${esc(config.product.size)}</span><strong>${esc(priceLabel)}<span> per custom blend</span></strong><span class="blend-pill">Manual review before mixing</span></div></div>
    </div>
    <p id="blend-link-error" class="blend-message is-error" role="alert" ${restoreError ? '' : 'hidden'}>${esc(restoreError)}</p>
    <div class="blend-step-title"><span>1</span><h3>Start with</h3></div>
    <div class="blend-paths" role="group" aria-label="Choose a starting point">
      <button type="button" data-blend-path="qualities"><span class="blend-path-icon">${uiIcon("domains")}</span><strong>Shop by use</strong><span class="blend-path-description">Explore the research.</span><span class="blend-path-arrow" aria-hidden="true">${uiIcon("arrow")}</span></button>
      <button type="button" data-blend-path="oils"><span class="blend-path-icon">${uiIcon("oils")}</span><strong>Browse oils</strong><span class="blend-path-description">Follow your favorite aromas.</span><span class="blend-path-arrow" aria-hidden="true">${uiIcon("arrow")}</span></button>
    </div>
    <div id="blend-workspace" hidden>
      <div class="blend-step-title"><span>2</span><h3>Choose your oils</h3></div>
      <div class="blend-work-grid">
        <section class="blend-catalog" aria-labelledby="blend-catalog-title">
          <div class="blend-catalog-heading"><h4 id="blend-catalog-title">Explore the oils</h4><button type="button" id="blend-reset-choices" class="blend-text-button">Reset choices</button></div>
          <div id="blend-quality-picker"><div id="blend-active-filters"></div><div id="blend-qualities" class="blend-quality-buttons" role="group" aria-label="Research topics"></div></div>
          <label class="blend-search-label" for="blend-search">Find an oil</label>
          <input id="blend-search" type="search" placeholder="Oil name or aroma..." autocomplete="off">
          <p id="blend-catalog-count" class="blend-small"></p><div id="blend-oil-catalog" class="blend-oil-catalog"></div>
        </section>
        <section id="blend-mixer" class="blend-mixer" aria-labelledby="blend-mixer-title">
          <div class="blend-mixer-top"><h4 id="blend-mixer-title">Your blend</h4><span id="blend-selected-count" class="blend-small"></span></div>
          <label for="blend-name" class="blend-input-label">Recipe name</label><input id="blend-name" maxlength="120" aria-describedby="blend-name-help" value="${esc(recipe.name)}" autocomplete="off">
          <p id="blend-name-help" class="sr-only">Up to 60 characters. Included in shared recipe links.</p><div id="blend-selected"></div>
          <div class="blend-total-row"><span>Oil-blend total</span><strong id="blend-total"></strong></div>
          <div id="blend-composition" class="blend-composition" aria-hidden="true"></div>
          <p id="blend-total-help" class="blend-small" aria-live="polite"></p>
          <button type="button" id="blend-normalize" class="blend-text-button">Balance to 100%</button>
          <p class="blend-proportion-note">Oil proportions only. We review the final dilution.</p>
          <label class="blend-pets"><input type="checkbox" id="blend-pets" ${recipe.petContext ? 'checked' : ''}><span>Will be used around pets</span></label>
          <p id="blend-pet-warning" class="blend-inline-warning" hidden>Pet-safety review is required. This builder does not establish that a blend is safe for animals.</p>
          <div class="blend-order-price"><span>${esc(config.product.size)} custom blend</span><strong>${esc(priceLabel)}</strong></div>
          <button type="button" id="blend-generate" class="blend-primary">Review & checkout <span aria-hidden="true">→</span></button>
          <p id="blend-status" class="blend-message" role="status" aria-live="polite"></p>
          <p id="blend-storage-note" class="blend-small"></p>
        </section>
      </div>
    </div>
    <div id="blend-shop-bar" class="blend-shop-bar" hidden><div><strong>${priceLabel}</strong><span id="blend-shop-count"></span></div><button type="button" data-review-blend class="blend-primary">Review & checkout <span aria-hidden="true">→</span></button></div>
    <section id="blend-results" class="blend-results" aria-labelledby="blend-results-title" hidden></section>
    <section class="blend-saved" aria-labelledby="blend-saved-title"><h3 id="blend-saved-title">Your saved recipes</h3><div id="blend-saved-list"></div><button type="button" id="blend-reset" class="blend-text-button">Start a new blend</button></section>`;
  function renderPaths() {
    root.querySelectorAll('[data-blend-path]').forEach(b => b.setAttribute('aria-pressed',String(chosenPath && b.dataset.blendPath === recipe.path)));
    document.getElementById('blend-workspace').hidden = !chosenPath;
    document.getElementById('blend-quality-picker').hidden = recipe.path !== 'qualities';
    const previouslyOpen=new Set([...root.querySelectorAll('[data-topic-branch][open]')].map(el=>el.dataset.topicBranch));
    function topicNode(topic) {
      const children=research.children(topic.id), label=research.label(topic.id);
      const count=oils.filter(o=>research.studiesForOil(o.id,[topic.id]).length).length;
      if(!count && !recipe.qualityIds.includes(topic.id))return '';
      const button=`<button type="button" class="blend-quality" data-quality="${esc(topic.id)}" aria-pressed="${recipe.qualityIds.includes(topic.id)}" title="${esc(research.breadcrumb(topic.id))}">${children.length?'All '+esc(label):esc(label)} <small>${count}</small></button>`;
      if(!children.length)return button;
      const selected=recipe.qualityIds.filter(id=>research.descendants(topic.id).includes(id)).length;
      return `<details class="blend-topic-branch" data-topic-branch="${esc(topic.id)}" ${previouslyOpen.has(topic.id)||selected?'open':''}><summary>${esc(label)} <span>${count} oil${count===1?'':'s'}${selected?' · '+selected+' selected':''}</span></summary><div class="blend-topic-children">${button}${children.map(topicNode).join('')}</div></details>`;
    }
    document.getElementById('blend-qualities').innerHTML=research.roots().map(topicNode).join('');
    document.getElementById('blend-active-filters').innerHTML=recipe.qualityIds.length ? `<div class="blend-filter-chips" aria-label="Selected uses">${recipe.qualityIds.map(id=>`<button type="button" data-remove-topic="${esc(id)}" aria-label="Remove ${esc(research.label(id))} filter">${esc(research.label(id))} <span aria-hidden="true">×</span></button>`).join('')}</div><div class="blend-match-mode" role="group" aria-label="Match selected uses"><span>Match</span><button type="button" data-filter-mode="all" aria-pressed="${filterMode==='all'}">All selected</button><button type="button" data-filter-mode="any" aria-pressed="${filterMode==='any'}">Any selected</button></div>` : '';

  }
  function renderCatalog() {
    const topics=activeTopics(), searching=search.trim().toLowerCase();
    const matches=new Set(research.matchingOilIds(topics,{eligibleOnly:false,match:filterMode}));
    const found=oils.filter(o=>(!topics.length||matches.has(o.id)) && `${o.name} ${o.latinName} ${o.aroma.join(' ')}`.toLowerCase().includes(searching)).sort((a,b)=>a.name.localeCompare(b.name));
    document.getElementById('blend-catalog-count').textContent=`${found.length} oils${topics.length?' · '+(filterMode==='all'?'All':'Any')+' selected uses':''}`;
    function oilCard(o) {
      const selected=recipe.oils.some(s=>s.id===o.id);
      const papers=research.studiesForOil(o.id,topics), rows=research.assertions(o.id,null,topics);
      const topicLabels=topics.length ? topics.filter(id=>research.studiesForOil(o.id,id).length).map(id=>research.label(id)) : labels(o);
      const checked=rows.filter(row=>row.verification?.status==='source-checked'||row.verification?.status==='source-verified');
      const scopes=[...new Set(checked.map(row=>row.route==='injection'?'Animal research · injected':row.material?.kind==='isolated-compound'?'Compound research':row.relevance==='contextual'?'Related preparation':row.model?.kind==='human'?'Human research':row.model?.kind==='animal'?'Animal research':['in-vitro','laboratory','mixed-laboratory'].includes(row.model?.kind)?'Lab research':row.model?.kind==='environmental'?'Environmental research':'Other research'))];
      if(topics.length && checked.some(row=>row.outcome?.direction==='negative')) scopes.push('Negative findings');
      if(topics.length && checked.some(row=>row.outcome?.direction==='null')) scopes.push('No significant effect');
      if(rows.some(row=>!checked.includes(row))) scopes.push('Some scope unreviewed');
      return `<article class="blend-oil-card ${selected?'is-selected':''}"><div class="blend-oil-heading"><div><h5>${esc(o.name)}</h5><p class="blend-latin">${esc(o.latinName)}</p></div><span class="blend-oil-swatch" style="--oil-color:${/^#[0-9a-f]{3,8}$/i.test(o.color)?o.color:'#72b89a'}" aria-hidden="true"></span></div><p class="blend-aroma">${esc(o.aroma.join(' · '))}</p>${topics.length?`<p class="blend-small blend-match-label">${esc(topicLabels.join(' · '))}</p><p class="blend-small blend-evidence-label">${esc(scopes.join(' · ')||'Research scope unreviewed')}</p>`:''}<a class="blend-card-research" href="${esc(studyHref(o.id))}">${papers.length} linked papers ↗</a><button type="button" data-add-oil="${esc(o.id)}" ${selected||recipe.oils.length>=5?'disabled':''}>${selected?'Added to your blend':recipe.oils.length>=5?'5-oil limit reached':'+ Add oil'}</button></article>`;
    }
    document.getElementById('blend-oil-catalog').innerHTML=found.map(oilCard).join('')||`<div class="blend-empty"><p>No oils match ${topics.length&&filterMode==='all'?'all selected uses':'this search'}.</p>${topics.length>1&&filterMode==='all'?'<button type="button" data-filter-mode="any">Match any selected use</button>':''}</div>`;
  }
  function renderSelected() {
    document.getElementById('blend-selected-count').textContent = recipe.oils.length + ' / 5 oils';
    document.getElementById('blend-selected').innerHTML = recipe.oils.map(entry => {
      const o=byId[entry.id]; return `<div class="blend-portion"><div class="blend-portion-heading"><label for="blend-percent-${o.id}">${esc(o.name)}</label><button type="button" data-remove-oil="${o.id}" aria-label="Remove ${esc(o.name)}">Remove</button></div><div class="blend-portion-controls"><input type="range" min="0" max="100" step="0.01" value="${entry.percent}" data-portion-range="${o.id}" aria-label="${esc(o.name)} relative portion" aria-describedby="blend-total-help"><span><input id="blend-percent-${o.id}" type="number" min="0" max="100" step="0.01" value="${entry.percent}" data-portion="${o.id}" inputmode="decimal" aria-label="${esc(o.name)} relative percentage" aria-describedby="blend-total-help">%</span></div></div>`;
    }).join('') || '<div class="blend-empty"><span aria-hidden="true">＋</span><p>Choose an oil to start.</p></div>';
    renderSummary();
  }
  function renderSummary() {
    const value=total();
    document.getElementById('blend-shop-bar').hidden=!recipe.oils.length;
    document.getElementById('blend-shop-count').textContent=config.product.size+' · '+recipe.oils.length+(recipe.oils.length===1?' oil':' oils');
    document.getElementById('blend-total').textContent=value+'%';
    document.getElementById('blend-total').classList.toggle('is-error',value!==100 && recipe.oils.length>0);
    document.getElementById('blend-total-help').textContent=!recipe.oils.length ? '' : value===100 && recipe.oils.every(o=>o.percent>0) ? 'Ready to review' : recipe.oils.some(o=>o.percent<=0) ? 'Set a portion above 0%, or remove the oil.' : 'Balance your blend to 100%.';
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
      const originalNote=oil.blend.sensitizationNotes.trim();
      const note=originalNote==='No verified sensitization assessment yet for this oil in the proposed leave-on spray. Legacy profile notes are unaudited and do not establish formulation safety.' ? 'Skin-sensitivity assessment pending for the finished blend.' : originalNote;
      if (!groups.has(note)) { const group={...warning,oilIds:[],message:''}; groups.set(note,group); result.push(group); }
      const group=groups.get(note);group.oilIds.push(oil.id);
      group.message=group.oilIds.map(id=>byId[id].name).join(' + ')+': '+note;
    }
    return result;
  }
  function oilProfile(entry) {
    const oil=byId[entry.id], b=oil.blend;
    const constituents=oil.constituents.map(c=>`<li><span>${esc(compounds[c.compoundId]?.name || c.compoundId)}</span><span>${CHEMISTRY.quantified(c) ? `${c.range.min}-${c.range.max}% in cited sample` : 'No verified range yet'}</span></li>`).join('');
    const topics=activeTopics();
    const linked=research.studiesForOil(oil.id,topics);
    const audited=new Set(research.studiesForOil(oil.id,topics,{eligibleOnly:true}).map(study=>study.id));
    linked.sort((a,b)=>Number(audited.has(b.id))-Number(audited.has(a.id)));
    const paper=study=>studyCard(study,oil.id,topics);
    const papers=linked.length ? linked.slice(0,2).map(paper).join('')+(linked.length>2?`<details class="blend-more-research"><summary>Read ${linked.length-2} more linked papers</summary>${linked.slice(2).map(paper).join('')}</details>`:'') : '<p>No study is linked to this oil for the selected research topics. This is a gap, not evidence of no effect.</p>';
    return `<article class="blend-profile"><header><div><p class="blend-eyebrow">ESSENTIAL OIL / ${entry.percent}% OF BLEND</p><h4>${esc(oil.name)}</h4><p class="blend-latin">${esc(oil.latinName)}</p></div><span class="blend-pill">${esc(oil.aroma.join(' · '))}</span></header><div class="blend-profile-columns"><div><h5>Research from the Lab library</h5><p class="blend-small">${linked.length} linked papers · ${audited.size} with reviewed oil-specific topic matches. Related preparations and uncertain associations are identified below.</p>${papers}<a class="blend-library-link" href="${esc(studyHref(oil.id))}">Explore ${esc(oil.name)} in the study library</a></div><div class="blend-profile-cautions"><h5>Precautions & evidence gaps</h5><p>${b.dermalMaxPercent===null?'No verified leave-on dermal maximum yet. Suitability for the finished spray needs manual review.':`Documented maximum in the finished product: ${esc(b.dermalMaxPercent)}%.`}</p>${b.dermalMaxSource?`<p>Limit source: ${sourceLink(b.dermalMaxSource)}</p>`:''}<p>${b.petSafer===true&&b.petSource?'Pet context still requires species and exposure review.':'Pet suitability: no verified pet-safer approval.'}</p><p>${esc(b.sensitizationNotes||'Sensitization data: no verified data yet.')}</p><p>${b.phototoxic===null?'Phototoxicity: no verified data yet for the supplied preparation.':b.phototoxic?'Phototoxicity flagged. Preparation and exposure limits require review.':'No phototoxicity flag recorded; this is not a safety guarantee.'}</p><p>Interaction review applies to the whole blend. Missing information never means no risk.</p></div></div><div class="blend-constituents"><h5>Reported constituents</h5><ul>${constituents||'<li>No verified data yet.</li>'}</ul><p class="blend-small">Whole essential oils contain more than terpenes. These are literature records, not a batch analysis or a complete chemical composition.</p></div></article>`;
  }
  function renderResults() {
    const section=document.getElementById('blend-results');
    if (!generated) { section.hidden=true; return; }
    const valid=E.validateRecipe(recipe,data);
    if (!valid.valid || root.querySelector('input:invalid')) { section.hidden=true; generated=false; return; }
    const safety=E.evaluateSafety(recipe,data);
    let cart=null, orderMessage='Ordering is not available yet. You can save this blend.';
    try { cart=E.cartPermalink(recipe,data); } catch(error) {
      if (error.errors?.some(item=>['total_limit_exceeded','dermal_limit_exceeded','oil_interaction'].includes(item.code))) orderMessage='Resolve the concentration or interaction warnings before checkout.';
    }
    const priorityBlockers=safety.blockers.filter(item=>['total_limit_exceeded','dermal_limit_exceeded','pet_context_blocked','oil_interaction'].includes(item.code));
    const warnings=combinedWarnings(safety.warnings);
    // Generic missing-review details stay available below; actual oil-specific cautions stay beside the order.
    const importantWarnings=warnings;
    const paperCount=new Set(recipe.oils.flatMap(o=>research.studiesForOil(o.id).map(s=>s.id))).size;
    section.hidden=false;
    section.innerHTML=`<div class="blend-step-title"><span>3</span><h3 id="blend-results-title" tabindex="-1">Review your blend</h3></div>
      <div class="blend-results-lead"><section class="blend-result-summary"><p class="blend-eyebrow">${esc(config.product.size)} CUSTOM BLEND</p><h4>${esc(recipe.name || 'Your custom blend')}</h4><ul class="blend-recipe-list">${recipe.oils.map(o=>`<li><span>${esc(byId[o.id].name)}</span><strong>${o.percent}%</strong></li>`).join('')}</ul><p class="blend-small">Oil proportions only. ${Number.isFinite(config.product.totalOilLoadPercent) ? 'Final spray oil concentration: '+esc(config.product.totalOilLoadPercent)+'%, subject to review.' : 'Final dilution is confirmed before mixing.'}</p></section>
      <section class="blend-result-cautions" aria-labelledby="blend-cautions-title"><p class="blend-eyebrow">BEFORE WE MIX</p><h4 id="blend-cautions-title">Made with care</h4><p>We review your ingredients, dilution and intended use before mixing.</p>${recipe.petContext ? '<p class="blend-inline-warning">Pet-safety review required. This blend is not approved for use around animals.</p>' : ''}<ul>${warningList([...priorityBlockers,...importantWarnings])}</ul><p class="blend-small">Ingredient studies do not prove this finished blend’s effects or safety.</p></section></div>
      <section class="blend-checkout" aria-labelledby="blend-checkout-title"><div><p class="blend-eyebrow">SUNNY’S SHIELD</p><h4 id="blend-checkout-title">${esc(config.product.name)} · ${esc(priceLabel)}</h4><p>${esc(config.product.size)}</p><p class="blend-small">Your recipe travels with your order. Review before mixing.</p></div><div>${cart ? `<a id="blend-checkout" class="blend-primary" href="${esc(cart.url)}" target="_top" rel="noreferrer" aria-describedby="blend-checkout-status">Checkout · ${esc(priceLabel)} ${uiIcon('arrow')}</a><p id="blend-checkout-status" class="blend-small">Secure Shopify checkout</p>` : `<button type="button" class="blend-primary" disabled>Checkout · ${esc(priceLabel)}</button><p id="blend-checkout-status" class="blend-small" role="status">${esc(orderMessage)}</p>`}</div></section>
      <div class="blend-recipe-actions"><button type="button" id="blend-save" class="blend-secondary">${uiIcon('save')}Save for later</button><button type="button" id="blend-share" class="blend-secondary">${uiIcon('share')}Share blend</button><span id="blend-action-status" role="status" aria-live="polite"></span></div>
      <div id="blend-share-fallback" hidden><label for="blend-share-url">Copy this recipe link</label><input id="blend-share-url" readonly></div>
      <details class="blend-research-disclosure"><summary>Research & ingredients <span>${paperCount} linked papers</span></summary><div class="blend-profile-list">${recipe.oils.map(oilProfile).join('')}</div></details>
      ${safety.blockers.length ? `<details class="blend-review-requirements"><summary>Formulation review details</summary><ul>${warningList(safety.blockers)}</ul></details>` : ''}`;
    bindStudyLinks(section);
  }
  function renderSaved() {
    root.querySelector('.blend-saved').hidden=!chosenPath && !saved.length;
    document.getElementById('blend-saved-title').hidden=!saved.length;
    document.getElementById('blend-saved-list').innerHTML=saved.length ? saved.map((encoded,index)=>{
      try { const item=E.decodeRecipe(encoded,data); return `<div class="blend-saved-item"><div><strong>${esc(item.name)}</strong><p class="blend-small">${item.oils.map(o=>`${esc(byId[o.id].name)} ${o.percent}%`).join(' · ')}</p></div><div><button type="button" data-load-recipe="${index}">Load</button><button type="button" data-delete-recipe="${index}" aria-label="Delete saved recipe ${esc(item.name)}">Delete</button></div></div>`; }
      catch { return `<div class="blend-saved-item"><p>Recipe from an older or unavailable catalog. Rebuild it with current data.</p><button type="button" data-delete-recipe="${index}" aria-label="Delete unavailable saved recipe">Delete</button></div>`; }
    }).join('') : '';
  }
  function refresh() {
    document.getElementById('blend-name').value=recipe.name;
    document.getElementById('blend-name').setCustomValidity(Array.from(recipe.name).length>60?'Use a recipe name of at most 60 characters.':'');
    document.getElementById('blend-pets').checked=recipe.petContext;
    renderPaths();renderCatalog();renderSelected();renderResults();renderSaved();
  }
  function updated(message) { renderCatalog();renderSelected();renderResults();if(message)announce(message); }
  root.addEventListener('click',async event=>{
    if (event.target.closest('[data-review-blend]')) {
      document.getElementById('blend-generate').click();
      if (!generated) { document.getElementById('blend-mixer').scrollIntoView({behavior:'smooth',block:'start'}); document.getElementById('blend-name').focus({preventScroll:true}); }
      return;
    }
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
    if (button.id==='blend-reset-choices') { recipe.qualityIds=[];filterMode='all';search='';document.getElementById('blend-search').value='';renderPaths();root.querySelectorAll('[data-topic-branch]').forEach(branch=>branch.open=false);renderCatalog();persist();renderResults();button.focus();return; }
    if (button.dataset.filterMode) { filterMode=button.dataset.filterMode;renderPaths();renderCatalog();persist();root.querySelector(`[data-filter-mode="${filterMode}"]`)?.focus();return; }
    if (button.hasAttribute('data-clear-topics') || button.dataset.removeTopic) { recipe.qualityIds=button.dataset.removeTopic?recipe.qualityIds.filter(id=>id!==button.dataset.removeTopic):[];renderPaths();renderCatalog();persist();renderResults();root.querySelector('#blend-search').focus();return; }
    if (button.dataset.blendPath) {
      recipe.path=button.dataset.blendPath;
      // The oils-first path has no quality picker; never retain hidden selections.
      if (recipe.path==='oils') recipe.qualityIds=[];
      chosenPath=true;renderPaths();renderCatalog();persist();renderResults();
    }
    if (button.dataset.quality) { const id=button.dataset.quality; if(!recipe.qualityIds.includes(id)&&recipe.qualityIds.length>=16){announce('Choose up to 16 research topics at a time.',true);return;} recipe.qualityIds=recipe.qualityIds.includes(id) ? recipe.qualityIds.filter(q=>q!==id) : [...recipe.qualityIds.filter(q=>!research.ancestors(id).some(a=>a.id===q)&&!research.descendants(id,false).includes(q)),id];renderPaths();renderCatalog();persist();renderResults();root.querySelector(`[data-quality="${id}"]`)?.focus(); }
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
      announce('Your blend is ready to review.');persist();
    }
    if (button.id==='blend-save') { try {const encoded=E.encodeRecipe(recipe,data);saved=[encoded,...new Set(saved.map(code=>{try{return E.encodeRecipe(E.decodeRecipe(code,data),data);}catch{return code;}}).filter(code=>code!==encoded))].slice(0,12);persist();renderSaved();document.getElementById('blend-action-status').textContent=storageError?'Could not save to this browser. Copy a share link instead.':'Blend saved.';}catch(error){document.getElementById('blend-action-status').textContent=error.message;} }
    if (button.id==='blend-share') {
      try {const url=new URL(location.pathname,location.origin);url.searchParams.set('tab','blend');url.searchParams.set('recipe',E.encodeRecipe(recipe,data));
        try {await navigator.clipboard.writeText(url.href);document.getElementById('blend-action-status').textContent='Recipe link copied.';}
        catch {document.getElementById('blend-share-fallback').hidden=false;const input=document.getElementById('blend-share-url');input.value=url.href;input.focus();input.select();document.getElementById('blend-action-status').textContent='Select and copy the recipe link below.';}
      } catch(error){document.getElementById('blend-action-status').textContent=error.message;}
    }
    if (button.dataset.loadRecipe!==undefined) {try{recipe=E.decodeRecipe(saved[Number(button.dataset.loadRecipe)],data);chosenPath=true;generated=true;search='';document.getElementById('blend-search').value='';refresh();announce('Saved recipe loaded and checked against the current catalog.');}catch(error){announce(error.message,true);} }
    if (button.dataset.deleteRecipe!==undefined) {saved.splice(Number(button.dataset.deleteRecipe),1);persist();renderSaved();announce('Saved recipe deleted from this device.');}
    if (button.id==='blend-reset') {recipe=initial();filterMode='all';chosenPath=false;generated=false;search='';document.getElementById('blend-search').value='';const url=new URL(location.href);url.searchParams.delete('recipe');history.replaceState({},'',url);lastLink=null;restoreError='';document.getElementById('blend-link-error').hidden=true;refresh();root.querySelector('[data-blend-path]').focus();}
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
