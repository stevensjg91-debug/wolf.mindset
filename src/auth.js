const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('./database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'wolfmindset_dev_secret';

// Middleware to verify token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

function coachOnly(req, res, next) {
  if (req.user.role !== 'coach') return res.status(403).json({ error: 'Solo el coach' });
  next();
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role, nombre: user.nombre }, JWT_SECRET, { expiresIn: '30d' });
  
  let clienteId = null;
  if (user.role === 'cliente') {
    const c = db.prepare('SELECT id FROM clientes WHERE user_id = ?').get(user.id);
    clienteId = c?.id;
  }
  
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, nombre: user.nombre, clienteId } });
});

// POST /api/auth/register-cliente (coach only)
router.post('/register-cliente', authMiddleware, coachOnly, (req, res) => {
  const { username, password, nombre, objetivo, nivel } = req.body;
  if (!username || !password || !nombre) return res.status(400).json({ error: 'Faltan datos' });
  
  const hash = bcrypt.hashSync(password, 10);
  try {
    const userResult = db.prepare('INSERT INTO users (username, password, role, nombre) VALUES (?, ?, ?, ?)').run(username, hash, 'cliente', nombre);
    const clienteResult = db.prepare('INSERT INTO clientes (user_id, objetivo, nivel) VALUES (?, ?, ?)').run(userResult.lastInsertRowid, objetivo || 'Volumen', nivel || 'Intermedio');
    res.json({ ok: true, userId: userResult.lastInsertRowid, clienteId: clienteResult.lastInsertRowid });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'Usuario ya existe' });
    res.status(500).json({ error: e.message });
  }
});

module.exports = { router, authMiddleware, coachOnly };
