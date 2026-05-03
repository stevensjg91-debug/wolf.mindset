/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 26_gestor_imagenes.js
   Gestor imágenes ejercicios: abrirGestorImagenes(), subirImagenEjercicio(), crearEjercicioManual()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ GESTOR IMÁGENES ══════════════════════════════════
async function abrirGestorImagenes(){
  const panel = document.getElementById('gestor_imagenes');
  if(!panel) return;
  const visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : 'block';
  if(!visible) await filtrarEjerciciosGestor();
}

async function filtrarEjerciciosGestor(){
  const grupo = document.getElementById('edit_ex_grupo_filter')?.value || 'All';
  const buscar = document.getElementById('edit_ex_buscar')?.value || '';
  const p = new URLSearchParams();
  if(grupo !== 'All') p.append('grupo', grupo);
  if(buscar) p.append('buscar', buscar);
  const [exs, configs] = await Promise.all([
    api('/ejercicios-db?' + p),
    api('/ejercicios-config')
  ]);
  const lista = document.getElementById('gestor_lista');
  if(!lista) return;
  if(!exs.length){ lista.innerHTML=`<div style="color:var(--tx3);font-size:13px;padding:12px">${tc('Sin resultados')}</div>`; return; }
  // Update global exConfig so renderExImg picks up fresh data
  window.exConfig = configs;
  lista.innerHTML = exs.map(e => {
    const cfg = configs[e.nombre] || {};
    const imgUrl = cfg.imagen_url || '';
    // If base64, show placeholder text in input instead of the raw data
    const inputVal = imgUrl.startsWith('data:') ? '' : imgUrl;
    const inputPlaceholder = imgUrl.startsWith('data:')
      ? (COACH_LANG==='en' ? '✅ Custom image uploaded' : '✅ Imagen subida')
      : (COACH_LANG==='en' ? 'Image or GIF URL...' : 'URL de imagen o GIF...');
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:0.5px solid var(--br)">
      ${renderExImg(e.nombre, 44, e.grupo)}
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:4px">${e.nombre} <span style="font-size:10px;color:var(--tx3);font-weight:400">${e.grupo}</span></div>
        <div style="display:flex;gap:6px;align-items:center">
          <input id="img_url_${e.id}" value="${inputVal}" placeholder="${inputPlaceholder}" style="flex:1;padding:5px 8px;border:0.5px solid var(--br);border-radius:7px;background:var(--s3);color:${imgUrl.startsWith('data:')?'var(--gnb)':'var(--tx)'};font-size:12px;font-family:'Inter',sans-serif" onkeydown="if(event.key==='Enter')guardarImagenEjercicio('${e.nombre.replace(/'/g,"\\'")}',${e.id})"/>
          <label style="padding:5px 8px;background:var(--s3);color:var(--tx3);border:0.5px solid var(--br);border-radius:7px;font-size:13px;cursor:pointer;flex-shrink:0;display:flex;align-items:center" title="${COACH_LANG==='en'?'Upload image':'Subir imagen'}">📁<input type="file" accept="image/*" style="display:none" onchange="subirImagenEjercicio('${e.nombre.replace(/'/g,"\\'")}',${e.id},this)"/></label>
          <button onclick="guardarImagenEjercicio('${e.nombre.replace(/'/g,"\\'")}',${e.id})" style="padding:5px 10px;background:var(--bl2);color:#fff;border:none;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">${tc('Guardar')}</button>
          <button onclick="borrarEjercicioDb(${e.id},'${e.nombre.replace(/'/g,"\'")}')" style="padding:5px 8px;background:rgba(239,68,68,.12);color:#fca5a5;border:0.5px solid rgba(239,68,68,.25);border-radius:7px;font-size:13px;cursor:pointer;font-family:inherit;flex-shrink:0" title="${COACH_LANG==='en'?'Delete exercise':'Eliminar ejercicio'}">✕</button>
        </div>
      </div>
      ${imgUrl ? `<span style="font-size:16px" title="Imagen guardada">✅</span>` : `<span style="font-size:16px;color:var(--tx3)" title="Sin imagen">○</span>`}
    </div>`;
  }).join('');
}

async function subirImagenEjercicio(nombre, exId, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const max = 600;
      let w = img.width, h = img.height;
      if (w > h) { if (w > max) { h = Math.round(h * max / w); w = max; } }
      else { if (h > max) { w = Math.round(w * max / h); h = max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.82);
      const urlInput = document.getElementById(`img_url_${exId}`);
      if (urlInput) urlInput.value = base64;
      try {
        await api('/ejercicios-config/' + encodeURIComponent(nombre), {
          method: 'PUT',
          body: JSON.stringify({ imagen_url: base64 })
        });
        if (urlInput) {
          urlInput.style.borderColor = '#22c55e';
          // Refresh image cache so it shows everywhere immediately
          if(!window.exImages) window.exImages = {};
          window.exImages[nombre] = base64;
          setTimeout(() => { urlInput.style.borderColor = ''; filtrarEjerciciosGestor(); }, 1500);
        }
      } catch (err) {
        if (urlInput) { urlInput.style.borderColor = '#ef4444'; setTimeout(() => urlInput.style.borderColor = '', 1500); }
        alert(COACH_LANG === 'en' ? 'Error uploading image' : 'Error al subir imagen');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function subirImagenNuevoEjercicio(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max = 600;
      let w = img.width, h = img.height;
      if (w > h) { if (w > max) { h = Math.round(h * max / w); w = max; } }
      else { if (h > max) { w = Math.round(w * max / h); h = max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const inp = document.getElementById('new_ex_imagen');
      if (inp) inp.value = canvas.toDataURL('image/jpeg', 0.82);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function guardarImagenEjercicio(nombre, exId){
  const input = document.getElementById(`img_url_${exId}`);
  if(!input) return;
  const url = input.value.trim();
  try {
    await api('/ejercicios-config/' + encodeURIComponent(nombre), {
      method: 'PUT',
      body: JSON.stringify({ imagen_url: url })
    });
    // Feedback visual
    input.style.borderColor = '#22c55e';
    setTimeout(() => { input.style.borderColor = ''; filtrarEjerciciosGestor(); }, 1500);
  } catch(e) {
    input.style.borderColor = '#ef4444';
    setTimeout(() => input.style.borderColor = '', 1500);
  }
}

async function crearEjercicioManual(){
  const nombre = document.getElementById('new_ex_nombre').value.trim();
  const grupo = document.getElementById('new_ex_grupo').value;
  const musculos = document.getElementById('new_ex_musculos').value.trim();
  const dificultad = document.getElementById('new_ex_dif').value;
  const imagen = document.getElementById('new_ex_imagen').value.trim();
  const msg = document.getElementById('new_ex_msg');
  if(!nombre){ msg.style.color='#f87171'; msg.textContent=COACH_LANG==='en'?'Name is required':'Nombre obligatorio'; return; }
  try {
    // Insertar en ejercicios_db via reload no funciona, usamos un endpoint directo
    const r = await fetch('/api/ejercicios-db-add', {
      method: 'POST',
      headers: {'Content-Type':'application/json', Authorization:'Bearer '+TOKEN},
      body: JSON.stringify({ nombre, grupo, musculos, dificultad, tipo:'Fuerza', equipo:'Barra' })
    });
    if(imagen){
      await api('/ejercicios-config/' + encodeURIComponent(nombre), {
        method: 'PUT',
        body: JSON.stringify({ imagen_url: imagen })
      });
    }
    msg.style.color='#86efac'; msg.textContent=COACH_LANG==='en'?'✓ Created':'✓ Creado';
    document.getElementById('new_ex_nombre').value='';
    document.getElementById('new_ex_musculos').value='';
    document.getElementById('new_ex_imagen').value='';
    await filtrarEjerciciosGestor();
  } catch(e){ msg.style.color='#f87171'; msg.textContent='Error: '+e.message; }
}
async function reloadEjercicios(){
  const btn = event.target;
  btn.textContent = '⏳ Cargando...';
  btn.disabled = true;
  try {
    const r = await fetch('/api/reload-ejercicios', {method:'POST', headers:{'Content-Type':'application/json', ...(TOKEN?{Authorization:'Bearer '+TOKEN}:{})}});
    const data = await r.json();
    if(data.ok){
      btn.textContent = '✓ ' + data.ejercicios + ' ejercicios cargados';
      btn.style.color = '#86efac';
    } else {
      btn.textContent = 'Error: ' + (data.error||'desconocido');
      btn.disabled = false;
    }
  } catch(e) {
    btn.textContent = 'Error de conexión';
    btn.disabled = false;
  }
}


