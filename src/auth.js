const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun, dbAll } = require('./database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'wolfmindset_dev_secret';

// ── Helper: detectar idioma del request ───────────────────────────────────────
// Orden de prioridad: body.lang → query.lang → Accept-Language header → 'es'
function getLang(req) {
  if (req.body?.lang === 'en' || req.query?.lang === 'en') return 'en';
  if (req.body?.lang === 'es' || req.query?.lang === 'es') return 'es';
  const accept = req.headers['accept-language'] || '';
  if (accept.toLowerCase().startsWith('en')) return 'en';
  return 'es';
}

// ── Mensajes bilingües ────────────────────────────────────────────────────────
const MSG = {
  unauthorized: {
    en: 'Unauthorized',
    es: 'No autorizado'
  },
  invalidToken: {
    en: 'Invalid token',
    es: 'Token inválido'
  },
  coachOnly: {
    en: 'Coach access only',
    es: 'Solo el coach'
  },
  wrongCredentials: {
    en: 'Incorrect username or password',
    es: 'Usuario o contraseña incorrectos'
  },
  pendingApproval: {
    en: 'Your request is pending coach approval. We will notify you soon.',
    es: 'Tu solicitud está pendiente de aprobación por el coach. Te avisaremos pronto.'
  },
  missingFields: {
    en: 'Missing required fields',
    es: 'Faltan datos'
  },
  userExists: {
    en: 'Username already taken. Please choose another.',
    es: 'Este nombre de usuario ya está en uso. Elige otro.'
  },
  requiredFields: {
    en: 'Name, username and password are required',
    es: 'Nombre, usuario y contraseña son obligatorios'
  },
  contactCoach: {
    en: 'Contact your coach to reset your password.',
    es: 'Contacta con tu coach para resetear tu contraseña.'
  },
  minPassword: {
    en: 'Minimum 4 characters',
    es: 'Mínimo 4 caracteres'
  },
  userNotFound: {
    en: 'User not found',
    es: 'Usuario no encontrado'
  }
};

function t(key, lang) {
  return (MSG[key] && MSG[key][lang]) || MSG[key]?.es || key;
}

// ── Middlewares ───────────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: t('unauthorized', getLang(req)) });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: t('invalidToken', getLang(req)) }); }
}

function coachOnly(req, res, next) {
  if (req.user.role !== 'coach') return res.status(403).json({ error: t('coachOnly', getLang(req)) });
  next();
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = dbGet('SELECT * FROM users WHERE username = ?', [username]);

  // Determinar idioma: primero intentamos usar el del usuario en BD, luego el del request
  const lang = user?.lang || getLang(req);

  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: t('wrongCredentials', lang) });

  if (user.estado === 'pendiente')
    return res.status(403).json({ error: t('pendingApproval', lang) });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, nombre: user.nombre },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  let clienteId = null;
  if (user.role === 'cliente') {
    const c = dbGet('SELECT id FROM clientes WHERE user_id = ?', [user.id]);
    clienteId = c?.id;
  }

  // Incluir lang para que el frontend inicialice COACH_LANG correctamente
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      nombre: user.nombre,
      clienteId,
      lang: user.lang || 'es'
    }
  });
});

// ── POST /api/auth/register-cliente — crear cliente desde panel coach ─────────
router.post('/register-cliente', authMiddleware, coachOnly, (req, res) => {
  const lang = getLang(req);
  const { username, password, nombre, objetivo, nivel, coach_id } = req.body;

  if (!username || !password || !nombre)
    return res.status(400).json({ error: t('missingFields', lang) });

  const exists = dbGet('SELECT id FROM users WHERE username = ?', [username]);
  if (exists) return res.status(400).json({ error: t('userExists', lang) });

  const hash = bcrypt.hashSync(password, 10);
  const userResult = dbRun(
    'INSERT INTO users (username, password, role, nombre) VALUES (?, ?, ?, ?)',
    [username, hash, 'cliente', nombre]
  );

  const assignedCoach = coach_id || req.user.id;
  const clienteResult = dbRun(
    'INSERT INTO clientes (user_id, objetivo, nivel, coach_id) VALUES (?, ?, ?, ?)',
    [userResult.lastInsertRowid, objetivo || 'Volumen', nivel || 'Intermedio', assignedCoach]
  );

  res.json({ ok: true, userId: userResult.lastInsertRowid, clienteId: clienteResult.lastInsertRowid });
});

// ── POST /api/auth/registro — registro público de clientes (desde landing) ────
router.post('/registro', async (req, res) => {
  const lang = getLang(req);
  const {
    nombre, username, email, telefono, password,
    objetivo, nivel, peso_actual, altura, edad, sexo,
    actividad, observaciones, dieta_tipo, alimentos_no, lesiones
  } = req.body;

  if (!nombre || !username || !password)
    return res.status(400).json({ error: t('requiredFields', lang) });

  const exists = dbGet('SELECT id FROM users WHERE username = ?', [username.toLowerCase()]);
  if (exists) return res.status(400).json({ error: t('userExists', lang) });

  const hash = bcrypt.hashSync(password, 10);
  try {
    const ur = dbRun(
      'INSERT INTO users (username, password, role, nombre, email, estado, telefono, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username.toLowerCase(), hash, 'cliente', nombre, email || '', 'pendiente', telefono || '', lang]
    );
    dbRun(
      'INSERT INTO clientes (user_id, objetivo, nivel, peso_actual, altura, edad, sexo, actividad, observaciones, dieta_tipo, alimentos_no, lesiones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ur.lastInsertRowid, objetivo || 'Volumen', nivel || 'Intermedio', parseFloat(peso_actual) || 0,
       parseInt(altura) || 0, parseInt(edad) || 0, sexo || 'Hombre', actividad || 'Moderada',
       observaciones || '', dieta_tipo || 'Omnivoro', alimentos_no || '', lesiones || '']
    );
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/auth/solicitar-reset — olvidé contraseña (cliente) ──────────────
router.post('/solicitar-reset', async (req, res) => {
  const lang = getLang(req);
  res.json({ ok: true, msg: t('contactCoach', lang) });
});

// ── POST /api/auth/reset-password — coach resetea contraseña de un cliente ────
router.post('/reset-password', authMiddleware, coachOnly, async (req, res) => {
  const lang = getLang(req);
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword)
    return res.status(400).json({ error: t('missingFields', lang) });

  if (String(newPassword).length < 4)
    return res.status(400).json({ error: t('minPassword', lang) });

  const user = dbGet('SELECT id FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ error: t('userNotFound', lang) });

  const hash = bcrypt.hashSync(String(newPassword), 10);
  dbRun('UPDATE users SET password = ? WHERE id = ?', [hash, userId]);
  res.json({ ok: true });
});

module.exports = { router, authMiddleware, coachOnly };
