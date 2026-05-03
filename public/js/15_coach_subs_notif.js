/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 15_coach_subs_notif.js
   Suscripciones, SSE, notificaciones coach: cargarSuscripcion(), iniciarSSE(), renderNotifCoach()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

async function enviarAvisosVencimiento() {
  const btn = event.target;
  btn.textContent='⏳ Enviando...'; btn.disabled=true;
  try {
    const r = await api('/suscripciones/avisar-vencimientos', {method:'POST'});
    btn.textContent=COACH_LANG==='en'?('✓ '+r.avisados+' alerts sent'):('✓ '+r.avisados+' avisos enviados');
    setTimeout(()=>{ btn.textContent='🔔 Enviar avisos'; btn.disabled=false; }, 3000);
  } catch(e) {
    btn.textContent='Error'; btn.disabled=false;
  }
}

function toggleCoachSubForm() {
  const f = document.getElementById('coach_sub_form');
  if(f) f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

async function cargarSuscripcionCliente(clienteId) {
  try {
    const s = await api('/clientes/'+clienteId+'/suscripcion');
    const info = document.getElementById('coach_sub_info');
    const badge = document.getElementById('coach_sub_badge');
    const form = document.getElementById('coach_sub_form');
    if(!info) return;

    if(!s || !s.fecha_fin) {
      if(badge) { badge.textContent=tc('Sin suscripción'); badge.style.color='var(--tx3)'; }
      const _subBtn = tc('+ Añadir suscripción');
      const _subMsg = tc('Este cliente no tiene suscripción activa.');
      info.innerHTML = '<div style="font-size:13px;color:var(--tx3);margin-bottom:10px">'+_subMsg+'</div><button class="btn btn-sm" onclick="toggleCoachSubForm()">'+_subBtn+'</button>';
      return;
    }

    const diasColor = s.vencida ? '#fca5a5' : s.proxima_a_vencer ? 'var(--amb)' : 'var(--gnb)';
    const estadoTexto = s.vencida ? ('🔴 '+(COACH_LANG==='en'?'Expired':'Vencida')) : s.proxima_a_vencer ? ('⚠️ '+(COACH_LANG==='en'?'Expires in':'Vence en')+' '+s.dias_restantes+'d') : ('✅ '+(COACH_LANG==='en'?'Active':'Activa'));

    if(badge) { badge.textContent=estadoTexto; badge.style.color=diasColor; badge.style.fontWeight='600'; badge.style.fontSize='11px'; badge.style.textTransform='none'; badge.style.letterSpacing='0'; }

    // Calcular días contratados totales
    const _diasContratados = s.fecha_inicio && s.fecha_fin
      ? Math.ceil((new Date(s.fecha_fin) - new Date(s.fecha_inicio)) / (1000*60*60*24))
      : null;

    info.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div style="background:var(--s2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:11px;color:var(--tx3);margin-bottom:2px">${COACH_LANG==='en'?'contracted':'contratados'}</div>
          <div style="font-size:18px;font-weight:700;color:var(--sv)">${_diasContratados ?? '—'}</div>
          <div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'days':'días'}</div>
        </div>
        <div style="background:var(--s2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:11px;color:var(--tx3);margin-bottom:2px">${COACH_LANG==='en'?'remaining':'restantes'}</div>
          <div style="font-size:18px;font-weight:700;color:${diasColor}">${s.vencida ? '0' : s.dias_restantes}</div>
          <div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'days':'días'}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div style="background:var(--s2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:12px;font-weight:700;color:var(--sv)">${s.fecha_inicio?.split('-').reverse().join('/') || '—'}</div>
          <div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'start':'inicio'}</div>
        </div>
        <div style="background:var(--s2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:12px;font-weight:700;color:${diasColor}">${s.fecha_fin?.split('-').reverse().join('/') || '—'}</div>
          <div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'expiry':'vencimiento'}</div>
        </div>
      </div>
      ${s.precio ? `<div style="font-size:12px;color:var(--tx3);margin-bottom:8px">💶 ${s.precio}€/${COACH_LANG==='en'?'month':'mes'}</div>` : ''}
      ${s.notas ? `<div style="font-size:11px;color:var(--tx3);margin-bottom:8px">📝 ${s.notas}</div>` : ''}
      <button class="btn btn-sm" onclick="toggleCoachSubForm()" style="font-size:12px">
        ${s.vencida ? ('🔄 '+(COACH_LANG==='en'?'Renew subscription':'Renovar suscripción')) : ('✏️ '+(COACH_LANG==='en'?'Edit / Renew':'Editar / Renovar'))}
      </button>`;

  } catch(e) { console.error('Error sub:', e); }
}

async function renovarSuscripcion(clienteId) {
  const btn = event.target;
  btn.textContent='⏳...'; btn.disabled=true;
  try {
    const meses = document.getElementById('sub_meses')?.value || 1;
    const precio = document.getElementById('sub_precio')?.value || 0;
    const notas = document.getElementById('sub_notas')?.value || '';
    await api('/clientes/'+clienteId+'/suscripcion', {
      method:'POST', body:JSON.stringify({meses:parseInt(meses), precio:parseFloat(precio), notas})
    });
    document.getElementById('coach_sub_form').style.display='none';
    await cargarSuscripcionCliente(clienteId);
    btn.textContent='✓ Activar / Renovar'; btn.disabled=false;
  } catch(e) {
    alert('Error: '+(e.error || e.message || 'Error desconocido'));
    btn.textContent='✓ Activar / Renovar'; btn.disabled=false;
  }
}

async function cancelarSuscripcion(clienteId) {
  if(!confirm(tc('¿Cancelar la suscripción? El cliente perderá el acceso.'))) return;
  const btn = event.target;
  btn.textContent='⏳...'; btn.disabled=true;
  try {
    await api('/clientes/'+clienteId+'/suscripcion/cancelar', {method:'PUT'});
    await cargarSuscripcionCliente(clienteId);
    btn.textContent=tc('Cancelar suscripción'); btn.disabled=false;
  } catch(e) {
    alert('Error: '+(e.error || e.message || 'Error desconocido'));
    btn.textContent=tc('Cancelar suscripción'); btn.disabled=false;
  }
}

// ── NOTIFICACIONES COACH ──────────────────────────────────────────
// ── SSE — Eventos en tiempo real ─────────────────────────────────────
let _sseSource = null;

// ── Helper: mostrar notificación del sistema (funciona con app abierta o cerrada) ──
function mostrarNotifSistema(title, body, tag='wm-notif', url='/'){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, icon:'/logo.png', badge:'/logo.png', tag, renotify:true,
                 requireInteraction:false, vibrate:[200,100,200], data:{url} };
  // Intentar via SW (más fiable, funciona con pantalla apagada si está en background)
  if(!swMsg({ type:'SHOW_NOTIFICATION', title, options:opts })){
    try { new Notification(title, opts); } catch(e){}
  }
}

function iniciarSSE(){
  if(!TOKEN) return;
  cerrarSSE(); // cerrar conexión previa si la hay

  const url = (API||'') + '/api/eventos?token=' + encodeURIComponent(TOKEN);
  _sseSource = new EventSource(url);

  // ── Notificación recibida (cualquier tipo) ──
  _sseSource.addEventListener('notificacion', e => {
    try {
      const data = JSON.parse(e.data);
      if(USER && USER.role === 'coach') {
        cargarNotificacionesCoach();
        // Notificación del sistema en PC/móvil
        mostrarNotifSistema('WolfMindset 🐺', data.mensaje, 'notif-coach-'+Date.now());
      } else {
        const tipo = data.tipo || '';
        if(tipo === 'vencimiento_proximo' || tipo === 'suscripcion_vencida') {
          mostrarBannerSub(data.mensaje, tipo === 'suscripcion_vencida' ? 'error' : 'warning');
        }
        mostrarNotifSistema('WolfMindset 🐺', data.mensaje, 'notif-cliente-'+Date.now());
      }
    } catch(err) {}
  });

  // ── Badge de mensajes del coach actualizado ──
  _sseSource.addEventListener('badge_msgs', e => {
    cargarNotificacionesCoach();
    if(window._coachTabActual === 'mensajes') {
      if(window._coachMsgThread) {
        coachMsgsLoadThread(window._coachMsgThread, false);
      } else {
        coachMsgsLoadList();
      }
    }
  });

  // ── Mensaje nuevo recibido por SSE ──
  _sseSource.addEventListener('mensaje_nuevo', e => {
    try {
      const data = JSON.parse(e.data);
      const existingLocal = Array.isArray(_chatMsgs) && data.id && _chatMsgs.some(m => String(m.id) === String(data.id));

      // Cliente: recibe respuestas del coach/IA y actualiza su hilo.
      if(USER && USER.role === 'cliente' && data.de_coach && !existingLocal) {
        const msg = {
          role: 'assistant',
          content: data.contenido,
          sender: window._coachNombreAsistente || 'Coach',
          ts: new Date(data.created_at).getTime(),
          via: data.via_ia ? 'ia' : 'coach',
          id: data.id
        };
        _chatMsgs.push(msg);
        _chatSave();
        if(document.getElementById('chatMsgs')) _chatRenderAll();
        const typing = document.getElementById('chatTyping');
        if(typing) typing.style.display = 'none';
        // Notificación del sistema — llega aunque la app esté en background
        const coachName = window._coachNombreAsistente || 'Coach';
        mostrarNotifSistema(
          LANG==='en' ? `💬 Message from ${coachName}` : `💬 Mensaje de ${coachName}`,
          data.contenido.length > 80 ? data.contenido.slice(0,80)+'…' : data.contenido,
          'msg-coach-' + data.id
        );
      }

      // Coach: si está en mensajes, refresca lista o hilo abierto al instante.
      if(USER && USER.role === 'coach') {
        if(window._coachTabActual === 'mensajes') {
          if(window._coachMsgThread && String(window._coachMsgThread) === String(data.cliente_id)) {
            coachMsgsLoadThread(window._coachMsgThread, false);
          } else {
            coachMsgsLoadList();
          }
        }
        cargarNotificacionesCoach();
      }
    } catch(err) {}
  });

  _sseSource.onerror = () => {
    // Reconexión automática en 5s si se cae (Railway reinicia, etc.)
    cerrarSSE();
    setTimeout(()=>{ if(TOKEN) iniciarSSE(); }, 5000);
  };
}

function cerrarSSE(){
  if(_sseSource){
    _sseSource.close();
    _sseSource = null;
  }
}

async function cargarNotificacionesCoach() {
  try {
    const notifs = await api('/notificaciones');
    const noLeidas = notifs.filter(n=>!n.leida).length;
    const badge = document.getElementById('notif_badge');
    if(badge) {
      if(noLeidas > 0) { badge.style.display='flex'; badge.textContent=noLeidas; }
      else { badge.style.display='none'; }
    }
    window._notifCoach = notifs;
  } catch(e) {}
  // Badge de mensajes no leídos
  try {
    const mdata = await api('/mensajes/no-leidos').catch(()=>({count:0}));
    const n = mdata && mdata.count ? mdata.count : 0;
    ['badge_msgs','badge_msgs_m'].forEach(id=>{
      const b = document.getElementById(id);
      if(!b) return;
      if(n > 0){ b.style.display='inline-flex'; b.textContent=n; }
      else { b.style.display='none'; }
    });
  } catch(e) {}
}

function toggleNotifCoach() {
  const panel = document.getElementById('notif_panel_coach');
  if(!panel) return;
  const visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : 'block';
  if(!visible) renderNotifCoach();
}

function renderNotifCoach() {
  const list = document.getElementById('notif_list_coach');
  if(!list) return;
  const notifs = window._notifCoach || [];
  if(!notifs.length) { list.innerHTML=`<div style="padding:16px;font-size:13px;color:var(--tx3);text-align:center">${COACH_LANG==='en'?'No notifications':'Sin notificaciones'}</div>`; return; }
  list.innerHTML = notifs.map(n=>`
    <div onclick="leerNotifCoach(${n.id},this)" style="padding:12px 14px;border-bottom:0.5px solid var(--br);cursor:pointer;background:${n.leida?'none':'rgba(59,130,246,.04)'}">
      <div style="font-size:12px;color:${n.leida?'var(--tx3)':'var(--sv)'};line-height:1.5">${n.mensaje}</div>
      <div style="font-size:10px;color:var(--tx3);margin-top:3px">${new Date(n.created_at).toLocaleDateString(COACH_LANG==='en'?'en-GB':'es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
    </div>`).join('');
}

async function leerNotifCoach(id, el) {
  await api('/notificaciones/'+id+'/leer', {method:'PUT'}).catch(()=>{});
  el.style.background='none';
  await cargarNotificacionesCoach();
}

async function marcarTodasLeidasCoach() {
  await api('/notificaciones/leer-todas', {method:'PUT'}).catch(()=>{});
  await cargarNotificacionesCoach();
  renderNotifCoach();
  document.getElementById('notif_panel_coach').style.display='none';
}

// Cerrar panel al hacer click fuera
document.addEventListener('click', e => {
  const panel = document.getElementById('notif_panel_coach');
  const bell = document.getElementById('notif_bell_wrap');
  if(panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.style.display='none';
  }
});

// Enter físico confirma la serie en el teclado virtual del entreno
document.addEventListener('keydown', e => {
  if(e.key === 'Enter') {
    const kb = document.getElementById('strong_keyboard');
    if(kb && kb.style.display !== 'none' && activeInput) {
      e.preventDefault();
      if(activeInput.field === 'peso') {
        // En peso: guardar y saltar a reps inmediatamente
        const {ei, si} = activeInput;
        const ex = CD.dias[activeDia]?.ejercicios[ei];
        if(ex) ex._series[si].peso = parseFloat(kbValue) || 0;
        rerenderSerieRow(ei, si);
        openKeyboard(ei, si, 'reps');
      } else {
        // En reps o rir: confirmar (kbConfirm maneja el flujo)
        kbConfirm();
      }
    }
  }
});



