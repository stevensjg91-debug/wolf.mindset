/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 09_coach_dieta_editor.js
   Editor dieta coach: macros, rebalanceo, guardarDieta, mb2()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

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

  // ─── OPCIÓN B: Rebalanceo IA ───
  html += `<div style="background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(17,17,19,.9));border:0.5px solid rgba(59,130,246,.25);border-radius:10px;padding:12px;margin-bottom:10px">
    <div style="font-size:11px;font-weight:700;color:var(--blg);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">⚡ ${tc('Rebalanceo IA')}</div>
    <div style="font-size:12px;color:var(--sv3);margin-bottom:8px">${tc('Describe el ajuste y la IA redistribuye todo el plan')}</div>
    <textarea id="coach_ia_ajuste" style="width:100%;padding:9px 11px;border:0.5px solid var(--br);border-radius:8px;background:var(--b);color:var(--tx);font-size:13px;font-family:'Inter',sans-serif;resize:none;min-height:60px;margin-bottom:8px;box-sizing:border-box"
      placeholder="${COACH_LANG==='en'?'E.g: Lower 200 kcal removing from carbs · Increase protein 20g split between lunch and dinner · Remove breakfast fats...':'Ej: Baja 200 kcal quitándolas de los carbos · Sube proteína 20g repartida en comida y cena · Elimina las grasas del desayuno...'}"></textarea>
    <button onclick="rebalancearConIA()" class="btn" style="width:100%;padding:10px;font-size:13px">⚡ ${tc('Rebalancear con IA')}</button>
  </div>`;

  // ─── OPCIÓN A: Rebalanceo automático ───
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

  // ─── EDICIÓN MANUAL POR COMIDA ───
  html += `<div style="font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">${tc('Edición manual')}</div>`;
  c.comidas.forEach((m, mi) => {
    const nombreEsc = (m.nombre||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');
    html += `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:10px 12px;margin-bottom:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blg);margin-bottom:8px">${['☀️','🕐','🍽️','🌅','🌙','🥗'][mi]||'🍽️'} ${m.nombre}</div>`;
    (m.items||[]).forEach(it => {
      const itNombreEsc = (it.nombre||'').replace(/"/g,'&quot;');
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
  });

  html += `<button onclick="guardarDietaCoach()" class="btn" style="width:100%;padding:11px;background:var(--gn);margin-top:4px">✓ ${tc('Guardar y cerrar')}</button>`;
  edit.innerHTML = html;
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
  const c = await api('/clientes/'+window._coachClienteId);
  window._coachClienteActual = c;
  const view = document.getElementById('coach_dieta_view');
  const edit = document.getElementById('coach_dieta_edit');
  const btnEditar = document.getElementById('btn_editar_dieta_coach');
  if(view) view.innerHTML = c.comidas.length ? c.comidas.map((m,mi)=>{
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

