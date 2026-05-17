const express = require('express');
const { dbGet, dbAll, dbRun, saveToDisk } = require('./database');
const { authMiddleware, coachOnly } = require('./auth');
const { ssePush, ssePushCoaches } = require('./sse');
const { analizarSemana, getOptimalRange, groupByMuscle, isMuscleGroup } = require('./muscle-volume');

const router = express.Router();
router.use(authMiddleware);
router.use(middlewareMensajeDiario);

// ── HELPERS ───────────────────────────────────────────────────────────
function crearNotificacion(userId, tipo, mensaje) {
  try {
    dbRun('INSERT INTO notificaciones (user_id, tipo, mensaje) VALUES (?,?,?)',
      [userId, tipo, mensaje]);
    // Push SSE en tiempo real — si el usuario está conectado lo recibe al instante
    ssePush(userId, 'notificacion', { tipo, mensaje, ts: Date.now() });
    // Web Push — llega aunque la pantalla esté apagada o el PC bloqueado
    if(global.sendPushToUser) {
      global.sendPushToUser(userId, 'WolfMindset 🐺', mensaje, '/');
    }
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
    return c ? c.nombre : 'A client';
  } catch(e) { return 'A client'; }
}

// Obtener idioma de un usuario por su userId
function getUserLang(userId) {
  try {
    const u = dbGet('SELECT lang FROM users WHERE id=?', [userId]);
    return u?.lang || 'es';
  } catch(e) { return 'es'; }
}

// Obtener idioma del coach
function getCoachLang() {
  try {
    const coach = dbGet("SELECT lang FROM users WHERE role='coach' LIMIT 1");
    return coach?.lang || 'es';
  } catch(e) { return 'es'; }
}

function ensureClientArchiveSchema() {
  // Usamos users.estado='archivado' para no tocar la estructura principal de clientes.
  // Así archivar es reversible y el cliente queda oculto/bloqueado sin borrar historial.
  try { dbRun("UPDATE users SET estado='activo' WHERE role='cliente' AND (estado IS NULL OR estado='')"); } catch(e) {}
}

function getClienteConUsuario(clienteId) {
  return dbGet(`SELECT c.id, c.user_id, u.nombre, u.estado, u.role
    FROM clientes c JOIN users u ON u.id = c.user_id
    WHERE c.id=?`, [clienteId]);
}

function borrarClientePermanentemente(clienteId) {
  const c = getClienteConUsuario(clienteId);
  if (!c) return null;
  if (c.role && c.role !== 'cliente') throw new Error('This user is not a client');

  // Hijos directos de estructuras anidadas
  const dias = dbAll('SELECT id FROM dias_entreno WHERE cliente_id=?', [clienteId]);
  dias.forEach(d => { try { dbRun('DELETE FROM ejercicios_dia WHERE dia_id=?', [d.id]); } catch(e) {} });

  const comidas = dbAll('SELECT id FROM comidas WHERE cliente_id=?', [clienteId]);
  comidas.forEach(m => { try { dbRun('DELETE FROM alimentos WHERE comida_id=?', [m.id]); } catch(e) {} });

  const recetas = dbAll('SELECT id FROM recetas WHERE cliente_id=?', [clienteId]);
  recetas.forEach(r => { try { dbRun('DELETE FROM receta_ingredientes WHERE receta_id=?', [r.id]); } catch(e) {} });

  const sesiones = dbAll('SELECT id FROM sesiones_entreno WHERE cliente_id=?', [clienteId]);
  sesiones.forEach(se => { try { dbRun('DELETE FROM series_log WHERE sesion_id=?', [se.id]); } catch(e) {} });

  // Tablas que dependen directamente del cliente
  [
    'peso_registros','fotos','dias_entreno','comidas','recetas','plan_meta',
    'semana_borrador','semana_estado','sesiones_entreno','suscripciones',
    'checkins','mensajes'
  ].forEach(t => { try { dbRun(`DELETE FROM ${t} WHERE cliente_id=?`, [clienteId]); } catch(e) {} });

  // Cuenta y datos asociados al usuario del cliente
  try { dbRun('DELETE FROM notificaciones WHERE user_id=?', [c.user_id]); } catch(e) {}
  try { dbRun('DELETE FROM push_subscriptions WHERE user_id=?', [c.user_id]); } catch(e) {}
  try { dbRun('DELETE FROM clientes WHERE id=?', [clienteId]); } catch(e) {}
  try { dbRun('DELETE FROM users WHERE id=?', [c.user_id]); } catch(e) {}
  saveToDisk();
  return c;
}

function ensureTrainingTrackingSchema() {
  try { dbRun("ALTER TABLE sesiones_entreno ADD COLUMN estado TEXT DEFAULT 'completado'"); } catch(e) {}
  try { dbRun("ALTER TABLE sesiones_entreno ADD COLUMN valoracion TEXT DEFAULT ''"); } catch(e) {}
  try { dbRun("ALTER TABLE series_log ADD COLUMN nota_cliente TEXT DEFAULT ''"); } catch(e) {}
  try { dbRun("ALTER TABLE sesiones_entreno ADD COLUMN coach_revisada INTEGER DEFAULT 0"); } catch(e) {}
  try { dbRun("ALTER TABLE sesiones_entreno ADD COLUMN coach_revisada_at DATETIME"); } catch(e) {}
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
  ensureClientArchiveSchema();
  chequearVencimientosAuto();
  const incluirArchivados = req.query.incluir_archivados === '1' || req.query.estado === 'archivados';
  const soloArchivados = req.query.estado === 'archivados';
  let where = "WHERE COALESCE(u.estado,'activo') != 'archivado'";
  if (incluirArchivados) where = "WHERE 1=1";
  if (soloArchivados) where = "WHERE COALESCE(u.estado,'activo') = 'archivado'";

  const clientes = dbAll(`SELECT c.*, u.nombre, u.username, u.foto_perfil, u.lang, u.estado as user_estado,
    CASE WHEN COALESCE(u.estado,'activo') = 'archivado' THEN 1 ELSE 0 END as archivado,
    (SELECT peso FROM peso_registros WHERE cliente_id=c.id ORDER BY rowid DESC LIMIT 1) as peso_actual,
    (SELECT grasa FROM peso_registros WHERE cliente_id=c.id ORDER BY rowid DESC LIMIT 1) as grasa_actual,
    (SELECT COUNT(*) FROM fotos WHERE cliente_id=c.id) as fotos_count
    FROM clientes c JOIN users u ON c.user_id=u.id
    ${where}`);
  res.json(clientes);
});


// ── ARCHIVAR / RESTAURAR / BORRAR CLIENTE ─────────────────────────
router.put('/clientes/:id/archivar', coachOnly, (req, res) => {
  try {
    ensureClientArchiveSchema();
    const c = getClienteConUsuario(req.params.id);
    if (!c) return res.status(404).json({ error: 'Cliente no encontrado' });
    dbRun("UPDATE users SET estado='archivado' WHERE id=? AND role='cliente'", [c.user_id]);
    try { dbRun("UPDATE suscripciones SET estado='cancelada' WHERE cliente_id=? AND estado='activa'", [req.params.id]); } catch(e) {}
    saveToDisk();
    res.json({ ok: true, archivado: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/clientes/:id/restaurar', coachOnly, (req, res) => {
  try {
    ensureClientArchiveSchema();
    const c = getClienteConUsuario(req.params.id);
    if (!c) return res.status(404).json({ error: 'Cliente no encontrado' });
    dbRun("UPDATE users SET estado='activo' WHERE id=? AND role='cliente'", [c.user_id]);
    saveToDisk();
    res.json({ ok: true, archivado: false });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/clientes/:id/permanente', coachOnly, (req, res) => {
  try {
    const confirmacion = String(req.query.confirm || req.body?.confirm || '').toUpperCase();
    if (confirmacion !== 'BORRAR') return res.status(400).json({ error: 'Confirmación requerida' });
    const c = borrarClientePermanentemente(req.params.id);
    if (!c) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ ok: true, deleted: true, nombre: c.nombre });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/clientes/:id', (req, res) => {
  const id = req.params.id;
  if (req.user.role === 'cliente') {
    const mine = dbGet('SELECT id FROM clientes WHERE user_id=?', [req.user.id]);
    if (!mine || String(mine.id) !== String(id)) return res.status(403).json({ error: 'Sin acceso' });
  }
  const c = dbGet('SELECT c.*, u.nombre, u.username, u.foto_perfil, u.lang FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?', [id]);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  const pesos = dbAll('SELECT * FROM peso_registros WHERE cliente_id=? ORDER BY rowid ASC', [id]);
  const dias = dbAll('SELECT * FROM dias_entreno WHERE cliente_id=? ORDER BY orden', [id]);
  dias.forEach(d => {
    d.ejercicios = dbAll('SELECT * FROM ejercicios_dia WHERE dia_id=? ORDER BY orden', [d.id]);
    // Attach imagen_url from ejercicios_config if not set — but strip base64 from main payload
    // (base64 images are served via /ejercicios-imagenes to keep loadCD response small)
    d.ejercicios.forEach(e => {
      if (!e.imagen_url) {
        const cfg = dbGet('SELECT imagen_url FROM ejercicios_config WHERE nombre=?', [e.nombre]);
        if (cfg && cfg.imagen_url) e.imagen_url = cfg.imagen_url.startsWith('data:') ? '__HAS_IMAGE__' : cfg.imagen_url;
      } else if (e.imagen_url.startsWith('data:')) {
        e.imagen_url = '__HAS_IMAGE__';
      }
    });
  });
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

// ── Coach cambia username de un cliente ──────────────────────────────────────
router.put('/clientes/:id/username', coachOnly, (req, res) => {
  const { username } = req.body;
  if (!username || username.length < 3) return res.status(400).json({ error: 'Mínimo 3 caracteres' });
  const c = dbGet('SELECT * FROM clientes WHERE id=?', [req.params.id]);
  if (!c) return res.status(404).json({ error: 'Cliente no encontrado' });
  const existing = dbGet('SELECT id FROM users WHERE username=? AND id!=?', [username, c.user_id]);
  if (existing) return res.status(409).json({ error: 'Ese usuario ya está en uso' });
  dbRun('UPDATE users SET username=? WHERE id=?', [username, c.user_id]);
  saveToDisk();
  res.json({ ok: true });
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
    const isEn = getCoachLang() === 'en';
    const detalle = grasa ? ` · ${grasa}%${isEn ? ' body fat' : ' grasa'}` : '';
    const msg = isEn
      ? `⚖️ ${nombre} logged their weight: ${peso}kg${detalle}`
      : `⚖️ ${nombre} ha registrado su peso: ${peso}kg${detalle}`;
    crearNotificacion(coachId, 'peso_registrado', msg);
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
  const { nombre, musculos, series, reps, peso_objetivo, descanso, orden } = req.body;
  const rir = req.body.rir!=null ? req.body.rir : null;
  const es_principal = req.body.es_principal!=null ? req.body.es_principal : 0;

  // Precargar youtube_url, imagen_url y nota_coach desde ejercicios_config si no vienen en la request
  const cfg = dbGet('SELECT * FROM ejercicios_config WHERE nombre=?', [nombre]);
  const youtube_url  = req.body.youtube_url  || (cfg?.youtube_url  || '');
  const imagen_url   = req.body.imagen_url   || (cfg?.imagen_url   || '');
  const nota_coach   = req.body.nota_coach   || (cfg?.nota_default || '');

  const r = dbRun('INSERT INTO ejercicios_dia (dia_id, nombre, musculos, series, reps, peso_objetivo, descanso, rir, es_principal, orden, youtube_url, imagen_url, nota_coach, superset_grupo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.id, nombre, musculos||'', series||3, reps||'10-12', peso_objetivo||0, descanso||90, rir, es_principal, orden||0, youtube_url, imagen_url, nota_coach]);

  // Guardar en config si vienen datos nuevos desde la request
  if (req.body.youtube_url || req.body.imagen_url || req.body.nota_coach) {
    const existing = dbGet('SELECT id FROM ejercicios_config WHERE nombre=?', [nombre]);
    if (existing) {
      if (req.body.youtube_url) dbRun('UPDATE ejercicios_config SET youtube_url=? WHERE nombre=?', [req.body.youtube_url, nombre]);
      if (req.body.imagen_url)  dbRun('UPDATE ejercicios_config SET imagen_url=? WHERE nombre=?',  [req.body.imagen_url,  nombre]);
      if (req.body.nota_coach)  dbRun('UPDATE ejercicios_config SET nota_default=? WHERE nombre=?', [req.body.nota_coach, nombre]);
    } else {
      dbRun('INSERT INTO ejercicios_config (nombre, youtube_url, imagen_url, nota_default) VALUES (?,?,?,?)',
        [nombre, req.body.youtube_url||'', req.body.imagen_url||'', req.body.nota_coach||'']);
    }
  }
  res.json({ id: r.lastInsertRowid, youtube_url, imagen_url, nota_coach });
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
 const { series, reps, peso_objetivo, descanso, es_pr, youtube_url, imagen_url, nota_coach, orden, superset_grupo } = req.body;
  const rir_val = 'rir' in req.body ? req.body.rir : e.rir;
  const esp_val = req.body.es_principal!=null ? req.body.es_principal : (e.es_principal||0);
  const ss_val  = superset_grupo!=null ? superset_grupo : (e.superset_grupo||0);
 dbRun('UPDATE ejercicios_dia SET series=?, reps=?, peso_objetivo=?, descanso=?, rir=?, es_principal=?, es_pr=?, youtube_url=?, imagen_url=?, nota_coach=?, orden=?, superset_grupo=? WHERE id=?',
   [
  series||e.series,
  reps||e.reps,
  peso_objetivo!=null?peso_objetivo:e.peso_objetivo,
  descanso||e.descanso,
  rir_val,
  esp_val,
  es_pr!=null?es_pr:e.es_pr,
  youtube_url!=null?youtube_url:e.youtube_url||'',
  imagen_url!=null?imagen_url:e.imagen_url||'',
  nota_coach!=null?nota_coach:e.nota_coach||'',
 (orden!=null ? orden : e.orden),
  ss_val,
  req.params.id
]
);

  // ── Sincronizar youtube_url, imagen_url y nota_coach en ejercicios_config ──
  // Así el próximo cliente que use este ejercicio ya tendrá el video/nota precargado.
  if (youtube_url != null || imagen_url != null || nota_coach != null) {
    const nombre = e.nombre;
    const existing = dbGet('SELECT id FROM ejercicios_config WHERE nombre=?', [nombre]);
    if (existing) {
      if (youtube_url != null && youtube_url !== '') dbRun('UPDATE ejercicios_config SET youtube_url=? WHERE nombre=?', [youtube_url, nombre]);
      if (imagen_url != null && imagen_url !== '') dbRun('UPDATE ejercicios_config SET imagen_url=? WHERE nombre=?', [imagen_url, nombre]);
      if (nota_coach != null && nota_coach !== '') dbRun('UPDATE ejercicios_config SET nota_default=? WHERE nombre=?', [nota_coach, nombre]);
    } else {
      dbRun('INSERT INTO ejercicios_config (nombre, youtube_url, imagen_url, nota_default) VALUES (?,?,?,?)',
        [nombre, youtube_url||'', imagen_url||'', nota_coach||'']);
    }
  }

  saveToDisk();
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
  const r = dbRun('INSERT INTO fotos (cliente_id, url, analysis, tipo) VALUES (?, ?, ?, ?)',
    [req.params.id, url||'', analysis||'', tipo||'frente']);

  // Notificar al coach
  const coachId = getCoachId();
  if(coachId) {
    const nombre = getNombreCliente(req.params.id);
    const tipoLabel = tipo === 'posterior' ? (coachId ? 'posterior' : 'back') : tipo === 'costado' ? 'lateral' : 'frontal';

    // Detectar si es la primera foto del mes — si hay fotos del mes anterior, notificar comparativa
    const ahora = new Date();
    const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}`;
    const fotosDelMes = dbAll(
      "SELECT id FROM fotos WHERE cliente_id=? AND strftime('%Y-%m', fecha)=?",
      [req.params.id, mesActual]
    );
    const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth()-1, 1);
    const mesAnteriorStr = `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth()+1).padStart(2,'0')}`;
    const fotosDelMesAnterior = dbAll(
      "SELECT id FROM fotos WHERE cliente_id=? AND strftime('%Y-%m', fecha)=?",
      [req.params.id, mesAnteriorStr]
    );

    const coach = dbGet('SELECT lang FROM users WHERE id=?', [coachId]);
    const isEn = coach && coach.lang === 'en';

    if(fotosDelMes.length <= 1 && fotosDelMesAnterior.length > 0) {
      // Primera foto del mes con historial del mes anterior — comparativa disponible
      const msgComparativa = isEn
        ? `📸 ${nombre} uploaded their monthly photo. Comparison with last month available — go to their profile to analyze progress!`
        : `📸 ${nombre} subió su foto mensual. Comparativa con el mes anterior disponible — ¡entra a su perfil para analizar el progreso!`;
      crearNotificacion(coachId, 'foto_comparativa', msgComparativa);
    } else {
      const msgFoto = isEn
        ? `📸 ${nombre} uploaded a progress photo (${tipoLabel})`
        : `📸 ${nombre} ha subido una foto de progreso (${tipoLabel})`;
      crearNotificacion(coachId, 'foto_subida', msgFoto);
    }
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
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 8000, system, messages })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.json({ reply: data.content[0].text });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/ia/foto', async (req, res) => {
  const { imageBase64, mediaType, extraImages, system, clientInfo } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });
  if (!imageBase64 || !mediaType) return res.status(400).json({ error: 'imageBase64 y mediaType requeridos' });

  try {
    const isEn = system?.includes('English');
    const content = [];

    // Images first (no text label needed)
    content.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } });
    if (extraImages && extraImages.length) {
      for (const img of extraImages) {
        if (img.b64 && img.mt) {
          content.push({ type: 'image', source: { type: 'base64', media_type: img.mt, data: img.b64 } });
        }
      }
    }

    const prompt = isEn
      ? `Analyze the physique of this client (${clientInfo || 'fitness client'}).
Write a personal coach message (4-5 sentences) that:
1. Highlights 2-3 genuine strong points visible in the photo (specific muscle groups, posture, body composition)
2. Points out 1-2 areas to focus on to reach their goal
3. Gives 1 concrete actionable tip for this week
4. Ends with a motivating push
Tone: direct, warm, personal. No markdown, no asterisks, no lists. Natural flowing sentences.`
      : `Analiza el físico de este cliente (${clientInfo || 'cliente fitness'}).
Escribe un mensaje personal del coach (4-5 frases) que:
1. Destaque 2-3 puntos fuertes reales visibles en la foto (grupos musculares específicos, postura, composición corporal)
2. Señale 1-2 áreas en las que enfocarse para alcanzar su objetivo
3. Dé 1 consejo concreto y accionable para esta semana
4. Termine con una motivación real
Tono: directo, cercano, personal. Sin markdown, sin asteriscos, sin listas. Frases naturales.`;

    content.push({ type: 'text', text: prompt });

    const reqBody = JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 600,
      system: system || 'Eres un coach de fitness experto. Responde en español.',
      messages: [{ role: 'user', content }]
    });

    console.log('[IA foto] images:', content.filter(c=>c.type==='image').length, 'size:', reqBody.length);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: reqBody
    });

    const rawText = await response.text();
    console.log('[IA foto] status:', response.status, 'len:', rawText.length);

    if (!response.ok) {
      console.log('[IA foto] error:', rawText.slice(0, 300));
      return res.status(500).json({ error: `API ${response.status}: ${rawText.slice(0, 200)}` });
    }

    let data;
    try { data = JSON.parse(rawText); } catch(pe) {
      return res.status(500).json({ error: 'Respuesta malformada: ' + rawText.slice(0, 100) });
    }

    if (data.error) return res.status(500).json({ error: data.error.message || 'Error API' });
    if (!data.content?.[0]?.text) return res.status(500).json({ error: 'Respuesta vacía' });
    res.json({ reply: data.content[0].text });
  } catch(e) {
    console.log('[IA foto] exception:', e.message);
    res.status(500).json({ error: e.message || 'Error IA foto' });
  }
});

// ── COMPARAR DOS SEMANAS DE FOTOS (Coach → IA → Mensaje editable) ──────────
router.post('/ia/comparar-fotos', coachOnly, async (req, res) => {
  const { fotosAntes, fotosDespues, clienteNombre, objetivo, nivel, semanaAntes, semanaDespues, lang, pedirGrasa, peso, altura, edad, sexo } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });

  try {
    const isEn = lang === 'en';
    const content = [];

    // Fotos "antes" (solo si hay)
    if (fotosAntes && fotosAntes.length) {
      content.push({ type: 'text', text: isEn ? `Week ${semanaAntes} (BEFORE):` : `Semana ${semanaAntes} (ANTES):` });
      for (const f of fotosAntes) {
        if (f.b64 && f.mt) content.push({ type: 'image', source: { type: 'base64', media_type: f.mt, data: f.b64 } });
      }
    }

    // Fotos "después"
    content.push({ type: 'text', text: isEn ? `Week ${semanaDespues} (NOW):` : `Semana ${semanaDespues} (AHORA):` });
    for (const f of (fotosDespues || [])) {
      if (f.b64 && f.mt) content.push({ type: 'image', source: { type: 'base64', media_type: f.mt, data: f.b64 } });
    }

    const clienteInfo = [
      peso   ? (isEn ? `Weight: ${peso}kg`   : `Peso: ${peso}kg`)   : '',
      altura ? (isEn ? `Height: ${altura}cm` : `Altura: ${altura}cm`) : '',
      edad   ? (isEn ? `Age: ${edad}`         : `Edad: ${edad}`)     : '',
      sexo   ? (isEn ? `Sex: ${sexo}`         : `Sexo: ${sexo}`)     : ''
    ].filter(Boolean).join(' · ');

    const hayComparativa = fotosAntes && fotosAntes.length > 0;

    const instruccion = isEn
      ? `${hayComparativa ? 'Compare the BEFORE and NOW photos' : 'Analyze the physique'} of ${clienteNombre} (Goal: ${objetivo}, Level: ${nivel}${clienteInfo ? ', ' + clienteInfo : ''}).
Write a direct coach message (4-6 sentences) that:
1. Estimates body fat % visually — write it as "Estimated body fat: X%" somewhere in the message
${hayComparativa ? '2. Estimates overall improvement as a percentage — write it as "Improvement: X%"\n3. Highlights 2-3 specific visible improvements\n4. Celebrates a clear strong point\n5. Points out 1-2 areas to keep working on\n6. Ends with a motivating push' : '2. Notes 2-3 positive aspects of the physique\n3. Points out 2 specific areas to focus on\n4. Ends with a concrete actionable tip'}
Tone: direct, warm, like a real coach who knows them personally. No markdown, no asterisks, no mention of AI or technology.`
      : `${hayComparativa ? 'Compara las fotos ANTES y AHORA' : 'Analiza el físico'} de ${clienteNombre} (Objetivo: ${objetivo}, Nivel: ${nivel}${clienteInfo ? ', ' + clienteInfo : ''}).
Escribe un mensaje directo del coach (4-6 frases) que:
1. Estime el porcentaje de grasa corporal visualmente — escríbelo como "Grasa estimada: X%" en algún punto del mensaje
${hayComparativa ? '2. Estime el porcentaje de mejora global — escríbelo como "Mejora: X%"\n3. Destaque 2-3 mejoras visibles y concretas\n4. Celebre un punto fuerte claro\n5. Señale 1-2 áreas a seguir trabajando\n6. Termine con un empuje motivador' : '2. Señale 2-3 aspectos positivos del físico\n3. Indique 2 áreas concretas en las que enfocarse\n4. Termine con un consejo accionable concreto'}
Tono: directo, cercano, como un coach real que lo conoce personalmente. Sin markdown, sin asteriscos, sin mencionar IA ni tecnología.`;

    content.push({ type: 'text', text: instruccion });

    const system = isEn
      ? 'You are an expert WolfMindset fitness coach. You analyze client progress photos with a trained, motivating eye. You estimate body fat percentage visually based on muscle definition, fat distribution and overall physique — always provide a specific number. You write personalized messages that make clients feel seen and motivated. Never mention AI or technology.'
      : 'Eres un coach de fitness experto de WolfMindset. Analizas fotos de progreso con ojo entrenado y motivador. Estimas el porcentaje de grasa corporal visualmente basándote en la definición muscular, distribución de grasa y físico general — siempre da un número específico. Escribes mensajes personalizados que hacen que el cliente se sienta visto y motivado. Nunca menciones IA ni tecnología.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 700, system, messages: [{ role: 'user', content }] })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.json({ reply: data.content[0].text });
  } catch(e) {
    res.status(500).json({ error: e.message || 'Error comparando fotos' });
  }
});

// ── ANALIZAR FOTOS COACH (descarga URLs server-side, sin CORS) ────
router.post('/ia/analizar-fotos-coach', coachOnly, async (req, res) => {
  const { urlsActuales, urlsAnteriores, clienteNombre, objetivo, nivel, semanaActual, semanaAnterior, lang, peso, altura, edad, sexo, cintura, cadera } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });
  if (!urlsActuales || !urlsActuales.length) return res.status(400).json({ error: 'urlsActuales requerido' });

  async function fetchImageB64(url) {
    try {
      const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*,*/*' } });
      if (!resp.ok) return null;
      const buffer = await resp.arrayBuffer();
      const ct = resp.headers.get('content-type') || 'image/jpeg';
      return { b64: Buffer.from(buffer).toString('base64'), mt: ct.split(';')[0].trim() };
    } catch(e) { return null; }
  }

  try {
    const isEn = lang === 'en';
    const hayComparativa = !!(urlsAnteriores && urlsAnteriores.length);
    const [imgActuales, imgAnteriores] = await Promise.all([
      Promise.all(urlsActuales.map(fetchImageB64)),
      hayComparativa ? Promise.all(urlsAnteriores.map(fetchImageB64)) : Promise.resolve([])
    ]);
    const fotosOk = imgActuales.filter(Boolean);
    const antesOk = imgAnteriores.filter(Boolean);
    if (!fotosOk.length) return res.status(400).json({ error: 'No se pudieron cargar las imágenes' });

    const clienteInfo = [
      peso    ? (isEn ? `Weight: ${peso}kg`    : `Peso: ${peso}kg`)    : '',
      altura  ? (isEn ? `Height: ${altura}cm`  : `Altura: ${altura}cm`) : '',
      edad    ? (isEn ? `Age: ${edad}`          : `Edad: ${edad}`)      : '',
      sexo    ? (isEn ? `Sex: ${sexo}`          : `Sexo: ${sexo}`)      : '',
      cintura ? (isEn ? `Waist: ${cintura}cm`  : `Cintura: ${cintura}cm`) : '',
      cadera  ? (isEn ? `Hips: ${cadera}cm`    : `Cadera: ${cadera}cm`) : ''
    ].filter(Boolean).join(' · ');

    const content = [];
    if (hayComparativa && antesOk.length) {
      content.push({ type: 'text', text: isEn ? `${semanaAnterior} (BEFORE):` : `${semanaAnterior} (ANTES):` });
      antesOk.forEach(img => content.push({ type: 'image', source: { type: 'base64', media_type: img.mt, data: img.b64 } }));
      content.push({ type: 'text', text: isEn ? `${semanaActual} (NOW):` : `${semanaActual} (AHORA):` });
      fotosOk.forEach(img => content.push({ type: 'image', source: { type: 'base64', media_type: img.mt, data: img.b64 } }));
      const instruccion = isEn
        ? `Compare BEFORE and NOW photos of ${clienteNombre} (Goal: ${objetivo}, Level: ${nivel}${clienteInfo ? ', '+clienteInfo : ''}).
Write a direct coach message (4-6 sentences): estimate body fat % as "Estimated body fat: X%", improvement % as "Improvement: X%", highlight 2-3 visible improvements, note 1-2 areas to keep working, end motivating. No markdown, no asterisks, no AI mention.`
        : `Compara ANTES y AHORA de ${clienteNombre} (Objetivo: ${objetivo}, Nivel: ${nivel}${clienteInfo ? ', '+clienteInfo : ''}).
Escribe un mensaje del coach (4-6 frases): estima grasa como "Grasa estimada: X%", mejora como "Mejora: X%", destaca 2-3 mejoras visibles, señala 1-2 áreas a trabajar, termina motivando. Sin markdown, sin asteriscos, sin mencionar IA.`;
      content.push({ type: 'text', text: instruccion });
    } else {
      fotosOk.forEach(img => content.push({ type: 'image', source: { type: 'base64', media_type: img.mt, data: img.b64 } }));
      const instruccion = isEn
        ? `Analyze the physique of ${clienteNombre} (Goal: ${objetivo}, Level: ${nivel}${clienteInfo ? ', '+clienteInfo : ''}). First session — no previous photos.
Write a personal coach message (4-5 sentences): estimate body fat % as "Estimated body fat: X%", highlight 2-3 genuine strong points, point out 1-2 areas to focus on, give 1 concrete tip, end motivating. No markdown, no asterisks, no AI mention.`
        : `Analiza el físico de ${clienteNombre} (Objetivo: ${objetivo}, Nivel: ${nivel}${clienteInfo ? ', '+clienteInfo : ''}). Primera sesión — sin fotos anteriores.
Escribe un mensaje del coach (4-5 frases): estima grasa como "Grasa estimada: X%", destaca 2-3 puntos fuertes reales, señala 1-2 áreas de mejora, da 1 consejo concreto, termina motivando. Sin markdown, sin asteriscos, sin mencionar IA.`;
      content.push({ type: 'text', text: instruccion });
    }

    const system = isEn
      ? 'You are an expert WolfMindset fitness coach. Analyze progress photos with a trained eye. Always estimate body fat % visually with a specific number. Write personalized, motivating messages. Never mention AI or technology.'
      : 'Eres un coach de fitness experto de WolfMindset. Analiza fotos con ojo entrenado. Siempre estima el % de grasa con un número concreto. Escribe mensajes personalizados y motivadores. Nunca menciones IA ni tecnología.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-6', max_tokens: 600, system, messages: [{ role: 'user', content }] })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message || 'Error API' });
    if (!data.content?.[0]?.text) return res.status(500).json({ error: 'Respuesta vacía' });
    res.json({ reply: data.content[0].text });
  } catch(e) {
    console.log('[analizar-fotos-coach]', e.message);
    res.status(500).json({ error: e.message || 'Error analizando fotos' });
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
// Caché en memoria para datos estáticos. Expira cada 24h y se limpia al recargar la BD.
const DB_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const dbListCache = {
  ejercicios: new Map(),
  alimentos: new Map()
};

function makeDbCacheKey(query) {
  return JSON.stringify(Object.keys(query || {}).sort().reduce((acc, key) => {
    acc[key] = query[key];
    return acc;
  }, {}));
}

function getDbCache(bucket, key) {
  const item = dbListCache[bucket].get(key);
  if (!item) return null;
  if (Date.now() - item.ts > DB_CACHE_TTL_MS) {
    dbListCache[bucket].delete(key);
    return null;
  }
  return item.data;
}

function setDbCache(bucket, key, data) {
  dbListCache[bucket].set(key, { ts: Date.now(), data });
}

function resetDbListCache() {
  dbListCache.ejercicios.clear();
  dbListCache.alimentos.clear();
}

router.get('/ejercicios-db', (req, res) => {
  const cacheKey = makeDbCacheKey(req.query);
  const cached = getDbCache('ejercicios', cacheKey);
  if (cached) return res.json(cached);

  const { grupo, buscar } = req.query;
  let sql = 'SELECT * FROM ejercicios_db WHERE 1=1';
  const params = [];
  if (grupo && grupo !== 'Todos' && grupo !== 'All') { sql += ' AND grupo=?'; params.push(grupo); }
  if (buscar) { sql += ' AND (nombre LIKE ? OR musculos LIKE ?)'; params.push('%'+buscar+'%','%'+buscar+'%'); }
  sql += ' ORDER BY nombre';
  const data = dbAll(sql, params);
  setDbCache('ejercicios', cacheKey, data);
  res.json(data);
});

router.get('/alimentos-db', (req, res) => {
  const cacheKey = makeDbCacheKey(req.query);
  const cached = getDbCache('alimentos', cacheKey);
  if (cached) return res.json(cached);

  const { categoria, buscar } = req.query;
  let sql = 'SELECT * FROM alimentos_db WHERE 1=1';
  const params = [];
  if (categoria && categoria !== 'Todos') { sql += ' AND categoria=?'; params.push(categoria); }
  if (buscar) { sql += ' AND nombre LIKE ?'; params.push('%'+buscar+'%'); }
  sql += ' ORDER BY categoria, nombre';
  const data = dbAll(sql, params);
  setDbCache('alimentos', cacheKey, data);
  res.json(data);
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
  // Marcar bienvenida pendiente — se enviará cuando el cliente abra la app por primera vez
  try { dbRun("UPDATE clientes SET bienvenida_pendiente=1 WHERE user_id=?", [req.params.id]); } catch(e) {}
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
    resetDbListCache();
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
      const isEn = getCoachLang() === 'en';
      const durStr = duracion_min ? ` (${duracion_min} min)` : '';
      const diaStr = dia_nombre || (isEn ? 'workout' : 'entreno');

      // Notificación de sesión completada
      crearNotificacion(coachId, 'sesion_completada',
        isEn
          ? `💪 ${nombre} finished: ${diaStr}${durStr}`
          : `💪 ${nombre} ha terminado: ${diaStr}${durStr}`);

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

    // ── Trigger automático: análisis IA en background si sesión completada ──
    // Se lanza DESPUÉS de responder al cliente para no bloquear la respuesta.
    if (estadoFinal === 'completado' && series && series.length >= 3) {
      setImmediate(() => lanzarAnalisisAutomatico(sesionId, req.params.id, coachId).catch(e =>
        console.error('[AnalisisAuto] Error:', e.message)
      ));
    }
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

// ── MARCAR SESIÓN COMO REVISADA ───────────────────────────────────
router.put('/sesiones/:id/revisar', coachOnly, (req, res) => {
  ensureTrainingTrackingSchema();
  dbRun(
    "UPDATE sesiones_entreno SET coach_revisada=1, coach_revisada_at=datetime('now') WHERE id=?",
    [req.params.id]
  );
  res.json({ ok: true });
});

// ── SESIONES PENDIENTES DE REVISAR (dashboard coach) ─────────────
// Devuelve las sesiones completadas en los últimos 14 días no revisadas por el coach
router.get('/coach/sesiones-pendientes', coachOnly, (req, res) => {
  ensureTrainingTrackingSchema();
  const coachId = req.user.id;
  try {
    const pendientes = dbAll(`
      SELECT
        se.id, se.cliente_id, se.dia_nombre, se.dia_grupo,
        se.fecha, se.estado, se.duracion_min, se.coach_revisada,
        u.nombre as cliente_nombre, u.foto_perfil,
        c.objetivo, c.semanas,
        COUNT(sl.id) as num_series
      FROM sesiones_entreno se
      JOIN clientes c ON c.id = se.cliente_id
      JOIN users u ON u.id = c.user_id
      LEFT JOIN series_log sl ON sl.sesion_id = se.id
      WHERE c.coach_id = ?
        AND se.estado = 'completado'
        AND (se.coach_revisada = 0 OR se.coach_revisada IS NULL)
        AND se.fecha >= datetime('now', '-14 days')
      GROUP BY se.id
      ORDER BY se.fecha DESC
    `, [coachId]);
    res.json(pendientes);
  } catch(e) {
    console.log('[sesiones-pendientes]', e.message);
    res.json([]);
  }
});

// ── ÚLTIMA SESIÓN (ligero, solo para semáforo del dashboard) ──────────────────
// Devuelve solo fecha, estado y dias_sin_entreno — sin cargar series ni logs.
// Usar en cargarDashboard() en lugar de /sesiones para cada cliente.
router.get('/clientes/:id/ultima-sesion', (req, res) => {
  const id = req.params.id;
  if (req.user.role === 'cliente') {
    const mine = dbGet('SELECT id FROM clientes WHERE user_id=?', [req.user.id]);
    if (!mine || String(mine.id) !== String(id)) return res.status(403).json({ error: 'Sin acceso' });
  }
  try {
    ensureTrainingTrackingSchema();
    const ultima = dbGet(
      "SELECT fecha, estado, dia_nombre, dia_grupo, duracion_min FROM sesiones_entreno WHERE cliente_id=? ORDER BY fecha DESC LIMIT 1",
      [id]
    );
    if (!ultima) return res.json({ tiene_sesiones: false, dias_sin_entreno: 999, estado: null });
    const diasSinEntreno = Math.floor((Date.now() - new Date(ultima.fecha).getTime()) / 86400000);
    res.json({
      tiene_sesiones: true,
      fecha: ultima.fecha,
      estado: ultima.estado || 'completado',
      dia_nombre: ultima.dia_nombre,
      dias_sin_entreno: diasSinEntreno
    });
  } catch(e) {
    res.json({ tiene_sesiones: false, dias_sin_entreno: 999, estado: null });
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
    const { username, password, nombre, email, telefono, objetivo, nivel, peso_actual, altura, edad, sexo, actividad, dieta_tipo, alimentos_no, lesiones, observaciones, deficiencias } = req.body;
    if(!username || !password || !nombre) return res.status(400).json({ error: 'Faltan campos obligatorios' });
    const existing = dbGet('SELECT id FROM users WHERE username=?', [username]);
    if(existing) return res.status(400).json({ error: 'Usuario ya existe' });
    const hash = bcrypt.hashSync(password, 10);
    const userR = dbRun("INSERT INTO users (username, password, role, nombre, email, estado, telefono) VALUES (?,?,?,?,?,?,?)",
      [username, hash, 'cliente', nombre, email||'', 'pendiente', telefono||'']);
    const userId = userR.lastInsertRowid;
    dbRun(`INSERT INTO clientes (user_id, objetivo, nivel, peso_actual, altura, edad, sexo, actividad, dieta_tipo, alimentos_no, lesiones, observaciones, deficiencias) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [userId, objetivo||'Volumen', nivel||'Intermedio', peso_actual||0, altura||0, edad||0, sexo||'Hombre', actividad||'Moderada', dieta_tipo||'Omnivoro', alimentos_no||'', lesiones||'', observaciones||'', deficiencias||'']);
    const { saveToDisk } = require('./database');
    saveToDisk();

    // Notificar al coach de la nueva solicitud en tiempo real
    const coachId = getCoachId();
    if(coachId) {
      const coach = dbGet('SELECT lang FROM users WHERE id=?', [coachId]);
      const isEn = coach?.lang === 'en';
      const msg = isEn
        ? `🙋 New access request from ${nombre}${objetivo ? ' · Goal: '+objetivo : ''}`
        : `🙋 Nueva solicitud de acceso de ${nombre}${objetivo ? ' · Objetivo: '+objetivo : ''}`;
      crearNotificacion(coachId, 'nuevo_registro', msg);
      ssePushCoaches('notificacion', { tipo: 'nuevo_registro', mensaje: msg });
    }

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
      // La IA nueva pone los alimentos en opciones[0].alimentos, no en comida.alimentos
      const alimentos = (Array.isArray(comida.alimentos) && comida.alimentos.length)
        ? comida.alimentos
        : (comida.opciones?.[0]?.alimentos || []);

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
      // La IA genera "opciones" (A/B/C). Soporte legacy para "variaciones" antiguas.
      const ops = comida.opciones || comida.variaciones;
      if (Array.isArray(ops) && ops.length > 1) {
        // Guardamos las opciones B, C... (la A es la comida base ya guardada en alimentos)
        variacionesPorComida[i] = ops.slice(1).map((op, idx) => ({
          letra: op.letra || String.fromCharCode(66 + idx),
          nombre: op.nombre || '',
          alimentos: op.alimentos || [],
          nota: op.nota || ''
        }));
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
      const isEn = getCoachLang() === 'en';
      const detalles = [];
      if(sueno != null && sueno !== '') detalles.push(isEn ? `sleep ${sueno}/10` : `sueño ${sueno}/10`);
      if(energia != null && energia !== '') detalles.push(isEn ? `energy ${energia}/10` : `energía ${energia}/10`);
      if(peso != null && peso !== '') detalles.push(`${isEn ? 'weight' : 'peso'} ${peso}kg`);
      const semanaTxt = semana ? ` (${semana})` : '';
      const resumen = detalles.length
        ? detalles.join(' · ')
        : (isEn ? 'sent their check-in' : 'ha enviado su check-in');
      crearNotificacion(coachId, 'checkin_cliente',
        isEn
          ? `🧠 ${nombre} sent check-in${semanaTxt}: ${resumen}`
          : `🧠 ${nombre} ha enviado check-in${semanaTxt}: ${resumen}`);
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
          const isEn = getCoachLang() === 'en';
          crearNotificacion(coachId, 'valoracion_entreno',
            isEn
              ? `⭐ ${nombre} rated their workout: "${String(valoracion).trim()}"`
              : `⭐ ${nombre} valoró su entreno: "${String(valoracion).trim()}"`);
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

// Rastrea cuándo fue el último request del coach para presencia general.
// Además, el hilo abierto marca presencia por cliente en BD (last_coach_activity).
const _coachLastSeen = {};
const COACH_ACTIVE_MS = 5 * 60 * 1000;
router.use((req, res, next) => {
  if (req.user && req.user.role === 'coach') _coachLastSeen[req.user.id] = Date.now();
  next();
});

function marcarCoachActivo(clienteId) {
  try {
    dbRun("UPDATE clientes SET coach_online=1, last_coach_activity=datetime('now') WHERE id=?", [clienteId]);
  } catch(e) {}
}

function desactivarCoachesInactivos() {
  try {
    dbRun("UPDATE clientes SET coach_online=0 WHERE coach_online=1 AND (last_coach_activity IS NULL OR last_coach_activity < datetime('now','-5 minutes'))");
  } catch(e) {}
}

function coachEstaActivoEnCliente(clienteId) {
  try {
    desactivarCoachesInactivos();
    const cl = dbGet("SELECT coach_online, last_coach_activity FROM clientes WHERE id=?", [clienteId]);
    if (!cl || !cl.coach_online || !cl.last_coach_activity) return false;
    const last = new Date(String(cl.last_coach_activity).replace(' ', 'T') + 'Z').getTime();
    return Number.isFinite(last) && (Date.now() - last) < COACH_ACTIVE_MS;
  } catch(e) { return false; }
}

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
    const onlineGeneral = (Date.now() - (_coachLastSeen[coachId] || 0)) < COACH_ACTIVE_MS;
    const onlineHilo = coachEstaActivoEnCliente(clienteId);
    res.json({ online: !!(onlineGeneral || onlineHilo) });
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
    } else {
      marcarCoachActivo(clienteId);
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

// ── MENSAJES DIARIOS Y BIENVENIDA ─────────────────────────────────────────────

// Genera y envía un mensaje motivador personalizado al cliente via chat
async function enviarMensajeMotivador(clienteId, tipo) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return;
  try {
    const cl = dbGet(`SELECT c.*, u.nombre, u.lang FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?`, [clienteId]);
    if (!cl) return;
    const isEn = cl.lang === 'en';

    // Contexto del cliente
    const ultimaSesion = dbGet(`SELECT fecha, dia_nombre, estado FROM sesiones_entreno WHERE cliente_id=? ORDER BY fecha DESC LIMIT 1`, [clienteId]);
    const ultimoPeso = dbGet(`SELECT peso, grasa FROM peso_registros WHERE cliente_id=? ORDER BY rowid DESC LIMIT 1`, [clienteId]);
    const checkin = dbGet(`SELECT sueno, energia FROM checkins WHERE cliente_id=? ORDER BY fecha DESC LIMIT 1`, [clienteId]);
    const totalSesiones = dbGet(`SELECT COUNT(*) as c FROM sesiones_entreno WHERE cliente_id=?`, [clienteId]);

    const diasSinEntreno = ultimaSesion
      ? Math.floor((Date.now() - new Date(ultimaSesion.fecha).getTime()) / 86400000)
      : 999;

    const contexto = [
      `Nombre: ${cl.nombre}`,
      `Objetivo: ${cl.objetivo || '—'}`,
      `Nivel: ${cl.nivel || '—'}`,
      cl.peso_actual ? `Peso: ${cl.peso_actual}kg` : '',
      ultimoPeso?.grasa ? `Grasa corporal: ${ultimoPeso.grasa}%` : '',
      `Total sesiones completadas: ${totalSesiones?.c || 0}`,
      diasSinEntreno < 999 ? `Días desde último entreno: ${diasSinEntreno}` : 'Sin sesiones registradas aún',
      checkin ? `Último check-in — sueño: ${checkin.sueno}/10, energía: ${checkin.energia}/10` : '',
      cl.lesiones ? `Lesiones/limitaciones: ${cl.lesiones}` : '',
    ].filter(Boolean).join('\n');

    let prompt;
    if (tipo === 'bienvenida') {
      prompt = isEn
        ? `Write a warm, personal welcome message (3-4 sentences) for a new client joining WolfMindset. Make them feel part of the team, excited about their goal, and confident in the process. End with a concrete first action they can take today. Client context:\n${contexto}`
        : `Escribe un mensaje de bienvenida cálido y personal (3-4 frases) para un nuevo cliente que se une a WolfMindset. Hazle sentir parte del equipo, emocionado por su objetivo y confiado en el proceso. Termina con una primera acción concreta que puede hacer hoy. Contexto del cliente:\n${contexto}`;
    } else {
      // Mensaje diario — varía según estado del cliente
      const tono = diasSinEntreno === 0 ? 'celebratorio' :
                   diasSinEntreno > 5  ? 'reconectando, empujando a volver' :
                   diasSinEntreno > 2  ? 'recordatorio amable' : 'motivador del día';
      prompt = isEn
        ? `Write a short daily motivational message (2-3 sentences, ${tono} tone) for this client. Make it personal, specific to their goal and current state. No generic phrases. Client context:\n${contexto}`
        : `Escribe un mensaje motivacional diario corto (2-3 frases, tono ${tono}) para este cliente. Hazlo personal, específico a su objetivo y estado actual. Sin frases genéricas. Contexto del cliente:\n${contexto}`;
    }

    const system = isEn
      ? 'You are the WolfMindset coach. Write directly to the client in first person (as the coach). Warm, direct, no mention of AI or technology. No markdown, no asterisks.'
      : 'Eres el coach de WolfMindset. Escribe directamente al cliente en primera persona (como el coach). Cercano, directo, sin mencionar IA ni tecnología. Sin markdown, sin asteriscos.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 200, system, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();
    if (!data.content?.[0]?.text) return;

    const texto = data.content[0].text.trim();

    // Insertar en chat como mensaje del coach (via_ia=1)
    const rMsg = dbRun(
      'INSERT INTO mensajes (cliente_id, de_coach, via_ia, contenido, leido) VALUES (?,?,?,?,?)',
      [clienteId, 1, 1, texto, 0]
    );

    // Push SSE al cliente para que lo reciba al instante
    try {
      ssePush(cl.user_id, 'mensaje_nuevo', {
        id: rMsg.lastInsertRowid,
        contenido: texto,
        de_coach: 1,
        via_ia: 1,
        created_at: new Date().toISOString()
      });
    } catch(e) {}

    // Notificar al coach
    const coachId = getCoachId();
    if (coachId) {
      const msgNotif = cl.lang === 'en'
        ? `🤖 Daily message sent to ${cl.nombre}`
        : `🤖 Mensaje diario enviado a ${cl.nombre}`;
      crearNotificacion(coachId, 'mensaje_diario', msgNotif);
      ssePush(coachId, 'badge_msgs', { cliente_id: clienteId });
    }

    saveToDisk();
  } catch(e) { console.error('[MensajeDiario]', e.message); }
}

// Middleware: detecta primer acceso del día de un cliente y dispara mensaje motivador
// Se añade como middleware en el router después de authMiddleware
function middlewareMensajeDiario(req, res, next) {
  // Solo para clientes, solo en GETs (no en cada POST)
  if (!req.user || req.user.role !== 'cliente') return next();
  if (req.method !== 'GET') return next();

  try {
    const hoy = new Date().toISOString().split('T')[0];
    const cl = dbGet('SELECT id, ultimo_acceso_dia, bienvenida_enviada, bienvenida_pendiente FROM clientes WHERE user_id=?', [req.user.id]);
    if (!cl) return next();

    // Enviar bienvenida si está pendiente (coach aprobó al cliente)
    if (cl.bienvenida_pendiente && !cl.bienvenida_enviada) {
      dbRun('UPDATE clientes SET bienvenida_enviada=1, bienvenida_pendiente=0, ultimo_acceso_dia=? WHERE id=?', [hoy, cl.id]);
      enviarMensajeMotivador(cl.id, 'bienvenida').catch(() => {});

      // Notificar al coach que el cliente ha accedido por primera vez
      try {
        const coachId = getCoachId();
        if (coachId) {
          const u = dbGet('SELECT nombre FROM users WHERE id=?', [req.user.id]);
          const nombre = u?.nombre || req.user.username;
          const coach = dbGet('SELECT lang FROM users WHERE id=?', [coachId]);
          const isEn = coach?.lang === 'en';
          const msg = isEn
            ? `🎉 ${nombre} has logged into the app for the first time!`
            : `🎉 ${nombre} ha accedido a la app por primera vez`;
          crearNotificacion(coachId, 'primer_acceso', msg);
          ssePushCoaches('notificacion', { tipo: 'primer_acceso', mensaje: msg });
        }
      } catch(e) {}

      return next();
    }

    // Enviar mensaje diario si es el primer acceso de hoy
    if (cl.ultimo_acceso_dia !== hoy) {
      dbRun('UPDATE clientes SET ultimo_acceso_dia=? WHERE id=?', [hoy, cl.id]);
      // Solo si ya pasó la bienvenida
      if (cl.bienvenida_enviada) {
        enviarMensajeMotivador(cl.id, 'diario').catch(() => {});
      }
    }
  } catch(e) {}

  next();
}



// Comprueba si el bot debe responder a este cliente:
// bot_global ON  → responde a todos los clientes con ia_chat_activa=1 (o si ia_chat_activa es NULL/0 pero global está ON)
// bot_global OFF → solo responde a clientes con ia_chat_activa=1 explícitamente
function botDebeResponder(clienteId) {
  try {
    // Si el coach tiene abierto/activo ese hilo, la IA no interviene.
    if (coachEstaActivoEnCliente(clienteId)) return false;

    const cfg = dbGet('SELECT bot_global FROM ia_config WHERE id=1');
    const botGlobal = cfg ? cfg.bot_global : 0;
    const cl = dbGet('SELECT ia_chat_activa FROM clientes WHERE id=?', [clienteId]);
    const iaCliente = cl ? cl.ia_chat_activa : 0;
    // Si global ON → responde salvo que cliente tenga ia_chat_activa=0 explícitamente
    if (botGlobal) return iaCliente !== 0; // NULL o 1 → responde; 0 → no
    // Si global OFF → solo responde si cliente tiene ia_chat_activa=1
    return iaCliente === 1;
  } catch(e) { return false; }
}

// Genera respuesta IA para el chat usando contexto del cliente
async function responderConIA(clienteId, mensajeUsuario) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    // Contexto del cliente
    const cl = dbGet(`SELECT c.*, u.nombre, u.lang FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?`, [clienteId]);
    if (!cl) return null;
    const isEn = cl.lang === 'en';

    // Últimos 10 mensajes para contexto de conversación
    const historial = dbAll(
      'SELECT contenido, de_coach FROM mensajes WHERE cliente_id=? ORDER BY created_at DESC LIMIT 10',
      [clienteId]
    ).reverse();

    // Peso actual y último checkin
    const ultimoPeso = dbGet('SELECT peso, grasa FROM peso_registros WHERE cliente_id=? ORDER BY rowid DESC LIMIT 1', [clienteId]);
    const ultimoCheckin = dbGet('SELECT sueno, energia FROM checkins WHERE cliente_id=? ORDER BY fecha DESC LIMIT 1', [clienteId]);

    const contexto = [
      `Cliente: ${cl.nombre}`,
      `Objetivo: ${cl.objetivo || '—'}`,
      `Nivel: ${cl.nivel || '—'}`,
      cl.peso_actual ? `Peso: ${cl.peso_actual}kg` : '',
      ultimoPeso?.grasa ? `Grasa: ${ultimoPeso.grasa}%` : '',
      ultimoCheckin ? `Último check-in — sueño: ${ultimoCheckin.sueno}/10, energía: ${ultimoCheckin.energia}/10` : '',
      cl.lesiones ? `Lesiones/limitaciones: ${cl.lesiones}` : '',
      cl.observaciones ? `Notas: ${cl.observaciones}` : '',
    ].filter(Boolean).join('\n');

    const system = isEn
      ? `You are a WolfMindset fitness coach assistant. You respond to clients in a warm, direct, motivating tone — like a real coach who knows them personally. Keep responses concise (2-4 sentences max). Never mention AI or technology. If you don't know something specific about their plan, be honest and say the coach will follow up. NO markdown, NO asterisks, NO bullet points — plain conversational text only. Client context:\n${contexto}`
      : `Eres el asistente del coach de WolfMindset. Respondes a los clientes con un tono cercano, directo y motivador — como un coach real que los conoce. Respuestas concisas (2-4 frases máximo). Nunca menciones IA ni tecnología. Si no sabes algo concreto de su plan, sé honesto y di que el coach lo confirmará. SIN markdown, SIN asteriscos, SIN listas — solo texto conversacional natural. Contexto del cliente:\n${contexto}`;

    const messages = [
      ...historial.map(m => ({ role: m.de_coach ? 'assistant' : 'user', content: m.contenido })),
      { role: 'user', content: mensajeUsuario }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, system, messages })
    });
    const data = await response.json();
    if (data.error || !data.content?.[0]?.text) return null;
    return data.content[0].text.trim();
  } catch(e) { console.error('[IA Chat]', e.message); return null; }
}

// ── POST /mensajes ────────────────────────────────────────────────────────────
// Enviar mensaje. Coach: de_coach=1. Cliente: de_coach=0 → notifica al coach.
// via_ia=1 cuando la IA responde en nombre del coach (solo interno, cliente no lo ve).
router.post('/mensajes', async (req, res) => {
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

    if (de_coach) marcarCoachActivo(cliente_id);

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
          ssePush(coachId, 'badge_msgs', { cliente_id });
          ssePush(coachId, 'mensaje_nuevo', {
            id: r.lastInsertRowid,
            cliente_id,
            contenido: contenido.trim(),
            de_coach: 0,
            via_ia: 0,
            created_at: new Date().toISOString()
          });
        } catch(e) {}
      }

      // ── Respuesta automática IA si el bot está activo para este cliente ──
      if (botDebeResponder(cliente_id)) {
        // No bloqueamos la respuesta al cliente — la IA responde en background
        responderConIA(cliente_id, contenido.trim()).then(replyIA => {
          if (!replyIA) return;
          // Verificar de nuevo si el bot sigue activo — puede haberse desactivado mientras procesaba
          if (!botDebeResponder(cliente_id)) return;
          try {
            const rIA = dbRun(
              'INSERT INTO mensajes (cliente_id, de_coach, via_ia, contenido, leido) VALUES (?,?,?,?,?)',
              [cliente_id, 1, 1, replyIA, 0]
            );
            // Push SSE al cliente y al coach para que ambos vean el hilo sincronizado.
            const clienteUser = dbGet('SELECT user_id, coach_id FROM clientes WHERE id=?', [cliente_id]);
            const msgIA = {
              id: rIA.lastInsertRowid,
              cliente_id,
              contenido: replyIA,
              de_coach: 1,
              via_ia: 1,
              created_at: new Date().toISOString()
            };
            if (clienteUser) {
              ssePush(clienteUser.user_id, 'mensaje_nuevo', msgIA);
              const coachId = clienteUser.coach_id || getCoachIdDeCliente(cliente_id);
              if (coachId) {
                ssePush(coachId, 'mensaje_nuevo', msgIA);
                ssePush(coachId, 'badge_msgs', { cliente_id });
              }
            }
            saveToDisk();
          } catch(e) { console.error('[IA Chat reply]', e.message); }
        }).catch(() => {});
      }

    } else {
      // Coach responde → push SSE al cliente para que reciba el mensaje al instante
      try {
        const clienteUser = dbGet('SELECT user_id FROM clientes WHERE id=?', [cliente_id]);
        if (clienteUser) {
          ssePush(clienteUser.user_id, 'mensaje_nuevo', {
            id: r.lastInsertRowid,
            cliente_id,
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

// ── CONTROL DEL BOT IA EN CHAT ────────────────────────────────────────────────

// GET estado global del bot + estado por cliente
router.get('/ia-chat/config', coachOnly, (req, res) => {
  try {
    const cfg = dbGet('SELECT bot_global FROM ia_config WHERE id=1');
    const clientes = dbAll(`
      SELECT c.id, u.nombre, c.ia_chat_activa
      FROM clientes c JOIN users u ON c.user_id=u.id
      ORDER BY u.nombre ASC
    `);
    res.json({
      bot_global: cfg ? cfg.bot_global : 0,
      clientes: clientes.map(c => ({
        id: c.id,
        nombre: c.nombre,
        ia_activa: c.ia_chat_activa || 0
      }))
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT toggle global del bot (ON/OFF para todos)
router.put('/ia-chat/global', coachOnly, (req, res) => {
  try {
    const { activo } = req.body;
    dbRun('UPDATE ia_config SET bot_global=?, updated_at=CURRENT_TIMESTAMP WHERE id=1', [activo ? 1 : 0]);
    saveToDisk();
    res.json({ ok: true, bot_global: activo ? 1 : 0 });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT toggle bot para un cliente concreto
router.put('/ia-chat/cliente/:id', coachOnly, (req, res) => {
  try {
    const { activo } = req.body;
    dbRun('UPDATE clientes SET ia_chat_activa=? WHERE id=?', [activo ? 1 : 0, req.params.id]);
    saveToDisk();
    res.json({ ok: true, ia_activa: activo ? 1 : 0 });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── PUT /mensajes/:clienteId/leer ─────────────────────────────────────────────
// El coach abre el hilo → marca todos los mensajes del cliente como leídos.
router.put('/mensajes/:clienteId/leer', coachOnly, (req, res) => {
  try {
    marcarCoachActivo(parseInt(req.params.clienteId, 10));
    dbRun(
      'UPDATE mensajes SET leido=1 WHERE cliente_id=? AND de_coach=0 AND leido=0',
      [parseInt(req.params.clienteId, 10)]
    );
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── IMÁGENES DE EJERCICIOS (ruta ligera para clientes) ──────────────────────
// Devuelve solo {nombre -> imagen_url} para ejercicios con imagen personalizada
// Separado de loadCD para no meter base64 en el JSON principal
router.get('/ejercicios-imagenes', (req, res) => {
  try {
    const rows = dbAll("SELECT nombre, imagen_url FROM ejercicios_config WHERE imagen_url IS NOT NULL AND imagen_url != ''", []);
    const map = {};
    rows.forEach(r => { map[r.nombre] = r.imagen_url; });
    // Also check ejercicios_dia for direct overrides
    const diasRows = dbAll("SELECT DISTINCT nombre, imagen_url FROM ejercicios_dia WHERE imagen_url IS NOT NULL AND imagen_url != '' AND imagen_url != '__HAS_IMAGE__'", []);
    diasRows.forEach(r => { if(!map[r.nombre]) map[r.nombre] = r.imagen_url; });
    res.json(map);
  } catch(e) { res.json({}); }
});

// ── RESET PASSWORD (coach resetea la de un cliente) ─────────────────────────
// Nota: esta ruta usa prefijo /coach/ en vez de /auth/ para evitar conflicto
// con el authRouter montado en /api/auth en server.js (que intercepta primero).
router.post('/coach/reset-cliente-password', coachOnly, (req, res) => {
  const { userId, newPassword } = req.body;
  if(!userId || !newPassword) return res.status(400).json({ error: 'Faltan campos' });
  if(newPassword.length < 4) return res.status(400).json({ error: 'Mínimo 4 caracteres' });
  try {
    const bcrypt = require('bcryptjs');
    const user = dbGet('SELECT id, role FROM users WHERE id=?', [userId]);
    if(!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if(user.role === 'coach' && req.user.id !== user.id) {
      return res.status(403).json({ error: 'No puedes resetear la contraseña de otro coach' });
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    dbRun('UPDATE users SET password=? WHERE id=?', [hash, userId]);
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── COACH CAMBIA SU PROPIA CONTRASEÑA ────────────────────────────────────────
router.post('/auth/change-my-password', (req, res) => {
  const { password_actual, password_nueva } = req.body;
  if(!password_actual || !password_nueva) return res.status(400).json({ error: 'Faltan campos' });
  if(password_nueva.length < 6) return res.status(400).json({ error: 'Mínimo 6 caracteres' });
  try {
    const bcrypt = require('bcryptjs');
    const user = dbGet('SELECT id, password FROM users WHERE id=?', [req.user.id]);
    if(!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if(!bcrypt.compareSync(password_actual, user.password)) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    const hash = bcrypt.hashSync(password_nueva, 10);
    dbRun('UPDATE users SET password=? WHERE id=?', [hash, req.user.id]);
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── PUSH TIMER (para iOS — el servidor manda el push cuando termina el descanso) ──
// iOS mata el SW al bloquear pantalla, así que el timer vive en el servidor
const _pushTimers = {}; // userId+timerId -> setTimeout handle

router.post('/push/timer', (req, res) => {
  const { timerId, segundos, title, body } = req.body;
  if(!timerId || !segundos) return res.status(400).json({ error: 'timerId y segundos requeridos' });
  const userId = String(req.user.id);
  const key = userId + '_' + timerId;

  // Cancel existing timer for this key
  if(_pushTimers[key]) { clearTimeout(_pushTimers[key]); delete _pushTimers[key]; }

  const delay = Math.min(Math.max(parseInt(segundos), 1), 600) * 1000; // max 10 min
  _pushTimers[key] = setTimeout(async () => {
    delete _pushTimers[key];
    if(global.sendPushToUser) {
      await global.sendPushToUser(userId, title || '💪 ¡A por ello!', body || 'Descanso terminado', '/');
    }
  }, delay);

  res.json({ ok: true, delay });
});

router.post('/push/timer/cancel', (req, res) => {
  const { timerId } = req.body;
  const userId = String(req.user.id);
  const key = timerId ? userId + '_' + timerId : null;
  if(key && _pushTimers[key]) {
    clearTimeout(_pushTimers[key]);
    delete _pushTimers[key];
  } else if(!timerId) {
    // Cancel all timers for this user
    Object.keys(_pushTimers).filter(k => k.startsWith(userId + '_')).forEach(k => {
      clearTimeout(_pushTimers[k]); delete _pushTimers[k];
    });
  }
  res.json({ ok: true });
});

// ── PUSH SUBSCRIPTIONS ───────────────────────────────────────────────────────
// El cliente registra su dispositivo para recibir push
router.post('/push/subscribe', (req, res) => {
  const { subscription } = req.body;
  if(!subscription || !subscription.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  try {
    // Delete old subscription for same endpoint (re-registration)
    dbRun('DELETE FROM push_subscriptions WHERE user_id=? AND subscription LIKE ?',
      [req.user.id, '%' + subscription.endpoint.slice(-40) + '%']);
    dbRun('INSERT INTO push_subscriptions (user_id, subscription) VALUES (?,?)',
      [req.user.id, JSON.stringify(subscription)]);
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/push/unsubscribe', (req, res) => {
  try {
    const { endpoint } = req.body;
    if(endpoint) {
      dbRun('DELETE FROM push_subscriptions WHERE user_id=? AND subscription LIKE ?',
        [req.user.id, '%' + endpoint.slice(-40) + '%']);
    } else {
      dbRun('DELETE FROM push_subscriptions WHERE user_id=?', [req.user.id]);
    }
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Devolver la clave pública VAPID al cliente para que pueda suscribirse
router.get('/push/vapid-key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY || 'BGXVsTmH4dCRzJk2vPoqMX08DtwH_EBk2fF42nIQGfubO9utSacLfZxCF4wTBQxDrH50S_8aZuUg5oKppHqF51A';
  res.json({ publicKey: key });
});


// ══════════════════════════════════════════════════════════════════════════════
// SISTEMA DE PLANTILLAS v2 — días individuales + semanas completas
// ══════════════════════════════════════════════════════════════════════════════

// ── Helper: calcula series totales por músculo (agrupadas en grupos enteros) ──
// Usa el mapeo de muscle-volume.js para devolver totales por grupo entero
// (Pecho, Espalda, Hombros, Bíceps, Tríceps, Cuádriceps, Femorales, Glúteos,
// Gemelos, Core) en lugar de cada cabeza/porción suelta.
function calcularResumenMusculos(dias) {
  const rawMap = {};
  (dias || []).forEach(dia => {
    (dia.ejercicios || []).forEach(ex => {
      (ex.musculos || '').split(',').map(m => m.trim()).filter(Boolean).forEach(m => {
        rawMap[m] = (rawMap[m] || 0) + (parseInt(ex.series) || 0);
      });
    });
  });
  const { grouped } = groupByMuscle(rawMap);
  return grouped;
}

// ── Helper: construye objeto plantilla completo desde row BD ─────────────────
function buildPlantilla(p) {
  let dias = [];
  try { dias = JSON.parse(p.dias_json || '[]'); } catch(e) {}
  const numEj = dias.reduce((a, d) => a + (d.ejercicios || []).length, 0);
  return { ...p, dias, resumen: calcularResumenMusculos(dias), num_ejercicios: p.num_ejercicios || numEj };
}

// ── GET /api/revision-semanal/:cliente_id ────────────────────────────────────
// Devuelve la revisión semanal con volumen agrupado por músculo entero
// y rangos óptimos personalizados según el perfil del cliente
// (nivel, objetivo, edad, lesiones, deficiencias). Basado en evidencia:
// Schoenfeld 2017, Baz-Valle 2022, Israetel (RP) MV/MEV/MAV/MRV.
router.get('/revision-semanal/:cliente_id', (req, res) => {
  try {
    const clienteId = parseInt(req.params.cliente_id);

    // Permisos: el propio cliente o un coach
    if (req.user.role !== 'coach') {
      const c = dbGet('SELECT id FROM clientes WHERE user_id = ?', [req.user.id]);
      if (!c || c.id !== clienteId) {
        return res.status(403).json({ error: 'sin permiso' });
      }
    }

    const cliente = dbGet('SELECT * FROM clientes WHERE id = ?', [clienteId]);
    if (!cliente) return res.status(404).json({ error: 'cliente no encontrado' });

    // Cargar rutina publicada (semana actual)
    const dias = dbAll(
      'SELECT * FROM dias_entreno WHERE cliente_id = ? ORDER BY orden',
      [clienteId]
    ).map(d => {
      const ejercicios = dbAll(
        'SELECT id, nombre, musculos, series FROM ejercicios_dia WHERE dia_id = ? ORDER BY orden',
        [d.id]
      );
      return { ...d, ejercicios };
    });

    // Cargar log de series de las últimas 4 semanas (para análisis de progresión).
    const hace28dias = new Date(Date.now() - 28 * 86400000).toISOString();
    const seriesLog = dbAll(`
      SELECT sl.peso_real, sl.reps_real, sl.rir, se.fecha,
             COALESCE(ed.musculos, sl.ejercicio_nombre) AS musculos
      FROM series_log sl
      JOIN sesiones_entreno se ON se.id = sl.sesion_id
      LEFT JOIN ejercicios_dia ed ON ed.nombre = sl.ejercicio_nombre
      WHERE se.cliente_id = ? AND se.fecha >= ?
        AND sl.peso_real > 0 AND sl.reps_real > 0
    `, [clienteId, hace28dias]);

    const analisis = analizarSemana(dias, cliente, seriesLog);

    // Separar "deficiencias" en dos: las que son grupos musculares (prioridades
    // de entreno) y las que son notas médicas/nutricionales (vitaminas, etc).
    // Así la UI solo muestra como "prioridad" lo que realmente afecta al volumen.
    const _todasDef = (cliente.deficiencias || '').split(',').map(s => s.trim()).filter(Boolean);
    const prioridadesMusculares = _todasDef.filter(d => isMuscleGroup(d));
    const notasNutricionales = _todasDef.filter(d => !isMuscleGroup(d));

    res.json({
      perfil: {
        nivel: cliente.nivel,
        objetivo: cliente.objetivo,
        edad: cliente.edad,
        prioridades: prioridadesMusculares,
        notas_nutricionales: notasNutricionales,
        lesiones: (cliente.lesiones || '').split(',').map(s => s.trim()).filter(Boolean)
      },
      grupos: analisis.grupos,        // [{muscle, sets, range, estado}]
      sugerencias: analisis.sugerencias,
      recomendacion_nivel: analisis.recomendacionNivel, // null o {actual, sugerido, razon, ...}
      unmapped: analisis.unmapped      // músculos sin clasificar (warning)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/aplicar-sugerencias/:cliente_id ────────────────────────────────
// Aplica automáticamente las sugerencias de subir/bajar series.
// Reparte el delta de series entre los ejercicios del grupo, proporcionalmente
// a las series actuales. Solo coach puede ejecutar esto.
router.post('/aplicar-sugerencias/:cliente_id', coachOnly, (req, res) => {
  try {
    const clienteId = parseInt(req.params.cliente_id);
    const sugerencias = (req.body && req.body.sugerencias) || [];

    if (!Array.isArray(sugerencias) || !sugerencias.length) {
      return res.status(400).json({ error: 'sin sugerencias para aplicar' });
    }

    const dias = dbAll('SELECT * FROM dias_entreno WHERE cliente_id = ?', [clienteId]);
    const ejercicios = [];
    dias.forEach(d => {
      const ejs = dbAll('SELECT id, nombre, musculos, series FROM ejercicios_dia WHERE dia_id = ?', [d.id]);
      ejs.forEach(e => ejercicios.push({ ...e, dia_id: d.id }));
    });

    const aplicados = [];
    const ignorados = [];

    for (const sug of sugerencias) {
      if (!sug.aplicable_auto) {
        ignorados.push({ muscle: sug.muscle, razon: 'sugerencia informativa, no automatizable' });
        continue;
      }
      if (sug.accion === 'mantener' || !sug.delta) continue;

      const ejsDelGrupo = ejercicios.filter(e => {
        const primerMusc = String(e.musculos || '').split(',')[0].trim();
        return isMuscleGroup(primerMusc) && _grupoDe(primerMusc) === sug.muscle;
      });

      if (!ejsDelGrupo.length) {
        ignorados.push({ muscle: sug.muscle, razon: 'no se encontraron ejercicios target de ese grupo' });
        continue;
      }

      let totalDelta;
      if (sug.accion === 'subir')  totalDelta = +Math.abs(sug.delta);
      else if (sug.accion === 'bajar')  totalDelta = -Math.abs(sug.delta);
      else if (sug.accion === 'deload') totalDelta = sug.delta;
      else continue;

      const totalSeriesActuales = ejsDelGrupo.reduce((a, e) => a + (e.series || 0), 0);
      if (!totalSeriesActuales) continue;

      let repartido = 0;
      const cambios = [];
      ejsDelGrupo.forEach((e, idx) => {
        let cuota;
        if (idx === ejsDelGrupo.length - 1) {
          cuota = totalDelta - repartido;
        } else {
          cuota = Math.round(totalDelta * (e.series / totalSeriesActuales));
          repartido += cuota;
        }
        const nuevasSeries = Math.max(1, (e.series || 0) + cuota);
        if (nuevasSeries !== e.series) {
          dbRun('UPDATE ejercicios_dia SET series = ? WHERE id = ?', [nuevasSeries, e.id]);
          cambios.push({ ejercicio: e.nombre, antes: e.series, despues: nuevasSeries });
        }
      });
      aplicados.push({ muscle: sug.muscle, accion: sug.accion, delta_total: totalDelta, cambios });
    }

    saveToDisk();

    try { ssePush(clienteId, { tipo: 'rutina_actualizada' }); } catch(e) {}
    try { ssePushCoaches({ tipo: 'rutina_actualizada', cliente_id: clienteId }); } catch(e) {}

    res.json({ aplicados, ignorados });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function _grupoDe(musc) {
  const { MUSCLE_GROUPS } = require('./muscle-volume');
  const norm = String(musc || '').toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [grupo, miembros] of Object.entries(MUSCLE_GROUPS)) {
    if (miembros.some(m => m.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') === norm)) return grupo;
  }
  return null;
}

// ── GET /api/plantillas — listar plantillas ───────────────────────────────────
// Query params opcionales: ?tipo=dia | ?tipo=semana | ?objetivo=X | ?nivel=X
router.get('/plantillas', coachOnly, (req, res) => {
  try {
    let sql = `SELECT * FROM rutinas_plantillas WHERE coach_id = ?`;
    const params = [req.user.id];
    if (req.query.tipo)     { sql += ` AND tipo = ?`;     params.push(req.query.tipo); }
    if (req.query.objetivo) { sql += ` AND objetivo = ?`; params.push(req.query.objetivo); }
    if (req.query.nivel)    { sql += ` AND nivel = ?`;    params.push(req.query.nivel); }
    sql += ` ORDER BY updated_at DESC`;
    const plantillas = dbAll(sql, params);
    res.json(plantillas.map(buildPlantilla));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/plantillas — crear plantilla (semana o día) ────────────────────
router.post('/plantillas', coachOnly, (req, res) => {
  try {
    const { nombre, descripcion, objetivo, nivel, dias,
            tipo, tipo_rutina, grupo_dominante, duracion_estimada,
            fatiga_estimada, lugar } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const diasArr = dias || [];
    const numEj = diasArr.reduce((a, d) => a + (d.ejercicios || []).length, 0);
    const r = dbRun(
      `INSERT INTO rutinas_plantillas
        (coach_id, nombre, descripcion, objetivo, nivel, dias_json, usos,
         tipo, tipo_rutina, grupo_dominante, duracion_estimada, fatiga_estimada, num_ejercicios, lugar)
       VALUES (?,?,?,?,?,?,0,?,?,?,?,?,?,?)`,
      [req.user.id, nombre.trim(), descripcion||'', objetivo||'', nivel||'Intermedio',
       JSON.stringify(diasArr), tipo||'semana', tipo_rutina||'', grupo_dominante||'',
       duracion_estimada||0, fatiga_estimada||'Media', numEj, lugar||'Gimnasio']
    );
    saveToDisk();
    res.json(buildPlantilla(dbGet('SELECT * FROM rutinas_plantillas WHERE id=?', [r.lastInsertRowid])));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── PUT /api/plantillas/:id — editar metadatos ────────────────────────────────
router.put('/plantillas/:id', coachOnly, (req, res) => {
  try {
    const p = dbGet('SELECT * FROM rutinas_plantillas WHERE id=? AND coach_id=?', [req.params.id, req.user.id]);
    if (!p) return res.status(404).json({ error: 'Plantilla no encontrada' });
    const { nombre, descripcion, objetivo, nivel, dias,
            tipo, tipo_rutina, grupo_dominante, duracion_estimada,
            fatiga_estimada, lugar } = req.body;
    const diasArr = dias !== undefined ? dias : JSON.parse(p.dias_json || '[]');
    const numEj = diasArr.reduce((a, d) => a + (d.ejercicios || []).length, 0);
    dbRun(
      `UPDATE rutinas_plantillas SET
        nombre=?, descripcion=?, objetivo=?, nivel=?, dias_json=?,
        tipo=?, tipo_rutina=?, grupo_dominante=?, duracion_estimada=?,
        fatiga_estimada=?, num_ejercicios=?, lugar=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND coach_id=?`,
      [nombre||p.nombre, descripcion!==undefined?descripcion:p.descripcion,
       objetivo||p.objetivo, nivel||p.nivel, JSON.stringify(diasArr),
       tipo||p.tipo||'semana', tipo_rutina!==undefined?tipo_rutina:p.tipo_rutina||'',
       grupo_dominante!==undefined?grupo_dominante:p.grupo_dominante||'',
       duracion_estimada!==undefined?duracion_estimada:p.duracion_estimada||0,
       fatiga_estimada||p.fatiga_estimada||'Media', numEj,
       lugar||p.lugar||'Gimnasio', req.params.id, req.user.id]
    );
    saveToDisk();
    res.json(buildPlantilla(dbGet('SELECT * FROM rutinas_plantillas WHERE id=?', [req.params.id])));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE /api/plantillas/:id ────────────────────────────────────────────────
router.delete('/plantillas/:id', coachOnly, (req, res) => {
  try {
    const p = dbGet('SELECT id FROM rutinas_plantillas WHERE id=? AND coach_id=?', [req.params.id, req.user.id]);
    if (!p) return res.status(404).json({ error: 'Plantilla no encontrada' });
    dbRun('DELETE FROM rutinas_plantillas WHERE id=?', [req.params.id]);
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/plantillas/:id/aplicar — copiar días al cliente ────────────────
router.post('/plantillas/:id/aplicar', coachOnly, async (req, res) => {
  try {
    const { clienteId, reemplazar } = req.body;
    if (!clienteId) return res.status(400).json({ error: 'clienteId requerido' });
    const p = dbGet('SELECT * FROM rutinas_plantillas WHERE id=? AND coach_id=?', [req.params.id, req.user.id]);
    if (!p) return res.status(404).json({ error: 'Plantilla no encontrada' });
    let dias = []; try { dias = JSON.parse(p.dias_json || '[]'); } catch(e) {}
    if (!dias.length) return res.status(400).json({ error: 'La plantilla no tiene días' });
    if (reemplazar) {
      const viejos = dbAll('SELECT id FROM dias_entreno WHERE cliente_id=?', [clienteId]);
      viejos.forEach(d => {
        dbRun('DELETE FROM ejercicios_dia WHERE dia_id=?', [d.id]);
        dbRun('DELETE FROM dias_entreno WHERE id=?', [d.id]);
      });
    }
    // Calcular el siguiente orden disponible
    const ordenBase = reemplazar ? 0 : (dbGet('SELECT MAX(orden) as m FROM dias_entreno WHERE cliente_id=?', [clienteId])?.m ?? -1) + 1;
    for (let i = 0; i < dias.length; i++) {
      const dia = dias[i];
      const diaResult = dbRun('INSERT INTO dias_entreno (cliente_id, nombre, grupo, orden) VALUES (?,?,?,?)',
        [clienteId, dia.nombre||`Día ${i+1}`, dia.grupo||'', ordenBase + i]);
      const diaId = diaResult.lastInsertRowid;
      (dia.ejercicios || []).forEach((ex, j) => {
        const cfg = dbGet('SELECT youtube_url, imagen_url FROM ejercicios_config WHERE nombre=?', [ex.nombre]);
        dbRun(
          `INSERT INTO ejercicios_dia (dia_id, nombre, musculos, series, reps, peso_objetivo, descanso, rir, es_principal, orden, youtube_url, imagen_url, nota_coach, superset_grupo)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [diaId, ex.nombre||'', ex.musculos||'', ex.series||3, ex.reps||'10-12',
           ex.peso_objetivo||0, ex.descanso||90, ex.rir??null, ex.es_principal||0, j,
           cfg?.youtube_url||ex.youtube_url||'', cfg?.imagen_url||ex.imagen_url||'', ex.nota_coach||'', ex.superset_grupo||0]
        );
      });
    }
    dbRun('UPDATE rutinas_plantillas SET usos=usos+1, updated_at=CURRENT_TIMESTAMP WHERE id=?', [req.params.id]);
    saveToDisk();
    res.json({ ok: true, diasCreados: dias.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/plantillas/desde-dia — snapshot de un día → nueva plantilla ────
router.post('/plantillas/desde-dia', coachOnly, (req, res) => {
  try {
    const { diaId, nombre, descripcion, nivel, objetivo,
            tipo_rutina, grupo_dominante, duracion_estimada, fatiga_estimada, lugar } = req.body;
    if (!diaId || !nombre) return res.status(400).json({ error: 'diaId y nombre requeridos' });
    const dia = dbGet('SELECT * FROM dias_entreno WHERE id=?', [diaId]);
    if (!dia) return res.status(404).json({ error: 'Día no encontrado' });
    const ejercicios = dbAll('SELECT * FROM ejercicios_dia WHERE dia_id=? ORDER BY orden ASC', [diaId]);
    const snapshot = [{
      nombre: dia.nombre, grupo: dia.grupo || '',
      ejercicios: ejercicios.map(ex => ({
        nombre: ex.nombre, musculos: ex.musculos, series: ex.series, reps: ex.reps,
        peso_objetivo: ex.peso_objetivo, descanso: ex.descanso, rir: ex.rir,
        es_principal: ex.es_principal, youtube_url: ex.youtube_url||'',
        imagen_url: ex.imagen_url||'', nota_coach: ex.nota_coach||''
      }))
    }];
    // Calcular grupo dominante automáticamente si no se pasa
    const grupoAuto = grupo_dominante || dia.grupo || '';
    const r = dbRun(
      `INSERT INTO rutinas_plantillas
        (coach_id, nombre, descripcion, objetivo, nivel, dias_json, usos,
         tipo, tipo_rutina, grupo_dominante, duracion_estimada, fatiga_estimada, num_ejercicios, lugar)
       VALUES (?,?,?,?,?,?,0,'dia',?,?,?,?,?,?)`,
      [req.user.id, nombre.trim(), descripcion||'', objetivo||'', nivel||'Intermedio',
       JSON.stringify(snapshot), tipo_rutina||'', grupoAuto,
       duracion_estimada||0, fatiga_estimada||'Media', ejercicios.length, lugar||'Gimnasio']
    );
    saveToDisk();
    res.json(buildPlantilla(dbGet('SELECT * FROM rutinas_plantillas WHERE id=?', [r.lastInsertRowid])));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// IA: GENERAR RUTINA COMPLETA — usa plantillas de la librería + datos del cliente
// POST /api/ia/generar-rutina
// Body: { clienteId, diasSemana, guardarComo, nombrePlantilla, reemplazar,
//         objetivo, nivel, lesiones, rezagados, lugar, tiempoSesion,
//         ejerciciosProhibidos, ejerciciosFavoritos, tipoRutina }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/ia/generar-rutina', coachOnly, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });

  const { clienteId, diasSemana, guardarComo, nombrePlantilla, reemplazar,
          // Parámetros extra del formulario avanzado
          objetivo: objOverride, nivel: nivelOverride, lesiones: lesionesOverride,
          rezagados, lugar, tiempoSesion, ejerciciosProhibidos, ejerciciosFavoritos,
          tipoRutina } = req.body;

  if (!clienteId || !diasSemana) return res.status(400).json({ error: 'clienteId y diasSemana requeridos' });

  // 1. Datos del cliente
  const cliente = dbGet(`SELECT c.*, u.nombre FROM clientes c JOIN users u ON u.id=c.user_id WHERE c.id=?`, [clienteId]);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  // Usar overrides del formulario si los hay, si no los del perfil del cliente
  const nivelFinal    = nivelOverride    || cliente.nivel    || 'Intermedio';
  const objetivoFinal = objOverride      || cliente.objetivo || 'Volumen';
  const lesionesF     = lesionesOverride || cliente.lesiones || '';

  // 2. Ejercicios disponibles en BD
  const ejerciciosDB = dbAll('SELECT nombre, musculos, grupo, dificultad, equipo FROM ejercicios_db ORDER BY grupo', []);
  const ejerciciosPorGrupo = {};
  ejerciciosDB.forEach(e => {
    if (!ejerciciosPorGrupo[e.grupo]) ejerciciosPorGrupo[e.grupo] = [];
    ejerciciosPorGrupo[e.grupo].push(`${e.nombre} (${e.musculos})`);
  });
  const listaEjercicios = Object.entries(ejerciciosPorGrupo)
    .map(([g, exs]) => `${g}: ${exs.slice(0, 12).join(', ')}`).join('\n');

  // 3. Historial de pesos reales (últimas 8 semanas)
  let historialPesos = '';
  try {
    const rows = dbAll(
      `SELECT sl.ejercicio_nombre, MAX(sl.peso_real) as max_peso, MAX(sl.reps_real) as max_reps
       FROM sesiones_entreno se JOIN series_log sl ON sl.sesion_id=se.id
       WHERE se.cliente_id=? AND se.fecha>=date('now','-56 days') AND sl.peso_real>0
       GROUP BY sl.ejercicio_nombre ORDER BY sl.ejercicio_nombre`,
      [clienteId]
    );
    if (rows.length) historialPesos = rows.map(s => `  ${s.ejercicio_nombre}: ${s.max_peso}kg × ${s.max_reps} reps`).join('\n');
  } catch(e) {}

  // 4. Frecuencia real de asistencia
  let frecuenciaReal = '';
  try {
    const a = dbGet(
      `SELECT COUNT(*) as total, COUNT(DISTINCT strftime('%W-%Y',fecha)) as semanas
       FROM sesiones_entreno WHERE cliente_id=? AND fecha>=date('now','-56 days') AND estado!='incompleto'`,
      [clienteId]
    );
    if (a?.total > 0) {
      const media = (a.total / Math.max(a.semanas, 1)).toFixed(1);
      frecuenciaReal = `${a.total} sesiones en 8 semanas (media real: ${media} días/semana)`;
    }
  } catch(e) {}

  // 5. Último análisis corporal
  let ultimoAnalisis = '';
  try {
    const f = dbGet(
      `SELECT published_analysis, analysis FROM fotos
       WHERE cliente_id=? AND published_analysis IS NOT NULL AND published_analysis!=''
       ORDER BY fecha DESC LIMIT 1`, [clienteId]
    ) || dbGet(
      `SELECT analysis FROM fotos WHERE cliente_id=? AND analysis IS NOT NULL AND analysis!=''
       ORDER BY fecha DESC LIMIT 1`, [clienteId]
    );
    if (f) {
      ultimoAnalisis = (f.published_analysis || f.analysis || '').replace(/\n{3,}/g, '\n\n').trim();
      if (ultimoAnalisis.length > 800) ultimoAnalisis = ultimoAnalisis.slice(0, 800) + '…';
    }
  } catch(e) {}

  // 6. Plantillas compatibles de la librería del coach
  let plantillasCompatibles = '';
  try {
    const dias_candidatos = dbAll(
      `SELECT nombre, grupo_dominante, num_ejercicios, duracion_estimada, fatiga_estimada, tipo_rutina, dias_json
       FROM rutinas_plantillas
       WHERE coach_id=? AND tipo='dia'
         AND (nivel='' OR nivel=? OR nivel IS NULL)
         AND (objetivo='' OR objetivo=? OR objetivo IS NULL)
       ORDER BY usos DESC LIMIT 12`,
      [req.user.id, nivelFinal, objetivoFinal]
    );
    if (dias_candidatos.length) {
      plantillasCompatibles = dias_candidatos.map(p => {
        let primDia = {};
        try { primDia = JSON.parse(p.dias_json||'[]')[0] || {}; } catch(e) {}
        const exs = (primDia.ejercicios||[]).slice(0,4).map(e=>e.nombre).join(', ');
        return `  • "${p.nombre}" [${p.grupo_dominante||'—'}] ${p.num_ejercicios||0} ejerc. ~${p.duracion_estimada||'?'}min fatiga:${p.fatiga_estimada||'?'} → ${exs}`;
      }).join('\n');
    }
  } catch(e) {}

  // 7. IMC
  let imc = '';
  if (cliente.peso_actual && cliente.altura) {
    const h = cliente.altura / 100;
    imc = (cliente.peso_actual / (h * h)).toFixed(1);
  }

  // 8. Construir prompt
  // Calcular rangos óptimos por grupo muscular para ESTE cliente concreto
  // (basado en evidencia: Schoenfeld 2017, Baz-Valle 2022, Israetel MV/MEV/MAV/MRV)
  const _clienteParaRangos = { ...cliente, nivel: nivelFinal, objetivo: objetivoFinal };
  const _gruposClave = ['Pecho','Espalda','Hombros','Bíceps','Tríceps',
                        'Cuádriceps','Femorales','Glúteos','Gemelos'];
  const rangosOptimos = _gruposClave.map(g => {
    const r = getOptimalRange(g, _clienteParaRangos);
    return `- ${g}: ${r.optimal_low}-${r.optimal_high} series/semana (MEV ${r.min}, MRV ${r.max})`;
  }).join('\n');

  const clienteInfo = `
PERFIL DEL CLIENTE:
- Nombre: ${cliente.nombre}
- Nivel: ${nivelFinal}
- Objetivo: ${objetivoFinal}
- Edad: ${cliente.edad||'no indicada'} | Sexo: ${cliente.sexo||'no indicado'}
- Peso: ${cliente.peso_actual||'?'}kg | Altura: ${cliente.altura||'?'}cm${imc?` | IMC: ${imc}`:''}
- Actividad habitual: ${cliente.actividad||'Moderada'}
- Kcal/día: ${cliente.kcal_internas||'no indicadas'} | Proteína: ${cliente.prot||'?'}g
- Lesiones / zonas a evitar: ${lesionesF||'ninguna'}
- Músculos rezagados / prioridad: ${rezagados||cliente.deficiencias||'ninguno'}
- Lugar de entrenamiento: ${lugar||'Gimnasio'}
- Tiempo disponible por sesión: ${tiempoSesion||'60'} minutos
- Ejercicios prohibidos: ${ejerciciosProhibidos||'ninguno'}
- Ejercicios favoritos: ${ejerciciosFavoritos||'ninguno'}
- Tipo de rutina deseado: ${tipoRutina||'libre'}
- Días de entrenamiento por semana: ${diasSemana}
- Frecuencia real de asistencia: ${frecuenciaReal||'sin datos'}
- Observaciones del coach: ${cliente.observaciones||'ninguna'}
- Notas del coach: ${cliente.notas_coach||'ninguna'}`.trim();

  const histSection  = historialPesos   ? `\nRENDIMIENTO REAL (últimas 8 semanas — usa para peso_objetivo con +2.5-5% progresión):\n${historialPesos}` : '';
  const analSection  = ultimoAnalisis   ? `\nANÁLISIS CORPORAL (foto progreso más reciente):\n${ultimoAnalisis}` : '';
  const plantSection = plantillasCompatibles ? `\nPLANTILLAS DE MI LIBRERÍA COMPATIBLES (considera usarlas como base):\n${plantillasCompatibles}` : '';

  const prompt = `Eres un coach de fitness experto en programación de entrenamiento para pérdida de grasa y recomposición corporal.

${clienteInfo}
${histSection}
${analSection}
${plantSection}

CONTROL DE VOLUMEN SEMANAL ÓPTIMO (basado en evidencia científica — Schoenfeld 2017, Israetel/RP — ajustado a este cliente concreto):
${rangosOptimos}

La rutina semanal completa DEBE caer dentro del rango óptimo de cada grupo muscular. No bajes del MEV (mínimo efectivo) ni superes el MRV (máximo recuperable).

EJERCICIOS DISPONIBLES EN LA APP (usa los nombres EXACTOS):
${listaEjercicios}

REGLAS OBLIGATORIAS:
1. Respeta ESTRICTAMENTE los rangos de volumen semanal por grupo muscular indicados arriba — cuenta las series totales por grupo entero (Pecho, Espalda, etc.) sumando todos los días
2. Si tiene lesiones, EVITA completamente esos ejercicios y añade nota_coach con la alternativa segura
3. Si hay músculos rezagados, dales mayor volumen y frecuencia semanal
4. No entrenes el mismo músculo dos días seguidos — respeta recuperación
5. Cada día: entre ${nivelFinal==='Principiante'?'4-5':nivelFinal==='Avanzado'?'6-8':'5-7'} ejercicios
6. Descansos: ejercicios compuestos principales 90-120s, accesorios 45-60s
7. Reps según objetivo: Fuerza 3-6, Volumen/Hipertrofia 8-12, Definición/Recomposición 10-15, Resistencia 15-20
8. Marca siempre 1 ejercicio como principal por día (es_principal:1) — debe ser compuesto
9. Si hay historial de pesos reales, úsalo para peso_objetivo con progresión +2.5-5%
10. Si el objetivo incluye pérdida de grasa: prioriza multiarticulares, añade al menos 1 ejercicio de alta activación metabólica por día
11. Si hay análisis corporal de fotos, úsalo para detectar zonas con más trabajo necesario
12. Respeta el tiempo disponible por sesión: ajusta número de ejercicios y series
13. Ejercicios prohibidos: NUNCA los incluyas bajo ningún concepto
14. nota_coach debe ser específica y útil — menciona técnica, respiración o contexto del cliente

Responde ÚNICAMENTE con JSON válido, sin texto, sin markdown.

SUPERSERIES — cómo usarlas:
- Si agrupas dos ejercicios como superserie, dales el mismo valor en "superset_grupo" (ej: 1, 2, 3...)
- Úsalas en ejercicios ANTAGÓNICOS (bíceps+tríceps, pecho+espalda, cuádriceps+femoral)
- El descanso del ejercicio A en superserie debe ser 0 (pasa directo al B)
- El descanso del ejercicio B es el descanso real (60-90s)
- Máximo 2 superseries por día para Principiante, 3 para Intermedio, 4 para Avanzado

RIR (Reps In Reserve) — guía:
- Fuerza: RIR 1-2 | Volumen/Hipertrofia: RIR 2-3 | Definición: RIR 2-3 | Principiante: siempre RIR 3+
- Si el objetivo es recomposición o pérdida de grasa: RIR 2 en compuestos, RIR 1-2 en accesorios

Formato exacto:
{
  "nombre": "nombre descriptivo de la rutina",
  "descripcion": "descripción del enfoque adaptada a este cliente específico",
  "dias": [
    {
      "nombre": "Día 1 – Nombre",
      "grupo": "grupo muscular principal",
      "ejercicios": [
        {
          "nombre": "nombre exacto del ejercicio",
          "musculos": "músculo1, músculo2",
          "series": 3,
          "reps": "10-12",
          "peso_objetivo": 0,
          "descanso": 90,
          "rir": 2,
          "es_principal": 1,
          "superset_grupo": 0,
          "nota_coach": "nota específica para este cliente"
        }
      ]
    }
  ]
}`;

  // 9. Llamar a Claude
  let rutina;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 6000,
        system: 'Eres un experto en programación de entrenamiento. Responde SOLO con JSON válido, sin texto adicional.',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    let raw = data.content[0].text.trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();
    rutina = JSON.parse(raw);
  } catch(e) {
    return res.status(500).json({ error: 'Error generando rutina con IA: ' + e.message });
  }

  if (!rutina?.dias?.length) return res.status(500).json({ error: 'La IA no generó días válidos' });

  const resultado = { rutina, plantillaId: null, diasCreados: 0 };

  // 10a. Guardar como plantilla de semana completa
  if (guardarComo === 'plantilla' || guardarComo === 'ambos') {
    const nombre = nombrePlantilla || rutina.nombre || `Rutina ${diasSemana}d – ${cliente.nombre}`;
    const numEjTotal = rutina.dias.reduce((a,d) => a+(d.ejercicios||[]).length, 0);
    const r = dbRun(
      `INSERT INTO rutinas_plantillas
        (coach_id, nombre, descripcion, objetivo, nivel, dias_json, usos,
         tipo, tipo_rutina, duracion_estimada, num_ejercicios, lugar)
       VALUES (?,?,?,?,?,?,0,'semana',?,?,?,?)`,
      [req.user.id, nombre, rutina.descripcion||'', objetivoFinal, nivelFinal,
       JSON.stringify(rutina.dias), tipoRutina||'', (tiempoSesion||60)*diasSemana,
       numEjTotal, lugar||'Gimnasio']
    );
    resultado.plantillaId = r.lastInsertRowid;
  }

  // 10b. Aplicar directamente al cliente
  if (guardarComo === 'cliente' || guardarComo === 'ambos') {
    if (reemplazar) {
      const viejos = dbAll('SELECT id FROM dias_entreno WHERE cliente_id=?', [clienteId]);
      viejos.forEach(d => {
        dbRun('DELETE FROM ejercicios_dia WHERE dia_id=?', [d.id]);
        dbRun('DELETE FROM dias_entreno WHERE id=?', [d.id]);
      });
    }
    for (let i = 0; i < rutina.dias.length; i++) {
      const dia = rutina.dias[i];
      const diaResult = dbRun('INSERT INTO dias_entreno (cliente_id, nombre, grupo, orden) VALUES (?,?,?,?)',
        [clienteId, dia.nombre||`Día ${i+1}`, dia.grupo||'', i]);
      const diaId = diaResult.lastInsertRowid;
      (dia.ejercicios || []).forEach((ex, j) => {
        const cfg = dbGet('SELECT youtube_url, imagen_url FROM ejercicios_config WHERE nombre=?', [ex.nombre]);
        dbRun(
          `INSERT INTO ejercicios_dia (dia_id, nombre, musculos, series, reps, peso_objetivo, descanso, rir, es_principal, orden, youtube_url, imagen_url, nota_coach, superset_grupo)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [diaId, ex.nombre, ex.musculos||'', ex.series||3, ex.reps||'10-12',
           ex.peso_objetivo||0, ex.descanso||90, ex.rir??2, ex.es_principal||0, j,
           cfg?.youtube_url||'', cfg?.imagen_url||'', ex.nota_coach||'', ex.superset_grupo||0]
        );
      });
      resultado.diasCreados++;
    }
    saveToDisk();
  }

  res.json(resultado);
});

// ── Aliases /rutinas-plantillas → /plantillas (compatibilidad frontend existente) ──
router.get('/rutinas-plantillas', coachOnly, (req, res) => {
  try {
    const plantillas = dbAll(`SELECT * FROM rutinas_plantillas WHERE coach_id=? ORDER BY updated_at DESC`, [req.user.id]);
    res.json(plantillas.map(buildPlantilla));
  } catch(e) { res.status(500).json({ error: e.message }); }
});
router.post('/rutinas-plantillas', coachOnly, (req, res) => {
  try {
    const { nombre, descripcion, objetivo, nivel, dias } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const diasArr = dias || [];
    const numEj = diasArr.reduce((a,d) => a+(d.ejercicios||[]).length, 0);
    const r = dbRun(
      `INSERT INTO rutinas_plantillas (coach_id,nombre,descripcion,objetivo,nivel,dias_json,usos,tipo,num_ejercicios) VALUES (?,?,?,?,?,?,0,'semana',?)`,
      [req.user.id, nombre.trim(), descripcion||'', objetivo||'', nivel||'Intermedio', JSON.stringify(diasArr), numEj]
    );
    saveToDisk();
    res.json(buildPlantilla(dbGet('SELECT * FROM rutinas_plantillas WHERE id=?', [r.lastInsertRowid])));
  } catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/rutinas-plantillas/:id', coachOnly, (req, res) => {
  try {
    const p = dbGet('SELECT id FROM rutinas_plantillas WHERE id=? AND coach_id=?', [req.params.id, req.user.id]);
    if (!p) return res.status(404).json({ error: 'No encontrada' });
    dbRun('DELETE FROM rutinas_plantillas WHERE id=?', [req.params.id]);
    saveToDisk(); res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
router.post('/rutinas-plantillas/:id/aplicar', coachOnly, async (req, res) => {
  // Redirige al handler principal
  req.params.id = req.params.id;
  try {
    const { clienteId, reemplazar } = req.body;
    if (!clienteId) return res.status(400).json({ error: 'clienteId requerido' });
    const p = dbGet('SELECT * FROM rutinas_plantillas WHERE id=? AND coach_id=?', [req.params.id, req.user.id]);
    if (!p) return res.status(404).json({ error: 'No encontrada' });
    let dias = []; try { dias = JSON.parse(p.dias_json||'[]'); } catch(e) {}
    if (!dias.length) return res.status(400).json({ error: 'Sin días' });
    if (reemplazar) {
      const viejos = dbAll('SELECT id FROM dias_entreno WHERE cliente_id=?', [clienteId]);
      viejos.forEach(d => { dbRun('DELETE FROM ejercicios_dia WHERE dia_id=?',[d.id]); dbRun('DELETE FROM dias_entreno WHERE id=?',[d.id]); });
    }
    const ordenBase = reemplazar ? 0 : (dbGet('SELECT MAX(orden) as m FROM dias_entreno WHERE cliente_id=?',[clienteId])?.m??-1)+1;
    for (let i=0; i<dias.length; i++) {
      const dia=dias[i];
      const dr=dbRun('INSERT INTO dias_entreno (cliente_id,nombre,grupo,orden) VALUES (?,?,?,?)',[clienteId,dia.nombre||`Día ${i+1}`,dia.grupo||'',ordenBase+i]);
      (dia.ejercicios||[]).forEach((ex,j)=>{
        const cfg=dbGet('SELECT youtube_url,imagen_url FROM ejercicios_config WHERE nombre=?',[ex.nombre]);
        dbRun(`INSERT INTO ejercicios_dia (dia_id,nombre,musculos,series,reps,peso_objetivo,descanso,rir,es_principal,orden,youtube_url,imagen_url,nota_coach,superset_grupo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [dr.lastInsertRowid,ex.nombre||'',ex.musculos||'',ex.series||3,ex.reps||'10-12',ex.peso_objetivo||0,ex.descanso||90,ex.rir??null,ex.es_principal||0,j,cfg?.youtube_url||'',cfg?.imagen_url||'',ex.nota_coach||'',ex.superset_grupo||0]);
      });
    }
    dbRun('UPDATE rutinas_plantillas SET usos=usos+1,updated_at=CURRENT_TIMESTAMP WHERE id=?',[req.params.id]);
    saveToDisk(); res.json({ ok:true, diasCreados:dias.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// SISTEMA DE ANÁLISIS IA POR SESIÓN — análisis diario + semanal mejorado
// ══════════════════════════════════════════════════════════════════════════════

// ── Helper: construir prompt de análisis para una sesión ─────────────────────
function buildAnalisisPrompt(sesion, seriesLog, ejerciciosPlan, cliente) {
  const nivel   = cliente.nivel   || 'Intermedio';
  const obj     = cliente.objetivo|| 'Volumen';
  const semanas = cliente.semanas || 1;
  const fase    = semanas % 4 === 0 ? 'Semana de descarga' : `Semana ${semanas%4||4} de mesociclo`;

  // Agrupar series por ejercicio
  const porEj = {};
  seriesLog.forEach(s => {
    if (!porEj[s.ejercicio_nombre]) porEj[s.ejercicio_nombre] = [];
    porEj[s.ejercicio_nombre].push(s);
  });

  const lineas = Object.entries(porEj).map(([nombre, srs]) => {
    const plan = ejerciciosPlan[nombre] || {};
    const pesoObj  = plan.peso_objetivo || 0;
    const rirObj   = plan.rir != null ? plan.rir : 2;
    const pesosReales = srs.map(s => s.peso_real||0);
    const repsReales  = srs.map(s => s.reps_real||0);
    const rirsReales  = srs.filter(s => s.rir != null).map(s => s.rir);
    const pesoMax  = Math.max(...pesosReales);
    const repsMed  = Math.round(repsReales.reduce((a,b)=>a+b,0)/repsReales.length);
    const rirMed   = rirsReales.length ? (rirsReales.reduce((a,b)=>a+b,0)/rirsReales.length).toFixed(1) : null;
    const rm1      = pesoMax * (1 + repsMed/30);
    return `- ${nombre}${plan.es_principal?' [PRINCIPAL]':''}: obj ${pesoObj}kg×${plan.reps||'?'} RIRobj:${rirObj} | real: ${pesoMax}kg×${repsMed}reps${rirMed!==null?' RIRreal:'+rirMed:' (sin RIR)'} | 1RM≈${rm1.toFixed(1)}kg`;
  }).join('\n');

  return `Eres un coach experto en periodización. Analiza esta sesión REAL y proporciona ajustes concretos para la PRÓXIMA vez que el cliente haga este día.

CLIENTE: ${cliente.nombre} | Nivel: ${nivel} | Objetivo: ${obj} | ${fase}
DÍA ANALIZADO: ${sesion.dia_nombre} | Duración: ${sesion.duracion_min||'?'}min | Series totales: ${seriesLog.length}

EJERCICIOS (objetivo vs real):
${lineas}

REGLAS DE PROGRESIÓN según nivel "${nivel}":
- Principiante: sube solo si RIR real ≥ 3 y completó todas las series. Incremento: +2.5kg
- Intermedio: sube si RIR real > RIR objetivo. Incremento: +2.5kg compuestos, +1.25kg accesorios
- Avanzado: sube si RIR real > objetivo por 2+ sesiones seguidas. Incremento: +2.5kg o +5kg

INSTRUCCIONES:
1. Analiza cada ejercicio con RIR real vs objetivo
2. Si no hay RIR registrado, usa solo peso y reps para sugerir
3. Genera un mensaje motivador y claro para el cliente explicando los cambios
4. El mensaje debe sonar como el coach (cercano, directo, motivador) — no menciones la IA
5. Responde SOLO con JSON válido:

{
  "resumen": "análisis general en 2-3 frases (para el coach)",
  "ajustes": [
    {
      "ejercicio": "nombre exacto",
      "ejercicio_id": 0,
      "accion": "subir|bajar|mantener|sin_datos",
      "peso_actual": 0,
      "nuevo_peso": 0,
      "razon": "explicación breve para el coach"
    }
  ],
  "mensaje_cliente": "mensaje completo para enviar al cliente explicando qué cambia en su próxima sesión y por qué. Usa su nombre. Menciona ejercicios específicos. Máximo 5 líneas. Sin markdown."
}`;
}

// ── Función core: lanzar análisis IA de una sesión ───────────────────────────
async function ejecutarAnalisisIA(sesionId, clienteId, coachId) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('API key no configurada');

  const sesion = dbGet('SELECT * FROM sesiones_entreno WHERE id=?', [sesionId]);
  if (!sesion) throw new Error('Sesión no encontrada');

  const seriesLog = dbAll('SELECT * FROM series_log WHERE sesion_id=? ORDER BY ejercicio_nombre, serie_num', [sesionId]);
  if (!seriesLog.length) throw new Error('Sin series registradas');

  const cliente = dbGet('SELECT c.*, u.nombre FROM clientes c JOIN users u ON u.id=c.user_id WHERE c.id=?', [clienteId]);
  if (!cliente) throw new Error('Cliente no encontrado');

  // Mapa ejercicios del plan para cruzar con series reales
  const ejerciciosPlan = {};
  const dias = dbAll('SELECT * FROM dias_entreno WHERE cliente_id=?', [clienteId]);
  dias.forEach(d => {
    const exs = dbAll('SELECT * FROM ejercicios_dia WHERE dia_id=?', [d.id]);
    exs.forEach(e => { ejerciciosPlan[e.nombre] = e; });
  });

  const prompt = buildAnalisisPrompt(sesion, seriesLog, ejerciciosPlan, cliente);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      system: 'Eres un coach experto en periodización. Responde SOLO con JSON válido.',
      messages: [{ role:'user', content: prompt }]
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  let raw = data.content[0].text.trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();
  const iaData = JSON.parse(raw);

  // Rellenar ejercicio_id en ajustes desde el plan
  (iaData.ajustes||[]).forEach(aj => {
    const ex = ejerciciosPlan[aj.ejercicio];
    if (ex) aj.ejercicio_id = ex.id;
  });

  return { sesion, cliente, iaData, ejerciciosPlan, coachId };
}

// ── Trigger automático (background) ─────────────────────────────────────────
async function lanzarAnalisisAutomatico(sesionId, clienteId, coachId) {
  try {
    // Evitar duplicados
    const existe = dbGet('SELECT id FROM analisis_sesion WHERE sesion_id=?', [sesionId]);
    if (existe) return;

    const { sesion, cliente, iaData } = await ejecutarAnalisisIA(sesionId, clienteId, coachId);

    dbRun(
      `INSERT INTO analisis_sesion (sesion_id, cliente_id, dia_nombre, resumen_ia, ajustes_json, mensaje_cliente, estado, coach_id)
       VALUES (?,?,?,?,?,?,'pendiente',?)`,
      [sesionId, clienteId, sesion.dia_nombre, iaData.resumen||'',
       JSON.stringify(iaData.ajustes||[]), iaData.mensaje_cliente||'', coachId||getCoachId()]
    );
    saveToDisk();

    // Notificar al coach que hay un análisis pendiente
    const coachNotifId = coachId || getCoachId();
    if (coachNotifId) {
      const isEn = getCoachLang() === 'en';
      crearNotificacion(coachNotifId, 'analisis_pendiente',
        isEn
          ? `🤖 Analysis ready: ${cliente.nombre} — ${sesion.dia_nombre}. Review and approve.`
          : `🤖 Análisis listo: ${cliente.nombre} — ${sesion.dia_nombre}. Revisa y aprueba.`);
    }
    console.log(`[AnalisisAuto] OK sesión ${sesionId} cliente ${clienteId}`);
  } catch(e) {
    console.error('[AnalisisAuto] Error:', e.message);
  }
}

// ── GET /api/coach/analisis-pendientes ───────────────────────────────────────
router.get('/coach/analisis-pendientes', coachOnly, (req, res) => {
  try {
    const pendientes = dbAll(
      `SELECT a.*, u.nombre as cliente_nombre
       FROM analisis_sesion a
       JOIN users u ON u.id = (SELECT user_id FROM clientes WHERE id=a.cliente_id)
       WHERE a.estado='pendiente'
       ORDER BY a.created_at DESC`,
      []
    );
    res.json(pendientes.map(p => ({
      ...p,
      ajustes: JSON.parse(p.ajustes_json||'[]')
    })));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/coach/analisis-pendientes/count ─────────────────────────────────
router.get('/coach/analisis-pendientes/count', coachOnly, (req, res) => {
  try {
    const r = dbGet('SELECT COUNT(*) as n FROM analisis_sesion WHERE estado=?', ['pendiente']);
    res.json({ count: r?.n || 0 });
  } catch(e) { res.json({ count: 0 }); }
});

// ── POST /api/ia/analizar-sesion/:sesionId — lanzar análisis manual ───────────
router.post('/ia/analizar-sesion/:sesionId', coachOnly, async (req, res) => {
  try {
    const sesionId  = req.params.sesionId;
    const sesion    = dbGet('SELECT * FROM sesiones_entreno WHERE id=?', [sesionId]);
    if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' });

    // Si ya existe, devolver el existente
    const existente = dbGet('SELECT * FROM analisis_sesion WHERE sesion_id=?', [sesionId]);
    if (existente && existente.estado === 'pendiente') {
      return res.json({ ...existente, ajustes: JSON.parse(existente.ajustes_json||'[]'), cached: true });
    }

    const { iaData } = await ejecutarAnalisisIA(sesionId, sesion.cliente_id, req.user.id);

    // Upsert
    const prev = dbGet('SELECT id FROM analisis_sesion WHERE sesion_id=?', [sesionId]);
    if (prev) {
      dbRun(`UPDATE analisis_sesion SET resumen_ia=?, ajustes_json=?, mensaje_cliente=?, estado='pendiente', created_at=CURRENT_TIMESTAMP WHERE sesion_id=?`,
        [iaData.resumen||'', JSON.stringify(iaData.ajustes||[]), iaData.mensaje_cliente||'', sesionId]);
    } else {
      dbRun(`INSERT INTO analisis_sesion (sesion_id, cliente_id, dia_nombre, resumen_ia, ajustes_json, mensaje_cliente, estado, coach_id)
             VALUES (?,?,?,?,?,?,'pendiente',?)`,
        [sesionId, sesion.cliente_id, sesion.dia_nombre, iaData.resumen||'',
         JSON.stringify(iaData.ajustes||[]), iaData.mensaje_cliente||'', req.user.id]);
    }
    saveToDisk();
    res.json({ resumen: iaData.resumen, ajustes: iaData.ajustes, mensaje_cliente: iaData.mensaje_cliente });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/ia/aprobar-analisis/:analisisId ────────────────────────────────
// Coach aprueba: aplica nuevos pesos + envía mensaje al cliente
router.post('/ia/aprobar-analisis/:analisisId', coachOnly, async (req, res) => {
  try {
    const analisis = dbGet('SELECT * FROM analisis_sesion WHERE id=?', [req.params.analisisId]);
    if (!analisis) return res.status(404).json({ error: 'Análisis no encontrado' });

    const ajustes = JSON.parse(analisis.ajustes_json||'[]');
    // El coach puede haber editado pesos y mensaje antes de aprobar
    const ajustesFinales = req.body.ajustes || ajustes;
    const mensajeFinal   = req.body.mensaje  || analisis.mensaje_cliente;

    let pesosActualizados = 0;

    // 1. Aplicar nuevos pesos a ejercicios_dia
    ajustesFinales.forEach(aj => {
      if ((aj.accion === 'subir' || aj.accion === 'bajar') && aj.nuevo_peso > 0 && aj.ejercicio_id) {
        dbRun('UPDATE ejercicios_dia SET peso_objetivo=? WHERE id=?', [aj.nuevo_peso, aj.ejercicio_id]);
        pesosActualizados++;
      }
    });

    // 2. Enviar mensaje al cliente via chat
    if (mensajeFinal) {
      dbRun(
        `INSERT INTO mensajes (cliente_id, de_coach, via_ia, contenido, leido)
         VALUES (?,1,0,?,0)`,
        [analisis.cliente_id, mensajeFinal]
      );
      // Notificar al cliente por SSE
      const clienteUser = dbGet('SELECT user_id FROM clientes WHERE id=?', [analisis.cliente_id]);
      if (clienteUser) {
        ssePush(String(clienteUser.user_id), 'mensaje_nuevo', {
          contenido: mensajeFinal, de_coach: 1, ts: Date.now()
        });
        // Push notification
        if (global.sendPushToUser) {
          global.sendPushToUser(clienteUser.user_id, '💪 Tu coach ha revisado tu entreno', mensajeFinal.slice(0,80)+'…', '/');
        }
      }
    }

    // 3. Marcar análisis como aprobado
    dbRun(`UPDATE analisis_sesion SET estado='aprobado', ajustes_json=?, mensaje_cliente=?, aprobado_at=CURRENT_TIMESTAMP WHERE id=?`,
      [JSON.stringify(ajustesFinales), mensajeFinal, req.params.analisisId]);

    saveToDisk();
    res.json({ ok: true, pesosActualizados, mensajeEnviado: !!mensajeFinal });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/ia/descartar-analisis/:analisisId ──────────────────────────────
router.post('/ia/descartar-analisis/:analisisId', coachOnly, (req, res) => {
  try {
    dbRun("UPDATE analisis_sesion SET estado='descartado' WHERE id=?", [req.params.analisisId]);
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/clientes/:id/analisis-aprobados ─────────────────────────────────
// El cliente consulta qué ajustes tiene para sus próximas sesiones
router.get('/clientes/:id/analisis-aprobados', (req, res) => {
  try {
    const rows = dbAll(
      `SELECT id, dia_nombre, ajustes_json, mensaje_cliente, aprobado_at, resumen_ia, estado
       FROM analisis_sesion
       WHERE cliente_id=? AND estado='aprobado'
       ORDER BY aprobado_at DESC LIMIT 10`,
      [req.params.id]
    );
    res.json(rows.map(r => ({ ...r, ajustes: JSON.parse(r.ajustes_json||'[]') })));
  } catch(e) { res.status(500).json({ error: e.message }); }
});


// ── RECETA FITNESS — endpoint dedicado con prompt estricto ────────────────
router.post('/ia/receta-fitness', async (req, res) => {
  const { ingredientes, nombreComida, lang } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key no configurada' });
  if (!ingredientes || !ingredientes.length) return res.status(400).json({ error: 'ingredientes requeridos' });

  const isEn = lang === 'en';
  const listaIngr = ingredientes.map(function(it){ return '- ' + it.nombre + ' (' + it.gramos + 'g)'; }).join('\n');
  const jsonSchema = isEn
    ? '{"nombre":"dish name","tiempo":"X min","especias":["h1","h2"],"pasos":["s1","s2","s3","s4"],"foto_query":"2 words"}'
    : '{"nombre":"nombre plato","tiempo":"X min","especias":["h1","h2"],"pasos":["p1","p2","p3","p4"],"foto_query":"2 words"}';

  const nombresIngr = ingredientes.map(it => it.nombre).join(', ');
  const userLines = isEn ? [
    'AVAILABLE INGREDIENTS (use ONLY these ' + ingredientes.length + ' items, nothing else):',
    listaIngr,
    '',
    'Meal type: ' + (nombreComida || 'main meal'),
    '',
    'STRICT RULES - violations will be rejected:',
    '- The dish NAME must only reference ingredients from the list above',
    '- The STEPS must only use: ' + nombresIngr + ', plus salt/pepper/herbs',
    '- NO pasta, bread, cheese, cream, avocado, salmon, nuts, or any unlisted ingredient',
    '- foto_query: 2 english words describing the MAIN ingredient (e.g. "oat milk" or "chicken rice")',
    '',
    'Return ONLY valid JSON, no commentary:',
    jsonSchema
  ] : [
    'INGREDIENTES DISPONIBLES (usa SOLO estos ' + ingredientes.length + ' elementos, nada mas):',
    listaIngr,
    '',
    'Tipo de comida: ' + (nombreComida || 'comida principal'),
    '',
    'REGLAS ESTRICTAS - las violaciones seran rechazadas:',
    '- El NOMBRE del plato solo debe mencionar ingredientes de la lista',
    '- Los PASOS solo pueden usar: ' + nombresIngr + ', mas sal/pimienta/hierbas',
    '- PROHIBIDO: pasta, pan, queso, nata, aguacate, salmon, frutos secos no listados, etc',
    '- foto_query: 2 palabras en ingles describiendo el ingrediente PRINCIPAL (ej: "oat milk" o "chicken rice")',
    '',
    'Devuelve SOLO JSON valido, sin comentarios:',
    jsonSchema
  ];

  const userMsg = userLines.join('\n');
  const systemMsg = isEn
    ? 'Fitness recipe generator. Use ONLY provided ingredients. No creative additions. Return valid JSON only.'
    : 'Generador de recetas fitness. Usa SOLO los ingredientes proporcionados. Sin añadidos creativos. Devuelve JSON valido solamente.';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: systemMsg,
        messages: [{ role: 'user', content: userMsg }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const raw = (data.content[0].text || '').replace(/```json|```/g, '').trim();
    const receta = JSON.parse(raw);
    res.json({ receta });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── IMAGEN IA PARA RECETA FITNESS — OpenAI + Cloudinary con fallback seguro ───
async function subirRecetaACloudinary(dataUrl, nombre){
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Si no está configurado Cloudinary, devolvemos la data URL para no romper.
  if(!cloudName || !apiKey || !apiSecret) return dataUrl;

  const crypto = require('crypto');
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_RECIPE_FOLDER || 'wolfmindset/recipes';
  const publicIdBase = String(nombre || 'fitness-recipe')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'fitness-recipe';
  const public_id = publicIdBase + '-' + timestamp;

  // Cloudinary signature: parámetros ordenados alfabéticamente + api_secret
  const paramsToSign = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  const form = new FormData();
  form.append('file', dataUrl);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);
  form.append('public_id', public_id);

  const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form
  });
  const json = await up.json();
  if(!up.ok) throw new Error(json.error?.message || 'Cloudinary upload error');

  // URL optimizada: recorta y comprime para cabecera de receta móvil.
  const secureUrl = json.secure_url || json.url;
  if(!secureUrl) throw new Error('Cloudinary no devolvió URL');
  return secureUrl.replace('/upload/', '/upload/f_auto,q_auto,w_900,h_520,c_fill/');
}

router.post('/ia/receta-imagen', async (req, res) => {
  const { nombre, nombreComida, ingredientes, lang } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  // No rompemos la app si falta OpenAI: dieta.js usará fallback.
  if (!apiKey) return res.json({ image_url: '', fallback: true, reason: 'OPENAI_API_KEY no configurada' });
  if (!ingredientes || !ingredientes.length) return res.status(400).json({ error: 'ingredientes requeridos' });

  const isEn = lang === 'en';
  const listaIngr = ingredientes
    .map(it => '- ' + (it.nombre || '') + ' (' + (it.gramos || 0) + 'g)')
    .join('\n');

  const prompt = [
    'Create a premium realistic food photography image for a fitness coaching mobile app.',
    'Dish name: ' + (nombre || nombreComida || 'Fitness recipe'),
    'Meal type: ' + (nombreComida || 'fitness meal'),
    'Use ONLY these visible ingredients as the dish composition:',
    listaIngr,
    '',
    'Visual direction:',
    '- realistic professional food photography',
    '- clean bowl or plate presentation',
    '- dark premium background matching a black/red fitness app',
    '- appetizing natural lighting, high contrast, sharp details',
    '- healthy, protein-focused, meal-prep aesthetic',
    '',
    'Strict negatives:',
    '- no text, no labels, no logos, no hands, no people, no packaging',
    '- no extra ingredients not listed',
    '- no cartoon or illustration style',
    isEn ? 'Language context: English app.' : 'Language context: Spanish app.'
  ].join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
        prompt,
        size: process.env.OPENAI_IMAGE_SIZE || '1024x1024',
        quality: process.env.OPENAI_IMAGE_QUALITY || 'low',
        n: 1
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.log('[receta-imagen][openai]', data.error?.message || 'Error OpenAI Images');
      return res.json({ image_url: '', fallback: true, error: data.error?.message || 'Error generando imagen' });
    }

    const item = data.data && data.data[0];
    let dataUrl = '';

    if (item?.b64_json) {
      dataUrl = 'data:image/png;base64,' + item.b64_json;
    } else if (item?.url) {
      // Algunos modelos/proveedores pueden devolver URL temporal.
      dataUrl = item.url;
    }

    if(!dataUrl) return res.json({ image_url: '', fallback: true });

    try {
      const finalUrl = await subirRecetaACloudinary(dataUrl, nombre || nombreComida || 'fitness-recipe');
      return res.json({ image_url: finalUrl, cloudinary: finalUrl !== dataUrl });
    } catch(uploadErr) {
      console.log('[receta-imagen][cloudinary]', uploadErr.message);
      // No rompemos: si falla Cloudinary, devolvemos dataUrl para que al menos se vea.
      return res.json({ image_url: dataUrl, cloudinary: false, cloudinary_error: uploadErr.message });
    }
  } catch(e) {
    console.log('[receta-imagen]', e.message);
    res.json({ image_url: '', fallback: true, error: e.message });
  }
});

module.exports = { router };
