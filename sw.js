// Service worker: guarda la app en el celular para usarla sin internet.
// Si cambias archivos y quieres que todos reciban la versión nueva, sube el número de CACHE.
const CACHE = 'english7-v3';

const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'js/app.js', 'js/config.js', 'js/store.js', 'js/speech.js', 'js/compare.js', 'js/ui.js', 'js/data.js',
  'js/views/home.js', 'js/views/unit.js', 'js/views/vocab.js', 'js/views/grammar.js',
  'js/views/quiz.js', 'js/views/teacher.js', 'js/views/rewards.js',
  'js/exercises/index.js', 'js/exercises/runner.js', 'js/exercises/_common.js', 'js/exercises/_speak.js',
  'js/exercises/listen-choice.js', 'js/exercises/dictation.js', 'js/exercises/listen-tf.js',
  'js/exercises/reading.js', 'js/exercises/match.js', 'js/exercises/gap-fill.js',
  'js/exercises/word-order.js', 'js/exercises/form-fill.js', 'js/exercises/guided-writing.js',
  'js/exercises/shadowing.js', 'js/exercises/speak-answer.js', 'js/exercises/roleplay.js',
  'data/units.json', 'data/unit1.json', 'data/unit2.json', 'data/unit3.json',
  'assets/icons/icon.svg', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la copia guardada (rápido y sin internet); en segundo plano se actualiza desde la red.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    const res = await network;
    if (res) return res;
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  })());
});
