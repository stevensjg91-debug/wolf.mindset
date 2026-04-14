const { initDB, dbRun, dbGet } = require('./database');
const { EJERCICIOS, ALIMENTOS } = require('./seed-data'); // cambia el nombre si tu archivo se llama distinto

async function runSeed() {
  await initDB();

  const ejerciciosCount = dbGet('SELECT COUNT(*) as total FROM ejercicios_db');
  const alimentosCount = dbGet('SELECT COUNT(*) as total FROM alimentos_db');

  if (ejerciciosCount?.total > 0 || alimentosCount?.total > 0) {
    console.log('La base ya tiene datos. Limpiando tablas...');
    dbRun('DELETE FROM ejercicios_db');
    dbRun('DELETE FROM alimentos_db');
  }

  for (const ej of EJERCICIOS) {
    dbRun(
      `INSERT INTO ejercicios_db
      (grupo, nombre, musculos, tipo, dificultad, equipo)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        ej.grupo,
        ej.nombre,
        ej.musculos,
        ej.tipo,
        ej.dificultad,
        ej.equipo
      ]
    );
  }

  for (const al of ALIMENTOS) {
    dbRun(
      `INSERT INTO alimentos_db
      (categoria, nombre, calorias, proteinas, carbos, grasas)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        al.categoria,
        al.nombre,
        al.calorias,
        al.proteinas,
        al.carbos,
        al.grasas
      ]
    );
  }

  console.log(`Seed completado:
- ejercicios: ${EJERCICIOS.length}
- alimentos: ${ALIMENTOS.length}`);
}

runSeed().catch(err => {
  console.error('Error ejecutando seed:', err);
  process.exit(1);
});
