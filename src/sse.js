// sse.js
// Gestiona conexiones Server-Sent Events activas.
// Uso en routes.js: const { sseClients, ssePush } = require('./sse');

const sseClients = new Map(); // userId (string) → res

/**
 * Envía un evento a un usuario concreto si está conectado.
 * @param {string|number} userId
 * @param {string} tipo   — 'notificacion' | 'mensaje' | 'badge_msgs' | 'ping'
 * @param {object} data   — payload que llega al frontend
 */
function ssePush(userId, tipo, data) {
  const res = sseClients.get(String(userId));
  if (!res) return false;
  try {
    res.write(`event: ${tipo}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    return true;
  } catch(e) {
    sseClients.delete(String(userId));
    return false;
  }
}

/**
 * Envía un evento a TODOS los coaches conectados.
 * Útil para notificar que un cliente escribió un mensaje.
 */
function ssePushCoaches(tipo, data) {
  sseClients.forEach((res, userId) => {
    try {
      res.write(`event: ${tipo}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch(e) {
      sseClients.delete(userId);
    }
  });
}

module.exports = { sseClients, ssePush, ssePushCoaches };
