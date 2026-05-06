const express = require('express');
const { dbGet, dbAll, dbRun, saveToDisk } = require('./database');
const { authMiddleware, coachOnly } = require('./auth');
const { ssePush, ssePushCoaches } = require('./sse');

const router = express.Router();
router.use(authMiddleware);
router.use(middlewareMensajeDiario);

// ── HELPERS ───────────────────────────────────────────────────────────
function crearNotificacion(userId, tipo, mensaje) {
  try {
    dbRun('INSERT INTO notificaciones (user_id, tipo, mensaje) VALUES (?,?,?)',
      [userId, tipo, mensaje]);
    ssePush(userId, 'notificacion', { tipo, mensaje, ts: Date.now() });
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
    return c ? c.nombre : 'Un cliente';
  } catch(e) { return 'Un cliente'; }
}

function middlewareMensajeDiario(req, res, next) { next(); }

// ── SISTEMA DE PLANTILLAS (IA REUSABLE) ──────────────────────────────

// Guarda la rutina de un cliente como una plantilla nueva
router.post('/plantillas/guardar', coachOnly, async (req, res) => {
  try {
    const { clienteId, nombre, nivel, objetivo } = req.body;
    
    const dias = dbAll('SELECT * FROM dias WHERE cliente_id = ? ORDER BY orden', [clienteId]);
    const ejercicios = dbAll('SELECT * FROM ejercicios WHERE cliente_id = ?', [clienteId]);

    // La IA estructura el snapshot para que sea independiente del cliente original
    const snapshot = dias.map(d => ({
      nombre: d.nombre,
      ejercicios: ejercicios.filter(e => e.dia_id === d.id).map(e => ({
        nombre: e.nombre,
        series: e.series,
        reps: e.reps,
        descanso: e.descanso,
        notas: e.notas,
        musculo: e.musculo_principal
      }))
    }));

    dbRun(`INSERT INTO rutinas_plantillas (coach_id, nombre, nivel, objetivo, dias_json) VALUES (?,?,?,?,?)`,
      [req.user.id, nombre, nivel, objetivo, JSON.stringify(snapshot)]);
    
    saveToDisk();
    res.json({ ok: true });
  } catch (e) { 
    res.status(500).json({ error: "Error al guardar plantilla: " + e.message }); 
  }
});

// Lista todas las plantillas del coach
router.get('/plantillas/lista', coachOnly, (req, res) => {
  try {
    const lista = dbAll('SELECT id, nombre, nivel, objetivo, dias_json, created_at FROM rutinas_plantillas WHERE coach_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(lista);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Borrar una plantilla
router.delete('/plantillas/:id', coachOnly, (req, res) => {
  try {
    dbRun('DELETE FROM rutinas_plantillas WHERE id = ? AND coach_id = ?', [req.params.id, req.user.id]);
    saveToDisk();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── RUTAS EXISTENTES (MANTENIDAS) ─────────────────────────────────────

// Suscripción Push
router.post('/push/subscribe', (req, res) => {
  const { subscription } = req.body;
  if(!subscription || !subscription.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  try {
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

router.get('/push/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || 'BGXVsTmH4dCRzJk2vPoqMX08DtwH_EBk2fF42nIQGfubO9utSacLfZxCF4wTBQxDrH50S_8aZuUg5oKppHqF51A' });
});

module.exports = router;
