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
  comidas.forEach(m => { m.items = dbAll('SELECT * FROM alimentos WHERE comida_id=? ORDER BY orden', [m.id]); });
  const recetas = dbAll('SELECT * FROM recetas WHERE cliente_id=? ORDER BY orden', [id]);
  recetas.forEach(r => { r.ingredientes = dbAll('SELECT * FROM receta_ingredientes WHERE receta_id=?', [r.id]); });
  const fotos = dbAll('SELECT id, analysis, fecha FROM fotos WHERE cliente_id=? ORDER BY rowid DESC LIMIT 6', [id]);
  res.json({ ...c, pesos, dias, comidas, recetas, fotos });
});

router.put('/clientes/:id', coachOnly, (req, res) => {
  const { objetivo, nivel, semanas, kcal_internas, prot, carbs, fat, comida_libre, mensaje_semana, notas_coach } = req.body;
  const c = dbGet('SELECT * FROM clientes WHERE id=?', [req.params.id]);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  dbRun(`UPDATE clientes SET objetivo=?, nivel=?, semanas=?, kcal_internas=?, prot=?, carbs=?, fat=?, comida_libre=?, mensaje_semana=?, notas_coach=? WHERE id=?`,
    [objetivo||c.objetivo, nivel||c.nivel, semanas||c.semanas, kcal_internas||c.kcal_internas, prot||c.prot, carbs||c.carbs, fat||c.fat, comida_libre||c.comida_libre, mensaje_semana||c.mensaje_semana, notas_coach||c.notas_coach, req.params.id]);
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
  const { nombre, musculos, series, reps, peso_objetivo, descanso, orden } = req.body;
  const r = dbRun('INSERT INTO ejercicios_dia (dia_id, nombre, musculos, series, reps, peso_objetivo, descanso, orden) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.id, nombre, musculos||'', series||3, reps||'10-12', peso_objetivo||0, descanso||90, orden||0]);
  res.json({ id: r.lastInsertRowid });
});

router.put('/ejercicios/:id', (req, res) => {
  const e = dbGet('SELECT * FROM ejercicios_dia WHERE id=?', [req.params.id]);
  if (!e) return res.status(404).json({ error: 'No encontrado' });
  const { series, reps, peso_objetivo, descanso, es_pr } = req.body;
  dbRun('UPDATE ejercicios_dia SET series=?, reps=?, peso_objetivo=?, descanso=?, es_pr=? WHERE id=?',
    [series||e.series, reps||e.reps, peso_objetivo!=null?peso_objetivo:e.peso_objetivo, descanso||e.descanso, es_pr!=null?es_pr:e.es_pr, req.params.id]);
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
  const { url, analysis } = req.body;
  const r = dbRun('INSERT INTO fotos (cliente_id, url, analysis) VALUES (?, ?, ?)', [req.params.id, url, analysis||'']);
  res.json({ id: r.lastInsertRowid });
});

router.post('/ia/chat', async (req, res) => {
  const { messages, system } = req.body;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system, messages })
    });
    const data = await response.json();
    res.json({ reply: data.content[0].text });
  } catch(e) { res.status(500).json({ error: 'Error IA' }); }
});

router.post('/ia/foto', async (req, res) => {
  const { imageBase64, mediaType, system } = req.body;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, system, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } }, { type: 'text', text: 'Valora el progreso fisico.' }] }] })
    });
    const data = await response.json();
    res.json({ reply: data.content[0].text });
  } catch(e) { res.status(500).json({ error: 'Error IA foto' }); }
});

module.exports = router;
