/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 21_cliente_perfil.js
   Perfil cliente: hPerfil(), guardarPerfil(), subirFotoPerfil(), cargarSuscripcionPerfil()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// PERFIL CLIENTE
function hPerfil(){
  const c=CD;
  const tieneData = !!(c.peso_actual||c.altura||c.edad);
  setTimeout(()=>cargarSuscripcionPerfil(), 0);

  return`<div style="padding:16px 14px 8px">
    <div id="pf_header_bar" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.08em;color:var(--sv)">Mi perfil</div>
      ${tieneData?`<button id="pf_edit_btn" onclick="perfilModoEditar()" style="padding:7px 16px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation">✏️ Editar</button>`:''}
    </div>
    <div style="font-size:13px;color:var(--tx3);margin-bottom:16px">${tieneData?t('Tus datos personales.'):t('Rellena tus datos para que tu coach pueda personalizar tu plan al máximo.')}</div>
  </div>

  <div id="pf_form" style="background:var(--s);border:0.5px solid var(--br);border-radius:14px;margin:0 14px;padding:16px;display:${tieneData?'none':'block'};${tieneData?'pointer-events:none;opacity:.85':''}">
    <div style="font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px">${t('Datos personales')}</div>
    <div class="g2" style="gap:10px;margin-bottom:10px">
      <div><div class="form-lbl">${t('Peso')} (${pesoLabel()})</div><input class="inp" id="pf_peso" type="number" step="${isImperial()?'0.5':'0.1'}" placeholder="${pesoPlaceholder()}" value="${c.peso_actual?(isImperial()?(c.peso_actual*2.20462).toFixed(1):c.peso_actual):''}" style="margin-bottom:0"/></div>
      <div><div class="form-lbl">${t('Altura')} (${alturaLabel()})</div><input class="inp" id="pf_altura" type="text" placeholder="${alturaPlaceholder()}" value="${c.altura?(isImperial()?fmtAltura(c.altura):c.altura):''}" style="margin-bottom:0"/></div>
    </div>
    <div class="g2" style="gap:10px;margin-bottom:10px">
      <div><div class="form-lbl">Edad</div><input class="inp" id="pf_edad" type="number" value="${c.edad||''}" style="margin-bottom:0"/></div>
      <div><div class="form-lbl">Sexo</div><select class="inp" id="pf_sexo" style="margin-bottom:0">
        <option ${c.sexo==='Hombre'?'selected':''}>Hombre</option>
        <option ${c.sexo==='Mujer'?'selected':''}>Mujer</option>
      </select></div>
    </div>
    <div class="g2" style="gap:10px;margin-bottom:10px">
      <div><div class="form-lbl">${t('Cintura')} (${cinturaLabel()})</div><input class="inp" id="pf_cintura" type="number" step="0.1" placeholder="${cinturaPlaceholder()}" value="${c.cintura_actual?(isImperial()?(c.cintura_actual/2.54).toFixed(1):c.cintura_actual):''}" style="margin-bottom:0"/></div>
      <div><div class="form-lbl">${t('Cadera')} (${cinturaLabel()})</div><input class="inp" id="pf_cadera" type="number" step="0.1" placeholder="${isImperial()?'38':'96'}" value="${c.cadera?(isImperial()?(c.cadera/2.54).toFixed(1):c.cadera):''}" style="margin-bottom:0"/></div>
    </div>
    <div style="margin-bottom:10px"><div class="form-lbl">Nivel de actividad</div>
      <select class="inp" id="pf_actividad" style="margin-bottom:0">
        <option ${c.actividad==='Sedentario'?'selected':''}>Sedentario (poco o nada de ejercicio)</option>
        <option ${c.actividad==='Ligero'?'selected':''}>Ligero (1-2 días/semana)</option>
        <option ${c.actividad==='Moderada'?'selected':''}>Moderada (3-4 días/semana)</option>
        <option ${c.actividad==='Activo'?'selected':''}>Activo (5-6 días/semana)</option>
        <option ${c.actividad==='Muy activo'?'selected':''}>Muy activo (dobles entrenos)</option>
      </select>
    </div>
    <div style="margin-bottom:10px"><div class="form-lbl">Tipo de alimentación</div>
      <select class="inp" id="pf_dieta" style="margin-bottom:0">
        <option ${c.dieta_tipo==='Omnívoro'?'selected':''}>Omnívoro (como de todo)</option>
        <option ${c.dieta_tipo==='Vegetariano'?'selected':''}>Vegetariano</option>
        <option ${c.dieta_tipo==='Vegano'?'selected':''}>Vegano</option>
        <option ${c.dieta_tipo==='Sin gluten'?'selected':''}>Sin gluten</option>
        <option ${c.dieta_tipo==='Sin lactosa'?'selected':''}>Sin lactosa</option>
      </select>
    </div>
    <div style="margin-bottom:10px"><div class="form-lbl">${t("Alimentos que no me gustan o no puedo comer")}</div>
      <input class="inp" id="pf_alimentos_no" placeholder="Ej: brócoli, pescado, huevos..." value="${c.alimentos_no||''}" style="margin-bottom:0"/>
    </div>
    <div style="margin-bottom:10px"><div class="form-lbl">${t("Lesiones / zonas con dolor / alergias")}</div>
      <input class="inp" id="pf_lesiones" placeholder="Ej: rodilla derecha, lumbar..." value="${c.lesiones||''}" style="margin-bottom:0"/>
    </div>
    <div><div class="form-lbl">${t("Otras observaciones")}</div>
      <textarea class="ta" id="pf_ob" placeholder="Cualquier cosa que tu coach deba saber...">${c.observaciones||''}</textarea>
    </div>
    <div style="margin-top:10px;background:rgba(168,85,247,.06);border:0.5px solid rgba(168,85,247,.2);border-radius:12px;padding:12px">
      <div class="form-lbl" style="color:#c084fc;margin-bottom:6px">🧪 ¿Has tenido o tienes algún tipo de deficiencia?</div>
      <div style="font-size:11px;color:var(--tx3);margin-bottom:8px;line-height:1.5">Por ejemplo: anemia, vitamina D baja, ferritina baja, B12, omega-3... Tu coach lo tendrá en cuenta al preparar tu dieta.</div>
      <textarea class="ta" id="pf_deficiencias" placeholder="Ej: Vitamina D baja en última analítica, tendencia a anemia..." style="margin-bottom:0">${c.deficiencias||''}</textarea>
    </div>
  </div>

  <div style="padding:14px 14px 0">
    <div id="pf_btns" style="display:${tieneData?'none':'block'}">
      <button class="btn" style="width:100%;padding:13px;font-size:15px" onclick="guardarPerfil()">${t('Guardar perfil')}</button>
    </div>
    <div id="pf_msg" style="font-size:13px;text-align:center;margin-top:8px;height:20px"></div>
  </div>

  <!-- Selector de idioma movido al login -->
  <div id="pf_lang_block" style="margin:14px 14px 20px;background:var(--s2);border:0.5px solid var(--br);border-radius:14px;padding:14px;display:${tieneData?'none':'block'}">
    <div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">🌐 Idioma / Language</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button onclick="setLangLogin('es');setLang('es')" style="padding:10px;border-radius:10px;border:1.5px solid ${LANG==='es'?'var(--bl2)':'var(--br)'};background:${LANG==='es'?'rgba(59,130,246,.12)':'none'};color:${LANG==='es'?'var(--blg)':'var(--tx3)'};font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">
        🇪🇸 Español
      </button>
      <button onclick="setLangLogin('en');setLang('en')" style="padding:10px;border-radius:10px;border:1.5px solid ${LANG==='en'?'var(--bl2)':'var(--br)'};background:${LANG==='en'?'rgba(59,130,246,.12)':'none'};color:${LANG==='en'?'var(--blg)':'var(--tx3)'};font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">
        🇬🇧 English
      </button>
    </div>
    <div style="font-size:10px;color:var(--tx3);margin-top:8px;text-align:center">También puedes cambiarlo en la pantalla de inicio de sesión</div>
  </div>

  <!-- Sección cuenta -->
  <div style="margin:0 14px 24px;background:var(--s);border:0.5px solid var(--br);border-radius:14px;overflow:hidden">

    <!-- Cabecera sección -->
    <div style="padding:14px 16px 12px;border-bottom:0.5px solid var(--br)">
      <div style="font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.1em">🔐 ${t('Mi cuenta')}</div>
    </div>

    <!-- Foto de perfil — protagonista -->
    <div style="padding:20px 16px;border-bottom:0.5px solid var(--br);display:flex;flex-direction:column;align-items:center;gap:12px">
      <div id="pf_avatar_wrap" style="position:relative;cursor:pointer;touch-action:manipulation" onclick="document.getElementById('pf_foto_input').click()">
        <div id="pf_avatar" style="width:96px;height:96px;border-radius:50%;background:var(--bl3);display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:700;color:#fff;overflow:hidden;border:3px solid var(--bl2);box-shadow:0 0 0 4px rgba(37,99,235,.12)">
          ${USER.foto_perfil ? `<img src="${USER.foto_perfil}" style="width:100%;height:100%;object-fit:cover"/>` : `<span>${USER.nombre?USER.nombre[0].toUpperCase():'?'}</span>`}
        </div>
        <div id="pf_foto_badge" style="position:absolute;bottom:2px;right:2px;width:26px;height:26px;background:var(--bl2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;border:2.5px solid var(--b);transition:.2s">📷</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:16px;font-weight:700;color:var(--sv)">${USER.nombre}</div>
        <div style="font-size:13px;color:var(--blg);margin-top:2px">@${USER.username}</div>
        <div style="font-size:11px;color:var(--tx3);margin-top:5px">${t('Toca la foto para cambiarla')}</div>
      </div>
      <input type="file" id="pf_foto_input" accept="image/*" style="display:none" onchange="subirFotoPerfil(this)"/>
    </div>

    <!-- Suscripción del cliente -->
    <div style="padding:14px 16px;border-bottom:0.5px solid var(--br)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);display:flex;align-items:center;justify-content:center;font-size:15px">💳</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--sv)">${LANG==='en'?'Subscription':'Suscripción'}</div>
            <div style="font-size:11px;color:var(--tx3);margin-top:1px">${LANG==='en'?'Your active plan':'Tu plan contratado'}</div>
          </div>
        </div>
        <span id="pf_sub_badge" style="font-size:11px;font-weight:700;color:var(--tx3)">...</span>
      </div>
      <div id="pf_sub_info" style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;padding:12px">
        <div style="font-size:12px;color:var(--tx3);text-align:center">${LANG==='en'?'Loading subscription...':'Cargando suscripción...'}</div>
      </div>
    </div>

    <!-- Acordeón: Cambiar usuario -->
    <div style="border-bottom:0.5px solid var(--br)">
      <button onclick="pfToggleAcordeon('acc_user_body','acc_user_arrow')" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:none;border:none;cursor:pointer;font-family:inherit;touch-action:manipulation">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);display:flex;align-items:center;justify-content:center;font-size:15px">👤</div>
          <div style="text-align:left">
            <div style="font-size:13px;font-weight:700;color:var(--sv)">${t('Cambiar usuario')}</div>
            <div style="font-size:11px;color:var(--tx3);margin-top:1px">@${USER.username}</div>
          </div>
        </div>
        <span id="acc_user_arrow" style="font-size:12px;color:var(--tx3);transition:transform .2s">▼</span>
      </button>
      <div id="acc_user_body" style="display:none;padding:0 16px 16px">
        <div class="form-lbl">${t('Nuevo usuario')}</div>
        <input class="inp" id="acc_new_user" placeholder="${t('Mínimo 4 caracteres')}" style="margin-bottom:8px"/>
        <div class="form-lbl">${t('Confirmar con contraseña actual')}</div>
        <input class="inp" id="acc_pass_confirm_user" type="password" placeholder="${t('Tu contraseña actual')}" style="margin-bottom:10px"/>
        <button onclick="cambiarUsuario()" style="width:100%;padding:11px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation">✓ ${t('Cambiar usuario')}</button>
        <div id="acc_user_msg" style="font-size:12px;text-align:center;margin-top:8px;min-height:18px"></div>
      </div>
    </div>

    <!-- Acordeón: Cambiar contraseña -->
    <div>
      <button onclick="pfToggleAcordeon('acc_pass_body','acc_pass_arrow')" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:none;border:none;cursor:pointer;font-family:inherit;touch-action:manipulation">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);display:flex;align-items:center;justify-content:center;font-size:15px">🔑</div>
          <div style="text-align:left">
            <div style="font-size:13px;font-weight:700;color:var(--sv)">${t('Cambiar contraseña')}</div>
            <div style="font-size:11px;color:var(--tx3);margin-top:1px">${t('Mínimo 6 caracteres')}</div>
          </div>
        </div>
        <span id="acc_pass_arrow" style="font-size:12px;color:var(--tx3);transition:transform .2s">▼</span>
      </button>
      <div id="acc_pass_body" style="display:none;padding:0 16px 16px">
        <div class="form-lbl">${t('Contraseña actual')}</div>
        <input class="inp" id="acc_pass_old" type="password" placeholder="••••••" style="margin-bottom:8px"/>
        <div class="form-lbl">${t('Nueva contraseña')}</div>
        <input class="inp" id="acc_pass_new" type="password" placeholder="${t('Mínimo 6 caracteres')}" style="margin-bottom:8px"/>
        <div class="form-lbl">${t('Repetir contraseña')}</div>
        <input class="inp" id="acc_pass_rep" type="password" placeholder="${t('Repite la nueva contraseña')}" style="margin-bottom:10px"/>
        <button onclick="cambiarContrasena()" style="width:100%;padding:11px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation">✓ ${t('Cambiar contraseña')}</button>
        <div id="acc_pass_msg" style="font-size:12px;text-align:center;margin-top:8px;min-height:18px"></div>
      </div>
    </div>

  </div>`;
}

function pfFormatFecha(fecha){
  if(!fecha) return '—';
  const parts = String(fecha).split('-');
  if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return fecha;
}

async function cargarSuscripcionPerfil(){
  const box = document.getElementById('pf_sub_info');
  const badge = document.getElementById('pf_sub_badge');
  if(!box || !CD || !CD.id) return;

  try{
    const s = await api('/clientes/'+CD.id+'/suscripcion');

    if(!s || !s.fecha_fin){
      if(badge){
        badge.textContent = LANG==='en'?'No plan':'Sin plan';
        badge.style.color = 'var(--tx3)';
      }
      box.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;font-size:17px">🔒</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:var(--sv)">${LANG==='en'?'No active subscription':'Sin suscripción activa'}</div>
            <div style="font-size:11px;color:var(--tx3);margin-top:2px;line-height:1.4">${LANG==='en'?'Ask your coach to activate your plan.':'Habla con tu coach para activar tu plan.'}</div>
          </div>
        </div>`;
      return;
    }

    const vencida = !!s.vencida || s.estado === 'cancelada' || Number(s.dias_restantes||0) <= 0;
    const proxima = !!s.proxima_a_vencer && !vencida;
    const diasRestantes = vencida ? 0 : (s.dias_restantes ?? '—');
    const color = vencida ? '#fca5a5' : proxima ? 'var(--amb)' : 'var(--gnb)';
    const estadoTexto = vencida
      ? (LANG==='en'?'Expired':'Vencida')
      : proxima
        ? (LANG==='en'?'Ending soon':'Próxima a vencer')
        : (LANG==='en'?'Active':'Activa');

    const inicio = pfFormatFecha(s.fecha_inicio);
    const fin = pfFormatFecha(s.fecha_fin);
    const diasContratados = s.fecha_inicio && s.fecha_fin
      ? Math.max(0, Math.ceil((new Date(s.fecha_fin) - new Date(s.fecha_inicio)) / (1000*60*60*24)))
      : '—';

    if(badge){
      badge.textContent = (vencida?'🔴 ':proxima?'⚠️ ':'✅ ') + estadoTexto;
      badge.style.color = color;
    }

    box.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div style="background:rgba(255,255,255,.035);border:0.5px solid var(--br);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">${LANG==='en'?'Started':'Empezó'}</div>
          <div style="font-size:13px;font-weight:800;color:var(--sv)">${inicio}</div>
        </div>
        <div style="background:rgba(255,255,255,.035);border:0.5px solid var(--br);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">${LANG==='en'?'Ends':'Termina'}</div>
          <div style="font-size:13px;font-weight:800;color:${color}">${fin}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:rgba(255,255,255,.035);border:0.5px solid var(--br);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px">${LANG==='en'?'Contracted':'Contratada'}</div>
          <div style="font-size:19px;font-weight:900;color:var(--sv);line-height:1">${diasContratados}</div>
          <div style="font-size:10px;color:var(--tx3);margin-top:3px">${LANG==='en'?'days':'días'}</div>
        </div>
        <div style="background:rgba(37,99,235,.08);border:0.5px solid rgba(59,130,246,.18);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px">${LANG==='en'?'Remaining':'Restantes'}</div>
          <div style="font-size:19px;font-weight:900;color:${color};line-height:1">${diasRestantes}</div>
          <div style="font-size:10px;color:var(--tx3);margin-top:3px">${LANG==='en'?'days':'días'}</div>
        </div>
      </div>
      ${s.precio ? `<div style="margin-top:9px;font-size:11px;color:var(--tx3);text-align:center">💶 ${s.precio}€/${LANG==='en'?'month':'mes'}</div>` : ''}
    `;
  }catch(e){
    if(badge){
      badge.textContent = LANG==='en'?'Unavailable':'No disponible';
      badge.style.color = 'var(--tx3)';
    }
    box.innerHTML = `<div style="font-size:12px;color:var(--tx3);text-align:center">${LANG==='en'?'Could not load subscription.':'No se pudo cargar la suscripción.'}</div>`;
  }
}


// ── ACORDEÓN PERFIL ─────────────────────────────────────────────
function pfToggleAcordeon(bodyId, arrowId){
  const body = document.getElementById(bodyId);
  const arrow = document.getElementById(arrowId);
  if(!body) return;
  const open = body.style.display === 'block';
  body.style.display = open ? 'none' : 'block';
  if(arrow) arrow.style.transform = open ? '' : 'rotate(180deg)';
}

// ── FOTO DE PERFIL ──────────────────────────────────────────────
function updateCoachTopbar() {
  const av = document.getElementById('coach_topbar_avatar');
  const nm = document.getElementById('coach_topbar_nombre');
  const pill = document.getElementById('mobile_lang_pill');
  if(!av || !USER) return;
  // Update lang pill text
  if(pill) pill.textContent = COACH_LANG.toUpperCase();
  // Avatar
  if(USER.foto_perfil) {
    av.innerHTML = `<img src="${USER.foto_perfil}" style="width:100%;height:100%;object-fit:cover"/>`;
  } else {
    av.textContent = (USER.nombre||'C')[0].toUpperCase();
  }
  // Name — only show on desktop (hidden on mobile via CSS)
  if(nm) {
    nm.textContent = USER.nombre || USER.username || 'Coach';
    nm.style.display = window.innerWidth > 600 ? 'inline' : 'none';
  }
}

async function subirFotoCoach(input) {
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const max = 400;
      let w = img.width, h = img.height;
      if(w > h) { if(w > max){ h = Math.round(h*max/w); w = max; } }
      else { if(h > max){ w = Math.round(w*max/h); h = max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.82);
      try {
        await api('/me/foto', {method:'POST', body:JSON.stringify({foto: base64})});
        USER.foto_perfil = base64;
        localStorage.setItem('wm_user', JSON.stringify(USER));
        updateCoachTopbar();
      } catch(err) { alert('Error al subir foto'); }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function subirFotoPerfil(input) {
  const file = input.files[0];
  if(!file) return;
  // Resize to max 400x400 and compress
  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const max = 400;
      let w = img.width, h = img.height;
      if(w > h) { if(w > max){ h = Math.round(h*max/w); w = max; } }
      else { if(h > max){ w = Math.round(w*max/h); h = max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.82);
      try {
        await api('/me/foto', {method:'POST', body:JSON.stringify({foto: base64})});
        // Update in memory and localStorage
        USER.foto_perfil = base64;
        localStorage.setItem('wm_user', JSON.stringify(USER));
        // Update avatar in profile
        const av = document.getElementById('pf_avatar');
        if(av) av.innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover"/>`;
        // Update topbar/nav avatar everywhere
        actualizarAvatarsUI(base64);
      } catch(err) {
        alert(t('Error al subir foto'));
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function actualizarAvatarsUI(base64) {
  // Update all avatar elements that show the current user
  document.querySelectorAll('.mi-avatar').forEach(el => {
    el.innerHTML = base64 ? `<img src="${base64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : el.innerHTML;
  });
}

async function cambiarUsuario(){
  const newUser = document.getElementById('acc_new_user')?.value?.trim();
  const pass = document.getElementById('acc_pass_confirm_user')?.value;
  const msg = document.getElementById('acc_user_msg');
  if(!newUser || newUser.length < 4){ msg.style.color='#f87171'; msg.textContent=t('El usuario debe tener al menos 4 caracteres'); return; }
  if(!pass){ msg.style.color='#f87171'; msg.textContent=t('Escribe tu contraseña actual para confirmar'); return; }
  try{
    await api('/me',{method:'PUT',body:JSON.stringify({username:newUser, password_actual:pass})});
    USER.username = newUser;
    localStorage.setItem('wm_user', JSON.stringify(USER));
    if(localStorage.getItem('wm_saved_user')) localStorage.setItem('wm_saved_user', newUser);
    msg.style.color='#86efac'; msg.textContent='✓ '+t('Usuario actualizado');
    document.getElementById('acc_new_user').value='';
    document.getElementById('acc_pass_confirm_user').value='';
  }catch(e){ msg.style.color='#f87171'; msg.textContent=e.error||t('Error al cambiar usuario'); }
}

async function cambiarContrasena(){
  const old = document.getElementById('acc_pass_old')?.value;
  const newP = document.getElementById('acc_pass_new')?.value;
  const rep = document.getElementById('acc_pass_rep')?.value;
  const msg = document.getElementById('acc_pass_msg');
  if(!old){ msg.style.color='#f87171'; msg.textContent=t('Escribe tu contraseña actual'); return; }
  if(!newP || newP.length < 6){ msg.style.color='#f87171'; msg.textContent=t('La nueva contraseña debe tener al menos 6 caracteres'); return; }
  if(newP !== rep){ msg.style.color='#f87171'; msg.textContent=t('Las contraseñas no coinciden'); return; }
  try{
    await api('/me',{method:'PUT',body:JSON.stringify({password_actual:old, password_nueva:newP})});
    msg.style.color='#86efac'; msg.textContent='✓ '+t('Contraseña actualizada');
    // Update saved credentials if remember me was on
    if(localStorage.getItem('wm_saved_pass')) localStorage.setItem('wm_saved_pass', newP);
    document.getElementById('acc_pass_old').value='';
    document.getElementById('acc_pass_new').value='';
    document.getElementById('acc_pass_rep').value='';
  }catch(e){ msg.style.color='#f87171'; msg.textContent=e.error||t('Error al cambiar contraseña'); }
}

async function guardarPerfil(){
  const msg=document.getElementById('pf_msg');
  try{
    const pf = (id) => document.getElementById(id);
    await api('/clientes/'+CD.id+'/perfil',{method:'PUT',body:JSON.stringify({
      peso_actual: fromPeso(pf('pf_peso')?.value)||null,
      altura: fromAltura(pf('pf_altura')?.value)||null,
      edad: parseInt(pf('pf_edad')?.value)||null,
      sexo: pf('pf_sexo')?.value||'Hombre',
      actividad: pf('pf_actividad')?.value||'Moderada',
      cintura_actual: fromCintura(pf('pf_cintura')?.value)||null,
      cadera: fromCintura(pf('pf_cadera')?.value)||null,
      dieta_tipo: pf('pf_dieta')?.value||'Omnívoro',
      alimentos_no: pf('pf_alimentos_no')?.value||'',
      lesiones: pf('pf_lesiones')?.value||'',
      observaciones: pf('pf_ob')?.value||'',
      deficiencias: pf('pf_deficiencias')?.value||''
    })});
    await loadCD(CD.id);
    msg.style.color='#86efac';msg.textContent='✓ Profile saved ✓';
    // Switch to compact account view immediately after first save
    const formEl=document.getElementById('pf_form');
    const btnsEl=document.getElementById('pf_btns');
    const langEl=document.getElementById('pf_lang_block');
    const editBtn=document.getElementById('pf_edit_btn');
    if(formEl){formEl.style.display='none';formEl.style.pointerEvents='none';formEl.style.opacity='.85';}
    if(btnsEl){btnsEl.style.display='none';}
    if(langEl){langEl.style.display='none';}
    // Add edit button if not there
    if(!editBtn){
      const hdrDiv=document.getElementById('pf_header_bar');
      if(hdrDiv){
        const eb=document.createElement('button');
        eb.id='pf_edit_btn';
        eb.innerHTML='✏️ Editar';
        eb.style.cssText='padding:7px 16px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation';
        eb.onclick=perfilModoEditar;
        hdrDiv.appendChild(eb);
      }
    }
    setTimeout(()=>{msg.textContent='';},2000);
  }catch(e){msg.style.color='#f87171';msg.textContent='Error guardando';}
}




