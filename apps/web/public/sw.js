// Service worker for the installed app.
//
// Caches only what is safe to serve stale: the app's static build assets and
// the offline page. Pages and Server Action responses are never cached, since
// every one of them is per-user and changes after each approval.
const VERSION = "v1";
const STATIC = `static-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC).then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" }))),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== STATIC).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

const isStaticAsset = (url) => url.origin === self.location.origin && url.pathname.startsWith("/_next/static/");

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Build assets are content-hashed, so cache-first is always correct.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Navigations go to the network; only when it is unreachable does the offline page show.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});
