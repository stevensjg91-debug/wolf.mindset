/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 16_coach_ia.js
   IA Coach panel: hIACoach(), sendIA()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ IA COACH ═════════════════════════════════════════
function hIACoach(){return`<div class="ia-chip" style="margin-bottom:12px"><div class="ia-chip-title">${COACH_LANG==='en'?'Private AI coach assistant':'IA privada del coach'}</div>${COACH_LANG==='en'?'Generate full routines and diets, analyse progress or request specific adjustments for any client.':'Genera rutinas y dietas completas, analiza progreso o pide ajustes específicos para cualquier cliente.'}</div>

<div class="sec" style="display:flex;flex-direction:column;height:480px">
  <div class="chat-msgs" id="iaMsgs" style="flex:1;background:var(--b);border:0.5px solid var(--br);border-radius:10px;padding:11px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px">
    <div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>${tc('Hola coach, listo. Puedo generar rutinas y dietas completas, analizar progreso y sugerir ajustes. ¿Qué necesitas?')}</div>
  </div>
  <div class="typing" id="iaTyping">${COACH_LANG==='en'?'processing...':'procesando...'}</div>
  <div style="display:flex;gap:8px">
    <input class="inp" id="iaIn" placeholder="${COACH_LANG==='en'?'E.g. generate routine for Carlos, 4 days, bulk...':'Ej: genera rutina para Carlos, 4 días, volumen...'}" style="flex:1;margin-bottom:0" onkeydown="if(event.key==='Enter')sendIA()"/>
    <button class="btn" onclick="sendIA()">${tc('Enviar')}</button>
  </div>
</div>`;}

async function sendIA(){
  const inp=document.getElementById('iaIn'),msg=inp.value.trim();if(!msg)return;inp.value='';
  const msgs=document.getElementById('iaMsgs');
  msgs.innerHTML+=`<div class="msg msg-u">${msg}</div>`;msgs.scrollTop=msgs.scrollHeight;
  iaH.push({role:'user',content:msg});document.getElementById('iaTyping').style.display='block';
  try{const d=await api('/ia/chat',{method:'POST',body:JSON.stringify({messages:iaH,system:`Eres el asistente IA privado del coach WolfMindset. Ayudas con progresión de carga, periodización, ajustes calóricos, generación de rutinas y dietas completas. ${COACH_LANG==='en'?'Always respond in English. Technical and concise.':'Respuestas técnicas y concisas en español.'}`})});iaH.push({role:'assistant',content:d.reply});document.getElementById('iaTyping').style.display='none';msgs.innerHTML+=`<div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>${d.reply}</div>`;msgs.scrollTop=msgs.scrollHeight;}
  catch(e){document.getElementById('iaTyping').style.display='none';msgs.innerHTML+=`<div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>Error. Inténtalo de nuevo.</div>`;}
}

// ═══ CLIENTE ══════════════════════════════════════════
function klNav(s,btn){
  klTab=s;document.querySelectorAll('.bnav-bar .bni').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  renderKL();
}
function renderKL(){
  const el=document.getElementById('klContent');
  if(!CD){el.innerHTML='<div style="padding:40px;text-align:center;color:var(--tx3)">Cargando...</div>';return;}
  if(klTab==='entreno'){
    // Load today's sessions from server first, then render — ensures state is correct across devices
    const hoy = new Date().toISOString().split('T')[0];
    Promise.all([
      api('/clientes/'+CD.id+'/semana-estado'),
      api('/clientes/'+CD.id+'/sesiones').catch(()=>[])
    ]).then(([estado, sesiones])=>{
      // Sync server sessions to localStorage so getSesionEstado() works correctly
      sesiones.forEach(s => {
        const fechaSesion = (s.fecha||'').split('T')[0];
        if(fechaSesion === hoy && s.dia_nombre && s.estado) {
          localStorage.setItem('wm_sesion_'+CD.id+'_'+s.dia_nombre.replace(/\s/g,'_')+'_'+hoy, s.estado);
        }
      });
      if(estado.tiene_borrador){
        el.innerHTML = hProximaSemanaEnPreparacion();
      } else {
        el.innerHTML = hSeleccionDia();
      }
      if(LANG!=='es') setTimeout(()=>applyLang(el), 30);
    }).catch(()=>{ el.innerHTML = hSeleccionDia(); if(LANG!=='es') applyLang(el); });
    // Traducir nav bar siempre
    if(LANG!=='es') applyLang(document.querySelector('#sCliente .bnav-bar'));
    return;
  }
  else if(klTab==='dieta')el.innerHTML=hDieta();
  else if(klTab==='asistente'){el.innerHTML=hAsistente();setTimeout(_chatAfterRender,30);}
  else if(klTab==='progreso'){el.innerHTML=hProgreso2();setTimeout(()=>{cargarGraficasCliente();initPesoSection();},50);setTimeout(renderFotosProgreso,200);}
  else if(klTab==='logros')el.innerHTML=hBadgesCliente();
  else if(klTab==='perfil')el.innerHTML=hPerfil();
  // Aplicar traducción + nav bar
  if(LANG!=='es') {
    setTimeout(()=>{
      applyLang(el);
      applyLang(document.querySelector('#sCliente .bnav-bar'));
    }, 80);
  }
}

// ENTRENO CLIENTE (estilo Strong)
// ═══ ENTRENO CLIENTE - ESTILO STRONG ══════════════════
let activeInput = null; // {ei, si, field} — qué celda está activa
let runningTimers = {}; // ei_si -> {interval, secs, total, paused, endAt} — usa hora real para que no se congele al bloquear pantalla
let workoutStartTime = null;
let workoutTimerInt = null;
let doneShown = false;

