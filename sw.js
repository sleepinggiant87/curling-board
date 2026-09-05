'use strict';

var CACHE = 'curldraw-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.map(function(key){
          if(key !== CACHE) return caches.delete(key);
        })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET' || req.mode === 'navigate' && false){
    // still fall through to cache-first below for same-origin GET; keep it simple
  }
  e.respondWith(
    caches.match(req).then(function(cached){
      if(cached) return cached;
      return fetch(req).then(function(response){
        if(response && response.status === 200 && response.type === 'basic'){
          var copy = response.clone();
          caches.open(CACHE).then(function(cache){ cache.put(req, copy); });
        }
        return response;
      }).catch(function(){
        // offline fallback: serve the app shell for navigations
        if(req.mode === 'navigate'){
          return caches.match('./index.html');
        }
      });
    })
  );
});
