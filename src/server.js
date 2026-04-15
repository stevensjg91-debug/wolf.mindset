require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, dbRun, saveToDisk } = require('./database');
const { router: authRouter } = require('./auth');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRouter);

// Ruta pública para recargar ejercicios - sin autenticación
app.post('/api/reload-ejercicios', (req, res) => {
  try {
    const { dbRun, saveToDisk } = require('./database');
    dbRun('DELETE FROM ejercicios_db', []);
    dbRun('DELETE FROM alimentos_db', []);
    const { EJERCICIOS, ALIMENTOS } = require('./seed');
    EJERCICIOS.forEach(e => dbRun('INSERT INTO ejercicios_db (grupo,nombre,musculos,tipo,dificultad,equipo) VALUES (?,?,?,?,?,?)',
      [e.grupo,e.nombre,e.musculos,e.tipo,e.dificultad,e.equipo]));
    ALIMENTOS.forEach(a => dbRun('INSERT INTO alimentos_db (categoria,nombre,calorias,proteinas,carbos,grasas) VALUES (?,?,?,?,?,?)',
      [a.categoria,a.nombre,a.calorias,a.proteinas,a.carbos,a.grasas]));
    saveToDisk();
    res.json({ ok: true, ejercicios: EJERCICIOS.length, alimentos: ALIMENTOS.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use('/api', apiRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Download exercise images on startup if needed
const { downloadAll, EX_DIR } = require('./download-images');
const fs_main = require('fs');
const existingImgs = fs_main.existsSync(EX_DIR) ? fs_main.readdirSync(EX_DIR).length : 0;
if (existingImgs < 10) {
  console.log('Downloading exercise images...');
  downloadAll().catch(e => console.log('Image download error:', e.message));
}

// Route to manually trigger re-download
app.post('/api/download-images', (req, res) => {
  downloadAll().then(r => res.json({ ok: true, ...r })).catch(e => res.status(500).json({ error: e.message }));
});

// Route to check image status
app.get('/api/images-status', (req, res) => {
  const count = fs_main.existsSync(EX_DIR) ? fs_main.readdirSync(EX_DIR).length : 0;
  res.json({ count, ready: count > 50 });
});

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WolfMindset corriendo en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error iniciando DB:', err);
  process.exit(1);
});
