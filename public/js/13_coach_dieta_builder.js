/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 13_coach_dieta_builder.js
   Diet builder: hDietaBuilder(), initDietaBuilder(), dbLoad*, dbGenerarIA()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ DIETA BUILDER ════════════════════════════════════
let dbState={clienteId:null,comidaId:null,comidaNombre:''};

function hDietaBuilder(){return`
  <div class="sec" style="margin-bottom:12px">
    <div class="sec-hdr" style="margin-bottom:10px">1. ${COACH_LANG==='en'?'Select client':'Selecciona cliente'}</div>
    <input class="inp" id="db_cl_buscar" placeholder="${COACH_LANG==='en'?'Search client...':'Buscar cliente...'}" oninput="dbFiltrarTarjetas()" style="margin-bottom:10px;font-size:13px"/>
    <div id="db_cl_grid" class="cc-grid clientes-card-grid"></div>
    <input type="hidden" id="db_cl" value=""/>
  </div>
  <div id="db_wrap" style="display:none">
    <div class="sec" style="margin-bottom:12px;background:rgba(37,99,235,.05);border-color:rgba(59,130,246,.2)">
      <div class="sec-hdr">🤖 ${COACH_LANG==='en'?'Generate AI diet plan':'Generar plan de dieta con IA'}</div>
      <div id="db_client_hint"></div>
      <div style="font-size:12px;color:var(--tx3);margin-bottom:12px;line-height:1.6">${tc('La IA usa automáticamente las kcal, macros, intolerancias y preferencias del cliente. Solo tienes que indicar los alimentos disponibles y el número de comidas.')}</div>

      <div class="form-lbl" style="display:flex;align-items:center;justify-content:space-between">
        ${tc('Alimentos disponibles')}
        <div style="display:flex;align-items:center;gap:12px">
          <button onclick="dbNuevoAlimento()" style="font-size:11px;color:var(--gnb);background:none;border:none;cursor:pointer;padding:0;touch-action:manipulation;font-weight:700">${tc('+ Nuevo alimento')}</button>
          <button onclick="dbLimpiarAlimentos()" style="font-size:11px;color:var(--tx3);background:none;border:none;cursor:pointer;padding:0;touch-action:manipulation">${tc('✕ Limpiar todo')}</button>
        </div>
      </div>

      <!-- Chips seleccionados visibles -->
      <div id="db_selected_chips" style="display:flex;flex-wrap:wrap;gap:5px;min-height:32px;padding:6px;background:var(--s2);border:0.5px solid var(--br);border-radius:10px;margin-bottom:8px">
        <span id="db_empty_hint" style="font-size:11px;color:var(--tx3);align-self:center">Tap a category to add foods →</span>
      </div>

      <!-- Categorías -->
      <div style="display:flex;gap:5px;margin-bottom:6px;flex-wrap:wrap">
        <button onclick="dbToggleCat(0,this)" data-cat="0" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">🥩 ${COACH_LANG==='en'?'Proteins':'Proteínas'}</button>
        <button onclick="dbToggleCat(1,this)" data-cat="1" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">🌾 ${COACH_LANG==='en'?'Carbs':'Carbos'}</button>
        <button onclick="dbToggleCat(2,this)" data-cat="2" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">🥑 ${COACH_LANG==='en'?'Fats':'Grasas'}</button>
        <button onclick="dbToggleCat(3,this)" data-cat="3" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">🥦 ${COACH_LANG==='en'?'Vegetables':'Verduras'}</button>
        <button onclick="dbToggleCat(4,this)" data-cat="4" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">🍎 ${COACH_LANG==='en'?'Fruits':'Frutas'}</button>
        <button onclick="dbToggleCat(5,this)" data-cat="5" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">☕ ${COACH_LANG==='en'?'Drinks':'Bebidas'}</button>
      </div>

      <!-- Lista de alimentos de la categoría activa -->
      <div id="db_alim_chips" style="display:none;flex-wrap:wrap;gap:5px;padding:8px;background:var(--s2);border:0.5px solid var(--br);border-radius:10px;margin-bottom:8px;max-height:140px;overflow-y:auto"></div>

      <!-- Favoritos guardados -->
      <div id="db_favoritos_wrap" style="display:none;margin-bottom:6px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
          <div style="font-size:10px;color:var(--amb);font-weight:700;text-transform:uppercase;letter-spacing:.08em">⭐ Mis favoritos</div>
        </div>
        <div id="db_favoritos_chips" style="display:flex;flex-wrap:wrap;gap:5px"></div>
      </div>

      <!-- Campo manual oculto - sync automático -->
      <input type="hidden" id="db_alimentos_input"/>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <button onclick="dbGuardarFavoritos()" id="btn_guardar_fav" style="font-size:11px;color:var(--gnb);background:none;border:none;cursor:pointer;padding:0;touch-action:manipulation;display:none">⭐ Save as favourite</button>
        <div style="font-size:11px;color:var(--tx3)" id="db_count_lbl"></div>
      </div>

      <div class="g2" style="gap:8px;margin-bottom:10px">
        <div>
          <div class="form-lbl">${COACH_LANG==='en'?'No. of meals':'Nº de comidas'}</div>
          <select class="inp" id="db_num_comidas" style="margin-bottom:0">
            <option value="2">${COACH_LANG==='en'?'2 meals':'2 comidas'}</option>
            <option value="3">${COACH_LANG==='en'?'3 meals':'3 comidas'}</option>
            <option value="4" selected>${COACH_LANG==='en'?'4 meals':'4 comidas'}</option>
            <option value="5">${COACH_LANG==='en'?'5 meals':'5 comidas'}</option>
            <option value="6">${COACH_LANG==='en'?'6 meals':'6 comidas'}</option>
          </select>
        </div>
        <div>
          <div class="form-lbl">${tc('Ajuste calórico')} <span style="font-size:10px;color:var(--tx3);font-weight:400">${tc('(opcional — usa el del cliente por defecto)')}</span></div>
          <select class="inp" id="db_objetivo_cal" style="margin-bottom:0">
            <option value="auto">${tc('Automático según objetivo del cliente')}</option>
            <option value="mantenimiento">${COACH_LANG==='en'?'Force maintenance':'Forzar mantenimiento'}</option>
            <option value="deficit">${tc('Forzar déficit (-300 kcal)')}</option>
            <option value="deficit_agresivo">${tc('Forzar déficit agresivo (-500 kcal)')}</option>
            <option value="superavit">${tc('Forzar superávit (+300 kcal)')}</option>
          </select>
        </div>
      </div>

      <div class="form-lbl">${tc('Notas adicionales (opcional)')}</div>
      <input class="inp" id="db_notas_extra" placeholder="${COACH_LANG==='en'?'E.g. prefers quick breakfasts, dinner before 8pm...':'Ej: prefiere desayunos rápidos, cena antes de las 20h...'}" style="margin-bottom:10px"/>

      <div class="form-lbl" style="display:flex;align-items:center;gap:6px">
        ${tc('🧪 Analíticas / déficits (opcional)')}
        <span style="font-size:10px;color:var(--tx3);font-weight:400">${tc('La IA recomendará suplementación')}</span>
      </div>
      <textarea class="ta" id="db_analiticas" placeholder="${COACH_LANG==='en'?'E.g. low Vitamin D (18 ng/ml), ferritin 12, B12 deficient, low omega-3...':'Ej: Vitamina D baja (18 ng/ml), ferritina 12, B12 deficiente, omega-3 bajo...'}" style="min-height:60px;margin-bottom:12px"></textarea>

      <button class="btn" style="width:100%;padding:13px;font-size:15px" onclick="dbGenerarIANuevo()">⚡ ${tc('Generar plan personalizado') || (COACH_LANG==='en'?'Generate personalised plan':'Generar plan personalizado')}</button>
      <div id="db_ia_result" style="margin-top:12px"></div>
    </div>

    <div id="db_plan_preview" style="display:none">
      <div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">${tc('Vista previa del plan') || (COACH_LANG==='en'?'Plan preview':'Vista previa del plan')}</div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="btn" style="flex:1;padding:10px;background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);font-size:13px" onclick="dbEditarPlan()">✏️ ${tc('Editar cantidades') || (COACH_LANG==='en'?'Edit quantities':'Editar cantidades')}</button>
          <button class="btn" style="flex:1;padding:10px;background:var(--gn);font-size:13px" id="btn_publicar_dieta_ia" onclick="dbPublicarPlan()">✓ ${tc('Publicar al cliente') || (COACH_LANG==='en'?'Publish to client':'Publicar al cliente')}</button>
        </div>
        <div id="db_plan_html"></div>
      </div>
    </div>
  </div>`;}

async function initDietaBuilder(){
  const cl=await api('/clientes');
  window._dbClientes=cl;
  dbRenderTarjetas(cl);
}

function dbRenderTarjetas(clientes){
  const grid=document.getElementById('db_cl_grid');
  if(!grid)return;
  if(!clientes.length){grid.innerHTML=`<div class="wm-empty-clients" style="padding:22px 12px"><div class="wm-empty-title">${COACH_LANG==='en'?'No clients yet.':'Sin clientes aún.'}</div></div>`;return;}
  const selId=document.getElementById('db_cl')?.value;
  grid.innerHTML=clientes.map((c,i)=>hCoachSelectClientCard(c,i,'db',selId)).join('');
}

function dbFiltrarTarjetas(){
  const q=(document.getElementById('db_cl_buscar')?.value||'').toLowerCase();
  const cl=(window._dbClientes||[]).filter(c=>!q||(c.nombre||'').toLowerCase().includes(q));
  dbRenderTarjetas(cl);
}

function dbSelTarjeta(id,card){
  document.querySelectorAll('#db_cl_grid > div').forEach(d=>{ d.style.border='0.5px solid var(--br)'; d.querySelector('[style*="border-radius:50%;background:var(--bl)"]')?.remove(); });
  card.style.border='2px solid var(--bl)';
  const chk=document.createElement('div');
  chk.innerHTML=`<div style="position:absolute;top:8px;right:8px;width:16px;height:16px;border-radius:50%;background:var(--bl);display:flex;align-items:center;justify-content:center"><svg width="9" height="9" viewBox="0 0 10 8" fill="none"><polyline points="1,4 4,7 9,1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  card.appendChild(chk.firstChild);
  document.getElementById('db_cl').value=id;
  dbSelCliente(id);
}

async function dbSelCliente(id){
  if(!id)return;
  dbState.clienteId=id;
  document.getElementById('db_wrap').style.display='block';
  // Pre-fill alimentos from client preferences if available
  try{
    const c = await api('/clientes/'+id);
    const dietaPrefs = extraerPreferenciasDietaCliente(c);
    const notasEl = document.getElementById('db_notas_extra');
    if(notasEl && c.observaciones && !notasEl.value){
      notasEl.value = c.observaciones;
    }
    // Auto-fill analíticas from client deficiencias field
    const analiticasEl = document.getElementById('db_analiticas');
    if(analiticasEl && c.deficiencias && !analiticasEl.value){
      analiticasEl.value = c.deficiencias;
    }
    // Show client info hint
    const kcal = c.kcal_internas||2000;
    const hint = document.getElementById('db_client_hint');
    if(hint) hint.innerHTML = `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:10px 12px;margin-bottom:10px">
      <div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:6px">${c.nombre}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;color:var(--tx3);margin-bottom:6px">
        <div>⚡ <b style="color:var(--sv2)">${kcal} kcal</b></div>
        <div>🎯 ${c.objetivo||'Sin objetivo'}</div>
        <div>🥗 ${tc(c.dieta_tipo)||c.dieta_tipo||tc('Omnívoro')}</div>
        <div>📊 ${c.nivel||'Principiante'}</div>
        <div>⚖️ ${c.peso_actual?fmtPeso(c.peso_actual):'—'} · ${c.altura?fmtAltura(c.altura):'—'}</div>
        <div>🔥 ${COACH_LANG==='en'?'Activity:':'Actividad:'} ${tc(c.actividad)||c.actividad||'—'}</div>
      </div>
      ${c.alimentos_no?`<div style="font-size:11px;color:#fca5a5;margin-bottom:4px">❌ No puede: ${c.alimentos_no}</div>`:''}
      ${c.lesiones?`<div style="font-size:11px;color:#fbbf24;margin-bottom:4px">⚠️ Lesiones: ${c.lesiones}</div>`:''}
      ${c.deficiencias?`<div style="font-size:11px;color:#c084fc;margin-top:4px">🧪 Deficiencias: ${c.deficiencias}</div>`:''}
      ${dietaPrefs.alimentos.length?`<div style="font-size:11px;color:#93c5fd;margin-top:4px">🍽️ Preferencias: ${dietaPrefs.alimentos.join(', ')}</div>`:''}
      ${dietaPrefs.numComidas?`<div style="font-size:11px;color:#93c5fd;margin-top:4px">🍱 Comidas preferidas: ${dietaPrefs.numComidas}/día</div>`:''}
    </div>`;
    // Set to auto — the IA will derive from client objetivo
    const objCal = document.getElementById('db_objetivo_cal');
    if(objCal) objCal.value = 'auto';
    // Load favorites
    dbCargarFavoritos();
    _dbSeleccionados.clear();
    dbActualizarSelected();
    dbAplicarPreferenciasCliente(c);
  }catch(e){}
}

async function dbLoadComidas(){
  const listEl = document.getElementById('db_comidas_list');
  if(!listEl) return;
  const c=await api('/clientes/'+dbState.clienteId);
  const mIcons=['☀️','🕐','🍽️','🌅','🌙','🥗'];
  const catColors={'Proteína':'#3b82f6','Carbohidrato':'#a78bfa','Verdura':'#22c55e','Grasa saludable':'#f59e0b','Lácteo':'#ec4899'};
  listEl.innerHTML=c.comidas.length?c.comidas.map((m,mi)=>`
    <div style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;margin-bottom:10px;overflow:hidden">
      <div style="padding:11px 13px;display:flex;align-items:center;justify-content:space-between;${m.items.length?'border-bottom:0.5px solid var(--br)':''}">
        <div class="fl"><span style="font-size:20px;margin-right:8px">${mIcons[mi]||'🍽️'}</span><span style="font-size:14px;font-weight:700;color:var(--sv)">${m.nombre}</span></div>
        <button class="btn btn-sm" onclick="dbOpenAlim(${m.id},'${m.nombre}')">+ Alimento</button>
      </div>
      ${m.items.map(it=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 13px;border-bottom:0.5px solid rgba(39,39,42,.5)">
        <span style="font-size:20px">${foodEmoji(it.nombre)}</span>
        <span style="flex:1;font-size:13px;font-weight:600;color:var(--sv2)">${it.nombre}</span>
        <input type="number" value="${it.gramos}" min="1" style="width:60px;padding:5px 7px;border:0.5px solid var(--br);border-radius:7px;background:var(--b);color:var(--blg);font-size:13px;font-weight:700;text-align:center;font-family:'Inter',sans-serif" onchange="dbEditG(${it.id},this.value)"/>
        <span style="font-size:11px;color:var(--tx3)">g</span>
        <button onclick="dbDelAlim(${it.id})" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:15px">✕</button>
      </div>`).join('')}
    </div>`).join(''):`<div style="font-size:13px;color:var(--tx3)">${tc('Sin comidas. Añade la primera.')}</div>`;
}

async function dbAddComida(){
  const n=prompt('Nombre (ej: Desayuno, Comida, Cena...):');if(!n)return;
  await api('/clientes/'+dbState.clienteId+'/comidas',{method:'POST',body:JSON.stringify({nombre:n})});
  await dbLoadComidas();
}

function dbOpenAlim(id,nombre){
  dbState.comidaId=id;dbState.comidaNombre=nombre;
  document.getElementById('db_alim_panel').style.display='block';
  document.getElementById('db_comida_lbl').textContent=nombre;
  document.getElementById('db_alim_panel').scrollIntoView({behavior:'smooth'});
  dbBuscar();
}

async function dbBuscar(){
  const cat=document.getElementById('db_cat').value,b=document.getElementById('db_buscar').value;
  const p=new URLSearchParams();
  if(cat!=='Todos')p.append('categoria',cat);if(b)p.append('buscar',b);
  const alims=await api('/alimentos-db?'+p);
  const catColors={'Proteína':'#3b82f6','Carbohidrato':'#a78bfa','Verdura':'#22c55e','Grasa saludable':'#f59e0b','Lácteo':'#ec4899'};
  document.getElementById('db_alim_lista').innerHTML=alims.map(a=>`
    <div class="alim-card">
      <div class="alim-emoji">${foodEmoji(a.nombre)}</div>
      <div class="alim-cat" style="color:${catColors[a.categoria]||'var(--blg)'}">${a.categoria}</div>
      <div class="alim-nombre">${a.nombre}</div>
      <div class="alim-macros">Por 100g: ${a.proteinas}g P · ${a.carbos}g C · ${a.grasas}g G</div>
      <button class="alim-add" onclick="dbAddAlim('${a.nombre.replace(/'/g,"\\'")}')">+ Añadir</button>
    </div>`).join('')||`<div style="color:var(--tx3);font-size:13px;padding:16px;text-align:center">${tc('Sin resultados')}</div>`;
}

async function dbAddAlim(nombre){
  const g=parseInt(prompt('Gramos (en crudo):','100')||'100');if(!g)return;
  await api('/comidas/'+dbState.comidaId+'/alimentos',{method:'POST',body:JSON.stringify({nombre,gramos:g})});
  await dbLoadComidas();
}
async function dbEditG(id,g){await api('/alimentos/'+id,{method:'PUT',body:JSON.stringify({gramos:parseInt(g)})});}
async function dbDelAlim(id){await api('/alimentos/'+id,{method:'DELETE'});await dbLoadComidas();}

async function dbGenerarIA(){
  const res=document.getElementById('db_ia_result');
  if(!dbState.clienteId){res.innerHTML='<div style="color:#f87171;font-size:13px">Selecciona un cliente primero</div>';return;}
  const alimentos=document.getElementById('db_alimentos_input').value.trim();
  if(!alimentos){res.innerHTML=`<div style="color:#f87171;font-size:13px">${COACH_LANG==='en'?'Enter the available foods':'Escribe los alimentos disponibles'}</div>`;return;}
  res.innerHTML=`<div class="ia-chip"><div class="ia-chip-title">${COACH_LANG==='en'?'Generating diet...':'Generando dieta...'}</div></div>`;
  const c=await api('/clientes/'+dbState.clienteId);
  try{
    const d=await api('/ia/chat',{method:'POST',body:JSON.stringify({messages:[{role:'user',content:`Genera un plan de dieta para ${c.nombre}. Objetivo: ${c.objetivo}. Nivel: ${c.nivel}. Calorías objetivo: ${c.kcal_internas} kcal. Proteína: ${c.prot}g. Carbos: ${c.carbs}g. Grasas: ${c.fat}g. Alimentos disponibles: ${alimentos}. Crea 5 comidas (desayuno, media mañana, comida, merienda, cena) con alimentos en gramos en crudo. NO menciones calorías al cliente.`}],system:'Eres un nutricionista deportivo experto. Genera planes de dieta flexibles, prácticos y adaptados al objetivo. Cantidades en gramos en crudo. '+(COACH_LANG==='en'?'Always respond in English.':'Responde en español.')})});
    res.innerHTML=`<div class="ia-chip"><div class="ia-chip-title">${COACH_LANG==='en'?'Diet generated for':'Dieta generada para'} ${c.nombre}</div><div class="ia-result-body" style="white-space:pre-line">${d.reply}</div></div>`;
  }catch(e){res.innerHTML='<div style="color:#f87171;font-size:13px">Error generando. Verifica la API key.</div>';}
}

