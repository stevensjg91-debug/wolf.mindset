const express = require('express');
const { dbGet, dbAll, dbRun, saveToDisk } = require('./database');
const { authMiddleware, coachOnly } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// ── HELPERS ───────────────────────────────────────────────────────────
function crearNotificacion(userId, tipo, mensaje) {
  try {
    dbRun('INSERT INTO notificaciones (user_id, tipo, mensaje) VALUES (?,?,?)',
      [userId, tipo, mensaje]);
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

    const c = dbGet('SELECT c.id, u.id as user_id, u.nombre FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?', [clienteId]);
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
      `✅ Tu suscripción ha sido activada hasta el ${fechaFinStr.split('-').reverse().join('/')}. ¡Bienvenido!`);

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
    const c = dbGet('SELECT c.id, u.id as user_id, u.nombre FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?', [clienteId]);
    if(!c) return res.status(404).json({ error: 'Cliente no encontrado' });

    dbRun("UPDATE suscripciones SET estado='cancelada' WHERE cliente_id=?", [clienteId]);
    dbRun("UPDATE users SET estado='bloqueado' WHERE id=?", [c.user_id]);

    crearNotificacion(c.user_id, 'suscripcion_cancelada',
      `❌ Tu suscripción ha sido cancelada. Contacta con tu coach para renovarla.`);

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
      SELECT s.*, c.id as cliente_id, u.id as user_id, u.nombre
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
            `⚠️ Tu suscripción vence en ${dias} día${dias>1?'s':''}. Contacta con tu coach para renovar.`);
          avisados++;
        }
      }

      // Bloquear si ya venció
      if(s.fecha_fin < hoy && s.estado === 'activa') {
        dbRun("UPDATE suscripciones SET estado='vencida' WHERE cliente_id=?", [s.cliente_id]);
        dbRun("UPDATE users SET estado='bloqueado' WHERE id=?", [s.user_id]);
        crearNotificacion(s.user_id, 'suscripcion_vencida',
          `🔴 Tu suscripción ha vencido. Contacta con tu coach para renovarla y recuperar el acceso.`);
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
    const { valoracion } = req.body;
    // Actualizar la sesión más reciente del cliente con la valoración
    const ultima = dbGet(
      'SELECT id FROM sesiones_entreno WHERE cliente_id=? ORDER BY fecha DESC LIMIT 1',
      [req.params.id]
    );
    if(ultima) {
      try { dbRun("ALTER TABLE sesiones_entreno ADD COLUMN valoracion TEXT DEFAULT ''"); } catch(e) {}
      dbRun('UPDATE sesiones_entreno SET valoracion=? WHERE id=?', [valoracion||'', ultima.id]);
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

module.exports = router;
