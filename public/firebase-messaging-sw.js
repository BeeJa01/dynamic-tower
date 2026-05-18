// public/firebase-messaging-sw.js


importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyBeGTON9Lhv1AhL6O7sZQ7omHMr9YvHv9o',
  authDomain:        'dynamic-tower-multipurpose-ltd.firebaseapp.com',
  projectId:         'dynamic-tower-multipurpose-ltd',
  storageBucket:     'dynamic-tower-multipurpose-ltd.firebasestorage.app',
  messagingSenderId: '552192673506',
  appId:             'G-SDJPP4J5RT',
});

const messaging = firebase.messaging();

// Handle background messages (app closed or in background)
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || '🍔 Dynamic Tower', {
    body:  body  || 'Your order has been updated!',
    icon:  icon  || '/logo.png',
    badge: '/logo.png',
    tag:   'order-update',
    data:  payload.data || {},
  });
});

// Clicking notification opens profile/orders page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/profile');
    })
  );
});
