const CACHE_NAME = 'dhaka-metro-3d-v10';
const ASSETS = [
  './', './index.html', './manifest.json', './icon.svg', './css/style.css',
  './js/three.module.js', './js/main.js', './js/config.js', './js/audio.js',
  './js/models/trainModel.js', './js/models/characterModel.js',
  './js/models/stationModel.js', './js/models/cityModel.js',
  './js/systems/weatherSystem.js', './js/systems/missionSystem.js',
  './js/systems/announcementSystem.js'
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('fetch', (e) => { e.respondWith(caches.match(e.request).then((c) => c || fetch(e.request))); });
