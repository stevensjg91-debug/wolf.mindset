// WolfMindset Service Worker v2
const CACHE = 'wolfmindset-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// ── NOTIFICACIONES DESDE EL TIMER ─────────────────────────────────
// El timer del cliente envía un mensaje cuando termina el descanso
self.addEventListener('message', e => {
  const { type, title, options, delay, timerId } = e.data || {};

  if(type === 'SHOW_NOTIFICATION') {
    // Notificación inmediata (pantalla bloqueada)
    self.registration.showNotification(title, {
      ...options,
      icon: options?.icon || '/logo.png',
      badge: options?.badge || '/logo.png',
    }).catch(()=>{});
  }

  if(type === 'SCHEDULE_NOTIFICATION') {
    // Programar notificación con delay (timer de descanso)
    // Guardamos el setTimeout con ID para poder cancelarlo
    if(!self._timers) self._timers = {};
    // Cancelar timer anterior del mismo ID si existe
    if(timerId && self._timers[timerId]) {
      clearTimeout(self._timers[timerId]);
    }
    const t = setTimeout(() => {
      self.registration.showNotification(title, {
        body: options?.body || 'Descanso terminado',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'descanso-' + (timerId||'0'),
        silent: false,
        vibrate: [150, 80, 150, 80, 200],
        requireInteraction: false,
        actions: [
          { action: 'ok', title: '💪 ¡Vamos!' }
        ]
      }).catch(()=>{});
      if(timerId && self._timers) delete self._timers[timerId];
    }, (delay || 0));
    if(timerId) {
      if(!self._timers) self._timers = {};
      self._timers[timerId] = t;
    }
  }

  if(type === 'CANCEL_NOTIFICATION') {
    // Cancelar timer programado
    if(timerId && self._timers && self._timers[timerId]) {
      clearTimeout(self._timers[timerId]);
      delete self._timers[timerId];
    }
    // Cerrar notificación activa
    self.registration.getNotifications({ tag: 'descanso-' + (timerId||'0') })
      .then(notifs => notifs.forEach(n => n.close()))
      .catch(()=>{});
  }

  if(type === 'CANCEL_ALL') {
    // Al terminar entreno — cancelar todo
    if(self._timers) {
      Object.values(self._timers).forEach(t => clearTimeout(t));
      self._timers = {};
    }
    self.registration.getNotifications().then(notifs => notifs.forEach(n => n.close())).catch(()=>{});
  }
});

// Click en notificación — abrir la app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if(clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
