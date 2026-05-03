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

  const rawPriv = fromb64u(VAPID_PRIVATE_KEY);
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.setPrivateKey(rawPriv);
  const pub = ecdh.getPublicKey();
  const jwk = { kty:'EC', crv:'P-256', d:b64u(rawPriv), x:b64u(pub.slice(1,33)), y:b64u(pub.slice(33,65)) };
  const privKey = crypto.createPrivateKey({ key: jwk, format: 'jwk' });
  const sig = crypto.createSign('SHA256').update(unsigned).sign({ key: privKey, dsaEncoding: 'ieee-p1363' });
  return unsigned + '.' + b64u(sig);
}

// (todo tu código push intacto...)

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
app.use(express.static(path.join(__dirname, '../public'), { index: false }));
app.use('/api/auth', authRouter);

// (todas tus rutas intactas...)

app.get('/app2.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(require('path').join(__dirname, '../public/app2.js'));
});


// ── BACKUP DB ─────────────────────────────────────────────────
app.get('/api/backup-db', (req, res) => {
  const secret = req.query.secret;
  if (secret !== 'wolfbackup2025') return res.status(403).end();

  const dbPath = process.env.DB_PATH || 
    path.join(__dirname, '../../data/wolfmindset.db');

  res.download(dbPath);
});


// Wildcard (SIEMPRE EL ÚLTIMO)
const BUILD_VERSION = Date.now();
let _indexHtml = null;
function getIndexHtml() {
  if(!_indexHtml) {
    const raw = require('fs').readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    _indexHtml = raw.replace(/\{\{BUILD_VERSION\}\}/g, String(BUILD_VERSION));
  }
  return _indexHtml;
}

app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(getIndexHtml());
});


// INIT DB (sin tocar)
initDB().then(() => {
  try {
    dbRun(`CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subscription TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  } catch(e) {}

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WolfMindset corriendo en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error iniciando DB:', err);
  process.exit(1);
});
