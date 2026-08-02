/* AYB Saha - çevrimdışı önbellek (Bayram YARAŞ)
   İSTEK (Bayram YARAŞ): "GİTHUB İÇİNDE SEMBOL FONTU VAR, BUNU DA YÜKLÜYOR MUYUZ?"
   Bu dosya üç şeyi düzeltir:
   1) SEMBOL FONTU (B_CAD.ttf) ve ayb-tablet.js artık önbellek listesinde.
      Böylece internet yokken de semboller B Pro fontuyla gelir, program tam çalışır.
   2) Önbellek adı SÜRÜM etiketiyle damgalıdır. Yeni sürüm konduğunda eski önbellek
      otomatik silinir; tablet ESKİ ayb-tablet.js veya ESKİ fontu sunmaya devam edemez.
   3) Harita döşemeleri (dış sunucu) önbelleğe YAZILMAZ; sadece programın kendi
      dosyaları saklanır. Böylece tabletin deposu döşeme resimleriyle şişmez.
   NOT: Sürüm değişince aşağıdaki SURUM satırı da değişmelidir. */

const SURUM  = 'PERF-26.08-U8';
const CACHE  = 'ayb-saha-' + SURUM;

/* Programın çevrimdışı çalışması için gereken KENDİ dosyaları */
const ASSETS = [
  './AYB_Saha_Harita.html',
  './ayb-tablet.js',
  './ayb-undo.js',
  './ayb-label-screen.js',
  './B_CAD.ttf',                 /* SEMBOL FONTU - eksikse semboller B Pro ile aynı olmaz */
  './ayb-backup.js',
  './ayb-kmz.js',
  './manifest.webmanifest',
  './icons/icon-96.png',
  './icons/icon-144.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

/* Dosyaları TEK TEK al: biri eksik olsa bile diğerleri yine de kaydedilsin.
   (Eski hâlde addAll kullanılıyordu; tek bir dosya eksikse HİÇBİRİ kaydedilmiyordu.) */
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      ASSETS.map(u =>
        fetch(new Request(u, { cache: 'reload' }))
          .then(r => (r && r.ok) ? c.put(u, r) : null)
          .catch(() => null)
      )
    ))
  );
});

/* Yeni sürüm devreye girince ESKİ sürümlerin önbelleği silinir */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  /* Harita döşemeleri ve diğer dış adresler: doğrudan ağdan, önbelleğe yazılmaz */
  let kendi = false;
  try { kendi = (new URL(req.url).origin === self.location.origin); } catch (_) {}
  if (!kendi) return;

  /* Programın kendi dosyaları: önce önbellek (hızlı ve çevrimdışı çalışır),
     arka planda ağdan tazelenir. */
  e.respondWith(
    caches.open(CACHE).then(c => c.match(req).then(hit => {
      const agdan = fetch(req).then(res => {
        if (res && res.ok) { try { c.put(req, res.clone()); } catch (_) {} }
        return res;
      }).catch(() => hit);
      if (hit) { e.waitUntil(agdan.catch(() => null)); return hit; }
      return agdan;
    }))
  );
});

/* Program "hemen güncelle" derse beklemeden devral */
self.addEventListener('message', e => {
  if (e && e.data === 'ayb-guncelle') self.skipWaiting();
});
