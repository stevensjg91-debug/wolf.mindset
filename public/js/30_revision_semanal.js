/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 30_revision_semanal.js
   Revisión semanal coach: cargarRevisionSemanal(), sugerirProgresionIA(), publicarSemana()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ REVISIÓN SEMANAL ═══════════════════════════════════════════
// Volumen semanal recomendado por grupo muscular y nivel
const VOL_RECOMENDADO = {
  Principiante: { min:10, max:12, desc: COACH_LANG==='en'?'10-12 sets/week/group':'10-12 series/semana/grupo' },
  Intermedio:   { min:14, max:16, desc: COACH_LANG==='en'?'14-16 sets/week/group':'14-16 series/semana/grupo' },
  Avanzado:     { min:16, max:20, desc: COACH_LANG==='en'?'16-20+ sets/week/group':'16-20+ series/semana/grupo' },
};

// Calcula progresión sugerida basada en RIR real vs objetivo
function calcularProgresion(pesoActual, repsReales, rirReal, rirObjetivo, nivel) {
  const diff = rirReal - rirObjetivo; // positivo = le sobró margen → subir
  let nuevoPeso = pesoActual;
  let nota = '';
  
  if (diff >= 2) {
    // Sobró mucho margen — subir 5% o 2.5kg mínimo
    const subida = nivel === 'Avanzado' ? 0.025 : 0.05;
    nuevoPeso = Math.round((pesoActual * (1 + subida)) / 2.5) * 2.5;
    nota = `RIR ${rirReal} (obj ${rirObjetivo}) → +${(nuevoPeso-pesoActual).toFixed(1)}kg`;
  } else if (diff === 1) {
    // Pequeño margen — subir 2.5kg
    nuevoPeso = pesoActual + 2.5;
    nota = `RIR ${rirReal} (obj ${rirObjetivo}) → +2.5kg`;
  } else if (diff === 0) {
    // En el objetivo — mantener
    nota = `RIR ${rirReal} ✓ ${COACH_LANG==='en'?'keep weight':'mantener peso'}`;
  } else if (diff === -1) {
    // Justo al límite — mantener o bajar 2.5
    nota = `RIR ${rirReal} (obj ${rirObjetivo}) → ${COACH_LANG==='en'?'keep or -2.5kg':'mantener o -2.5kg'}`;
  } else {
    // No llegó al objetivo — bajar carga
    nuevoPeso = Math.max(0, pesoActual - 2.5);
    nota = `RIR ${rirReal} (obj ${rirObjetivo}) → -2.5kg`;
  }
  
  return { nuevoPeso, nota, subida: nuevoPeso > pesoActual, bajada: nuevoPeso < pesoActual };
}

async function cargarRevisionSemanal(clienteId, clienteData) {
  const wrap = document.getElementById('revision_semanal_content');
  const estado = document.getElementById('rev_estado');
  if (!wrap) return;

  try {
    const sesiones = await api('/clientes/' + clienteId + '/sesiones');
    
    if (!sesiones.length) {
      wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3);padding:4px 0">${COACH_LANG==='en'?'No sessions yet. Once the client completes workouts, the review will appear here.':'Sin sesiones registradas aún. Cuando el cliente complete entrenamientos aparecerá aquí la revisión.'}</div>`;
      return;
    }

    // Get the most recent session per day
    const porDia = {};
    sesiones.forEach(s => {
      const dia = s.dia_nombre;
      if (!porDia[dia] || new Date(s.fecha) > new Date(porDia[dia].fecha)) {
        porDia[dia] = s;
      }
    });

    // Build revision data: for each ejercicio in client's plan, find last performance
    const ejerciciosPlan = {};
    (clienteData.dias || []).forEach(d => {
      (d.ejercicios || []).forEach(e => {
        ejerciciosPlan[e.nombre] = { ...e, dia: d.nombre };
      });
    });

    // Map last performance per ejercicio
    const ultimoRendimiento = {};
    sesiones.forEach(s => {
      s.series.forEach(sr => {
        if (!ultimoRendimiento[sr.ejercicio_nombre] ||
            new Date(s.fecha) > new Date(ultimoRendimiento[sr.ejercicio_nombre].fecha)) {
          ultimoRendimiento[sr.ejercicio_nombre] = {
            ...sr,
            fecha: s.fecha,
            dia: s.dia_nombre
          };
        }
      });
    });

    // Volume analysis per muscle group
    const volPorGrupo = {};
    sesiones.filter(s => {
      const d = new Date(s.fecha);
      const semAgo = Date.now() - 7*24*60*60*1000;
      return d.getTime() > semAgo;
    }).forEach(s => {
      s.series.forEach(sr => {
        const ex = ejerciciosPlan[sr.ejercicio_nombre];
        if (!ex) return;
        const grupo = (ex.musculos || '').split(',')[0].trim() || 'Otros';
        if (!volPorGrupo[grupo]) volPorGrupo[grupo] = 0;
        volPorGrupo[grupo]++;
      });
    });

    const nivel = clienteData.nivel || 'Intermedio';
    const volRec = VOL_RECOMENDADO[nivel] || VOL_RECOMENDADO.Intermedio;

    // Build the UI
    let cambiosPendientes = {}; // ejercicio -> nuevoPeso

    const diasConEjercicios = (clienteData.dias || []).filter(d => d.ejercicios.length > 0);
    
    if (!diasConEjercicios.length) {
      wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3)">${COACH_LANG==='en'?'No routine assigned.':'Sin rutina asignada.'}</div>`;
      return;
    }

    // Count total pending adjustments
    let totalAjustes = 0;
    diasConEjercicios.forEach(d => {
      d.ejercicios.forEach(e => {
        const ult = ultimoRendimiento[e.nombre];
        if (ult && ult.rir != null) {
          const prog = calcularProgresion(e.peso_objetivo || 0, ult.reps_real, ult.rir, e.rir || 2, nivel);
          if (prog.subida || prog.bajada) totalAjustes++;
        }
      });
    });

    if (estado) estado.textContent = totalAjustes > 0 ? `· ${totalAjustes} ajuste${totalAjustes > 1 ? 's' : ''} ${COACH_LANG==='en'?'adjustment':'ajuste'}${totalAjustes > 1 ? 's' : ''} ${COACH_LANG==='en'?'suggested':'sugerido'}${totalAjustes > 1 ? 's' : ''}` : (COACH_LANG==='en'?'· Up to date':'· Al día');

    // Volume warning
    let volWarnings = '';
    Object.entries(volPorGrupo).forEach(([grupo, series]) => {
      if (series < volRec.min) {
        volWarnings += `<span style="background:rgba(245,158,11,.1);border:0.5px solid rgba(245,158,11,.2);border-radius:6px;padding:2px 8px;font-size:11px;color:var(--amb);margin-right:5px;margin-bottom:4px;display:inline-block">${grupo}: ${series} ${COACH_LANG==='en'?'sets':'series'} (min ${volRec.min})</span>`;
      } else if (series > volRec.max) {
        volWarnings += `<span style="background:rgba(239,68,68,.08);border:0.5px solid rgba(239,68,68,.2);border-radius:6px;padding:2px 8px;font-size:11px;color:#fca5a5;margin-right:5px;margin-bottom:4px;display:inline-block">${grupo}: ${series} ${COACH_LANG==='en'?'sets':'series'} (max ${volRec.max})</span>`;
      }
    });

    let html = '';

    // Volume summary
    html += `<div style="margin-bottom:14px">
      <div style="font-size:11px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">${COACH_LANG==='en'?'Volume this week':'Volumen esta semana'} · ${tc(nivel)} (${volRec.desc})</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px">`;
    
    Object.entries(volPorGrupo).forEach(([grupo, series]) => {
      const ok = series >= volRec.min && series <= volRec.max;
      const low = series < volRec.min;
      html += `<span style="background:${ok?'rgba(34,197,94,.1)':low?'rgba(245,158,11,.1)':'rgba(239,68,68,.08)'};border:0.5px solid ${ok?'rgba(34,197,94,.2)':low?'rgba(245,158,11,.2)':'rgba(239,68,68,.2)'};border-radius:6px;padding:3px 9px;font-size:11px;color:${ok?'var(--gnb)':low?'var(--amb)':'#fca5a5'};font-weight:600">${grupo} ${series}s</span>`;
    });
    
    if (!Object.keys(volPorGrupo).length) {
      html += `<span style="font-size:12px;color:var(--tx3)">${COACH_LANG==='en'?'No data this week':'Sin datos de esta semana'}</span>`;
    }
    
    html += `</div></div>`;

    // Per-exercise progression
    html += `<div style="font-size:11px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">${COACH_LANG==='en'?'Load progression':'Progresión de carga'}</div>`;

    diasConEjercicios.forEach(d => {
      html += `<div style="margin-bottom:14px">
        <div style="font-size:12px;font-weight:700;color:var(--sv2);margin-bottom:8px;padding-bottom:4px;border-bottom:0.5px solid var(--br)">${d.nombre} — ${d.grupo}</div>`;

      d.ejercicios.forEach(e => {
        const ult = ultimoRendimiento[e.nombre];
        const pesoObj = e.peso_objetivo || 0;
        
        let progRow = '';
        let nuevoPeso = pesoObj;
        let notaProg = '';
        let colorProg = 'var(--tx3)';
        let iconProg = '—';

        if (ult && ult.rir != null) {
          const prog = calcularProgresion(pesoObj, ult.reps_real, ult.rir, e.rir || 2, nivel);
          nuevoPeso = prog.nuevoPeso;
          notaProg = prog.nota;
          colorProg = prog.subida ? 'var(--gnb)' : prog.bajada ? '#fca5a5' : 'var(--sv3)';
          iconProg = prog.subida ? '↑' : prog.bajada ? '↓' : '=';
        }

        const exId = e.id;
        const inputId = `rev_peso_${exId}`;

        html += `<div style="padding:10px 0;border-bottom:0.5px solid rgba(39,39,42,.4)">
          <!-- Header -->
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:2px">${e.nombre}</div>
              ${ult ? `<div style="font-size:11px;color:var(--sv3)">${COACH_LANG==='en'?'Last':'Último'}: ${ult.peso_real}kg×${ult.reps_real}${ult.rir != null ? ' · RIR '+ult.rir : ''}</div>` : '<div style="font-size:11px;color:var(--tx3)">Sin datos aún</div>'}
              ${notaProg ? `<div style="font-size:11px;color:${colorProg};font-weight:600;margin-top:1px">${iconProg} ${notaProg}</div>` : ''}
            </div>
          </div>
          <!-- Serie-by-serie table -->
          <div style="margin-bottom:6px">
            <div style="display:grid;grid-template-columns:28px 1fr 1fr 1fr;gap:4px;padding:4px 0;border-bottom:0.5px solid var(--br);margin-bottom:4px">
              <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;text-align:center">#</div>
              <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;text-align:center">Reps</div>
              <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;text-align:center">Kg obj</div>
              <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;text-align:center">Anterior</div>
            </div>
            ${Array.from({length: e.series}, (_,si) => {
              const ultSerie = ult ? si === e.series-1 ? ult : null : null;
              const pesoSerie = nuevoPeso;
              const repsSerie = e.reps;
              return `<div style="display:grid;grid-template-columns:28px 1fr 1fr 1fr;gap:4px;margin-bottom:4px;align-items:center">
                <div style="font-size:12px;font-weight:700;color:var(--sv3);text-align:center">${si+1}</div>
                <input id="rev_reps_${exId}_${si}" type="number" min="1" max="50" value="${parseFirstNum(repsSerie)||10}"
                  style="padding:6px 4px;border:0.5px solid var(--br);border-radius:8px;background:var(--s2);color:var(--sv);font-size:13px;font-weight:700;text-align:center;font-family:inherit;width:100%"/>
                <div style="display:flex;align-items:center;gap:2px">
                  <button onclick="revAjustarPeso('rev_kg_${exId}_${si}', -2.5)" style="width:20px;height:30px;border-radius:5px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);cursor:pointer;font-size:13px;font-weight:700;flex-shrink:0;padding:0">−</button>
                  <input id="rev_kg_${exId}_${si}" type="number" value="${pesoSerie}" step="2.5" min="0"
                    style="flex:1;min-width:0;padding:6px 2px;border:0.5px solid var(--br);border-radius:8px;background:var(--s2);color:var(--sv);font-size:13px;font-weight:700;text-align:center;font-family:inherit"/>
                  <button onclick="revAjustarPeso('rev_kg_${exId}_${si}', 2.5)" style="width:20px;height:30px;border-radius:5px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);cursor:pointer;font-size:13px;font-weight:700;flex-shrink:0;padding:0">+</button>
                </div>
                <div style="font-size:11px;color:var(--tx3);text-align:center">${ult && si===e.series-1 ? fmtPeso(ult.peso_real) : '—'}</div>
              </div>`;
            }).join('')}
          </div>
          <input type="hidden" id="rev_series_${exId}" value="${e.series}"/>
          <!-- Nota coach -->
          <div>
            <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;margin-bottom:3px">Nota para el cliente</div>
            <input id="rev_nota_${exId}" type="text" value="${e.nota_coach||''}" placeholder="Ej: última serie al fallo, controla la bajada..."
              style="width:100%;padding:7px 10px;border:0.5px solid var(--br);border-radius:8px;background:var(--s2);color:var(--sv);font-size:12px;font-family:inherit"/>
          </div>
        </div>`;
      });

      html += `</div>`;
    });

    // Action buttons
    html += `<div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn" style="flex:1;padding:11px;background:var(--s2);border:0.5px solid var(--br);color:var(--sv2)" onclick="guardarBorrador(${clienteId})">${COACH_LANG==='en'?'💾 Save draft':'💾 Guardar borrador'}</button>
      <button class="btn" style="flex:1;padding:11px;background:var(--gn)" onclick="publicarSemana(${clienteId})">${COACH_LANG==='en'?'✓ Publish week':'✓ Publicar semana'}</button>
    </div>
    <button style="width:100%;margin-top:8px;padding:11px;background:rgba(245,158,11,.12);border:0.5px solid rgba(245,158,11,.3);border-radius:10px;color:var(--amb);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit" onclick="aplicarTodosAjustes(${clienteId})">⚡ Aplicar todos los ajustes sugeridos</button>
    <div style="margin-top:6px;font-size:11px;color:var(--tx3);text-align:center">El cliente no verá los cambios hasta que pulses "Publicar semana"</div>
    <div style="margin-top:10px">
      <button style="width:100%;padding:9px;background:rgba(37,99,235,.08);border:0.5px solid rgba(59,130,246,.2);border-radius:10px;color:var(--blg);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit" onclick="sugerirProgresionIA(${clienteId})">🤖 Sugerir progresión con IA</button>
      <div id="ia_progresion_result" style="margin-top:8px"></div>
    </div>`;

    wrap.innerHTML = html;

  } catch(err) {
    console.log('Error revision semanal:', err);
    wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3)">${tc('Error cargando revisión.')}</div>`;
  }
}

function revAjustarPeso(inputId, delta) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const val = parseFloat(input.value) || 0;
  input.value = Math.max(0, val + delta);
  input.dispatchEvent(new Event('change'));
}

function revMarcarCambio(inputId, pesoOriginal) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const nuevo = parseFloat(input.value) || 0;
  const changed = nuevo !== pesoOriginal;
  input.style.borderColor = changed ? 'var(--bl)' : 'var(--br)';
  input.style.background = changed ? 'rgba(37,99,235,.1)' : 'var(--s2)';
  input.style.color = changed ? 'var(--blg)' : 'var(--sv)';
}

function recogerCambiosRevision(){
  const ejercicios = [];
  document.querySelectorAll('[id^="rev_series_"]').forEach(input => {
    const exId = input.id.replace('rev_series_', '');
    const series = parseInt(input.value) || 3;
    // Collect per-serie kg and reps
    const serieData = [];
    for(let si=0; si<series; si++){
      const kg = parseFloat(document.getElementById(`rev_kg_${exId}_${si}`)?.value) || 0;
      const reps = document.getElementById(`rev_reps_${exId}_${si}`)?.value || '10-12';
      serieData.push({kg, reps});
    }
    // Use first serie as peso_objetivo, join reps as string
    const pesoObj = serieData[0]?.kg || 0;
    const repsStr = [...new Set(serieData.map(s=>s.reps))].join('/');
    ejercicios.push({
      ejercicio_id: parseInt(exId),
      peso_objetivo: pesoObj,
      series,
      reps: repsStr,
      nota_coach: document.getElementById('rev_nota_'+exId)?.value || '',
      descanso: 90,
      series_data: serieData // full per-serie data for future use
    });
  });
  return ejercicios;
}

async function guardarBorrador(clienteId) {
  const btn = event.target;
  btn.textContent = '⏳ Guardando...'; btn.disabled = true;
  try {
    const ejercicios = recogerCambiosRevision();
    await api('/clientes/'+clienteId+'/borrador', {
      method: 'POST',
      body: JSON.stringify({ ejercicios })
    });
    btn.textContent = '💾 Borrador guardado';
    btn.style.background = 'var(--bl2)'; btn.style.color = '#fff';
    setTimeout(()=>{ btn.textContent='💾 Guardar borrador'; btn.style.background='var(--s2)'; btn.style.color='var(--sv2)'; btn.disabled=false; }, 2500);
    // Show pending banner
    const estado = document.getElementById('rev_estado');
    if(estado) estado.textContent = '· Borrador pendiente de publicar';
  } catch(e) { btn.textContent='Error'; btn.disabled=false; }
}

async function publicarSemana(clienteId) {
  const btn = event.target;
  if(!confirm(COACH_LANG==='en'?'Publish changes? The client will see the new routine immediately.':'¿Publicar los cambios? El cliente verá la nueva rutina inmediatamente.')) return;
  btn.textContent = '⏳ Publicando...'; btn.disabled = true;
  try {
    // First save current state as borrador, then publish
    const ejercicios = recogerCambiosRevision();
    await api('/clientes/'+clienteId+'/borrador', {
      method: 'POST',
      body: JSON.stringify({ ejercicios })
    });
    const result = await api('/clientes/'+clienteId+'/borrador/publicar', { method: 'POST' });
    btn.textContent = '✓ Publicado';
    btn.style.background = '#166534'; btn.style.color = '#86efac';
    const estado = document.getElementById('rev_estado');
    if(estado) estado.textContent = `· Publicado (${result.publicados} ejercicios actualizados)`;
    setTimeout(()=>{ btn.textContent='✓ Publicar semana'; btn.style.background='var(--gn)'; btn.style.color='#fff'; btn.disabled=false; }, 3000);
  } catch(e) { btn.textContent='Error'; btn.disabled=false; }
}

async function sugerirProgresionIA(clienteId) {
  const res = document.getElementById('ia_progresion_result');
  res.innerHTML = '<div class="ia-chip" style="padding:8px 12px"><div class="ia-chip-title">Analizando progreso...</div></div>';
  
  try {
    const [cliente, sesiones] = await Promise.all([
      api('/clientes/' + clienteId),
      api('/clientes/' + clienteId + '/sesiones')
    ]);
    
    const nivel = cliente.nivel;
    const volRec = VOL_RECOMENDADO[nivel] || VOL_RECOMENDADO.Intermedio;
    
    // Summarize last 4 sessions
    const resumenSesiones = sesiones.slice(0, 4).map(s => {
      const series = s.series.map(sr => `${sr.ejercicio_nombre}: ${sr.peso_real}kg×${sr.reps_real}${sr.rir != null ? ' RIR'+sr.rir : ''}`).join(', ');
      return `${s.dia_nombre} (${new Date(s.fecha).toLocaleDateString(LANG==='en'?'en-GB':'es-ES')}): ${series}`;
    }).join('\n');

    const ejerciciosPlan = (cliente.dias || []).flatMap(d =>
      d.ejercicios.map(e => `${e.nombre}: obj ${e.peso_objetivo}kg × ${e.reps}, RIR obj ${e.rir || 2}${e.es_principal ? ' [PRINCIPAL]' : ''}`)
    ).join('\n');

    const semanas = cliente.semanas || 1;
    const fase = semanas % 4 === 0 ? 'DESCARGA (semana 4 del mesociclo)' : `CARGA (semana ${semanas % 4 || 4} de 4)`;

    const prompt = `Analiza el progreso de este cliente y sugiere ajustes concretos para la próxima semana.

CLIENTE: ${cliente.nombre}
Nivel: ${nivel} | Objetivo: ${cliente.objetivo} | Semana ${semanas} | Fase: ${fase}
Volumen recomendado: ${volRec.desc}

RUTINA ACTUAL:
${ejerciciosPlan}

ÚLTIMAS SESIONES:
${resumenSesiones}

${COACH_LANG==='en'?'Respond in English, max 150 words.':'Responde en español, máximo 150 palabras.'} Sé directo y específico. Indica:
1. Qué ejercicios subir de carga y cuánto
2. Si hay que ajustar volumen (series/semana)
3. Si toca descarga o progresión
4. Alguna observación sobre el RIR del cliente`;

    const d = await api('/ia/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        system: COACH_LANG==='en'?'You are an expert coach in periodization and strength progression. Analyze real training data and give concrete practical recommendations. Always in English.':'Eres un coach experto en periodización y progresión de fuerza. Analizas datos reales de entreno y das recomendaciones concretas y prácticas. Responde en español.'
      })
    });

    res.innerHTML = `<div class="ia-chip"><div class="ia-chip-title">🤖 Sugerencia IA para próxima semana</div><div class="ia-result-body" style="white-space:pre-line">${d.reply}</div></div>`;

  } catch(e) {
    res.innerHTML = '<div style="font-size:12px;color:#f87171">Error. Verifica la API key.</div>';
  }
}


// ═══ DESCRIPCIONES DE EJERCICIOS EN ESPAÑOL ═══════════════════
