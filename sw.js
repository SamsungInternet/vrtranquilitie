// Perform install steps
var CACHE_NAME = 'vr-tranquilities-v1';
var urlsToCache = [
    'js/data.js',
    'js/aframe.min.js',
    'index.html',
    'audio/car_horn.wav',
    'audio/please_hold.mp3',
    'audio/police_siren.mp3',
    'audio/polish_ad.mp3',
    'audio/street_walking.mp3',
    'css/style.css',
    'imgs/btnGPS.png',
    'imgs/btnMic.png',
    'imgs/cr.jpg',
    'imgs/mic.jpg',
    'imgs/gps.jpg',
    'imgs/fr.jpg',
    'imgs/kr.jpg',
    'imgs/us.jpg',
    'imgs/sg.jpg',
    'imgs/icon192.png',
    'imgs/icon512.png',
    'imgs/splash.png',
    'imgs/uk.jpg',
    'index.html'
];

self.addEventListener('install', function(event) {
// Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache');
        return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {

  var cacheWhitelist = ['vr-tranquilities-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});