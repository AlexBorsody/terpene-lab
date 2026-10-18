/* Minimal Shopify cart-permalink regressions. ALL merchant/configuration/safety
 * fixtures below are SYNTHETIC and are not production approvals or formulas.
 * Only the local TEST_URL origin may receive real GET requests. All non-GET
 * requests and all external traffic are blocked. The two deliberate handoffs
 * to a reserved .test merchant are fulfilled in Playwright with an inert page.
 * No backend, merchant, Shopify, payment, or order request leaves these tests.
 *
 * TEST_URL=http://127.0.0.1:8000 PLAYWRIGHT_MODULE=playwright
 * CHROME_PATH=/path/to/chromium node tests/blend-checkout.cjs
 */
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = (process.env.TEST_URL || 'http://127.0.0.1:8000').replace(/\/$/,'');
const origin = new URL(base).origin;
const STORE = 'https://merchant.blend-fixture.test';
const VARIANT = '123456789';
const STORAGE = 'terpene-lab:blend:v1';
const FIXTURE_NAME = 'TEST-ONLY checkout fixture A';
const OILS = ['lavender','lemon','rosemary','peppermint','sweet-orange'];
const TOPICS = {calm:'health-mental-health',focus:'health-cognitive',sleep:'health-mental-health-sleep',uplifting:'health-mental-health-mood'};
const failures = [], allWrites = [], allFetches = [];
let browser;

async function test(name, run) {
  const context = await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width:1440,height:1000}});
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const navigations = [], pageErrors = [];
  const t = {context, expectedNavigations:0};
  page.on('pageerror', error=>pageErrors.push(error.message));
  await context.route('**/*', async route=>{
    const request = route.request(), url = new URL(request.url());
    if (request.method() !== 'GET') {
      allWrites.push(`${name}: ${request.method()} ${request.url()}`);
      return route.abort('blockedbyclient');
    }
    if (['fetch','xhr'].includes(request.resourceType())) {
      allFetches.push(`${name}: ${request.resourceType()} ${request.url()}`);
      return route.abort('blockedbyclient');
    }
    if (url.origin !== origin) {
      if (request.isNavigationRequest()) {
        const mainFrame = request.frame() === page.mainFrame();
        navigations.push({url:request.url(),method:request.method(),mainFrame});
        if (navigations.length <= t.expectedNavigations && mainFrame && url.origin === STORE && url.pathname === `/cart/${VARIANT}:1`) {
          // This is a local mock response, never route.continue()/route.fetch().
          return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Synthetic handoff only</title><h1 id="mock-handoff">Intercepted test handoff. No merchant contacted.</h1>'});
        }
      }
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  try {
    await run(page,t);
    assert.equal(navigations.length,t.expectedNavigations,'Only explicitly mocked synthetic navigations are allowed');
    for (const navigation of navigations) {
      assert.equal(new URL(navigation.url).origin,STORE);
      assert.equal(navigation.method,'GET');
      assert.equal(navigation.mainFrame,true,'Handoff navigates the top frame, including inside a real iframe');
    }
    assert.deepEqual(pageErrors,[],'No uncaught browser errors');
    console.log('PASS: '+name);
  } catch (error) {
    failures.push(`${name}: ${error.stack || error}`);
    console.error(`FAIL: ${name}: ${error.message}`);
  } finally { await context.close(); }
}

async function ready(page) { await page.locator('[data-blend-path="oils"]').waitFor(); }
async function topic(page, id) {
  const button=page.locator(`#blend-quality-picker [data-quality="${id}"]`);
  const ancestors=await button.evaluate(node=>{
    const ids=[];
    for(let parent=node.parentElement;parent;parent=parent.parentElement) if(parent.matches('details[data-topic-branch]')) ids.unshift(parent.dataset.topicBranch);
    return ids;
  });
  for(const ancestor of ancestors) {
    const branch=page.locator(`[data-topic-branch="${ancestor}"]`);
    if(!await branch.evaluate(node=>node.open)) await branch.locator(':scope > summary').click();
  }
  await button.click();
}
async function configure(page, overrides = {}) {
  await page.evaluate(({store,variant,overrides})=>{
    // Deliberately leave all unknown formulation/safety fields unknown.
    Object.assign(TERPENE_DATA.blendBuilder.product,{
      name:'Custom Blend',price:40,currency:'USD',size:'8 oz',
      shopifyStoreUrl:store,shopifyVariantId:variant,...overrides
    });
  },{store:STORE,variant:VARIANT,overrides});
}
async function open(page, configured = true) {
  await page.goto(base+'/?tab=blend');
  await ready(page);
  if (configured) await configure(page);
}
async function create(page, name = FIXTURE_NAME) {
  await page.locator('[data-blend-path="oils"]').click();
  await page.locator('[data-add-oil="lavender"]').click();
  await page.locator('#blend-name').fill(name);
  await page.locator('#blend-generate').click();
}
async function draft(page) { return page.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft,STORAGE); }
async function regenerate(page) { await page.locator('#blend-generate').click(); }
async function refresh(page) {
  // Force the ordinary edit path after changing only an in-memory test fixture.
  await page.locator('#blend-name').evaluate(input=>input.dispatchEvent(new Event('input',{bubbles:true})));
}
async function noVisibleCart(page) {
  assert.equal(await page.locator('#blend-checkout:visible').count(),0,'Invalid/unconfigured drafts have no visible Shopify link');
}
function decodeHref(href) {
  const url = new URL(href);
  assert.equal(url.origin,STORE);
  assert.equal(url.pathname,`/cart/${VARIANT}:1`,'Exactly one configured Custom variant, quantity one');
  assert.deepEqual([...url.searchParams.keys()],['properties'],'Only line-item properties are sent');
  assert.equal(url.hash,'');
  const encoded = url.searchParams.get('properties');
  assert.match(encoded,/^[A-Za-z0-9_-]+$/,'Properties use unpadded Base64URL');
  const properties = JSON.parse(Buffer.from(encoded,'base64url').toString('utf8'));
  assert.deepEqual(Object.keys(properties),['Recipe'],'Exactly one readable Recipe property');
  assert.equal(typeof properties.Recipe,'string');
  assert.ok(properties.Recipe.length>0);
  assert.equal(Buffer.from(JSON.stringify(properties),'utf8').toString('base64url'),encoded,'UTF-8 property payload round-trips exactly');
  const match = properties.Recipe.match(/^Recipe code: ([A-Za-z0-9_-]+)$/m);
  assert.ok(match,'Readable Recipe retains a versioned recipe code');
  const recipe = JSON.parse(Buffer.from(match[1],'base64url').toString('utf8'));
  return {url,properties,recipe,encodedRecipe:match[1]};
}
async function cart(page) {
  const anchor = page.locator('#blend-checkout');
  assert.equal(await anchor.isVisible(),true);
  assert.equal(await anchor.evaluate(node=>node.tagName),'A','Checkout is a browser-native link');
  assert.equal(await anchor.innerText(),'Continue to Shopify · $40');
  assert.equal(await anchor.getAttribute('target'),'_top');
  assert.ok((await anchor.getAttribute('rel')).split(/\s+/).includes('noreferrer'));
  const result = decodeHref(await anchor.getAttribute('href'));
  const expected = await page.evaluate(key=>{
    const recipe=JSON.parse(localStorage.getItem(key)).draft;
    return BLEND_ENGINE.cartPermalink(recipe,TERPENE_DATA);
  },STORAGE);
  assert.equal(result.url.href,expected.url,'Visible href is derived from the current persisted draft');
  assert.deepEqual(result.properties,expected.properties);
  assert.deepEqual(result.recipe,expected.recipe);
  assert.equal(result.encodedRecipe,expected.encodedRecipe);
  return result;
}
async function seedUrl(page, overrides = {}, legacy = false) {
  return page.evaluate(({base,overrides,legacy})=>{
    const recipe={v:1,catalogVersion:TERPENE_DATA.blendBuilder.catalogVersion,name:'Shared fixture A',path:'oils',qualityIds:[],petContext:false,oils:[{id:'lavender',percent:100}],...overrides};
    const code=legacy?btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(recipe)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''):BLEND_ENGINE.encodeRecipe(recipe,TERPENE_DATA);
    return `${base}/?tab=blend&recipe=${code}`;
  },{base,overrides,legacy});
}
async function captureBeforeNavigation(page, scope = page) {
  const captures = [];
  await page.exposeFunction('__recordSyntheticHandoff',snapshot=>captures.push(snapshot));
  await scope.evaluate(key=>{
    document.addEventListener('click',event=>{
      const anchor=event.target.closest('#blend-checkout');
      if (anchor) window.__recordSyntheticHandoff({storage:localStorage.getItem(key),href:anchor.href,prevented:event.defaultPrevented});
    });
    // Prove the click handler persists again, rather than relying on an earlier edit.
    localStorage.removeItem(key);
  },STORAGE);
  return captures;
}

(async()=>{
  browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});

  await test('production ordering stays unavailable until a verified Custom variant is configured',async page=>{
    await open(page,false);await create(page);
    await noVisibleCart(page);
    assert.match(await page.locator('#blend-checkout-status').innerText(),/Shopify ordering is being set up/);
    const config=await page.evaluate(()=>TERPENE_DATA.blendBuilder.product);
    assert.equal(config.shopifyVariantId,null,'Never substitute an existing merchant product');
    assert.equal(config.price,40);assert.equal(config.currency,'USD');assert.equal(config.size,'8 oz');
    assert.equal(config.totalOilLoadPercent,null);assert.equal(config.baseVersion,null);
    assert.match(await page.locator('.blend-product').innerText(),/\$40/);
    assert.doesNotMatch(await page.locator('#blend-builder').innerText(),/\$45/);
    await configure(page);await refresh(page);await cart(page);
  });

  await test('unknown safety fields allow manual review without invented formula or certification claims',async page=>{
    await open(page);await create(page);
    const result=await cart(page);
    assert.equal(result.recipe.name,FIXTURE_NAME);
    assert.deepEqual(result.recipe.oils,[{id:'lavender',percent:100}]);
    assert.match(result.properties.Recipe,/Lavender \[lavender\] 100%/);
    assert.match(result.properties.Recipe,/Manual formulation review required/);
    assert.match(result.properties.Recipe,/relative portions.*not finished-product concentrations/);
    assert.doesNotMatch(result.properties.Recipe,/Base version:|certified|certification|Final spray concentration:|Finished spray oil load:/i);
    assert.match(await page.locator('.blend-result-summary').innerText(),/Final spray concentration has not been set/);
    assert.match(await page.locator('.blend-result-cautions').innerText(),/reviewed before mixing/);
    const safety=await page.evaluate(key=>BLEND_ENGINE.evaluateSafety(JSON.parse(localStorage.getItem(key)).draft,TERPENE_DATA),STORAGE);
    assert.equal(safety.requiresReview,true);
    assert.ok(Array.isArray(safety.blockers));assert.ok(Array.isArray(safety.warnings));
    assert.equal(Object.hasOwn(safety,'canPurchase'),false,'Transport readiness does not claim safety approval');
  });

  await test('oil changes, portions, quality path and pet context always regenerate the href',async page=>{
    await open(page);await create(page);
    let previous=await cart(page);
    await page.locator('[data-add-oil="lemon"]').click();
    let result=await cart(page);
    assert.notEqual(result.url.href,previous.url.href);
    assert.deepEqual(result.recipe.oils,[{id:'lavender',percent:50},{id:'lemon',percent:50}]);
    await page.locator('[data-portion="lavender"]').fill('70');await noVisibleCart(page);
    await page.locator('[data-portion="lemon"]').fill('30');await regenerate(page);
    result=await cart(page);
    assert.deepEqual(result.recipe.oils,[{id:'lavender',percent:70},{id:'lemon',percent:30}]);
    await page.locator('[data-remove-oil="lemon"]').click();
    result=await cart(page);assert.deepEqual(result.recipe.oils,[{id:'lavender',percent:100}]);
    await page.locator('[data-blend-path="qualities"]').click();
    await topic(page,TOPICS.calm);
    result=await cart(page);assert.equal(result.recipe.path,'qualities');assert.deepEqual(result.recipe.qualityIds,[TOPICS.calm]);
    previous=result;await topic(page,TOPICS.focus);
    result=await cart(page);assert.notEqual(result.url.href,previous.url.href);
    assert.deepEqual(result.recipe.qualityIds,[TOPICS.focus,TOPICS.calm].sort(),'Every currently selected topic enters canonical checkout metadata');
    previous=result;await topic(page,TOPICS.calm);
    result=await cart(page);assert.notEqual(result.url.href,previous.url.href);
    assert.deepEqual(result.recipe.qualityIds,[TOPICS.focus],'Removed topics cannot remain in a stale checkout recipe');
    previous=result;
    await page.locator('[data-blend-path="oils"]').click();
    result=await cart(page);assert.notEqual(result.url.href,previous.url.href);
    assert.equal(result.recipe.path,'oils');assert.deepEqual(result.recipe.qualityIds,[],'No hidden quality selections enter the order');
    await page.locator('#blend-pets').check();
    result=await cart(page);assert.equal(result.recipe.petContext,true);
    assert.match(result.properties.Recipe,/pets may be present/);
    assert.match(await page.locator('.blend-result-cautions').innerText(),/Pet context is on/);
    await page.locator('#blend-pets').uncheck();
    result=await cart(page);assert.equal(result.recipe.petContext,false);
    assert.doesNotMatch(result.properties.Recipe,/Customer context: pets/);
  });

  await test('five oils and maximum Unicode names round-trip; invalid drafts cannot expose a link',async page=>{
    await open(page);await create(page,'Café 夜 🌿 & <garden>');
    assert.equal((await cart(page)).recipe.name,'Café 夜 🌿 & <garden>');
    for (const id of OILS.slice(1)) await page.locator(`[data-add-oil="${id}"]`).click();
    await page.locator('#blend-name').fill('🌿'.repeat(60));
    const result=await cart(page);
    assert.equal(Array.from(result.recipe.name).length,60);assert.equal(result.recipe.name,'🌿'.repeat(60));
    assert.equal(result.recipe.oils.length,5);
    assert.equal(result.recipe.oils.reduce((sum,oil)=>sum+Math.round(oil.percent*100),0),10000);
    assert.equal(await page.locator('[data-add-oil]:not(:disabled)').count(),0);
    await page.locator('[data-add-oil="bergamot"]').evaluate(button=>button.click());
    assert.deepEqual((await cart(page)).recipe.oils,result.recipe.oils,'Sixth oil cannot be added');
    await page.locator('#blend-name').fill('x'.repeat(61));await noVisibleCart(page);
    assert.equal(await page.locator('#blend-name').evaluate(input=>input.checkValidity()),false);
    await page.locator('#blend-name').fill('Recovered fixture');await regenerate(page);await cart(page);
    await page.locator('[data-portion="lavender"]').fill('0');await noVisibleCart(page);
    await page.locator('[data-portion="lavender"]').fill(String(result.recipe.oils.find(oil=>oil.id==='lavender').percent));await regenerate(page);await cart(page);
  });

  await test('saved load, reload, shared links and Back restore the matching checkout recipe',async page=>{
    await open(page);await create(page,'Saved fixture A');
    await page.locator('[data-blend-path="qualities"]').click();
    await topic(page,TOPICS.sleep);await topic(page,TOPICS.focus);
    const saved=await cart(page);
    assert.deepEqual(saved.recipe.qualityIds,[TOPICS.focus,TOPICS.sleep].sort());
    await page.locator('#blend-save').click();
    await page.locator('#blend-name').fill('Edited fixture B');
    assert.equal((await cart(page)).recipe.name,'Edited fixture B');
    await page.locator('[data-load-recipe="0"]').click();
    assert.equal((await cart(page)).url.href,saved.url.href);
    await page.reload();await ready(page);await configure(page);await regenerate(page);
    assert.equal((await cart(page)).url.href,saved.url.href);
    const url=await seedUrl(page,{name:'Shared fixture A',path:'qualities',qualityIds:[TOPICS.calm,TOPICS.uplifting],oils:[{id:'lavender',percent:60},{id:'lemon',percent:40}]});
    await page.goto(url);await ready(page);await configure(page);await refresh(page);
    const shared=await cart(page);assert.equal(shared.recipe.name,'Shared fixture A');
    assert.deepEqual(shared.recipe.qualityIds,[TOPICS.calm,TOPICS.uplifting].sort());
    await page.locator('#blend-name').fill('Unshared edit B');
    await topic(page,TOPICS.uplifting);
    assert.deepEqual((await cart(page)).recipe.qualityIds,[TOPICS.calm]);
    assert.notEqual((await cart(page)).url.href,shared.url.href);
    await page.getByRole('button',{name:'Oils',exact:true}).click();
    await page.goBack();await page.waitForURL(url);
    assert.equal((await cart(page)).url.href,shared.url.href,'Back uses the recipe in the URL, not a stale edited href');
    await page.goForward();
    assert.equal(await page.locator('#tab-oils.active').count(),1);
    await page.getByRole('button',{name:'Blend Builder',exact:true}).click();
    assert.equal((await cart(page)).recipe.name,'Shared fixture A');
  });

  await test('legacy aliases migrate into canonical checkout metadata without duplicate topics',async page=>{
    await open(page);
    const topics=Object.values(TOPICS).sort();
    const url=await seedUrl(page,{name:'Legacy fixture 🌿',path:'qualities',qualityIds:['calm',TOPICS.calm,'focus','sleep','uplifting']},true);
    await page.goto(url);await ready(page);await configure(page);await refresh(page);
    const result=await cart(page);
    assert.equal(result.recipe.v,1);assert.equal(result.recipe.catalogVersion,'2026-10-18');
    assert.deepEqual(result.recipe.qualityIds,topics,'Legacy aliases and overlapping canonical IDs deduplicate before serialization');
    assert.deepEqual((await draft(page)).qualityIds,topics);
    await page.locator('#blend-save').click();
    await topic(page,TOPICS.calm);
    assert.deepEqual((await cart(page)).recipe.qualityIds,topics.filter(id=>id!==TOPICS.calm));
    await page.locator('[data-load-recipe="0"]').click();
    assert.equal((await cart(page)).url.href,result.url.href,'Loading canonical saved bytes restores matching order metadata');
    await page.locator('[data-blend-path="oils"]').click();
    assert.deepEqual((await cart(page)).recipe.qualityIds,[]);
    assert.deepEqual((await draft(page)).qualityIds,[]);
  });

  await test('excess-precision input removes usable checkout until correction and exploration',async page=>{
    await open(page);await create(page);await page.locator('[data-add-oil="lemon"]').click();
    assert.deepEqual((await cart(page)).recipe.oils,[{id:'lavender',percent:50},{id:'lemon',percent:50}]);
    await page.evaluate(()=>window.__priorSyntheticHandoff=document.getElementById('blend-checkout'));
    await page.locator('[data-portion="lavender"]').fill('49.999');
    await noVisibleCart(page);
    assert.equal(await page.locator('[data-portion="lavender"]').evaluate(input=>input.checkValidity()),false);
    await page.evaluate(()=>{
      // If the hidden old anchor remains in the DOM, even a programmatic click
      // must reject the invalid visible input rather than use rounded state.
      if (window.__priorSyntheticHandoff.isConnected) window.__priorSyntheticHandoff.click();
    });
    await regenerate(page);await noVisibleCart(page);
    await page.locator('[data-portion="lavender"]').fill('49.99');
    await page.locator('[data-portion="lemon"]').fill('50.01');
    await noVisibleCart(page);
    await regenerate(page);
    const result=await cart(page);
    assert.deepEqual(result.recipe.oils,[{id:'lavender',percent:49.99},{id:'lemon',percent:50.01}]);
    // Also exercise the click guard without firing an edit/render event.
    await page.locator('[data-portion="lavender"]').evaluate(input=>input.setCustomValidity('TEST-ONLY invalid input'));
    await page.locator('#blend-checkout').click();await noVisibleCart(page);
    assert.equal(new URL(page.url()).origin,origin);
  });

  await test('missing/invalid variants, unsafe store URLs and mismatched products fail closed',async page=>{
    await open(page);await create(page);
    const good=(await cart(page)).url.href;
    const invalid=[
      ...[null,'','not-a-variant','gid://shopify/ProductVariant/123456789','0','-1','12.5','1:1',0,12.5].map(shopifyVariantId=>({shopifyVariantId})),
      ...[null,'','http://merchant.blend-fixture.test','https://user:pass@merchant.blend-fixture.test',
        'https://merchant.blend-fixture.test:444','https://merchant.blend-fixture.test/cart',
        'https://merchant.blend-fixture.test/?redirect=elsewhere','https://merchant.blend-fixture.test/#fragment',
        'https://localhost','https://127.0.0.1','https://[::1]','javascript:alert(1)',
        '//merchant.blend-fixture.test','https://merchant..test'].map(shopifyStoreUrl=>({shopifyStoreUrl})),
      {price:45},{currency:'EUR'},{name:'Blue Formula'},{size:'16 oz'}
    ];
    for (const patch of invalid) {
      await configure(page,patch);await refresh(page);await noVisibleCart(page);
      assert.equal(await page.locator('#blend-checkout').count(),0,JSON.stringify(patch));
      assert.ok((await page.locator('#blend-checkout-status').innerText()).length>0);
      await configure(page);await refresh(page);
      assert.equal((await cart(page)).url.href,good,'Restoring trusted configuration restores the same recipe');
    }
    await configure(page,{shopifyStoreUrl:STORE+'/',shopifyVariantId:Number(VARIANT)});await refresh(page);
    assert.equal((await cart(page)).url.href,good,'Root slash and a safe numeric variant normalize to the configured origin');
  });

  await test('a previously rendered link is revalidated if configuration becomes invalid before click',async page=>{
    await open(page);await create(page);await cart(page);
    await page.evaluate(()=>{
      TERPENE_DATA.blendBuilder.product.shopifyVariantId=null;
      window.__blockedSyntheticHandoffs=[];
      document.addEventListener('click',event=>{
        if (event.target.closest('#blend-checkout')) window.__blockedSyntheticHandoffs.push(event.defaultPrevented);
      });
    });
    // No edit or render has refreshed the href; the click must still fail closed.
    await page.locator('#blend-checkout').click();
    await noVisibleCart(page);
    assert.equal(new URL(page.url()).origin,origin);
    assert.deepEqual(await page.evaluate(()=>window.__blockedSyntheticHandoffs),[true]);
    assert.match(await page.locator('#blend-status').innerText(),/verified Custom Blend Shopify variant/);
    await configure(page);await refresh(page);await cart(page);
    await page.evaluate(()=>{
      Object.assign(TERPENE_DATA.blendBuilder.product,{
        totalOilLoadPercent:2,totalOilLoadSource:{label:'TEST-ONLY load',url:'https://example.test/click-load'},
        totalOilMaxPercent:1,totalOilMaxSource:{label:'TEST-ONLY ceiling',url:'https://example.test/click-ceiling'}
      });
    });
    await page.locator('#blend-checkout').click();await noVisibleCart(page);
    assert.deepEqual(await page.evaluate(()=>window.__blockedSyntheticHandoffs),[true,true]);
    assert.match(await page.locator('.blend-result-cautions').innerText(),/1% total limit/);
  });

  await test('recipe data cannot override destination, variant, quantity, price or properties',async page=>{
    await open(page);await create(page);
    const current=await draft(page),good=(await cart(page)).url.href;
    const overrides=[{shopifyStoreUrl:'https://attacker.blend-fixture.test'},{shopifyVariantId:'987654321'},
      {url:'https://attacker.blend-fixture.test'},{quantity:20},{price:0},{currency:'EUR'},
      {properties:{Recipe:'tampered'}},{product:{shopifyVariantId:'987654321'}}];
    for (const patch of overrides) {
      const rejected=await page.evaluate(({recipe,patch})=>{
        try { BLEND_ENGINE.cartPermalink({...recipe,...patch},TERPENE_DATA);return false; }
        catch(error) { return error.name==='BlendValidationError'; }
      },{recipe:current,patch});
      assert.equal(rejected,true,`Untrusted recipe override rejected: ${JSON.stringify(patch)}`);
      assert.equal((await cart(page)).url.href,good);
    }
    const malicious={...current,shopifyVariantId:'987654321'};
    await page.goto(`${base}/?tab=blend&recipe=${Buffer.from(JSON.stringify(malicious),'utf8').toString('base64url')}`);
    await ready(page);await configure(page);await noVisibleCart(page);
    assert.equal(await page.locator('#blend-link-error').isVisible(),true);
    assert.equal(await page.locator('#blend-name').inputValue(),current.name,'Invalid shared data preserves the draft');
  });

  await test('sourced hard caps block handoff with the oil, limit and source visibly named',async page=>{
    await open(page);await create(page);
    await page.evaluate(()=>{
      const product=TERPENE_DATA.blendBuilder.product;
      product.totalOilLoadPercent=2;
      product.totalOilLoadSource=null;
      Object.assign(TERPENE_DATA.oils.find(oil=>oil.id==='lavender').blend,{
        dermalMaxPercent:1,dermalMaxSource:{label:'TEST-ONLY synthetic 1% dermal ceiling',url:'https://example.test/dermal-ceiling'}
      });
    });
    await refresh(page);await cart(page); // Unsourced concentration is not a verified hard-cap comparison.
    await page.evaluate(()=>TERPENE_DATA.blendBuilder.product.totalOilLoadSource={label:'TEST-ONLY synthetic 2% load',url:'https://example.test/oil-load'});
    await refresh(page);await noVisibleCart(page);
    let warning=await page.locator('.blend-result-cautions').innerText();
    assert.match(warning,/Lavender/);assert.match(warning,/2% of the finished spray/);assert.match(warning,/1% dermal maximum/);
    assert.equal(await page.locator('.blend-result-cautions a[href="https://example.test/dermal-ceiling"]').isVisible(),true);
    assert.match(await page.locator('#blend-checkout-status').innerText(),/sourced limit or interaction/);
    await page.evaluate(()=>{
      TERPENE_DATA.oils.find(oil=>oil.id==='lavender').blend.dermalMaxPercent=3;
      Object.assign(TERPENE_DATA.blendBuilder.product,{
        totalOilMaxPercent:1.5,totalOilMaxSource:{label:'TEST-ONLY synthetic 1.5% total ceiling',url:'https://example.test/total-ceiling'}
      });
    });
    await refresh(page);await noVisibleCart(page);
    warning=await page.locator('.blend-result-cautions').innerText();
    assert.match(warning,/2% essential oils/);assert.match(warning,/1\.5% total limit/);
    assert.equal(await page.locator('.blend-result-cautions a[href="https://example.test/total-ceiling"]').isVisible(),true);
    await page.evaluate(()=>{
      TERPENE_DATA.blendBuilder.product.totalOilMaxPercent=0;
      TERPENE_DATA.blendBuilder.product.totalOilMaxSource.label='TEST-ONLY synthetic 0% total ceiling';
    });
    await refresh(page);await noVisibleCart(page);
    warning=await page.locator('.blend-result-cautions').innerText();
    assert.match(warning,/0% total limit/);
    assert.match(warning,/TEST-ONLY synthetic 0% total ceiling/);
    await page.evaluate(()=>{
      TERPENE_DATA.blendBuilder.product.totalOilMaxPercent=3;
      TERPENE_DATA.blendBuilder.product.totalOilMaxSource.label='TEST-ONLY synthetic 3% total ceiling';
      const oil=TERPENE_DATA.oils.find(oil=>oil.id==='lavender').blend;
      oil.dermalMaxPercent=0;oil.dermalMaxSource.label='TEST-ONLY synthetic 0% dermal ceiling';
    });
    await refresh(page);await noVisibleCart(page);
    warning=await page.locator('.blend-result-cautions').innerText();
    assert.match(warning,/Lavender/);assert.match(warning,/0% dermal maximum/);
    assert.match(warning,/TEST-ONLY synthetic 0% dermal ceiling/);
  });

  await test('named interaction warnings stay visible and sourced blocking interactions prevent handoff',async page=>{
    await open(page);await create(page);await page.locator('[data-add-oil="lemon"]').click();
    await page.evaluate(()=>TERPENE_DATA.oils.find(oil=>oil.id==='lavender').blend.interactions=[{
      withOilId:'lemon',severity:'warning',reason:'TEST-ONLY pair requires manual review.',
      source:{label:'TEST-ONLY synthetic interaction review',url:'https://example.test/interaction'}
    }]);
    await refresh(page);await cart(page);
    const cautions=page.locator('.blend-result-cautions');
    let warning=await cautions.innerText();
    assert.match(warning,/Lavender \+ Lemon/);assert.match(warning,/TEST-ONLY pair requires manual review/);
    assert.equal(await cautions.locator('a[href="https://example.test/interaction"]').isVisible(),true);
    assert.equal(await cautions.evaluate(node=>node.closest('details')===null),true,'Warning is never hidden behind disclosure');
    await page.evaluate(()=>TERPENE_DATA.oils.find(oil=>oil.id==='lavender').blend.interactions[0].severity='blocker');
    await refresh(page);await noVisibleCart(page);
    warning=await cautions.innerText();assert.match(warning,/Lavender \+ Lemon/);
    assert.match(await page.locator('#blend-checkout-status').innerText(),/sourced limit or interaction/);
  });

  await test('actual standalone click persists the current recipe before an intercepted GET handoff',async(page,t)=>{
    await open(page);await create(page,'Persist on click 🌿');
    await page.locator('[data-blend-path="qualities"]').click();
    await topic(page,TOPICS.sleep);await topic(page,TOPICS.focus);
    const expected=await cart(page);
    assert.deepEqual(expected.recipe.qualityIds,[TOPICS.focus,TOPICS.sleep].sort());
    const currentDraft=await draft(page);
    assert.deepEqual(currentDraft.qualityIds,[TOPICS.sleep,TOPICS.focus],'Editable draft retains current selection order');
    assert.deepEqual(currentDraft.qualityIds.slice().sort(),expected.recipe.qualityIds,'Draft and canonical handoff contain the same selected topics');
    const captures=await captureBeforeNavigation(page);
    t.expectedNavigations=1;
    await page.locator('#blend-checkout').click();
    await page.locator('#mock-handoff').waitFor();
    assert.equal(captures.length,1);
    assert.equal(captures[0].prevented,false,'Native anchor navigation is used');
    assert.deepEqual(JSON.parse(captures[0].storage).draft,currentDraft,'The exact current draft is persisted synchronously before navigation');
    assert.equal(captures[0].href,expected.url.href);
    const handoff=decodeHref(page.url());
    assert.deepEqual(handoff.recipe,expected.recipe,'Navigation retains the independently canonicalized recipe');
    assert.equal(handoff.encodedRecipe,expected.encodedRecipe,'Canonical recipe bytes are unchanged during handoff');
    assert.deepEqual(handoff.properties,expected.properties);
  });

  await test('a real iframe targets the top document and persists before the intercepted handoff',async(page,t)=>{
    // Same-origin ephemeral harness, never written to the app or published.
    await page.goto(base+'/?tab=oils');
    await page.setContent(`<iframe title="Embedded blend builder" style="width:390px;height:1000px;border:0" src="${base}/?tab=blend"></iframe>`);
    const frame=await (await page.locator('iframe').elementHandle()).contentFrame();
    assert.ok(frame);await ready(frame);await configure(frame);await create(frame,'Iframe fixture 夜');
    assert.equal(await frame.locator('html.lab-embedded').count(),1);
    const expected=await cart(frame);
    const currentDraft=await draft(frame);
    const captures=await captureBeforeNavigation(page,frame);
    t.expectedNavigations=1;
    await frame.locator('#blend-checkout').click();
    await page.locator('#mock-handoff').waitFor();
    assert.equal(page.frames().length,1,'Checkout replaced the top document, rather than remaining inside the iframe');
    assert.equal(captures.length,1);
    assert.deepEqual(JSON.parse(captures[0].storage).draft,currentDraft,'Iframe also persists the exact current draft');
    assert.equal(page.url(),expected.url.href);
    const handoff=decodeHref(page.url());
    assert.deepEqual(handoff.recipe,expected.recipe);
    assert.equal(handoff.encodedRecipe,expected.encodedRecipe);
    assert.deepEqual(handoff.properties,expected.properties);
  });

  await browser.close();browser=null;
  assert.deepEqual(allWrites,[],'No non-GET request may be attempted');
  assert.deepEqual(allFetches,[],'The permalink path makes no fetch/XHR/backend request');
  assert.deepEqual(failures,[],failures.join('\n\n'));
  console.log('PASS: cart-permalink regressions; external navigation mocked, zero merchant/order traffic and zero write requests');
})().catch(async error=>{console.error(error);if(browser)await browser.close().catch(()=>{});process.exit(1);});
