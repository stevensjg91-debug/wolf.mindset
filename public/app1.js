/* ─────────────────────────────────────────────────────────────
   WolfMindset - app1.js (Versión Master con Sistema de Plantillas)
───────────────────────────────────────────────────────────── */

// ── REGISTRO FORM LANGUAGE TOGGLE ─────────────────────────────────
let _regLang = localStorage.getItem('wm_reg_lang') || 'en';

const REG_STRINGS = {
  en: {
    subtitle: 'ACCESS REQUEST',
    desc: 'Fill in your details and your coach will review your request. We will notify you when you have access.',
    lbl_nombre: 'Full name *', lbl_usuario: 'Username *', lbl_email: 'Email *',
    lbl_telefono: 'Phone *', lbl_pass: 'Password *', lbl_objetivo: 'Goal',
    lbl_nivel: 'Level', lbl_peso: 'Weight (lb)', lbl_altura: 'Height (ft/in)',
    lbl_edad: 'Age', lbl_sexo: 'Sex', lbl_actividad: 'Activity level',
    lbl_dieta: 'Diet type', lbl_alimentos_no: 'Foods I cannot eat (optional)',
    lbl_lesiones: 'Injuries / painful areas (optional)', lbl_obs: 'Other notes (optional)',
    lbl_reg_foods_like: 'Foods I prefer for my diet', lbl_reg_meals: 'How many meals do you want per day?',
    submit: 'Send request', back: '← Back to login',
    pass_placeholder: 'Minimum 6 characters', user_placeholder: 'carlos123'
  },
  es: {
    subtitle: 'SOLICITUD DE ACCESO',
    desc: 'Completa tus datos y tu coach revisará tu solicitud. Te avisaremos cuando tengas acceso.',
    lbl_nombre: 'Nombre completo *', lbl_usuario: 'Usuario *', lbl_email: 'Email *',
    lbl_telefono: 'Teléfono *', lbl_pass: 'Contraseña *', lbl_objetivo: 'Objetivo',
    lbl_nivel: 'Nivel', lbl_peso: 'Peso (kg)', lbl_altura: 'Altura (cm)',
    lbl_edad: 'Edad', lbl_sexo: 'Sexo', lbl_actividad: 'Nivel de actividad',
    lbl_dieta: 'Tipo de dieta', lbl_alimentos_no: 'Alimentos que no puedo comer (opcional)',
    lbl_lesiones: 'Lesiones / zonas con dolor (opcional)', lbl_obs: 'Otras notas (opcional)',
    lbl_reg_foods_like: 'Alimentos que prefiero', lbl_reg_meals: '¿Cuántas comidas quieres al día?',
    submit: 'Enviar solicitud', back: '← Volver al login',
    pass_placeholder: 'Mínimo 6 caracteres', user_placeholder: 'carlos123'
  }
};

// ... (Aquí se mantiene todo tu código original de login, api, verCliente, etc.) ...
// He saltado la parte intermedia para ahorrar espacio pero en tu archivo real 
// debes mantener TODAS tus funciones originales hasta llegar al final.

// ── SISTEMA DE PLANTILLAS REUTILIZABLES (NUEVO) ──────────────────────

/**
 * Captura la rutina actual del cliente y la guarda en la librería del coach.
 */
async function uiGuardarPlantilla() {
  const c = window._coachClienteActual;
  if(!c) return alert("Selecciona un cliente primero");

  const nombrePlantilla = prompt("Dale un nombre a esta plantilla (ej: Empuje Hipertrofia):", "Rutina " + c.nombre);
  if(!nombrePlantilla) return;

  try {
    const res = await api('/plantillas/guardar', {
      method: 'POST',
      body: JSON.stringify({
        clienteId: c.id,
        nombre: nombrePlantilla,
        nivel: c.nivel || 'Intermedio',
        objetivo: c.objetivo || 'Hipertrofia'
      })
    });

    if(res.ok) {
      alert("✅ Plantilla guardada con éxito en tu librería.");
    } else {
      alert("❌ Error al guardar: " + res.error);
    }
  } catch(e) {
    console.error(e);
  }
}

/**
 * Abre el panel modal y carga la lista de plantillas desde el servidor.
 */
async function abrirLibreriaPlantillas() {
  const panel = document.getElementById('panel_plantillas');
  const lista = document.getElementById('lista_plantillas_ia');
  
  panel.style.display = 'flex';
  lista.innerHTML = '<p style="color:#a1a1aa; text-align:center;">Cargando librería...</p>';

  try {
    const plantillas = await api('/plantillas/lista');
    
    if(!plantillas || plantillas.length === 0) {
      lista.innerHTML = '<p style="color:#a1a1aa; text-align:center;">No tienes plantillas guardadas aún.</p>';
      return;
    }

    lista.innerHTML = plantillas.map(p => {
      // IA: Analizamos el volumen de series por músculo del JSON guardado
      const analisis = iaAnalizarVolumen(p.dias_json);
      const chipsMúsculos = Object.entries(analisis)
        .map(([m, s]) => `<span class="badge-ia">${m}: ${s}s</span>`).join(' ');

      return `
        <div class="plantilla-card">
          <div class="plantilla-info">
            <h4>${p.nombre}</h4>
            <p>${p.objetivo} • ${p.nivel}</p>
            <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px;">
              ${chipsMúsculos}
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <button onclick="aplicarPlantilla('${p.id}')" style="background:#4ade80; color:#000; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer; font-size:11px;">Aplicar</button>
            <button onclick="borrarPlantilla('${p.id}')" style="background:none; border:1px solid #ef4444; color:#ef4444; padding:4px; border-radius:6px; cursor:pointer; font-size:10px;">Borrar</button>
          </div>
        </div>
      `;
    }).join('');

  } catch(e) {
    lista.innerHTML = '<p style="color:#ef4444;">Error al cargar librería.</p>';
  }
}

/**
 * Clona los ejercicios de la plantilla al cliente actual.
 */
async function aplicarPlantilla(plantillaId) {
  const c = window._coachClienteActual;
  if(!c) return;

  if(!confirm("¿Seguro? Esto añadirá los ejercicios de la plantilla a la rutina actual de " + c.nombre)) return;

  try {
    // Obtenemos el detalle de la plantilla
    const lista = await api('/plantillas/lista');
    const p = lista.find(x => String(x.id) === String(plantillaId));
    if(!p) return;

    const dias = JSON.parse(p.dias_json);

    // Iteramos e insertamos en el cliente actual
    for (const d of dias) {
      const resDia = await api('/dias', {
        method: 'POST',
        body: JSON.stringify({ cliente_id: c.id, nombre: d.nombre })
      });
      
      const nuevoDiaId = resDia.id;

      for (const [idx, ex] of d.ejercicios.entries()) {
        await api('/ejercicios', {
          method: 'POST',
          body: JSON.stringify({
            dia_id: nuevoDiaId,
            cliente_id: c.id,
            nombre: ex.nombre,
            series: ex.series,
            reps: ex.reps,
            descanso: ex.descanso,
            notas: ex.notas,
            musculo_principal: ex.musculo,
            orden: idx
          })
        });
      }
    }

    alert("✅ Rutina aplicada correctamente.");
    document.getElementById('panel_plantillas').style.display = 'none';
    verCliente(c.id); // Refrescamos la vista

  } catch(e) {
    alert("Error al aplicar plantilla");
    console.error(e);
  }
}

/**
 * IA: Analiza el JSON de la plantilla y suma las series totales por músculo.
 */
function iaAnalizarVolumen(diasJson) {
  try {
    const dias = JSON.parse(diasJson);
    let conteo = {};
    dias.forEach(d => {
      d.ejercicios.forEach(e => {
        const m = e.musculo || 'Otros';
        conteo[m] = (conteo[m] || 0) + (parseInt(e.series) || 0);
      });
    });
    return conteo;
  } catch(e) { return {}; }
}

async function borrarPlantilla(id) {
  if(!confirm("¿Eliminar esta plantilla permanentemente?")) return;
  await api('/plantillas/' + id, { method: 'DELETE' });
  abrirLibreriaPlantillas();
}

// ... Resto de tus funciones originales de Drag & Drop y UI ...
