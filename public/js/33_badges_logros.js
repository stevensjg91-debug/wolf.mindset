/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 33_badges_logros.js
   Badges y logros: valorarEntreno(), comprobarBadges(), compartirLogro(), hBadgesCliente(), IA chat control

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

  }
}


function terminarEntreno(){
  const d = CD.dias[activeDia];
  const totalSeries = d.ejercicios.reduce((a,e)=>a+e.series,0);
  const doneSeries = d.ejercicios.reduce((a,e)=>a+(e._series?e._series.filter(s=>s.done).length:0),0);
  const pendientes = totalSeries - doneSeries;

  if(pendientes > 0){
    const confirmar = confirm(
      `Quedan ${pendientes} serie${pendientes>1?'s':''} sin completar.\n\n¿Seguro que quieres terminar el entreno?\n\nTu coach verá las series incompletas.`
    );
    if(!confirmar) return;
  }

  // mostrarDoneOverlay se encarga de guardar
  mostrarDoneOverlay(pendientes>0?'incompleto':'completado', pendientes);
}

async function guardarSesionParcial(){
  try{
    const d = CD.dias[activeDia];
    const series = [];
    d.ejercicios.forEach((e,ei)=>{
      const notaCliente = e._nota_cliente || document.getElementById('nota_cliente_'+ei)?.value || '';
      (e._series||[]).forEach((s,si)=>{
        if(s.done) series.push({
          ejercicio: e.nombre,
          serie_num: si+1,
          peso: s.peso||0,
          reps: s.reps_real||parseFirstNum(e.reps),
          rir: s.rir_real!=null?s.rir_real:(e.rir!=null?e.rir:2),
          nota_cliente: notaCliente
        });
      });
    });
    await api('/clientes/'+CD.id+'/sesiones',{
      method:'POST',
      body:JSON.stringify({
        dia_nombre: d.nombre,
        dia_grupo: d.grupo,
        duracion_min: getWorkoutDuration(),
        series,
        estado: 'incompleto'
      })
    });
    // Sync to localStorage
    const hoy = new Date().toISOString().split('T')[0];
    localStorage.setItem('wm_sesion_'+CD.id+'_'+d.nombre.replace(/\s/g,'_')+'_'+hoy, 'incompleto');
  }catch(e){ console.log('Error guardando parcial:',e); }
}


async function borrarEjercicioDb(id, nombre){
  if(!confirm(`¿Eliminar "${nombre}" de la biblioteca?\n\nSe quitará de la lista de ejercicios disponibles. Los ejercicios ya asignados a rutinas no se verán afectados.`)) return;
  try{
    const r = await fetch('/api/ejercicios-db/'+id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer '+TOKEN }
    });
    if(r.ok){
      await filtrarEjerciciosGestor();
    } else {
      alert(COACH_LANG==='en'?'Delete failed. Please try again.':'Error al eliminar. Inténtalo de nuevo.');
    }
  }catch(e){
    alert('Error de conexión.');
  }
}


// ═══ ESTADO SESIÓN DEL DÍA ════════════════════════
function getSesionKey(diaNombre){
  const hoy = new Date().toISOString().split('T')[0];
  return 'wm_sesion_'+CD.id+'_'+diaNombre.replace(/\s/g,'_')+'_'+hoy;
}
function marcarSesionHecha(diaNombre, estado){ // 'completado' | 'incompleto'
  localStorage.setItem(getSesionKey(diaNombre), estado);
}
function getSesionEstado(diaNombre){
  return localStorage.getItem(getSesionKey(diaNombre)); // null | 'completado' | 'incompleto'
}

// ── SISTEMA DE BADGES ─────────────────────────────────────────────
const BADGES = [
  // Sesiones completadas
  { id:'first_session',  emoji:'🐣', titulo:'¡Primera vez!',        desc:'Completaste tu primera sesión. El viaje ha comenzado.',     check: s => s.total >= 1 },
  { id:'sessions_5',     emoji:'💪', titulo:'5 Sesiones',           desc:'5 entrenos completados. Ya estás cogiendo el hábito.',      check: s => s.total >= 5 },
  { id:'sessions_10',    emoji:'🔟', titulo:'10 Sesiones',          desc:'10 entrenos completados. Eres constante.',                  check: s => s.total >= 10 },
  { id:'sessions_25',    emoji:'🏅', titulo:'25 Sesiones',          desc:'25 entrenos. Estás construyendo algo serio.',               check: s => s.total >= 25 },
  { id:'sessions_50',    emoji:'🥈', titulo:'50 Sesiones',          desc:'50 sesiones completadas. Eres de los que no paran.',        check: s => s.total >= 50 },
  { id:'sessions_100',   emoji:'🥇', titulo:'100 Sesiones',         desc:'100 entrenos. Eres una máquina.',                           check: s => s.total >= 100 },

  // Racha
  { id:'streak_7',       emoji:'🔥', titulo:'7 días en racha',      desc:'Una semana seguida entrenando. ¡Fuego!',                    check: s => s.streak >= 7 },
  { id:'streak_14',      emoji:'⚡', titulo:'14 días en racha',     desc:'Dos semanas sin parar. Nada te detiene.',                   check: s => s.streak >= 14 },
  { id:'streak_30',      emoji:'🐺', titulo:'30 días en racha',     desc:'Un mes entero. Eres un auténtico Wolf.',                    check: s => s.streak >= 30 },

  // Peso levantado (PRs)
  { id:'pr_100kg',       emoji:'💯', titulo:'¡100 kg!',             desc:'Has levantado 100 kg en un ejercicio. Brutal.',             check: s => s.maxPeso >= 100 },
  { id:'pr_150kg',       emoji:'🦁', titulo:'¡150 kg!',             desc:'150 kg. Estás en otra liga.',                               check: s => s.maxPeso >= 150 },
  { id:'pr_200kg',       emoji:'👑', titulo:'¡200 kg!',             desc:'200 kg. Eres una leyenda.',                                 check: s => s.maxPeso >= 200 },

  // Tonelaje total
  { id:'ton_1000',       emoji:'🏋️', titulo:'1.000 kg movidos',    desc:'Has movido una tonelada en total. Literal.',                check: s => s.tonelaje >= 1000 },
  { id:'ton_10000',      emoji:'🚛', titulo:'10.000 kg movidos',    desc:'10 toneladas. Un camión entero. Increíble.',                check: s => s.tonelaje >= 10000 },
  { id:'ton_50000',      emoji:'🌋', titulo:'50.000 kg movidos',    desc:'50 toneladas acumuladas. Eres pura fuerza.',                check: s => s.tonelaje >= 50000 },

  // Mes perfecto
  { id:'perfect_month',  emoji:'📅', titulo:'Mes perfecto',         desc:'Todos los días del mes con al menos un entreno. Épico.',    check: s => s.mesPerfecto },
];

function getBadgesDesbloqueados(){
  return JSON.parse(localStorage.getItem('wolfBadges_'+CD.id) || '[]');
}
function setBadgesDesbloqueados(lista){
  localStorage.setItem('wolfBadges_'+CD.id, JSON.stringify(lista));
}

async function comprobarBadges(){
  try {
    // Recoger datos necesarios
    const sesiones = await api('/clientes/'+CD.id+'/sesiones').catch(()=>[]);
    const total = sesiones.filter(s=>s.estado==='completado').length;
    const streak = calcularStreak();

    // Máximo peso en cualquier serie
    let maxPeso = 0;
    let tonelaje = 0;
    sesiones.forEach(s=>{
      (s.series||[]).forEach(sr=>{
        const p = sr.peso_real||0, r = sr.reps_real||0;
        if(p > maxPeso) maxPeso = p;
        tonelaje += p * r;
      });
    });

    // Mes perfecto: todos los días del mes actual con sesión
    const hoy = new Date();
    const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth()+1, 0).getDate();
    const diasConSesion = new Set(
      sesiones
        .filter(s=>s.estado==='completado')
        .map(s=>new Date(s.fecha))
        .filter(d=>d.getMonth()===hoy.getMonth() && d.getFullYear()===hoy.getFullYear())
        .map(d=>d.getDate())
    ).size;
    const mesPerfecto = diasConSesion >= diasEnMes;

    const stats = { total, streak, maxPeso, tonelaje, mesPerfecto };
    const yaDesbloqueados = getBadgesDesbloqueados();
    const nuevos = BADGES.filter(b => !yaDesbloqueados.includes(b.id) && b.check(stats));

    if(nuevos.length > 0){
      // Guardar todos como desbloqueados
      setBadgesDesbloqueados([...yaDesbloqueados, ...nuevos.map(b=>b.id)]);
      // Mostrar en cadena (uno a uno con delay)
      mostrarBadgesEnCadena(nuevos, 0);
    }
  } catch(e) { console.log('Badge check error:', e); }
}

const _badgeQueue = [];
let _badgeActual = null;
function mostrarBadgesEnCadena(lista, i){
  if(i >= lista.length) return;
  const badge = lista[i];
  _badgeActual = badge;
  document.getElementById('badgeEmoji').textContent = badge.emoji;
  document.getElementById('badgeTitulo').textContent = badge.titulo;
  document.getElementById('badgeDesc').textContent = badge.desc;

  // Reiniciar animación
  const emoji = document.getElementById('badgeEmoji');
  emoji.style.animation = 'none';
  setTimeout(()=>{ emoji.style.animation = 'badgePop .5s cubic-bezier(.34,1.56,.64,1)'; }, 10);

  const ov = document.getElementById('badgeOv');
  ov.style.display = 'flex';
  applyLang(ov);
  _badgeQueue.length = 0;
  _badgeQueue.push({ lista, next: i+1 });

  // Vibrar
  vibrate([50,30,50,30,100]);
}

function cerrarBadge(){
  document.getElementById('badgeOv').style.display = 'none';
  if(_badgeQueue.length > 0){
    const { lista, next } = _badgeQueue.pop();
    if(next < lista.length){
      setTimeout(()=>mostrarBadgesEnCadena(lista, next), 300);
    }
  }
}

async function compartirLogro(){
  const emoji   = document.getElementById('badgeEmoji')?.textContent || '🏆';
  const titulo  = document.getElementById('badgeTitulo')?.textContent || '';
  const desc    = document.getElementById('badgeDesc')?.textContent || '';
  const nombre  = CD?.nombre || '';
  const btn     = document.getElementById('btnCompartirLogro');

  try {
    // Generate 1080x1080 shareable image
    const canvas = document.getElementById('badgeCanvas');
    const ctx    = canvas.getContext('2d');
    const W = 1080, H = 1080;

    // Background — dark gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#09090b');
    bg.addColorStop(0.5, '#0d1117');
    bg.addColorStop(1, '#09090b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Glow center
    const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 420);
    glow.addColorStop(0, 'rgba(245,158,11,0.18)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Outer decorative ring
    ctx.beginPath();
    ctx.arc(W/2, H/2, 400, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(245,158,11,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(W/2, H/2, 370, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(245,158,11,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Logo text top
    ctx.font = '700 32px "Bebas Neue", sans-serif';
    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText('WOLFMINDSET', W/2, 90);

    // Divider line
    ctx.beginPath();
    ctx.moveTo(W/2 - 80, 108);
    ctx.lineTo(W/2 + 80, 108);
    ctx.strokeStyle = 'rgba(245,158,11,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Big emoji
    ctx.font = '220px serif';
    ctx.textAlign = 'center';
    ctx.fillText(emoji, W/2, H/2 - 80);

    // "LOGRO DESBLOQUEADO" label
    ctx.font = '600 26px "Bebas Neue", sans-serif';
    ctx.fillStyle = 'rgba(245,158,11,0.8)';
    ctx.letterSpacing = '6px';
    ctx.fillText('LOGRO DESBLOQUEADO', W/2, H/2 + 80);

    // Achievement title
    ctx.font = '800 72px "Bebas Neue", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '2px';
    ctx.fillText(titulo.toUpperCase(), W/2, H/2 + 170);

    // Description
    ctx.font = '400 32px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.letterSpacing = '0px';
    // Word wrap
    const words = desc.split(' ');
    let line = '', lines = [], maxW = 600;
    for(const w of words){
      const test = line + w + ' ';
      if(ctx.measureText(test).width > maxW && line) { lines.push(line.trim()); line = w + ' '; }
      else line = test;
    }
    if(line) lines.push(line.trim());
    lines.forEach((l, i) => ctx.fillText(l, W/2, H/2 + 240 + i*44));

    // Client name bottom
    ctx.font = '700 38px "Bebas Neue", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.letterSpacing = '3px';
    ctx.fillText(nombre.toUpperCase(), W/2, H - 120);

    // Bottom divider
    ctx.beginPath();
    ctx.moveTo(W/2 - 120, H - 98);
    ctx.lineTo(W/2 + 120, H - 98);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Website
    ctx.font = '400 24px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.letterSpacing = '2px';
    ctx.fillText('wolfmindset.app', W/2, H - 64);

    // Try Web Share API (mobile) or download (desktop)
    const dataUrl = canvas.toDataURL('image/png');

    if(navigator.share && navigator.canShare) {
      // Convert to blob for sharing
      canvas.toBlob(async blob => {
        const file = new File([blob], `logro-${titulo.replace(/\s+/g,'-')}.png`, { type:'image/png' });
        try {
          await navigator.share({
            title: `¡Logro desbloqueado! ${titulo}`,
            text: `${emoji} ${titulo} — ${desc} #WolfMindset`,
            files: [file]
          });
        } catch(e) {
          // User cancelled or share failed — fallback to download
          _descargarImagenLogro(dataUrl, titulo);
        }
      }, 'image/png');
    } else {
      // Desktop: download image
      _descargarImagenLogro(dataUrl, titulo);
    }

  } catch(e) {
    console.log('compartirLogro error:', e);
    // Fallback: just close
    cerrarBadge();
  }
}

function _descargarImagenLogro(dataUrl, titulo){
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `logro-wolfmindset-${titulo.replace(/\s+/g,'-')}.png`;
  a.click();
}

// Ver todos los badges del cliente
function hBadgesCliente(){
  const desbloqueados = getBadgesDesbloqueados();
  const total = BADGES.length;
  const ok = desbloqueados.length;

  return`<div style="padding:16px 14px">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.06em;color:var(--sv);margin-bottom:4px">Mis Logros</div>
    <div style="font-size:12px;color:var(--tx3);margin-bottom:16px">${ok} de ${total} desbloqueados</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${BADGES.map(b=>{
        const ok = desbloqueados.includes(b.id);
        return`<div style="background:${ok?'rgba(59,130,246,.08)':'var(--s2)'};border:0.5px solid ${ok?'rgba(59,130,246,.3)':'var(--br)'};border-radius:12px;padding:12px;opacity:${ok?1:.45}">
          <div style="font-size:28px;margin-bottom:6px">${b.emoji}</div>
          <div style="font-size:12px;font-weight:700;color:${ok?'var(--sv)':'var(--tx3)'};margin-bottom:2px">${b.titulo}</div>
          <div style="font-size:10px;color:var(--tx3);line-height:1.4">${b.desc}</div>
          ${ok?'<div style="font-size:9px;color:var(--blg);font-weight:700;margin-top:4px;text-transform:uppercase">✓ Desbloqueado</div>':''}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function cerrarDoneOverlay(){
  document.getElementById('doneOv').classList.remove('show');
  // Go back to day selection showing completed status
  vistaActual = 'seleccion';
  klTab = 'entreno';
  renderSeleccion();
}

async function publicarRutinaAlCoach(){
  const btn = document.getElementById('btn_publicar_rutina');
  if(btn) { btn.disabled = true; btn.textContent = LANG==='en'?'⏳ Sending...':'⏳ Enviando...'; }
  try {
    const d = CD.dias[activeDia];
    const mensaje = LANG==='en'
      ? `✅ ${CD.nombre} completed training: ${d.nombre}${d.grupo?' ('+d.grupo+')':''} — ${getWorkoutDuration()} min`
      : `✅ ${CD.nombre} completó el entreno: ${d.nombre}${d.grupo?' ('+d.grupo+')':''} — ${getWorkoutDuration()} min`;
    await api('/notificaciones/coach', {
      method:'POST',
      body: JSON.stringify({ tipo:'rutina_publicada', mensaje })
    });
    if(btn) { btn.textContent = LANG==='en'?'✓ Sent':'✓ Enviado'; btn.style.background='#15803d'; }
    setTimeout(()=>{ cerrarDoneOverlay(); }, 1200);
  } catch(e) {
    if(btn) { btn.disabled=false; btn.innerHTML='📤 <span data-i18n="Publicar al coach">Publicar al coach</span>'; }
  }
}

// ═══════════════════════════════════════════════════════════════════
// PANEL DE CONTROL DEL BOT IA EN EL CHAT
// ═══════════════════════════════════════════════════════════════════

let _iaChatConfig = { bot_global: 0, clientes: [] };

async function cargarIaChatConfig() {
  try {
    if(!TOKEN) return _iaChatConfig;
    const r = await fetch('/api/ia-chat/config', {
      headers: { 'Authorization': 'Bearer ' + TOKEN }
    });
    if(!r.ok) return _iaChatConfig;
    _iaChatConfig = await r.json();
    return _iaChatConfig;
  } catch(e) { return _iaChatConfig; }
}

async function toggleBotGlobal(activo) {
  await fetch('/api/ia-chat/global', {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ activo })
  });
  _iaChatConfig.bot_global = activo ? 1 : 0;
  renderIaChatPanel();
}

async function toggleBotCliente(clienteId, activo) {
  await fetch(`/api/ia-chat/cliente/${clienteId}`, {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ activo })
  });
  const cl = _iaChatConfig.clientes.find(c => c.id === clienteId);
  if (cl) cl.ia_activa = activo ? 1 : 0;
  renderIaChatPanel();
}

async function renderIaChatPanel() {
  const el = document.getElementById('iaChatPanelContainer');
  if (!el) return;
  if (!_iaChatConfig.clientes.length) await cargarIaChatConfig();
  const globalOn = _iaChatConfig.bot_global;
  el.innerHTML = `
    <div style="background:rgba(255,255,255,.04);border:0.5px solid rgba(255,255,255,.1);border-radius:12px;padding:14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--sv)">🤖 Asistente IA</div>
          <div style="font-size:11px;color:var(--tx3);margin-top:2px">Responde automáticamente cuando está activo</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:${globalOn ? '#4ade80' : 'var(--tx3)'}">
            ${globalOn ? 'Global ON' : 'Global OFF'}
          </span>
          <div onclick="toggleBotGlobal(${globalOn ? 0 : 1})"
               style="width:40px;height:22px;border-radius:11px;background:${globalOn ? '#2563eb' : 'rgba(255,255,255,.15)'};
                      position:relative;cursor:pointer;transition:.2s;flex-shrink:0">
            <div style="position:absolute;top:3px;${globalOn ? 'right:3px' : 'left:3px'};
                        width:16px;height:16px;border-radius:50%;background:#fff;transition:.2s"></div>
          </div>
        </div>
      </div>
      <div style="font-size:10px;color:var(--tx3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em">Por cliente</div>
      <div style="display:flex;flex-direction:column;gap:5px;max-height:180px;overflow-y:auto">
        ${_iaChatConfig.clientes.map(c => {
          const on = c.ia_activa === 1;
          const efectivo = globalOn ? (c.ia_activa !== 0) : on;
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-radius:7px;background:rgba(255,255,255,.03)">
            <div style="display:flex;align-items:center;gap:7px">
              <div style="width:7px;height:7px;border-radius:50%;background:${efectivo ? '#4ade80' : 'rgba(255,255,255,.2)'}"></div>
              <span style="font-size:12px;color:var(--sv)">${c.nombre}</span>
              ${globalOn && !on ? '<span style="font-size:10px;color:var(--tx3)">(global)</span>' : ''}
            </div>
            <div onclick="toggleBotCliente(${c.id}, ${on ? 0 : 1})"
                 style="width:34px;height:18px;border-radius:9px;background:${on ? '#2563eb' : 'rgba(255,255,255,.15)'};
                        position:relative;cursor:pointer;transition:.2s;flex-shrink:0">
              <div style="position:absolute;top:2px;${on ? 'right:2px' : 'left:2px'};
                          width:14px;height:14px;border-radius:50%;background:#fff;transition:.2s"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:8px;padding-top:8px;border-top:0.5px solid rgba(255,255,255,.07);font-size:10px;color:var(--tx3)">
        Los mensajes del asistente aparecen marcados como vía IA en el hilo.
      </div>
    </div>
  `;
}
