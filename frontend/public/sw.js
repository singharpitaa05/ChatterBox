// SERVICE WORKER

// Simple Service Worker for ChatterBox
// Handles background notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'New Message',
        body: event.data.text(),
      };
    }
  }

  const title = data.title || 'ChatterBox';
  const options = {
    body: data.body || 'You have a new message',
    icon: data.icon || '/logo.png',
    badge: '/badge.png',
    data: data.url || '/',
    vibrate: [200, 100, 200],
    tag: 'chatterbox-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (let client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app not open
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data || '/dashboard');
      }
    })
  );
});

// Handle messages from main app
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});