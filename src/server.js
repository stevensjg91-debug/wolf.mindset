require('dotenv').config();
const express = require('express');

// ── WEB PUSH ──────────────────────────────────────────────────────────────────
const crypto = require('crypto');
const https  = require('https');
const urlMod = require('url');

const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY  || 'BGXVsTmH4dCRzJk2vPoqMX08DtwH_EBk2fF42nIQGfubO9utSacLfZxCF4wTBQxDrH50S_8aZuUg5oKppHqF51A';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'uLGKx8F9YsP0gqhVqFuT_MKepxPBOQrjEX0bdnGxAoY';
const VAPID_SUBJECT     = process.env.VAPID_SUBJECT     || 'mailto:coach@wolfmindset.com';

// ── Helpers ──────────────────────────────────────────────────────────────────
function b64u(buf){ return buf.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }
function fromb64u(s){ return Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/'), 'base64'); }

function hkdf(salt, ikm, info, len) {
  const prk = crypto.createHmac('sha256', salt).update(ikm).digest();
  let t = Buffer.alloc(0), okm = Buffer.alloc(0), i = 1;
  while (okm.length < len) {
    t = crypto.createHmac('sha256', prk).update(Buffer.concat([t, info, Buffer.from([i++])])).digest();
    okm = Buffer.concat([okm, t]);
  }
  return okm.slice(0, len);
}

function getVapidECDH() {
  const rawPriv = fromb64u(VAPID_PRIVATE_KEY);
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.setPrivateKey(rawPriv);
  return ecdh;
}

function makeVapidJwt(audience) {
  const hdr = b64u(Buffer.from(JSON.stringify({typ:'JWT',alg:'ES256'})));
  const now = Math.floor(Date.now()/1000);
  const pay = b64u(Buffer.from(JSON.stringify({aud:audience, exp:now+43200, sub:VAPID_SUBJECT})));
  const unsigned = hdr + '.' + pay;

  // Use JWK format — works on Node 16+ without manual DER encoding
  const rawPriv = fromb64u(VAPID_PRIVATE_KEY);
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.setPrivateKey(rawPriv);
  const pub = ecdh.getPublicKey();
  const jwk = { kty:'EC', crv:'P-256', d:b64u(rawPriv), x:b64u(pub.slice(1,33)), y:b64u(pub.slice(33,65)) };
  const privKey = crypto.createPrivateKey({ key: jwk, format: 'jwk' });
  const sig = crypto.createSign('SHA256').update(unsigned).sign({ key: privKey, dsaEncoding: 'ieee-p1363' });
  return unsigned + '.' + b64u(sig);
}

async function sendWebPush(subscription, payload) {
  try {
    const endpoint  = subscription.endpoint;
    const parsed    = new urlMod.URL(endpoint);
    const audience  = parsed.origin;
    const jwt       = makeVapidJwt(audience);

    // Get raw public key (uncompressed, 65 bytes)
    const serverPubKeyRaw = getVapidECDH().getPublicKey(); // 65 bytes uncompressed

    // RFC 8291 encryption
    const clientPub  = fromb64u(subscription.keys.p256dh);  // 65 bytes
    const authSecret = fromb64u(subscription.keys.auth);     // 16 bytes
    const salt       = crypto.randomBytes(16);

    const serverECDH = crypto.createECDH('prime256v1');
    serverECDH.generateKeys();
    const serverEphemeralPub    = serverECDH.getPublicKey();          // 65 bytes
    const sharedSecret          = serverECDH.computeSecret(clientPub);

    // ikm via HKDF (RFC 8291 §3.3)
    const ikmInfo = Buffer.concat([
      Buffer.from('WebPush: info'), Buffer.from([0]),
      clientPub, serverEphemeralPub
    ]);
    const ikm = hkdf(authSecret, sharedSecret, ikmInfo, 32);

    // Content encryption key and nonce
    const cekInfo   = Buffer.concat([Buffer.from('Content-Encoding: aes128gcm'), Buffer.from([0])]);
    const nonceInfo = Buffer.concat([Buffer.from('Content-Encoding: nonce'),     Buffer.from([0])]);
    const cek   = hkdf(salt, ikm, cekInfo,   16);
    const nonce = hkdf(salt, ikm, nonceInfo, 12);

    // Encrypt
    const cipher    = crypto.createCipheriv('aes-128-gcm', cek, nonce);
    const plaintext = Buffer.concat([Buffer.from(JSON.stringify(payload)), Buffer.from([0x02])]);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);

    // Build aes128gcm content-encoding record
    const rs      = Buffer.alloc(4); rs.writeUInt32BE(plaintext.length + 16 + 1);
    const body    = Buffer.concat([salt, rs, Buffer.from([serverEphemeralPub.length]), serverEphemeralPub, ciphertext]);

    const vapidHeader = `vapid t=${jwt},k=${b64u(serverPubKeyRaw)}`;

    return new Promise((resolve) => {
      const req = https.request({
        hostname: parsed.hostname,
        path:     parsed.pathname + parsed.search,
        method:   'POST',
        headers:  {
          'Content-Type':     'application/octet-stream',
          'Content-Encoding': 'aes128gcm',
          'Content-Length':   body.length,
          'Authorization':    vapidHeader,
          'TTL':              '86400',
        }
      }, res => {
        let raw = '';
        res.on('data', d => raw += d);
        res.on('end', () => {
          if(res.statusCode >= 400) console.log('[Push] HTTP', res.statusCode, raw.slice(0,120), endpoint.slice(0,60));
          else console.log('[Push] sent', res.statusCode, endpoint.slice(0,60));
          resolve(res.statusCode);
        });
      });
      req.on('error', e => { console.log('[Push] error:', e.message); resolve(0); });
      req.write(body);
      req.end();
    });
  } catch(e) {
    console.log('[Push] sendWebPush threw:', e.message, e.stack?.split('\n')[1]);
    return 0;
  }
}

// Global push function — called from routes.js
global.sendPushToUser = async function(userId, title, body, urlPath='/') {
  try {
    const { dbAll, dbRun, saveToDisk } = require('./database');
    const subs = dbAll('SELECT id, subscription FROM push_subscriptions WHERE user_id=?', [userId]);
    for(const row of subs) {
      try {
        const sub = JSON.parse(row.subscription);
        const status = await sendWebPush(sub, { title, body, url: urlPath });
        // 404/410 = subscription expired/invalid — remove from DB
        if(status === 404 || status === 410 || status === 0) {
          console.log('[Push] Removing invalid subscription id', row.id, 'status', status);
          dbRun('DELETE FROM push_subscriptions WHERE id=?', [row.id]);
          saveToDisk();
        }
      } catch(e) { console.log('[Push] sendPushToUser inner error:', e.message); }
    }
  } catch(e) { console.log('[Push] sendPushToUser error:', e.message); }
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
// Serve static files but NOT index.html — that's handled dynamically with cache buster
app.use(express.static(path.join(__dirname, '../public'), { index: false }));
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

// Wildcard al final — sirve index.html con cache buster inyectado
const BUILD_VERSION = Date.now();
let _indexHtml = null;
function getIndexHtml() {
  if(!_indexHtml) {
    const raw = require('fs').readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    _indexHtml = raw.replace(/\{\{BUILD_VERSION\}\}/g, BUILD_VERSION);
  }
  return _indexHtml;
}
app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(getIndexHtml());
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
