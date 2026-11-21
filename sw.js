/*
  TERMS OF USE: see Index.html. (c) 001 Managed Systems / Elliot Pope.

  Lets the Add photos page open without signal. The page is always fetched
  fresh when there is signal (so updates show straight away); the last copy
  is used when there isn't.
*/
var CACHE = 'pc-photo-page-v1';

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(['./', 'Index.html']).catch(function () {}); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || e.request.mode !== 'navigate') return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put('Index.html', copy); });
      return res;
    }).catch(function () {
      return caches.match('Index.html').then(function (r) { return r || caches.match('./'); });
    })
  );
});
