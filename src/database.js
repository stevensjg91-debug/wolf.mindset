const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/wolfmindset.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cliente',
      nombre TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE REFERENCES users(id),
      objetivo TEXT DEFAULT 'Volumen',
      nivel TEXT DEFAULT 'Intermedio',
      semanas INTEGER DEFAULT 1,
      kcal_internas INTEGER DEFAULT 2500,
      prot INTEGER DEFAULT 160,
      carbs INTEGER DEFAULT 280,
      fat INTEGER DEFAULT 80,
      comida_libre TEXT DEFAULT 'Elige lo que más te apetezca. Te lo mereces.',
      mensaje_semana TEXT DEFAULT '',
      notas_coach TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS peso_registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER REFERENCES clientes(id),
      peso REAL NOT NULL,
      grasa REAL,
      cintura REAL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dias_entreno (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER REFERENCES clientes(id),
      nombre TEXT NOT NULL,
      grupo TEXT NOT NULL,
      orden INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ejercicios_dia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dia_id INTEGER REFERENCES dias_entreno(id),
      nombre TEXT NOT NULL,
      musculos TEXT,
      series INTEGER DEFAULT 3,
      reps TEXT DEFAULT '10-12',
      peso_objetivo REAL DEFAULT 0,
      descanso INTEGER DEFAULT 90,
      orden INTEGER DEFAULT 0,
      es_pr INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS comidas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER REFERENCES clientes(id),
      nombre TEXT NOT NULL,
      orden INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS alimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comida_id INTEGER REFERENCES comidas(id),
      nombre TEXT NOT NULL,
      gramos INTEGER NOT NULL,
      orden INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS recetas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER REFERENCES clientes(id),
      nombre TEXT NOT NULL,
      pasos TEXT,
      orden INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS receta_ingredientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receta_id INTEGER REFERENCES recetas(id),
      nombre TEXT NOT NULL,
      gramos INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fotos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER REFERENCES clientes(id),
      url TEXT NOT NULL,
      analysis TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed coach user if not exists
  const bcrypt = require('bcryptjs');
  const coachExists = db.prepare('SELECT id FROM users WHERE username = ?').get('wolf');
  if (!coachExists) {
    const hash = bcrypt.hashSync('1234', 10);
    db.prepare('INSERT INTO users (username, password, role, nombre) VALUES (?, ?, ?, ?)').run('wolf', hash, 'coach', 'Coach WolfMindset');
    console.log('Coach user created: wolf / 1234');
  }
}

module.exports = { db, initDB };
