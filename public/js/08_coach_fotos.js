/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 08_coach_fotos.js
   Fotos de progreso coach: renderCoachFotos(), coachAnalizarFotos(), guardarDatos()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════
// FOTOS DE PROGRESO — PANEL COACH
// Muestra fotos del cliente agrupadas por sesión (mes), con botón
// "🔍 Analizar con IA" que genera valoración editable y se publica
// al cliente como comentario debajo de la foto.
// ═══════════════════════════════════════════════════════════════════

function renderCoachFotos(fotos) {
  const wrap = document.getElementById('coach_fotos_timeline');
  if (!wrap) return;
  const c = window._coachClienteActual;

  if (!fotos || !fotos.length) {
    wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3);padding:10px 0">${tc('El cliente aún no ha subido fotos.')}</div>`;
    return;
  }

  // Agrupar fotos por mes (YYYY-MM)
  const grupos = {};
  fotos.forEach(f => {
    const mes = f.fecha ? f.fecha.slice(0, 7) : 'sin-fecha';
    if (!grupos[mes]) grupos[mes] = [];
    grupos[mes].push(f);
  });

  const meses = Object.keys(grupos).sort().reverse(); // más reciente primero

  wrap.innerHTML = meses.map((mes, mesIdx) => {
    const fotosMes = grupos[mes];
    const label = mes !== 'sin-fecha'
      ? new Date(mes + '-15').toLocaleDateString(COACH_LANG === 'en' ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric' })
      : tc('Sin fecha');

    // Mes anterior para comparativa (siguiente en el array ordenado descendente)
    const mesAnteriorKey = meses[mesIdx + 1];
    const fotosAnteriores = mesAnteriorKey ? grupos[mesAnteriorKey] : null;
    const hayComparativa = !!(fotosAnteriores && fotosAnteriores.length);

    const fotosHtml = fotosMes.map((f, fi) => {
      const tipoLabel = f.tipo === 'posterior' ? '🔙 Posterior' : f.tipo === 'costado' ? '↔️ Costado' : '🫡 Frente';
      const pub = f.published_analysis;
      const imgId = `cfoto_${mes.replace('-','_')}_${fi}`;
      return `<div style="flex:1;min-width:90px;max-width:140px">
        <div style="font-size:10px;color:var(--tx3);text-align:center;margin-bottom:4px">${tipoLabel}</div>
        <div style="position:relative;border-radius:10px;overflow:hidden;aspect-ratio:3/4;background:var(--s2)">
          ${f.url && !f.url.startsWith('foto_')
            ? `<img id="${imgId}" src="${f.url}" crossorigin="anonymous" data-url="${f.url}" style="width:100%;height:100%;object-fit:cover"/>`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px">📷</div>`}
        </div>
        ${pub ? `<div style="margin-top:6px;font-size:10px;color:var(--gnb);text-align:center">✓ ${tc('Publicado')}</div>` : ''}
      </div>`;
    }).join('');

    const grupoId = 'fotogrp_' + mes.replace('-', '_');

    return `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:14px;padding:14px;margin-bottom:14px">
      <!-- Cabecera mes -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;color:var(--sv)">📅 ${label}</div>
        <div style="font-size:10px;color:var(--tx3)">${fotosMes.length} ${tc('foto')}${fotosMes.length !== 1 ? 's' : ''}</div>
      </div>

      <!-- Miniaturas -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        ${fotosHtml}
      </div>

      <!-- Botón analizar -->
      <button id="btn_analizar_${grupoId}"
        onclick="coachAnalizarFotos('${grupoId}')"
        style="width:100%;padding:11px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation">
        🔍 ${hayComparativa ? tc('Analizar y comparar con mes anterior') : tc('Analizar fotos con IA')}
      </button>

      <!-- Zona resultado IA -->
      <div id="resultado_${grupoId}" style="margin-top:10px;display:none">
        <div style="font-size:11px;color:var(--tx3);margin-bottom:6px">
          ${tc('Edita el mensaje si quieres y publícalo al cliente:')}
        </div>
        <textarea id="texto_${grupoId}"
          style="width:100%;min-height:120px;background:var(--s);border:0.5px solid rgba(59,130,246,.3);border-radius:10px;padding:10px;font-size:13px;color:var(--sv);font-family:inherit;resize:vertical;box-sizing:border-box;line-height:1.5"
          placeholder="${tc('Valoración del coach...')}"></textarea>
        <button onclick="coachPublicarAnalisis('${grupoId}')"
          style="width:100%;margin-top:8px;padding:11px;background:var(--gn);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation">
          ✅ ${tc('Publicar al cliente')}
        </button>
        <div id="pub_msg_${grupoId}" style="font-size:12px;text-align:center;margin-top:6px;height:16px;color:var(--gnb)"></div>
      </div>
    </div>`;
  }).join('');

  // Guardar referencia a los grupos para el análisis
  window._coachFotosGrupos = grupos;
  window._coachFotosMeses = meses;
}

async function coachAnalizarFotos(grupoId) {
  const btn = document.getElementById('btn_analizar_' + grupoId);
  const resWrap = document.getElementById('resultado_' + grupoId);
  const textarea = document.getElementById('texto_' + grupoId);
  if (!btn || !resWrap || !textarea) return;

  btn.disabled = true;
  btn.textContent = '⏳ ' + tc('Analizando...');

  const c = window._coachClienteActual;
  const grupos = window._coachFotosGrupos || {};
  const meses = window._coachFotosMeses || [];
  const mes = grupoId.replace('fotogrp_', '').replace('_', '-');
  const mesIdx = meses.indexOf(mes);
  const fotosMes = grupos[mes] || [];
  const mesAnteriorKey = meses[mesIdx + 1];
  const fotosAnteriores = mesAnteriorKey ? grupos[mesAnteriorKey] : null;

  // Convierte un <img> del DOM a base64 via canvas (sin CORS)
  function imgElementToB64(imgEl) {
    try {
      if (!imgEl || !imgEl.complete || !imgEl.naturalWidth) return null;
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(imgEl.naturalWidth, 1024);
      canvas.height = Math.round(imgEl.naturalHeight * (canvas.width / imgEl.naturalWidth));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
      const full = canvas.toDataURL('image/jpeg', 0.85);
      return { b64: full.split(',')[1], mt: 'image/jpeg' };
    } catch(e) { return null; }
  }

  // Lee imágenes de un grupo de fotos usando canvas (imgs ya en DOM)
  function leerImagenesDom(fotosList, mesKey) {
    const imgs = [];
    fotosList.forEach((f, fi) => {
      const imgId = `cfoto_${mesKey.replace('-','_')}_${fi}`;
      const imgEl = document.getElementById(imgId);
      if (imgEl) {
        const data = imgElementToB64(imgEl);
        if (data) imgs.push(data);
      }
    });
    return imgs;
  }

  try {
    const isEn = COACH_LANG === 'en';

    const mesActualLabel = mes !== 'sin-fecha'
      ? new Date(mes + '-15').toLocaleDateString(isEn ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric' })
      : '';
    const mesAnteriorLabel = mesAnteriorKey
      ? new Date(mesAnteriorKey + '-15').toLocaleDateString(isEn ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric' })
      : '';

    // Leer imágenes del DOM via canvas
    const fotosActB64 = leerImagenesDom(fotosMes, mes);
    const fotosAntB64 = fotosAnteriores ? leerImagenesDom(fotosAnteriores, mesAnteriorKey) : [];

    // Si el canvas falló (CORS), usar el proxy del servidor con URLs
    const urlsActuales = fotosMes.map(f => f.url).filter(u => u && !u.startsWith('foto_'));
    const urlsAnteriores = fotosAnteriores
      ? fotosAnteriores.map(f => f.url).filter(u => u && !u.startsWith('foto_'))
      : [];

    const hayComparativa = fotosAntB64.length > 0 || urlsAnteriores.length > 0;
    const usarB64 = fotosActB64.length > 0;

    let r;
    if (usarB64) {
      // Tenemos base64 del canvas — enviar directamente a /ia/foto o /ia/comparar-fotos
      if (hayComparativa && fotosAntB64.length) {
        r = await api('/ia/comparar-fotos', {
          method: 'POST',
          body: JSON.stringify({
            fotosAntes: fotosAntB64,
            fotosDespues: fotosActB64,
            clienteNombre: c?.nombre || '',
            objetivo: c?.objetivo || '',
            nivel: c?.nivel || '',
            semanaAntes: mesAnteriorLabel,
            semanaDespues: mesActualLabel,
            lang: COACH_LANG,
            pedirGrasa: true,
            peso: c?.peso_actual,
            altura: c?.altura,
            edad: c?.edad,
            sexo: c?.sexo
          })
        });
      } else {
        // Primer mes — sin comparativa
        r = await api('/ia/foto', {
          method: 'POST',
          body: JSON.stringify({
            imageBase64: fotosActB64[0].b64,
            mediaType: fotosActB64[0].mt,
            extraImages: fotosActB64.slice(1),
            clientInfo: `${c?.nombre}, Objetivo: ${c?.objetivo}, Nivel: ${c?.nivel}`,
            system: isEn
              ? 'You are an expert WolfMindset fitness coach. First session — no previous photos. Analyze the physique: estimate body fat % (write as "Estimated body fat: X%"), highlight 2-3 genuine strong points, point out 1-2 areas to focus on, give 1 concrete tip, end motivating. No markdown, no asterisks, no AI mentions.'
              : 'Eres un coach de fitness experto de WolfMindset. Primera sesión — sin fotos anteriores. Analiza el físico: estima el % grasa (escríbelo como "Grasa estimada: X%"), destaca 2-3 puntos fuertes reales, señala 1-2 áreas de mejora, da 1 consejo concreto, termina motivando. Sin markdown, sin asteriscos, sin mencionar IA.'
          })
        });
      }
    } else {
      // Fallback: proxy del servidor descarga las URLs
      r = await api('/ia/analizar-fotos-coach', {
        method: 'POST',
        body: JSON.stringify({
          urlsActuales,
          urlsAnteriores: urlsAnteriores.length ? urlsAnteriores : null,
          clienteNombre: c?.nombre || '',
          objetivo: c?.objetivo || '',
          nivel: c?.nivel || '',
          semanaActual: mesActualLabel,
          semanaAnterior: mesAnteriorLabel,
          lang: COACH_LANG,
          peso: c?.peso_actual,
          altura: c?.altura,
          edad: c?.edad,
          sexo: c?.sexo
        })
      });
    }

    textarea.value = r.reply;
    resWrap.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '↺ ' + tc('Volver a analizar');

  } catch(e) {
    btn.disabled = false;
    btn.textContent = '🔍 ' + tc('Analizar fotos con IA');
    textarea.value = tc('Error al analizar. Inténtalo de nuevo.');
    resWrap.style.display = 'block';
  }
}

async function coachPublicarAnalisis(grupoId) {
  const textarea = document.getElementById('texto_' + grupoId);
  const msgEl = document.getElementById('pub_msg_' + grupoId);
  if (!textarea || !textarea.value.trim()) return;

  const texto = textarea.value.trim();
  const mes = grupoId.replace('fotogrp_', '').replace('_', '-');
  const grupos = window._coachFotosGrupos || {};
  const fotosMes = grupos[mes] || [];

  // Publicar en la primera foto del grupo (la representativa)
  const fotoRef = fotosMes[0];
  if (!fotoRef) return;

  try {
    await api('/fotos/' + fotoRef.id + '/publicar', {
      method: 'POST',
      body: JSON.stringify({ texto })
    });

    // Recargar datos del cliente para que el cliente vea el análisis
    await loadCD(window._coachClienteId);
    const c = window._coachClienteActual;
    if (c) renderCoachFotos(c.fotos);

    if (msgEl) {
      msgEl.textContent = '✓ ' + tc('Publicado al cliente');
      setTimeout(() => { if(msgEl) msgEl.textContent = ''; }, 3000);
    }
  } catch(e) {
    if (msgEl) { msgEl.style.color = '#f87171'; msgEl.textContent = tc('Error al publicar'); }
  }
}

async function guardarDatos(id){
  const btn = event.target;
  btn.textContent='⏳...'; btn.disabled=true;
  try{
    await api('/clientes/'+id,{method:'PUT',body:JSON.stringify({
      objetivo:document.getElementById('obj').value,
      nivel:document.getElementById('niv').value,
      kcal_internas:parseInt(document.getElementById('kcal').value),
      prot:parseInt(document.getElementById('prot').value),
      carbs:parseInt(document.getElementById('carbs').value),
      fat:parseInt(document.getElementById('fat').value),
      comida_libre:document.getElementById('clibre').value,
      mensaje_semana:document.getElementById('msgsem').value,
      notas_coach:document.getElementById('notasc').value
    })});
    // Switch to view mode
    clienteDatosModoVer(btn);
  } catch(e){
    btn.textContent='Error'; btn.disabled=false;
    setTimeout(()=>{btn.textContent=tc('Guardar');},2000);
  }
}

function clienteDatosModoVer(btn){
  // Disable all fields in the ajustar datos section
  const sec = document.getElementById('ajustar_datos_form');
  if(sec){ sec.querySelectorAll('input,select,textarea').forEach(el=>{ el.disabled=true; el.style.opacity='.7'; }); }
  // Change button to Editar
  if(btn){
    btn.textContent=tc('✏️ Editar');
    btn.style.background='var(--bl2)';
    btn.disabled=false;
    btn.onclick = function(){ clienteDatosModoEditar(this); };
  }
}

function clienteDatosModoEditar(btn){
  const sec = document.getElementById('ajustar_datos_form');
  if(sec){ sec.querySelectorAll('input,select,textarea').forEach(el=>{ el.disabled=false; el.style.opacity='1'; }); }
  if(btn){
    const clienteId = btn.dataset.clienteId;
    btn.textContent='Guardar';
    btn.style.background='';
    btn.onclick = function(){ guardarDatos(clienteId); };
  }
}

