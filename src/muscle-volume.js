/**
 * muscle-volume.js — Agrupación de músculos y cálculo de volumen óptimo personalizado.
 *
 * Basado en evidencia: Schoenfeld 2017, Baz-Valle 2022, Israetel (RP) MV/MEV/MAV/MRV.
 *
 * - groupByMuscle(rawMap)            → agrupa series sueltas en 9 grupos enteros
 * - getOptimalRange(muscle, cliente) → calcula MEV/MAV/MRV personalizado por perfil
 * - classifyVolume(sets, range)      → devuelve 'bajo' | 'minimo' | 'optimo' | 'alto' | 'excesivo'
 * - analizarSemana(dias, cliente)    → función todo-en-uno para la pantalla de revisión
 */

// ── Taxonomía: músculos sueltos → 9 grupos enteros ──────────────────────────
const MUSCLE_GROUPS = {
  'Pecho': [
    'chest', 'upper chest', 'lower chest', 'middle chest',
    'pectoral', 'pectoral superior', 'pectoral inferior', 'pectoral medio',
    'pecho', 'pecho superior', 'pecho inferior'
  ],
  'Espalda': [
    'lat', 'lats', 'latissimus', 'latissimus dorsi',
    'rhomboids', 'romboides',
    'mid back', 'upper back', 'traps', 'trapezius', 'trapecio',
    'lower back', 'lumbar', 'erector spinae', 'erectores',
    'dorsal', 'dorsales', 'espalda', 'espalda alta', 'espalda baja'
  ],
  'Hombros': [
    'middle deltoid', 'front deltoid', 'rear deltoid',
    'anterior deltoid', 'lateral deltoid', 'posterior deltoid',
    'deltoid', 'deltoides', 'deltoide anterior', 'deltoide lateral', 'deltoide posterior',
    'hombro', 'hombros'
  ],
  'Bíceps': [
    'biceps brachii', 'biceps short head', 'biceps long head',
    'biceps', 'bíceps', 'biceps braquial',
    'brachioradialis', 'braquiorradial', 'brachialis', 'braquial'
  ],
  'Tríceps': [
    'triceps', 'triceps long head', 'triceps lateral head', 'triceps medial head',
    'tríceps', 'triceps largo', 'triceps lateral', 'triceps medial'
  ],
  'Cuádriceps': [
    'quadriceps', 'cuadriceps', 'cuádriceps', 'quads',
    'rectus femoris', 'vastus lateralis', 'vastus medialis', 'vastus intermedius',
    'recto femoral', 'vasto lateral', 'vasto medial'
  ],
  'Femorales': [
    'hamstrings', 'hamstrings short head', 'hamstrings long head',
    'biceps femoris', 'femorales', 'femoral', 'isquios', 'isquiotibiales',
    'semitendinoso', 'semimembranoso'
  ],
  'Glúteos': [
    'glutes', 'glute max', 'glute med', 'glute min',
    'gluteus maximus', 'gluteus medius', 'gluteus minimus',
    'abductors', 'adductors',
    'glúteos', 'gluteos', 'glúteo', 'gluteo',
    'abductores', 'adductores', 'aductores'
  ],
  'Gemelos': [
    'gastrocnemius', 'soleus', 'calves',
    'gemelos', 'gemelo', 'sóleo', 'soleo', 'pantorrilla', 'pantorrillas'
  ],
  'Core': [
    'abs', 'rectus abdominis', 'obliques',
    'abdominales', 'oblicuos', 'core', 'abdomen', 'transverso'
  ]
};

// Lookup inverso — se construye una vez al cargar el módulo
const MUSCLE_LOOKUP = {};
for (const [group, members] of Object.entries(MUSCLE_GROUPS)) {
  members.forEach(m => { MUSCLE_LOOKUP[normalize(m)] = group; });
}

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Agrupa un mapa de { "musculoSuelto": series } en { "GrupoEntero": series }.
 * Útil para postprocesar lo que ya devuelve calcularResumenMusculos().
 */
function groupByMuscle(rawMap) {
  const grouped = {};
  const unmapped = [];

  for (const [muscle, sets] of Object.entries(rawMap || {})) {
    const parent = MUSCLE_LOOKUP[normalize(muscle)];
    if (parent) {
      grouped[parent] = (grouped[parent] || 0) + sets;
    } else if (muscle) {
      unmapped.push(muscle);
    }
  }
  return { grouped, unmapped };
}

// ── Tabla base MV/MEV/MAV/MRV ───────────────────────────────────────────────
// Series por semana al fallo (RIR 0-2). Avanzado. Hipertrofia.
// Referencias: Schoenfeld 2017, Baz-Valle 2022, Israetel/RP 2021.
const BASE_VOLUME = {
  'Pecho':      { mv: 4, mev: 8,  mav_low: 12, mav_high: 20, mrv: 22 },
  'Espalda':    { mv: 6, mev: 10, mav_low: 14, mav_high: 22, mrv: 25 },
  'Hombros':    { mv: 4, mev: 8,  mav_low: 16, mav_high: 22, mrv: 26 },
  'Bíceps':     { mv: 5, mev: 8,  mav_low: 14, mav_high: 20, mrv: 26 },
  'Tríceps':    { mv: 4, mev: 6,  mav_low: 10, mav_high: 14, mrv: 18 },
  'Cuádriceps': { mv: 6, mev: 8,  mav_low: 12, mav_high: 18, mrv: 20 },
  'Femorales':  { mv: 3, mev: 6,  mav_low: 10, mav_high: 16, mrv: 20 },
  'Glúteos':    { mv: 0, mev: 4,  mav_low: 8,  mav_high: 16, mrv: 20 },
  'Gemelos':    { mv: 6, mev: 8,  mav_low: 12, mav_high: 16, mrv: 20 },
  'Core':       { mv: 0, mev: 0,  mav_low: 6,  mav_high: 16, mrv: 25 }
};

/**
 * Calcula el rango óptimo personalizado para un músculo + cliente.
 * Usa los campos que ya tienes en la tabla `clientes`.
 *
 * @param {string} muscle           - Uno de los 9 grupos
 * @param {object} cliente          - Row de clientes (BD)
 *   .nivel:        'Principiante' | 'Intermedio' | 'Avanzado'
 *   .objetivo:     'Volumen' | 'Fuerza' | 'Definicion' | 'Mantenimiento' | 'Recomposicion'
 *   .edad:         number
 *   .lesiones:     string (CSV, e.g. "rodilla, hombro izq")
 *   .deficiencias: string (CSV, e.g. "Espalda, Femorales")
 * @returns {{min:number, optimal_low:number, optimal_high:number, max:number}}
 */
function getOptimalRange(muscle, cliente) {
  const base = BASE_VOLUME[muscle];
  if (!base) return null;

  let { mv, mev, mav_low, mav_high, mrv } = base;
  let mult = 1;

  // 1. Nivel/experiencia — principiantes saturan adaptación con menos volumen
  // 1. Nivel/experiencia — moduladores basados en evidencia:
  //    - Principiante puro: 0.65 (los antiguos 0.6 eran muy restrictivos)
  //    - Re-entrenado (returning lifter, parón largo): 0.8 — mantienen muscle
  //      memory y técnica, recuperan rápido, pero necesitan readaptación.
  //      Ref: Schoenfeld 2019, "muscle memory" via myonuclear retention.
  //    - Intermedio: 0.9
  //    - Avanzado: 1.0
  const nivel = (cliente?.nivel || 'Intermedio');
  if (nivel === 'Principiante') mult *= 0.65;
  else if (nivel === 'Re-entrenado' || nivel === 'Returning') mult *= 0.8;
  else if (nivel === 'Intermedio') mult *= 0.9;
  // Avanzado = 1.0

  // 2. Objetivo
  const objetivo = (cliente?.objetivo || 'Volumen');
  if (objetivo === 'Mantenimiento') {
    // Solo necesita MV → rango de mantenimiento
    return {
      min: Math.round(mv * mult),
      optimal_low: Math.round(mv * mult),
      optimal_high: Math.round(mev * mult),
      max: Math.round(mev * mult)
    };
  }
  if (objetivo === 'Fuerza') {
    // Menos series, más intensidad
    mult *= 0.75;
  }
  if (objetivo === 'Recomposicion' || objetivo === 'Definicion') {
    // Déficit calórico → menor recuperación → bajar techo
    mrv *= 0.85;
    mav_high *= 0.95;
  }

  // 3. Edad — recuperación se reduce con la edad
  const edad = Number(cliente?.edad) || 0;
  if (edad >= 40 && edad < 55) mrv *= 0.9;
  else if (edad >= 55) { mrv *= 0.8; mav_high *= 0.9; }

  // 4. Músculo prioritario (rezagado) → empujar hacia MAV alto
  const prioridades = parseList(cliente?.deficiencias);
  const isPriority = prioridades.some(p => normalize(p) === normalize(muscle));
  if (isPriority) mult *= 1.15;

  // 5. Lesión que afecte al grupo → cap en MEV reducido
  const lesiones = parseList(cliente?.lesiones);
  const isInjured = lesiones.some(l => muscleAffectedByInjury(muscle, l));
  if (isInjured) {
    return {
      min: Math.round(mv * 0.5),
      optimal_low: Math.round(mv * 0.5),
      optimal_high: Math.round(mev * 0.7),
      max: Math.round(mev * 0.7)
    };
  }

  return {
    min:          Math.max(1, Math.round(mev * mult)),
    optimal_low:  Math.max(1, Math.round(mav_low * mult)),
    optimal_high: Math.max(2, Math.round(mav_high * mult)),
    max:          Math.max(3, Math.round(mrv * mult))
  };
}

function parseList(str) {
  return String(str || '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
}

// Mapa rápido: lesión textual → grupos musculares afectados
const INJURY_MAP = {
  'rodilla':  ['Cuádriceps', 'Femorales'],
  'hombro':   ['Hombros', 'Pecho'],
  'codo':     ['Bíceps', 'Tríceps'],
  'muneca':   ['Bíceps', 'Tríceps', 'Pecho'],
  'lumbar':   ['Espalda', 'Femorales', 'Glúteos'],
  'cadera':   ['Glúteos', 'Femorales'],
  'tobillo':  ['Gemelos']
};
function muscleAffectedByInjury(muscle, lesion) {
  const k = normalize(lesion);
  for (const [key, muscles] of Object.entries(INJURY_MAP)) {
    if (k.includes(key) && muscles.includes(muscle)) return true;
  }
  return false;
}

/**
 * Clasifica el volumen actual vs rango óptimo.
 * @returns {'bajo'|'minimo'|'optimo'|'alto'|'excesivo'}
 */
function classifyVolume(currentSets, range) {
  if (!range) return 'sin_datos';
  if (currentSets < range.min) return 'bajo';
  if (currentSets < range.optimal_low) return 'minimo';
  if (currentSets <= range.optimal_high) return 'optimo';
  if (currentSets <= range.max) return 'alto';
  return 'excesivo';
}

/**
 * Función todo-en-uno para la pantalla de "Revisión Semanal".
 * Devuelve datos listos para pintar los chips + sugerencias.
 *
 * @param {Array} dias    - Array de días con .ejercicios (mismo formato que calcularResumenMusculos)
 * @param {object} cliente - Row de clientes
 * @returns {{
 *   grupos: Array<{muscle, sets, range, estado}>,
 *   sugerencias: Array<{muscle, accion, delta, razon}>,
 *   unmapped: string[]
 * }}
 */
function analizarSemana(dias, cliente) {
  // 1. Conteo con FRACTIONAL SETS (modelo Israetel/RP, validado por evidencia):
  //    - El primer músculo de la lista (target principal) recibe la serie completa (1.0)
  //    - Los músculos secundarios reciben 0.5 series cada uno
  //
  //    Esto evita que un remo de 4 series cuente como 4s a Lat + 4s a Romboides +
  //    4s a Rear Deltoid + 4s a Bíceps (= 16 series de un ejercicio real de 4).
  //    Con fractional: 4s a Lat (target) + 2s a cada secundario.
  const rawMap = {};
  (dias || []).forEach(dia => {
    (dia.ejercicios || []).forEach(ex => {
      const musculos = String(ex.musculos || '').split(',').map(m => m.trim()).filter(Boolean);
      const series = parseInt(ex.series) || 0;
      if (!musculos.length || !series) return;
      musculos.forEach((m, idx) => {
        const peso = (idx === 0) ? 1.0 : 0.5; // target principal o secundario
        rawMap[m] = (rawMap[m] || 0) + (series * peso);
      });
    });
  });

  // 2. Agrupar en músculos enteros
  const { grouped, unmapped } = groupByMuscle(rawMap);

  // 3. Redondear (las medias series pueden dar decimales, mostramos enteros)
  Object.keys(grouped).forEach(k => { grouped[k] = Math.round(grouped[k]); });

  // 4. Calcular rango óptimo + estado para cada grupo presente
  const grupos = Object.entries(grouped).map(([muscle, sets]) => {
    const range = getOptimalRange(muscle, cliente);
    const estado = classifyVolume(sets, range);
    return { muscle, sets, range, estado };
  }).sort((a, b) => b.sets - a.sets);

  // 5. Generar sugerencias accionables
  const sugerencias = [];
  for (const g of grupos) {
    if (!g.range) continue;
    if (g.estado === 'bajo') {
      const delta = g.range.optimal_low - g.sets;
      sugerencias.push({
        muscle: g.muscle,
        accion: 'añadir',
        delta,
        razon: `Estás bajo el MEV para tu perfil (mínimo ${g.range.min}s).`
      });
    } else if (g.estado === 'minimo') {
      const delta = g.range.optimal_low - g.sets;
      sugerencias.push({
        muscle: g.muscle,
        accion: 'añadir',
        delta,
        razon: `Justo en el mínimo. Subir a ${g.range.optimal_low}s te dará mejor crecimiento.`
      });
    } else if (g.estado === 'excesivo') {
      const delta = g.sets - g.range.max;
      sugerencias.push({
        muscle: g.muscle,
        accion: 'reducir',
        delta,
        razon: `Por encima del MRV (${g.range.max}s) — riesgo de sobreentreno.`
      });
    }
  }

  // 6. Detector de incongruencia nivel↔rutina.
  //    Caso típico: cliente marcado como "Principiante" pero rutina con
  //    volumen de intermedio/avanzado (lleva tiempo entrenando o es returning
  //    lifter pero se autoclasificó como principiante por modestia/parón).
  //    Si más de 1/3 de los grupos están "excesivo" con el nivel actual pero
  //    caerían en "óptimo" con un nivel superior → sugerimos reclasificar.
  let recomendacionNivel = null;
  const nivelActual = cliente?.nivel || 'Intermedio';
  const ordenNiveles = ['Principiante', 'Re-entrenado', 'Intermedio', 'Avanzado'];
  const idxActual = ordenNiveles.indexOf(nivelActual);

  if (idxActual >= 0 && idxActual < ordenNiveles.length - 1 && grupos.length >= 4) {
    const excesivos = grupos.filter(g => g.estado === 'excesivo').length;
    const optimosActuales = grupos.filter(g => g.estado === 'optimo').length;
    const proporcionExcesivos = excesivos / grupos.length;

    if (proporcionExcesivos > 0.33) {
      // Probar TODOS los niveles superiores. Quedarse con el que mejor encaje
      // (más óptimos, menos excesivos). Esto cubre tanto el caso "subir 1 nivel"
      // como "este principiante en realidad es avanzado".
      let mejorCandidato = null;
      for (let i = idxActual + 1; i < ordenNiveles.length; i++) {
        const siguienteNivel = ordenNiveles[i];
        const clienteSimulado = { ...cliente, nivel: siguienteNivel };
        const gruposSimulados = grupos.map(g => {
          const r = getOptimalRange(g.muscle, clienteSimulado);
          return { muscle: g.muscle, sets: g.sets, estado: classifyVolume(g.sets, r) };
        });
        const excesivosSim = gruposSimulados.filter(g => g.estado === 'excesivo').length;
        const optimosSim = gruposSimulados.filter(g => g.estado === 'optimo').length;

        const mejoraExcesivos = excesivosSim < excesivos;
        const mejoraOptimos = optimosSim > optimosActuales;

        if (mejoraExcesivos && mejoraOptimos) {
          // Puntuación: priorizar más óptimos, penalizar excesivos
          const score = optimosSim * 2 - excesivosSim;
          if (!mejorCandidato || score > mejorCandidato.score) {
            mejorCandidato = { nivel: siguienteNivel, excesivosSim, optimosSim, score };
          }
        }
      }

      if (mejorCandidato) {
        recomendacionNivel = {
          actual: nivelActual,
          sugerido: mejorCandidato.nivel,
          razon: `La rutina actual tiene volumen consistente con nivel ${mejorCandidato.nivel}, no ${nivelActual}. ${excesivos} grupos excesivos con el nivel actual pasarían a ${mejorCandidato.excesivosSim} si reclasificas al cliente.`,
          excesivos_actuales: excesivos,
          excesivos_simulados: mejorCandidato.excesivosSim
        };
      }
    }
  }

  return { grupos, sugerencias, unmapped, recomendacionNivel };
}

/**
 * Comprueba si un string corresponde a un grupo muscular conocido.
 * Útil para filtrar el campo "deficiencias" (que puede contener cosas
 * no-musculares como "Vitamina D baja", "Hierro bajo"...).
 */
function isMuscleGroup(str) {
  return !!MUSCLE_LOOKUP[normalize(str)];
}

module.exports = {
  MUSCLE_GROUPS,
  BASE_VOLUME,
  groupByMuscle,
  getOptimalRange,
  classifyVolume,
  analizarSemana,
  isMuscleGroup,
  normalize
};
