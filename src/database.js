const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/wolfmindset.db');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let db;

// saveToDisk con debounce — evita serializar la BD entera en cada request.
// El setInterval de 30s en initDB ya cubre la persistencia base.
// Las llamadas manuales desde routes.js son "guardar pronto" sin bloquear.
let _saveTimer = null;
function _doSave() {
  if (!db) return;
  try { const data = db.export(); fs.writeFileSync(DB_PATH, Buffer.from(data)); } catch(e) {}
}
function saveToDisk() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_doSave, 5000);
}

async function initDB() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'cliente', nombre TEXT NOT NULL, email TEXT DEFAULT '', estado TEXT DEFAULT 'activo', telefono TEXT DEFAULT '')`);
  // Columnas añadidas tras el esquema original — necesarias para BDs existentes
  try { db.run("ALTER TABLE users ADD COLUMN lang TEXT DEFAULT 'es'"); } catch(e) {}
  try { db.run("ALTER TABLE users ADD COLUMN foto_perfil TEXT DEFAULT NULL"); } catch(e) {}

  db.run(`CREATE TABLE IF NOT EXISTS clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE, objetivo TEXT DEFAULT 'Volumen', nivel TEXT DEFAULT 'Intermedio', semanas INTEGER DEFAULT 1, kcal_internas INTEGER DEFAULT 2500, prot INTEGER DEFAULT 160, carbs INTEGER DEFAULT 280, fat INTEGER DEFAULT 80, comida_libre TEXT DEFAULT 'Elige lo que mas te apetezca.', mensaje_semana TEXT DEFAULT '', notas_coach TEXT DEFAULT '', peso_actual REAL DEFAULT 0, altura INTEGER DEFAULT 0, edad INTEGER DEFAULT 0, sexo TEXT DEFAULT 'Hombre', actividad TEXT DEFAULT 'Moderada', cintura_actual REAL DEFAULT 0, cadera REAL DEFAULT 0, observaciones TEXT DEFAULT '', dieta_tipo TEXT DEFAULT 'Omnivoro', alimentos_no TEXT DEFAULT '', lesiones TEXT DEFAULT '')`);
  // Columnas añadidas tras el esquema original — necesarias para BDs existentes
  try { db.run("ALTER TABLE clientes ADD COLUMN deficiencias TEXT DEFAULT ''"); } catch(e) {}
  try { db.run("ALTER TABLE clientes ADD COLUMN coach_id INTEGER DEFAULT NULL"); } catch(e) {}

  // ── Asistente IA en chat ──────────────────────────────────────────────────
  try { db.run("ALTER TABLE clientes ADD COLUMN ia_chat_activa INTEGER DEFAULT 0"); } catch(e) {}
  // Control de presencia del coach por cliente: evita que la IA responda encima del coach.
  try { db.run("ALTER TABLE clientes ADD COLUMN coach_online INTEGER DEFAULT 0"); } catch(e) {}
  try { db.run("ALTER TABLE clientes ADD COLUMN last_coach_activity DATETIME DEFAULT NULL"); } catch(e) {}
  db.run(`CREATE TABLE IF NOT EXISTS ia_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    bot_global INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  try { db.run("INSERT OR IGNORE INTO ia_config (id, bot_global) VALUES (1, 0)"); } catch(e) {}

  // ── Mensajes diarios y bienvenida ─────────────────────────────────────────
  try { db.run("ALTER TABLE clientes ADD COLUMN ultimo_acceso_dia TEXT DEFAULT NULL"); } catch(e) {}
  try { db.run("ALTER TABLE clientes ADD COLUMN bienvenida_enviada INTEGER DEFAULT 0"); } catch(e) {}
  try { db.run("ALTER TABLE clientes ADD COLUMN bienvenida_pendiente INTEGER DEFAULT 0"); } catch(e) {}

  db.run(`CREATE TABLE IF NOT EXISTS peso_registros (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, peso REAL, grasa REAL, cintura REAL, fecha DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  db.run(`CREATE TABLE IF NOT EXISTS dias_entreno (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, nombre TEXT, grupo TEXT, orden INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS ejercicios_dia (id INTEGER PRIMARY KEY AUTOINCREMENT, dia_id INTEGER, nombre TEXT, musculos TEXT, series INTEGER DEFAULT 3, reps TEXT DEFAULT '10-12', peso_objetivo REAL DEFAULT 0, descanso INTEGER DEFAULT 90, rir INTEGER, es_principal INTEGER DEFAULT 0, orden INTEGER DEFAULT 0, es_pr INTEGER DEFAULT 0, youtube_url TEXT DEFAULT '', imagen_url TEXT DEFAULT '', nota_coach TEXT DEFAULT '')`);

  db.run(`CREATE TABLE IF NOT EXISTS comidas (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, nombre TEXT, orden INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS alimentos (id INTEGER PRIMARY KEY AUTOINCREMENT, comida_id INTEGER, nombre TEXT, gramos INTEGER, orden INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS recetas (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, nombre TEXT, pasos TEXT, orden INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS receta_ingredientes (id INTEGER PRIMARY KEY AUTOINCREMENT, receta_id INTEGER, nombre TEXT, gramos INTEGER)`);
  db.run(`CREATE TABLE IF NOT EXISTS fotos (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, url TEXT, analysis TEXT, fecha DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  db.run(`CREATE TABLE IF NOT EXISTS ejercicios_db (id INTEGER PRIMARY KEY AUTOINCREMENT, grupo TEXT, nombre TEXT, musculos TEXT, tipo TEXT, dificultad TEXT, equipo TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS ejercicios_config (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT UNIQUE, youtube_url TEXT DEFAULT '', imagen_url TEXT DEFAULT '', nota_default TEXT DEFAULT '')`);
  db.run(`CREATE TABLE IF NOT EXISTS alimentos_db (id INTEGER PRIMARY KEY AUTOINCREMENT, categoria TEXT, nombre TEXT, calorias REAL, proteinas REAL, carbos REAL, grasas REAL)`);

  db.run(`CREATE TABLE IF NOT EXISTS sesiones_entreno (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    dia_nombre TEXT,
    dia_grupo TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    duracion_min INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS series_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sesion_id INTEGER,
    ejercicio_nombre TEXT,
    serie_num INTEGER,
    peso_real REAL,
    reps_real INTEGER,
    rir INTEGER,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Columnas añadidas tras el esquema original — necesarias para BDs existentes
  try { db.run("ALTER TABLE sesiones_entreno ADD COLUMN estado TEXT DEFAULT 'completado'"); } catch(e) {}
  try { db.run("ALTER TABLE sesiones_entreno ADD COLUMN valoracion TEXT DEFAULT ''"); } catch(e) {}
  try { db.run("ALTER TABLE series_log ADD COLUMN nota_cliente TEXT DEFAULT ''"); } catch(e) {}

  saveToDisk();
  setInterval(saveToDisk, 30000);

  const bcrypt = require('bcryptjs');
  const existing = dbGet('SELECT id FROM users WHERE username = ?', ['wolf']);
  if (!existing) {
    // Contraseña por defecto solo para primer arranque en desarrollo.
    // IMPORTANTE: cámbiala desde el panel del coach antes de usar en producción.
    const defaultPass = process.env.COACH_DEFAULT_PASSWORD || 'WolfMindset2024!';
    const hash = bcrypt.hashSync(defaultPass, 10);
    dbRun('INSERT INTO users (username, password, role, nombre, lang) VALUES (?, ?, ?, ?, ?)', ['wolf', hash, 'coach', 'Coach WolfMindset', 'es']);
    // No mostrar la contraseña en logs — solo avisar que se creó el coach
    console.log('✓ Coach inicial creado. Cambia la contraseña desde el panel antes de ir a producción.');
  }

  const exCount = dbGet('SELECT COUNT(*) as c FROM ejercicios_db', []);
  if (!exCount || exCount.c === 0) {
    const { EJERCICIOS, ALIMENTOS } = require('./seed');
    EJERCICIOS.forEach(e => dbRun('INSERT INTO ejercicios_db (grupo,nombre,musculos,tipo,dificultad,equipo) VALUES (?,?,?,?,?,?)', [e.grupo,e.nombre,e.musculos,e.tipo,e.dificultad,e.equipo]));
    ALIMENTOS.forEach(a => dbRun('INSERT INTO alimentos_db (categoria,nombre,calorias,proteinas,carbos,grasas) VALUES (?,?,?,?,?,?)', [a.categoria,a.nombre,a.calorias,a.proteinas,a.carbos,a.grasas]));
    saveToDisk();
    console.log('Base de datos de ejercicios y alimentos cargada');
  }

  console.log('DB lista');

  db.run(`CREATE TABLE IF NOT EXISTS plan_meta (
    cliente_id INTEGER PRIMARY KEY,
    alternativas TEXT, ajustes TEXT, frase TEXT,
    kcal INTEGER, prot INTEGER, carbs INTEGER, grasas INTEGER,
    variaciones TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Columnas añadidas tras el esquema original — necesarias para BDs existentes
  try { db.run("ALTER TABLE fotos ADD COLUMN tipo TEXT DEFAULT 'frente'"); } catch(e) {}
  try { db.run('ALTER TABLE fotos ADD COLUMN published_analysis TEXT'); } catch(e) {}
  try { db.run('ALTER TABLE plan_meta ADD COLUMN suplementacion TEXT'); } catch(e) {}
  try { db.run('ALTER TABLE plan_meta ADD COLUMN alimentos_therapeuticos TEXT'); } catch(e) {}

  db.run(`CREATE TABLE IF NOT EXISTS semana_borrador (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER, ejercicio_id INTEGER,
    series INTEGER, reps TEXT, peso_objetivo REAL, descanso INTEGER,
    nota_coach TEXT, rir INTEGER, creado DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cliente_id, ejercicio_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS semana_estado (
    cliente_id INTEGER PRIMARY KEY,
    tiene_borrador INTEGER DEFAULT 0,
    publicado_at DATETIME
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS suscripciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER UNIQUE,
    fecha_inicio TEXT, fecha_fin TEXT,
    estado TEXT DEFAULT 'activa'
  )`);
  // Columnas añadidas tras el esquema original — necesarias para BDs existentes
  try { db.run("ALTER TABLE suscripciones ADD COLUMN precio REAL DEFAULT 0"); } catch(e) {}
  try { db.run("ALTER TABLE suscripciones ADD COLUMN notas TEXT DEFAULT ''"); } catch(e) {}
  try { db.run("ALTER TABLE suscripciones ADD COLUMN renovado_at TEXT"); } catch(e) {}

  // ── MENSAJES (chat cliente ↔ coach) ──────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS mensajes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    de_coach   INTEGER NOT NULL DEFAULT 0,
    via_ia     INTEGER NOT NULL DEFAULT 0,
    contenido  TEXT    NOT NULL,
    leido      INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  try { db.run('CREATE INDEX IF NOT EXISTS idx_mensajes_cliente  ON mensajes(cliente_id, created_at)'); } catch(e) {}
  try { db.run('CREATE INDEX IF NOT EXISTS idx_mensajes_noleidos ON mensajes(cliente_id, leido, de_coach)'); } catch(e) {}

  // ── Notificaciones ──────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS notificaciones (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, tipo TEXT NOT NULL, mensaje TEXT NOT NULL, leida INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);

  // ── Push subscriptions ───────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS push_subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, subscription TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  // ── Plantillas de rutina ──────────────────────────────────────────
  // Permite guardar rutinas reutilizables independientes de clientes.
  // dias_json: array de días+ejercicios (snapshot completo).
  // tipo: 'semana' = rutina completa | 'dia' = día individual reutilizable
  db.run(`CREATE TABLE IF NOT EXISTS rutinas_plantillas (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id          INTEGER NOT NULL,
    nombre            TEXT    NOT NULL,
    descripcion       TEXT    DEFAULT '',
    objetivo          TEXT    DEFAULT '',
    nivel             TEXT    DEFAULT '',
    dias_json         TEXT    NOT NULL DEFAULT '[]',
    usos              INTEGER DEFAULT 0,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Superseries v2
  try { db.run("ALTER TABLE ejercicios_dia ADD COLUMN superset_grupo INTEGER DEFAULT 0"); } catch(e) {}
  // Metadatos v2 — para filtrado inteligente por IA (ALTER TABLE seguros, no rompen BD existente)
  try { db.run("ALTER TABLE rutinas_plantillas ADD COLUMN tipo TEXT DEFAULT 'semana'"); } catch(e) {}
  try { db.run("ALTER TABLE rutinas_plantillas ADD COLUMN tipo_rutina TEXT DEFAULT ''"); } catch(e) {}
  try { db.run("ALTER TABLE rutinas_plantillas ADD COLUMN grupo_dominante TEXT DEFAULT ''"); } catch(e) {}
  try { db.run("ALTER TABLE rutinas_plantillas ADD COLUMN duracion_estimada INTEGER DEFAULT 0"); } catch(e) {}
  try { db.run("ALTER TABLE rutinas_plantillas ADD COLUMN fatiga_estimada TEXT DEFAULT 'Media'"); } catch(e) {}
  try { db.run("ALTER TABLE rutinas_plantillas ADD COLUMN num_ejercicios INTEGER DEFAULT 0"); } catch(e) {}
  try { db.run("ALTER TABLE rutinas_plantillas ADD COLUMN lugar TEXT DEFAULT 'Gimnasio'"); } catch(e) {}

  // ── Análisis IA por sesión/día ───────────────────────────────────────
  // Guarda el análisis automático de cada sesión completada.
  // estado: 'pendiente' | 'aprobado' | 'descartado'
  // ajustes_json: array de { ejercicio_id, nombre, nuevo_peso, accion, razon }
  // mensaje_cliente: texto generado por IA para enviar al cliente
  db.run(`CREATE TABLE IF NOT EXISTS analisis_sesion (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    sesion_id        INTEGER NOT NULL UNIQUE,
    cliente_id       INTEGER NOT NULL,
    dia_nombre       TEXT    DEFAULT '',
    resumen_ia       TEXT    DEFAULT '',
    ajustes_json     TEXT    DEFAULT '[]',
    mensaje_cliente  TEXT    DEFAULT '',
    estado           TEXT    DEFAULT 'pendiente',
    coach_id         INTEGER,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    aprobado_at      DATETIME
  )`);
  try { db.run('CREATE INDEX IF NOT EXISTS idx_analisis_cliente ON analisis_sesion(cliente_id, estado)'); } catch(e) {}
  try { db.run('CREATE INDEX IF NOT EXISTS idx_analisis_sesion  ON analisis_sesion(sesion_id)'); } catch(e) {}

  // ── Checkins semanales ────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    semana TEXT,
    sueno INTEGER,
    energia INTEGER,
    peso REAL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
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
