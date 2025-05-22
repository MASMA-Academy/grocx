const CACHE_NAME = "grocx-cache-v1";
const urlsToCache = [
  "/",
  "/scan-barcode.html",
  "/history-list.html",
  "/price-checker.html",
  "/login.html",
  "/signup.html", // Assuming singup.html is a typo for signup.html
  "/item-detail.html",
  "/style.css",
  "/css/price-checker.css",
  "/css/history-list.css",
  "/js/scan-barcode.js",
  "/js/price-checker.js",
  "/js/history-list.js",
  // Add paths to your icons once you have them, e.g.:
  // "/images/icons/icon-192x192.png",
  // "/images/icons/icon-512x512.png",
  // Add any other critical static assets (images, fonts, etc.)
];

/**
 * Installation event handler for the service worker.
 * Opens the cache and adds all specified URLs to it.
 */
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching app shell");
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error("Service Worker: Failed to cache app shell:", error);
      })
  );
});

/**
 * Activation event handler for the service worker.
 * Cleans up old caches if any exist.
 */
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all open clients immediately
});

/**
 * Fetch event handler for the service worker.
 * Implements a cache-first strategy:
 * - Responds from cache if the request is found.
 * - Otherwise, fetches from the network, caches the response, and then returns it.
 */
self.addEventListener("fetch", (event) => {
  // We only want to cache GET requests for http/https
  if (event.request.method !== "GET" || (!event.request.url.startsWith("http") && !event.request.url.startsWith("/"))) {
    // For non-GET requests or non-http(s) schemes (e.g. chrome-extension://), bypass the service worker
    return;
  }

  // For navigation requests (HTML pages), try network first, then cache, then offline page.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If fetch is successful, clone it, cache it, and return it
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match("/scan-barcode.html"); // Fallback to a default offline page
          });
        })
    );
    return;
  }

  // For other GET requests (assets like CSS, JS, images), use cache-first then network.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // console.log("Service Worker: Serving from cache", event.request.url);
          return response; // Serve from cache
        }
        // console.log("Service Worker: Fetching from network", event.request.url);
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic" && networkResponse.type !== "cors") {
            // Don't cache opaque responses or errors
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return networkResponse;
        });
      })
      .catch(error => {
          console.error("Service Worker: Error fetching or caching", event.request.url, error);
          // Optionally, you could return a custom offline asset here (e.g. a placeholder image)
      })
  );
}); 