require('dotenv').config();
const express = require('express');

// ── WEB PUSH (sin dependencia externa) ───────────────────────────────────────
// Implementación manual de Web Push usando crypto nativo de Node.js
const { createECDH, createSign, randomBytes, createCipheriv } = require('crypto');
const https = require('https');
const url = require('url');

const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY  || 'BGXVsTmH4dCRzJk2vPoqMX08DtwH_EBk2fF42nIQGfubO9utSacLfZxCF4wTBQxDrH50S_8aZuUg5oKppHqF51A';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'uLGKx8F9YsP0gqhVqFuT_MKepxPBOQrjEX0bdnGxAoY';
const VAPID_SUBJECT     = process.env.VAPID_SUBJECT     || 'mailto:coach@wolfmindset.com';

function b64urlToBuffer(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64');
}
function bufferToB64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function sendWebPush(subscription, payload) {
  try {
    const endpoint = subscription.endpoint;
    const parsedUrl = new url.URL(endpoint);
    const audience = parsedUrl.origin;

    // Build VAPID JWT header + claims
    const header = bufferToB64url(Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
    const now = Math.floor(Date.now() / 1000);
    const claims = bufferToB64url(Buffer.from(JSON.stringify({
      aud: audience, exp: now + 12 * 3600, sub: VAPID_SUBJECT
    })));
    const sigInput = `${header}.${claims}`;

    // Sign with VAPID private key
    const privKeyDer = Buffer.concat([
      Buffer.from('308141020100301306072a8648ce3d020106082a8648ce3d030107042730250201010420', 'hex'),
      b64urlToBuffer(VAPID_PRIVATE_KEY)
    ]);

    const sign = createSign('SHA256');
    sign.update(sigInput);
    const sigDer = sign.sign({ key: privKeyDer, format: 'der', type: 'pkcs8', dsaEncoding: 'ieee-p1363' });
    const jwt = `${sigInput}.${bufferToB64url(sigDer)}`;

    // Encrypt payload using ECDH + AES-128-GCM (RFC 8291)
    const authBuf  = b64urlToBuffer(subscription.keys.auth);
    const p256dhBuf = b64urlToBuffer(subscription.keys.p256dh);
    const payloadBuf = Buffer.from(JSON.stringify(payload));
    const salt = randomBytes(16);
    const serverECDH = createECDH('prime256v1');
    serverECDH.generateKeys();
    const serverPublicKey = serverECDH.getPublicKey();
    const sharedSecret = serverECDH.computeSecret(p256dhBuf);

    // HKDF helpers
    function hkdfExtract(salt, ikm) {
      const { createHmac } = require('crypto');
      return createHmac('sha256', salt).update(ikm).digest();
    }
    function hkdfExpand(prk, info, len) {
      const { createHmac } = require('crypto');
      let t = Buffer.alloc(0), okm = Buffer.alloc(0);
      for(let i = 1; okm.length < len; i++) {
        t = createHmac('sha256', prk).update(Buffer.concat([t, info, Buffer.from([i])])).digest();
        okm = Buffer.concat([okm, t]);
      }
      return okm.slice(0, len);
    }

    const prk = hkdfExtract(authBuf, sharedSecret);
    const keyInfo = Buffer.concat([
      Buffer.concat([Buffer.from('Content-Encoding: aes128gcm'), Buffer.from([0])]),
      Buffer.from([0x00, 0x41]),
      p256dhBuf, serverPublicKey
    ]);
    const ikm = hkdfExpand(prk, Buffer.concat([Buffer.from('WebPush: info'), Buffer.from([0])]), 32);
    const contentKey = hkdfExpand(
      hkdfExtract(salt, ikm),
      Buffer.concat([Buffer.from('Content-Encoding: aes128gcm'), Buffer.from([0])]), 16
    );
    const contentNonce = hkdfExpand(
      hkdfExtract(salt, ikm),
      Buffer.concat([Buffer.from('Content-Encoding: nonce'), Buffer.from([0])]), 12
    );

    const cipher = createCipheriv('aes-128-gcm', contentKey, contentNonce);
    const padded = Buffer.concat([payloadBuf, Buffer.from([0x02])]);
    const encrypted = Buffer.concat([cipher.update(padded), cipher.final(), cipher.getAuthTag()]);

    // Build record header: salt(16) + rs(4) + keyid_len(1) + server_public_key(65)
    const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
    const bodyBuf = Buffer.concat([salt, rs, Buffer.from([65]), serverPublicKey, encrypted]);

    const vapidHeader = `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`;

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'aes128gcm',
          'Content-Length': bodyBuf.length,
          'Authorization': vapidHeader,
          'TTL': '86400',
        }
      }, res => {
        res.resume();
        if(res.statusCode >= 400) {
          console.log('[Push] Error status:', res.statusCode, endpoint.slice(0,50));
        }
        resolve(res.statusCode);
      });
      req.on('error', e => { console.log('[Push] Network error:', e.message); resolve(0); });
      req.write(bodyBuf);
      req.end();
    });
  } catch(e) {
    console.log('[Push] sendWebPush error:', e.message);
    return 0;
  }
}

// Global push function — called from routes.js
global.sendPushToUser = async function(userId, title, body, urlPath='/') {
  try {
    const { dbAll } = require('./database');
    const subs = dbAll('SELECT subscription FROM push_subscriptions WHERE user_id=?', [userId]);
    for(const row of subs) {
      try {
        const sub = JSON.parse(row.subscription);
        await sendWebPush(sub, { title, body, url: urlPath });
      } catch(e) {}
    }
  } catch(e) {}
};
const cors = require('cors');
const path = require('path');
const { initDB, dbRun, dbAll, saveToDisk } = require('./database');
const { router: authRouter } = require('./auth');
const apiRoutes = require('./routes');
const { sseClients } = require('./sse');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/auth', authRouter);

app.post('/api/reload-ejercicios', (req, res) => {
  try {
    const { dbRun, saveToDisk } = require('./database');
    dbRun('DELETE FROM ejercicios_db', []);
    dbRun('DELETE FROM alimentos_db', []);
    const { EJERCICIOS, ALIMENTOS } = require('./seed');
    EJERCICIOS.forEach(e => dbRun(
      'INSERT INTO ejercicios_db (grupo,nombre,musculos,tipo,dificultad,equipo) VALUES (?,?,?,?,?,?)',
      [e.grupo, e.nombre, e.musculos, e.tipo, e.dificultad, e.equipo]
    ));
    ALIMENTOS.forEach(a => dbRun(
      'INSERT INTO alimentos_db (categoria,nombre,calorias,proteinas,carbos,grasas) VALUES (?,?,?,?,?,?)',
      [a.categoria, a.nombre, a.calorias, a.proteinas, a.carbos, a.grasas]
    ));
    saveToDisk();
    res.json({ ok: true, ejercicios: EJERCICIOS.length, alimentos: ALIMENTOS.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Imágenes ──────────────────────────────────────────────────────────────────
const { downloadAll } = require('./download-images');

app.post('/api/download-images', (req, res) => {
  downloadAll()
    .then(r => res.json({ ok: true, ...r }))
    .catch(e => res.status(500).json({ error: e.message }));
});

app.get('/api/images-status', (req, res) => {
  try {
    const rows = dbAll(
      "SELECT COUNT(*) as c FROM ejercicios_config WHERE imagen_url IS NOT NULL AND imagen_url != ''",
      []
    );
    const count = rows[0]?.c || 0;
    res.json({ count, ready: count > 50 });
  } catch(e) {
    res.json({ count: 0, ready: false });
  }
});

// ── SSE — Eventos en tiempo real ─────────────────────────────────────────────
// El cliente abre esta conexión al hacer login y la mantiene abierta.
// El servidor empuja eventos cuando hay notificaciones, mensajes, etc.
//
// Auth: el token se pasa como query param porque EventSource no soporta headers.
// Ejemplo: GET /api/eventos?token=eyJ...
app.get('/api/eventos', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).end();

  // Verificar token (mismo JWT_SECRET que en auth.js)
  let user;
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'wolfmindset_secret';
    user = jwt.verify(token, JWT_SECRET);
  } catch(e) {
    return res.status(401).end();
  }

  // Cabeceras SSE
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx/Railway: desactiva buffering
  res.flushHeaders();

  const userId = String(user.id);

  // Si ya había una conexión anterior del mismo usuario, cerrarla
  const anterior = sseClients.get(userId);
  if (anterior) {
    try { anterior.end(); } catch(e) {}
  }
  sseClients.set(userId, res);
  console.log(`[SSE] Usuario ${userId} conectado. Activos: ${sseClients.size}`);

  // Ping cada 20s para mantener viva la conexión en Railway
  const pingInterval = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch(e) {
      clearInterval(pingInterval);
      sseClients.delete(userId);
    }
  }, 20000);

  // Limpiar al desconectar
  req.on('close', () => {
    clearInterval(pingInterval);
    sseClients.delete(userId);
    console.log(`[SSE] Usuario ${userId} desconectado. Activos: ${sseClients.size}`);
  });
});

app.use('/api', apiRoutes);

// Wildcard al final
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

initDB().then(() => {
  const rows = dbAll(
    "SELECT COUNT(*) as c FROM ejercicios_config WHERE imagen_url IS NOT NULL AND imagen_url != ''",
    []
  );
  const existingImgs = rows[0]?.c || 0;
  if (existingImgs < 10) {
    console.log(`Solo ${existingImgs} imágenes en BD. Descargando desde ExerciseDB...`);
    downloadAll().catch(e => console.log('Image fetch error:', e.message));
  } else {
    console.log(`✓ ${existingImgs} imágenes ya en BD, no se necesita descarga.`);
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WolfMindset corriendo en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error iniciando DB:', err);
  process.exit(1);
});
