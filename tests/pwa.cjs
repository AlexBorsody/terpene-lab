const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
(async () => {
 const root = fs.mkdtempSync('/tmp/terpene-pwa-test-');
 fs.cpSync(path.resolve('.'), root, { recursive:true, filter:p=>!p.includes('/.git') });
 let corrupt = false;
 const types={'.js':'application/javascript','.css':'text/css','.html':'text/html','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const file=path.join(root, url.pathname.replace(/^\/terpene-lab\//,'/').replace(/\/$/,'/index.html'));
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Not found');}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain','Cache-Control':'no-store'});
  res.end(corrupt&&file.endsWith('/data.js')?'invalid rollout':fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
 try {
 for (const prefix of ['/', '/terpene-lab/']) {
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;
  const context=await browser.newContext();
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'?tab=compounds&compound=citral');
  await page.waitForFunction(()=>navigator.serviceWorker.controller);
  await page.waitForFunction(()=>document.querySelector('#pwa-status')?.textContent.includes('saved'));
  await page.locator('#pwa-update').waitFor({state:'hidden'});
  const metadata=await page.evaluate(async()=>{
   const m=await (await fetch('manifest.webmanifest')).json();
   return {m,scope:(await navigator.serviceWorker.ready).scope, icons:await Promise.all(m.icons.map(async i=>{const img=new Image();img.src=i.src;await img.decode();return [img.naturalWidth,img.naturalHeight];}))};
  });
  assert.equal(metadata.scope,base);assert.equal(new URL(metadata.m.start_url,base).href,base);assert.equal(new URL(metadata.m.scope,base).href,base);
  assert.deepEqual(metadata.icons,[[192,192],[512,512],[512,512]]);
  await page.evaluate(()=>caches.open('unrelated-app-cache'));
  await context.setOffline(true);
  await page.reload();
  assert.equal(await page.locator('#compound-name').textContent(),'Citral');
  await page.getByRole('button',{name:'Network',exact:true}).click();
  assert.ok(await page.locator('#network-chart canvas').count());
  const reopened=await context.newPage();await reopened.goto(base+'?tab=oils&oil=lemon');
  assert.equal(await reopened.locator('#oil-name').textContent(),'Lemon');await reopened.close();
  await page.waitForFunction(()=>document.querySelector('#pwa-status')?.textContent.includes('Paper links'));
  assert.equal(await page.evaluate(async()=>{try {await fetch('missing.js');return false;}catch{return true;}}),true,'Missing assets must not receive HTML');
  await context.setOffline(false);
  const before=await page.evaluate(()=>caches.keys());
  // Simulate a new Pages release. A mismatched response must not activate.
  fs.appendFileSync(path.join(root,'data.js'),'\n// test release '+prefix+'\n');
  execFileSync('python3',['scripts/build-pwa.py'],{cwd:root});
  corrupt=true;
  await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();await new Promise(resolve=>{const w=r.installing;if(!w)return resolve();w.addEventListener('statechange',()=>{if(['redundant','installed'].includes(w.state))resolve();});});});
  assert.equal(await page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting),false);
  assert.deepEqual(await page.evaluate(()=>caches.keys()),before);
  corrupt=false;
  await page.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration()).update();});
  await page.locator('#pwa-update').waitFor({state:'visible'});
  assert.deepEqual((await page.evaluate(()=>caches.keys())).filter(x=>x.startsWith('sunnys-')).length,2);
  await Promise.all([page.waitForEvent('load'),page.locator('#pwa-update').click()]);
  await page.waitForFunction(()=>navigator.serviceWorker.controller && document.querySelector('#pwa-status')?.textContent.includes('saved'));
  const after=await page.evaluate(()=>caches.keys());
  assert.equal(after.filter(x=>x.startsWith('sunnys-')).length,1);assert.ok(after.includes('unrelated-app-cache'));
  await context.setOffline(true);await page.reload();assert.ok(await page.locator('#network-chart canvas').count());
  assert.deepEqual(errors,[]);
  await context.close();
  const embedded=await browser.newContext();const ep=await embedded.newPage();await ep.goto(base+'?embed=1');
  assert.equal(await ep.locator('.pwa-controls').isVisible(),false);
  assert.equal(await ep.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),0);
  await embedded.close();
  console.log('PASS: manifest/icons/scope, offline reopening/charts/deep links, partial-release rejection, waiting/accepted updates, cache cleanup and embed isolation at '+prefix);
 }
 } finally {await browser.close();server.close();fs.rmSync(root,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1)});
