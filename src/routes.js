const express = require('express');
const { dbGet, dbAll, dbRun, saveToDisk } = require('./database');
const { authMiddleware, coachOnly } = require('./auth');
const { ssePush, ssePushCoaches } = require('./sse');

const router = express.Router();
router.use(authMiddleware);

// ── HELPERS ───────────────────────────────────────────────────────────
function crearNotificacion(userId, tipo, mensaje) {
  try {
    dbRun('INSERT INTO notificaciones (user_id, tipo, mensaje) VALUES (?,?,?)',
      [userId, tipo, mensaje]);
    // Push SSE en tiempo real — si el usuario está conectado lo recibe al instante
    ssePush(userId, 'notificacion', { tipo, mensaje, ts: Date.now() });
  } catch(e) {}
}

function getCoachId() {
  try {
    const coach = dbGet("SELECT id FROM users WHERE role='coach' LIMIT 1");
    return coach ? coach.id : null;
  } catch(e) { return null; }
}

function getNombreCliente(clienteId) {
  try {
    const c = dbGet('SELECT u.nombre FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?', [clienteId]);
    return c ? c.nombre : 'Un cliente';
  } catch(e) { return 'Un cliente'; }
}


function ensureTrainingTrackingSchema() {
  try { dbRun("ALTER TABLE sesiones_entreno ADD COLUMN estado TEXT DEFAULT 'completado'"); } catch(e) {}
  try { dbRun("ALTER TABLE sesiones_entreno ADD COLUMN valoracion TEXT DEFAULT ''"); } catch(e) {}
  try { dbRun("ALTER TABLE series_log ADD COLUMN nota_cliente TEXT DEFAULT ''"); } catch(e) {}
}

// Mensajes de suscripción bilingues
function msgSub(lang, tipo, dias) {
  const en = lang === 'en';
  if(tipo === 'activada') return en
    ? `✅ Your subscription is active! You have full access. Let's go! 💪🔥`
    : `✅ ¡Tu suscripción está activa! Tienes acceso completo. ¡A por ello! 💪🔥`;
  if(tipo === 'activada_fecha') return (d) => en
    ? `✅ Your subscription is active until ${d}! Full access granted. Let's go! 💪🔥`
    : `✅ ¡Tu suscripción está activa hasta el ${d}! Tienes acceso completo. ¡A por ello! 💪🔥`;
  if(tipo === 'cancelada') return en
    ? `❌ Your subscription has been cancelled. Contact your coach to renew it. We’ll be here when you’re ready! 💪`
    : `❌ Tu suscripción ha sido cancelada. Si quieres renovar, contacta con tu coach. ¡Aquí seguimos cuando quieras! 💪`;
  if(tipo === 'vencida') return en
    ? `🔴 Your subscription has expired. Don’t stop training! Contact your coach to renew and get back on track. 💪`
    : `🔴 Tu suscripción ha vencido. ¡No te quedes sin entrenar! Habla con tu coach para renovarla. 💪`;
  if(tipo === 'pronto') {
    if(dias === 1) return en
      ? `⏳ Your subscription expires tomorrow! Talk to your coach today to renew and keep your momentum going. 💪`
      : `⏳ ¡Mañana vence tu suscripción! Habla hoy con tu coach para renovarla y seguir sin pausas. 💪`;
    return en
      ? `⏳ Your subscription expires in ${dias} day${dias>1?'s':''}. Renew with your coach to keep progressing! 💪`
      : `⏳ Tu suscripción vence en ${dias} día${dias>1?'s':''}. ¡Renueva con tu coach para seguir avanzando! 💪`;
  }
  return '';
}

// Chequeo automático de vencimientos (una vez al día)
let _ultimoChequeoVencimientos = null;

function chequearVencimientosAuto() {
  const hoy = new Date().toISOString().split('T')[0];
  if(_ultimoChequeoVencimientos === hoy) return;
  _ultimoChequeoVencimientos = hoy;
  try {
    const subs = dbAll(`
      SELECT s.*, c.id as cliente_id, u.id as user_id, u.lang
      FROM suscripciones s
      JOIN clientes c ON s.cliente_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE s.estado = 'activa'
    `);
    const hoyStr = new Date().toISOString().split('T')[0];
    subs.forEach(s => {
      const dias = diasRestantes(s.fecha_fin);
      if([7, 5, 3, 1].includes(dias)) {
        const yaAviso = dbGet(`SELECT id FROM notificaciones WHERE user_id=? AND tipo='vencimiento_proximo' AND DATE(created_at)=DATE('now')`, [s.user_id]);
        if(!yaAviso) {
          crearNotificacion(s.user_id, 'vencimiento_proximo', msgSub(s.lang||'es', 'pronto', dias));
        }
      }
      if(s.fecha_fin < hoyStr && s.estado === 'activa') {
        dbRun("UPDATE suscripciones SET estado='vencida' WHERE cliente_id=?", [s.cliente_id]);
        dbRun("UPDATE users SET estado='bloqueado' WHERE id=?", [s.user_id]);
        crearNotificacion(s.user_id, 'suscripcion_vencida', msgSub(s.lang||'es', 'vencida', 0));
      }
    });
    saveToDisk();
  } catch(e) { console.error('chequearVencimientosAuto error:', e.message); }
}

router.get('/clientes', coachOnly, (req, res) => {
  chequearVencimientosAuto();
  const clientes = dbAll(`SELECT c.*, u.nombre, u.username, u.foto_perfil,
    (SELECT peso FROM peso_registros WHERE cliente_id=c.id ORDER BY rowid DESC LIMIT 1) as peso_actual,
    (SELECT grasa FROM peso_registros WHERE cliente_id=c.id ORDER BY rowid DESC LIMIT 1) as grasa_actual,
    (SELECT COUNT(*) FROM fotos WHERE cliente_id=c.id) as fotos_count
    FROM clientes c JOIN users u ON c.user_id=u.id`);
  res.json(clientes);
});

router.get('/clientes/:id', (req, res) => {
  const id = req.params.id;
  if (req.user.role === 'cliente') {
    const mine = dbGet('SELECT id FROM clientes WHERE user_id=?', [req.user.id]);
    if (!mine || String(mine.id) !== String(id)) return res.status(403).json({ error: 'Sin acceso' });
  }
  const c = dbGet('SELECT c.*, u.nombre, u.username, u.foto_perfil FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?', [id]);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  const pesos = dbAll('SELECT * FROM peso_registros WHERE cliente_id=? ORDER BY rowid ASC', [id]);
  const dias = dbAll('SELECT * FROM dias_entreno WHERE cliente_id=? ORDER BY orden', [id]);
  dias.forEach(d => { d.ejercicios = dbAll('SELECT * FROM ejercicios_dia WHERE dia_id=? ORDER BY orden', [d.id]); });
  const comidas = dbAll('SELECT * FROM comidas WHERE cliente_id=? ORDER BY orden', [id]);
  const planMeta = dbGet('SELECT * FROM plan_meta WHERE cliente_id=?', [id]);
  comidas.forEach(m => { m.items = dbAll('SELECT * FROM alimentos WHERE comida_id=? ORDER BY orden', [m.id]); });
  const recetas = dbAll('SELECT * FROM recetas WHERE cliente_id=? ORDER BY orden', [id]);
  recetas.forEach(r => { r.ingredientes = dbAll('SELECT * FROM receta_ingredientes WHERE receta_id=?', [r.id]); });
  const fotos = dbAll('SELECT id, url, analysis, published_analysis, fecha, tipo FROM fotos WHERE cliente_id=? ORDER BY fecha ASC', [id]);
  res.json({
    ...c,
    pesos, dias, comidas, recetas, fotos,
    _planAlternativas: planMeta?.alternativas ? JSON.parse(planMeta.alternativas) : null,
    _planAjustes: planMeta?.ajustes ? JSON.parse(planMeta.ajustes) : null,
    _planFrase: planMeta?.frase || null,
    _planVariaciones: planMeta?.variaciones ? JSON.parse(planMeta.variaciones) : null,
    _planSuplementacion: planMeta?.suplementacion ? JSON.parse(planMeta.suplementacion) : null,
    _planAlimentosTerapeuticos: planMeta?.alimentos_therapeuticos ? JSON.parse(planMeta.alimentos_therapeuticos) : null,
    kcal_internas: planMeta?.kcal || c.kcal_internas || null,
    prot: planMeta?.prot || c.prot || null,
    carbs: planMeta?.carbs || c.carbs || null,
    fat: planMeta?.fat || c.fat || null,
  });
});

router.put('/clientes/:id', coachOnly, (req, res) => {
  const { objetivo, nivel, semanas, kcal_internas, prot, carbs, fat, comida_libre, mensaje_semana, notas_coach, peso_actual, altura, edad, sexo, actividad, cintura_actual, cadera, observaciones, dieta_tipo, alimentos_no, lesiones } = req.body;
  const c = dbGet('SELECT * FROM clientes WHERE id=?', [req.params.id]);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  dbRun(`UPDATE clientes SET objetivo=?, nivel=?, semanas=?, kcal_internas=?, prot=?, carbs=?, fat=?, comida_libre=?, mensaje_semana=?, notas_coach=?, peso_actual=?, altura=?, edad=?, sexo=?, actividad=?, cintura_actual=?, cadera=?, observaciones=?, dieta_tipo=?, alimentos_no=?, lesiones=? WHERE id=?`,
    [objetivo||c.objetivo, nivel||c.nivel, semanas||c.semanas, kcal_internas||c.kcal_internas, prot||c.prot, carbs||c.carbs, fat||c.fat, comida_libre||c.comida_libre, mensaje_semana||c.mensaje_semana, notas_coach||c.notas_coach, peso_actual!=null?peso_actual:c.peso_actual, altura||c.altura, edad||c.edad, sexo||c.sexo, actividad||c.actividad, cintura_actual!=null?cintura_actual:c.cintura_actual, cadera!=null?cadera:c.cadera, observaciones||c.observaciones, dieta_tipo||c.dieta_tipo, alimentos_no!=null?alimentos_no:c.alimentos_no, lesiones!=null?lesiones:c.lesiones, req.params.id]);
  res.json({ ok: true });
});

router.put('/clientes/:id/perfil', (req, res) => {
  const id = req.params.id;
  if (req.user.role === 'cliente') {
    const mine = dbGet('SELECT id FROM clientes WHERE user_id=?', [req.user.id]);
    if (!mine || String(mine.id) !== String(id)) return res.status(403).json({ error: 'Sin acceso' });
  }
  const { peso_actual, altura, edad, sexo, actividad, cintura_actual, cadera, observaciones, dieta_tipo, alimentos_no, lesiones, deficiencias } = req.body;
  const c = dbGet('SELECT * FROM clientes WHERE id=?', [id]);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  dbRun('UPDATE clientes SET peso_actual=?, altura=?, edad=?, sexo=?, actividad=?, cintura_actual=?, cadera=?, observaciones=?, dieta_tipo=?, alimentos_no=?, lesiones=?, deficiencias=? WHERE id=?',
    [
      peso_actual!=null ? peso_actual : c.peso_actual,
      altura || c.altura,
      edad || c.edad,
      sexo || c.sexo,
      actividad || c.actividad,
      cintura_actual!=null ? cintura_actual : c.cintura_actual,
      cadera!=null ? cadera : c.cadera,
      observaciones!=null ? observaciones : c.observaciones||'',
      dieta_tipo || c.dieta_tipo || 'Omnívoro',
      alimentos_no!=null ? alimentos_no : c.alimentos_no||'',
      lesiones!=null ? lesiones : c.lesiones||'',
      deficiencias!=null ? deficiencias : c.deficiencias||'',
      id
    ]);
  res.json({ ok: true });
});

router.post('/clientes/:id/peso', (req, res) => {
  const { peso, grasa, cintura } = req.body;
  dbRun('INSERT INTO peso_registros (cliente_id, peso, grasa, cintura) VALUES (?, ?, ?, ?)', [req.params.id, peso, grasa||null, cintura||null]);
  // Notificar al coach
  const coachId = getCoachId();
  if(coachId) {
    const nombre = getNombreCliente(req.params.id);
    const detalle = grasa ? ` · ${grasa}% grasa` : '';
    crearNotificacion(coachId, 'peso_registrado', `⚖️ ${nombre} ha registrado su peso: ${peso}kg${detalle}`);
  }
  saveToDisk();
  res.json({ ok: true });
});

router.post('/clientes/:id/dias', coachOnly, (req, res) => {
  const { nombre, grupo, orden } = req.body;
  const r = dbRun('INSERT INTO dias_entreno (cliente_id, nombre, grupo, orden) VALUES (?, ?, ?, ?)', [req.params.id, nombre, grupo, orden||0]);
  res.json({ id: r.lastInsertRowid });
});

router.delete('/dias/:id', coachOnly, (req, res) => {
  dbRun('DELETE FROM ejercicios_dia WHERE dia_id=?', [req.params.id]);
  dbRun('DELETE FROM dias_entreno WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

router.post('/dias/:id/ejercicios', coachOnly, (req, res) => {
  const { nombre, musculos, series, reps, peso_objetivo, descanso, orden, youtube_url, imagen_url, nota_coach } = req.body;
  const rir = req.body.rir!=null ? req.body.rir : null;
  const es_principal = req.body.es_principal!=null ? req.body.es_principal : 0;
  const r = dbRun('INSERT INTO ejercicios_dia (dia_id, nombre, musculos, series, reps, peso_objetivo, descanso, rir, es_principal, orden, youtube_url, imagen_url, nota_coach) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.id, nombre, musculos||'', series||3, reps||'10-12', peso_objetivo||0, descanso||90, rir, es_principal, orden||0, youtube_url||'', imagen_url||'', nota_coach||'']);
  if (youtube_url || imagen_url || nota_coach) {
    const existing = dbGet('SELECT id FROM ejercicios_config WHERE nombre=?', [nombre]);
    if (existing) {
      if (youtube_url) dbRun('UPDATE ejercicios_config SET youtube_url=? WHERE nombre=?', [youtube_url, nombre]);
      if (imagen_url) dbRun('UPDATE ejercicios_config SET imagen_url=? WHERE nombre=?', [imagen_url, nombre]);
      if (nota_coach) dbRun('UPDATE ejercicios_config SET nota_default=? WHERE nombre=?', [nota_coach, nombre]);
    } else {
      dbRun('INSERT INTO ejercicios_config (nombre, youtube_url, imagen_url, nota_default) VALUES (?,?,?,?)',
        [nombre, youtube_url||'', imagen_url||'', nota_coach||'']);
    }
  }
  res.json({ id: r.lastInsertRowid });
});

router.delete('/ejercicios-db/:id', (req, res) => {
  const e = dbGet('SELECT * FROM ejercicios_db WHERE id=?', [req.params.id]);
  if (!e) return res.status(404).json({ error: 'No encontrado' });
  dbRun('DELETE FROM ejercicios_db WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

router.get('/ejercicios/:id', (req, res) => {
  const e = dbGet('SELECT * FROM ejercicios_dia WHERE id=?', [req.params.id]);
  if (!e) return res.status(404).json({ error: 'No encontrado' });
  res.json(e);
});

router.put('/ejercicios/:id', (req, res) => {
  const e = dbGet('SELECT * FROM ejercicios_dia WHERE id=?', [req.params.id]);
  if (!e) return res.status(404).json({ error: 'No encontrado' });
  const { series, reps, peso_objetivo, descanso, es_pr, youtube_url, imagen_url, nota_coach } = req.body;
  const rir_val = 'rir' in req.body ? req.body.rir : e.rir;
  const esp_val = req.body.es_principal!=null ? req.body.es_principal : (e.es_principal||0);
  dbRun('UPDATE ejercicios_dia SET series=?, reps=?, peso_objetivo=?, descanso=?, rir=?, es_principal=?, es_pr=?, youtube_url=?, imagen_url=?, nota_coach=? WHERE id=?',
    [series||e.series, reps||e.reps, peso_objetivo!=null?peso_objetivo:e.peso_objetivo, descanso||e.descanso, rir_val, esp_val, es_pr!=null?es_pr:e.es_pr, youtube_url!=null?youtube_url:e.youtube_url||'', imagen_url!=null?imagen_url:e.imagen_url||'', nota_coach!=null?nota_coach:e.nota_coach||'', req.params.id]);
  res.json({ ok: true });
});

router.delete('/ejercicios/:id', coachOnly, (req, res) => {
  dbRun('DELETE FROM ejercicios_dia WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

router.post('/clientes/:id/comidas', coachOnly, (req, res) => {
  const { nombre, orden } = req.body;
  const r = dbRun('INSERT INTO comidas (cliente_id, nombre, orden) VALUES (?, ?, ?)', [req.params.id, nombre, orden||0]);
  res.json({ id: r.lastInsertRowid });
});

router.post('/comidas/:id/alimentos', coachOnly, (req, res) => {
  const { nombre, gramos, orden } = req.body;
  const r = dbRun('INSERT INTO alimentos (comida_id, nombre, gramos, orden) VALUES (?, ?, ?, ?)', [req.params.id, nombre, gramos, orden||0]);
  res.json({ id: r.lastInsertRowid });
});

router.put('/alimentos/:id', coachOnly, (req, res) => {
  const a = dbGet('SELECT * FROM alimentos WHERE id=?', [req.params.id]);
  if (!a) return res.status(404).json({ error: 'No encontrado' });
  dbRun('UPDATE alimentos SET nombre=?, gramos=? WHERE id=?', [req.body.nombre||a.nombre, req.body.gramos||a.gramos, req.params.id]);
  res.json({ ok: true });
});

router.delete('/alimentos/:id', coachOnly, (req, res) => {
  dbRun('DELETE FROM alimentos WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

router.post('/clientes/:id/recetas', coachOnly, (req, res) => {
  const { nombre, pasos, ingredientes } = req.body;
  const r = dbRun('INSERT INTO recetas (cliente_id, nombre, pasos) VALUES (?, ?, ?)', [req.params.id, nombre, pasos||'']);
  if (ingredientes) ingredientes.forEach(ing => dbRun('INSERT INTO receta_ingredientes (receta_id, nombre, gramos) VALUES (?, ?, ?)', [r.lastInsertRowid, ing.nombre, ing.gramos]));
  res.json({ id: r.lastInsertRowid });
});

router.post('/clientes/:id/fotos', (req, res) => {
  const { url, analysis, tipo } = req.body;
  // url is full base64 image — store completely
  const r = dbRun('INSERT INTO fotos (cliente_id, url, analysis, tipo) VALUES (?, ?, ?, ?)',
    [req.params.id, url||'', analysis||'', tipo||'frente']);
  // Notificar al coach
  const coachId = getCoachId();
  if(coachId) {
    const nombre = getNombreCliente(req.params.id);
    const tipoLabel = tipo === 'espalda' ? 'espalda' : tipo === 'lado' ? 'lateral' : 'frontal';
    crearNotificacion(coachId, 'foto_subida', `📸 ${nombre} ha subido una foto de progreso (${tipoLabel})`);
  }
  saveToDisk();
  res.json({ id: r.lastInsertRowid });
});

// DELETE foto
router.delete('/fotos/:id', (req, res) => {
  dbRun('DELETE FROM fotos WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// Update foto analysis
router.put('/fotos/:id/analysis', (req, res) => {
  dbRun('UPDATE fotos SET analysis=? WHERE id=?', [req.body.analysis, req.params.id]);
  res.json({ ok: true });
});

// Publish analysis to client (saves as coach message, no IA mention)
router.post('/fotos/:id/publicar', coachOnly, (req, res) => {
  const { texto } = req.body;
  dbRun('UPDATE fotos SET published_analysis=? WHERE id=?', [texto, req.params.id]);
  res.json({ ok: true });
});

router.post('/ia/chat', async (req, res) => {
  const { messages, system } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada en Railway Variables' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 4000, system, messages })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.json({ reply: data.content[0].text });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/ia/foto', async (req, res) => {
  const { imageBase64, mediaType, system } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 800, system, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } }, { type: 'text', text: 'Valora el progreso fisico.' }] }] })
    });
    const data = await response.json();
    res.json({ reply: data.content[0].text });
  } catch(e) { res.status(500).json({ error: 'Error IA foto' }); }
});

// ── COMPARAR DOS SEMANAS DE FOTOS (Coach → IA → Mensaje editable) ──────────
router.post('/ia/comparar-fotos', coachOnly, async (req, res) => {
  const { fotosAntes, fotosDespues, clienteNombre, objetivo, nivel, semanaAntes, semanaDespues, lang } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });

  try {
    const isEn = lang === 'en';
    const content = [];

    // Añadir fotos "antes"
    const labelAntes = isEn ? `Week ${semanaAntes} (BEFORE):` : `Semana ${semanaAntes} (ANTES):`;
    content.push({ type: 'text', text: labelAntes });
    for (const f of (fotosAntes || [])) {
      if (f.b64 && f.mt) {
        content.push({ type: 'image', source: { type: 'base64', media_type: f.mt, data: f.b64 } });
      }
    }

    // Añadir fotos "después"
    const labelDespues = isEn ? `Week ${semanaDespues} (NOW):` : `Semana ${semanaDespues} (AHORA):`;
    content.push({ type: 'text', text: labelDespues });
    for (const f of (fotosDespues || [])) {
      if (f.b64 && f.mt) {
        content.push({ type: 'image', source: { type: 'base64', media_type: f.mt, data: f.b64 } });
      }
    }

    const instruccion = isEn
      ? `Compare the BEFORE and NOW photos of ${clienteNombre} (Goal: ${objetivo}, Level: ${nivel}). Write a motivational coach message (4-6 sentences) that: 1) highlights 2-3 specific visible improvements, 2) celebrates a clear strong point, 3) honestly points out 1-2 areas to keep working on, 4) ends with a motivating push. Tone: direct, warm, like a real coach who knows them. No mention of AI or technology. Write in plain text, no markdown, no asterisks.`
      : `Compara las fotos ANTES y AHORA de ${clienteNombre} (Objetivo: ${objetivo}, Nivel: ${nivel}). Escribe un mensaje motivacional de coach (4-6 frases) que: 1) destaque 2-3 mejoras visibles y concretas, 2) celebre un punto fuerte claro, 3) señale honestamente 1-2 áreas a seguir trabajando, 4) termine con un empuje motivador. Tono: directo, cercano, como un coach real que lo conoce. Sin mencionar IA ni tecnología. Texto plano, sin markdown, sin asteriscos.`;

    content.push({ type: 'text', text: instruccion });

    const system = isEn
      ? 'You are an expert WolfMindset fitness coach. You analyze client progress photos with a trained, motivating eye. You write personalized messages that make clients feel seen and motivated. Never mention AI or technology.'
      : 'Eres un coach de fitness experto de WolfMindset. Analizas fotos de progreso con ojo entrenado y motivador. Escribes mensajes personalizados que hacen que el cliente se sienta visto y motivado. Nunca menciones IA ni tecnología.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 600, system, messages: [{ role: 'user', content }] })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.json({ reply: data.content[0].text });
  } catch(e) {
    res.status(500).json({ error: e.message || 'Error comparando fotos' });
  }
});

// ── EJERCICIOS CONFIG ──────────────────────────────────────────────
router.get('/ejercicios-config', coachOnly, (req, res) => {
  const configs = dbAll('SELECT * FROM ejercicios_config', []);
  const map = {};
  configs.forEach(c => { map[c.nombre] = { youtube_url: c.youtube_url, imagen_url: c.imagen_url, nota_default: c.nota_default }; });
  res.json(map);
});

router.put('/ejercicios-config/:nombre', coachOnly, (req, res) => {
  const nombre = decodeURIComponent(req.params.nombre);
  const { youtube_url, imagen_url, nota_default } = req.body;
  const existing = dbGet('SELECT id FROM ejercicios_config WHERE nombre=?', [nombre]);
  if (existing) {
    dbRun('UPDATE ejercicios_config SET youtube_url=?, imagen_url=?, nota_default=? WHERE nombre=?',
      [youtube_url||'', imagen_url||'', nota_default||'', nombre]);
  } else {
    dbRun('INSERT INTO ejercicios_config (nombre, youtube_url, imagen_url, nota_default) VALUES (?,?,?,?)',
      [nombre, youtube_url||'', imagen_url||'', nota_default||'']);
  }
  res.json({ ok: true });
});

// ── BASE DE DATOS EJERCICIOS Y ALIMENTOS ──────────────────────────
router.get('/ejercicios-db', (req, res) => {
  const { grupo, buscar } = req.query;
  let sql = 'SELECT * FROM ejercicios_db WHERE 1=1';
  const params = [];
  if (grupo && grupo !== 'Todos' && grupo !== 'All') { sql += ' AND grupo=?'; params.push(grupo); }
  if (buscar) { sql += ' AND (nombre LIKE ? OR musculos LIKE ?)'; params.push('%'+buscar+'%','%'+buscar+'%'); }
  sql += ' ORDER BY nombre';
  res.json(dbAll(sql, params));
});

router.get('/alimentos-db', (req, res) => {
  const { categoria, buscar } = req.query;
  let sql = 'SELECT * FROM alimentos_db WHERE 1=1';
  const params = [];
  if (categoria && categoria !== 'Todos') { sql += ' AND categoria=?'; params.push(categoria); }
  if (buscar) { sql += ' AND nombre LIKE ?'; params.push('%'+buscar+'%'); }
  sql += ' ORDER BY categoria, nombre';
  res.json(dbAll(sql, params));
});

// ── CLIENTES PENDIENTES ────────────────────────────────────────────
router.get('/clientes-pendientes', coachOnly, (req, res) => {
  const pendientes = dbAll(`SELECT u.id, u.nombre, u.email, u.username, u.estado, u.telefono,
    c.id as cliente_id, c.objetivo, c.nivel, c.peso_actual, c.altura, c.edad, c.sexo, c.actividad, c.observaciones, c.dieta_tipo, c.alimentos_no, c.lesiones
    FROM users u JOIN clientes c ON c.user_id = u.id
    WHERE u.estado = 'pendiente' ORDER BY u.rowid DESC`);
  res.json(pendientes);
});

router.put('/usuarios/:id/aprobar', coachOnly, (req, res) => {
  dbRun("UPDATE users SET estado = 'activo' WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

router.put('/usuarios/:id/rechazar', coachOnly, (req, res) => {
  const user = dbGet('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'No encontrado' });
  dbRun('DELETE FROM clientes WHERE user_id = ?', [req.params.id]);
  dbRun('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ── RELOAD EXERCISE DATABASE ───────────────────────────────────────
router.post('/reload-ejercicios', (req, res) => {
  try {
    dbRun('DELETE FROM ejercicios_db', []);
    dbRun('DELETE FROM alimentos_db', []);
    const { EJERCICIOS, ALIMENTOS } = require('./seed');
    EJERCICIOS.forEach(e => dbRun('INSERT INTO ejercicios_db (grupo,nombre,musculos,tipo,dificultad,equipo) VALUES (?,?,?,?,?,?)',
      [e.grupo,e.nombre,e.musculos,e.tipo,e.dificultad,e.equipo]));
    ALIMENTOS.forEach(a => dbRun('INSERT INTO alimentos_db (categoria,nombre,calorias,proteinas,carbos,grasas) VALUES (?,?,?,?,?,?)',
      [a.categoria,a.nombre,a.calorias,a.proteinas,a.carbos,a.grasas]));
    const { saveToDisk } = require('./database');
    saveToDisk();
    res.json({ ok: true, ejercicios: EJERCICIOS.length, alimentos: ALIMENTOS.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── CREAR EJERCICIO MANUAL ─────────────────────────────────────────
router.post('/ejercicios-db-add', coachOnly, (req, res) => {
  const { nombre, grupo, musculos, tipo, dificultad, equipo } = req.body;
  if(!nombre || !grupo) return res.status(400).json({ error: 'Nombre y grupo obligatorios' });
  const existing = dbGet('SELECT id FROM ejercicios_db WHERE nombre=?', [nombre]);
  if(existing) return res.status(400).json({ error: 'Ya existe' });
  const r = dbRun('INSERT INTO ejercicios_db (grupo,nombre,musculos,tipo,dificultad,equipo) VALUES (?,?,?,?,?,?)',
    [grupo, nombre, musculos||'', tipo||'Fuerza', dificultad||'Intermedio', equipo||'']);
  const { saveToDisk } = require('./database');
  saveToDisk();
  res.json({ ok: true, id: r.lastInsertRowid });
});

// ── SESIONES ENTRENO ───────────────────────────────────────────────
// Migración defensiva: añadir columnas si no existen
try { dbRun("ALTER TABLE sesiones_entreno ADD COLUMN estado TEXT DEFAULT 'completado'"); } catch(e) {}
try { dbRun("ALTER TABLE series_log ADD COLUMN nota_cliente TEXT DEFAULT ''"); } catch(e) {}

router.post('/clientes/:id/sesiones', (req, res) => {
  try {
    ensureTrainingTrackingSchema();
    const { dia_nombre, dia_grupo, duracion_min, series, estado } = req.body;
    const estadoFinal = estado || 'completado';
    const r = dbRun(
      'INSERT INTO sesiones_entreno (cliente_id, dia_nombre, dia_grupo, duracion_min, estado) VALUES (?,?,?,?,?)',
      [req.params.id, dia_nombre, dia_grupo, duracion_min||0, estadoFinal]
    );
    const sesionId = r.lastInsertRowid;
    if(series && series.length) {
      series.forEach(s => {
        try {
          dbRun(
            'INSERT INTO series_log (sesion_id, ejercicio_nombre, serie_num, peso_real, reps_real, rir, nota_cliente) VALUES (?,?,?,?,?,?,?)',
            [sesionId, s.ejercicio, s.serie_num, s.peso, s.reps, s.rir!=null?s.rir:null, s.nota_cliente||'']
          );
        } catch(e2) {
          // Fallback sin nota_cliente por si la columna no existe aún
          dbRun(
            'INSERT INTO series_log (sesion_id, ejercicio_nombre, serie_num, peso_real, reps_real, rir) VALUES (?,?,?,?,?,?)',
            [sesionId, s.ejercicio, s.serie_num, s.peso, s.reps, s.rir!=null?s.rir:null]
          );
        }
      });
    }

    // ── Notificar al coach ──────────────────────────────────────────
    const coachId = getCoachId();
    if(coachId) {
      const nombre = getNombreCliente(req.params.id);
      const durStr = duracion_min ? ` (${duracion_min} min)` : '';
      const diaStr = dia_nombre || 'entreno';

      // Notificación de sesión completada
      crearNotificacion(coachId, 'sesion_completada',
        `💪 ${nombre} ha terminado: ${diaStr}${durStr}`);

      // Notificaciones adicionales por notas/sensaciones con texto
      if(series && series.length) {
        const notasConTexto = series.filter(s => s.nota_cliente && s.nota_cliente.trim() !== '');
        notasConTexto.forEach(s => {
          crearNotificacion(coachId, 'nota_cliente',
            `💬 ${nombre} — ${s.ejercicio}: "${s.nota_cliente.trim()}"`);
        });
      }
    }

    saveToDisk();
    res.json({ ok: true, sesion_id: sesionId });
  } catch(e) {
    console.error('Error guardando sesión:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/clientes/:id/sesiones', (req, res) => {
  ensureTrainingTrackingSchema();
  const id = req.params.id;
  if (req.user.role === 'cliente') {
    const mine = dbGet('SELECT id FROM clientes WHERE user_id=?', [req.user.id]);
    if (!mine || String(mine.id) !== String(id)) return res.status(403).json({ error: 'Sin acceso' });
  }
  try {
    const sesiones = dbAll(
      'SELECT * FROM sesiones_entreno WHERE cliente_id=? ORDER BY fecha DESC LIMIT 30',
      [id]
    );
    sesiones.forEach(s => {
      if(!s.estado) s.estado = 'completado'; // fallback si columna no existe
      try {
        s.series = dbAll('SELECT * FROM series_log WHERE sesion_id=? ORDER BY ejercicio_nombre, serie_num', [s.id]);
        s.series.forEach(sr => { if(!sr.nota_cliente) sr.nota_cliente = ''; });
      } catch(e) { s.series = []; }
    });
    res.json(sesiones);
  } catch(e) {
    res.json([]);
  }
});

router.get('/clientes/:id/progreso-ejercicio', (req, res) => {
  ensureTrainingTrackingSchema();
  const id = req.params.id;
  if (req.user.role === 'cliente') {
    const mine = dbGet('SELECT id FROM clientes WHERE user_id=?', [req.user.id]);
    if (!mine || String(mine.id) !== String(id)) return res.status(403).json({ error: 'Sin acceso' });
  }
  const { ejercicio } = req.query;
  if(!ejercicio) return res.json([]);
  const data = dbAll(`
    SELECT sl.ejercicio_nombre, sl.peso_real, sl.reps_real, sl.serie_num, se.fecha, se.dia_nombre
    FROM series_log sl
    JOIN sesiones_entreno se ON sl.sesion_id = se.id
    WHERE se.cliente_id=? AND sl.ejercicio_nombre=?
    ORDER BY se.fecha ASC
  `, [id, ejercicio]);
  res.json(data);
});

// ── REGISTRO PÚBLICO ───────────────────────────────────────────────
router.post('/auth/registro', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { username, password, nombre, email, telefono, objetivo, nivel, peso_actual, altura, edad, sexo, actividad, dieta_tipo, alimentos_no, lesiones, observaciones } = req.body;
    if(!username || !password || !nombre) return res.status(400).json({ error: 'Faltan campos obligatorios' });
    const existing = dbGet('SELECT id FROM users WHERE username=?', [username]);
    if(existing) return res.status(400).json({ error: 'Usuario ya existe' });
    const hash = bcrypt.hashSync(password, 10);
    const userR = dbRun("INSERT INTO users (username, password, role, nombre, email, estado, telefono) VALUES (?,?,?,?,?,?,?)",
      [username, hash, 'cliente', nombre, email||'', 'pendiente', telefono||'']);
    const userId = userR.lastInsertRowid;
    dbRun(`INSERT INTO clientes (user_id, objetivo, nivel, peso_actual, altura, edad, sexo, actividad, dieta_tipo, alimentos_no, lesiones, observaciones) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [userId, objetivo||'Volumen', nivel||'Intermedio', peso_actual||0, altura||0, edad||0, sexo||'Hombre', actividad||'Moderada', dieta_tipo||'Omnivoro', alimentos_no||'', lesiones||'', observaciones||'']);
    const { saveToDisk } = require('./database');
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});


// ═══ BORRADORES DE SEMANA ═══════════════════════════════

// GET borrador de un cliente
router.get('/clientes/:id/borrador', (req, res) => {
  const borradores = dbAll(
    'SELECT b.*, e.nombre, e.musculos, e.grupo FROM semana_borrador b JOIN ejercicios_dia e ON b.ejercicio_id=e.id WHERE b.cliente_id=?',
    [req.params.id]
  );
  const estado = dbGet('SELECT * FROM semana_estado WHERE cliente_id=?', [req.params.id]);
  res.json({ borradores, tiene_borrador: estado?.tiene_borrador || 0 });
});

// POST guardar borrador (coach guarda sin publicar)
router.post('/clientes/:id/borrador', (req, res) => {
  const { ejercicios } = req.body; // array de {ejercicio_id, series, reps, peso_objetivo, descanso, nota_coach, rir}
  ejercicios.forEach(e => {
    dbRun(`INSERT OR REPLACE INTO semana_borrador 
      (cliente_id, ejercicio_id, series, reps, peso_objetivo, descanso, nota_coach, rir)
      VALUES (?,?,?,?,?,?,?,?)`,
      [req.params.id, e.ejercicio_id, e.series, e.reps, e.peso_objetivo, e.descanso, e.nota_coach||'', e.rir!=null?e.rir:null]
    );
  });
  dbRun('INSERT OR REPLACE INTO semana_estado (cliente_id, tiene_borrador) VALUES (?,1)', [req.params.id]);
  res.json({ ok: true });
});

// POST publicar borrador → aplica cambios a ejercicios reales
router.post('/clientes/:id/borrador/publicar', (req, res) => {
  const borradores = dbAll('SELECT * FROM semana_borrador WHERE cliente_id=?', [req.params.id]);
  borradores.forEach(b => {
    dbRun(`UPDATE ejercicios_dia SET series=?, reps=?, peso_objetivo=?, descanso=?, nota_coach=?, rir=? WHERE id=?`,
      [b.series, b.reps, b.peso_objetivo, b.descanso, b.nota_coach||'', b.rir, b.ejercicio_id]
    );
  });
  dbRun('DELETE FROM semana_borrador WHERE cliente_id=?', [req.params.id]);
  dbRun('INSERT OR REPLACE INTO semana_estado (cliente_id, tiene_borrador, publicado_at) VALUES (?,0,CURRENT_TIMESTAMP)', [req.params.id]);
  res.json({ ok: true, publicados: borradores.length });
});

// DELETE borrador (descartar cambios)
router.delete('/clientes/:id/borrador', (req, res) => {
  dbRun('DELETE FROM semana_borrador WHERE cliente_id=?', [req.params.id]);
  dbRun('INSERT OR REPLACE INTO semana_estado (cliente_id, tiene_borrador) VALUES (?,0)', [req.params.id]);
  res.json({ ok: true });
});

// GET check if client has pending borrador (for client view)
router.get('/clientes/:id/semana-estado', (req, res) => {
  const estado = dbGet('SELECT * FROM semana_estado WHERE cliente_id=?', [req.params.id]);
  res.json({ tiene_borrador: estado?.tiene_borrador || 0 });
});



// ── BORRAR COMIDA COMPLETA ─────────────────────────────────────────
router.delete('/comidas/:id', coachOnly, (req, res) => {
  try {
    dbRun('DELETE FROM alimentos WHERE comida_id=?', [req.params.id]);
    dbRun('DELETE FROM comidas WHERE id=?', [req.params.id]);
    const { saveToDisk } = require('./database');
    saveToDisk();
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PUBLICAR DIETA COMPLETA AL PERFIL DEL CLIENTE ──────────────────
router.post('/clientes/:id/dieta/publicar', coachOnly, (req, res) => {
  try {
    const clienteId = req.params.id;
    const { plan } = req.body;
    if (!plan || !Array.isArray(plan.comidas)) {
      return res.status(400).json({ error: 'Plan de dieta inválido' });
    }

    const comidasAntiguas = dbAll('SELECT id FROM comidas WHERE cliente_id=?', [clienteId]);
    comidasAntiguas.forEach(c => {
      dbRun('DELETE FROM alimentos WHERE comida_id=?', [c.id]);
    });
    dbRun('DELETE FROM comidas WHERE cliente_id=?', [clienteId]);

    plan.comidas.forEach((comida, index) => {
      const nombreComida = comida.nombre || `Comida ${index + 1}`;
      const orden = comida.numero || index + 1;
      const r = dbRun(
        'INSERT INTO comidas (cliente_id, nombre, orden) VALUES (?, ?, ?)',
        [clienteId, `${orden}. ${nombreComida}`, orden]
      );

      const comidaId = r.lastInsertRowid;
      const alimentos = Array.isArray(comida.alimentos) ? comida.alimentos : [];

      alimentos.forEach((alim, ai) => {
        const nombre = alim.nombre || 'Alimento';
        const cantidad = String(alim.cantidad || alim.gramos || '100');
        const gramos = parseInt(cantidad.replace(',', '.')) || Number(alim.gramos) || 100;
        const detalle = alim.detalle ? ` (${alim.detalle})` : '';

        dbRun(
          'INSERT INTO alimentos (comida_id, nombre, gramos, orden) VALUES (?, ?, ?, ?)',
          [comidaId, `${nombre}${detalle}`, gramos, ai]
        );
      });
    });

    const variacionesPorComida = {};
    plan.comidas.forEach((comida, i) => {
      if (Array.isArray(comida.variaciones) && comida.variaciones.length) {
        variacionesPorComida[i] = comida.variaciones;
      }
    });

    dbRun(`INSERT OR REPLACE INTO plan_meta 
      (cliente_id, alternativas, ajustes, frase, kcal, prot, carbs, grasas, variaciones, suplementacion, alimentos_therapeuticos)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        clienteId,
        JSON.stringify(plan.alternativas || null),
        JSON.stringify(plan.ajustes || null),
        plan.frase_motivadora || null,
        plan.kcal_total || null,
        plan.prot_total || null,
        plan.carbs_total || null,
        plan.grasas_total || null,
        JSON.stringify(Object.keys(variacionesPorComida).length ? variacionesPorComida : null),
        JSON.stringify(plan.suplementacion || null),
        JSON.stringify(plan.alimentos_therapeuticos || null)
      ]
    );

    const { saveToDisk } = require('./database');
    saveToDisk();

    res.json({ ok: true, comidas: plan.comidas.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/clientes/:id/plan-meta', coachOnly, (req, res) => {
  const { alternativas, ajustes, frase, kcal, prot, carbs, grasas, variaciones, suplementacion, alimentos_therapeuticos } = req.body;
  dbRun(`INSERT OR REPLACE INTO plan_meta (cliente_id, alternativas, ajustes, frase, kcal, prot, carbs, grasas, variaciones, suplementacion, alimentos_therapeuticos)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [req.params.id, JSON.stringify(alternativas), JSON.stringify(ajustes), frase, kcal, prot, carbs, grasas, JSON.stringify(variaciones), JSON.stringify(suplementacion), JSON.stringify(alimentos_therapeuticos)]
  );
  res.json({ ok: true });
});


// ═══════════════════════════════════════════════════════════════════
// ═══ SUSCRIPCIONES ═════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════

// Helper: calcular días restantes
function diasRestantes(fecha_fin) {
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const fin = new Date(fecha_fin);
  fin.setHours(0,0,0,0);
  return Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
}

// GET todas las suscripciones (coach)
router.get('/suscripciones', coachOnly, (req, res) => {
  const subs = dbAll(`
    SELECT s.*, c.id as cliente_id, u.nombre, u.email, u.id as user_id
    FROM suscripciones s
    JOIN clientes c ON s.cliente_id = c.id
    JOIN users u ON c.user_id = u.id
    ORDER BY s.fecha_fin ASC
  `);
  const hoy = new Date().toISOString().split('T')[0];
  const resultado = subs.map(s => ({
    ...s,
    dias_restantes: diasRestantes(s.fecha_fin),
    vencida: s.fecha_fin < hoy,
    proxima_a_vencer: diasRestantes(s.fecha_fin) <= 5 && diasRestantes(s.fecha_fin) > 0
  }));
  res.json(resultado);
});

// GET suscripción de un cliente específico
router.get('/clientes/:id/suscripcion', (req, res) => {
  const id = req.params.id;
  if(req.user.role === 'cliente') {
    const mine = dbGet('SELECT id FROM clientes WHERE user_id=?', [req.user.id]);
    if(!mine || String(mine.id) !== String(id)) return res.status(403).json({ error: 'Sin acceso' });
  }
  try {
    // Crear tabla si no existe (por si el server no se reinició con el nuevo database.js)
    dbRun(`CREATE TABLE IF NOT EXISTS suscripciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER UNIQUE NOT NULL,
      estado TEXT DEFAULT 'activa',
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      precio REAL DEFAULT 0,
      notas TEXT DEFAULT '',
      renovado_at TEXT
    )`);
    dbRun(`CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      leida INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);
    const s = dbGet('SELECT * FROM suscripciones WHERE cliente_id=?', [id]);
    if(!s) return res.json({ activa: false, dias_restantes: 0 });
    const dias = diasRestantes(s.fecha_fin);
    const hoy = new Date().toISOString().split('T')[0];
    res.json({
      ...s,
      dias_restantes: dias,
      activa: s.estado === 'activa' && s.fecha_fin >= hoy,
      proxima_a_vencer: dias <= 5 && dias > 0,
      vencida: s.fecha_fin < hoy
    });
  } catch(e) {
    console.error('Error suscripcion GET:', e.message);
    res.json({ activa: false, dias_restantes: 0 });
  }
});

// POST crear/renovar suscripción (coach)
router.post('/clientes/:id/suscripcion', coachOnly, (req, res) => {
  try {
    const clienteId = req.params.id;
    const { meses = 1, precio = 0, notas = '' } = req.body;

    // Garantizar tabla existe
    dbRun(`CREATE TABLE IF NOT EXISTS suscripciones (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER UNIQUE NOT NULL, estado TEXT DEFAULT 'activa', fecha_inicio TEXT NOT NULL, fecha_fin TEXT NOT NULL, precio REAL DEFAULT 0, notas TEXT DEFAULT '', renovado_at TEXT)`);
    dbRun(`CREATE TABLE IF NOT EXISTS notificaciones (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, tipo TEXT NOT NULL, mensaje TEXT NOT NULL, leida INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);

    const c = dbGet('SELECT c.id, u.id as user_id, u.nombre, u.lang FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?', [clienteId]);
    if(!c) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Calcular fechas
    const hoy = new Date();
    const fechaInicio = hoy.toISOString().split('T')[0];
    const fechaFin = new Date(hoy);
    fechaFin.setMonth(fechaFin.getMonth() + parseInt(meses));
    const fechaFinStr = fechaFin.toISOString().split('T')[0];

    // Crear o renovar
    const existing = dbGet('SELECT id FROM suscripciones WHERE cliente_id=?', [clienteId]);
    if(existing) {
      dbRun(`UPDATE suscripciones SET estado='activa', fecha_inicio=?, fecha_fin=?, precio=?, notas=?, renovado_at=CURRENT_TIMESTAMP WHERE cliente_id=?`,
        [fechaInicio, fechaFinStr, precio, notas, clienteId]);
    } else {
      dbRun(`INSERT INTO suscripciones (cliente_id, estado, fecha_inicio, fecha_fin, precio, notas) VALUES (?,?,?,?,?,?)`,
        [clienteId, 'activa', fechaInicio, fechaFinStr, precio, notas]);
    }

    // Activar usuario si estaba bloqueado
    dbRun("UPDATE users SET estado='activo' WHERE id=?", [c.user_id]);

    // Notificar al cliente
    crearNotificacion(c.user_id, 'suscripcion_renovada',
      msgSub(c.lang||'es', 'activada_fecha', 0)(fechaFinStr.split('-').reverse().join('/')));

    saveToDisk();
    res.json({ ok: true, fecha_fin: fechaFinStr });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT cancelar/suspender suscripción (coach)
router.put('/clientes/:id/suscripcion/cancelar', coachOnly, (req, res) => {
  try {
    const clienteId = req.params.id;
    const c = dbGet('SELECT c.id, u.id as user_id, u.nombre, u.lang FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?', [clienteId]);
    if(!c) return res.status(404).json({ error: 'Cliente no encontrado' });

    dbRun("UPDATE suscripciones SET estado='cancelada' WHERE cliente_id=?", [clienteId]);
    dbRun("UPDATE users SET estado='bloqueado' WHERE id=?", [c.user_id]);

    crearNotificacion(c.user_id, 'suscripcion_cancelada',
      msgSub(c.lang||'es', 'cancelada', 0));

    saveToDisk();
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// POST enviar avisos de vencimiento próximo (coach lanza manualmente o cron)
router.post('/suscripciones/avisar-vencimientos', coachOnly, (req, res) => {
  try {
    const subs = dbAll(`
      SELECT s.*, c.id as cliente_id, u.id as user_id, u.nombre, u.lang
      FROM suscripciones s
      JOIN clientes c ON s.cliente_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE s.estado = 'activa'
    `);

    let avisados = 0;
    const hoy = new Date().toISOString().split('T')[0];

    subs.forEach(s => {
      const dias = diasRestantes(s.fecha_fin);

      // Avisar si quedan 5, 3 o 1 días
      if([5, 3, 1].includes(dias)) {
        // Al cliente
        const yaAviso = dbGet(`SELECT id FROM notificaciones WHERE user_id=? AND tipo='vencimiento_proximo' AND DATE(created_at)=DATE('now')`, [s.user_id]);
        if(!yaAviso) {
          crearNotificacion(s.user_id, 'vencimiento_proximo',
            msgSub(s.lang||'es', 'pronto', dias));
          avisados++;
        }
      }

      // Bloquear si ya venció
      if(s.fecha_fin < hoy && s.estado === 'activa') {
        dbRun("UPDATE suscripciones SET estado='vencida' WHERE cliente_id=?", [s.cliente_id]);
        dbRun("UPDATE users SET estado='bloqueado' WHERE id=?", [s.user_id]);
        crearNotificacion(s.user_id, 'suscripcion_vencida',
          msgSub(s.lang||'es', 'vencida', 0));
      }
    });

    saveToDisk();
    res.json({ ok: true, avisados });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// GET notificaciones del usuario logueado
router.get('/notificaciones', (req, res) => {
  const notifs = dbAll(`SELECT * FROM notificaciones WHERE user_id=? ORDER BY created_at DESC LIMIT 20`, [req.user.id]);
  res.json(notifs);
});

// PUT marcar notificación como leída
router.put('/notificaciones/:id/leer', (req, res) => {
  dbRun('UPDATE notificaciones SET leida=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ ok: true });
});

// PUT marcar todas como leídas
router.put('/notificaciones/leer-todas', (req, res) => {
  dbRun('UPDATE notificaciones SET leida=1 WHERE user_id=?', [req.user.id]);
  res.json({ ok: true });
});

// GET resumen para el coach — quién vence pronto o ya venció
router.get('/suscripciones/alertas', coachOnly, (req, res) => {
  const hoy = new Date().toISOString().split('T')[0];
  const en5dias = new Date();
  en5dias.setDate(en5dias.getDate() + 5);
  const en5diasStr = en5dias.toISOString().split('T')[0];

  const proximas = dbAll(`
    SELECT s.*, u.nombre, u.email, c.id as cliente_id
    FROM suscripciones s
    JOIN clientes c ON s.cliente_id=c.id
    JOIN users u ON c.user_id=u.id
    WHERE s.estado='activa' AND s.fecha_fin <= ? AND s.fecha_fin >= ?
    ORDER BY s.fecha_fin ASC
  `, [en5diasStr, hoy]);

  const vencidas = dbAll(`
    SELECT s.*, u.nombre, u.email, c.id as cliente_id
    FROM suscripciones s
    JOIN clientes c ON s.cliente_id=c.id
    JOIN users u ON c.user_id=u.id
    WHERE s.fecha_fin < ? OR s.estado IN ('vencida','cancelada')
    ORDER BY s.fecha_fin DESC
  `, [hoy]);

  res.json({
    proximas_a_vencer: proximas.map(s => ({...s, dias_restantes: diasRestantes(s.fecha_fin)})),
    vencidas
  });
});

// POST valoración de sesión del cliente
// ── CHECK-IN SEMANAL ──────────────────────────────────────────────
router.post('/clientes/:id/checkin', (req, res) => {
  try {
    const { sueno, energia, peso, semana } = req.body;
    try { dbRun(`CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, semana TEXT, sueno INTEGER, energia INTEGER, peso REAL, fecha DATETIME DEFAULT CURRENT_TIMESTAMP)`); } catch(e){}
    try { dbRun("ALTER TABLE checkins ADD COLUMN peso REAL"); } catch(e){}
    // Upsert por semana
    const existing = dbGet('SELECT id FROM checkins WHERE cliente_id=? AND semana=?', [req.params.id, semana]);
    if(existing) {
      dbRun('UPDATE checkins SET sueno=?, energia=?, peso=? WHERE id=?', [sueno, energia, peso||0, existing.id]);
    } else {
      dbRun('INSERT INTO checkins (cliente_id, semana, sueno, energia, peso) VALUES (?,?,?,?,?)', [req.params.id, semana, sueno, energia, peso||0]);
    }

    // Notificar al coach sobre estado de ánimo / energía / sueño
    const coachId = getCoachId();
    if(coachId) {
      const nombre = getNombreCliente(req.params.id);
      const detalles = [];
      if(sueno != null && sueno !== '') detalles.push(`sueño ${sueno}/10`);
      if(energia != null && energia !== '') detalles.push(`energía ${energia}/10`);
      if(peso != null && peso !== '') detalles.push(`peso ${peso}kg`);
      const semanaTxt = semana ? ` (${semana})` : '';
      const resumen = detalles.length ? detalles.join(' · ') : 'ha enviado su check-in';
      crearNotificacion(coachId, 'checkin_cliente', `🧠 ${nombre} ha enviado check-in${semanaTxt}: ${resumen}`);
    }

    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false }); }
});

router.get('/clientes/:id/checkins', (req, res) => {
  try {
    try { dbRun(`CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, semana TEXT, sueno INTEGER, energia INTEGER, peso REAL, fecha DATETIME DEFAULT CURRENT_TIMESTAMP)`); } catch(e){}
    const checkins = dbAll('SELECT * FROM checkins WHERE cliente_id=? ORDER BY fecha DESC LIMIT 8', [req.params.id]);
    res.json(checkins);
  } catch(e) { res.json([]); }
});

router.post('/clientes/:id/valoracion-sesion', (req, res) => {
  try {
    ensureTrainingTrackingSchema();
    const { valoracion } = req.body;
    // Actualizar la sesión más reciente del cliente con la valoración
    const ultima = dbGet(
      'SELECT id FROM sesiones_entreno WHERE cliente_id=? ORDER BY fecha DESC LIMIT 1',
      [req.params.id]
    );
    if(ultima) {
      try { dbRun("ALTER TABLE sesiones_entreno ADD COLUMN valoracion TEXT DEFAULT ''"); } catch(e) {}
      dbRun('UPDATE sesiones_entreno SET valoracion=? WHERE id=?', [valoracion||'', ultima.id]);

      // Notificar al coach sobre cómo le pareció el entreno
      if(valoracion && String(valoracion).trim() !== '') {
        const coachId = getCoachId();
        if(coachId) {
          const nombre = getNombreCliente(req.params.id);
          crearNotificacion(coachId, 'valoracion_entreno', `⭐ ${nombre} valoró su entreno: "${String(valoracion).trim()}"`);
        }
      }

      saveToDisk();
    }
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false }); }
});

// POST notificación al coach (desde el cliente)
router.post('/notificaciones/coach', (req, res) => {
  try {
    const { tipo, mensaje } = req.body;
    // Buscar al coach (role='coach')
    const coach = dbGet("SELECT id FROM users WHERE role='coach' LIMIT 1");
    if(!coach) return res.json({ ok: false });
    crearNotificacion(coach.id, tipo || 'sistema', mensaje || '');
    saveToDisk();
    res.json({ ok: true });
  } catch(e) {
    res.json({ ok: false });
  }
});

// ── ACCOUNT SETTINGS ─────────────────────────────────────────────────
router.get('/me', (req, res) => {
  try {
    const user = dbGet('SELECT id, username, nombre, email, telefono, role, foto_perfil FROM users WHERE id=?', [req.user.id]);
    if(!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/me', (req, res) => {
  try {
    const { nombre, email, telefono, username, password_actual, password_nueva } = req.body;
    const bcrypt = require('bcryptjs');
    const user = dbGet('SELECT * FROM users WHERE id=?', [req.user.id]);
    if(!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password before changing
    if(password_nueva) {
      if(!password_actual) return res.status(400).json({ error: 'Current password required' });
      const valid = bcrypt.compareSync(password_actual, user.password);
      if(!valid) return res.status(400).json({ error: 'Current password is incorrect' });
      if(password_nueva.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Check username not already taken by another user
    if(username && username !== user.username) {
      const existing = dbGet('SELECT id FROM users WHERE username=? AND id!=?', [username, req.user.id]);
      if(existing) return res.status(400).json({ error: 'Username already taken' });
    }

    const newHash     = password_nueva ? bcrypt.hashSync(password_nueva, 10) : user.password;
    const newNombre   = nombre   || user.nombre;
    const newEmail    = email    || user.email;
    const newTelefono = telefono || user.telefono;
    const newUsername = username || user.username;

    dbRun('UPDATE users SET nombre=?, email=?, telefono=?, username=?, password=? WHERE id=?',
      [newNombre, newEmail, newTelefono, newUsername, newHash, req.user.id]);

    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── COACHES LIST ─────────────────────────────────────────────────────
router.get('/coaches', coachOnly, (req, res) => {
  try {
    const coaches = dbAll("SELECT id, username, nombre, email, lang, foto_perfil FROM users WHERE role='coach' ORDER BY id ASC");
    res.json(coaches);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/coaches', coachOnly, (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { nombre, username, password, email, lang } = req.body;
    if(!nombre || !username || !password) return res.status(400).json({ error: 'nombre, username y password son obligatorios' });
    if(password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    const existing = dbGet('SELECT id FROM users WHERE username=?', [username]);
    if(existing) return res.status(400).json({ error: 'Ese usuario ya existe' });
    const hash = bcrypt.hashSync(password, 10);
    const r = dbRun('INSERT INTO users (username, password, role, nombre, email, lang) VALUES (?,?,?,?,?,?)',
      [username, hash, 'coach', nombre, email||'', lang||'es']);
    saveToDisk();
    res.json({ ok: true, id: r.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/coaches/:id', coachOnly, (req, res) => {
  try {
    const id = req.params.id;
    if(String(id) === String(req.user.id)) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    dbRun('DELETE FROM users WHERE id=? AND role=\'coach\'', [id]);
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── FOTO DE PERFIL ───────────────────────────────────────────────────
// Subir/actualizar foto de perfil (cualquier usuario autenticado)
router.post('/me/foto', (req, res) => {
  try {
    const { foto } = req.body; // base64 data URL: "data:image/jpeg;base64,..."
    if(!foto) return res.status(400).json({ error: 'No foto provided' });
    // Limit size: ~800KB base64 ≈ ~600KB image — enough for a profile pic
    if(foto.length > 1200000) return res.status(400).json({ error: 'Image too large. Max ~800KB' });
    dbRun('UPDATE users SET foto_perfil=? WHERE id=?', [foto, req.user.id]);
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Obtener foto de perfil de cualquier usuario (para que el cliente vea a su coach)
router.get('/usuarios/:id/foto', (req, res) => {
  try {
    const user = dbGet('SELECT foto_perfil FROM users WHERE id=?', [req.params.id]);
    if(!user) return res.status(404).json({ error: 'Not found' });
    res.json({ foto: user.foto_perfil || null });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Obtener foto del coach asignado al cliente (para mostrarse en el asistente)
router.get('/mi-coach/foto', (req, res) => {
  try {
    if(req.user.role !== 'cliente') return res.status(403).json({ error: 'Solo clientes' });
    const cliente = dbGet('SELECT coach_id FROM clientes WHERE user_id=?', [req.user.id]);
    let coachId = cliente?.coach_id;
    // Si no tiene coach asignado, devolver el primer coach
    if(!coachId) {
      const coach = dbGet("SELECT id FROM users WHERE role='coach' LIMIT 1");
      coachId = coach?.id;
    }
    if(!coachId) return res.json({ foto: null, nombre: null });
    const coach = dbGet('SELECT foto_perfil, nombre FROM users WHERE id=?', [coachId]);
    res.json({ foto: coach?.foto_perfil || null, nombre: coach?.nombre || 'Coach' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/me también devuelve foto_perfil
// (ya existe el endpoint, lo extendemos devolviendo la foto)
router.get('/mi-foto', (req, res) => {
  try {
    const user = dbGet('SELECT foto_perfil FROM users WHERE id=?', [req.user.id]);
    res.json({ foto: user?.foto_perfil || null });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// ═══ MENSAJES (chat cliente ↔ coach) ══════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════

// Rastrea cuándo fue el último request del coach para el endpoint /mensajes/estado
const _coachLastSeen = {};
router.use((req, res, next) => {
  if (req.user && req.user.role === 'coach') _coachLastSeen[req.user.id] = Date.now();
  next();
});

// Helper: cliente_id del usuario autenticado
function getClienteIdPropio(userId) {
  const c = dbGet('SELECT id FROM clientes WHERE user_id=?', [userId]);
  return c ? c.id : null;
}

// Helper: coach asignado al cliente (o primer coach si no tiene)
function getCoachIdDeCliente(clienteId) {
  const c = dbGet('SELECT coach_id FROM clientes WHERE id=?', [clienteId]);
  if (c && c.coach_id) return c.coach_id;
  const coach = dbGet("SELECT id FROM users WHERE role='coach' LIMIT 1");
  return coach ? coach.id : null;
}

// ── GET /mensajes/no-leidos ───────────────────────────────────────────────────
// Badge del coach: cuántos mensajes de clientes no ha leído.
router.get('/mensajes/no-leidos', coachOnly, (req, res) => {
  try {
    const row = dbGet(`
      SELECT COUNT(*) as c FROM mensajes m
      JOIN clientes cl ON cl.id = m.cliente_id
      WHERE m.de_coach = 0 AND m.leido = 0
        AND (cl.coach_id = ? OR cl.coach_id IS NULL)
    `, [req.user.id]);
    res.json({ count: row ? row.c : 0 });
  } catch(e) { res.json({ count: 0 }); }
});

// ── GET /mensajes/estado ──────────────────────────────────────────────────────
// El cliente pregunta si su coach estuvo activo en los últimos 3 minutos.
router.get('/mensajes/estado', (req, res) => {
  try {
    if (req.user.role !== 'cliente') return res.json({ online: true });
    const clienteId = getClienteIdPropio(req.user.id);
    const coachId   = clienteId ? getCoachIdDeCliente(clienteId) : null;
    if (!coachId) return res.json({ online: false });
    const online = (Date.now() - (_coachLastSeen[coachId] || 0)) < 3 * 60 * 1000;
    res.json({ online });
  } catch(e) { res.json({ online: false }); }
});

// ── GET /mensajes/conversaciones ──────────────────────────────────────────────
// Lista de conversaciones del coach: un item por cliente con último mensaje y no leídos.
router.get('/mensajes/conversaciones', coachOnly, (req, res) => {
  try {
    const convs = dbAll(`
      SELECT
        cl.id            AS cliente_id,
        u.nombre         AS cliente_nombre,
        u.foto_perfil    AS cliente_foto,
        u.username       AS cliente_username,
        (SELECT contenido  FROM mensajes WHERE cliente_id=cl.id ORDER BY created_at DESC LIMIT 1) AS ultimo_msg,
        (SELECT created_at FROM mensajes WHERE cliente_id=cl.id ORDER BY created_at DESC LIMIT 1) AS ultimo_ts,
        (SELECT COUNT(*)   FROM mensajes WHERE cliente_id=cl.id AND de_coach=0 AND leido=0)       AS no_leidos
      FROM clientes cl
      JOIN users u ON u.id = cl.user_id
      WHERE (cl.coach_id = ? OR cl.coach_id IS NULL)
        AND EXISTS (SELECT 1 FROM mensajes WHERE cliente_id = cl.id)
      ORDER BY ultimo_ts DESC
    `, [req.user.id]);
    res.json(convs);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── GET /mensajes/:clienteId ──────────────────────────────────────────────────
// Hilo completo. El cliente solo puede ver el suyo.
router.get('/mensajes/:clienteId', (req, res) => {
  try {
    const clienteId = parseInt(req.params.clienteId, 10);
    if (req.user.role === 'cliente') {
      const propio = getClienteIdPropio(req.user.id);
      if (propio !== clienteId) return res.status(403).json({ error: 'Sin acceso' });
    }
    const msgs = dbAll(`
      SELECT m.id, m.contenido, m.de_coach, m.via_ia, m.leido, m.created_at,
             u.nombre AS cliente_nombre
      FROM mensajes m
      JOIN clientes cl ON cl.id = m.cliente_id
      JOIN users    u  ON u.id  = cl.user_id
      WHERE m.cliente_id = ?
      ORDER BY m.created_at ASC
    `, [clienteId]);
    res.json(msgs);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── POST /mensajes ────────────────────────────────────────────────────────────
// Enviar mensaje. Coach: de_coach=1. Cliente: de_coach=0 → notifica al coach.
// via_ia=1 cuando la IA responde en nombre del coach (solo interno, cliente no lo ve).
router.post('/mensajes', (req, res) => {
  try {
    const { contenido, via_ia } = req.body;
    let { cliente_id, de_coach } = req.body;

    if (!contenido || !contenido.trim()) {
      const msg = req.user.lang === 'en' ? 'Message cannot be empty' : 'El mensaje no puede estar vacío';
      return res.status(400).json({ error: msg });
    }

    if (req.user.role === 'cliente') {
      cliente_id = getClienteIdPropio(req.user.id);
      de_coach   = 0;
      if (!cliente_id) {
        const msg = req.user.lang === 'en' ? 'Client profile not found' : 'Perfil de cliente no encontrado';
        return res.status(404).json({ error: msg });
      }
    } else {
      cliente_id = parseInt(cliente_id, 10);
      de_coach   = 1;
      if (!cliente_id) {
        const msg = req.user.lang === 'en' ? 'cliente_id required' : 'cliente_id requerido';
        return res.status(400).json({ error: msg });
      }
    }

    const r = dbRun(
      'INSERT INTO mensajes (cliente_id, de_coach, via_ia, contenido, leido) VALUES (?,?,?,?,?)',
      [cliente_id, de_coach ? 1 : 0, via_ia ? 1 : 0, contenido.trim(), 0]
    );

    // Notificar al coach cuando el cliente escribe
    if (!de_coach) {
      const coachId = getCoachIdDeCliente(cliente_id);
      if (coachId) {
        try {
          const coach = dbGet('SELECT lang FROM users WHERE id=?', [coachId]);
          const isEn  = (coach && coach.lang === 'en');
          const nombreCliente = getNombreCliente(cliente_id);
          const msgNotif = isEn
            ? `💬 ${nombreCliente} has sent you a message`
            : `💬 ${nombreCliente} te ha enviado un mensaje`;
          crearNotificacion(coachId, 'mensaje_cliente', msgNotif);
          // Push SSE: actualizar badge de mensajes del coach en tiempo real
          ssePush(coachId, 'badge_msgs', { cliente_id });
        } catch(e) {}
      }
    } else {
      // Coach responde → push SSE al cliente para que reciba el mensaje al instante
      try {
        const clienteUser = dbGet('SELECT user_id FROM clientes WHERE id=?', [cliente_id]);
        if (clienteUser) {
          ssePush(clienteUser.user_id, 'mensaje_nuevo', {
            id: r.lastInsertRowid,
            contenido: contenido.trim(),
            de_coach: 1,
            via_ia: via_ia ? 1 : 0,
            created_at: new Date().toISOString()
          });
        }
      } catch(e) {}
    }

    saveToDisk();
    res.json({ ok: true, id: r.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── PUT /mensajes/:clienteId/leer ─────────────────────────────────────────────
// El coach abre el hilo → marca todos los mensajes del cliente como leídos.
router.put('/mensajes/:clienteId/leer', coachOnly, (req, res) => {
  try {
    dbRun(
      'UPDATE mensajes SET leido=1 WHERE cliente_id=? AND de_coach=0 AND leido=0',
      [parseInt(req.params.clienteId, 10)]
    );
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
