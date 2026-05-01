// WolfMindset Service Worker — notificaciones en background
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ── Temporizadores programados ────────────────────────────────────
const _timers = {};

self.addEventListener('message', e => {
  if(!e.data) return;

  if(e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if(e.data.type === 'SHOW_NOTIFICATION'){
    e.waitUntil(
      self.registration.showNotification(e.data.title, {
        ...e.data.options,
        icon: '/logo.png',
        badge: '/logo.png',
      })
    );
    return;
  }

  // Temporizador con delay — para descansos entre series
  if(e.data.type === 'SCHEDULE_NOTIFICATION'){
    const { title, options, delay, timerId } = e.data;
    // Cancelar timer previo con el mismo id si existía
    if(_timers[timerId]) { clearTimeout(_timers[timerId]); delete _timers[timerId]; }
    _timers[timerId] = setTimeout(() => {
      delete _timers[timerId];
      self.registration.showNotification(title, {
        ...options,
        icon: '/logo.png',
        badge: '/logo.png',
      });
    }, delay);
    return;
  }

  if(e.data.type === 'CANCEL_NOTIFICATION'){
    const { timerId } = e.data;
    if(_timers[timerId]) { clearTimeout(_timers[timerId]); delete _timers[timerId]; }
    return;
  }

  if(e.data.type === 'CANCEL_ALL'){
    Object.keys(_timers).forEach(k => { clearTimeout(_timers[k]); delete _timers[k]; });
    return;
  }
});

// ── Push del servidor (pantalla apagada, PC bloqueado, app cerrada) ──
self.addEventListener('push', e => {
  let data = { title: 'WolfMindset 🐺', body: '', url: '/' };
  try { data = { ...data, ...e.data.json() }; } catch(err) {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: data.url },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  );
});

// ── Al pulsar la notificación, abre/enfoca la app ─────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(clients => {
      const match = clients.find(c => c.url.includes(self.location.origin));
      if(match) return match.focus();
      return self.clients.openWindow(url);
    })
  );
});
