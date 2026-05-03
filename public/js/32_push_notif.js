/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 32_push_notif.js
   Push notifications: pedirPermisoNotificaciones(), registrarPushSubscription(), programarRecordatorio*()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ NOTIFICACIONES PUSH ══════════════════════════
async function pedirPermisoNotificaciones(){
  if(!('Notification' in window)) return false;
  if(Notification.permission === 'granted') {
    await registrarPushSubscription();
    return true;
  }
  if(Notification.permission === 'denied') return false;
  const perm = await Notification.requestPermission();
  if(perm === 'granted') await registrarPushSubscription();
  return perm === 'granted';
}

async function registrarPushSubscription(){
  try {
    if(!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const reg = await navigator.serviceWorker.ready;
    const { publicKey } = await api('/push/vapid-key');
    const appServerKey = urlBase64ToUint8Array(publicKey);

    let sub = await reg.pushManager.getSubscription();

    // iOS: always unsubscribe and resubscribe to get a fresh valid subscription
    // On other platforms only subscribe if not already subscribed
    if(IS_IOS && sub) {
      await sub.unsubscribe();
      sub = null;
    }

    if(!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appServerKey });
    }

    await api('/push/subscribe', { method:'POST', body: JSON.stringify({ subscription: sub.toJSON() }) });
    console.log('[Push] Subscribed OK, endpoint:', sub.endpoint.slice(-30));
  } catch(e) {
    console.log('[Push] Registration error:', e.message);
  }
}

// Re-register push when app comes back to foreground (iOS loses subscription)
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'visible' && TOKEN && Notification.permission === 'granted') {
    registrarPushSubscription().catch(()=>{});
  }
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// ── NOTIFICACIONES ────────────────────────────────────────────────
async function pedirPermisosNotificacion(){
  return pedirPermisoNotificaciones();
}

function swMsg(data){
  if(!('serviceWorker' in navigator)) return false;
  if(navigator.serviceWorker.controller){
    navigator.serviceWorker.controller.postMessage(data);
    return true;
  }
  // En la primera carga puede estar registrado pero aún no controlar la página.
  // Lo mandamos al SW activo cuando esté listo para no perder timers/notificaciones.
  navigator.serviceWorker.ready
    .then(reg => {
      const target = reg.active || navigator.serviceWorker.controller;
      if(target) target.postMessage(data);
    })
    .catch(()=>{});
  return true;
}

function notificarDescansoTerminado(nombreEjercicio){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const title = LANG==='en' ? '💪 Go for it!' : '💪 ¡A por ello!';
  const body = nombreEjercicio
    ? (LANG==='en' ? `Next set of ${nombreEjercicio}` : `Siguiente serie de ${nombreEjercicio}`)
    : (LANG==='en' ? 'Rest done — next set' : 'Descanso terminado — siguiente serie');
  const opts = { body, icon: '/logo.png', badge: '/logo.png', silent: false, tag: 'descanso', requireInteraction: false, vibrate: [150,80,150] };
  if(!swMsg({ type: 'SHOW_NOTIFICATION', title, options: opts })){
    try { new Notification(title, opts); } catch(e){}
  }
}

// iOS Safari kills SW when app goes to background — use server-side push timers
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

function programarNotificacionDescanso(nombreEjercicio, segundos, timerId){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const title = LANG==='en' ? '💪 Go for it!' : '💪 ¡A por ello!';
  const body = nombreEjercicio
    ? (LANG==='en' ? `Next set of ${nombreEjercicio}` : `Siguiente serie de ${nombreEjercicio}`)
    : (LANG==='en' ? 'Rest done' : 'Descanso terminado');

  // Always use server timer on iOS (SW dies in background/locked screen)
  // Also use server timer on any mobile as fallback
  if(TOKEN) {
    api('/push/timer', {
      method: 'POST',
      body: JSON.stringify({ timerId, segundos, title, body })
    }).catch(e => console.log('[Push timer] error:', e));
  }

  // Also schedule via SW (works when app is in foreground or Android)
  if(!IS_IOS) {
    swMsg({
      type: 'SCHEDULE_NOTIFICATION',
      title,
      options: { body, icon:'/logo.png', badge:'/logo.png', tag:'descanso-'+timerId, renotify:true, silent:false, requireInteraction:false, vibrate:[150,80,150] },
      delay: segundos*1000,
      timerId
    });
  }
}

function cancelarNotificacionDescanso(timerId){
  if(TOKEN) {
    api('/push/timer/cancel', { method:'POST', body: JSON.stringify({ timerId }) }).catch(()=>{});
  }
  if(!IS_IOS) {
    swMsg({ type: 'CANCEL_NOTIFICATION', timerId });
  }
}

function cancelarTodasNotificaciones(){
  if(TOKEN) {
    api('/push/timer/cancel', { method:'POST', body: JSON.stringify({}) }).catch(()=>{});
  }
  if(!IS_IOS) {
    swMsg({ type: 'CANCEL_ALL' });
  }
}

function valorarEntreno(emoji, btn){
  document.querySelectorAll('#valoracion_wrap button').forEach(b => {
    b.style.background = 'none';
    b.style.borderColor = 'var(--br)';
  });
  btn.style.background = 'rgba(59,130,246,.2)';
  btn.style.borderColor = 'var(--bl2)';
  const etiquetas = {'😴':'Cansado','😐':'Normal','💪':'Bien','🔥':'En llamas','🤕':'Lesión/dolor'};
  const label = etiquetas[emoji] || emoji;
  try {
    api('/clientes/'+CD.id+'/valoracion-sesion', {
      method: 'POST',
      body: JSON.stringify({ valoracion: emoji + ' ' + label })
    }).catch(()=>{});
  } catch(e) {}
}

function notificarEntrenoCompletado(nombre, minutos){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  try{
    new Notification('🐺 ¡Entreno completado!', {
      body: `${nombre}, has terminado en ${minutos} min. ¡Bestia!`,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'entreno-done',
      requireInteraction: false,
    });
  }catch(e){}
}

function notificarEntrenoIncompleto(nombre, series){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  try{
    new Notification('💪 Entreno registrado', {
      body: `${nombre}, has guardado tu sesión. Quedan ${series} serie${series>1?'s':''}. ¡Mañana lo rematas!`,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'entreno-incompleto',
      requireInteraction: false,
    });
  }catch(e){}
}

async function avisarCoachEntrenoIncompleto(pendientes){
  // Crear notificación al coach en la BD para que la vea en su panel
  try {
    const dia = CD.dias[activeDia];
    const mensaje = `⚠️ ${CD.nombre} dejó el entreno incompleto (${pendientes} serie${pendientes>1?'s':''} sin completar) — ${dia.nombre} ${dia.grupo}.`;
    await api('/notificaciones/coach', {
      method: 'POST',
      body: JSON.stringify({ tipo: 'entreno_incompleto', mensaje })
    }).catch(()=>{}); // silencioso si el endpoint no existe aún
  } catch(e) {}
}

// Programar recordatorio de peso (semanal)
function programarRecordatorioPeso(clienteId){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  // Guardar timestamp de próximo recordatorio
  const ultima = CD?.pesos?.length ? new Date(CD.pesos[CD.pesos.length-1].fecha).getTime() : 0;
  const proxima = ultima + 7*24*60*60*1000;
  const ahora = Date.now();
  if(proxima > ahora){
    const msHasta = proxima - ahora;
    // Solo programar si es en menos de 24h (visibilidad razonable)
    if(msHasta < 24*60*60*1000){
      setTimeout(()=>{
        if(!('Notification' in window) || Notification.permission !== 'granted') return;
        new Notification('⚖️ ¡Hora de pesarte!', {
          body: 'Han pasado 7 días. Pésate en ayunas y registra tu peso.',
          icon: '/logo.png',
          tag: 'peso-reminder',
          requireInteraction: true,
        });
        document.getElementById('pesoReminder').style.display='flex';applyLang(document.getElementById('pesoReminder'));
      }, msHasta);
    }
  }
}

// Programar recordatorio de foto (mensual)
function programarRecordatorioFoto(clienteId){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const ultima = CD?.fotos?.length ? new Date(CD.fotos[CD.fotos.length-1].fecha).getTime() : 0;
  const proxima = ultima + 28*24*60*60*1000;
  const ahora = Date.now();
  if(proxima > ahora){
    const msHasta = proxima - ahora;
    if(msHasta < 24*60*60*1000){
      setTimeout(()=>{
        if(!('Notification' in window) || Notification.permission !== 'granted') return;
        new Notification('📸 ¡Foto mensual!', {
          body: 'Ha pasado un mes. Sube tu foto de progreso.',
          icon: '/logo.png',
          tag: 'foto-reminder',
          requireInteraction: true,
        });
        document.getElementById('fotoReminder').style.display='flex';applyLang(document.getElementById('fotoReminder'));
      }, msHasta);
    }
