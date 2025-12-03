// Firebase Cloud Messaging Service Worker
// This handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: Replace these with your actual Firebase config
// You can also fetch this from a config endpoint
firebase.initializeApp({
  apiKey: "AIzaSyCTKMG2Jo4C1y_adgAF61GyQ8_ER_8_p9g",
  authDomain: "news-aggregator-bb220.firebaseapp.com",
  projectId: "news-aggregator-bb220",
  storageBucket: "news-aggregator-bb220.firebasestorage.app",
  messagingSenderId: "393859722906",
  appId: "1:393859722906:web:2de4c2d2f35aae5b177923"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Update';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-192.png',
    badge: '/badge-72.png',
    image: payload.notification?.image,
    data: payload.data || {},
    tag: payload.data?.articleId || 'default',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Read Article',
        icon: '/icons/read-icon.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/close-icon.png'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    // User dismissed the notification
    return;
  }
  
  // Get the URL to open
  const urlToOpen = event.notification.data?.url || 
                    (event.notification.data?.articleId ? 
                      `/article/${event.notification.data.articleId}` : 
                      '/');
  
  const fullUrl = new URL(urlToOpen, self.location.origin).href;
  
  // Open or focus the client
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === fullUrl && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
  
  // Track notification click
  if (event.notification.data?.articleId) {
    fetch('/api/track-notification-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleId: event.notification.data.articleId,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error('Error tracking click:', err));
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);
  
  // Track notification dismissal if needed
  if (event.notification.data?.articleId) {
    fetch('/api/track-notification-close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleId: event.notification.data.articleId,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error('Error tracking close:', err));
  }
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installing...');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Handle push events (in case onBackgroundMessage doesn't work)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);
  
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }
  
  const data = event.data.json();
  const notification = data.notification || {};
  
  const title = notification.title || 'New Notification';
  const options = {
    body: notification.body || '',
    icon: notification.icon || '/icon-192.png',
    badge: '/badge-72.png',
    image: notification.image,
    data: data.data || {},
    tag: data.data?.articleId || 'default',
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
