/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 20_cliente_progreso.js
   Progreso cliente: hProgreso2(), renderFotosProgreso(), guardarMediciones(), renderPesoTendencia()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

function hProgreso2(){return`<div style="padding-top:8px">
  ${CD.mensaje_semana?`<div class="motiv-card"><div style="overflow:hidden"><div id="motiv_msg_txt" data-clamp="3" data-expanded="0" style="font-size:14px;color:var(--sv2);line-height:1.7;font-weight:500;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden">${CD.mensaje_semana}</div></div>${CD.mensaje_semana.length>100?`<button onclick="toggleCoachComment('motiv_msg_txt',this)" style="background:none;border:none;color:var(--blg);font-size:11px;font-weight:700;cursor:pointer;margin-top:6px;padding:0;font-family:inherit">${t('Ver más')} ▾</button>`:''}</div>`:''}
  <div class="stats-g">
    <div class="stat-card"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-weight:600">${t('Semanas')}</div><div style="font-size:22px;font-weight:700;color:var(--sv)">${CD.semanas}</div></div>
    <div class="stat-card"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-weight:600">${t('Objetivo')}</div><div style="font-size:15px;font-weight:700;color:var(--sv)">${t(CD.objetivo||'')}</div></div>
    <div class="stat-card"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-weight:600">${t('Nivel')}</div><div style="font-size:15px;font-weight:700;color:var(--sv)">${t(CD.nivel||'')}</div></div>
    <div class="stat-card"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-weight:600">${t('Días/sem')}</div><div style="font-size:22px;font-weight:700;color:var(--sv)">${CD.dias.length}</div></div>
  </div>
  <div id="progreso_graficas_wrap"></div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin:0 14px 6px">
    <div class="sec-lbl" style="margin:0">${t('Medición semanal')}</div>
    <div id="peso_edit_btn_wrap"></div>
  </div>
  <div id="peso_section" style="margin:0 14px 12px;background:var(--s);border:0.5px solid var(--br);border-radius:14px;padding:14px">
    <div id="peso_guardado_view" style="display:none;margin-bottom:10px">
      <div style="font-size:13px;color:var(--tx3);margin-bottom:4px">${t('Registrado esta semana')}</div>
      <div style="display:flex;align-items:baseline;gap:16px;flex-wrap:wrap">
        <div style="font-size:28px;font-weight:700;color:var(--sv);font-family:'Bebas Neue',sans-serif" id="peso_guardado_val">—</div>
        <div id="medidas_guardadas_view" style="font-size:13px;color:var(--tx3)"></div>
      </div>
    </div>
    <div id="peso_input_wrap">
      <div style="display:grid;grid-template-columns:1fr ${CD.sexo==='Mujer'?'1fr 1fr':'1fr'};gap:10px;margin-bottom:12px">
        <div>
          <div class="form-lbl">⚖️ ${t('Peso')} (${pesoLabel()})</div>
          <input class="inp" id="np" type="number" step="${isImperial()?'0.5':'0.1'}" placeholder="${pesoPlaceholder()}" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/>
        </div>
        <div>
          <div class="form-lbl">📏 ${t('Cintura')} (${cinturaLabel()})</div>
          <input class="inp" id="medida_cintura" type="number" step="0.1" placeholder="${cinturaPlaceholder()}" value="${CD.cintura_actual?(isImperial()?(CD.cintura_actual/2.54).toFixed(1):CD.cintura_actual):''}" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/>
        </div>
        ${CD.sexo==='Mujer'?`<div>
          <div class="form-lbl">📐 ${t('Cadera')} (${cinturaLabel()})</div>
          <input class="inp" id="medida_cadera" type="number" step="0.1" placeholder="${isImperial()?'38':'96'}" value="${CD.cadera?(isImperial()?(CD.cadera/2.54).toFixed(1):CD.cadera):''}" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/>
        </div>`:''}
      </div>
      <button class="btn" style="width:100%;padding:13px;font-size:15px" onclick="guardarMediciones()">${t('Guardar mediciones')}</button>
    </div>
  </div>
  <div class="sec-lbl">${t('Fotos de progreso')}</div>
  <div style="padding:0 14px 12px">
    <!-- 3 foto slots -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
      ${['frente','posterior','costado'].map(tipo=>`
      <div style="display:flex;flex-direction:column;gap:4px">
        <label for="fUp_${tipo}" style="cursor:pointer;display:block">
          <!-- Guide grid -->
          <div style="aspect-ratio:3/4;border:1.5px dashed rgba(59,130,246,.4);border-radius:10px;background:var(--s2);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden">
            <!-- Human silhouette SVG guide -->
            <svg viewBox="0 0 60 80" style="width:50%;opacity:.2;position:absolute" fill="none" xmlns="http://www.w3.org/2000/svg">
              ${tipo==='frente'?`
              <circle cx="30" cy="10" r="8" fill="#93c5fd"/>
              <path d="M18 22 Q30 18 42 22 L44 50 H16 Z" fill="#93c5fd"/>
              <path d="M16 25 L8 45 M44 25 L52 45" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>
              <path d="M20 50 L18 75 M40 50 L42 75" stroke="#93c5fd" stroke-width="5" stroke-linecap="round"/>
              `:tipo==='posterior'?`
              <circle cx="30" cy="10" r="8" fill="#93c5fd"/>
              <path d="M18 22 Q30 18 42 22 L44 50 H16 Z" fill="#93c5fd"/>
              <path d="M16 25 L8 45 M44 25 L52 45" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>
              <path d="M20 50 L18 75 M40 50 L42 75" stroke="#93c5fd" stroke-width="5" stroke-linecap="round"/>
              `:`
              <circle cx="28" cy="10" r="8" fill="#93c5fd"/>
              <path d="M22 22 Q28 18 36 22 L38 50 H18 Z" fill="#93c5fd"/>
              <path d="M18 25 L10 45 M38 25 L42 44" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>
              <path d="M20 50 L19 75 M36 50 L37 75" stroke="#93c5fd" stroke-width="5" stroke-linecap="round"/>
              `}
            </svg>
            <!-- Grid lines -->
            <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.08) 1px,transparent 1px);background-size:33% 25%"></div>
            <!-- Uploaded photo preview -->
            <div id="foto_preview_${tipo}" style="position:absolute;inset:0;display:none">
              <img id="foto_img_${tipo}" style="width:100%;height:100%;object-fit:cover"/>
              <div style="position:absolute;top:4px;right:4px;background:rgba(34,197,94,.9);border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px">✓</div>
            </div>
            <div style="position:relative;z-index:1;text-align:center;padding:6px">
              <div style="font-size:18px;margin-bottom:4px">📷</div>
              <div style="font-size:10px;font-weight:700;color:var(--sv2);text-transform:uppercase;letter-spacing:.05em">${t(tipo)}</div>
            </div>
          </div>
        </label>
        <input type="file" id="fUp_${tipo}" accept="image/*" style="display:none" onchange="uploadFotoTipo(event,'${tipo}')"/>
      </div>`).join('')}
    </div>
    <div style="font-size:11px;color:var(--tx3);text-align:center;margin-bottom:10px;line-height:1.5">
      ${t("Sube las 3 fotos para que tu coach pueda hacer una valoración completa.")}<br>
      📏 Posición: de pie, cuerpo entero, buena iluminación.
    </div>
    <!-- Analizar fotos solo disponible para coach desde su panel -->
  </div>
  <!-- Gráfica tendencia peso -->
  <div id="peso_tendencia_wrap" style="padding:0 14px 12px"></div>
  <input type="file" id="fUp" accept="image/*" style="display:none" onchange="uploadFoto(event)"/>
  <div id="fLoad" style="display:none;padding:0 14px 10px"><div class="ia-chip"><div class="ia-chip-title">Analizando tu progreso...</div></div></div>
  <!-- Fotos timeline con comentarios del coach -->
  <div id="fotos_timeline" style="padding:0 14px"></div>
  <div id="fAn" style="padding:0 14px 10px"></div>
</div>`;}

// Renderiza en el perfil del cliente sus fotos agrupadas por mes
// y muestra el comentario del coach (published_analysis) si existe
async function renderFotosProgreso() {
  const wrap = document.getElementById('fotos_timeline');
  if (!wrap) return;
  // Recargar datos frescos del servidor (el coach puede haber publicado un análisis)
  try {
    const fresh = await api('/clientes/'+CD.id);
    if(fresh?.fotos) CD.fotos = fresh.fotos;
  } catch(e) {}

  const fotos = CD?.fotos || [];
  if (!fotos.length) { wrap.innerHTML = ''; return; }

  const grupos = {};
  fotos.forEach(f => {
    const mes = f.fecha ? f.fecha.slice(0, 7) : 'sin-fecha';
    if (!grupos[mes]) grupos[mes] = [];
    grupos[mes].push(f);
  });

  const meses = Object.keys(grupos).sort().reverse();

  wrap.innerHTML = `<div class="sec-lbl" style="margin-top:4px">${t('Mis fotos')}</div>` + meses.map(mes => {
    const fotosMes = grupos[mes];
    const label = mes !== 'sin-fecha'
      ? new Date(mes+'-15').toLocaleDateString(LANG==='en'?'en-GB':'es-ES',{month:'long',year:'numeric'})
      : t('Sin fecha');
    const fotoConComentario = fotosMes.find(f => f.published_analysis);
    const comentarioCoach = fotoConComentario?.published_analysis;
    const mesId = mes.replace('-','_');

    const fotosHtml = fotosMes.map(f => {
      const tipoLabel = f.tipo==='posterior'?'🔙':f.tipo==='costado'?'↔️':'🫡';
      return `<div style="flex:1;min-width:80px;max-width:120px">
        <div style="font-size:9px;color:var(--tx3);text-align:center;margin-bottom:3px">${tipoLabel} ${t(f.tipo||'frente')}</div>
        <div style="border-radius:10px;overflow:hidden;aspect-ratio:3/4;background:var(--s2)">
          ${f.url&&!f.url.startsWith('foto_')
            ?`<img src="${f.url}" style="width:100%;height:100%;object-fit:cover"/>`
            :`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px">📷</div>`}
        </div>
      </div>`;
    }).join('');

    return `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:14px;padding:14px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:700;color:var(--sv);margin-bottom:10px">📅 ${label}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:${comentarioCoach?'12px':'0'}">
        ${fotosHtml}
      </div>
      ${comentarioCoach?`
  <div style="border:0.5px solid rgba(59,130,246,.25);border-radius:10px;overflow:hidden">
    <button onclick="
      var body=document.getElementById('coach_acc_${mesId}');
      var arrow=document.getElementById('coach_arr_${mesId}');
      var open=body.style.maxHeight&&body.style.maxHeight!=='0px';
      body.style.maxHeight=open?'0px':body.scrollHeight+'px';
      body.style.opacity=open?'0':'1';
      arrow.style.transform=open?'rotate(0deg)':'rotate(180deg)';
    " style="width:100%;display:flex;align-items:center;justify-content:space-between;background:rgba(37,99,235,.07);border:none;padding:10px 12px;cursor:pointer;font-family:inherit;gap:8px">
      <div style="display:flex;align-items:center;gap:7px">
        <span style="font-size:15px">💬</span>
        <span style="font-size:10px;font-weight:700;color:var(--blg);text-transform:uppercase;letter-spacing:.07em">${t('Valoración del coach')}</span>
      </div>
      <span id="coach_arr_${mesId}" style="color:var(--blg);font-size:12px;transition:transform .3s;display:inline-block">▾</span>
    </button>
    <div id="coach_acc_${mesId}" style="max-height:0px;opacity:0;overflow:hidden;transition:max-height .35s ease,opacity .25s ease">
      <div style="padding:12px;font-size:13px;color:var(--sv);line-height:1.6;background:rgba(37,99,235,.04)">${comentarioCoach}</div>
    </div>
  </div>`:''}
    </div>`;
  }).join('');
}

function toggleCoachComment(id, btn){
  const el=document.getElementById(id);
  if(!el)return;
  const expanded = el.getAttribute('data-expanded')==='1';
  if(!expanded){
    el.style.display='block';
    el.style.webkitLineClamp='unset';
    el.style.overflow='visible';
    el.setAttribute('data-expanded','1');
    btn.textContent=t('Ver menos')+' ▴';
  } else {
    el.style.display='-webkit-box';
    el.style.webkitLineClamp=el.getAttribute('data-clamp')||'3';
    el.style.overflow='hidden';
    el.setAttribute('data-expanded','0');
    btn.textContent=t('Ver más')+' ▾';
  }
}

async function guardarMediciones(){
  const pesoInput = parseFloat(document.getElementById('np')?.value);
  const cinturaInput = parseFloat(document.getElementById('medida_cintura')?.value)||null;
  const caderaInput = parseFloat(document.getElementById('medida_cadera')?.value)||null;
  if(!pesoInput) return;
  const pesoKg = fromPeso(pesoInput);
  const cinturaCm = cinturaInput ? fromCintura(cinturaInput) : null;
  const caderaCm = caderaInput ? fromCintura(caderaInput) : null;
  await api('/clientes/'+CD.id+'/peso',{method:'POST',body:JSON.stringify({peso:pesoKg,grasa:null})});
  if(cinturaCm||caderaCm){
    const upd={};
    if(cinturaCm) upd.cintura_actual=cinturaCm;
    if(caderaCm) upd.cadera=caderaCm;
    await api('/clientes/'+CD.id+'/perfil',{method:'PUT',body:JSON.stringify(upd)});
  }
  await loadCD(CD.id);
  localStorage.setItem('wm_ultimo_peso_'+CD.id, Date.now());
  pesoModoVer(pesoKg, cinturaCm, caderaCm);
}
async function guardarPeso(){ return guardarMediciones(); }

function pesoModoVer(pesoKg, cinturaCm, caderaCm){
  const inp=document.getElementById('peso_input_wrap');
  const view=document.getElementById('peso_guardado_view');
  const val=document.getElementById('peso_guardado_val');
  const wrap=document.getElementById('peso_edit_btn_wrap');
  const medidasView=document.getElementById('medidas_guardadas_view');
  if(inp) inp.style.display='none';
  if(view) view.style.display='block';
  const pesoReal=pesoKg||CD.pesos?.slice(-1)[0]?.peso;
  if(val) val.textContent=fmtPeso(pesoReal)+' ✓';
  if(medidasView){
    const c=cinturaCm||CD.cintura_actual;
    const ca=caderaCm||CD.cadera;
    const parts=[];
    if(c) parts.push('📏 '+fmtCintura(c));
    if(ca) parts.push('📐 '+fmtCintura(ca));
    medidasView.textContent=parts.join(' · ');
  }
  if(wrap) wrap.innerHTML=`<button onclick="pesoModoEditar()" style="padding:6px 14px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">✏️ ${t('Corregir')}</button>`;
}

function pesoModoEditar(){
  const inp=document.getElementById('peso_input_wrap');
  const view=document.getElementById('peso_guardado_view');
  const wrap=document.getElementById('peso_edit_btn_wrap');
  if(inp) inp.style.display='block';
  if(view) view.style.display='none';
  if(wrap) wrap.innerHTML='';
  document.getElementById('np')?.focus();
}

function initPesoSection(){
  const ultima=parseInt(localStorage.getItem('wm_ultimo_peso_'+CD.id)||'0');
  const SEMANA=7*24*60*60*1000;
  const yaEsta = ultima && (Date.now()-ultima) < SEMANA;
  if(yaEsta){
    const ultimoPeso=CD.pesos?.length?CD.pesos[CD.pesos.length-1].peso:null;
    if(ultimoPeso) pesoModoVer(ultimoPeso, CD.cintura_actual, CD.cadera);
  }
  renderPesoTendencia();
}

function renderPesoTendencia(){
  const wrap = document.getElementById('peso_tendencia_wrap');
  if(!wrap) return;
  const pesos = (CD.pesos||[]).filter(p=>p.peso>0).slice(-20); // últimos 20 registros
  if(pesos.length < 3){ wrap.innerHTML=''; return; }

  // Media móvil de 3 puntos (tendencia suavizada)
  const tendencia = pesos.map((p,i,arr) => {
    if(i===0) return p.peso;
    if(i===arr.length-1) return p.peso;
    return (arr[i-1].peso + p.peso + arr[i+1].peso) / 3;
  });

  const W=320, H=110, PAD={t:12,r:10,b:28,l:38};
  const iW=W-PAD.l-PAD.r, iH=H-PAD.t-PAD.b;
  const pesoVals = pesos.map(p=>p.peso);
  const minP = Math.min(...pesoVals)*0.995;
  const maxP = Math.max(...pesoVals)*1.005;
  const scX = i => PAD.l + (pesos.length<2 ? iW/2 : i/(pesos.length-1)*iW);
  const scY = v => PAD.t + iH - ((v-minP)/(maxP-minP||1))*iH;

  // Línea real (puntos)
  const linePath = pesos.map((p,i)=>`${i===0?'M':'L'}${scX(i).toFixed(1)},${scY(p.peso).toFixed(1)}`).join(' ');
  // Línea tendencia suavizada
  const tendPath = tendencia.map((v,i)=>`${i===0?'M':'L'}${scX(i).toFixed(1)},${scY(v).toFixed(1)}`).join(' ');

  // Área bajo tendencia
  const areaPath = tendPath + ` L${scX(pesos.length-1).toFixed(1)},${(PAD.t+iH).toFixed(1)} L${scX(0).toFixed(1)},${(PAD.t+iH).toFixed(1)} Z`;

  // Dirección de la tendencia
  const diff = tendencia[tendencia.length-1] - tendencia[0];
  const objetivo = CD.objetivo||'';
  const esBajar = objetivo.toLowerCase().includes('def') || objetivo.toLowerCase().includes('perder');
  const esBueno = (esBajar && diff < 0) || (!esBajar && diff > 0);
  const trendColor = Math.abs(diff) < 0.3 ? '#a1a1aa' : esBueno ? '#22c55e' : '#f59e0b';
  const trendIcon = diff < -0.3 ? '↘' : diff > 0.3 ? '↗' : '→';
  const trendLabel = diff < -0.3
    ? `${isImperial()?(Math.abs(diff)*2.20462).toFixed(1):Math.abs(diff).toFixed(1)}${pesoLabel()} ${LANG==='en'?'less':'menos'}`
    : diff > 0.3 ? `+${isImperial()?(diff*2.20462).toFixed(1):diff.toFixed(1)}${pesoLabel()}`
    : (LANG==='en'?'Stable weight':'Peso estable');

  // Eje Y (3 labels)
  const yLabels = [minP, (minP+maxP)/2, maxP].map(v=>`
    <text x="${PAD.l-4}" y="${scY(v).toFixed(1)}" fill="#52525b" font-size="8.5" text-anchor="end" dominant-baseline="middle">${v.toFixed(1)}</text>
    <line x1="${PAD.l}" y1="${scY(v).toFixed(1)}" x2="${W-PAD.r}" y2="${scY(v).toFixed(1)}" stroke="#27272a" stroke-width="0.5"/>`).join('');

  // Eje X (fechas, máx 4)
  const step = Math.max(1, Math.floor(pesos.length/4));
  const xLabels = pesos.filter((_,i)=>i%step===0||i===pesos.length-1).map(p=>{
    const idx = pesos.indexOf(p);
    const d = new Date(p.fecha||'');
    const lbl = isNaN(d)?'?':`${d.getDate()}/${d.getMonth()+1}`;
    return `<text x="${scX(idx).toFixed(1)}" y="${H-5}" fill="#52525b" font-size="8.5" text-anchor="middle">${lbl}</text>`;
  }).join('');

  // Puntos
  const dots = pesos.map((p,i)=>`<circle cx="${scX(i).toFixed(1)}" cy="${scY(p.peso).toFixed(1)}" r="2.5" fill="#3b82f6" opacity=".7"/>`).join('');

  const trendColorName = trendColor==='#22c55e'?(LANG==='en'?'green':'verde'):trendColor==='#f59e0b'?(LANG==='en'?'amber':'ámbar'):(LANG==='en'?'grey':'gris');
  const legendText = LANG==='en'
    ? `Blue line: actual records · ${trendColorName.charAt(0).toUpperCase()+trendColorName.slice(1)} line: smoothed trend`
    : `Línea azul: registros reales · Línea ${trendColorName}: tendencia suavizada`;
  const recordsText = LANG==='en'
    ? `${pesos.length} records · ${fmtPeso(pesos[0]?.peso)} → ${fmtPeso(pesos[pesos.length-1]?.peso)}`
    : `${pesos.length} registros · ${fmtPeso(pesos[0]?.peso)} → ${fmtPeso(pesos[pesos.length-1]?.peso)}`;

  wrap.innerHTML = `
    <div class="sec-lbl" style="margin-bottom:6px">${t('📈 Tendencia de peso')}</div>
    <div style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;padding:10px 12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:11px;color:var(--tx3)">${recordsText}</div>
        <div style="font-size:13px;font-weight:700;color:${trendColor}">${trendIcon} ${trendLabel}</div>
      </div>
      <svg width="100%" viewBox="0 0 ${W} ${H}" style="overflow:visible">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${trendColor}" stop-opacity=".15"/>
            <stop offset="100%" stop-color="${trendColor}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${yLabels}${xLabels}
        <path d="${areaPath}" fill="url(#tg)"/>
        <path d="${linePath}" stroke="#3b82f6" stroke-width="1" fill="none" stroke-dasharray="3,3" opacity=".5"/>
        <path d="${tendPath}" stroke="${trendColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}
      </svg>
      <div style="font-size:9px;color:var(--tx3);margin-top:4px">${legendText}</div>
    </div>`;
}

async function uploadFoto(event){
  const file=event.target.files[0];if(!file)return;
  document.getElementById('fLoad').style.display='block';document.getElementById('fAn').innerHTML='';
  const reader=new FileReader();
  reader.onload=async function(e){
    const b64full=e.target.result,mt=b64full.split(';')[0].split(':')[1],img=b64full.split(',')[1];
    try{
      const d=await api('/ia/foto',{method:'POST',body:JSON.stringify({imageBase64:img,mediaType:mt,system:`Valoración de progreso WolfMindset. Analiza la foto (objetivo: ${CD.objetivo}, nivel: ${CD.nivel}, semana ${CD.semanas}). Directo, motivador. Sin mencionar tecnología. 4 frases: mejora visible, punto fuerte, motivación, recomendación concreta.`})});

      // ── Subir a Cloudinary si está configurado ──────────────────
      let urlFinal = 'foto_'+Date.now();
      const cloudName = window.CLOUDINARY_CLOUD_NAME;
      const uploadPreset = window.CLOUDINARY_UPLOAD_PRESET;
      if(cloudName && uploadPreset){
        try{
          const formData = new FormData();
          formData.append('file', b64full);
          formData.append('upload_preset', uploadPreset);
          formData.append('folder', 'wolfmindset/fotos');
          const cdnRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{method:'POST',body:formData});
          const cdnData = await cdnRes.json();
          if(cdnData.secure_url) urlFinal = cdnData.secure_url;
        }catch(ce){ console.log('Cloudinary error:', ce); }
      }

      await api('/clientes/'+CD.id+'/fotos',{method:'POST',body:JSON.stringify({url:urlFinal,analysis:d.reply})});
      await loadCD(CD.id);
      document.getElementById('fLoad').style.display='none';
      document.getElementById('fAn').innerHTML=`<div class="ia-chip"><div class="ia-chip-title">Valoración</div><div class="ia-result-body">${d.reply}</div></div>`;
    }
    catch(err){document.getElementById('fLoad').style.display='none';document.getElementById('fAn').innerHTML=`<div class="ia-chip"><div class="ia-result-body">Excelente actitud. La constancia es la clave.</div></div>`;}
  };reader.readAsDataURL(file);
}

