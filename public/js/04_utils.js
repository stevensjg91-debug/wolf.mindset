/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 04_utils.js
   API helper, show(), emojis, colores, helpers de imágenes ejercicios

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */


// Track active coach tab globally
let _coachTabActual = 'clientes';

function setCoachLang(lang) {
  COACH_LANG = lang;
  localStorage.setItem('wm_coach_lang', lang);

  // Update language toggle buttons (sidebar + topbar)
  const esBtn = document.getElementById('coach_lang_es');
  const enBtn = document.getElementById('coach_lang_en');
  // Update sidebar lang buttons
  [[esBtn,'es'],[enBtn,'en']].forEach(([btn, l]) => {
    if(!btn) return;
    const active = lang === l;
    btn.style.border = active ? '1px solid rgba(255,255,255,.6)' : '1px solid rgba(255,255,255,.12)';
    btn.style.background = active ? 'rgba(255,255,255,.15)' : 'none';
    btn.style.opacity = active ? '1' : '0.4';
  });

  // Update mobile lang pill
  const mobilePill = document.getElementById('mobile_lang_pill');
  if(mobilePill) {
    mobilePill.textContent = lang.toUpperCase();
    mobilePill.style.display = window.innerWidth < 768 ? 'block' : 'none';
  }

  // Re-render coach panel if active
  if(document.getElementById('sCoach')?.classList.contains('on')) {
    // Update topbar title
    const cTitleEl = document.getElementById('cTitle');
    if(cTitleEl) {
      const titles = {clientes:tc('Clientes'),nuevo:tc('Nuevo cliente'),pendientes:tc('Solicitudes pendientes'),rutinas:tc('Crear rutina'),'dieta-builder':tc('Crear dieta'),progreso:tc('Progreso'),ia:tc('Asistente IA Coach'),equipo:tc('Mi equipo')};
      cTitleEl.textContent = titles[_coachTabActual] || cTitleEl.textContent;
    }
    // Re-render the current section
    renderCoach(_coachTabActual);
  }

  // Translate static sidebar nav items
  applyCoachLang(document.getElementById('sCoach'));
}

function applyCoachLang(el) {
  if(!el) return;
  const isEN = COACH_LANG === 'en';

  // 1. data-i18n-coach attributes (sidebar nav spans, buttons)
  el.querySelectorAll('[data-i18n-coach]').forEach(e2 => {
    const key = e2.getAttribute('data-i18n-coach');
    const translated = isEN ? (COACH_TRANSLATIONS[key] || key) : key;
    e2.textContent = translated;
  });

  // 2. data-placeholder-coach-en (input placeholders)
  el.querySelectorAll('[data-placeholder-coach-en]').forEach(inp => {
    inp.placeholder = isEN
      ? inp.getAttribute('data-placeholder-coach-en')
      : (inp.getAttribute('data-placeholder-coach-es') || inp.getAttribute('data-placeholder-coach-en'));
  });

  // 3. Translate plain text nodes that match COACH_TRANSLATIONS exactly
  if(isEN) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const trimmed = node.textContent.trim();
      if(trimmed && COACH_TRANSLATIONS[trimmed] && node.parentElement && !node.parentElement.closest('[data-i18n-coach]')) {
        node.textContent = node.textContent.replace(trimmed, COACH_TRANSLATIONS[trimmed]);
      }
    });
  }
}

// EMOJIS Y COLORES
const FOOD_EMOJIS={'pollo':'🍗','pechuga':'🍗','pavo':'🦃','ternera':'🥩','carne':'🥩','salmon':'🐟','salmón':'🐟','merluza':'🐟','bacalao':'🐟','atun':'🐟','atún':'🐟','gambas':'🦐','huevo':'🥚','claras':'🥚','arroz':'🍚','avena':'🥣','patata':'🥔','boniato':'🍠','pasta':'🍝','pan':'🍞','leche':'🥛','yogur':'🥛','queso':'🧀','tomate':'🍅','brocoli':'🥦','brócoli':'🥦','espinaca':'🥬','ensalada':'🥗','platano':'🍌','plátano':'🍌','manzana':'🍎','naranja':'🍊','fresa':'🍓','aceite':'🫒','almendra':'🥜','nuez':'🥜','whey':'💪','proteina':'💪','proteína':'💪','aguacate':'🥑','pepino':'🥒','zanahoria':'🥕','quinoa':'🌾','requesón':'🥗','requesón':'🥗'};
const EX_COLORS={'Chest':'rgba(59,130,246,0.15)','Back':'rgba(168,85,247,0.15)','Shoulders':'rgba(245,158,11,0.15)','Biceps':'rgba(34,197,94,0.15)','Triceps':'rgba(239,68,68,0.15)','Legs':'rgba(6,182,212,0.15)','Abs':'rgba(251,146,60,0.15)'};
const EX_EMOJIS={'Chest':'💪','Back':'🔙','Shoulders':'🏋️','Biceps':'💪','Triceps':'💪','Legs':'🦵','Abs':'🎯'};
const EX_YT={'Press banca con barra':'https://www.youtube.com/shorts/WGBPzKOLNaA','Sentadilla libre':'https://www.youtube.com/shorts/MVMoBks6tZY','Peso muerto':'https://www.youtube.com/shorts/CuAFMkiFLLo'};
const AVCS=[{bg:'rgba(59,130,246,0.15)',tx:'#93c5fd',br:'rgba(59,130,246,0.3)'},{bg:'rgba(168,85,247,0.15)',tx:'#d8b4fe',br:'rgba(168,85,247,0.3)'},{bg:'rgba(34,197,94,0.12)',tx:'#86efac',br:'rgba(34,197,94,0.25)'},{bg:'rgba(245,158,11,0.12)',tx:'#fcd34d',br:'rgba(245,158,11,0.25)'},{bg:'rgba(239,68,68,0.12)',tx:'#fca5a5',br:'rgba(239,68,68,0.25)'}];
const ac=i=>AVCS[i%AVCS.length];
const ini=n=>n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
const fmt=s=>{const m=Math.floor(s/60),r=s%60;return m>0?`${m}:${String(r).padStart(2,'0')}`:`${s}`;};
const foodEmoji=n=>{const l=n.toLowerCase();for(const[k,v]of Object.entries(FOOD_EMOJIS)){if(l.includes(k))return v;}return'🍽️';};
const isMobile=()=>window.innerWidth<768;

async function api(path,opts={}){
  const r=await fetch(API+'/api'+path,{...opts,headers:{'Content-Type':'application/json',...(TOKEN?{Authorization:'Bearer '+TOKEN}:{})}});
  if(!r.ok){
    let err;
    try { err = await r.json(); } catch(e) { err = { error: `Error ${r.status}: ${r.statusText}` }; }
    throw err;
  }
  const text = await r.text();
  if(!text || !text.trim()) return {};
  try { return JSON.parse(text); }
  catch(e) { throw { error: 'Respuesta inesperada del servidor: ' + text.slice(0,100) }; }
}
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));document.getElementById(id).classList.add('on');}


// Exercise images - local /ex/ folder (downloaded on server start)
function getWgerImg(nombre){
  // Priority: custom uploaded image in exConfig > static GIF
  if(window.exConfig && window.exConfig[nombre]?.imagen_url) return window.exConfig[nombre].imagen_url;
  const safeName = nombre.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  return '/ex/' + safeName + '.gif';
}
function getExerciseIcon(nombre){ return getWgerImg(nombre); }
// Helper to render exercise image box (used everywhere)
function renderExImg(nombre, size=44, grupo='', directUrl=''){
  // Priority: direct url > exImages map (client) > exConfig (coach) > static GIF
  let url = (directUrl && directUrl !== '__HAS_IMAGE__') ? directUrl
    : (window.exImages && window.exImages[nombre])
    || (window.exConfig && window.exConfig[nombre]?.imagen_url)
    || getWgerImg(nombre);
  const bg = EX_GROUP_COLORS[grupo||EX_GROUP_MAP[nombre]||'Chest'] || 'var(--s3)';
  const emoji = EX_GROUP_EMOJI[grupo||EX_GROUP_MAP[nombre]||'Chest'] || '💪';
  return `<div style="width:${size}px;height:${size}px;border-radius:${size>40?'10':'7'}px;overflow:hidden;background:${bg};flex-shrink:0;display:flex;align-items:center;justify-content:center">
    <img src="${url}" style="width:${size}px;height:${size}px;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" loading="lazy"/>
    <span style="display:none;font-size:${size>40?22:16}px;width:100%;height:100%;align-items:center;justify-content:center">${emoji}</span>
  </div>`;
}
const EX_GROUP_COLORS={'Chest':'#1e3a5f','Back':'#2d1b69','Shoulders':'#064e3b','Biceps':'#14532d','Triceps':'#450a0a','Legs':'#0c1a2e','Abs':'#431407'};
const EX_GROUP_EMOJI={'Chest':'🫁','Back':'🔙','Shoulders':'🏋️','Biceps':'💪','Triceps':'🦾','Legs':'🦵','Abs':'🎯'};
const EX_GROUP_MAP={
  'Bench Press (Barbell)':'Chest','Bench Press (Dumbbell)':'Chest','Incline Bench Press (Barbell)':'Chest',
  'Incline Bench Press (Dumbbell)':'Chest','Decline Bench Press (Barbell)':'Chest','Chest Fly (Dumbbell)':'Chest',
  'Cable Crossover':'Chest','Pec Deck Fly':'Chest','Chest Dip':'Chest','Pull Over (Dumbbell)':'Chest',
  'Cable Fly (High to Low)':'Chest','Cable Fly (Low to High)':'Chest','Chest Press (Machine)':'Chest',
  'Deadlift (Barbell)':'Back','Romanian Deadlift (Barbell)':'Back','Sumo Deadlift':'Back',
  'Pull Up (Overhand)':'Back','Pull Up (Underhand)':'Back','Pull Up (Neutral Grip)':'Back',
  'Barbell Row (Overhand)':'Back','One-Arm Dumbbell Row':'Back','Lat Pulldown (Wide Grip)':'Back',
  'Lat Pulldown (Narrow Grip)':'Back','Seated Row (Cable)':'Back','Back Extension':'Back',
  'Face Pull':'Back','Shrug (Barbell)':'Back','Good Morning (Barbell)':'Back',
  'T-Bar Row':'Back','Rack Pull':'Back',
  'Overhead Press (Barbell)':'Shoulders','Seated Overhead Press (Barbell)':'Shoulders',
  'Seated Dumbbell Press':'Shoulders','Arnold Press':'Shoulders','Lateral Raise (Dumbbell)':'Shoulders',
  'Front Raise (Dumbbell)':'Shoulders','Reverse Fly (Dumbbell)':'Shoulders','Upright Row (Barbell)':'Shoulders',
  'Shoulder Press (Machine)':'Shoulders','Cable Lateral Raise':'Shoulders',
  'Barbell Curl':'Biceps','EZ Bar Curl':'Biceps','Alternating Dumbbell Curl':'Biceps',
  'Hammer Curl (Dumbbell)':'Biceps','Concentration Curl':'Biceps','Preacher Curl (Barbell)':'Biceps',
  'Cable Curl':'Biceps','Incline Dumbbell Curl':'Biceps','Spider Curl':'Biceps','Reverse Curl (Barbell)':'Biceps',
  'Skull Crusher (Barbell)':'Triceps','Skull Crusher (EZ Bar)':'Triceps','Tricep Pushdown (Rope)':'Triceps',
  'Tricep Pushdown (Bar)':'Triceps','Bench Dip':'Triceps','Close Grip Bench Press':'Triceps',
  'Tricep Kickback (Dumbbell)':'Triceps','Overhead Extension (Dumbbell)':'Triceps','Diamond Push Up':'Triceps',
  'Squat (Barbell)':'Legs','Front Squat (Barbell)':'Legs','Bulgarian Split Squat (Dumbbell)':'Legs',
  'Leg Press':'Legs','Hack Squat (Machine)':'Legs','Leg Extension (Machine)':'Legs',
  'Lying Leg Curl (Machine)':'Legs','Seated Leg Curl (Machine)':'Legs','Hip Thrust (Barbell)':'Legs',
  'Walking Lunge (Dumbbell)':'Legs','Standing Calf Raise (Machine)':'Legs',
  'Seated Calf Raise (Plate Loaded)':'Legs','Romanian Deadlift (Dumbbell)':'Legs',
  'Hip Adductor (Machine)':'Legs','Hip Abductor (Machine)':'Legs','Glute Kickback (Cable)':'Legs',
  'Step Up (Dumbbell)':'Legs','Goblet Squat':'Legs',
  'Crunch':'Abs','Cable Crunch':'Abs','Plank':'Abs','Hanging Leg Raise':'Abs',
  'Ab Rollout':'Abs','Russian Twist (Plate)':'Abs','Hanging Knee Raise':'Abs',
  'Bicycle Crunch':'Abs','Leg Raise (Flat Bench)':'Abs','Mountain Climber':'Abs',
  'Dragon Flag':'Abs','Decline Crunch':'Abs',
};
function getExerciseBg(nombre){ const g=EX_GROUP_MAP[nombre]||'Chest'; return EX_GROUP_COLORS[g]||'#1e3a5f'; }
function getExerciseEmoji(nombre){ const g=EX_GROUP_MAP[nombre]||'Chest'; return EX_GROUP_EMOJI[g]||'💪'; }
function fetchWgerImg(nombre){ /* images served from /ex/ */ }
