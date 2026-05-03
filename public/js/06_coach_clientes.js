/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 06_coach_clientes.js
   Coach nav, renderCoach(), hClientes(), verCliente(), tareas pendientes, filtros

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */


// ═══ COACH NAV ════════════════════════════════════════
function getTitles(){return{clientes:tc('Clientes'),nuevo:tc('Nuevo cliente'),pendientes:tc('Solicitudes pendientes'),rutinas:tc('Crear rutina'),'dieta-builder':tc('Crear dieta'),progreso:tc('Progreso'),ia:tc('Asistente IA Coach'),mensajes:tc('Mensajes')};}
function cNav(s,btn){
  _coachTabActual = s;
  document.querySelectorAll('#sCoach .sni').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  document.getElementById('cTitle').textContent=getTitles()[s]||s;
  renderCoach(s);
}
function cNavM(s,btn){
  _coachTabActual = s;
  document.querySelectorAll('#coachMobileNav .bni').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  document.getElementById('cTitle').textContent=getTitles()[s]||s;
  renderCoach(s);
}

// ═══ COACH RENDER ════════════════════════════════════
async function renderCoach(s){
  const el=document.getElementById('cContent');
  if(s==='clientes'){const cl=await api('/clientes');window._clientesCache=cl;el.innerHTML=hClientes(cl);cargarTareasPendientes();}
  else if(s==='nuevo'){el.innerHTML=hNuevo();}
  else if(s==='rutinas'){el.innerHTML=hRutinas();await initRutinas();}
  else if(s==='dieta-builder'){el.innerHTML=hDietaBuilder();await initDietaBuilder();}
  else if(s==='progreso'){const cl=await api('/clientes');el.innerHTML=hProgreso(cl);cargarProgresoSubs();cargarDashboard();}
  else if(s==='pendientes'){const p=await api('/clientes-pendientes');el.innerHTML=hPendientes(p);}
  else if(s==='mensajes'){el.innerHTML=hMensajesCoach();coachMsgsInit();}
  else if(s==='equipo'){el.innerHTML=hEquipo();initEquipo();}
  else if(s==='ia'){
  el.innerHTML=hIACoach();
  iaH=[{role:'assistant',content:tc('Hola coach, listo. Puedo generar rutinas y dietas completas, analizar progreso y sugerir ajustes. ¿Qué necesitas?')}];
  fetch('/api/images-status').then(r=>r.json()).then(d=>{
    const btn=document.getElementById('btn_img_status');
    if(!btn)return;
    if(d.count>0){btn.textContent=`✓ ${d.count} ${COACH_LANG==='en'?'images in DB':'imágenes en BD'}`;btn.style.color='#86efac';}
    else{btn.textContent=tc('🖼️ Descargar imágenes ejercicios');}
 }).catch(()=>{});
  }
  // Re-apply static translations after every render
  setTimeout(()=>{ applyCoachLang(document.getElementById('sCoach')); applyCoachLang(document.getElementById('cContent')); },50);
}

function hClientes(cl){
  if(!cl.length)return`<div class="wm-empty-clients"><div class="wm-empty-icon">👤</div><div class="wm-empty-title">${tc('Sin clientes aún')}</div><div class="wm-empty-sub">${COACH_LANG==='en'?'Create your first client from here.':'Crea tu primer cliente desde aquí.'}</div><button class="btn" onclick="abrirNuevoClienteDesdeClientes()">${COACH_LANG==='en'?'＋ Add client':'＋ Añadir cliente'}</button></div>`;

  const coachColors = {
    [USER.id]: {bg:'rgba(59,130,246,.18)',color:'#93c5fd',label: USER.nombre||USER.username},
  };
  cl.forEach(c => {
    if(c.coach_id && !coachColors[c.coach_id]) {
      coachColors[c.coach_id] = {bg:'rgba(168,85,247,.18)',color:'#d8b4fe',label:c.coach_nombre||'Coach'};
    }
  });

  if(typeof window._clienteFilter === 'undefined') window._clienteFilter = 'todos';
  const filter = window._clienteFilter;

  const clFiltrados = filter === 'todos' ? cl :
    filter === 'mios' ? cl.filter(c => !c.coach_id || c.coach_id === USER.id) :
    cl.filter(c => c.coach_id && c.coach_id !== USER.id);

  const misCls = cl.filter(c => !c.coach_id || c.coach_id === USER.id).length;
  const otrosCls = cl.filter(c => c.coach_id && c.coach_id !== USER.id).length;
  const otroCoachNombre = Object.values(coachColors).find((v,i) => i > 0)?.label || 'Partner';

  return`
  <div class="clientes-page-head">
    <div>
      <div class="clientes-title">${tc('Clientes')}</div>
      <div class="clientes-subtitle">${COACH_LANG==='en'?'Manage and add clients from this section.':'Gestiona y añade clientes desde este apartado.'}</div>
    </div>
    <button class="btn btn-sm clientes-add-btn" onclick="abrirNuevoClienteDesdeClientes()">${COACH_LANG==='en'?'＋ Add client':'＋ Añadir cliente'}</button>
  </div>

  <div id="tareas_pendientes_wrap" style="margin-bottom:4px"></div>

  <div class="clientes-stats-grid">
    <div class="clientes-stat-card"><div class="mlbl">${tc('Total')}</div><div class="mval">${cl.length}</div></div>
    <div class="clientes-stat-card stat-blue"><div class="mlbl">${tc('Míos')}</div><div class="mval">${misCls}</div></div>
    <div class="clientes-stat-card stat-purple"><div class="mlbl">${otroCoachNombre}</div><div class="mval">${otrosCls}</div></div>
  </div>

  <div class="clientes-filter-bar">
    <button class="clientes-filter ${filter==='todos'?'on':''}" onclick="filtrarClientes('todos')">${tc('Todos')}</button>
    <button class="clientes-filter blue ${filter==='mios'?'on':''}" onclick="filtrarClientes('mios')">🔵 ${tc('Míos')}</button>
    <button class="clientes-filter purple ${filter==='otros'?'on':''}" onclick="filtrarClientes('otros')">🟣 ${otroCoachNombre}</button>
  </div>

  <div class="cc-grid clientes-card-grid">
    ${clFiltrados.map((c,i)=>{
      const a=ac(i);
      const cc=c.coach_id?coachColors[c.coach_id]:coachColors[USER.id];
      const esMio = !c.coach_id || c.coach_id === USER.id;
      const avatar = c.foto_perfil
        ? `<img src="${c.foto_perfil}" alt="${c.nombre}"/>`
        : `<span>${ini(c.nombre)}</span>`;
      return`<div class="cc cliente-card ${esMio?'own':'partner'}" onclick="verCliente(${c.id})">
        <div class="cliente-coach-badge" style="background:${cc.bg};color:${cc.color}">${esMio?'🔵':'🟣'} ${cc.label}</div>
        <div class="cliente-card-main">
          <div class="cliente-avatar" style="background:${a.bg};color:${a.tx};border-color:${esMio?'rgba(59,130,246,.45)':'rgba(168,85,247,.45)'}">${avatar}</div>
          <div class="cliente-info">
            <div class="cliente-name">${c.nombre}</div>
            <div class="cliente-meta">${tc(c.objetivo)} · ${tc(c.nivel)}</div>
          </div>
        </div>
        <div class="cliente-tags">
          <span class="badge b-sv">${tc('Sem')} ${c.semanas}</span>
          ${c.peso_actual?`<span class="badge b-bl">${c.peso_actual}kg</span>`:''}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}
async function cargarTareasPendientes(){
  const wrap=document.getElementById('tareas_pendientes_wrap');
  if(!wrap)return;
  try{
    const pendientes=await api('/coach/sesiones-pendientes');
    if(!pendientes.length){wrap.innerHTML='';return;}
    const isEn=COACH_LANG==='en';
    const titulo=isEn?`📋 Pending reviews (${pendientes.length})`:`📋 Pendientes de revisar (${pendientes.length})`;
    const items=pendientes.map(s=>{
      const fecha=new Date(s.fecha);
      const mins=Math.floor((Date.now()-fecha.getTime())/60000);
      const haceStr=mins<60?(isEn?`${mins}m ago`:`hace ${mins}m`):mins<1440?(isEn?`${Math.floor(mins/60)}h ago`:`hace ${Math.floor(mins/60)}h`):(isEn?`${Math.floor(mins/1440)}d ago`:`hace ${Math.floor(mins/1440)}d`);
      const ini=s.cliente_nombre?s.cliente_nombre.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase():'?';
      return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--s2);border-radius:10px;margin-bottom:6px;cursor:pointer" onclick="verCliente(${s.cliente_id});setTimeout(()=>switchClienteTab('progreso',document.querySelector('.ctab[onclick*=progreso]')),600)">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(59,130,246,.18);color:#93c5fd;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;overflow:hidden">${s.foto_perfil?`<img src="${s.foto_perfil}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`:ini}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:700;color:var(--sv);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.cliente_nombre}</div>
          <div style="font-size:11px;color:var(--tx3)">🏋️ ${s.dia_nombre}${s.dia_grupo?' · '+s.dia_grupo:''} · ${s.num_series} ${isEn?'sets':'series'} · ${haceStr}</div>
        </div>
        <button onclick="event.stopPropagation();marcarSesionRevisada(${s.id},this)" style="flex-shrink:0;padding:6px 10px;background:rgba(34,197,94,.12);border:0.5px solid rgba(34,197,94,.3);border-radius:8px;color:var(--gnb);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">✓ ${isEn?'Mark reviewed':'Revisar'}</button>
      </div>`;
    }).join('');
    wrap.innerHTML=`<div style="background:var(--s);border:0.5px solid rgba(245,158,11,.25);border-radius:14px;padding:14px;margin-bottom:4px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:12px;font-weight:700;color:var(--amb);text-transform:uppercase;letter-spacing:.07em">${titulo}</div>
        <button onclick="cargarTareasPendientes()" style="background:none;border:none;color:var(--tx3);font-size:11px;cursor:pointer;font-family:inherit">↺</button>
      </div>${items}
      <div style="font-size:10px;color:var(--tx3);margin-top:6px;text-align:center">${isEn?'Click to review in Progress tab':'Pulsa para revisar en tab Progreso'}</div>
    </div>`;
  }catch(e){const w=document.getElementById('tareas_pendientes_wrap');if(w)w.innerHTML='';}
}

async function marcarSesionRevisada(sesionId,btn){
  if(btn){btn.disabled=true;btn.textContent='...';}
  try{
    await api('/sesiones/'+sesionId+'/revisar',{method:'PUT'});
    const fila=btn?.closest('[style*="cursor:pointer"]');
    if(fila){fila.style.transition='opacity .3s';fila.style.opacity='0';setTimeout(()=>{fila.remove();const w=document.getElementById('tareas_pendientes_wrap');if(w&&!w.querySelector('[onclick*="verCliente"]'))w.innerHTML='';},300);}
  }catch(e){if(btn){btn.disabled=false;btn.textContent='✓';}}
}


function filtrarClientes(filtro){
  window._clienteFilter = filtro;
  // Re-renderizar con el mismo listado en cache
  if(window._clientesCache) {
    document.getElementById('cContent').innerHTML = hClientes(window._clientesCache);
  }
}

function abrirNuevoClienteDesdeClientes(){
  const title=document.getElementById('cTitle');
  if(title) title.textContent=tc('Clientes');
  const el=document.getElementById('cContent');
  if(!el) return;
  el.innerHTML = `<div class="back-lnk" onclick="renderCoach('clientes')"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>${COACH_LANG==='en'?'Back to clients':'Volver a clientes'}</div>` + hNuevo();
  setTimeout(()=>{ applyCoachLang(document.getElementById('cContent')); },50);
}

async function verCliente(id){
  const c=await api('/clientes/'+id); window._coachClienteActual=c; window._coachClienteId=id; window._lastClienteId=id; const a=ac(0);
  const esMio = !c.coach_id || c.coach_id === USER.id;
  const coachBadgeColor = esMio ? '#93c5fd' : '#d8b4fe';
  const coachBadgeBg = esMio ? 'rgba(59,130,246,.15)' : 'rgba(168,85,247,.15)';
  const coachBadgeBorder = esMio ? 'rgba(59,130,246,.3)' : 'rgba(168,85,247,.3)';
  const coachNombre = c.coach_nombre || (esMio ? (USER.nombre||USER.username) : 'Coach');
  document.getElementById('cContent').innerHTML=`


  <div class="back-lnk" onclick="renderCoach('clientes')"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>${tc('Volver')}</div>
  <div class="fl" style="margin-bottom:14px;align-items:flex-start">
    <div class="av" style="width:50px;height:50px;font-size:17px;background:${a.bg};color:${a.tx};border-color:${esMio?'rgba(59,130,246,.4)':'rgba(168,85,247,.4)'};margin-right:12px;overflow:hidden;padding:0">${c.foto_perfil?`<img src="${c.foto_perfil}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`:`<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">${ini(c.nombre)}</span>`}</div>
    <div style="flex:1">
      <div style="font-size:17px;font-weight:700;color:var(--sv)">${c.nombre}</div>
      <div style="font-size:12px;color:var(--tx3);margin-top:2px">${tc(c.objetivo)} · ${tc(c.nivel)} · ${tc('Semana')} ${c.semanas}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
        <span style="background:${coachBadgeBg};color:${coachBadgeColor};border:0.5px solid ${coachBadgeBorder};font-size:10px;font-weight:700;padding:3px 9px;border-radius:10px">${esMio?'🔵':'🟣'} ${coachNombre}</span>
        <button onclick="reasignarCoach(${c.id})" style="background:none;border:0.5px solid var(--br);color:var(--tx3);font-size:10px;padding:3px 8px;border-radius:8px;cursor:pointer;font-family:inherit">${tc('Reasignar')}</button>
      </div>
    </div>
  </div>
  
  <!-- TABS NAV -->
  <div class="ctab-bar">
    <button class="ctab on" onclick="switchClienteTab('resumen',this)">${tc('📋 Resumen')}</button>
    <button class="ctab" onclick="switchClienteTab('entreno',this)">${tc('🏋️ Rutina')}</button>
    <button class="ctab" onclick="switchClienteTab('historial',this)">${tc('📊 Historial')}</button>
    <button class="ctab" onclick="switchClienteTab('dieta',this)">${tc('🥗 Dieta')}</button>
    <button class="ctab" onclick="switchClienteTab('progreso',this)">${tc('📈 Progreso')}</button>
  </div>

  <!-- TAB: RESUMEN -->
  <div class="ctab-panel on" id="ctab_resumen">
    <div class="g2" style="margin-bottom:12px">
    <div class="sec"><div class="sec-hdr">${tc('Macros internos')} <span style="color:#f87171;font-size:9px">${tc('SOLO COACH')}</span></div>${mb2('Prot','#3b82f6',c.prot,c.prot*4,c.kcal_internas)}${mb2('Carbs','#a78bfa',c.carbs,c.carbs*4,c.kcal_internas)}${mb2(COACH_LANG==='en'?'Fat':'Grasa','#f97316',c.fat,c.fat*9,c.kcal_internas)}<div style="font-size:11px;color:var(--tx3);margin-top:4px">${c.kcal_internas} ${tc('kcal/día')}</div></div>
    <div class="sec"><div class="sec-hdr">${COACH_LANG==='en'?'Weight':'Peso'}</div>${c.pesos.slice(-4).map((p,i)=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:0.5px solid var(--br)"><span style="font-size:12px;color:var(--tx3)">${tc('Sem')} ${i+1}</span><span style="font-size:13px;color:var(--sv);font-weight:700">${p.peso}kg</span></div>`).join('')||`<div style="font-size:12px;color:var(--tx3)">${tc('Sin registros')}</div>`}</div>
  </div>
  
    <div class="sec" style="margin-bottom:12px" id="coach_sub_sec">
    <div class="sec-hdr">💳 ${tc('Suscripción')} <span id="coach_sub_badge"></span></div>
    <div id="coach_sub_info"><div style="font-size:13px;color:var(--tx3)">${tc('Cargando...')}</div></div>
    <div id="coach_sub_form" style="display:none;margin-top:12px;padding-top:12px;border-top:0.5px solid var(--br)">
      <div class="g2" style="gap:8px;margin-bottom:8px">
        <div>
          <div class="form-lbl">${tc('Duración')}</div>
          <select id="sub_meses" class="inp" style="margin-bottom:0">
            <option value="1">${tc('1 mes')}</option>
            <option value="2">${tc('2 meses')}</option>
            <option value="3">${tc('3 meses')}</option>
            <option value="6">${tc('6 meses')}</option>
            <option value="12">${tc('12 meses')}</option>
          </select>
        </div>
        <div>
          <div class="form-lbl">${tc('Precio (€)')}</div>
          <input type="number" id="sub_precio" class="inp" placeholder="${COACH_LANG==='en'?'E.g. 80':'Ej: 80'}" style="margin-bottom:0"/>
        </div>
      </div>
      <textarea id="sub_notas" class="ta" placeholder="${tc('Notas internas (opcional)')}" style="min-height:50px;margin-bottom:8px"></textarea>
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;padding:10px;background:var(--gn)" onclick="renovarSuscripcion(${c.id})">✓ ${tc('Activar / Renovar')}</button>
        <button class="btn" style="padding:10px;background:rgba(239,68,68,.15);color:#fca5a5;border:0.5px solid rgba(239,68,68,.3)" onclick="cancelarSuscripcion(${c.id})">${tc('Cancelar')}</button>
      </div>
    </div>
  </div>
  
    <div class="sec" style="margin-bottom:12px">
    <div class="sec-hdr">${tc('Datos personales del cliente')}</div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="form-lbl">${tc('Peso (kg)')}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${c.peso_actual?c.peso_actual+'kg':tc('Sin datos')}</div></div>
      <div><div class="form-lbl">${tc('Altura')}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${c.altura?c.altura+'cm':tc('Sin datos')}</div></div>
      <div><div class="form-lbl">${tc('Edad')}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${c.edad?c.edad+' '+tc('años'):tc('Sin datos')}</div></div>
      <div><div class="form-lbl">${tc('Sexo')}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${c.sexo?tc(c.sexo):tc('Sin datos')}</div></div>
      <div><div class="form-lbl">${tc('Actividad')}</div><div style="font-size:13px;font-weight:600;color:var(--sv2)">${c.actividad?tc(c.actividad):tc('Sin datos')}</div></div>
      <div><div class="form-lbl">${tc('Cintura/Cadera')}</div><div style="font-size:13px;font-weight:600;color:var(--sv2)">${c.cintura_actual?fmtCintura(c.cintura_actual)+' / '+(c.cadera?fmtCintura(c.cadera):'—'):tc('Sin datos')}</div></div>
    </div>
    ${c.lesiones?`<div style="background:rgba(239,68,68,.08);border:0.5px solid rgba(239,68,68,.2);border-radius:8px;padding:8px 11px;font-size:12px;color:#fca5a5;margin-top:8px">⚠️ <span style="font-weight:700">${tc('Lesiones:')}</span> ${c.lesiones}</div>`:''}
    ${c.dieta_tipo&&c.dieta_tipo!=='Omnivoro'?`<div style="background:rgba(34,197,94,.08);border:0.5px solid rgba(34,197,94,.2);border-radius:8px;padding:8px 11px;font-size:12px;color:var(--gnb);margin-top:6px">🥗 <span style="font-weight:700">${tc('Dieta:')}</span> ${tc(c.dieta_tipo)}</div>`:''}
    ${c.alimentos_no?`<div style="background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.2);border-radius:8px;padding:8px 11px;font-size:12px;color:var(--amb);margin-top:6px">🚫 <span style="font-weight:700">${tc('No come:')}</span> ${c.alimentos_no}</div>`:''}
    ${c.observaciones?`<div style="background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.2);border-radius:8px;padding:8px 11px;font-size:12px;color:var(--amb);margin-top:6px">📝 <span style="font-weight:700">${tc('Obs:')}</span> ${c.observaciones}</div>`:''}
  </div>
  <div class="sec" style="margin-botto
    m:12px" id="ajustar_datos_form">
    <div class="sec-hdr">${tc('Ajustar datos')} <button class="btn btn-sm" id="btn_guardar_datos" data-cliente-id="${c.id}" onclick="guardarDatos(${c.id})">${tc('Guardar')}</button></div>
    <div class="g2" style="gap:8px;margin-bottom:10px">
      <div><div class="form-lbl">${tc('Objetivo')}</div><input class="inp" id="obj" value="${c.objetivo}" oninput="recalcularYGuardarCoach()" style="margin-bottom:0"/></div>
      <div><div class="form-lbl">${tc('Nivel')}</div><select class="inp" id="niv" onchange="autoGuardarMacrosCoach()" style="margin-bottom:0"><option ${c.nivel==='Principiante'?'selected':''}>${tc('Principiante')}</option><option ${c.nivel==='Intermedio'?'selected':''}>${tc('Intermedio')}</option><option ${c.nivel==='Avanzado'?'selected':''}>${tc('Avanzado')}</option></select></div>
    </div>
    <div style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-size:10px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">${tc('Calculadora de macros — ajusta y se recalcula solo')} <button type="button" onclick="recalcularYGuardarCoach()" style="float:right;background:rgba(34,197,94,.15);border:0.5px solid rgba(34,197,94,.35);color:var(--gnb);border-radius:8px;padding:5px 9px;font-size:10px;font-weight:800;cursor:pointer">${tc('Recalcular')}</button></div>
      <div class="g2" style="gap:8px;margin-bottom:10px">
        <div><div class="form-lbl">${tc('Kcal totales')}</div><input class="inp" id="kcal" type="number" value="${c.kcal_internas}" oninput="recalcMacros('kcal');autoGuardarMacrosCoach()" style="margin-bottom:0;color:var(--blg);font-weight:700"/></div>
        <div><div class="form-lbl" style="display:flex;justify-content:space-between">${tc('Proteína (g)')} <span style="color:var(--sv3);font-weight:400" id="prot_kcal">${c.prot*4} kcal</span></div><input class="inp" id="prot" type="number" value="${c.prot}" oninput="recalcMacros('prot');autoGuardarMacrosCoach()" style="margin-bottom:0"/></div>
        <div><div class="form-lbl" style="display:flex;justify-content:space-between">${tc('Grasas (g)')} <span style="color:var(--sv3);font-weight:400" id="fat_kcal">${c.fat*9} kcal</span></div><input class="inp" id="fat" type="number" value="${c.fat}" oninput="recalcMacros('fat');autoGuardarMacrosCoach()" style="margin-bottom:0"/></div>
        <div><div class="form-lbl" style="display:flex;justify-content:space-between">${tc('Carbos (g)')} <span style="color:var(--sv3);font-weight:400" id="carbs_kcal">${c.carbs*4} kcal</span></div><input class="inp" id="carbs" type="number" value="${c.carbs}" oninput="recalcMacros('carbs');autoGuardarMacrosCoach()" style="margin-bottom:0;background:rgba(37,99,235,.05);border-color:rgba(59,130,246,.3)"/></div>
      </div>
      <div style="height:8px;background:var(--s3);border-radius:4px;overflow:hidden;margin-bottom:6px" id="macro_bar">
        <div style="height:100%;display:flex">
          <div id="bar_prot" style="background:#3b82f6;transition:.3s" title="Proteína"></div>
          <div id="bar_fat" style="background:#f97316;transition:.3s" title="Grasas"></div>
          <div id="bar_carbs" style="background:#a78bfa;transition:.3s" title="Carbos"></div>
        </div>
      </div>
      <div style="display:flex;gap:10px;font-size:10px;color:var(--tx3)">
        <span>🔵 ${tc('Prot')} <span id="prot_pct">${Math.round(c.prot*4/c.kcal_internas*100)}%</span></span>
        <span>🟠 ${tc('Grasa')} <span id="fat_pct">${Math.round(c.fat*9/c.kcal_internas*100)}%</span></span>
        <span>🟣 ${tc('Carbos')} <span id="carbs_pct">${Math.round(c.carbs*4/c.kcal_internas*100)}%</span></span>
      </div>
    </div>
    <div class="form-lbl" style="margin-top:8px">${tc('Comida libre')}</div><input class="inp" id="clibre" value="${c.comida_libre||''}"/>
    <div class="form-lbl">${COACH_LANG==='en'?'Motivational message':'Mensaje motivacional'}</div><textarea class="ta" id="msgsem">${c.mensaje_semana||''}</textarea>
    <div class="form-lbl">${COACH_LANG==='en'?'Coach notes (private)':'Notas coach'}</div><textarea class="ta" id="notasc">${c.notas_coach||''}</textarea>
    <!-- Reseteo de contraseña -->
    <div style="margin-top:14px;padding-top:14px;border-top:0.5px solid var(--br)">
      <div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">${tc('🔑 Contraseña del cliente')}</div>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="inp" id="nueva_pass_${c.id}" type="password" placeholder="${tc('Nueva contraseña (mín. 4 caracteres)')}" style="margin-bottom:0;flex:1"/>
        <button onclick="resetearContrasena(${c.id})" class="btn btn-sm" style="flex-shrink:0;white-space:nowrap;background:var(--bl2);color:#fff">${tc('Guardar')}</button>
      </div>
      <div id="reset_msg_${c.id}" style="font-size:11px;margin-top:6px;height:16px"></div>
    </div>
  </div>
  <!-- ESTADO RÁPIDO: peso + último entreno -->
  <div class="g2" style="margin-bottom:12px;gap:12px">
    <div class="sec">
      <div class="sec-hdr">⚖️ ${COACH_LANG==='en'?'Weight evolution':'Evolución de peso'}</div>
      <div id="coach_peso_evolucion"><div style="font-size:13px;color:var(--tx3)">${tc('Sin registros')}</div></div>
    </div>
    <div class="sec">
      <div class="sec-hdr">🏋️ ${COACH_LANG==='en'?'Last workout':'Último entreno'}</div>
      <div id="resumen_ultimo_entreno"><div style="font-size:13px;color:var(--tx3)">${tc('Cargando...')}</div></div>
    </div>
  </div>
  </div>

  <!-- TAB: ENTRENO -->
  <div class="ctab-panel" id="ctab_entreno">
    <!-- EDITOR INLINE DE RUTINA -->
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-hdr">🏋️ ${COACH_LANG==='en'?'Assigned routine':'Rutina asignada'}
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" onclick="tabEntrenoNuevoDia(${c.id})" style="font-size:11px">${tc('+ Día')}</button>
        </div>
      </div>
      <div id="tab_entreno_dias">
        ${c.dias.length ? c.dias.map((d,di)=>`
          <div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;margin-bottom:8px;overflow:hidden">
            <div onclick="tabEntrenoToggleDia(${d.id})" style="padding:11px 13px;display:flex;align-items:center;justify-content:space-between;cursor:pointer">
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--sv)">${d.nombre}</div>
                <div style="font-size:11px;color:var(--tx3);margin-top:1px">${tc(d.grupo)||d.grupo} · ${d.ejercicios.length} ${COACH_LANG==='en'?'exercises':'ejercicios'}</div>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <button onclick="event.stopPropagation();tabEntrenoAddEx(${d.id},'${d.nombre.replace((/'/g,String.fromCharCode(39)))}')" class="btn btn-sm" style="font-size:11px">${tc('+ Ejercicio')}</button>
                <button onclick="event.stopPropagation();tabEntrenoDelDia(${d.id})" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:14px;padding:4px">🗑</button>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="color:var(--tx3);flex-shrink:0"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </div>
            </div>
            <div id="tab_dia_body_${d.id}" style="display:none;padding:0 13px 12px">
              ${d.ejercicios.length ? d.ejercicios.map(e=>`
                <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:0.5px solid var(--br)">
                  <div style="flex:1;min-width:0">
                    <div style="font-size:13px;font-weight:700;color:var(--sv)">${e.nombre}</div>
                    <div style="font-size:11px;color:var(--tx3);margin-top:1px">${e.series}×${e.reps}${e.peso_objetivo>0?' · '+e.peso_objetivo+'kg':''} · ${e.descanso}s${e.rir!=null?' · RIR'+e.rir:''}${e.es_principal?' ⭐':''}</div>
                    ${e.nota_coach?`<div style="font-size:10px;color:var(--amb);margin-top:2px">📝 ${e.nota_coach}</div>`:''}
                  </div>
                  <button onclick="tabEntrenoEditEx(${e.id})" style="background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);border-radius:6px;color:var(--blg);cursor:pointer;font-size:11px;padding:5px 8px;font-weight:600;white-space:nowrap">${tc('✏️ Editar')}</button>
                  <button onclick="tabEntrenoDelEx(${e.id},${d.id})" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:15px;padding:4px">✕</button>
                </div>`).join('')
              : `<div style="font-size:12px;color:var(--tx3);padding:8px 0">${tc('Sin ejercicios aún.')}</div>`}
            </div>
          </div>`).join('')
        : `<div style="font-size:13px;color:var(--tx3)">${tc('Sin días. Pulsa + Día para empezar.')}</div>`}
      </div>
    </div>

    <!-- PANEL EDITAR EJERCICIO (inline) -->
    <div id="tab_ex_edit_panel" style="display:none">
      <div class="sec" style="margin-bottom:12px;border-color:rgba(59,130,246,.25)">
        <div class="sec-hdr">${tc('✏️ Editar')} <button onclick="document.getElementById('tab_ex_edit_panel').style.display='none'" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:13px;font-weight:600">✕ ${tc('Cancelar')}</button></div>
        <div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:10px" id="tab_ex_edit_nombre"></div>
        <div class="g2" style="gap:8px;margin-bottom:8px">
          <div><div class="form-lbl">${tc('Series')}</div><input type="number" id="tab_ex_series" class="inp" style="margin-bottom:0"/></div>
          <div><div class="form-lbl">${tc('Reps')}</div><input id="tab_ex_reps" class="inp" style="margin-bottom:0" placeholder="10-12"/></div>
          <div><div class="form-lbl">${tc('Peso obj.')} (${COACH_LANG==='en'?'lb':'kg'})</div><input type="number" id="tab_ex_peso" class="inp" style="margin-bottom:0" step="0.5"/></div>
          <div><div class="form-lbl">${tc('Descanso (s)')}</div><input type="number" id="tab_ex_descanso" class="inp" style="margin-bottom:0"/></div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--sv2);cursor:pointer">
            <input type="checkbox" id="tab_ex_rir_on" onchange="document.getElementById('tab_ex_rir_wrap').style.display=this.checked?'block':'none'"/>
            ${COACH_LANG==='en'?'Use RIR':'Usar RIR'}
          </label>
          <div id="tab_ex_rir_wrap" style="display:none;flex:1">
            <input type="number" id="tab_ex_rir" class="inp" style="margin-bottom:0;width:80px" min="0" max="5" placeholder="2"/>
          </div>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--amb);cursor:pointer">
            <input type="checkbox" id="tab_ex_principal"/>
            ⭐ ${tc('Principal')}
          </label>
        </div>
        <div class="form-lbl">${COACH_LANG==='en'?'Note to client':'Nota al cliente'}</div>
        <textarea id="tab_ex_nota" class="ta" placeholder="${COACH_LANG==='en'?'E.g. Control the descent 3 seconds...':'Ej: Controla la bajada en 3 segundos...'}" style="min-height:55px;margin-bottom:10px"></textarea>
        <button onclick="tabEntrenoGuardarEx()" class="btn" style="width:100%;padding:11px;background:var(--bl2)">✓ ${tc('Guardar cambios')}</button>
      </div>
    </div>
  
  </div>

  <!-- TAB: HISTORIAL -->
  <div class="ctab-panel" id="ctab_historial">
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-hdr">
        📊 ${COACH_LANG==='en'?'Workout history':'Historial de entrenos'}
        <span id="sesiones_count2" style="color:var(--tx3);font-weight:400;text-transform:none;letter-spacing:0;font-size:11px"></span>
      </div>
      <div id="sesiones_wrap2"><div style="font-size:13px;color:var(--tx3);padding:20px;text-align:center">${tc('Cargando...')}</div></div>
    </div>

  </div>

  <!-- TAB: DIETA -->
  <div class="ctab-panel" id="ctab_dieta">
    <div class="sec" style="margin-bottom:12px;border-color:rgba(59,130,246,.2)">
    <div class="sec-hdr">🥗 ${COACH_LANG==='en'?'Assigned diet':'Dieta asignada'}
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm" id="btn_editar_dieta_coach" onclick="toggleEditarDietaCoach()">${tc('✏️ Editar')}</button>
        <button class="btn btn-sm" style="background:rgba(239,68,68,.15);color:#fca5a5;border:0.5px solid rgba(239,68,68,.3)" onclick="borrarDietaCoach()">🗑</button>
      </div>
    </div>
    <div id="coach_dieta_view">
      ${c.comidas.length ? c.comidas.map((m,mi)=>{
        const itemsHtml = (m.items||[]).map(it=>
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:0.5px solid rgba(39,39,42,.4)">'+
          '<span style="font-size:12px;color:var(--sv2)">'+it.nombre+'</span>'+
          '<span style="font-size:12px;font-weight:700;color:var(--blg)">'+(it.gramos||0)+'g</span>'+
          '</div>'
        ).join('');
        return '<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:10px 12px;margin-bottom:7px">'+
          '<div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:6px">'+(['☀️','🕐','🍽️','🌅','🌙','🥗'][mi]||'🍽️')+' '+m.nombre+'</div>'+
          itemsHtml+
          '</div>';
      }).join('')
      : `<div style="font-size:13px;color:var(--tx3)">${tc('Sin dieta asignada. Usa el Creador de Dieta IA.')}</div>`}
    </div>
    <div id="coach_dieta_edit" style="display:none"></div>
  </div>
  
  </div>

  <!-- TAB: PROGRESO -->
  <div class="ctab-panel" id="ctab_progreso">
    <!-- FOTOS DE PROGRESO DEL CLIENTE -->
  <div class="sec" style="margin-bottom:12px">
    <div class="sec-hdr">📸 ${tc('Fotos de progreso')}</div>
    <div id="coach_fotos_timeline">${tc('Cargando...')}</div>
  </div>

  
    <div class="sec" style="margin-bottom:12px;background:linear-gradient(135deg,rgba(37,99,235,.06),rgba(17,17,19,.8));border-color:rgba(59,130,246,.2)">
    <div class="sec-hdr">📋 ${tc('Revisión semanal')} <span id="rev_estado" style="font-size:10px;font-weight:500;color:var(--tx3);text-transform:none;letter-spacing:0"></span></div>
    <div id="revision_semanal_content"><div style="font-size:13px;color:var(--tx3)">${tc('Cargando...')}</div></div>
  </div>
    <!-- MÉTRICAS AVANZADAS: 1RM + PRs + TONELAJE -->
    <div id="metricas_avanzadas_wrap"></div>
  </div>`;

  window._cid=c.id;

  // Tab Resumen: cargar suscripción y macros
  cargarSuscripcionCliente(id);
  setTimeout(()=>{ aplicarMacrosCoach(c, true); }, 200);

  // Peso evolución + último entreno (tab Resumen)
  const pesoWrap = document.getElementById('coach_peso_evolucion');
  if(pesoWrap && c.pesos.length) {
    pesoWrap.innerHTML = c.pesos.slice(-8).map((p,i,arr)=>{
      const prev = arr[i-1];
      const tendencia = prev ? (p.peso > prev.peso ? '<span style="color:#f87171">▲</span>' : '<span style="color:#86efac">▼</span>') : '';
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:0.5px solid var(--br)">'+
        `<span style="font-size:12px;color:var(--tx3)">${COACH_LANG==='en'?'Wk':'Sem'} ${i+1}</span>`+
        tendencia+
        '<span style="font-size:14px;font-weight:700;color:var(--sv)">'+p.peso+'kg</span>'+
        (p.grasa ? '<span style="font-size:11px;color:var(--tx3)">'+p.grasa+'% '+( COACH_LANG==='en'?'fat':'grasa')+'</span>' : '')+
        (p.cintura ? '<span style="font-size:11px;color:var(--tx3)">'+p.cintura+'cm</span>' : '')+
        '</div>';
    }).join('');
  }
  // Último entreno (tab Resumen)
  const ultWrap = document.getElementById('resumen_ultimo_entreno');
  if(ultWrap) {
    api('/clientes/'+id+'/sesiones').then(sesiones=>{
      if(!sesiones.length){ ultWrap.innerHTML=`<div style="font-size:13px;color:var(--tx3)">${tc('Sin entrenos aún.')}</div>`; return; }
      const s = sesiones[0];
      const incompleto = s.estado === 'incompleto';
      const fecha = new Date(s.fecha).toLocaleDateString(COACH_LANG==='en'?'en-GB':'es-ES',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
      const durStr = s.duracion_min ? ' · '+s.duracion_min+' min' : '';
      const valoracion = s.valoracion || '';
      ultWrap.innerHTML =
        '<div style="background:var(--s2);border:0.5px solid '+(incompleto?'rgba(245,158,11,.3)':'rgba(34,197,94,.2)')+';border-radius:10px;padding:11px 13px">'+
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
          '<div><div style="font-size:14px;font-weight:700;color:var(--sv)">'+s.dia_nombre+'</div>'+
          '<div style="font-size:11px;color:var(--blg);font-weight:600">'+tc(s.dia_grupo||'')+'</div>'+
          '<div style="font-size:11px;color:var(--tx3);margin-top:2px">'+fecha+durStr+'</div></div>'+
          '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">'+
            (incompleto ? '<span class="badge" style="background:rgba(245,158,11,.15);color:var(--amb);border:0.5px solid rgba(245,158,11,.3)">⚠ '+tc('Incompleto')+'</span>' : '<span class="badge b-gn">✓ '+(COACH_LANG==='en'?'Done':'Hecho')+'</span>')+
            (valoracion ? '<span style="font-size:20px">'+valoracion.split(' ')[0]+'</span>' : '')+
          '</div>'+
        '</div>'+
        '<div style="font-size:11px;color:var(--tx3);margin-top:8px">'+s.series.length+' series · '+[...new Set(s.series.map(sr=>sr.ejercicio_nombre))].length+' ejercicios</div>'+
        '</div>';
    }).catch(()=>{ if(ultWrap) ultWrap.innerHTML=''; });
  }
}

