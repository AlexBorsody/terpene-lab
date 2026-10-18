/* Optional checkout-adapter browser regressions. THIS FILE USES SYNTHETIC DATA.
 * No values below are production approvals or formulation recommendations.
 * Each isolated page patches only its in-memory catalog. Every checkout POST is
 * intercepted and fulfilled locally; all external traffic is aborted. Nothing
 * reaches a backend, Shopify, or any checkout destination.
 *
 * Run with the same local HTTP server/environment as tests/blend-browser.cjs:
 * TEST_URL=http://127.0.0.1:8000 PLAYWRIGHT_MODULE=playwright
 * CHROME_PATH=/path/to/chromium node tests/blend-checkout.cjs
 */
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = (process.env.TEST_URL || 'http://127.0.0.1:8000').replace(/\/$/,'');
const origin = new URL(base).origin;
const endpoint = '/__test_checkout';
const allowedHost = 'checkout.blend-fixture.test';
const approvedButNeverVisited = `https://${allowedHost}/never-open-this-test-checkout`;
const failures = [];
let browser;

async function frameTurn(page) {
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function test(name,run) {
  const context = await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'});
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const posts=[],unexpectedWrites=[],externalNavigations=[],pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await context.route('**/*', async route=>{
    const request=route.request(),url=new URL(request.url());
    if(request.method()==='POST' && url.origin===origin && url.pathname===endpoint) {
      // Save the route, but never continue it. The test will fulfill it locally.
      posts.push({route,request,payload:request.postDataJSON(),answered:false});
      return;
    }
    if(!['GET','HEAD','OPTIONS'].includes(request.method())) {
      unexpectedWrites.push(`${request.method()} ${request.url()}`);
      return route.abort('blockedbyclient');
    }
    if(url.origin!==origin) {
      if(request.isNavigationRequest()) externalNavigations.push(request.url());
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  try {
    await page.goto(base+'/?tab=blend');
    await page.locator('[data-blend-path="oils"]').waitFor();
    await page.evaluate(({endpoint,allowedHost})=>{
      const source={label:'TEST-ONLY synthetic reviewed formulation; NOT production data',url:'https://example.test/test-only-synthetic-review'};
      Object.assign(TERPENE_DATA.blendBuilder.product,{
        name:'Custom Blend',price:45,currency:'USD',size:'8 oz',
        totalOilLoadPercent:2,totalOilLoadSource:{...source},
        totalOilMaxPercent:3,totalOilMaxSource:{...source},
        shopifyVariantId:'123456789',checkoutEndpoint:endpoint,
        checkoutAllowedHosts:[allowedHost],serverValidationVerified:true
      });
      const lavender=TERPENE_DATA.oils.find(oil=>oil.id==='lavender');
      Object.assign(lavender.blend,{
        enabled:true,availability:'available',safetyReviewStatus:'approved',
        dermalMaxPercent:2,dermalMaxSource:{...source},phototoxic:false,
        sensitizationNotes:'TEST-ONLY synthetic review note. Not a production safety assessment.',
        cautionThresholds:[],interactions:[],petSafer:true,petSource:{...source}
      });
      // Track cancellation and completion. ignoreAbort simulates a late transport
      // response that cannot be cancelled, exercising the sequence/snapshot gate.
      const actualFetch=window.fetch.bind(window);
      window.checkoutFixture={ignoreAbort:false,started:[],settled:[]};
      window.fetch=async(input,options)=>{
        const url=new URL(typeof input==='string'?input:input.url,location.href);
        if(url.pathname!==endpoint || (options?.method || 'GET')!=='POST') return actualFetch(input,options);
        const fixture=window.checkoutFixture,index=fixture.started.length;
        fixture.started.push({signal:options.signal,body:options.body});
        try {
          const response=await actualFetch(input,fixture.ignoreAbort?{...options,signal:undefined}:options);
          const body=await response.text();
          fixture.settled.push({index,kind:'response'});
          return new Response(body,{status:response.status,headers:response.headers});
        } catch(error) {
          fixture.settled.push({index,kind:'error',name:error.name});throw error;
        }
      };
    },{endpoint,allowedHost});
    await page.locator('[data-blend-path="oils"]').click();
    await page.locator('[data-add-oil="lavender"]').click();
    await page.locator('#blend-name').fill('TEST-ONLY checkout fixture A');
    await page.locator('#blend-generate').click();
    assert.equal(await page.locator('#blend-checkout').count(),1,'Synthetic approved fixture enables only the test adapter');
    assert.equal(await page.locator('#blend-checkout').isEnabled(),true);
    const controls={
      posts,
      async started(count) {
        await page.waitForFunction(count=>window.checkoutFixture.started.length===count,count);
        // The browser fetch call precedes Playwright's route notification.
        const deadline=Date.now()+8000;
        while(posts.length<count && Date.now()<deadline) await new Promise(resolve=>setTimeout(resolve,10));
        assert.equal(posts.length,count,`Exactly ${count} intercepted local POST request(s)`);
      },
      async reply(index,body,status=200) {
        const post=posts[index];assert.ok(post,`POST ${index} exists`);assert.equal(post.answered,false);
        post.answered=true;
        await post.route.fulfill({status,contentType:'application/json',body:typeof body==='string'?body:JSON.stringify(body)});
        await page.waitForFunction(index=>window.checkoutFixture.settled.some(item=>item.index===index),index);
        await frameTurn(page);
      },
      async click() { await page.locator('#blend-checkout').click(); },
      async ignoreAbort() { await page.evaluate(()=>window.checkoutFixture.ignoreAbort=true); },
      async signalAborted(index) { return page.evaluate(index=>window.checkoutFixture.started[index].signal.aborted,index); },
      async noNavigation() { assert.deepEqual(externalNavigations,[],'No stale/invalid response may attempt external navigation');assert.equal(new URL(page.url()).origin,origin); }
    };
    await run(page,controls);
    assert.deepEqual(unexpectedWrites,[],'Every POST must target and stay inside the local mocked endpoint');
    assert.deepEqual(externalNavigations,[],'No checkout navigation is permitted in these tests');
    assert.deepEqual(pageErrors,[],'No uncaught browser errors');
    console.log('PASS: '+name);
  } catch(error) {
    failures.push(`${name}: ${error.stack || error}`);console.error(`FAIL: ${name}: ${error.message}`);
  } finally {
    // Aborted/pending test requests are never released to a server during cleanup.
    for(const post of posts) if(!post.answered) await post.route.abort('blockedbyclient').catch(()=>{});
    await context.close();
  }
}

(async()=>{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
  await test('synthetic configured concentration copy and exact fulfillment payload',async(page,t)=>{
    const summary=await page.locator('.blend-result-summary').innerText();
    assert.match(summary,/Configured final spray oil concentration: 2% \(subject to server review\)/);
    assert.doesNotMatch(summary,/Final spray concentration has not been set/);
    assert.match(await page.locator('.blend-result-cautions').innerText(),/checkout service must independently validate this exact recipe/);
    assert.match(await page.locator('.blend-profile-cautions').innerText(),/TEST-ONLY synthetic reviewed formulation/);
    await t.click();await t.started(1);
    const payload=t.posts[0].payload;
    assert.equal(payload.endpoint,endpoint);
    assert.deepEqual(payload.expectedPrice,{amount:45,currency:'USD'});
    assert.deepEqual(payload.validation,{mode:'client-only',requiresServerValidation:true});
    assert.equal(payload.recipe.name,'TEST-ONLY checkout fixture A');
    assert.deepEqual(payload.recipe.oils,[{id:'lavender',percent:100}]);
    assert.equal(payload.items.length,1);assert.equal(payload.items[0].id,'123456789');assert.equal(payload.items[0].quantity,1);
    assert.equal(payload.items[0].properties['Finished spray oil load'],'2%');
    assert.match(payload.items[0].properties['Finished spray concentrations'],/lavender: 2%/);
    await t.reply(0,{error:'TEST-ONLY deliberate failure'},503);
    assert.match(await page.locator('#blend-checkout-status').innerText(),/Checkout is unavailable.*recipe.*try again/);
    assert.equal(await page.locator('#blend-checkout').isEnabled(),true);await t.noNavigation();
  });
  await test('synthetic dermal hard limit blocks purchase with oil, limit and source at top',async(page,t)=>{
    await page.evaluate(()=>{
      const oil=TERPENE_DATA.oils.find(oil=>oil.id==='lavender');
      oil.blend.dermalMaxPercent=1;
      oil.blend.dermalMaxSource={label:'TEST-ONLY synthetic 1% dermal ceiling',url:'https://example.test/test-only-dermal-ceiling'};
    });
    // A harmless draft edit triggers a fresh safety evaluation of the in-memory fixture.
    await page.locator('#blend-name').fill('TEST-ONLY dermal hard-stop fixture');
    assert.equal(await page.locator('#blend-checkout').count(),0);
    const top=await page.locator('.blend-result-cautions').innerText();
    assert.match(top,/Lavender/);assert.match(top,/2% of the finished spray/);assert.match(top,/1% dermal maximum/);
    assert.match(top,/TEST-ONLY synthetic 1% dermal ceiling/);
    assert.equal(await page.locator('.blend-result-cautions a[href="https://example.test/test-only-dermal-ceiling"]').count(),1);
    assert.match(await page.locator('#blend-cautions-title').innerText(),/Formula review still required/);
    assert.equal(t.posts.length,0);await t.noNavigation();
  });
  await test('synthetic total-oil hard limit blocks purchase with limit and source at top',async(page,t)=>{
    await page.evaluate(()=>{
      TERPENE_DATA.blendBuilder.product.totalOilMaxPercent=1.5;
      TERPENE_DATA.blendBuilder.product.totalOilMaxSource={label:'TEST-ONLY synthetic 1.5% total ceiling',url:'https://example.test/test-only-total-ceiling'};
    });
    await page.locator('#blend-name').fill('TEST-ONLY total hard-stop fixture');
    assert.equal(await page.locator('#blend-checkout').count(),0);
    const top=await page.locator('.blend-result-cautions').innerText();
    assert.match(top,/finished spray contains 2% essential oils/);assert.match(top,/1\.5% total limit/);
    assert.match(top,/TEST-ONLY synthetic 1\.5% total ceiling/);
    assert.equal(await page.locator('.blend-result-cautions a[href="https://example.test/test-only-total-ceiling"]').count(),1);
    assert.match(await page.locator('#blend-cautions-title').innerText(),/Formula review still required/);
    assert.equal(t.posts.length,0);await t.noNavigation();
  });
  await test('double-click and results re-render cannot duplicate pending checkout',async(page,t)=>{
    await page.locator('#blend-checkout').evaluate(button=>{button.click();button.click();});await t.started(1);
    assert.equal(await page.locator('#blend-checkout').isDisabled(),true);
    await page.locator('#blend-generate').click();
    assert.equal(await page.locator('#blend-checkout').isDisabled(),true,'Re-render preserves pending lock');
    await page.locator('#blend-checkout').evaluate(button=>button.click());await frameTurn(page);
    assert.equal(t.posts.length,1);assert.equal(await page.evaluate(()=>window.checkoutFixture.started.length),1);
    await t.reply(0,{checkoutUrl:'https://not-allowed.blend-fixture.test/checkout'});
    assert.match(await page.locator('#blend-checkout-status').innerText(),/unverified destination/);
    assert.equal(await page.locator('#blend-checkout').isEnabled(),true);await t.noNavigation();
  });
  await test('editing cancels pending fetch and allows a deliberate replacement request',async(page,t)=>{
    await t.click();await t.started(1);
    await page.locator('#blend-name').fill('TEST-ONLY checkout fixture B');
    assert.equal(await t.signalAborted(0),true,'Editing aborts previous request signal');
    await page.waitForFunction(()=>window.checkoutFixture.settled.some(item=>item.index===0 && item.kind==='error' && item.name==='AbortError'));
    assert.equal(await page.locator('#blend-checkout').isEnabled(),true);
    await t.click();await t.started(2);
    assert.equal(t.posts[1].payload.recipe.name,'TEST-ONLY checkout fixture B');
    assert.notEqual(t.posts[0].payload.encodedRecipe,t.posts[1].payload.encodedRecipe);
    await t.reply(1,{error:'TEST-ONLY replacement rejected'},503);
    assert.match(await page.locator('#blend-checkout-status').innerText(),/Checkout is unavailable/);
    assert.equal(await page.locator('#blend-name').inputValue(),'TEST-ONLY checkout fixture B');
    await t.noNavigation();
  });
  await test('late previous response cannot navigate or unlock a newer checkout request',async(page,t)=>{
    await t.ignoreAbort();await t.click();await t.started(1);
    await page.locator('#blend-name').fill('TEST-ONLY checkout fixture B');assert.equal(await t.signalAborted(0),true);
    await t.click();await t.started(2);
    await t.reply(0,{checkoutUrl:approvedButNeverVisited});
    await t.noNavigation();
    assert.equal(await page.locator('#blend-checkout').isDisabled(),true,'Old finally block must not unlock new request');
    assert.match(await page.locator('#blend-checkout-status').innerText(),/Validating the recipe/);
    await t.reply(1,{checkoutUrl:'https://not-allowed.blend-fixture.test/current'});
    assert.match(await page.locator('#blend-checkout-status').innerText(),/unverified destination/);
    assert.equal(await page.locator('#blend-checkout').isEnabled(),true);
    await t.click();await t.started(3);
    assert.equal(t.posts[2].payload.recipe.name,'TEST-ONLY checkout fixture B');
    await t.reply(2,{error:'TEST-ONLY final retry rejected'},503);
    assert.match(await page.locator('#blend-checkout-status').innerText(),/Checkout is unavailable/);await t.noNavigation();
  });
  await test('reset discards late checkout response without restoring old UI',async(page,t)=>{
    await t.ignoreAbort();await t.click();await t.started(1);
    await page.locator('#blend-reset').click();assert.equal(await t.signalAborted(0),true);
    await t.reply(0,{checkoutUrl:approvedButNeverVisited});await t.noNavigation();
    assert.equal(await page.locator('#blend-workspace').isVisible(),false);
    assert.equal(await page.locator('#blend-results').isVisible(),false);
    assert.equal(await page.locator('#blend-name').inputValue(),'My custom blend');
    assert.equal(await page.locator('[data-portion]').count(),0);
    await page.locator('[data-blend-path="oils"]').click();await page.locator('[data-add-oil="lavender"]').click();await page.locator('#blend-generate').click();
    assert.equal(await page.locator('#blend-checkout').isEnabled(),true);
    await t.click();await t.started(2);await t.reply(1,{error:'TEST-ONLY after reset'},503);
  });
  await test('tab exit discards late checkout response and preserves deliberate return',async(page,t)=>{
    await t.ignoreAbort();await t.click();await t.started(1);
    await page.getByRole('button',{name:'Oils',exact:true}).click();assert.equal(await t.signalAborted(0),true);
    const exitedUrl=page.url();await t.reply(0,{checkoutUrl:approvedButNeverVisited});await t.noNavigation();
    assert.equal(page.url(),exitedUrl);assert.equal(await page.locator('#tab-oils.active').count(),1);
    await page.getByRole('button',{name:'Blend Builder',exact:true}).click();
    assert.equal(await page.locator('#blend-checkout').isEnabled(),true);
    assert.equal(await page.locator('#blend-name').inputValue(),'TEST-ONLY checkout fixture A');
    await t.click();await t.started(2);await t.reply(1,{error:'TEST-ONLY after tab return'},503);
    assert.match(await page.locator('#blend-checkout-status').innerText(),/Checkout is unavailable/);
  });
  await test('backend errors and unverified destinations keep the recipe and never navigate',async(page,t)=>{
    const originalUrl=page.url();
    const responses=[
      {body:{error:'TEST-ONLY server failure'},status:500,pattern:/Checkout is unavailable/},
      {body:'{TEST-ONLY invalid JSON',status:200,pattern:/JSON|Unexpected|property name|position/i},
      {body:{checkoutUrl:'https://not-allowed.blend-fixture.test/checkout'},status:200,pattern:/unverified destination/},
      {body:{checkoutUrl:`http://${allowedHost}/checkout`},status:200,pattern:/unverified destination/},
      {body:{checkoutUrl:`https://user:password@${allowedHost}/checkout`},status:200,pattern:/unverified destination/},
      {body:{checkoutUrl:`https://${allowedHost}:444/checkout`},status:200,pattern:/unverified destination/},
      {body:{checkoutUrl:'javascript:alert("TEST-ONLY")'},status:200,pattern:/unverified destination/}
    ];
    for(const [index,response] of responses.entries()) {
      await t.click();await t.started(index+1);await t.reply(index,response.body,response.status);
      assert.match(await page.locator('#blend-checkout-status').innerText(),response.pattern);
      assert.equal(await page.locator('#blend-checkout').isEnabled(),true);
      assert.equal(await page.locator('#blend-name').inputValue(),'TEST-ONLY checkout fixture A');
      assert.equal(await page.locator('#blend-results').isVisible(),true);
      assert.equal(page.url(),originalUrl);await t.noNavigation();
    }
  });
  await browser.close();browser=null;
  assert.deepEqual(failures,[],failures.join('\n\n'));
  console.log('PASS: checkout adapter fixtures; all POSTs mocked locally, no backend/Shopify traffic or checkout navigation');
})().catch(async error=>{console.error(error);if(browser)await browser.close().catch(()=>{});process.exit(1);});
