// Service Worker for PWA functionality

const CACHE_NAME = 'fygs-dev-v1.0.0';
const urlsToCache = [
  '/',
  '/offline',
  '/site.webmanifest',
  '/images/android-chrome-192x192.png',
  '/images/android-chrome-512x512.png',
  '/images/apple-touch-icon.png',
  '/images/favicon-32x32.png',
  '/images/favicon-16x16.png',
  '/images/og-image.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Clone the request for the network fetch
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response to store in cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // Serve fallback for navigation requests when offline
        if (event.request.mode === 'navigate') {
          return caches.match('/offline');
        }
        
        // For other requests, try to match from cache
        return caches.match('/offline');
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


// Listen for push events
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/images/android-chrome-192x192.png',
    badge: '/images/android-chrome-512x512.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('FYGS.dev', options)
  );
});

// Listen for notification click events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('https://fygs.dev')
  );
});