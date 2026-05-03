/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 12_coach_equipo.js
   Gestión de coaches: hEquipo(), initEquipo(), crearCoach(), rbFiltrarIA()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ MI EQUIPO — GESTIÓN DE COACHES ══════════════════════════════
function hEquipo(){
  const isAdmin = USER.username === 'wolf';
  return`
  <!-- MI PERFIL COACH -->
  <div style="background:var(--s);border:0.5px solid var(--br);border-radius:14px;padding:16px;margin-bottom:16px">
    <div style="font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px">👤 ${COACH_LANG==='en'?'My coach profile':'Mi perfil de coach'}</div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
      <div style="position:relative;cursor:pointer" onclick="document.getElementById('coach_foto_input').click()">
        <div id="coach_perfil_avatar" style="width:60px;height:60px;border-radius:50%;background:var(--bl2);overflow:hidden;border:2px solid rgba(59,130,246,.4);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff">
          ${USER.foto_perfil?`<img src="${USER.foto_perfil}" style="width:100%;height:100%;object-fit:cover"/>`:(USER.nombre?.[0]?.toUpperCase()||'C')}
        </div>
        <div style="position:absolute;bottom:0;right:0;width:20px;height:20px;background:var(--bl2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;border:2px solid var(--b)">📷</div>
      </div>
      <div>
        <div style="font-size:15px;font-weight:700;color:var(--sv)">${USER.nombre||USER.username}</div>
        <div style="font-size:12px;color:var(--blg);margin-top:2px">@${USER.username}</div>
        <div style="font-size:11px;color:var(--tx3);margin-top:3px">${COACH_LANG==='en'?'Tap photo to change':'Toca la foto para cambiar'}</div>
      </div>
    </div>
    <div class="g2" style="gap:8px;margin-bottom:10px">
      <div>
        <div class="form-lbl">${COACH_LANG==='en'?'Display name':'Nombre visible'}</div>
        <input class="inp" id="coach_edit_nombre" value="${USER.nombre||''}" placeholder="${COACH_LANG==='en'?'E.g. Steven García':'Ej: Steven García'}" style="margin-bottom:0"/>
      </div>
      <div>
        <div class="form-lbl">${COACH_LANG==='en'?'Email (optional)':'Email (opcional)'}</div>
        <input class="inp" id="coach_edit_email" value="${USER.email||''}" placeholder="coach@email.com" style="margin-bottom:0"/>
      </div>
    </div>
    <button onclick="guardarPerfilCoach()" class="btn" style="width:100%;padding:11px;background:var(--bl2)">✓ ${COACH_LANG==='en'?'Save profile':'Guardar perfil'}</button>
    <div id="coach_perfil_msg" style="font-size:12px;text-align:center;margin-top:6px;height:18px"></div>

    <!-- Cambio de contraseña del coach -->
    <div style="margin-top:16px;padding-top:16px;border-top:0.5px solid var(--br)">
      <div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">🔑 ${COACH_LANG==='en'?'Change my password':'Cambiar mi contraseña'}</div>
      <input class="inp" id="coach_pass_old" type="password" placeholder="${COACH_LANG==='en'?'Current password':'Contraseña actual'}" style="margin-bottom:8px"/>
      <input class="inp" id="coach_pass_new" type="password" placeholder="${COACH_LANG==='en'?'New password (min. 6 chars)':'Nueva contraseña (mín. 6 caracteres)'}" style="margin-bottom:8px"/>
      <input class="inp" id="coach_pass_rep" type="password" placeholder="${COACH_LANG==='en'?'Repeat new password':'Repite la nueva contraseña'}" style="margin-bottom:10px"/>
      <button onclick="cambiarPasswordCoach()" class="btn" style="width:100%;padding:10px;background:var(--s3);border:0.5px solid var(--br);color:var(--sv)">${COACH_LANG==='en'?'Update password':'Actualizar contraseña'}</button>
      <div id="coach_pass_msg" style="font-size:11px;text-align:center;margin-top:6px;height:16px"></div>
    </div>
  </div>

  <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.08em;color:var(--sv);margin-bottom:4px">${tc('Mi equipo')}</div>
  <div style="font-size:13px;color:var(--tx3);margin-bottom:20px">${tc('Coaches de WolfMindset')}</div>

  <!-- LISTA DE COACHES -->
  <div id="equipo_lista" style="margin-bottom:24px">
    <div style="font-size:13px;color:var(--tx3);padding:20px;text-align:center">${tc('Cargando...')}</div>
  </div>

  <!-- CREAR NUEVO COACH — solo admin wolf -->
  ${isAdmin ? `
  <div style="background:var(--s);border:0.5px solid var(--br);border-radius:16px;padding:18px">
    <div style="font-size:14px;font-weight:700;color:var(--sv);margin-bottom:14px">${tc('➕ Añadir nuevo coach')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div>
        <div class="form-lbl">${tc('Nombre completo')}</div>
        <input class="inp" id="eq_nombre" type="text" placeholder="Ej: María García" style="margin-bottom:0"/>
      </div>
      <div>
        <div class="form-lbl">${tc('Usuario (login)')}</div>
        <input class="inp" id="eq_user" type="text" placeholder="Ej: maria" style="margin-bottom:0"/>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div>
        <div class="form-lbl">${tc('Contraseña')}</div>
        <input class="inp" id="eq_pass" type="password" placeholder="${tc('Mín 6 caracteres')}" style="margin-bottom:0"/>
      </div>
      <div>
        <div class="form-lbl">${tc('Email (opcional)')}</div>
        <input class="inp" id="eq_email" type="email" placeholder="coach@email.com" style="margin-bottom:0"/>
      </div>
    </div>
    <div style="margin-bottom:14px">
      <div class="form-lbl">${tc('Idioma del panel')}</div>
      <select class="inp" id="eq_lang" style="margin-bottom:0">
        <option value="es">${tc('🇪🇸 Español')}</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>
    <div id="eq_msg" style="display:none;font-size:13px;margin-bottom:10px;padding:8px 12px;border-radius:8px"></div>
    <button class="btn" onclick="crearCoach()" style="width:100%;padding:12px">✓ ${tc('Crear coach') || (COACH_LANG==='en'?'Create coach':'Crear coach')}</button>
  </div>` : `
  <div style="background:var(--s);border:0.5px solid var(--br);border-radius:12px;padding:14px;text-align:center">
    <div style="font-size:13px;color:var(--tx3)">${tc('Solo el administrador puede crear nuevos coaches.')}</div>
  </div>`}`;
}

async function guardarPerfilCoach() {
  const nombre = document.getElementById('coach_edit_nombre')?.value?.trim();
  const email = document.getElementById('coach_edit_email')?.value?.trim();
  const msg = document.getElementById('coach_perfil_msg');
  if(!nombre) { msg.style.color='#f87171'; msg.textContent=COACH_LANG==='en'?'Name is required':'El nombre es obligatorio'; return; }
  try {
    await api('/me', {method:'PUT', body:JSON.stringify({nombre, email})});
    USER.nombre = nombre;
    USER.email = email;
    localStorage.setItem('wm_user', JSON.stringify(USER));
    updateCoachTopbar();
    msg.style.color='#86efac'; msg.textContent='✓ '+(COACH_LANG==='en'?'Saved':'Guardado');
    setTimeout(()=>{ if(msg) msg.textContent=''; }, 3000);
  } catch(e) { msg.style.color='#f87171'; msg.textContent=e.error||'Error'; }
}

async function cambiarPasswordCoach() {
  const old = document.getElementById('coach_pass_old')?.value?.trim();
  const nw  = document.getElementById('coach_pass_new')?.value?.trim();
  const rep = document.getElementById('coach_pass_rep')?.value?.trim();
  const msg = document.getElementById('coach_pass_msg');
  if(!msg) return;
  if(!old || !nw || !rep) { msg.style.color='#f87171'; msg.textContent=COACH_LANG==='en'?'Fill all fields':'Rellena todos los campos'; return; }
  if(nw.length < 6) { msg.style.color='#f87171'; msg.textContent=COACH_LANG==='en'?'Min. 6 characters':'Mínimo 6 caracteres'; return; }
  if(nw !== rep) { msg.style.color='#f87171'; msg.textContent=COACH_LANG==='en'?'Passwords do not match':'Las contraseñas no coinciden'; return; }
  try {
    const r = await api('/auth/change-my-password', { method:'POST', body: JSON.stringify({ password_actual: old, password_nueva: nw }) });
    if(r.ok) {
      msg.style.color='#86efac'; msg.textContent='✓ '+(COACH_LANG==='en'?'Password updated':'Contraseña actualizada');
      document.getElementById('coach_pass_old').value='';
      document.getElementById('coach_pass_new').value='';
      document.getElementById('coach_pass_rep').value='';
    } else {
      msg.style.color='#f87171'; msg.textContent=r.error||(COACH_LANG==='en'?'Error':'Error');
    }
  } catch(e) { msg.style.color='#f87171'; msg.textContent=e.error||(COACH_LANG==='en'?'Connection error':'Error de conexión'); }
  setTimeout(()=>{ if(msg) msg.textContent=''; }, 4000);
}

async function initEquipo(){
  try{
    const coaches = await api('/coaches');
    const lista = document.getElementById('equipo_lista');
    if(!lista) return;
    if(!coaches || !coaches.length){
      lista.innerHTML=`<div style="font-size:13px;color:var(--tx3);padding:12px;text-align:center">${tc('Solo tú por ahora.')}</div>`;
      return;
    }
    lista.innerHTML=`
      <div style="font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">${tc('Coaches activos')}</div>
      ${coaches.map(c=>`
        <div style="background:var(--s);border:0.5px solid var(--br);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:38px;height:38px;border-radius:50%;background:var(--bl2);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff">${c.nombre?c.nombre[0].toUpperCase():'C'}</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--sv)">${c.nombre||c.username}</div>
              <div style="font-size:11px;color:var(--tx3)">@${c.username} · ${c.lang==='en'?'🇬🇧 English':'🇪🇸 '+(COACH_LANG==='en'?'Spanish':'Español')}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            ${c.username!=='wolf'?`<button onclick="resetCoachPass(${c.id},'${c.nombre||c.username}')" style="background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);color:var(--blg);font-size:11px;font-weight:600;padding:5px 10px;border-radius:8px;cursor:pointer;font-family:inherit">🔑 Reset pass</button>
            <button onclick="eliminarCoach(${c.id},'${c.nombre||c.username}')" style="background:rgba(239,68,68,.1);border:0.5px solid rgba(239,68,68,.2);color:#fca5a5;font-size:11px;font-weight:600;padding:5px 10px;border-radius:8px;cursor:pointer;font-family:inherit">🗑</button>`:'<span style="font-size:11px;color:var(--sv3);background:rgba(34,197,94,.1);border:0.5px solid rgba(34,197,94,.2);padding:3px 8px;border-radius:6px">Admin</span>'}
          </div>
        </div>`).join('')}`;
  }catch(e){
    const lista=document.getElementById('equipo_lista');
    if(lista) lista.innerHTML=`<div style="font-size:13px;color:#fca5a5;padding:12px">${tc('Error cargando coaches. Actualiza el backend.')}</div>`;
  }
}

async function crearCoach(){
  const nombre=document.getElementById('eq_nombre').value.trim();
  const user=document.getElementById('eq_user').value.trim().toLowerCase();
  const pass=document.getElementById('eq_pass').value;
  const email=document.getElementById('eq_email').value.trim();
  const lang=document.getElementById('eq_lang').value;
  const msg=document.getElementById('eq_msg');

  if(!nombre||!user||!pass){msg.style.display='block';msg.style.background='rgba(239,68,68,.1)';msg.style.color='#fca5a5';msg.textContent=COACH_LANG==='en'?'Name, username and password are required.':'Nombre, usuario y contraseña son obligatorios.';return;}
  if(pass.length<6){msg.style.display='block';msg.style.background='rgba(239,68,68,.1)';msg.style.color='#fca5a5';msg.textContent=COACH_LANG==='en'?'Password must be at least 6 characters.':'La contraseña debe tener al menos 6 caracteres.';return;}

  try{
    await api('/coaches',{method:'POST',body:JSON.stringify({nombre,username:user,password:pass,email,lang})});
    msg.style.display='block';msg.style.background='rgba(34,197,94,.1)';msg.style.color='#86efac';
    msg.textContent=COACH_LANG==='en'?`✓ Coach "${nombre}" created. Login: ${user}`:`✓ Coach "${nombre}" creado. Login: ${user}`;
    document.getElementById('eq_nombre').value='';
    document.getElementById('eq_user').value='';
    document.getElementById('eq_pass').value='';
    document.getElementById('eq_email').value='';
    initEquipo(); // Recargar lista
  }catch(e){
    msg.style.display='block';msg.style.background='rgba(239,68,68,.1)';msg.style.color='#fca5a5';
    msg.textContent=e.error||'Error al crear el coach.';
  }
}

async function resetCoachPass(id, nombre){
  const newPass=prompt(COACH_LANG==='en'?`New password for ${nombre} (min 6 chars):` :`Nueva contraseña para ${nombre} (mín 6 chars):`);
  if(!newPass||newPass.length<6){alert(COACH_LANG==='en'?'Password too short.':'Contraseña demasiado corta.');return;}
  try{
    await api('/coaches/'+id+'/reset-password',{method:'POST',body:JSON.stringify({newPassword:newPass})});
    alert(COACH_LANG==='en'?`✓ Password for ${nombre} updated.`:`✓ Contraseña de ${nombre} actualizada.`);
  }catch(e){alert('Error: '+(e.error||'No se pudo actualizar'));}
}

async function eliminarCoach(id, nombre){
  if(!confirm(COACH_LANG==='en'?`Delete coach "${nombre}"? Their clients will NOT be deleted.`:`¿Eliminar el coach "${nombre}"? Sus clientes NO se eliminarán.`)) return;
  try{
    await api('/coaches/'+id,{method:'DELETE'});
    initEquipo();
  }catch(e){alert('Error: '+(e.error||'No se pudo eliminar'));}
}
// ═══════════════════════════════════════════════════════════════════
let rbExFilter = null; // null = no filter, object = {avoid:[], beginner:[], advanced:[]}

async function rbFiltrarIA(){
  const msgEl = document.getElementById('rb_ia_filter_msg');
  if(!rbState.clienteId){ msgEl.style.display='block'; msgEl.innerHTML=`<div style="color:#f87171;font-size:12px">${tc('Selecciona un cliente primero')}</div>`; return; }
  
  msgEl.style.display='block';
  msgEl.innerHTML=`<div class="ia-chip" style="padding:8px 12px;font-size:12px"><div class="ia-chip-title">${COACH_LANG==='en'?'Analysing client profile...':'Analizando perfil del cliente...'}</div></div>`;
  
  try {
    const c = await api('/clientes/'+rbState.clienteId);
    const exs = await api('/ejercicios-db');
    const exNames = exs.map(e=>e.nombre+' ('+e.grupo+', '+e.dificultad+')').join(', ');
    
    const prompt = `Analiza este perfil de cliente y esta lista de ejercicios. Indica cuáles NO debe hacer y por qué.

PERFIL DEL CLIENTE:
- Nivel: ${c.nivel}
- Objetivo: ${c.objetivo}
- Lesiones/problemas: ${c.lesiones||'ninguna'}
- Observaciones: ${c.observaciones||'ninguna'}
- Edad: ${c.edad||'no especificada'}

EJERCICIOS DISPONIBLES:
${exNames}

RESPONDE SOLO EN JSON con este formato exacto, sin texto adicional:
{
  "avoid": [{"nombre": "nombre exacto del ejercicio", "razon": "motivo breve"}],
  "caution": [{"nombre": "nombre exacto del ejercicio", "razon": "motivo breve"}],
  "nivel_ok": true
}

- "avoid": ejercicios que NO debe hacer por lesiones o contraindicaciones
- "caution": ejercicios con precaución por nivel o condición
- "nivel_ok": true si el nivel es adecuado para ejercicios avanzados`;

    const d = await api('/ia/chat', {method:'POST', body:JSON.stringify({
      messages:[{role:'user', content:prompt}],
      system:'Eres un fisioterapeuta y entrenador experto. Analiza perfiles de clientes y contraindicas ejercicios basándote en lesiones, nivel y condición física. Responde SOLO en JSON válido.'
    })});
    
    // Parse JSON response
    let filter;
    try {
      let clean = d.reply;
      // Extract JSON from markdown code blocks if present
      const jsonMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/);
      if(jsonMatch) clean = jsonMatch[1];
      else {
        // Try to find raw JSON object
        const objMatch = clean.match(/\{[\s\S]*\}/);
        if(objMatch) clean = objMatch[0];
      }
      filter = JSON.parse(clean.trim());
    } catch(e) {
      // If JSON parse fails, create empty filter with no restrictions
      console.log('IA filter parse error:', e, 'Reply:', d.reply);
      filter = { avoid: [], caution: [], nivel_ok: true };
    }
    
    rbExFilter = filter;
    
    const avoidCount = filter.avoid?.length||0;
    const cautionCount = filter.caution?.length||0;
    
    msgEl.innerHTML=`<div style="background:rgba(37,99,235,.08);border:0.5px solid rgba(59,130,246,.2);border-radius:10px;padding:10px 12px;font-size:12px">
      <div style="font-weight:700;color:var(--blg);margin-bottom:4px">🤖 Filtro aplicado para ${c.nombre}</div>
      ${avoidCount?`<div style="color:#fca5a5">⛔ ${avoidCount} ejercicio${avoidCount>1?'s':''} NO recomendado${avoidCount>1?'s':''}</div>`:''}
      ${cautionCount?`<div style="color:var(--amb)">⚠️ ${cautionCount} ejercicio${cautionCount>1?'s':''} con precaución</div>`:''}
      ${!avoidCount&&!cautionCount?`<div style="color:var(--gnb)">✓ Sin contraindicaciones para este cliente</div>`:''}
    </div>`;
    
    // Show client alert
    const alertEl = document.getElementById('rb_client_alert');
    if(c.lesiones || c.nivel !== 'Avanzado') {
      alertEl.style.display='block';
      alertEl.innerHTML=`<div style="background:rgba(239,68,68,.08);border:0.5px solid rgba(239,68,68,.2);border-radius:10px;padding:9px 12px;font-size:12px;display:flex;gap:8px;align-items:flex-start">
        <span style="font-size:16px">👤</span>
        <div>
          <span style="font-weight:700;color:#fca5a5">${c.nombre}</span>
          <span style="color:var(--tx3)"> · ${c.nivel} · ${c.objetivo}</span>
          ${c.lesiones?`<div style="color:#fca5a5;margin-top:2px">⚠️ ${c.lesiones}</div>`:''}
        </div>
      </div>`;
    }
    
    await rbBuscar();
    
  } catch(e) {
    msgEl.innerHTML='<div style="color:#f87171;font-size:12px">Error: '+( e.error||e.message||'inténtalo de nuevo')+'</div>';
  }
}

function rbLimpiarFiltro(){
  rbExFilter = null;
  document.getElementById('rb_ia_filter_msg').style.display='none';
  document.getElementById('rb_client_alert').style.display='none';
  rbBuscar();
}

