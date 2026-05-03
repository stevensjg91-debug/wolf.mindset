/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 11_coach_rutinas.js
   Rutinas builder: hRutinas(), initRutinas(), rbLoad*, rbAdd*, rbGenerarIA()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ RUTINAS BUILDER ══════════════════════════════════
let rbState={clienteId:null,diaId:null,diaNombre:'',diaOpen:{}};

function hRutinas(){return`
  <div class="sec" style="margin-bottom:12px">
    <div class="sec-hdr" style="margin-bottom:10px">1. ${tc('Selecciona cliente')}</div>
    <input class="inp" id="rb_cl_buscar" placeholder="${COACH_LANG==='en'?'Search client...':'Buscar cliente...'}" oninput="rbFiltrarTarjetas()" style="margin-bottom:10px;font-size:13px"/>
    <div id="rb_cl_grid" class="cc-grid clientes-card-grid"></div>
    <input type="hidden" id="rb_cl" value=""/>
  </div>

  <div class="sec" style="margin-bottom:12px;background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(24,24,27,.9));border-color:rgba(59,130,246,.22)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div>
        <div class="sec-hdr" style="margin-bottom:4px">🏋️ ${COACH_LANG==='en'?'Exercise library':'Biblioteca de ejercicios'}</div>
        <div style="font-size:12px;color:var(--tx3);line-height:1.5">${COACH_LANG==='en'?'Edit exercise images or create a new custom exercise before adding it to a routine.':'Edita imágenes de ejercicios o crea un ejercicio personalizado antes de añadirlo a una rutina.'}</div>
      </div>
      <button class="btn btn-sm" style="background:var(--bl2);color:#fff;border:0.5px solid rgba(147,197,253,.25);box-shadow:0 6px 18px rgba(37,99,235,.18)" onclick="abrirGestorImagenes()">${COACH_LANG==='en'?'Edit exercises':'Editar ejercicios'}</button>
    </div>
  </div>

  <!-- GESTOR DE EJERCICIOS -->
  <div id="gestor_imagenes" style="display:none;margin-bottom:12px">
    <div class="sec">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px">
        <div>
          <div class="sec-hdr" style="margin-bottom:4px">${COACH_LANG==='en'?'Exercise editor':'Editor de ejercicios'}</div>
          <div style="font-size:12px;color:var(--tx3)">${COACH_LANG==='en'?'Manage existing exercise images and add your own custom exercises.':'Gestiona imágenes de ejercicios existentes y añade tus propios ejercicios personalizados.'}</div>
        </div>
        <button onclick="abrirGestorImagenes()" style="background:none;border:none;color:var(--tx3);font-size:24px;cursor:pointer;line-height:1">×</button>
      </div>

      <div class="exercise-editor-grid" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.8fr);gap:12px">
        <div style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;padding:12px;min-width:0">
          <div style="font-size:11px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">${COACH_LANG==='en'?'🖼️ Edit existing exercise image':'🖼️ Editar imagen de ejercicio existente'}</div>
          <div style="font-size:11px;color:var(--tx3);margin-bottom:10px;line-height:1.5">${COACH_LANG==='en'?'Paste the URL of an image or GIF and save it.':'Pega la URL de una imagen o GIF y guárdala.'}</div>
          <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
            <select class="inp" id="edit_ex_grupo_filter" onchange="filtrarEjerciciosGestor()" style="flex:1;min-width:120px;margin-bottom:0">
              <option value="All">${COACH_LANG==='en'?'All muscle groups':'Todos los grupos'}</option>
              <option>Chest</option><option>Back</option><option>Shoulders</option><option>Biceps</option><option>Triceps</option><option>Legs</option><option>Abs</option>
            </select>
            <input class="inp" id="edit_ex_buscar" placeholder="${COACH_LANG==='en'?'Search exercise...':'Buscar ejercicio...'}" style="flex:2;min-width:140px;margin-bottom:0" oninput="filtrarEjerciciosGestor()"/>
          </div>
          <div id="gestor_lista" style="max-height:420px;overflow-y:auto"></div>
        </div>

        <div style="background:linear-gradient(135deg,rgba(34,197,94,.08),rgba(24,24,27,.95));border:0.5px solid rgba(34,197,94,.18);border-radius:12px;padding:12px;min-width:0">
          <div style="font-size:11px;color:var(--gnb);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">${COACH_LANG==='en'?'➕ Create new exercise':'➕ Crear nuevo ejercicio'}</div>
          <div class="form-lbl">${COACH_LANG==='en'?'Exercise name':'Nombre del ejercicio'}</div>
          <input class="inp" id="new_ex_nombre" placeholder="${COACH_LANG==='en'?'E.g. Incline dumbbell press':'Ej: Press inclinado con mancuernas'}"/>
          <div class="g2" style="gap:8px">
            <div>
              <div class="form-lbl">${COACH_LANG==='en'?'Muscle group':'Grupo muscular'}</div>
              <select class="inp" id="new_ex_grupo"><option>Chest</option><option>Back</option><option>Shoulders</option><option>Biceps</option><option>Triceps</option><option>Legs</option><option>Abs</option></select>
            </div>
            <div>
              <div class="form-lbl">${COACH_LANG==='en'?'Difficulty':'Dificultad'}</div>
              <select class="inp" id="new_ex_dif"><option value="Principiante">${COACH_LANG==='en'?'Beginner':'Principiante'}</option><option value="Intermedio" selected>${COACH_LANG==='en'?'Intermediate':'Intermedio'}</option><option value="Avanzado">${COACH_LANG==='en'?'Advanced':'Avanzado'}</option></select>
            </div>
          </div>
          <div class="form-lbl">${COACH_LANG==='en'?'Muscles worked':'Músculos trabajados'}</div>
          <input class="inp" id="new_ex_musculos" placeholder="${COACH_LANG==='en'?'E.g. Upper chest, triceps, front delts':'Ej: Pectoral superior, tríceps, deltoide anterior'}"/>
          <div class="form-lbl">${COACH_LANG==='en'?'Custom image or GIF URL':'URL de imagen o GIF personalizado'}</div>
          <input class="inp" id="new_ex_imagen" placeholder="https://..."/>
          <button class="btn" style="width:100%;padding:12px;background:#166534;color:#86efac" onclick="crearEjercicioManual()">${COACH_LANG==='en'?'Create exercise':'Crear ejercicio'}</button>
          <div id="new_ex_msg" style="font-size:12px;margin-top:8px;min-height:18px;color:var(--tx3)"></div>
        </div>
      </div>
    </div>
  </div>

  <div id="rb_dias_wrap" style="display:none">
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-hdr">2. ${COACH_LANG==='en'?'Training days':'Días de entreno'} <button class="sec-act" onclick="rbAddDia()">+ ${COACH_LANG==='en'?'Add day':'Añadir día'}</button></div>
      <div id="rb_dias_list"><div style="font-size:13px;color:var(--tx3)">${COACH_LANG==='en'?'Select a client first':'Selecciona un cliente primero'}</div></div>
    </div>
    <!-- PANEL AÑADIR EJERCICIO -->
    <div id="rb_add_panel" style="display:none;position:fixed;inset:0;background:rgba(9,9,11,.92);z-index:200;flex-direction:column;align-items:center;justify-content:center;padding:20px">
      <div style="background:var(--s);border:0.5px solid var(--br);border-radius:16px;padding:20px;width:100%;max-width:420px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div>
            <div style="font-size:10px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">${COACH_LANG==='en'?'Add exercise':'Añadir ejercicio'}</div>
            <div style="font-size:16px;font-weight:700;color:var(--sv)" id="rb_add_title"></div>
          </div>
          <button onclick="document.getElementById('rb_add_panel').style.display='none'" style="background:none;border:none;color:var(--tx3);font-size:22px;cursor:pointer;line-height:1">×</button>
        </div>
        <input type="hidden" id="rb_add_nombre"/>
        <input type="hidden" id="rb_add_musculos"/>
        <div class="g2" style="gap:10px;margin-bottom:10px">
          <div><div class="form-lbl">${COACH_LANG==='en'?'Sets':'Series'}</div><input class="inp" id="rb_add_series" type="number" value="3" min="1" max="10" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/></div>
          <div><div class="form-lbl">Reps</div><input class="inp" id="rb_add_reps" value="10-12" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/></div>
          <div><div class="form-lbl">${COACH_LANG==='en'?'Target weight (lb)':'Peso objetivo (kg)'}</div><input class="inp" id="rb_add_peso" type="number" value="0" step="2.5" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/></div>
          <div><div class="form-lbl">${COACH_LANG==='en'?'Rest (sec)':'Descanso (seg)'}</div><input class="inp" id="rb_add_descanso" type="number" value="90" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/></div>
          <div style="display:flex;flex-direction:column;justify-content:flex-end">
            <div class="form-lbl">RIR</div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;height:44px;padding:0 8px;background:var(--s2);border:0.5px solid var(--br);border-radius:10px">
              <input type="checkbox" id="rb_add_rir_on" style="width:18px;height:18px;cursor:pointer;accent-color:var(--bl2)" onchange="toggleRirPanel(this.checked)"/>
              <span style="font-size:13px;color:var(--sv2);font-weight:600">${COACH_LANG==='en'?'Enable':'Activar'}</span>
            </label>
          </div>
          <div id="rb_rir_val_wrap" style="display:none">
            <div class="form-lbl">${COACH_LANG==='en'?'RIR value':'Valor RIR'}</div>
            <input class="inp" id="rb_add_rir" type="number" value="2" min="0" max="5" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/>
          </div>
        </div>
        <label style="display:flex;align-items:center;gap:10px;margin-bottom:12px;cursor:pointer;padding:10px 12px;background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.25);border-radius:10px">
          <input type="checkbox" id="rb_add_principal" style="width:18px;height:18px;cursor:pointer;accent-color:#f59e0b"/>
          <div><div style="font-size:13px;font-weight:700;color:var(--amb)">⭐ ${COACH_LANG==='en'?'Main exercise':'Ejercicio principal'}</div><div style="font-size:11px;color:var(--tx3)">${COACH_LANG==='en'?'Shows in progress charts':'Aparece en gráficas de progreso'}</div></div>
        </label>
        <div class="form-lbl">${COACH_LANG==='en'?'YouTube link (optional)':'Link YouTube (opcional)'}</div>
        <input class="inp" id="rb_add_yt" placeholder="https://youtube.com/shorts/..." style="margin-bottom:8px"/>
        <div class="form-lbl">${COACH_LANG==='en'?'Note for client (optional)':'Nota para el cliente (opcional)'}</div>
        <input class="inp" id="rb_add_nota" placeholder="${COACH_LANG==='en'?'E.g. last set to failure, control the descent...':'Ej: última serie al fallo, controla la bajada...'}" style="margin-bottom:14px"/>
        <div style="display:flex;gap:10px">
          <button class="btn" style="flex:1;padding:13px;font-size:15px" id="rb_add_btn" onclick="rbConfirmAdd()">✓ ${COACH_LANG==='en'?'Add exercise':'Añadir ejercicio'}</button>
          <button onclick="document.getElementById('rb_add_panel').style.display='none'" style="padding:13px 16px;border:0.5px solid var(--br);border-radius:10px;background:none;color:var(--tx3);cursor:pointer;font-family:inherit;font-size:14px">${COACH_LANG==='en'?'Cancel':'Cancelar'}</button>
        </div>
      </div>
    </div>

    <div id="rb_ex_panel" style="display:none">
      <div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">3. ${COACH_LANG==='en'?'Add exercise →':'Añadir ejercicio →'} <span id="rb_dia_lbl" style="color:var(--blg);text-transform:none;letter-spacing:0;font-size:13px"></span></div>
        <div id="rb_client_alert" style="display:none;margin-bottom:10px"></div>
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
          <select class="inp" id="rb_grupo" onchange="rbBuscar()" style="flex:1;min-width:130px;margin-bottom:0">
            <option value="All">${COACH_LANG==='en'?'All muscle groups':'Todos los grupos'}</option>
            <option>Chest</option><option>Back</option><option>Shoulders</option><option>Biceps</option><option>Triceps</option><option>Legs</option><option>Abs</option>
          </select>
          <input class="inp" id="rb_buscar" placeholder="${COACH_LANG==='en'?'Search...':'Buscar...'}" style="flex:2;min-width:140px;margin-bottom:0" oninput="rbBuscar()"/>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
          <button class="btn btn-sm" style="background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);font-size:11px" onclick="rbFiltrarIA()">🤖 ${COACH_LANG==='en'?'Filter by client profile':'Filtrar por perfil del cliente'}</button>
          <button class="btn btn-sm" style="background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);font-size:11px" onclick="rbLimpiarFiltro()">✕ ${COACH_LANG==='en'?'Clear filter':'Quitar filtro'}</button>
        </div>
        <div id="rb_ia_filter_msg" style="display:none;margin-bottom:8px"></div>
        <div id="rb_ex_lista" style="width:100%"></div>
      </div>
    </div>
    <div class="sec" style="margin-bottom:12px;background:rgba(37,99,235,.05);border-color:rgba(59,130,246,.2)">
      <div class="sec-hdr">🤖 ${COACH_LANG==='en'?'Generate full routine with AI':'Generar rutina completa con IA'}</div>
      <div style="font-size:13px;color:var(--tx3);margin-bottom:10px">${COACH_LANG==='en'?'AI generates the full week automatically for the selected client.':'La IA genera toda la semana automáticamente para el cliente seleccionado.'}</div>
      <button class="btn" style="width:100%;padding:12px" onclick="rbGenerarIA()">${COACH_LANG==='en'?'Generate routine with AI':'Generar rutina con IA'}</button>
      <div id="rb_ia_result" style="margin-top:10px"></div>
    </div>
  </div>`;}


function hCoachSelectClientCard(c,i,mode,selId){
  const a=ac(i);
  const esMio=!c.coach_id || c.coach_id===USER.id;
  const coachLabel=esMio?(USER.nombre||USER.username||'Coach'):(c.coach_nombre||'Partner');
  const avatar=c.foto_perfil
    ? `<img src="${c.foto_perfil}" alt="${c.nombre||''}"/>`
    : `<span>${ini(c.nombre)}</span>`;
  const selected=String(c.id)===String(selId||'');
  const semanas=c.semanas_activo!=null?c.semanas_activo:(c.semanas||0);
  const click=mode==='rb'?`rbSelTarjeta(${c.id},this)`:mode==='db'?`dbSelTarjeta(${c.id},this)`:'';
  return `<div class="cc cliente-card ${esMio?'own':'partner'}" onclick="${click}" data-id="${c.id}" style="${selected?'border:2px solid var(--bl);':''}">
    <div class="cliente-coach-badge" style="background:${esMio?'rgba(59,130,246,.18)':'rgba(168,85,247,.18)'};color:${esMio?'#93c5fd':'#d8b4fe'}">${esMio?'🔵':'🟣'} ${coachLabel}</div>
    <div class="cliente-card-main">
      <div class="cliente-avatar" style="background:${a.bg};color:${a.tx};border-color:${esMio?'rgba(59,130,246,.45)':'rgba(168,85,247,.45)'}">${avatar}</div>
      <div class="cliente-info">
        <div class="cliente-name">${c.nombre}</div>
        <div class="cliente-meta">${tc(c.objetivo||'—')} · ${tc(c.nivel||'')}</div>
      </div>
    </div>
    <div class="cliente-tags">
      <span class="badge b-sv">${tc('Sem')} ${semanas}</span>
      ${c.peso_actual?`<span class="badge b-bl">${c.peso_actual}kg</span>`:''}
    </div>
    ${selected?`<div style="position:absolute;top:10px;left:10px;width:18px;height:18px;border-radius:50%;background:var(--bl);display:flex;align-items:center;justify-content:center;z-index:3"><svg width="10" height="10" viewBox="0 0 10 8" fill="none"><polyline points="1,4 4,7 9,1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`:''}
  </div>`;
}

async function initRutinas(){
  const cl=await api('/clientes');
  window._rbClientes=cl;
  rbRenderTarjetas(cl);
  // Load saved exercise configs
  try{ window.exConfig=await api('/ejercicios-config'); }catch(e){ window.exConfig={}; }
}

function rbRenderTarjetas(clientes){
  const grid=document.getElementById('rb_cl_grid');
  if(!grid)return;
  if(!clientes.length){grid.innerHTML=`<div class="wm-empty-clients" style="padding:22px 12px"><div class="wm-empty-title">${COACH_LANG==='en'?'No clients yet.':'Sin clientes aún.'}</div></div>`;return;}
  const selId=document.getElementById('rb_cl')?.value;
  grid.innerHTML=clientes.map((c,i)=>hCoachSelectClientCard(c,i,'rb',selId)).join('');
}

function rbFiltrarTarjetas(){
  const q=(document.getElementById('rb_cl_buscar')?.value||'').toLowerCase();
  const cl=(window._rbClientes||[]).filter(c=>!q||(c.nombre||'').toLowerCase().includes(q));
  rbRenderTarjetas(cl);
}

function rbSelTarjeta(id,card){
  document.querySelectorAll('#rb_cl_grid > div').forEach(d=>{ d.style.border='0.5px solid var(--br)'; d.querySelector('[style*="border-radius:50%;background:var(--bl)"]')?.remove(); });
  card.style.border='2px solid var(--bl)';
  const chk=document.createElement('div');
  chk.innerHTML=`<div style="position:absolute;top:8px;right:8px;width:16px;height:16px;border-radius:50%;background:var(--bl);display:flex;align-items:center;justify-content:center"><svg width="9" height="9" viewBox="0 0 10 8" fill="none"><polyline points="1,4 4,7 9,1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  card.appendChild(chk.firstChild);
  document.getElementById('rb_cl').value=id;
  rbSelCliente(id);
}

async function rbSelCliente(id){
  if(!id)return;
  rbState.clienteId=id;
  document.getElementById('rb_dias_wrap').style.display='block';
  await rbLoadDias();
}

async function rbLoadDias(){
  const c=await api('/clientes/'+rbState.clienteId);
  const wrap=document.getElementById('rb_dias_list');
  if(!c.dias.length){wrap.innerHTML=`<div style="font-size:13px;color:var(--tx3)">${tc('Sin días. Añade el primero arriba.')}</div>`;return;}
  wrap.innerHTML=c.dias.map((d,i)=>`
    <div class="dia-card">
      <div class="dia-hdr" onclick="rbToggleDia(${d.id})">
        <div class="dia-hdr-left"><div class="dia-nombre">${d.nombre}</div><div class="dia-grupo">${tc(d.grupo)||d.grupo} · ${d.ejercicios.length}${COACH_LANG==='en'?' exercises':' ejercicios'}</div></div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="btn btn-sm" onclick="event.stopPropagation();rbEditDia(${d.id})" style="font-size:11px;background:rgba(59,130,246,.08);border-color:rgba(59,130,246,.25);color:var(--blg)">✏️</button>
          <button onclick="event.stopPropagation();rbDelDia(${d.id})" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:15px;padding:2px 5px">🗑</button>
          <button class="btn btn-sm" onclick="event.stopPropagation();rbOpenEx(${d.id},'${d.nombre.replace(/'/g,"\\'")}','${(d.grupo||'').replace(/'/g,"\\'")}')">${COACH_LANG==='en'?'+ Exercise':'+ Ejercicio'}</button>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="color:var(--tx3)"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
      </div>
      <div class="dia-body ${rbState.diaOpen[d.id]?'open':''}" id="dia_body_${d.id}">
        ${d.ejercicios.map(e=>`<div class="ex-row">
          ${renderExImg(e.nombre, 44, e.grupo||EX_GROUP_MAP[e.nombre]||'')}
          <div class="ex-row-info"><div class="ex-row-nombre">${e.nombre}</div><div class="ex-row-detail">${e.series}×${e.reps}${e.peso_objetivo>0?' · '+e.peso_objetivo+'kg':''} · ${e.descanso}s${e.rir!=null?' · RIR '+e.rir:''}</div>${e.es_principal?`<span style="font-size:10px;color:var(--amb);font-weight:700">⭐ Principal</span>`:''}${e.nota_coach?`<div style="font-size:10px;color:var(--amb);font-weight:600;margin-top:2px">📝 ${e.nota_coach}</div>`:''}</div>
          <div style="display:flex;gap:4px"><button onclick="rbEditEx(${e.id})" style="background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);border-radius:6px;color:var(--blg);cursor:pointer;font-size:12px;padding:4px 8px;font-weight:600">✏️</button><button onclick="rbDelEx(${e.id})" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:16px;padding:4px">✕</button></div>
        </div>`).join('')||`<div style="font-size:12px;color:var(--tx3);padding:8px 0">${tc('Sin ejercicios aún.')}</div>`}
      </div>
    </div>`).join('');

  // Botón enviar rutina al cliente
  const totalEjercicios = c.dias.reduce((acc,d)=>acc+d.ejercicios.length,0);
  wrap.innerHTML += `
    <div style="margin-top:16px;padding-top:14px;border-top:0.5px solid var(--br)">
      <button onclick="rbEnviarRutinaCliente()" class="btn" style="width:100%;padding:14px;font-size:15px;font-weight:700;background:linear-gradient(135deg,#16a34a,#15803d);border-radius:12px;letter-spacing:.01em" id="rb_btn_enviar">
        📤 ${COACH_LANG==='en'?'Send routine to client':'Enviar rutina al cliente'}
      </button>
      <div style="font-size:11px;color:var(--tx3);text-align:center;margin-top:6px">${c.dias.length} ${COACH_LANG==='en'?'days':'días'} · ${totalEjercicios} ${COACH_LANG==='en'?'exercises':'ejercicios'} ${COACH_LANG==='en'?'configured':'configurados'}</div>
      <div id="rb_enviar_msg" style="font-size:12px;text-align:center;margin-top:6px;min-height:18px"></div>
    </div>`;
}

async function rbBuscar(){
  const g=document.getElementById('rb_grupo')?.value||'All';
  const b=document.getElementById('rb_buscar')?.value||'';
  const p=new URLSearchParams();
  if(g&&g!=='All')p.append('grupo',g);
  if(b)p.append('buscar',b);
  const exs=await api('/ejercicios-db?'+p);
  if(!exs.length){
    document.getElementById('rb_ex_lista').innerHTML=`<div style="color:var(--tx3);font-size:13px;padding:20px;text-align:center">${tc('Sin resultados')}</div>`;
    return;
  }
  // Group alphabetically
  const grouped={};
  exs.forEach(e=>{const l=e.nombre[0].toUpperCase();if(!grouped[l])grouped[l]=[];grouped[l].push(e);});
  const letters=Object.keys(grouped).sort();
  // Build AI filter maps
  const avoidMap={};
  const cautionMap={};
  if(rbExFilter){
    (rbExFilter.avoid||[]).forEach(x=>avoidMap[x.nombre]=x.razon);
    (rbExFilter.caution||[]).forEach(x=>cautionMap[x.nombre]=x.razon);
  }
  const html=letters.map(letter=>`
    <div style="padding:4px 0 2px;font-size:11px;font-weight:700;color:var(--sv3);border-bottom:0.5px solid var(--br);margin-bottom:4px;margin-top:8px">${letter}</div>
    ${grouped[letter].map(e=>{
      const isAvoid=rbExFilter?avoidMap[e.nombre]||null:null;
      const isCaution=rbExFilter?cautionMap[e.nombre]||null:null;
      const hasYt=window.exConfig&&window.exConfig[e.nombre]&&window.exConfig[e.nombre].youtube_url;
      return `<div style="display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:0.5px solid rgba(39,39,42,.4);cursor:${isAvoid?'not-allowed':'pointer'};${isAvoid?'opacity:.6;background:rgba(239,68,68,.05)':isCaution?'background:rgba(245,158,11,.04)':''}" ${!isAvoid?`onclick="rbAddEx('${e.nombre.replace(/'/g,"\'")}','${e.musculos.replace(/'/g,"\'")}')"`:''}>
        ${renderExImg(e.nombre, 48, e.grupo)}
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
            <span style="font-size:14px;font-weight:700;color:${isAvoid?'#fca5a5':isCaution?'var(--amb)':'var(--sv)'}">${e.nombre}</span>
            ${isAvoid?'<span style="font-size:9px;background:rgba(239,68,68,.2);color:#fca5a5;padding:1px 5px;border-radius:4px;font-weight:700">⛔ NO</span>':''}
            ${isCaution&&!isAvoid?'<span style="font-size:9px;background:rgba(245,158,11,.2);color:var(--amb);padding:1px 5px;border-radius:4px;font-weight:700">⚠️</span>':''}
            ${hasYt?'<span style="font-size:9px;background:rgba(239,68,68,.15);color:#fca5a5;padding:1px 5px;border-radius:4px;font-weight:700">▶</span>':''}
          </div>
          <div style="font-size:12px;color:var(--tx3);margin-top:2px">${e.grupo}</div>
          ${isAvoid?`<div style="font-size:11px;color:#fca5a5;margin-top:2px">${isAvoid}</div>`:''}
          ${isCaution&&!isAvoid?`<div style="font-size:11px;color:var(--amb);margin-top:2px">${isCaution}</div>`:''}
        </div>
        ${!isAvoid?'<span style="color:var(--blg);font-size:22px;font-weight:300;flex-shrink:0">+</span>':'<span style="font-size:18px">🚫</span>'}
      </div>`;
    }).join('')}
  `).join('');
  document.getElementById('rb_ex_lista').innerHTML=`<div style="max-height:480px;overflow-y:auto;padding-right:4px">${html}</div>`;
  exs.slice(0,20).forEach(e=>fetchWgerImg(e.nombre));
}

function rbToggleDia(id){rbState.diaOpen[id]=!rbState.diaOpen[id];const b=document.getElementById('dia_body_'+id);if(b)b.classList.toggle('open',rbState.diaOpen[id]);}

// ── Editar nombre/grupo de un día ──────────────────────────────
async function rbEditDia(diaId){
  const c = await api('/clientes/'+rbState.clienteId);
  const d = c.dias.find(x=>x.id===diaId);
  if(!d) return;
  const panel = document.getElementById('rb_dia_panel');
  if(!panel) return;
  // Precargar valores actuales
  document.getElementById('rb_dia_nombre').value = d.nombre;
  document.getElementById('rb_dia_grupo').value = d.grupo || '';
  // Cambiar botón a modo editar
  const btn = document.getElementById('rb_dia_btn');
  btn.textContent = COACH_LANG==='en'?'✓ Save changes':'✓ Guardar cambios';
  btn.onclick = () => rbSaveEditDia(diaId);
  applyCoachLang(panel);
  panel.style.cssText = 'display:flex!important;position:fixed;inset:0;background:rgba(9,9,11,.95);z-index:9999;flex-direction:column;align-items:center;justify-content:center;padding:20px';
}

async function rbSaveEditDia(diaId){
  const n = document.getElementById('rb_dia_nombre').value.trim();
  const g = document.getElementById('rb_dia_grupo').value.trim();
  if(!n||!g) return;
  const btn = document.getElementById('rb_dia_btn');
  btn.textContent = COACH_LANG==='en'?'Saving...':'Guardando...'; btn.disabled = true;
  try {
    await api('/dias/'+diaId,{method:'PUT',body:JSON.stringify({nombre:n,grupo:g})});
    document.getElementById('rb_dia_panel').style.display='none';
    document.getElementById('rb_dia_nombre').value='';
    document.getElementById('rb_dia_grupo').value='';
    // Restaurar botón a modo añadir para la próxima vez
    btn.textContent = tc('✓ Añadir día'); btn.disabled=false;
    btn.onclick = rbConfirmDia;
    await rbLoadDias();
  } catch(e){ btn.textContent='Error'; btn.disabled=false; }
}

async function rbDelDia(diaId){
  if(!confirm(COACH_LANG==='en'?'Delete this day and all its exercises?':'¿Eliminar este día y todos sus ejercicios?')) return;
  try {
    await api('/dias/'+diaId,{method:'DELETE'});
    await rbLoadDias();
  } catch(e){ alert('Error al eliminar'); }
}

// ── Enviar rutina al cliente (notificación push + mensaje) ──────
async function rbEnviarRutinaCliente(){
  const btn = document.getElementById('rb_btn_enviar');
  const msg = document.getElementById('rb_enviar_msg');
  if(!rbState.clienteId){ if(msg) msg.textContent=COACH_LANG==='en'?'Select a client first':'Selecciona un cliente primero'; return; }
  if(btn){ btn.disabled=true; btn.textContent='⏳ '+(COACH_LANG==='en'?'Sending...':'Enviando...'); }
  try {
    const c = await api('/clientes/'+rbState.clienteId);
    const resumen = c.dias.map(d=>`${d.nombre} (${d.grupo||''}) · ${d.ejercicios.length} ej.`).join(' | ');
    const mensaje = COACH_LANG==='en'
      ? `📋 New routine ready for you! ${c.dias.length} training days: ${resumen}`
      : `📋 ¡Tu nueva rutina está lista! ${c.dias.length} días de entreno: ${resumen}`;
    await api('/notificaciones/coach',{method:'POST',body:JSON.stringify({tipo:'rutina_enviada',mensaje,cliente_id:rbState.clienteId})});
    if(btn){ btn.disabled=false; btn.textContent='✓ '+(COACH_LANG==='en'?'Routine sent!':'¡Rutina enviada!'); btn.style.background='#15803d'; }
    if(msg){ msg.style.color='#86efac'; msg.textContent=COACH_LANG==='en'?`Sent to ${c.nombre}`:`Enviada a ${c.nombre}`; }
    setTimeout(()=>{
      if(btn){ btn.textContent='📤 '+(COACH_LANG==='en'?'Send routine to client':'Enviar rutina al cliente'); btn.style.background=''; btn.disabled=false; }
      if(msg) msg.textContent='';
    }, 3000);
  } catch(e){
    if(btn){ btn.disabled=false; btn.textContent='📤 '+(COACH_LANG==='en'?'Send routine to client':'Enviar rutina al cliente'); }
    if(msg){ msg.style.color='#f87171'; msg.textContent='Error al enviar'; }
  }
}

function rbAddDia(){
  const panel = document.getElementById('rb_dia_panel');
  if(!panel){ alert('Error: panel no encontrado'); return; }
  // Apply language translations to static panel
  applyCoachLang(panel);
  panel.style.cssText = 'display:flex!important;position:fixed;inset:0;background:rgba(9,9,11,.95);z-index:9999;flex-direction:column;align-items:center;justify-content:center;padding:20px';
}

async function rbConfirmDia(){
  const n = document.getElementById('rb_dia_nombre').value.trim();
  const g = document.getElementById('rb_dia_grupo').value.trim();
  if(!n||!g) return;
  const btn = document.getElementById('rb_dia_btn');
  btn.textContent=(COACH_LANG==='en'?'Saving...':'Guardando...'); btn.disabled=true;
  try {
    await api('/clientes/'+rbState.clienteId+'/dias',{method:'POST',body:JSON.stringify({nombre:n,grupo:g})});
    document.getElementById('rb_dia_panel').style.display='none';
    document.getElementById('rb_dia_nombre').value='';
    document.getElementById('rb_dia_grupo').value='';
    btn.textContent=tc('✓ Añadir día'); btn.disabled=false;
    await rbLoadDias();
  } catch(e) { btn.textContent='Error'; btn.disabled=false; }
}

function rbOpenEx(diaId,diaNombre){
  rbState.diaId=diaId;rbState.diaNombre=diaNombre;
  document.getElementById('rb_ex_panel').style.display='block';
  document.getElementById('rb_dia_lbl').textContent=diaNombre;
  document.getElementById('rb_ex_panel').scrollIntoView({behavior:'smooth'});
  rbBuscar();
}

function rbAddEx(nombre, musculos){
  const cfg=(window.exConfig&&window.exConfig[nombre])||{};
  // Show inline panel instead of prompts
  const panel = document.getElementById('rb_add_panel');
  const title = document.getElementById('rb_add_title');
  if(!panel||!title) return;
  title.textContent = nombre;
  document.getElementById('rb_add_nombre').value = nombre;
  document.getElementById('rb_add_musculos').value = musculos;
  document.getElementById('rb_add_series').value = '3';
  document.getElementById('rb_add_reps').value = '10-12';
  document.getElementById('rb_add_peso').value = '0';
  document.getElementById('rb_add_descanso').value = '90';
  document.getElementById('rb_add_yt').value = cfg.youtube_url||'';
  document.getElementById('rb_add_nota').value = cfg.nota_default||'';
  panel.style.display = 'flex';
  panel.scrollIntoView({behavior:'smooth'});
}

async function rbConfirmAdd(){
  const nombre = document.getElementById('rb_add_nombre').value.trim();
  const musculos = document.getElementById('rb_add_musculos').value||'';
  const series = parseInt(document.getElementById('rb_add_series').value)||3;
  const reps = document.getElementById('rb_add_reps').value||'10-12';
  const peso = parseFloat(document.getElementById('rb_add_peso').value)||0;
  const descanso = parseInt(document.getElementById('rb_add_descanso').value)||90;
  const rirOn = document.getElementById('rb_add_rir_on')?.checked;
  const rir = rirOn ? (parseInt(document.getElementById('rb_add_rir').value)||2) : null;
  const esPrincipal = document.getElementById('rb_add_principal')?.checked ? 1 : 0;
  const youtube = document.getElementById('rb_add_yt')?.value||'';
  const nota = document.getElementById('rb_add_nota')?.value||'';
  const diaId = rbState.diaId;

  if(!nombre){ alert('Selecciona un ejercicio primero'); return; }
  if(!diaId){ alert('Error: no se ha seleccionado un día'); return; }

  const btn = document.getElementById('rb_add_btn');
  if(!btn) return;
  btn.innerHTML = '⏳ '+(COACH_LANG==='en'?'Saving...':'Guardando...');
  btn.disabled = true;

  try {
    const res = await api('/dias/'+diaId+'/ejercicios',{method:'POST',body:JSON.stringify({
      nombre,musculos,series,reps,peso_objetivo:peso,descanso,rir,es_principal:esPrincipal,youtube_url:youtube,nota_coach:nota
    })});
    if(res && res.error){ throw new Error(res.error); }
    btn.innerHTML = '✓ '+tc('Añadir ejercicio');
    btn.disabled = false;
    document.getElementById('rb_add_panel').style.display='none';
    rbState.diaOpen[diaId]=true;
    await rbLoadDias();
  } catch(e) {
    console.error('rbConfirmAdd error:', e);
    btn.innerHTML = 'Error: '+e.message.substring(0,30);
    btn.disabled = false;
  }
}

async function rbDelEx(id){
  if(!confirm(tc('¿Eliminar?')))return;
  await api('/ejercicios/'+id,{method:'DELETE'});
  await rbLoadDias();
}

async function rbGenerarIA(){
  const res=document.getElementById('rb_ia_result');
  if(!rbState.clienteId){res.innerHTML=`<div style="color:#f87171;font-size:13px">${tc('Selecciona un cliente primero')}</div>`;return;}
  res.innerHTML=`<div class="ia-chip"><div class="ia-chip-title">${COACH_LANG==='en'?'Generating routine...':'Generando rutina...'}</div></div>`;
  const c=await api('/clientes/'+rbState.clienteId);
  try{
    const semanas = c.semanas || 1;
    const fase = semanas % 4 === 0 ? 'semana de descarga (reduce 40% volumen)' : `semana ${semanas%4||4} de mesociclo (carga progresiva)`;
    const volPorNivel = {Principiante:'10-12 series/semana/grupo muscular', Intermedio:'14-16 series/semana/grupo muscular', Avanzado:'16-20+ series/semana/grupo muscular'};
    const volObj = volPorNivel[c.nivel] || volPorNivel.Intermedio;
    const d=await api('/ia/chat',{method:'POST',body:JSON.stringify({messages:[{role:'user',content:`Genera una rutina de entrenamiento con pesas para ${c.nombre}. 
Objetivo: ${c.objetivo}. Nivel: ${c.nivel}. Semana ${semanas} (${fase}).
Volumen objetivo: ${volObj}.
${c.lesiones?'LESIONES/LIMITACIONES: '+c.lesiones+'. Evita ejercicios contraindicados.':''}
${c.observaciones?'Observaciones: '+c.observaciones:''}
Días disponibles: 4.
Para cada día indica: nombre del día, grupo muscular, y lista de ejercicios con series × reps, peso orientativo inicial en kg, descanso en segundos, y RIR objetivo (2-3 para volumen, 1-2 para intensidad).
Aplica periodización ondulante: varía intensidad y volumen entre días. Sé específico y práctico.`}],system:COACH_LANG==='en'?'You are an expert in periodization and strength programming. Generate complete routines. Always respond in English.':'Eres un experto en periodización y programación de fuerza. Generas rutinas completas. Responde siempre en español.'})});
    res.innerHTML=`<div class="ia-chip"><div class="ia-chip-title">${COACH_LANG==='en'?'Routine generated for':'Rutina generada para'} ${c.nombre}</div><div class="ia-result-body" style="white-space:pre-line">${d.reply}</div></div>`;
  }catch(e){res.innerHTML=`<div style="color:#f87171;font-size:13px">${COACH_LANG==='en'?'Error generating. Check the API key.':'Error generando. Verifica la API key.'}</div>`;}
}


