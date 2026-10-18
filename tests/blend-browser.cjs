/* Browser regression tests for the exploratory Blend Builder.
 * Never posts to checkout or places an order. All non-GET and external requests
 * are blocked, including the clean-context share-link check.
 * Run: TEST_URL=http://127.0.0.1:8010 PLAYWRIGHT_MODULE=/path/to/playwright
 *      CHROME_PATH=/usr/bin/chromium node tests/blend-browser.cjs
 */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const E = require('../blend-engine.js');
const Research = require('../research.js');
const dataContext = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../data.js'), 'utf8') + '\nthis.data = TERPENE_DATA;', dataContext);
const data = JSON.parse(JSON.stringify(dataContext.data));
const base = (process.env.TEST_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const origin = new URL(base).origin;
const STORAGE = 'terpene-lab:blend:v1';
const TOPICS = {calm:'health-mental-health',focus:'health-cognitive',sleep:'health-mental-health-sleep',uplifting:'health-mental-health-mood'};
const research = Research.create(data);
const oilIds = ['lavender', 'lemon', 'rosemary', 'peppermint', 'sweet-orange'];
const seed = (overrides = {}) => ({v:1,catalogVersion:data.blendBuilder.catalogVersion,name:'Evening garden',path:'oils',qualityIds:[],petContext:false,oils:[{id:'lavender',percent:60},{id:'lemon',percent:40}],...overrides});
const recipeUrl = (recipe, embed = false) => `${base}/?tab=blend&recipe=${E.encodeRecipe(recipe, data)}${embed ? '&embed=1' : ''}`;
const rawRecipeUrl = recipe => `${base}/?tab=blend&recipe=${Buffer.from(JSON.stringify(recipe),'utf8').toString('base64url')}`;
const failures = [], pageErrors = [], unexpectedWrites = [];
let browser;
async function intercept(context, name, fixture) {
  await context.route('**/*', route => {
    const request=route.request(), url=new URL(request.url());
    if (request.method()!=='GET') {
      unexpectedWrites.push(`${name}: ${request.method()} ${request.url()}`);
      return route.abort('blockedbyclient');
    }
    if (url.origin!==origin) return route.abort('blockedbyclient');
    if (fixture && url.pathname.endsWith('/data.js')) return route.fulfill({status:200,contentType:'application/javascript',body:`const TERPENE_DATA = ${JSON.stringify(fixture)};`});
    return route.continue();
  });
}
async function test(name, callback, init, fixture) {
  const context = await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width:1440,height:1000}});
  if (init) await context.addInitScript(init);
  await intercept(context,name,fixture);
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => pageErrors.push(`${name}: ${error.message}`));
  try { await callback(page, context); console.log(`PASS: ${name}`); }
  catch (error) { failures.push(`${name}: ${error.stack || error}`); console.error(`FAIL: ${name}: ${error.message}`); }
  finally { await context.close(); }
}
async function open(page, query = '?tab=blend') { await page.goto(base+'/'+query); await page.locator('#blend-builder .blend-paths').waitFor(); }
async function choose(page, pathway = 'oils') { await page.locator(`[data-blend-path="${pathway}"]`).click(); }
async function revealTopic(page, id) {
  const button=page.locator(`#blend-quality-picker [data-quality="${id}"]`);
  // Open native disclosures from the outside in. Never force-click hidden topics.
  const ancestors=await button.evaluate(node=>{
    const ids=[];
    for(let parent=node.parentElement;parent;parent=parent.parentElement) if(parent.matches('details[data-topic-branch]')) ids.unshift(parent.dataset.topicBranch);
    return ids;
  });
  for(const ancestor of ancestors) {
    const branch=page.locator(`[data-topic-branch="${ancestor}"]`);
    if(!await branch.evaluate(node=>node.open)) await branch.locator(':scope > summary').click();
  }
  assert.equal(await button.isVisible(),true,`Topic ${id} is reachable through native disclosures`);
  return button;
}
async function topic(page, id) { await (await revealTopic(page,id)).click(); }
async function add(page, id) {
  const button=page.locator(`[data-add-oil="${id}"]`);
  if(!await button.isVisible() && await button.evaluate(node=>Boolean(node.closest('.blend-related-catalog')))) await page.locator('.blend-related-catalog > summary').click();
  await button.click();
}
async function selected(page) { return page.locator('[data-portion]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.portion,percent:Number(node.value)}))); }
async function selectedTopics(page) { return page.locator('[data-quality][aria-pressed="true"]').evaluateAll(nodes=>nodes.map(node=>node.dataset.quality).sort()); }
async function catalogIds(page, contextual=false) {
  return page.locator(contextual?'.blend-related-catalog [data-add-oil]':'#blend-oil-catalog > .blend-oil-card [data-add-oil]').evaluateAll(nodes=>nodes.map(node=>node.dataset.addOil).sort());
}
async function assertCatalog(page, topics, source=data) {
  const r=Research.create(source), oils=source.oils.filter(o=>o.blend?.enabled);
  const direct=oils.filter(o=>!topics.length || r.studiesForOil(o.id,topics,{eligibleOnly:true}).length).map(o=>o.id).sort();
  const related=topics.length?oils.filter(o=>!direct.includes(o.id) && r.studiesForOil(o.id,topics).length).map(o=>o.id).sort():[];
  assert.deepEqual(await catalogIds(page),direct,'Only reviewed oil/topic pairs enter the direct catalog');
  assert.deepEqual(await catalogIds(page,true),related,'Contextual-only oil/topic pairs stay separate');
  const text=await page.locator('#blend-catalog-count').innerText();
  assert.ok(text.includes(topics.length?`${direct.length} oils with reviewed research matches; ${related.length} with other linked research`:`${direct.length} oils in the Lab catalog`),text);
  assert.match(text,/not effectiveness rankings/);
  return {direct,related};
}
function dynamicFixture() {
  const fixture=JSON.parse(JSON.stringify(data));
  const nodes=[
    {id:'fixture-blend-root',label:'TEST-ONLY new research',parentId:null},
    {id:'fixture-blend-system',label:'TEST-ONLY system',parentId:'fixture-blend-root'},
    {id:'fixture-blend-model',label:'TEST-ONLY model',parentId:'fixture-blend-system'},
    {id:'fixture-blend-leaf',label:'TEST-ONLY deep topic',parentId:'fixture-blend-model'},
    {id:'fixture-blend-sibling',label:'TEST-ONLY second topic',parentId:'fixture-blend-root'}
  ];
  fixture.taxonomy.nodes.push(...nodes);
  for(const node of nodes) fixture.taxonomy.aliases[node.id]=node.id;
  const papers=[
    {id:'fixture-blend-direct',oilIds:['lavender'],useNodeIds:['fixture-blend-leaf']},
    {id:'fixture-blend-context',oilIds:['lemon'],useNodeIds:['fixture-blend-leaf']},
    {id:'fixture-blend-shared',oilIds:['lemon','rosemary'],useNodeIds:['fixture-blend-sibling']}
  ];
  for(const paper of papers) fixture.studies.push({...paper,title:`TEST-ONLY ${paper.id}`,authors:'Synthetic fixture',journal:'No publication',year:2026,studyType:'in-vitro',context:'in-vitro',evidenceLevel:'laboratory',compoundIds:[],url:'https://paper.blend-fixture.test/'+paper.id,material:'TEST-ONLY essential oil',model:'Synthetic fixture',outcome:'No real finding',finding:'TEST-ONLY synthetic research relationship for regression tests. This is not scientific evidence.',limitations:'Synthetic fixture; no efficacy or safety claim.'});
  fixture.evidenceAssertions.push(
    {id:'fixture-blend-a1',kind:'study-use',oilId:'lavender',studyId:'fixture-blend-direct',useNodeId:'fixture-blend-leaf',researchMatch:true},
    {id:'fixture-blend-a2',kind:'study-use',oilId:'lemon',studyId:'fixture-blend-context',useNodeId:'fixture-blend-leaf',researchMatch:false,material:'Related extract, not the essential oil',limitations:'Context only; applicability unverified.'},
    {id:'fixture-blend-a3',kind:'study-use',oilId:'lemon',studyId:'fixture-blend-shared',useNodeId:'fixture-blend-sibling',researchMatch:true},
    {id:'fixture-blend-a4',kind:'study-use',oilId:'rosemary',studyId:'fixture-blend-shared',useNodeId:'fixture-blend-sibling',researchMatch:true}
  );
  return fixture;
}
async function assertNoPurchase(page) {
  assert.equal(await page.locator('#blend-checkout').count(), 0, 'Missing real Shopify variant must never expose purchase');
  assert.match(await page.locator('#blend-results').innerText(), /Shopify ordering is being set up/);
}
async function assertNoOverflow(page, label) {
  const sizes = await page.evaluate(()=>({width:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth,builder:document.getElementById('blend-builder').getBoundingClientRect().right}));
  assert.ok(sizes.html<=sizes.width+1 && sizes.body<=sizes.width+1 && sizes.builder<=sizes.width+1,`${label}: ${JSON.stringify(sizes)}`);
}
(async()=>{
  browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
  await test('equal entry paths, all catalog oils and source-backed topic filtering', async page=>{
    await open(page);
    assert.equal(await page.locator('#blend-workspace').isVisible(),false);
    const cards = await page.locator('[data-blend-path]').evaluateAll(nodes=>nodes.map(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height,pressed:n.getAttribute('aria-pressed')})));
    assert.equal(cards.length,2); assert.ok(Math.abs(cards[0].width-cards[1].width)<1); assert.ok(Math.abs(cards[0].height-cards[1].height)<1); assert.deepEqual(cards.map(c=>c.pressed),['false','false']);
    await choose(page,'qualities');
    assert.equal(await page.locator('#blend-quality-picker').isVisible(),true);
    assert.equal(data.oils.length,28,'The complete catalog has 28 oils');
    assert.deepEqual(await catalogIds(page),data.oils.map(o=>o.id).sort(),'Every catalog oil is selectable without a topic');
    assert.equal(await page.locator('[data-add-oil]:disabled').count(),0,'Every oil starts available for exploration');
    await topic(page,TOPICS.focus);
    const expected=await assertCatalog(page,[TOPICS.focus]);
    assert.ok(expected.direct.length+expected.related.length>0,'The topic retains its bibliography, even when applicability is contextual');
    await add(page,expected.direct[0] || expected.related[0]);
    assert.equal((await selected(page)).length,1);
    await choose(page,'oils');
    assert.equal(await page.locator('#blend-quality-picker').isVisible(),false);
    assert.equal(await page.locator('[data-add-oil]').count(),data.oils.length);
    assert.deepEqual(await selectedTopics(page),[]);
    await assertCatalog(page,[]);
    assert.equal((await selected(page)).length,1,'Switching path keeps selected oils');
    await page.locator('#blend-search').fill('no-such-oil-xyz');
    assert.equal(await page.locator('[data-add-oil]').count(),0);
    assert.match(await page.locator('#blend-oil-catalog').innerText(),/No oils match/);
    await page.locator('#blend-search').fill('lavandula');
    assert.equal(await page.locator('[data-add-oil="lavender"]').count(),1);
  });
  await test('data-only deep taxonomy appears progressively with parent-descendant and OR counts',async page=>{
    const fixture=dynamicFixture(), r=Research.create(fixture);
    await open(page);await choose(page,'qualities');
    const root=page.locator('[data-topic-branch="fixture-blend-root"]');
    assert.equal(await root.evaluate(node=>node.open),false,'A new top-level branch starts collapsed');
    assert.equal(await page.locator('[data-quality="fixture-blend-leaf"]').isVisible(),false,'Deep topic is not dumped into the initial picker');
    const rendered=await page.locator('#blend-qualities [data-quality]').evaluateAll(nodes=>nodes.map(node=>node.dataset.quality));
    const reachable=[...new Set(r.roots().flatMap(node=>r.descendants(node.id)))];
    assert.deepEqual(rendered.slice().sort(),reachable.sort(),'Picker derives all reachable topics from data');
    for(const id of ['fixture-blend-root','fixture-blend-system','fixture-blend-model']) {
      const summary=page.locator(`[data-topic-branch="${id}"] > summary`);
      await summary.focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator(`[data-topic-branch="${id}"]`).evaluate(node=>node.open),true);
    }
    assert.equal(await page.locator('[data-quality="fixture-blend-leaf"]').isVisible(),true);
    assert.equal(await page.locator('[data-quality="fixture-blend-leaf"] small').innerText(),'2','Count includes one direct and one contextual oil');
    await topic(page,'fixture-blend-leaf');
    assert.deepEqual((await assertCatalog(page,['fixture-blend-leaf'],fixture)).direct,['lavender']);
    await topic(page,'fixture-blend-sibling');
    assert.deepEqual((await assertCatalog(page,['fixture-blend-leaf','fixture-blend-sibling'],fixture)).direct,['lavender','lemon','rosemary'],'Multiple topics use an OR union');
    assert.equal(await page.locator('.blend-related-catalog').count(),0,'An oil with any reviewed selected-topic match appears once in the direct group');
    await topic(page,'fixture-blend-leaf');await topic(page,'fixture-blend-sibling');
    await topic(page,'fixture-blend-root');
    assert.equal(await page.locator('[data-quality="fixture-blend-root"] small').innerText(),'3','Parent count deduplicates oils across descendant topics');
    assert.deepEqual((await assertCatalog(page,['fixture-blend-root'],fixture)).direct,['lavender','lemon','rosemary'],'Parent includes every descendant branch');
    await topic(page,'fixture-blend-leaf');
    assert.deepEqual((await assertCatalog(page,['fixture-blend-root','fixture-blend-leaf'],fixture)).direct,['lavender','lemon','rosemary'],'Parent plus child does not double count oils');
    await add(page,'lavender');await page.locator('#blend-generate').click();
    assert.deepEqual(await page.locator('.blend-profile .study').evaluateAll(nodes=>nodes.map(node=>node.dataset.studyId)),['fixture-blend-direct'],'Parent plus child does not repeat the same paper');
    for(const id of ['fixture-blend-system','fixture-blend-model','fixture-blend-sibling']) await topic(page,id);
    const allFive=fixture.taxonomy.nodes.filter(node=>node.id.startsWith('fixture-blend-')).map(node=>node.id).sort();
    assert.deepEqual(await selectedTopics(page),allFive,'The topic picker is not limited to the four legacy qualities');
    await page.locator('#blend-save').click();
    const code=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).saved[0],STORAGE);
    assert.deepEqual(JSON.parse(Buffer.from(code,'base64url').toString('utf8')).qualityIds,allFive,'Every selected data-only topic survives serialization');
    await page.goto(`${base}/?tab=blend&recipe=${code}`);
    assert.deepEqual(await selectedTopics(page),allFive,'Data-only topics survive a shared recipe reload');
  },null,dynamicFixture());
  await test('contextual-only topics stay collapsed and explicitly qualify the canonical paper',async page=>{
    const fixture=dynamicFixture();
    await open(page);await choose(page,'qualities');await topic(page,'fixture-blend-leaf');
    await assertCatalog(page,['fixture-blend-leaf'],fixture);
    const related=page.locator('.blend-related-catalog');
    assert.equal(await related.evaluate(node=>node.open),false);
    assert.equal(await page.locator('[data-add-oil="lemon"]').isVisible(),false);
    await related.locator(':scope > summary').focus();await page.keyboard.press('Space');
    assert.equal(await related.evaluate(node=>node.open),true,'Contextual bibliography expands through a native keyboard disclosure');
    assert.match(await related.innerText(),/missing match is not evidence of no effect/);
    assert.match(await related.innerText(),/Other linked research/);
    await add(page,'lemon');await page.locator('#blend-generate').click();
    const profile=page.locator('.blend-profile');
    assert.match(await profile.innerText(),/1 linked papers · 0 with reviewed oil-specific topic matches/);
    assert.deepEqual(await profile.locator('.study').evaluateAll(nodes=>nodes.map(node=>node.dataset.studyId)),['fixture-blend-context']);
    await profile.locator('.research-assessments > summary').click();
    assert.match(await profile.locator('.research-assessment').innerText(),/Context only; applicability unverified/);
    assert.match(await profile.locator('.research-assessment').innerText(),/Related extract, not the essential oil/);
    assert.equal(await profile.locator('.blend-profile-cautions').isVisible(),true);
    await assertNoPurchase(page);
  },null,dynamicFixture());
  await test('legacy topic drafts, saved recipes and shared links migrate and deduplicate canonical aliases',async page=>{
    const old=seed({path:'qualities',qualityIds:['calm',TOPICS.calm,'focus','sleep','uplifting']});
    const canonical=Object.values(TOPICS).sort(), oldCode=Buffer.from(JSON.stringify(old),'utf8').toString('base64url');
    await open(page);
    await page.evaluate(({key,old,oldCode})=>localStorage.setItem(key,JSON.stringify({draft:{...old,oils:[{id:'lavender',percent:25}]},saved:[oldCode]})),{key:STORAGE,old,oldCode});
    await page.reload();
    assert.deepEqual(await selectedTopics(page),canonical,'All four legacy aliases migrate, with alias/canonical overlap deduplicated');
    assert.deepEqual(await selected(page),[{id:'lavender',percent:25}],'Migration preserves incomplete draft portions');
    const draft=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft,STORAGE);
    assert.deepEqual(draft.qualityIds.slice().sort(),canonical);
    await page.locator('[data-load-recipe="0"]').click();
    assert.deepEqual(await selectedTopics(page),canonical);
    assert.equal(await page.locator('#blend-results').isVisible(),true);
    await page.locator('#blend-save').click();
    const codes=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).saved,STORAGE);
    assert.equal(codes.length,1,'Re-saving a migrated recipe replaces the equivalent legacy encoding');
    const saved=JSON.parse(Buffer.from(codes[0],'base64url').toString('utf8'));
    assert.equal(saved.v,1);assert.equal(saved.catalogVersion,'2026-10-18');assert.deepEqual(saved.qualityIds,canonical);
    await page.locator('#blend-share').click();
    const sharedUrl=await page.locator('#blend-share-url').inputValue();
    assert.deepEqual(JSON.parse(Buffer.from(new URL(sharedUrl).searchParams.get('recipe'),'base64url').toString('utf8')).qualityIds,canonical);
    await page.goto(rawRecipeUrl(old));
    assert.deepEqual(await selectedTopics(page),canonical,'Raw legacy shared bytes are accepted and normalized');
    assert.equal(await page.locator('#blend-link-error').isVisible(),false);
    await topic(page,TOPICS.sleep);
    assert.ok(!(await selectedTopics(page)).includes(TOPICS.sleep));
    await page.getByRole('button',{name:'Oils',exact:true}).click();await page.goBack();
    assert.deepEqual(await selectedTopics(page),canonical,'Back restores the canonical selection from the legacy URL');
    await page.goto(sharedUrl);assert.deepEqual(await selectedTopics(page),canonical);
    await assertNoPurchase(page);
  },()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Test denied clipboard');}}});});
  await test('selected-topic profiles and library links share one canonical study collection',async page=>{
    await open(page);await choose(page,'qualities');await topic(page,'fixture-blend-leaf');await add(page,'lavender');
    await page.locator('#blend-generate').click();
    const card=page.locator('.blend-profile [data-study-id="fixture-blend-direct"]');
    const title=await card.locator('h4').innerText(), finding=await card.locator('.finding').innerText();
    assert.deepEqual(await card.locator('[data-goto-use]').evaluateAll(nodes=>nodes.map(node=>node.dataset.gotoUse)),['fixture-blend-leaf']);
    const href=await page.locator('.blend-library-link').getAttribute('href');
    assert.equal(new URL(href).searchParams.get('tab'),'studies');
    assert.equal(new URL(href).searchParams.get('oil'),'lavender');
    assert.equal(new URL(href).searchParams.get('domain'),'fixture-blend-leaf');
    const builderUrl=page.url();
    await page.locator('.blend-library-link').click();
    await page.waitForURL(href,{waitUntil:'load'});
    const library=page.locator('#tab-studies .study[data-study-id="fixture-blend-direct"]');
    await library.waitFor({state:'visible'});
    assert.equal(await library.isVisible(),true);
    assert.equal(await library.locator('h4').innerText(),title);
    assert.equal(await library.locator('.finding').innerText(),finding);
    assert.equal(await page.locator('#tab-studies .study').count(),1);
    await page.goBack();
    await page.waitForURL(builderUrl,{waitUntil:'load'});
    await page.locator('#blend-quality-picker').waitFor({state:'visible'});
    assert.deepEqual(await selectedTopics(page),['fixture-blend-leaf']);
    assert.deepEqual(await selected(page),[{id:'lavender',percent:100}]);
  },null,dynamicFixture());
  await test('switching to oils-first clears qualities through draft, save, share and repeated switches',async page=>{
    await open(page);await choose(page,'qualities');
    await topic(page,TOPICS.calm);
    await topic(page,TOPICS.focus);
    await add(page,'lavender');await page.locator('#blend-name').fill('Path switch recipe');
    await page.locator('#blend-pets').check();await page.locator('#blend-generate').click();
    const before=await selected(page);
    await choose(page,'oils');
    assert.equal(await page.locator('#blend-quality-picker').isVisible(),false);
    assert.deepEqual(await selected(page),before,'Switching keeps the oil recipe');
    let draft=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft,STORAGE);
    assert.equal(draft.path,'oils');assert.deepEqual(draft.qualityIds,[]);
    assert.equal(draft.name,'Path switch recipe');assert.equal(draft.petContext,true);
    await page.locator('#blend-save').click();
    const savedCode=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).saved[0],STORAGE);
    assert.deepEqual(JSON.parse(Buffer.from(savedCode,'base64url').toString('utf8')).qualityIds,[],'Saved bytes contain no hidden qualities');
    await page.locator('#blend-share').click();
    const url=await page.locator('#blend-share-url').inputValue();
    const shared=JSON.parse(Buffer.from(new URL(url).searchParams.get('recipe'),'base64url').toString('utf8'));
    assert.equal(shared.path,'oils');assert.deepEqual(shared.qualityIds,[],'Shared bytes contain no hidden qualities');
    await page.locator('#blend-reset').click();await page.locator('[data-load-recipe="0"]').click();
    await choose(page,'qualities');
    assert.equal(await page.locator('[data-quality][aria-pressed="true"]').count(),0,'Loading and returning to qualities must not resurrect selections');
    await topic(page,TOPICS.sleep);
    draft=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft,STORAGE);
    assert.deepEqual(draft.qualityIds,[TOPICS.sleep],'Visible canonical topics remain editable');
    await choose(page,'oils');await choose(page,'oils');await choose(page,'qualities');
    assert.equal(await page.locator('[data-quality][aria-pressed="true"]').count(),0);
    await page.goto(url);
    draft=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft,STORAGE);
    assert.equal(draft.path,'oils');assert.deepEqual(draft.qualityIds,[]);
    assert.equal(await page.locator('#blend-name').inputValue(),'Path switch recipe');
    assert.equal(await page.locator('#blend-pets').isChecked(),true);await assertNoPurchase(page);
  },()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Test denied clipboard');}}});});
  await test('older oils-first drafts, saved recipes and shared links discard hidden qualities',async page=>{
    await open(page);
    const old=seed({qualityIds:['focus','calm']});
    const oldCode=Buffer.from(JSON.stringify(old),'utf8').toString('base64url');
    await page.evaluate(({key,old,oldCode})=>localStorage.setItem(key,JSON.stringify({draft:{...old,oils:[{id:'lavender',percent:25}]},saved:[oldCode]})),{key:STORAGE,old,oldCode});
    await page.reload();
    let draft=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft,STORAGE);
    assert.deepEqual(draft.qualityIds,[],'Unfinished legacy draft is normalized');
    assert.deepEqual(await selected(page),[{id:'lavender',percent:25}],'Unfinished oil proportions are preserved');
    await choose(page,'qualities');assert.equal(await page.locator('[data-quality][aria-pressed="true"]').count(),0);
    await page.locator('[data-load-recipe="0"]').click();
    draft=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft,STORAGE);
    assert.equal(draft.path,'oils');assert.deepEqual(draft.qualityIds,[]);
    await choose(page,'qualities');assert.equal(await page.locator('[data-quality][aria-pressed="true"]').count(),0);
    await page.goto(rawRecipeUrl(old));
    draft=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft,STORAGE);
    assert.equal(draft.path,'oils');assert.deepEqual(draft.qualityIds,[]);
    await choose(page,'qualities');assert.equal(await page.locator('[data-quality][aria-pressed="true"]').count(),0);
    assert.equal(await page.locator('#blend-results').isVisible(),true);await assertNoPurchase(page);
  });
  await test('add up to five oils, rebalance, prevent duplicates, remove and re-add',async page=>{
    await open(page); await choose(page);
    for(const [index,id] of oilIds.entries()) {
      await add(page,id);
      assert.equal((await selected(page)).length,index+1,`Adding ${id}`);
      assert.equal(await page.locator('#blend-total').innerText(),'100%');
      assert.equal(await page.locator(`[data-add-oil="${id}"]`).isDisabled(),true);
    }
    assert.equal(await page.locator('[data-add-oil]:not(:disabled)').count(),0);
    assert.match(await page.locator('#blend-oil-catalog').innerText(),/5-oil limit reached/);
    // Even programmatic repeated clicks cannot exceed the same limit.
    await page.locator('[data-add-oil="bergamot"]').evaluate(button=>{button.click();button.click();});
    assert.equal((await selected(page)).length,5);
    await page.locator('[data-remove-oil="rosemary"]').click();
    assert.equal((await selected(page)).length,4);
    assert.equal(await page.locator('#blend-total').innerText(),'100%');
    await add(page,'bergamot'); assert.equal((await selected(page)).length,5);
    await page.locator('[data-portion="lavender"]').fill('0');
    await page.locator('[data-remove-oil="lemon"]').click();
    assert.equal((await selected(page)).length,4);
    await add(page,'lemon');assert.equal((await selected(page)).length,4,'Adding is blocked while a selected oil has zero share');
    assert.match(await page.locator('#blend-status').innerText(),/positive portion/);
    await page.locator('[data-portion="lavender"]').fill('1');
    await add(page,'lemon');assert.equal((await selected(page)).length,5);
    assert.ok((await selected(page)).every(o=>Number.isFinite(o.percent)),'Zero-row recovery remains a finite editable draft');
  });
  await test('number/range sync, normalization, and invalid input rejection',async page=>{
    await open(page); await choose(page); await add(page,'lavender'); await add(page,'lemon');
    await page.locator('[data-portion="lavender"]').fill('20');
    await page.locator('[data-portion="lemon"]').fill('30');
    assert.equal(await page.locator('[data-portion-range="lavender"]').inputValue(),'20');
    assert.equal(await page.locator('#blend-total').innerText(),'50%');
    await page.locator('#blend-generate').click();
    assert.equal(await page.locator('#blend-results').isVisible(),false);
    assert.match(await page.locator('#blend-status').innerText(),/100/);
    await page.locator('#blend-normalize').click();
    assert.deepEqual(await selected(page),[{id:'lavender',percent:40},{id:'lemon',percent:60}]);
    await page.locator('[data-portion-range="lavender"]').evaluate(el=>{el.value='55.25';el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.locator('[data-portion="lavender"]').inputValue(),'55.25');
    await page.locator('[data-portion="lemon"]').fill('44.75');
    await page.locator('#blend-generate').click();
    assert.equal(await page.locator('#blend-results').isVisible(),true);
    for(const invalid of ['0','-1','101','']) {
      await page.locator('[data-portion="lavender"]').fill(invalid);
      await page.locator('#blend-generate').click();
      assert.equal(await page.locator('#blend-results').isVisible(),false,`Reject ${JSON.stringify(invalid)}`);
      assert.ok((await page.locator('#blend-status').innerText()).length>0);
      await page.locator('[data-portion="lavender"]').fill('55.25');
      await page.locator('#blend-generate').click();
      assert.equal(await page.locator('#blend-results').isVisible(),true,`Recover from ${JSON.stringify(invalid)}`);
    }
    // Correcting a rejected number through its slider must clear both validity states.
    await page.locator('[data-portion="lavender"]').fill('101');
    await page.locator('[data-portion-range="lavender"]').evaluate(el=>{el.value='55.25';el.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.locator('#blend-generate').click();
    assert.equal(await page.locator('#blend-results').isVisible(),true,'Slider correction clears invalid number state');
    await page.locator('[data-portion="lavender"]').fill('10.001');
    await page.locator('#blend-generate').click();
    assert.equal(await page.locator('#blend-results').isVisible(),false,'Reject excessive precision through native validity');
    await page.locator('[data-portion="lavender"]').fill('0');
    await page.locator('[data-portion="lemon"]').fill('0');
    assert.equal(await page.locator('#blend-normalize').isDisabled(),true);
  });
  await test('research profiles, verified source links, visible caution parity, purchase fail-closed',async page=>{
    await page.goto(recipeUrl(seed()));
    assert.equal(await page.locator('.blend-profile').count(),2);
    for (const profile of await page.locator('.blend-profile').all()) {
      const text=await profile.innerText();
      for (const phrase of ['Research from the Lab library','Precautions & evidence gaps','Cataloged major constituents','No verified leave-on dermal maximum']) assert.ok(text.includes(phrase),phrase);
      const name=await profile.locator('header h4').innerText(), oil=data.oils.find(o=>o.name===name);
      const papers=research.studiesForOil(oil.id);
      const reviewed=new Set(research.studiesForOil(oil.id,[],{eligibleOnly:true}).map(study=>study.id));
      papers.sort((a,b)=>Number(reviewed.has(b.id))-Number(reviewed.has(a.id)));
      assert.deepEqual(await profile.locator('.study').evaluateAll(nodes=>nodes.map(n=>n.dataset.studyId)),papers.map(s=>s.id),'Profile uses the canonical library, without a duplicate research list');
      assert.equal(await profile.locator('.study:visible').count(),Math.min(2,papers.length),'Only two study cards are initially expanded');
      assert.equal(await profile.locator('.study-badge').count(),papers.length,'Every canonical paper carries its evidence tier');
      for(const paper of papers) {
        const card=profile.locator(`[data-study-id="${paper.id}"]`);
        assert.ok((await card.locator('.finding').textContent()).includes(paper.finding),'Finding comes from the canonical paper');
        assert.equal(await card.locator('.read-paper').getAttribute('href'),paper.url);
      }
      if(papers.length>2) {
        assert.equal(await profile.locator('.blend-more-research').evaluate(node=>node.open),false);
        await profile.locator('.blend-more-research > summary').click();
        assert.equal(await profile.locator('.study:visible').count(),papers.length);
      }
      const researchBox=await profile.locator('.blend-profile-columns > div').first().boundingBox(), cautions=await profile.locator('.blend-profile-cautions').boundingBox();
      assert.ok(Math.abs(researchBox.y-cautions.y)<1 && Math.abs(researchBox.width-cautions.width)<1,'Desktop research and cautions equal columns');
      assert.equal(await profile.locator('.blend-profile-cautions').evaluate(n=>n.closest('details')===null),true);
      const font=await profile.evaluate(p=>({research:parseFloat(getComputedStyle(p.querySelector('.finding')).fontSize),caution:parseFloat(getComputedStyle(p.querySelector('.blend-profile-cautions p')).fontSize)}));
      assert.ok(font.caution>=font.research,'Caution text not smaller than research');
    }
    const links=await page.locator('.blend-profile .read-paper').evaluateAll(nodes=>nodes.map(a=>({href:a.href,rel:a.rel,target:a.target})));
    assert.ok(links.length>=2); assert.ok(links.every(a=>a.href.startsWith('https://') && a.rel.includes('noopener') && a.target==='_blank'));
    await assertNoPurchase(page);
    assert.match(await page.locator('.blend-result-cautions').innerText(),/No medical or therapeutic benefit/);
    const gap=research.nodes.find(node=>!research.studiesForOil('frankincense',node.id).length);
    assert.ok(gap,'A specific research gap is available to exercise');
    await page.goto(recipeUrl(seed({path:'qualities',qualityIds:[gap.id],oils:[{id:'frankincense',percent:100}]})));
    assert.equal(await page.locator('.blend-profile .study').count(),0);
    assert.match(await page.locator('.blend-profile').innerText(),/No study is linked to this oil for the selected research topics/);
    assert.match(await page.locator('.blend-profile').innerText(),/gap, not evidence of no effect/);
  });
  await test('pet-context hard warnings update immediately and remain fail-closed',async page=>{
    await page.goto(recipeUrl(seed()));
    await page.locator('#blend-pets').check();
    assert.equal(await page.locator('#blend-pet-warning').isVisible(),true);
    assert.match(await page.locator('.blend-result-cautions').innerText(),/Pet context is on/);
    const current = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft,STORAGE);
    const safety=E.evaluateSafety(current,data);
    const petBlockers=safety.blockers.filter(b=>b.code==='pet_context_blocked');
    assert.equal(petBlockers.length,2);
    const visible=await page.locator('.blend-review-requirements').innerText();
    for(const blocker of petBlockers) assert.ok(visible.includes(blocker.message));
    await assertNoPurchase(page);
    await page.locator('#blend-pets').uncheck();
    assert.equal(await page.locator('#blend-pet-warning').isVisible(),false);
    assert.ok(!(await page.locator('.blend-result-cautions').innerText()).includes('Pet context is on'));
  });
  await test('saved recipe persistence, load, delete, and literal XSS-safe names',async page=>{
    const evil='<img src=x onerror=window.blendXSS=1>';
    await page.goto(recipeUrl(seed())); await page.locator('#blend-name').fill(evil);
    assert.equal(await page.locator('#blend-results-title').innerText(),evil);
    assert.equal(await page.locator('#blend-results-title img').count(),0);
    await page.locator('#blend-save').click();
    assert.match(await page.locator('#blend-action-status').innerText(),/saved on this device/);
    await page.locator('#blend-save').click();
    assert.equal(await page.locator('.blend-saved-item').count(),1,'Saving same canonical recipe deduplicates');
    await page.locator('#blend-reset').click();
    assert.equal(await page.locator('#blend-workspace').isVisible(),false);
    await page.locator('[data-load-recipe="0"]').click();
    assert.equal(await page.locator('#blend-name').inputValue(),evil);
    assert.equal(await page.locator('#blend-results').isVisible(),true);
    await page.reload();
    assert.equal(await page.locator('#blend-name').inputValue(),evil);
    assert.equal(await page.locator('.blend-saved-item').count(),1);
    assert.equal(await page.evaluate(()=>window.blendXSS),undefined);
    assert.equal(await page.locator('#blend-builder img').count(),0);
    await page.locator('[data-delete-recipe="0"]').click();
    assert.equal(await page.locator('.blend-saved-item').count(),0);
    await page.reload(); assert.equal(await page.locator('.blend-saved-item').count(),0);
  });
  await test('share clipboard fallback and valid link reload in a clean browser',async (page,context)=>{
    await page.goto(recipeUrl(seed({name:'Night garden 🌿 café'})));
    await page.locator('#blend-share').click();
    assert.equal(await page.locator('#blend-share-fallback').isVisible(),true);
    const url=await page.locator('#blend-share-url').inputValue();
    assert.equal(new URL(url).searchParams.get('tab'),'blend');
    const decoded=E.decodeRecipe(new URL(url).searchParams.get('recipe'),data);
    assert.equal(decoded.name,'Night garden 🌿 café');
    const clean=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'});
    await intercept(clean,'share reload');
    const other=await clean.newPage();other.on('pageerror',e=>pageErrors.push('share reload: '+e.message));
    await other.goto(url);
    assert.equal(await other.locator('#blend-results-title').innerText(),decoded.name);
    assert.deepEqual((await selected(other)).sort((a,b)=>a.id.localeCompare(b.id)),decoded.oils);
    assert.equal(await other.locator('#blend-results').isVisible(),true);
    await assertNoPurchase(other); await clean.close();
  },()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Test denied clipboard');}}});});
  await test('malformed and older shared recipes preserve draft and fail safely',async page=>{
    await page.goto(recipeUrl(seed({name:'Keep this draft'})));
    for(const url of [`${base}/?tab=blend&recipe=!!!`,rawRecipeUrl(seed({v:0})),rawRecipeUrl(seed({catalogVersion:'old-catalog'})),rawRecipeUrl(seed({oils:[{id:'unknown-oil',percent:100}]})),rawRecipeUrl(seed({oils:[{id:'lavender',percent:0},{id:'lemon',percent:100}]}))]) {
      await page.goto(url);
      assert.equal(await page.locator('#blend-link-error').isVisible(),true);
      assert.match(await page.locator('#blend-link-error').innerText(),/could not be loaded/);
      assert.equal(await page.locator('#blend-name').inputValue(),'Keep this draft');
      assert.equal(await page.locator('#blend-results').isVisible(),false);
      assert.equal(await page.locator('#blend-checkout').count(),0);
    }
    await page.locator('#blend-reset').click();
    assert.equal(await page.locator('#blend-link-error').isVisible(),false);
    assert.equal(new URL(page.url()).searchParams.has('recipe'),false);
    await page.getByRole('button',{name:'Oils',exact:true}).click();
    await page.goBack();
    assert.equal(await page.locator('#blend-link-error').isVisible(),false,'Reset clears invalid-link notice across history navigation');
  });
  await test('tabs, Back, Forward, and repeated controls keep one active route',async page=>{
    const url=recipeUrl(seed());await page.goto(url);
    await page.locator('#blend-name').fill('Edited draft B');
    await page.evaluate(()=>{window.testPushCount=0;const push=history.pushState.bind(history);history.pushState=(...args)=>{window.testPushCount++;return push(...args);};});
    await page.getByRole('button',{name:'Oils',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.testPushCount),1);
    assert.equal(new URL(page.url()).searchParams.has('recipe'),false);
    await page.goBack(); await page.waitForURL(url);
    assert.equal(await page.locator('#tab-blend.active').count(),1);
    assert.equal(await page.locator('#blend-results-title').innerText(),'Evening garden','Back restores recipe A named by URL, not edited draft B');
    await page.goForward();assert.equal(await page.locator('#tab-oils.active').count(),1);
    const oilsUrl=page.url();
    assert.equal(await page.evaluate(()=>window.testPushCount),1,'Back and Forward do not create new history entries');
    for(let i=0;i<3;i++) {
      await page.getByRole('button',{name:'Blend Builder',exact:true}).click();
      assert.equal(await page.evaluate(()=>window.testPushCount),2,i===0?'The Oils-to-Builder transition pushes once':'Repeated clicks on the active Builder tab add no duplicate history');
      await choose(page,i%2?'qualities':'oils');
      assert.equal(await page.evaluate(()=>window.testPushCount),2,'Builder pathway edits do not create route entries');
      assert.equal(await page.locator('.tab-panel.active').count(),1);
      assert.equal((await selected(page)).length,2);
    }
    const builderUrl=page.url();
    await page.getByRole('button',{name:'Oils',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.testPushCount),3,'A new Builder-to-Oils transition pushes exactly once');
    await page.getByRole('button',{name:'Blend Builder',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.testPushCount),4,'A new Oils-to-Builder transition pushes exactly once');
    await page.goBack();await page.waitForURL(oilsUrl);
    assert.equal(await page.locator('#tab-oils.active').count(),1);
    await page.goBack();await page.waitForURL(builderUrl);
    assert.equal(await page.locator('#tab-blend.active').count(),1,'Back reaches the prior real transition without duplicate active-tab entries');
    assert.equal(await page.evaluate(()=>window.testPushCount),4,'History restoration does not push another entry');
    assert.equal((await selected(page)).length,2);
  });
  await test('320/390/768/1440 standalone and embed layouts; caution ordering and screenshots',async page=>{
    const five=seed({name:'A long garden blend with five essential oils',oils:oilIds.map(id=>({id,percent:20}))});
    for(const width of [320,390,768,1440]) for(const embed of [false,true]) {
      await page.setViewportSize({width,height:1000});await page.goto(recipeUrl(five,embed));
      await assertNoOverflow(page,`${width}px embed=${embed}`);
      assert.equal(await page.locator('.blend-result-cautions li').count(),1,'Identical missing-sensitization notes combine into one named caution');
      assert.equal(await page.locator('.lab-return').isVisible(),!embed);
      await assertNoPurchase(page);
      const summary=await page.locator('.blend-result-summary').boundingBox(),caution=await page.locator('.blend-result-cautions').boundingBox();
      if(width<=680) assert.ok(caution.y<summary.y,'Mobile cautions precede recipe summary');
      else assert.ok(Math.abs(caution.y-summary.y)<1 && Math.abs(caution.width-summary.width)<1,'Equal desktop/tablet overview columns');
      for(const profile of await page.locator('.blend-profile').all()) {
        const research=await profile.locator('.blend-profile-columns > div').first().boundingBox(),warn=await profile.locator('.blend-profile-cautions').boundingBox();
        if(width<=680) assert.ok(warn.y<research.y,'Mobile per-oil cautions precede research');
      }
      await page.locator('#blend-results').evaluate(el=>el.scrollIntoView({block:'start'}));
      const warningHeading=await page.locator('#blend-cautions-title').boundingBox();
      assert.ok(warningHeading.y>=0 && warningHeading.y<1000,'Top result caution heading visible without expanding');
      await assertNoOverflow(page,`scrolled ${width}px embed=${embed}`);
      if(width===1440 && !embed) {
        await page.screenshot({path:'/tmp/terpene-blend-desktop-results.png'});
        await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/terpene-blend-desktop.png'});
      }
      if(width===390 && !embed) {
        await page.screenshot({path:'/tmp/terpene-blend-mobile-results.png'});
        await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/terpene-blend-mobile.png'});
      }
    }
    // Real catalog evidence for the dynamic picker, separate from synthetic fixtures.
    for(const [width,label] of [[1440,'desktop'],[390,'mobile']]) {
      await page.setViewportSize({width,height:1000});await open(page);
      await page.locator('#blend-reset').click();await choose(page,'qualities');
      await topic(page,'microbial');
      assert.deepEqual(await selectedTopics(page),['microbial']);
      const matches=await assertCatalog(page,['microbial']);
      assert.ok(matches.direct.length>0,'The real Microbial topic has reviewed oil matches');
      // Keep the responsive width, but frame the expanded picker and a complete
      // real oil card. A narrow-screen hierarchy can legitimately exceed 1000px.
      const captureHeight=await page.evaluate(()=>{
        const branch=document.querySelector('[data-topic-branch="microbial"]').getBoundingClientRect();
        const firstOil=document.querySelector('#blend-oil-catalog > .blend-oil-card').getBoundingClientRect();
        const header=document.querySelector('.lab-header').getBoundingClientRect().height;
        return Math.max(1000,Math.ceil(header+firstOil.bottom-branch.top+48));
      });
      await page.setViewportSize({width,height:captureHeight});
      await page.locator('[data-topic-branch="microbial"]').evaluate(node=>{
        const header=document.querySelector('.lab-header').getBoundingClientRect().height;
        scrollTo(0,scrollY+node.getBoundingClientRect().top-header-16);
      });
      const branch=await page.locator('[data-topic-branch="microbial"]').boundingBox();
      const firstOil=await page.locator('#blend-oil-catalog > .blend-oil-card').first().boundingBox();
      const header=await page.locator('.lab-header').boundingBox();
      const geometry=JSON.stringify({width,captureHeight,branch,firstOil,header});
      assert.ok(branch.y>=header.y+header.height && branch.y+branch.height<=captureHeight-16,`Expanded Microbial hierarchy is fully visible below the header: ${geometry}`);
      assert.ok(firstOil.y>=branch.y+branch.height && firstOil.y+firstOil.height<=captureHeight-16,`A complete matching oil card is visible below the picker: ${geometry}`);
      await assertNoOverflow(page,`${width}px real-data topics picker`);
      await page.screenshot({path:`/tmp/terpene-blend-topics-${label}.png`});
    }
  });
  await test('long shared names and Unicode names remain safe and fit on mobile',async page=>{
    await page.setViewportSize({width:320,height:1000});
    for(const name of ['X'.repeat(60),'🌿'.repeat(60)]) {
      await page.goto(recipeUrl(seed({name})));
      assert.equal(await page.locator('#blend-results-title').innerText(),name);
      await page.locator('#blend-save').click();
      await assertNoOverflow(page,`${Array.from(name).length}-character shared recipe name`);
      await page.locator('#blend-reset').click();
      await page.locator('[data-load-recipe="0"]').click();
      assert.equal(await page.locator('#blend-results-title').innerText(),name);
      await assertNoOverflow(page,'saved long recipe name');
      await page.reload();
      assert.equal(await page.locator('#blend-name').inputValue(),name,'Valid Unicode draft survives reload');
    }
  });
  await test('actual iframe automatically selects embedded layout without query flag',async(page,context)=>{
    // This is an ephemeral test page, never published or written into the app.
    await page.setContent(`<iframe title="Embedded blend builder" style="width:390px;height:1000px;border:0" src="${recipeUrl(seed())}"></iframe>`);
    const frame=page.frameLocator('iframe');
    await frame.locator('#blend-results-title').waitFor();
    assert.equal(await frame.locator('html.lab-embedded').count(),1);
    assert.equal(await frame.locator('.lab-return').isVisible(),false);
    assert.equal(await frame.locator('#blend-checkout').count(),0);
    const width=await frame.locator('html').evaluate(el=>({scroll:el.scrollWidth,width:innerWidth}));
    assert.ok(width.scroll<=width.width+1,JSON.stringify(width));
  });
  await test('keyboard path selection, range adjustment, accessible labels and focus',async page=>{
    await open(page);
    await page.locator('[data-blend-path="qualities"]').focus();await page.keyboard.press('Enter');
    const health=page.locator('[data-topic-branch="health"]');
    assert.equal(await health.evaluate(node=>node.open),false);
    await health.locator(':scope > summary').focus();await page.keyboard.press('Enter');
    assert.equal(await health.evaluate(node=>node.open),true,'Native summary expands by keyboard');
    const mental=page.locator(`[data-topic-branch="${TOPICS.calm}"]`);
    await mental.locator(':scope > summary').focus();await page.keyboard.press('Space');
    assert.equal(await mental.evaluate(node=>node.open),true,'Nested summary expands by keyboard');
    await page.locator(`[data-quality="${TOPICS.calm}"]`).focus();await page.keyboard.press('Space');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.quality),TOPICS.calm,'Topic filter retains keyboard focus after re-render');
    assert.equal(await page.locator(`[data-quality="${TOPICS.calm}"]`).getAttribute('aria-pressed'),'true');
    await page.locator('[data-blend-path="oils"]').focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('#blend-workspace').isVisible(),true);
    await page.locator('[data-add-oil="lavender"]').focus();await page.keyboard.press('Space');
    assert.equal((await selected(page)).length,1);
    assert.equal(await page.evaluate(()=>document.activeElement.closest('#blend-builder')!==null),true,'Adding an oil retains focus inside the builder');
    const range=page.locator('[data-portion-range="lavender"]');await range.focus();await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('[data-portion="lavender"]').inputValue(),'99.99');
    await page.locator('#blend-normalize').focus();await page.keyboard.press('Enter');
    const labels=await page.locator('#blend-workspace input').evaluateAll(nodes=>nodes.map(n=>({type:n.type,label:n.getAttribute('aria-label') || Array.from(n.labels || []).map(l=>l.textContent.trim()).join(' ')})));
    assert.ok(labels.every(n=>n.label.length>0),JSON.stringify(labels));
    await page.locator('#blend-generate').focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'blend-results-title');
    const smallTargets=await page.locator('#blend-builder button:visible').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().height<44).map(n=>n.textContent));
    assert.deepEqual(smallTargets,[],'Basic 44px button target height');
  });
  await test('denied storage preserves working builder and provides honest save feedback',async page=>{
    await open(page);await choose(page);await add(page,'lavender');
    assert.match(await page.locator('#blend-storage-note').innerText(),/storage is unavailable/i);
    await page.locator('#blend-generate').click();assert.equal(await page.locator('#blend-results').isVisible(),true);
    await page.locator('#blend-save').click();
    assert.match(await page.locator('#blend-action-status').innerText(),/Could not save to this browser/);
    await assertNoPurchase(page);
  },()=>{Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Test denied storage','SecurityError');}});});
  await test('malformed local data is ignored without XSS or a crash',async page=>{
    await open(page);assert.equal(await page.locator('#blend-workspace').isVisible(),false);
    await choose(page);await add(page,'lavender');await page.locator('#blend-generate').click();
    assert.equal(await page.locator('#blend-results').isVisible(),true);await assertNoPurchase(page);
  },()=>{localStorage.setItem('terpene-lab:blend:v1','{invalid');});
  await browser.close();
  assert.deepEqual(unexpectedWrites,[],'No write/order request may occur');
  assert.deepEqual(pageErrors,[],'No uncaught browser error may occur');
  assert.deepEqual(failures,[],failures.join('\n\n'));
  console.log('PASS: all Blend Builder browser checks; no page errors or write/order requests');
})().catch(async error=>{console.error(error);if(browser)await browser.close().catch(()=>{});process.exit(1);});
