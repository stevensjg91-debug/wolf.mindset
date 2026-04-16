require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, dbRun, dbAll, saveToDisk } = require('./database');
const { router: authRouter } = require('./auth');
const apiRoutes = require('./routes');
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

// Trigger manual
app.post('/api/download-images', (req, res) => {
  downloadAll()
    .then(r => res.json({ ok: true, ...r }))
    .catch(e => res.status(500).json({ error: e.message }));
});

// Estado real desde BD — DEBE estar antes del app.get('*')
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

app.use('/api', apiRoutes);

// Este wildcard debe ir AL FINAL
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
