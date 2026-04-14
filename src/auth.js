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
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Usuario o contrasena incorrectos' });
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

module.exports = { router, authMiddleware, coachOnly };
