/* Browser regression tests for the exploratory Blend Builder.
 * Never posts to checkout or places an order. All non-GET requests are blocked.
 * Run: TEST_URL=http://127.0.0.1:8010 PLAYWRIGHT_MODULE=/path/to/playwright
 *      CHROME_PATH=/usr/bin/chromium node tests/blend-browser.cjs
 */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const E = require('../blend-engine.js');
const dataContext = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../data.js'), 'utf8') + '\nthis.data = TERPENE_DATA;', dataContext);
const data = JSON.parse(JSON.stringify(dataContext.data));
const base = (process.env.TEST_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const STORAGE = 'terpene-lab:blend:v1';
const oilIds = ['lavender', 'lemon', 'rosemary', 'peppermint', 'sweet-orange'];
const seed = (overrides = {}) => ({v:1,catalogVersion:data.blendBuilder.catalogVersion,name:'Evening garden',path:'oils',qualityIds:[],petContext:false,oils:[{id:'lavender',percent:60},{id:'lemon',percent:40}],...overrides});
const recipeUrl = (recipe, embed = false) => `${base}/?tab=blend&recipe=${E.encodeRecipe(recipe, data)}${embed ? '&embed=1' : ''}`;
const rawRecipeUrl = recipe => `${base}/?tab=blend&recipe=${Buffer.from(JSON.stringify(recipe),'utf8').toString('base64url')}`;
const failures = [], pageErrors = [], unexpectedWrites = [];
let browser;
async function test(name, callback, init) {
  const context = await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width:1440,height:1000}});
  if (init) await context.addInitScript(init);
  await context.route('**/*', route => {
    if (!['GET','HEAD','OPTIONS'].includes(route.request().method())) {
      unexpectedWrites.push(`${name}: ${route.request().method()} ${route.request().url()}`);
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => pageErrors.push(`${name}: ${error.message}`));
  try { await callback(page, context); console.log(`PASS: ${name}`); }
  catch (error) { failures.push(`${name}: ${error.stack || error}`); console.error(`FAIL: ${name}: ${error.message}`); }
  finally { await context.close(); }
}
async function open(page, query = '?tab=blend') { await page.goto(base+'/'+query); await page.locator('#blend-builder .blend-paths').waitFor(); }
async function choose(page, pathway = 'oils') { await page.locator(`[data-blend-path="${pathway}"]`).click(); }
async function add(page, id) { await page.locator(`[data-add-oil="${id}"]`).click(); }
async function selected(page) { return page.locator('[data-portion]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.portion,percent:Number(node.value)}))); }
async function assertNoPurchase(page) {
  assert.equal(await page.locator('#blend-checkout').count(), 0, 'Unknown production safety and checkout config must never expose purchase');
  assert.match(await page.locator('#blend-results').innerText(), /Ordering (opens|remains unavailable)/);
}
async function assertNoOverflow(page, label) {
  const sizes = await page.evaluate(()=>({width:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth,builder:document.getElementById('blend-builder').getBoundingClientRect().right}));
  assert.ok(sizes.html<=sizes.width+1 && sizes.body<=sizes.width+1 && sizes.builder<=sizes.width+1,`${label}: ${JSON.stringify(sizes)}`);
}
(async()=>{
  browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
  await test('equal entry paths and source-backed quality filtering', async page=>{
    await open(page);
    assert.equal(await page.locator('#blend-workspace').isVisible(),false);
    const cards = await page.locator('[data-blend-path]').evaluateAll(nodes=>nodes.map(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height,pressed:n.getAttribute('aria-pressed')})));
    assert.equal(cards.length,2); assert.ok(Math.abs(cards[0].width-cards[1].width)<1); assert.ok(Math.abs(cards[0].height-cards[1].height)<1); assert.deepEqual(cards.map(c=>c.pressed),['false','false']);
    await choose(page,'qualities');
    assert.equal(await page.locator('#blend-quality-picker').isVisible(),true);
    await page.locator('[data-quality="focus"]').click();
    const expected = data.oils.filter(o=>o.blend?.enabled && o.blend.qualityMappings.some(m=>m.qualityId==='focus' && m.supportsSuggestion!==false)).map(o=>o.id).sort();
    assert.deepEqual((await page.locator('[data-add-oil]').evaluateAll(nodes=>nodes.map(n=>n.dataset.addOil))).sort(),expected);
    assert.ok(expected.length>0);
    await add(page,expected[0]);
    assert.equal((await selected(page)).length,1);
    await choose(page,'oils');
    assert.equal(await page.locator('#blend-quality-picker').isVisible(),false);
    assert.equal(await page.locator('[data-add-oil]').count(),data.oils.filter(o=>o.blend?.enabled).length);
    assert.equal((await selected(page)).length,1,'Switching path keeps selected oils');
    await page.locator('#blend-search').fill('no-such-oil-xyz');
    assert.equal(await page.locator('[data-add-oil]').count(),0);
    assert.match(await page.locator('#blend-oil-catalog').innerText(),/No oils match/);
    await page.locator('#blend-search').fill('lavandula');
    assert.equal(await page.locator('[data-add-oil="lavender"]').count(),1);
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
      for (const phrase of ['Purported qualities & research','Cautions & evidence gaps','Cataloged major constituents','No verified leave-on dermal maximum']) assert.ok(text.includes(phrase),phrase);
      assert.ok(await profile.locator('.blend-research').count()>0);
      assert.ok(await profile.locator('.blend-evidence-tier').count()>0);
      assert.ok((await profile.locator('.blend-research p').allInnerTexts()).some(text=>text.length>80),'Written study description');
      const research=await profile.locator('.blend-profile-columns > div').first().boundingBox(), cautions=await profile.locator('.blend-profile-cautions').boundingBox();
      assert.ok(Math.abs(research.y-cautions.y)<1 && Math.abs(research.width-cautions.width)<1,'Desktop research and cautions equal columns');
      assert.equal(await profile.locator('.blend-profile-cautions').evaluate(n=>n.closest('details')===null),true);
      const font=await profile.evaluate(p=>({research:parseFloat(getComputedStyle(p.querySelector('.blend-research p')).fontSize),caution:parseFloat(getComputedStyle(p.querySelector('.blend-profile-cautions p')).fontSize)}));
      assert.ok(font.caution>=font.research,'Caution text not smaller than research');
    }
    const links=await page.locator('.blend-research a').evaluateAll(nodes=>nodes.map(a=>({href:a.href,rel:a.rel,target:a.target})));
    assert.ok(links.length>=2); assert.ok(links.every(a=>a.href.startsWith('https://') && a.rel.includes('noopener') && a.target==='_blank'));
    await assertNoPurchase(page);
    assert.match(await page.locator('.blend-result-cautions').innerText(),/No medical or therapeutic benefit/);
    await page.goto(recipeUrl(seed({oils:[{id:'frankincense',percent:100}]})));
    assert.match(await page.locator('.blend-profile').innerText(),/Limited research\. No verified data yet/);
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
    for(let i=0;i<3;i++) {
      await page.getByRole('button',{name:'Blend Builder',exact:true}).click();
      await choose(page,i%2?'qualities':'oils');
      assert.equal(await page.locator('.tab-panel.active').count(),1);
      assert.equal((await selected(page)).length,2);
    }
    assert.equal(await page.evaluate(()=>window.testPushCount),4,'One history push per tab click, no doubled handlers');
  });
  await test('320/390/768/1440 standalone and embed layouts; caution ordering and screenshots',async page=>{
    const five=seed({name:'A long garden blend with five essential oils',oils:oilIds.map(id=>({id,percent:20}))});
    for(const width of [320,390,768,1440]) for(const embed of [false,true]) {
      await page.setViewportSize({width,height:1000});await page.goto(recipeUrl(five,embed));
      await assertNoOverflow(page,`${width}px embed=${embed}`);
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
    await page.locator('[data-quality="calm"]').focus();await page.keyboard.press('Space');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.quality),'calm','Quality filter retains keyboard focus after re-render');
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
