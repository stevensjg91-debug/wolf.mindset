const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun, dbAll } = require('./database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'wolfmindset_dev_secret';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalido' }); }
}

function coachOnly(req, res, next) {
  if (req.user.role !== 'coach') return res.status(403).json({ error: 'Solo el coach' });
  next();
}

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = dbGet('SELECT * FROM users WHERE username = ?', [username]);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  if (user.estado === 'pendiente') return res.status(403).json({ error: 'Tu solicitud está pendiente de aprobación por el coach. Te avisaremos pronto.' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role, nombre: user.nombre }, JWT_SECRET, { expiresIn: '30d' });
  let clienteId = null;
  if (user.role === 'cliente') {
    const c = dbGet('SELECT id FROM clientes WHERE user_id = ?', [user.id]);
    clienteId = c?.id;
  }
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, nombre: user.nombre, clienteId } });
});

router.post('/register-cliente', authMiddleware, coachOnly, (req, res) => {
  const { username, password, nombre, objetivo, nivel } = req.body;
  if (!username || !password || !nombre) return res.status(400).json({ error: 'Faltan datos' });
  const exists = dbGet('SELECT id FROM users WHERE username = ?', [username]);
  if (exists) return res.status(400).json({ error: 'Usuario ya existe' });
  const hash = bcrypt.hashSync(password, 10);
  const userResult = dbRun('INSERT INTO users (username, password, role, nombre) VALUES (?, ?, ?, ?)', [username, hash, 'cliente', nombre]);
  const clienteResult = dbRun('INSERT INTO clientes (user_id, objetivo, nivel) VALUES (?, ?, ?)', [userResult.lastInsertRowid, objetivo || 'Volumen', nivel || 'Intermedio']);
  res.json({ ok: true, userId: userResult.lastInsertRowid, clienteId: clienteResult.lastInsertRowid });
});


// POST /api/auth/registro - registro público de clientes
router.post('/registro', async (req, res) => {
  const { nombre, email, password, objetivo, nivel, peso_actual, altura, edad, sexo, actividad, observaciones } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
  const exists = dbGet('SELECT id FROM users WHERE username = ? OR email = ?', [email, email]);
  if (exists) return res.status(400).json({ error: 'Este email ya está registrado' });
  const hash = bcrypt.hashSync(password, 10);
  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g,'') + Date.now().toString().slice(-4);
  try {
    const ur = dbRun('INSERT INTO users (username, password, role, nombre, email, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hash, 'cliente', nombre, email, 'pendiente']);
    dbRun('INSERT INTO clientes (user_id, objetivo, nivel, peso_actual, altura, edad, sexo, actividad, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ur.lastInsertRowid, objetivo||'Volumen', nivel||'Intermedio', parseFloat(peso_actual)||0, parseInt(altura)||0, parseInt(edad)||0, sexo||'Hombre', actividad||'Moderada', observaciones||'']);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = { router, authMiddleware, coachOnly };
