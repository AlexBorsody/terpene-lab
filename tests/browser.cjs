const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
 const context=await browser.newContext({serviceWorkers:'block'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.TEST_URL || 'http://127.0.0.1:8000';
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
 await page.getByRole('button',{name:'Compounds',exact:true}).click();
 await page.locator('#compound-class-filter').selectOption('Monoterpenoid');
 await page.locator('#compound-group-filter').selectOption('aldehyde');
 assert.equal(await page.locator('#compound-grid .card').count(),2);
 await page.locator('#compound-search').fill('neral');
 assert.equal(await page.locator('#compound-grid .card').count(),1);
 await page.locator('#compound-grid .card').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#compound-name').textContent(),'Citral');
 await page.getByRole('button',{name:'All compounds',exact:false}).click();
 await page.locator('#compound-search').fill('');await page.locator('#compound-group-filter').selectOption('ester');
 assert.ok((await page.locator('#compound-grid').innerText()).includes('Linalyl Acetate'));
 await page.locator('[data-c="linalyl-acetate"]').click();
 assert.ok((await page.locator('#compound-chemistry').innerText()).includes('Esters'));
 await page.getByRole('button',{name:'Studies',exact:true}).click();
 await page.locator('#study-group-filter').selectOption('thiol');
 assert.ok((await page.locator('#study-list').innerText()).includes('Oswald'));
 for(const tab of ['Oils','Matrix','Uses','Network','Compounds','Studies']) {
  await page.getByRole('button',{name:tab,exact:true}).click();
  assert.equal(await page.locator('.tab-panel.active').count(),1);
 }
 await page.goto(`${base}/?tab=compounds&compound=cannflavin-a&embed=1`);
 assert.equal(await page.locator('#compound-name').textContent(),'Cannflavin A');
 assert.equal(await page.locator('#compound-oils-chart canvas').count(),0);
 assert.ok((await page.locator('#compound-material-evidence').innerText()).includes('Plant material'));
 await page.goto(`${base}/?tab=compounds&compound=nobiletin`);
 assert.equal(await page.locator('#compound-oil-links button').count(),3);
 assert.equal(await page.locator('#compound-oils-chart canvas').count(),0);
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
