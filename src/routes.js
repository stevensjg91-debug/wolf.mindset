const express = require('express');
const { dbGet, dbAll, dbRun } = require('./database');
const { authMiddleware, coachOnly } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/clientes', coachOnly, (req, res) => {
  const clientes = dbAll(`SELECT c.*, u.nombre, u.username,
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
  const c = dbGet('SELECT c.*, u.nombre, u.username FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?', [id]);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  const pesos = dbAll('SELECT * FROM peso_registros WHERE cliente_id=? ORDER BY rowid ASC', [id]);
  const dias = dbAll('SELECT * FROM dias_entreno WHERE cliente_id=? ORDER BY orden', [id]);
  dias.forEach(d => { d.ejercicios = dbAll('SELECT * FROM ejercicios_dia WHERE dia_id=? ORDER BY orden', [d.id]); });
  const comidas = dbAll('SELECT * FROM comidas WHERE cliente_id=? ORDER BY orden', [id]);
  const planMeta = dbGet('SELECT * FROM plan_meta WHERE cliente_id=?', [id]);
  comidas.forEach(m => { m.items = dbAll('SELECT * FROM alimentos WHERE comida_id=? ORDER BY orden', [m.id]); });
  const recetas = dbAll('SELECT * FROM recetas WHERE cliente_id=? ORDER BY orden', [id]);
  recetas.forEach(r => { r.ingredientes = dbAll('SELECT * FROM receta_ingredientes WHERE receta_id=?', [r.id]); });
  const fotos = dbAll('SELECT id, url, analysis, fecha, tipo FROM fotos WHERE cliente_id=? ORDER BY fecha ASC', [id]);
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
router.post('/clientes/:id/sesiones', (req, res) => {
  const { dia_nombre, dia_grupo, duracion_min, series } = req.body;
  const r = dbRun(
    'INSERT INTO sesiones_entreno (cliente_id, dia_nombre, dia_grupo, duracion_min) VALUES (?,?,?,?)',
    [req.params.id, dia_nombre, dia_grupo, duracion_min||0]
  );
  const sesionId = r.lastInsertRowid;
  if(series && series.length) {
    series.forEach(s => {
      dbRun(
        'INSERT INTO series_log (sesion_id, ejercicio_nombre, serie_num, peso_real, reps_real, rir) VALUES (?,?,?,?,?,?)',
        [sesionId, s.ejercicio, s.serie_num, s.peso, s.reps, s.rir!=null?s.rir:null]
      );
    });
  }
  const { saveToDisk } = require('./database');
  saveToDisk();
  res.json({ ok: true, sesion_id: sesionId });
});

router.get('/clientes/:id/sesiones', (req, res) => {
  const id = req.params.id;
  if (req.user.role === 'cliente') {
    const mine = dbGet('SELECT id FROM clientes WHERE user_id=?', [req.user.id]);
    if (!mine || String(mine.id) !== String(id)) return res.status(403).json({ error: 'Sin acceso' });
  }
  const sesiones = dbAll(
    'SELECT * FROM sesiones_entreno WHERE cliente_id=? ORDER BY fecha DESC LIMIT 30',
    [id]
  );
  sesiones.forEach(s => {
    s.series = dbAll('SELECT * FROM series_log WHERE sesion_id=? ORDER BY ejercicio_nombre, serie_num', [s.id]);
  });
  res.json(sesiones);
});

router.get('/clientes/:id/progreso-ejercicio', (req, res) => {
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


router.post('/clientes/:id/plan-meta', coachOnly, (req, res) => {
  const { alternativas, ajustes, frase, kcal, prot, carbs, grasas, variaciones, suplementacion, alimentos_therapeuticos } = req.body;
  dbRun(`INSERT OR REPLACE INTO plan_meta (cliente_id, alternativas, ajustes, frase, kcal, prot, carbs, grasas, variaciones, suplementacion, alimentos_therapeuticos)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [req.params.id, JSON.stringify(alternativas), JSON.stringify(ajustes), frase, kcal, prot, carbs, grasas, JSON.stringify(variaciones), JSON.stringify(suplementacion), JSON.stringify(alimentos_therapeuticos)]
  );
  res.json({ ok: true });
});

module.exports = router;
