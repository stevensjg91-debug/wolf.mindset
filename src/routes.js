const express = require('express');
const { db } = require('./database');
const { authMiddleware, coachOnly } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// ── CLIENTES ──────────────────────────────────────────
router.get('/clientes', coachOnly, (req, res) => {
  const clientes = db.prepare(`
    SELECT c.*, u.nombre, u.username,
      (SELECT peso FROM peso_registros WHERE cliente_id=c.id ORDER BY fecha DESC LIMIT 1) as peso_actual,
      (SELECT grasa FROM peso_registros WHERE cliente_id=c.id ORDER BY fecha DESC LIMIT 1) as grasa_actual,
      (SELECT COUNT(*) FROM fotos WHERE cliente_id=c.id) as fotos_count
    FROM clientes c JOIN users u ON c.user_id=u.id
  `).all();
  res.json(clientes);
});

router.get('/clientes/:id', (req, res) => {
  const id = req.params.id;
  // Cliente solo puede ver el suyo
  if (req.user.role === 'cliente') {
    const mine = db.prepare('SELECT id FROM clientes WHERE user_id=?').get(req.user.id);
    if (!mine || mine.id != id) return res.status(403).json({ error: 'Sin acceso' });
  }
  const c = db.prepare('SELECT c.*, u.nombre, u.username FROM clientes c JOIN users u ON c.user_id=u.id WHERE c.id=?').get(id);
  if (!c) return res.status(404).json({ error: 'No encontrado' });

  const pesos = db.prepare('SELECT * FROM peso_registros WHERE cliente_id=? ORDER BY fecha ASC').all(id);
  const dias = db.prepare('SELECT * FROM dias_entreno WHERE cliente_id=? ORDER BY orden').all(id);
  dias.forEach(d => {
    d.ejercicios = db.prepare('SELECT * FROM ejercicios_dia WHERE dia_id=? ORDER BY orden').all(d.id);
  });
  const comidas = db.prepare('SELECT * FROM comidas WHERE cliente_id=? ORDER BY orden').all(id);
  comidas.forEach(m => {
    m.items = db.prepare('SELECT * FROM alimentos WHERE comida_id=? ORDER BY orden').all(m.id);
  });
  const recetas = db.prepare('SELECT * FROM recetas WHERE cliente_id=? ORDER BY orden').all(id);
  recetas.forEach(r => {
    r.ingredientes = db.prepare('SELECT * FROM receta_ingredientes WHERE receta_id=?').all(r.id);
  });
  const fotos = db.prepare('SELECT id, analysis, fecha FROM fotos WHERE cliente_id=? ORDER BY fecha DESC LIMIT 6').all(id);

  res.json({ ...c, pesos, dias, comidas, recetas, fotos });
});

router.put('/clientes/:id', coachOnly, (req, res) => {
  const { objetivo, nivel, semanas, kcal_internas, prot, carbs, fat, comida_libre, mensaje_semana, notas_coach } = req.body;
  db.prepare(`UPDATE clientes SET objetivo=COALESCE(?,objetivo), nivel=COALESCE(?,nivel), semanas=COALESCE(?,semanas),
    kcal_internas=COALESCE(?,kcal_internas), prot=COALESCE(?,prot), carbs=COALESCE(?,carbs), fat=COALESCE(?,fat),
    comida_libre=COALESCE(?,comida_libre), mensaje_semana=COALESCE(?,mensaje_semana), notas_coach=COALESCE(?,notas_coach)
    WHERE id=?`).run(objetivo, nivel, semanas, kcal_internas, prot, carbs, fat, comida_libre, mensaje_semana, notas_coach, req.params.id);
  res.json({ ok: true });
});

// ── PESO ──────────────────────────────────────────────
router.post('/clientes/:id/peso', (req, res) => {
  const { peso, grasa, cintura } = req.body;
  db.prepare('INSERT INTO peso_registros (cliente_id, peso, grasa, cintura) VALUES (?, ?, ?, ?)').run(req.params.id, peso, grasa, cintura);
  res.json({ ok: true });
});

// ── DÍAS ENTRENO ──────────────────────────────────────
router.post('/clientes/:id/dias', coachOnly, (req, res) => {
  const { nombre, grupo, orden } = req.body;
  const r = db.prepare('INSERT INTO dias_entreno (cliente_id, nombre, grupo, orden) VALUES (?, ?, ?, ?)').run(req.params.id, nombre, grupo, orden || 0);
  res.json({ id: r.lastInsertRowid });
});

router.delete('/dias/:id', coachOnly, (req, res) => {
  db.prepare('DELETE FROM ejercicios_dia WHERE dia_id=?').run(req.params.id);
  db.prepare('DELETE FROM dias_entreno WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── EJERCICIOS ────────────────────────────────────────
router.post('/dias/:id/ejercicios', coachOnly, (req, res) => {
  const { nombre, musculos, series, reps, peso_objetivo, descanso, orden } = req.body;
  const r = db.prepare('INSERT INTO ejercicios_dia (dia_id, nombre, musculos, series, reps, peso_objetivo, descanso, orden) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(req.params.id, nombre, musculos, series || 3, reps || '10-12', peso_objetivo || 0, descanso || 90, orden || 0);
  res.json({ id: r.lastInsertRowid });
});

router.put('/ejercicios/:id', (req, res) => {
  const { series, reps, peso_objetivo, descanso, es_pr } = req.body;
  db.prepare(`UPDATE ejercicios_dia SET series=COALESCE(?,series), reps=COALESCE(?,reps),
    peso_objetivo=COALESCE(?,peso_objetivo), descanso=COALESCE(?,descanso), es_pr=COALESCE(?,es_pr) WHERE id=?`).run(series, reps, peso_objetivo, descanso, es_pr, req.params.id);
  res.json({ ok: true });
});

router.delete('/ejercicios/:id', coachOnly, (req, res) => {
  db.prepare('DELETE FROM ejercicios_dia WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── COMIDAS ───────────────────────────────────────────
router.post('/clientes/:id/comidas', coachOnly, (req, res) => {
  const { nombre, orden } = req.body;
  const r = db.prepare('INSERT INTO comidas (cliente_id, nombre, orden) VALUES (?, ?, ?)').run(req.params.id, nombre, orden || 0);
  res.json({ id: r.lastInsertRowid });
});

router.post('/comidas/:id/alimentos', coachOnly, (req, res) => {
  const { nombre, gramos, orden } = req.body;
  const r = db.prepare('INSERT INTO alimentos (comida_id, nombre, gramos, orden) VALUES (?, ?, ?, ?)').run(req.params.id, nombre, gramos, orden || 0);
  res.json({ id: r.lastInsertRowid });
});

router.put('/alimentos/:id', coachOnly, (req, res) => {
  const { nombre, gramos } = req.body;
  db.prepare('UPDATE alimentos SET nombre=COALESCE(?,nombre), gramos=COALESCE(?,gramos) WHERE id=?').run(nombre, gramos, req.params.id);
  res.json({ ok: true });
});

router.delete('/alimentos/:id', coachOnly, (req, res) => {
  db.prepare('DELETE FROM alimentos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── RECETAS ───────────────────────────────────────────
router.post('/clientes/:id/recetas', coachOnly, (req, res) => {
  const { nombre, pasos, ingredientes } = req.body;
  const r = db.prepare('INSERT INTO recetas (cliente_id, nombre, pasos) VALUES (?, ?, ?)').run(req.params.id, nombre, pasos);
  if (ingredientes) {
    ingredientes.forEach(ing => db.prepare('INSERT INTO receta_ingredientes (receta_id, nombre, gramos) VALUES (?, ?, ?)').run(r.lastInsertRowid, ing.nombre, ing.gramos));
  }
  res.json({ id: r.lastInsertRowid });
});

// ── FOTOS ─────────────────────────────────────────────
router.post('/clientes/:id/fotos', (req, res) => {
  const { url, analysis } = req.body;
  const r = db.prepare('INSERT INTO fotos (cliente_id, url, analysis) VALUES (?, ?, ?)').run(req.params.id, url, analysis);
  res.json({ id: r.lastInsertRowid });
});

// ── IA PROXY ──────────────────────────────────────────
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
  } catch (e) {
    res.status(500).json({ error: 'Error IA' });
  }
});

router.post('/ia/foto', async (req, res) => {
  const { imageBase64, mediaType, system } = req.body;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, system, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } }, { type: 'text', text: 'Valora el progreso físico.' }] }] })
    });
    const data = await response.json();
    res.json({ reply: data.content[0].text });
  } catch (e) {
    res.status(500).json({ error: 'Error IA foto' });
  }
});

module.exports = router;
