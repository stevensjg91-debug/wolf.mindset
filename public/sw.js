// WolfMindset Service Worker — notificaciones en background
// Conserva tu lógica original y añade soporte seguro para temporizadores de descanso.

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Guardamos timeouts activos por si la app manda cancelar/reprogramar
const wolfTimers = new Map();

function clearWolfTimer(id){
  if(!id) return;
  const old = wolfTimers.get(id);
  if(old){
    clearTimeout(old);
    wolfTimers.delete(id);
  }
}

async function showWolfNotification(title, options = {}){
  try{
    await self.registration.showNotification(title || 'WolfMindset', {
      ...options,
      icon: options.icon || '/logo.png',
      badge: options.badge || '/logo.png',
    });
  }catch(e){}
}

// Recibir mensajes del cliente para mostrar notificaciones
self.addEventListener('message', e => {
  const data = e.data || {};

  // Mantiene compatibilidad con tu versión actual
  if(data.type === 'SHOW_NOTIFICATION'){
    e.waitUntil(
      showWolfNotification(data.title, data.options || {})
    );
    return;
  }

  // Nuevo: programar notificación de descanso sin depender del contador visual
  // Payload esperado:
  // { type:'SCHEDULE_REST_NOTIFICATION', id:'rest-timer', title:'...', body:'...', delayMs:90000 }
  if(data.type === 'SCHEDULE_REST_NOTIFICATION'){
    const id = data.id || 'wolf-rest-timer';
    const delayMs = Math.max(0, Number(data.delayMs || 0));
    clearWolfTimer(id);

    const timeout = setTimeout(() => {
      wolfTimers.delete(id);
      showWolfNotification(data.title || 'WolfMindset', {
        body: data.body || '',
        tag: data.tag || id,
        renotify: true,
        requireInteraction: false,
        data: data.notificationData || { url: '/' },
      });
    }, delayMs);

    wolfTimers.set(id, timeout);
    return;
  }

  // Nuevo: cancelar una notificación programada si el usuario salta el descanso o termina antes
  if(data.type === 'CANCEL_REST_NOTIFICATION'){
    clearWolfTimer(data.id || 'wolf-rest-timer');
  }
});

// Al pulsar la notificación, abre la app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification?.data?.url || '/';
  e.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(clients => {
      for(const client of clients){
        try{
          const clientUrl = new URL(client.url);
          const targetUrl = new URL(url, self.location.origin);
          if(clientUrl.origin === targetUrl.origin) return client.focus();
        }catch(err){}
      }
      return self.clients.openWindow(url);
    })
  );
});
