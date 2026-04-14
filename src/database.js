const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/wolfmindset.db');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let db;

function saveToDisk() {
  if (!db) return;
  try { const data = db.export(); fs.writeFileSync(DB_PATH, Buffer.from(data)); } catch(e) {}
}

async function initDB() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'cliente', nombre TEXT NOT NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE, objetivo TEXT DEFAULT 'Volumen', nivel TEXT DEFAULT 'Intermedio', semanas INTEGER DEFAULT 1, kcal_internas INTEGER DEFAULT 2500, prot INTEGER DEFAULT 160, carbs INTEGER DEFAULT 280, fat INTEGER DEFAULT 80, comida_libre TEXT DEFAULT 'Elige lo que mas te apetezca.', mensaje_semana TEXT DEFAULT '', notas_coach TEXT DEFAULT '', peso_actual REAL DEFAULT 0, altura INTEGER DEFAULT 0, edad INTEGER DEFAULT 0, sexo TEXT DEFAULT 'Hombre', actividad TEXT DEFAULT 'Moderada', cintura_actual REAL DEFAULT 0, cadera REAL DEFAULT 0, observaciones TEXT DEFAULT '')\`);
  // Add columns if they don't exist (for existing DBs)
  ['peso_actual REAL','altura INTEGER','edad INTEGER','sexo TEXT','actividad TEXT','cintura_actual REAL','cadera REAL','observaciones TEXT'].forEach(col => {
    try { db.run('ALTER TABLE clientes ADD COLUMN ' + col); } catch(e) {}
  });
  db.run(`CREATE TABLE IF NOT EXISTS peso_registros (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, peso REAL, grasa REAL, cintura REAL, fecha DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  db.run(`CREATE TABLE IF NOT EXISTS dias_entreno (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, nombre TEXT, grupo TEXT, orden INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS ejercicios_dia (id INTEGER PRIMARY KEY AUTOINCREMENT, dia_id INTEGER, nombre TEXT, musculos TEXT, series INTEGER DEFAULT 3, reps TEXT DEFAULT '10-12', peso_objetivo REAL DEFAULT 0, descanso INTEGER DEFAULT 90, orden INTEGER DEFAULT 0, es_pr INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS comidas (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, nombre TEXT, orden INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS alimentos (id INTEGER PRIMARY KEY AUTOINCREMENT, comida_id INTEGER, nombre TEXT, gramos INTEGER, orden INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS recetas (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, nombre TEXT, pasos TEXT, orden INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS receta_ingredientes (id INTEGER PRIMARY KEY AUTOINCREMENT, receta_id INTEGER, nombre TEXT, gramos INTEGER)`);
  db.run(`CREATE TABLE IF NOT EXISTS fotos (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, url TEXT, analysis TEXT, fecha DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  db.run(`CREATE TABLE IF NOT EXISTS ejercicios_db (id INTEGER PRIMARY KEY AUTOINCREMENT, grupo TEXT, nombre TEXT, musculos TEXT, tipo TEXT, dificultad TEXT, equipo TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS alimentos_db (id INTEGER PRIMARY KEY AUTOINCREMENT, categoria TEXT, nombre TEXT, calorias REAL, proteinas REAL, carbos REAL, grasas REAL)`);

  saveToDisk();
  setInterval(saveToDisk, 30000);

  const bcrypt = require('bcryptjs');
  const existing = dbGet('SELECT id FROM users WHERE username = ?', ['wolf']);
  if (!existing) {
    const hash = bcrypt.hashSync('1234', 10);
    dbRun('INSERT INTO users (username, password, role, nombre) VALUES (?, ?, ?, ?)', ['wolf', hash, 'coach', 'Coach WolfMindset']);
    console.log('Coach creado: wolf / 1234');
  }

  // Seed exercises and foods if empty
  const exCount = dbGet('SELECT COUNT(*) as c FROM ejercicios_db', []);
  if (!exCount || exCount.c === 0) {
    const { EJERCICIOS, ALIMENTOS } = require('./seed');
    EJERCICIOS.forEach(e => dbRun('INSERT INTO ejercicios_db (grupo,nombre,musculos,tipo,dificultad,equipo) VALUES (?,?,?,?,?,?)', [e.grupo,e.nombre,e.musculos,e.tipo,e.dificultad,e.equipo]));
    ALIMENTOS.forEach(a => dbRun('INSERT INTO alimentos_db (categoria,nombre,calorias,proteinas,carbos,grasas) VALUES (?,?,?,?,?,?)', [a.categoria,a.nombre,a.calorias,a.proteinas,a.carbos,a.grasas]));
    saveToDisk();
    console.log('Base de datos de ejercicios y alimentos cargada');
  }

  console.log('DB lista');
}

function dbRun(sql, params = []) {
  db.run(sql, params);
  const r = db.exec('SELECT last_insert_rowid() as id');
  return { lastInsertRowid: r[0]?.values[0][0] || null };
}

function dbAll(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch(e) { console.error('dbAll error:', e.message); return []; }
}

function dbGet(sql, params = []) {
  return dbAll(sql, params)[0] || null;
}

module.exports = { initDB, dbRun, dbAll, dbGet, saveToDisk };
