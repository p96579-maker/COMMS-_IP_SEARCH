
const CACHE_NAME='comms-ip-search-v1';
const APP_SHELL=['./','./index.html','./styles.css','./app.js','./assets/data.json','./icons/icon-192.png','./icons/icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME&&caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method==='GET'&&new URL(r.url).origin===self.location.origin){e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{const t=res.clone();caches.open(CACHE_NAME).then(ch=>ch.put(r,t));return res;}).catch(()=>c)));}});
