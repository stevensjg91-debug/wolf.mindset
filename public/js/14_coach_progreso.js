/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 14_coach_progreso.js
   Dashboard coach: hProgreso(), cargarDashboard(), cargarMetricasAvanzadas(), calc1RM()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

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
  const btn = event?.target;
  if(btn) { btn.textContent = '⏳ '+(COACH_LANG==='en'?'Applying...':'Aplicando...'); btn.disabled = true; }

  try {
    const c = window._coachClienteActual;
    if(!c) throw new Error('No hay cliente cargado');

    const sesiones = await api('/clientes/'+clienteId+'/sesiones');
    const nivel = c.nivel || 'Intermedio';

    // Mapear último rendimiento por ejercicio
    const ultimoRendimiento = {};
    sesiones.forEach(s => {
      s.series.forEach(sr => {
        if(!ultimoRendimiento[sr.ejercicio_nombre] ||
           new Date(s.fecha) > new Date(ultimoRendimiento[sr.ejercicio_nombre].fecha)) {
          ultimoRendimiento[sr.ejercicio_nombre] = { ...sr, fecha: s.fecha };
        }
      });
    });

    let aplicados = 0;
    const promesas = [];

    c.dias.forEach(d => {
      d.ejercicios.forEach(e => {
        const ult = ultimoRendimiento[e.nombre];
        if(ult && ult.rir != null) {
          const prog = calcularProgresion(e.peso_objetivo || 0, ult.reps_real, ult.rir, e.rir || 2, nivel);
          if(prog.subida || prog.bajada) {
            aplicados++;
            promesas.push(
              api('/ejercicios/'+e.id, {
                method: 'PUT',
                body: JSON.stringify({
                  series: e.series, reps: e.reps,
                  peso_objetivo: prog.nuevoPeso,
                  descanso: e.descanso, rir: e.rir,
                  es_principal: e.es_principal,
                  youtube_url: e.youtube_url || '',
                  nota_coach: e.nota_coach || ''
                })
              })
            );
          }
        }
      });
    });

    await Promise.all(promesas);

    // Recargar cliente
    const cActualizado = await api('/clientes/'+clienteId);
    window._coachClienteActual = cActualizado;

    if(btn) {
      btn.textContent = aplicados > 0 ? `✓ ${aplicados} ${COACH_LANG==='en'?'adjustments applied':'ajustes aplicados'}` : '✓ '+(COACH_LANG==='en'?'No changes':'Sin cambios');
      btn.style.background = 'var(--gn)';
      setTimeout(() => {
        btn.textContent = '⚡ '+tc('Aplicar todos los ajustes'); btn.disabled = false;
        btn.style.background = '';
        // Recargar revisión semanal
        cargarRevisionSemanal(clienteId, cActualizado);
      }, 2500);
    }

  } catch(e) {
    if(btn) { btn.textContent = 'Error: '+e.message; btn.disabled = false; }
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

