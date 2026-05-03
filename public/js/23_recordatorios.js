/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 23_recordatorios.js
   Recordatorios y avisos de lesiones: checkRecordatorios(), getInjuryWarnings()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ RECORDATORIOS ════════════════════════════════════
function checkRecordatorios(){
  if(!CD)return;
  const ahora=Date.now();

  // Comprobar peso semanal (cada 7 días)
  const ultimoPeso=localStorage.getItem('wm_ultimo_peso_'+CD.id);
  const posponerPesoTs=parseInt(localStorage.getItem('wm_pos_peso_'+CD.id)||'0');
  const SEMANA=7*24*60*60*1000;
  const pesos=CD.pesos||[];
  const ultimoPesoFecha=pesos.length?new Date(pesos[pesos.length-1].fecha).getTime():0;
  const necesitaPeso=(ahora-ultimoPesoFecha)>SEMANA&&ahora>posponerPesoTs;
  
  // Comprobar foto mensual (cada 28 días)
  const posponerFotoTs=parseInt(localStorage.getItem('wm_pos_foto_'+CD.id)||'0');
  const MES=28*24*60*60*1000;
  const fotos=CD.fotos||[];
  const ultimaFotoFecha=fotos.length?new Date(fotos[fotos.length-1].fecha).getTime():0;
  const necesitaFoto=(ahora-ultimaFotoFecha)>MES&&ahora>posponerFotoTs;

  if(necesitaPeso){
    setTimeout(()=>{document.getElementById('pesoReminder').style.display='flex';applyLang(document.getElementById('pesoReminder'));},1500);
  } else if(necesitaFoto){
    setTimeout(()=>{document.getElementById('fotoReminder').style.display='flex';applyLang(document.getElementById('fotoReminder'));},2000);
  }
}

function irAPeso(){
  document.getElementById('pesoReminder').style.display='none';
  klNav('progreso',document.getElementById('bni3'));
}
function posponerPeso(){
  localStorage.setItem('wm_pos_peso_'+CD.id, Date.now()+(24*60*60*1000));
  document.getElementById('pesoReminder').style.display='none';
}
function irAFoto(){
  document.getElementById('fotoReminder').style.display='none';
  klNav('progreso',document.getElementById('bni3'));
}
function posponerFoto(){
  localStorage.setItem('wm_pos_foto_'+CD.id, Date.now()+(7*24*60*60*1000));
  document.getElementById('fotoReminder').style.display='none';
}



// INJURY WARNINGS
const INJURY_MAP={
  'rodilla':['Squat (Barbell)','Front Squat (Barbell)','Bulgarian Split Squat (Dumbbell)','Bulgarian Split Squat (Barbell)','Hack Squat (Machine)','Walking Lunge (Dumbbell)','Static Lunge (Barbell)','Step Up (Dumbbell)','Leg Extension (Machine)'],
  'knee':['Squat (Barbell)','Front Squat (Barbell)','Bulgarian Split Squat (Dumbbell)','Hack Squat (Machine)','Walking Lunge (Dumbbell)','Leg Extension (Machine)'],
  'lumbar':['Deadlift (Barbell)','Romanian Deadlift (Barbell)','Good Morning (Barbell)','Barbell Row (Overhand)','Overhead Press (Barbell)','Squat (Barbell)'],
  'lower back':['Deadlift (Barbell)','Romanian Deadlift (Barbell)','Good Morning (Barbell)','Barbell Row (Overhand)'],
  'hombro':['Overhead Press (Barbell)','Seated Overhead Press (Barbell)','Bench Press (Barbell)','Skull Crusher (Barbell)','Upright Row (Barbell)','Behind Neck Press'],
  'shoulder':['Overhead Press (Barbell)','Upright Row (Barbell)','Behind Neck Press'],
  'cervical':['Overhead Press (Barbell)','Seated Overhead Press (Barbell)','Shrug (Barbell)','Upright Row (Barbell)'],
  'muñeca':['Barbell Curl','EZ Bar Curl','Skull Crusher (Barbell)','Wrist Curl'],
  'wrist':['Barbell Curl','EZ Bar Curl','Skull Crusher (Barbell)'],
  'codo':['Skull Crusher (Barbell)','Skull Crusher (EZ Bar)','Close Grip Bench Press','Tricep Pushdown (Bar)'],
  'elbow':['Skull Crusher (Barbell)','Close Grip Bench Press'],
  'cadera':['Hip Thrust (Barbell)','Bulgarian Split Squat (Dumbbell)','Side Lunge (Dumbbell)'],
  'isquio':['Romanian Deadlift (Barbell)','Deadlift (Barbell)','Good Morning (Barbell)'],
  'hamstring':['Romanian Deadlift (Barbell)','Deadlift (Barbell)','Good Morning (Barbell)'],
};

function getInjuryWarnings(ejercicioNombre, lesiones){
  if(!lesiones)return[];
  const lesionesLower=lesiones.toLowerCase();
  const warnings=[];
  for(const[zona,ejercicios]of Object.entries(INJURY_MAP)){
    if(lesionesLower.includes(zona)&&ejercicios.includes(ejercicioNombre)){
      warnings.push(zona);
    }
  }
  return warnings;
}

