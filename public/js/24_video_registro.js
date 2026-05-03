/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 24_video_registro.js
   Video player, formulario de registro público, resetPassword, chips dieta

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// VIDEO PLAYER
function openVideo(url, nombre){
  const modal = document.getElementById('videoModal');
  const frame = document.getElementById('videoFrame');
  const title = document.getElementById('videoTitle');
  title.textContent = nombre || 'Técnica del ejercicio';
  // Convert YouTube URL to embed
  let embedUrl = url;
  if(url.includes('youtube.com/shorts/')){
    const id = url.split('shorts/')[1].split('?')[0];
    embedUrl = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
  } else if(url.includes('youtu.be/')){
    const id = url.split('youtu.be/')[1].split('?')[0];
    embedUrl = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
  } else if(url.includes('youtube.com/watch')){
    const id = new URLSearchParams(url.split('?')[1]).get('v');
    embedUrl = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
  }
  frame.src = embedUrl;
  modal.style.display = 'flex';
}
function closeVideo(){
  document.getElementById('videoModal').style.display = 'none';
  document.getElementById('videoFrame').src = '';
}


// REGISTRO PÚBLICO
async function resetearContrasena(userId){
  const inp = document.getElementById('nueva_pass_'+userId);
  const msg = document.getElementById('reset_msg_'+userId);
  const pass = inp?.value?.trim();
  if(!pass || pass.length < 4){ msg.style.color='#fca5a5'; msg.textContent='Mínimo 4 caracteres'; return; }
  try {
    const r = await api('/auth/reset-password', { method:'POST', body: JSON.stringify({ userId, newPassword: pass }) });
    if(r.ok){ msg.style.color='var(--gnb)'; msg.textContent='✓ Contraseña actualizada'; inp.value=''; }
    else { msg.style.color='#fca5a5'; msg.textContent = r.error || 'Error'; }
  } catch(e){ msg.style.color='#fca5a5'; msg.textContent='Error de conexión'; }
  setTimeout(()=>{ if(msg) msg.textContent=''; }, 3000);
}

function showRegistro(){show('sRegistro');}

// ── REGISTRO: preferencias de dieta con chips ─────────────────────
const _regFoodsSelected = new Set();
function regToggleFoodChip(btn, nombre){
  if(!btn || !nombre) return;
  if(_regFoodsSelected.has(nombre)){
    _regFoodsSelected.delete(nombre);
    btn.classList.remove('on');
  } else {
    _regFoodsSelected.add(nombre);
    btn.classList.add('on');
  }
  const inp=document.getElementById('reg_alimentos_pref');
  if(inp) inp.value=[..._regFoodsSelected].join(', ');
}
// Bilingual chip: stores the correct name depending on current _regLang
function regToggleFoodChipBilingual(btn, nombreEs, nombreEn){
  if(!btn) return;
  const nombre = _regLang === 'en' ? nombreEn : nombreEs;
  const other = _regLang === 'en' ? nombreEs : nombreEn;
  if(_regFoodsSelected.has(other)) _regFoodsSelected.delete(other);
  if(_regFoodsSelected.has(nombre)){
    _regFoodsSelected.delete(nombre);
    btn.classList.remove('on');
  } else {
    _regFoodsSelected.add(nombre);
    btn.classList.add('on');
  }
  const inp=document.getElementById('reg_alimentos_pref');
  if(inp) inp.value=[..._regFoodsSelected].join(', ');
}

function regGetDietPrefsText(){
  const comidas = document.getElementById('reg_num_comidas')?.value || '';
  const chips = [..._regFoodsSelected];
  const extra = (document.getElementById('reg_alimentos_extra')?.value || '').trim();
  const alimentos = [...chips, extra].filter(Boolean).join(', ');
  const partes=[];
  if(alimentos) partes.push(`Alimentos preferidos para crear dieta IA: ${alimentos}`);
  if(comidas) partes.push(`Número de comidas preferido: ${comidas}`);
  return partes.join('\n');
}
function regClearDietPrefs(){
  _regFoodsSelected.clear();
  document.querySelectorAll('.reg-food-chip.on').forEach(b=>b.classList.remove('on'));
  ['reg_alimentos_pref','reg_alimentos_extra'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const meals=document.getElementById('reg_num_comidas');
  if(meals) meals.value='4';
}
function extraerPreferenciasDietaCliente(c){
  const txt = `${c?.observaciones||''}\n${c?.notas||''}`;
  const out={alimentos:[],numComidas:''};
  const mAlim = txt.match(/Alimentos preferidos para crear dieta IA:\s*([^\n]+)/i);
  if(mAlim) out.alimentos = mAlim[1].split(',').map(x=>x.trim()).filter(Boolean);
  const mCom = txt.match(/Número de comidas preferido:\s*(\d+)/i);
  if(mCom) out.numComidas = mCom[1];
  return out;
}
function dbAplicarPreferenciasCliente(c){
  const prefs = extraerPreferenciasDietaCliente(c);
  if(prefs.numComidas){
    const sel=document.getElementById('db_num_comidas');
    if(sel && [...sel.options].some(o=>o.value===prefs.numComidas)) sel.value=prefs.numComidas;
  }
  if(prefs.alimentos?.length){
    _dbSeleccionados.clear();
    prefs.alimentos.forEach(a=>_dbSeleccionados.add(a));
    dbActualizarSelected();
  }
  return prefs;
}

function mostrarOlvideContrasena(){
  document.getElementById('olvide_user').value = document.getElementById('lu')?.value || '';
  document.getElementById('olvide_err').style.display = 'none';
  document.getElementById('olvide_ok').style.display = 'none';
  show('sOlvide');
}

async function solicitarReseteo(){
  const username = document.getElementById('olvide_user').value.trim();
  const errEl = document.getElementById('olvide_err');
  const okEl = document.getElementById('olvide_ok');
  errEl.style.display = 'none';
  okEl.style.display = 'none';
  if(!username){ errEl.textContent = 'Escribe tu nombre de usuario'; errEl.style.display='block'; return; }
  try {
    const r = await fetch('/api/auth/solicitar-reset', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username })
    });
    const d = await r.json();
    if(d.ok) { okEl.style.display='block'; }
    else { errEl.textContent = d.error || 'Error. Contacta con tu coach directamente.'; errEl.style.display='block'; }
  } catch(e) { errEl.textContent = 'Error de conexión.'; errEl.style.display='block'; }
}

async function doRegistro(){
  const nombre=document.getElementById('reg_nombre').value.trim();
  const email=document.getElementById('reg_email').value.trim();
  const pass=document.getElementById('reg_pass').value;
  const err=document.getElementById('reg_err');
  const ok=document.getElementById('reg_ok');
  err.style.display='none';ok.style.display='none';
  const username=document.getElementById('reg_username').value.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
  const tel=document.getElementById('reg_tel').value.trim();
  if(!nombre||!email||!tel||!pass){err.textContent='Nombre, email, teléfono y contraseña son obligatorios';err.style.display='block';return;}
  if(!username||username.length<3){err.textContent='El usuario debe tener al menos 3 caracteres (solo letras y números)';err.style.display='block';return;}
  if(pass.length<6){err.textContent='La contraseña debe tener al menos 6 caracteres';err.style.display='block';return;}
  try{
    await api('/auth/registro',{method:'POST',body:JSON.stringify({
      nombre,username,email,telefono:tel,password:pass,
      objetivo:document.getElementById('reg_obj').value,
      nivel:document.getElementById('reg_niv').value,
      peso_actual:parseFloat(document.getElementById('reg_peso').value)||0,
      altura:parseInt(document.getElementById('reg_altura').value)||0,
      edad:parseInt(document.getElementById('reg_edad').value)||0,
      sexo:document.getElementById('reg_sexo').value,
      actividad:document.getElementById('reg_act').value,
      dieta_tipo:document.getElementById('reg_dieta').value,
      alimentos_no:document.getElementById('reg_alimentos_no').value,
      lesiones:document.getElementById('reg_lesiones').value,
      observaciones:[document.getElementById('reg_obs').value.trim(), regGetDietPrefsText()].filter(Boolean).join('\n\n')
    })});
    ok.textContent='✓ Solicitud enviada. Tu coach la revisará y te dará acceso pronto. Puedes cerrar esta ventana.';
    ok.style.display='block';
    // Clear form
    ['reg_nombre','reg_username','reg_email','reg_tel','reg_pass','reg_peso','reg_altura','reg_edad','reg_alimentos_no','reg_lesiones','reg_obs'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    regClearDietPrefs();
  }catch(e){err.textContent=e.error||'Error al enviar solicitud';err.style.display='block';}
}

