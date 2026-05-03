/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 10_coach_nuevo_cliente.js
   hNuevo(), crearCliente(), reasignarCoach(), traducirEjercicioIA(), traducirDietaIA()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

function hNuevo(){
  // Cargar coaches disponibles para el selector
  api('/coaches').then(coaches=>{
    const sel=document.getElementById('nc_coach');
    if(!sel||!coaches) return;
    coaches.forEach(c=>{
      const opt=document.createElement('option');
      opt.value=c.id;
      opt.textContent=(c.id===USER.id?'🔵 ':'🟣 ')+(c.nombre||c.username)+(c.id===USER.id?` (${COACH_LANG==='en'?'me':'yo'})`:'');
      if(c.id===USER.id) opt.selected=true;
      sel.appendChild(opt);
    });
  }).catch(()=>{});

  return`<div class="sec" style="max-width:500px"><div class="sec-hdr">${COACH_LANG==='en'?'Create new client':'Crear nuevo cliente'}</div>
  <div class="g2" style="gap:8px">
    <div style="grid-column:span 2"><div class="form-lbl">${tc('Nombre completo')}</div><input class="inp" id="nc_n" placeholder="Carlos Martínez"/></div>
    <div><div class="form-lbl">${COACH_LANG==='en'?'Username (login)':'Usuario (login)'}</div><input class="inp" id="nc_u" placeholder="carlos"/></div>
    <div><div class="form-lbl">${tc('Contraseña')}</div><input class="inp" id="nc_p" type="password" placeholder="${COACH_LANG==='en'?'Min 6 chars':'Mín 6 caracteres'}"/></div>
    <div><div class="form-lbl">${tc('Objetivo')}</div><select class="inp" id="nc_o"><option>${tc('Volumen')}</option><option>${tc('Definición')}</option><option>${tc('Fuerza')}</option><option>${tc('Recomposición')}</option></select></div>
    <div><div class="form-lbl">${tc('Nivel')}</div><select class="inp" id="nc_nv"><option>${tc('Principiante')}</option><option selected>${tc('Intermedio')}</option><option>${tc('Avanzado')}</option></select></div>
    <div style="grid-column:span 2">
      <div class="form-lbl">${COACH_LANG==='en'?'Assign to coach':'Asignar a coach'}</div>
      <select class="inp" id="nc_coach" style="margin-bottom:0">
        <option value="${USER.id}">🔵 ${USER.nombre||USER.username} (${COACH_LANG==='en'?'me':'yo'})</option>
      </select>
    </div>
  </div>
  <button class="btn" style="width:100%;padding:13px;margin-top:4px" onclick="crearCliente()">${COACH_LANG==='en'?'Create client':'Crear cliente'}</button>
  <div id="nc_msg" style="font-size:13px;text-align:center;margin-top:10px;font-weight:500"></div>
</div>`;
}

async function crearCliente(){
  const n=document.getElementById('nc_n').value.trim(),u=document.getElementById('nc_u').value.trim(),p=document.getElementById('nc_p').value;
  const coachId=document.getElementById('nc_coach')?.value||USER.id;
  const msg=document.getElementById('nc_msg');
  if(!n||!u||!p){msg.style.color='#f87171';msg.textContent=COACH_LANG==='en'?'Fill in all fields':'Rellena todos los campos';return;}
  try{
    await api('/auth/register-cliente',{method:'POST',body:JSON.stringify({username:u,password:p,nombre:n,objetivo:document.getElementById('nc_o').value,nivel:document.getElementById('nc_nv').value,coach_id:coachId})});
    msg.style.color='#86efac';msg.textContent=COACH_LANG==='en'?`✓ ${n} created. Login: ${u}`:`✓ ${n} creado. Login: ${u}`;
  }catch(e){msg.style.color='#f87171';msg.textContent=e.error||'Error';}
}

async function reasignarCoach(clienteId){
  try{
    const coaches = await api('/coaches');
    const c = window._coachClienteActual;
    const actual = c.coach_id || USER.id;
    const opciones = coaches.map((co,i) => `${i+1}. ${co.nombre||co.username} (@${co.username})${co.id===actual?' ← actual':''}`).join('\n');
    const idx = prompt(COACH_LANG==='en'?`Reassign "${c.nombre}" to:\n\n${opciones}\n\nEnter the number:`:`Reasignar "${c.nombre}" a:\n\n${opciones}\n\nEscribe el número:`);
    if(!idx) return;
    const coach = coaches[parseInt(idx)-1];
    if(!coach){alert(COACH_LANG==='en'?'Invalid number':'Número inválido');return;}
    await api('/clientes/'+clienteId+'/asignar-coach',{method:'POST',body:JSON.stringify({coach_id:coach.id})});
    alert(COACH_LANG==='en'?`✓ ${c.nombre} assigned to ${coach.nombre||coach.username}`:`✓ ${c.nombre} asignado a ${coach.nombre||coach.username}`);
    verCliente(clienteId); // Recargar
  }catch(e){alert('Error: '+(e.error||e.message||'No se pudo reasignar'));}
}

// ── TRADUCCIÓN INSTRUCCIONES EJERCICIO CON IA ─────────────────────────
async function traducirEjercicioIA(nombre, pasos) {
  const btn = document.getElementById('btn_trans_ex');
  const txt = document.getElementById('btn_trans_ex_txt');
  if(!btn || !txt || !pasos) return;

  btn.disabled = true;
  txt.textContent = '⏳';

  try {
    const listaTexto = pasos.map((p,i) => `${i+1}. ${p}`).join('\n');
    const prompt = `Translate these Spanish exercise instructions to English. Keep it concise and technical. Return ONLY a JSON array of strings in the same order, no extra text.\n\n${listaTexto}`;

    const data = await api('/ia/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        system: 'You are a fitness translator ES→EN. Return ONLY a valid JSON array of translated instruction strings, same count as input, no markdown, no extra text.'
      })
    });
    const raw = (data.reply||'').trim().replace(/```json|```/g,'').trim();
    const translated = JSON.parse(raw);

    if(!Array.isArray(translated) || translated.length !== pasos.length) throw new Error('length mismatch');

    // Guardar en cache
    const exTransKey = 'ex_trans_'+nombre.replace(/[^a-zA-Z0-9]/g,'_');
    localStorage.setItem(exTransKey, JSON.stringify(translated));

    // Actualizar los pasos en el modal sin cerrarlo
    const pasosEl = document.getElementById('desc_pasos');
    if(pasosEl) {
      pasosEl.innerHTML = translated.map((p,i)=>`<div style="display:flex;gap:12px;margin-bottom:10px">
        <div style="width:22px;height:22px;border-radius:50%;background:rgba(59,130,246,.2);color:var(--blg);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${i+1}</div>
        <div style="font-size:14px;color:var(--sv2);line-height:1.55">${p}</div>
      </div>`).join('');
    }
    txt.textContent = '✅🇬🇧';
    btn.style.background = 'rgba(34,197,94,.12)';
    btn.style.color = '#86efac';
    btn.style.borderColor = 'rgba(34,197,94,.3)';

  } catch(e) {
    txt.textContent = '⚠️';
    setTimeout(()=>{ txt.textContent = '🇬🇧'; btn.disabled = false; }, 2500);
  }
}
// ──────────────────────────────────────────────────────────────────────
async function traducirDietaIA() {
  const btn = document.getElementById('btn_translate_diet');
  const txt = document.getElementById('btn_translate_diet_txt');
  if(!btn || !txt) return;

  btn.disabled = true;
  txt.textContent = '⏳';

  try {
    // ── Construir lista completa de textos a traducir ──
    const allItems = []; // { type, key, text }

    // 1. Alimentos de cada comida
    CD.comidas.forEach((m, mi) => {
      (m.items || []).forEach((it, ji) => {
        allItems.push({ type:'food', mi, ji, text: it.nombre });
      });
    });

    // 2. Nombres de variaciones/alternativas
    const vars = CD._planVariaciones || {};
    Object.entries(vars).forEach(([mi, varList]) => {
      (varList || []).forEach((v, vi) => {
        if(v.nombre) allItems.push({ type:'var', mi:parseInt(mi), vi, text: v.nombre });
      });
    });

    // 3. Suplementos personalizados (los base son hardcoded y ya en inglés en código)
    const sups = CD._planSuplementacion || [];
    sups.forEach((s, si) => {
      if(s.nombre) allItems.push({ type:'sup_nombre', si, text: s.nombre });
      if(s.momento) allItems.push({ type:'sup_momento', si, text: s.momento });
      if(s.motivo) allItems.push({ type:'sup_motivo', si, text: s.motivo });
    });

    // 4. Alimentos terapéuticos
    const alimTher = CD._planAlimentosTerapeuticos || [];
    alimTher.forEach((a, ai) => {
      if(a.alimento) allItems.push({ type:'ther_alimento', ai, text: a.alimento });
      if(a.frecuencia) allItems.push({ type:'ther_frecuencia', ai, text: a.frecuencia });
      if(a.motivo) allItems.push({ type:'ther_motivo', ai, text: a.motivo });
    });

    // 5. Frase motivadora
    if(CD._planFrase) allItems.push({ type:'frase', text: CD._planFrase });

    const listaTexto = allItems.map((it, i) => `${i+1}. ${it.text}`).join('\n');
    const prompt = `Translate all these Spanish nutrition texts to English. Keep quantities, doses, brand names and scientific terms. Return ONLY a JSON array of strings in the same order, no extra text.\n\n${listaTexto}`;

    const data = await api('/ia/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        system: 'You are a nutrition translator ES→EN. Return ONLY a valid JSON array of translated strings, same count as input, no markdown, no extra text.'
      })
    });
    const raw = (data.reply || '').trim().replace(/```json|```/g,'').trim();
    const translated = JSON.parse(raw);

    if (!Array.isArray(translated) || translated.length !== allItems.length) throw new Error('length mismatch: got '+translated.length+' expected '+allItems.length);

    // ── Construir cache completo ──
    const cache = {
      foods: {},      // [mi][ji] = nombre traducido
      vars: {},       // [mi][vi] = nombre alternativa
      sups: {},       // [si] = {nombre, momento, motivo}
      ther: {},       // [ai] = {alimento, frecuencia, motivo}
    };

    allItems.forEach((it, i) => {
      const tr = translated[i];
      if(it.type === 'food') {
        if(!cache.foods[it.mi]) cache.foods[it.mi] = {};
        cache.foods[it.mi][it.ji] = tr;
      } else if(it.type === 'var') {
        if(!cache.vars[it.mi]) cache.vars[it.mi] = {};
        cache.vars[it.mi][it.vi] = tr;
      } else if(it.type === 'sup_nombre') {
        if(!cache.sups[it.si]) cache.sups[it.si] = {};
        cache.sups[it.si].nombre = tr;
      } else if(it.type === 'sup_momento') {
        if(!cache.sups[it.si]) cache.sups[it.si] = {};
        cache.sups[it.si].momento = tr;
      } else if(it.type === 'sup_motivo') {
        if(!cache.sups[it.si]) cache.sups[it.si] = {};
        cache.sups[it.si].motivo = tr;
      } else if(it.type === 'ther_alimento') {
        if(!cache.ther[it.ai]) cache.ther[it.ai] = {};
        cache.ther[it.ai].alimento = tr;
      } else if(it.type === 'ther_frecuencia') {
        if(!cache.ther[it.ai]) cache.ther[it.ai] = {};
        cache.ther[it.ai].frecuencia = tr;
      } else if(it.type === 'ther_motivo') {
        if(!cache.ther[it.ai]) cache.ther[it.ai] = {};
        cache.ther[it.ai].motivo = tr;
      } else if(it.type === 'frase') {
        cache.frase = tr;
      }
    });

    localStorage.setItem('dieta_trans_'+CD.id, JSON.stringify(cache));
    txt.textContent = '✅🇬🇧';
    setTimeout(() => { document.getElementById('klContent').innerHTML = hDieta(); }, 500);

  } catch(e) {
    console.error('Diet translation error:', e);
    txt.textContent = '⚠️';
    btn.disabled = false;
    setTimeout(() => { txt.textContent = '🇬🇧'; }, 2500);
  }
}
// ──────────────────────────────────────────────────────────────────────

