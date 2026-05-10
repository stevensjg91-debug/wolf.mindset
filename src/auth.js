const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { dbGet, dbRun, dbAll } = require('./database');

// Rate limiter para login: máximo 10 intentos fallidos cada 15 minutos por IP.
// Protege contra ataques de fuerza bruta de contraseñas.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Espera 15 minutos e inténtalo de nuevo.' },
  skipSuccessfulRequests: true, // solo cuenta los intentos fallidos
});

const router = express.Router();

// JWT_SECRET debe estar definido en .env — si no, el servidor no arranca.
// Nunca usar un fallback hardcodeado en producción.
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET no está definido en .env. El servidor no puede arrancar de forma segura.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

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

// POST /api/auth/login
router.post('/login', loginLimiter, (req, res) => {
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
  // Incluir lang para que el frontend inicialice COACH_LANG correctamente
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, nombre: user.nombre, clienteId, lang: user.lang || 'es' } });
});

// POST /api/auth/register-cliente — crear cliente desde panel coach
router.post('/register-cliente', authMiddleware, coachOnly, (req, res) => {
  const { username, password, nombre, objetivo, nivel, coach_id } = req.body;
  if (!username || !password || !nombre) return res.status(400).json({ error: 'Faltan datos' });
  const exists = dbGet('SELECT id FROM users WHERE username = ?', [username]);
  if (exists) return res.status(400).json({ error: 'Usuario ya existe' });
  const hash = bcrypt.hashSync(password, 10);
  const userResult = dbRun('INSERT INTO users (username, password, role, nombre) VALUES (?, ?, ?, ?)', [username, hash, 'cliente', nombre]);
  // Asignar al coach que lo crea, o al coach_id que se pasa
  const assignedCoach = coach_id || req.user.id;
  const clienteResult = dbRun(
    'INSERT INTO clientes (user_id, objetivo, nivel, coach_id) VALUES (?, ?, ?, ?)',
    [userResult.lastInsertRowid, objetivo || 'Volumen', nivel || 'Intermedio', assignedCoach]
  );
  res.json({ ok: true, userId: userResult.lastInsertRowid, clienteId: clienteResult.lastInsertRowid });
});

// POST /api/auth/registro — registro público de clientes (desde landing)
router.post('/registro', async (req, res) => {
  const { nombre, username, email, telefono, password, objetivo, nivel, peso_actual, altura, edad, sexo, actividad, observaciones, dieta_tipo, alimentos_no, lesiones } = req.body;
  if (!nombre || !username || !password) return res.status(400).json({ error: 'Nombre, usuario y contraseña son obligatorios' });
  const exists = dbGet('SELECT id FROM users WHERE username = ?', [username.toLowerCase()]);
  if (exists) return res.status(400).json({ error: 'Este nombre de usuario ya está en uso. Elige otro.' });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const ur = dbRun('INSERT INTO users (username, password, role, nombre, email, estado, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username.toLowerCase(), hash, 'cliente', nombre, email||'', 'pendiente', telefono||'']);
    dbRun('INSERT INTO clientes (user_id, objetivo, nivel, peso_actual, altura, edad, sexo, actividad, observaciones, dieta_tipo, alimentos_no, lesiones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ur.lastInsertRowid, objetivo||'Volumen', nivel||'Intermedio', parseFloat(peso_actual)||0, parseInt(altura)||0, parseInt(edad)||0, sexo||'Hombre', actividad||'Moderada', observaciones||'', dieta_tipo||'Omnivoro', alimentos_no||'', lesiones||'']);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth/solicitar-reset — olvidé contraseña (cliente)
router.post('/solicitar-reset', async (req, res) => {
  res.json({ ok: true, msg: 'Contacta con tu coach para resetear tu contraseña.' });
});

// POST /api/auth/reset-password — coach resetea contraseña de un cliente
router.post('/reset-password', authMiddleware, coachOnly, async (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) return res.status(400).json({ error: 'Faltan datos' });
  if (String(newPassword).length < 6) return res.status(400).json({ error: 'Mínimo 6 caracteres' });
  const user = dbGet('SELECT id FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const hash = bcrypt.hashSync(String(newPassword), 10);
  dbRun('UPDATE users SET password = ? WHERE id = ?', [hash, userId]);
  res.json({ ok: true });
});

module.exports = { router, authMiddleware, coachOnly };
