// Generated release and SHA-256 map: run python3 scripts/build-pwa.py after edits.
const RELEASE = "378151030a1e91b8";
const ASSETS = {
  "index.html": "b39defe1c46bdb0f573c465b1c4d0c4cae4002dbd05112e57630f4c29e8bc42f",
  "styles.css": "6cb64645b6aad2001964a4755b0b0576fe92d219fc1c74941607b341e4c9e7f7",
  "app.js": "d86a15ec3816f1a18d550d9d04d4fcf0c737e708c51288b467eb72558e60477b",
  "chemistry.js": "09f64d79607afee21306dd8a6fa4d1b28087d8bccd42dd924e958d7baaa4d132",
  "research.js": "acf3cd76eb76401d69f9b34dbcb82941c74bf7beb69976055866fa82765c4758",
  "data.js": "2c809b3179ad60e6132f653fc2b2a7704c7216584d67d8f536bfda19d7fd4916",
  "pwa.js": "2be526f528a5a802f634be1d14b13a1e48b63617abb324e4cfec2ed71c159430",
  "blend-engine.js": "2e8efadb5582843de2b7b0a8cb4bf86f9f63404ae671cc00c86715260c215203",
  "blend-builder.js": "c092f5892783b9122e084c59ca8735d3120694f94eb574a831b93d58dc29bc9e",
  "blend-builder.css": "25001cef2c9e6cc25eb5f61c7d874dc53ab63522e0c394a95bffad95eec792c3",
  "master-data.json": "80dbf2f4e7aa44b2af79072f7de5f0f0ec27dd25602f708f029a78158f9f34e4",
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
    await self.skipWaiting();
  })());
  // Activate only after the entire release has passed integrity checks.
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
