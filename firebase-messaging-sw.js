// Al Hadi Store — Firebase Cloud Messaging background handler.
// This is a SEPARATE service worker from service-worker.js (which only
// handles offline caching). Firebase requires this exact file name and
// this file MUST live at the site root so its scope covers the whole app.
// It only wakes up to show a system notification when a push arrives
// while the site/app isn't open in a tab — it does not do any caching.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAo4F7zUDA9mnwPdSXNZEB0B2t8CLZwG2s",
  authDomain: "al-hadi-store-b.firebaseapp.com",
  projectId: "al-hadi-store-b",
  storageBucket: "al-hadi-store-b.firebasestorage.app",
  messagingSenderId: "773720271675",
  appId: "1:773720271675:web:01c1c2d5caa4e8a87c251e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = (payload.notification && payload.notification.title) || 'Al Hadi Store';
  const body = (payload.notification && payload.notification.body) || '';
  const link = (payload.fcmOptions && payload.fcmOptions.link) ||
               (payload.data && payload.data.link) || '/';

  self.registration.showNotification(title, {
    body: body,
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    data: { link: link }
  });
});

// Tapping the notification opens (or focuses) the site.
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (const client of list) {
        if ('focus' in client) { client.navigate(link); return client.focus(); }
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
