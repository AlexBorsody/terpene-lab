// Generated release and SHA-256 map: run python3 scripts/build-pwa.py after edits.
const RELEASE = "a76c9e5fd1815b8f";
const ASSETS = {
  "index.html": "762d0c3ea6b7ad22ea4660849b1aee43d77bd6a5a1208c13373e38c11463079c",
  "styles.css": "08c7926bfecb8936ad1310172da1fbf27de8bdcafff5f820c1970c73c3faa1ff",
  "app.js": "ff4f7c513af9f01ccdbf4113c54e786ac21d6b7a92c45c9a3ca565ec275abc17",
  "chemistry.js": "bc9a042f59ea993fd0df0dba5ac187579745ce158748dfa3686657f2c5b07507",
  "data.js": "b553712bcc1a94257f43d89854b1b669c2ba035e7cd1768f6874fe523dd0dc2e",
  "pwa.js": "a52f02fdcb6a47168e81c5c7f7eff4c332da8c6952b05e60b9bd8fff9901f21f",
  "blend-engine.js": "019d22378361d4f50183a888ba63d8c86b96edbf95d0981360c503490386544e",
  "blend-builder.js": "35f9409a25bba929ef6b95ed015c92d5c56f7cfe8e8c943d1d058ac9a38e4c26",
  "blend-builder.css": "780b169ef110b2a1c18151b5668137d30a8acd01a4ac7a528b57434cae8be361",
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
