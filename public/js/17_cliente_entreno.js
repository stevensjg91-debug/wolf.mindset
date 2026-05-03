/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 17_cliente_entreno.js
   Entreno cliente Strong: klNav(), renderKL(), renderSeleccion(), kbConfirm(), guardarSesion(), timers

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ PANTALLA SELECCIÓN DE DÍA (estilo Hevy) ═══════════
let vistaActual = 'seleccion'; // 'seleccion' | 'preview' | 'entreno'

function calcularStreak(){
  let streak = 0;
  const hoy = new Date();
  for(let i=0; i<365; i++){
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    const dateStr = d.toISOString().slice(0,10);
    const found = Object.keys(localStorage).some(k => k.includes(dateStr) && k.startsWith('sesion_') && localStorage.getItem(k) === 'completado');
    if(found) streak++;
    else if(i > 0) break;
  }
  return streak;
}

function hStreakBanner(){
  const streak = calcularStreak();
  if(streak === 0) return '';
  const emoji = streak >= 30 ? '🐺' : streak >= 14 ? '🔥' : streak >= 7 ? '⚡' : '💪';
  const msg = streak >= 30 ? t('¡Bestia imparable!') : streak >= 14 ? t('¡Dos semanas seguidas!') : streak >= 7 ? t('¡Una semana de fuego!') : streak === 1 ? t('¡Primer día!') : t('¡Sigue así!');
  return`<div style="background:linear-gradient(135deg,rgba(245,158,11,.15),rgba(239,68,68,.1));border:0.5px solid rgba(245,158,11,.3);border-radius:14px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;gap:12px">
    <div style="font-size:32px;line-height:1">${emoji}</div>
    <div style="flex:1">
      <div style="font-size:20px;font-weight:800;color:var(--amb);font-family:'Bebas Neue',sans-serif;letter-spacing:.05em">${streak} ${LANG==='en'?`day${streak>1?'s':''}`:(`día${streak>1?'s':''} seguido${streak>1?'s':''}`)} </div>
      <div style="font-size:12px;color:var(--sv3);font-weight:600">${msg}</div>
    </div>
  </div>`;
}

function hMensajeCoach(){
  const msg = CD.mensaje_semana;
  if(!msg) return '';
  const corto = msg.length > 120;
  return`<div style="background:linear-gradient(135deg,rgba(37,99,235,.1),rgba(17,17,19,.9));border:0.5px solid rgba(59,130,246,.25);border-radius:14px;padding:12px 16px;margin-bottom:14px;display:flex;gap:10px;align-items:flex-start">
    <span style="font-size:22px;flex-shrink:0">🐺</span>
    <div style="flex:1;min-width:0;overflow:hidden">
      <div style="font-size:10px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">${t('Mensaje de tu coach')}</div>
      <div style="overflow:hidden">
        <div id="coach_msg_txt" data-clamp="3" data-expanded="0" style="font-size:13px;color:var(--sv2);line-height:1.6;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden">${msg}</div>
      </div>
      ${corto?`<button onclick="toggleCoachComment('coach_msg_txt',this)" style="background:none;border:none;color:var(--blg);font-size:11px;font-weight:700;cursor:pointer;margin-top:5px;padding:0;font-family:inherit">${t('Ver más')} ▾</button>`:''}
    </div>
  </div>`;
}

function hNotifBanner(){
  if(!('Notification' in window)) return '';
  if(Notification.permission === 'granted') return '';
  if(Notification.permission === 'denied') return ''; // ya rechazó, no molestar
  return`<div style="background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.3);border-radius:14px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:12px">
    <span style="font-size:22px;flex-shrink:0">🔔</span>
    <div style="flex:1">
      <div style="font-size:12px;font-weight:700;color:var(--amb);margin-bottom:2px">${t('Activa las notificaciones')}</div>
      <div style="font-size:11px;color:var(--tx3)">${t('Para que suene el timer aunque la pantalla esté bloqueada')}</div>
    </div>
    <button onclick="activarNotificaciones(this)" style="padding:6px 12px;background:var(--amb);border:none;border-radius:8px;color:#000;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0">${t('Activar')}</button>
  </div>`;
}

async function activarNotificaciones(btn){
  btn.textContent = '⏳';
  btn.disabled = true;
  const ok = await pedirPermisosNotificacion();
  // Recargar pantalla para que desaparezca el banner
  renderSeleccion();
  if(ok) {
    // Confirmar que funcionó
    setTimeout(()=>{
      try { new Notification('🐺 WolfMindset', { body: t('¡Notificaciones activadas! Te avisaremos cuando termine el descanso.'), icon:'/logo.png' }); } catch(e){}
    }, 500);
  }
}

function getISOWeek(){
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return d.getFullYear() + '_' + Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function necesitaCheckin(){
  return !localStorage.getItem('checkin_semana_' + getISOWeek());
}

function hCheckinBanner(){
  if(!necesitaCheckin()) return '';
  return`<div style="background:rgba(34,197,94,.06);border:0.5px solid rgba(34,197,94,.25);border-radius:14px;padding:12px 16px;margin-bottom:14px">
    <div style="font-size:12px;font-weight:700;color:var(--gnb);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">${t('📋 Check-in semanal')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div>
        <div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${t('😴 ¿Cómo dormiste?')}</div>
        <div style="display:flex;gap:4px">
          ${[1,2,3,4,5].map(n=>`<button onclick="setCheckin('sueno',${n})" id="ci_s${n}" style="flex:1;padding:5px 0;border:0.5px solid var(--br);border-radius:6px;background:var(--s3);color:var(--tx3);font-size:12px;cursor:pointer;font-family:inherit">${n}</button>`).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${t('⚡ Energía hoy')}</div>
        <div style="display:flex;gap:4px">
          ${[1,2,3,4,5].map(n=>`<button onclick="setCheckin('energia',${n})" id="ci_e${n}" style="flex:1;padding:5px 0;border:0.5px solid var(--br);border-radius:6px;background:var(--s3);color:var(--tx3);font-size:12px;cursor:pointer;font-family:inherit">${n}</button>`).join('')}
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <div style="flex:1">
        <div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${t('⚖️ Peso hoy (kg)')} (${pesoLabel()})</div>
        <input id="ci_peso" type="number" step="0.1" placeholder="Ej: 78.5" style="width:100%;padding:7px 10px;border:0.5px solid var(--br);border-radius:8px;background:var(--b);color:var(--sv);font-size:14px;font-weight:700;box-sizing:border-box;font-family:inherit"/>
      </div>
      <button onclick="guardarCheckin()" style="margin-top:18px;padding:8px 16px;background:var(--gn);border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0" data-i18n="Guardar">Guardar</button>
    </div>
  </div>`;
}

const _checkinData = {};
function setCheckin(campo, val){
  _checkinData[campo] = val;
  const prefix = campo === 'sueno' ? 'ci_s' : 'ci_e';
  for(let i=1;i<=5;i++){
    const btn = document.getElementById(prefix+i);
    if(btn){ btn.style.background = i===val ? 'var(--bl2)' : 'var(--s3)'; btn.style.color = i===val ? '#fff' : 'var(--tx3)'; btn.style.fontWeight = i===val ? '700' : '400'; }
  }
}

async function guardarCheckin(){
  const sueno = _checkinData.sueno || 3;
  const energia = _checkinData.energia || 3;
  const peso = parseFloat(document.getElementById('ci_peso')?.value) || 0;
  const semana = getISOWeek();

  // Guardar semana local
  localStorage.setItem('checkin_semana_' + semana, JSON.stringify({sueno, energia, peso, fecha: new Date().toISOString()}));

  // Guardar en BD para que el coach lo vea
  try {
    await api('/clientes/'+CD.id+'/checkin', {
      method: 'POST',
      body: JSON.stringify({ sueno, energia, peso, semana })
    });
  } catch(e){}

  // Guardar peso en BD si se indicó
  if(peso > 0){
    try { await api('/clientes/'+CD.id+'/pesos', {method:'POST', body:JSON.stringify({peso, grasa:null, cintura:null})}); } catch(e){}
  }

  // Recargar pantalla sin el banner
  renderSeleccion();
}

function renderSeleccion() {
  const el = document.getElementById('klContent');
  if(!el) return;
  el.innerHTML = hSeleccionDia();
  if(LANG !== 'es') setTimeout(()=>applyLang(el), 30);
}

function hSeleccionDia(){
  if(!CD.dias.length) return`<div style="padding:60px 20px;text-align:center;color:var(--tx3)"><div style="font-size:48px;margin-bottom:14px">🏋️</div><div style="font-size:16px;font-weight:600;color:var(--sv2)">${t('Tu coach está preparando tu plan')}</div></div>`;

  const cards = CD.dias.map((d,i)=>{
    const exNames = d.ejercicios.slice(0,3).map(e=>e.nombre).join(', ') + (d.ejercicios.length>3?'...':'');
    const lastSession = (CD.sesiones_resumen||[]).find(s=>s.dia_nombre===d.nombre);
    const lastStr = lastSession ? `Hace ${diasDesde(lastSession.fecha)}` : t('Sin realizar');
    const totalSeries = d.ejercicios.reduce((a,e)=>a+e.series,0);
    const estadoHoy = getSesionEstado(d.nombre);
    const yaHecha = !!estadoHoy;
    const borderColor = estadoHoy==='completado'?'rgba(34,197,94,.4)':estadoHoy==='incompleto'?'rgba(245,158,11,.3)':'var(--br)';
    const bgColor = estadoHoy==='completado'?'rgba(34,197,94,.05)':estadoHoy==='incompleto'?'rgba(245,158,11,.04)':'var(--s2)';
    return`<div onclick="${yaHecha?'':'abrirPreviewDia('+i+')'}" style="background:${bgColor};border:0.5px solid ${borderColor};border-radius:16px;padding:14px;cursor:${yaHecha?'default':'pointer'};transition:.15s">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div style="flex:1;min-width:0">
          <div style="font-size:16px;font-weight:700;color:var(--sv);margin-bottom:2px">${d.nombre}</div>
          <div style="font-size:12px;color:var(--blg);font-weight:600">${tc(d.grupo)||d.grupo}</div>
        </div>
        <div style="background:var(--s3);border-radius:8px;padding:4px 8px;text-align:center;flex-shrink:0;margin-left:8px">
          <div style="font-size:14px;font-weight:700;color:var(--sv)">${d.ejercicios.length}</div>
          <div style="font-size:9px;color:var(--tx3);text-transform:uppercase;letter-spacing:.05em">${t('ejerc.')}</div>
        </div>
      </div>
      ${estadoHoy
        ? `<span style="display:inline-flex;align-items:center;gap:4px;background:${estadoHoy==='completado'?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'};border:0.5px solid ${estadoHoy==='completado'?'rgba(34,197,94,.3)':'rgba(245,158,11,.3)'};border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;color:${estadoHoy==='completado'?'var(--gnb)':'var(--amb)'}">${estadoHoy==='completado'?t('✓ Completado hoy'):t('⚠ Incompleto hoy')}</span>`
        : `<div style="font-size:12px;color:var(--tx3);margin-bottom:8px;line-height:1.5">${exNames||'Sin ejercicios'}</div>
           <div style="display:flex;align-items:center;gap:5px">
             <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#52525b" stroke-width="1.3"/><path d="M8 5v3l2 2" stroke="#52525b" stroke-width="1.3" stroke-linecap="round"/></svg>
             <span style="font-size:11px;color:var(--tx3)">${lastStr}</span>
             <span style="margin-left:auto;font-size:11px;color:var(--tx3)">${totalSeries} series</span>
           </div>`
      }
    </div>`;
  }).join('');

  return`<div style="padding:16px 14px 8px">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.08em;color:var(--sv);margin-bottom:2px">${t('Entrenar')}</div>
    <div style="font-size:13px;color:var(--tx3);margin-bottom:14px">${t('Semana')} ${CD.semanas} · ${t(CD.objetivo||'')} </div>
    ${hStreakBanner()}
    ${hMensajeCoach()}
    ${hCheckinBanner()}
    ${hNotifBanner()}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${cards}</div>
  </div>`;
}
function diasDesde(fecha){
  const d = Math.floor((Date.now()-new Date(fecha).getTime())/86400000);
  if(d===0) return 'Hoy';
  if(d===1) return 'Ayer';
  return d+' días';
}

async function abrirPreviewDia(i){
  activeDia = i;
  vistaActual = 'preview';
  try {
    const sesiones = await api('/clientes/'+CD.id+'/sesiones');
    window._sesionesCache = sesiones;
  } catch(e) { window._sesionesCache = []; }
  const el = document.getElementById('klContent');
  el.innerHTML = hPreviewDia(i);
  setTimeout(()=>applyLang(el), 30);
}

function hPreviewDia(i){
  const d = CD.dias[i];
  const sesiones = window._sesionesCache || [];

  // Find last performance per ejercicio
  const ultimoPorEx = {};
  sesiones.forEach(s=>{
    if(s.dia_nombre !== d.nombre) return;
    s.series.forEach(sr=>{
      if(!ultimoPorEx[sr.ejercicio_nombre]||new Date(s.fecha)>new Date(ultimoPorEx[sr.ejercicio_nombre].fecha)){
        ultimoPorEx[sr.ejercicio_nombre]={...sr,fecha:s.fecha};
      }
    });
  });

  const lastSession = sesiones.find(s=>s.dia_nombre===d.nombre);
  const lastStr = lastSession ? `${t('Último')}: ${diasDesde(lastSession.fecha)}` : t('Sin realizar aún');

  const exList = d.ejercicios.map((e,ei)=>{
    const ult = ultimoPorEx[e.nombre];
    const ultStr = ult ? `${fmtPeso(ult.peso_real)} × ${ult.reps_real} reps` : '—';
    const imgUrl = e.imagen_url || (window.exConfig&&window.exConfig[e.nombre]?.imagen_url) || '';
    const bg = getExerciseBg(e.nombre);
    return`<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:0.5px solid var(--br)">
      ${renderExImg(e.nombre, 44, e.grupo||EX_GROUP_MAP[e.nombre]||'', e.imagen_url||'')}
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;color:var(--sv);margin-bottom:2px">${e.nombre}</div>
        <div style="font-size:12px;color:var(--tx3)">${e.series} × ${e.reps}${e.peso_objetivo>0?' · '+fmtPeso(e.peso_objetivo):''}</div>
        ${ult?`<div style="font-size:11px;color:var(--sv3);margin-top:1px">${t('Anterior')}: ${ultStr}</div>`:''}
        ${e.es_principal?`<span style="font-size:10px;background:rgba(245,158,11,.2);color:var(--amb);padding:1px 6px;border-radius:4px;font-weight:700">⭐</span>`:''}
      </div>
      <button onclick="event.stopPropagation();abrirDescripcion('${e.nombre.replace(/'/g,"\'")}')" style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,.15);border:0.5px solid rgba(59,130,246,.25);color:var(--blg);cursor:pointer;font-size:14px;font-weight:700;flex-shrink:0;display:flex;align-items:center;justify-content:center">?</button>
    </div>`;
  }).join('');

  return`<div style="display:flex;flex-direction:column;height:100%">
    <!-- Header -->
    <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--s);border-bottom:0.5px solid var(--br);flex-shrink:0">
      <button onclick="volverSeleccion()" style="width:34px;height:34px;border-radius:8px;background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);cursor:pointer;display:flex;align-items:center;justify-content:center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <div style="flex:1">
        <div style="font-size:16px;font-weight:700;color:var(--sv)">${d.nombre}</div>
        <div style="font-size:11px;color:var(--tx3)">${lastStr}</div>
      </div>
    </div>
    <!-- Exercise list -->
    <div style="flex:1;overflow-y:auto;padding-bottom:140px">
      <div style="padding:10px 16px 6px;font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.08em">${t(d.grupo)||d.grupo} · ${d.ejercicios.length} ${t('ejercicios')}</div>
      ${exList}
    </div>
    <!-- Entrenar button -->
    <div style="position:fixed;bottom:0;left:0;right:0;padding:12px 16px max(env(safe-area-inset-bottom),12px);padding-bottom:calc(max(env(safe-area-inset-bottom),12px) + 68px);background:rgba(9,9,11,.97);border-top:0.5px solid var(--br);z-index:200">
      <button onclick="empezarEntreno(${i})" style="width:100%;padding:16px;background:var(--bl2);color:#fff;border:none;border-radius:14px;font-size:17px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.02em">${t('Entrenar')}</button>
    </div>
  </div>`;
}

function volverSeleccion(){
  vistaActual = 'seleccion';
  renderSeleccion();
}

function empezarEntreno(i){
  activeDia = i;
  vistaActual = 'entreno';
  workoutStartTime = null;
  if(workoutTimerInt){clearInterval(workoutTimerInt);workoutTimerInt=null;}
  runningTimers = {};
  activeInput = null;
  doneShown = false;
  const klEl = document.getElementById('klContent');
  klEl.innerHTML = hEntreno();
  setTimeout(()=>{ applyLang(klEl); iniciarEntreno(); }, 100);
}

// Modal descripción ejercicio
function abrirDescripcion(nombre){
  const desc = EX_DESCRIPCIONES[nombre];
  const emoji = getExerciseEmoji(nombre);
  const bg = getExerciseBg(nombre);
  // Get imagen_url: exImages map (loaded at login, lightweight) > exConfig (coach) > CD fallback
  let imgUrl = (window.exImages && window.exImages[nombre])
    || (window.exConfig && window.exConfig[nombre]?.imagen_url) || '';
  if(!imgUrl && CD && CD.dias){
    CD.dias.forEach(d=>d.ejercicios.forEach(e=>{
      if(e.nombre===nombre && e.imagen_url && e.imagen_url !== '__HAS_IMAGE__') imgUrl=e.imagen_url;
    }));
  }

  // Cache de instrucciones traducidas
  const exTransKey = 'ex_trans_'+nombre.replace(/[^a-zA-Z0-9]/g,'_');
  const cachedSteps = LANG==='en' ? (()=>{ try{return JSON.parse(localStorage.getItem(exTransKey)||'null');}catch(e){return null;} })() : null;
  const stepsToShow = cachedSteps || desc;

  const pasos = stepsToShow ? stepsToShow.map((p,i)=>`<div style="display:flex;gap:12px;margin-bottom:10px">
    <div style="width:22px;height:22px;border-radius:50%;background:rgba(59,130,246,.2);color:var(--blg);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${i+1}</div>
    <div style="font-size:14px;color:var(--sv2);line-height:1.55">${p}</div>
  </div>`).join('') : `<div style="font-size:13px;color:var(--tx3)">${t('Descripción no disponible.')}</div>`;

  const modal = document.createElement('div');
  modal.id = 'desc_modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(9,9,11,.97);z-index:600;display:flex;flex-direction:column;overflow:hidden';

  // Guardar en variable global para evitar problemas de escaping en onclick
  window._descModalNombre = nombre;
  window._descModalPasos = desc || null;

  modal.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--s);border-bottom:0.5px solid var(--br);flex-shrink:0">
      <button onclick="document.getElementById('desc_modal').remove(); window._descModalNombre=null; window._descModalPasos=null;" style="width:34px;height:34px;border-radius:8px;background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);cursor:pointer;font-size:20px;line-height:1">×</button>
      <div style="font-size:15px;font-weight:700;color:var(--sv);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${nombre}</div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px">
      <div style="width:100%;border-radius:14px;overflow:hidden;margin-bottom:16px;background:${bg}">
        ${imgUrl
          ? `<div style="width:100%;display:flex;align-items:center;justify-content:center;background:#0d1520;border-radius:14px">
               <img src="${imgUrl}" style="width:100%;object-fit:contain;border-radius:14px" onerror="this.parentElement.style.display='none'"/>
             </div>`
          : `<div style="padding:16px;display:flex;gap:12px;align-items:flex-start">
               <div style="flex-shrink:0;width:80px">${getMuscleMapSVG(nombre)}</div>
               <div style="flex:1">
                 <div style="font-size:10px;font-weight:700;color:var(--blg);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">${t("Músculos trabajados")}</div>
                 <div style="display:flex;flex-wrap:wrap;gap:5px">
                   ${getExerciseMuscles(nombre).map(m=>'<span style="font-size:11px;background:rgba(239,68,68,.15);color:#fca5a5;border:0.5px solid rgba(239,68,68,.3);padding:3px 8px;border-radius:10px;font-weight:600">'+t(m)+'</span>').join('')}
                 </div>
                 <div style="font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em;margin-top:10px;margin-bottom:5px">${t("Secundarios")}</div>
                 <div style="display:flex;flex-wrap:wrap;gap:5px">
                   ${getExerciseSecondary(nombre).map(m=>'<span style="font-size:11px;background:rgba(59,130,246,.1);color:#93c5fd;border:0.5px solid rgba(59,130,246,.2);padding:3px 8px;border-radius:10px">'+t(m)+'</span>').join('')}
                 </div>
               </div>
             </div>`
        }
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--blg);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">${t('INSTRUCCIONES')}</div>
      <div id="desc_pasos">${pasos}</div>
      ${LANG==='en' && desc ? `
      <button id="btn_trans_ex" onclick="traducirEjercicioIA(window._descModalNombre, window._descModalPasos)" title="Translate with AI"
        style="width:100%;margin-top:14px;padding:8px;background:rgba(59,130,246,.1);color:#93c5fd;border:0.5px solid rgba(59,130,246,.2);border-radius:10px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;touch-action:manipulation">
        <span style="font-size:20px" id="btn_trans_ex_txt">${cachedSteps ? '✅🇬🇧' : '🇬🇧'}</span>
      </button>` : ''}
    </div>`;
  document.body.appendChild(modal);
}


function hEntreno(){
  if(!CD.dias.length)return`<div style="padding:60px 20px;text-align:center;color:var(--tx3)"><div style="font-size:48px;margin-bottom:14px">🏋️</div><div style="font-size:16px;font-weight:600;color:var(--sv2)">${t('Tu coach está preparando tu plan')}</div></div>`;
  const d=CD.dias[activeDia]||CD.dias[0];
  const pills=CD.dias.map((day,i)=>`<button class="day-pill ${i===activeDia?'on':''}" onclick="selDia(${i})">${day.nombre}</button>`).join('');
  const doneSeries=d.ejercicios.reduce((a,e)=>a+(e._series?e._series.filter(s=>s.done).length:0),0);
  const totalSeries=d.ejercicios.reduce((a,e)=>a+e.series,0);
  const pct=totalSeries?Math.round(doneSeries/totalSeries*100):0;

  const exCards=d.ejercicios.map((e,ei)=>{
    if(!e._series)e._series=Array.from({length:e.series},(_,i)=>({done:false,peso:e.peso_objetivo,reps:parseFirstNum(e.reps),reps_real:parseFirstNum(e.reps),timer:null}));
    const exDone=e._series.every(s=>s.done);
    const ytUrl=e.youtube_url||EX_YT[e.nombre]||'';
    const cfg=(window.exConfig&&window.exConfig[e.nombre])||{};
    const imgUrl=e.imagen_url||cfg.imagen_url||'';

    const seriesRows=e._series.map((s,si)=>{
      const timerKey=`${ei}_${si}`;
      const rt=runningTimers[timerKey];
      const timerSecs=rt?getTimerRemaining(rt):0;
      const timerPct=rt?Math.round((timerSecs/rt.total)*100):0;
      return`<div class="strong-serie-wrap" id="sw_${ei}_${si}">
        <div class="strong-serie-row ${s.done?'done':''}" style="grid-template-columns:${e.rir!=null?'28px 1fr 36px 58px 52px 44px':'28px 1fr 36px 1fr 1fr'}">
          <div class="strong-serie-num">${si+1}</div>
          <div class="strong-serie-prev">${s.peso||0} × ${s.reps_real||s.reps||10}</div>
          <button class="strong-check ${s.done?'done':''}" onclick="toggleSerieStrong(${ei},${si})">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='peso'?'active':''}" onclick="openKeyboard(${ei},${si},'peso')">${s.peso||0}</button>
          <button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='reps'?'active':''}" onclick="openKeyboard(${ei},${si},'reps')">${s.reps_real||s.reps||10}</button>
          ${e.rir!=null?(si===e._series.length-1?`<button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='rir'?'active':''}" onclick="openKeyboard(${ei},${si},'rir')" style="font-size:13px">${s.rir_real!=null?s.rir_real:e.rir}</button>`:'<div></div>'):'<div></div>'}
        </div>
        ${s.done?`<div class="strong-timer-bar" id="tb_${ei}_${si}">
          <div class="strong-timer-fill ${rt&&timerSecs<=10?'urg':''}" id="tf_${ei}_${si}" style="width:${timerPct}%"></div>
          <span class="strong-timer-label" id="tl_${ei}_${si}">${rt?fmt(getTimerRemaining(rt)):'1:30'}</span>
        </div>`:''}
      </div>`;
    }).join('');

    return`<div class="strong-ex-card ${exDone?'done-ex':''}" id="exc_${ei}">
      <div class="strong-ex-header">
        ${renderExImg(e.nombre, 52, e.grupo||EX_GROUP_MAP[e.nombre]||'', e.imagen_url||'')}
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <div style="font-size:10px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.06em">${t(e.grupo||'')||''}</div>
            ${e.es_principal?`<span style="font-size:10px;background:rgba(245,158,11,.2);color:var(--amb);padding:1px 6px;border-radius:4px;font-weight:700">⭐ Principal</span>`:''}
            ${e.rir!=null?`<span style="font-size:10px;background:rgba(59,130,246,.15);color:var(--blg);padding:1px 6px;border-radius:4px;font-weight:700">RIR: ${e.rir}</span>`:''}
          </div>
          <div style="font-size:16px;font-weight:700;color:var(--sv)">${e.nombre}</div>
          <div style="font-size:11px;color:var(--tx3)">${e.musculos||''}</div>
        </div>
        ${ytUrl?`<button onclick="openVideo('${ytUrl}','${e.nombre}')" style="width:34px;height:34px;border-radius:8px;background:rgba(239,68,68,.15);border:0.5px solid rgba(239,68,68,.3);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></button>`:''}
      </div>
      ${e.nota_coach?`<div style="background:linear-gradient(135deg,rgba(180,130,0,0.18),rgba(245,158,11,0.1));border-left:3px solid #f59e0b;padding:8px 12px;margin:0 0 8px;display:flex;gap:8px;align-items:flex-start"><span style="font-size:14px">🐺</span><div><div style="font-size:9px;color:#fcd34d;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:1px">${t('Coach dice')}</div><div style="font-size:12px;color:#fde68a;font-weight:600">${e.nota_coach}</div></div></div>`:''}
      <div class="strong-serie-header" style="grid-template-columns:${e.rir!=null?'28px 1fr 36px 58px 52px 44px':'28px 1fr 36px 1fr 1fr'}">
        <span>${t('SET')}</span><span>${t('PREVIOUS')}</span><span>✓</span><span>${pesoLabel().toUpperCase()}</span><span>${t('REPS')}</span>${e.rir!=null?'<span>RIR</span>':''}
      </div>
      ${seriesRows}
      <!-- Nota del cliente para el coach -->
      <div style="padding:8px 14px 12px">
        <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">${t('💬 Nota para el coach (sensaciones, dolor, etc.)')}</div>
        <input id="nota_cliente_${ei}" type="text" placeholder="${t('Ej: Sentí el peso muy pesado, me dolió el hombro...')}" value="${e._nota_cliente||''}"
          style="width:100%;padding:8px 10px;border:0.5px solid var(--br);border-radius:8px;background:var(--s2);color:var(--sv);font-size:12px;font-family:inherit;box-sizing:border-box"
          onchange="CD.dias[activeDia].ejercicios[${ei}]._nota_cliente=this.value"/>
      </div>
    </div>`;
  }).join('');

  const wolfSrc = WOLF_UPPER_SRC; // mancuerna wolf for all days
  return`<div class="hero-day" style="position:relative;overflow:hidden">
    <img src="${wolfSrc}" style="position:absolute;right:-10px;bottom:-10px;height:120px;width:auto;opacity:.2;mix-blend-mode:screen;pointer-events:none;z-index:0"/>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1">
      <div>
        <div class="hero-day-lbl">${t('Entrenamiento')}</div>
        <div class="hero-day-name">${d.nombre}</div>
        <div class="hero-day-sub">${t(d.grupo)||d.grupo}</div>
      </div>
      <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        ${workoutStartTime?`<div id="workout_timer" style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gnb);letter-spacing:.08em">00:00</div><div style="font-size:9px;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em">${t('En curso')}</div>`:''}
        <button id="btn_terminar" onclick="terminarEntreno()" style="background:rgba(239,68,68,.2);color:#fca5a5;border:1px solid rgba(239,68,68,.4);border-radius:12px;padding:10px 18px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;min-width:100px;min-height:42px;-webkit-tap-highlight-color:transparent;touch-action:manipulation">${t('■ Terminar')}</button>
      </div>
    </div>
    ${pct>0?`<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.4);font-weight:600;margin-bottom:4px"><span>${t('Progreso')}</span><span>${doneSeries}/${totalSeries}</span></div><div style="height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--bl);border-radius:2px;transition:.5s"></div></div></div>`:''}
  </div>
  <div class="day-scroll">${pills}</div>
  <div style="padding:8px 14px 4px;font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.08em">${d.grupo}</div>
  ${exCards}
  ${d.ejercicios.length>0&&d.ejercicios.every(e=>e._series&&e._series.every(s=>s.done))?`<div style="margin:0 14px 20px;background:var(--gnd);border:0.5px solid rgba(34,197,94,.3);border-radius:14px;padding:18px;text-align:center"><div style="font-size:32px;margin-bottom:8px">🎉</div><div style="font-size:16px;font-weight:700;color:var(--gnb)">${t('¡Entreno completado!')}</div><div style="font-size:13px;color:var(--tx3);margin-top:4px">${t('Descansa y come bien.')}</div></div>`:''}
  ${renderKeyboard()}`;
}

function parseFirstNum(r){const m=String(r||10).match(/\d+/);return m?parseInt(m[0]):10;}

function renderKeyboard(){
  return`<div id="strong_keyboard" style="display:none;position:fixed;bottom:60px;left:0;right:0;z-index:400;background:var(--s2);border-top:1.5px solid var(--br2);padding:10px 14px 16px;box-shadow:0 -8px 32px rgba(0,0,0,.7)">
    <div id="kb_rir_hint" style="display:none;background:rgba(37,99,235,.1);border:0.5px solid rgba(59,130,246,.3);border-radius:8px;padding:6px 10px;margin-bottom:8px;font-size:11px;color:var(--blg);text-align:center">
      ${t('💪 ¿Cuántas reps más podrías haber hecho? (RIR = Reps In Reserve)')}<br>
      <span style="color:var(--tx3)">${t('0 = al fallo · 1 = casi al límite · 2-3 = cómodo · 4+ = fácil')}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:0 4px">
      <div style="font-size:11px;color:var(--tx3);font-weight:600;text-transform:uppercase;letter-spacing:.06em" id="kb_label">kg</div>
      <div style="font-size:22px;font-weight:700;color:var(--sv)" id="kb_display">0</div>
      <div style="display:flex;gap:8px">
        <button onclick="kbPause()" style="padding:6px 12px;background:var(--s3);border:0.5px solid var(--br);border-radius:8px;color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit" id="kb_pause_btn">⏸ Pausar</button>
        <button onclick="kbSkip()" style="padding:6px 14px;background:var(--bl2);border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Skip →</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
      ${[1,2,3,'⌫',4,5,6,'.',7,8,9,'✓',null,0,null,null].map((k,i)=>{
        if(k===null)return`<div></div>`;
        if(k==='✓')return`<button onclick="kbConfirm()" style="background:var(--bl2);color:#fff;border:none;border-radius:10px;padding:16px;font-size:18px;font-weight:700;cursor:pointer;font-family:inherit">✓</button>`;
        if(k==='⌫')return`<button onclick="kbDel()" style="background:var(--s3);color:var(--sv2);border:0.5px solid var(--br);border-radius:10px;padding:16px;font-size:18px;font-weight:700;cursor:pointer;font-family:inherit">⌫</button>`;
        return`<button onclick="kbNum('${k}')" style="background:var(--s3);color:var(--sv);border:0.5px solid var(--br);border-radius:10px;padding:16px;font-size:18px;font-weight:700;cursor:pointer;font-family:inherit">${k}</button>`;
      }).join('')}
    </div>
  </div>`;
}

let kbValue = '';

function openKeyboard(ei, si, field){
  activeInput = {ei, si, field};
  const e = CD.dias[activeDia].ejercicios[ei];
  if(field === 'peso') kbValue = String(e._series[si].peso || 0);
  else if(field === 'reps') kbValue = String(e._series[si].reps_real || e._series[si].reps || 10);
  else kbValue = String(e._series[si].rir_real != null ? e._series[si].rir_real : (e.rir != null ? e.rir : 2));
  const kb = document.getElementById('strong_keyboard');
  const lbl = document.getElementById('kb_label');
  const disp = document.getElementById('kb_display');
  if(kb){ kb.style.display='block'; }
  if(lbl) {
    lbl.textContent = field==='peso' ? pesoLabel() : field==='reps' ? 'reps' : 'RIR';
    // Hint especial para RIR
    lbl.style.color = field==='rir' ? 'var(--blg)' : '';
  }
  if(disp) {
    disp.textContent = kbValue;
    disp.style.color = field==='rir' ? 'var(--blg)' : '';
  }
  // Mostrar hint de RIR
  const hint = document.getElementById('kb_rir_hint');
  if(hint) hint.style.display = field==='rir' ? 'block' : 'none';
  // Padding + scroll so active row is visible above keyboard
  const bnav=document.querySelector('#sCliente .bnav-bar');
  const bnavH=bnav?bnav.offsetHeight:60;
  setTimeout(()=>{
    const kbH=kb?kb.offsetHeight:280;
    const scroll=document.querySelector('#sCliente .scroll');
    if(scroll)scroll.style.paddingBottom=(bnavH+kbH+20)+'px';
    const rowEl=document.getElementById('sw_'+ei+'_'+si);
    if(rowEl)rowEl.scrollIntoView({behavior:'smooth',block:'center'});
  },80);
  rerenderSerieHeaders();
}

function kbNum(n){
  if(kbValue==='0') kbValue=String(n);
  else kbValue+=String(n);
  const disp=document.getElementById('kb_display');
  if(disp)disp.textContent=kbValue;
}
function kbDel(){
  kbValue=kbValue.slice(0,-1)||'0';
  const disp=document.getElementById('kb_display');
  if(disp)disp.textContent=kbValue;
}
function kbConfirm(){
  if(!activeInput)return;
  const {ei,si,field}=activeInput;
  const e=CD.dias[activeDia].ejercicios[ei];
  const val=parseFloat(kbValue)||0;
  if(field==='peso'){
    e._series[si].peso=val;
    rerenderSerieRow(ei,si);
    // Auto-jump to reps
    setTimeout(()=>openKeyboard(ei,si,'reps'),80);
  } else if(field==='reps') {
    e._series[si].reps_real=val;
    // Si es la última serie Y el ejercicio tiene RIR → pedir RIR antes de confirmar
    const esUltimaSerie = si === e._series.length - 1;
    if(esUltimaSerie && e.rir != null && e._series[si].rir_real == null) {
      closeKeyboard();
      rerenderSerieRow(ei,si);
      setTimeout(()=>openKeyboard(ei,si,'rir'),80);
    } else {
      closeKeyboard();
      if(!e._series[si].done){
        e._series[si].done=true;
        soundDing();
        const allDone=CD.dias[activeDia].ejercicios.every(ex=>ex._series&&ex._series.every(s=>s.done));
        if(allDone && !doneShown){
          rerenderSerieRow(ei,si);
          mostrarDoneOverlay('completado', 0);
        } else {
          startTimerInline(ei, si, e.descanso||90);
          rerenderSerieRow(ei,si);
        }
      } else {
        rerenderSerieRow(ei,si);
      }
    }
  } else {
    // field === 'rir'
    e._series[si].rir_real=val;
    closeKeyboard();
    if(!e._series[si].done){
      e._series[si].done=true;
      soundDing();
      const allDone=CD.dias[activeDia].ejercicios.every(ex=>ex._series&&ex._series.every(s=>s.done));
      if(allDone && !doneShown){
        rerenderSerieRow(ei,si);
        mostrarDoneOverlay('completado', 0);
      } else {
        startTimerInline(ei, si, e.descanso||90);
        rerenderSerieRow(ei,si);
      }
    } else {
      rerenderSerieRow(ei,si);
    }
  }
}
function closeKeyboard(){
  const kb=document.getElementById('strong_keyboard');
  if(kb)kb.style.display='none';
  activeInput=null;
  const scroll=document.querySelector('#sCliente .scroll');
  if(scroll)scroll.style.paddingBottom='80px';
}
function kbPause(){
  if(!activeInput)return;
  const {ei,si}=activeInput;
  const key=`${ei}_${si}`;
  const rt=runningTimers[key];
  if(!rt)return;
  if(rt.paused){
    rt.paused=false;
    const btn=document.getElementById('kb_pause_btn');
    if(btn)btn.textContent='⏸ Pausar';
    resumeTimer(ei,si);
  }else{
    rt.secs = getTimerRemaining(rt);
    rt.paused=true;
    clearInterval(rt.interval);
    cancelarNotificacionDescanso(key);
    updateTimerBar(ei, si, rt);
    const btn=document.getElementById('kb_pause_btn');
    if(btn)btn.textContent='▶ Reanudar';
  }
}
function kbSkip(){
  if(!activeInput)return;
  const {ei,si}=activeInput;
  stopTimer(ei,si);
  closeKeyboard();
}

function toggleSerieStrong(ei,si){
  const e=CD.dias[activeDia].ejercicios[ei];
  if(!e._series)e._series=Array.from({length:e.series},(_,i)=>({done:false,peso:e.peso_objetivo,reps:parseFirstNum(e.reps),reps_real:parseFirstNum(e.reps)}));
  e._series[si].done=!e._series[si].done;

  if(e._series[si].done){
    soundDing();
    // Iniciar timer de descanso para esta serie
    startTimerInline(ei, si, e.descanso||90);
    // Abrir teclado apuntando a esta serie para editar kg si quiere
    openKeyboard(ei, si, 'peso');
  } else {
    stopTimer(ei,si);
    closeKeyboard();
  }

  rerenderSerieRow(ei,si);

  const allDone=CD.dias[activeDia].ejercicios.every(ex=>ex._series&&ex._series.every(s=>s.done));
  if(allDone && !doneShown){
    mostrarDoneOverlay('completado', 0);
  }
}

async function guardarSesion(){
  try{
    const d=CD.dias[activeDia];
    const series=[];
    d.ejercicios.forEach((e,ei)=>{
      const notaCliente = e._nota_cliente || document.getElementById('nota_cliente_'+ei)?.value || '';
      (e._series||[]).forEach((s,si)=>{
        if(s.done)series.push({
          ejercicio:e.nombre,
          serie_num:si+1,
          peso:s.peso||0,
          reps:s.reps_real||parseFirstNum(e.reps),
          rir:s.rir_real!=null?s.rir_real:(e.rir!=null?e.rir:2),
          nota_cliente: notaCliente
        });
      });
    });
    console.log('[WM] Guardando sesión completada:', d.nombre, series.length, 'series');
    const r = await api('/clientes/'+CD.id+'/sesiones',{
      method:'POST',
      body:JSON.stringify({dia_nombre:d.nombre,dia_grupo:d.grupo,duracion_min:getWorkoutDuration(),series,estado:'completado'})
    });
    console.log('[WM] Sesión guardada OK:', r);
    // Actualizar localStorage con estado del servidor
    const hoy = new Date().toISOString().split('T')[0];
    localStorage.setItem('wm_sesion_'+CD.id+'_'+d.nombre.replace(/\s/g,'_')+'_'+hoy, 'completado');
  }catch(e){
    console.error('[WM] Error guardando sesión:',e);
    // Reintentar una vez tras 3 segundos
    setTimeout(async ()=>{
      try{
        const d=CD.dias[activeDia];
        const series=[];
        d.ejercicios.forEach((e,ei)=>{
          const notaCliente = e._nota_cliente || '';
          (e._series||[]).forEach((s,si)=>{
            if(s.done)series.push({ejercicio:e.nombre,serie_num:si+1,peso:s.peso||0,reps:s.reps_real||parseFirstNum(e.reps),rir:s.rir_real!=null?s.rir_real:(e.rir!=null?e.rir:2),nota_cliente:notaCliente});
          });
        });
        await api('/clientes/'+CD.id+'/sesiones',{method:'POST',body:JSON.stringify({dia_nombre:d.nombre,dia_grupo:d.grupo,duracion_min:getWorkoutDuration(),series,estado:'completado'})});
        console.log('[WM] Sesión guardada OK (reintento)');
        const hoy = new Date().toISOString().split('T')[0];
        localStorage.setItem('wm_sesion_'+CD.id+'_'+d.nombre.replace(/\s/g,'_')+'_'+hoy, 'completado');
      }catch(e2){console.error('[WM] Error en reintento de sesión:',e2);}
    }, 3000);
  }
}

function getTimerRemaining(rt){
  if(!rt) return 0;
  if(rt.paused) return Math.max(0, Math.ceil(rt.secs || 0));
  if(rt.endAt) return Math.max(0, Math.ceil((rt.endAt - Date.now()) / 1000));
  return Math.max(0, Math.ceil(rt.secs || 0));
}

function tickTimerInline(ei, si, key){
  const rt = runningTimers[key];
  if(!rt) return;
  if(rt.paused){
    updateTimerBar(ei, si, rt);
    return;
  }
  rt.secs = getTimerRemaining(rt);
  updateTimerBar(ei, si, rt);
  if(rt.secs <= 0){
    if(rt.interval) clearInterval(rt.interval);
    delete runningTimers[key];
    updateTimerBar(ei, si, null);
    if(!doneShown) {
      soundBell();
      vibrate([150,80,150]);
      const exNow = CD?.dias[activeDia]?.ejercicios[ei];
      notificarDescansoTerminado(exNow?.nombre||'');
    }
  }
}

function startTimerInline(ei, si, total){
  // Stop ALL other running timers first
  Object.keys(runningTimers).forEach(k=>{
    if(k!==`${ei}_${si}` && runningTimers[k]){
      clearInterval(runningTimers[k].interval);
      // Cancelar notificación programada del timer anterior
      cancelarNotificacionDescanso(k);
      const [oei,osi] = k.split('_');
      const tb = document.getElementById('tb_'+oei+'_'+osi);
      if(tb) tb.style.display='none';
      delete runningTimers[k];
    }
  });
  const key=`${ei}_${si}`;
  if(runningTimers[key]){
    clearInterval(runningTimers[key].interval);
    cancelarNotificacionDescanso(key);
  }

  const safeTotal = Math.max(1, parseInt(total || 90, 10));
  runningTimers[key]={secs:safeTotal, total:safeTotal, paused:false, interval:null, endAt:Date.now() + safeTotal*1000};

  // Programar notificación desde el SW (mejor que setInterval cuando se bloquea la pantalla)
  const exNow = CD?.dias[activeDia]?.ejercicios[ei];
  if(!doneShown) programarNotificacionDescanso(exNow?.nombre||'', safeTotal, key);

  tickTimerInline(ei, si, key);
  runningTimers[key].interval=setInterval(()=>tickTimerInline(ei, si, key), 1000);
}

function resumeTimer(ei,si){
  const key=`${ei}_${si}`;
  const rt=runningTimers[key];
  if(!rt)return;
  if(rt.interval) clearInterval(rt.interval);
  rt.paused=false;
  rt.secs=Math.max(1, getTimerRemaining(rt));
  rt.endAt=Date.now() + rt.secs*1000;
  const exNow = CD?.dias[activeDia]?.ejercicios[ei];
  if(!doneShown) programarNotificacionDescanso(exNow?.nombre||'', rt.secs, key);
  tickTimerInline(ei, si, key);
  rt.interval=setInterval(()=>tickTimerInline(ei, si, key),1000);
}

function stopTimer(ei,si){
  const key=`${ei}_${si}`;
  if(runningTimers[key]){clearInterval(runningTimers[key].interval);delete runningTimers[key];}
  cancelarNotificacionDescanso(key);
  updateTimerBar(ei,si,null);
}

function updateTimerBar(ei,si,rt){
  const fill=document.getElementById(`tf_${ei}_${si}`);
  const label=document.getElementById(`tl_${ei}_${si}`);
  const bar=document.getElementById(`tb_${ei}_${si}`);
  if(!fill||!label)return;
  if(!rt){
    if(bar)bar.style.display='none';
    return;
  }
  // Asegurar que la barra es visible
  if(bar)bar.style.display='flex';
  const secs = getTimerRemaining(rt);
  rt.secs = secs;
  const pct=Math.max(0, Math.min(100, Math.round((secs/rt.total)*100)));
  fill.style.width=pct+'%';
  fill.className='strong-timer-fill'+(secs<=10?' urg':'');
  label.textContent=fmt(secs);
}

function rerenderSerieRow(ei,si){
  // Re-render just the exercise card to reflect changes
  const card=document.getElementById(`exc_${ei}`);
  if(!card)return;
  const e=CD.dias[activeDia].ejercicios[ei];
  const s=e._series[si];
  const row=document.getElementById(`sw_${ei}_${si}`);
  if(!row)return;
  const key=`${ei}_${si}`;
  const rt=runningTimers[key];
  const timerSecs=rt?getTimerRemaining(rt):0;
  const timerPct=rt?Math.round((timerSecs/rt.total)*100):100;
  row.innerHTML=`<div class="strong-serie-row ${s.done?'done':''}" style="grid-template-columns:${e.rir!=null?'28px 1fr 36px 58px 52px 44px':'28px 1fr 36px 1fr 1fr'}">
    <div class="strong-serie-num">${si+1}</div>
    <div class="strong-serie-prev">${s.peso||0} × ${s.reps_real||s.reps||10}</div>
    <button class="strong-check ${s.done?'done':''}" onclick="toggleSerieStrong(${ei},${si})">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='peso'?'active':''}" onclick="openKeyboard(${ei},${si},'peso')">${s.peso||0}</button>
    <button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='reps'?'active':''}" onclick="openKeyboard(${ei},${si},'reps')">${s.reps_real||s.reps||10}</button>
    ${e.rir!=null?(si===e._series.length-1?`<button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='rir'?'active':''}" onclick="openKeyboard(${ei},${si},'rir')" style="font-size:13px">${s.rir_real!=null?s.rir_real:e.rir}</button>`:'<div></div>'):'<div></div>'}
  </div>
  ${s.done?`<div class="strong-timer-bar" id="tb_${ei}_${si}" ${!rt?'style="display:none"':''}>
    <div class="strong-timer-fill${rt&&rt.secs<=10?' urg':''}" id="tf_${ei}_${si}" style="width:${timerPct}%"></div>
    <span class="strong-timer-label" id="tl_${ei}_${si}">${rt?fmt(getTimerRemaining(rt)):fmt(e.descanso||90)}</span>
  </div>`:''}`;
}

function rerenderSerieHeaders(){
  // just update active highlights without full re-render
  if(!activeInput)return;
  const {ei,si}=activeInput;
  document.querySelectorAll('.strong-cell.active').forEach(el=>el.classList.remove('active'));
  const cells=document.querySelectorAll(`#sw_${ei}_${si} .strong-cell`);
  if(cells[0]&&activeInput.field==='peso')cells[0].classList.add('active');
  if(cells[1]&&activeInput.field==='reps')cells[1].classList.add('active');
}

function selDia(i){
  activeDia=i;
  runningTimers={};
  activeInput=null;
  workoutStartTime=null;
  if(workoutTimerInt){clearInterval(workoutTimerInt);workoutTimerInt=null;}
  // If we're in entreno, go to preview first; if already selecting, go to entreno
  if(vistaActual==='entreno'){
    const klEl = document.getElementById('klContent');
    klEl.innerHTML=hEntreno();
    setTimeout(()=>{ applyLang(klEl); iniciarEntreno(); }, 50);
  } else {
    abrirPreviewDia(i);
  }
}

