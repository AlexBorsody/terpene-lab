// Generated release and SHA-256 map: run python3 scripts/build-pwa.py after edits.
const RELEASE = "5c1b940823831fa9";
const ASSETS = {
  "index.html": "d0681e5bc37ba93fe420fd6670d407bded6cc9fed7991abc9330c9fde9c10579",
  "styles.css": "6549a08bcc0c96e164e8c0a7a71c557cba313d052a985922deb62f9918050852",
  "app.js": "efc355c965031f74381c69b2e55486f5986e4dbc92a95df0bd1c1a020d2327fd",
  "chemistry.js": "09f64d79607afee21306dd8a6fa4d1b28087d8bccd42dd924e958d7baaa4d132",
  "research.js": "9adac5cca9e32904e624fe828d932e955a0a7dd4a28d7352dd866f62c282fdec",
  "data.js": "68f0f917ae791d655db87bd447ff85c7cb8dd7920753447e7feb2725fdc7348b",
  "pwa.js": "a52f02fdcb6a47168e81c5c7f7eff4c332da8c6952b05e60b9bd8fff9901f21f",
  "blend-engine.js": "afcc32e0c4805fdb9bb00ce5c0a16e2aa5a3fa90e75be41c7d80bae99b0b1014",
  "blend-builder.js": "7bcfcc56170956717f7401374a4d60cb745e78b853bb162687ee28f0917b6f3d",
  "blend-builder.css": "6201de5c247026bb3990555c820ba8a4cf53892851b59a4502eb528396b908eb",
  "master-data.json": "35c824fc76df10b01ec005341e7f874deffde8faec4d73b635b57301841c2c58",
  "manifest.webmanifest": "e85307edce52944b5afd4da7ad5082893d4a4dff1fd25a8abed6469eeaee1271",
  "shield-icon.svg": "b6a4fa5ec8968f651ec6bb9441f4cb6a3c5c5b333c45628c2e43ca348d2a5562",
  "vendor/echarts-5.5.1.min.js": "e84270bd0cd5bdf60fefc26d00c2a391cb2e81f4d26a7a9ee16185a54773a3cf",
  "icons/apple-touch-icon.png": "dedbda7b727acdf3642136907ab70dce873538492e65cfe38f9989c9ccfbfbee",
  "icons/icon-192.png": "103e33ad540d29a7e1ef2952d23d5edf3c346c7f3fd4fe0d93050f34c987039a",
  "icons/icon-512.png": "77c1c221d3645605c0e4642aef1e72ccb919d6b0e12f0812ecb63513bc78884e",
  "icons/maskable-512.png": "b8007516021f40b63f5c5ad2496b0f7e7ad4ffd86d49c30b2c2ede6397974b15"
};
const PREFIX = 'sunnys-terpene-lab-';
const CACHE = PREFIX + RELEASE;
const urlFor = path => new URL(path, self.registration.scope).href;
const paths = new Map(Object.keys(ASSETS).map(path => [new URL(urlFor(path)).pathname, path]));

self.addEventListener('install', event => {
  // Validate every file before storing anything: a partial Pages rollout must
  // never replace a working release with a mixed app/data/chart bundle.
  event.waitUntil((async () => {
    const entries = await Promise.all(Object.entries(ASSETS).map(async ([path, hash]) => {
      const response = await fetch(urlFor(path), { cache: 'no-store' });
      if (!response.ok || response.type === 'opaque') throw new Error('Unavailable: ' + path);
      const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
      const actual = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      if (actual !== hash) throw new Error('Release mismatch: ' + path);
      return [urlFor(path), response];
    }));
    const cache = await caches.open(CACHE);
    await Promise.all(entries.map(([url, response]) => cache.put(url, response)));
  })());
  // Updates wait for consent or for all old tabs to close.
});

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await Promise.all((await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  // Only the app's real entry points get HTML. Paper links, external photos,
  // unknown URLs, and unrelated same-origin content remain network requests.
  const entry = url.pathname === scope.pathname || url.pathname === scope.pathname + 'index.html';
  const path = request.mode === 'navigate' && entry ? 'index.html' : paths.get(url.pathname);
  if (!path) return;
  event.respondWith((async () => {
    const hit = await (await caches.open(CACHE)).match(urlFor(path));
    return hit || fetch(request);
  })());
});
