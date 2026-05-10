/**
 * ══════════════════════════════════════════════════════════════════════
 *  WolfMindset — routes_ia.js
 *  Módulo de IA completo: Coach Privado + Bot Auto + Análisis de Sesión
 *
 *  INTEGRACIÓN EN server.js / routes.js:
 *    const iaRoutes = require('./routes_ia');
 *    app.use('/api', iaRoutes);          // o router.use(iaRoutes) según tu setup
 *
 *  VARIABLES DE ENTORNO REQUERIDAS:
 *    ANTHROPIC_API_KEY=sk-ant-...
 * ══════════════════════════════════════════════════════════════════════
 */

const express    = require('express');
const { dbGet, dbAll, dbRun, saveToDisk } = require('./database');
const { authMiddleware, coachOnly }        = require('./auth');
const { ssePush, ssePushCoaches }          = require('./sse');

const router = express.Router();
router.use(authMiddleware);

// ─── Modelo por uso ──────────────────────────────────────────────────────────
const MODEL_COACH   = 'claude-opus-4-5';   // IA Privada del Coach (máxima calidad)
const MODEL_BOT     = 'claude-haiku-4-5-20251001'; // Bot automático cliente (rápido)
const MODEL_ANALISIS = 'claude-opus-4-5';  // Análisis de sesión (preciso)

const ANTHROPIC_HEADERS = (key) => ({
  'Content-Type': 'application/json',
  'x-api-key': key,
  'anthropic-version': '2023-06-01'
});

// ─── Helper: llamada a Claude ────────────────────────────────────────────────
async function callClaude({ apiKey, model, system, messages, maxTokens = 2000 }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: ANTHROPIC_HEADERS(apiKey),
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'Error API Claude');
  if (!data.content?.[0]?.text) throw new Error('Respuesta vacía de Claude');
  return data.content[0].text.trim();
}

// ─── Helper principal: construye el contexto COMPLETO de un cliente ──────────
function buildClienteContexto(clienteId, { lang = 'es', incluirHistorialSesiones = true } = {}) {
  const isEn = lang === 'en';

  // ── Perfil ──────────────────────────────────────────────────────────────
  const cl = dbGet(`
    SELECT c.*, u.nombre, u.username, u.lang, u.email, u.telefono
    FROM clientes c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?`, [clienteId]);
  if (!cl) return null;

  // ── Rutina completa (días + ejercicios) ──────────────────────────────────
  const dias = dbAll(`
    SELECT id, nombre, grupo, orden
    FROM dias_entreno
    WHERE cliente_id = ?
    ORDER BY orden, id`, [clienteId]);

  const rutina = dias.map(d => {
    const ejercicios = dbAll(`
      SELECT nombre, musculos, series, reps, peso_objetivo, descanso, rir, es_principal, nota_coach
      FROM ejercicios_dia
      WHERE dia_id = ?
      ORDER BY orden, id`, [d.id]);
    return { dia: d.nombre, grupo: d.grupo, ejercicios };
  });

  // ── Dieta completa (comidas + alimentos + macros) ────────────────────────
  const comidas = dbAll(`
    SELECT id, nombre, orden
    FROM comidas
    WHERE cliente_id = ?
    ORDER BY orden, id`, [clienteId]);

  const dieta = comidas.map(c => {
    const alimentos = dbAll(`
      SELECT nombre, gramos
      FROM alimentos
      WHERE comida_id = ?
      ORDER BY orden, id`, [c.id]);
    return { comida: c.nombre, alimentos };
  });

  // ── Historial de sesiones recientes (últimas 8) ──────────────────────────
  let sesionesRecientes = [];
  if (incluirHistorialSesiones) {
    const sesiones = dbAll(`
      SELECT id, dia_nombre, fecha, duracion_min, estado, valoracion
      FROM sesiones_entreno
      WHERE cliente_id = ?
      ORDER BY fecha DESC
      LIMIT 8`, [clienteId]);

    sesionesRecientes = sesiones.map(s => {
      const series = dbAll(`
        SELECT ejercicio_nombre, serie_num, peso_real, reps_real, rir, nota_cliente
        FROM series_log
        WHERE sesion_id = ?
        ORDER BY id`, [s.id]);
      return { ...s, series };
    });
  }

  // ── Progresión por ejercicio (último peso real vs objetivo) ──────────────
  const progresion = {};
  if (incluirHistorialSesiones) {
    const logsRecientes = dbAll(`
      SELECT sl.ejercicio_nombre, sl.peso_real, sl.reps_real, sl.fecha
      FROM series_log sl
      JOIN sesiones_entreno se ON sl.sesion_id = se.id
      WHERE se.cliente_id = ?
      ORDER BY sl.fecha DESC
      LIMIT 200`, [clienteId]);

    logsRecientes.forEach(log => {
      if (!progresion[log.ejercicio_nombre]) {
        progresion[log.ejercicio_nombre] = { ultimo_peso: log.peso_real, ultima_fecha: log.fecha };
      }
    });
  }

  // ── Métricas y check-ins ─────────────────────────────────────────────────
  const ultimoPeso    = dbGet(`SELECT peso, grasa, cintura, fecha FROM peso_registros WHERE cliente_id=? ORDER BY rowid DESC LIMIT 1`, [clienteId]);
  const ultimoCheckin = dbGet(`SELECT sueno, energia, peso, semana FROM checkins WHERE cliente_id=? ORDER BY fecha DESC LIMIT 1`, [clienteId]);
  const totalSesiones = dbGet(`SELECT COUNT(*) as c FROM sesiones_entreno WHERE cliente_id=? AND estado='completado'`, [clienteId]);
  const ultimaSesion  = dbGet(`SELECT fecha, dia_nombre, estado FROM sesiones_entreno WHERE cliente_id=? ORDER BY fecha DESC LIMIT 1`, [clienteId]);

  const diasSinEntreno = ultimaSesion
    ? Math.floor((Date.now() - new Date(ultimaSesion.fecha).getTime()) / 86400000)
    : null;

  // ── Plan meta (alternativas de dieta, suplementación) ───────────────────
  const planMeta = dbGet(`SELECT * FROM plan_meta WHERE cliente_id=?`, [clienteId]);

  // ── Suscripción ──────────────────────────────────────────────────────────
  const sub = dbGet(`SELECT estado, fecha_fin FROM suscripciones WHERE cliente_id=?`, [clienteId]);

  // ── Fotos de progreso (últimas 6, con análisis guardado) ────────────────
  const fotosRecientes = dbAll(`
    SELECT url, analysis, tipo, fecha
    FROM fotos
    WHERE cliente_id = ?
    ORDER BY fecha DESC
    LIMIT 6`, [clienteId]);

  // ── Usar lang del cliente si no se pasó explícitamente ──────────────────
  const clienteLang = cl.lang || lang;
  const en = clienteLang === 'en';

  // ── Labels bilingües (usados para el contexto que recibe la IA) ──────────
  const L = {
    profile:          en ? '=== CLIENT PROFILE ===' : '=== PERFIL DEL CLIENTE ===',
    name:             en ? 'Name' : 'Nombre',
    user:             en ? 'Username' : 'Usuario',
    goal:             en ? 'Goal' : 'Objetivo',
    level:            en ? 'Level' : 'Nivel',
    sex:              en ? 'Sex' : 'Sexo',
    age:              en ? 'age' : 'años',
    weight:           en ? 'Current weight' : 'Peso actual',
    height:           en ? 'Height' : 'Altura',
    bodyFat:          en ? 'Body fat' : 'Grasa corporal',
    waist:            en ? 'Waist' : 'Cintura',
    activity:         en ? 'Activity' : 'Actividad',
    dietType:         en ? 'Diet type' : 'Dieta tipo',
    injuries:         en ? 'Injuries / limitations' : 'Lesiones / limitaciones',
    foodsNo:          en ? 'Foods they cannot eat' : 'Alimentos que no puede comer',
    coachNotes:       en ? 'Coach notes' : 'Notas del coach',
    deficiencies:     en ? 'Deficiencies' : 'Deficiencias',
    macros:           en ? '=== MACROS & NUTRITION PLAN ===' : '=== MACROS Y PLAN NUTRICIONAL ===',
    kcal:             en ? 'Kcal' : 'Kcal',
    protein:          en ? 'Protein' : 'Proteína',
    carbs:            en ? 'Carbs' : 'Carbos',
    fats:             en ? 'Fats' : 'Grasas',
    freeM:            en ? 'Free meal' : 'Comida libre',
    suppl:            en ? 'Supplementation' : 'Suplementación',
    therapeutic:      en ? 'Therapeutic foods' : 'Alimentos terapéuticos',
    dietHeader:       (n) => en ? `=== CURRENT DIET (${n} meals) ===` : `=== DIETA ACTUAL (${n} comidas) ===`,
    dietNone:         en ? '=== DIET: Not assigned yet ===' : '=== DIETA: Sin dieta asignada aún ===',
    noFoods:          en ? '(no foods)' : '(sin alimentos)',
    routineHeader:    (n) => en ? `=== CURRENT ROUTINE (${n} days) ===` : `=== RUTINA ACTUAL (${n} días) ===`,
    routineNone:      en ? '=== ROUTINE: Not assigned yet ===' : '=== RUTINA: Sin rutina asignada aún ===',
    noExercises:      en ? '(no exercises assigned)' : '(Sin ejercicios asignados)',
    lastReal:         en ? 'last real' : 'último real',
    rest:             en ? 'Rest' : 'Descanso',
    note:             en ? 'Note' : 'Nota',
    target:           en ? 'target' : 'objetivo',
    historyHeader:    en ? '=== WORKOUT HISTORY ===' : '=== HISTORIAL DE ENTRENAMIENTOS ===',
    totalSessions:    en ? 'Total completed sessions' : 'Total sesiones completadas',
    daysSince:        en ? 'Days since last workout' : 'Días desde último entreno',
    lastWorkout:      en ? 'Last workout' : 'Último entreno',
    noSessions:       en ? 'No sessions recorded yet' : 'Sin sesiones registradas aún',
    recentSessions:   en ? 'Recent sessions with detail:' : 'Últimas sesiones con detalle:',
    rating:           en ? 'Rating' : 'Valoración',
    checkinHeader:    (w) => en ? `=== LAST CHECK-IN (Week ${w || '—'}) ===` : `=== ÚLTIMO CHECK-IN (Semana ${w || '—'}) ===`,
    sleep:            en ? 'Sleep' : 'Sueño',
    energy:           en ? 'Energy' : 'Energía',
    photosHeader:     (n) => en ? `=== PROGRESS PHOTOS (${n} recorded) ===` : `=== FOTOS DE PROGRESO (${n} registradas) ===`,
    photo:            en ? 'Photo' : 'Foto',
    coachAnalysis:    en ? 'Coach analysis' : 'Análisis coach',
    noPhotos:         en ? 'Progress photos: None recorded yet' : 'Fotos de progreso: Sin fotos registradas aún',
    generalHeader:    en ? '=== GENERAL STATUS ===' : '=== ESTADO GENERAL ===',
    weeksIn:          en ? 'Weeks in program' : 'Semanas en el programa',
    weekMsg:          en ? 'Week message' : 'Mensaje de la semana',
    subscription:     en ? 'Subscription' : 'Suscripción',
    until:            en ? 'until' : 'hasta',
  };

  // ══ Construir texto del contexto ══════════════════════════════════════════
  const lines = [];

  // Perfil
  lines.push(L.profile);
  lines.push(`${L.name}: ${cl.nombre}`);
  lines.push(`${L.user}: ${cl.username}`);
  lines.push(`${L.goal}: ${cl.objetivo || '—'}`);
  lines.push(`${L.level}: ${cl.nivel || '—'}`);
  lines.push(`${L.sex}: ${cl.sexo || '—'} | ${L.age}: ${cl.edad || '—'} ${en ? 'y/o' : 'años'}`);
  lines.push(`${L.weight}: ${cl.peso_actual ? cl.peso_actual + ' kg' : '—'} | ${L.height}: ${cl.altura ? cl.altura + ' cm' : '—'}`);
  if (ultimoPeso?.grasa)   lines.push(`${L.bodyFat}: ${ultimoPeso.grasa}%`);
  if (ultimoPeso?.cintura) lines.push(`${L.waist}: ${ultimoPeso.cintura} cm`);
  lines.push(`${L.activity}: ${cl.actividad || '—'} | ${L.dietType}: ${cl.dieta_tipo || '—'}`);
  if (cl.lesiones)         lines.push(`${L.injuries}: ${cl.lesiones}`);
  if (cl.alimentos_no)     lines.push(`${L.foodsNo}: ${cl.alimentos_no}`);
  if (cl.observaciones)    lines.push(`${L.coachNotes}: ${cl.observaciones}`);
  if (cl.deficiencias)     lines.push(`${L.deficiencies}: ${cl.deficiencias}`);

  // Macros
  lines.push(`\n${L.macros}`);
  lines.push(`${L.kcal}: ${cl.kcal_internas || '—'} | ${L.protein}: ${cl.prot || '—'}g | ${L.carbs}: ${cl.carbs || '—'}g | ${L.fats}: ${cl.fat || '—'}g`);
  if (cl.comida_libre)                        lines.push(`${L.freeM}: ${cl.comida_libre}`);
  if (planMeta?.suplementacion)               lines.push(`${L.suppl}: ${planMeta.suplementacion}`);
  if (planMeta?.alimentos_therapeuticos)      lines.push(`${L.therapeutic}: ${planMeta.alimentos_therapeuticos}`);

  // Dieta
  if (dieta.length > 0) {
    lines.push(`\n${L.dietHeader(dieta.length)}`);
    dieta.forEach(c => {
      const aliStr = c.alimentos.map(a => `${a.nombre} ${a.gramos}g`).join(', ');
      lines.push(`• ${c.comida}: ${aliStr || L.noFoods}`);
    });
  } else {
    lines.push(`\n${L.dietNone}`);
  }

  // Rutina
  if (rutina.length > 0) {
    lines.push(`\n${L.routineHeader(rutina.length)}`);
    rutina.forEach(d => {
      lines.push(`\n▸ ${d.dia}${d.grupo ? ' — ' + d.grupo : ''}`);
      if (d.ejercicios.length === 0) {
        lines.push(`  (${L.noExercises})`);
      } else {
        d.ejercicios.forEach(e => {
          const progData = progresion[e.nombre];
          const pesoReal = progData ? ` [${L.lastReal}: ${progData.ultimo_peso}kg]` : '';
          const nota     = e.nota_coach ? ` | ${L.note}: ${e.nota_coach}` : '';
          lines.push(`  - ${e.nombre}: ${e.series}x${e.reps} @ ${e.peso_objetivo || 0}kg ${L.target}${pesoReal} | ${L.rest}: ${e.descanso}s${e.rir != null ? ' | RIR: ' + e.rir : ''}${nota}`);
        });
      }
    });
  } else {
    lines.push(`\n${L.routineNone}`);
  }

  // Historial de sesiones
  lines.push(`\n${L.historyHeader}`);
  lines.push(`${L.totalSessions}: ${totalSesiones?.c || 0}`);
  if (diasSinEntreno !== null) {
    lines.push(`${L.daysSince}: ${diasSinEntreno}`);
    lines.push(`${L.lastWorkout}: ${ultimaSesion.dia_nombre} (${ultimaSesion.fecha?.split('T')[0]}) — ${ultimaSesion.estado}`);
  } else {
    lines.push(L.noSessions);
  }

  if (sesionesRecientes.length > 0) {
    lines.push(`\n${L.recentSessions}`);
    sesionesRecientes.forEach(s => {
      lines.push(`\n• ${s.dia_nombre} — ${s.fecha?.split('T')[0]} (${s.estado}, ${s.duracion_min || 0} min)${s.valoracion ? ' | ' + L.rating + ': ' + s.valoracion : ''}`);
      if (s.series.length > 0) {
        const porEjercicio = {};
        s.series.forEach(sl => {
          if (!porEjercicio[sl.ejercicio_nombre]) porEjercicio[sl.ejercicio_nombre] = [];
          porEjercicio[sl.ejercicio_nombre].push(`${sl.peso_real}kg×${sl.reps_real}${sl.rir != null ? ' RIR' + sl.rir : ''}`);
        });
        Object.entries(porEjercicio).forEach(([ej, srs]) => {
          lines.push(`  ${ej}: ${srs.join(' | ')}`);
        });
      }
    });
  }

  // Check-ins
  if (ultimoCheckin) {
    lines.push(`\n${L.checkinHeader(ultimoCheckin.semana)}`);
    lines.push(`${L.sleep}: ${ultimoCheckin.sueno}/10 | ${L.energy}: ${ultimoCheckin.energia}/10 | ${en ? 'Weight' : 'Peso'}: ${ultimoCheckin.peso || '—'}kg`);
  }

  // Fotos
  if (fotosRecientes.length > 0) {
    lines.push(`\n${L.photosHeader(fotosRecientes.length)}`);
    fotosRecientes.forEach((f, i) => {
      lines.push(`${L.photo} ${i + 1} — ${f.fecha?.split('T')[0]} (${f.tipo || 'front'})`);
      if (f.analysis) lines.push(`  ${L.coachAnalysis}: ${f.analysis}`);
    });
  } else {
    lines.push(`\n${L.noPhotos}`);
  }

  // Estado general
  lines.push(`\n${L.generalHeader}`);
  lines.push(`${L.weeksIn}: ${cl.semanas || 1}`);
  if (cl.mensaje_semana) lines.push(`${L.weekMsg}: ${cl.mensaje_semana}`);
  if (sub) lines.push(`${L.subscription}: ${sub.estado}${sub.fecha_fin ? ' ' + L.until + ' ' + sub.fecha_fin : ''}`);

  return {
    cliente: cl,
    isEn: en,
    texto: lines.filter(l => l !== undefined).join('\n')
  };
}

// ─── Helpers internos ────────────────────────────────────────────────────────
function getCoachId() {
  try { const c = dbGet("SELECT id FROM users WHERE role='coach' LIMIT 1"); return c?.id || null; }
  catch(e) { return null; }
}

function getClienteIdPropio(userId) {
  try { const c = dbGet('SELECT id FROM clientes WHERE user_id=?', [userId]); return c?.id || null; }
  catch(e) { return null; }
}

function crearNotificacion(userId, tipo, mensaje) {
  try {
    dbRun('INSERT INTO notificaciones (user_id, tipo, mensaje) VALUES (?,?,?)', [userId, tipo, mensaje]);
    ssePush(userId, 'notificacion', { tipo, mensaje, ts: Date.now() });
    if (global.sendPushToUser) global.sendPushToUser(userId, 'WolfMindset 🐺', mensaje, '/');
  } catch(e) {}
}

function coachEstaActivoEnCliente(clienteId) {
  try {
    const cl = dbGet("SELECT coach_online, last_coach_activity FROM clientes WHERE id=?", [clienteId]);
    if (!cl || !cl.coach_online) return false;
    if (!cl.last_coach_activity) return false;
    const diff = (Date.now() - new Date(cl.last_coach_activity).getTime()) / 60000;
    return diff < 5;
  } catch(e) { return false; }
}

function botDebeResponder(clienteId) {
  try {
    if (coachEstaActivoEnCliente(clienteId)) return false;
    const cfg = dbGet('SELECT bot_global FROM ia_config WHERE id=1');
    const botGlobal = cfg?.bot_global || 0;
    const cl  = dbGet('SELECT ia_chat_activa FROM clientes WHERE id=?', [clienteId]);
    const iaC = cl ? cl.ia_chat_activa : 0;
    if (botGlobal) return iaC !== 0;
    return iaC === 1;
  } catch(e) { return false; }
}

// ══════════════════════════════════════════════════════════════════════════════
//  ENDPOINT 1: POST /api/ia/coach-chat
//  IA Privada del Coach — accede a TODO el contexto del cliente por nombre/id
//  El coach pregunta sobre cualquier cliente y la IA tiene TODA la info
// ══════════════════════════════════════════════════════════════════════════════
router.post('/ia/coach-chat', coachOnly, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada' });

  const { messages, clienteId, clienteNombre, lang } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages requerido' });

  const isEn = lang === 'en';

  try {
    // ── Resolver qué cliente cargar ──────────────────────────────────────────
    let contextText = '';
    let clienteResolto = null;

    if (clienteId) {
      // Cargar cliente por ID
      const ctx = buildClienteContexto(clienteId);
      if (ctx) { contextText = ctx.texto; clienteResolto = ctx.cliente; }

    } else if (clienteNombre) {
      // Buscar cliente por nombre (coincidencia parcial)
      const encontrado = dbGet(`
        SELECT c.id FROM clientes c
        JOIN users u ON c.user_id = u.id
        WHERE LOWER(u.nombre) LIKE LOWER(?)
        LIMIT 1`, [`%${clienteNombre}%`]);
      if (encontrado) {
        const ctx = buildClienteContexto(encontrado.id);
        if (ctx) { contextText = ctx.texto; clienteResolto = ctx.cliente; }
      }
    } else {
      // Sin cliente específico: cargar lista de todos los clientes para referencia
      const todos = dbAll(`
        SELECT c.id, u.nombre, c.objetivo, c.nivel, c.semanas,
               (SELECT COUNT(*) FROM sesiones_entreno WHERE cliente_id=c.id AND estado='completado') as sesiones
        FROM clientes c JOIN users u ON c.user_id=u.id
        WHERE COALESCE(u.estado,'activo') = 'activo'
        ORDER BY u.nombre`, []);
      if (todos.length > 0) {
        contextText = `=== LISTA DE CLIENTES ACTIVOS ===\n` +
          todos.map(c => `• ${c.nombre} (ID ${c.id}) — ${c.objetivo || '—'}, ${c.nivel || '—'}, ${c.sesiones} sesiones completadas`).join('\n');
        contextText += `\n\n(Para más detalle de un cliente concreto, menciona su nombre en tu pregunta)`;
      }
    }

    // ── System prompt del Coach ──────────────────────────────────────────────
    const fechaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const systemPrompt = isEn
      ? `You are the private AI assistant for WolfMindset coach. You have FULL access to all client data provided below.

Today: ${fechaHoy}

Your capabilities:
- Analyze total training volume (sets per muscle group per week) vs MRV/MEV/MAV ranges
- Calculate and adjust macros based on goal, weight, activity
- Analyze session-by-session progression for each exercise (real weights logged)
- Detect imbalances, overtraining, stagnation
- Generate complete personalized meal plans
- Suggest routine adjustments (progressive overload, deload, substitutions)
- Read and interpret the progress photo analysis stored for the client
- Create personalized motivational messages

CRITICAL FORMATTING RULES — NEVER BREAK THESE:
- NO markdown whatsoever: no **, no ##, no --, no tables with |, no bullet points with *
- Use plain conversational text only
- For lists use numbers: 1. 2. 3. or just line breaks
- For emphasis use CAPS or just say it directly
- Respond in the same language as the coach's message

IMPORTANT: You DO have access to the client's progress photo analysis (stored in their profile). If the coach asks about photos or progress, read the FOTOS DE PROGRESO section in the client data below and summarize what the analysis says. You cannot see the images directly, but you have the written analysis generated when each photo was reviewed.

${contextText ? `\n${contextText}` : '(No specific client loaded — answer general questions or select a client from the dropdown)'}`
      : `Eres el asistente IA privado del coach de WolfMindset. Tienes acceso COMPLETO a todos los datos del cliente que se proporcionan abajo.

Fecha hoy: ${fechaHoy}

Tus capacidades:
- Analizar volumen total (series por grupo muscular/semana) vs rangos MRV/MEV/MAV
- Calcular y ajustar macros según objetivo, peso y actividad
- Analizar la progresión sesión a sesión por ejercicio (pesos reales registrados)
- Detectar desequilibrios, sobreentrenamiento, estancamientos
- Generar planes de comida completos y personalizados
- Sugerir ajustes de rutina (sobrecarga progresiva, descarga, sustituciones)
- Leer e interpretar el análisis de fotos de progreso guardado del cliente
- Crear mensajes motivacionales personalizados

REGLAS DE FORMATO CRÍTICAS — NUNCA LAS INCUMPLAS:
- CERO markdown: nada de **, nada de ##, nada de --, nada de tablas con |, nada de listas con *
- Solo texto conversacional plano
- Para listas usa números: 1. 2. 3. o simplemente saltos de línea
- Para énfasis usa MAYÚSCULAS o simplemente dilo directamente
- Responde en el mismo idioma que el coach

IMPORTANTE: SÍ tienes acceso al análisis de las fotos de progreso del cliente (guardado en su perfil). Si el coach pregunta por las fotos o el progreso físico, lee la sección FOTOS DE PROGRESO en los datos del cliente abajo y resume lo que dice el análisis. No puedes ver las imágenes directamente, pero tienes el análisis escrito que se generó cuando se revisó cada foto.

${contextText ? `\n${contextText}` : '(Sin cliente cargado — responde preguntas generales o selecciona un cliente en el desplegable)'}`;

    const reply = await callClaude({
      apiKey,
      model: MODEL_COACH,
      system: systemPrompt,
      messages,
      maxTokens: 4000
    });

    res.json({
      reply,
      clienteCargado: clienteResolto ? { id: clienteResolto.id, nombre: clienteResolto.nombre } : null
    });

  } catch(e) {
    console.error('[IA Coach Chat]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ENDPOINT 2: POST /api/ia/chat-cliente
//  Bot automático para clientes — responde con contexto completo del cliente
//  Reemplaza la función responderConIA interna de routes.js
// ══════════════════════════════════════════════════════════════════════════════
router.post('/ia/chat-cliente', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });

  const isCoach = req.user.role === 'coach';
  const clienteId = isCoach
    ? parseInt(req.body.cliente_id, 10)
    : getClienteIdPropio(req.user.id);

  if (!clienteId) return res.status(400).json({ error: 'cliente_id requerido' });

  const { mensaje } = req.body;
  if (!mensaje?.trim()) return res.status(400).json({ error: 'mensaje requerido' });

  try {
    const ctx = buildClienteContexto(clienteId);
    if (!ctx) return res.status(404).json({ error: 'Cliente no encontrado' });

    const { isEn, texto } = ctx;

    // Últimos 20 mensajes del historial
    const historial = dbAll(
      'SELECT contenido, de_coach FROM mensajes WHERE cliente_id=? ORDER BY created_at DESC LIMIT 20',
      [clienteId]
    ).reverse();

    const system = isEn
      ? `You are the WolfMindset coach assistant. You respond to clients warmly, directly and motivatingly — like a real coach who knows them personally.

RULES:
- Never mention AI or technology
- Use ONLY the client's real data to answer
- If they ask about their routine: give REAL exercise names, series, reps and weights
- If they ask about their diet: give REAL food names and grams
- If they ask about their progress: use their real session history
- Keep responses concise but COMPLETE (answer what they asked)
- If you truly don't know something, say the coach will confirm shortly
- NO markdown, NO asterisks, NO bullet points — natural conversational text only

${texto}`
      : `Eres el asistente coach de WolfMindset. Respondes a los clientes con un tono cercano, directo y motivador — como un coach real que los conoce personalmente.

REGLAS:
- Nunca menciones IA ni tecnología
- Usa SOLO los datos reales del cliente para responder
- Si preguntan por su rutina: da los nombres REALES de ejercicios, series, reps y pesos
- Si preguntan por su dieta: da los alimentos REALES con gramos
- Si preguntan por su progreso: usa su historial real de sesiones
- Respuestas concisas pero COMPLETAS (responde lo que preguntaron)
- Si de verdad no sabes algo, di que el coach lo confirmará en breve
- SIN markdown, SIN asteriscos, SIN listas con guiones — solo texto conversacional natural

${texto}`;

    const messages = [
      ...historial.map(m => ({ role: m.de_coach ? 'assistant' : 'user', content: m.contenido })),
      { role: 'user', content: mensaje }
    ];

    const reply = await callClaude({
      apiKey,
      model: MODEL_BOT,
      system,
      messages,
      maxTokens: 500
    });

    res.json({ reply });

  } catch(e) {
    console.error('[IA Chat Cliente]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ENDPOINT 3: GET /api/ia/contexto-cliente/:id
//  Devuelve el contexto completo de un cliente en texto (útil para debug/preview)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/ia/contexto-cliente/:id', coachOnly, (req, res) => {
  try {
    const ctx = buildClienteContexto(parseInt(req.params.id));
    if (!ctx) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ contexto: ctx.texto });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  FUNCIÓN INTERNA: responderConIA (para el bot automático del chat)
//  Reemplaza la versión débil en routes.js — ahora con contexto COMPLETO
// ══════════════════════════════════════════════════════════════════════════════
async function responderConIA(clienteId, mensajeUsuario) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    if (!botDebeResponder(clienteId)) return null;

    const ctx = buildClienteContexto(clienteId, { incluirHistorialSesiones: false });
    if (!ctx) return null;

    const { isEn, texto, cliente: cl } = ctx;

    const historial = dbAll(
      'SELECT contenido, de_coach FROM mensajes WHERE cliente_id=? ORDER BY created_at DESC LIMIT 10',
      [clienteId]
    ).reverse();

    const system = isEn
      ? `You are the WolfMindset coach assistant. Warm, direct, motivating — like a real personal coach. Max 3-4 sentences. Never mention AI. Use the client's real data. No markdown, no asterisks.

${texto}`
      : `Eres el asistente coach de WolfMindset. Cercano, directo, motivador — como un coach personal real. Máximo 3-4 frases. Nunca menciones IA. Usa los datos reales del cliente. Sin markdown, sin asteriscos.

${texto}`;

    const messages = [
      ...historial.map(m => ({ role: m.de_coach ? 'assistant' : 'user', content: m.contenido })),
      { role: 'user', content: mensajeUsuario }
    ];

    const reply = await callClaude({
      apiKey,
      model: MODEL_BOT,
      system,
      messages,
      maxTokens: 350
    });

    // Guardar mensaje en BD
    const rMsg = dbRun(
      'INSERT INTO mensajes (cliente_id, de_coach, via_ia, contenido, leido) VALUES (?,1,1,?,0)',
      [clienteId, reply]
    );
    saveToDisk();

    // Notificar cliente por SSE
    try {
      ssePush(String(cl.user_id), 'mensaje_nuevo', {
        id: rMsg.lastInsertRowid,
        contenido: reply,
        de_coach: 1,
        via_ia: 1,
        created_at: new Date().toISOString()
      });
    } catch(e) {}

    // Badge al coach
    const coachId = getCoachId();
    if (coachId) ssePush(String(coachId), 'badge_msgs', { cliente_id: clienteId });

    return reply;
  } catch(e) {
    console.error('[responderConIA]', e.message);
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  ENDPOINT 4: POST /api/ia/generar-dieta
//  Genera dieta completa personalizada para un cliente
// ══════════════════════════════════════════════════════════════════════════════
router.post('/ia/generar-dieta', coachOnly, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });

  const { clienteId, instrucciones, numComidas, lang } = req.body;
  if (!clienteId) return res.status(400).json({ error: 'clienteId requerido' });

  try {
    const ctx = buildClienteContexto(clienteId, { incluirHistorialSesiones: false });
    if (!ctx) return res.status(404).json({ error: 'Cliente no encontrado' });

    const { isEn, texto } = ctx;

    const system = isEn
      ? `You are an expert sports nutritionist and fitness coach. Generate a complete, detailed meal plan in JSON format. Use ONLY real, common foods. Be precise with grams. Respect all dietary restrictions.`
      : `Eres un nutricionista deportivo y coach de fitness experto. Genera un plan de comidas completo y detallado en formato JSON. Usa SOLO alimentos reales y comunes. Sé preciso con los gramos. Respeta todas las restricciones alimentarias.`;

    const prompt = isEn
      ? `Generate a complete daily meal plan for this client.
${instrucciones ? `Coach instructions: ${instrucciones}` : ''}
Number of meals: ${numComidas || 'as needed for the client'}

RESPOND ONLY WITH THIS JSON (no other text):
{
  "comidas": [
    {
      "nombre": "Desayuno",
      "alimentos": [
        { "nombre": "Avena", "gramos": 80 },
        { "nombre": "Leche desnatada", "gramos": 300 }
      ]
    }
  ],
  "totales": { "kcal": 2200, "prot": 165, "carbs": 250, "grasas": 70 },
  "notas": "Optional notes for the client"
}

Client data:
${texto}`
      : `Genera un plan de comidas diario completo para este cliente.
${instrucciones ? `Instrucciones del coach: ${instrucciones}` : ''}
Número de comidas: ${numComidas || 'las que necesite el cliente'}

RESPONDE SOLO CON ESTE JSON (sin texto adicional):
{
  "comidas": [
    {
      "nombre": "Desayuno",
      "alimentos": [
        { "nombre": "Avena", "gramos": 80 },
        { "nombre": "Leche desnatada", "gramos": 300 }
      ]
    }
  ],
  "totales": { "kcal": 2200, "prot": 165, "carbs": 250, "grasas": 70 },
  "notas": "Notas opcionales para el cliente"
}

Datos del cliente:
${texto}`;

    const raw = await callClaude({
      apiKey,
      model: MODEL_COACH,
      system,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 3000
    });

    const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const dieta = JSON.parse(clean);
    res.json(dieta);

  } catch(e) {
    console.error('[IA Generar Dieta]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ENDPOINT 5: POST /api/ia/analizar-volumen
//  Analiza el volumen total de entrenamiento de un cliente
// ══════════════════════════════════════════════════════════════════════════════
router.post('/ia/analizar-volumen', coachOnly, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });

  const { clienteId, lang } = req.body;
  if (!clienteId) return res.status(400).json({ error: 'clienteId requerido' });

  try {
    const ctx = buildClienteContexto(clienteId);
    if (!ctx) return res.status(404).json({ error: 'Cliente no encontrado' });

    const { isEn, texto } = ctx;

    const system = isEn
      ? `You are an expert in training programming (RPE/RIR, MRV, MEV, MAV, periodization). Analyze training volume precisely.`
      : `Eres un experto en programación del entrenamiento (RPE/RIR, MRV, MEV, MAV, periodización). Analiza el volumen de entrenamiento con precisión.`;

    const prompt = isEn
      ? `Analyze the TOTAL TRAINING VOLUME of this client.

Provide:
1. Series per muscle group per week (chest, back, shoulders, biceps, triceps, quadriceps, hamstrings, glutes, calves, abs)
2. Compare each with MRV/MEV/MAV ranges
3. Volume distribution: direct vs indirect
4. Imbalances detected (agonist/antagonist, push/pull ratio)
5. Sessions per muscle per week
6. Load analysis vs objective (${ctx.cliente.objetivo})
7. Concrete recommendations (add, remove, redistribute)
8. Check if there's unnecessary overlap between days

Be specific with real exercise names from the routine.

Client data:
${texto}`
      : `Analiza el VOLUMEN TOTAL DE ENTRENAMIENTO de este cliente.

Proporciona:
1. Series por grupo muscular por semana (pecho, espalda, hombros, bíceps, tríceps, cuádriceps, isquios, glúteos, gemelos, abdomen)
2. Compara cada uno con los rangos MRV/MEV/MAV
3. Distribución del volumen: directo vs indirecto
4. Desequilibrios detectados (agonistas/antagonistas, ratio push/pull)
5. Frecuencia por músculo por semana
6. Análisis de la carga vs objetivo (${ctx.cliente.objetivo})
7. Recomendaciones concretas (añadir, quitar, redistribuir)
8. Comprueba si hay solapamiento innecesario entre días

Sé específico con los nombres reales de ejercicios de la rutina.

Datos del cliente:
${texto}`;

    const reply = await callClaude({
      apiKey,
      model: MODEL_COACH,
      system,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 2500
    });

    res.json({ analisis: reply });

  } catch(e) {
    console.error('[IA Analizar Volumen]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ENDPOINT 6: POST /api/ia/analizar-progresion
//  Analiza la progresión de un cliente ejercicio a ejercicio
// ══════════════════════════════════════════════════════════════════════════════
router.post('/ia/analizar-progresion', coachOnly, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });

  const { clienteId, lang } = req.body;
  if (!clienteId) return res.status(400).json({ error: 'clienteId requerido' });

  try {
    const ctx = buildClienteContexto(clienteId, { incluirHistorialSesiones: true });
    if (!ctx) return res.status(404).json({ error: 'Cliente no encontrado' });

    const { isEn, texto } = ctx;

    const prompt = isEn
      ? `Analyze the progression of this client based on their session history.

Provide:
1. Which exercises are progressing well (increasing weight/reps)
2. Which exercises are stagnant or regressing
3. Exercises where the real weight is far from the objective
4. Overall strength trend
5. Specific recommendations for each stagnant exercise
6. Suggested new target weights for next cycle

Use real session data provided.

${texto}`
      : `Analiza la progresión de este cliente basándote en su historial de sesiones.

Proporciona:
1. Qué ejercicios están progresando bien (subiendo peso/reps)
2. Qué ejercicios están estancados o retrocediendo
3. Ejercicios donde el peso real está muy lejos del objetivo
4. Tendencia general de fuerza
5. Recomendaciones concretas para cada ejercicio estancado
6. Nuevos pesos objetivo sugeridos para el siguiente ciclo

Usa los datos reales de sesiones proporcionados.

${texto}`;

    const reply = await callClaude({
      apiKey,
      model: MODEL_COACH,
      system: isEn
        ? 'You are an expert fitness coach specialized in strength progression and periodization.'
        : 'Eres un coach de fitness experto en progresión de fuerza y periodización.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 2000
    });

    res.json({ analisis: reply });

  } catch(e) {
    console.error('[IA Analizar Progresión]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ENDPOINT 7: POST /api/ia/mensaje-cliente
//  Genera un mensaje personalizado para enviar a un cliente
// ══════════════════════════════════════════════════════════════════════════════
router.post('/ia/mensaje-cliente', coachOnly, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });

  const { clienteId, tipo = 'motivacion', instrucciones, lang } = req.body;
  if (!clienteId) return res.status(400).json({ error: 'clienteId requerido' });

  try {
    const ctx = buildClienteContexto(clienteId, { incluirHistorialSesiones: true });
    if (!ctx) return res.status(404).json({ error: 'Cliente no encontrado' });

    const { isEn, texto, cliente: cl } = ctx;

    const tipoDescripciones = {
      motivacion: isEn ? 'motivational, push them to train today' : 'motivacional, empujarle a entrenar hoy',
      progreso:   isEn ? 'celebrating visible progress and specific achievements' : 'celebrando el progreso visible y logros específicos',
      ajuste:     isEn ? 'communicating an important routine or diet adjustment' : 'comunicando un ajuste importante de rutina o dieta',
      check:      isEn ? 'checking in and asking how they feel' : 'haciendo check-in y preguntando cómo se encuentra',
      personalizado: instrucciones || (isEn ? 'based on coach instructions' : 'según instrucciones del coach')
    };

    const prompt = isEn
      ? `Write a personal coach message (3-5 sentences) for this client.
Type: ${tipoDescripciones[tipo] || tipoDescripciones.motivacion}
${instrucciones ? `Coach specific instruction: ${instrucciones}` : ''}

Make it personal — use their REAL data (current weight, last workout, progress). Not generic. Tone: direct, warm, motivating. No markdown, no asterisks, no mentions of AI or technology.

${texto}`
      : `Escribe un mensaje personal del coach (3-5 frases) para este cliente.
Tipo: ${tipoDescripciones[tipo] || tipoDescripciones.motivacion}
${instrucciones ? `Instrucción específica del coach: ${instrucciones}` : ''}

Hazlo personal — usa sus datos REALES (peso actual, último entreno, progreso). Nada genérico. Tono: directo, cercano, motivador. Sin markdown, sin asteriscos, sin mencionar IA ni tecnología.

${texto}`;

    const reply = await callClaude({
      apiKey,
      model: MODEL_BOT,
      system: isEn
        ? 'You are the WolfMindset coach. Write directly to the client in first person. Warm, direct, no AI mentions.'
        : 'Eres el coach de WolfMindset. Escribe directamente al cliente en primera persona. Cercano, directo, sin mencionar IA.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 300
    });

    res.json({ mensaje: reply, cliente: { nombre: cl.nombre } });

  } catch(e) {
    console.error('[IA Mensaje Cliente]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  FUNCIÓN EXPORTADA: responderConIA
//  Para compatibilidad con routes.js — puede reemplazar la función interna
// ══════════════════════════════════════════════════════════════════════════════
module.exports = { router, responderConIA, buildClienteContexto };
