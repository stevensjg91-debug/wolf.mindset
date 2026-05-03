/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 05_auth.js
   doLogin(), loadCD(), verificarSuscripcionCliente(), mostrarBannerSub(), doLogout(), autoLogin

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// LOGIN

async function doLogin(){
  const u=document.getElementById('lu').value.trim(),p=document.getElementById('lp').value;
  const err=document.getElementById('lerr');err.style.display='none';
  const remember=document.getElementById('rememberMe')?.checked;
  try{
    const data=await api('/auth/login',{method:'POST',body:JSON.stringify({username:u,password:p})});
    if(remember){ localStorage.setItem('wm_saved_user',u); localStorage.setItem('wm_saved_pass',p); }
    else { localStorage.removeItem('wm_saved_user'); localStorage.removeItem('wm_saved_pass'); }
    TOKEN=data.token;USER=data.user;
    // Load foto from server to ensure it's fresh
    try {
      const fotoData = await api('/mi-foto');
      if(fotoData.foto) { USER.foto_perfil = fotoData.foto; }
    } catch(e) {}
    // Si el servidor devuelve lang del coach, usarlo como COACH_LANG
    if(data.user.role==='coach' && data.user.lang) {
      COACH_LANG = data.user.lang;
      localStorage.setItem('wm_coach_lang', data.user.lang);
    }
    localStorage.setItem('wm_token',TOKEN);localStorage.setItem('wm_user',JSON.stringify(USER));
    if(USER.role==='coach'){
      show('sCoach');renderCoach('clientes');setTimeout(()=>{setCoachLang(COACH_LANG);updateCoachTopbar();},200);
      // coachMobileNav visibility handled by CSS
      // Mostrar Mi Equipo para todos los coaches
      const sniEq=document.getElementById('sni_equipo');
      if(sniEq) sniEq.style.display='flex';
      cargarNotificacionesCoach();
      iniciarSSE();
      // Auto-verificar vencimientos al entrar
      api('/suscripciones/avisar-vencimientos', {method:'POST'}).catch(()=>{});
      // Registrar push para recibir notificaciones en PC/móvil bloqueado
      setTimeout(async()=>{
        const ok = await pedirPermisoNotificaciones();
        if(ok) console.log('[Push] Coach registrado para push');
      }, 2000);
    } else {
      show('sCliente');
      await loadCD(data.user.clienteId);
      // Load coach photo for AI assistant
      api('/mi-coach/foto').then(d => {
        window._coachFoto = d.foto || null;
        window._coachNombreAsistente = d.nombre || 'Coach';
      }).catch(()=>{});
      // Verificar suscripción antes de mostrar la app
      await verificarSuscripcionCliente(data.user.clienteId);
      klNav('entreno',document.getElementById('bni0'));
      iniciarSSE();
    setTimeout(checkRecordatorios,2000);
    // Pedir permiso de notificaciones
    setTimeout(async()=>{
      const ok = await pedirPermisoNotificaciones();
      if(ok && CD){
        programarRecordatorioPeso(CD.id);
        programarRecordatorioFoto(CD.id);
      }
    }, 3000);
    }
  }catch(e){err.textContent=e.error||'Error al conectar';err.style.display='block';}
}
async function loadCD(id){
  CD = await api('/clientes/'+id);
  // Load exercise images separately (base64 not in main payload)
  if(!window.exImages) {
    try {
      window.exImages = await api('/ejercicios-imagenes');
    } catch(e) { window.exImages = {}; }
  }
}
async function verificarSuscripcionCliente(clienteId) {
  try {
    const s = await api('/clientes/'+clienteId+'/suscripcion');
    if(!s || !s.fecha_fin) return; // Sin suscripción configurada, dejar pasar

    if(s.vencida || s.estado === 'cancelada') {
      // Bloquear acceso — mostrar pantalla de suscripción vencida
      const appEl = document.getElementById('sCliente');
      if(appEl) appEl.innerHTML = `
        <div style="min-height:100vh;background:var(--b);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;text-align:center">
          <div style="font-size:56px;margin-bottom:20px">🔒</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--sv);letter-spacing:.08em;margin-bottom:8px">Acceso Suspendido</div>
          <div style="font-size:14px;color:var(--tx3);max-width:280px;line-height:1.6;margin-bottom:24px">
            Tu suscripción ${s.estado==='cancelada'?'ha sido cancelada':'venció el '+s.fecha_fin.split('-').reverse().join('/')}.<br>Contacta con tu coach para renovarla.
          </div>
          <div style="background:var(--s);border:0.5px solid var(--br);border-radius:14px;padding:16px 20px;margin-bottom:20px;width:100%;max-width:300px">
            <div style="font-size:11px;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Tu coach</div>
            <div style="font-size:15px;font-weight:700;color:var(--sv)">WolfMindset</div>
            <div style="font-size:13px;color:var(--blg);margin-top:4px">@wolfmindset</div>
          </div>
          <button onclick="doLogout()" style="background:none;border:0.5px solid var(--br);color:var(--tx3);padding:10px 20px;border-radius:10px;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif">Cerrar sesión</button>
        </div>`;
      return;
    }

    // Aviso si está próxima a vencer (≤5 días)
    if(s.proxima_a_vencer) {
      const _msgVenc = s.dias_restantes === 1
        ? `⏳ ¡Mañana vence tu suscripción! Habla con tu coach hoy mismo para renovarla y seguir entrenando sin interrupciones. 💪`
        : `⏳ Tu suscripción vence en ${s.dias_restantes} días. ¡No pierdas el ritmo! Renueva con tu coach para seguir avanzando. 💪`;
      mostrarBannerSub(_msgVenc, 'warning');
    }

    // Cargar notificaciones del cliente
    cargarNotificacionesCliente();
    // Aplicar idioma a la barra de navegación
    setTimeout(()=>applyLang(document.querySelector('#sCliente .bnav-bar')), 200);

  } catch(e) {
    console.error('Error verificando suscripción:', e);
    // Si falla la verificación, dejar entrar (no bloquear por error de red)
  }
}

function mostrarBannerSub(mensaje, tipo) {
  // Eliminar banner anterior si existe
  const prev = document.getElementById('sub_banner_cliente');
  if(prev) prev.remove();
  const banner = document.createElement('div');
  banner.id = 'sub_banner_cliente';
  const isError = tipo === 'error';
  const bg = isError ? 'rgba(239,68,68,.15)' : 'rgba(245,158,11,.13)';
  const border = isError ? 'rgba(239,68,68,.45)' : 'rgba(245,158,11,.45)';
  const color = isError ? '#fca5a5' : '#fcd34d';
  const icon = isError ? '🔴' : '⏳';
  banner.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:9999;background:${bg};border-bottom:1px solid ${border};padding:12px 16px;display:flex;align-items:center;gap:10px;backdrop-filter:blur(10px);box-shadow:0 2px 12px rgba(0,0,0,.3)`;
  banner.innerHTML = `
    <span style="font-size:18px">${icon}</span>
    <span style="font-size:12px;font-weight:600;color:${color};flex:1;line-height:1.4">${mensaje}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:${color};cursor:pointer;font-size:20px;padding:0;opacity:.7;line-height:1">×</button>`;
  document.body.prepend(banner);
  // Auto-ocultar a los 12 segundos
  setTimeout(() => { if(banner.parentElement) banner.remove(); }, 12000);
}

async function cargarNotificacionesCliente() {
  try {
    const notifs = await api('/notificaciones');
    const noLeidas = notifs.filter(n=>!n.leida);

    // Notificaciones de vencimiento: mostrar como banner
    const notifVenc = noLeidas.find(n => n.tipo === 'vencimiento_proximo' || n.tipo === 'suscripcion_vencida');
    if(notifVenc) {
      const esVencida = notifVenc.tipo === 'suscripcion_vencida';
      mostrarBannerSub(notifVenc.mensaje, esVencida ? 'error' : 'warning');
      setTimeout(()=>api('/notificaciones/'+notifVenc.id+'/leer',{method:'PUT'}).catch(()=>{}), 8000);
    }

    // Otras notificaciones no leidas (peso, foto, etc.)
    const otraNoLeida = noLeidas.find(n => n.tipo !== 'vencimiento_proximo' && n.tipo !== 'suscripcion_vencida');
    if(otraNoLeida) {
      setTimeout(()=>api('/notificaciones/'+otraNoLeida.id+'/leer',{method:'PUT'}).catch(()=>{}), 5000);
    }
  } catch(e) {}
}

function doLogout(){cerrarSSE();TOKEN=null;USER=null;CD=null;localStorage.removeItem('wm_token');localStorage.removeItem('wm_user');show('sLogin');}

// PRE-FILL SAVED CREDENTIALS
const savedUser = localStorage.getItem('wm_saved_user');
const savedPass = localStorage.getItem('wm_saved_pass');
if(savedUser){ const lu=document.getElementById('lu'); if(lu)lu.value=savedUser; }
if(savedPass){ const lp=document.getElementById('lp'); if(lp)lp.value=savedPass; }

// AUTO LOGIN
if(TOKEN&&USER){
  if(USER.role==='coach'){
    show('sCoach');renderCoach('clientes');setTimeout(()=>{setCoachLang(COACH_LANG);updateCoachTopbar();},200);
    const sniEqAuto=document.getElementById('sni_equipo');
    if(sniEqAuto) sniEqAuto.style.display='flex';
    setTimeout(checkPendientes,1000);
  } else {
    show('sCliente');
    api('/mi-coach/foto').then(d => { window._coachFoto = d.foto || null; window._coachNombreAsistente = d.nombre || 'Coach'; }).catch(()=>{});
    api('/clientes/'+USER.clienteId).then(d=>{CD=d;klNav('entreno',document.getElementById('bni0'));}).catch(()=>doLogout());
  }
}
