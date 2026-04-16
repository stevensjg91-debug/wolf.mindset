const { dbRun, dbAll, saveToDisk } = require('./database');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '122711d725mshfa4bd64e457d1cep1ea5c0jsn8bb4cd25aa6a';

function toSearchTerm(nombre) {
  return nombre.toLowerCase()
    .replace(/\(barbell\)/g,'barbell').replace(/\(dumbbell\)/g,'dumbbell')
    .replace(/\(machine\)/g,'machine').replace(/\(cable\)/g,'cable')
    .replace(/\(rope\)/g,'rope').replace(/\(bar\)/g,'bar')
    .replace(/\(ez bar\)/g,'ez bar').replace(/\(overhand\)/g,'')
    .replace(/\(underhand\)/g,'').replace(/\(neutral grip\)/g,'')
    .replace(/\(wide grip\)/g,'wide grip').replace(/\(narrow grip\)/g,'narrow grip')
    .replace(/\(plate loaded\)/g,'').replace(/[()]/g,'').trim();
}

async function httpsGet(url, headers) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const req = https.get({
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers,
        timeout: 15000
      }, res => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return httpsGet(res.headers.location, headers).then(resolve).catch(reject);
        }
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    } catch(e) { reject(e); }
  });
}

async function searchExercise(name) {
  const term = toSearchTerm(name);
  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(term)}?limit=3&offset=0`;
  try {
    const res = await httpsGet(url, {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    });
    if (res.status !== 200) return null;
    const data = JSON.parse(res.body);
    if (!data || !data.length) return null;
    return data[0].gifUrl || null;
  } catch(e) { return null; }
}

async function downloadAll() {
  // Get all exercises from DB
  const ejercicios = dbAll('SELECT nombre FROM ejercicios_db', []);
  const nombres = [...new Set(ejercicios.map(e => e.nombre))];

  let ok = 0, skip = 0, fail = 0;
  console.log(`Fetching GIF URLs for ${nombres.length} exercises from ExerciseDB...`);

  for (const nombre of nombres) {
    // Check if already saved in ejercicios_config
    const existing = dbAll('SELECT imagen_url FROM ejercicios_config WHERE nombre = ?', [nombre]);
    if (existing.length && existing[0].imagen_url) {
      skip++;
      continue;
    }

    const gifUrl = await searchExercise(nombre);
    if (!gifUrl) {
      console.log(`✗ Not found: ${nombre}`);
      fail++;
      await new Promise(r => setTimeout(r, 200));
      continue;
    }

    // Upsert into ejercicios_config
    const exists = dbAll('SELECT id FROM ejercicios_config WHERE nombre = ?', [nombre]);
    if (exists.length) {
      dbRun('UPDATE ejercicios_config SET imagen_url = ? WHERE nombre = ?', [gifUrl, nombre]);
    } else {
      dbRun('INSERT INTO ejercicios_config (nombre, imagen_url) VALUES (?, ?)', [nombre, gifUrl]);
    }

    console.log(`✓ ${nombre}`);
    ok++;
    await new Promise(r => setTimeout(r, 350));
  }

  saveToDisk();
  console.log(`\nDone: ${ok} saved, ${skip} cached, ${fail} failed`);
  return { ok, skip, fail };
}

module.exports = { downloadAll };
if (require.main === module) downloadAll();
