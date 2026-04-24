// WolfMindset Service Worker — notificaciones en background
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Recibir mensajes del cliente para mostrar notificaciones
self.addEventListener('message', e => {
  if(e.data?.type === 'SHOW_NOTIFICATION'){
    e.waitUntil(
      self.registration.showNotification(e.data.title, {
        ...e.data.options,
        icon: '/logo.png',
        badge: '/logo.png',
      })
    );
  }
});

// Al pulsar la notificación, abre la app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window'}).then(clients => {
      if(clients.length) return clients[0].focus();
      return self.clients.openWindow('/');
    })
  );
});
