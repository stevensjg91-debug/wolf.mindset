/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 27_graficas.js
   Gráficas SVG de progreso: cargarGraficasCliente(), renderGraficaSVG(), cargarGraficasCoach()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ GRÁFICAS DE PROGRESO ══════════════════════════════════════
async function cargarGraficasCliente(){
  const wrap = document.getElementById('progreso_graficas_wrap');
  if(!wrap) return;
  try {
    const principales = [];
    (CD.dias||[]).forEach(d=>{
      (d.ejercicios||[]).forEach(e=>{
        if(e.es_principal && !principales.find(p=>p===e.nombre)) principales.push(e.nombre);
      });
    });

    const sesiones = await api('/clientes/'+CD.id+'/sesiones').catch(()=>[]);
    let prsHtml = '';
    let graficasHtml = '';

    if(sesiones.length) {
      const prs = {};
      const historial = {}; // { nombre: [{fecha, peso, reps}] }

      sesiones.forEach(s=>{
        s.series.forEach(sr=>{
          const p = sr.peso_real||0, r = sr.reps_real||0;
          if(!p) return;
          const rm1 = calcular1RM(p, r);
          if(!prs[sr.ejercicio_nombre] || rm1 > prs[sr.ejercicio_nombre].rm1) {
            prs[sr.ejercicio_nombre] = { rm1, peso:p, reps:r, fecha:s.fecha };
          }
          if(!historial[sr.ejercicio_nombre]) historial[sr.ejercicio_nombre] = [];
          historial[sr.ejercicio_nombre].push({ fecha:s.fecha, peso_real:p, reps_real:r, rir:sr.rir });
        });
      });

      // ── PRs ──────────────────────────────────────────────────────
      const prsList = Object.entries(prs)
        .sort((a,b)=>{ const pa=principales.includes(a[0])?1:0, pb=principales.includes(b[0])?1:0; return pb-pa; })
        .slice(0,8);
      if(prsList.length) {
        const locale = LANG==='en'?'en-GB':'es-ES';
        prsHtml = `<div class="sec-lbl" style="margin-top:4px">${t('🏆 Mis marcas personales')}</div>
          <div style="padding:0 14px 8px">
            ${prsList.map(([nom, d])=>{
              const esPrincipal = principales.includes(nom);
              const fechaStr = new Date(d.fecha).toLocaleDateString(locale,{day:'numeric',month:'short',year:'2-digit'});
              return `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:0.5px solid var(--br)">
                <div>
                  <div style="font-size:12px;font-weight:700;color:var(--sv)">${esPrincipal?'⭐ ':''}${nom}</div>
                  <div style="font-size:10px;color:var(--tx3)">${fmtPeso(d.peso)} × ${d.reps} ${t('reps')} · ${fechaStr}</div>
                </div>
                <div style="text-align:right;flex-shrink:0;margin-left:10px">
                  <div style="font-size:16px;font-weight:800;color:var(--gnb)">${fmtPeso(d.rm1)}</div>
                  <div style="font-size:9px;color:var(--tx3)">${t('1RM est.')}</div>
                </div>
              </div>`;
            }).join('')}
          </div>`;
      }

      // ── Gráficas ejercicios principales ──────────────────────────
      const principalesConHistorial = principales.filter(n => historial[n] && historial[n].length >= 2);
      if(principalesConHistorial.length) {
        graficasHtml = `<div class="sec-lbl" style="margin-top:4px">${t('Progreso ejercicios principales')}</div>
          <div style="padding:0 14px 8px">
            ${principalesConHistorial.slice(0,4).map(nom => renderGraficaSVG(nom, historial[nom])).join('')}
          </div>`;
      }
    }

    wrap.innerHTML = prsHtml + graficasHtml;

  } catch(e){ console.log('Error graficas:', e); }
}

function renderGraficaSVG(nombre, data){
  // Group by date - take max peso per session
  const byDate = {};
  data.forEach(d=>{
    const fecha = d.fecha ? d.fecha.split('T')[0] : d.fecha;
    if(!byDate[fecha] || d.peso_real > byDate[fecha].peso) {
      byDate[fecha] = { peso: d.peso_real, reps: d.reps_real, rir: d.rir };
    }
  });
  const puntos = Object.entries(byDate).sort((a,b)=>a[0].localeCompare(b[0]));
  if(puntos.length < 1) return '';

  const W=320, H=120, PAD={t:10,r:10,b:30,l:40};
  const iW=W-PAD.l-PAD.r, iH=H-PAD.t-PAD.b;
  const pesos = puntos.map(p=>p[1].peso);
  const minP = Math.max(0, Math.min(...pesos)*0.9);
  const maxP = Math.max(...pesos)*1.05 || 1;
  const scaleX = i => PAD.l + (puntos.length===1 ? iW/2 : i/(puntos.length-1)*iW);
  const scaleY = v => PAD.t + iH - ((v-minP)/(maxP-minP||1))*iH;

  // Line path
  const linePath = puntos.map((p,i)=>`${i===0?'M':'L'}${scaleX(i).toFixed(1)},${scaleY(p[1].peso).toFixed(1)}`).join(' ');
  // Area path
  const areaPath = linePath + ` L${scaleX(puntos.length-1).toFixed(1)},${(PAD.t+iH).toFixed(1)} L${scaleX(0).toFixed(1)},${(PAD.t+iH).toFixed(1)} Z`;

  // Y axis labels
  const yLabels = [minP, (minP+maxP)/2, maxP].map(v=>`
    <text x="${PAD.l-4}" y="${scaleY(v).toFixed(1)}" fill="#52525b" font-size="9" text-anchor="end" dominant-baseline="middle">${Math.round(v)}</text>
    <line x1="${PAD.l}" y1="${scaleY(v).toFixed(1)}" x2="${W-PAD.r}" y2="${scaleY(v).toFixed(1)}" stroke="#27272a" stroke-width="0.5"/>`).join('');

  // X axis labels (max 4)
  const step = Math.max(1, Math.floor(puntos.length/4));
  const xLabels = puntos.filter((_,i)=>i%step===0||i===puntos.length-1).map((p,_,arr)=>{
    const i = puntos.indexOf(p);
    const d = new Date(p[0]);
    const label = `${d.getDate()}/${d.getMonth()+1}`;
    return `<text x="${scaleX(i).toFixed(1)}" y="${H-6}" fill="#52525b" font-size="9" text-anchor="middle">${label}</text>`;
  }).join('');

  // Dots + tooltips
  const dots = puntos.map((p,i)=>`
    <circle cx="${scaleX(i).toFixed(1)}" cy="${scaleY(p[1].peso).toFixed(1)}" r="3" fill="#3b82f6" stroke="#1e3a5f" stroke-width="1.5"/>
    <title>${p[0]}: ${fmtPeso(p[1].peso)} × ${p[1].reps} reps${p[1].rir!=null?' · RIR '+p[1].rir:''}</title>`).join('');

  // Last value
  const last = puntos[puntos.length-1];
  const prev = puntos.length > 1 ? puntos[puntos.length-2] : null;
  const diff = prev ? (last[1].peso - prev[1].peso) : 0;
  const diffDisp = isImperial() ? diff*2.20462 : diff;
  const diffStr = diff > 0 ? `+${diffDisp.toFixed(1)}${pesoLabel()}` : diff < 0 ? `${diffDisp.toFixed(1)}${pesoLabel()}` : '';
  const diffColor = diff > 0 ? '#86efac' : diff < 0 ? '#fca5a5' : '#a1a1aa';

  return `<div style="background:var(--s);border:0.5px solid var(--br);border-radius:12px;padding:12px;margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
      <div style="font-size:12px;font-weight:700;color:var(--sv)">${nombre}</div>
      <div style="text-align:right">
        <span style="font-size:16px;font-weight:800;color:var(--sv)">${fmtPeso(last[1].peso)}</span>
        ${diffStr?` <span style="font-size:11px;font-weight:600;color:${diffColor}">${diffStr}</span>`:''}
      </div>
    </div>
    <div style="font-size:10px;color:var(--tx3);margin-bottom:8px">${puntos.length} ${LANG==='en'?(puntos.length===1?'session':'sessions'):(puntos.length===1?'sesión':'sesiones')}${last[1].rir!=null?' · RIR '+last[1].rir:''}</div>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;overflow:visible">
      <defs>
        <linearGradient id="grad_${nombre.replace(/\s/g,'_')}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.03"/>
        </linearGradient>
      </defs>
      ${yLabels}
      ${xLabels}
      <path d="${areaPath}" fill="url(#grad_${nombre.replace(/\s/g,'_')})" stroke="none"/>
      <path d="${linePath}" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>
  </div>`;
}

// Coach también puede ver gráficas en verCliente
async function cargarGraficasCoach(clienteId, ejerciciosPrincipales){
  const wrap = document.getElementById('graficas_coach_wrap');
  if(!wrap||!ejerciciosPrincipales.length) return;
  wrap.innerHTML = '';
  for(const ejercicio of ejerciciosPrincipales){
    const data = await api('/clientes/'+clienteId+'/progreso-ejercicio?ejercicio='+encodeURIComponent(ejercicio));
    if(!data.length) continue;
    wrap.innerHTML += renderGraficaSVG(ejercicio, data);
  }
}

// Reposition keyboard when Safari URL bar shows/hides
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',()=>{
    const kb=document.getElementById('strong_keyboard');
    if(!kb||kb.style.display==='none')return;
    const bnav=document.querySelector('#sCliente .bnav-bar');
    const bnavH=bnav?bnav.offsetHeight:60;
    const urlBarH=Math.max(0,window.innerHeight-window.visualViewport.height);
    kb.style.bottom=(bnavH+urlBarH)+'px';
  });
}

// ═══ SONIDOS ══════════════════════════════════════════
const AudioCtx = window.AudioContext || window.webkitAudioContext;
