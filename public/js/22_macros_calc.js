/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 22_macros_calc.js
   Calculadoras macros: autoCalcMacros(), recalcMacros(), calcularMacrosCoachCliente()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ AUTO CALC MACROS ═════════════════════════════════
function autoCalcMacros(){
  const peso = parseFloat(document.getElementById('pf_peso')?.value || document.querySelector('#cContent [id="kcal"]')?.getAttribute('data-peso') || 0);
  // Get data from client form fields
  const pesoEl = document.getElementById('pf_peso');
  const alturaEl = document.getElementById('pf_altura');  
  const edadEl = document.getElementById('pf_edad');
  const sexoEl = document.getElementById('pf_sexo');
  const actividadEl = document.getElementById('pf_actividad');
  
  // Use stored CD data as fallback
  const p = parseFloat(pesoEl?.value) || (window._cid && CD ? CD.peso_actual : 0);
  const h = parseInt(alturaEl?.value) || (window._cid && CD ? CD.altura : 0);
  const e = parseInt(edadEl?.value) || (window._cid && CD ? CD.edad : 0);
  const sexo = sexoEl?.value || (window._cid && CD ? CD.sexo : 'Hombre');
  const actividad = actividadEl?.value || (window._cid && CD ? CD.actividad : 'Moderada');
  const obj = document.getElementById('obj')?.value || 'Volumen';
  
  if(!p || !h || !e) {
    alert('Rellena primero: peso, altura y edad del cliente en su perfil');
    return;
  }
  
  // Mifflin-St Jeor TMB
  let tmb;
  if(sexo === 'Hombre') tmb = Math.round(10*p + 6.25*h - 5*e + 5);
  else tmb = Math.round(10*p + 6.25*h - 5*e - 161);
  
  // Activity factor
  const factores = {
    'Sedentario':1.2,'Sedentario (poco o nada de ejercicio)':1.2,
    'Ligera':1.375,'Ligera (1-2 días/semana)':1.375,
    'Moderada':1.55,'Moderada (3-4 días/semana)':1.55,
    'Alta':1.725,'Alta (5-6 días/semana)':1.725,
    'Muy alta':1.9,'Muy alta (atleta, 2x día)':1.9,
  };
  const factor = factores[actividad] || 1.55;
  const tdee = Math.round(tmb * factor);
  
  // Adjust for goal
  let kcal, protMultiplier;
  if(obj.includes('Volumen')) { kcal = tdee + 300; protMultiplier = 2.0; }
  else if(obj.includes('Definición')) { kcal = Math.round(tdee * 0.85); protMultiplier = 2.1; }
  else if(obj.includes('Perder')) { kcal = Math.round(tdee * 0.85); protMultiplier = 2.1; }
  else if(obj.includes('Fuerza')) { kcal = tdee + 200; protMultiplier = 2.2; }
  else { kcal = tdee; protMultiplier = 2.0; } // Recomposición
  
  // Macros
  const prot = Math.round(p * protMultiplier);
  const fat = Math.round(p * 0.8);
  const carbs = Math.max(0, Math.round((kcal - prot*4 - fat*9) / 4));
  
  // Update fields
  const kcalEl = document.getElementById('kcal');
  const protEl = document.getElementById('prot');
  const fatEl = document.getElementById('fat');
  const carbsEl = document.getElementById('carbs');
  
  if(kcalEl) kcalEl.value = kcal;
  if(protEl) protEl.value = prot;
  if(fatEl) fatEl.value = fat;
  if(carbsEl) carbsEl.value = carbs;
  
  // Update visual bars
  recalcMacros('kcal');
  
  // Show confirmation
  const btn = event.target;
  const orig = btn.textContent;
  btn.textContent = `✓ ${kcal} kcal · ${prot}g P · ${carbs}g C · ${fat}g G`;
  btn.style.background = 'rgba(34,197,94,.2)';
  setTimeout(() => { btn.textContent = orig; btn.style.background = 'rgba(34,197,94,.1)'; }, 4000);
}

// ═══ CALCULADORA DE MACROS ════════════════════════════
function recalcMacros(changed){
  const kcal=parseInt(document.getElementById('kcal').value)||0;
  const prot=parseInt(document.getElementById('prot').value)||0;
  const fat=parseInt(document.getElementById('fat').value)||0;
  let carbs=parseInt(document.getElementById('carbs').value)||0;
  
  // Auto-adjust carbs when kcal, prot or fat changes
  if(changed==='kcal'||changed==='prot'||changed==='fat'){
    const usedKcal = prot*4 + fat*9;
    const remainingKcal = kcal - usedKcal;
    carbs = Math.max(0, Math.round(remainingKcal/4));
    document.getElementById('carbs').value = carbs;
  } else {
    // If carbs changed, update total kcal
    const totalKcal = prot*4 + fat*9 + carbs*4;
    document.getElementById('kcal').value = totalKcal;
  }
  
  // Update kcal labels
  const finalKcal = parseInt(document.getElementById('kcal').value)||0;
  const finalCarbs = parseInt(document.getElementById('carbs').value)||0;
  const el_pk=document.getElementById('prot_kcal');
  const el_fk=document.getElementById('fat_kcal');
  const el_ck=document.getElementById('carbs_kcal');
  if(el_pk)el_pk.textContent=(prot*4)+' kcal';
  if(el_fk)el_fk.textContent=(fat*9)+' kcal';
  if(el_ck)el_ck.textContent=(finalCarbs*4)+' kcal';
  
  // Update bar and percentages
  if(finalKcal>0){
    const pp=Math.round(prot*4/finalKcal*100);
    const fp=Math.round(fat*9/finalKcal*100);
    const cp=Math.round(finalCarbs*4/finalKcal*100);
    const bp=document.getElementById('bar_prot');
    const bf=document.getElementById('bar_fat');
    const bc=document.getElementById('bar_carbs');
    if(bp)bp.style.width=pp+'%';
    if(bf)bf.style.width=fp+'%';
    if(bc)bc.style.width=cp+'%';
    const ep=document.getElementById('prot_pct');
    const ef=document.getElementById('fat_pct');
    const ec=document.getElementById('carbs_pct');
    if(ep)ep.textContent=pp+'%';
    if(ef)ef.textContent=fp+'%';
    if(ec)ec.textContent=cp+'%';
  }
}

function calcTMBCoach(c){
  const p=parseFloat(c.peso_actual),h=parseInt(c.altura),e=parseInt(c.edad);
  if(!p||!h||!e)return'—';
  if(c.sexo==='Hombre')return Math.round(10*p+6.25*h-5*e+5);
  return Math.round(10*p+6.25*h-5*e-161);
}
function calcGastoCoach(c){
  const tmb=calcTMBCoach(c);if(tmb==='—')return'—';
  const factores={'Sedentario (poco o nada de ejercicio)':1.2,'Ligera (1-2 días/semana)':1.375,'Moderada (3-4 días/semana)':1.55,'Alta (5-6 días/semana)':1.725,'Muy alta (atleta, 2x día)':1.9,'Sedentario':1.2,'Ligera':1.375,'Moderada':1.55,'Alta':1.725,'Muy alta':1.9};
  return Math.round(tmb*(factores[c.actividad]||1.55));
}



// ═══ CALCULADORA COACH PRO + AUTOGUARDADO ═══════════════════════════
function calcularMacrosCoachCliente(c){
  const peso = parseFloat(c.peso_actual || c.peso || 0);
  const altura = parseInt(c.altura || 0);
  const edad = parseInt(c.edad || 0);
  const sexo = String(c.sexo || 'Hombre').toLowerCase();
  const actividad = String(c.actividad || 'Moderada').toLowerCase();
  const objetivo = String(c.objetivo || 'Mantenimiento').toLowerCase();

  if(!peso || !altura || !edad){
    return {
      kcal: parseInt(c.kcal_internas || 2000),
      prot: parseInt(c.prot || Math.round((peso || 75) * 2)),
      fat: parseInt(c.fat || Math.round((peso || 75) * 0.8)),
      carbs: parseInt(c.carbs || 200),
      tmb: 0,
      gasto: 0
    };
  }

  const tmb = Math.round(
    sexo.includes('mujer') || sexo.includes('female')
      ? (10 * peso + 6.25 * altura - 5 * edad - 161)
      : (10 * peso + 6.25 * altura - 5 * edad + 5)
  );

  let factor = 1.55;
  if(actividad.includes('sedent') || actividad.includes('bajo')) factor = 1.2;
  else if(actividad.includes('liger')) factor = 1.375;
  else if(actividad.includes('moder')) factor = 1.55;
  else if(actividad.includes('alta') || actividad.includes('activo') || actividad.includes('5-6')) factor = 1.725;
  else if(actividad.includes('muy') || actividad.includes('atleta')) factor = 1.9;

  const gasto = Math.round(tmb * factor);

  let kcal = gasto;
  if(objetivo.includes('defin') || objetivo.includes('perder') || objetivo.includes('grasa')){
    kcal = Math.round(gasto * 0.85); // déficit moderado 15%, no agresivo
  } else if(objetivo.includes('recomp')){
    kcal = Math.round(gasto * 0.92);
  } else if(objetivo.includes('vol') || objetivo.includes('ganar') || objetivo.includes('masa')){
    kcal = Math.round(gasto * 1.10);
  } else if(objetivo.includes('fuerza')){
    kcal = Math.round(gasto * 1.05);
  }

  const prot = Math.round(peso * 2.1);
  const fat = Math.round(peso * 0.8);
  const carbs = Math.max(0, Math.round((kcal - (prot * 4 + fat * 9)) / 4));

  return { kcal, prot, fat, carbs, tmb, gasto };
}

let _coachMacroSaveTimer = null;

function aplicarMacrosCoach(c, guardar=false){
  const calc = calcularMacrosCoachCliente(c);

  const kcalEl = document.getElementById('kcal');
  const protEl = document.getElementById('prot');
  const fatEl = document.getElementById('fat');
  const carbsEl = document.getElementById('carbs');

  if(kcalEl) kcalEl.value = calc.kcal;
  if(protEl) protEl.value = calc.prot;
  if(fatEl) fatEl.value = calc.fat;
  if(carbsEl) carbsEl.value = calc.carbs;

  recalcMacros('kcal');

  const w = document.getElementById('tmb_wrap_coach');
  if(w && calc.tmb && calc.gasto){
    w.innerHTML = `<div style="display:flex;gap:10px">
      <div style="flex:1;background:rgba(37,99,235,.08);border:0.5px solid rgba(59,130,246,.2);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:10px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.06em">TMB</div>
        <div style="font-size:18px;font-weight:700;color:var(--sv)">${calc.tmb}</div>
        <div style="font-size:10px;color:var(--tx3)">kcal reposo</div>
      </div>
      <div style="flex:1;background:rgba(34,197,94,.08);border:0.5px solid rgba(34,197,94,.2);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:10px;color:var(--gnb);font-weight:700;text-transform:uppercase;letter-spacing:.06em">Gasto total</div>
        <div style="font-size:18px;font-weight:700;color:var(--sv)">${calc.gasto}</div>
        <div style="font-size:10px;color:var(--tx3)">kcal/día</div>
      </div>
    </div>`;
  }

  if(guardar) autoGuardarMacrosCoach();
}

function autoGuardarMacrosCoach(){
  const btn = document.getElementById('btn_guardar_datos');
  const id = btn?.dataset?.clienteId || window._coachClienteId || window._lastClienteId;
  if(!id) return;

  clearTimeout(_coachMacroSaveTimer);
  _coachMacroSaveTimer = setTimeout(async ()=>{
    try{
      await api('/clientes/'+id,{method:'PUT',body:JSON.stringify({
        objetivo:document.getElementById('obj')?.value || '',
        nivel:document.getElementById('niv')?.value || '',
        kcal_internas:parseInt(document.getElementById('kcal')?.value)||0,
        prot:parseInt(document.getElementById('prot')?.value)||0,
        carbs:parseInt(document.getElementById('carbs')?.value)||0,
        fat:parseInt(document.getElementById('fat')?.value)||0,
        comida_libre:document.getElementById('clibre')?.value || '',
        mensaje_semana:document.getElementById('msgsem')?.value || '',
        notas_coach:document.getElementById('notasc')?.value || ''
      })});
      if(btn){
        const old = btn.textContent;
        btn.textContent = '✓ Guardado automático';
        setTimeout(()=>{ btn.textContent = old.includes('Guardado') ? 'Guardar' : old; }, 1200);
      }
    }catch(e){
      console.error('Error autoguardando macros', e);
    }
  }, 700);
}

function recalcularYGuardarCoach(){
  const base = window._coachClienteActual || {};
  const c = {
    ...base,
    objetivo: document.getElementById('obj')?.value || base.objetivo,
    nivel: document.getElementById('niv')?.value || base.nivel
  };
  aplicarMacrosCoach(c, true);
}


