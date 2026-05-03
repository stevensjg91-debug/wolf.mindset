/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 03_i18n_coach.js
   Traducciones coach (COACH_TRANSLATIONS), tc(), setCoachLang(), applyCoachLang()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

}

function setLangLogin(lang) {
  LANG = lang;
  localStorage.setItem('wm_lang', lang);

  // Actualizar botones de idioma
  const esBtn = document.getElementById('lang_es');
  const enBtn = document.getElementById('lang_en');
  if(esBtn) {
    esBtn.style.border = lang==='es' ? '1px solid rgba(255,255,255,.6)' : '1px solid rgba(255,255,255,.12)';
    esBtn.style.background = lang==='es' ? 'rgba(255,255,255,.15)' : 'none';
    esBtn.style.opacity = lang==='es' ? '1' : '0.4';
  }
  if(enBtn) {
    enBtn.style.border = lang==='en' ? '1px solid rgba(255,255,255,.6)' : '1px solid rgba(255,255,255,.12)';
    enBtn.style.background = lang==='en' ? 'rgba(255,255,255,.15)' : 'none';
    enBtn.style.opacity = lang==='en' ? '1' : '0.4';
  }

  // Traducir textos del login al instante
  const es = lang === 'es';
  const lu = document.getElementById('lu');
  const lp = document.getElementById('lp');
  if(lu) lu.placeholder = es ? 'Usuario' : 'Username';
  if(lp) lp.placeholder = es ? 'Contraseña' : 'Password';
  const rec = document.getElementById('login_recordar');
  if(rec) rec.textContent = es ? 'Recordar contraseña' : 'Remember me';
  const btn = document.getElementById('login_btn');
  if(btn) btn.textContent = es ? 'Entrar' : 'Log in';
  const olvide = document.getElementById('login_olvide');
  if(olvide) olvide.textContent = es ? '¿Olvidaste tu contraseña?' : 'Forgot your password?';
  const nuevoTxt = document.getElementById('login_nuevo_txt');
  if(nuevoTxt) nuevoTxt.textContent = es ? '¿Nuevo cliente? ' : 'New member? ';
  const solicitar = document.getElementById('login_solicitar');
  if(solicitar) solicitar.textContent = es ? 'Solicitar acceso →' : 'Request access →';
  const titulo = document.getElementById('login_titulo');
  if(titulo) titulo.textContent = es ? 'ACCESO MIEMBROS' : 'MEMBER LOGIN';

  const olvide_sub = document.getElementById('olvide_sub');
  const olvide_titulo = document.getElementById('olvide_titulo');
  const olvide_desc = document.getElementById('olvide_desc');
  const olvide_btn = document.getElementById('olvide_btn');
  const olvide_back = document.getElementById('olvide_back');
  if(olvide_sub) olvide_sub.textContent = es ? 'Recuperar acceso' : 'Recover access';
  if(olvide_titulo) olvide_titulo.textContent = es ? '¿OLVIDASTE TU CONTRASEÑA?' : 'FORGOT YOUR PASSWORD?';
  if(olvide_desc) olvide_desc.textContent = es
    ? 'Escribe tu nombre de usuario y tu coach recibirá una solicitud de reseteo. Te enviará tu nueva contraseña por el canal habitual (WhatsApp, email, etc.)'
    : 'Enter your username and your coach will receive a reset request. They will send your new password via the usual channel (WhatsApp, email, etc.)';
  if(olvide_btn) olvide_btn.textContent = es ? 'Enviar solicitud al coach' : 'Send request to coach';
  if(olvide_back) olvide_back.textContent = es ? '← Volver al login' : '← Back to login';

  // Palabras flotantes
  const words_es = ['DISCIPLINA','CONSTANCIA','ENFOQUE','ESFUERZO','FUERZA','MENTALIDAD','SUPERACIÓN'];
  const words_en = ['DISCIPLINE','CONSISTENCY','FOCUS','EFFORT','STRENGTH','MINDSET','IMPROVEMENT'];
  document.querySelectorAll('.floating-word').forEach((el, i) => {
    // Preservar el ::before dot — solo cambiar el texto
    const words = es ? words_es : words_en;
    if(words[i]) el.childNodes.forEach(n => { if(n.nodeType===3) n.textContent=words[i]; });
  });
}

// Aplicar idioma guardado al cargar la app
document.addEventListener('DOMContentLoaded', () => {
  if(LANG !== 'es') setLangLogin(LANG);
  else setLangLogin('es');
  // Si LANG=en, precargar imagen del lobo EN para overlay
  if(LANG === 'en') {
    const wolfImg = document.getElementById('done_wolf_img');
    if(wolfImg) wolfImg.src = WOLF_COMPLETE_EN_SRC;
  }
});

function setLang(lang) {
  LANG = lang;
  localStorage.setItem('wm_lang', lang);
  // Re-renderizar pantalla actual
  const el = document.getElementById('klContent');
  if(el) {
    // Re-ejecutar el render del tab actual
    if(klTab === 'entreno' && vistaActual === 'seleccion') renderSeleccion();
    else if(klTab === 'dieta') el.innerHTML = hDieta();
    else if(klTab === 'progreso') { el.innerHTML = hProgreso2(); setTimeout(()=>{cargarGraficasCliente();initPesoSection();renderFotosProgreso();},100); }
    else if(klTab === 'logros') el.innerHTML = hBadgesCliente();
    else if(klTab === 'perfil') el.innerHTML = hPerfil();
    else if(klTab === 'asistente') { el.innerHTML = hAsistente(); }
    applyLang(el);
  }
  // Traducir barra de navegación
  applyLang(document.querySelector('#sCliente .bnav-bar'));
  // Traducir placeholders dinámicos
  const ciPeso = document.getElementById('ci_peso');
  if(ciPeso) ciPeso.placeholder = t('Ej: 78.5');
}


// Traducción para el coach (independiente del idioma del cliente)
const COACH_TRANSLATIONS = {
  // Nav sidebar
  'Clientes':'Clients','Crear rutina':'Create routine','Crear dieta':'Create diet',
  'Nuevo cliente':'New client','Pendientes':'Pending','Progreso':'Progress',
  'Asistente IA':'AI Assistant','Cerrar sesión':'Log out',
  // Nav mobile
  'Rutinas':'Routines','Solicitudes':'Requests','+ Cliente':'+ Client',
  // Topbar
  'Clientes':'Clients',
  // Títulos secciones
  'Resumen':'Summary','Entreno':'Workout','Dieta':'Diet','Notas':'Notes',
  'Notificaciones':'Notifications','Marcar todas leídas':'Mark all read',
  'Cargando...':'Loading...',
  // Cliente card
  'Semana':'Week','Sesiones':'Sessions','sin sesiones':'no sessions',
  'Suscripción activa':'Active subscription','Sin suscripción':'No subscription',
  'Renovar suscripción':'Renew subscription','Cancelar suscripción':'Cancel subscription',
  'Contraseña del cliente':'Client password','Resetear':'Reset',
  'Nueva contraseña':'New password','Mín 6 caracteres':'Min 6 chars',
  // Botones
  'Guardar':'Save','Publicar':'Publish','Eliminar':'Delete','Editar':'Edit',
  'Añadir':'Add','Cancelar':'Cancel','Guardar cambios':'Save changes',
  '✓ Publicar rutina':'✓ Publish routine','✓ Guardar cambios':'✓ Save changes',
  '+ Día':'+ Day','+ Ejercicio':'+ Exercise',
  'Añadir día de entreno':'Add training day','Añadir ejercicio →':'Add exercise →',
  // Nuevo cliente
  'Nombre completo *':'Full name *','Email *':'Email *','Teléfono *':'Phone *',
  'Usuario para acceder *':'Username *','Contraseña *':'Password *',
  'Objetivo':'Goal','Nivel':'Level','Días/semana':'Days/week',
  'Solicitud de acceso':'Access request','Aprobar y crear':'Approve & create',
  'Rechazar':'Reject',
  // Dieta builder  
  'Tipo de alimentación':'Diet type','Objetivo calórico':'Calorie goal',
  'Automático según objetivo del cliente':'Auto based on client goal',
  'Calorías objetivo:':'Target calories:','Proteína':'Protein',
  'Carbos':'Carbs','Grasas':'Fats','Añadir alimento':'Add food',
  'Generar con IA':'Generate with AI','Borrar dieta':'Delete diet',
  'Comida libre':'Free meal','Sin dieta asignada':'No diet assigned',
  // IA asistente
  'Hola coach, listo. Puedo generar rutinas y dietas completas, analizar progreso y sugerir ajustes. ¿Qué necesitas?':
    'Hi coach, ready to go. I can generate complete routines and diets, analyze progress and suggest adjustments. What do you need?',
  // Progreso
  'Valoración IA':'AI Assessment','Analizar progreso':'Analyze progress',
  'Ver historial':'View history','Fotos de progreso':'Progress photos',
  // Mensajes
  'VALORACIÓN COACH':'COACH ASSESSMENT',
  'Sin notas':'No notes','Sin historial':'No history',
  'Semanas de entrenamiento':'Training weeks',
  // Ajuste dieta
  'Ajuste automático':'Auto adjustment','Ajuste calórico':'Calorie adjustment',
  'Aplicar ajuste':'Apply adjustment',
  // Días semana (para crear rutinas)
  'Lunes':'Monday','Martes':'Tuesday','Miércoles':'Wednesday',
  'Jueves':'Thursday','Viernes':'Friday','Sábado':'Saturday','Domingo':'Sunday',
  // Músculos
  'Pecho + Tríceps':'Chest + Triceps','Espalda + Bíceps':'Back + Biceps',
  'Hombros + Brazos':'Shoulders + Arms','Full Body':'Full Body',
  'Piernas':'Legs','Empuje':'Push','Tirón':'Pull','Glúteos':'Glutes',
  'Principiante':'Beginner','Intermedio':'Intermediate','Avanzado':'Advanced',
  // Objetivos cliente
  'Volumen':'Bulk','Definición':'Cutting','Fuerza':'Strength',
  'Recomposición':'Body recomp','Perder peso':'Lose weight',

  // ── verCliente — cabecera y tabs ──
  'Volver':'Back',
  'Reasignar':'Reassign',
  '📋 Resumen':'📋 Summary',
  '🏋️ Rutina':'🏋️ Routine',
  '📊 Historial':'📊 History',
  '🥗 Dieta':'🥗 Diet',
  '📈 Progreso':'📈 Progress',

  // ── Tab Resumen ──
  'Macros internos':'Internal macros',
  'SOLO COACH':'COACH ONLY',
  'kcal/día':'kcal/day',
  'Prot':'Prot','Grasa':'Fat',
  'Sin registros':'No records',
  '💳 Suscripción':'💳 Subscription',
  'Cargando...':'Loading...',
  'Duración':'Duration',
  '1 mes':'1 month','2 meses':'2 months','3 meses':'3 months',
  '6 meses':'6 months','12 meses':'12 months',
  'Precio (€)':'Price (€)',
  'Notas internas (opcional)':'Internal notes (optional)',
  '✓ Activar / Renovar':'✓ Activate / Renew',
  'Datos personales del cliente':'Client personal data',
  'Peso (kg)':'Weight (lb)','Altura':'Height',
  'Edad':'Age','Sexo':'Sex','Actividad':'Activity',
  'Cintura/Cadera':'Waist/Hip',
  'Moderada':'Moderate','Ligera':'Light','Sedentario':'Sedentary',
  'Activo':'Active','Alta':'High','Muy alta':'Very high',
  'Moderada (3-4 días/semana)':'Moderate (3-4 days/week)',
  'Ligero (1-2 días/semana)':'Light (1-2 days/week)',
  'Sedentario (poco o nada de ejercicio)':'Sedentary (little or no exercise)',
  'Activo (5-6 días/semana)':'Active (5-6 days/week)',
  'Alta (5-6 días/semana)':'High (5-6 days/week)',
  'Muy alta (atleta, 2x día)':'Very high (athlete, 2x/day)',
  'Hombre':'Male','Mujer':'Female','Masculino':'Male','Femenino':'Female',
  'Sin datos':'No data',
  'años':'years',
  'Lesiones:':'Injuries:','Dieta:':'Diet:','No come:':'Cannot eat:','Obs:':'Notes:',
  'Ajustar datos':'Adjust data',
  'Objetivo':'Goal',
  'Calculadora de macros — ajusta y se recalcula solo':'Macro calculator — adjust and auto-recalculates',
  'Recalcular':'Recalculate',
  'Kcal totales':'Total kcal',
  'Proteína (g)':'Protein (g)',
  'Grasas (g)':'Fats (g)',
  'Carbos (g)':'Carbs (g)',
  'Comida libre (p.ej. domingo)':'Free meal (e.g. Sunday)',
  'Comida libre':'Free meal',
  'Mensaje de la semana (se muestra al cliente)':'Weekly message (shown to client)',
  'Mensaje de la semana':'Weekly message',
  'Notas privadas (solo coach)':'Private notes (coach only)',
  'Notas coach (privadas)':'Coach notes (private)',
  '✏️ Editar':'✏️ Edit',
  'Guardar':'Save',

  // ── Tab Dieta ──
  'Macros actuales del plan':'Current plan macros',
  '⚡ Rebalanceo IA':'⚡ AI Rebalance',
  'Describe el ajuste y la IA redistribuye todo el plan':'Describe the adjustment and AI will redistribute the whole plan',
  'Macro a ajustar':'Macro to adjust',
  'Cambio (+ subir / - bajar)':'Change (+ raise / - lower)',
  '🔧 Aplicar ajuste':'🔧 Apply adjustment',
  '⚡ Rebalancear con IA':'⚡ Rebalance with AI',
  'Edición manual':'Manual edit',
  '+ Añadir alimento':'+ Add food',
  '✓ Guardar y cerrar':'✓ Save and close',
  'Calorías totales':'Total calories',
  'Proteína':'Protein',
  '✏️ Editar dieta':'✏️ Edit diet',
  '✕ Cancelar':'✕ Cancel',
  'Sin comidas. Publica una dieta primero desde el Creador IA.':'No meals. Publish a diet first from the AI Creator.',
  '✓ Publicado':'✓ Published',
  'Publicar semana':'Publish week',
  'El cliente no verá los cambios hasta que pulses Publicar semana':'The client cannot see changes until you press Publish week',
  'Sin dieta. Usa el Creador de Dieta IA.':'No diet. Use the AI Diet Creator.',
  'Borrar dieta del cliente':'Delete client diet',
  '¿Borrar toda la dieta de este cliente?':'Delete this client\'s entire diet?',

  // ── Tab Historial ──
  'Sin sesiones registradas.':'No sessions recorded.',
  'Sin sesiones':'No sessions',
  '⚠ Incompleto':'⚠ Incomplete',
  '✓ Completado':'✓ Completed',
  'series':'sets',
  'Error cargando sesiones.':'Error loading sessions.',

  // ── Tab Progreso ──
  'Revisión semanal':'Weekly review',
  'Progresión sugerida por IA':'AI suggested progression',
  '⚡ Aplicar todos los ajustes':'⚡ Apply all adjustments',
  'Fotos del cliente':'Client photos',
  'El cliente aún no ha subido fotos.':'The client has not uploaded photos yet.',
  'VALORACIÓN COACH':'COACH ASSESSMENT',
  'Valoración':'Assessment',
  'Subir foto':'Upload photo',
  'Analizar con IA':'Analyze with AI',
  'Analizando...':'Analyzing...',
  '🏆 PRs & 1RM estimado':'🏆 PRs & Estimated 1RM',
  '⚡ Tonelaje semanal':'⚡ Weekly tonnage',
  '📊 Esta semana vs anterior':'📊 This week vs last week',
  'Sesiones':'Sessions',
  'Tonelaje':'Tonnage',
  '📋 Último check-in del cliente':'📋 Last client check-in',
  '😴 Sueño':'😴 Sleep',
  '⚡ Energía':'⚡ Energy',
  'Sin datos suficientes.':'Insufficient data.',
  'Error cargando métricas.':'Error loading metrics.',
  'Sin sesiones aún.':'No sessions yet.',
  'Sin sesiones registradas aún. Cuando el cliente complete entrenamientos aparecerá aquí la revisión.':'No sessions yet. Once the client completes workouts, the review will appear here.',
  'Error cargando revisión.':'Error loading review.',
  '🤖 Sugerir progresión con IA':'🤖 Suggest progression with AI',
  '🤖 Sugerencia IA para próxima semana':'🤖 AI suggestion for next week',
  'Últimas':'Last','semana':'week','semanas':'weeks',
  'Sueño medio:':'Avg sleep:','Energía media:':'Avg energy:',
  '1RM est.':'1RM est.',

  // ── Suscripción (coach panel) ──
  'Sin suscripción':'No subscription',
  'Este cliente no tiene suscripción activa.':'This client has no active subscription.',
  '+ Añadir suscripción':'+ Add subscription',
  '✅ Activa':'✅ Active',
  '🔴 Vencida':'🔴 Expired',
  'Cancelada':'Cancelled',
  'Vencida':'Expired',
  'días restantes':'days remaining',
  'Sin sub':'No sub',
  '🔑 Contraseña del cliente':'🔑 Client password',
  'Nueva contraseña del cliente:':'New client password:',
  'Cancelar suscripción':'Cancel subscription',
  '¿Cancelar la suscripción? El cliente perderá el acceso.':'Cancel subscription? The client will lose access.',

  // ── hClientes — lista ──
  'Sin clientes aún':'No clients yet',
  'Crea el primero desde "Nuevo cliente"':'Create the first one from "New client"',
  'Total':'Total','Míos':'Mine',
  'Todos':'All','🔵 Míos':'🔵 Mine',
  'Sem':'Wk',

  // ── hNuevo ──
  'Crear cliente manualmente':'Create client manually',
  'Nombre completo':'Full name','Email':'Email','Teléfono':'Phone',
  'Usuario (para iniciar sesión)':'Username (for login)',
  'Contraseña inicial':'Initial password',
  'Días/semana':'Days/week',
  'Semanas iniciales':'Initial weeks',
  'Kcal/día':'Kcal/day',
  'Macros (g/día)':'Macros (g/day)',
  'Crear cliente':'Create client',
  '✓ Cliente creado':'✓ Client created',

  // ── hPendientes ──
  'Solicitudes pendientes':'Pending requests',
  'Cuando alguien se registre aparecerá aquí':'Registrations will appear here',
  'Registrado':'Registered',
  'Objetivo:':'Goal:','Nivel:':'Level:',
  'Actividad:':'Activity:','Dieta:':'Diet:',
  'No come:':'Cannot eat:','Lesiones:':'Injuries:',
  'Notas:':'Notes:',
  'Aprobar y crear':'Approve & create',
  'Rechazar':'Reject',
  '¿Rechazar y eliminar la solicitud de':'Reject and delete the request from',

  // ── hProgreso — dashboard ──
  '📊 Dashboard clientes':'📊 Client dashboard',
  '🔔 Avisos':'🔔 Alerts',
  '↺ Actualizar':'↺ Refresh',
  'Clientes':'Clients',
  'Activos':'Active',
  'Atención':'Attention',
  'Cliente':'Client','Progreso':'Progress','Última sesión':'Last session',
  'Sem':'Wk','Suscripción':'Subscription',
  'Cargando...':'Loading...',
  'Hoy':'Today','Ayer':'Yesterday',
  'Hace':'Ago','Sin sesiones':'No sessions',
  '⚠️ Próximas a vencer':'⚠️ Expiring soon',
  '🔴 Vencidas / Canceladas':'🔴 Expired / Cancelled',
  'Vence:':'Expires:','Venció:':'Expired:',
  'Ver cliente':'View client','Renovar':'Renew',

  // ── hIACoach ──
  'Asistente IA Coach':'AI Coach Assistant',
  'Enviar':'Send',
  'Escribe un mensaje al asistente...':'Write a message to the assistant...',
  '🖼️ Descargar imágenes ejercicios':'🖼️ Download exercise images',
  'Gestionar imágenes de ejercicios':'Manage exercise images',
  'Gestionar imágenes':'Manage images',
  'Añade ejercicios personalizados que no están en la biblioteca.':'Add custom exercises not in the library.',
  'Nuevo ejercicio manual':'New manual exercise',
  'Nombre del ejercicio':'Exercise name',
  'Grupo muscular':'Muscle group',
  'Músculos principales':'Main muscles',
  'Dificultad':'Difficulty',
  'URL imagen (opcional)':'Image URL (optional)',
  '+ Crear ejercicio':'+ Create exercise',
  'Sin resultados':'No results',
  'Básico':'Basic','Intermedio':'Intermediate','Avanzado':'Advanced',

  // ── hRutinas ──
  'Selecciona un cliente':'Select a client',
  'Selecciona cliente':'Select client',
  '-- Elige cliente --':'-- Choose client --',
  'Filtrar ejercicios con IA':'Filter exercises with AI',
  '🤖 Filtrar ejercicios con IA (lesiones y nivel)':'🤖 Filter exercises with AI (injuries & level)',
  'Limpiar filtro':'Clear filter',
  'Generar semana completa con IA':'Generate full week with AI',
  'La IA genera toda la semana automáticamente para el cliente seleccionado.':'AI generates the full week automatically for the selected client.',
  '⚡ Generar semana con IA':'⚡ Generate week with AI',
  '+ Día':'+ Day',
  'Publicar semana al cliente':'Publish week to client',
  '✓ Publicar rutina':'✓ Publish routine',
  'Sin días. Pulsa + Día para empezar.':'No days. Press + Day to start.',
  'Sin días. Añade el primero arriba.':'No days. Add the first one above.',
  'Añadir ejercicio →':'Add exercise →',
  'Sin ejercicios aún.':'No exercises yet.',
  'Series':'Sets','Reps':'Reps','Peso obj.':'Target weight',
  'Descanso (s)':'Rest (s)','RIR obj.':'Target RIR',
  'Principal':'Main','Nota coach':'Coach note',
  'YouTube URL':'YouTube URL',
  'Aparece en gráficas de progreso':'Shows in progress charts',
  '✓ Añadir ejercicio':'✓ Add exercise',
  'Buscar ejercicio...':'Search exercise...',
  'Todos los grupos':'All groups',
  '🤖 Analizar perfil del cliente...':'🤖 Analyzing client profile...',
  '✓ Sin contraindicaciones para este cliente':'✓ No contraindications for this client',
  'Selecciona un cliente primero':'Select a client first',

  // ── hDietaBuilder ──
  '1. Selecciona cliente':'1. Select client',
  '🤖 Generar plan de dieta con IA':'🤖 Generate diet plan with AI',
  'La IA usa automáticamente las kcal, macros, intolerancias y preferencias del cliente. Solo tienes que indicar los alimentos disponibles y el número de comidas.':
    'AI automatically uses the client\'s kcal, macros, intolerances and preferences. Just indicate available foods and number of meals.',
  'Alimentos disponibles':'Available foods',
  '+ Nuevo alimento':'+ New food',
  '✕ Limpiar todo':'✕ Clear all',
  'Nº de comidas':'No. of meals',
  '2 comidas':'2 meals','3 comidas':'3 meals','4 comidas':'4 meals',
  '5 comidas':'5 meals','6 comidas':'6 meals',
  'Ajuste calórico':'Calorie adjustment',
  '(opcional — usa el del cliente por defecto)':'(optional — uses client default)',
  'Forzar mantenimiento':'Force maintenance',
  'Forzar déficit (-300 kcal)':'Force deficit (-300 kcal)',
  'Forzar déficit agresivo (-500 kcal)':'Force aggressive deficit (-500 kcal)',
  'Forzar superávit (+300 kcal)':'Force surplus (+300 kcal)',
  'Notas adicionales (opcional)':'Additional notes (optional)',
  '🧪 Analíticas / déficits (opcional)':'🧪 Blood tests / deficits (optional)',
  'La IA recomendará suplementación':'AI will recommend supplementation',
  '⚡ Generar plan personalizado':'⚡ Generate personalised plan',
  'Vista previa del plan':'Plan preview',
  '✏️ Editar cantidades':'✏️ Edit quantities',
  '✓ Publicar al cliente':'✓ Publish to client',
  '✓ Plan generado. Revisa la vista previa abajo y publica cuando estés listo.':'✓ Plan generated. Review the preview below and publish when ready.',
  'Dieta publicada':'Diet published',
  'La dieta se ha guardado en el perfil del cliente. Puedes volver a entrar al cliente y verla en sus comidas.':'The diet has been saved in the client profile. You can return to the client and view it in their meals.',
  '✓ Publicado y guardado':'✓ Published and saved',
  'Alternativas e intercambios':'Alternatives & swaps',
  'Ajustes si es necesario':'Adjustments if needed',
  'Generando dieta...':'Generating diet...',
  'Selecciona un cliente primero':'Select a client first',
  'Escribe los alimentos disponibles':'Enter the available foods',
  'Tap a category to add foods →':'Tap a category to add foods →',
  '⭐ Mis favoritos':'⭐ My favourites',
  '⭐ Save as favourite':'⭐ Save as favourite',
  '✓ Saved as favourite':'✓ Saved as favourite',
  '⚡ Rebalanceo IA':'⚡ AI Rebalance',
  '🌾 Carbos':'🌾 Carbs',
  '🥑 Grasas':'🥑 Fats',
  '🥦 Verduras':'🥦 Vegetables',
  '🍎 Frutas':'🍎 Fruits',
  '☕ Bebidas':'☕ Drinks',
  'Por 100g:':'Per 100g:','Sin resultados':'No results',
  'Generando rutina...':'Generating routine...',

  // ── Revisión semanal (cargarRevisionSemanal) ──
  'Revisión semanal del cliente':'Weekly client review',
  'Sin sesiones registradas aún. Cuando el cliente complete entrenamientos aparecerá aquí la revisión.':'No sessions yet. Once the client completes workouts, the review will appear here.',
  'semanas analizadas':'weeks analysed',
  'Peso actual vs inicio':'Current weight vs start',
  'Sin datos de peso':'No weight data',
  'sesiones completadas':'sessions completed',
  'sesión completada':'session completed',
  'Adherencia':'Adherence',
  'Progresión de carga sugerida':'Suggested load progression',
  'Subida sugerida':'Suggested increase',
  'Bajada sugerida':'Suggested decrease',
  'Sin cambio':'No change',
  'Último entrenamiento:':'Last workout:',
  'Datos insuficientes':'Insufficient data',
  '⚡ Aplicar todos los ajustes':'⚡ Apply all adjustments',
  'ajustes aplicados':'adjustments applied',
  'Sin cambios':'No changes',

  // ── Suscripción coach (cargarSuscripcionCliente) ──
  '+ Añadir suscripción':'+ Add subscription',
  '⚠️ Vence en':'⚠️ Expires in',
  'd':'d',

  // ── Panel notificaciones ──
  'Notificaciones':'Notifications',
  'Marcar todas leídas':'Mark all read',

  // ── Mi equipo ──
  'Mi equipo':'My team',
  'Coaches de WolfMindset':'WolfMindset coaches',
  'Coaches activos':'Active coaches',
  '➕ Añadir nuevo coach':'➕ Add new coach',
  'Nombre completo':'Full name',
  'Usuario (login)':'Username (login)',
  'Contraseña':'Password',
  'Mín 6 caracteres':'Min 6 chars',
  'Email (opcional)':'Email (optional)',
  'Idioma del panel':'Panel language',
  '🇪🇸 Español':'🇪🇸 Spanish',
  '✓ Crear coach':'✓ Create coach',
  'Solo el administrador puede crear nuevos coaches.':'Only the administrator can create new coaches.',
  'Solo tú por ahora.':'Just you for now.',
  'Error cargando coaches. Actualiza el backend.':'Error loading coaches. Update the backend.',
  '🔑 Reset pass':'🔑 Reset pass',
  'Admin':'Admin',

  // ── Añadir día panel (static HTML) ──
  'Añadir día de entreno':'Add training day',
  'Nombre del día':'Day name',
  'Grupo muscular':'Muscle group',
  'Pecho + Tríceps':'Chest + Triceps',
  'Espalda + Bíceps':'Back + Biceps',
  'Hombros + Brazos':'Shoulders + Arms',
  'Full Body':'Full Body',
  'Empuje':'Push',
  'Cardio':'Cardio',
  '✓ Añadir día':'✓ Add day',
  'Cancelar':'Cancel',

  // ── Sidebar / topbar estáticos ──
  'WolfMindset · Coach':'WolfMindset · Coach',
  'Rutinas':'Routines','Solicitudes':'Requests','+ Cliente':'+ Client',

  // ── Mensajes IA / errores ──
  'Generando rutina para':'Generating routine for',
  'Rutina generada para':'Routine generated for',
  'Dieta generada para':'Diet generated for',
  'Error generando. Verifica la API key.':'Error generating. Check the API key.',
  'Escribe un mensaje...':'Write a message...',
  'Analizando perfil del cliente...':'Analysing client profile...',
  '✓ Sin contraindicaciones para este cliente':'✓ No contraindications for this client',
  '⛔':'⛔','⚠️':'⚠️',
  'NO recomendado':'NOT recommended',
  'con precaución':'with caution',
  'Sin contraindicaciones':'No contraindications',

  // ── TITLES dict (cNav topbar) ──
  'Clientes':'Clients',
  'Nuevo cliente':'New client',
  'Solicitudes pendientes':'Pending requests',
  'Crear rutina':'Create routine',
  'Crear dieta':'Create diet',
  'Asistente IA Coach':'AI Coach Assistant',
  'Mensajes':'Messages',

  // ── Panel mensajes coach ──
  'Sin mensajes aún':'No messages yet',
  'Cuando un cliente te escriba aparecerá aquí':'When a client messages you it will appear here',
  'Ver ficha':'View profile',
  'Escribe tu respuesta...':'Write your reply...',
  'escribiendo...':'typing...',
  'auto':'auto',

  // ── Análisis foto grasa ──
  'Est. body fat':'Est. body fat',
  'Grasa est.':'Est. body fat',
  'Mejora':'Improvement',
  'Revisa y edita antes de enviar':'Review and edit before sending',
  'Publicar al cliente':'Send to client',
  'Descartar':'Discard',
  'Aparecerá en las fotos del cliente como mensaje de tu coach':'Will appear on client photos as a coach message',
  '↺ Volver a analizar':'↺ Re-analyze',
  '✦ Analizar vs semana anterior':'✦ Analyze vs prev. week',
  '✦ Analizar con IA':'✦ Analyze with AI',
  'Error al analizar. Inténtalo de nuevo.':'Error analyzing. Try again.',
  '✦ Reintentar':'✦ Retry',

  // ── Suscripciones vencimiento ──
  '⚠️ Próximas a vencer':'⚠️ Expiring soon',
  '🔴 Vencidas / Canceladas':'🔴 Expired / Cancelled',

  // ── Macros barra ──
  'Macros actuales del plan':'Current plan macros',

  // ── Diagnóstico formularios ──
  'Nombre, usuario y contraseña son obligatorios.':'Name, username and password are required.',
  'La contraseña debe tener al menos 6 caracteres.':'Password must be at least 6 characters.',
  'Nueva contraseña para':'New password for',
  '(mín 6 chars):':'(min 6 chars):',
  '¿Eliminar el coach':'Delete coach',
  'Sus clientes NO se eliminarán.':'Their clients will NOT be deleted.',
  'Contraseña de':'Password for',
  'actualizada.':'updated.',

  // ── Confirmaciones ──
  '¿Eliminar?':'Delete?',
  '¿Publicar los cambios? El cliente verá la nueva rutina inmediatamente.':'Publish changes? The client will see the new routine immediately.',
  '¿Eliminar este día y todos sus ejercicios?':'Delete this day and all its exercises?',
  'Escribe qué ajuste quieres hacer':'Describe the adjustment you want',
  'El ajuste dejaría el plan sin ese macro. Reduce el cambio.':'This change would remove that macro from the plan. Reduce the amount.',
};

function tc(text) {
  if(COACH_LANG === 'es') return text;
  return COACH_TRANSLATIONS[text] || TRANSLATIONS[text] || text;
}
