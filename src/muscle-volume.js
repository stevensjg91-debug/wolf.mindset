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
function analizarSemana(dias, cliente, seriesLog) {
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

  // 4. Calcular progresión por grupo si tenemos log de series (últimas 4 semanas)
  const historialE1RM = seriesLog ? calcularE1RMSemanalPorGrupo(seriesLog, 4) : {};
  const progresionPorGrupo = {};
  Object.entries(historialE1RM).forEach(([grupo, hist]) => {
    progresionPorGrupo[grupo] = {
      tendencia: clasificarProgresion(hist),
      semanas_datos: hist.length,
      historial: hist
    };
  });

  // 5. Calcular rango óptimo + estado para cada grupo presente
  const grupos = Object.entries(grouped).map(([muscle, sets]) => {
    const range = getOptimalRange(muscle, cliente);
    const estado = classifyVolume(sets, range);
    const prog = progresionPorGrupo[muscle] || { tendencia: 'sin_datos', semanas_datos: 0 };
    const estadoCtx = estadoContextual(estado, prog.tendencia);
    return {
      muscle, sets, range, estado,
      progresion: prog.tendencia,
      semanas_datos: prog.semanas_datos,
      estado_contextual: estadoCtx
    };
  }).sort((a, b) => b.sets - a.sets);

  // 6. Generar sugerencias contextuales (mezcla volumen + progresión)
  //    Si NO hay datos de progresión, igual genera por volumen puro (compat)
  const sugerencias = [];
  for (const g of grupos) {
    if (!g.range) continue;
    const sug = generarSugerenciaContextual(g, g.estado_contextual);
    if (sug && sug.accion !== 'mantener') {
      sugerencias.push({
        muscle: g.muscle,
        ...sug
      });
    }
  }

  // 7. Detector de incongruencia nivel↔rutina.
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

// ════════════════════════════════════════════════════════════════════════════
// PROGRESIÓN POR GRUPO MUSCULAR
// ════════════════════════════════════════════════════════════════════════════
// La métrica "óptima" de volumen no es la teórica, es la que produce progreso.
// Si un cliente progresa con 29s de espalda → ese es SU óptimo, no el del libro.
// Si está estancado con 14s (en rango) → necesita más estímulo.
// Usamos e1RM medio semanal por grupo (Epley: peso × (1 + reps/30)) que combina
// peso y reps en un solo número comparable entre semanas.

/**
 * Calcula e1RM medio semanal por grupo muscular durante las últimas N semanas.
 *
 * @param {Array} seriesLog - filas de series_log JOIN sesiones_entreno JOIN ejercicios_dia
 *   cada fila: { peso_real, reps_real, fecha, musculos }
 * @param {number} numSemanas - cuántas semanas hacia atrás analizar (default 4)
 * @returns {Object} { 'Espalda': [{semana:'2024-W12', e1rm: 87.5, sesiones: 2}, ...] }
 */
function calcularE1RMSemanalPorGrupo(seriesLog, numSemanas = 4) {
  // Epley formula: 1RM ≈ peso × (1 + reps/30)
  const e1rm = (peso, reps) => {
    if (!peso || !reps || reps <= 0) return 0;
    return peso * (1 + reps / 30);
  };

  // Agrupar por (grupo muscular, semana). Para cada combo: e1RM medio.
  // Semana = YYYY-WW (ISO week)
  const buckets = {}; // { 'Espalda|2024-W12': { sum, count } }

  seriesLog.forEach(s => {
    if (!s.peso_real || !s.reps_real) return;
    const valor = e1rm(s.peso_real, s.reps_real);
    if (!valor) return;

    // Solo coge el primer músculo (target principal), igual que fractional sets
    const musculo = String(s.musculos || '').split(',')[0].trim();
    if (!musculo) return;
    const grupo = MUSCLE_LOOKUP[normalize(musculo)];
    if (!grupo) return;

    const semana = isoWeekKey(new Date(s.fecha));
    const key = `${grupo}|${semana}`;
    if (!buckets[key]) buckets[key] = { sum: 0, count: 0, peakE1RM: 0 };
    buckets[key].sum += valor;
    buckets[key].count += 1;
    if (valor > buckets[key].peakE1RM) buckets[key].peakE1RM = valor;
  });

  // Agrupar por grupo, ordenar por semana desc, quedarse con últimas N
  const porGrupo = {};
  Object.entries(buckets).forEach(([key, data]) => {
    const [grupo, semana] = key.split('|');
    if (!porGrupo[grupo]) porGrupo[grupo] = [];
    porGrupo[grupo].push({
      semana,
      e1rm_medio: data.sum / data.count,
      e1rm_pico: data.peakE1RM,
      sesiones: data.count
    });
  });

  // Ordenar y recortar a últimas N semanas
  Object.keys(porGrupo).forEach(g => {
    porGrupo[g].sort((a, b) => a.semana.localeCompare(b.semana));
    porGrupo[g] = porGrupo[g].slice(-numSemanas);
  });

  return porGrupo;
}

function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Clasifica la tendencia de progresión a partir de las últimas N semanas de e1RM.
 *
 * @param {Array} historialGrupo - [{semana, e1rm_medio}, ...] orden ascendente
 * @returns {'subiendo'|'estancado'|'bajando'|'sin_datos'}
 *
 * Reglas (basadas en lo que es ruido vs señal real):
 *   - <3 semanas de datos → sin_datos (no se puede juzgar)
 *   - Regresión lineal sobre e1rm vs semana:
 *     * Pendiente > +0.5% por semana → subiendo
 *     * Pendiente entre -0.5% y +0.5% → estancado
 *     * Pendiente < -0.5% por semana → bajando
 */
function clasificarProgresion(historialGrupo) {
  if (!historialGrupo || historialGrupo.length < 3) return 'sin_datos';

  // Regresión lineal simple: y = e1rm, x = índice de semana (0, 1, 2...)
  const n = historialGrupo.length;
  const xs = historialGrupo.map((_, i) => i);
  const ys = historialGrupo.map(h => h.e1rm_medio);

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;

  // Porcentaje de cambio semanal sobre la media
  const pctSemanal = meanY > 0 ? (slope / meanY) * 100 : 0;

  if (pctSemanal > 0.5) return 'subiendo';
  if (pctSemanal < -0.5) return 'bajando';
  return 'estancado';
}

/**
 * Combina volumen + progresión en un estado contextualizado y una acción
 * recomendada (más útil que solo el volumen).
 *
 * Matriz de decisión:
 *
 *                    │ Subiendo          │ Estancado        │ Bajando        │ Sin datos
 *  ────────────────────────────────────────────────────────────────────────────
 *  Volumen bajo      │ Mantén (pista)    │ Subir series     │ Subir series   │ Subir series
 *  Volumen mínimo    │ Mantén            │ Subir series     │ Subir series   │ Subir series
 *  Volumen óptimo    │ Perfecto          │ Subir series     │ Reducir/deload │ Mantén
 *  Volumen alto      │ Excelente, vigila │ Mantener         │ Reducir series │ Mantén
 *  Volumen excesivo  │ Vigilar fatiga    │ Reducir series   │ Reducir/deload │ Reducir series
 */
function estadoContextual(volumenEstado, progresion) {
  const M = {
    bajo:     { subiendo:'subir_a_pesar_progreso', estancado:'subir_critico',   bajando:'subir_critico',   sin_datos:'subir_critico' },
    minimo:   { subiendo:'mantener_observar',      estancado:'subir',           bajando:'subir',           sin_datos:'subir' },
    optimo:   { subiendo:'perfecto',               estancado:'subir_estimulo',  bajando:'reducir_deload',  sin_datos:'mantener' },
    alto:     { subiendo:'sostenible',             estancado:'mantener',        bajando:'reducir',         sin_datos:'mantener' },
    excesivo: { subiendo:'tolerando_vigilar',      estancado:'reducir',         bajando:'reducir_deload',  sin_datos:'reducir' }
  };
  return (M[volumenEstado] && M[volumenEstado][progresion]) || 'mantener';
}

/**
 * Genera la sugerencia accionable a partir del estado contextual.
 * Devuelve { accion, delta, prioridad, razon, aplicable_auto } o null.
 *
 *   accion:           'subir' | 'bajar' | 'mantener' | 'deload'
 *   delta:            número de series a sumar/restar (positivo o negativo)
 *   prioridad:        'critica' | 'alta' | 'media' | 'baja' | 'info'
 *   aplicable_auto:   true si el botón "aplicar automático" debe modificarla
 */
function generarSugerenciaContextual(grupo, estadoCtx) {
  const r = grupo.range;
  if (!r) return null;
  const sets = grupo.sets;

  switch (estadoCtx) {
    case 'subir_critico':
      return { accion:'subir', delta: r.optimal_low - sets, prioridad:'critica',
        razon:`Bajo el mínimo efectivo (MEV ${r.min}) y sin progresar — falta estímulo.`,
        aplicable_auto: true };
    case 'subir':
      return { accion:'subir', delta: r.optimal_low - sets, prioridad:'alta',
        razon:`Estás bajo el rango óptimo (${r.optimal_low}-${r.optimal_high}s).`,
        aplicable_auto: true };
    case 'subir_estimulo':
      return { accion:'subir', delta: 2, prioridad:'alta',
        razon:`Estancado en rango óptimo — añadir series para reactivar progresión.`,
        aplicable_auto: true };
    case 'subir_a_pesar_progreso':
      return { accion:'mantener', delta: 0, prioridad:'info',
        razon:`Volumen bajo pero progresando — funciona, observa próximas semanas.`,
        aplicable_auto: false };
    case 'reducir':
      return { accion:'bajar', delta: sets - r.max, prioridad:'alta',
        razon:`Por encima del MRV (${r.max}s) y sin progresar — exceso de fatiga.`,
        aplicable_auto: true };
    case 'reducir_deload':
      return { accion:'deload', delta: -Math.round(sets * 0.4), prioridad:'critica',
        razon:`Rendimiento bajando — deload recomendado (–40% volumen 1 semana).`,
        aplicable_auto: true };
    case 'tolerando_vigilar':
      return { accion:'mantener', delta: 0, prioridad:'info',
        razon:`Volumen excesivo PERO progresando — tu cliente lo tolera. Vigila fatiga/sueño.`,
        aplicable_auto: false };
    case 'sostenible':
      return { accion:'mantener', delta: 0, prioridad:'info',
        razon:`Volumen alto pero sostenible — sigue así.`,
        aplicable_auto: false };
    case 'perfecto':
      return { accion:'mantener', delta: 0, prioridad:'info',
        razon:`Rango óptimo + progresando. Sigue así.`,
        aplicable_auto: false };
    case 'mantener':
    default:
      return null;
  }
}

module.exports = {
  MUSCLE_GROUPS,
  BASE_VOLUME,
  groupByMuscle,
  getOptimalRange,
  classifyVolume,
  analizarSemana,
  isMuscleGroup,
  normalize,
  calcularE1RMSemanalPorGrupo,
  clasificarProgresion,
  estadoContextual,
  generarSugerenciaContextual,
  isoWeekKey
};
