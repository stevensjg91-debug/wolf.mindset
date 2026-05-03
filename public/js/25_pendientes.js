/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 25_pendientes.js
   Panel pendientes: hPendientes(), aprobarCliente(), rechazarCliente(), checkPendientes()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// PANEL PENDIENTES
function hPendientes(p){
  if(!p.length) return `<div style="text-align:center;padding:60px 20px;color:var(--tx3)"><div style="font-size:48px;margin-bottom:14px">✅</div><div style="font-size:15px;font-weight:600;color:var(--sv2)">${COACH_LANG==='en'?'No pending requests':'Sin solicitudes pendientes'}</div><div style="font-size:13px;margin-top:6px">${tc('Cuando alguien se registre aparecerá aquí')}</div></div>`;
  
  return `<div class="sec" style="margin-bottom:12px"><div class="sec-hdr">${p.length} ${COACH_LANG==='en'?`pending request${p.length!==1?'s':''}`:`solicitud${p.length!==1?'es':''} pendiente${p.length!==1?'s':''}`}</div>
  ${p.map(c=>`<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;padding:14px;margin-bottom:10px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <div>
        <div style="font-size:15px;font-weight:700;color:var(--sv)">${c.nombre}</div>
        <div style="font-size:12px;color:var(--blg);margin-top:2px">${c.email}${c.telefono?` · 📱 ${c.telefono}`:''}</div>
      </div>
      <span class="badge b-am">${COACH_LANG==='en'?'Pending':'Pendiente'}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">
      ${[[tc('Objetivo'),tc(c.objetivo)||c.objetivo],[tc('Nivel'),tc(c.nivel)||c.nivel],[COACH_LANG==='en'?'Weight':'Peso',c.peso_actual?fmtPeso(c.peso_actual):'—'],[COACH_LANG==='en'?'Height':'Altura',c.altura?fmtAltura(c.altura):'—'],[tc('Edad'),c.edad?c.edad+(COACH_LANG==='en'?' y':' años'):'—'],[tc('Sexo'),c.sexo?tc(c.sexo):'—']].map(([l,v])=>`<div style="background:var(--s);border:0.5px solid var(--br);border-radius:8px;padding:7px 9px"><div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;letter-spacing:.06em">${l}</div><div style="font-size:12px;font-weight:600;color:var(--sv2);margin-top:1px">${v}</div></div>`).join('')}
    </div>
    ${c.lesiones?`<div style="background:rgba(239,68,68,.08);border:0.5px solid rgba(239,68,68,.2);border-radius:8px;padding:8px 10px;font-size:12px;color:#fca5a5;margin-bottom:6px">⚠️ <span style="font-weight:700">${tc('Lesiones:')}</span> ${c.lesiones}</div>`:''}
    ${c.dieta_tipo&&c.dieta_tipo!=='Omnivoro'?`<div style="background:rgba(34,197,94,.08);border:0.5px solid rgba(34,197,94,.2);border-radius:8px;padding:8px 10px;font-size:12px;color:var(--gnb);margin-bottom:6px">🥗 <span style="font-weight:700">${tc('Dieta:')}</span> ${tc(c.dieta_tipo)}</div>`:''}
    ${c.alimentos_no?`<div style="background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.2);border-radius:8px;padding:8px 10px;font-size:12px;color:var(--amb);margin-bottom:6px">🚫 <span style="font-weight:700">${tc('No come:')}</span> ${c.alimentos_no}</div>`:''}
    ${c.observaciones?`<div style="background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.2);border-radius:8px;padding:8px 10px;font-size:12px;color:var(--amb);margin-bottom:10px">📝 <span style="font-weight:700">${COACH_LANG==='en'?'Notes:':'Obs:'}</span> ${c.observaciones}</div>`:''}
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;padding:10px;background:#166534;color:#86efac" onclick="aprobarCliente(${c.id},'${c.nombre}')">✓ ${tc('Aprobar y crear')}</button>
      <button class="btn" style="flex:1;padding:10px;background:rgba(239,68,68,.15);color:#fca5a5;border:0.5px solid rgba(239,68,68,.3)" onclick="rechazarCliente(${c.id},'${c.nombre}')">✕ ${tc('Rechazar')}</button>
    </div>
  </div>`).join('')}</div>`;
}

async function aprobarCliente(userId, nombre){
  await api('/usuarios/'+userId+'/aprobar',{method:'PUT',body:JSON.stringify({})});
  const p=await api('/clientes-pendientes');
  document.getElementById('cContent').innerHTML=hPendientes(p);
  checkPendientes();
  alert('✓ '+nombre+(COACH_LANG==='en'?' approved. They can now access the app.':' aprobado. Ya puede acceder a la app.'));
}

async function rechazarCliente(userId, nombre){
  if(!confirm(tc('¿Rechazar y eliminar la solicitud de')+' '+nombre+'?'))return;
  await api('/usuarios/'+userId+'/rechazar',{method:'PUT',body:JSON.stringify({})});
  const p=await api('/clientes-pendientes');
  document.getElementById('cContent').innerHTML=hPendientes(p);
  checkPendientes();
}

async function checkPendientes(){
  try{
    const p=await api('/clientes-pendientes');
    const badge=document.getElementById('badge_pend');
    if(badge){
      if(p.length>0){badge.textContent=p.length;badge.style.display='inline';}
      else{badge.style.display='none';}
    }
  }catch(e){}
}


async function downloadImages(btn){
  btn.textContent='⏳ Descargando...';btn.disabled=true;
  try{
    const r=await fetch('/api/download-images',{method:'POST',headers:{Authorization:'Bearer '+TOKEN}});
    const d=await r.json();
    const s=await fetch('/api/images-status');
    const sd=await s.json();
    btn.textContent=`✓ ${sd.count} imágenes en BD`;
    btn.style.color='#86efac';
    btn.disabled=false;
  }catch(e){btn.textContent='Error';btn.disabled=false;}
}
