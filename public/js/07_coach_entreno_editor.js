/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 07_coach_entreno_editor.js
   Editor inline de entreno en perfil cliente (tabEntreno*, switchClienteTab)

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

// ═══ EDITOR ENTRENO INLINE (tab Entreno del perfil) ═════════════
let _tabExEditId = null;

function tabEntrenoToggleDia(diaId) {
  const body = document.getElementById('tab_dia_body_' + diaId);
  if(!body) return;
  body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

async function tabEntrenoNuevoDia(clienteId) {
  const nombre = prompt(COACH_LANG==='en'?'Day name (e.g. Day A, Push, Monday...):':'Nombre del día (ej: Día A, Empuje, Lunes...):')
  if(!nombre) return;
  const grupo = prompt(COACH_LANG==='en'?'Muscle group (e.g. Chest/Shoulder/Triceps, Legs...):':'Grupo muscular (ej: Pecho/Hombro/Tríceps, Piernas...):') || 'General';
  await api('/clientes/'+clienteId+'/dias', {
    method:'POST', body:JSON.stringify({nombre, grupo, orden: 0})
  });
  const c = await api('/clientes/'+clienteId);
  window._coachClienteActual = c;
  // Re-renderizar tab
  switchClienteTab('entreno', document.querySelector('.ctab[onclick*="entreno"]'));
  verCliente(clienteId);
}

async function tabEntrenoDelDia(diaId) {
  if(!confirm(tc('¿Eliminar este día y todos sus ejercicios?'))) return;
  await api('/dias/'+diaId, {method:'DELETE'});
  const clienteId = window._coachClienteId;
  const c = await api('/clientes/'+clienteId);
  window._coachClienteActual = c;
  verCliente(clienteId);
}

function tabEntrenoAddEx(diaId, diaNombre) {
  // Reusar el sistema de rutinas existente
  rbState.clienteId = window._coachClienteId;
  rbState.diaId = diaId;
  rbState.diaNombre = diaNombre;
  // Redirigir a pantalla de rutinas con el cliente ya seleccionado
  cNav('rutinas', document.querySelector('#sCoach .sni:nth-child(2)'));
}

function tabEntrenoEditEx(exId) {
  _tabExEditId = exId;
  const panel = document.getElementById('tab_ex_edit_panel');
  if(!panel) return;
  panel.style.display = 'block';
  panel.scrollIntoView({behavior:'smooth'});

  api('/ejercicios/'+exId).then(e => {
    document.getElementById('tab_ex_edit_nombre').textContent = e.nombre;
    document.getElementById('tab_ex_series').value = e.series || 3;
    document.getElementById('tab_ex_reps').value = e.reps || '10-12';
    document.getElementById('tab_ex_peso').value = e.peso_objetivo || 0;
    document.getElementById('tab_ex_descanso').value = e.descanso || 90;
    const conRir = e.rir != null;
    document.getElementById('tab_ex_rir_on').checked = conRir;
    document.getElementById('tab_ex_rir_wrap').style.display = conRir ? 'block' : 'none';
    document.getElementById('tab_ex_rir').value = e.rir != null ? e.rir : 2;
    document.getElementById('tab_ex_principal').checked = !!e.es_principal;
    document.getElementById('tab_ex_nota').value = e.nota_coach || '';
  }).catch(e => alert('Error cargando ejercicio: ' + e.message));
}

async function tabEntrenoGuardarEx() {
  if(!_tabExEditId) return;
  const btn = event.target;
  btn.textContent = '⏳ Guardando...'; btn.disabled = true;
  try {
    await api('/ejercicios/'+_tabExEditId, {
      method: 'PUT',
      body: JSON.stringify({
        series:    parseInt(document.getElementById('tab_ex_series').value) || 3,
        reps:      document.getElementById('tab_ex_reps').value || '10-12',
        peso_objetivo: parseFloat(document.getElementById('tab_ex_peso').value) || 0,
        descanso:  parseInt(document.getElementById('tab_ex_descanso').value) || 90,
        rir:       document.getElementById('tab_ex_rir_on').checked
                     ? (parseInt(document.getElementById('tab_ex_rir').value) || 2)
                     : null,
        es_principal: document.getElementById('tab_ex_principal').checked ? 1 : 0,
        nota_coach: document.getElementById('tab_ex_nota').value || ''
      })
    });
    // Recargar cliente y re-renderizar tab
    const c = await api('/clientes/'+window._coachClienteId);
    window._coachClienteActual = c;
    btn.textContent = '✓ Guardado';
    setTimeout(() => {
      document.getElementById('tab_ex_edit_panel').style.display = 'none';
      btn.textContent = '✓ Guardar cambios'; btn.disabled = false;
      _tabExEditId = null;
      // Actualizar el div del día sin recargar todo
      const diaId = c.dias.find(d => d.ejercicios.some(e => e.id === parseInt(document.getElementById('tab_ex_edit_nombre').dataset?.exid || _tabExEditId)))?.id;
      verCliente(window._coachClienteId);
    }, 800);
  } catch(e) {
    alert('Error: ' + e.message);
    btn.textContent = '✓ Guardar cambios'; btn.disabled = false;
  }
}

async function tabEntrenoDelEx(exId, diaId) {
  if(!confirm('¿Eliminar este ejercicio?')) return;
  await api('/ejercicios/'+exId, {method:'DELETE'});
  const c = await api('/clientes/'+window._coachClienteId);
  window._coachClienteActual = c;
  verCliente(window._coachClienteId);
}

// ═══ TABS PERFIL CLIENTE ═════════════════════════════════════════
function switchClienteTab(tab, btn) {
  // Activar botón
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('on'));
  if(btn) btn.classList.add('on');

  // Mostrar panel
  document.querySelectorAll('.ctab-panel').forEach(p => p.classList.remove('on'));
  const panel = document.getElementById('ctab_' + tab);
  if(panel) panel.classList.add('on');

  // Lazy load por tab
  const id = window._coachClienteId;
  if(tab === 'historial') {
    const wrap = document.getElementById('sesiones_wrap2');
    const count = document.getElementById('sesiones_count2');
    if(!id) {
      if(wrap) wrap.innerHTML = '<div style="font-size:13px;color:#f87171;padding:20px;text-align:center">❌ Error: cliente no identificado. Cierra y vuelve a abrir la ficha.</div>';
      return;
    }
    if(wrap) wrap.innerHTML = '<div style="font-size:13px;color:var(--tx3);padding:20px;text-align:center">Cargando sesiones del cliente #'+id+'...</div>';
    api('/clientes/'+id+'/sesiones').then(sesiones=>{
      console.log('[WM Historial] Sesiones recibidas:', sesiones.length, sesiones);
      if(count) count.textContent = '('+sesiones.length+' '+(COACH_LANG==='en'?'sessions':'sesiones')+')';
      if(!sesiones.length){
        if(wrap) wrap.innerHTML = '<div style="font-size:13px;color:var(--tx3);padding:20px;text-align:center">Sin sesiones aún.<br><span style="font-size:11px;opacity:.5">El cliente debe completar al menos un entreno</span></div>';
        return;
      }
      if(wrap) wrap.innerHTML = sesiones.map(s=>{
        const byEx={};
        s.series.forEach(sr=>{if(!byEx[sr.ejercicio_nombre])byEx[sr.ejercicio_nombre]=[];byEx[sr.ejercicio_nombre].push(sr);});
        const incompleto = s.estado === 'incompleto';
        const valoracion = s.valoracion || '';
        const notasCliente = {};
        s.series.forEach(sr=>{ if(sr.nota_cliente && !notasCliente[sr.ejercicio_nombre]) notasCliente[sr.ejercicio_nombre]=sr.nota_cliente; });
        const fecha = new Date(s.fecha).toLocaleDateString(COACH_LANG==='en'?'en-GB':'es-ES',{weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
        const durStr = s.duracion_min ? ' · '+s.duracion_min+' min' : '';
        const totalSeries = s.series.length;
        return '<div style="background:var(--s2);border:0.5px solid '+(incompleto?'rgba(245,158,11,.4)':'rgba(34,197,94,.2)')+';border-radius:12px;padding:13px;margin-bottom:10px">'+
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'+
            '<div style="flex:1">'+
              '<div style="font-size:15px;font-weight:700;color:var(--sv)">'+s.dia_nombre+'</div>'+
              '<div style="font-size:11px;color:var(--blg);font-weight:600">'+tc(s.dia_grupo||'')+'</div>'+
              '<div style="font-size:11px;color:var(--tx3);margin-top:2px">'+fecha+durStr+'</div>'+
            '</div>'+
            '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">'+
              (incompleto
                ? '<span class="badge" style="background:rgba(245,158,11,.15);color:var(--amb);border:0.5px solid rgba(245,158,11,.3)">⚠ '+tc('Incompleto')+'</span>'
                : '<span class="badge b-gn">✓ '+(COACH_LANG==='en'?'Completed':'Completado')+'</span>')+
              (valoracion ? '<span style="font-size:20px" title="'+valoracion+'">'+valoracion.split(' ')[0]+'</span>' : '')+
              '<span style="font-size:10px;color:var(--tx3)">'+totalSeries+' series</span>'+
            '</div>'+
          '</div>'+
          Object.entries(byEx).map(([nom,srs])=>
            '<div style="background:var(--s3);border-radius:8px;padding:8px 10px;margin-bottom:6px">'+
            '<div style="font-size:12px;font-weight:700;color:var(--sv2);margin-bottom:5px">'+nom+'</div>'+
            '<div style="display:flex;gap:5px;flex-wrap:wrap">'+
              srs.map(sr=>
                '<span style="background:var(--b);border:0.5px solid var(--br);border-radius:6px;padding:4px 9px;font-size:11px;color:var(--sv3);font-weight:600">'+
                sr.peso_real+'kg × '+sr.reps_real+(sr.rir!=null?' · RIR'+sr.rir:'')+
                '</span>'
              ).join('')+
            '</div>'+
            (notasCliente[nom] ? '<div style="font-size:11px;color:var(--blg);margin-top:5px;font-style:italic;background:rgba(59,130,246,.06);padding:5px 8px;border-radius:6px;border:0.5px solid rgba(59,130,246,.15)">💬 '+notasCliente[nom]+'</div>' : '')+
            '</div>'
          ).join('')+
        '</div>';
      }).join('');

      // Cargar gráficas de progreso
      const c = window._coachClienteActual;
      if(c) {
        const principales = c.dias.flatMap(d=>(d.ejercicios||[]).filter(e=>e.es_principal).map(e=>e.nombre)).filter((n,i,a)=>a.indexOf(n)===i);
      // Gráficas de progreso eliminadas
      }
    }).catch(()=>{
      if(wrap) wrap.innerHTML = `<div style="font-size:13px;color:#f87171;padding:20px;text-align:center">${tc('Error cargando sesiones.')}</div>`;
    });
  }
  if(tab === 'entreno') {
    const c = window._coachClienteActual;
    if(c) {
      const principales = c.dias.flatMap(d=>(d.ejercicios||[]).filter(e=>e.es_principal).map(e=>e.nombre)).filter((n,i,a)=>a.indexOf(n)===i);
    // Gráficas de progreso eliminadas
    }
  }
  if(tab === 'progreso') {
    const c = window._coachClienteActual;
    if(c) renderCoachFotos(c.fotos);
    cargarRevisionSemanal(id, window._coachClienteActual);
    cargarMetricasAvanzadas(id);
  }
  if(tab === 'resumen') {
    cargarSuscripcionCliente(id);
    setTimeout(() => {
      const c = window._coachClienteActual;
      if(c) aplicarMacrosCoach(c, false);
    }, 100);
  }
  if(tab === 'dieta') {
    // Si hay dieta en edición, asegurarse de estar en vista
    const edit = document.getElementById('coach_dieta_edit');
    const view = document.getElementById('coach_dieta_view');
    if(edit && edit.style.display !== 'none') {
      // ya está en modo edición, ok
    }
  }
}

