const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const master = require('../master-data.json');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {}),args:['--no-sandbox']});
 const context=await browser.newContext({serviceWorkers:'block'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.TEST_URL || 'http://127.0.0.1:8000';
 const openView=async label=>{
  const button=page.getByRole('button',{name:label,exact:true});
  if(!await button.isVisible()) await page.getByRole('button',{name:['Matrix','Network'].includes(label)?'Visualize':'Oils',exact:true}).click();
  await button.click();
 };
 // New visits open the first tab; explicit oil links and browser Back still work.
 for (const embed of [false,true]) {
  await page.goto(`${base}/${embed?'?embed=1':''}`);
  assert.equal(await page.locator('.tabs .tab').first().getAttribute('data-tab'),'blend');
  assert.equal(await page.locator('#tab-blend').isVisible(),true);
  assert.equal(await page.locator('.tab-panel.active').count(),1);
  await page.getByRole('button',{name:'Oils',exact:true}).click();
  assert.equal(await page.locator('#oil-grid').isVisible(),true);
  await page.goBack();
  assert.equal(await page.locator('#tab-blend').isVisible(),true);
  await page.goto(`${base}/?oil=lemon${embed?'&embed=1':''}`);
  assert.equal(await page.locator('#oil-name').textContent(),'Lemon');
 }
 // Each nested destination restores the correct section, including history and mobile keyboard use.
 assert.deepEqual(await page.locator('.tabs .tab').allTextContents(),['Blend Builder','Oils','Visualize']);
 for(const [view,section] of [['oils','oils'],['studies','oils'],['compounds','oils'],['domains','oils'],['matrix','visualize'],['network','visualize']]) {
  await page.goto(`${base}/?tab=${view}`);
  assert.equal(await page.locator(`.tabs [data-section="${section}"]`).getAttribute('aria-current'),'page');
  assert.equal(await page.locator(`[data-section-nav="${section}"] [data-tab="${view}"]`).getAttribute('aria-current'),'page');
  assert.equal(await page.locator('[data-section-nav]:visible').count(),1);
  assert.equal(await page.locator('.tab-panel.active').count(),1);
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Oils',exact:true}).click();
 await page.getByRole('button',{name:'Studies',exact:true}).focus(); await page.keyboard.press('Enter');
 assert.equal(await page.locator('#tab-studies').isVisible(),true);
 await page.getByRole('button',{name:'Visualize',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'Studies',exact:true}).isVisible(),false);
 await page.getByRole('button',{name:'Network',exact:true}).click();
 await page.goBack(); assert.equal(await page.locator('#tab-matrix').isVisible(),true);
 await page.goBack(); assert.equal(await page.locator('#tab-studies').isVisible(),true);
 assert.equal(await page.locator('.tabs [data-section="oils"]').getAttribute('aria-current'),'page');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 await page.getByRole('button',{name:'Blend Builder',exact:true}).click();
 assert.equal(await page.locator('[data-section-nav]:visible').count(),0);
 await page.setViewportSize({width:1280,height:900});
 // The Matrix is a complete relationship browser, with distinct canonical topic families.
 await page.goto(`${base}/?tab=matrix`);
 assert.deepEqual(await page.locator('#matrix-table [data-matrix-topic]').evaluateAll(nodes=>nodes.map(n=>n.dataset.matrixTopic)),['health','cleaning','microbial','pest']);
 await page.locator('#matrix-group-filter').selectOption('composition');
 assert.deepEqual(await page.locator('#matrix-table [data-matrix-topic]').evaluateAll(nodes=>nodes.map(n=>n.dataset.matrixTopic)),['sensory','botanical']);
 await page.locator('#matrix-group-filter').selectOption('assays');
 assert.equal(await page.locator('#matrix-table [data-matrix-topic]').getAttribute('data-matrix-topic'),'botanical-bioactivity');
 await page.locator('#matrix-table [data-matrix-inspect="oil/lemon"]').click();
 assert.equal(await page.locator('#matrix-inspector-title').textContent(),'Lemon');
 await page.locator('#matrix-inspector [data-matrix-inspect="relationship/lemon/limonene"]').click();
 assert.match(await page.locator('#matrix-inspector').innerText(),/Historical ranges are not plotted/);
 assert.doesNotMatch(await page.locator('#matrix-inspector').innerText(),/60[–-]75%/);
 await page.goBack();
 await page.locator('#matrix-inspector [data-matrix-inspect="relationship/lemon/geranyl-acetate"]').click();
 assert.match(await page.locator('#matrix-inspector').innerText(),/0\.56%/);
 assert.ok(await page.locator('#matrix-inspector a[href^="https:"]').count()>0);
 await page.locator('#matrix-inspector [data-matrix-inspect="oil/lemon"]').click();
 await page.locator('[data-matrix-focus="lemon"]').click();
 assert.equal(await page.locator('#matrix-table tbody tr').count(),1);
 assert.equal(await page.locator('#matrix-table thead [data-matrix-inspect]').count(),42);
 assert.equal(await page.locator('#matrix-table [data-matrix-inspect="relationship/lemon/prenylthiol"]').innerText(),'Other material');
 await page.locator('#matrix-chemical-filter').selectOption('group:ester');
 const matrixRoute=page.url();
 await page.locator('#matrix-table [data-matrix-inspect="relationship/lemon/geranyl-acetate"]').click();
 const detailRoute=page.url();
 await page.reload();
 assert.equal(await page.locator('#matrix-inspector-title').textContent(),'Lemon → Geranyl acetate');
 assert.equal(await page.locator('#matrix-oil-filter').inputValue(),'lemon');
 assert.equal(await page.locator('#matrix-chemical-filter').inputValue(),'group:ester');
 await page.goBack(); await page.waitForURL(matrixRoute);
 assert.equal(await page.locator('#matrix-inspector').isVisible(),false);
 await page.goForward(); await page.waitForURL(detailRoute);
 await page.locator('[data-matrix-view="compound-topics"]').click();
 assert.equal(await page.locator('#matrix-table tbody tr').count(),42);
 await page.locator('[data-matrix-view="study-topics"]').click();
 assert.equal(await page.locator('#matrix-table tbody tr').count(),master.registries.studies.length);
 await page.locator('#matrix-inventory [data-matrix-inspect="sources"]').click();
 assert.equal(await page.locator('#matrix-inspector .chem-evidence').count(),50);
 // Complete an oil -> compound -> paper/topic path without leaving the Matrix.
 await page.goto(`${base}/?tab=matrix&inspect=compound/limonene&embed=1`);
 await page.locator('#matrix-inspector [data-matrix-topic-link]').first().click();
 assert.equal(await page.locator('#tab-matrix').isVisible(),true);
 assert.equal(new URL(page.url()).searchParams.get('embed'),'1');
 assert.ok(new URL(page.url()).searchParams.get('domain'));
 // Scroll belongs to the large table, never to the whole page, including open details.
 for(const width of [320,390,768,1440]) {
  await page.setViewportSize({width,height:900});
  for(const embed of [false,true]) {
   await page.goto(`${base}/?tab=matrix&matrixMode=oil-compounds&matrixOil=lemon&inspect=relationship/lemon/geranyl-acetate${embed?'&embed=1':''}`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`Matrix overflow ${width} embed ${embed}`);
   assert.equal(await page.locator('#matrix-inspector-title').isVisible(),true);
  }
 }
 // Unknown route IDs must not resolve inherited Object prototype properties.
 for(const [tab,key,prefix] of [['oils','oil','oil'],['compounds','compound','compound']]) {
  for(const id of ['constructor','__proto__']) {
   await page.goto(`${base}/?tab=${tab}&${key}=${encodeURIComponent(id)}`);
   assert.equal(await page.locator(`#${prefix}-list-view`).isVisible(),true);
   assert.equal(await page.locator(`#${prefix}-detail`).isVisible(),false);
   await page.evaluate(value=>{showOil(value);showCompound(value);},id);
   assert.equal(await page.locator(`#${prefix}-list-view`).isVisible(),true);
  }
 }
 // Returning by a main tab must serialize retained filters before reload/history.
 for(const embed of [false,true]) {
  const suffix=embed?'&embed=1':'';
  await page.goto(`${base}/?tab=studies${suffix}`);
  await page.locator('#study-domain-filter').selectOption('health');
  await page.locator('#study-domain-filter-navigation .topic-child-select').selectOption('health-respiratory');
  await page.locator('#study-oil-filter').selectOption('eucalyptus');
  await page.locator('#study-compound-filter').selectOption('eucalyptol');
  const studyIds=await page.locator('#study-list .study').evaluateAll(cards=>cards.map(card=>card.dataset.studyId).sort());
  assert.ok(studyIds.length>0,'Filter-state test must retain a nonempty real result');
  const assertStudyState=async()=>{
   const params=new URL(page.url()).searchParams;
   for(const [key,value] of [['tab','studies'],['oil','eucalyptus'],['compound','eucalyptol'],['domain','health-respiratory']]) assert.equal(params.get(key),value,`Retained study ${key}`);
   assert.equal(await page.locator('#study-oil-filter').inputValue(),'eucalyptus');
   assert.equal(await page.locator('#study-compound-filter').inputValue(),'eucalyptol');
   assert.equal(await page.locator('#study-domain-filter').inputValue(),'health-respiratory');
   assert.deepEqual(await page.locator('#study-list .study').evaluateAll(cards=>cards.map(card=>card.dataset.studyId).sort()),studyIds);
   assert.equal(params.get('embed'),embed?'1':null);
  };
  await openView('Compounds');
  await page.getByRole('button',{name:'Studies',exact:true}).click();
  await assertStudyState();
  await page.goBack(); assert.equal(await page.locator('#tab-compounds').isVisible(),true);
  await page.goForward(); await assertStudyState();
  await page.reload(); await assertStudyState();
  for(const [tab,label,filter] of [['oils','Oils','oil-domain-filter'],['matrix','Matrix','matrix-domain-filter']]) {
   await page.goto(`${base}/?tab=${tab}${suffix}`);
   await page.locator(`#${filter}`).selectOption('health');
   await page.locator(`#${filter}-navigation .topic-child-select`).selectOption('health-respiratory');
   const snapshot=async()=>tab==='oils'
    ? page.locator('#oil-grid .card').evaluateAll(cards=>cards.map(card=>card.dataset.oil).sort())
    : page.locator('#matrix-table .cell').evaluateAll(cells=>cells.map(cell=>[cell.dataset.oil,cell.dataset.domain,cell.textContent.trim()]));
   const expected=await snapshot(); assert.ok(expected.length>0);
   const assertTopicState=async()=>{
    const params=new URL(page.url()).searchParams;
    assert.equal(params.get('tab'),tab); assert.equal(params.get('domain'),'health-respiratory');
    assert.equal(await page.locator(`#${filter}`).inputValue(),'health-respiratory');
    assert.deepEqual(await snapshot(),expected,`${label} result set survives navigation`);
    assert.equal(params.get('embed'),embed?'1':null);
   };
   await openView('Compounds');
   await openView(label);
   await assertTopicState();
   await page.goBack(); assert.equal(await page.locator('#tab-compounds').isVisible(),true);
   await page.goForward(); await assertTopicState();
   await page.reload(); await assertTopicState();
  }
 }
 // Evidence links must bind once: one click, one history entry, one Back.
 for (const route of [
  {compound:'nobiletin',attribute:'data-goto-oil',target:'sweet-orange',destination:'oil'},
  {compound:'citral',attribute:'data-goto-compound',target:'citronellal',destination:'compound'}
 ]) {
  await page.goto(`${base}/?tab=compounds&compound=${route.compound}&embed=1`);
  const startUrl=page.url();
  const link=page.locator(`#compound-material-evidence [${route.attribute}="${route.target}"]`).first();
  await link.locator('xpath=ancestor::details[contains(@class,"chem-evidence")]').locator(':scope > summary').click();
  await page.evaluate(()=>{
   window.testPushCount=0;
   const original=history.pushState.bind(history);
   history.pushState=(...args)=>{window.testPushCount++;return original(...args);};
  });
  await link.click();
  assert.equal(new URL(page.url()).searchParams.get(route.destination),route.target);
  assert.equal(await page.evaluate(()=>window.testPushCount),1,'One evidence click must navigate once');
  // pushState count plus Back verifies a single entry without Chromium's 50-entry history cap.
  await page.goBack();
  await page.waitForURL(startUrl);
  assert.equal(await page.locator('#compound-name').textContent(),route.compound==='citral'?'Citral':'Nobiletin');
  assert.equal(await page.locator('#compound-detail').isVisible(),true);
 }
 for(const width of [320,390,768,1440]) {
  await page.setViewportSize({width,height:900});
  for(const embed of [false,true]) {
   await page.goto(`${base}/?tab=oils&oil=cannabis${embed?'&embed=1':''}`);
   await page.locator('.oil-more > summary').click();
   await page.locator('#oil-beyond > .beyond-terpenes > summary').click();
   await page.locator('#oil-beyond .oil-chemistry > summary').click();
   await page.locator('#oil-beyond .chem-evidence').first().locator(':scope > summary').click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`overflow ${width} embed ${embed}`);
   assert.equal(await page.locator('.lab-return').isVisible(),!embed);
   assert.equal(await page.locator('#oil-chart canvas').count(),0);
   assert.ok(/not quantified/i.test(await page.locator('#oil-beyond').innerText()));
   if(width===390 && !embed) await page.locator('#oil-beyond').screenshot({path:'/tmp/terpene-beyond-mobile.png',style:'.lab-header { visibility:hidden; }'});
  }
 }
 await openView('Compounds');
 await page.locator('#compound-category-filter').selectOption('group:aldehyde');
 assert.equal(await page.locator('#compound-grid .card').count(),3);
 await page.locator('#compound-search').fill('neral');
 assert.equal(await page.locator('#compound-grid .card').count(),1);
 await page.locator('#compound-grid .card').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#compound-name').textContent(),'Citral');
 await page.getByRole('button',{name:'All compounds',exact:false}).click();
 await page.locator('#compound-search').fill('');await page.locator('#compound-category-filter').selectOption('group:ester');
 assert.ok((await page.locator('#compound-grid').innerText()).includes('Linalyl Acetate'));
 await page.locator('[data-c="linalyl-acetate"]').click();
 assert.ok((await page.locator('#compound-chemistry').innerText()).includes('Esters'));
 await page.getByRole('button',{name:'Studies',exact:true}).click();
 await page.locator('#study-group-filter').selectOption('thiol');
 assert.ok((await page.locator('#study-list').innerText()).includes('Oswald'));
 for(const tab of ['Oils','Matrix','Uses','Network','Compounds','Studies']) {
  await openView(tab);
  assert.equal(await page.locator('.tab-panel.active').count(),1);
 }
 await page.goto(`${base}/?tab=compounds&compound=cannflavin-a&embed=1`);
 assert.equal(await page.locator('#compound-name').textContent(),'Cannflavin A');
 assert.equal(await page.locator('#compound-oils-chart canvas').count(),0);
 assert.ok((await page.locator('#compound-material-evidence').innerText()).includes('Plant material'));
 await page.goto(`${base}/?tab=compounds&compound=nobiletin`);
 assert.equal(await page.locator('#compound-oil-links button').count(),3);
 assert.equal(await page.locator('#compound-oils-chart canvas').count(),0);
 // Source-backed quantities must survive legacy constituent placeholders in UI.
 for (const [compound,oil,value] of [['citronellal','citronella','27.87'],['cinnamaldehyde','cinnamon','77.42'],['linalyl-acetate','clary-sage','49.1'],['linalyl-acetate','bergamot','36.3']]) {
  await page.evaluate(id=>showCompound(id),compound);
  assert.ok((await page.locator(`#compound-oil-links [data-goto-oil="${oil}"]`).innerText()).includes(`${value}% in cited sample`));
 }
 // New oil records include quantified, source-backed constituent samples.
 assert.equal(await page.locator('#oil-sort option[value="compound"]').evaluate(el=>!el.disabled && !el.hidden),true);
 await openView('Network');
 const graph=await page.evaluate(()=>echarts.getInstanceByDom(document.getElementById('network-chart')).getOption().series[0]);
 for(const node of graph.data.filter(n=>n.id.startsWith('compound:'))) assert.ok(graph.links.some(e=>e.target===node.id),`orphan ${node.id}`);
 for(const id of ['menthyl-acetate','geranyl-acetate','grapefruit-thiol','nobiletin']) assert.ok(graph.links.some(e=>e.target===`compound:${id}`));
 const nonvolatile=graph.links.filter(e=>e.target==='compound:nobiletin');
 assert.equal(nonvolatile.length,3);
 assert.ok(nonvolatile.every(e=>e.kind==='nonvolatile-oil' && e.lineStyle.type==='dashed' && e.description.includes('nonvolatile oil fraction')));
 assert.ok(!graph.links.some(e=>['compound:prenylthiol','compound:cannflavin-a'].includes(e.target)));
 // Missing ranges must stay safe in both directions and pathway rendering.
 await page.evaluate(()=>{oilById.lemon.constituents.push({compoundId:'prenylthiol',range:null});showOil('lemon');showCompound('prenylthiol');});
 assert.equal(await page.locator('#compound-oils-chart canvas').count(),0);
 const labels = await page.evaluate(()=>{
  const chart=rangeBarChart(document.getElementById('compound-oils-chart'),[{name:'First sample',id:'first',min:8,max:12},{name:'Second sample',id:'second',min:20,max:25}], '#efbd69');
  const option=chart.getOption();
  return [option.series[0].label.formatter({dataIndex:0}),option.tooltip[0].formatter({dataIndex:1})];
 });
 assert.equal(labels[0],'8-12%');assert.ok(labels[1].includes('Second sample'));
 const framePage=await context.newPage();
 await framePage.setContent(`<iframe title="Embedded lab" src="${base}/?tab=oils&oil=lemon"></iframe>`);
 const embedded=framePage.frameLocator('iframe');
 await embedded.locator('#oil-name').waitFor();
 assert.equal(await embedded.locator('html.lab-embedded').count(),1);
 assert.equal(await embedded.locator('.lab-return').isVisible(),false);
 await framePage.close();
 assert.equal(errors.length,0,errors.join('\n'));
 await browser.close();
 console.log('PASS: mobile/desktop and embed layouts; filters, aliases, keyboard access, missing ranges, tabs and deep links; no page errors');
})().catch(e=>{console.error(e);process.exit(1)});
