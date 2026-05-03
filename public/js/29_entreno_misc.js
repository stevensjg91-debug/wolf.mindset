/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 29_entreno_misc.js
   Funciones entreno varias: iniciarEntreno(), getWorkoutDuration(), rbEditEx()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

function iniciarEntreno(){
  workoutStartTime = Date.now();
  soundDing();
  if(workoutTimerInt) clearInterval(workoutTimerInt);
  workoutTimerInt = setInterval(()=>{
    const el = document.getElementById('workout_timer');
    if(!el){ clearInterval(workoutTimerInt); return; }
    const secs = Math.floor((Date.now()-workoutStartTime)/1000);
    const m = Math.floor(secs/60), s = secs%60;
    el.textContent = String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }, 1000);
  // Re-render hero to show timer
  const hero = document.querySelector('.hero-day');
  if(hero){
    const timerDiv = hero.querySelector('[onclick="iniciarEntreno()"]')?.parentElement;
    if(timerDiv) timerDiv.innerHTML =
      '<div id="workout_timer" style="font-family:Bebas Neue,sans-serif;font-size:22px;color:var(--gnb);letter-spacing:.08em">00:00</div>'+
      '<div style="font-size:9px;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em">En curso</div>';
  }
}

function getWorkoutDuration(){
  if(!workoutStartTime) return 0;
  return Math.round((Date.now()-workoutStartTime)/60000);
}

function rbEditEx(exId){
  // Load exercise data and open edit panel
  api('/ejercicios/'+exId).then(e=>{
    const panel = document.getElementById('rb_add_panel');
    const title = document.getElementById('rb_add_title');
    if(!panel||!title) return;
    title.textContent = e.nombre + ' — editando';
    document.getElementById('rb_add_nombre').value = e.nombre;
    document.getElementById('rb_add_musculos').value = e.musculos||'';
    document.getElementById('rb_add_series').value = e.series||3;
    document.getElementById('rb_add_reps').value = e.reps||'10-12';
    document.getElementById('rb_add_peso').value = e.peso_objetivo||0;
    document.getElementById('rb_add_descanso').value = e.descanso||90;
    const rirActivo = e.rir != null;
    document.getElementById('rb_add_rir_on').checked = rirActivo;
    document.getElementById('rb_rir_val_wrap').style.display = rirActivo ? 'block' : 'none';
    document.getElementById('rb_add_rir').value = e.rir!=null?e.rir:2;
    document.getElementById('rb_add_principal').checked = !!e.es_principal;
    document.getElementById('rb_add_yt').value = e.youtube_url||'';
    document.getElementById('rb_add_nota').value = e.nota_coach||'';
    // Switch button to update mode
    const btn = document.getElementById('rb_add_btn');
    btn.innerHTML = '✓ Guardar cambios';
    btn.onclick = ()=> rbConfirmEdit(exId);
    panel.style.display = 'flex';
  }).catch(()=>{
    // Fallback: just open panel with name prefilled
    rbAddEx(nombre,'');
  });
}

async function cargarGraficasCoach2(clienteId, ejerciciosPrincipales){
  // Temporalmente swap del wrap para reusar la misma lógica
  const wrap1 = document.getElementById('graficas_coach_wrap');
  const wrap2 = document.getElementById('graficas_coach_wrap2');
  if(!wrap2) return;
  // Insertar wrap2 como graficas_coach_wrap temporalmente
  if(wrap2) wrap2.id = 'graficas_coach_wrap';
  await cargarGraficasCoach(clienteId, ejerciciosPrincipales);
  if(wrap2) wrap2.id = 'graficas_coach_wrap2';
}


async function rbConfirmEdit(exId){
  const btn = document.getElementById('rb_add_btn');
  btn.innerHTML = '⏳ Guardando...'; btn.disabled = true;
  try{
    await api('/ejercicios/'+exId,{method:'PUT',body:JSON.stringify({
      series: parseInt(document.getElementById('rb_add_series').value)||3,
      reps: document.getElementById('rb_add_reps').value||'10-12',
      peso_objetivo: parseFloat(document.getElementById('rb_add_peso').value)||0,
      descanso: parseInt(document.getElementById('rb_add_descanso').value)||90,
      rir: document.getElementById('rb_add_rir_on').checked ? (parseInt(document.getElementById('rb_add_rir').value)||2) : null,
      es_principal: document.getElementById('rb_add_principal').checked?1:0,
      youtube_url: document.getElementById('rb_add_yt').value||'',
      nota_coach: document.getElementById('rb_add_nota').value||''
    })});
    btn.innerHTML = '✓ Añadir ejercicio';
    btn.onclick = rbConfirmAdd;
    btn.disabled = false;
    document.getElementById('rb_add_panel').style.display='none';
    await rbLoadDias();
  }catch(e){
    btn.innerHTML = 'Error - reintentar'; btn.disabled = false;
  }
}


