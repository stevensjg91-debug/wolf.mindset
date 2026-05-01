// WolfMindset Service Worker
// Mantiene notificaciones locales del timer de descanso aunque la pantalla se bloquee.
const WM_VERSION = 'wm-sw-2026-04-30-v2';
const timers = new Map();

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

function clearTimer(timerId){
  if(!timerId) return;
  const existing = timers.get(timerId);
  if(existing){
    clearTimeout(existing);
    timers.delete(timerId);
  }
}

function showWolfNotification(title, options = {}){
  const finalOptions = {
    icon: '/logo.png',
    badge: '/logo.png',
    silent: false,
    requireInteraction: false,
    ...options
  };
  return self.registration.showNotification(title || '🐺 WolfMindset', finalOptions);
}

self.addEventListener('message', event => {
  const data = event.data || {};

  if(data.type === 'SKIP_WAITING'){
    self.skipWaiting();
    return;
  }

  if(data.type === 'SHOW_NOTIFICATION'){
    event.waitUntil(showWolfNotification(data.title, data.options || {}));
    return;
  }

  if(data.type === 'SCHEDULE_NOTIFICATION'){
    const timerId = data.timerId || 'default';
    const delay = Math.max(0, Number(data.delay || 0));
    clearTimer(timerId);
    const timeoutId = setTimeout(() => {
      timers.delete(timerId);
      showWolfNotification(data.title, data.options || {});
    }, delay);
    timers.set(timerId, timeoutId);
    return;
  }

  if(data.type === 'CANCEL_NOTIFICATION'){
    clearTimer(data.timerId || 'default');
    return;
  }

  if(data.type === 'CANCEL_ALL'){
    timers.forEach(timeoutId => clearTimeout(timeoutId));
    timers.clear();
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) return client.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow('/');
  })());
});
