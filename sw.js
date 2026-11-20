/* UDAY Koreografi Studio — service worker (npm run build sırasında vite.config.ts üretir; elle düzenleme).
   İlk açılışta uygulamanın TÜM dosyaları (3D motoru dahil) önbelleğe alınır; sonra internet olmadan çalışır.
   Yeni sürüm yüklenince beklemede kalır; uygulama "Yeni sürüm hazır" sorar, onaylanınca devreye girer. */
const VERSION = '3847c89e0ce2';
const CACHE = 'uday-' + VERSION;
const ASSETS = [
 "./",
 "./assets/engine-IOU8js-p.js",
 "./assets/index-B7YL9CEU.css",
 "./assets/index-CzCPoAev.js",
 "./icons/apple-touch-icon.png",
 "./icons/favicon-32.png",
 "./icons/icon-192.png",
 "./icons/icon-512.png",
 "./icons/icon-maskable-512.png",
 "./icons/icon.svg",
 "./index.html",
 "./manifest.webmanifest"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches
      .keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('uday-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // sayfa açılışı: önbellekteki uygulama (internet yokken de)
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.open(CACHE).then(c => c.match('./index.html').then(m => m || fetch(req))),
    );
    return;
  }
  // diğer dosyalar: önce önbellek, yoksa ağ (ağdan gelen başarılı yanıt önbelleğe eklenir)
  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(req, { ignoreSearch: true }).then(
        m =>
          m ||
          fetch(req).then(r => {
            if (r && r.ok && r.type === 'basic') c.put(req, r.clone());
            return r;
          }),
      ),
    ),
  );
});
