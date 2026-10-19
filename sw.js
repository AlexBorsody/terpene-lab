// Generated release and SHA-256 map: run python3 scripts/build-pwa.py after edits.
const RELEASE = "e01fbd5ddf9559fd";
const ASSETS = {
  "index.html": "2807ad43523d5716384ff9dc84d3240174ba721875108b5470c8f6670fdcbf55",
  "styles.css": "32ed04ea28ec625d0785c75fd60dfa2e5bffbbc2e9935029c568a32e1856abab",
  "app.js": "ea6827b3de5f92b066233602bf9c7a327494bf6270d41ce0a06dc569b0a051f9",
  "chemistry.js": "09f64d79607afee21306dd8a6fa4d1b28087d8bccd42dd924e958d7baaa4d132",
  "research.js": "9adac5cca9e32904e624fe828d932e955a0a7dd4a28d7352dd866f62c282fdec",
  "data.js": "1a9ec447b446cb0ecaff7239a4827395e2ffc4a80604acf02dac8f09a98e9392",
  "pwa.js": "a52f02fdcb6a47168e81c5c7f7eff4c332da8c6952b05e60b9bd8fff9901f21f",
  "blend-engine.js": "b0c95678d8b1ede6ef9a61031dd8f30cd5866b1f909c80b3a8d5fa52a09938e7",
  "blend-builder.js": "257f92fbcefbcf119bd1e261a854b5e0f3645c73ddfe35a1564a5e16eb1e9907",
  "blend-builder.css": "b42e18b42dd4d361f33326d51895fd453d385ce6bb93bc7c59005930b56d8d4a",
  "master-data.json": "fc440b75253398388571c9acefa72f3d0d04858863cf8adbc2c2e2a283686078",
  "manifest.webmanifest": "1c1ca408fa48a60c75e17542f03c420a73d22d70f98e8f189fb9f1ce76b5865b",
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
