/* ─────────────────────────────────────────────
   dieta.js — Módulo de dieta
   Cargar DESPUÉS de app1.js en index.html
────────────────────────────────────────────── */

// ═══ MACROS DE BASE DE DATOS (tabla alimentos_db) ═══
// Proteínas: ~4 kcal/g | Carbos: ~4 kcal/g | Grasas: ~9 kcal/g
// Estimación por nombre de alimento cuando no hay BD
function estimarMacrosPor100g(nombre) {
  const n = nombre.toLowerCase();
  // Proteínas principales
  if(/pollo|pechuga|pavo|atún|merluza|salmón|bacalao|gambas|ternera|cerdo|lomo|pavo/.test(n))
    return {p:22, c:0, g:3};
  if(/huevo/.test(n)) return {p:13, c:1, g:11};
  if(/whey|proteína en polvo|caseína/.test(n)) return {p:75, c:8, g:5};
  if(/yogur proteico/.test(n)) return {p:10, c:4, g:0};
  if(/yogur/.test(n)) return {p:5, c:5, g:3};
  if(/queso/.test(n)) return {p:25, c:1, g:28};
  if(/leche entera/.test(n)) return {p:3, c:5, g:4};
  if(/leche/.test(n)) return {p:3, c:5, g:2};
  if(/legumbre|lenteja|garbanzo|judía/.test(n)) return {p:9, c:20, g:1};
  if(/tofu/.test(n)) return {p:8, c:2, g:4};
  // Carbos
  if(/arroz/.test(n)) return {p:7, c:77, g:1};
  if(/avena/.test(n)) return {p:13, c:66, g:7};
  if(/pasta/.test(n)) return {p:13, c:70, g:2};
  if(/pan integral/.test(n)) return {p:9, c:41, g:3};
  if(/pan/.test(n)) return {p:8, c:48, g:2};
  if(/patata/.test(n)) return {p:2, c:17, g:0};
  if(/plátano/.test(n)) return {p:1, c:23, g:0};
  if(/manzana|naranja|fruta/.test(n)) return {p:0, c:12, g:0};
  if(/frutos rojos|fresa|arándano/.test(n)) return {p:1, c:8, g:0};
  // Grasas
  if(/aceite/.test(n)) return {p:0, c:0, g:100};
  if(/aguacate/.test(n)) return {p:2, c:2, g:15};
  if(/anacardo|nuez|almendra|cacahuete|fruto seco/.test(n)) return {p:18, c:22, g:50};
  if(/mantequilla/.test(n)) return {p:1, c:0, g:80};
  // Verduras (casi sin macros)
  if(/verdura|espinaca|lechuga|tomate|pepino|pimiento|brócoli|zanahoria|cebolla|ajo/.test(n))
    return {p:2, c:5, g:0};
  // Default
  return {p:5, c:15, g:5};
}

function calcMacrosDieta(comidas) {
  let totalP=0, totalC=0, totalG=0, totalKcal=0;
  (comidas||[]).forEach(m => {
    (m.items||[]).forEach(it => {
      const macro = estimarMacrosPor100g(it.nombre);
      const factor = (it.gramos||100) / 100;
      totalP += macro.p * factor;
      totalC += macro.c * factor;
      totalG += macro.g * factor;
    });
  });
  totalP = Math.round(totalP);
  totalC = Math.round(totalC);
  totalG = Math.round(totalG);
  totalKcal = Math.round(totalP*4 + totalC*4 + totalG*9);
  return {p:totalP, c:totalC, g:totalG, kcal:totalKcal};
}

function renderMacrosBarra(macros, objetivos) {
  const pPct = Math.min(Math.round(macros.p/Math.max(objetivos.p,1)*100),150);
  const cPct = Math.min(Math.round(macros.c/Math.max(objetivos.c,1)*100),150);
  const gPct = Math.min(Math.round(macros.g/Math.max(objetivos.g,1)*100),150);
  const kPct = Math.min(Math.round(macros.kcal/Math.max(objetivos.kcal,1)*100),150);
  const col = (pct) => pct > 110 ? '#f87171' : pct >= 90 ? '#22c55e' : '#f59e0b';
  return `<div style="background:var(--s3);border-radius:10px;padding:10px 12px;margin-bottom:10px">
    <div style="font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">${tc('Macros actuales del plan')}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">
      ${[['P',macros.p+'g',objetivos.p+'g',pPct,'#3b82f6'],['C',macros.c+'g',objetivos.c+'g',cPct,'#a78bfa'],['G',macros.g+'g',objetivos.g+'g',gPct,'#f97316'],['kcal',macros.kcal,objetivos.kcal,kPct,'#fbbf24']].map(([l,v,obj,pct,color])=>`
      <div style="text-align:center;background:var(--s2);border-radius:8px;padding:6px 4px;border:0.5px solid ${col(pct)}40">
        <div style="font-size:14px;font-weight:700;color:${col(pct)}">${v}</div>
        <div style="font-size:9px;color:var(--tx3)">${l} / ${obj}</div>
        <div style="font-size:9px;color:${col(pct)};font-weight:700">${pct}%</div>
      </div>`).join('')}
    </div>
  </div>`;
}

function toggleEditarDietaCoach(){
  const view = document.getElementById('coach_dieta_view');
  const edit = document.getElementById('coach_dieta_edit');
  const btn = document.getElementById('btn_editar_dieta_coach');
  const c = window._coachClienteActual;
  if(!c || !view || !edit) return;

  const isEditing = edit.style.display !== 'none';
  if(isEditing){
    edit.style.display = 'none';
    view.style.display = 'block';
    btn.textContent = '✏️ Editar';
  } else {
    view.style.display = 'none';
    edit.style.display = 'block';
    btn.textContent = '✕ Cancelar';
    renderEditarDietaCoach(c);
  }
}

function renderEditarDietaCoach(c){
  const edit = document.getElementById('coach_dieta_edit');
  if(!edit) return;
  if(!c.comidas.length){
    edit.innerHTML = `<div style="font-size:13px;color:var(--tx3)">${tc('Sin comidas. Publica una dieta primero desde el Creador IA.')}</div>`;
    return;
  }

  const obj = {
    p: c.prot || 160,
    c: c.carbs || 200,
    g: c.fat || 60,
    kcal: c.kcal_internas || 2000
  };
  const macros = calcMacrosDieta(c.comidas);

  // ─── BARRA DE MACROS ───
  let html = renderMacrosBarra(macros, obj);

  // ─── REBALANCEO IA ───
  html += `<div style="background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(17,17,19,.9));border:0.5px solid rgba(59,130,246,.25);border-radius:10px;padding:12px;margin-bottom:10px">
    <div style="font-size:11px;font-weight:700;color:var(--blg);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">⚡ ${tc('Rebalanceo IA')}</div>
    <div style="font-size:12px;color:var(--sv3);margin-bottom:8px">${tc('Describe el ajuste y la IA redistribuye todo el plan')}</div>
    <textarea id="coach_ia_ajuste" style="width:100%;padding:9px 11px;border:0.5px solid var(--br);border-radius:8px;background:var(--b);color:var(--tx);font-size:13px;font-family:'Inter',sans-serif;resize:none;min-height:60px;margin-bottom:8px;box-sizing:border-box"
      placeholder="${COACH_LANG==='en'?'E.g: Lower 200 kcal removing from carbs · Increase protein 20g split between lunch and dinner · Remove breakfast fats...':'Ej: Baja 200 kcal quitándolas de los carbos · Sube proteína 20g repartida en comida y cena · Elimina las grasas del desayuno...'}"></textarea>
    <button onclick="rebalancearConIA()" class="btn" style="width:100%;padding:10px;font-size:13px">⚡ ${tc('Rebalancear con IA')}</button>
  </div>`;

  // ─── AJUSTE AUTOMÁTICO ───
  html += `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:12px;margin-bottom:10px">
    <div style="font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">🔧 ${tc('Ajuste automático')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      <div>
        <div style="font-size:10px;color:var(--tx3);margin-bottom:4px">${tc('Macro a ajustar')}</div>
        <select id="auto_macro" style="width:100%;padding:8px;border:0.5px solid var(--br);border-radius:8px;background:var(--b);color:var(--tx);font-size:13px;font-family:'Inter',sans-serif">
          <option value="p">${tc('Proteína')}</option>
          <option value="c">${tc('Carbos')}</option>
          <option value="g">${COACH_LANG==='en'?'Fats':'Grasas'}</option>
          <option value="kcal">${tc('Calorías totales')}</option>
        </select>
      </div>
      <div>
        <div style="font-size:10px;color:var(--tx3);margin-bottom:4px">${tc('Cambio (+ subir / - bajar)')}</div>
        <input type="number" id="auto_delta" placeholder="${COACH_LANG==='en'?'E.g. -200 or +30':'Ej: -200 o +30'}" style="width:100%;padding:8px;border:0.5px solid var(--br);border-radius:8px;background:var(--b);color:var(--tx);font-size:13px;font-family:'Inter',sans-serif;box-sizing:border-box"/>
      </div>
    </div>
    <button onclick="rebalancearAutomatico()" class="btn btn-sm" style="width:100%;padding:9px;background:var(--s3);color:var(--sv2);border:0.5px solid var(--br)">🔧 ${tc('Aplicar ajuste')}</button>
  </div>`;

  // ─── EDICIÓN MANUAL POR COMIDA (opción A + B/C) ───
  html += `<div style="font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">${tc('Edición manual')}</div>`;

  const vars = c._planVariaciones || {};

  c.comidas.forEach((m, mi) => {
    const nombreEsc = (m.nombre||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');
    const emoji = ['☀️','🕐','🍽️','🌅','🌙','🥗'][mi]||'🍽️';
    const opcionesBC = vars[mi] || [];
    const hasBC = opcionesBC.length > 0;

    html += `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:10px 12px;margin-bottom:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blg);margin-bottom:10px">${emoji} ${m.nombre}</div>`;

    // ── Tabs A / B / C ──
    if(hasBC){
      html += `<div style="display:flex;gap:4px;margin-bottom:10px" id="edit_tabs_${mi}">`;
      html += `<button onclick="coachEditTab(${mi},'A',this)" data-tab="A"
        style="padding:4px 14px;border-radius:8px;border:1px solid var(--bl);background:rgba(37,99,235,.15);color:var(--blg);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">A</button>`;
      opcionesBC.forEach((op, oi) => {
        const letra = op.letra || String.fromCharCode(66+oi);
        html += `<button onclick="coachEditTab(${mi},'${letra}',this)" data-tab="${letra}"
          style="padding:4px 14px;border-radius:8px;border:0.5px solid var(--br);background:none;color:var(--tx3);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">${letra}</button>`;
      });
      html += `</div>`;
    }

    // ── Panel Opción A (alimentos en BD) ──
    html += `<div id="edit_panel_${mi}_A">`;
    (m.items||[]).forEach(it => {
      html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="flex:1;font-size:12px;color:var(--sv2)">${it.nombre}</span>
        <input type="number" value="${it.gramos||0}" min="1" data-alim-id="${it.id}"
          style="width:65px;padding:5px 7px;border:0.5px solid var(--br);border-radius:7px;background:var(--b);color:var(--blg);font-size:13px;font-weight:700;text-align:center;font-family:'Inter',sans-serif"
          onchange="dbEditG(${it.id}, this.value); actualizarBarraMacros()"/>
        <span style="font-size:11px;color:var(--tx3)">g</span>
        <button onclick="coachBorrarAlimento(${it.id}, this)" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:15px;flex-shrink:0">✕</button>
      </div>`;
    });
    html += `<button onclick="coachAnadirAlimento(${m.id}, '${nombreEsc}', this)"
      style="width:100%;padding:6px;border:0.5px dashed var(--br);border-radius:8px;background:none;color:var(--tx3);font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;margin-top:2px">${tc('+ Añadir alimento')}</button>
    </div>`;

    // ── Paneles opciones B, C (en _planVariaciones, en memoria) ──
    opcionesBC.forEach((op, oi) => {
      const letra = op.letra || String.fromCharCode(66+oi);
      html += `<div id="edit_panel_${mi}_${letra}" style="display:none">`;
      (op.alimentos||[]).forEach((a, ai) => {
        const nomEsc = (a.nombre||'').replace(/"/g,'&quot;');
        const gramos = a.gramos != null ? a.gramos : parseInt((a.cantidad||'').replace(/[^0-9]/g,''))||0;
        html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px" data-var-item="${mi}-${oi}-${ai}">
          <span style="flex:1;font-size:12px;color:var(--sv2)">${a.nombre}</span>
          <input type="number" value="${gramos}" min="1"
            style="width:65px;padding:5px 7px;border:0.5px solid var(--br);border-radius:7px;background:var(--b);color:var(--blg);font-size:13px;font-weight:700;text-align:center;font-family:'Inter',sans-serif"
            onchange="coachEditVarG(${mi},${oi},${ai},this.value)"/>
          <span style="font-size:11px;color:var(--tx3)">g</span>
          <button onclick="coachBorrarVarAlimento(${mi},${oi},${ai},this)" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:15px;flex-shrink:0">✕</button>
        </div>`;
      });
      html += `<button onclick="coachAnadirVarAlimento(${mi},${oi},this)"
        style="width:100%;padding:6px;border:0.5px dashed var(--br);border-radius:8px;background:none;color:var(--tx3);font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;margin-top:2px">${tc('+ Añadir alimento')}</button>
      </div>`;
    });

    html += `</div>`; // cierre tarjeta comida
  });

  html += `<button onclick="guardarDietaCoach()" class="btn" style="width:100%;padding:11px;background:var(--gn);margin-top:4px">✓ ${tc('Guardar y cerrar')}</button>`;
  edit.innerHTML = html;
}

// Cambiar tab activo A/B/C dentro de una comida del editor
function coachEditTab(mi, letra, btn){
  const tabs = document.querySelectorAll(`#edit_tabs_${mi} button`);
  tabs.forEach(b => {
    b.style.background='none'; b.style.color='var(--tx3)'; b.style.border='0.5px solid var(--br)';
  });
  btn.style.background='rgba(37,99,235,.15)'; btn.style.color='var(--blg)'; btn.style.border='1px solid var(--bl)';

  // Mostrar panel correspondiente, ocultar el resto
  const allPanels = document.querySelectorAll(`[id^="edit_panel_${mi}_"]`);
  allPanels.forEach(p => p.style.display='none');
  const target = document.getElementById(`edit_panel_${mi}_${letra}`);
  if(target) target.style.display='block';
}

// Editar gramos de un alimento en opción B/C (en memoria)
function coachEditVarG(mi, oi, ai, valor){
  const c = window._coachClienteActual;
  if(!c || !c._planVariaciones) return;
  const op = c._planVariaciones[mi]?.[oi];
  if(!op || !op.alimentos[ai]) return;
  const gramos = parseInt(valor)||0;
  op.alimentos[ai].gramos = gramos;
  op.alimentos[ai].cantidad = gramos+'g';
}

// Borrar alimento de opción B/C (en memoria)
function coachBorrarVarAlimento(mi, oi, ai, btn){
  const c = window._coachClienteActual;
  if(!c || !c._planVariaciones) return;
  const op = c._planVariaciones[mi]?.[oi];
  if(!op) return;
  op.alimentos.splice(ai, 1);
  btn.closest('[data-var-item]').remove();
  // Re-render el panel para actualizar índices
  const letra = op.letra || String.fromCharCode(66+oi);
  _reRenderVarPanel(mi, oi, letra);
}

// Añadir alimento a opción B/C (en memoria)
function coachAnadirVarAlimento(mi, oi, btn){
  const c = window._coachClienteActual;
  if(!c || !c._planVariaciones) return;
  const op = c._planVariaciones[mi]?.[oi];
  if(!op) return;
  const nombre = prompt(COACH_LANG==='en'?'Food name:':'Nombre del alimento:');
  if(!nombre) return;
  const gramos = parseInt(prompt(COACH_LANG==='en'?'Grams (raw):':'Gramos (en crudo):', '100')||'100');
  if(!gramos) return;
  op.alimentos.push({ nombre, gramos, cantidad: gramos+'g' });
  const letra = op.letra || String.fromCharCode(66+oi);
  _reRenderVarPanel(mi, oi, letra);
}

// Re-renderiza un panel B/C concreto sin tocar el resto del editor
function _reRenderVarPanel(mi, oi, letra){
  const c = window._coachClienteActual;
  if(!c || !c._planVariaciones) return;
  const op = c._planVariaciones[mi]?.[oi];
  if(!op) return;
  const panel = document.getElementById(`edit_panel_${mi}_${letra}`);
  if(!panel) return;

  let inner = '';
  (op.alimentos||[]).forEach((a, ai) => {
    const gramos = a.gramos != null ? a.gramos : parseInt((a.cantidad||'').replace(/[^0-9]/g,''))||0;
    inner += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px" data-var-item="${mi}-${oi}-${ai}">
      <span style="flex:1;font-size:12px;color:var(--sv2)">${a.nombre}</span>
      <input type="number" value="${gramos}" min="1"
        style="width:65px;padding:5px 7px;border:0.5px solid var(--br);border-radius:7px;background:var(--b);color:var(--blg);font-size:13px;font-weight:700;text-align:center;font-family:'Inter',sans-serif"
        onchange="coachEditVarG(${mi},${oi},${ai},this.value)"/>
      <span style="font-size:11px;color:var(--tx3)">g</span>
      <button onclick="coachBorrarVarAlimento(${mi},${oi},${ai},this)" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:15px;flex-shrink:0">✕</button>
    </div>`;
  });
  inner += `<button onclick="coachAnadirVarAlimento(${mi},${oi},this)"
    style="width:100%;padding:6px;border:0.5px dashed var(--br);border-radius:8px;background:none;color:var(--tx3);font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;margin-top:2px">${tc('+ Añadir alimento')}</button>`;
  panel.innerHTML = inner;
}

function actualizarBarraMacros(){
  const c = window._coachClienteActual;
  if(!c) return;
  // Leer gramos actuales desde los inputs del DOM
  document.querySelectorAll('[data-alim-id]').forEach(inp => {
    const id = parseInt(inp.dataset.alimentId || inp.dataset.alimentoId || inp.getAttribute('data-alim-id'));
    const gramos = parseInt(inp.value)||0;
    c.comidas.forEach(m => m.items.forEach(it => { if(it.id===id) it.gramos=gramos; }));
  });
  const obj = {p: c.prot||160, c: c.carbs||200, g: c.fat||60, kcal: c.kcal_internas||2000};
  const macros = calcMacrosDieta(c.comidas);
  const barraWrap = document.querySelector('#coach_dieta_edit > div:first-child');
  if(barraWrap) barraWrap.outerHTML = renderMacrosBarra(macros, obj);
}

async function rebalancearAutomatico(){
  const macro = document.getElementById('auto_macro')?.value;
  const delta = parseFloat(document.getElementById('auto_delta')?.value||'0');
  if(!delta){ alert(COACH_LANG==='en'?'Enter a change value (e.g. -200 or +30)':'Escribe un valor de cambio (ej: -200 o +30)'); return; }
  const c = window._coachClienteActual;
  if(!c || !c.comidas.length) return;

  const btn = event.target;
  btn.textContent='⏳ '+(COACH_LANG==='en'?'Calculating...':'Calculando...'); btn.disabled=true;

  // Calcular factor de ajuste proporcional
  // Para cada alimento, identificar si es del tipo de macro a ajustar
  // y escalar sus gramos proporcionalmente
  const macrosActuales = calcMacrosDieta(c.comidas);

  // Qué macro en gramos tenemos ahora
  const macroActual = macro==='kcal'
    ? macrosActuales.kcal
    : macrosActuales[macro];

  // Qué queremos tener
  const macroObjetivo = macroActual + delta;
  if(macroObjetivo <= 0){ alert(tc('El ajuste dejaría el plan sin ese macro. Reduce el cambio.')); btn.textContent='🔧 '+tc('Aplicar ajuste'); btn.disabled=false; return; }

  const factor = macroObjetivo / Math.max(macroActual, 1);

  // Filtrar alimentos del tipo correcto y escalarlos
  const promesas = [];
  c.comidas.forEach(m => {
    m.items.forEach(it => {
      const macroAlim = estimarMacrosPor100g(it.nombre);
      let esDeTipo = false;
      if(macro==='p') esDeTipo = macroAlim.p > 10; // proteínas
      if(macro==='c') esDeTipo = macroAlim.c > 15 && macroAlim.p < 15; // carbos
      if(macro==='g') esDeTipo = macroAlim.g > 10 && macroAlim.c < 10; // grasas
      if(macro==='kcal') esDeTipo = true; // todos

      if(esDeTipo){
        const nuevosGramos = Math.max(Math.round(it.gramos * factor), 10);
        const diff = nuevosGramos - it.gramos;
        if(Math.abs(diff) >= 2){ // solo si cambia al menos 2g
          it.gramos = nuevosGramos;
          promesas.push(api('/alimentos/'+it.id, {
            method:'PUT', body:JSON.stringify({gramos: nuevosGramos})
          }));
        }
      }
    });
  });

  await Promise.all(promesas);
  renderEditarDietaCoach(c);
  btn.textContent='✓ '+(COACH_LANG==='en'?'Applied':'Aplicado'); btn.disabled=false;
  setTimeout(()=>{ btn.textContent='🔧 '+tc('Aplicar ajuste'); }, 1500);
}

async function rebalancearConIA(){
  const instruccion = document.getElementById('coach_ia_ajuste')?.value?.trim();
  if(!instruccion){ alert(tc('Escribe qué ajuste quieres hacer')); return; }
  const c = window._coachClienteActual;
  if(!c || !c.comidas.length) return;

  const btn = event.target;
  btn.textContent='⏳ '+(COACH_LANG==='en'?'Rebalancing...':'Rebalanceando...'); btn.disabled=true;

  const planActual = c.comidas.map(m=>({
    nombre: m.nombre,
    alimentos: m.items.map(it=>({ id: it.id, nombre: it.nombre, gramos: it.gramos }))
  }));

  const prompt = `Eres un nutricionista deportivo experto. Tienes este plan de dieta de un cliente y debes ajustarlo según la instrucción del coach.

OBJETIVO DEL CLIENTE:
- Proteína: ${c.prot||160}g | Carbos: ${c.carbs||200}g | Grasas: ${c.fat||60}g | Kcal: ${c.kcal_internas||2000}

PLAN ACTUAL:
${JSON.stringify(planActual, null, 2)}

INSTRUCCIÓN DEL COACH:
${instruccion}

REGLAS:
1. Devuelve SOLO JSON válido, sin texto adicional.
2. Mantén los mismos alimentos y sus IDs. Solo cambia los gramos.
3. Aplica la instrucción del coach de forma inteligente y distribuida.
4. No bajes ningún alimento por debajo de 10g.
5. Mantén coherencia culinaria (no pongas 5g de arroz).
6. Responde con este formato exacto:
{"ajustes":[{"id":123,"gramos":150},{"id":456,"gramos":80}],"resumen":"Frase corta explicando qué se hizo"}`;

  try {
    const d = await api('/ia/chat', {
      method:'POST',
      body:JSON.stringify({
        messages:[{role:'user', content:prompt}],
        system:'Nutricionista experto. Responde SOLO con JSON válido y compacto. Sin texto extra.'
      })
    });

    let result;
    try {
      let clean = (d.reply||'').replace(/```json\s*/gi,'').replace(/```\s*/g,'');
      const s = clean.indexOf('{'), e = clean.lastIndexOf('}');
      if(s>=0 && e>s) clean = clean.slice(s, e+1);
      result = JSON.parse(clean.trim());
    } catch(e){
      throw new Error('La IA no devolvió JSON válido. Intenta de nuevo.');
    }

    if(!result.ajustes?.length) throw new Error('Sin ajustes en la respuesta.');

    // Aplicar cambios
    const promesas = result.ajustes.map(aj => {
      c.comidas.forEach(m => m.items.forEach(it => { if(it.id===aj.id) it.gramos=aj.gramos; }));
      return api('/alimentos/'+aj.id, {method:'PUT', body:JSON.stringify({gramos: aj.gramos})});
    });
    await Promise.all(promesas);

    // Mostrar resumen
    if(result.resumen){
      const ta = document.getElementById('coach_ia_ajuste');
      if(ta){ ta.value=''; ta.placeholder='✓ '+result.resumen; }
    }

    renderEditarDietaCoach(c);
    btn.textContent='✓ Rebalanceado';
    setTimeout(()=>{ btn.textContent='⚡ Rebalancear con IA'; btn.disabled=false; }, 2000);

  } catch(e){
    alert('Error: '+e.message);
    btn.textContent='⚡ Rebalancear con IA'; btn.disabled=false;
  }
}

async function coachBorrarAlimento(id, btn){
  btn.closest('div').remove();
  await api('/alimentos/'+id, {method:'DELETE'}).catch(()=>{});
  const c = window._coachClienteActual;
  if(c){ c.comidas.forEach(m=>{ m.items=m.items.filter(it=>it.id!==id); }); }
  actualizarBarraMacros();
}

async function coachAnadirAlimento(comidaId, nombreComida, btn){
  const nombre = prompt('Nombre del alimento:');
  if(!nombre) return;
  const gramos = parseInt(prompt('Gramos (en crudo):', '100') || '100');
  if(!gramos) return;
  await api('/comidas/'+comidaId+'/alimentos', {
    method:'POST', body:JSON.stringify({nombre, gramos})
  });
  const c = await api('/clientes/'+window._coachClienteId);
  window._coachClienteActual = c;
  renderEditarDietaCoach(c);
}

async function guardarDietaCoach(){
  const btn = document.querySelector('#coach_dieta_edit .btn[onclick="guardarDietaCoach()"]');
  if(btn){ btn.textContent='⏳ Guardando...'; btn.disabled=true; }

  const c = window._coachClienteActual;

  // Guardar opciones B/C en plan_meta si hubo cambios
  if(c && c._planVariaciones && Object.keys(c._planVariaciones).length){
    try {
      await api('/clientes/'+window._coachClienteId+'/plan-meta', {
        method:'POST',
        body: JSON.stringify({ variaciones: c._planVariaciones })
      });
    } catch(e){ console.warn('No se pudieron guardar opciones B/C:', e); }
  }

  const fresh = await api('/clientes/'+window._coachClienteId);
  window._coachClienteActual = fresh;
  const view = document.getElementById('coach_dieta_view');
  const edit = document.getElementById('coach_dieta_edit');
  const btnEditar = document.getElementById('btn_editar_dieta_coach');
  if(view) view.innerHTML = fresh.comidas.length ? fresh.comidas.map((m,mi)=>{
    const itemsHtml = (m.items||[]).map(it=>
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:0.5px solid rgba(39,39,42,.4)">'+
      '<span style="font-size:12px;color:var(--sv2)">'+it.nombre+'</span>'+
      '<span style="font-size:12px;font-weight:700;color:var(--blg)">'+(it.gramos||0)+'g</span>'+
      '</div>'
    ).join('');
    return '<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:10px 12px;margin-bottom:7px">'+
      '<div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:6px">'+(['☀️','🕐','🍽️','🌅','🌙','🥗'][mi]||'🍽️')+' '+m.nombre+'</div>'+
      itemsHtml+'</div>';
  }).join('')
    : '<div style="font-size:13px;color:var(--tx3)">Sin dieta asignada.</div>';
  if(edit){ edit.style.display='none'; edit.innerHTML=''; }
  if(view) view.style.display='block';
  if(btnEditar){ btnEditar.textContent='✏️ Editar'; }
}

async function borrarDietaCoach(){
  if(!confirm(tc('¿Borrar toda la dieta de este cliente?'))) return;
  const c = window._coachClienteActual;
  if(!c) return;
  for(const m of c.comidas) await api('/comidas/'+m.id, {method:'DELETE'});
  const view = document.getElementById('coach_dieta_view');
  if(view) view.innerHTML = '<div style="font-size:13px;color:var(--tx3)">Sin dieta asignada. Usa el Creador de Dieta IA.</div>';
  window._coachClienteActual.comidas = [];
}

function mb2(l,c,a,cal,tot){const p=Math.round((cal/(tot||1))*100)||0;return`<div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tx3);margin-bottom:3px;font-weight:500"><span>${l}</span><span style="color:var(--sv2)">${a}g·${p}%</span></div><div style="height:3px;background:var(--s3);border-radius:2px;overflow:hidden;margin-bottom:8px"><div style="width:${p}%;height:100%;background:${c};border-radius:2px"></div></div></div>`;}

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
        <div>⚖️ ${c.peso_actual?fmtPeso(c.peso_actual,COACH_LANG):'—'} · ${c.altura?fmtAltura(c.altura,COACH_LANG):'—'}</div>
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

// ═══ PROGRESO COACH ═══════════════════════════════════
function hProgreso(cl){
  return `
  <div id="sub_alertas_wrap"></div>
  <div id="adherencia_alertas_wrap"></div>
  <div class="sec">
    <div class="sec-hdr">📊 ${COACH_LANG==='en'?'Client dashboard':'Dashboard clientes'}
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm" onclick="enviarAvisosVencimiento()" style="font-size:11px">🔔 ${COACH_LANG==='en'?'Alerts':'Avisos'}</button>
        <button class="btn btn-sm" onclick="cargarDashboard()" style="font-size:11px;background:var(--bl2)">↺ ${COACH_LANG==='en'?'Refresh':'Actualizar'}</button>
      </div>
    </div>
    <!-- Resumen rápido -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
      <div id="dash_total" style="background:var(--s2);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:var(--sv)">${cl.length}</div>
        <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em">${tc('Clientes')}</div>
      </div>
      <div id="dash_activos" style="background:rgba(34,197,94,.08);border:0.5px solid rgba(34,197,94,.2);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:var(--gnb)" id="dash_num_activos">—</div>
        <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em">${tc('Activos')}</div>
      </div>
      <div id="dash_atencion" style="background:rgba(239,68,68,.06);border:0.5px solid rgba(239,68,68,.15);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:#fca5a5" id="dash_num_atencion">—</div>
        <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em">${tc('Atención')}</div>
      </div>
    </div>
    <!-- Tabla clientes con semáforo -->
    <table style="width:100%;border-collapse:collapse">
      <tr>${['',COACH_LANG==='en'?'Client':'Cliente',tc('Progreso'),tc('Última sesión'),COACH_LANG==='en'?'Wk':'Sem',COACH_LANG==='en'?'Subscription':'Suscripción'].map(h=>`<th style="text-align:left;padding:5px 8px;font-size:10px;font-weight:700;color:var(--tx3);border-bottom:0.5px solid var(--br);text-transform:uppercase;letter-spacing:.07em">${h}</th>`).join('')}</tr>
      ${cl.map((c,i)=>{const a=ac(i);return`<tr onclick="verCliente(${c.id})" style="cursor:pointer" onmouseover="this.style.background='rgba(255,255,255,.02)'" onmouseout="this.style.background='none'">
        <td style="padding:9px 6px;width:28px"><span id="semaforo_${c.id}" title="${tc('Cargando...')}" style="font-size:18px">⏳</span></td>
        <td style="padding:9px 8px"><div class="fl"><div class="av" style="width:26px;height:26px;font-size:10px;background:${a.bg};color:${a.tx};border-color:${a.br};margin-right:7px;overflow:hidden;padding:0">${c.foto_perfil?`<img src="${c.foto_perfil}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`:`<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">${ini(c.nombre)}</span>`}</div><div><div style="font-size:13px;font-weight:700;color:var(--sv)">${c.nombre}</div><div style="font-size:10px;color:var(--tx3)">${tc(c.objetivo)}</div></div></div></td>
        <td style="padding:9px 8px"><span id="progreso_${c.id}" style="font-size:11px;color:var(--tx3)">—</span></td>
        <td style="padding:9px 8px"><span id="ultima_ses_${c.id}" style="font-size:11px;color:var(--tx3)">—</span></td>
        <td style="padding:9px 8px"><span class="badge b-bl">${c.semanas}</span></td>
        <td style="padding:9px 8px"><span id="sub_estado_${c.id}" class="badge b-sv">...</span></td>
      </tr>`;}).join('')}
    </table>
  </div>`;
}
async function cargarProgresoSubs() {
  try {
    const alertas = await api('/suscripciones/alertas');
    const wrap = document.getElementById('sub_alertas_wrap');

    let html = '';

    if(alertas.proximas_a_vencer?.length) {
      html += `<div class="sec" style="margin-bottom:12px;border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.04)">
        <div class="sec-hdr" style="color:var(--amb)">⚠️ ${COACH_LANG==='en'?'Expiring soon':'Próximas a vencer'} (${alertas.proximas_a_vencer.length})</div>
        ${alertas.proximas_a_vencer.map(s=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:0.5px solid var(--br)">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--sv)">${s.nombre}</div>
              <div style="font-size:11px;color:var(--tx3)">${COACH_LANG==='en'?'Expires':'Vence'}: ${s.fecha_fin.split('-').reverse().join('/')}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge b-am">${s.dias_restantes}d</span>
              <button class="btn btn-sm" onclick="verCliente(${s.cliente_id})" style="font-size:11px">${tc('Ver cliente')}</button>
            </div>
          </div>`).join('')}
      </div>`;
    }

    if(alertas.vencidas?.length) {
      html += `<div class="sec" style="margin-bottom:12px;border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.04)">
        <div class="sec-hdr" style="color:#fca5a5">🔴 ${COACH_LANG==='en'?'Expired / Cancelled':'Vencidas / Canceladas'} (${alertas.vencidas.length})</div>
        ${alertas.vencidas.map(s=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:0.5px solid var(--br)">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--sv)">${s.nombre}</div>
              <div style="font-size:11px;color:#fca5a5">${COACH_LANG==='en'?'Expired':'Venció'}: ${s.fecha_fin.split('-').reverse().join('/')}</div>
            </div>
            <button class="btn btn-sm" onclick="verCliente(${s.cliente_id})" style="font-size:11px">${tc('Renovar')}</button>
          </div>`).join('')}
      </div>`;
    }

    if(wrap) wrap.innerHTML = html || '';

    // Cargar estado de suscripción por cliente en la tabla
    const subs = await api('/suscripciones');
    subs.forEach(s => {
      const el = document.getElementById('sub_estado_'+s.cliente_id);
      if(!el) return;
      if(s.vencida || s.estado==='cancelada') {
        el.className='badge'; el.style.background='rgba(239,68,68,.15)'; el.style.color='#fca5a5'; el.style.border='0.5px solid rgba(239,68,68,.3)';
        el.textContent = s.estado==='cancelada' ? (COACH_LANG==='en'?'Cancelled':'Cancelada') : (COACH_LANG==='en'?'Expired':'Vencida');
      } else if(s.proxima_a_vencer) {
        el.className='badge b-am'; el.textContent = s.dias_restantes+'d';
      } else {
        el.className='badge b-gn'; el.textContent = '✓ '+(COACH_LANG==='en'?'Active':'Activa');
      }
    });
    // Clientes sin suscripción
    document.querySelectorAll('[id^="sub_estado_"]').forEach(el => {
      if(el.textContent==='...') { el.className='badge b-sv'; el.textContent=tc('Sin sub'); }
    });

  } catch(e) { console.error('Error alertas:', e); }
}

// ═══ DASHBOARD COMPLETO — SEMÁFORO + ADHERENCIA + PROGRESO ═══════════
async function cargarDashboard() {
  await cargarProgresoSubs();

  const clientes = await api('/clientes').catch(()=>[]);
  let activos = 0, atencion = 0;

  // Procesar cada cliente en paralelo
  const promesas = clientes.map(async c => {
    try {
      // Endpoint ligero — solo fecha y estado de la última sesión (sin series ni logs)
      const ultima = await api('/clientes/'+c.id+'/ultima-sesion');

      const diasSinEntreno = ultima.dias_sin_entreno ?? 999;
      const ultimoEstado   = ultima.estado || 'completado';
      const tieneSesiones  = ultima.tiene_sesiones;

      // ── Semáforo ────────────────────────────────
      let emoji = '🟢', estado = tc('Activos');
      if(!tieneSesiones)                    { emoji = '⚪'; estado = tc('Sin sesiones'); }
      else if(diasSinEntreno > 10)          { emoji = '🔴'; estado = `${diasSinEntreno}d ${COACH_LANG==='en'?'no workout':'sin entreno'}`; atencion++; }
      else if(diasSinEntreno > 5)           { emoji = '🟡'; estado = `${diasSinEntreno}d ${COACH_LANG==='en'?'no workout':'sin entreno'}`; atencion++; }
      else if(ultimoEstado === 'incompleto'){ emoji = '🟠'; estado = COACH_LANG==='en'?'Incomplete':'Incompleto'; atencion++; }
      else { activos++; }

      // ── Última sesión texto ─────────────────────
      let ultimaTexto = tc('Sin sesiones');
      if(tieneSesiones) {
        const sufijo = ultimoEstado === 'incompleto' ? ' ⚠' : '';
        ultimaTexto = (diasSinEntreno === 0 ? (COACH_LANG==='en'?'Today':'Hoy') :
                       diasSinEntreno === 1 ? (COACH_LANG==='en'?'Yesterday':'Ayer') :
                       `${COACH_LANG==='en'?'Ago':'Hace'} ${diasSinEntreno}d`) + sufijo;
      }

      // ── Progreso peso ────────────────────────────
      let pesoTexto = '—';
      if(c.pesos?.length >= 2) {
        const diff = c.pesos[c.pesos.length-1].peso - c.pesos[c.pesos.length-2].peso;
        const signo = diff > 0 ? '▲' : diff < 0 ? '▼' : '=';
        const col = c.objetivo?.toLowerCase().includes('déficit') || c.objetivo?.toLowerCase().includes('pérdida')
          ? (diff < 0 ? '#86efac' : diff > 0 ? '#fca5a5' : 'var(--tx3)')
          : (diff > 0 ? '#86efac' : diff < 0 ? '#fca5a5' : 'var(--tx3)');
        pesoTexto = `<span style="color:${col}">${signo}${isImperial()?(Math.abs(diff)*2.20462).toFixed(1):Math.abs(diff).toFixed(1)}${pesoLabel()}</span>`;
      } else if(c.peso_actual) {
        pesoTexto = fmtPeso(c.peso_actual);
      }

      // ── Actualizar UI ────────────────────────────
      const semEl  = document.getElementById('semaforo_'+c.id);
      const progEl = document.getElementById('progreso_'+c.id);
      const sesEl  = document.getElementById('ultima_ses_'+c.id);
      if(semEl)  { semEl.textContent = emoji; semEl.title = estado; }
      if(progEl) progEl.innerHTML = pesoTexto;
      if(sesEl)  sesEl.textContent = ultimaTexto;

    } catch(e) {
      console.warn('Dashboard error cliente', c?.id, e?.message);
      const semEl = document.getElementById('semaforo_'+c?.id);
      if(semEl) { semEl.textContent = '❓'; semEl.title = 'Error cargando'; }
    }
  });

  await Promise.all(promesas);

  // Actualizar contadores
  const numA = document.getElementById('dash_num_activos');
  const numAt = document.getElementById('dash_num_atencion');
  if(numA) numA.textContent = activos;
  if(numAt) numAt.textContent = atencion;

  // Alertas de adherencia
  const adherWrap = document.getElementById('adherencia_alertas_wrap');
  if(adherWrap) {
    // Los clientes con 🔴 ya los calculamos — refrescar visualmente
    // (ya está en los semáforos de la tabla)
    adherWrap.innerHTML = '';
  }
}

// ── 1RM ESTIMADO (fórmula Epley) ──────────────────────────────────────
function calcular1RM(peso, reps) {
  if(reps === 1) return peso;
  return Math.round(peso * (1 + reps / 30) * 10) / 10;
}

// ── APLICAR TODOS LOS AJUSTES SUGERIDOS DE UNA VEZ ────────────────────
async function aplicarTodosAjustes(clienteId) {
  const btn = document.getElementById('btn_aplicar_ajustes') || event?.target;
  if(btn) { btn.textContent = '⏳ '+(COACH_LANG==='en'?'Applying...':'Aplicando...'); btn.disabled = true; }

  try {
    // Los inputs rev_kg_* ya tienen los pesos sugeridos desde el render de cargarRevisionSemanal.
    // Simplemente los leemos y guardamos en BD — exactamente igual que "Publicar",
    // pero sin notificar al cliente todavía.
    const ejercicios = recogerCambiosRevision();
    if (!ejercicios.length) throw new Error(COACH_LANG==='en'?'No exercises found in panel':'No hay ejercicios en el panel');

    // Guardar como borrador
    await api('/clientes/'+clienteId+'/borrador', {
      method: 'POST',
      body: JSON.stringify({ ejercicios })
    });

    // Contar cuántos tienen sugerencia real
    const conSugerencia = Object.values(window._revSugerencias||{}).filter(s=>s.haySugerencia).length;

    if(btn) {
      btn.textContent = `✓ ${conSugerencia} ${COACH_LANG==='en'?'applied — publish to notify client':'aplicados — publica para avisar al cliente'}`;
      btn.style.background  = 'rgba(34,197,94,.15)';
      btn.style.color       = 'var(--gnb)';
      btn.style.borderColor = 'rgba(34,197,94,.3)';
      btn.disabled = false;
    }

    const estado = document.getElementById('rev_estado');
    if(estado) estado.textContent = COACH_LANG==='en'?'· Draft saved — pending publish':'· Borrador guardado — pendiente de publicar';

  } catch(e) {
    if(btn) { btn.textContent = '⚡ Error: '+e.message; btn.disabled = false; }
  }
}

// ── SECCIÓN 1RM + PRs + TONELAJE para el tab Progreso del cliente ──────
async function cargarMetricasAvanzadas(clienteId) {
  const wrap = document.getElementById('metricas_avanzadas_wrap');
  if(!wrap) return;

  try {
    const [sesiones, pesoRecs] = await Promise.all([
      api('/clientes/'+clienteId+'/sesiones'),
      api('/clientes/'+clienteId+'/pesos').catch(()=>[])
    ]);
    if(!sesiones.length) { wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3)">${tc('Sin sesiones aún.')}</div>`; return; }

    const c = window._coachClienteActual;
    const pesos = c?.pesos || pesoRecs || [];

    // PRs por ejercicio (mejor 1RM estimado)
    const prs = {};
    const tonelajePorSemana = {};
    const pesos1RMhistorial = {}; // nombre -> [{semana, rm1}]

    sesiones.forEach(s => {
      const semana = s.fecha.substring(0,7); // YYYY-MM
      if(!tonelajePorSemana[semana]) tonelajePorSemana[semana] = 0;

      s.series.forEach(sr => {
        const nombre = sr.ejercicio_nombre;
        const peso = sr.peso_real || 0;
        const reps = sr.reps_real || 0;
        const rm1 = calcular1RM(peso, reps);
        tonelajePorSemana[semana] += peso * reps;

        if(!prs[nombre] || rm1 > prs[nombre].rm1) {
          prs[nombre] = { rm1, peso, reps, fecha: s.fecha };
        }
        // Track 1RM evolution per exercise
        if(!pesos1RMhistorial[nombre]) pesos1RMhistorial[nombre] = {};
        if(!pesos1RMhistorial[nombre][semana] || rm1 > pesos1RMhistorial[nombre][semana]) {
          pesos1RMhistorial[nombre][semana] = rm1;
        }
      });
    });

    const principales = c ? c.dias.flatMap(d => d.ejercicios.filter(e=>e.es_principal).map(e=>e.nombre)) : [];
    const prsFiltrados = Object.entries(prs)
      .sort((a,b) => principales.includes(b[0]) - principales.includes(a[0]))
      .slice(0,6);

    const semanas = Object.entries(tonelajePorSemana)
      .sort((a,b) => a[0].localeCompare(b[0]))
      .slice(-8);

    // Helper: draw simple SVG line chart
    function svgLineChart(data, color='#3b82f6', height=80, showDots=true) {
      if(data.length < 2) return '';
      const w = 280, h = height, pad = {t:10,r:10,b:25,l:40};
      const vals = data.map(d=>d.y);
      const minV = Math.min(...vals), maxV = Math.max(...vals);
      const range = maxV - minV || 1;
      const xs = data.map((_,i) => pad.l + (i/(data.length-1))*(w-pad.l-pad.r));
      const ys = data.map(d => pad.t + (1-(d.y-minV)/range)*(h-pad.t-pad.b));
      const path = xs.map((x,i) => (i===0?'M':'L')+x.toFixed(1)+','+ys[i].toFixed(1)).join(' ');
      const area = xs.map((x,i)=>(i===0?'M':'L')+x.toFixed(1)+','+ys[i].toFixed(1)).join(' ')
        +` L${xs[xs.length-1].toFixed(1)},${(h-pad.b).toFixed(1)} L${xs[0].toFixed(1)},${(h-pad.b).toFixed(1)} Z`;
      const dots = showDots ? xs.map((x,i)=>`<circle cx="${x.toFixed(1)}" cy="${ys[i].toFixed(1)}" r="3" fill="${color}" stroke="var(--b)" stroke-width="1.5"/>`).join('') : '';
      const labels = data.map((d,i)=>{
        if(i===0||i===data.length-1||data.length<=4)
          return `<text x="${xs[i].toFixed(1)}" y="${(h-pad.b+14).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--tx3)">${d.label}</text>`;
        return '';
      }).join('');
      const yLabels = [minV, maxV].map((v,i)=>`<text x="${pad.l-4}" y="${ys[i===0?ys.length-1:0].toFixed(1)}" text-anchor="end" font-size="9" fill="var(--tx3)" dominant-baseline="middle">${Math.round(v)}</text>`).join('');
      return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="overflow:visible;display:block">
        <defs><linearGradient id="g${color.replace('#','')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".25"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
        <path d="${area}" fill="url(#g${color.replace('#','')})" />
        <path d="${path}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}${labels}${yLabels}
      </svg>`;
    }

    let html = '';

    // ── GRÁFICA PESO CORPORAL ─────────────────────────────────────
    if(pesos.length >= 2) {
      const pesoData = pesos.map((p,i)=>({
        y: p.peso,
        label: COACH_LANG==='en'?'Wk '+(i+1):'Sem '+(i+1)
      }));
      const pesoInicio = pesos[0].peso;
      const pesoActual = pesos[pesos.length-1].peso;
      const diff = (pesoActual-pesoInicio).toFixed(1);
      const diffColor = diff > 0 ? 'var(--gnb)' : diff < 0 ? '#fca5a5' : 'var(--tx3)';
      html += `<div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">⚖️ ${COACH_LANG==='en'?'Body weight evolution':'Evolución de peso corporal'}
          <span style="font-size:11px;font-weight:600;color:${diffColor};text-transform:none;letter-spacing:0">${diff>0?'+':''}${diff}kg</span>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:10px">
          <div><div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'Start':'Inicio'}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${pesoInicio}kg</div></div>
          <div><div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'Current':'Actual'}</div><div style="font-size:16px;font-weight:700;color:var(--blg)">${pesoActual}kg</div></div>
          <div><div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'Records':'Registros'}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${pesos.length}</div></div>
        </div>
        <div style="margin:0 -4px">${svgLineChart(pesoData,'#3b82f6',90)}</div>
      </div>`;
    }

    // ── GRÁFICAS 1RM EJERCICIOS PRINCIPALES ──────────────────────
    const principalesConHistorial = principales.filter(n => pesos1RMhistorial[n] && Object.keys(pesos1RMhistorial[n]).length >= 2);
    if(principalesConHistorial.length) {
      html += `<div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">💪 ${COACH_LANG==='en'?'Main exercises — 1RM evolution':'Ejercicios principales — evolución 1RM'}</div>`;
      principalesConHistorial.slice(0,4).forEach(nombre => {
        const hist = Object.entries(pesos1RMhistorial[nombre]).sort((a,b)=>a[0].localeCompare(b[0]));
        const data = hist.map(([sem,rm1],i)=>({y:rm1, label:sem.substring(5)}));
        const inicio = hist[0][1], actual = hist[hist.length-1][1];
        const mejora = (actual-inicio).toFixed(1);
        html += `<div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="font-size:12px;font-weight:700;color:var(--sv)">⭐ ${nombre}</div>
            <div style="text-align:right">
              <span style="font-size:14px;font-weight:800;color:var(--gnb)">${actual}kg</span>
              <span style="font-size:10px;color:${mejora>=0?'var(--gnb)':'#fca5a5'};margin-left:6px">${mejora>=0?'+':''}${mejora}kg</span>
            </div>
          </div>
          <div style="margin:0 -4px">${svgLineChart(data,'#a78bfa',70,hist.length<=6)}</div>
        </div>`;
      });
      html += `</div>`;
    }

    // ── PRs TABLA ─────────────────────────────────────────────────
    if(prsFiltrados.length) {
      html += `<div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">${tc('🏆 PRs & 1RM estimado')}</div>
        ${prsFiltrados.map(([nombre, datos]) => {
          const esPrincipal = principales.includes(nombre);
          const fechaStr = new Date(datos.fecha).toLocaleDateString(COACH_LANG==='en'?'en-GB':'es-ES',{day:'numeric',month:'short'});
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:0.5px solid var(--br)">
            <div>
              <div style="font-size:12px;font-weight:700;color:var(--sv)">${esPrincipal?'⭐ ':''}${nombre}</div>
              <div style="font-size:10px;color:var(--tx3)">${datos.peso}kg×${datos.reps} · ${fechaStr}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:14px;font-weight:700;color:var(--gnb)">${datos.rm1}kg</div>
              <div style="font-size:9px;color:var(--tx3)">${tc('1RM est.')}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    }

    // ── GRÁFICA VOLUMEN SEMANAL ───────────────────────────────────
    if(semanas.length >= 2) {
      const maxTon = Math.max(...semanas.map(s=>s[1]));
      const tonData = semanas.map(([sem,ton])=>({y:ton/1000, label:sem.substring(5)}));
      const totalTon = semanas.reduce((a,s)=>a+s[1],0);
      html += `<div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">${tc('⚡ Tonelaje semanal')}
          <span style="font-size:10px;color:var(--tx3);text-transform:none;letter-spacing:0;font-weight:400">${COACH_LANG==='en'?'total':'total'}: ${(totalTon/1000).toFixed(1)}t</span>
        </div>
        <div style="margin:0 -4px;margin-bottom:8px">${svgLineChart(tonData,'#f59e0b',80)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${semanas.map(([fecha,ton])=>{
            const pct = Math.round(ton/maxTon*100);
            const col = pct>80?'var(--gnb)':pct>50?'var(--amb)':'#fca5a5';
            return `<div style="flex:1;min-width:60px;background:var(--s3);border-radius:8px;padding:6px;text-align:center">
              <div style="font-size:13px;font-weight:700;color:${col}">${(ton/1000).toFixed(1)}t</div>
              <div style="font-size:9px;color:var(--tx3)">${fecha.substring(5)}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }

    // ── COMPARATIVA SEMANA vs ANTERIOR ────────────────────────────
    const ahora = Date.now();
    const semActual = sesiones.filter(s => ahora - new Date(s.fecha).getTime() < 7*86400000 && s.estado==='completado');
    const semAnterior = sesiones.filter(s => { const ms=ahora-new Date(s.fecha).getTime(); return ms>=7*86400000&&ms<14*86400000&&s.estado==='completado'; });
    const calcStats = sems => { let ton=0,series=0,sesCount=sems.length; sems.forEach(s=>{ s.series.forEach(sr=>{ ton+=(sr.peso_real||0)*(sr.reps_real||0); series++; }); }); return {ton:Math.round(ton),series,sesCount}; };
    const stA=calcStats(semActual), stB=calcStats(semAnterior);
    const diff=(a,b)=>{ if(!b) return {txt:'—',col:'var(--tx3)',icon:''}; const pct=Math.round((a-b)/b*100); if(pct>0) return {txt:'+'+pct+'%',col:'var(--gnb)',icon:'↑'}; if(pct<0) return {txt:pct+'%',col:'#fca5a5',icon:'↓'}; return {txt:'=',col:'var(--tx3)',icon:''}; };
    html += `<div class="sec" style="margin-bottom:12px">
      <div class="sec-hdr">${tc('📊 Esta semana vs anterior')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        ${[[COACH_LANG==='en'?'Sessions':'Sesiones',stA.sesCount,stB.sesCount],[COACH_LANG==='en'?'Sets':'Series',stA.series,stB.series],[COACH_LANG==='en'?'Tonnage':'Tonelaje',stA.ton+'kg',stB.ton?stB.ton+'kg':null]].map(([lbl,actual,anterior])=>{ const d=diff(typeof actual==='number'?actual:parseInt(actual),typeof anterior==='number'?anterior:(anterior?parseInt(anterior):0)); return `<div style="background:var(--s3);border-radius:10px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:800;color:var(--sv)">${actual}</div><div style="font-size:9px;color:var(--tx3);text-transform:uppercase;margin:2px 0">${lbl}</div><div style="font-size:11px;font-weight:700;color:${d.col}">${d.icon} ${d.txt}</div></div>`; }).join('')}
      </div>
    </div>`;

    // ── CHECK-INS ─────────────────────────────────────────────────
    try {
      const checkins = await api('/clientes/'+clienteId+'/checkins');
      if(checkins?.length) {
        const ultimo = checkins[0];
        const bar = v => '█'.repeat(Math.min(5,v||0))+'░'.repeat(5-Math.min(5,v||0));
        html += `<div class="sec" style="margin-bottom:12px">
          <div class="sec-hdr">${tc('📋 Último check-in del cliente')}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
            <div style="background:var(--s3);border-radius:10px;padding:10px"><div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${tc('😴 Sueño')}</div><div style="font-size:13px;color:var(--sv);letter-spacing:2px">${bar(ultimo.sueno)}</div><div style="font-size:18px;font-weight:800;color:var(--sv)">${ultimo.sueno||'—'}/5</div></div>
            <div style="background:var(--s3);border-radius:10px;padding:10px"><div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${tc('⚡ Energía')}</div><div style="font-size:13px;color:var(--sv);letter-spacing:2px">${bar(ultimo.energia)}</div><div style="font-size:18px;font-weight:800;color:var(--sv)">${ultimo.energia||'—'}/5</div></div>
          </div>
          ${checkins.length>1?`<div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'Last':'Últimas'} ${checkins.length} ${COACH_LANG==='en'?'weeks · Avg sleep:':'semanas · Sueño medio:'} ${(checkins.reduce((a,c)=>a+(c.sueno||0),0)/checkins.length).toFixed(1)} · ${COACH_LANG==='en'?'Avg energy:':'Energía media:'} ${(checkins.reduce((a,c)=>a+(c.energia||0),0)/checkins.length).toFixed(1)}</div>`:''}
        </div>`;
      }
    } catch(e){}

    wrap.innerHTML = html || `<div style="font-size:13px;color:var(--tx3)">${tc('Sin datos suficientes.')}</div>`;
  } catch(e) { wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3)">${tc('Error cargando métricas.')}</div>`; }
}

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

    // Calcular días restantes en frontend desde fecha_fin (no fiarse del backend)
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const fin = s.fecha_fin ? new Date(s.fecha_fin) : null;
    if(fin) fin.setHours(0,0,0,0);
    const diasRestantes = fin ? Math.max(0, Math.ceil((fin - hoy) / (1000*60*60*24))) : 0;
    const vencida = fin ? fin < hoy : true;
    const proximaAVencer = !vencida && diasRestantes <= 5;
    s.dias_restantes = diasRestantes;
    s.vencida = vencida;
    s.proxima_a_vencer = proximaAVencer;

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



// ═══ IA COACH ═════════════════════════════════════════
let _iaSelectedClienteId = null;
let _iaSelectedClienteNombre = null;

function hIACoach(){
  // Construir opciones del selector de clientes
  const clientes = window._clientesCache || [];
  const optsHtml = clientes.map(c =>
    `<option value="${c.id}" data-nombre="${c.nombre}">${c.nombre}</option>`
  ).join('');

  return `<div class="ia-chip" style="margin-bottom:12px">
  <div class="ia-chip-title">${COACH_LANG==='en'?'Private AI coach assistant':'IA privada del coach'}</div>
  ${COACH_LANG==='en'?'Generate full routines and diets, analyse progress or request specific adjustments for any client.':'Genera rutinas y dietas completas, analiza progreso o pide ajustes específicos para cualquier cliente.'}
</div>

<div class="sec" style="display:flex;flex-direction:column;height:520px">
  <!-- Selector de cliente -->
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
    <span style="font-size:11px;color:var(--tx3);white-space:nowrap">${COACH_LANG==='en'?'Client context:':'Contexto cliente:'}</span>
    <select id="ia_cliente_sel" onchange="iaSetCliente(this)"
      style="flex:1;padding:7px 10px;border:0.5px solid var(--br);border-radius:8px;background:var(--s2);color:var(--sv);font-size:12px;font-family:inherit">
      <option value="">${COACH_LANG==='en'?'— General (no client) —':'— General (sin cliente) —'}</option>
      ${optsHtml}
    </select>
    <div id="ia_cliente_badge" style="display:none;padding:3px 8px;border-radius:6px;background:rgba(37,99,235,.15);border:0.5px solid rgba(59,130,246,.3);font-size:11px;color:#93c5fd;white-space:nowrap">📂 ${COACH_LANG==='en'?'loaded':'cargado'}</div>
  </div>

  <div class="chat-msgs" id="iaMsgs" style="flex:1;background:var(--b);border:0.5px solid var(--br);border-radius:10px;padding:11px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px">
    <div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>${tc('Hola coach, listo. Puedo generar rutinas y dietas completas, analizar progreso y sugerir ajustes. ¿Qué necesitas?')}</div>
  </div>
  <div class="typing" id="iaTyping">${COACH_LANG==='en'?'processing...':'procesando...'}</div>
  <div style="display:flex;gap:8px">
    <input class="inp" id="iaIn" placeholder="${COACH_LANG==='en'?'E.g. review Steven\'s routine...':'Ej: revisa la rutina de Steven...'}" style="flex:1;margin-bottom:0" onkeydown="if(event.key==='Enter')sendIA()"/>
    <button class="btn" onclick="sendIA()">${tc('Enviar')}</button>
  </div>
</div>`;}

function iaSetCliente(sel) {
  const id = sel.value;
  const nombre = sel.options[sel.selectedIndex]?.getAttribute('data-nombre') || '';
  _iaSelectedClienteId = id || null;
  _iaSelectedClienteNombre = nombre || null;
  const badge = document.getElementById('ia_cliente_badge');
  if (badge) {
    if (id) {
      badge.style.display = 'inline-block';
      badge.textContent = `📂 ${nombre} ${COACH_LANG==='en'?'loaded':'cargado'}`;
    } else {
      badge.style.display = 'none';
    }
  }
  // Resetear historial al cambiar de cliente
  iaH = [{role:'assistant', content: tc('Hola coach, listo. Puedo generar rutinas y dietas completas, analizar progreso y sugerir ajustes. ¿Qué necesitas?')}];
  const msgs = document.getElementById('iaMsgs');
  if (msgs) msgs.innerHTML = `<div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>${iaH[0].content}</div>`;
  if (id) {
    // Mensaje de confirmación
    const confirmMsg = COACH_LANG==='en'
      ? `Client context loaded: ${nombre}. I now have access to their full routine, diet, session history and check-ins. What do you want to know?`
      : `Contexto del cliente cargado: ${nombre}. Ahora tengo acceso a su rutina completa, dieta, historial de sesiones y check-ins. ¿Qué quieres saber?`;
    iaH.push({role:'assistant', content: confirmMsg});
    if (msgs) msgs.innerHTML += `<div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>${confirmMsg}</div>`;
  }
}

async function sendIA(){
  const inp=document.getElementById('iaIn'), msg=inp.value.trim();
  if(!msg) return;
  inp.value='';
  const msgs=document.getElementById('iaMsgs');
  msgs.innerHTML+=`<div class="msg msg-u">${msg}</div>`;
  msgs.scrollTop=msgs.scrollHeight;
  iaH.push({role:'user', content:msg});
  document.getElementById('iaTyping').style.display='block';

  try {
    const body = {
      messages: iaH,
      lang: COACH_LANG || 'es'
    };
    // Pasar cliente seleccionado en el dropdown
    if (_iaSelectedClienteId) {
      body.clienteId = _iaSelectedClienteId;
    } else {
      // Intentar detectar nombre de cliente en el mensaje
      body.clienteNombre = msg;
    }

    const d = await api('/ia/coach-chat', {method:'POST', body:JSON.stringify(body)});

    // Si la IA resolvió un cliente automáticamente, actualizar el selector
    if (d.clienteCargado && !_iaSelectedClienteId) {
      const sel = document.getElementById('ia_cliente_sel');
      if (sel) {
        const opt = [...sel.options].find(o => String(o.value) === String(d.clienteCargado.id));
        if (opt) {
          sel.value = d.clienteCargado.id;
          iaSetCliente(sel);
          // No duplicar el mensaje de confirmación — ya viene en la respuesta
          iaH = iaH.filter(m => m.role !== 'assistant' || !m.content.includes('Contexto del cliente cargado'));
        }
      }
    }

    iaH.push({role:'assistant', content:d.reply});
    document.getElementById('iaTyping').style.display='none';
    msgs.innerHTML+=`<div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>${d.reply}</div>`;
    msgs.scrollTop=msgs.scrollHeight;

  } catch(e) {
    document.getElementById('iaTyping').style.display='none';
    const errMsg = COACH_LANG==='en' ? 'Error. Try again.' : 'Error. Inténtalo de nuevo.';
    msgs.innerHTML+=`<div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>${errMsg}</div>`;
  }
}

// ═══ CLIENTE ══════════════════════════════════════════
function klNav(s,btn){
  klTab=s;document.querySelectorAll('.bnav-bar .bni').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  renderKL();
}
function renderKL(){
  const el=document.getElementById('klContent');
  if(!CD){el.innerHTML='<div style="padding:40px;text-align:center;color:var(--tx3)">Cargando...</div>';return;}
  if(klTab==='entreno'){
    // Si había un entreno en curso, restaurarlo directamente
    if(vistaActual === 'entreno' && activeDia !== null){
      const klEl = document.getElementById('klContent');
      restaurarEstadoEntreno();
      klEl.innerHTML = hEntreno();
      setTimeout(()=>{ applyLang(klEl); }, 50);
      return;
    }
    // Load today's sessions from server first, then render — ensures state is correct across devices
    const hoy = new Date().toISOString().split('T')[0];
    Promise.all([
      api('/clientes/'+CD.id+'/semana-estado'),
      api('/clientes/'+CD.id+'/sesiones').catch(()=>[])
    ]).then(([estado, sesiones])=>{
      // Sync server sessions to localStorage so getSesionEstado() works correctly
      sesiones.forEach(s => {
        const fechaSesion = (s.fecha||'').split('T')[0];
        if(fechaSesion === hoy && s.dia_nombre && s.estado) {
          localStorage.setItem('wm_sesion_'+CD.id+'_'+s.dia_nombre.replace(/\s/g,'_')+'_'+hoy, s.estado);
        }
      });
      if(estado.tiene_borrador){
        el.innerHTML = hProximaSemanaEnPreparacion();
      } else {
        el.innerHTML = hSeleccionDia();
      }
      if(LANG!=='es') setTimeout(()=>applyLang(el), 30);
    }).catch(()=>{ el.innerHTML = hSeleccionDia(); if(LANG!=='es') applyLang(el); });
    // Traducir nav bar siempre
    if(LANG!=='es') applyLang(document.querySelector('#sCliente .bnav-bar'));
    return;
  }
  else if(klTab==='dieta')el.innerHTML=hDieta();
  else if(klTab==='asistente'){el.innerHTML=hAsistente();setTimeout(_chatAfterRender,30);}
  else if(klTab==='progreso'){el.innerHTML=hProgreso2();setTimeout(()=>{cargarGraficasCliente();initPesoSection();},50);setTimeout(renderFotosProgreso,200);}
  else if(klTab==='logros')el.innerHTML=hBadgesCliente();
  else if(klTab==='perfil')el.innerHTML=hPerfil();
  // Aplicar traducción + nav bar
  if(LANG!=='es') {
    setTimeout(()=>{
      applyLang(el);
      applyLang(document.querySelector('#sCliente .bnav-bar'));
    }, 80);
  }
}
function hDieta(){
  const esVeg = CD.dieta_tipo==='Vegano'||CD.dieta_tipo==='Vegetariano';
  const acc = esVeg ? '#22c55e' : '#3b82f6';
  const accLight = esVeg ? '#86efac' : '#93c5fd';
  const accDark = esVeg ? '#166534' : '#1e3a5f';
  const accBg = esVeg ? 'rgba(34,197,94,.12)' : 'rgba(37,99,235,.12)';

  if(!CD.comidas.length) return `
    <div style="padding:60px 20px;text-align:center;color:var(--tx3)">
      <div style="font-size:48px;margin-bottom:14px">🥗</div>
      <div style="font-size:16px;font-weight:600;color:var(--sv2)">${t('Tu coach está preparando tu dieta')}</div>
    </div>`;

  const mealNames = ['BREAKFAST','MAIN MEAL','SNACK / POST-WORKOUT','DINNER','MEAL 5','MEAL 6'];
  const mealNamesES = ['DESAYUNO','ALMUERZO','MERIENDA','CENA','COMIDA 5','COMIDA 6'];

  // Usar traducción cacheada si existe
  const dietaTransKey = 'dieta_trans_'+CD.id;
  const rawCache = LANG==='en' ? (() => { try { return JSON.parse(localStorage.getItem(dietaTransKey)||'null'); } catch(e){ return null; } })() : null;
  // Soporte para formato antiguo (solo array) y nuevo (objeto con foods/vars/sups/ther)
  const cachedTrans = rawCache && typeof rawCache === 'object' && !Array.isArray(rawCache) && rawCache.foods ? rawCache : (rawCache ? { foods: rawCache } : null);

  const comidas = CD.comidas.map((m,i)=>({
    numero: i+1,
    nombre: LANG==='en' ? (mealNames[i]||'MEAL '+(i+1)) : (m.nombre.replace(/^\d+\.\s*/,'').toUpperCase() || mealNamesES[i]),
    nombreEN: mealNames[i] || 'MEAL '+(i+1),
    alimentos: m.items.map((it,j)=>({
      nombre: (cachedTrans?.foods?.[i]?.[j]) ? cachedTrans.foods[i][j] : it.nombre,
      cantidad: it.gramos+'g'
    }))
  }));

  const frase = (cachedTrans?.frase) || CD._planFrase || 'Consistency fuels results. Discipline builds freedom.';

  // Each meal card — v2: swipe A/B/C siempre visible + botón receta
  const comidasHtml = comidas.map((m,mi)=>{
    const vars = CD._planVariaciones?.[mi] || [];
    const hasVars = vars.length > 0;

    // Todas las opciones: A (principal) + B, C...
    const todasOpciones = [
      { letra:'A', nombre: LANG==='en'?'Main option':'Opción principal', alimentos: m.alimentos },
      ...vars.map((v,vi)=>({
        letra: v.letra || String.fromCharCode(66+vi),
        nombre: (cachedTrans?.vars?.[mi]?.[vi]) || v.nombre || '',
        alimentos: (v.alimentos||[]).map(a=>({
          nombre: a.nombre,
          cantidad: a.cantidad ? a.cantidad : (a.gramos != null ? a.gramos+'g' : '')
        }))
      }))
    ];

    const swipeId = 'swipe_'+mi;
    const dotId   = 'dots_'+mi;

    // Cards de opciones (siempre, incluso si solo hay A)
    const optCards = todasOpciones.map((op, oi)=>`
      <div class="diet-opt-card" style="min-width:100%;box-sizing:border-box;padding:0 2px;scroll-snap-align:start;flex-shrink:0">
        ${hasVars ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
          <span style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:${acc};line-height:1">${op.letra}</span>
          <span style="font-size:11px;color:rgba(255,255,255,.4)">${op.nombre}</span>
        </div>` : ''}
        <div id="cl_meal_${mi}_${oi}">
          ${op.alimentos.map(a=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,.05)">
            <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
              <div style="width:4px;height:4px;border-radius:50%;background:${acc};flex-shrink:0"></div>
              <div style="font-size:12px;color:rgba(255,255,255,.8);line-height:1.4">${a.nombre}</div>
            </div>
            <div style="font-size:13px;font-weight:700;color:${accLight};margin-left:8px;white-space:nowrap;font-family:'Bebas Neue',sans-serif">${a.cantidad}</div>
          </div>`).join('')}
        </div>
      </div>`).join('');

    // Dots de navegación (solo si hay >1 opción)
    const dots = hasVars ? `<div id="${dotId}" style="display:flex;justify-content:center;gap:6px;margin-top:10px">
      ${todasOpciones.map((_,oi)=>`<div onclick="_dietaSwipeTo(${mi},${oi})" style="width:${oi===0?'18':'7'}px;height:7px;border-radius:4px;background:${oi===0?acc:'rgba(255,255,255,.2)'};cursor:pointer;transition:.3s" data-dot="${oi}"></div>`).join('')}
    </div>` : '';

    return `
    <div style="border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;margin-bottom:10px;background:rgba(255,255,255,.02)">
      <!-- Header comida -->
      <div style="display:flex;background:${accDark};padding:10px 12px;align-items:center;gap:10px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:${accLight};line-height:1;flex-shrink:0">${m.numero}</div>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:#fff;letter-spacing:.1em">${m.nombre}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.4)">${m.alimentos.length} ${t('alimentos')}${hasVars?' · '+todasOpciones.length+' opciones':''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          ${m.alimentos.some(a=>a.nombre.toLowerCase().match(/pollo|salmón|salmon|huevo|whey|pavo|carne|proteína/))
            ? `<div style="font-size:9px;font-weight:700;color:${accLight};border:0.5px solid ${acc};padding:2px 6px;border-radius:4px;letter-spacing:.06em;background:${accBg}">${LANG==='en'?'PROTEIN':'PROTEÍNA'}</div>`
            : ''}
          <button onclick="_abrirReceta(${mi}, _getOpcionActiva(${mi}))" style="width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.08);border:0.5px solid rgba(255,255,255,.15);color:rgba(255,255,255,.7);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-tap-highlight-color:transparent" title="${LANG==='en'?'See recipe':'Ver receta'}">👨‍🍳</button>
        </div>
      </div>
      <!-- Swipe container -->
      <div style="padding:10px 12px 6px">
        <div id="${swipeId}" style="display:flex;overflow-x:scroll;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scroll-behavior:smooth;scrollbar-width:none;-ms-overflow-style:none" data-mi="${mi}" data-total="${todasOpciones.length}">
          ${optCards}
        </div>
        ${dots}
      </div>
    </div>`;
  }).join('');

  return `<div id="dieta_view" style="background:#06080e;min-height:100vh;padding-bottom:100px">

    <!-- HERO HEADER -->
    <div style="position:relative;background:linear-gradient(135deg,#06080e 0%,#0d1520 50%,#06080e 100%);overflow:hidden;display:flex;align-items:stretch;min-height:160px;border-bottom:1px solid ${acc}40">
      <!-- Lobo musculoso decorativo derecha -->
      <img src="${WOLF_DIETA_SRC}"
        style="position:absolute;right:0;top:0;width:55%;height:100%;object-fit:cover;object-position:center top;mix-blend-mode:screen;opacity:.95;mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.3) 20%,rgba(0,0,0,1) 60%);-webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.3) 20%,rgba(0,0,0,1) 60%);pointer-events:none"/>
      <!-- Logo izquierda -->
      <div style="position:relative;z-index:2;padding:16px 16px 0 16px;width:56%;display:flex;flex-direction:column;justify-content:center">
        <img src="/logo.png" style="width:100%;max-width:180px;display:block;mix-blend-mode:screen;filter:brightness(1.1)"/>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:11px;color:${accLight};letter-spacing:.15em;margin-top:6px;opacity:.8">${LANG==='en'?'NUTRITION PLAN':'PLAN DE NUTRICIÓN'}</div>
      </div>
    </div>
    <!-- MEALS LIST -->
    <div style="padding:14px 14px 0">${comidasHtml}</div>

    <!-- FOOTER -->
    <div style="margin:10px 14px 0;background:rgba(0,0,0,.4);border-top:2px solid ${acc};border-radius:0 0 12px 12px;padding:14px 16px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:24px">🐺</div>
        <div style="flex:1">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:12px;color:#fff;letter-spacing:.06em;line-height:1.5">${frase.toUpperCase()}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:11px;color:${acc};letter-spacing:.1em">FITNESS &</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:11px;color:${acc};letter-spacing:.1em">WELLNESS</div>
        </div>
      </div>
    </div>

    <!-- SUPLEMENTACIÓN -->
    ${(()=>{
      const sups = CD._planSuplementacion;
      const alimTher = CD._planAlimentosTerapeuticos;
      const supBase = LANG==='en' ? [
        {nombre:'Omega-3 (TG form)',dosis:'2-3g EPA+DHA/day',momento:'With main meals',motivo:'Reduces inflammation and improves recovery',icon:'🐟'},
        {nombre:'Creatine Monohydrate',dosis:'3-5g/day',momento:'Any time of day — daily consistency',motivo:'Increases strength, power and muscle mass. Most scientifically backed supplement',icon:'⚡'},
        {nombre:'Whey Protein',dosis:'20-40g as needed',momento:'Post-workout or when not reaching protein goals',motivo:'Supplement to reach your daily protein target',icon:'🥛'},
      ] : [
        {nombre:'Omega-3 (forma TG)',dosis:'2-3g EPA+DHA/día',momento:'Con las comidas principales',motivo:'Base para reducir inflamación y mejorar recuperación',icon:'🐟'},
        {nombre:'Creatina Monohidrato',dosis:'3-5g/día',momento:'Cualquier momento del día — consistencia diaria',motivo:'Aumenta fuerza, potencia y masa muscular. El suplemento más respaldado científicamente',icon:'⚡'},
        {nombre:'Proteína Whey',dosis:'20-40g según necesidad',momento:'Post-entreno o cuando no llegues a objetivos proteicos',motivo:'Complemento para alcanzar tu objetivo diario de proteína',icon:'🥛'},
      ];
      // Always show — base supplements are always recommended
      return `<div style="margin:10px 14px 0;background:rgba(168,85,247,.08);border:0.5px solid rgba(168,85,247,.25);border-radius:12px;padding:12px 14px">
        <div style="font-size:11px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px">🧪 ${LANG==='en'?'RECOMMENDED SUPPLEMENTATION':'Suplementación recomendada'}</div>
        <!-- Base supplements -->
        ${supBase.map(s=>`
        <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(168,85,247,.15);border:0.5px solid rgba(168,85,247,.3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${s.icon}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:#fff">${s.nombre} <span style="font-size:11px;color:#c084fc;font-weight:400">· ${s.dosis}</span></div>
            <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">⏰ ${s.momento}</div>
            <div style="font-size:10px;color:rgba(168,85,247,.7);margin-top:2px">${s.motivo}</div>
          </div>
        </div>`).join('')}
        <!-- Personalised supplements from IA -->
        ${(sups||[]).map((s,si)=>`
        <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(168,85,247,.15);border:0.5px solid rgba(168,85,247,.3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">💊</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:#fff">${cachedTrans?.sups?.[si]?.nombre||s.nombre} <span style="font-size:11px;color:#c084fc;font-weight:400">· ${s.dosis}</span></div>
            <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">⏰ ${cachedTrans?.sups?.[si]?.momento||s.momento}</div>
            ${s.motivo?`<div style="font-size:10px;color:rgba(168,85,247,.7);margin-top:2px">${cachedTrans?.sups?.[si]?.motivo||s.motivo}</div>`:''}
          </div>
        </div>`).join('')}
        ${(alimTher||[]).length?`
        <div style="border-top:0.5px solid rgba(168,85,247,.15);padding-top:8px;margin-top:4px">
          <div style="font-size:10px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">🥩 ${LANG==='en'?'Therapeutic foods':'Alimentos terapéuticos'}</div>
          ${(alimTher||[]).map((a,ai)=>`
          <div style="font-size:12px;color:rgba(255,255,255,.75);margin-bottom:4px">
            <b style="color:#fff">${cachedTrans?.ther?.[ai]?.alimento||a.alimento}</b> · ${cachedTrans?.ther?.[ai]?.frecuencia||a.frecuencia}
            ${a.motivo?`<span style="color:rgba(168,85,247,.7);font-size:11px"> — ${cachedTrans?.ther?.[ai]?.motivo||a.motivo}</span>`:''}
          </div>`).join('')}
        </div>`:''}
      </div>`;
    })()}

    <!-- NOTA PESOS EN CRUDO -->
    <div style="margin:10px 14px;background:${accBg};border:0.5px solid ${acc}60;border-radius:12px;padding:11px 14px">
      <div style="font-size:12px;color:rgba(255,255,255,.65);line-height:1.6">${LANG==="en"?'📌 All weights are <b style="color:#fff">raw/uncooked</b>. Drink 2-3L of water/day. Questions → use the <b style="color:'+accLight+'">assistant</b>.':`📌 Todos los pesos son <b style="color:#fff">en crudo</b>. Bebe 2-3L de agua/día. Dudas → usa el <b style="color:${accLight}">asistente</b>.`}</div>
    </div>

    <!-- CONSEJOS NUTRICIONALES FIJOS -->
    <div style="margin:10px 14px 0;border:0.5px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden">
      <div style="background:rgba(255,255,255,.04);padding:10px 14px;border-bottom:0.5px solid rgba(255,255,255,.06)">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;color:#fff;letter-spacing:.1em">📋 ${LANG==="en"?"NUTRITION GUIDE":"GUÍA NUTRICIONAL"}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:2px">${LANG==="en"?"Base rules to maximize your results":"Normas base para maximizar tus resultados"}</div>
      </div>
      <div style="padding:12px 14px;display:flex;flex-direction:column;gap:10px">

        <!-- Hidratación -->
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="font-size:20px;flex-shrink:0">💧</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:2px">${LANG==="en"?"Hydration":"Hidratación"}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.55);line-height:1.6">${LANG==="en"?'Always prioritize <b style="color:#93c5fd">water</b>. Coffee or tea without sugar — use sweetener if needed. Sodas: always <b style="color:#93c5fd">zero</b>, never regular. No boxed juices. No sugary drinks.':"Prioriza siempre el <b style=\"color:#93c5fd\">agua</b>. Si tomas café o té, sin azúcar — usa edulcorante si necesitas. Refrescos: siempre versión <b style=\"color:#93c5fd\">zero</b>, nunca normal. Sin zumos de caja. Sin bebidas azucaradas."}</div>
          </div>
        </div>

        <div style="height:0.5px;background:rgba(255,255,255,.06)"></div>

        <!-- Salsas y condimentos -->
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="font-size:20px;flex-shrink:0">🫙</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:2px">${LANG==="en"?"Sauces & condiments":"Salsas y condimentos"}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.55);line-height:1.6">
              ${LANG==="en"?'✅ <b style="color:#86efac">Allowed:</b> natural tomato, free spices (pepper, parsley, basil, oregano, turmeric...), salt, zero ketchup, mustard, low-sodium soy sauce.<br>❌ <b style="color:#fca5a5">Avoid:</b> sugary commercial sauces, excess mayo, regular BBQ sauce, industrial dressings.':`✅ <b style="color:#86efac">Permitido:</b> tomate al natural, especias libres (pimienta, perejil, albahaca, orégano, cúrcuma...), sal, ketchup zero, mostaza, salsa de soja baja en sodio.<br>❌ <b style="color:#fca5a5">Evitar:</b> salsas comerciales con azúcar, mayonesa en exceso, salsas tipo barbacoa normal, aderezos industriales.`}
            </div>
          </div>
        </div>

        <div style="height:0.5px;background:rgba(255,255,255,.06)"></div>

        <!-- Azúcares -->
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="font-size:20px;flex-shrink:0">🚫</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:2px">${LANG==="en"?"Added sugars":"Azúcares añadidos"}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.55);line-height:1.6">${LANG==="en"?"Avoid sugar in coffee, pastries, cookies, sugary drinks and boxed juices. To sweeten use sweetener (stevia, erythritol). Liquid calories don't fill you up.":"Evita azúcar en café, bollería, galletas, refrescos azucarados y zumos de caja. Si necesitas endulzar usa edulcorante (stevia, eritritol). Las calorías líquidas no sacian."}</div>
          </div>
        </div>

      </div>
    </div>

    <!-- BOTÓN TRADUCIR CON IA — solo en inglés y sin traducción cacheada -->
    ${LANG==='en' ? `
    <div style="padding:0 14px;margin-bottom:8px">
      <button id="btn_translate_diet" onclick="traducirDietaIA()" title="Translate with AI" style="width:100%;padding:10px;background:rgba(59,130,246,.1);color:#93c5fd;border:0.5px solid rgba(59,130,246,.25);border-radius:10px;cursor:pointer;font-family:inherit;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:6px">
        <span style="font-size:20px" id="btn_translate_diet_txt">${cachedTrans ? '✅🇬🇧' : '🇬🇧'}</span>
      </button>
    </div>` : ''}

    <!-- BOTÓN GUARDAR -->
    <div style="padding:0 14px">
      <button onclick="descargarDieta()" style="width:100%;padding:14px;background:${acc};color:${esVeg?'#000':'#fff'};border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Bebas Neue',sans-serif;letter-spacing:.1em;touch-action:manipulation">
        ${LANG==="en"?"⬇ SAVE AS IMAGE":"⬇ GUARDAR COMO IMAGEN"}
      </button>
    </div>
  </div>`;
  // Inicializar swipe táctil tras renderizar el DOM
  setTimeout(_initDietaSwipe, 100);
}


// ── SWIPE A/B/C — navegación entre opciones de comida ─────────────────────
function _dietaSwipeTo(mi, oi){
  const container = document.getElementById('swipe_'+mi);
  if(!container) return;
  const cardW = container.offsetWidth;
  container.scrollTo({ left: oi * cardW, behavior: 'smooth' });
  // Actualizar dots
  const dotsCont = document.getElementById('dots_'+mi);
  if(dotsCont){
    const acc = (CD.dieta_tipo==='Vegano'||CD.dieta_tipo==='Vegetariano') ? '#22c55e' : '#3b82f6';
    dotsCont.querySelectorAll('[data-dot]').forEach(d=>{
      const idx = parseInt(d.getAttribute('data-dot'));
      d.style.width  = idx===oi ? '18px' : '7px';
      d.style.background = idx===oi ? acc : 'rgba(255,255,255,.2)';
    });
  }
}

// Activar swipe táctil nativo (scroll-snap) — los dots se sincronizan al scroll
function _initDietaSwipe(){
  document.querySelectorAll('[id^="swipe_"]').forEach(container=>{
    const mi = parseInt(container.getAttribute('data-mi'));
    let _lastOi = -1;

    function _updateDots(){
      const cardW = container.offsetWidth;
      if(!cardW) return;
      const oi = Math.round(container.scrollLeft / cardW);
      if(oi === _lastOi) return;
      _lastOi = oi;
      const dotsCont = document.getElementById('dots_'+mi);
      if(!dotsCont) return;
      const acc = (CD.dieta_tipo==='Vegano'||CD.dieta_tipo==='Vegetariano') ? '#22c55e' : '#3b82f6';
      dotsCont.querySelectorAll('[data-dot]').forEach(d=>{
        const idx = parseInt(d.getAttribute('data-dot'));
        d.style.width      = idx===oi ? '18px' : '7px';
        d.style.background = idx===oi ? acc : 'rgba(255,255,255,.2)';
      });
    }

    // scroll: se dispara continuamente mientras deslizas
    container.addEventListener('scroll', _updateDots, {passive:true});
    // scrollend: se dispara al terminar (mejor soporte en iOS 16+)
    container.addEventListener('scrollend', _updateDots, {passive:true});
    // Fallback: polling ligero mientras hay momentum (cubre iOS < 16)
    let _scrollTimer = null;
    container.addEventListener('scroll', ()=>{
      if(_scrollTimer) clearTimeout(_scrollTimer);
      _scrollTimer = setTimeout(_updateDots, 150);
    }, {passive:true});
  });
}

// ── RECETA FITNESS con IA + foto Unsplash ────────────────────────────────
// Devuelve el índice de opción activa en un swipe de comida
function _getOpcionActiva(mi){
  const container = document.getElementById('swipe_'+mi);
  if(!container) return 0;
  const cardW = container.offsetWidth;
  if(!cardW) return 0;
  return Math.round(container.scrollLeft / cardW);
}

async function _abrirReceta(mi, oi){
  const comida = CD.comidas[mi];
  if(!comida) return;
  const vars = CD._planVariaciones?.[mi] || [];
  const acc = (CD.dieta_tipo==='Vegano'||CD.dieta_tipo==='Vegetariano') ? '#22c55e' : '#3b82f6';

  // Construir lista de todas las opciones disponibles
  const todasOpts = [
    { letra:'A', nombre: LANG==='en'?'Main':'Principal', ingredientesArr: (comida.items||[]).map(it=>({nombre:it.nombre,gramos:it.gramos})) },
    ...vars.map((v,vi)=>({
      letra: v.letra||String.fromCharCode(66+vi),
      nombre: v.nombre||'',
      ingredientesArr: (v.alimentos||[]).map(a=>({nombre:a.nombre,gramos:a.gramos||parseInt((a.cantidad||'0'))}))
    }))
  ];
  const hasMultiple = todasOpts.length > 1;
  const startOi = (oi !== undefined && oi >= 0) ? oi : 0;

  // Crear modal con tabs en el header si hay múltiples opciones
  const tabsHtml = hasMultiple ? `
    <div style="display:flex;gap:4px;margin-left:auto">
      ${todasOpts.map((op,idx)=>`
        <button id="receta_tab_${idx}" onclick="_recetaNavTab(${mi},${idx})"
          style="padding:4px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border:1px solid ${idx===startOi?acc:'rgba(255,255,255,.15)'};background:${idx===startOi?acc+'22':'none'};color:${idx===startOi?acc:'rgba(255,255,255,.4)'};transition:.2s;-webkit-tap-highlight-color:transparent">
          ${op.letra}
        </button>`).join('')}
    </div>` : '';

  const modal = document.createElement('div');
  modal.id = 'receta_modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(9,9,11,.97);z-index:700;display:flex;flex-direction:column;overflow:hidden';
  modal.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--s);border-bottom:0.5px solid var(--br);flex-shrink:0">
      <button onclick="document.getElementById('receta_modal').remove()" style="width:34px;height:34px;border-radius:8px;background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);cursor:pointer;font-size:20px;line-height:1;flex-shrink:0">×</button>
      <div style="font-size:15px;font-weight:700;color:var(--sv);flex-shrink:0">👨‍🍳 ${LANG==='en'?'Fitness Recipe':'Receta Fitness'}</div>
      ${tabsHtml}
    </div>
    <div id="receta_body" style="flex:1;overflow-y:auto">
      ${_recetaSpinner(LANG)}
    </div>`;
  document.body.appendChild(modal);

  // Guardar contexto en el modal para que _recetaNavTab pueda acceder
  modal._mi = mi;
  modal._opts = todasOpts;
  modal._acc = acc;

  await _recetaCargar(mi, startOi, todasOpts, acc);
}

function _recetaSpinner(lang){
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:14px">
    <div style="width:40px;height:40px;border-radius:50%;border:3px solid var(--bl2);border-top-color:transparent;animation:spin .8s linear infinite"></div>
    <div style="font-size:13px;color:var(--tx3)">${lang==='en'?'Creating your recipe...':'Creando tu receta...'}</div>
  </div>`;
}

async function _recetaNavTab(mi, oi){
  const modal = document.getElementById('receta_modal');
  if(!modal) return;
  const opts = modal._opts;
  const acc  = modal._acc;

  // Actualizar estilo de tabs
  opts.forEach((_,idx)=>{
    const tab = document.getElementById('receta_tab_'+idx);
    if(!tab) return;
    const active = idx===oi;
    tab.style.border = `1px solid ${active?acc:'rgba(255,255,255,.15)'}`;
    tab.style.background = active ? acc+'22' : 'none';
    tab.style.color = active ? acc : 'rgba(255,255,255,.4)';
  });

  // Mostrar spinner y cargar
  const body = document.getElementById('receta_body');
  if(body) body.innerHTML = _recetaSpinner(LANG);
  await _recetaCargar(mi, oi, opts, acc);
}

async function _recetaCargar(mi, oi, todasOpts, acc){
  const op = todasOpts[oi];
  if(!op) return;

  const ingredientesArr = op.ingredientesArr;
  const nombreComida    = op.nombre || CD.comidas[mi]?.nombre || '';
  const cacheKey = 'receta_'+CD.id+'_'+mi+'_'+oi;
  const accLight = (CD.dieta_tipo==='Vegano'||CD.dieta_tipo==='Vegetariano') ? '#86efac' : '#93c5fd';

  const body = document.getElementById('receta_body');
  if(!body) return;

  try {
    let receta = null;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey)||'null');
      // Invalidar cache si la receta no tiene foto_query (versión antigua)
      if(cached && cached.foto_query && cached.pasos?.length) receta = cached;
    } catch(e){}

    if(!receta){
      // Usar endpoint dedicado — modelo haiku, prompt ultra-estricto
      const d = await api('/ia/receta-fitness', {
        method: 'POST',
        body: JSON.stringify({
          ingredientes: ingredientesArr,
          nombreComida,
          lang: LANG
        })
      });
      receta = d.receta;
      if(!receta) throw new Error('no receta');
      try { localStorage.setItem(cacheKey, JSON.stringify(receta)); } catch(e){}
    }

    // Foto por ingrediente principal — fotos estáticas de Unsplash (sin API key)
    const mainIngr = (ingredientesArr[0]?.nombre||'').toLowerCase();
    const fotoMap = {
      pollo:    '1532550907401-a500c9a57435',
      pechuga:  '1532550907401-a500c9a57435',
      salmon:   '1467003909585-2f8a72700288',
      atun:     '1467003909585-2f8a72700288',
      carne:    '1558030006-c2f32afd87ac',
      ternera:  '1558030006-c2f32afd87ac',
      cerdo:    '1558030006-c2f32afd87ac',
      huevo:    '1482049016688-2d3e1b311543',
      arroz:    '1455619452-9214-91a0-8a5f-52b3b3c8a9c2',
      avena:    '1504901218145-c3dcffca59af',
      pasta:    '1473093226555-0b23c14a1c64',
      ensalada: '1512621776951-a57141f2eefd',
      verdura:  '1512621776951-a57141f2eefd',
      whey:     '1532550907401-a500c9a57435',
      yogur:    '1488477181228-c815e7389caa',
      leche:    '1488477181228-c815e7389caa',
      patata:   '1518977676878-7d93acaba5b6',
      boniato:  '1518977676878-7d93acaba5b6',
      platano:  '1469045678638-3f5a77df0716',
      fruta:    '1469045678638-3f5a77df0716',
    };
    const fbKey = Object.keys(fotoMap).find(k => mainIngr.includes(k));
    const fotoId = fbKey ? fotoMap[fbKey] : '1546069901-ba9599a7e63c';
    const fotoSrc = 'https://images.unsplash.com/photo-' + fotoId + '?w=600&q=80&fit=crop';

    if(!document.getElementById('receta_body')) return; // modal cerrado

    body.innerHTML = `
      <div style="width:100%;height:200px;background:#0d1520;overflow:hidden;position:relative">
        <img src="${fotoSrc}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.style.background='#0d1520';this.style.display='none'"/>
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,rgba(9,9,11,.9))"></div>
        <div style="position:absolute;bottom:12px;left:16px;right:16px">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:#fff;letter-spacing:.05em;line-height:1.2">${receta.nombre}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:3px">⏱ ${receta.tiempo} · 0 kcal extra</div>
        </div>
      </div>
      <div style="padding:14px 16px;border-bottom:0.5px solid rgba(255,255,255,.07)">
        <div style="font-size:10px;font-weight:700;color:${acc};text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">🧂 ${LANG==='en'?'SPICES & SEASONING':'ESPECIAS Y SAZÓN'}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${(receta.especias||[]).map(e=>`<span style="font-size:12px;padding:4px 10px;border-radius:20px;background:rgba(255,255,255,.06);border:0.5px solid rgba(255,255,255,.12);color:rgba(255,255,255,.8)">${e}</span>`).join('')}
        </div>
      </div>
      <div style="padding:14px 16px;border-bottom:0.5px solid rgba(255,255,255,.07)">
        <div style="font-size:10px;font-weight:700;color:${acc};text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">🥩 ${LANG==='en'?'INGREDIENTS':'INGREDIENTES'}</div>
        ${ingredientesArr.map(it=>`
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,.04)">
          <span style="font-size:13px;color:rgba(255,255,255,.8)">${it.nombre}</span>
          <span style="font-size:13px;font-weight:700;color:${accLight};font-family:'Bebas Neue',sans-serif">${it.gramos}g</span>
        </div>`).join('')}
      </div>
      <div style="padding:14px 16px">
        <div style="font-size:10px;font-weight:700;color:${acc};text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">👨‍🍳 ${LANG==='en'?'PREPARATION':'PREPARACIÓN'}</div>
        ${(receta.pasos||[]).map((p,i)=>`
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
          <div style="width:24px;height:24px;border-radius:50%;background:${acc}22;border:1px solid ${acc}55;color:${accLight};font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${i+1}</div>
          <div style="font-size:13px;color:rgba(255,255,255,.85);line-height:1.6">${p}</div>
        </div>`).join('')}
        <div style="margin-top:16px;padding:10px 12px;background:rgba(34,197,94,.06);border:0.5px solid rgba(34,197,94,.2);border-radius:10px;font-size:11px;color:rgba(255,255,255,.5);text-align:center">
          ✅ ${LANG==='en'?'Same macros as your plan · No extra calories':'Mismos macros que tu plan · Sin calorías extra'}
        </div>
      </div>`;

  } catch(e){
    if(body) body.innerHTML = `<div style="padding:30px;text-align:center;color:var(--tx3);font-size:13px">${LANG==='en'?'Could not generate recipe. Try again.':'No se pudo generar la receta. Inténtalo de nuevo.'}</div>`;
  }
}

// ── SWIPE A/B/C — navegación entre opciones de comida ─────────────────────
function _dietaSwipeTo(mi, oi){
  const container = document.getElementById('swipe_'+mi);
  if(!container) return;
  const cardW = container.offsetWidth;
  container.scrollTo({ left: oi * cardW, behavior: 'smooth' });
  // Actualizar dots
  const dotsCont = document.getElementById('dots_'+mi);
  if(dotsCont){
    const acc = (CD.dieta_tipo==='Vegano'||CD.dieta_tipo==='Vegetariano') ? '#22c55e' : '#3b82f6';
    dotsCont.querySelectorAll('[data-dot]').forEach(d=>{
      const idx = parseInt(d.getAttribute('data-dot'));
      d.style.width  = idx===oi ? '18px' : '7px';
      d.style.background = idx===oi ? acc : 'rgba(255,255,255,.2)';
    });
  }
}

// Activar swipe táctil nativo (scroll-snap) — los dots se sincronizan al scroll
function _initDietaSwipe(){
  document.querySelectorAll('[id^="swipe_"]').forEach(container=>{
    const mi = parseInt(container.getAttribute('data-mi'));
    container.addEventListener('scroll', ()=>{
      const cardW = container.offsetWidth;
      if(!cardW) return;
      const oi = Math.round(container.scrollLeft / cardW);
      const dotsCont = document.getElementById('dots_'+mi);
      if(dotsCont){
        const acc = (CD.dieta_tipo==='Vegano'||CD.dieta_tipo==='Vegetariano') ? '#22c55e' : '#3b82f6';
        dotsCont.querySelectorAll('[data-dot]').forEach(d=>{
          const idx = parseInt(d.getAttribute('data-dot'));
          d.style.width  = idx===oi ? '18px' : '7px';
          d.style.background = idx===oi ? acc : 'rgba(255,255,255,.2)';
        });
      }
    }, {passive:true});
  });
}

// ── RECETA FITNESS con IA + foto Unsplash ────────────────────────────────
// Devuelve el índice de opción activa en un swipe de comida
function _getOpcionActiva(mi){
  const container = document.getElementById('swipe_'+mi);
  if(!container) return 0;
  const cardW = container.offsetWidth;
  if(!cardW) return 0;
  return Math.round(container.scrollLeft / cardW);
}

async function _abrirReceta(mi, oi){
  const comida = CD.comidas[mi];
  if(!comida) return;
  // Usar ingredientes de la opción activa (A=opción principal, B/C=variaciones)
  const opIdx = oi !== undefined ? oi : 0;
  let ingredientesArr, nombreOpcion;
  if(opIdx === -1 || opIdx === 0){
    ingredientesArr = (comida.items||[]).map(it=>({nombre:it.nombre, gramos:it.gramos}));
    nombreOpcion = comida.nombre || '';
  } else {
    const vars = CD._planVariaciones?.[mi] || [];
    const v = vars[opIdx-1] || vars[0];
    ingredientesArr = (v?.alimentos||[]).map(a=>{
        // cantidad puede ser "80g", "300g", "4 uds", "1 ud mediano", etc.
        let gramos = a.gramos || 0;
        if(!gramos && a.cantidad){
          const num = parseFloat((a.cantidad||'').replace(',','.'));
          const esUds = /ud|unid|pieza|reban/i.test(a.cantidad);
          gramos = isNaN(num) ? 0 : (esUds ? Math.round(num * 60) : Math.round(num));
        }
        return { nombre: a.nombre + (a.detalle ? ' ('+a.detalle+')' : ''), gramos };
      });
    nombreOpcion = v?.nombre || comida.nombre || '';
  }
  const ingredientes = ingredientesArr.map(it=>it.nombre+' '+it.gramos+'g').join(', ');
  const nombreComida = nombreOpcion;
  const cacheKey = 'receta_'+CD.id+'_'+mi+'_'+opIdx;

  // Crear modal
  const modal = document.createElement('div');
  modal.id = 'receta_modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(9,9,11,.97);z-index:700;display:flex;flex-direction:column;overflow:hidden';
  modal.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--s);border-bottom:0.5px solid var(--br);flex-shrink:0">
      <button onclick="document.getElementById('receta_modal').remove()" style="width:34px;height:34px;border-radius:8px;background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);cursor:pointer;font-size:20px;line-height:1">×</button>
      <div style="font-size:15px;font-weight:700;color:var(--sv)">👨‍🍳 ${LANG==='en'?'Fitness Recipe':'Receta Fitness'}</div>

    </div>
    <div id="receta_body" style="flex:1;overflow-y:auto">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:14px">
        <div style="width:40px;height:40px;border-radius:50%;border:3px solid var(--bl2);border-top-color:transparent;animation:spin .8s linear infinite"></div>
        <div style="font-size:13px;color:var(--tx3)">${LANG==='en'?'Creating your recipe...':'Creando tu receta...'}</div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  try {
    // Intentar desde cache
    let receta = null;
    try { receta = JSON.parse(localStorage.getItem(cacheKey)||'null'); } catch(e){}

    if(!receta){
      const lang = LANG==='en'?'English':'Spanish';
      // Lista de ingredientes para el prompt (los exactos del plan)
      const listaIngr = ingredientesArr.map(it=>`- ${it.nombre} (${it.gramos}g)`).join('\n');
      const prompt = LANG==='en'
        ? `You are a fitness nutritionist. Create a recipe using ONLY AND EXACTLY these ingredients:\n${listaIngr}\nMeal: ${nombreComida}.\nSTRICT RULES:\n1. Use ONLY the listed ingredients, no substitutions, no additions.\n2. Only salt, pepper and herbs as extras (0 calories).\n3. Keep exact quantities.\nRespond ONLY with compact JSON (no extra text):\n{"nombre":"short dish name based on the actual ingredients","tiempo":"X min","especias":["herb1","herb2","herb3"],"pasos":["step1","step2","step3","step4"],"foto_query":"2-word english food photo query matching the main ingredient"}`
        : `Eres nutricionista deportivo. Crea una receta usando ÚNICAMENTE estos ingredientes:\n${listaIngr}\nComida: ${nombreComida}.\nREGLAS ESTRICTAS:\n1. Usa SOLO los ingredientes listados, sin sustituciones ni añadidos.\n2. Solo sal, pimienta y hierbas como extras (0 calorías).\n3. Respeta las cantidades exactas.\nResponde SOLO con JSON compacto (sin texto extra):\n{"nombre":"nombre corto del plato basado en los ingredientes reales","tiempo":"X min","especias":["hierba1","hierba2","hierba3"],"pasos":["paso1","paso2","paso3","paso4"],"foto_query":"2-word english food photo query matching the main ingredient"}`;

      const d = await api('/ia/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          system: LANG==='en'
            ? 'You are a fitness nutritionist. Respond ONLY with valid compact JSON, no extra text.'
            : 'Eres nutricionista deportivo. Responde SOLO con JSON válido y compacto, sin texto extra.'
        })
      });
      const raw = (d.reply||'').replace(/```json|```/g,'').trim();
      receta = JSON.parse(raw);
      try { localStorage.setItem(cacheKey, JSON.stringify(receta)); } catch(e){}
    }

    // Foto: buscar por ingrediente principal del plato real
    // Usar foto_query de la IA (que ahora es el ingrediente principal) via Unsplash
    const fotoQuery = receta.foto_query || ingredientesArr[0]?.nombre || 'healthy food';
    const fotoQueryEnc = encodeURIComponent(fotoQuery);
    let fotoSrc = '';
    try {
      const fotoRes = await fetch(`https://api.unsplash.com/photos/random?query=${fotoQueryEnc}&orientation=landscape&content_filter=high&client_id=hTbVSYX8CmKFLXPfwdHLCaHv5IxhijvT5X10T4QxKUE`);
      if(fotoRes.ok){
        const fotoData = await fotoRes.json();
        fotoSrc = fotoData?.urls?.regular || fotoData?.urls?.small || '';
      }
    } catch(e){}
    // Fallback según ingrediente principal
    const mainIngr = (ingredientesArr[0]?.nombre||'').toLowerCase();
    if(!fotoSrc){
      const fallbacks = {
        pollo:'1546069901-ba9599a7e63c', arroz:'1455619452-9214-91a0-8a5f-52b3b3c8a9c2',
        salmon:'1467003909585-2f8a72700288', huevo:'1482049016688-2d3e1b311543',
        carne:'1558030006-c2f32afd87ac', pasta:'1473093226555-0b23c14a1c64',
        avena:'1504901218145-c3dcffca59af', ensalada:'1512621776951-a57141f2eefd',
      };
      const fbKey = Object.keys(fallbacks).find(k=>mainIngr.includes(k));
      const fbId = fbKey ? fallbacks[fbKey] : '1546069901-ba9599a7e63c';
      fotoSrc = `https://images.unsplash.com/photo-${fbId}?w=600&q=80`;
    }

    const body = document.getElementById('receta_body');
    if(!body) return;
    const acc = (CD.dieta_tipo==='Vegano'||CD.dieta_tipo==='Vegetariano') ? '#22c55e' : '#3b82f6';
    const accLight = (CD.dieta_tipo==='Vegano'||CD.dieta_tipo==='Vegetariano') ? '#86efac' : '#93c5fd';

    body.innerHTML = `
      <!-- Foto del plato -->
      <div style="width:100%;height:200px;background:#0d1520;overflow:hidden;position:relative">
        <img src="${fotoSrc}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.style.background='#0d1520';this.style.display='none'"/>
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,rgba(9,9,11,.9))"></div>
        <div style="position:absolute;bottom:12px;left:16px;right:16px">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:#fff;letter-spacing:.05em;line-height:1.2">${receta.nombre}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:3px">⏱ ${receta.tiempo} · 0 kcal extra</div>
        </div>
      </div>
      <!-- Especias -->
      <div style="padding:14px 16px;border-bottom:0.5px solid rgba(255,255,255,.07)">
        <div style="font-size:10px;font-weight:700;color:${acc};text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">🧂 ${LANG==='en'?'SPICES & SEASONING':'ESPECIAS Y SAZÓN'}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${(receta.especias||[]).map(e=>`<span style="font-size:12px;padding:4px 10px;border-radius:20px;background:rgba(255,255,255,.06);border:0.5px solid rgba(255,255,255,.12);color:rgba(255,255,255,.8)">${e}</span>`).join('')}
        </div>
      </div>
      <!-- Ingredientes -->
      <div style="padding:14px 16px;border-bottom:0.5px solid rgba(255,255,255,.07)">
        <div style="font-size:10px;font-weight:700;color:${acc};text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">🥩 ${LANG==='en'?'INGREDIENTS':'INGREDIENTES'}</div>
        ${ingredientesArr.map(it=>`
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,.04)">
          <span style="font-size:13px;color:rgba(255,255,255,.8)">${it.nombre}</span>
          <span style="font-size:13px;font-weight:700;color:${accLight};font-family:'Bebas Neue',sans-serif">${it.gramos > 0 ? it.gramos+'g' : ''}</span>
        </div>`).join('')}
      </div>
      <!-- Preparación -->
      <div style="padding:14px 16px">
        <div style="font-size:10px;font-weight:700;color:${acc};text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">👨‍🍳 ${LANG==='en'?'PREPARATION':'PREPARACIÓN'}</div>
        ${(receta.pasos||[]).map((p,i)=>`
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
          <div style="width:24px;height:24px;border-radius:50%;background:${acc}22;border:1px solid ${acc}55;color:${accLight};font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${i+1}</div>
          <div style="font-size:13px;color:rgba(255,255,255,.85);line-height:1.6">${p}</div>
        </div>`).join('')}
        <div style="margin-top:16px;padding:10px 12px;background:rgba(34,197,94,.06);border:0.5px solid rgba(34,197,94,.2);border-radius:10px;font-size:11px;color:rgba(255,255,255,.5);text-align:center">
          ✅ ${LANG==='en'?'Same macros as your plan · No extra calories':'Mismos macros que tu plan · Sin calorías extra'}
        </div>
      </div>`;

  } catch(e){
    const body = document.getElementById('receta_body');
    if(body) body.innerHTML = `<div style="padding:30px;text-align:center;color:var(--tx3);font-size:13px">${LANG==='en'?'Could not generate recipe. Try again.':'No se pudo generar la receta. Inténtalo de nuevo.'}</div>`;
  }
}
