/* ─────────────────────────────────────────────────────────────
   Extracted from public/index.html - Phase 2 JS split
   Keep loaded with: <script src="/app.js"><\/script>
───────────────────────────────────────────────────────────── */

// ── REGISTRO FORM LANGUAGE TOGGLE ─────────────────────────────────
let _regLang = localStorage.getItem('wm_reg_lang') || 'en';

const REG_STRINGS = {
  en: {
    subtitle: 'ACCESS REQUEST',
    desc: 'Fill in your details and your coach will review your request. We will notify you when you have access.',
    lbl_nombre: 'Full name *', lbl_usuario: 'Username *', lbl_email: 'Email *',
    lbl_telefono: 'Phone *', lbl_pass: 'Password *', lbl_objetivo: 'Goal',
    lbl_nivel: 'Level', lbl_peso: 'Weight (lb)', lbl_altura: 'Height (ft/in)',
    lbl_edad: 'Age', lbl_sexo: 'Sex', lbl_actividad: 'Activity level',
    lbl_dieta: 'Diet type', lbl_alimentos_no: 'Foods I cannot eat (optional)',
    lbl_lesiones: 'Injuries / painful areas (optional)', lbl_obs: 'Other notes (optional)',
    lbl_reg_foods_like: 'Foods I prefer for my diet', lbl_reg_meals: 'How many meals do you want per day?',
    submit: 'Send request', back: '← Back to login',
    pass_placeholder: 'Minimum 6 characters', user_placeholder: 'carlos123 (letters and numbers only)'
  },
  es: {
    subtitle: 'SOLICITUD DE ACCESO',
    desc: 'Rellena tus datos y tu coach revisará tu solicitud. Te avisaremos cuando tengas acceso.',
    lbl_nombre: 'Nombre completo *', lbl_usuario: 'Usuario para acceder *', lbl_email: 'Email *',
    lbl_telefono: 'Teléfono *', lbl_pass: 'Contraseña *', lbl_objetivo: 'Objetivo',
    lbl_nivel: 'Nivel', lbl_peso: 'Peso (kg)', lbl_altura: 'Altura (cm)',
    lbl_edad: 'Edad', lbl_sexo: 'Sexo', lbl_actividad: 'Nivel de actividad',
    lbl_dieta: 'Tipo de alimentación', lbl_alimentos_no: 'Alimentos que no puedo comer (opcional)',
    lbl_lesiones: 'Lesiones / zonas con dolor (opcional)', lbl_obs: 'Otras observaciones (opcional)',
    lbl_reg_foods_like: 'Alimentos que prefiero para mi dieta', lbl_reg_meals: '¿Cuántas comidas quieres hacer al día?',
    submit: 'Enviar solicitud', back: '← Volver al login',
    pass_placeholder: 'Mínimo 6 caracteres', user_placeholder: 'carlos123 (solo letras y números)'
  }
};

function setRegLang(lang) {
  _regLang = lang;
  localStorage.setItem('wm_reg_lang', lang);
  const s = REG_STRINGS[lang];
  const enBtn = document.getElementById('reg_lang_en');
  const esBtn = document.getElementById('reg_lang_es');

  // Toggle button styles
  if(enBtn && esBtn) {
    if(lang === 'en') {
      enBtn.style.cssText = 'display:flex;align-items:center;gap:5px;padding:6px 14px;border-radius:20px;border:1.5px solid var(--bl2);background:rgba(37,99,235,.18);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:.2s';
      esBtn.style.cssText = 'display:flex;align-items:center;gap:5px;padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.15);background:none;color:var(--tx3);font-size:13px;cursor:pointer;font-family:inherit;transition:.2s';
    } else {
      esBtn.style.cssText = 'display:flex;align-items:center;gap:5px;padding:6px 14px;border-radius:20px;border:1.5px solid var(--bl2);background:rgba(37,99,235,.18);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:.2s';
      enBtn.style.cssText = 'display:flex;align-items:center;gap:5px;padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.15);background:none;color:var(--tx3);font-size:13px;cursor:pointer;font-family:inherit;transition:.2s';
    }
  }

  // Update text labels
  const ids = ['subtitle','desc','lbl_nombre','lbl_usuario','lbl_email','lbl_telefono','lbl_pass',
    'lbl_objetivo','lbl_nivel','lbl_peso','lbl_altura','lbl_edad','lbl_sexo',
    'lbl_actividad','lbl_dieta','lbl_alimentos_no','lbl_lesiones','lbl_obs','lbl_reg_foods_like','lbl_reg_meals'];
  ids.forEach(id => {
    const el = document.getElementById(id === 'subtitle' ? 'reg_subtitle' : id === 'desc' ? 'reg_desc' : id);
    if(el) el.textContent = s[id];
  });

  // Update submit and back buttons
  const sb = document.getElementById('reg_submit_btn');
  const bb = document.getElementById('reg_back_btn');
  if(sb) sb.textContent = s.submit;
  if(bb) bb.textContent = s.back;

  // Update placeholders
  const passEl = document.getElementById('reg_pass');
  if(passEl) passEl.placeholder = s.pass_placeholder;
  const userEl = document.getElementById('reg_username');
  if(userEl) userEl.placeholder = s.user_placeholder;

  // Update select options
  document.querySelectorAll('#sRegistro select option[data-en]').forEach(opt => {
    opt.textContent = opt.getAttribute('data-' + lang);
  });

  // Update dynamic placeholders
  document.querySelectorAll('#sRegistro input[data-placeholder-en], #sRegistro textarea[data-placeholder-en]').forEach(el => {
    el.placeholder = el.getAttribute('data-placeholder-' + lang);
  });

  // Update food chips labels
  document.querySelectorAll('#sRegistro .reg-food-chip[data-reg-i18n-' + lang + ']').forEach(btn => {
    btn.textContent = btn.getAttribute('data-reg-i18n-' + lang);
  });

  // Update food category headers
  document.querySelectorAll('#sRegistro [data-reg-i18n-' + lang + ']').forEach(el => {
    if(!el.classList.contains('reg-food-chip')) el.textContent = el.getAttribute('data-reg-i18n-' + lang);
  });

  // Update help text
  const helpEl = document.getElementById('reg_foods_like_help');
  if(helpEl) helpEl.textContent = lang === 'en'
    ? 'Check the foods you usually eat. Your coach will see them when creating your diet.'
    : 'Marca los alimentos que sueles comer. Tu coach los verá al crear tu dieta.';

  // Update meal select options
  document.querySelectorAll('#reg_num_comidas option[data-' + lang + ']').forEach(opt => {
    opt.textContent = opt.getAttribute('data-' + lang);
  });

  // Re-sync selected chips' stored values to new language
  if(_regFoodsSelected.size > 0) {
    _regFoodsSelected.clear();
    document.querySelectorAll('.reg-food-chip.on').forEach(btn => {
      const val = btn.getAttribute('data-reg-i18n-' + lang) || btn.textContent;
      _regFoodsSelected.add(val);
    });
    const inp = document.getElementById('reg_alimentos_pref');
    if(inp) inp.value = [..._regFoodsSelected].join(', ');
  }
}

// Init on page load
document.addEventListener('DOMContentLoaded', () => { setRegLang(_regLang); });

const API='';
// Register service worker for background notifications
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').then(reg => {
    // Forzar activación inmediata si hay nueva versión
    if(reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if(nw) nw.addEventListener('statechange', () => {
        if(nw.state === 'installed' && navigator.serviceWorker.controller) {
          nw.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });
  }).catch(()=>{});
}
let TOKEN=localStorage.getItem('wm_token');
let USER=JSON.parse(localStorage.getItem('wm_user')||'null');
let CD=null,klTab='entreno',activeDia=0,chatH=[],iaH=[],timerInts={},restInt=null,restTotal=0,restSecs=0;

// ── SISTEMA DE IDIOMA ─────────────────────────────────────────────
let LANG = localStorage.getItem('wm_lang') || 'es';
let COACH_LANG = localStorage.getItem('wm_coach_lang') || 'es';

// ── UNIDADES DE MEDIDA ────────────────────────────────────────────
function isImperial(){ return LANG==='en'; }
function fmtPeso(kg){ if(!kg&&kg!==0)return'—'; return isImperial()?(kg*2.20462).toFixed(1)+' lb':kg+' kg'; }
function pesoLabel(){ return isImperial()?'lb':'kg'; }
function pesoPlaceholder(){ return isImperial()?'185':'84.5'; }
function fromPeso(val){ const n=parseFloat(val); if(isNaN(n))return null; return isImperial()?parseFloat((n/2.20462).toFixed(2)):n; }
function fmtAltura(cm){ if(!cm)return'—'; if(isImperial()){const t=cm/2.54;const ft=Math.floor(t/12);const inch=Math.round(t%12);return`${ft}′${inch}″`;} return cm+' cm'; }
function alturaLabel(){ return isImperial()?'ft / in':'cm'; }
function alturaPlaceholder(){ return isImperial()?'5\'9"':'175'; }
function fromAltura(val){ if(isImperial()){const s=String(val).trim();const m=s.match(/^(\d+)['''′](\d+)["""″]?$/);if(m)return Math.round((parseInt(m[1])*12+parseInt(m[2]))*2.54);const n=parseFloat(s);if(isNaN(n))return null;return n>100?Math.round(n):Math.round(n*2.54);}return parseFloat(val)||null; }
function fmtCintura(cm){ if(!cm)return'—'; return isImperial()?(cm/2.54).toFixed(1)+' in':cm+' cm'; }
function cinturaLabel(){ return isImperial()?'in':'cm'; }
function cinturaPlaceholder(){ return isImperial()?'32':'82'; }
function fromCintura(val){ const n=parseFloat(val); if(isNaN(n))return null; return isImperial()?parseFloat((n*2.54).toFixed(1)):n; }

const TRANSLATIONS = {
  // ── Navegación ──
  'Entrenar':'Train','Entreno':'Workout','Dieta':'Diet','Asistente':'Assistant',
  'Progreso':'Progress','Logros':'Achievements','Perfil':'Profile','Salir':'Logout',
  'Cerrar sesión':'Logout','ACCESO MIEMBROS':'MEMBER LOGIN',

  // ── hSeleccionDia ──
  'Tu coach está preparando tu plan':'Your coach is preparing your plan',
  'Semana':'Week','Sin realizar':'Not done','ejerc.':'ex.',
  '${t("✓ Completado hoy")}':'✓ Completed today','⚠ Incompleto hoy':'⚠ Incomplete today',
  'Completado hoy':'Completed today','Incompleto hoy':'Incomplete today',
  'series':'sets',

  // ── Streak ──
  'día seguido':'day streak','días seguidos':'day streak',
  '¡Primer día!':'First day!','¡Sigue así!':'Keep it up!',
  '¡Una semana de fuego!':'One week on fire!',
  '¡Dos semanas seguidas!':'Two weeks straight!',
  '¡Bestia imparable!':'Unstoppable beast!',

  // ── Mensaje coach ──
  'Mensaje de tu coach':'Message from your coach',

  // ── Check-in ──
  '📋 Check-in semanal':'📋 Weekly check-in',
  '😴 ¿Cómo dormiste?':'😴 How did you sleep?',
  '⚡ Energía hoy':'⚡ Energy today',
  '⚖️ Peso hoy (kg)':'⚖️ Weight today (lb)',
  'Ej: 78.5':'E.g. 78.5','Guardar':'Save',

  // ── Notif banner ──
  'Activa las notificaciones':'Enable notifications',
  'Para que suene el timer aunque la pantalla esté bloqueada':'So the timer rings even when your screen is locked',
  'Activar':'Enable',

  // ── Timer / Series ──
  'Descanso':'Rest','Pausar':'Pause','Reanudar':'Resume',
  'Serie':'Set','Anterior':'Previous','Rep.':'Reps','Último':'Last',
  'Nota para el coach (sensaciones, dolor, etc.)':'Note for coach (feelings, pain, etc.)',
  '${t("Ej: Sentí el peso muy pesado, me dolió el hombro...")}':'E.g. Weight felt heavy, shoulder pain...',
  '¿Cuántas reps más podrías haber hecho? (RIR = Reps In Reserve)':'How many more reps could you have done? (RIR = Reps In Reserve)',
  '0 = al fallo · 1 = casi al límite · 2-3 = cómodo · 4+ = fácil':'0 = failure · 1 = near limit · 2-3 = comfortable · 4+ = easy',
  'INSTRUCCIONES':'INSTRUCTIONS','Nota del coach':'Coach note',
  'COACH DICE':'COACH SAYS',

  // ── Done overlay ──
  '¿CÓMO FUE EL ENTRENO?':'HOW WAS THE WORKOUT?',
  '¿Cómo fue el entreno?':'How was the workout?',
  'Cansado':'Tired','Normal':'Normal','Bien':'Good','En llamas':'On fire','Lesión/dolor':'Injury/pain',
  'Cerrar':'Close',
  '¡Logro desbloqueado!':'Achievement unlocked!','¡A por más!':'Keep going!',

  // ── Preview día ──
  'Comenzar entreno':'Start workout',
  'ejercicios':'exercises','series totales':'total sets',
  'Última sesión':'Last session','Sin historial':'No history',
  'Volver':'Back',

  // ── Entreno en curso ──
  'Finalizar entreno':'Finish workout',
  'Quedan':'Remaining','serie sin completar':'incomplete set',
  'series sin completar':'incomplete sets',
  '¿Seguro que quieres terminar el entreno?':'Are you sure you want to finish?',
  'Tu coach verá las series incompletas.':'Your coach will see the incomplete sets.',

  // ── Dieta ──
  'Tu plan de alimentación':'Your nutrition plan',
  'Sin dieta asignada':'No diet assigned',
  'Usa el Creador de Dieta IA.':'Use the AI Diet Creator.',
  'Comida libre':'Free meal','kcal':'kcal',
  'Proteína':'Protein','Carbos':'Carbs','Grasas':'Fats',
  'Recetas':'Recipes','Sin recetas':'No recipes',
  'Ingredientes':'Ingredients','Preparación':'Preparation',
  'Macros del plan':'Plan macros',

  // ── Asistente ──
  'Escribe tu pregunta...':'Ask me anything...','Enviar':'Send',
  'Escribiendo...':'Typing...','Error al enviar':'Send error',

  // ── Progreso ──
  'Registrar peso':'Log weight','Peso actual':'Current weight',
  'Tu peso esta semana':'Your weight this week',
  'Historial de peso':'Weight history',
  'Subir foto de progreso':'Upload progress photo',
  '📏 Posición: de pie, cuerpo entero, buena iluminación.':'📏 Stand upright, full body, good lighting.',
  'Analizando tu progreso...':'Analyzing your progress...',
  'Valoraciones anteriores':'Previous assessments',
  '📈 Tendencia de peso':'📈 Weight trend',
  'registros':'records','Línea':'Line',
  'tendencia suavizada':'smoothed trend',
  'Tu progreso':'Your progress',
  'semana':'week','semanas':'weeks',
  'ANTES · Sem.':'BEFORE · Wk.','AHORA · Sem.':'NOW · Wk.',
  'Progreso ejercicios principales':'Main exercise progress',
  '🏆 Mis marcas personales':'🏆 My personal records',
  '1RM est.':'1RM est.','Hace':'Ago',
  'reps':'reps',

  // ── Logros ──
  'Mis Logros':'My Achievements','de':'of','desbloqueados':'unlocked',
  '✓ Desbloqueado':'✓ Unlocked',
  '¡Primera vez!':'First time!',
  'Completaste tu primera sesión. El viaje ha comenzado.':'First session complete. The journey begins.',
  '5 Sesiones':'5 Sessions','5 entrenos completados. Ya estás cogiendo el hábito.':'5 workouts done. The habit is forming.',
  '10 Sesiones':'10 Sessions','10 entrenos completados. Eres constante.':'10 workouts done. You are consistent.',
  '25 Sesiones':'25 Sessions','25 entrenos. Estás construyendo algo serio.':'25 workouts. You are building something serious.',
  '50 Sesiones':'50 Sessions','50 sesiones completadas. Eres de los que no paran.':'50 sessions done. You never stop.',
  '100 Sesiones':'100 Sessions','100 entrenos. Eres una máquina.':'100 workouts. You are a machine.',
  '7 días en racha':'7 day streak','Una semana seguida entrenando. ¡Fuego!':'One full week training. Fire!',
  '14 días en racha':'14 day streak','Dos semanas sin parar. Nada te detiene.':'Two weeks non-stop. Nothing stops you.',
  '30 días en racha':'30 day streak','Un mes entero. Eres un auténtico Wolf.':'A full month. You are a true Wolf.',
  'Mes perfecto':'Perfect month','Todos los días del mes con al menos un entreno. Épico.':'Every day this month with a workout. Epic.',
  '¡100 kg!':'100 kg!','Has levantado 100 kg en un ejercicio. Brutal.':'You lifted 100 kg in one exercise. Brutal.',
  '¡150 kg!':'150 kg!','150 kg. Estás en otra liga.':'150 kg. You are in another league.',
  '¡200 kg!':'200 kg!','200 kg. Eres una leyenda.':'200 kg. You are a legend.',
  '1.000 kg movidos':'1,000 kg moved','Has movido una tonelada en total. Literal.':'You moved one full ton. Literally.',
  '10.000 kg movidos':'10,000 kg moved','10 toneladas. Un camión entero. Increíble.':'10 tons. A full truck. Incredible.',
  '50.000 kg movidos':'50,000 kg moved','50 toneladas acumuladas. Eres pura fuerza.':'50 tons accumulated. You are pure strength.',

  // ── Perfil ──
  'Mi perfil':'My profile',
  'Tus datos personales.':'Your personal data.',
  'Rellena tus datos para que tu coach pueda personalizar tu plan al máximo.':'Fill in your data so your coach can fully personalize your plan.',
  'Datos personales':'Personal data',
  'Peso (kg)':'Weight (lb)','Altura (cm)':'Height (ft/in)',
  'Edad':'Age','Sexo':'Sex','Hombre':'Male','Mujer':'Female',
  'Cintura (cm)':'Waist (in)','Cadera (cm)':'Hip (in)',
  'Nivel de actividad':'Activity level',
  'Sedentario (poco o nada de ejercicio)':'Sedentary (little or no exercise)',
  'Ligero (1-2 días/semana)':'Light (1-2 days/week)',
  'Moderada (3-4 días/semana)':'Moderate (3-4 days/week)',
  'Activo (5-6 días/semana)':'Active (5-6 days/week)',
  '✏️ Editar':'✏️ Edit','✓ Guardar cambios':'✓ Save changes',
  'Cancelar':'Cancel','Guardado':'Saved',
  'Guardar perfil':'Save profile',
  'Idioma / Language':'Language / Idioma',
  'También puedes cambiarlo en la pantalla de inicio de sesión':'You can also change it on the login screen',

  // ── Cuenta cliente ──
  'Mi cuenta':'My account',
  'Usuario actual':'Current username',
  'Nuevo usuario':'New username',
  'Mínimo 4 caracteres':'Minimum 4 characters',
  'Confirmar con contraseña actual':'Confirm with current password',
  'Tu contraseña actual':'Your current password',
  'Cambiar usuario':'Change username',
  'Usuario actualizado':'Username updated',
  'El usuario debe tener al menos 4 caracteres':'Username must be at least 4 characters',
  'Escribe tu contraseña actual para confirmar':'Enter your current password to confirm',
  'Error al cambiar usuario':'Error changing username',
  'Contraseña actual':'Current password',
  'Nueva contraseña':'New password',
  'Repetir contraseña':'Repeat password',
  'Repite la nueva contraseña':'Repeat new password',
  'Cambiar contraseña':'Change password',
  'Contraseña actualizada':'Password updated',
  'Escribe tu contraseña actual':'Enter your current password',
  'La nueva contraseña debe tener al menos 6 caracteres':'New password must be at least 6 characters',
  'Las contraseñas no coinciden':'Passwords do not match',
  'Error al cambiar contraseña':'Error changing password',
  'Toca la foto para cambiarla':'Tap to change photo',
  'Error al subir foto':'Error uploading photo',
  'Foto actualizada':'Photo updated',

  // ── Notificaciones push ──
  '💪 ¡A por ello!':'💪 Go for it!',
  'Siguiente serie de':'Next set of',
  'Descanso terminado — siguiente serie':'Rest done — next set',
  '🐺 ¡Entreno completado!':'🐺 Workout complete!',
  'has terminado en':'finished in','min.':'min.',
  '💪 Entreno registrado':'💪 Workout saved',
  'has guardado tu sesión. Quedan':'saved your session. Remaining',
  '¡Mañana lo rematas!':'Finish it tomorrow!',

  // ── Olvide contraseña ──
  '¿Olvidaste tu contraseña?':'Forgot your password?',
  '¿OLVIDASTE TU CONTRASEÑA?':'FORGOT YOUR PASSWORD?',
  'Escribe tu nombre de usuario y tu coach recibirá una solicitud de reseteo. Te enviará tu nueva contraseña por el canal habitual (WhatsApp, email, etc.)':'Enter your username and your coach will receive a reset request. They will send your new password through the usual channel (WhatsApp, email, etc.)',
  'Tu nombre de usuario':'Your username',
  'Enviar solicitud al coach':'Send request to coach',
  '← Volver al login':'← Back to login',
  '✓ Solicitud enviada. Tu coach te contactará pronto.':'✓ Request sent. Your coach will contact you soon.',
  'Escribe tu nombre de usuario':'Enter your username',
  'Recuperar acceso':'Recover access',
  '¿Nuevo cliente? ':'New member? ',
  'Solicitar acceso →':'Request access →',
  'Recordar contraseña':'Remember me',
  'Entrar':'Log in',
  // ── Actividad ──
  'Alta (5-6 días/semana)':'High (5-6 days/week)',
  'Ligera (1-2 días/semana)':'Light (1-2 days/week)',
  'Muy alta (atleta, 2x día)':'Very high (athlete, 2x day)',
  'Definición':'Cutting','Omnívoro':'Omnivore',
  'Opción express':'Express option','Opción rápida':'Quick option',

  // ── Músculos ──
  'Bíceps':'Biceps','Bíceps braquial':'Brachial biceps',
  'Cuádriceps':'Quadriceps','Cuád':'Quad',
  'Glúteo':'Glute','Glúteo mayor':'Gluteus maximus',
  'Tríceps':'Triceps','Sóleo':'Soleus','Tirón':'Pull',
  'Pectorales, tríceps':'Chest, triceps',
  'Espalda + Bíceps':'Back + Biceps','Pecho + Tríceps':'Chest + Triceps',
  'Técnica del ejercicio':'Exercise technique',
  'Ver músculos en descripción':'See muscles in description',
  'Inflamación y recuperación':'Inflammation & recovery',

  // ── Alimentos ──
  'Arándanos':'Blueberries','Atún':'Tuna','Brócoli':'Broccoli',
  'Calabacín':'Zucchini','Caseína':'Casein','Champiñones':'Mushrooms',
  'Hígado de ternera':'Beef liver','Infusión':'Herbal tea',
  'Jamón cocido 95%':'Cooked ham 95%','Judías verdes':'Green beans',
  'Lácteo':'Dairy','Maíz':'Corn','Melocotón':'Peach',
  'Piña':'Pineapple','Piña en lata':'Canned pineapple',
  'Plátano':'Banana','Proteína Whey':'Whey protein',
  'Requesón':'Ricotta','Salmón':'Salmon',
  'Café americano':'Americano coffee','Café con leche desnatada':'Skim latte',
  'Café con leche semidesnatada':'Semi-skim latte','Café solo':'Black coffee',
  'Bebida vegetal sin azúcar':'Unsweetened plant milk',
  'Té negro':'Black tea','Té verde':'Green tea',
  'Añade más arroz o patata':'Add more rice or potato',
  'Complemento para alcanzar tu objetivo diario de proteína':'Supplement to reach your daily protein goal',
  'Base para reducir inflamación y mejorar recuperación':'Base to reduce inflammation and improve recovery',
  'Déficit detectado en analítica':'Deficit detected in blood test',

  // ── UI Entreno ──
  'Sin realizar aún':'Not done yet',
  'Contraseña':'Password','Nueva contraseña':'New password',
  'Mín 6 caracteres':'Min 6 chars','Mínimo 4 caracteres':'Min 4 characters',
  'Mínimo 6 caracteres':'Min 6 characters',
  'Suscripción':'Subscription','Sin suscripción':'No subscription',
  'Cancelar suscripción':'Cancel subscription',
  'Miércoles':'Wednesday','Sábado':'Saturday',
  'Día A':'Day A','Día B':'Day B',
  'SUPERACIÓN':'IMPROVEMENT',
  'Frase corta explicando qué se hizo':'Short phrase explaining what was done',
  'Escribe qué ajuste quieres hacer':'Describe the adjustment you want',
  'Grupo muscular (ej: Pecho/Hombro/Tríceps, Piernas...):':'Muscle group (e.g. Chest/Shoulder/Triceps, Legs...):',
  'Nombre del día (ej: Día A, Empuje, Lunes...):':'Day name (e.g. Day A, Push, Monday...):',
  'Cualquier momento del día — consistencia diaria':'Any time of day — daily consistency',
  'Han pasado 7 días. Pésate en ayunas y registra tu peso.':'7 days have passed. Weigh yourself fasted and log your weight.',
  'Para guardar: mantén pulsada la imagen y selecciona "Guardar"':'To save: long press the image and select "Save"',
  'Cualquier momento del día':'Any time of day',

  // ── Errores y validaciones ──
  'Error al eliminar. Inténtalo de nuevo.':'Delete failed. Please try again.',
  'Error de conexión':'Connection error','Error de conexión.':'Connection error.',
  'Error guardando sesión:':'Error saving session:',
  'Error verificando suscripción:':'Error verifying subscription:',
  'Error: no se ha seleccionado un día':'Error: no day selected',
  'La IA no devolvió JSON válido. Intenta de nuevo.':'AI did not return valid JSON. Try again.',
  'El usuario debe tener al menos 3 caracteres (solo letras y números)':'Username must be at least 3 characters (letters and numbers only)',
  'La contraseña debe tener al menos 6 caracteres':'Password must be at least 6 characters',
  'Nombre, email, teléfono y contraseña son obligatorios':'Name, email, phone and password are required',
  'El ajuste dejaría el plan sin ese macro. Reduce el cambio.':'This change would remove that macro from the plan. Reduce the amount.',
  '¡Notificaciones activadas! Te avisaremos cuando termine el descanso.':'Notifications enabled! We will alert you when rest time ends.',

  // ── Confirmaciones ──
  '¿Borrar toda la dieta de este cliente?':'Delete this client entire diet?',
  '¿Cancelar la suscripción? El cliente perderá el acceso.':'Cancel subscription? The client will lose access.',
  '¿Eliminar este día y todos sus ejercicios?':'Delete this day and all its exercises?',
  '¿Eliminar este ejercicio?':'Delete this exercise?',
  '¿Eliminar?':'Delete?',
  '¿Menos grasa?':'Less fat?','¿Más energía?':'More energy?',
  '¿Nuevo cliente?':'New client?',
  '¿Publicar los cambios? El cliente verá la nueva rutina inmediatamente.':'Publish changes? The client will see the new routine immediately.',
  '¿Rechazar y eliminar la solicitud de':'Reject and delete the request from',

  // ── Ejemplos placeholder ──
  'Ej: Lunes, Día A...':'E.g. Monday, Day A...',
  'Ej: Pecho + Tríceps...':'E.g. Chest + Triceps...',
  'Ej: brócoli, pescado, huevos...':'E.g. broccoli, fish, eggs...',
  'Ej: genera rutina para Carlos, 4 días, volumen...':'E.g. generate routine for Carlos, 4 days, bulk...',
  'Ej: prefiere desayunos rápidos, cena antes de las 20h...':'E.g. prefers quick breakfasts, dinner before 8pm...',
  'Ej: última serie al fallo, controla la bajada...':'E.g. last set to failure, control the descent...',
  'Ej: Vitamina D baja en última analítica, tendencia a anemia...':'E.g. low Vitamin D in last blood test, tendency to anemia...',

  // ── Instrucciones técnicas ejercicio (visibles al cliente) ──
  'Aprieta los deltoides posteriores y romboides en la posición alta.':'Squeeze rear delts and rhomboids at the top.',
  'Aprieta los glúteos en la posición superior.':'Squeeze glutes at the top.',
  'Aprieta los glúteos y lleva las caderas al frente para volver arriba.':'Squeeze glutes and drive hips forward to return up.',
  'Aprieta los isquiotibiales en la posición alta.':'Squeeze hamstrings at the top.',
  'Aprieta los omóplatos al final del movimiento durante 1 segundo.':'Squeeze shoulder blades at end of movement for 1 second.',
  'Baja de forma controlada invirtiendo el movimiento, caderas atrás primero.':'Lower in a controlled way, hips back first.',
  'Baja de forma lenta manteniendo tensión constante.':'Lower slowly maintaining constant tension.',
  'Baja de forma lenta sin extender completamente para mantener tensión.':'Lower slowly without fully extending to keep tension.',
  'Baja de forma muy lenta para máxima tensión.':'Lower very slowly for maximum tension.',
  'Baja el cuerpo de forma lenta y controlada manteniendo la línea.':'Lower your body slowly and controlled keeping alignment.',
  'Baja hasta que los muslos queden paralelos o más abajo al suelo.':'Lower until thighs are parallel to the floor or below.',
  'Baja hasta que los muslos queden paralelos o más abajo.':'Lower until thighs are parallel or below.',
  'Baja invirtiendo el giro hasta la posición inicial.':'Lower by reversing the rotation to start position.',
  'Baja la mancuerna por detrás de la cabeza doblando los codos.':'Lower the dumbbell behind your head bending the elbows.',
  'Baja la mancuerna por detrás de la cabeza en arco sintiendo el estiramiento.':'Lower the dumbbell behind your head in an arc feeling the stretch.',
  'Baja manteniendo el torso más vertical que en sentadilla trasera.':'Lower keeping the torso more upright than in back squat.',
  'Colócate en el banco romano con las caderas apoyadas en el borde.':'Position yourself on the roman chair with hips at the edge.',
  'Colócate en posición de plancha alta con los brazos extendidos.':'Get into a high plank position with arms extended.',
  'Con los brazos extendidos, retrae las escápulas como primer movimiento.':'With arms extended, retract shoulder blades as first movement.',
  'El agarre neutro reduce el estrés en el hombro.':'Neutral grip reduces shoulder stress.',
  'El agarre neutro trabaja más el braquial y el braquiorradial.':'Neutral grip works brachialis and brachioradialis more.',
  'El agarre prono es más exigente para los antebrazos.':'Pronated grip is more demanding for forearms.',
  'El agarre supino enfoca más el bíceps que el agarre prono.':'Supinated grip focuses more on the bicep than pronated.',
  'El cable mantiene tensión constante a diferencia de las mancuernas.':'Cable maintains constant tension unlike dumbbells.',
  'El cable mantiene tensión durante todo el rango de movimiento.':'Cable maintains tension throughout the full range of motion.',
  'El movimiento rotacional activa más fibras del deltoides.':'Rotational movement activates more deltoid fibers.',
  'El torso vertical exige más movilidad de tobillo.':'Upright torso demands more ankle mobility.',
  'El triángulo de manos enfoca el trabajo en el tríceps.':'Triangle hand position focuses work on the triceps.',
  'Es un peso muerto parcial ideal para trabajar la parte superior del tirón.':'It is a partial deadlift ideal for upper pull work.',
  'Es uno de los ejercicios de core más exigentes.':'One of the most demanding core exercises.',
  'Ideal para aislar el bíceps evitando compensaciones.':'Ideal to isolate the bicep avoiding compensation.',
  'La barra EZ reduce el estrés en las muñecas.':'EZ bar reduces wrist stress.',
  'La inclinación aumenta el rango de movimiento respecto al crunch normal.':'Incline increases range of motion versus a normal crunch.',
  'La posición de los pies determina el énfasis muscular.':'Foot position determines muscle emphasis.',
  'La posición inclinada aumenta el rango de movimiento.':'Inclined position increases range of motion.',
  'La posición sentada estira más el isquiotibial que la versión tumbada.':'Seated position stretches hamstring more than lying version.',
  'Lleva los codos hacia atrás y arriba al nivel de los hombros.':'Drive elbows back and up to shoulder level.',
  'Mantén el codo fijo durante todo el movimiento.':'Keep elbow fixed throughout the movement.',
  'Mantén el control durante el descenso para proteger los hombros.':'Maintain control during descent to protect shoulders.',
  'Mantén el core activado durante todo el movimiento.':'Keep core engaged throughout the movement.',
  'Mantén el core activado para proteger la zona lumbar.':'Keep core engaged to protect the lower back.',
  'Mantén el cuerpo cerca del banco durante el movimiento.':'Keep your body close to the bench during the movement.',
  'Mantén el cuerpo en línea recta desde la cabeza hasta los talones.':'Keep body in a straight line from head to heels.',
  'Mantén el pecho alto y la espalda recta durante el levantamiento.':'Keep chest up and back straight during the lift.',
  'Mantén el torso erguido y el core activado.':'Keep torso upright and core engaged.',
  'Mantén el torso erguido y los codos dentro de las rodillas.':'Keep torso upright and elbows inside the knees.',
  'Mantén el torso estable sujetándote a la máquina.':'Keep torso stable by holding the machine.',
  'Mantén el torso paralelo al suelo durante el movimiento.':'Keep torso parallel to the floor during the movement.',
  'Mantén los codos apuntando al techo durante el movimiento.':'Keep elbows pointing to the ceiling during the movement.',
  'Mantén los codos apuntando al techo durante todo el movimiento.':'Keep elbows pointing to ceiling throughout the movement.',
  'Mantén los codos en la misma posición durante todo el movimiento.':'Keep elbows in the same position throughout the movement.',
  'Mantén los codos fijos apuntando al techo.':'Keep elbows fixed pointing to the ceiling.',
  'Mantén los codos fijos durante todo el movimiento.':'Keep elbows fixed throughout the movement.',
  'Mantén los pies en el suelo y las escápulas retraídas.':'Keep feet on the floor and shoulder blades retracted.',
  'Mantén siempre la espalda baja apoyada en el respaldo.':'Always keep lower back against the backrest.',
  'Más sencillo que la elevación de piernas rectas.':'Easier than straight leg raises.',
  'No bloquees completamente las rodillas en la posición alta.':'Do not fully lock knees at the top.',
  'Regula el rango de movimiento según tu movilidad.':'Adjust range of motion according to your mobility.',
  'Retrae las escápulas como primer movimiento.':'Retract shoulder blades as first movement.',
  'Sube extendiendo las caderas hasta quedar en línea con las piernas.':'Rise by extending hips until aligned with legs.',
  'Sube un pie al cajón y empuja para elevar el cuerpo.':'Step one foot onto the box and push to raise your body.',
  'Tira de la barra hacia el abdomen bajo apretando los omóplatos.':'Pull the bar toward your lower abdomen squeezing shoulder blades.',
  'Tira la mancuerna hacia la cadera apretando el omóplato.':'Pull the dumbbell toward your hip squeezing the shoulder blade.',
  'Trabaja el glúteo medio y los músculos abductores.':'Works the gluteus medius and abductor muscles.',
  'Trabaja principalmente el soleo a diferencia de la versión de pie.':'Works mainly the soleus unlike the standing version.',
  'Trabaja principalmente el tríceps con apoyo del pectoral.':'Works mainly the triceps with pectoral assistance.',
  'Vuelve lentamente a la posición inicial controlando la extensión.':'Return slowly to start controlling the extension.',
  'Vuelve lentamente a la posición inicial sin soltar la tensión.':'Return slowly to start without releasing tension.',
  'Vuelve lentamente a la posición inicial.':'Return slowly to start position.',
  'Nutricionista experto. Responde SOLO con JSON válido y compacto. Sin texto extra.':'Expert nutritionist. Respond ONLY with valid compact JSON. No extra text.',

  // ── Traducciones finales faltantes ──
  'ACCESO MIEMBROS':'MEMBER ACCESS',
  'Alimentos que no puedo comer (opcional)':'Foods I cannot eat (optional)',
  'Alta (5-6 días/semana)':'High (5-6 days/week)',
  'Altura (cm)':'Height (ft/in)',
  'Asistente IA':'AI Assistant',
  'Añadir día de entreno':'Add training day',
  'Cerrar sesión':'Log out',
  'Contraseña *':'Password *',
  'Crear dieta':'Create diet',
  'Crear rutina':'Create routine',
  'Definición':'Cutting',
  'Día A':'Day A',
  'Día B':'Day B',
  'Email *':'Email *',
  'Enviar solicitud':'Send request',
  'Enviar solicitud al coach':'Send request to coach',
  'Espalda + Bíceps':'Back + Biceps',
  'Full Body':'Full Body',
  'Grupo muscular':'Muscle group',
  'Ha pasado más de un mes desde tu última foto. Las fotos son la mejor herramienta para ver tu transformación real.':'More than a month has passed since your last photo. Photos are the best tool to see your real transformation.',
  'Has completado tu primera sesión. ¡El viaje ha comenzado!':'You completed your first session. The journey has begun!',
  'Hombros + Brazos':'Shoulders + Arms',
  'Lesiones / zonas con dolor (opcional)':'Injuries / pain areas (optional)',
  'Marcar todas leídas':'Mark all as read',
  'Miércoles':'Wednesday',
  'Moderada (3-4 días/semana)':'Moderate (3-4 days/week)',
  'Muy alta (atleta, 2x día)':'Very high (athlete, 2x day)',
  'Nivel de actividad':'Activity level',
  'Nombre completo *':'Full name *',
  'Nombre del día':'Day name',
  'Nuevo cliente':'New client',
  'Omnívoro (como de todo)':'Omnivore (eat everything)',
  'Otras observaciones (opcional)':'Other notes (optional)',
  'Pecho + Tríceps':'Chest + Triceps',
  'Perder peso':'Lose weight',
  'Peso (kg)':'Weight (lb)',
  'Primer Entreno':'First Workout',
  'Recomposición':'Body recomp',
  'Recordar contraseña':'Remember password',
  'Recordarme más tarde':'Remind me later',
  'Recuperar acceso':'Recover access',
  'Registrar peso ahora':'Log weight now',
  'Rellena tus datos y tu coach revisará tu solicitud. Te avisaremos cuando tengas acceso.':'Fill in your details and your coach will review your request. We will notify you when you have access.',
  'SUPERACIÓN':'IMPROVEMENT',
  'Saltar →':'Skip →',
  'Sedentario (poco o nada de ejercicio)':'Sedentary (little or no exercise)',
  'Sin gluten / Celiaco':'Gluten free / Celiac',
  'Sin lactosa':'Lactose free',
  'Solicitar acceso →':'Request access →',
  'Solicitud de acceso':'Access request',
  'Son las 48h de seguimiento semanal. Pésate en ayunas y regístralo para que tu coach vea tu progreso.':'It is your weekly 48h check-in. Weigh yourself fasted and log it so your coach can track your progress.',
  'Subir foto ahora':'Upload photo now',
  'Sábado':'Saturday',
  'Teléfono *':'Phone *',
  'Tipo de alimentación':'Diet type',
  'Tirón':'Pull',
  'Técnica del ejercicio':'Exercise technique',
  'Usuario para acceder *':'Username *',
  'WolfMindset · Coach':'WolfMindset · Coach',
  '¡A por más!':'Keep going!',
  '¡Foto mensual!':'Monthly photo!',
  '¡Hora de pesarte!':'Time to weigh in!',
  '¡Logro desbloqueado!':'Achievement unlocked!',
  '¿Cómo fue el entreno?':'How was the workout?',
  '¿Nuevo cliente?':'New client?',
  '¿OLVIDASTE TU CONTRASEÑA?':'FORGOT YOUR PASSWORD?',
  '¿Olvidaste tu contraseña?':'Forgot your password?',
  '✓ Añadir día':'✓ Add day',
  // ── Perfil cliente ──
  'Alimentos que no me gustan o no puedo comer':'Foods I dislike or cannot eat',
  'Lesiones / zonas con dolor / alergias':'Injuries / pain areas / allergies',
  'Otras observaciones':'Other notes',
  'Vegetariano':'Vegetarian','Vegano':'Vegan',
  'Muy activo (dobles entrenos)':'Very active (double sessions)',
  'Por ejemplo: anemia, vitamina D baja, ferritina baja, B12, omega-3... Tu coach lo tendrá en cuenta al preparar tu dieta.':'For example: anemia, low Vitamin D, low ferritin, B12, omega-3... Your coach will consider this when preparing your diet.',
  '🧪 ¿Has tenido o tienes algún tipo de deficiencia?':'🧪 Do you have or have you had any deficiency?',
  'Cualquier cosa que tu coach deba saber...':'Anything your coach should know...',
  'Ej: rodilla derecha, lumbar...':'E.g. right knee, lower back...',

  // ── Progreso ──
  'Semanas':'Weeks','Objetivo':'Goal','Nivel':'Level','Días/sem':'Days/wk',
  'Medición semanal':'Weekly measurement',
  'Peso registrado esta semana':'Weight logged this week',
  'Guardar peso':'Save weight',
  'Fotos de progreso':'Progress photos',
  'Mis fotos':'My photos','Sin fecha':'No date',
  'Valoración del coach':'Coach assessment',
  'Ver más':'See more','Ver menos':'See less',
  'Registrado esta semana':'Logged this week',
  'Guardar mediciones':'Save measurements','Corregir':'Edit',
  'Cintura':'Waist','Cadera':'Hips','Peso':'Weight','Altura':'Height',
  'Se guardan al subir la foto y tu coach las verá en el análisis.':'Saved when uploading — your coach will see them in the analysis.',
  'Sube las 3 fotos para que tu coach pueda hacer una valoración completa.':'Upload all 3 photos so your coach can do a full assessment.',
  'frente':'front','posterior':'back','costado':'side',
  'FRENTE':'FRONT','POSTERIOR':'BACK','COSTADO':'SIDE',
  '${t("${t("Sube las 3 fotos para que tu coach pueda hacer una valoración completa.")}")}':'Upload all 3 photos so your coach can do a full assessment.',

  // ── Descripción ejercicio ──
  'MÚSCULOS TRABAJADOS':'MUSCLES WORKED',
  'Músculos trabajados':'Muscles worked',
  'SECUNDARIOS':'SECONDARY',
  'Secundarios':'Secondary',
  'Pectoral mayor':'Pectoralis major','Pectoral menor':'Pectoralis minor',
  'Deltoides anterior':'Anterior deltoid','Deltoides posterior':'Posterior deltoid',
  'Deltoides lateral':'Lateral deltoid',
  'Bíceps braquial':'Brachial biceps','Bíceps':'Biceps',
  'Tríceps':'Triceps','Cuádriceps':'Quadriceps',
  'Isquiotibiales':'Hamstrings','Glúteo mayor':'Gluteus maximus',
  'Glúteo':'Glute','Sóleo':'Soleus','Gemelos':'Calves',
  'Espalda baja':'Lower back','Trapecio':'Trapezius',
  'Serrato':'Serratus','Romboides':'Rhomboids',
  'Lumbares':'Erector spinae','Core':'Core','Abdominales':'Abs',

  // ── Check-in semanal ──
  'CHECK-IN SEMANAL':'WEEKLY CHECK-IN',
  '📋 Check-in semanal':'📋 Weekly check-in',
  'Medición WEEKL':'Weekly measurement',
  '¡HORA DE PESARTE!':'TIME TO WEIGH IN!',
  'Son las 48h de seguimiento semanal. Pésate en ayunas y regístralo para que tu coach vea tu progreso.':'It is your weekly 48h check-in. Weigh yourself fasted and log it so your coach can track your progress.',
  'Registrar peso ahora':'Log weight now',
  'Recordarme más tarde':'Remind me later',

  // ── Progreso stats ──
  'Volumen':'Volume','Fuerza':'Strength',
  'Principiante':'Beginner','Intermedio':'Intermediate','Avanzado':'Advanced',
  'Ganar músculo':'Build muscle','Perder peso':'Lose weight',
  'Recomposición':'Body recomp','Definición':'Cutting',

  // ── Entreno ──
  'Guardar sesión':'Save session',
  'Entreno guardado':'Workout saved',
  'serie al fallo':'set to failure',
  'Pausa 1-2 segundos en la posición de máxima contracción.':'Pause 1-2 seconds at peak contraction.',

  // ── Textos dinámicos cliente ──
  'ejerc.':'ex.',
  'Semana':'Week',
  'Tu coach está preparando tu dieta':'Your coach is preparing your diet',
  'Siempre disponible':'Always available',
  'Pecho + Tríceps':'Chest + Triceps',
  '¿Cómo dormiste?':'How did you sleep?',
  'Energía hoy':'Energy today',
  'Lunes':'Monday','Martes':'Tuesday','Miércoles':'Wednesday',
  'Jueves':'Thursday','Viernes':'Friday','Sábado':'Saturday','Domingo':'Sunday',
  'Guardar':'Save',
  'Ej: 78.5':'E.g. 78.5',

  // ── Nav bar ──
  'Entrenar':'Train',
  'Logros':'Achievements',
  'Salir':'Log out',

  // ── Entreno activo ──
  'Entrenamiento':'Training',
  '■ Terminar':'■ Finish',
  'En curso':'In progress',
  'SET':'SET','PREVIOUS':'PREVIOUS','REPS':'REPS',
  'Serie':'Set','Anterior':'Previous','Rep.':'Reps',
  '⭐ Principal':'⭐ Main',
  'Coach dice':'Coach says',
  '💬 Nota para el coach (sensaciones, dolor, etc.)':'💬 Note for coach (sensations, pain, etc.)',
  '¡Entreno completado!':'Workout complete!',
  'Descansa y come bien.':'Rest and eat well.',
  '💪 ¿Cuántas reps más podrías haber hecho? (RIR = Reps In Reserve)':'💪 How many more reps could you have done? (RIR = Reps In Reserve)',
  '0 = al fallo · 1 = casi al límite · 2-3 = cómodo · 4+ = fácil':'0 = failure · 1 = near limit · 2-3 = comfortable · 4+ = easy',
  '📋 Check-in semanal':'📋 Weekly check-in',
  'Activar':'Enable',
  'Guardar':'Save',
  '⚖️ Peso hoy (kg)':'⚖️ Today weight (lb)',

  // ── Login / Registro ──
  'Recordar contraseña':'Remember password',
  '¿Olvidaste tu contraseña?':'Forgot your password?',
  '¿Nuevo cliente?':'New client?',
  '¿OLVIDASTE TU CONTRASEÑA?':'FORGOT YOUR PASSWORD?',
  'Rellena tus datos y tu coach revisará tu solicitud. Te avisaremos cuando tengas acceso.':'Fill in your details and your coach will review your request. We will notify you when you have access.',
  'Teléfono *':'Phone *',
  'Contraseña *':'Password *',
  'Definición':'Cutting',
  'Recomposición':'Body recomp',
  'Moderada (3-4 días/semana)':'Moderate (3-4 days/week)',
  'Alta (5-6 días/semana)':'High (5-6 days/week)',
  'Muy alta (atleta, 2x día)':'Very high (athlete, 2x/day)',
  'Tipo de alimentación':'Diet type',
  'Omnívoro (como de todo)':'Omnivore (eat everything)',
  'Marcar todas leídas':'Mark all as read',
  'Técnica del ejercicio':'Exercise technique',
  '¿Cómo fue el entreno?':'How was the workout?',
  '¡Logro desbloqueado!':'Achievement unlocked!',
  'Has completado tu primera sesión. ¡El viaje ha comenzado!':'You completed your first session. The journey has begun!',
  '¡A por más!':'Keep going!',
  'Añadir día de entreno':'Add training day',
  'Nombre del día':'Day name',
  'Día A':'Day A','Día B':'Day B',
  'Pecho + Tríceps':'Chest + Triceps',
  'Espalda + Bíceps':'Back + Biceps',
  'Tirón':'Pull',
  '✓ Añadir día':'✓ Add day',
  'Cerrar sesión':'Log out',
  'Miércoles':'Wednesday','Sábado':'Saturday',
  // ── Progreso / Entreno ──
  '¡Bestia imparable!':'Unstoppable beast!',
  '📅 Última foto':'📅 Last photo',
  'años':'years old',
  'días':'days',
  '⚖️ Evolución de peso':'⚖️ Weight evolution',
  'Sin registros de peso aún.':'No weight records yet.',
  'Sin entrenos aún.':'No workouts yet.',
  'Sin sesiones aún.':'No sessions yet.',
  'Duración':'Duration',
  'Progresión de carga':'Load progression',
  'Sin datos aún':'No data yet',
  // ── Panel coach — cliente card ──
  'Sin clientes aún':'No clients yet',
  'Míos':'Mine',
  '🔵 Míos':'🔵 Mine',
  '🔑 Contraseña del cliente':'🔑 Client password',
  'Reasignar':'Reassign',
  // ── Rutinas builder ──
  '+ Día':'+ Day',
  '✓ Añadir ejercicio':'✓ Add exercise',
  'Añadir ejercicio':'Add exercise',
  'Sin ejercicios aún.':'No exercises yet.',
  'Sin días. Pulsa + Día para empezar.':'No days. Press + Day to start.',
  'Sin días. Añade el primero arriba.':'No days. Add the first one above.',
  'Aparece en gráficas de progreso':'Shows in progress charts',
  'La IA genera toda la semana automáticamente para el cliente seleccionado.':'AI generates the full week automatically for the selected client.',
  // ── Dieta builder ──
  '🔧 Ajuste automático':'🔧 Auto adjustment',
  'Proteína':'Protein',
  'Calorías totales':'Total calories',
  'Edición manual':'Manual edit',
  '+ Añadir alimento':'+ Add food',
  '+ Añadir':'+ Add',
  'Automático según objetivo del cliente':'Auto based on client goal',
  'Forzar déficit (-300 kcal)':'Force deficit (-300 kcal)',
  'Forzar déficit agresivo (-500 kcal)':'Force aggressive deficit (-500 kcal)',
  'Forzar superávit (+300 kcal)':'Force surplus (+300 kcal)',
  'La IA recomendará suplementación':'AI will recommend supplementation',
  'Sin comidas. Añade la primera.':'No meals. Add the first one.',
  'Toca una categoría para añadir alimentos →':'Tap a category to add foods →',
  '🥩 Proteínas':'🥩 Proteins',
  // ── Suscripciones ──
  'Este cliente no tiene suscripción activa.':'This client has no active subscription.',
  '+ Añadir suscripción':'+ Add subscription',
  'días restantes':'days remaining',
  // ── Revisión / Progreso coach ──
  '📋 Último check-in del cliente':'📋 Client last check-in',
  '😴 Sueño':'😴 Sleep',
  '⚡ Energía':'⚡ Energy',
  'Error cargando métricas.':'Error loading metrics.',
  'Sin sesiones registradas aún. Cuando el cliente complete entrenamientos aparecerá aquí la revisión.':'No sessions yet. Once the client completes workouts the review will appear here.',
  'El cliente no verá los cambios hasta que pulses Publicar semana':'The client cannot see changes until you press Publish week',
  '🤖 Sugerir progresión con IA':'🤖 Suggest progression with AI',
  'Error cargando revisión.':'Error loading review.',
  '🤖 Sugerencia IA para próxima semana':'🤖 AI suggestion for next week',
  // ── Fotos / Análisis ──
  'VALORACIÓN COACH':'COACH ASSESSMENT',
  'El cliente aún no ha subido fotos.':'The client has not uploaded photos yet.',
  'Valoración':'Assessment',
  // ── Dieta cliente vista ──
  '📋 GUÍA NUTRICIONAL':'📋 NUTRITIONAL GUIDE',
  'Hidratación':'Hydration',
  'Azúcares añadidos':'Added sugars',
  '🧪 Suplementación recomendada':'🧪 Recommended supplementation',
  '🥩 Alimentos terapéuticos':'🥩 Therapeutic foods',
  // ── Perfil cliente ──
  'Ligero (1-2 días/semana)':'Light (1-2 days/week)',
  'Activo (5-6 días/semana)':'Active (5-6 days/week)',
  '🧪 ¿Has tenido o tienes algún tipo de deficiencia?':'🧪 Do you have or have you had any deficiency?',
  'Por ejemplo: anemia, vitamina D baja, ferritina baja, B12, omega-3... Tu coach lo tendrá en cuenta al preparar tu dieta.':'For example: anemia, low Vitamin D, low ferritin, B12, omega-3... Your coach will consider this when preparing your diet.',
  'También puedes cambiarlo en la pantalla de inicio de sesión':'You can also change it on the login screen',
  'kcal/día':'kcal/day',
  // ── Pendientes / Nuevo ──
  'Cuando alguien se registre aparecerá aquí':'Registrations will appear here',
  'Elige opción':'Choose option',
  'Se publicará como mensaje de tu coach':'Will be published as a coach message',
  // ── Panel coach general ──
  'Descripción no disponible.':'Description not available.',
  'Para que suene el timer aunque la pantalla esté bloqueada':'So the timer sounds even when the screen is locked',
  'Atención':'Warning',
  'Músculos':'Muscles',
  '+ Añadir día':'+ Add day',
  'Contraseña':'Password',
  'Gestionar imágenes de ejercicios':'Manage exercise images',
  'Añade ejercicios personalizados que no están en la biblioteca.':'Add custom exercises not in the library.',
  '🖼️ Añadir imagen a un ejercicio':'🖼️ Add image to an exercise',
  '🖼️ Gestionar imágenes ejercicios':'🖼️ Manage exercise images',
  'Proteínas':'Proteins',
  // ── Equipo (coaches) ──
  '➕ Añadir nuevo coach':'➕ Add new coach',
  '🇪🇸 Español':'🇪🇸 Spanish',
  'Solo tú por ahora.':'Just you for now.',
  'Error cargando coaches. Actualiza el backend.':'Error loading coaches. Update the backend.',
  // ── Borrador semana ──
  'Tu coach está preparando':'Your coach is preparing',
  'tu próxima semana':'your next week',
  'Tu rutina está siendo actualizada con nuevos objetivos. En breve tendrás los cambios disponibles.':'Your routine is being updated with new goals. Changes will be available shortly.',
  '✓ Plan generado. Revisa la vista previa abajo y publica cuando estés listo.':'✓ Plan generated. Review the preview below and publish when ready.',

  // ── Entreno activo ──
  '✓ Completado hoy':'✓ Completed today',
  '⚠ Incompleto hoy':'⚠ Incomplete today',
  'Sin realizar':'Not done yet',
  'Ej: Sentí el peso muy pesado, me dolió el hombro...':'E.g. I felt the weight too heavy, my shoulder hurt...',
  '💬 Nota para el coach (sensaciones, dolor, etc.)':'💬 Note for coach (sensations, pain, etc.)',
  'Sube las 3 fotos para que tu coach pueda hacer una valoración completa.':'Upload all 3 photos so your coach can do a full assessment.',

  'Mensaje de tu coach':'Message from your coach',
  '¡Dos semanas seguidas!':'Two weeks straight!',
  '¡Una semana de fuego!':'One week on fire!',
  '¡Primer día!':'First day!',
  '¡Sigue así!':'Keep it up!',

  'Dorsal ancho':'Latissimus dorsi',
  'Romboides':'Rhomboids',
  'Braquial':'Brachialis',
  'Gastrocnemio':'Gastrocnemius',
  'Lumbar':'Lower back',
  'Rotadores':'Rotators',
  'Pectoral':'Chest',
  'Core':'Core',
  'Abdominales':'Abs',
  'alimentos':'foods',
  'OPCIONES ALTERNATIVAS':'ALTERNATIVE OPTIONS',
  'INSTRUCCIONES':'INSTRUCTIONS',
  'ESPALDA':'BACK','PECHO':'CHEST','PIERNAS':'LEGS',
  'HOMBROS':'SHOULDERS','BRAZOS':'ARMS','GLÚTEOS':'GLUTES',

}
function t(text) {
  if(LANG === 'es') return text;
  return TRANSLATIONS[text] || text;
}

// Aplicar traducción al contenido renderizado
function applyLang(el) {
  if(LANG === 'es' || !el) return;

  // 1. Nodos de texto — exact match primero, luego fragmentos
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if(node.parentElement?.closest('[data-no-translate]')) return;
    let text = node.textContent;
    const trimmed = text.trim();
    // Exact match
    if(trimmed && TRANSLATIONS[trimmed]) {
      node.textContent = text.replace(trimmed, TRANSLATIONS[trimmed]);
      return;
    }
    // Fragment match — replace all known strings within the text
    let changed = false;
    // Sort by length desc so longer matches win
    const keys = Object.keys(TRANSLATIONS).sort((a,b) => b.length - a.length);
    for(const k of keys) {
      if(k.length > 2 && text.includes(k)) {
        text = text.split(k).join(TRANSLATIONS[k]);
        changed = true;
      }
    }
    if(changed) node.textContent = text;
  });

  // 2. Placeholders
  el.querySelectorAll('[placeholder]').forEach(inp => {
    const p = inp.getAttribute('placeholder');
    if(TRANSLATIONS[p]) inp.setAttribute('placeholder', TRANSLATIONS[p]);
    else {
      // Fragment match for placeholder
      let text = p;
      Object.keys(TRANSLATIONS).sort((a,b)=>b.length-a.length).forEach(k => {
        if(k.length > 3 && text.includes(k)) text = text.split(k).join(TRANSLATIONS[k]);
      });
      if(text !== p) inp.setAttribute('placeholder', text);
    }
  });

  // 3. Atributos title y aria-label
  el.querySelectorAll('[title],[aria-label]').forEach(el2 => {
    ['title','aria-label'].forEach(attr => {
      const v = el2.getAttribute(attr);
      if(v && TRANSLATIONS[v]) el2.setAttribute(attr, TRANSLATIONS[v]);
    });
  });

  // 4. Botones y selects — valor/texto directo
  el.querySelectorAll('option').forEach(opt => {
    const t2 = opt.textContent.trim();
    if(TRANSLATIONS[t2]) opt.textContent = TRANSLATIONS[t2];
  });

  // 5. Elementos con data-i18n
  el.querySelectorAll('[data-i18n]').forEach(el2 => {
    const key = el2.getAttribute('data-i18n');
    if(TRANSLATIONS[key]) el2.textContent = TRANSLATIONS[key];
  });
}
const _klNavOrig = klNav;
function klNavLang(s, btn) {
  // se llama después de definir klNav
}

function setLangLogin(lang) {
  LANG = lang;
  localStorage.setItem('wm_lang', lang);

  // Actualizar botones de idioma
  const esBtn = document.getElementById('lang_es');
  const enBtn = document.getElementById('lang_en');
  if(esBtn) {
    esBtn.style.border = lang==='es' ? '1px solid rgba(255,255,255,.6)' : '1px solid rgba(255,255,255,.12)';
    esBtn.style.background = lang==='es' ? 'rgba(255,255,255,.15)' : 'none';
    esBtn.style.opacity = lang==='es' ? '1' : '0.4';
  }
  if(enBtn) {
    enBtn.style.border = lang==='en' ? '1px solid rgba(255,255,255,.6)' : '1px solid rgba(255,255,255,.12)';
    enBtn.style.background = lang==='en' ? 'rgba(255,255,255,.15)' : 'none';
    enBtn.style.opacity = lang==='en' ? '1' : '0.4';
  }

  // Traducir textos del login al instante
  const es = lang === 'es';
  const lu = document.getElementById('lu');
  const lp = document.getElementById('lp');
  if(lu) lu.placeholder = es ? 'Usuario' : 'Username';
  if(lp) lp.placeholder = es ? 'Contraseña' : 'Password';
  const rec = document.getElementById('login_recordar');
  if(rec) rec.textContent = es ? 'Recordar contraseña' : 'Remember me';
  const btn = document.getElementById('login_btn');
  if(btn) btn.textContent = es ? 'Entrar' : 'Log in';
  const olvide = document.getElementById('login_olvide');
  if(olvide) olvide.textContent = es ? '¿Olvidaste tu contraseña?' : 'Forgot your password?';
  const nuevoTxt = document.getElementById('login_nuevo_txt');
  if(nuevoTxt) nuevoTxt.textContent = es ? '¿Nuevo cliente? ' : 'New member? ';
  const solicitar = document.getElementById('login_solicitar');
  if(solicitar) solicitar.textContent = es ? 'Solicitar acceso →' : 'Request access →';
  const titulo = document.getElementById('login_titulo');
  if(titulo) titulo.textContent = es ? 'ACCESO MIEMBROS' : 'MEMBER LOGIN';

  const olvide_sub = document.getElementById('olvide_sub');
  const olvide_titulo = document.getElementById('olvide_titulo');
  const olvide_desc = document.getElementById('olvide_desc');
  const olvide_btn = document.getElementById('olvide_btn');
  const olvide_back = document.getElementById('olvide_back');
  if(olvide_sub) olvide_sub.textContent = es ? 'Recuperar acceso' : 'Recover access';
  if(olvide_titulo) olvide_titulo.textContent = es ? '¿OLVIDASTE TU CONTRASEÑA?' : 'FORGOT YOUR PASSWORD?';
  if(olvide_desc) olvide_desc.textContent = es
    ? 'Escribe tu nombre de usuario y tu coach recibirá una solicitud de reseteo. Te enviará tu nueva contraseña por el canal habitual (WhatsApp, email, etc.)'
    : 'Enter your username and your coach will receive a reset request. They will send your new password via the usual channel (WhatsApp, email, etc.)';
  if(olvide_btn) olvide_btn.textContent = es ? 'Enviar solicitud al coach' : 'Send request to coach';
  if(olvide_back) olvide_back.textContent = es ? '← Volver al login' : '← Back to login';

  // Palabras flotantes
  const words_es = ['DISCIPLINA','CONSTANCIA','ENFOQUE','ESFUERZO','FUERZA','MENTALIDAD','SUPERACIÓN'];
  const words_en = ['DISCIPLINE','CONSISTENCY','FOCUS','EFFORT','STRENGTH','MINDSET','IMPROVEMENT'];
  document.querySelectorAll('.floating-word').forEach((el, i) => {
    // Preservar el ::before dot — solo cambiar el texto
    const words = es ? words_es : words_en;
    if(words[i]) el.childNodes.forEach(n => { if(n.nodeType===3) n.textContent=words[i]; });
  });
}

// Aplicar idioma guardado al cargar la app
document.addEventListener('DOMContentLoaded', () => {
  if(LANG !== 'es') setLangLogin(LANG);
  else setLangLogin('es');
  // Si LANG=en, precargar imagen del lobo EN para overlay
  if(LANG === 'en') {
    const wolfImg = document.getElementById('done_wolf_img');
    if(wolfImg) wolfImg.src = WOLF_COMPLETE_EN_SRC;
  }
});

function setLang(lang) {
  LANG = lang;
  localStorage.setItem('wm_lang', lang);
  // Re-renderizar pantalla actual
  const el = document.getElementById('klContent');
  if(el) {
    // Re-ejecutar el render del tab actual
    if(klTab === 'entreno' && vistaActual === 'seleccion') renderSeleccion();
    else if(klTab === 'dieta') el.innerHTML = hDieta();
    else if(klTab === 'progreso') { el.innerHTML = hProgreso2(); setTimeout(()=>{cargarGraficasCliente();initPesoSection();renderFotosProgreso();},100); }
    else if(klTab === 'logros') el.innerHTML = hBadgesCliente();
    else if(klTab === 'perfil') el.innerHTML = hPerfil();
    else if(klTab === 'asistente') { el.innerHTML = hAsistente(); }
    applyLang(el);
  }
  // Traducir barra de navegación
  applyLang(document.querySelector('#sCliente .bnav-bar'));
  // Traducir placeholders dinámicos
  const ciPeso = document.getElementById('ci_peso');
  if(ciPeso) ciPeso.placeholder = t('Ej: 78.5');
}


// Traducción para el coach (independiente del idioma del cliente)
const COACH_TRANSLATIONS = {
  // Nav sidebar
  'Clientes':'Clients','Crear rutina':'Create routine','Crear dieta':'Create diet',
  'Nuevo cliente':'New client','Pendientes':'Pending','Progreso':'Progress',
  'Asistente IA':'AI Assistant','Cerrar sesión':'Log out',
  // Nav mobile
  'Rutinas':'Routines','Solicitudes':'Requests','+ Cliente':'+ Client',
  // Topbar
  'Clientes':'Clients',
  // Títulos secciones
  'Resumen':'Summary','Entreno':'Workout','Dieta':'Diet','Notas':'Notes',
  'Notificaciones':'Notifications','Marcar todas leídas':'Mark all read',
  'Cargando...':'Loading...',
  // Cliente card
  'Semana':'Week','Sesiones':'Sessions','sin sesiones':'no sessions',
  'Suscripción activa':'Active subscription','Sin suscripción':'No subscription',
  'Renovar suscripción':'Renew subscription','Cancelar suscripción':'Cancel subscription',
  'Contraseña del cliente':'Client password','Resetear':'Reset',
  'Archivados':'Archived','Archivar':'Archive','Restaurar':'Restore','Borrar permanente':'Permanent delete',
  'Nueva contraseña':'New password','Mín 6 caracteres':'Min 6 chars',
  // Botones
  'Guardar':'Save','Publicar':'Publish','Eliminar':'Delete','Editar':'Edit',
  'Añadir':'Add','Cancelar':'Cancel','Guardar cambios':'Save changes',
  '✓ Publicar rutina':'✓ Publish routine','✓ Guardar cambios':'✓ Save changes',
  '+ Día':'+ Day','+ Ejercicio':'+ Exercise',
  'Añadir día de entreno':'Add training day','Añadir ejercicio →':'Add exercise →',
  // Nuevo cliente
  'Nombre completo *':'Full name *','Email *':'Email *','Teléfono *':'Phone *',
  'Usuario para acceder *':'Username *','Contraseña *':'Password *',
  'Objetivo':'Goal','Nivel':'Level','Días/semana':'Days/week',
  'Solicitud de acceso':'Access request','Aprobar y crear':'Approve & create',
  'Rechazar':'Reject',
  // Dieta builder  
  'Tipo de alimentación':'Diet type','Objetivo calórico':'Calorie goal',
  'Automático según objetivo del cliente':'Auto based on client goal',
  'Calorías objetivo:':'Target calories:','Proteína':'Protein',
  'Carbos':'Carbs','Grasas':'Fats','Añadir alimento':'Add food',
  'Generar con IA':'Generate with AI','Borrar dieta':'Delete diet',
  'Comida libre':'Free meal','Sin dieta asignada':'No diet assigned',
  // IA asistente
  'Hola coach, listo. Puedo generar rutinas y dietas completas, analizar progreso y sugerir ajustes. ¿Qué necesitas?':
    'Hi coach, ready to go. I can generate complete routines and diets, analyze progress and suggest adjustments. What do you need?',
  // Progreso
  'Valoración IA':'AI Assessment','Analizar progreso':'Analyze progress',
  'Ver historial':'View history','Fotos de progreso':'Progress photos',
  // Mensajes
  'VALORACIÓN COACH':'COACH ASSESSMENT',
  'Sin notas':'No notes','Sin historial':'No history',
  'Semanas de entrenamiento':'Training weeks',
  // Ajuste dieta
  'Ajuste automático':'Auto adjustment','Ajuste calórico':'Calorie adjustment',
  'Aplicar ajuste':'Apply adjustment',
  // Días semana (para crear rutinas)
  'Lunes':'Monday','Martes':'Tuesday','Miércoles':'Wednesday',
  'Jueves':'Thursday','Viernes':'Friday','Sábado':'Saturday','Domingo':'Sunday',
  // Músculos
  'Pecho + Tríceps':'Chest + Triceps','Espalda + Bíceps':'Back + Biceps',
  'Hombros + Brazos':'Shoulders + Arms','Full Body':'Full Body',
  'Piernas':'Legs','Empuje':'Push','Tirón':'Pull','Glúteos':'Glutes',
  'Principiante':'Beginner','Intermedio':'Intermediate','Avanzado':'Advanced',
  // Objetivos cliente
  'Volumen':'Bulk','Definición':'Cutting','Fuerza':'Strength',
  'Recomposición':'Body recomp','Perder peso':'Lose weight',

  // ── verCliente — cabecera y tabs ──
  'Volver':'Back',
  'Reasignar':'Reassign',
  '📋 Resumen':'📋 Summary',
  '🏋️ Rutina':'🏋️ Routine',
  '📊 Historial':'📊 History',
  '🥗 Dieta':'🥗 Diet',
  '📈 Progreso':'📈 Progress',

  // ── Tab Resumen ──
  'Macros internos':'Internal macros',
  'SOLO COACH':'COACH ONLY',
  'kcal/día':'kcal/day',
  'Prot':'Prot','Grasa':'Fat',
  'Sin registros':'No records',
  '💳 Suscripción':'💳 Subscription',
  'Cargando...':'Loading...',
  'Duración':'Duration',
  '1 mes':'1 month','2 meses':'2 months','3 meses':'3 months',
  '6 meses':'6 months','12 meses':'12 months',
  'Precio (€)':'Price (€)',
  'Notas internas (opcional)':'Internal notes (optional)',
  '✓ Activar / Renovar':'✓ Activate / Renew',
  'Datos personales del cliente':'Client personal data',
  'Peso (kg)':'Weight (lb)','Altura':'Height',
  'Edad':'Age','Sexo':'Sex','Actividad':'Activity',
  'Cintura/Cadera':'Waist/Hip',
  'Moderada':'Moderate','Ligera':'Light','Sedentario':'Sedentary',
  'Activo':'Active','Alta':'High','Muy alta':'Very high',
  'Moderada (3-4 días/semana)':'Moderate (3-4 days/week)',
  'Ligero (1-2 días/semana)':'Light (1-2 days/week)',
  'Sedentario (poco o nada de ejercicio)':'Sedentary (little or no exercise)',
  'Activo (5-6 días/semana)':'Active (5-6 days/week)',
  'Alta (5-6 días/semana)':'High (5-6 days/week)',
  'Muy alta (atleta, 2x día)':'Very high (athlete, 2x/day)',
  'Hombre':'Male','Mujer':'Female','Masculino':'Male','Femenino':'Female',
  'Sin datos':'No data',
  'años':'years',
  'Lesiones:':'Injuries:','Dieta:':'Diet:','No come:':'Cannot eat:','Obs:':'Notes:',
  'Ajustar datos':'Adjust data',
  'Objetivo':'Goal',
  'Calculadora de macros — ajusta y se recalcula solo':'Macro calculator — adjust and auto-recalculates',
  'Recalcular':'Recalculate',
  'Kcal totales':'Total kcal',
  'Proteína (g)':'Protein (g)',
  'Grasas (g)':'Fats (g)',
  'Carbos (g)':'Carbs (g)',
  'Comida libre (p.ej. domingo)':'Free meal (e.g. Sunday)',
  'Comida libre':'Free meal',
  'Mensaje de la semana (se muestra al cliente)':'Weekly message (shown to client)',
  'Mensaje de la semana':'Weekly message',
  'Notas privadas (solo coach)':'Private notes (coach only)',
  'Notas coach (privadas)':'Coach notes (private)',
  '✏️ Editar':'✏️ Edit',
  'Guardar':'Save',

  // ── Tab Dieta ──
  'Macros actuales del plan':'Current plan macros',
  '⚡ Rebalanceo IA':'⚡ AI Rebalance',
  'Describe el ajuste y la IA redistribuye todo el plan':'Describe the adjustment and AI will redistribute the whole plan',
  'Macro a ajustar':'Macro to adjust',
  'Cambio (+ subir / - bajar)':'Change (+ raise / - lower)',
  '🔧 Aplicar ajuste':'🔧 Apply adjustment',
  '⚡ Rebalancear con IA':'⚡ Rebalance with AI',
  'Edición manual':'Manual edit',
  '+ Añadir alimento':'+ Add food',
  '✓ Guardar y cerrar':'✓ Save and close',
  'Calorías totales':'Total calories',
  'Proteína':'Protein',
  '✏️ Editar dieta':'✏️ Edit diet',
  '✕ Cancelar':'✕ Cancel',
  'Sin comidas. Publica una dieta primero desde el Creador IA.':'No meals. Publish a diet first from the AI Creator.',
  '✓ Publicado':'✓ Published',
  'Publicar semana':'Publish week',
  'El cliente no verá los cambios hasta que pulses Publicar semana':'The client cannot see changes until you press Publish week',
  'Sin dieta. Usa el Creador de Dieta IA.':'No diet. Use the AI Diet Creator.',
  'Borrar dieta del cliente':'Delete client diet',
  '¿Borrar toda la dieta de este cliente?':'Delete this client\'s entire diet?',

  // ── Tab Historial ──
  'Sin sesiones registradas.':'No sessions recorded.',
  'Sin sesiones':'No sessions',
  '⚠ Incompleto':'⚠ Incomplete',
  '✓ Completado':'✓ Completed',
  'series':'sets',
  'Error cargando sesiones.':'Error loading sessions.',

  // ── Tab Progreso ──
  'Revisión semanal':'Weekly review',
  'Progresión sugerida por IA':'AI suggested progression',
  '⚡ Aplicar todos los ajustes':'⚡ Apply all adjustments',
  'Fotos del cliente':'Client photos',
  'El cliente aún no ha subido fotos.':'The client has not uploaded photos yet.',
  'VALORACIÓN COACH':'COACH ASSESSMENT',
  'Valoración':'Assessment',
  'Subir foto':'Upload photo',
  'Analizar con IA':'Analyze with AI',
  'Analizando...':'Analyzing...',
  '🏆 PRs & 1RM estimado':'🏆 PRs & Estimated 1RM',
  '⚡ Tonelaje semanal':'⚡ Weekly tonnage',
  '📊 Esta semana vs anterior':'📊 This week vs last week',
  'Sesiones':'Sessions',
  'Tonelaje':'Tonnage',
  '📋 Último check-in del cliente':'📋 Last client check-in',
  '😴 Sueño':'😴 Sleep',
  '⚡ Energía':'⚡ Energy',
  'Sin datos suficientes.':'Insufficient data.',
  'Error cargando métricas.':'Error loading metrics.',
  'Sin sesiones aún.':'No sessions yet.',
  'Sin sesiones registradas aún. Cuando el cliente complete entrenamientos aparecerá aquí la revisión.':'No sessions yet. Once the client completes workouts, the review will appear here.',
  'Error cargando revisión.':'Error loading review.',
  '🤖 Sugerir progresión con IA':'🤖 Suggest progression with AI',
  '🤖 Sugerencia IA para próxima semana':'🤖 AI suggestion for next week',
  'Últimas':'Last','semana':'week','semanas':'weeks',
  'Sueño medio:':'Avg sleep:','Energía media:':'Avg energy:',
  '1RM est.':'1RM est.',

  // ── Suscripción (coach panel) ──
  'Sin suscripción':'No subscription',
  'Este cliente no tiene suscripción activa.':'This client has no active subscription.',
  '+ Añadir suscripción':'+ Add subscription',
  '✅ Activa':'✅ Active',
  '🔴 Vencida':'🔴 Expired',
  'Cancelada':'Cancelled',
  'Vencida':'Expired',
  'días restantes':'days remaining',
  'Sin sub':'No sub',
  '🔑 Contraseña del cliente':'🔑 Client password',
  'Nueva contraseña del cliente:':'New client password:',
  'Cancelar suscripción':'Cancel subscription',
  '¿Cancelar la suscripción? El cliente perderá el acceso.':'Cancel subscription? The client will lose access.',

  // ── hClientes — lista ──
  'Sin clientes aún':'No clients yet',
  'Crea el primero desde "Nuevo cliente"':'Create the first one from "New client"',
  'Total':'Total','Míos':'Mine',
  'Todos':'All','🔵 Míos':'🔵 Mine',
  'Sem':'Wk',

  // ── hNuevo ──
  'Crear cliente manualmente':'Create client manually',
  'Nombre completo':'Full name','Email':'Email','Teléfono':'Phone',
  'Usuario (para iniciar sesión)':'Username (for login)',
  'Contraseña inicial':'Initial password',
  'Días/semana':'Days/week',
  'Semanas iniciales':'Initial weeks',
  'Kcal/día':'Kcal/day',
  'Macros (g/día)':'Macros (g/day)',
  'Crear cliente':'Create client',
  '✓ Cliente creado':'✓ Client created',

  // ── hPendientes ──
  'Solicitudes pendientes':'Pending requests',
  'Cuando alguien se registre aparecerá aquí':'Registrations will appear here',
  'Registrado':'Registered',
  'Objetivo:':'Goal:','Nivel:':'Level:',
  'Actividad:':'Activity:','Dieta:':'Diet:',
  'No come:':'Cannot eat:','Lesiones:':'Injuries:',
  'Notas:':'Notes:',
  'Aprobar y crear':'Approve & create',
  'Rechazar':'Reject',
  '¿Rechazar y eliminar la solicitud de':'Reject and delete the request from',

  // ── hProgreso — dashboard ──
  '📊 Dashboard clientes':'📊 Client dashboard',
  '🔔 Avisos':'🔔 Alerts',
  '↺ Actualizar':'↺ Refresh',
  'Clientes':'Clients',
  'Activos':'Active',
  'Atención':'Attention',
  'Cliente':'Client','Progreso':'Progress','Última sesión':'Last session',
  'Sem':'Wk','Suscripción':'Subscription',
  'Cargando...':'Loading...',
  'Hoy':'Today','Ayer':'Yesterday',
  'Hace':'Ago','Sin sesiones':'No sessions',
  '⚠️ Próximas a vencer':'⚠️ Expiring soon',
  '🔴 Vencidas / Canceladas':'🔴 Expired / Cancelled',
  'Vence:':'Expires:','Venció:':'Expired:',
  'Ver cliente':'View client','Renovar':'Renew',

  // ── hIACoach ──
  'Asistente IA Coach':'AI Coach Assistant',
  'Enviar':'Send',
  'Escribe un mensaje al asistente...':'Write a message to the assistant...',
  '🖼️ Descargar imágenes ejercicios':'🖼️ Download exercise images',
  'Gestionar imágenes de ejercicios':'Manage exercise images',
  'Gestionar imágenes':'Manage images',
  'Añade ejercicios personalizados que no están en la biblioteca.':'Add custom exercises not in the library.',
  'Nuevo ejercicio manual':'New manual exercise',
  'Nombre del ejercicio':'Exercise name',
  'Grupo muscular':'Muscle group',
  'Músculos principales':'Main muscles',
  'Dificultad':'Difficulty',
  'URL imagen (opcional)':'Image URL (optional)',
  '+ Crear ejercicio':'+ Create exercise',
  'Sin resultados':'No results',
  'Básico':'Basic','Intermedio':'Intermediate','Avanzado':'Advanced',

  // ── hRutinas ──
  'Selecciona un cliente':'Select a client',
  'Selecciona cliente':'Select client',
  '-- Elige cliente --':'-- Choose client --',
  'Filtrar ejercicios con IA':'Filter exercises with AI',
  '🤖 Filtrar ejercicios con IA (lesiones y nivel)':'🤖 Filter exercises with AI (injuries & level)',
  'Limpiar filtro':'Clear filter',
  'Generar semana completa con IA':'Generate full week with AI',
  'La IA genera toda la semana automáticamente para el cliente seleccionado.':'AI generates the full week automatically for the selected client.',
  '⚡ Generar semana con IA':'⚡ Generate week with AI',
  '+ Día':'+ Day',
  'Publicar semana al cliente':'Publish week to client',
  '✓ Publicar rutina':'✓ Publish routine',
  'Sin días. Pulsa + Día para empezar.':'No days. Press + Day to start.',
  'Sin días. Añade el primero arriba.':'No days. Add the first one above.',
  'Añadir ejercicio →':'Add exercise →',
  'Sin ejercicios aún.':'No exercises yet.',
  'Series':'Sets','Reps':'Reps','Peso obj.':'Target weight',
  'Descanso (s)':'Rest (s)','RIR obj.':'Target RIR',
  'Principal':'Main','Nota coach':'Coach note',
  'YouTube URL':'YouTube URL',
  'Aparece en gráficas de progreso':'Shows in progress charts',
  '✓ Añadir ejercicio':'✓ Add exercise',
  'Buscar ejercicio...':'Search exercise...',
  'Todos los grupos':'All groups',
  '🤖 Analizar perfil del cliente...':'🤖 Analyzing client profile...',
  '✓ Sin contraindicaciones para este cliente':'✓ No contraindications for this client',
  'Selecciona un cliente primero':'Select a client first',

  // ── hDietaBuilder ──
  '1. Selecciona cliente':'1. Select client',
  '🤖 Generar plan de dieta con IA':'🤖 Generate diet plan with AI',
  'La IA usa automáticamente las kcal, macros, intolerancias y preferencias del cliente. Solo tienes que indicar los alimentos disponibles y el número de comidas.':
    'AI automatically uses the client\'s kcal, macros, intolerances and preferences. Just indicate available foods and number of meals.',
  'Alimentos disponibles':'Available foods',
  '+ Nuevo alimento':'+ New food',
  '✕ Limpiar todo':'✕ Clear all',
  'Nº de comidas':'No. of meals',
  '2 comidas':'2 meals','3 comidas':'3 meals','4 comidas':'4 meals',
  '5 comidas':'5 meals','6 comidas':'6 meals',
  'Ajuste calórico':'Calorie adjustment',
  '(opcional — usa el del cliente por defecto)':'(optional — uses client default)',
  'Forzar mantenimiento':'Force maintenance',
  'Forzar déficit (-300 kcal)':'Force deficit (-300 kcal)',
  'Forzar déficit agresivo (-500 kcal)':'Force aggressive deficit (-500 kcal)',
  'Forzar superávit (+300 kcal)':'Force surplus (+300 kcal)',
  'Notas adicionales (opcional)':'Additional notes (optional)',
  '🧪 Analíticas / déficits (opcional)':'🧪 Blood tests / deficits (optional)',
  'La IA recomendará suplementación':'AI will recommend supplementation',
  '⚡ Generar plan personalizado':'⚡ Generate personalised plan',
  'Vista previa del plan':'Plan preview',
  '✏️ Editar cantidades':'✏️ Edit quantities',
  '✓ Publicar al cliente':'✓ Publish to client',
  '✓ Plan generado. Revisa la vista previa abajo y publica cuando estés listo.':'✓ Plan generated. Review the preview below and publish when ready.',
  'Dieta publicada':'Diet published',
  'La dieta se ha guardado en el perfil del cliente. Puedes volver a entrar al cliente y verla en sus comidas.':'The diet has been saved in the client profile. You can return to the client and view it in their meals.',
  '✓ Publicado y guardado':'✓ Published and saved',
  'Alternativas e intercambios':'Alternatives & swaps',
  'Ajustes si es necesario':'Adjustments if needed',
  'Generando dieta...':'Generating diet...',
  'Selecciona un cliente primero':'Select a client first',
  'Escribe los alimentos disponibles':'Enter the available foods',
  'Tap a category to add foods →':'Tap a category to add foods →',
  '⭐ Mis favoritos':'⭐ My favourites',
  '⭐ Save as favourite':'⭐ Save as favourite',
  '✓ Saved as favourite':'✓ Saved as favourite',
  '⚡ Rebalanceo IA':'⚡ AI Rebalance',
  '🌾 Carbos':'🌾 Carbs',
  '🥑 Grasas':'🥑 Fats',
  '🥦 Verduras':'🥦 Vegetables',
  '🍎 Frutas':'🍎 Fruits',
  '☕ Bebidas':'☕ Drinks',
  'Por 100g:':'Per 100g:','Sin resultados':'No results',
  'Generando rutina...':'Generating routine...',

  // ── Revisión semanal (cargarRevisionSemanal) ──
  'Revisión semanal del cliente':'Weekly client review',
  'Sin sesiones registradas aún. Cuando el cliente complete entrenamientos aparecerá aquí la revisión.':'No sessions yet. Once the client completes workouts, the review will appear here.',
  'semanas analizadas':'weeks analysed',
  'Peso actual vs inicio':'Current weight vs start',
  'Sin datos de peso':'No weight data',
  'sesiones completadas':'sessions completed',
  'sesión completada':'session completed',
  'Adherencia':'Adherence',
  'Progresión de carga sugerida':'Suggested load progression',
  'Subida sugerida':'Suggested increase',
  'Bajada sugerida':'Suggested decrease',
  'Sin cambio':'No change',
  'Último entrenamiento:':'Last workout:',
  'Datos insuficientes':'Insufficient data',
  '⚡ Aplicar todos los ajustes':'⚡ Apply all adjustments',
  'ajustes aplicados':'adjustments applied',
  'Sin cambios':'No changes',

  // ── Suscripción coach (cargarSuscripcionCliente) ──
  '+ Añadir suscripción':'+ Add subscription',
  '⚠️ Vence en':'⚠️ Expires in',
  'd':'d',

  // ── Panel notificaciones ──
  'Notificaciones':'Notifications',
  'Marcar todas leídas':'Mark all read',

  // ── Mi equipo ──
  'Mi equipo':'My team',
  'Coaches de WolfMindset':'WolfMindset coaches',
  'Coaches activos':'Active coaches',
  '➕ Añadir nuevo coach':'➕ Add new coach',
  'Nombre completo':'Full name',
  'Usuario (login)':'Username (login)',
  'Contraseña':'Password',
  'Mín 6 caracteres':'Min 6 chars',
  'Email (opcional)':'Email (optional)',
  'Idioma del panel':'Panel language',
  '🇪🇸 Español':'🇪🇸 Spanish',
  '✓ Crear coach':'✓ Create coach',
  'Solo el administrador puede crear nuevos coaches.':'Only the administrator can create new coaches.',
  'Solo tú por ahora.':'Just you for now.',
  'Error cargando coaches. Actualiza el backend.':'Error loading coaches. Update the backend.',
  '🔑 Reset pass':'🔑 Reset pass',
  'Admin':'Admin',

  // ── Añadir día panel (static HTML) ──
  'Añadir día de entreno':'Add training day',
  'Nombre del día':'Day name',
  'Grupo muscular':'Muscle group',
  'Pecho + Tríceps':'Chest + Triceps',
  'Espalda + Bíceps':'Back + Biceps',
  'Hombros + Brazos':'Shoulders + Arms',
  'Full Body':'Full Body',
  'Empuje':'Push',
  'Cardio':'Cardio',
  '✓ Añadir día':'✓ Add day',
  'Cancelar':'Cancel',

  // ── Sidebar / topbar estáticos ──
  'WolfMindset · Coach':'WolfMindset · Coach',
  'Rutinas':'Routines','Solicitudes':'Requests','+ Cliente':'+ Client',

  // ── Mensajes IA / errores ──
  'Generando rutina para':'Generating routine for',
  'Rutina generada para':'Routine generated for',
  'Dieta generada para':'Diet generated for',
  'Error generando. Verifica la API key.':'Error generating. Check the API key.',
  'Escribe un mensaje...':'Write a message...',
  'Analizando perfil del cliente...':'Analysing client profile...',
  '✓ Sin contraindicaciones para este cliente':'✓ No contraindications for this client',
  '⛔':'⛔','⚠️':'⚠️',
  'NO recomendado':'NOT recommended',
  'con precaución':'with caution',
  'Sin contraindicaciones':'No contraindications',

  // ── TITLES dict (cNav topbar) ──
  'Clientes':'Clients',
  'Nuevo cliente':'New client',
  'Solicitudes pendientes':'Pending requests',
  'Crear rutina':'Create routine',
  'Crear dieta':'Create diet',
  'Asistente IA Coach':'AI Coach Assistant',
  'Mensajes':'Messages',

  // ── Panel mensajes coach ──
  'Sin mensajes aún':'No messages yet',
  'Cuando un cliente te escriba aparecerá aquí':'When a client messages you it will appear here',
  'Ver ficha':'View profile',
  'Escribe tu respuesta...':'Write your reply...',
  'escribiendo...':'typing...',
  'auto':'auto',

  // ── Análisis foto grasa ──
  'Est. body fat':'Est. body fat',
  'Grasa est.':'Est. body fat',
  'Mejora':'Improvement',
  'Revisa y edita antes de enviar':'Review and edit before sending',
  'Publicar al cliente':'Send to client',
  'Descartar':'Discard',
  'Aparecerá en las fotos del cliente como mensaje de tu coach':'Will appear on client photos as a coach message',
  '↺ Volver a analizar':'↺ Re-analyze',
  '✦ Analizar vs semana anterior':'✦ Analyze vs prev. week',
  '✦ Analizar con IA':'✦ Analyze with AI',
  'Error al analizar. Inténtalo de nuevo.':'Error analyzing. Try again.',
  '✦ Reintentar':'✦ Retry',

  // ── Suscripciones vencimiento ──
  '⚠️ Próximas a vencer':'⚠️ Expiring soon',
  '🔴 Vencidas / Canceladas':'🔴 Expired / Cancelled',

  // ── Macros barra ──
  'Macros actuales del plan':'Current plan macros',

  // ── Diagnóstico formularios ──
  'Nombre, usuario y contraseña son obligatorios.':'Name, username and password are required.',
  'La contraseña debe tener al menos 6 caracteres.':'Password must be at least 6 characters.',
  'Nueva contraseña para':'New password for',
  '(mín 6 chars):':'(min 6 chars):',
  '¿Eliminar el coach':'Delete coach',
  'Sus clientes NO se eliminarán.':'Their clients will NOT be deleted.',
  'Contraseña de':'Password for',
  'actualizada.':'updated.',

  // ── Confirmaciones ──
  '¿Eliminar?':'Delete?',
  '¿Publicar los cambios? El cliente verá la nueva rutina inmediatamente.':'Publish changes? The client will see the new routine immediately.',
  '¿Eliminar este día y todos sus ejercicios?':'Delete this day and all its exercises?',
  'Escribe qué ajuste quieres hacer':'Describe the adjustment you want',
  'El ajuste dejaría el plan sin ese macro. Reduce el cambio.':'This change would remove that macro from the plan. Reduce the amount.',
};

function tc(text) {
  if(COACH_LANG === 'es') return text;
  return COACH_TRANSLATIONS[text] || TRANSLATIONS[text] || text;
}

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
// LOGIN

async function doLogin(){
  const u=document.getElementById('lu').value.trim(),p=document.getElementById('lp').value;
  const err=document.getElementById('lerr');err.style.display='none';
  const remember=document.getElementById('rememberMe')?.checked;
  try{
    const data=await api('/auth/login',{method:'POST',body:JSON.stringify({username:u,password:p})});
    if(remember){ localStorage.setItem('wm_saved_user',u); localStorage.setItem('wm_saved_pass',p); }
    else { localStorage.removeItem('wm_saved_user'); localStorage.removeItem('wm_saved_pass'); }
    TOKEN=data.token;USER=data.user;
    // Load foto from server to ensure it's fresh
    try {
      const fotoData = await api('/mi-foto');
      if(fotoData.foto) { USER.foto_perfil = fotoData.foto; }
    } catch(e) {}
    // Si el servidor devuelve lang del coach, usarlo como COACH_LANG
    if(data.user.role==='coach' && data.user.lang) {
      COACH_LANG = data.user.lang;
      localStorage.setItem('wm_coach_lang', data.user.lang);
    }
    localStorage.setItem('wm_token',TOKEN);localStorage.setItem('wm_user',JSON.stringify(USER));
    if(USER.role==='coach'){
      show('sCoach');renderCoach('clientes');setTimeout(()=>{setCoachLang(COACH_LANG);updateCoachTopbar();},200);
      // coachMobileNav visibility handled by CSS
      // Mostrar Mi Equipo para todos los coaches
      const sniEq=document.getElementById('sni_equipo');
      if(sniEq) sniEq.style.display='flex';
      cargarNotificacionesCoach();
      iniciarSSE();
      // Auto-verificar vencimientos al entrar
      api('/suscripciones/avisar-vencimientos', {method:'POST'}).catch(()=>{});
      // Registrar push para recibir notificaciones en PC/móvil bloqueado
      setTimeout(async()=>{
        const ok = await pedirPermisoNotificaciones();
        if(ok) console.log('[Push] Coach registrado para push');
      }, 2000);
    } else {
      show('sCliente');
      await loadCD(data.user.clienteId);
      // Load coach photo for AI assistant
      api('/mi-coach/foto').then(d => {
        window._coachFoto = d.foto || null;
        window._coachNombreAsistente = d.nombre || 'Coach';
      }).catch(()=>{});
      // Verificar suscripción antes de mostrar la app
      await verificarSuscripcionCliente(data.user.clienteId);
      klNav('entreno',document.getElementById('bni0'));
      iniciarSSE();
    setTimeout(checkRecordatorios,2000);
    // Pedir permiso de notificaciones
    setTimeout(async()=>{
      const ok = await pedirPermisoNotificaciones();
      if(ok && CD){
        programarRecordatorioPeso(CD.id);
        programarRecordatorioFoto(CD.id);
      }
    }, 3000);
    }
  }catch(e){err.textContent=e.error||'Error al conectar';err.style.display='block';}
}
async function loadCD(id){
  CD = await api('/clientes/'+id);

  try {
    window.exImages = await api('/ejercicios-imagenes');
     // 🔥 NORMALIZAR NOMBRES (FIX)
window.exImagesNormalized = {};
Object.keys(window.exImages).forEach(k=>{
  window.exImagesNormalized[k.trim().toLowerCase()] = window.exImages[k];
});
  } catch(e) {
    window.exImages = window.exImages || {};
  }
}
async function verificarSuscripcionCliente(clienteId) {
  try {
    const s = await api('/clientes/'+clienteId+'/suscripcion');
    if(!s || !s.fecha_fin) return; // Sin suscripción configurada, dejar pasar

    if(s.vencida || s.estado === 'cancelada') {
      // Bloquear acceso — mostrar pantalla de suscripción vencida
      const appEl = document.getElementById('sCliente');
      if(appEl) appEl.innerHTML = `
        <div style="min-height:100vh;background:var(--b);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;text-align:center">
          <div style="font-size:56px;margin-bottom:20px">🔒</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--sv);letter-spacing:.08em;margin-bottom:8px">Acceso Suspendido</div>
          <div style="font-size:14px;color:var(--tx3);max-width:280px;line-height:1.6;margin-bottom:24px">
            Tu suscripción ${s.estado==='cancelada'?'ha sido cancelada':'venció el '+s.fecha_fin.split('-').reverse().join('/')}.<br>Contacta con tu coach para renovarla.
          </div>
          <div style="background:var(--s);border:0.5px solid var(--br);border-radius:14px;padding:16px 20px;margin-bottom:20px;width:100%;max-width:300px">
            <div style="font-size:11px;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Tu coach</div>
            <div style="font-size:15px;font-weight:700;color:var(--sv)">WolfMindset</div>
            <div style="font-size:13px;color:var(--blg);margin-top:4px">@wolfmindset</div>
          </div>
          <button onclick="doLogout()" style="background:none;border:0.5px solid var(--br);color:var(--tx3);padding:10px 20px;border-radius:10px;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif">Cerrar sesión</button>
        </div>`;
      return;
    }

    // Aviso si está próxima a vencer (≤5 días)
    if(s.proxima_a_vencer) {
      const _msgVenc = s.dias_restantes === 1
        ? `⏳ ¡Mañana vence tu suscripción! Habla con tu coach hoy mismo para renovarla y seguir entrenando sin interrupciones. 💪`
        : `⏳ Tu suscripción vence en ${s.dias_restantes} días. ¡No pierdas el ritmo! Renueva con tu coach para seguir avanzando. 💪`;
      mostrarBannerSub(_msgVenc, 'warning');
    }

    // Cargar notificaciones del cliente
    cargarNotificacionesCliente();
    // Aplicar idioma a la barra de navegación
    setTimeout(()=>applyLang(document.querySelector('#sCliente .bnav-bar')), 200);

  } catch(e) {
    console.error('Error verificando suscripción:', e);
    // Si falla la verificación, dejar entrar (no bloquear por error de red)
  }
}

function mostrarBannerSub(mensaje, tipo) {
  // Eliminar banner anterior si existe
  const prev = document.getElementById('sub_banner_cliente');
  if(prev) prev.remove();
  const banner = document.createElement('div');
  banner.id = 'sub_banner_cliente';
  const isError = tipo === 'error';
  const bg = isError ? 'rgba(239,68,68,.15)' : 'rgba(245,158,11,.13)';
  const border = isError ? 'rgba(239,68,68,.45)' : 'rgba(245,158,11,.45)';
  const color = isError ? '#fca5a5' : '#fcd34d';
  const icon = isError ? '🔴' : '⏳';
  banner.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:9999;background:${bg};border-bottom:1px solid ${border};padding:12px 16px;display:flex;align-items:center;gap:10px;backdrop-filter:blur(10px);box-shadow:0 2px 12px rgba(0,0,0,.3)`;
  banner.innerHTML = `
    <span style="font-size:18px">${icon}</span>
    <span style="font-size:12px;font-weight:600;color:${color};flex:1;line-height:1.4">${mensaje}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:${color};cursor:pointer;font-size:20px;padding:0;opacity:.7;line-height:1">×</button>`;
  document.body.prepend(banner);
  // Auto-ocultar a los 12 segundos
  setTimeout(() => { if(banner.parentElement) banner.remove(); }, 12000);
}

async function cargarNotificacionesCliente() {
  try {
    const notifs = await api('/notificaciones');
    const noLeidas = notifs.filter(n=>!n.leida);

    // Notificaciones de vencimiento: mostrar como banner
    const notifVenc = noLeidas.find(n => n.tipo === 'vencimiento_proximo' || n.tipo === 'suscripcion_vencida');
    if(notifVenc) {
      const esVencida = notifVenc.tipo === 'suscripcion_vencida';
      mostrarBannerSub(notifVenc.mensaje, esVencida ? 'error' : 'warning');
      setTimeout(()=>api('/notificaciones/'+notifVenc.id+'/leer',{method:'PUT'}).catch(()=>{}), 8000);
    }

    // Otras notificaciones no leidas (peso, foto, etc.)
    const otraNoLeida = noLeidas.find(n => n.tipo !== 'vencimiento_proximo' && n.tipo !== 'suscripcion_vencida');
    if(otraNoLeida) {
      setTimeout(()=>api('/notificaciones/'+otraNoLeida.id+'/leer',{method:'PUT'}).catch(()=>{}), 5000);
    }
  } catch(e) {}
}

function doLogout(){cerrarSSE();TOKEN=null;USER=null;CD=null;localStorage.removeItem('wm_token');localStorage.removeItem('wm_user');show('sLogin');}

// PRE-FILL SAVED CREDENTIALS
const savedUser = localStorage.getItem('wm_saved_user');
const savedPass = localStorage.getItem('wm_saved_pass');
if(savedUser){ const lu=document.getElementById('lu'); if(lu)lu.value=savedUser; }
if(savedPass){ const lp=document.getElementById('lp'); if(lp)lp.value=savedPass; }

// AUTO LOGIN
if(TOKEN&&USER){
  if(USER.role==='coach'){
    show('sCoach');renderCoach('clientes');setTimeout(()=>{setCoachLang(COACH_LANG);updateCoachTopbar();},200);
    const sniEqAuto=document.getElementById('sni_equipo');
    if(sniEqAuto) sniEqAuto.style.display='flex';
    setTimeout(checkPendientes,1000);
  } else {
    show('sCliente');
    api('/mi-coach/foto').then(d => { window._coachFoto = d.foto || null; window._coachNombreAsistente = d.nombre || 'Coach'; }).catch(()=>{});
    api('/clientes/'+USER.clienteId).then(d=>{CD=d;klNav('entreno',document.getElementById('bni0'));}).catch(()=>doLogout());
  }
}

// ═══ COACH NAV ════════════════════════════════════════
function getTitles(){return{clientes:tc('Clientes'),nuevo:tc('Nuevo cliente'),pendientes:tc('Solicitudes pendientes'),rutinas:tc('Crear rutina'),'dieta-builder':tc('Crear dieta'),progreso:tc('Progreso'),ia:tc('Asistente IA Coach'),mensajes:tc('Mensajes')};}
function cNav(s,btn){
  _coachTabActual = s;
  document.querySelectorAll('#sCoach .sni').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  document.getElementById('cTitle').textContent=getTitles()[s]||s;
  renderCoach(s);
}
function cNavM(s,btn){
  _coachTabActual = s;
  document.querySelectorAll('#coachMobileNav .bni').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  document.getElementById('cTitle').textContent=getTitles()[s]||s;
  renderCoach(s);
}

// ═══ COACH RENDER ════════════════════════════════════
async function renderCoach(s){
  const el=document.getElementById('cContent');
  if(s==='clientes'){const cl=await api('/clientes?incluir_archivados=1');window._clientesCache=cl;el.innerHTML=hClientes(cl);cargarTareasPendientes();}
  else if(s==='nuevo'){el.innerHTML=hNuevo();}
  else if(s==='rutinas'){el.innerHTML=hRutinas();await initRutinas();}
  else if(s==='dieta-builder'){el.innerHTML=hDietaBuilder();await initDietaBuilder();}
  else if(s==='progreso'){const cl=await api('/clientes');el.innerHTML=hProgreso(cl);cargarProgresoSubs();cargarDashboard();}
  else if(s==='pendientes'){const p=await api('/clientes-pendientes');el.innerHTML=hPendientes(p);}
  else if(s==='mensajes'){el.innerHTML=hMensajesCoach();coachMsgsInit();}
  else if(s==='equipo'){el.innerHTML=hEquipo();initEquipo();}
  else if(s==='ia'){
  el.innerHTML=hIACoach();
  iaH=[{role:'assistant',content:tc('Hola coach, listo. Puedo generar rutinas y dietas completas, analizar progreso y sugerir ajustes. ¿Qué necesitas?')}];
  fetch('/api/images-status').then(r=>r.json()).then(d=>{
    const btn=document.getElementById('btn_img_status');
    if(!btn)return;
    if(d.count>0){btn.textContent=`✓ ${d.count} ${COACH_LANG==='en'?'images in DB':'imágenes en BD'}`;btn.style.color='#86efac';}
    else{btn.textContent=tc('🖼️ Descargar imágenes ejercicios');}
 }).catch(()=>{});
  }
  // Re-apply static translations after every render
  setTimeout(()=>{ applyCoachLang(document.getElementById('sCoach')); applyCoachLang(document.getElementById('cContent')); },50);
}

function hClientes(cl){
  if(!cl.length)return`<div class="wm-empty-clients"><div class="wm-empty-icon">👤</div><div class="wm-empty-title">${tc('Sin clientes aún')}</div><div class="wm-empty-sub">${COACH_LANG==='en'?'Create your first client from here.':'Crea tu primer cliente desde aquí.'}</div><button class="btn" onclick="abrirNuevoClienteDesdeClientes()">${COACH_LANG==='en'?'＋ Add client':'＋ Añadir cliente'}</button></div>`;

  const coachColors = {
    [USER.id]: {bg:'rgba(59,130,246,.18)',color:'#93c5fd',label: USER.nombre||USER.username},
  };
  cl.forEach(c => {
    if(c.coach_id && !coachColors[c.coach_id]) {
      coachColors[c.coach_id] = {bg:'rgba(168,85,247,.18)',color:'#d8b4fe',label:c.coach_nombre||'Coach'};
    }
  });

  if(typeof window._clienteFilter === 'undefined') window._clienteFilter = 'todos';
  const filter = window._clienteFilter;

  const activos = cl.filter(c => !c.archivado);
  const archivados = cl.filter(c => c.archivado);
  const clFiltrados = filter === 'archivados' ? archivados :
    filter === 'todos' ? activos :
    filter === 'mios' ? activos.filter(c => !c.coach_id || c.coach_id === USER.id) :
    activos.filter(c => c.coach_id && c.coach_id !== USER.id);

  const misCls = activos.filter(c => !c.coach_id || c.coach_id === USER.id).length;
  const otrosCls = activos.filter(c => c.coach_id && c.coach_id !== USER.id).length;
  const otroCoachNombre = Object.values(coachColors).find((v,i) => i > 0)?.label || 'Partner';

  return`
  <div class="clientes-page-head">
    <div>
      <div class="clientes-title">${tc('Clientes')}</div>
      <div class="clientes-subtitle">${COACH_LANG==='en'?'Manage and add clients from this section.':'Gestiona y añade clientes desde este apartado.'}</div>
    </div>
    <button class="btn btn-sm clientes-add-btn" onclick="abrirNuevoClienteDesdeClientes()">${COACH_LANG==='en'?'＋ Add client':'＋ Añadir cliente'}</button>
  </div>

  <div id="tareas_pendientes_wrap" style="margin-bottom:4px"></div>

  <div class="clientes-stats-grid">
    <div class="clientes-stat-card"><div class="mlbl">${tc('Total')}</div><div class="mval">${activos.length}</div></div>
    <div class="clientes-stat-card stat-blue"><div class="mlbl">${tc('Míos')}</div><div class="mval">${misCls}</div></div>
    <div class="clientes-stat-card stat-purple"><div class="mlbl">${otroCoachNombre}</div><div class="mval">${otrosCls}</div></div>
  </div>

  <div class="clientes-filter-bar">
    <button class="clientes-filter ${filter==='todos'?'on':''}" onclick="filtrarClientes('todos')">${tc('Todos')}</button>
    <button class="clientes-filter blue ${filter==='mios'?'on':''}" onclick="filtrarClientes('mios')">🔵 ${tc('Míos')}</button>
    <button class="clientes-filter purple ${filter==='otros'?'on':''}" onclick="filtrarClientes('otros')">🟣 ${otroCoachNombre}</button>
    <button class="clientes-filter ${filter==='archivados'?'on':''}" onclick="filtrarClientes('archivados')">🗄️ ${tc('Archivados')} (${archivados.length})</button>
  </div>

  <div class="cc-grid clientes-card-grid">
    ${clFiltrados.map((c,i)=>{
      const a=ac(i);
      const cc=c.coach_id?coachColors[c.coach_id]:coachColors[USER.id];
      const esMio = !c.coach_id || c.coach_id === USER.id;
      const avatar = c.foto_perfil
        ? `<img src="${c.foto_perfil}" alt="${c.nombre}"/>`
        : `<span>${ini(c.nombre)}</span>`;
      return`<div class="cc cliente-card ${esMio?'own':'partner'} ${c.archivado?'archived':''}" onclick="${c.archivado?'':'verCliente('+c.id+')'}" style="${c.archivado?'opacity:.72;filter:grayscale(.25);':''}">
        <div class="cliente-coach-badge" style="background:${c.archivado?'rgba(148,163,184,.16)':cc.bg};color:${c.archivado?'#cbd5e1':cc.color}">${c.archivado?'🗄️ '+tc('Archivados'):(esMio?'🔵':'🟣')+' '+cc.label}</div>
        <div class="cliente-card-main">
          <div class="cliente-avatar" style="background:${a.bg};color:${a.tx};border-color:${esMio?'rgba(59,130,246,.45)':'rgba(168,85,247,.45)'}">${avatar}</div>
          <div class="cliente-info">
            <div class="cliente-name">${c.nombre}</div>
            <div class="cliente-meta">${tc(c.objetivo)} · ${tc(c.nivel)}</div>
          </div>
        </div>
        <div class="cliente-tags">
          <span class="badge b-sv">${tc('Sem')} ${c.semanas}</span>
          ${c.peso_actual?`<span class="badge b-bl">${c.peso_actual}kg</span>`:''}
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap" onclick="event.stopPropagation()">
          ${c.archivado
            ? `<button class="btn btn-sm" onclick="restaurarCliente(${c.id})">↩ ${tc('Restaurar')}</button>`
            : `<button class="btn btn-sm" style="background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.28);color:#fcd34d" onclick="archivarCliente(${c.id})">🗄️ ${tc('Archivar')}</button>`}
          <button class="btn btn-sm" style="background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.35);color:#fca5a5" onclick="borrarClientePermanente(${c.id})">🗑️ ${tc('Borrar permanente')}</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

async function refrescarClientesCoach(){
  const cl = await api('/clientes?incluir_archivados=1');
  window._clientesCache = cl;
  const cont = document.getElementById('cContent');
  if(cont) cont.innerHTML = hClientes(cl);
  cargarTareasPendientes();
  setTimeout(()=>{ applyCoachLang(document.getElementById('cContent')); },50);
}

async function archivarCliente(id){
  const nombre = (window._clientesCache||[]).find(c=>String(c.id)===String(id))?.nombre || 'cliente';
  const msg = COACH_LANG==='en'
    ? `Archive ${nombre}?\n\nThe client will disappear from active lists and access will be blocked, but history is kept.`
    : `¿Archivar a ${nombre}?\n\nDesaparecerá de las listas activas y se bloqueará el acceso, pero se conserva todo su historial.`;
  if(!confirm(msg)) return;
  try{
    await api('/clientes/'+id+'/archivar',{method:'PUT'});
    await refrescarClientesCoach();
  }catch(e){alert(e.error||e.message||'Error');}
}

async function restaurarCliente(id){
  try{
    await api('/clientes/'+id+'/restaurar',{method:'PUT'});
    await refrescarClientesCoach();
  }catch(e){alert(e.error||e.message||'Error');}
}

async function borrarClientePermanente(id){
  const nombre = (window._clientesCache||[]).find(c=>String(c.id)===String(id))?.nombre || 'cliente';
  const aviso = COACH_LANG==='en'
    ? `PERMANENT DELETE: ${nombre}\n\nThis deletes the client account, profile, routines, diet, photos, weight logs, check-ins, messages, subscriptions and workout history. This cannot be undone.`
    : `BORRADO PERMANENTE: ${nombre}\n\nEsto elimina cuenta, perfil, rutinas, dieta, fotos, pesos, check-ins, mensajes, suscripción e historial de entrenos. No se puede deshacer.`;
  if(!confirm(aviso)) return;
  const txt = prompt(COACH_LANG==='en'?'Type BORRAR to confirm permanent deletion:':'Escribe BORRAR para confirmar el borrado permanente:');
  if(String(txt||'').toUpperCase() !== 'BORRAR') return;
  try{
    await api('/clientes/'+id+'/permanente?confirm=BORRAR',{method:'DELETE'});
    if(window._lastClienteId===id){window._lastClienteId=null;window._coachClienteId=null;window._coachClienteActual=null;}
    await refrescarClientesCoach();
  }catch(e){alert(e.error||e.message||'Error');}
}

async function cargarTareasPendientes(){
  const wrap=document.getElementById('tareas_pendientes_wrap');
  if(!wrap)return;
  try{
    const pendientes=await api('/coach/sesiones-pendientes');
    if(!pendientes.length){wrap.innerHTML='';return;}
    const isEn=COACH_LANG==='en';
    const titulo=isEn?`📋 Pending reviews (${pendientes.length})`:`📋 Pendientes de revisar (${pendientes.length})`;
    const items=pendientes.map(s=>{
      const fecha=new Date(s.fecha);
      const mins=Math.floor((Date.now()-fecha.getTime())/60000);
      const haceStr=mins<60?(isEn?`${mins}m ago`:`hace ${mins}m`):mins<1440?(isEn?`${Math.floor(mins/60)}h ago`:`hace ${Math.floor(mins/60)}h`):(isEn?`${Math.floor(mins/1440)}d ago`:`hace ${Math.floor(mins/1440)}d`);
      const ini=s.cliente_nombre?s.cliente_nombre.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase():'?';
      return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--s2);border-radius:10px;margin-bottom:6px;cursor:pointer" onclick="verCliente(${s.cliente_id});setTimeout(()=>switchClienteTab('progreso',document.querySelector('.ctab[onclick*=progreso]')),600)">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(59,130,246,.18);color:#93c5fd;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;overflow:hidden">${s.foto_perfil?`<img src="${s.foto_perfil}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`:ini}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:700;color:var(--sv);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.cliente_nombre}</div>
          <div style="font-size:11px;color:var(--tx3)">🏋️ ${s.dia_nombre}${s.dia_grupo?' · '+s.dia_grupo:''} · ${s.num_series} ${isEn?'sets':'series'} · ${haceStr}</div>
        </div>
        <button onclick="event.stopPropagation();marcarSesionRevisada(${s.id},this)" style="flex-shrink:0;padding:6px 10px;background:rgba(34,197,94,.12);border:0.5px solid rgba(34,197,94,.3);border-radius:8px;color:var(--gnb);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">✓ ${isEn?'Mark reviewed':'Revisar'}</button>
      </div>`;
    }).join('');
    wrap.innerHTML=`<div style="background:var(--s);border:0.5px solid rgba(245,158,11,.25);border-radius:14px;padding:14px;margin-bottom:4px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:12px;font-weight:700;color:var(--amb);text-transform:uppercase;letter-spacing:.07em">${titulo}</div>
        <button onclick="cargarTareasPendientes()" style="background:none;border:none;color:var(--tx3);font-size:11px;cursor:pointer;font-family:inherit">↺</button>
      </div>${items}
      <div style="font-size:10px;color:var(--tx3);margin-top:6px;text-align:center">${isEn?'Click to review in Progress tab':'Pulsa para revisar en tab Progreso'}</div>
    </div>`;
  }catch(e){const w=document.getElementById('tareas_pendientes_wrap');if(w)w.innerHTML='';}
}

async function marcarSesionRevisada(sesionId,btn){
  if(btn){btn.disabled=true;btn.textContent='...';}
  try{
    await api('/sesiones/'+sesionId+'/revisar',{method:'PUT'});
    const fila=btn?.closest('[style*="cursor:pointer"]');
    if(fila){fila.style.transition='opacity .3s';fila.style.opacity='0';setTimeout(()=>{fila.remove();const w=document.getElementById('tareas_pendientes_wrap');if(w&&!w.querySelector('[onclick*="verCliente"]'))w.innerHTML='';},300);}
  }catch(e){if(btn){btn.disabled=false;btn.textContent='✓';}}
}


function filtrarClientes(filtro){
  window._clienteFilter = filtro;
  // Re-renderizar con el mismo listado en cache
  if(window._clientesCache) {
    document.getElementById('cContent').innerHTML = hClientes(window._clientesCache);
  }
}

function abrirNuevoClienteDesdeClientes(){
  const title=document.getElementById('cTitle');
  if(title) title.textContent=tc('Clientes');
  const el=document.getElementById('cContent');
  if(!el) return;
  el.innerHTML = `<div class="back-lnk" onclick="renderCoach('clientes')"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>${COACH_LANG==='en'?'Back to clients':'Volver a clientes'}</div>` + hNuevo();
  setTimeout(()=>{ applyCoachLang(document.getElementById('cContent')); },50);
}

async function verCliente(id){
  const c=await api('/clientes/'+id); window._coachClienteActual=c; window._coachClienteId=id; window._lastClienteId=id; const a=ac(0);
  const esMio = !c.coach_id || c.coach_id === USER.id;
  const coachBadgeColor = esMio ? '#93c5fd' : '#d8b4fe';
  const coachBadgeBg = esMio ? 'rgba(59,130,246,.15)' : 'rgba(168,85,247,.15)';
  const coachBadgeBorder = esMio ? 'rgba(59,130,246,.3)' : 'rgba(168,85,247,.3)';
  const coachNombre = c.coach_nombre || (esMio ? (USER.nombre||USER.username) : 'Coach');
  document.getElementById('cContent').innerHTML=`


  <div class="back-lnk" onclick="renderCoach('clientes')"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>${tc('Volver')}</div>
  <div class="fl" style="margin-bottom:14px;align-items:flex-start">
    <div class="av" style="width:50px;height:50px;font-size:17px;background:${a.bg};color:${a.tx};border-color:${esMio?'rgba(59,130,246,.4)':'rgba(168,85,247,.4)'};margin-right:12px;overflow:hidden;padding:0">${c.foto_perfil?`<img src="${c.foto_perfil}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`:`<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">${ini(c.nombre)}</span>`}</div>
    <div style="flex:1">
      <div style="font-size:17px;font-weight:700;color:var(--sv)">${c.nombre}</div>
      <div style="font-size:12px;color:var(--tx3);margin-top:2px">${tc(c.objetivo)} · ${tc(c.nivel)} · ${tc('Semana')} ${c.semanas}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
        <span style="background:${coachBadgeBg};color:${coachBadgeColor};border:0.5px solid ${coachBadgeBorder};font-size:10px;font-weight:700;padding:3px 9px;border-radius:10px">${esMio?'🔵':'🟣'} ${coachNombre}</span>
        <button onclick="reasignarCoach(${c.id})" style="background:none;border:0.5px solid var(--br);color:var(--tx3);font-size:10px;padding:3px 8px;border-radius:8px;cursor:pointer;font-family:inherit">${tc('Reasignar')}</button>
      </div>
    </div>
  </div>
  
  <!-- TABS NAV -->
  <div class="ctab-bar">
    <button class="ctab on" onclick="switchClienteTab('resumen',this)">${tc('📋 Resumen')}</button>
    <button class="ctab" onclick="switchClienteTab('entreno',this)">${tc('🏋️ Rutina')}</button>
    <button class="ctab" onclick="switchClienteTab('historial',this)">${tc('📊 Historial')}</button>
    <button class="ctab" onclick="switchClienteTab('dieta',this)">${tc('🥗 Dieta')}</button>
    <button class="ctab" onclick="switchClienteTab('progreso',this)">${tc('📈 Progreso')}</button>
  </div>

  <!-- TAB: RESUMEN -->
  <div class="ctab-panel on" id="ctab_resumen">
    <div class="g2" style="margin-bottom:12px">
    <div class="sec"><div class="sec-hdr">${tc('Macros internos')} <span style="color:#f87171;font-size:9px">${tc('SOLO COACH')}</span></div>${mb2('Prot','#3b82f6',c.prot,c.prot*4,c.kcal_internas)}${mb2('Carbs','#a78bfa',c.carbs,c.carbs*4,c.kcal_internas)}${mb2(COACH_LANG==='en'?'Fat':'Grasa','#f97316',c.fat,c.fat*9,c.kcal_internas)}<div style="font-size:11px;color:var(--tx3);margin-top:4px">${c.kcal_internas} ${tc('kcal/día')}</div></div>
    <div class="sec"><div class="sec-hdr">${COACH_LANG==='en'?'Weight':'Peso'}</div>${c.pesos.slice(-4).map((p,i)=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:0.5px solid var(--br)"><span style="font-size:12px;color:var(--tx3)">${tc('Sem')} ${i+1}</span><span style="font-size:13px;color:var(--sv);font-weight:700">${p.peso}kg</span></div>`).join('')||`<div style="font-size:12px;color:var(--tx3)">${tc('Sin registros')}</div>`}</div>
  </div>
  
    <div class="sec" style="margin-bottom:12px" id="coach_sub_sec">
    <div class="sec-hdr">💳 ${tc('Suscripción')} <span id="coach_sub_badge"></span></div>
    <div id="coach_sub_info"><div style="font-size:13px;color:var(--tx3)">${tc('Cargando...')}</div></div>
    <div id="coach_sub_form" style="display:none;margin-top:12px;padding-top:12px;border-top:0.5px solid var(--br)">
      <div class="g2" style="gap:8px;margin-bottom:8px">
        <div>
          <div class="form-lbl">${tc('Duración')}</div>
          <select id="sub_meses" class="inp" style="margin-bottom:0">
            <option value="1">${tc('1 mes')}</option>
            <option value="2">${tc('2 meses')}</option>
            <option value="3">${tc('3 meses')}</option>
            <option value="6">${tc('6 meses')}</option>
            <option value="12">${tc('12 meses')}</option>
          </select>
        </div>
        <div>
          <div class="form-lbl">${tc('Precio (€)')}</div>
          <input type="number" id="sub_precio" class="inp" placeholder="${COACH_LANG==='en'?'E.g. 80':'Ej: 80'}" style="margin-bottom:0"/>
        </div>
      </div>
      <textarea id="sub_notas" class="ta" placeholder="${tc('Notas internas (opcional)')}" style="min-height:50px;margin-bottom:8px"></textarea>
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;padding:10px;background:var(--gn)" onclick="renovarSuscripcion(${c.id})">✓ ${tc('Activar / Renovar')}</button>
        <button class="btn" style="padding:10px;background:rgba(239,68,68,.15);color:#fca5a5;border:0.5px solid rgba(239,68,68,.3)" onclick="cancelarSuscripcion(${c.id})">${tc('Cancelar')}</button>
      </div>
    </div>
  </div>
  
    <div class="sec" style="margin-bottom:12px">
    <div class="sec-hdr">${tc('Datos personales del cliente')}</div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="form-lbl">${tc('Peso (kg)')}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${c.peso_actual?c.peso_actual+'kg':tc('Sin datos')}</div></div>
      <div><div class="form-lbl">${tc('Altura')}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${c.altura?c.altura+'cm':tc('Sin datos')}</div></div>
      <div><div class="form-lbl">${tc('Edad')}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${c.edad?c.edad+' '+tc('años'):tc('Sin datos')}</div></div>
      <div><div class="form-lbl">${tc('Sexo')}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${c.sexo?tc(c.sexo):tc('Sin datos')}</div></div>
      <div><div class="form-lbl">${tc('Actividad')}</div><div style="font-size:13px;font-weight:600;color:var(--sv2)">${c.actividad?tc(c.actividad):tc('Sin datos')}</div></div>
      <div><div class="form-lbl">${tc('Cintura/Cadera')}</div><div style="font-size:13px;font-weight:600;color:var(--sv2)">${c.cintura_actual?fmtCintura(c.cintura_actual)+' / '+(c.cadera?fmtCintura(c.cadera):'—'):tc('Sin datos')}</div></div>
    </div>
    ${c.lesiones?`<div style="background:rgba(239,68,68,.08);border:0.5px solid rgba(239,68,68,.2);border-radius:8px;padding:8px 11px;font-size:12px;color:#fca5a5;margin-top:8px">⚠️ <span style="font-weight:700">${tc('Lesiones:')}</span> ${c.lesiones}</div>`:''}
    ${c.dieta_tipo&&c.dieta_tipo!=='Omnivoro'?`<div style="background:rgba(34,197,94,.08);border:0.5px solid rgba(34,197,94,.2);border-radius:8px;padding:8px 11px;font-size:12px;color:var(--gnb);margin-top:6px">🥗 <span style="font-weight:700">${tc('Dieta:')}</span> ${tc(c.dieta_tipo)}</div>`:''}
    ${c.alimentos_no?`<div style="background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.2);border-radius:8px;padding:8px 11px;font-size:12px;color:var(--amb);margin-top:6px">🚫 <span style="font-weight:700">${tc('No come:')}</span> ${c.alimentos_no}</div>`:''}
    ${c.observaciones?`<div style="background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.2);border-radius:8px;padding:8px 11px;font-size:12px;color:var(--amb);margin-top:6px">📝 <span style="font-weight:700">${tc('Obs:')}</span> ${c.observaciones}</div>`:''}
  </div>
  <div class="sec" style="margin-botto
    m:12px" id="ajustar_datos_form">
    <div class="sec-hdr">${tc('Ajustar datos')} <button class="btn btn-sm" id="btn_guardar_datos" data-cliente-id="${c.id}" onclick="guardarDatos(${c.id})">${tc('Guardar')}</button></div>
    <div class="g2" style="gap:8px;margin-bottom:10px">
      <div><div class="form-lbl">${tc('Objetivo')}</div><input class="inp" id="obj" value="${c.objetivo}" oninput="recalcularYGuardarCoach()" style="margin-bottom:0"/></div>
      <div><div class="form-lbl">${tc('Nivel')}</div><select class="inp" id="niv" onchange="autoGuardarMacrosCoach()" style="margin-bottom:0"><option ${c.nivel==='Principiante'?'selected':''}>${tc('Principiante')}</option><option ${c.nivel==='Intermedio'?'selected':''}>${tc('Intermedio')}</option><option ${c.nivel==='Avanzado'?'selected':''}>${tc('Avanzado')}</option></select></div>
    </div>
    <div style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-size:10px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">${tc('Calculadora de macros — ajusta y se recalcula solo')} <button type="button" onclick="recalcularYGuardarCoach()" style="float:right;background:rgba(34,197,94,.15);border:0.5px solid rgba(34,197,94,.35);color:var(--gnb);border-radius:8px;padding:5px 9px;font-size:10px;font-weight:800;cursor:pointer">${tc('Recalcular')}</button></div>
      <div class="g2" style="gap:8px;margin-bottom:10px">
        <div><div class="form-lbl">${tc('Kcal totales')}</div><input class="inp" id="kcal" type="number" value="${c.kcal_internas}" oninput="recalcMacros('kcal');autoGuardarMacrosCoach()" style="margin-bottom:0;color:var(--blg);font-weight:700"/></div>
        <div><div class="form-lbl" style="display:flex;justify-content:space-between">${tc('Proteína (g)')} <span style="color:var(--sv3);font-weight:400" id="prot_kcal">${c.prot*4} kcal</span></div><input class="inp" id="prot" type="number" value="${c.prot}" oninput="recalcMacros('prot');autoGuardarMacrosCoach()" style="margin-bottom:0"/></div>
        <div><div class="form-lbl" style="display:flex;justify-content:space-between">${tc('Grasas (g)')} <span style="color:var(--sv3);font-weight:400" id="fat_kcal">${c.fat*9} kcal</span></div><input class="inp" id="fat" type="number" value="${c.fat}" oninput="recalcMacros('fat');autoGuardarMacrosCoach()" style="margin-bottom:0"/></div>
        <div><div class="form-lbl" style="display:flex;justify-content:space-between">${tc('Carbos (g)')} <span style="color:var(--sv3);font-weight:400" id="carbs_kcal">${c.carbs*4} kcal</span></div><input class="inp" id="carbs" type="number" value="${c.carbs}" oninput="recalcMacros('carbs');autoGuardarMacrosCoach()" style="margin-bottom:0;background:rgba(37,99,235,.05);border-color:rgba(59,130,246,.3)"/></div>
      </div>
      <div style="height:8px;background:var(--s3);border-radius:4px;overflow:hidden;margin-bottom:6px" id="macro_bar">
        <div style="height:100%;display:flex">
          <div id="bar_prot" style="background:#3b82f6;transition:.3s" title="Proteína"></div>
          <div id="bar_fat" style="background:#f97316;transition:.3s" title="Grasas"></div>
          <div id="bar_carbs" style="background:#a78bfa;transition:.3s" title="Carbos"></div>
        </div>
      </div>
      <div style="display:flex;gap:10px;font-size:10px;color:var(--tx3)">
        <span>🔵 ${tc('Prot')} <span id="prot_pct">${Math.round(c.prot*4/c.kcal_internas*100)}%</span></span>
        <span>🟠 ${tc('Grasa')} <span id="fat_pct">${Math.round(c.fat*9/c.kcal_internas*100)}%</span></span>
        <span>🟣 ${tc('Carbos')} <span id="carbs_pct">${Math.round(c.carbs*4/c.kcal_internas*100)}%</span></span>
      </div>
    </div>
    <div class="form-lbl" style="margin-top:8px">${tc('Comida libre')}</div><input class="inp" id="clibre" value="${c.comida_libre||''}"/>
    <div class="form-lbl">${COACH_LANG==='en'?'Motivational message':'Mensaje motivacional'}</div><textarea class="ta" id="msgsem">${c.mensaje_semana||''}</textarea>
    <div class="form-lbl">${COACH_LANG==='en'?'Coach notes (private)':'Notas coach'}</div><textarea class="ta" id="notasc">${c.notas_coach||''}</textarea>
    <!-- Reseteo de contraseña -->
    <div style="margin-top:14px;padding-top:14px;border-top:0.5px solid var(--br)">
      <div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">${tc('🔑 Contraseña del cliente')}</div>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="inp" id="nueva_pass_${c.id}" type="password" placeholder="${tc('Nueva contraseña (mín. 4 caracteres)')}" style="margin-bottom:0;flex:1"/>
        <button onclick="resetearContrasena(${c.id})" class="btn btn-sm" style="flex-shrink:0;white-space:nowrap;background:var(--bl2);color:#fff">${tc('Guardar')}</button>
      </div>
      <div id="reset_msg_${c.id}" style="font-size:11px;margin-top:6px;height:16px"></div>
    </div>
  </div>
  <!-- ESTADO RÁPIDO: peso + último entreno -->
  <div class="g2" style="margin-bottom:12px;gap:12px">
    <div class="sec">
      <div class="sec-hdr">⚖️ ${COACH_LANG==='en'?'Weight evolution':'Evolución de peso'}</div>
      <div id="coach_peso_evolucion"><div style="font-size:13px;color:var(--tx3)">${tc('Sin registros')}</div></div>
    </div>
    <div class="sec">
      <div class="sec-hdr">🏋️ ${COACH_LANG==='en'?'Last workout':'Último entreno'}</div>
      <div id="resumen_ultimo_entreno"><div style="font-size:13px;color:var(--tx3)">${tc('Cargando...')}</div></div>
    </div>
  </div>
  </div>

  <!-- TAB: ENTRENO -->
  <div class="ctab-panel" id="ctab_entreno">
    <!-- EDITOR INLINE DE RUTINA -->
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-hdr">🏋️ ${COACH_LANG==='en'?'Assigned routine':'Rutina asignada'}
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" onclick="tabEntrenoNuevoDia(${c.id})" style="font-size:11px">${tc('+ Día')}</button>
        </div>
      </div>
      <div id="tab_entreno_dias">
        ${c.dias.length ? c.dias.map((d,di)=>`
          <div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;margin-bottom:8px;overflow:hidden">
            <div onclick="tabEntrenoToggleDia(${d.id})" style="padding:11px 13px;display:flex;align-items:center;justify-content:space-between;cursor:pointer">
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--sv)">${d.nombre}</div>
                <div style="font-size:11px;color:var(--tx3);margin-top:1px">${tc(d.grupo)||d.grupo} · ${d.ejercicios.length} ${COACH_LANG==='en'?'exercises':'ejercicios'}</div>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <button onclick="event.stopPropagation();tabEntrenoAddEx(${d.id},'${d.nombre.replace((/'/g,String.fromCharCode(39)))}')" class="btn btn-sm" style="font-size:11px">${tc('+ Ejercicio')}</button>
                <button onclick="event.stopPropagation();tabEntrenoDelDia(${d.id})" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:14px;padding:4px">🗑</button>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="color:var(--tx3);flex-shrink:0"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </div>
            </div>
            <div id="tab_dia_body_${d.id}" style="display:none;padding:0 13px 12px">
             ${d.ejercicios.length ? d.ejercicios.map((e,ei)=>`
  <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:0.5px solid var(--br)">
    <div style="display:flex;flex-direction:column;gap:4px">
      <button onclick="event.stopPropagation();tabMoveEx(${c.id},${d.id},${ei},-1)" style="width:26px;height:22px;background:rgba(255,255,255,.06);border:0.5px solid var(--br);border-radius:6px;color:var(--tx);cursor:pointer">↑</button>
      <button onclick="event.stopPropagation();tabMoveEx(${c.id},${d.id},${ei},1)" style="width:26px;height:22px;background:rgba(255,255,255,.06);border:0.5px solid var(--br);border-radius:6px;color:var(--tx);cursor:pointer">↓</button>
    </div>

    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:700;color:var(--sv)">${e.nombre}</div>
      <div style="font-size:11px;color:var(--tx3);margin-top:1px">${e.series}×${e.reps}${e.peso_objetivo>0?' · '+e.peso_objetivo+'kg':''} · ${e.descanso}s${e.rir!=null?' · RIR'+e.rir:''}${e.es_principal?' ⭐':''}</div>
      ${e.nota_coach?`<div style="font-size:10px;color:var(--amb);margin-top:2px">📝 ${e.nota_coach}</div>`:''}
    </div>

    <button onclick="tabEntrenoEditEx(${e.id})" style="background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);border-radius:6px;color:var(--blg);cursor:pointer;font-size:11px;padding:5px 8px;font-weight:600;white-space:nowrap">${tc('✏️ Editar')}</button>
    <button onclick="tabEntrenoDelEx(${e.id},${d.id})" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:15px;padding:4px">✕</button>
  </div>`).join('')
              : `<div style="font-size:12px;color:var(--tx3);padding:8px 0">${tc('Sin ejercicios aún.')}</div>`}
            </div>
          </div>`).join('')
        : `<div style="font-size:13px;color:var(--tx3)">${tc('Sin días. Pulsa + Día para empezar.')}</div>`}
      </div>
    </div>

    <!-- PANEL EDITAR EJERCICIO (inline) -->
    <div id="tab_ex_edit_panel" style="display:none">
      <div class="sec" style="margin-bottom:12px;border-color:rgba(59,130,246,.25)">
        <div class="sec-hdr">${tc('✏️ Editar')} <button onclick="document.getElementById('tab_ex_edit_panel').style.display='none'" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:13px;font-weight:600">✕ ${tc('Cancelar')}</button></div>
        <div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:10px" id="tab_ex_edit_nombre"></div>
        <div class="g2" style="gap:8px;margin-bottom:8px">
          <div><div class="form-lbl">${tc('Series')}</div><input type="number" id="tab_ex_series" class="inp" style="margin-bottom:0"/></div>
          <div><div class="form-lbl">${tc('Reps')}</div><input id="tab_ex_reps" class="inp" style="margin-bottom:0" placeholder="10-12"/></div>
          <div><div class="form-lbl">${tc('Peso obj.')} (${COACH_LANG==='en'?'lb':'kg'})</div><input type="number" id="tab_ex_peso" class="inp" style="margin-bottom:0" step="0.5"/></div>
          <div><div class="form-lbl">${tc('Descanso (s)')}</div><input type="number" id="tab_ex_descanso" class="inp" style="margin-bottom:0"/></div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--sv2);cursor:pointer">
            <input type="checkbox" id="tab_ex_rir_on" onchange="document.getElementById('tab_ex_rir_wrap').style.display=this.checked?'block':'none'"/>
            ${COACH_LANG==='en'?'Use RIR':'Usar RIR'}
          </label>
          <div id="tab_ex_rir_wrap" style="display:none;flex:1">
            <input type="number" id="tab_ex_rir" class="inp" style="margin-bottom:0;width:80px" min="0" max="5" placeholder="2"/>
          </div>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--amb);cursor:pointer">
            <input type="checkbox" id="tab_ex_principal"/>
            ⭐ ${tc('Principal')}
          </label>
        </div>
        <div class="form-lbl">${COACH_LANG==='en'?'Note to client':'Nota al cliente'}</div>
        <textarea id="tab_ex_nota" class="ta" placeholder="${COACH_LANG==='en'?'E.g. Control the descent 3 seconds...':'Ej: Controla la bajada en 3 segundos...'}" style="min-height:55px;margin-bottom:10px"></textarea>
        <button onclick="tabEntrenoGuardarEx()" class="btn" style="width:100%;padding:11px;background:var(--bl2)">✓ ${tc('Guardar cambios')}</button>
      </div>
    </div>
  
  </div>

  <!-- TAB: HISTORIAL -->
  <div class="ctab-panel" id="ctab_historial">
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-hdr">
        📊 ${COACH_LANG==='en'?'Workout history':'Historial de entrenos'}
        <span id="sesiones_count2" style="color:var(--tx3);font-weight:400;text-transform:none;letter-spacing:0;font-size:11px"></span>
      </div>
      <div id="sesiones_wrap2"><div style="font-size:13px;color:var(--tx3);padding:20px;text-align:center">${tc('Cargando...')}</div></div>
    </div>

  </div>

  <!-- TAB: DIETA -->
  <div class="ctab-panel" id="ctab_dieta">
    <div class="sec" style="margin-bottom:12px;border-color:rgba(59,130,246,.2)">
    <div class="sec-hdr">🥗 ${COACH_LANG==='en'?'Assigned diet':'Dieta asignada'}
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm" id="btn_editar_dieta_coach" onclick="toggleEditarDietaCoach()">${tc('✏️ Editar')}</button>
        <button class="btn btn-sm" style="background:rgba(239,68,68,.15);color:#fca5a5;border:0.5px solid rgba(239,68,68,.3)" onclick="borrarDietaCoach()">🗑</button>
      </div>
    </div>
    <div id="coach_dieta_view">
      ${c.comidas.length ? c.comidas.map((m,mi)=>{
        const itemsHtml = (m.items||[]).map(it=>
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:0.5px solid rgba(39,39,42,.4)">'+
          '<span style="font-size:12px;color:var(--sv2)">'+it.nombre+'</span>'+
          '<span style="font-size:12px;font-weight:700;color:var(--blg)">'+(it.gramos||0)+'g</span>'+
          '</div>'
        ).join('');
        return '<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:10px 12px;margin-bottom:7px">'+
          '<div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:6px">'+(['☀️','🕐','🍽️','🌅','🌙','🥗'][mi]||'🍽️')+' '+m.nombre+'</div>'+
          itemsHtml+
          '</div>';
      }).join('')
      : `<div style="font-size:13px;color:var(--tx3)">${tc('Sin dieta asignada. Usa el Creador de Dieta IA.')}</div>`}
    </div>
    <div id="coach_dieta_edit" style="display:none"></div>
  </div>
  
  </div>

  <!-- TAB: PROGRESO -->
  <div class="ctab-panel" id="ctab_progreso">
    <!-- FOTOS DE PROGRESO DEL CLIENTE -->
  <div class="sec" style="margin-bottom:12px">
    <div class="sec-hdr">📸 ${tc('Fotos de progreso')}</div>
    <div id="coach_fotos_timeline">${tc('Cargando...')}</div>
  </div>

  
    <div class="sec" style="margin-bottom:12px;background:linear-gradient(135deg,rgba(37,99,235,.06),rgba(17,17,19,.8));border-color:rgba(59,130,246,.2)">
    <div class="sec-hdr">📋 ${tc('Revisión semanal')} <span id="rev_estado" style="font-size:10px;font-weight:500;color:var(--tx3);text-transform:none;letter-spacing:0"></span></div>
    <div id="revision_semanal_content"><div style="font-size:13px;color:var(--tx3)">${tc('Cargando...')}</div></div>
  </div>
    <!-- MÉTRICAS AVANZADAS: 1RM + PRs + TONELAJE -->
    <div id="metricas_avanzadas_wrap"></div>
  </div>`;

  window._cid=c.id;

  // Tab Resumen: cargar suscripción y macros
  cargarSuscripcionCliente(id);
  setTimeout(()=>{ aplicarMacrosCoach(c, true); }, 200);

  // Peso evolución + último entreno (tab Resumen)
  const pesoWrap = document.getElementById('coach_peso_evolucion');
  if(pesoWrap && c.pesos.length) {
    pesoWrap.innerHTML = c.pesos.slice(-8).map((p,i,arr)=>{
      const prev = arr[i-1];
      const tendencia = prev ? (p.peso > prev.peso ? '<span style="color:#f87171">▲</span>' : '<span style="color:#86efac">▼</span>') : '';
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:0.5px solid var(--br)">'+
        `<span style="font-size:12px;color:var(--tx3)">${COACH_LANG==='en'?'Wk':'Sem'} ${i+1}</span>`+
        tendencia+
        '<span style="font-size:14px;font-weight:700;color:var(--sv)">'+p.peso+'kg</span>'+
        (p.grasa ? '<span style="font-size:11px;color:var(--tx3)">'+p.grasa+'% '+( COACH_LANG==='en'?'fat':'grasa')+'</span>' : '')+
        (p.cintura ? '<span style="font-size:11px;color:var(--tx3)">'+p.cintura+'cm</span>' : '')+
        '</div>';
    }).join('');
  }
  // Último entreno (tab Resumen)
  const ultWrap = document.getElementById('resumen_ultimo_entreno');
  if(ultWrap) {
    api('/clientes/'+id+'/sesiones').then(sesiones=>{
      if(!sesiones.length){ ultWrap.innerHTML=`<div style="font-size:13px;color:var(--tx3)">${tc('Sin entrenos aún.')}</div>`; return; }
      const s = sesiones[0];
      const incompleto = s.estado === 'incompleto';
      const fecha = new Date(s.fecha).toLocaleDateString(COACH_LANG==='en'?'en-GB':'es-ES',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
      const durStr = s.duracion_min ? ' · '+s.duracion_min+' min' : '';
      const valoracion = s.valoracion || '';
      ultWrap.innerHTML =
        '<div style="background:var(--s2);border:0.5px solid '+(incompleto?'rgba(245,158,11,.3)':'rgba(34,197,94,.2)')+';border-radius:10px;padding:11px 13px">'+
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
          '<div><div style="font-size:14px;font-weight:700;color:var(--sv)">'+s.dia_nombre+'</div>'+
          '<div style="font-size:11px;color:var(--blg);font-weight:600">'+tc(s.dia_grupo||'')+'</div>'+
          '<div style="font-size:11px;color:var(--tx3);margin-top:2px">'+fecha+durStr+'</div></div>'+
          '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">'+
            (incompleto ? '<span class="badge" style="background:rgba(245,158,11,.15);color:var(--amb);border:0.5px solid rgba(245,158,11,.3)">⚠ '+tc('Incompleto')+'</span>' : '<span class="badge b-gn">✓ '+(COACH_LANG==='en'?'Done':'Hecho')+'</span>')+
            (valoracion ? '<span style="font-size:20px">'+valoracion.split(' ')[0]+'</span>' : '')+
          '</div>'+
        '</div>'+
        '<div style="font-size:11px;color:var(--tx3);margin-top:8px">'+s.series.length+' series · '+[...new Set(s.series.map(sr=>sr.ejercicio_nombre))].length+' ejercicios</div>'+
        '</div>';
    }).catch(()=>{ if(ultWrap) ultWrap.innerHTML=''; });
  }
}

// ═══ EDITOR ENTRENO INLINE (tab Entreno del perfil) ═════════════
let _tabExEditId = null;

function tabEntrenoToggleDia(diaId) {
  const body = document.getElementById('tab_dia_body_' + diaId);
  if(!body) return;
  body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

async function tabEntrenoNuevoDia(clienteId) {
  const nombre = prompt(COACH_LANG==='en'?'Day name (e.g. Day A, Push, Monday...):':'Nombre del día (ej: Día A, Empuje, Lunes...):')
  if(!nombre) return;
  const grupo = prompt(COACH_LANG==='en'?'Muscle group (e.g. Chest/Shoulder/Triceps, Legs...):':'Grupo muscular (ej: Pecho/Hombro/Tríceps, Piernas...):') || 'General';
  await api('/clientes/'+clienteId+'/dias', {
    method:'POST', body:JSON.stringify({nombre, grupo, orden: 0})
  });
  const c = await api('/clientes/'+clienteId);
  window._coachClienteActual = c;
  // Re-renderizar tab
  switchClienteTab('entreno', document.querySelector('.ctab[onclick*="entreno"]'));
  verCliente(clienteId);
}

async function tabEntrenoDelDia(diaId) {
  if(!confirm(tc('¿Eliminar este día y todos sus ejercicios?'))) return;
  await api('/dias/'+diaId, {method:'DELETE'});
  const clienteId = window._coachClienteId;
  const c = await api('/clientes/'+clienteId);
  window._coachClienteActual = c;
  verCliente(clienteId);
}

function tabEntrenoAddEx(diaId, diaNombre) {
  // Reusar el sistema de rutinas existente
  rbState.clienteId = window._coachClienteId;
  rbState.diaId = diaId;
  rbState.diaNombre = diaNombre;
  // Redirigir a pantalla de rutinas con el cliente ya seleccionado
  cNav('rutinas', document.querySelector('#sCoach .sni:nth-child(2)'));
}

function tabEntrenoEditEx(exId) {
  _tabExEditId = exId;
  const panel = document.getElementById('tab_ex_edit_panel');
  if(!panel) return;
  panel.style.display = 'block';
  panel.scrollIntoView({behavior:'smooth'});

  api('/ejercicios/'+exId).then(e => {
    document.getElementById('tab_ex_edit_nombre').textContent = e.nombre;
    document.getElementById('tab_ex_series').value = e.series || 3;
    document.getElementById('tab_ex_reps').value = e.reps || '10-12';
    document.getElementById('tab_ex_peso').value = e.peso_objetivo || 0;
    document.getElementById('tab_ex_descanso').value = e.descanso || 90;
    const conRir = e.rir != null;
    document.getElementById('tab_ex_rir_on').checked = conRir;
    document.getElementById('tab_ex_rir_wrap').style.display = conRir ? 'block' : 'none';
    document.getElementById('tab_ex_rir').value = e.rir != null ? e.rir : 2;
    document.getElementById('tab_ex_principal').checked = !!e.es_principal;
    document.getElementById('tab_ex_nota').value = e.nota_coach || '';
  }).catch(e => alert('Error cargando ejercicio: ' + e.message));
}

async function tabEntrenoGuardarEx() {
  if(!_tabExEditId) return;
  const btn = event.target;
  btn.textContent = '⏳ Guardando...'; btn.disabled = true;
  try {
    await api('/ejercicios/'+_tabExEditId, {
      method: 'PUT',
      body: JSON.stringify({
        series:    parseInt(document.getElementById('tab_ex_series').value) || 3,
        reps:      document.getElementById('tab_ex_reps').value || '10-12',
        peso_objetivo: parseFloat(document.getElementById('tab_ex_peso').value) || 0,
        descanso:  parseInt(document.getElementById('tab_ex_descanso').value) || 90,
        rir:       document.getElementById('tab_ex_rir_on').checked
                     ? (parseInt(document.getElementById('tab_ex_rir').value) || 2)
                     : null,
        es_principal: document.getElementById('tab_ex_principal').checked ? 1 : 0,
        nota_coach: document.getElementById('tab_ex_nota').value || ''
      })
    });
    // Recargar cliente y re-renderizar tab
    const c = await api('/clientes/'+window._coachClienteId);
    window._coachClienteActual = c;
    btn.textContent = '✓ Guardado';
    setTimeout(() => {
      document.getElementById('tab_ex_edit_panel').style.display = 'none';
      btn.textContent = '✓ Guardar cambios'; btn.disabled = false;
      _tabExEditId = null;
      // Actualizar el div del día sin recargar todo
      const diaId = c.dias.find(d => d.ejercicios.some(e => e.id === parseInt(document.getElementById('tab_ex_edit_nombre').dataset?.exid || _tabExEditId)))?.id;
      verCliente(window._coachClienteId);
    }, 800);
  } catch(e) {
    alert('Error: ' + e.message);
    btn.textContent = '✓ Guardar cambios'; btn.disabled = false;
  }
}

async function tabEntrenoDelEx(exId, diaId) {
  if(!confirm('¿Eliminar este ejercicio?')) return;
  await api('/ejercicios/'+exId, {method:'DELETE'});
  const c = await api('/clientes/'+window._coachClienteId);
  window._coachClienteActual = c;
  verCliente(window._coachClienteId);
}

// ═══ TABS PERFIL CLIENTE ═════════════════════════════════════════
function switchClienteTab(tab, btn) {
  // Activar botón
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('on'));
  if(btn) btn.classList.add('on');

  // Mostrar panel
  document.querySelectorAll('.ctab-panel').forEach(p => p.classList.remove('on'));
  const panel = document.getElementById('ctab_' + tab);
  if(panel) panel.classList.add('on');

  // Lazy load por tab
  const id = window._coachClienteId;
  if(tab === 'historial') {
    const wrap = document.getElementById('sesiones_wrap2');
    const count = document.getElementById('sesiones_count2');
    if(!id) {
      if(wrap) wrap.innerHTML = '<div style="font-size:13px;color:#f87171;padding:20px;text-align:center">❌ Error: cliente no identificado. Cierra y vuelve a abrir la ficha.</div>';
      return;
    }
    if(wrap) wrap.innerHTML = '<div style="font-size:13px;color:var(--tx3);padding:20px;text-align:center">Cargando sesiones del cliente #'+id+'...</div>';
    api('/clientes/'+id+'/sesiones').then(sesiones=>{
      console.log('[WM Historial] Sesiones recibidas:', sesiones.length, sesiones);
      if(count) count.textContent = '('+sesiones.length+' '+(COACH_LANG==='en'?'sessions':'sesiones')+')';
      if(!sesiones.length){
        if(wrap) wrap.innerHTML = '<div style="font-size:13px;color:var(--tx3);padding:20px;text-align:center">Sin sesiones aún.<br><span style="font-size:11px;opacity:.5">El cliente debe completar al menos un entreno</span></div>';
        return;
      }
      if(wrap) wrap.innerHTML = sesiones.map(s=>{
        const byEx={};
        s.series.forEach(sr=>{if(!byEx[sr.ejercicio_nombre])byEx[sr.ejercicio_nombre]=[];byEx[sr.ejercicio_nombre].push(sr);});
        const incompleto = s.estado === 'incompleto';
        const valoracion = s.valoracion || '';
        const notasCliente = {};
        s.series.forEach(sr=>{ if(sr.nota_cliente && !notasCliente[sr.ejercicio_nombre]) notasCliente[sr.ejercicio_nombre]=sr.nota_cliente; });
        const fecha = new Date(s.fecha).toLocaleDateString(COACH_LANG==='en'?'en-GB':'es-ES',{weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
        const durStr = s.duracion_min ? ' · '+s.duracion_min+' min' : '';
        const totalSeries = s.series.length;
        return '<div style="background:var(--s2);border:0.5px solid '+(incompleto?'rgba(245,158,11,.4)':'rgba(34,197,94,.2)')+';border-radius:12px;padding:13px;margin-bottom:10px">'+
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'+
            '<div style="flex:1">'+
              '<div style="font-size:15px;font-weight:700;color:var(--sv)">'+s.dia_nombre+'</div>'+
              '<div style="font-size:11px;color:var(--blg);font-weight:600">'+tc(s.dia_grupo||'')+'</div>'+
              '<div style="font-size:11px;color:var(--tx3);margin-top:2px">'+fecha+durStr+'</div>'+
            '</div>'+
            '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">'+
              (incompleto
                ? '<span class="badge" style="background:rgba(245,158,11,.15);color:var(--amb);border:0.5px solid rgba(245,158,11,.3)">⚠ '+tc('Incompleto')+'</span>'
                : '<span class="badge b-gn">✓ '+(COACH_LANG==='en'?'Completed':'Completado')+'</span>')+
              (valoracion ? '<span style="font-size:20px" title="'+valoracion+'">'+valoracion.split(' ')[0]+'</span>' : '')+
              '<span style="font-size:10px;color:var(--tx3)">'+totalSeries+' series</span>'+
            '</div>'+
          '</div>'+
          Object.entries(byEx).map(([nom,srs])=>
            '<div style="background:var(--s3);border-radius:8px;padding:8px 10px;margin-bottom:6px">'+
            '<div style="font-size:12px;font-weight:700;color:var(--sv2);margin-bottom:5px">'+nom+'</div>'+
            '<div style="display:flex;gap:5px;flex-wrap:wrap">'+
              srs.map(sr=>
                '<span style="background:var(--b);border:0.5px solid var(--br);border-radius:6px;padding:4px 9px;font-size:11px;color:var(--sv3);font-weight:600">'+
                sr.peso_real+'kg × '+sr.reps_real+(sr.rir!=null?' · RIR'+sr.rir:'')+
                '</span>'
              ).join('')+
            '</div>'+
            (notasCliente[nom] ? '<div style="font-size:11px;color:var(--blg);margin-top:5px;font-style:italic;background:rgba(59,130,246,.06);padding:5px 8px;border-radius:6px;border:0.5px solid rgba(59,130,246,.15)">💬 '+notasCliente[nom]+'</div>' : '')+
            '</div>'
          ).join('')+
        '</div>';
      }).join('');

      // Cargar gráficas de progreso
      const c = window._coachClienteActual;
      if(c) {
        const principales = c.dias.flatMap(d=>(d.ejercicios||[]).filter(e=>e.es_principal).map(e=>e.nombre)).filter((n,i,a)=>a.indexOf(n)===i);
      // Gráficas de progreso eliminadas
      }
    }).catch(()=>{
      if(wrap) wrap.innerHTML = `<div style="font-size:13px;color:#f87171;padding:20px;text-align:center">${tc('Error cargando sesiones.')}</div>`;
    });
  }
  if(tab === 'entreno') {
    const c = window._coachClienteActual;
    if(c) {
      const principales = c.dias.flatMap(d=>(d.ejercicios||[]).filter(e=>e.es_principal).map(e=>e.nombre)).filter((n,i,a)=>a.indexOf(n)===i);
    // Gráficas de progreso eliminadas
    }
  }
  if(tab === 'progreso') {
    const c = window._coachClienteActual;
    if(c) renderCoachFotos(c.fotos);
    cargarRevisionSemanal(id, window._coachClienteActual);
    cargarMetricasAvanzadas(id);
  }
  if(tab === 'resumen') {
    cargarSuscripcionCliente(id);
    setTimeout(() => {
      const c = window._coachClienteActual;
      if(c) aplicarMacrosCoach(c, false);
    }, 100);
  }
  if(tab === 'dieta') {
    // Si hay dieta en edición, asegurarse de estar en vista
    const edit = document.getElementById('coach_dieta_edit');
    const view = document.getElementById('coach_dieta_view');
    if(edit && edit.style.display !== 'none') {
      // ya está en modo edición, ok
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// FOTOS DE PROGRESO — PANEL COACH
// Muestra fotos del cliente agrupadas por sesión (mes), con botón
// "🔍 Analizar con IA" que genera valoración editable y se publica
// al cliente como comentario debajo de la foto.
// ═══════════════════════════════════════════════════════════════════

function renderCoachFotos(fotos) {
  const wrap = document.getElementById('coach_fotos_timeline');
  if (!wrap) return;
  const c = window._coachClienteActual;

  if (!fotos || !fotos.length) {
    wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3);padding:10px 0">${tc('El cliente aún no ha subido fotos.')}</div>`;
    return;
  }

  // Agrupar fotos por mes (YYYY-MM)
  const grupos = {};
  fotos.forEach(f => {
    const mes = f.fecha ? f.fecha.slice(0, 7) : 'sin-fecha';
    if (!grupos[mes]) grupos[mes] = [];
    grupos[mes].push(f);
  });

  const meses = Object.keys(grupos).sort().reverse(); // más reciente primero

  wrap.innerHTML = meses.map((mes, mesIdx) => {
    const fotosMes = grupos[mes];
    const label = mes !== 'sin-fecha'
      ? new Date(mes + '-15').toLocaleDateString(COACH_LANG === 'en' ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric' })
      : tc('Sin fecha');

    // Mes anterior para comparativa (siguiente en el array ordenado descendente)
    const mesAnteriorKey = meses[mesIdx + 1];
    const fotosAnteriores = mesAnteriorKey ? grupos[mesAnteriorKey] : null;
    const hayComparativa = !!(fotosAnteriores && fotosAnteriores.length);

    const fotosHtml = fotosMes.map((f, fi) => {
      const tipoLabel = f.tipo === 'posterior' ? '🔙 Posterior' : f.tipo === 'costado' ? '↔️ Costado' : '🫡 Frente';
      const pub = f.published_analysis;
      const imgId = `cfoto_${mes.replace('-','_')}_${fi}`;
      return `<div style="flex:1;min-width:90px;max-width:140px">
        <div style="font-size:10px;color:var(--tx3);text-align:center;margin-bottom:4px">${tipoLabel}</div>
        <div style="position:relative;border-radius:10px;overflow:hidden;aspect-ratio:3/4;background:var(--s2)">
          ${f.url && !f.url.startsWith('foto_')
            ? `<img id="${imgId}" src="${f.url}" crossorigin="anonymous" data-url="${f.url}" style="width:100%;height:100%;object-fit:cover"/>`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px">📷</div>`}
        </div>
        ${pub ? `<div style="margin-top:6px;font-size:10px;color:var(--gnb);text-align:center">✓ ${tc('Publicado')}</div>` : ''}
      </div>`;
    }).join('');

    const grupoId = 'fotogrp_' + mes.replace('-', '_');

    return `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:14px;padding:14px;margin-bottom:14px">
      <!-- Cabecera mes -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;color:var(--sv)">📅 ${label}</div>
        <div style="font-size:10px;color:var(--tx3)">${fotosMes.length} ${tc('foto')}${fotosMes.length !== 1 ? 's' : ''}</div>
      </div>

      <!-- Miniaturas -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        ${fotosHtml}
      </div>

      <!-- Botón analizar -->
      <button id="btn_analizar_${grupoId}"
        onclick="coachAnalizarFotos('${grupoId}')"
        style="width:100%;padding:11px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation">
        🔍 ${hayComparativa ? tc('Analizar y comparar con mes anterior') : tc('Analizar fotos con IA')}
      </button>

      <!-- Zona resultado IA -->
      <div id="resultado_${grupoId}" style="margin-top:10px;display:none">
        <div style="font-size:11px;color:var(--tx3);margin-bottom:6px">
          ${tc('Edita el mensaje si quieres y publícalo al cliente:')}
        </div>
        <textarea id="texto_${grupoId}"
          style="width:100%;min-height:120px;background:var(--s);border:0.5px solid rgba(59,130,246,.3);border-radius:10px;padding:10px;font-size:13px;color:var(--sv);font-family:inherit;resize:vertical;box-sizing:border-box;line-height:1.5"
          placeholder="${tc('Valoración del coach...')}"></textarea>
        <button onclick="coachPublicarAnalisis('${grupoId}')"
          style="width:100%;margin-top:8px;padding:11px;background:var(--gn);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation">
          ✅ ${tc('Publicar al cliente')}
        </button>
        <div id="pub_msg_${grupoId}" style="font-size:12px;text-align:center;margin-top:6px;height:16px;color:var(--gnb)"></div>
      </div>
    </div>`;
  }).join('');

  // Guardar referencia a los grupos para el análisis
  window._coachFotosGrupos = grupos;
  window._coachFotosMeses = meses;
}

async function coachAnalizarFotos(grupoId) {
  const btn = document.getElementById('btn_analizar_' + grupoId);
  const resWrap = document.getElementById('resultado_' + grupoId);
  const textarea = document.getElementById('texto_' + grupoId);
  if (!btn || !resWrap || !textarea) return;

  btn.disabled = true;
  btn.textContent = '⏳ ' + tc('Analizando...');

  const c = window._coachClienteActual;
  const grupos = window._coachFotosGrupos || {};
  const meses = window._coachFotosMeses || [];
  const mes = grupoId.replace('fotogrp_', '').replace('_', '-');
  const mesIdx = meses.indexOf(mes);
  const fotosMes = grupos[mes] || [];
  const mesAnteriorKey = meses[mesIdx + 1];
  const fotosAnteriores = mesAnteriorKey ? grupos[mesAnteriorKey] : null;

  // Convierte un <img> del DOM a base64 via canvas (sin CORS)
  function imgElementToB64(imgEl) {
    try {
      if (!imgEl || !imgEl.complete || !imgEl.naturalWidth) return null;
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(imgEl.naturalWidth, 1024);
      canvas.height = Math.round(imgEl.naturalHeight * (canvas.width / imgEl.naturalWidth));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
      const full = canvas.toDataURL('image/jpeg', 0.85);
      return { b64: full.split(',')[1], mt: 'image/jpeg' };
    } catch(e) { return null; }
  }

  // Lee imágenes de un grupo de fotos usando canvas (imgs ya en DOM)
  function leerImagenesDom(fotosList, mesKey) {
    const imgs = [];
    fotosList.forEach((f, fi) => {
      const imgId = `cfoto_${mesKey.replace('-','_')}_${fi}`;
      const imgEl = document.getElementById(imgId);
      if (imgEl) {
        const data = imgElementToB64(imgEl);
        if (data) imgs.push(data);
      }
    });
    return imgs;
  }

  try {
    const isEn = COACH_LANG === 'en';

    const mesActualLabel = mes !== 'sin-fecha'
      ? new Date(mes + '-15').toLocaleDateString(isEn ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric' })
      : '';
    const mesAnteriorLabel = mesAnteriorKey
      ? new Date(mesAnteriorKey + '-15').toLocaleDateString(isEn ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric' })
      : '';

    // Leer imágenes del DOM via canvas
    const fotosActB64 = leerImagenesDom(fotosMes, mes);
    const fotosAntB64 = fotosAnteriores ? leerImagenesDom(fotosAnteriores, mesAnteriorKey) : [];

    // Si el canvas falló (CORS), usar el proxy del servidor con URLs
    const urlsActuales = fotosMes.map(f => f.url).filter(u => u && !u.startsWith('foto_'));
    const urlsAnteriores = fotosAnteriores
      ? fotosAnteriores.map(f => f.url).filter(u => u && !u.startsWith('foto_'))
      : [];

    const hayComparativa = fotosAntB64.length > 0 || urlsAnteriores.length > 0;
    const usarB64 = fotosActB64.length > 0;

    let r;
    if (usarB64) {
      // Tenemos base64 del canvas — enviar directamente a /ia/foto o /ia/comparar-fotos
      if (hayComparativa && fotosAntB64.length) {
        r = await api('/ia/comparar-fotos', {
          method: 'POST',
          body: JSON.stringify({
            fotosAntes: fotosAntB64,
            fotosDespues: fotosActB64,
            clienteNombre: c?.nombre || '',
            objetivo: c?.objetivo || '',
            nivel: c?.nivel || '',
            semanaAntes: mesAnteriorLabel,
            semanaDespues: mesActualLabel,
            lang: COACH_LANG,
            pedirGrasa: true,
            peso: c?.peso_actual,
            altura: c?.altura,
            edad: c?.edad,
            sexo: c?.sexo
          })
        });
      } else {
        // Primer mes — sin comparativa
        r = await api('/ia/foto', {
          method: 'POST',
          body: JSON.stringify({
            imageBase64: fotosActB64[0].b64,
            mediaType: fotosActB64[0].mt,
            extraImages: fotosActB64.slice(1),
            clientInfo: `${c?.nombre}, Objetivo: ${c?.objetivo}, Nivel: ${c?.nivel}`,
            system: isEn
              ? 'You are an expert WolfMindset fitness coach. First session — no previous photos. Analyze the physique: estimate body fat % (write as "Estimated body fat: X%"), highlight 2-3 genuine strong points, point out 1-2 areas to focus on, give 1 concrete tip, end motivating. No markdown, no asterisks, no AI mentions.'
              : 'Eres un coach de fitness experto de WolfMindset. Primera sesión — sin fotos anteriores. Analiza el físico: estima el % grasa (escríbelo como "Grasa estimada: X%"), destaca 2-3 puntos fuertes reales, señala 1-2 áreas de mejora, da 1 consejo concreto, termina motivando. Sin markdown, sin asteriscos, sin mencionar IA.'
          })
        });
      }
    } else {
      // Fallback: proxy del servidor descarga las URLs
      r = await api('/ia/analizar-fotos-coach', {
        method: 'POST',
        body: JSON.stringify({
          urlsActuales,
          urlsAnteriores: urlsAnteriores.length ? urlsAnteriores : null,
          clienteNombre: c?.nombre || '',
          objetivo: c?.objetivo || '',
          nivel: c?.nivel || '',
          semanaActual: mesActualLabel,
          semanaAnterior: mesAnteriorLabel,
          lang: COACH_LANG,
          peso: c?.peso_actual,
          altura: c?.altura,
          edad: c?.edad,
          sexo: c?.sexo
        })
      });
    }

    textarea.value = r.reply;
    resWrap.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '↺ ' + tc('Volver a analizar');

  } catch(e) {
    btn.disabled = false;
    btn.textContent = '🔍 ' + tc('Analizar fotos con IA');
    textarea.value = tc('Error al analizar. Inténtalo de nuevo.');
    resWrap.style.display = 'block';
  }
}

async function coachPublicarAnalisis(grupoId) {
  const textarea = document.getElementById('texto_' + grupoId);
  const msgEl = document.getElementById('pub_msg_' + grupoId);
  if (!textarea || !textarea.value.trim()) return;

  const texto = textarea.value.trim();
  const mes = grupoId.replace('fotogrp_', '').replace('_', '-');
  const grupos = window._coachFotosGrupos || {};
  const fotosMes = grupos[mes] || [];

  // Publicar en la primera foto del grupo (la representativa)
  const fotoRef = fotosMes[0];
  if (!fotoRef) return;

  try {
    await api('/fotos/' + fotoRef.id + '/publicar', {
      method: 'POST',
      body: JSON.stringify({ texto })
    });

    // Recargar datos del cliente para que el cliente vea el análisis
    await loadCD(window._coachClienteId);
    const c = window._coachClienteActual;
    if (c) renderCoachFotos(c.fotos);

    if (msgEl) {
      msgEl.textContent = '✓ ' + tc('Publicado al cliente');
      setTimeout(() => { if(msgEl) msgEl.textContent = ''; }, 3000);
    }
  } catch(e) {
    if (msgEl) { msgEl.style.color = '#f87171'; msgEl.textContent = tc('Error al publicar'); }
  }
}

async function guardarDatos(id){
  const btn = event.target;
  btn.textContent='⏳...'; btn.disabled=true;
  try{
    await api('/clientes/'+id,{method:'PUT',body:JSON.stringify({
      objetivo:document.getElementById('obj').value,
      nivel:document.getElementById('niv').value,
      kcal_internas:parseInt(document.getElementById('kcal').value),
      prot:parseInt(document.getElementById('prot').value),
      carbs:parseInt(document.getElementById('carbs').value),
      fat:parseInt(document.getElementById('fat').value),
      comida_libre:document.getElementById('clibre').value,
      mensaje_semana:document.getElementById('msgsem').value,
      notas_coach:document.getElementById('notasc').value
    })});
    // Switch to view mode
    clienteDatosModoVer(btn);
  } catch(e){
    btn.textContent='Error'; btn.disabled=false;
    setTimeout(()=>{btn.textContent=tc('Guardar');},2000);
  }
}

function clienteDatosModoVer(btn){
  // Disable all fields in the ajustar datos section
  const sec = document.getElementById('ajustar_datos_form');
  if(sec){ sec.querySelectorAll('input,select,textarea').forEach(el=>{ el.disabled=true; el.style.opacity='.7'; }); }
  // Change button to Editar
  if(btn){
    btn.textContent=tc('✏️ Editar');
    btn.style.background='var(--bl2)';
    btn.disabled=false;
    btn.onclick = function(){ clienteDatosModoEditar(this); };
  }
}

function clienteDatosModoEditar(btn){
  const sec = document.getElementById('ajustar_datos_form');
  if(sec){ sec.querySelectorAll('input,select,textarea').forEach(el=>{ el.disabled=false; el.style.opacity='1'; }); }
  if(btn){
    const clienteId = btn.dataset.clienteId;
    btn.textContent='Guardar';
    btn.style.background='';
    btn.onclick = function(){ guardarDatos(clienteId); };
  }
}

// ═══ MACROS DE BASE DE DATOS (tabla alimentos_db) ═══
// Proteínas: ~4 kcal/g | Carbos: ~4 kcal/g | Grasas: ~9 kcal/g
// Estimación por nombre de alimento cuando no hay BD
function estimarMacrosPor100g(nombre) {
  const n = nombre.toLowerCase();
  // Proteínas principales
  if(/pollo|pechuga|pavo|atún|merluza|salmón|bacalao|gambas|ternera|cerdo|lomo|pavo/.test(n))
    return {p:22, c:0, g:3};
  if(/huevo/.test(n)) return {p:13, c:1, g:11};
  if(/whey|proteína en polvo|caseína/.test(n)) return {p:75, c:8, g:5};
  if(/yogur proteico/.test(n)) return {p:10, c:4, g:0};
  if(/yogur/.test(n)) return {p:5, c:5, g:3};
  if(/queso/.test(n)) return {p:25, c:1, g:28};
  if(/leche entera/.test(n)) return {p:3, c:5, g:4};
  if(/leche/.test(n)) return {p:3, c:5, g:2};
  if(/legumbre|lenteja|garbanzo|judía/.test(n)) return {p:9, c:20, g:1};
  if(/tofu/.test(n)) return {p:8, c:2, g:4};
  // Carbos
  if(/arroz/.test(n)) return {p:7, c:77, g:1};
  if(/avena/.test(n)) return {p:13, c:66, g:7};
  if(/pasta/.test(n)) return {p:13, c:70, g:2};
  if(/pan integral/.test(n)) return {p:9, c:41, g:3};
  if(/pan/.test(n)) return {p:8, c:48, g:2};
  if(/patata/.test(n)) return {p:2, c:17, g:0};
  if(/plátano/.test(n)) return {p:1, c:23, g:0};
  if(/manzana|naranja|fruta/.test(n)) return {p:0, c:12, g:0};
  if(/frutos rojos|fresa|arándano/.test(n)) return {p:1, c:8, g:0};
  // Grasas
  if(/aceite/.test(n)) return {p:0, c:0, g:100};
  if(/aguacate/.test(n)) return {p:2, c:2, g:15};
  if(/anacardo|nuez|almendra|cacahuete|fruto seco/.test(n)) return {p:18, c:22, g:50};
  if(/mantequilla/.test(n)) return {p:1, c:0, g:80};
  // Verduras (casi sin macros)
  if(/verdura|espinaca|lechuga|tomate|pepino|pimiento|brócoli|zanahoria|cebolla|ajo/.test(n))
    return {p:2, c:5, g:0};
  // Default
  return {p:5, c:15, g:5};
}

function calcMacrosDieta(comidas) {
  let totalP=0, totalC=0, totalG=0, totalKcal=0;
  (comidas||[]).forEach(m => {
    (m.items||[]).forEach(it => {
      const macro = estimarMacrosPor100g(it.nombre);
      const factor = (it.gramos||100) / 100;
      totalP += macro.p * factor;
      totalC += macro.c * factor;
      totalG += macro.g * factor;
    });
  });
  totalP = Math.round(totalP);
  totalC = Math.round(totalC);
  totalG = Math.round(totalG);
  totalKcal = Math.round(totalP*4 + totalC*4 + totalG*9);
  return {p:totalP, c:totalC, g:totalG, kcal:totalKcal};
}

function renderMacrosBarra(macros, objetivos) {
  const pPct = Math.min(Math.round(macros.p/Math.max(objetivos.p,1)*100),150);
  const cPct = Math.min(Math.round(macros.c/Math.max(objetivos.c,1)*100),150);
  const gPct = Math.min(Math.round(macros.g/Math.max(objetivos.g,1)*100),150);
  const kPct = Math.min(Math.round(macros.kcal/Math.max(objetivos.kcal,1)*100),150);
  const col = (pct) => pct > 110 ? '#f87171' : pct >= 90 ? '#22c55e' : '#f59e0b';
  return `<div style="background:var(--s3);border-radius:10px;padding:10px 12px;margin-bottom:10px">
    <div style="font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">${tc('Macros actuales del plan')}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">
      ${[['P',macros.p+'g',objetivos.p+'g',pPct,'#3b82f6'],['C',macros.c+'g',objetivos.c+'g',cPct,'#a78bfa'],['G',macros.g+'g',objetivos.g+'g',gPct,'#f97316'],['kcal',macros.kcal,objetivos.kcal,kPct,'#fbbf24']].map(([l,v,obj,pct,color])=>`
      <div style="text-align:center;background:var(--s2);border-radius:8px;padding:6px 4px;border:0.5px solid ${col(pct)}40">
        <div style="font-size:14px;font-weight:700;color:${col(pct)}">${v}</div>
        <div style="font-size:9px;color:var(--tx3)">${l} / ${obj}</div>
        <div style="font-size:9px;color:${col(pct)};font-weight:700">${pct}%</div>
      </div>`).join('')}
    </div>
  </div>`;
}

function toggleEditarDietaCoach(){
  const view = document.getElementById('coach_dieta_view');
  const edit = document.getElementById('coach_dieta_edit');
  const btn = document.getElementById('btn_editar_dieta_coach');
  const c = window._coachClienteActual;
  if(!c || !view || !edit) return;

  const isEditing = edit.style.display !== 'none';
  if(isEditing){
    edit.style.display = 'none';
    view.style.display = 'block';
    btn.textContent = '✏️ Editar';
  } else {
    view.style.display = 'none';
    edit.style.display = 'block';
    btn.textContent = '✕ Cancelar';
    renderEditarDietaCoach(c);
  }
}

function renderEditarDietaCoach(c){
  const edit = document.getElementById('coach_dieta_edit');
  if(!edit) return;
  if(!c.comidas.length){
    edit.innerHTML = `<div style="font-size:13px;color:var(--tx3)">${tc('Sin comidas. Publica una dieta primero desde el Creador IA.')}</div>`;
    return;
  }

  const obj = {
    p: c.prot || 160,
    c: c.carbs || 200,
    g: c.fat || 60,
    kcal: c.kcal_internas || 2000
  };
  const macros = calcMacrosDieta(c.comidas);

  // ─── BARRA DE MACROS ───
  let html = renderMacrosBarra(macros, obj);

  // ─── OPCIÓN B: Rebalanceo IA ───
  html += `<div style="background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(17,17,19,.9));border:0.5px solid rgba(59,130,246,.25);border-radius:10px;padding:12px;margin-bottom:10px">
    <div style="font-size:11px;font-weight:700;color:var(--blg);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">⚡ ${tc('Rebalanceo IA')}</div>
    <div style="font-size:12px;color:var(--sv3);margin-bottom:8px">${tc('Describe el ajuste y la IA redistribuye todo el plan')}</div>
    <textarea id="coach_ia_ajuste" style="width:100%;padding:9px 11px;border:0.5px solid var(--br);border-radius:8px;background:var(--b);color:var(--tx);font-size:13px;font-family:'Inter',sans-serif;resize:none;min-height:60px;margin-bottom:8px;box-sizing:border-box"
      placeholder="${COACH_LANG==='en'?'E.g: Lower 200 kcal removing from carbs · Increase protein 20g split between lunch and dinner · Remove breakfast fats...':'Ej: Baja 200 kcal quitándolas de los carbos · Sube proteína 20g repartida en comida y cena · Elimina las grasas del desayuno...'}"></textarea>
    <button onclick="rebalancearConIA()" class="btn" style="width:100%;padding:10px;font-size:13px">⚡ ${tc('Rebalancear con IA')}</button>
  </div>`;

  // ─── OPCIÓN A: Rebalanceo automático ───
  html += `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:12px;margin-bottom:10px">
    <div style="font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">🔧 ${tc('Ajuste automático')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      <div>
        <div style="font-size:10px;color:var(--tx3);margin-bottom:4px">${tc('Macro a ajustar')}</div>
        <select id="auto_macro" style="width:100%;padding:8px;border:0.5px solid var(--br);border-radius:8px;background:var(--b);color:var(--tx);font-size:13px;font-family:'Inter',sans-serif">
          <option value="p">${tc('Proteína')}</option>
          <option value="c">${tc('Carbos')}</option>
          <option value="g">${COACH_LANG==='en'?'Fats':'Grasas'}</option>
          <option value="kcal">${tc('Calorías totales')}</option>
        </select>
      </div>
      <div>
        <div style="font-size:10px;color:var(--tx3);margin-bottom:4px">${tc('Cambio (+ subir / - bajar)')}</div>
        <input type="number" id="auto_delta" placeholder="${COACH_LANG==='en'?'E.g. -200 or +30':'Ej: -200 o +30'}" style="width:100%;padding:8px;border:0.5px solid var(--br);border-radius:8px;background:var(--b);color:var(--tx);font-size:13px;font-family:'Inter',sans-serif;box-sizing:border-box"/>
      </div>
    </div>
    <button onclick="rebalancearAutomatico()" class="btn btn-sm" style="width:100%;padding:9px;background:var(--s3);color:var(--sv2);border:0.5px solid var(--br)">🔧 ${tc('Aplicar ajuste')}</button>
  </div>`;

  // ─── EDICIÓN MANUAL POR COMIDA ───
  html += `<div style="font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">${tc('Edición manual')}</div>`;
  c.comidas.forEach((m, mi) => {
    const nombreEsc = (m.nombre||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');
    html += `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:10px 12px;margin-bottom:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blg);margin-bottom:8px">${['☀️','🕐','🍽️','🌅','🌙','🥗'][mi]||'🍽️'} ${m.nombre}</div>`;
    (m.items||[]).forEach(it => {
      const itNombreEsc = (it.nombre||'').replace(/"/g,'&quot;');
      html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="flex:1;font-size:12px;color:var(--sv2)">${it.nombre}</span>
        <input type="number" value="${it.gramos||0}" min="1" data-alim-id="${it.id}"
          style="width:65px;padding:5px 7px;border:0.5px solid var(--br);border-radius:7px;background:var(--b);color:var(--blg);font-size:13px;font-weight:700;text-align:center;font-family:'Inter',sans-serif"
          onchange="dbEditG(${it.id}, this.value); actualizarBarraMacros()"/>
        <span style="font-size:11px;color:var(--tx3)">g</span>
        <button onclick="coachBorrarAlimento(${it.id}, this)" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:15px;flex-shrink:0">✕</button>
      </div>`;
    });
    html += `<button onclick="coachAnadirAlimento(${m.id}, '${nombreEsc}', this)"
      style="width:100%;padding:6px;border:0.5px dashed var(--br);border-radius:8px;background:none;color:var(--tx3);font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;margin-top:2px">${tc('+ Añadir alimento')}</button>
    </div>`;
  });

  html += `<button onclick="guardarDietaCoach()" class="btn" style="width:100%;padding:11px;background:var(--gn);margin-top:4px">✓ ${tc('Guardar y cerrar')}</button>`;
  edit.innerHTML = html;
}

function actualizarBarraMacros(){
  const c = window._coachClienteActual;
  if(!c) return;
  // Leer gramos actuales desde los inputs del DOM
  document.querySelectorAll('[data-alim-id]').forEach(inp => {
    const id = parseInt(inp.dataset.alimentId || inp.dataset.alimentoId || inp.getAttribute('data-alim-id'));
    const gramos = parseInt(inp.value)||0;
    c.comidas.forEach(m => m.items.forEach(it => { if(it.id===id) it.gramos=gramos; }));
  });
  const obj = {p: c.prot||160, c: c.carbs||200, g: c.fat||60, kcal: c.kcal_internas||2000};
  const macros = calcMacrosDieta(c.comidas);
  const barraWrap = document.querySelector('#coach_dieta_edit > div:first-child');
  if(barraWrap) barraWrap.outerHTML = renderMacrosBarra(macros, obj);
}

async function rebalancearAutomatico(){
  const macro = document.getElementById('auto_macro')?.value;
  const delta = parseFloat(document.getElementById('auto_delta')?.value||'0');
  if(!delta){ alert(COACH_LANG==='en'?'Enter a change value (e.g. -200 or +30)':'Escribe un valor de cambio (ej: -200 o +30)'); return; }
  const c = window._coachClienteActual;
  if(!c || !c.comidas.length) return;

  const btn = event.target;
  btn.textContent='⏳ '+(COACH_LANG==='en'?'Calculating...':'Calculando...'); btn.disabled=true;

  // Calcular factor de ajuste proporcional
  // Para cada alimento, identificar si es del tipo de macro a ajustar
  // y escalar sus gramos proporcionalmente
  const macrosActuales = calcMacrosDieta(c.comidas);

  // Qué macro en gramos tenemos ahora
  const macroActual = macro==='kcal'
    ? macrosActuales.kcal
    : macrosActuales[macro];

  // Qué queremos tener
  const macroObjetivo = macroActual + delta;
  if(macroObjetivo <= 0){ alert(tc('El ajuste dejaría el plan sin ese macro. Reduce el cambio.')); btn.textContent='🔧 '+tc('Aplicar ajuste'); btn.disabled=false; return; }

  const factor = macroObjetivo / Math.max(macroActual, 1);

  // Filtrar alimentos del tipo correcto y escalarlos
  const promesas = [];
  c.comidas.forEach(m => {
    m.items.forEach(it => {
      const macroAlim = estimarMacrosPor100g(it.nombre);
      let esDeTipo = false;
      if(macro==='p') esDeTipo = macroAlim.p > 10; // proteínas
      if(macro==='c') esDeTipo = macroAlim.c > 15 && macroAlim.p < 15; // carbos
      if(macro==='g') esDeTipo = macroAlim.g > 10 && macroAlim.c < 10; // grasas
      if(macro==='kcal') esDeTipo = true; // todos

      if(esDeTipo){
        const nuevosGramos = Math.max(Math.round(it.gramos * factor), 10);
        const diff = nuevosGramos - it.gramos;
        if(Math.abs(diff) >= 2){ // solo si cambia al menos 2g
          it.gramos = nuevosGramos;
          promesas.push(api('/alimentos/'+it.id, {
            method:'PUT', body:JSON.stringify({gramos: nuevosGramos})
          }));
        }
      }
    });
  });

  await Promise.all(promesas);
  renderEditarDietaCoach(c);
  btn.textContent='✓ '+(COACH_LANG==='en'?'Applied':'Aplicado'); btn.disabled=false;
  setTimeout(()=>{ btn.textContent='🔧 '+tc('Aplicar ajuste'); }, 1500);
}

async function rebalancearConIA(){
  const instruccion = document.getElementById('coach_ia_ajuste')?.value?.trim();
  if(!instruccion){ alert(tc('Escribe qué ajuste quieres hacer')); return; }
  const c = window._coachClienteActual;
  if(!c || !c.comidas.length) return;

  const btn = event.target;
  btn.textContent='⏳ '+(COACH_LANG==='en'?'Rebalancing...':'Rebalanceando...'); btn.disabled=true;

  const planActual = c.comidas.map(m=>({
    nombre: m.nombre,
    alimentos: m.items.map(it=>({ id: it.id, nombre: it.nombre, gramos: it.gramos }))
  }));

  const prompt = `Eres un nutricionista deportivo experto. Tienes este plan de dieta de un cliente y debes ajustarlo según la instrucción del coach.

OBJETIVO DEL CLIENTE:
- Proteína: ${c.prot||160}g | Carbos: ${c.carbs||200}g | Grasas: ${c.fat||60}g | Kcal: ${c.kcal_internas||2000}

PLAN ACTUAL:
${JSON.stringify(planActual, null, 2)}

INSTRUCCIÓN DEL COACH:
${instruccion}

REGLAS:
1. Devuelve SOLO JSON válido, sin texto adicional.
2. Mantén los mismos alimentos y sus IDs. Solo cambia los gramos.
3. Aplica la instrucción del coach de forma inteligente y distribuida.
4. No bajes ningún alimento por debajo de 10g.
5. Mantén coherencia culinaria (no pongas 5g de arroz).
6. Responde con este formato exacto:
{"ajustes":[{"id":123,"gramos":150},{"id":456,"gramos":80}],"resumen":"Frase corta explicando qué se hizo"}`;

  try {
    const d = await api('/ia/chat', {
      method:'POST',
      body:JSON.stringify({
        messages:[{role:'user', content:prompt}],
        system:'Nutricionista experto. Responde SOLO con JSON válido y compacto. Sin texto extra.'
      })
    });

    let result;
    try {
      let clean = (d.reply||'').replace(/```json\s*/gi,'').replace(/```\s*/g,'');
      const s = clean.indexOf('{'), e = clean.lastIndexOf('}');
      if(s>=0 && e>s) clean = clean.slice(s, e+1);
      result = JSON.parse(clean.trim());
    } catch(e){
      throw new Error('La IA no devolvió JSON válido. Intenta de nuevo.');
    }

    if(!result.ajustes?.length) throw new Error('Sin ajustes en la respuesta.');

    // Aplicar cambios
    const promesas = result.ajustes.map(aj => {
      c.comidas.forEach(m => m.items.forEach(it => { if(it.id===aj.id) it.gramos=aj.gramos; }));
      return api('/alimentos/'+aj.id, {method:'PUT', body:JSON.stringify({gramos: aj.gramos})});
    });
    await Promise.all(promesas);

    // Mostrar resumen
    if(result.resumen){
      const ta = document.getElementById('coach_ia_ajuste');
      if(ta){ ta.value=''; ta.placeholder='✓ '+result.resumen; }
    }

    renderEditarDietaCoach(c);
    btn.textContent='✓ Rebalanceado';
    setTimeout(()=>{ btn.textContent='⚡ Rebalancear con IA'; btn.disabled=false; }, 2000);

  } catch(e){
    alert('Error: '+e.message);
    btn.textContent='⚡ Rebalancear con IA'; btn.disabled=false;
  }
}

async function coachBorrarAlimento(id, btn){
  btn.closest('div').remove();
  await api('/alimentos/'+id, {method:'DELETE'}).catch(()=>{});
  const c = window._coachClienteActual;
  if(c){ c.comidas.forEach(m=>{ m.items=m.items.filter(it=>it.id!==id); }); }
  actualizarBarraMacros();
}

async function coachAnadirAlimento(comidaId, nombreComida, btn){
  const nombre = prompt('Nombre del alimento:');
  if(!nombre) return;
  const gramos = parseInt(prompt('Gramos (en crudo):', '100') || '100');
  if(!gramos) return;
  await api('/comidas/'+comidaId+'/alimentos', {
    method:'POST', body:JSON.stringify({nombre, gramos})
  });
  const c = await api('/clientes/'+window._coachClienteId);
  window._coachClienteActual = c;
  renderEditarDietaCoach(c);
}

async function guardarDietaCoach(){
  const btn = document.querySelector('#coach_dieta_edit .btn[onclick="guardarDietaCoach()"]');
  if(btn){ btn.textContent='⏳ Guardando...'; btn.disabled=true; }
  const c = await api('/clientes/'+window._coachClienteId);
  window._coachClienteActual = c;
  const view = document.getElementById('coach_dieta_view');
  const edit = document.getElementById('coach_dieta_edit');
  const btnEditar = document.getElementById('btn_editar_dieta_coach');
  if(view) view.innerHTML = c.comidas.length ? c.comidas.map((m,mi)=>{
    const itemsHtml = (m.items||[]).map(it=>
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:0.5px solid rgba(39,39,42,.4)">'+
      '<span style="font-size:12px;color:var(--sv2)">'+it.nombre+'</span>'+
      '<span style="font-size:12px;font-weight:700;color:var(--blg)">'+(it.gramos||0)+'g</span>'+
      '</div>'
    ).join('');
    return '<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:10px 12px;margin-bottom:7px">'+
      '<div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:6px">'+(['☀️','🕐','🍽️','🌅','🌙','🥗'][mi]||'🍽️')+' '+m.nombre+'</div>'+
      itemsHtml+'</div>';
  }).join('')
    : '<div style="font-size:13px;color:var(--tx3)">Sin dieta asignada.</div>';
  if(edit){ edit.style.display='none'; edit.innerHTML=''; }
  if(view) view.style.display='block';
  if(btnEditar){ btnEditar.textContent='✏️ Editar'; }
}

async function borrarDietaCoach(){
  if(!confirm(tc('¿Borrar toda la dieta de este cliente?'))) return;
  const c = window._coachClienteActual;
  if(!c) return;
  for(const m of c.comidas) await api('/comidas/'+m.id, {method:'DELETE'});
  const view = document.getElementById('coach_dieta_view');
  if(view) view.innerHTML = '<div style="font-size:13px;color:var(--tx3)">Sin dieta asignada. Usa el Creador de Dieta IA.</div>';
  window._coachClienteActual.comidas = [];
}

function mb2(l,c,a,cal,tot){const p=Math.round((cal/(tot||1))*100)||0;return`<div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tx3);margin-bottom:3px;font-weight:500"><span>${l}</span><span style="color:var(--sv2)">${a}g·${p}%</span></div><div style="height:3px;background:var(--s3);border-radius:2px;overflow:hidden;margin-bottom:8px"><div style="width:${p}%;height:100%;background:${c};border-radius:2px"></div></div></div>`;}

function hNuevo(){
  // Cargar coaches disponibles para el selector
  api('/coaches').then(coaches=>{
    const sel=document.getElementById('nc_coach');
    if(!sel||!coaches) return;
    coaches.forEach(c=>{
      const opt=document.createElement('option');
      opt.value=c.id;
      opt.textContent=(c.id===USER.id?'🔵 ':'🟣 ')+(c.nombre||c.username)+(c.id===USER.id?` (${COACH_LANG==='en'?'me':'yo'})`:'');
      if(c.id===USER.id) opt.selected=true;
      sel.appendChild(opt);
    });
  }).catch(()=>{});

  return`<div class="sec" style="max-width:500px"><div class="sec-hdr">${COACH_LANG==='en'?'Create new client':'Crear nuevo cliente'}</div>
  <div class="g2" style="gap:8px">
    <div style="grid-column:span 2"><div class="form-lbl">${tc('Nombre completo')}</div><input class="inp" id="nc_n" placeholder="Carlos Martínez"/></div>
    <div><div class="form-lbl">${COACH_LANG==='en'?'Username (login)':'Usuario (login)'}</div><input class="inp" id="nc_u" placeholder="carlos"/></div>
    <div><div class="form-lbl">${tc('Contraseña')}</div><input class="inp" id="nc_p" type="password" placeholder="${COACH_LANG==='en'?'Min 6 chars':'Mín 6 caracteres'}"/></div>
    <div><div class="form-lbl">${tc('Objetivo')}</div><select class="inp" id="nc_o"><option>${tc('Volumen')}</option><option>${tc('Definición')}</option><option>${tc('Fuerza')}</option><option>${tc('Recomposición')}</option></select></div>
    <div><div class="form-lbl">${tc('Nivel')}</div><select class="inp" id="nc_nv"><option>${tc('Principiante')}</option><option selected>${tc('Intermedio')}</option><option>${tc('Avanzado')}</option></select></div>
    <div style="grid-column:span 2">
      <div class="form-lbl">${COACH_LANG==='en'?'Assign to coach':'Asignar a coach'}</div>
      <select class="inp" id="nc_coach" style="margin-bottom:0">
        <option value="${USER.id}">🔵 ${USER.nombre||USER.username} (${COACH_LANG==='en'?'me':'yo'})</option>
      </select>
    </div>
  </div>
  <button class="btn" style="width:100%;padding:13px;margin-top:4px" onclick="crearCliente()">${COACH_LANG==='en'?'Create client':'Crear cliente'}</button>
  <div id="nc_msg" style="font-size:13px;text-align:center;margin-top:10px;font-weight:500"></div>
</div>`;
}

async function crearCliente(){
  const n=document.getElementById('nc_n').value.trim(),u=document.getElementById('nc_u').value.trim(),p=document.getElementById('nc_p').value;
  const coachId=document.getElementById('nc_coach')?.value||USER.id;
  const msg=document.getElementById('nc_msg');
  if(!n||!u||!p){msg.style.color='#f87171';msg.textContent=COACH_LANG==='en'?'Fill in all fields':'Rellena todos los campos';return;}
  try{
    await api('/auth/register-cliente',{method:'POST',body:JSON.stringify({username:u,password:p,nombre:n,objetivo:document.getElementById('nc_o').value,nivel:document.getElementById('nc_nv').value,coach_id:coachId})});
    msg.style.color='#86efac';msg.textContent=COACH_LANG==='en'?`✓ ${n} created. Login: ${u}`:`✓ ${n} creado. Login: ${u}`;
  }catch(e){msg.style.color='#f87171';msg.textContent=e.error||'Error';}
}

async function reasignarCoach(clienteId){
  try{
    const coaches = await api('/coaches');
    const c = window._coachClienteActual;
    const actual = c.coach_id || USER.id;
    const opciones = coaches.map((co,i) => `${i+1}. ${co.nombre||co.username} (@${co.username})${co.id===actual?' ← actual':''}`).join('\n');
    const idx = prompt(COACH_LANG==='en'?`Reassign "${c.nombre}" to:\n\n${opciones}\n\nEnter the number:`:`Reasignar "${c.nombre}" a:\n\n${opciones}\n\nEscribe el número:`);
    if(!idx) return;
    const coach = coaches[parseInt(idx)-1];
    if(!coach){alert(COACH_LANG==='en'?'Invalid number':'Número inválido');return;}
    await api('/clientes/'+clienteId+'/asignar-coach',{method:'POST',body:JSON.stringify({coach_id:coach.id})});
    alert(COACH_LANG==='en'?`✓ ${c.nombre} assigned to ${coach.nombre||coach.username}`:`✓ ${c.nombre} asignado a ${coach.nombre||coach.username}`);
    verCliente(clienteId); // Recargar
  }catch(e){alert('Error: '+(e.error||e.message||'No se pudo reasignar'));}
}

// ── TRADUCCIÓN INSTRUCCIONES EJERCICIO CON IA ─────────────────────────
async function traducirEjercicioIA(nombre, pasos) {
  const btn = document.getElementById('btn_trans_ex');
  const txt = document.getElementById('btn_trans_ex_txt');
  if(!btn || !txt || !pasos) return;

  btn.disabled = true;
  txt.textContent = '⏳';

  try {
    const listaTexto = pasos.map((p,i) => `${i+1}. ${p}`).join('\n');
    const prompt = `Translate these Spanish exercise instructions to English. Keep it concise and technical. Return ONLY a JSON array of strings in the same order, no extra text.\n\n${listaTexto}`;

    const data = await api('/ia/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        system: 'You are a fitness translator ES→EN. Return ONLY a valid JSON array of translated instruction strings, same count as input, no markdown, no extra text.'
      })
    });
    const raw = (data.reply||'').trim().replace(/```json|```/g,'').trim();
    const translated = JSON.parse(raw);

    if(!Array.isArray(translated) || translated.length !== pasos.length) throw new Error('length mismatch');

    // Guardar en cache
    const exTransKey = 'ex_trans_'+nombre.replace(/[^a-zA-Z0-9]/g,'_');
    localStorage.setItem(exTransKey, JSON.stringify(translated));

    // Actualizar los pasos en el modal sin cerrarlo
    const pasosEl = document.getElementById('desc_pasos');
    if(pasosEl) {
      pasosEl.innerHTML = translated.map((p,i)=>`<div style="display:flex;gap:12px;margin-bottom:10px">
        <div style="width:22px;height:22px;border-radius:50%;background:rgba(59,130,246,.2);color:var(--blg);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${i+1}</div>
        <div style="font-size:14px;color:var(--sv2);line-height:1.55">${p}</div>
      </div>`).join('');
    }
    txt.textContent = '✅🇬🇧';
    btn.style.background = 'rgba(34,197,94,.12)';
    btn.style.color = '#86efac';
    btn.style.borderColor = 'rgba(34,197,94,.3)';

  } catch(e) {
    txt.textContent = '⚠️';
    setTimeout(()=>{ txt.textContent = '🇬🇧'; btn.disabled = false; }, 2500);
  }
}
// ──────────────────────────────────────────────────────────────────────
async function traducirDietaIA() {
  const btn = document.getElementById('btn_translate_diet');
  const txt = document.getElementById('btn_translate_diet_txt');
  if(!btn || !txt) return;

  btn.disabled = true;
  txt.textContent = '⏳';

  try {
    // ── Construir lista completa de textos a traducir ──
    const allItems = []; // { type, key, text }

    // 1. Alimentos de cada comida
    CD.comidas.forEach((m, mi) => {
      (m.items || []).forEach((it, ji) => {
        allItems.push({ type:'food', mi, ji, text: it.nombre });
      });
    });

    // 2. Nombres de variaciones/alternativas
    const vars = CD._planVariaciones || {};
    Object.entries(vars).forEach(([mi, varList]) => {
      (varList || []).forEach((v, vi) => {
        if(v.nombre) allItems.push({ type:'var', mi:parseInt(mi), vi, text: v.nombre });
      });
    });

    // 3. Suplementos personalizados (los base son hardcoded y ya en inglés en código)
    const sups = CD._planSuplementacion || [];
    sups.forEach((s, si) => {
      if(s.nombre) allItems.push({ type:'sup_nombre', si, text: s.nombre });
      if(s.momento) allItems.push({ type:'sup_momento', si, text: s.momento });
      if(s.motivo) allItems.push({ type:'sup_motivo', si, text: s.motivo });
    });

    // 4. Alimentos terapéuticos
    const alimTher = CD._planAlimentosTerapeuticos || [];
    alimTher.forEach((a, ai) => {
      if(a.alimento) allItems.push({ type:'ther_alimento', ai, text: a.alimento });
      if(a.frecuencia) allItems.push({ type:'ther_frecuencia', ai, text: a.frecuencia });
      if(a.motivo) allItems.push({ type:'ther_motivo', ai, text: a.motivo });
    });

    // 5. Frase motivadora
    if(CD._planFrase) allItems.push({ type:'frase', text: CD._planFrase });

    const listaTexto = allItems.map((it, i) => `${i+1}. ${it.text}`).join('\n');
    const prompt = `Translate all these Spanish nutrition texts to English. Keep quantities, doses, brand names and scientific terms. Return ONLY a JSON array of strings in the same order, no extra text.\n\n${listaTexto}`;

    const data = await api('/ia/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        system: 'You are a nutrition translator ES→EN. Return ONLY a valid JSON array of translated strings, same count as input, no markdown, no extra text.'
      })
    });
    const raw = (data.reply || '').trim().replace(/```json|```/g,'').trim();
    const translated = JSON.parse(raw);

    if (!Array.isArray(translated) || translated.length !== allItems.length) throw new Error('length mismatch: got '+translated.length+' expected '+allItems.length);

    // ── Construir cache completo ──
    const cache = {
      foods: {},      // [mi][ji] = nombre traducido
      vars: {},       // [mi][vi] = nombre alternativa
      sups: {},       // [si] = {nombre, momento, motivo}
      ther: {},       // [ai] = {alimento, frecuencia, motivo}
    };

    allItems.forEach((it, i) => {
      const tr = translated[i];
      if(it.type === 'food') {
        if(!cache.foods[it.mi]) cache.foods[it.mi] = {};
        cache.foods[it.mi][it.ji] = tr;
      } else if(it.type === 'var') {
        if(!cache.vars[it.mi]) cache.vars[it.mi] = {};
        cache.vars[it.mi][it.vi] = tr;
      } else if(it.type === 'sup_nombre') {
        if(!cache.sups[it.si]) cache.sups[it.si] = {};
        cache.sups[it.si].nombre = tr;
      } else if(it.type === 'sup_momento') {
        if(!cache.sups[it.si]) cache.sups[it.si] = {};
        cache.sups[it.si].momento = tr;
      } else if(it.type === 'sup_motivo') {
        if(!cache.sups[it.si]) cache.sups[it.si] = {};
        cache.sups[it.si].motivo = tr;
      } else if(it.type === 'ther_alimento') {
        if(!cache.ther[it.ai]) cache.ther[it.ai] = {};
        cache.ther[it.ai].alimento = tr;
      } else if(it.type === 'ther_frecuencia') {
        if(!cache.ther[it.ai]) cache.ther[it.ai] = {};
        cache.ther[it.ai].frecuencia = tr;
      } else if(it.type === 'ther_motivo') {
        if(!cache.ther[it.ai]) cache.ther[it.ai] = {};
        cache.ther[it.ai].motivo = tr;
      } else if(it.type === 'frase') {
        cache.frase = tr;
      }
    });

    localStorage.setItem('dieta_trans_'+CD.id, JSON.stringify(cache));
    txt.textContent = '✅🇬🇧';
    setTimeout(() => { document.getElementById('klContent').innerHTML = hDieta(); }, 500);

  } catch(e) {
    console.error('Diet translation error:', e);
    txt.textContent = '⚠️';
    btn.disabled = false;
    setTimeout(() => { txt.textContent = '🇬🇧'; }, 2500);
  }
}
// ──────────────────────────────────────────────────────────────────────

// ═══ RUTINAS BUILDER ══════════════════════════════════
let rbState={clienteId:null,diaId:null,diaNombre:'',diaOpen:{}};

function hRutinas(){return`
  <div class="sec" style="margin-bottom:12px">
    <div class="sec-hdr" style="margin-bottom:10px">1. ${tc('Selecciona cliente')}</div>
    <input class="inp" id="rb_cl_buscar" placeholder="${COACH_LANG==='en'?'Search client...':'Buscar cliente...'}" oninput="rbFiltrarTarjetas()" style="margin-bottom:10px;font-size:13px"/>
    <div id="rb_cl_grid" class="cc-grid clientes-card-grid"></div>
    <input type="hidden" id="rb_cl" value=""/>
  </div>

  <div class="sec" style="margin-bottom:12px;background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(24,24,27,.9));border-color:rgba(59,130,246,.22)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div>
        <div class="sec-hdr" style="margin-bottom:4px">🏋️ ${COACH_LANG==='en'?'Exercise library':'Biblioteca de ejercicios'}</div>
        <div style="font-size:12px;color:var(--tx3);line-height:1.5">${COACH_LANG==='en'?'Edit exercise images or create a new custom exercise before adding it to a routine.':'Edita imágenes de ejercicios o crea un ejercicio personalizado antes de añadirlo a una rutina.'}</div>
      </div>
      <button class="btn btn-sm" style="background:var(--bl2);color:#fff;border:0.5px solid rgba(147,197,253,.25);box-shadow:0 6px 18px rgba(37,99,235,.18)" onclick="abrirGestorImagenes()">${COACH_LANG==='en'?'Edit exercises':'Editar ejercicios'}</button>
    </div>
  </div>

  <!-- GESTOR DE EJERCICIOS -->
  <div id="gestor_imagenes" style="display:none;margin-bottom:12px">
    <div class="sec">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px">
        <div>
          <div class="sec-hdr" style="margin-bottom:4px">${COACH_LANG==='en'?'Exercise editor':'Editor de ejercicios'}</div>
          <div style="font-size:12px;color:var(--tx3)">${COACH_LANG==='en'?'Manage existing exercise images and add your own custom exercises.':'Gestiona imágenes de ejercicios existentes y añade tus propios ejercicios personalizados.'}</div>
        </div>
        <button onclick="abrirGestorImagenes()" style="background:none;border:none;color:var(--tx3);font-size:24px;cursor:pointer;line-height:1">×</button>
      </div>

      <div class="exercise-editor-grid" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.8fr);gap:12px">
        <div style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;padding:12px;min-width:0">
          <div style="font-size:11px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">${COACH_LANG==='en'?'🖼️ Edit existing exercise image':'🖼️ Editar imagen de ejercicio existente'}</div>
          <div style="font-size:11px;color:var(--tx3);margin-bottom:10px;line-height:1.5">${COACH_LANG==='en'?'Paste the URL of an image or GIF and save it.':'Pega la URL de una imagen o GIF y guárdala.'}</div>
          <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
            <select class="inp" id="edit_ex_grupo_filter" onchange="filtrarEjerciciosGestor()" style="flex:1;min-width:120px;margin-bottom:0">
              <option value="All">${COACH_LANG==='en'?'All muscle groups':'Todos los grupos'}</option>
              <option>Chest</option><option>Back</option><option>Shoulders</option><option>Biceps</option><option>Triceps</option><option>Legs</option><option>Abs</option>
            </select>
            <input class="inp" id="edit_ex_buscar" placeholder="${COACH_LANG==='en'?'Search exercise...':'Buscar ejercicio...'}" style="flex:2;min-width:140px;margin-bottom:0" oninput="filtrarEjerciciosGestor()"/>
          </div>
          <div id="gestor_lista" style="max-height:420px;overflow-y:auto"></div>
        </div>

        <div style="background:linear-gradient(135deg,rgba(34,197,94,.08),rgba(24,24,27,.95));border:0.5px solid rgba(34,197,94,.18);border-radius:12px;padding:12px;min-width:0">
          <div style="font-size:11px;color:var(--gnb);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">${COACH_LANG==='en'?'➕ Create new exercise':'➕ Crear nuevo ejercicio'}</div>
          <div class="form-lbl">${COACH_LANG==='en'?'Exercise name':'Nombre del ejercicio'}</div>
          <input class="inp" id="new_ex_nombre" placeholder="${COACH_LANG==='en'?'E.g. Incline dumbbell press':'Ej: Press inclinado con mancuernas'}"/>
          <div class="g2" style="gap:8px">
            <div>
              <div class="form-lbl">${COACH_LANG==='en'?'Muscle group':'Grupo muscular'}</div>
              <select class="inp" id="new_ex_grupo"><option>Chest</option><option>Back</option><option>Shoulders</option><option>Biceps</option><option>Triceps</option><option>Legs</option><option>Abs</option></select>
            </div>
            <div>
              <div class="form-lbl">${COACH_LANG==='en'?'Difficulty':'Dificultad'}</div>
              <select class="inp" id="new_ex_dif"><option value="Principiante">${COACH_LANG==='en'?'Beginner':'Principiante'}</option><option value="Intermedio" selected>${COACH_LANG==='en'?'Intermediate':'Intermedio'}</option><option value="Avanzado">${COACH_LANG==='en'?'Advanced':'Avanzado'}</option></select>
            </div>
          </div>
          <div class="form-lbl">${COACH_LANG==='en'?'Muscles worked':'Músculos trabajados'}</div>
          <input class="inp" id="new_ex_musculos" placeholder="${COACH_LANG==='en'?'E.g. Upper chest, triceps, front delts':'Ej: Pectoral superior, tríceps, deltoide anterior'}"/>
          <div class="form-lbl">${COACH_LANG==='en'?'Custom image or GIF URL':'URL de imagen o GIF personalizado'}</div>
          <input class="inp" id="new_ex_imagen" placeholder="https://..."/>
          <button class="btn" style="width:100%;padding:12px;background:#166534;color:#86efac" onclick="crearEjercicioManual()">${COACH_LANG==='en'?'Create exercise':'Crear ejercicio'}</button>
          <div id="new_ex_msg" style="font-size:12px;margin-top:8px;min-height:18px;color:var(--tx3)"></div>
        </div>
      </div>
    </div>
  </div>

  <div id="rb_dias_wrap" style="display:none">
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-hdr">2. ${COACH_LANG==='en'?'Training days':'Días de entreno'} <button class="sec-act" onclick="rbAddDia()">+ ${COACH_LANG==='en'?'Add day':'Añadir día'}</button></div>
      <div id="rb_dias_list"><div style="font-size:13px;color:var(--tx3)">${COACH_LANG==='en'?'Select a client first':'Selecciona un cliente primero'}</div></div>
    </div>
    <!-- PANEL AÑADIR EJERCICIO -->
    <div id="rb_add_panel" style="display:none;position:fixed;inset:0;background:rgba(9,9,11,.92);z-index:200;flex-direction:column;align-items:center;justify-content:center;padding:20px">
      <div style="background:var(--s);border:0.5px solid var(--br);border-radius:16px;padding:20px;width:100%;max-width:420px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div>
            <div style="font-size:10px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">${COACH_LANG==='en'?'Add exercise':'Añadir ejercicio'}</div>
            <div style="font-size:16px;font-weight:700;color:var(--sv)" id="rb_add_title"></div>
          </div>
          <button onclick="document.getElementById('rb_add_panel').style.display='none'" style="background:none;border:none;color:var(--tx3);font-size:22px;cursor:pointer;line-height:1">×</button>
        </div>
        <input type="hidden" id="rb_add_nombre"/>
        <input type="hidden" id="rb_add_musculos"/>
        <div class="g2" style="gap:10px;margin-bottom:10px">
          <div><div class="form-lbl">${COACH_LANG==='en'?'Sets':'Series'}</div><input class="inp" id="rb_add_series" type="number" value="3" min="1" max="10" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/></div>
          <div><div class="form-lbl">Reps</div><input class="inp" id="rb_add_reps" value="10-12" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/></div>
          <div><div class="form-lbl">${COACH_LANG==='en'?'Target weight (lb)':'Peso objetivo (kg)'}</div><input class="inp" id="rb_add_peso" type="number" value="0" step="2.5" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/></div>
          <div><div class="form-lbl">${COACH_LANG==='en'?'Rest (sec)':'Descanso (seg)'}</div><input class="inp" id="rb_add_descanso" type="number" value="90" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/></div>
          <div style="display:flex;flex-direction:column;justify-content:flex-end">
            <div class="form-lbl">RIR</div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;height:44px;padding:0 8px;background:var(--s2);border:0.5px solid var(--br);border-radius:10px">
              <input type="checkbox" id="rb_add_rir_on" style="width:18px;height:18px;cursor:pointer;accent-color:var(--bl2)" onchange="toggleRirPanel(this.checked)"/>
              <span style="font-size:13px;color:var(--sv2);font-weight:600">${COACH_LANG==='en'?'Enable':'Activar'}</span>
            </label>
          </div>
          <div id="rb_rir_val_wrap" style="display:none">
            <div class="form-lbl">${COACH_LANG==='en'?'RIR value':'Valor RIR'}</div>
            <input class="inp" id="rb_add_rir" type="number" value="2" min="0" max="5" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/>
          </div>
        </div>
        <label style="display:flex;align-items:center;gap:10px;margin-bottom:12px;cursor:pointer;padding:10px 12px;background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.25);border-radius:10px">
          <input type="checkbox" id="rb_add_principal" style="width:18px;height:18px;cursor:pointer;accent-color:#f59e0b"/>
          <div><div style="font-size:13px;font-weight:700;color:var(--amb)">⭐ ${COACH_LANG==='en'?'Main exercise':'Ejercicio principal'}</div><div style="font-size:11px;color:var(--tx3)">${COACH_LANG==='en'?'Shows in progress charts':'Aparece en gráficas de progreso'}</div></div>
        </label>
        <div class="form-lbl">${COACH_LANG==='en'?'YouTube link (optional)':'Link YouTube (opcional)'}</div>
        <input class="inp" id="rb_add_yt" placeholder="https://youtube.com/shorts/..." style="margin-bottom:8px"/>
        <div class="form-lbl">${COACH_LANG==='en'?'Note for client (optional)':'Nota para el cliente (opcional)'}</div>
        <input class="inp" id="rb_add_nota" placeholder="${COACH_LANG==='en'?'E.g. last set to failure, control the descent...':'Ej: última serie al fallo, controla la bajada...'}" style="margin-bottom:14px"/>
        <div style="display:flex;gap:10px">
          <button class="btn" style="flex:1;padding:13px;font-size:15px" id="rb_add_btn" onclick="rbConfirmAdd()">✓ ${COACH_LANG==='en'?'Add exercise':'Añadir ejercicio'}</button>
          <button onclick="document.getElementById('rb_add_panel').style.display='none'" style="padding:13px 16px;border:0.5px solid var(--br);border-radius:10px;background:none;color:var(--tx3);cursor:pointer;font-family:inherit;font-size:14px">${COACH_LANG==='en'?'Cancel':'Cancelar'}</button>
        </div>
      </div>
    </div>

    <div id="rb_ex_panel" style="display:none">
      <div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">3. ${COACH_LANG==='en'?'Add exercise →':'Añadir ejercicio →'} <span id="rb_dia_lbl" style="color:var(--blg);text-transform:none;letter-spacing:0;font-size:13px"></span></div>
        <div id="rb_client_alert" style="display:none;margin-bottom:10px"></div>
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
          <select class="inp" id="rb_grupo" onchange="rbBuscar()" style="flex:1;min-width:130px;margin-bottom:0">
            <option value="All">${COACH_LANG==='en'?'All muscle groups':'Todos los grupos'}</option>
            <option>Chest</option><option>Back</option><option>Shoulders</option><option>Biceps</option><option>Triceps</option><option>Legs</option><option>Abs</option>
          </select>
          <input class="inp" id="rb_buscar" placeholder="${COACH_LANG==='en'?'Search...':'Buscar...'}" style="flex:2;min-width:140px;margin-bottom:0" oninput="rbBuscar()"/>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
          <button class="btn btn-sm" style="background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);font-size:11px" onclick="rbFiltrarIA()">🤖 ${COACH_LANG==='en'?'Filter by client profile':'Filtrar por perfil del cliente'}</button>
          <button class="btn btn-sm" style="background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);font-size:11px" onclick="rbLimpiarFiltro()">✕ ${COACH_LANG==='en'?'Clear filter':'Quitar filtro'}</button>
        </div>
        <div id="rb_ia_filter_msg" style="display:none;margin-bottom:8px"></div>
        <div id="rb_ex_lista" style="width:100%"></div>
      </div>
    </div>
    <div class="sec" style="margin-bottom:12px;background:rgba(37,99,235,.05);border-color:rgba(59,130,246,.2)">
      <div class="sec-hdr">🤖 ${COACH_LANG==='en'?'Generate full routine with AI':'Generar rutina completa con IA'}</div>
      <div style="font-size:13px;color:var(--tx3);margin-bottom:10px">${COACH_LANG==='en'?'AI generates the full week automatically for the selected client.':'La IA genera toda la semana automáticamente para el cliente seleccionado.'}</div>
      <button class="btn" style="width:100%;padding:12px" onclick="rbGenerarIA()">${COACH_LANG==='en'?'Generate routine with AI':'Generar rutina con IA'}</button>
      <div id="rb_ia_result" style="margin-top:10px"></div>
    </div>
  </div>`;}


function hCoachSelectClientCard(c,i,mode,selId){
  const a=ac(i);
  const esMio=!c.coach_id || c.coach_id===USER.id;
  const coachLabel=esMio?(USER.nombre||USER.username||'Coach'):(c.coach_nombre||'Partner');
  const avatar=c.foto_perfil
    ? `<img src="${c.foto_perfil}" alt="${c.nombre||''}"/>`
    : `<span>${ini(c.nombre)}</span>`;
  const selected=String(c.id)===String(selId||'');
  const semanas=c.semanas_activo!=null?c.semanas_activo:(c.semanas||0);
  const click=mode==='rb'?`rbSelTarjeta(${c.id},this)`:mode==='db'?`dbSelTarjeta(${c.id},this)`:'';
  return `<div class="cc cliente-card ${esMio?'own':'partner'}" onclick="${click}" data-id="${c.id}" style="${selected?'border:2px solid var(--bl);':''}">
    <div class="cliente-coach-badge" style="background:${esMio?'rgba(59,130,246,.18)':'rgba(168,85,247,.18)'};color:${esMio?'#93c5fd':'#d8b4fe'}">${esMio?'🔵':'🟣'} ${coachLabel}</div>
    <div class="cliente-card-main">
      <div class="cliente-avatar" style="background:${a.bg};color:${a.tx};border-color:${esMio?'rgba(59,130,246,.45)':'rgba(168,85,247,.45)'}">${avatar}</div>
      <div class="cliente-info">
        <div class="cliente-name">${c.nombre}</div>
        <div class="cliente-meta">${tc(c.objetivo||'—')} · ${tc(c.nivel||'')}</div>
      </div>
    </div>
    <div class="cliente-tags">
      <span class="badge b-sv">${tc('Sem')} ${semanas}</span>
      ${c.peso_actual?`<span class="badge b-bl">${c.peso_actual}kg</span>`:''}
    </div>
    ${selected?`<div style="position:absolute;top:10px;left:10px;width:18px;height:18px;border-radius:50%;background:var(--bl);display:flex;align-items:center;justify-content:center;z-index:3"><svg width="10" height="10" viewBox="0 0 10 8" fill="none"><polyline points="1,4 4,7 9,1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`:''}
  </div>`;
}

async function initRutinas(){
  const cl=await api('/clientes');
  window._rbClientes=cl;
  rbRenderTarjetas(cl);
  // Load saved exercise configs
  try{ window.exConfig=await api('/ejercicios-config'); }catch(e){ window.exConfig={}; }
}

function rbRenderTarjetas(clientes){
  const grid=document.getElementById('rb_cl_grid');
  if(!grid)return;
  if(!clientes.length){grid.innerHTML=`<div class="wm-empty-clients" style="padding:22px 12px"><div class="wm-empty-title">${COACH_LANG==='en'?'No clients yet.':'Sin clientes aún.'}</div></div>`;return;}
  const selId=document.getElementById('rb_cl')?.value;
  grid.innerHTML=clientes.map((c,i)=>hCoachSelectClientCard(c,i,'rb',selId)).join('');
}

function rbFiltrarTarjetas(){
  const q=(document.getElementById('rb_cl_buscar')?.value||'').toLowerCase();
  const cl=(window._rbClientes||[]).filter(c=>!q||(c.nombre||'').toLowerCase().includes(q));
  rbRenderTarjetas(cl);
}

function rbSelTarjeta(id,card){
  document.querySelectorAll('#rb_cl_grid > div').forEach(d=>{ d.style.border='0.5px solid var(--br)'; d.querySelector('[style*="border-radius:50%;background:var(--bl)"]')?.remove(); });
  card.style.border='2px solid var(--bl)';
  const chk=document.createElement('div');
  chk.innerHTML=`<div style="position:absolute;top:8px;right:8px;width:16px;height:16px;border-radius:50%;background:var(--bl);display:flex;align-items:center;justify-content:center"><svg width="9" height="9" viewBox="0 0 10 8" fill="none"><polyline points="1,4 4,7 9,1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  card.appendChild(chk.firstChild);
  document.getElementById('rb_cl').value=id;
  rbSelCliente(id);
}

async function rbSelCliente(id){
  if(!id)return;
  rbState.clienteId=id;
  document.getElementById('rb_dias_wrap').style.display='block';
  await rbLoadDias();
}

async function rbLoadDias(){
  const c=await api('/clientes/'+rbState.clienteId);
  const wrap=document.getElementById('rb_dias_list');
  if(!c.dias.length){wrap.innerHTML=`<div style="font-size:13px;color:var(--tx3)">${tc('Sin días. Añade el primero arriba.')}</div>`;return;}
  wrap.innerHTML=c.dias.map((d,i)=>`
    <div class="dia-card">
      <div class="dia-hdr" onclick="rbToggleDia(${d.id})">
        <div class="dia-hdr-left"><div class="dia-nombre">${d.nombre}</div><div class="dia-grupo">${tc(d.grupo)||d.grupo} · ${d.ejercicios.length}${COACH_LANG==='en'?' exercises':' ejercicios'}</div></div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="btn btn-sm" onclick="event.stopPropagation();rbEditDia(${d.id})" style="font-size:11px;background:rgba(59,130,246,.08);border-color:rgba(59,130,246,.25);color:var(--blg)">✏️</button>
          <button onclick="event.stopPropagation();rbDelDia(${d.id})" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:15px;padding:2px 5px">🗑</button>
          <button class="btn btn-sm" onclick="event.stopPropagation();rbOpenEx(${d.id},'${d.nombre.replace(/'/g,"\\'")}','${(d.grupo||'').replace(/'/g,"\\'")}')">${COACH_LANG==='en'?'+ Exercise':'+ Ejercicio'}</button>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="color:var(--tx3)"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
      </div>
      <div class="dia-body ${rbState.diaOpen[d.id]?'open':''}" id="dia_body_${d.id}">
        ${d.ejercicios.map(e=>`<div class="ex-row">
          ${renderExImg(e.nombre, 44, e.grupo||EX_GROUP_MAP[e.nombre]||'')}
          <div class="ex-row-info"><div class="ex-row-nombre">${e.nombre}</div><div class="ex-row-detail">${e.series}×${e.reps}${e.peso_objetivo>0?' · '+e.peso_objetivo+'kg':''} · ${e.descanso}s${e.rir!=null?' · RIR '+e.rir:''}</div>${e.es_principal?`<span style="font-size:10px;color:var(--amb);font-weight:700">⭐ Principal</span>`:''}${e.nota_coach?`<div style="font-size:10px;color:var(--amb);font-weight:600;margin-top:2px">📝 ${e.nota_coach}</div>`:''}</div>
          <div style="display:flex;gap:4px"><button onclick="rbEditEx(${e.id})" style="background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);border-radius:6px;color:var(--blg);cursor:pointer;font-size:12px;padding:4px 8px;font-weight:600">✏️</button><button onclick="rbDelEx(${e.id})" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:16px;padding:4px">✕</button></div>
        </div>`).join('')||`<div style="font-size:12px;color:var(--tx3);padding:8px 0">${tc('Sin ejercicios aún.')}</div>`}
      </div>
    </div>`).join('');

  // Botón enviar rutina al cliente
  const totalEjercicios = c.dias.reduce((acc,d)=>acc+d.ejercicios.length,0);
  wrap.innerHTML += `
    <div style="margin-top:16px;padding-top:14px;border-top:0.5px solid var(--br)">
      <button onclick="rbEnviarRutinaCliente()" class="btn" style="width:100%;padding:14px;font-size:15px;font-weight:700;background:linear-gradient(135deg,#16a34a,#15803d);border-radius:12px;letter-spacing:.01em" id="rb_btn_enviar">
        📤 ${COACH_LANG==='en'?'Send routine to client':'Enviar rutina al cliente'}
      </button>
      <div style="font-size:11px;color:var(--tx3);text-align:center;margin-top:6px">${c.dias.length} ${COACH_LANG==='en'?'days':'días'} · ${totalEjercicios} ${COACH_LANG==='en'?'exercises':'ejercicios'} ${COACH_LANG==='en'?'configured':'configurados'}</div>
      <div id="rb_enviar_msg" style="font-size:12px;text-align:center;margin-top:6px;min-height:18px"></div>
    </div>`;
}

async function rbBuscar(){
  const g=document.getElementById('rb_grupo')?.value||'All';
  const b=document.getElementById('rb_buscar')?.value||'';
  const p=new URLSearchParams();
  if(g&&g!=='All')p.append('grupo',g);
  if(b)p.append('buscar',b);
  const exs=await api('/ejercicios-db?'+p);
  if(!exs.length){
    document.getElementById('rb_ex_lista').innerHTML=`<div style="color:var(--tx3);font-size:13px;padding:20px;text-align:center">${tc('Sin resultados')}</div>`;
    return;
  }
  // Group alphabetically
  const grouped={};
  exs.forEach(e=>{const l=e.nombre[0].toUpperCase();if(!grouped[l])grouped[l]=[];grouped[l].push(e);});
  const letters=Object.keys(grouped).sort();
  // Build AI filter maps
  const avoidMap={};
  const cautionMap={};
  if(rbExFilter){
    (rbExFilter.avoid||[]).forEach(x=>avoidMap[x.nombre]=x.razon);
    (rbExFilter.caution||[]).forEach(x=>cautionMap[x.nombre]=x.razon);
  }
  const html=letters.map(letter=>`
    <div style="padding:4px 0 2px;font-size:11px;font-weight:700;color:var(--sv3);border-bottom:0.5px solid var(--br);margin-bottom:4px;margin-top:8px">${letter}</div>
    ${grouped[letter].map(e=>{
      const isAvoid=rbExFilter?avoidMap[e.nombre]||null:null;
      const isCaution=rbExFilter?cautionMap[e.nombre]||null:null;
      const hasYt=window.exConfig&&window.exConfig[e.nombre]&&window.exConfig[e.nombre].youtube_url;
      return `<div style="display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:0.5px solid rgba(39,39,42,.4);cursor:${isAvoid?'not-allowed':'pointer'};${isAvoid?'opacity:.6;background:rgba(239,68,68,.05)':isCaution?'background:rgba(245,158,11,.04)':''}" ${!isAvoid?`onclick="rbAddEx('${e.nombre.replace(/'/g,"\'")}','${e.musculos.replace(/'/g,"\'")}')"`:''}>
        ${renderExImg(e.nombre, 48, e.grupo)}
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
            <span style="font-size:14px;font-weight:700;color:${isAvoid?'#fca5a5':isCaution?'var(--amb)':'var(--sv)'}">${e.nombre}</span>
            ${isAvoid?'<span style="font-size:9px;background:rgba(239,68,68,.2);color:#fca5a5;padding:1px 5px;border-radius:4px;font-weight:700">⛔ NO</span>':''}
            ${isCaution&&!isAvoid?'<span style="font-size:9px;background:rgba(245,158,11,.2);color:var(--amb);padding:1px 5px;border-radius:4px;font-weight:700">⚠️</span>':''}
            ${hasYt?'<span style="font-size:9px;background:rgba(239,68,68,.15);color:#fca5a5;padding:1px 5px;border-radius:4px;font-weight:700">▶</span>':''}
          </div>
          <div style="font-size:12px;color:var(--tx3);margin-top:2px">${e.grupo}</div>
          ${isAvoid?`<div style="font-size:11px;color:#fca5a5;margin-top:2px">${isAvoid}</div>`:''}
          ${isCaution&&!isAvoid?`<div style="font-size:11px;color:var(--amb);margin-top:2px">${isCaution}</div>`:''}
        </div>
        ${!isAvoid?'<span style="color:var(--blg);font-size:22px;font-weight:300;flex-shrink:0">+</span>':'<span style="font-size:18px">🚫</span>'}
      </div>`;
    }).join('')}
  `).join('');
  document.getElementById('rb_ex_lista').innerHTML=`<div style="max-height:480px;overflow-y:auto;padding-right:4px">${html}</div>`;
  exs.slice(0,20).forEach(e=>fetchWgerImg(e.nombre));
}

function rbToggleDia(id){rbState.diaOpen[id]=!rbState.diaOpen[id];const b=document.getElementById('dia_body_'+id);if(b)b.classList.toggle('open',rbState.diaOpen[id]);}

// ── Editar nombre/grupo de un día ──────────────────────────────
async function rbEditDia(diaId){
  const c = await api('/clientes/'+rbState.clienteId);
  const d = c.dias.find(x=>x.id===diaId);
  if(!d) return;
  const panel = document.getElementById('rb_dia_panel');
  if(!panel) return;
  // Precargar valores actuales
  document.getElementById('rb_dia_nombre').value = d.nombre;
  document.getElementById('rb_dia_grupo').value = d.grupo || '';
  // Cambiar botón a modo editar
  const btn = document.getElementById('rb_dia_btn');
  btn.textContent = COACH_LANG==='en'?'✓ Save changes':'✓ Guardar cambios';
  btn.onclick = () => rbSaveEditDia(diaId);
  applyCoachLang(panel);
  panel.style.cssText = 'display:flex!important;position:fixed;inset:0;background:rgba(9,9,11,.95);z-index:9999;flex-direction:column;align-items:center;justify-content:center;padding:20px';
}

async function rbSaveEditDia(diaId){
  const n = document.getElementById('rb_dia_nombre').value.trim();
  const g = document.getElementById('rb_dia_grupo').value.trim();
  if(!n||!g) return;
  const btn = document.getElementById('rb_dia_btn');
  btn.textContent = COACH_LANG==='en'?'Saving...':'Guardando...'; btn.disabled = true;
  try {
    await api('/dias/'+diaId,{method:'PUT',body:JSON.stringify({nombre:n,grupo:g})});
    document.getElementById('rb_dia_panel').style.display='none';
    document.getElementById('rb_dia_nombre').value='';
    document.getElementById('rb_dia_grupo').value='';
    // Restaurar botón a modo añadir para la próxima vez
    btn.textContent = tc('✓ Añadir día'); btn.disabled=false;
    btn.onclick = rbConfirmDia;
    await rbLoadDias();
  } catch(e){ btn.textContent='Error'; btn.disabled=false; }
}

async function rbDelDia(diaId){
  if(!confirm(COACH_LANG==='en'?'Delete this day and all its exercises?':'¿Eliminar este día y todos sus ejercicios?')) return;
  try {
    await api('/dias/'+diaId,{method:'DELETE'});
    await rbLoadDias();
  } catch(e){ alert('Error al eliminar'); }
}

// ── Enviar rutina al cliente (notificación push + mensaje) ──────
async function rbEnviarRutinaCliente(){
  const btn = document.getElementById('rb_btn_enviar');
  const msg = document.getElementById('rb_enviar_msg');
  if(!rbState.clienteId){ if(msg) msg.textContent=COACH_LANG==='en'?'Select a client first':'Selecciona un cliente primero'; return; }
  if(btn){ btn.disabled=true; btn.textContent='⏳ '+(COACH_LANG==='en'?'Sending...':'Enviando...'); }
  try {
    const c = await api('/clientes/'+rbState.clienteId);
    const resumen = c.dias.map(d=>`${d.nombre} (${d.grupo||''}) · ${d.ejercicios.length} ej.`).join(' | ');
    const mensaje = COACH_LANG==='en'
      ? `📋 New routine ready for you! ${c.dias.length} training days: ${resumen}`
      : `📋 ¡Tu nueva rutina está lista! ${c.dias.length} días de entreno: ${resumen}`;
    await api('/notificaciones/coach',{method:'POST',body:JSON.stringify({tipo:'rutina_enviada',mensaje,cliente_id:rbState.clienteId})});
    if(btn){ btn.disabled=false; btn.textContent='✓ '+(COACH_LANG==='en'?'Routine sent!':'¡Rutina enviada!'); btn.style.background='#15803d'; }
    if(msg){ msg.style.color='#86efac'; msg.textContent=COACH_LANG==='en'?`Sent to ${c.nombre}`:`Enviada a ${c.nombre}`; }
    setTimeout(()=>{
      if(btn){ btn.textContent='📤 '+(COACH_LANG==='en'?'Send routine to client':'Enviar rutina al cliente'); btn.style.background=''; btn.disabled=false; }
      if(msg) msg.textContent='';
    }, 3000);
  } catch(e){
    if(btn){ btn.disabled=false; btn.textContent='📤 '+(COACH_LANG==='en'?'Send routine to client':'Enviar rutina al cliente'); }
    if(msg){ msg.style.color='#f87171'; msg.textContent='Error al enviar'; }
  }
}

function rbAddDia(){
  const panel = document.getElementById('rb_dia_panel');
  if(!panel){ alert('Error: panel no encontrado'); return; }
  // Apply language translations to static panel
  applyCoachLang(panel);
  panel.style.cssText = 'display:flex!important;position:fixed;inset:0;background:rgba(9,9,11,.95);z-index:9999;flex-direction:column;align-items:center;justify-content:center;padding:20px';
}

async function rbConfirmDia(){
  const n = document.getElementById('rb_dia_nombre').value.trim();
  const g = document.getElementById('rb_dia_grupo').value.trim();
  if(!n||!g) return;
  const btn = document.getElementById('rb_dia_btn');
  btn.textContent=(COACH_LANG==='en'?'Saving...':'Guardando...'); btn.disabled=true;
  try {
    await api('/clientes/'+rbState.clienteId+'/dias',{method:'POST',body:JSON.stringify({nombre:n,grupo:g})});
    document.getElementById('rb_dia_panel').style.display='none';
    document.getElementById('rb_dia_nombre').value='';
    document.getElementById('rb_dia_grupo').value='';
    btn.textContent=tc('✓ Añadir día'); btn.disabled=false;
    await rbLoadDias();
  } catch(e) { btn.textContent='Error'; btn.disabled=false; }
}

function rbOpenEx(diaId,diaNombre){
  rbState.diaId=diaId;rbState.diaNombre=diaNombre;
  document.getElementById('rb_ex_panel').style.display='block';
  document.getElementById('rb_dia_lbl').textContent=diaNombre;
  document.getElementById('rb_ex_panel').scrollIntoView({behavior:'smooth'});
  rbBuscar();
}

function rbAddEx(nombre, musculos){
  const cfg=(window.exConfig&&window.exConfig[nombre])||{};
  // Show inline panel instead of prompts
  const panel = document.getElementById('rb_add_panel');
  const title = document.getElementById('rb_add_title');
  if(!panel||!title) return;
  title.textContent = nombre;
  document.getElementById('rb_add_nombre').value = nombre;
  document.getElementById('rb_add_musculos').value = musculos;
  document.getElementById('rb_add_series').value = '3';
  document.getElementById('rb_add_reps').value = '10-12';
  document.getElementById('rb_add_peso').value = '0';
  document.getElementById('rb_add_descanso').value = '90';
  document.getElementById('rb_add_yt').value = cfg.youtube_url||'';
  document.getElementById('rb_add_nota').value = cfg.nota_default||'';
  panel.style.display = 'flex';
  panel.scrollIntoView({behavior:'smooth'});
}

async function rbConfirmAdd(){
  const nombre = document.getElementById('rb_add_nombre').value.trim();
  const musculos = document.getElementById('rb_add_musculos').value||'';
  const series = parseInt(document.getElementById('rb_add_series').value)||3;
  const reps = document.getElementById('rb_add_reps').value||'10-12';
  const peso = parseFloat(document.getElementById('rb_add_peso').value)||0;
  const descanso = parseInt(document.getElementById('rb_add_descanso').value)||90;
  const rirOn = document.getElementById('rb_add_rir_on')?.checked;
  const rir = rirOn ? (parseInt(document.getElementById('rb_add_rir').value)||2) : null;
  const esPrincipal = document.getElementById('rb_add_principal')?.checked ? 1 : 0;
  const youtube = document.getElementById('rb_add_yt')?.value||'';
  const nota = document.getElementById('rb_add_nota')?.value||'';
  const diaId = rbState.diaId;

  if(!nombre){ alert('Selecciona un ejercicio primero'); return; }
  if(!diaId){ alert('Error: no se ha seleccionado un día'); return; }

  const btn = document.getElementById('rb_add_btn');
  if(!btn) return;
  btn.innerHTML = '⏳ '+(COACH_LANG==='en'?'Saving...':'Guardando...');
  btn.disabled = true;

  try {
    const res = await api('/dias/'+diaId+'/ejercicios',{method:'POST',body:JSON.stringify({
      nombre,musculos,series,reps,peso_objetivo:peso,descanso,rir,es_principal:esPrincipal,youtube_url:youtube,nota_coach:nota
    })});
    if(res && res.error){ throw new Error(res.error); }
    btn.innerHTML = '✓ '+tc('Añadir ejercicio');
    btn.disabled = false;
    document.getElementById('rb_add_panel').style.display='none';
    rbState.diaOpen[diaId]=true;
    await rbLoadDias();
  } catch(e) {
    console.error('rbConfirmAdd error:', e);
    btn.innerHTML = 'Error: '+e.message.substring(0,30);
    btn.disabled = false;
  }
}

async function rbDelEx(id){
  if(!confirm(tc('¿Eliminar?')))return;
  await api('/ejercicios/'+id,{method:'DELETE'});
  await rbLoadDias();
}

async function rbGenerarIA(){
  const res=document.getElementById('rb_ia_result');
  if(!rbState.clienteId){res.innerHTML=`<div style="color:#f87171;font-size:13px">${tc('Selecciona un cliente primero')}</div>`;return;}
  res.innerHTML=`<div class="ia-chip"><div class="ia-chip-title">${COACH_LANG==='en'?'Generating routine...':'Generando rutina...'}</div></div>`;
  const c=await api('/clientes/'+rbState.clienteId);
  try{
    const semanas = c.semanas || 1;
    const fase = semanas % 4 === 0 ? 'semana de descarga (reduce 40% volumen)' : `semana ${semanas%4||4} de mesociclo (carga progresiva)`;
    const volPorNivel = {Principiante:'10-12 series/semana/grupo muscular', Intermedio:'14-16 series/semana/grupo muscular', Avanzado:'16-20+ series/semana/grupo muscular'};
    const volObj = volPorNivel[c.nivel] || volPorNivel.Intermedio;
    const d=await api('/ia/chat',{method:'POST',body:JSON.stringify({messages:[{role:'user',content:`Genera una rutina de entrenamiento con pesas para ${c.nombre}. 
Objetivo: ${c.objetivo}. Nivel: ${c.nivel}. Semana ${semanas} (${fase}).
Volumen objetivo: ${volObj}.
${c.lesiones?'LESIONES/LIMITACIONES: '+c.lesiones+'. Evita ejercicios contraindicados.':''}
${c.observaciones?'Observaciones: '+c.observaciones:''}
Días disponibles: 4.
Para cada día indica: nombre del día, grupo muscular, y lista de ejercicios con series × reps, peso orientativo inicial en kg, descanso en segundos, y RIR objetivo (2-3 para volumen, 1-2 para intensidad).
Aplica periodización ondulante: varía intensidad y volumen entre días. Sé específico y práctico.`}],system:COACH_LANG==='en'?'You are an expert in periodization and strength programming. Generate complete routines. Always respond in English.':'Eres un experto en periodización y programación de fuerza. Generas rutinas completas. Responde siempre en español.'})});
    res.innerHTML=`<div class="ia-chip"><div class="ia-chip-title">${COACH_LANG==='en'?'Routine generated for':'Rutina generada para'} ${c.nombre}</div><div class="ia-result-body" style="white-space:pre-line">${d.reply}</div></div>`;
  }catch(e){res.innerHTML=`<div style="color:#f87171;font-size:13px">${COACH_LANG==='en'?'Error generating. Check the API key.':'Error generando. Verifica la API key.'}</div>`;}
}


// ═══ MI EQUIPO — GESTIÓN DE COACHES ══════════════════════════════
function hEquipo(){
  const isAdmin = USER.username === 'wolf';
  return`
  <!-- MI PERFIL COACH -->
  <div style="background:var(--s);border:0.5px solid var(--br);border-radius:14px;padding:16px;margin-bottom:16px">
    <div style="font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px">👤 ${COACH_LANG==='en'?'My coach profile':'Mi perfil de coach'}</div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
      <div style="position:relative;cursor:pointer" onclick="document.getElementById('coach_foto_input').click()">
        <div id="coach_perfil_avatar" style="width:60px;height:60px;border-radius:50%;background:var(--bl2);overflow:hidden;border:2px solid rgba(59,130,246,.4);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff">
          ${USER.foto_perfil?`<img src="${USER.foto_perfil}" style="width:100%;height:100%;object-fit:cover"/>`:(USER.nombre?.[0]?.toUpperCase()||'C')}
        </div>
        <div style="position:absolute;bottom:0;right:0;width:20px;height:20px;background:var(--bl2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;border:2px solid var(--b)">📷</div>
      </div>
      <div>
        <div style="font-size:15px;font-weight:700;color:var(--sv)">${USER.nombre||USER.username}</div>
        <div style="font-size:12px;color:var(--blg);margin-top:2px">@${USER.username}</div>
        <div style="font-size:11px;color:var(--tx3);margin-top:3px">${COACH_LANG==='en'?'Tap photo to change':'Toca la foto para cambiar'}</div>
      </div>
    </div>
    <div class="g2" style="gap:8px;margin-bottom:10px">
      <div>
        <div class="form-lbl">${COACH_LANG==='en'?'Display name':'Nombre visible'}</div>
        <input class="inp" id="coach_edit_nombre" value="${USER.nombre||''}" placeholder="${COACH_LANG==='en'?'E.g. Steven García':'Ej: Steven García'}" style="margin-bottom:0"/>
      </div>
      <div>
        <div class="form-lbl">${COACH_LANG==='en'?'Email (optional)':'Email (opcional)'}</div>
        <input class="inp" id="coach_edit_email" value="${USER.email||''}" placeholder="coach@email.com" style="margin-bottom:0"/>
      </div>
    </div>
    <button onclick="guardarPerfilCoach()" class="btn" style="width:100%;padding:11px;background:var(--bl2)">✓ ${COACH_LANG==='en'?'Save profile':'Guardar perfil'}</button>
    <div id="coach_perfil_msg" style="font-size:12px;text-align:center;margin-top:6px;height:18px"></div>

    <!-- Cambio de contraseña del coach -->
    <div style="margin-top:16px;padding-top:16px;border-top:0.5px solid var(--br)">
      <div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">🔑 ${COACH_LANG==='en'?'Change my password':'Cambiar mi contraseña'}</div>
      <input class="inp" id="coach_pass_old" type="password" placeholder="${COACH_LANG==='en'?'Current password':'Contraseña actual'}" style="margin-bottom:8px"/>
      <input class="inp" id="coach_pass_new" type="password" placeholder="${COACH_LANG==='en'?'New password (min. 6 chars)':'Nueva contraseña (mín. 6 caracteres)'}" style="margin-bottom:8px"/>
      <input class="inp" id="coach_pass_rep" type="password" placeholder="${COACH_LANG==='en'?'Repeat new password':'Repite la nueva contraseña'}" style="margin-bottom:10px"/>
      <button onclick="cambiarPasswordCoach()" class="btn" style="width:100%;padding:10px;background:var(--s3);border:0.5px solid var(--br);color:var(--sv)">${COACH_LANG==='en'?'Update password':'Actualizar contraseña'}</button>
      <div id="coach_pass_msg" style="font-size:11px;text-align:center;margin-top:6px;height:16px"></div>
    </div>
  </div>

  <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.08em;color:var(--sv);margin-bottom:4px">${tc('Mi equipo')}</div>
  <div style="font-size:13px;color:var(--tx3);margin-bottom:20px">${tc('Coaches de WolfMindset')}</div>

  <!-- LISTA DE COACHES -->
  <div id="equipo_lista" style="margin-bottom:24px">
    <div style="font-size:13px;color:var(--tx3);padding:20px;text-align:center">${tc('Cargando...')}</div>
  </div>

  <!-- CREAR NUEVO COACH — solo admin wolf -->
  ${isAdmin ? `
  <div style="background:var(--s);border:0.5px solid var(--br);border-radius:16px;padding:18px">
    <div style="font-size:14px;font-weight:700;color:var(--sv);margin-bottom:14px">${tc('➕ Añadir nuevo coach')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div>
        <div class="form-lbl">${tc('Nombre completo')}</div>
        <input class="inp" id="eq_nombre" type="text" placeholder="Ej: María García" style="margin-bottom:0"/>
      </div>
      <div>
        <div class="form-lbl">${tc('Usuario (login)')}</div>
        <input class="inp" id="eq_user" type="text" placeholder="Ej: maria" style="margin-bottom:0"/>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div>
        <div class="form-lbl">${tc('Contraseña')}</div>
        <input class="inp" id="eq_pass" type="password" placeholder="${tc('Mín 6 caracteres')}" style="margin-bottom:0"/>
      </div>
      <div>
        <div class="form-lbl">${tc('Email (opcional)')}</div>
        <input class="inp" id="eq_email" type="email" placeholder="coach@email.com" style="margin-bottom:0"/>
      </div>
    </div>
    <div style="margin-bottom:14px">
      <div class="form-lbl">${tc('Idioma del panel')}</div>
      <select class="inp" id="eq_lang" style="margin-bottom:0">
        <option value="es">${tc('🇪🇸 Español')}</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>
    <div id="eq_msg" style="display:none;font-size:13px;margin-bottom:10px;padding:8px 12px;border-radius:8px"></div>
    <button class="btn" onclick="crearCoach()" style="width:100%;padding:12px">✓ ${tc('Crear coach') || (COACH_LANG==='en'?'Create coach':'Crear coach')}</button>
  </div>` : `
  <div style="background:var(--s);border:0.5px solid var(--br);border-radius:12px;padding:14px;text-align:center">
    <div style="font-size:13px;color:var(--tx3)">${tc('Solo el administrador puede crear nuevos coaches.')}</div>
  </div>`}`;
}

async function guardarPerfilCoach() {
  const nombre = document.getElementById('coach_edit_nombre')?.value?.trim();
  const email = document.getElementById('coach_edit_email')?.value?.trim();
  const msg = document.getElementById('coach_perfil_msg');
  if(!nombre) { msg.style.color='#f87171'; msg.textContent=COACH_LANG==='en'?'Name is required':'El nombre es obligatorio'; return; }
  try {
    await api('/me', {method:'PUT', body:JSON.stringify({nombre, email})});
    USER.nombre = nombre;
    USER.email = email;
    localStorage.setItem('wm_user', JSON.stringify(USER));
    updateCoachTopbar();
    msg.style.color='#86efac'; msg.textContent='✓ '+(COACH_LANG==='en'?'Saved':'Guardado');
    setTimeout(()=>{ if(msg) msg.textContent=''; }, 3000);
  } catch(e) { msg.style.color='#f87171'; msg.textContent=e.error||'Error'; }
}

async function cambiarPasswordCoach() {
  const old = document.getElementById('coach_pass_old')?.value?.trim();
  const nw  = document.getElementById('coach_pass_new')?.value?.trim();
  const rep = document.getElementById('coach_pass_rep')?.value?.trim();
  const msg = document.getElementById('coach_pass_msg');
  if(!msg) return;
  if(!old || !nw || !rep) { msg.style.color='#f87171'; msg.textContent=COACH_LANG==='en'?'Fill all fields':'Rellena todos los campos'; return; }
  if(nw.length < 6) { msg.style.color='#f87171'; msg.textContent=COACH_LANG==='en'?'Min. 6 characters':'Mínimo 6 caracteres'; return; }
  if(nw !== rep) { msg.style.color='#f87171'; msg.textContent=COACH_LANG==='en'?'Passwords do not match':'Las contraseñas no coinciden'; return; }
  try {
    const r = await api('/auth/change-my-password', { method:'POST', body: JSON.stringify({ password_actual: old, password_nueva: nw }) });
    if(r.ok) {
      msg.style.color='#86efac'; msg.textContent='✓ '+(COACH_LANG==='en'?'Password updated':'Contraseña actualizada');
      document.getElementById('coach_pass_old').value='';
      document.getElementById('coach_pass_new').value='';
      document.getElementById('coach_pass_rep').value='';
    } else {
      msg.style.color='#f87171'; msg.textContent=r.error||(COACH_LANG==='en'?'Error':'Error');
    }
  } catch(e) { msg.style.color='#f87171'; msg.textContent=e.error||(COACH_LANG==='en'?'Connection error':'Error de conexión'); }
  setTimeout(()=>{ if(msg) msg.textContent=''; }, 4000);
}

async function initEquipo(){
  try{
    const coaches = await api('/coaches');
    const lista = document.getElementById('equipo_lista');
    if(!lista) return;
    if(!coaches || !coaches.length){
      lista.innerHTML=`<div style="font-size:13px;color:var(--tx3);padding:12px;text-align:center">${tc('Solo tú por ahora.')}</div>`;
      return;
    }
    lista.innerHTML=`
      <div style="font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">${tc('Coaches activos')}</div>
      ${coaches.map(c=>`
        <div style="background:var(--s);border:0.5px solid var(--br);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:38px;height:38px;border-radius:50%;background:var(--bl2);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff">${c.nombre?c.nombre[0].toUpperCase():'C'}</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--sv)">${c.nombre||c.username}</div>
              <div style="font-size:11px;color:var(--tx3)">@${c.username} · ${c.lang==='en'?'🇬🇧 English':'🇪🇸 '+(COACH_LANG==='en'?'Spanish':'Español')}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            ${c.username!=='wolf'?`<button onclick="resetCoachPass(${c.id},'${c.nombre||c.username}')" style="background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);color:var(--blg);font-size:11px;font-weight:600;padding:5px 10px;border-radius:8px;cursor:pointer;font-family:inherit">🔑 Reset pass</button>
            <button onclick="eliminarCoach(${c.id},'${c.nombre||c.username}')" style="background:rgba(239,68,68,.1);border:0.5px solid rgba(239,68,68,.2);color:#fca5a5;font-size:11px;font-weight:600;padding:5px 10px;border-radius:8px;cursor:pointer;font-family:inherit">🗑</button>`:'<span style="font-size:11px;color:var(--sv3);background:rgba(34,197,94,.1);border:0.5px solid rgba(34,197,94,.2);padding:3px 8px;border-radius:6px">Admin</span>'}
          </div>
        </div>`).join('')}`;
  }catch(e){
    const lista=document.getElementById('equipo_lista');
    if(lista) lista.innerHTML=`<div style="font-size:13px;color:#fca5a5;padding:12px">${tc('Error cargando coaches. Actualiza el backend.')}</div>`;
  }
}

async function crearCoach(){
  const nombre=document.getElementById('eq_nombre').value.trim();
  const user=document.getElementById('eq_user').value.trim().toLowerCase();
  const pass=document.getElementById('eq_pass').value;
  const email=document.getElementById('eq_email').value.trim();
  const lang=document.getElementById('eq_lang').value;
  const msg=document.getElementById('eq_msg');

  if(!nombre||!user||!pass){msg.style.display='block';msg.style.background='rgba(239,68,68,.1)';msg.style.color='#fca5a5';msg.textContent=COACH_LANG==='en'?'Name, username and password are required.':'Nombre, usuario y contraseña son obligatorios.';return;}
  if(pass.length<6){msg.style.display='block';msg.style.background='rgba(239,68,68,.1)';msg.style.color='#fca5a5';msg.textContent=COACH_LANG==='en'?'Password must be at least 6 characters.':'La contraseña debe tener al menos 6 caracteres.';return;}

  try{
    await api('/coaches',{method:'POST',body:JSON.stringify({nombre,username:user,password:pass,email,lang})});
    msg.style.display='block';msg.style.background='rgba(34,197,94,.1)';msg.style.color='#86efac';
    msg.textContent=COACH_LANG==='en'?`✓ Coach "${nombre}" created. Login: ${user}`:`✓ Coach "${nombre}" creado. Login: ${user}`;
    document.getElementById('eq_nombre').value='';
    document.getElementById('eq_user').value='';
    document.getElementById('eq_pass').value='';
    document.getElementById('eq_email').value='';
    initEquipo(); // Recargar lista
  }catch(e){
    msg.style.display='block';msg.style.background='rgba(239,68,68,.1)';msg.style.color='#fca5a5';
    msg.textContent=e.error||'Error al crear el coach.';
  }
}

async function resetCoachPass(id, nombre){
  const newPass=prompt(COACH_LANG==='en'?`New password for ${nombre} (min 6 chars):` :`Nueva contraseña para ${nombre} (mín 6 chars):`);
  if(!newPass||newPass.length<6){alert(COACH_LANG==='en'?'Password too short.':'Contraseña demasiado corta.');return;}
  try{
    await api('/coaches/'+id+'/reset-password',{method:'POST',body:JSON.stringify({newPassword:newPass})});
    alert(COACH_LANG==='en'?`✓ Password for ${nombre} updated.`:`✓ Contraseña de ${nombre} actualizada.`);
  }catch(e){alert('Error: '+(e.error||'No se pudo actualizar'));}
}

async function eliminarCoach(id, nombre){
  if(!confirm(COACH_LANG==='en'?`Delete coach "${nombre}"? Their clients will NOT be deleted.`:`¿Eliminar el coach "${nombre}"? Sus clientes NO se eliminarán.`)) return;
  try{
    await api('/coaches/'+id,{method:'DELETE'});
    initEquipo();
  }catch(e){alert('Error: '+(e.error||'No se pudo eliminar'));}
}
// ═══════════════════════════════════════════════════════════════════
let rbExFilter = null; // null = no filter, object = {avoid:[], beginner:[], advanced:[]}

async function rbFiltrarIA(){
  const msgEl = document.getElementById('rb_ia_filter_msg');
  if(!rbState.clienteId){ msgEl.style.display='block'; msgEl.innerHTML=`<div style="color:#f87171;font-size:12px">${tc('Selecciona un cliente primero')}</div>`; return; }
  
  msgEl.style.display='block';
  msgEl.innerHTML=`<div class="ia-chip" style="padding:8px 12px;font-size:12px"><div class="ia-chip-title">${COACH_LANG==='en'?'Analysing client profile...':'Analizando perfil del cliente...'}</div></div>`;
  
  try {
    const c = await api('/clientes/'+rbState.clienteId);
    const exs = await api('/ejercicios-db');
    const exNames = exs.map(e=>e.nombre+' ('+e.grupo+', '+e.dificultad+')').join(', ');
    
    const prompt = `Analiza este perfil de cliente y esta lista de ejercicios. Indica cuáles NO debe hacer y por qué.

PERFIL DEL CLIENTE:
- Nivel: ${c.nivel}
- Objetivo: ${c.objetivo}
- Lesiones/problemas: ${c.lesiones||'ninguna'}
- Observaciones: ${c.observaciones||'ninguna'}
- Edad: ${c.edad||'no especificada'}

EJERCICIOS DISPONIBLES:
${exNames}

RESPONDE SOLO EN JSON con este formato exacto, sin texto adicional:
{
  "avoid": [{"nombre": "nombre exacto del ejercicio", "razon": "motivo breve"}],
  "caution": [{"nombre": "nombre exacto del ejercicio", "razon": "motivo breve"}],
  "nivel_ok": true
}

- "avoid": ejercicios que NO debe hacer por lesiones o contraindicaciones
- "caution": ejercicios con precaución por nivel o condición
- "nivel_ok": true si el nivel es adecuado para ejercicios avanzados`;

    const d = await api('/ia/chat', {method:'POST', body:JSON.stringify({
      messages:[{role:'user', content:prompt}],
      system:'Eres un fisioterapeuta y entrenador experto. Analiza perfiles de clientes y contraindicas ejercicios basándote en lesiones, nivel y condición física. Responde SOLO en JSON válido.'
    })});
    
    // Parse JSON response
    let filter;
    try {
      let clean = d.reply;
      // Extract JSON from markdown code blocks if present
      const jsonMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/);
      if(jsonMatch) clean = jsonMatch[1];
      else {
        // Try to find raw JSON object
        const objMatch = clean.match(/\{[\s\S]*\}/);
        if(objMatch) clean = objMatch[0];
      }
      filter = JSON.parse(clean.trim());
    } catch(e) {
      // If JSON parse fails, create empty filter with no restrictions
      console.log('IA filter parse error:', e, 'Reply:', d.reply);
      filter = { avoid: [], caution: [], nivel_ok: true };
    }
    
    rbExFilter = filter;
    
    const avoidCount = filter.avoid?.length||0;
    const cautionCount = filter.caution?.length||0;
    
    msgEl.innerHTML=`<div style="background:rgba(37,99,235,.08);border:0.5px solid rgba(59,130,246,.2);border-radius:10px;padding:10px 12px;font-size:12px">
      <div style="font-weight:700;color:var(--blg);margin-bottom:4px">🤖 Filtro aplicado para ${c.nombre}</div>
      ${avoidCount?`<div style="color:#fca5a5">⛔ ${avoidCount} ejercicio${avoidCount>1?'s':''} NO recomendado${avoidCount>1?'s':''}</div>`:''}
      ${cautionCount?`<div style="color:var(--amb)">⚠️ ${cautionCount} ejercicio${cautionCount>1?'s':''} con precaución</div>`:''}
      ${!avoidCount&&!cautionCount?`<div style="color:var(--gnb)">✓ Sin contraindicaciones para este cliente</div>`:''}
    </div>`;
    
    // Show client alert
    const alertEl = document.getElementById('rb_client_alert');
    if(c.lesiones || c.nivel !== 'Avanzado') {
      alertEl.style.display='block';
      alertEl.innerHTML=`<div style="background:rgba(239,68,68,.08);border:0.5px solid rgba(239,68,68,.2);border-radius:10px;padding:9px 12px;font-size:12px;display:flex;gap:8px;align-items:flex-start">
        <span style="font-size:16px">👤</span>
        <div>
          <span style="font-weight:700;color:#fca5a5">${c.nombre}</span>
          <span style="color:var(--tx3)"> · ${c.nivel} · ${c.objetivo}</span>
          ${c.lesiones?`<div style="color:#fca5a5;margin-top:2px">⚠️ ${c.lesiones}</div>`:''}
        </div>
      </div>`;
    }
    
    await rbBuscar();
    
  } catch(e) {
    msgEl.innerHTML='<div style="color:#f87171;font-size:12px">Error: '+( e.error||e.message||'inténtalo de nuevo')+'</div>';
  }
}

function rbLimpiarFiltro(){
  rbExFilter = null;
  document.getElementById('rb_ia_filter_msg').style.display='none';
  document.getElementById('rb_client_alert').style.display='none';
  rbBuscar();
}

// ═══ DIETA BUILDER ════════════════════════════════════
let dbState={clienteId:null,comidaId:null,comidaNombre:''};

function hDietaBuilder(){return`
  <div class="sec" style="margin-bottom:12px">
    <div class="sec-hdr" style="margin-bottom:10px">1. ${COACH_LANG==='en'?'Select client':'Selecciona cliente'}</div>
    <input class="inp" id="db_cl_buscar" placeholder="${COACH_LANG==='en'?'Search client...':'Buscar cliente...'}" oninput="dbFiltrarTarjetas()" style="margin-bottom:10px;font-size:13px"/>
    <div id="db_cl_grid" class="cc-grid clientes-card-grid"></div>
    <input type="hidden" id="db_cl" value=""/>
  </div>
  <div id="db_wrap" style="display:none">
    <div class="sec" style="margin-bottom:12px;background:rgba(37,99,235,.05);border-color:rgba(59,130,246,.2)">
      <div class="sec-hdr">🤖 ${COACH_LANG==='en'?'Generate AI diet plan':'Generar plan de dieta con IA'}</div>
      <div id="db_client_hint"></div>
      <div style="font-size:12px;color:var(--tx3);margin-bottom:12px;line-height:1.6">${tc('La IA usa automáticamente las kcal, macros, intolerancias y preferencias del cliente. Solo tienes que indicar los alimentos disponibles y el número de comidas.')}</div>

      <div class="form-lbl" style="display:flex;align-items:center;justify-content:space-between">
        ${tc('Alimentos disponibles')}
        <div style="display:flex;align-items:center;gap:12px">
          <button onclick="dbNuevoAlimento()" style="font-size:11px;color:var(--gnb);background:none;border:none;cursor:pointer;padding:0;touch-action:manipulation;font-weight:700">${tc('+ Nuevo alimento')}</button>
          <button onclick="dbLimpiarAlimentos()" style="font-size:11px;color:var(--tx3);background:none;border:none;cursor:pointer;padding:0;touch-action:manipulation">${tc('✕ Limpiar todo')}</button>
        </div>
      </div>

      <!-- Chips seleccionados visibles -->
      <div id="db_selected_chips" style="display:flex;flex-wrap:wrap;gap:5px;min-height:32px;padding:6px;background:var(--s2);border:0.5px solid var(--br);border-radius:10px;margin-bottom:8px">
        <span id="db_empty_hint" style="font-size:11px;color:var(--tx3);align-self:center">Tap a category to add foods →</span>
      </div>

      <!-- Categorías -->
      <div style="display:flex;gap:5px;margin-bottom:6px;flex-wrap:wrap">
        <button onclick="dbToggleCat(0,this)" data-cat="0" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">🥩 ${COACH_LANG==='en'?'Proteins':'Proteínas'}</button>
        <button onclick="dbToggleCat(1,this)" data-cat="1" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">🌾 ${COACH_LANG==='en'?'Carbs':'Carbos'}</button>
        <button onclick="dbToggleCat(2,this)" data-cat="2" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">🥑 ${COACH_LANG==='en'?'Fats':'Grasas'}</button>
        <button onclick="dbToggleCat(3,this)" data-cat="3" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">🥦 ${COACH_LANG==='en'?'Vegetables':'Verduras'}</button>
        <button onclick="dbToggleCat(4,this)" data-cat="4" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">🍎 ${COACH_LANG==='en'?'Fruits':'Frutas'}</button>
        <button onclick="dbToggleCat(5,this)" data-cat="5" style="padding:5px 12px;border-radius:20px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">☕ ${COACH_LANG==='en'?'Drinks':'Bebidas'}</button>
      </div>

      <!-- Lista de alimentos de la categoría activa -->
      <div id="db_alim_chips" style="display:none;flex-wrap:wrap;gap:5px;padding:8px;background:var(--s2);border:0.5px solid var(--br);border-radius:10px;margin-bottom:8px;max-height:140px;overflow-y:auto"></div>

      <!-- Favoritos guardados -->
      <div id="db_favoritos_wrap" style="display:none;margin-bottom:6px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
          <div style="font-size:10px;color:var(--amb);font-weight:700;text-transform:uppercase;letter-spacing:.08em">⭐ Mis favoritos</div>
        </div>
        <div id="db_favoritos_chips" style="display:flex;flex-wrap:wrap;gap:5px"></div>
      </div>

      <!-- Campo manual oculto - sync automático -->
      <input type="hidden" id="db_alimentos_input"/>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <button onclick="dbGuardarFavoritos()" id="btn_guardar_fav" style="font-size:11px;color:var(--gnb);background:none;border:none;cursor:pointer;padding:0;touch-action:manipulation;display:none">⭐ Save as favourite</button>
        <div style="font-size:11px;color:var(--tx3)" id="db_count_lbl"></div>
      </div>

      <div class="g2" style="gap:8px;margin-bottom:10px">
        <div>
          <div class="form-lbl">${COACH_LANG==='en'?'No. of meals':'Nº de comidas'}</div>
          <select class="inp" id="db_num_comidas" style="margin-bottom:0">
            <option value="2">${COACH_LANG==='en'?'2 meals':'2 comidas'}</option>
            <option value="3">${COACH_LANG==='en'?'3 meals':'3 comidas'}</option>
            <option value="4" selected>${COACH_LANG==='en'?'4 meals':'4 comidas'}</option>
            <option value="5">${COACH_LANG==='en'?'5 meals':'5 comidas'}</option>
            <option value="6">${COACH_LANG==='en'?'6 meals':'6 comidas'}</option>
          </select>
        </div>
        <div>
          <div class="form-lbl">${tc('Ajuste calórico')} <span style="font-size:10px;color:var(--tx3);font-weight:400">${tc('(opcional — usa el del cliente por defecto)')}</span></div>
          <select class="inp" id="db_objetivo_cal" style="margin-bottom:0">
            <option value="auto">${tc('Automático según objetivo del cliente')}</option>
            <option value="mantenimiento">${COACH_LANG==='en'?'Force maintenance':'Forzar mantenimiento'}</option>
            <option value="deficit">${tc('Forzar déficit (-300 kcal)')}</option>
            <option value="deficit_agresivo">${tc('Forzar déficit agresivo (-500 kcal)')}</option>
            <option value="superavit">${tc('Forzar superávit (+300 kcal)')}</option>
          </select>
        </div>
      </div>

      <div class="form-lbl">${tc('Notas adicionales (opcional)')}</div>
      <input class="inp" id="db_notas_extra" placeholder="${COACH_LANG==='en'?'E.g. prefers quick breakfasts, dinner before 8pm...':'Ej: prefiere desayunos rápidos, cena antes de las 20h...'}" style="margin-bottom:10px"/>

      <div class="form-lbl" style="display:flex;align-items:center;gap:6px">
        ${tc('🧪 Analíticas / déficits (opcional)')}
        <span style="font-size:10px;color:var(--tx3);font-weight:400">${tc('La IA recomendará suplementación')}</span>
      </div>
      <textarea class="ta" id="db_analiticas" placeholder="${COACH_LANG==='en'?'E.g. low Vitamin D (18 ng/ml), ferritin 12, B12 deficient, low omega-3...':'Ej: Vitamina D baja (18 ng/ml), ferritina 12, B12 deficiente, omega-3 bajo...'}" style="min-height:60px;margin-bottom:12px"></textarea>

      <button class="btn" style="width:100%;padding:13px;font-size:15px" onclick="dbGenerarIANuevo()">⚡ ${tc('Generar plan personalizado') || (COACH_LANG==='en'?'Generate personalised plan':'Generar plan personalizado')}</button>
      <div id="db_ia_result" style="margin-top:12px"></div>
    </div>

    <div id="db_plan_preview" style="display:none">
      <div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">${tc('Vista previa del plan') || (COACH_LANG==='en'?'Plan preview':'Vista previa del plan')}</div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="btn" style="flex:1;padding:10px;background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);font-size:13px" onclick="dbEditarPlan()">✏️ ${tc('Editar cantidades') || (COACH_LANG==='en'?'Edit quantities':'Editar cantidades')}</button>
          <button class="btn" style="flex:1;padding:10px;background:var(--gn);font-size:13px" id="btn_publicar_dieta_ia" onclick="dbPublicarPlan()">✓ ${tc('Publicar al cliente') || (COACH_LANG==='en'?'Publish to client':'Publicar al cliente')}</button>
        </div>
        <div id="db_plan_html"></div>
      </div>
    </div>
  </div>`;}

async function initDietaBuilder(){
  const cl=await api('/clientes');
  window._dbClientes=cl;
  dbRenderTarjetas(cl);
}

function dbRenderTarjetas(clientes){
  const grid=document.getElementById('db_cl_grid');
  if(!grid)return;
  if(!clientes.length){grid.innerHTML=`<div class="wm-empty-clients" style="padding:22px 12px"><div class="wm-empty-title">${COACH_LANG==='en'?'No clients yet.':'Sin clientes aún.'}</div></div>`;return;}
  const selId=document.getElementById('db_cl')?.value;
  grid.innerHTML=clientes.map((c,i)=>hCoachSelectClientCard(c,i,'db',selId)).join('');
}

function dbFiltrarTarjetas(){
  const q=(document.getElementById('db_cl_buscar')?.value||'').toLowerCase();
  const cl=(window._dbClientes||[]).filter(c=>!q||(c.nombre||'').toLowerCase().includes(q));
  dbRenderTarjetas(cl);
}

function dbSelTarjeta(id,card){
  document.querySelectorAll('#db_cl_grid > div').forEach(d=>{ d.style.border='0.5px solid var(--br)'; d.querySelector('[style*="border-radius:50%;background:var(--bl)"]')?.remove(); });
  card.style.border='2px solid var(--bl)';
  const chk=document.createElement('div');
  chk.innerHTML=`<div style="position:absolute;top:8px;right:8px;width:16px;height:16px;border-radius:50%;background:var(--bl);display:flex;align-items:center;justify-content:center"><svg width="9" height="9" viewBox="0 0 10 8" fill="none"><polyline points="1,4 4,7 9,1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  card.appendChild(chk.firstChild);
  document.getElementById('db_cl').value=id;
  dbSelCliente(id);
}

async function dbSelCliente(id){
  if(!id)return;
  dbState.clienteId=id;
  document.getElementById('db_wrap').style.display='block';
  // Pre-fill alimentos from client preferences if available
  try{
    const c = await api('/clientes/'+id);
    const dietaPrefs = extraerPreferenciasDietaCliente(c);
    const notasEl = document.getElementById('db_notas_extra');
    if(notasEl && c.observaciones && !notasEl.value){
      notasEl.value = c.observaciones;
    }
    // Auto-fill analíticas from client deficiencias field
    const analiticasEl = document.getElementById('db_analiticas');
    if(analiticasEl && c.deficiencias && !analiticasEl.value){
      analiticasEl.value = c.deficiencias;
    }
    // Show client info hint
    const kcal = c.kcal_internas||2000;
    const hint = document.getElementById('db_client_hint');
    if(hint) hint.innerHTML = `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:10px;padding:10px 12px;margin-bottom:10px">
      <div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:6px">${c.nombre}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;color:var(--tx3);margin-bottom:6px">
        <div>⚡ <b style="color:var(--sv2)">${kcal} kcal</b></div>
        <div>🎯 ${c.objetivo||'Sin objetivo'}</div>
        <div>🥗 ${tc(c.dieta_tipo)||c.dieta_tipo||tc('Omnívoro')}</div>
        <div>📊 ${c.nivel||'Principiante'}</div>
        <div>⚖️ ${c.peso_actual?fmtPeso(c.peso_actual):'—'} · ${c.altura?fmtAltura(c.altura):'—'}</div>
        <div>🔥 ${COACH_LANG==='en'?'Activity:':'Actividad:'} ${tc(c.actividad)||c.actividad||'—'}</div>
      </div>
      ${c.alimentos_no?`<div style="font-size:11px;color:#fca5a5;margin-bottom:4px">❌ No puede: ${c.alimentos_no}</div>`:''}
      ${c.lesiones?`<div style="font-size:11px;color:#fbbf24;margin-bottom:4px">⚠️ Lesiones: ${c.lesiones}</div>`:''}
      ${c.deficiencias?`<div style="font-size:11px;color:#c084fc;margin-top:4px">🧪 Deficiencias: ${c.deficiencias}</div>`:''}
      ${dietaPrefs.alimentos.length?`<div style="font-size:11px;color:#93c5fd;margin-top:4px">🍽️ Preferencias: ${dietaPrefs.alimentos.join(', ')}</div>`:''}
      ${dietaPrefs.numComidas?`<div style="font-size:11px;color:#93c5fd;margin-top:4px">🍱 Comidas preferidas: ${dietaPrefs.numComidas}/día</div>`:''}
    </div>`;
    // Set to auto — the IA will derive from client objetivo
    const objCal = document.getElementById('db_objetivo_cal');
    if(objCal) objCal.value = 'auto';
    // Load favorites
    dbCargarFavoritos();
    _dbSeleccionados.clear();
    dbActualizarSelected();
    dbAplicarPreferenciasCliente(c);
  }catch(e){}
}

async function dbLoadComidas(){
  const listEl = document.getElementById('db_comidas_list');
  if(!listEl) return;
  const c=await api('/clientes/'+dbState.clienteId);
  const mIcons=['☀️','🕐','🍽️','🌅','🌙','🥗'];
  const catColors={'Proteína':'#3b82f6','Carbohidrato':'#a78bfa','Verdura':'#22c55e','Grasa saludable':'#f59e0b','Lácteo':'#ec4899'};
  listEl.innerHTML=c.comidas.length?c.comidas.map((m,mi)=>`
    <div style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;margin-bottom:10px;overflow:hidden">
      <div style="padding:11px 13px;display:flex;align-items:center;justify-content:space-between;${m.items.length?'border-bottom:0.5px solid var(--br)':''}">
        <div class="fl"><span style="font-size:20px;margin-right:8px">${mIcons[mi]||'🍽️'}</span><span style="font-size:14px;font-weight:700;color:var(--sv)">${m.nombre}</span></div>
        <button class="btn btn-sm" onclick="dbOpenAlim(${m.id},'${m.nombre}')">+ Alimento</button>
      </div>
      ${m.items.map(it=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 13px;border-bottom:0.5px solid rgba(39,39,42,.5)">
        <span style="font-size:20px">${foodEmoji(it.nombre)}</span>
        <span style="flex:1;font-size:13px;font-weight:600;color:var(--sv2)">${it.nombre}</span>
        <input type="number" value="${it.gramos}" min="1" style="width:60px;padding:5px 7px;border:0.5px solid var(--br);border-radius:7px;background:var(--b);color:var(--blg);font-size:13px;font-weight:700;text-align:center;font-family:'Inter',sans-serif" onchange="dbEditG(${it.id},this.value)"/>
        <span style="font-size:11px;color:var(--tx3)">g</span>
        <button onclick="dbDelAlim(${it.id})" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:15px">✕</button>
      </div>`).join('')}
    </div>`).join(''):`<div style="font-size:13px;color:var(--tx3)">${tc('Sin comidas. Añade la primera.')}</div>`;
}

async function dbAddComida(){
  const n=prompt('Nombre (ej: Desayuno, Comida, Cena...):');if(!n)return;
  await api('/clientes/'+dbState.clienteId+'/comidas',{method:'POST',body:JSON.stringify({nombre:n})});
  await dbLoadComidas();
}

function dbOpenAlim(id,nombre){
  dbState.comidaId=id;dbState.comidaNombre=nombre;
  document.getElementById('db_alim_panel').style.display='block';
  document.getElementById('db_comida_lbl').textContent=nombre;
  document.getElementById('db_alim_panel').scrollIntoView({behavior:'smooth'});
  dbBuscar();
}

async function dbBuscar(){
  const cat=document.getElementById('db_cat').value,b=document.getElementById('db_buscar').value;
  const p=new URLSearchParams();
  if(cat!=='Todos')p.append('categoria',cat);if(b)p.append('buscar',b);
  const alims=await api('/alimentos-db?'+p);
  const catColors={'Proteína':'#3b82f6','Carbohidrato':'#a78bfa','Verdura':'#22c55e','Grasa saludable':'#f59e0b','Lácteo':'#ec4899'};
  document.getElementById('db_alim_lista').innerHTML=alims.map(a=>`
    <div class="alim-card">
      <div class="alim-emoji">${foodEmoji(a.nombre)}</div>
      <div class="alim-cat" style="color:${catColors[a.categoria]||'var(--blg)'}">${a.categoria}</div>
      <div class="alim-nombre">${a.nombre}</div>
      <div class="alim-macros">Por 100g: ${a.proteinas}g P · ${a.carbos}g C · ${a.grasas}g G</div>
      <button class="alim-add" onclick="dbAddAlim('${a.nombre.replace(/'/g,"\\'")}')">+ Añadir</button>
    </div>`).join('')||`<div style="color:var(--tx3);font-size:13px;padding:16px;text-align:center">${tc('Sin resultados')}</div>`;
}

async function dbAddAlim(nombre){
  const g=parseInt(prompt('Gramos (en crudo):','100')||'100');if(!g)return;
  await api('/comidas/'+dbState.comidaId+'/alimentos',{method:'POST',body:JSON.stringify({nombre,gramos:g})});
  await dbLoadComidas();
}
async function dbEditG(id,g){await api('/alimentos/'+id,{method:'PUT',body:JSON.stringify({gramos:parseInt(g)})});}
async function dbDelAlim(id){await api('/alimentos/'+id,{method:'DELETE'});await dbLoadComidas();}

async function dbGenerarIA(){
  const res=document.getElementById('db_ia_result');
  if(!dbState.clienteId){res.innerHTML='<div style="color:#f87171;font-size:13px">Selecciona un cliente primero</div>';return;}
  const alimentos=document.getElementById('db_alimentos_input').value.trim();
  if(!alimentos){res.innerHTML=`<div style="color:#f87171;font-size:13px">${COACH_LANG==='en'?'Enter the available foods':'Escribe los alimentos disponibles'}</div>`;return;}
  res.innerHTML=`<div class="ia-chip"><div class="ia-chip-title">${COACH_LANG==='en'?'Generating diet...':'Generando dieta...'}</div></div>`;
  const c=await api('/clientes/'+dbState.clienteId);
  try{
    const d=await api('/ia/chat',{method:'POST',body:JSON.stringify({messages:[{role:'user',content:`Genera un plan de dieta para ${c.nombre}. Objetivo: ${c.objetivo}. Nivel: ${c.nivel}. Calorías objetivo: ${c.kcal_internas} kcal. Proteína: ${c.prot}g. Carbos: ${c.carbs}g. Grasas: ${c.fat}g. Alimentos disponibles: ${alimentos}. Crea 5 comidas (desayuno, media mañana, comida, merienda, cena) con alimentos en gramos en crudo. NO menciones calorías al cliente.`}],system:'Eres un nutricionista deportivo experto. Genera planes de dieta flexibles, prácticos y adaptados al objetivo. Cantidades en gramos en crudo. '+(COACH_LANG==='en'?'Always respond in English.':'Responde en español.')})});
    res.innerHTML=`<div class="ia-chip"><div class="ia-chip-title">${COACH_LANG==='en'?'Diet generated for':'Dieta generada para'} ${c.nombre}</div><div class="ia-result-body" style="white-space:pre-line">${d.reply}</div></div>`;
  }catch(e){res.innerHTML='<div style="color:#f87171;font-size:13px">Error generando. Verifica la API key.</div>';}
}

// ═══ PROGRESO COACH ═══════════════════════════════════
function hProgreso(cl){
  return `
  <div id="sub_alertas_wrap"></div>
  <div id="adherencia_alertas_wrap"></div>
  <div class="sec">
    <div class="sec-hdr">📊 ${COACH_LANG==='en'?'Client dashboard':'Dashboard clientes'}
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm" onclick="enviarAvisosVencimiento()" style="font-size:11px">🔔 ${COACH_LANG==='en'?'Alerts':'Avisos'}</button>
        <button class="btn btn-sm" onclick="cargarDashboard()" style="font-size:11px;background:var(--bl2)">↺ ${COACH_LANG==='en'?'Refresh':'Actualizar'}</button>
      </div>
    </div>
    <!-- Resumen rápido -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
      <div id="dash_total" style="background:var(--s2);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:var(--sv)">${cl.length}</div>
        <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em">${tc('Clientes')}</div>
      </div>
      <div id="dash_activos" style="background:rgba(34,197,94,.08);border:0.5px solid rgba(34,197,94,.2);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:var(--gnb)" id="dash_num_activos">—</div>
        <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em">${tc('Activos')}</div>
      </div>
      <div id="dash_atencion" style="background:rgba(239,68,68,.06);border:0.5px solid rgba(239,68,68,.15);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:#fca5a5" id="dash_num_atencion">—</div>
        <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em">${tc('Atención')}</div>
      </div>
    </div>
    <!-- Tabla clientes con semáforo -->
    <table style="width:100%;border-collapse:collapse">
      <tr>${['',COACH_LANG==='en'?'Client':'Cliente',tc('Progreso'),tc('Última sesión'),COACH_LANG==='en'?'Wk':'Sem',COACH_LANG==='en'?'Subscription':'Suscripción'].map(h=>`<th style="text-align:left;padding:5px 8px;font-size:10px;font-weight:700;color:var(--tx3);border-bottom:0.5px solid var(--br);text-transform:uppercase;letter-spacing:.07em">${h}</th>`).join('')}</tr>
      ${cl.map((c,i)=>{const a=ac(i);return`<tr onclick="verCliente(${c.id})" style="cursor:pointer" onmouseover="this.style.background='rgba(255,255,255,.02)'" onmouseout="this.style.background='none'">
        <td style="padding:9px 6px;width:28px"><span id="semaforo_${c.id}" title="${tc('Cargando...')}" style="font-size:18px">⏳</span></td>
        <td style="padding:9px 8px"><div class="fl"><div class="av" style="width:26px;height:26px;font-size:10px;background:${a.bg};color:${a.tx};border-color:${a.br};margin-right:7px;overflow:hidden;padding:0">${c.foto_perfil?`<img src="${c.foto_perfil}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`:`<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">${ini(c.nombre)}</span>`}</div><div><div style="font-size:13px;font-weight:700;color:var(--sv)">${c.nombre}</div><div style="font-size:10px;color:var(--tx3)">${tc(c.objetivo)}</div></div></div></td>
        <td style="padding:9px 8px"><span id="progreso_${c.id}" style="font-size:11px;color:var(--tx3)">—</span></td>
        <td style="padding:9px 8px"><span id="ultima_ses_${c.id}" style="font-size:11px;color:var(--tx3)">—</span></td>
        <td style="padding:9px 8px"><span class="badge b-bl">${c.semanas}</span></td>
        <td style="padding:9px 8px"><span id="sub_estado_${c.id}" class="badge b-sv">...</span></td>
      </tr>`;}).join('')}
    </table>
  </div>`;
}
async function cargarProgresoSubs() {
  try {
    const alertas = await api('/suscripciones/alertas');
    const wrap = document.getElementById('sub_alertas_wrap');

    let html = '';

    if(alertas.proximas_a_vencer?.length) {
      html += `<div class="sec" style="margin-bottom:12px;border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.04)">
        <div class="sec-hdr" style="color:var(--amb)">⚠️ ${COACH_LANG==='en'?'Expiring soon':'Próximas a vencer'} (${alertas.proximas_a_vencer.length})</div>
        ${alertas.proximas_a_vencer.map(s=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:0.5px solid var(--br)">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--sv)">${s.nombre}</div>
              <div style="font-size:11px;color:var(--tx3)">${COACH_LANG==='en'?'Expires':'Vence'}: ${s.fecha_fin.split('-').reverse().join('/')}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge b-am">${s.dias_restantes}d</span>
              <button class="btn btn-sm" onclick="verCliente(${s.cliente_id})" style="font-size:11px">${tc('Ver cliente')}</button>
            </div>
          </div>`).join('')}
      </div>`;
    }

    if(alertas.vencidas?.length) {
      html += `<div class="sec" style="margin-bottom:12px;border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.04)">
        <div class="sec-hdr" style="color:#fca5a5">🔴 ${COACH_LANG==='en'?'Expired / Cancelled':'Vencidas / Canceladas'} (${alertas.vencidas.length})</div>
        ${alertas.vencidas.map(s=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:0.5px solid var(--br)">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--sv)">${s.nombre}</div>
              <div style="font-size:11px;color:#fca5a5">${COACH_LANG==='en'?'Expired':'Venció'}: ${s.fecha_fin.split('-').reverse().join('/')}</div>
            </div>
            <button class="btn btn-sm" onclick="verCliente(${s.cliente_id})" style="font-size:11px">${tc('Renovar')}</button>
          </div>`).join('')}
      </div>`;
    }

    if(wrap) wrap.innerHTML = html || '';

    // Cargar estado de suscripción por cliente en la tabla
    const subs = await api('/suscripciones');
    subs.forEach(s => {
      const el = document.getElementById('sub_estado_'+s.cliente_id);
      if(!el) return;
      if(s.vencida || s.estado==='cancelada') {
        el.className='badge'; el.style.background='rgba(239,68,68,.15)'; el.style.color='#fca5a5'; el.style.border='0.5px solid rgba(239,68,68,.3)';
        el.textContent = s.estado==='cancelada' ? (COACH_LANG==='en'?'Cancelled':'Cancelada') : (COACH_LANG==='en'?'Expired':'Vencida');
      } else if(s.proxima_a_vencer) {
        el.className='badge b-am'; el.textContent = s.dias_restantes+'d';
      } else {
        el.className='badge b-gn'; el.textContent = '✓ '+(COACH_LANG==='en'?'Active':'Activa');
      }
    });
    // Clientes sin suscripción
    document.querySelectorAll('[id^="sub_estado_"]').forEach(el => {
      if(el.textContent==='...') { el.className='badge b-sv'; el.textContent=tc('Sin sub'); }
    });

  } catch(e) { console.error('Error alertas:', e); }
}

// ═══ DASHBOARD COMPLETO — SEMÁFORO + ADHERENCIA + PROGRESO ═══════════
async function cargarDashboard() {
  await cargarProgresoSubs();

  const clientes = await api('/clientes').catch(()=>[]);
  let activos = 0, atencion = 0;

  // Procesar cada cliente en paralelo
  const promesas = clientes.map(async c => {
    try {
      // Endpoint ligero — solo fecha y estado de la última sesión (sin series ni logs)
      const ultima = await api('/clientes/'+c.id+'/ultima-sesion');

      const diasSinEntreno = ultima.dias_sin_entreno ?? 999;
      const ultimoEstado   = ultima.estado || 'completado';
      const tieneSesiones  = ultima.tiene_sesiones;

      // ── Semáforo ────────────────────────────────
      let emoji = '🟢', estado = tc('Activos');
      if(!tieneSesiones)                    { emoji = '⚪'; estado = tc('Sin sesiones'); }
      else if(diasSinEntreno > 10)          { emoji = '🔴'; estado = `${diasSinEntreno}d ${COACH_LANG==='en'?'no workout':'sin entreno'}`; atencion++; }
      else if(diasSinEntreno > 5)           { emoji = '🟡'; estado = `${diasSinEntreno}d ${COACH_LANG==='en'?'no workout':'sin entreno'}`; atencion++; }
      else if(ultimoEstado === 'incompleto'){ emoji = '🟠'; estado = COACH_LANG==='en'?'Incomplete':'Incompleto'; atencion++; }
      else { activos++; }

      // ── Última sesión texto ─────────────────────
      let ultimaTexto = tc('Sin sesiones');
      if(tieneSesiones) {
        const sufijo = ultimoEstado === 'incompleto' ? ' ⚠' : '';
        ultimaTexto = (diasSinEntreno === 0 ? (COACH_LANG==='en'?'Today':'Hoy') :
                       diasSinEntreno === 1 ? (COACH_LANG==='en'?'Yesterday':'Ayer') :
                       `${COACH_LANG==='en'?'Ago':'Hace'} ${diasSinEntreno}d`) + sufijo;
      }

      // ── Progreso peso ────────────────────────────
      let pesoTexto = '—';
      if(c.pesos?.length >= 2) {
        const diff = c.pesos[c.pesos.length-1].peso - c.pesos[c.pesos.length-2].peso;
        const signo = diff > 0 ? '▲' : diff < 0 ? '▼' : '=';
        const col = c.objetivo?.toLowerCase().includes('déficit') || c.objetivo?.toLowerCase().includes('pérdida')
          ? (diff < 0 ? '#86efac' : diff > 0 ? '#fca5a5' : 'var(--tx3)')
          : (diff > 0 ? '#86efac' : diff < 0 ? '#fca5a5' : 'var(--tx3)');
        pesoTexto = `<span style="color:${col}">${signo}${isImperial()?(Math.abs(diff)*2.20462).toFixed(1):Math.abs(diff).toFixed(1)}${pesoLabel()}</span>`;
      } else if(c.peso_actual) {
        pesoTexto = fmtPeso(c.peso_actual);
      }

      // ── Actualizar UI ────────────────────────────
      const semEl  = document.getElementById('semaforo_'+c.id);
      const progEl = document.getElementById('progreso_'+c.id);
      const sesEl  = document.getElementById('ultima_ses_'+c.id);
      if(semEl)  { semEl.textContent = emoji; semEl.title = estado; }
      if(progEl) progEl.innerHTML = pesoTexto;
      if(sesEl)  sesEl.textContent = ultimaTexto;

    } catch(e) {
      console.warn('Dashboard error cliente', c?.id, e?.message);
      const semEl = document.getElementById('semaforo_'+c?.id);
      if(semEl) { semEl.textContent = '❓'; semEl.title = 'Error cargando'; }
    }
  });

  await Promise.all(promesas);

  // Actualizar contadores
  const numA = document.getElementById('dash_num_activos');
  const numAt = document.getElementById('dash_num_atencion');
  if(numA) numA.textContent = activos;
  if(numAt) numAt.textContent = atencion;

  // Alertas de adherencia
  const adherWrap = document.getElementById('adherencia_alertas_wrap');
  if(adherWrap) {
    // Los clientes con 🔴 ya los calculamos — refrescar visualmente
    // (ya está en los semáforos de la tabla)
    adherWrap.innerHTML = '';
  }
}

// ── 1RM ESTIMADO (fórmula Epley) ──────────────────────────────────────
function calcular1RM(peso, reps) {
  if(reps === 1) return peso;
  return Math.round(peso * (1 + reps / 30) * 10) / 10;
}

// ── APLICAR TODOS LOS AJUSTES SUGERIDOS DE UNA VEZ ────────────────────
async function aplicarTodosAjustes(clienteId) {
  const btn = event?.target;
  if(btn) { btn.textContent = '⏳ '+(COACH_LANG==='en'?'Applying...':'Aplicando...'); btn.disabled = true; }

  try {
    const c = window._coachClienteActual;
    if(!c) throw new Error('No hay cliente cargado');

    const sesiones = await api('/clientes/'+clienteId+'/sesiones');
    const nivel = c.nivel || 'Intermedio';

    // Mapear último rendimiento por ejercicio
    const ultimoRendimiento = {};
    sesiones.forEach(s => {
      s.series.forEach(sr => {
        if(!ultimoRendimiento[sr.ejercicio_nombre] ||
           new Date(s.fecha) > new Date(ultimoRendimiento[sr.ejercicio_nombre].fecha)) {
          ultimoRendimiento[sr.ejercicio_nombre] = { ...sr, fecha: s.fecha };
        }
      });
    });

    let aplicados = 0;
    const promesas = [];

    c.dias.forEach(d => {
      d.ejercicios.forEach(e => {
        const ult = ultimoRendimiento[e.nombre];
        if(ult && ult.rir != null) {
          const prog = calcularProgresion(e.peso_objetivo || 0, ult.reps_real, ult.rir, e.rir || 2, nivel);
          if(prog.subida || prog.bajada) {
            aplicados++;
            promesas.push(
              api('/ejercicios/'+e.id, {
                method: 'PUT',
                body: JSON.stringify({
                  series: e.series, reps: e.reps,
                  peso_objetivo: prog.nuevoPeso,
                  descanso: e.descanso, rir: e.rir,
                  es_principal: e.es_principal,
                  youtube_url: e.youtube_url || '',
                  nota_coach: e.nota_coach || ''
                })
              })
            );
          }
        }
      });
    });

    await Promise.all(promesas);

    // Recargar cliente
    const cActualizado = await api('/clientes/'+clienteId);
    window._coachClienteActual = cActualizado;

    if(btn) {
      btn.textContent = aplicados > 0 ? `✓ ${aplicados} ${COACH_LANG==='en'?'adjustments applied':'ajustes aplicados'}` : '✓ '+(COACH_LANG==='en'?'No changes':'Sin cambios');
      btn.style.background = 'var(--gn)';
      setTimeout(() => {
        btn.textContent = '⚡ '+tc('Aplicar todos los ajustes'); btn.disabled = false;
        btn.style.background = '';
        // Recargar revisión semanal
        cargarRevisionSemanal(clienteId, cActualizado);
      }, 2500);
    }

  } catch(e) {
    if(btn) { btn.textContent = 'Error: '+e.message; btn.disabled = false; }
  }
}

// ── SECCIÓN 1RM + PRs + TONELAJE para el tab Progreso del cliente ──────
async function cargarMetricasAvanzadas(clienteId) {
  const wrap = document.getElementById('metricas_avanzadas_wrap');
  if(!wrap) return;

  try {
    const [sesiones, pesoRecs] = await Promise.all([
      api('/clientes/'+clienteId+'/sesiones'),
      api('/clientes/'+clienteId+'/pesos').catch(()=>[])
    ]);
    if(!sesiones.length) { wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3)">${tc('Sin sesiones aún.')}</div>`; return; }

    const c = window._coachClienteActual;
    const pesos = c?.pesos || pesoRecs || [];

    // PRs por ejercicio (mejor 1RM estimado)
    const prs = {};
    const tonelajePorSemana = {};
    const pesos1RMhistorial = {}; // nombre -> [{semana, rm1}]

    sesiones.forEach(s => {
      const semana = s.fecha.substring(0,7); // YYYY-MM
      if(!tonelajePorSemana[semana]) tonelajePorSemana[semana] = 0;

      s.series.forEach(sr => {
        const nombre = sr.ejercicio_nombre;
        const peso = sr.peso_real || 0;
        const reps = sr.reps_real || 0;
        const rm1 = calcular1RM(peso, reps);
        tonelajePorSemana[semana] += peso * reps;

        if(!prs[nombre] || rm1 > prs[nombre].rm1) {
          prs[nombre] = { rm1, peso, reps, fecha: s.fecha };
        }
        // Track 1RM evolution per exercise
        if(!pesos1RMhistorial[nombre]) pesos1RMhistorial[nombre] = {};
        if(!pesos1RMhistorial[nombre][semana] || rm1 > pesos1RMhistorial[nombre][semana]) {
          pesos1RMhistorial[nombre][semana] = rm1;
        }
      });
    });

    const principales = c ? c.dias.flatMap(d => d.ejercicios.filter(e=>e.es_principal).map(e=>e.nombre)) : [];
    const prsFiltrados = Object.entries(prs)
      .sort((a,b) => principales.includes(b[0]) - principales.includes(a[0]))
      .slice(0,6);

    const semanas = Object.entries(tonelajePorSemana)
      .sort((a,b) => a[0].localeCompare(b[0]))
      .slice(-8);

    // Helper: draw simple SVG line chart
    function svgLineChart(data, color='#3b82f6', height=80, showDots=true) {
      if(data.length < 2) return '';
      const w = 280, h = height, pad = {t:10,r:10,b:25,l:40};
      const vals = data.map(d=>d.y);
      const minV = Math.min(...vals), maxV = Math.max(...vals);
      const range = maxV - minV || 1;
      const xs = data.map((_,i) => pad.l + (i/(data.length-1))*(w-pad.l-pad.r));
      const ys = data.map(d => pad.t + (1-(d.y-minV)/range)*(h-pad.t-pad.b));
      const path = xs.map((x,i) => (i===0?'M':'L')+x.toFixed(1)+','+ys[i].toFixed(1)).join(' ');
      const area = xs.map((x,i)=>(i===0?'M':'L')+x.toFixed(1)+','+ys[i].toFixed(1)).join(' ')
        +` L${xs[xs.length-1].toFixed(1)},${(h-pad.b).toFixed(1)} L${xs[0].toFixed(1)},${(h-pad.b).toFixed(1)} Z`;
      const dots = showDots ? xs.map((x,i)=>`<circle cx="${x.toFixed(1)}" cy="${ys[i].toFixed(1)}" r="3" fill="${color}" stroke="var(--b)" stroke-width="1.5"/>`).join('') : '';
      const labels = data.map((d,i)=>{
        if(i===0||i===data.length-1||data.length<=4)
          return `<text x="${xs[i].toFixed(1)}" y="${(h-pad.b+14).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--tx3)">${d.label}</text>`;
        return '';
      }).join('');
      const yLabels = [minV, maxV].map((v,i)=>`<text x="${pad.l-4}" y="${ys[i===0?ys.length-1:0].toFixed(1)}" text-anchor="end" font-size="9" fill="var(--tx3)" dominant-baseline="middle">${Math.round(v)}</text>`).join('');
      return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="overflow:visible;display:block">
        <defs><linearGradient id="g${color.replace('#','')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".25"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
        <path d="${area}" fill="url(#g${color.replace('#','')})" />
        <path d="${path}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}${labels}${yLabels}
      </svg>`;
    }

    let html = '';

    // ── GRÁFICA PESO CORPORAL ─────────────────────────────────────
    if(pesos.length >= 2) {
      const pesoData = pesos.map((p,i)=>({
        y: p.peso,
        label: COACH_LANG==='en'?'Wk '+(i+1):'Sem '+(i+1)
      }));
      const pesoInicio = pesos[0].peso;
      const pesoActual = pesos[pesos.length-1].peso;
      const diff = (pesoActual-pesoInicio).toFixed(1);
      const diffColor = diff > 0 ? 'var(--gnb)' : diff < 0 ? '#fca5a5' : 'var(--tx3)';
      html += `<div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">⚖️ ${COACH_LANG==='en'?'Body weight evolution':'Evolución de peso corporal'}
          <span style="font-size:11px;font-weight:600;color:${diffColor};text-transform:none;letter-spacing:0">${diff>0?'+':''}${diff}kg</span>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:10px">
          <div><div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'Start':'Inicio'}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${pesoInicio}kg</div></div>
          <div><div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'Current':'Actual'}</div><div style="font-size:16px;font-weight:700;color:var(--blg)">${pesoActual}kg</div></div>
          <div><div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'Records':'Registros'}</div><div style="font-size:16px;font-weight:700;color:var(--sv)">${pesos.length}</div></div>
        </div>
        <div style="margin:0 -4px">${svgLineChart(pesoData,'#3b82f6',90)}</div>
      </div>`;
    }

    // ── GRÁFICAS 1RM EJERCICIOS PRINCIPALES ──────────────────────
    const principalesConHistorial = principales.filter(n => pesos1RMhistorial[n] && Object.keys(pesos1RMhistorial[n]).length >= 2);
    if(principalesConHistorial.length) {
      html += `<div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">💪 ${COACH_LANG==='en'?'Main exercises — 1RM evolution':'Ejercicios principales — evolución 1RM'}</div>`;
      principalesConHistorial.slice(0,4).forEach(nombre => {
        const hist = Object.entries(pesos1RMhistorial[nombre]).sort((a,b)=>a[0].localeCompare(b[0]));
        const data = hist.map(([sem,rm1],i)=>({y:rm1, label:sem.substring(5)}));
        const inicio = hist[0][1], actual = hist[hist.length-1][1];
        const mejora = (actual-inicio).toFixed(1);
        html += `<div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="font-size:12px;font-weight:700;color:var(--sv)">⭐ ${nombre}</div>
            <div style="text-align:right">
              <span style="font-size:14px;font-weight:800;color:var(--gnb)">${actual}kg</span>
              <span style="font-size:10px;color:${mejora>=0?'var(--gnb)':'#fca5a5'};margin-left:6px">${mejora>=0?'+':''}${mejora}kg</span>
            </div>
          </div>
          <div style="margin:0 -4px">${svgLineChart(data,'#a78bfa',70,hist.length<=6)}</div>
        </div>`;
      });
      html += `</div>`;
    }

    // ── PRs TABLA ─────────────────────────────────────────────────
    if(prsFiltrados.length) {
      html += `<div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">${tc('🏆 PRs & 1RM estimado')}</div>
        ${prsFiltrados.map(([nombre, datos]) => {
          const esPrincipal = principales.includes(nombre);
          const fechaStr = new Date(datos.fecha).toLocaleDateString(COACH_LANG==='en'?'en-GB':'es-ES',{day:'numeric',month:'short'});
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:0.5px solid var(--br)">
            <div>
              <div style="font-size:12px;font-weight:700;color:var(--sv)">${esPrincipal?'⭐ ':''}${nombre}</div>
              <div style="font-size:10px;color:var(--tx3)">${datos.peso}kg×${datos.reps} · ${fechaStr}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:14px;font-weight:700;color:var(--gnb)">${datos.rm1}kg</div>
              <div style="font-size:9px;color:var(--tx3)">${tc('1RM est.')}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    }

    // ── GRÁFICA VOLUMEN SEMANAL ───────────────────────────────────
    if(semanas.length >= 2) {
      const maxTon = Math.max(...semanas.map(s=>s[1]));
      const tonData = semanas.map(([sem,ton])=>({y:ton/1000, label:sem.substring(5)}));
      const totalTon = semanas.reduce((a,s)=>a+s[1],0);
      html += `<div class="sec" style="margin-bottom:12px">
        <div class="sec-hdr">${tc('⚡ Tonelaje semanal')}
          <span style="font-size:10px;color:var(--tx3);text-transform:none;letter-spacing:0;font-weight:400">${COACH_LANG==='en'?'total':'total'}: ${(totalTon/1000).toFixed(1)}t</span>
        </div>
        <div style="margin:0 -4px;margin-bottom:8px">${svgLineChart(tonData,'#f59e0b',80)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${semanas.map(([fecha,ton])=>{
            const pct = Math.round(ton/maxTon*100);
            const col = pct>80?'var(--gnb)':pct>50?'var(--amb)':'#fca5a5';
            return `<div style="flex:1;min-width:60px;background:var(--s3);border-radius:8px;padding:6px;text-align:center">
              <div style="font-size:13px;font-weight:700;color:${col}">${(ton/1000).toFixed(1)}t</div>
              <div style="font-size:9px;color:var(--tx3)">${fecha.substring(5)}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }

    // ── COMPARATIVA SEMANA vs ANTERIOR ────────────────────────────
    const ahora = Date.now();
    const semActual = sesiones.filter(s => ahora - new Date(s.fecha).getTime() < 7*86400000 && s.estado==='completado');
    const semAnterior = sesiones.filter(s => { const ms=ahora-new Date(s.fecha).getTime(); return ms>=7*86400000&&ms<14*86400000&&s.estado==='completado'; });
    const calcStats = sems => { let ton=0,series=0,sesCount=sems.length; sems.forEach(s=>{ s.series.forEach(sr=>{ ton+=(sr.peso_real||0)*(sr.reps_real||0); series++; }); }); return {ton:Math.round(ton),series,sesCount}; };
    const stA=calcStats(semActual), stB=calcStats(semAnterior);
    const diff=(a,b)=>{ if(!b) return {txt:'—',col:'var(--tx3)',icon:''}; const pct=Math.round((a-b)/b*100); if(pct>0) return {txt:'+'+pct+'%',col:'var(--gnb)',icon:'↑'}; if(pct<0) return {txt:pct+'%',col:'#fca5a5',icon:'↓'}; return {txt:'=',col:'var(--tx3)',icon:''}; };
    html += `<div class="sec" style="margin-bottom:12px">
      <div class="sec-hdr">${tc('📊 Esta semana vs anterior')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        ${[[COACH_LANG==='en'?'Sessions':'Sesiones',stA.sesCount,stB.sesCount],[COACH_LANG==='en'?'Sets':'Series',stA.series,stB.series],[COACH_LANG==='en'?'Tonnage':'Tonelaje',stA.ton+'kg',stB.ton?stB.ton+'kg':null]].map(([lbl,actual,anterior])=>{ const d=diff(typeof actual==='number'?actual:parseInt(actual),typeof anterior==='number'?anterior:(anterior?parseInt(anterior):0)); return `<div style="background:var(--s3);border-radius:10px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:800;color:var(--sv)">${actual}</div><div style="font-size:9px;color:var(--tx3);text-transform:uppercase;margin:2px 0">${lbl}</div><div style="font-size:11px;font-weight:700;color:${d.col}">${d.icon} ${d.txt}</div></div>`; }).join('')}
      </div>
    </div>`;

    // ── CHECK-INS ─────────────────────────────────────────────────
    try {
      const checkins = await api('/clientes/'+clienteId+'/checkins');
      if(checkins?.length) {
        const ultimo = checkins[0];
        const bar = v => '█'.repeat(Math.min(5,v||0))+'░'.repeat(5-Math.min(5,v||0));
        html += `<div class="sec" style="margin-bottom:12px">
          <div class="sec-hdr">${tc('📋 Último check-in del cliente')}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
            <div style="background:var(--s3);border-radius:10px;padding:10px"><div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${tc('😴 Sueño')}</div><div style="font-size:13px;color:var(--sv);letter-spacing:2px">${bar(ultimo.sueno)}</div><div style="font-size:18px;font-weight:800;color:var(--sv)">${ultimo.sueno||'—'}/5</div></div>
            <div style="background:var(--s3);border-radius:10px;padding:10px"><div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${tc('⚡ Energía')}</div><div style="font-size:13px;color:var(--sv);letter-spacing:2px">${bar(ultimo.energia)}</div><div style="font-size:18px;font-weight:800;color:var(--sv)">${ultimo.energia||'—'}/5</div></div>
          </div>
          ${checkins.length>1?`<div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'Last':'Últimas'} ${checkins.length} ${COACH_LANG==='en'?'weeks · Avg sleep:':'semanas · Sueño medio:'} ${(checkins.reduce((a,c)=>a+(c.sueno||0),0)/checkins.length).toFixed(1)} · ${COACH_LANG==='en'?'Avg energy:':'Energía media:'} ${(checkins.reduce((a,c)=>a+(c.energia||0),0)/checkins.length).toFixed(1)}</div>`:''}
        </div>`;
      }
    } catch(e){}

    wrap.innerHTML = html || `<div style="font-size:13px;color:var(--tx3)">${tc('Sin datos suficientes.')}</div>`;
  } catch(e) { wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3)">${tc('Error cargando métricas.')}</div>`; }
}

async function enviarAvisosVencimiento() {
  const btn = event.target;
  btn.textContent='⏳ Enviando...'; btn.disabled=true;
  try {
    const r = await api('/suscripciones/avisar-vencimientos', {method:'POST'});
    btn.textContent=COACH_LANG==='en'?('✓ '+r.avisados+' alerts sent'):('✓ '+r.avisados+' avisos enviados');
    setTimeout(()=>{ btn.textContent='🔔 Enviar avisos'; btn.disabled=false; }, 3000);
  } catch(e) {
    btn.textContent='Error'; btn.disabled=false;
  }
}

function toggleCoachSubForm() {
  const f = document.getElementById('coach_sub_form');
  if(f) f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

async function cargarSuscripcionCliente(clienteId) {
  try {
    const s = await api('/clientes/'+clienteId+'/suscripcion');
    const info = document.getElementById('coach_sub_info');
    const badge = document.getElementById('coach_sub_badge');
    const form = document.getElementById('coach_sub_form');
    if(!info) return;

    if(!s || !s.fecha_fin) {
      if(badge) { badge.textContent=tc('Sin suscripción'); badge.style.color='var(--tx3)'; }
      const _subBtn = tc('+ Añadir suscripción');
      const _subMsg = tc('Este cliente no tiene suscripción activa.');
      info.innerHTML = '<div style="font-size:13px;color:var(--tx3);margin-bottom:10px">'+_subMsg+'</div><button class="btn btn-sm" onclick="toggleCoachSubForm()">'+_subBtn+'</button>';
      return;
    }

    const diasColor = s.vencida ? '#fca5a5' : s.proxima_a_vencer ? 'var(--amb)' : 'var(--gnb)';
    const estadoTexto = s.vencida ? ('🔴 '+(COACH_LANG==='en'?'Expired':'Vencida')) : s.proxima_a_vencer ? ('⚠️ '+(COACH_LANG==='en'?'Expires in':'Vence en')+' '+s.dias_restantes+'d') : ('✅ '+(COACH_LANG==='en'?'Active':'Activa'));

    if(badge) { badge.textContent=estadoTexto; badge.style.color=diasColor; badge.style.fontWeight='600'; badge.style.fontSize='11px'; badge.style.textTransform='none'; badge.style.letterSpacing='0'; }

    // Calcular días contratados totales
    const _diasContratados = s.fecha_inicio && s.fecha_fin
      ? Math.ceil((new Date(s.fecha_fin) - new Date(s.fecha_inicio)) / (1000*60*60*24))
      : null;

    info.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div style="background:var(--s2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:11px;color:var(--tx3);margin-bottom:2px">${COACH_LANG==='en'?'contracted':'contratados'}</div>
          <div style="font-size:18px;font-weight:700;color:var(--sv)">${_diasContratados ?? '—'}</div>
          <div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'days':'días'}</div>
        </div>
        <div style="background:var(--s2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:11px;color:var(--tx3);margin-bottom:2px">${COACH_LANG==='en'?'remaining':'restantes'}</div>
          <div style="font-size:18px;font-weight:700;color:${diasColor}">${s.vencida ? '0' : s.dias_restantes}</div>
          <div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'days':'días'}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div style="background:var(--s2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:12px;font-weight:700;color:var(--sv)">${s.fecha_inicio?.split('-').reverse().join('/') || '—'}</div>
          <div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'start':'inicio'}</div>
        </div>
        <div style="background:var(--s2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:12px;font-weight:700;color:${diasColor}">${s.fecha_fin?.split('-').reverse().join('/') || '—'}</div>
          <div style="font-size:10px;color:var(--tx3)">${COACH_LANG==='en'?'expiry':'vencimiento'}</div>
        </div>
      </div>
      ${s.precio ? `<div style="font-size:12px;color:var(--tx3);margin-bottom:8px">💶 ${s.precio}€/${COACH_LANG==='en'?'month':'mes'}</div>` : ''}
      ${s.notas ? `<div style="font-size:11px;color:var(--tx3);margin-bottom:8px">📝 ${s.notas}</div>` : ''}
      <button class="btn btn-sm" onclick="toggleCoachSubForm()" style="font-size:12px">
        ${s.vencida ? ('🔄 '+(COACH_LANG==='en'?'Renew subscription':'Renovar suscripción')) : ('✏️ '+(COACH_LANG==='en'?'Edit / Renew':'Editar / Renovar'))}
      </button>`;

  } catch(e) { console.error('Error sub:', e); }
}

async function renovarSuscripcion(clienteId) {
  const btn = event.target;
  btn.textContent='⏳...'; btn.disabled=true;
  try {
    const meses = document.getElementById('sub_meses')?.value || 1;
    const precio = document.getElementById('sub_precio')?.value || 0;
    const notas = document.getElementById('sub_notas')?.value || '';
    await api('/clientes/'+clienteId+'/suscripcion', {
      method:'POST', body:JSON.stringify({meses:parseInt(meses), precio:parseFloat(precio), notas})
    });
    document.getElementById('coach_sub_form').style.display='none';
    await cargarSuscripcionCliente(clienteId);
    btn.textContent='✓ Activar / Renovar'; btn.disabled=false;
  } catch(e) {
    alert('Error: '+(e.error || e.message || 'Error desconocido'));
    btn.textContent='✓ Activar / Renovar'; btn.disabled=false;
  }
}

async function cancelarSuscripcion(clienteId) {
  if(!confirm(tc('¿Cancelar la suscripción? El cliente perderá el acceso.'))) return;
  const btn = event.target;
  btn.textContent='⏳...'; btn.disabled=true;
  try {
    await api('/clientes/'+clienteId+'/suscripcion/cancelar', {method:'PUT'});
    await cargarSuscripcionCliente(clienteId);
    btn.textContent=tc('Cancelar suscripción'); btn.disabled=false;
  } catch(e) {
    alert('Error: '+(e.error || e.message || 'Error desconocido'));
    btn.textContent=tc('Cancelar suscripción'); btn.disabled=false;
  }
}

// ── NOTIFICACIONES COACH ──────────────────────────────────────────
// ── SSE — Eventos en tiempo real ─────────────────────────────────────
let _sseSource = null;

// ── Helper: mostrar notificación del sistema (funciona con app abierta o cerrada) ──
function mostrarNotifSistema(title, body, tag='wm-notif', url='/'){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, icon:'/logo.png', badge:'/logo.png', tag, renotify:true,
                 requireInteraction:false, vibrate:[200,100,200], data:{url} };
  // Intentar via SW (más fiable, funciona con pantalla apagada si está en background)
  if(!swMsg({ type:'SHOW_NOTIFICATION', title, options:opts })){
    try { new Notification(title, opts); } catch(e){}
  }
}

function iniciarSSE(){
  if(!TOKEN) return;
  cerrarSSE(); // cerrar conexión previa si la hay

  const url = (API||'') + '/api/eventos?token=' + encodeURIComponent(TOKEN);
  _sseSource = new EventSource(url);

  // ── Notificación recibida (cualquier tipo) ──
  _sseSource.addEventListener('notificacion', e => {
    try {
      const data = JSON.parse(e.data);
      if(USER && USER.role === 'coach') {
        cargarNotificacionesCoach();
        // Notificación del sistema en PC/móvil
        mostrarNotifSistema('WolfMindset 🐺', data.mensaje, 'notif-coach-'+Date.now());
      } else {
        const tipo = data.tipo || '';
        if(tipo === 'vencimiento_proximo' || tipo === 'suscripcion_vencida') {
          mostrarBannerSub(data.mensaje, tipo === 'suscripcion_vencida' ? 'error' : 'warning');
        }
        mostrarNotifSistema('WolfMindset 🐺', data.mensaje, 'notif-cliente-'+Date.now());
      }
    } catch(err) {}
  });

  // ── Badge de mensajes del coach actualizado ──
  _sseSource.addEventListener('badge_msgs', e => {
    cargarNotificacionesCoach();
    if(window._coachTabActual === 'mensajes') {
      if(window._coachMsgThread) {
        coachMsgsLoadThread(window._coachMsgThread, false);
      } else {
        coachMsgsLoadList();
      }
    }
  });

  // ── Mensaje nuevo recibido por SSE ──
  _sseSource.addEventListener('mensaje_nuevo', e => {
    try {
      const data = JSON.parse(e.data);
      const existingLocal = Array.isArray(_chatMsgs) && data.id && _chatMsgs.some(m => String(m.id) === String(data.id));

      // Cliente: recibe respuestas del coach/IA y actualiza su hilo.
      if(USER && USER.role === 'cliente' && data.de_coach && !existingLocal) {
        const msg = {
          role: 'assistant',
          content: data.contenido,
          sender: window._coachNombreAsistente || 'Coach',
          ts: new Date(data.created_at).getTime(),
          via: data.via_ia ? 'ia' : 'coach',
          id: data.id
        };
        _chatMsgs.push(msg);
        _chatSave();
        if(document.getElementById('chatMsgs')) _chatRenderAll();
        const typing = document.getElementById('chatTyping');
        if(typing) typing.style.display = 'none';
        // Notificación del sistema — llega aunque la app esté en background
        const coachName = window._coachNombreAsistente || 'Coach';
        mostrarNotifSistema(
          LANG==='en' ? `💬 Message from ${coachName}` : `💬 Mensaje de ${coachName}`,
          data.contenido.length > 80 ? data.contenido.slice(0,80)+'…' : data.contenido,
          'msg-coach-' + data.id
        );
      }

      // Coach: si está en mensajes, refresca lista o hilo abierto al instante.
      if(USER && USER.role === 'coach') {
        if(window._coachTabActual === 'mensajes') {
          if(window._coachMsgThread && String(window._coachMsgThread) === String(data.cliente_id)) {
            coachMsgsLoadThread(window._coachMsgThread, false);
          } else {
            coachMsgsLoadList();
          }
        }
        cargarNotificacionesCoach();
      }
    } catch(err) {}
  });

  _sseSource.onerror = () => {
    // Reconexión automática en 5s si se cae (Railway reinicia, etc.)
    cerrarSSE();
    setTimeout(()=>{ if(TOKEN) iniciarSSE(); }, 5000);
  };
}

function cerrarSSE(){
  if(_sseSource){
    _sseSource.close();
    _sseSource = null;
  }
}

async function cargarNotificacionesCoach() {
  try {
    const notifs = await api('/notificaciones');
    const noLeidas = notifs.filter(n=>!n.leida).length;
    const badge = document.getElementById('notif_badge');
    if(badge) {
      if(noLeidas > 0) { badge.style.display='flex'; badge.textContent=noLeidas; }
      else { badge.style.display='none'; }
    }
    window._notifCoach = notifs;
  } catch(e) {}
  // Badge de mensajes no leídos
  try {
    const mdata = await api('/mensajes/no-leidos').catch(()=>({count:0}));
    const n = mdata && mdata.count ? mdata.count : 0;
    ['badge_msgs','badge_msgs_m'].forEach(id=>{
      const b = document.getElementById(id);
      if(!b) return;
      if(n > 0){ b.style.display='inline-flex'; b.textContent=n; }
      else { b.style.display='none'; }
    });
  } catch(e) {}
}

function toggleNotifCoach() {
  const panel = document.getElementById('notif_panel_coach');
  if(!panel) return;
  const visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : 'block';
  if(!visible) renderNotifCoach();
}

function renderNotifCoach() {
  const list = document.getElementById('notif_list_coach');
  if(!list) return;
  const notifs = window._notifCoach || [];
  if(!notifs.length) { list.innerHTML=`<div style="padding:16px;font-size:13px;color:var(--tx3);text-align:center">${COACH_LANG==='en'?'No notifications':'Sin notificaciones'}</div>`; return; }
  list.innerHTML = notifs.map(n=>`
    <div onclick="leerNotifCoach(${n.id},this)" style="padding:12px 14px;border-bottom:0.5px solid var(--br);cursor:pointer;background:${n.leida?'none':'rgba(59,130,246,.04)'}">
      <div style="font-size:12px;color:${n.leida?'var(--tx3)':'var(--sv)'};line-height:1.5">${n.mensaje}</div>
      <div style="font-size:10px;color:var(--tx3);margin-top:3px">${new Date(n.created_at).toLocaleDateString(COACH_LANG==='en'?'en-GB':'es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
    </div>`).join('');
}

async function leerNotifCoach(id, el) {
  await api('/notificaciones/'+id+'/leer', {method:'PUT'}).catch(()=>{});
  el.style.background='none';
  await cargarNotificacionesCoach();
}

async function marcarTodasLeidasCoach() {
  await api('/notificaciones/leer-todas', {method:'PUT'}).catch(()=>{});
  await cargarNotificacionesCoach();
  renderNotifCoach();
  document.getElementById('notif_panel_coach').style.display='none';
}

// Cerrar panel al hacer click fuera
document.addEventListener('click', e => {
  const panel = document.getElementById('notif_panel_coach');
  const bell = document.getElementById('notif_bell_wrap');
  if(panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.style.display='none';
  }
});

// Enter físico confirma la serie en el teclado virtual del entreno
document.addEventListener('keydown', e => {
  if(e.key === 'Enter') {
    const kb = document.getElementById('strong_keyboard');
    if(kb && kb.style.display !== 'none' && activeInput) {
      e.preventDefault();
      if(activeInput.field === 'peso') {
        // En peso: guardar y saltar a reps inmediatamente
        const {ei, si} = activeInput;
        const ex = CD.dias[activeDia]?.ejercicios[ei];
        if(ex) ex._series[si].peso = parseFloat(kbValue) || 0;
        rerenderSerieRow(ei, si);
        openKeyboard(ei, si, 'reps');
      } else {
        // En reps o rir: confirmar (kbConfirm maneja el flujo)
        kbConfirm();
      }
    }
  }
});



// ═══ IA COACH ═════════════════════════════════════════
function hIACoach(){return`<div class="ia-chip" style="margin-bottom:12px"><div class="ia-chip-title">${COACH_LANG==='en'?'Private AI coach assistant':'IA privada del coach'}</div>${COACH_LANG==='en'?'Generate full routines and diets, analyse progress or request specific adjustments for any client.':'Genera rutinas y dietas completas, analiza progreso o pide ajustes específicos para cualquier cliente.'}</div>

<div class="sec" style="display:flex;flex-direction:column;height:480px">
  <div class="chat-msgs" id="iaMsgs" style="flex:1;background:var(--b);border:0.5px solid var(--br);border-radius:10px;padding:11px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px">
    <div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>${tc('Hola coach, listo. Puedo generar rutinas y dietas completas, analizar progreso y sugerir ajustes. ¿Qué necesitas?')}</div>
  </div>
  <div class="typing" id="iaTyping">${COACH_LANG==='en'?'processing...':'procesando...'}</div>
  <div style="display:flex;gap:8px">
    <input class="inp" id="iaIn" placeholder="${COACH_LANG==='en'?'E.g. generate routine for Carlos, 4 days, bulk...':'Ej: genera rutina para Carlos, 4 días, volumen...'}" style="flex:1;margin-bottom:0" onkeydown="if(event.key==='Enter')sendIA()"/>
    <button class="btn" onclick="sendIA()">${tc('Enviar')}</button>
  </div>
</div>`;}

async function sendIA(){
  const inp=document.getElementById('iaIn'),msg=inp.value.trim();if(!msg)return;inp.value='';
  const msgs=document.getElementById('iaMsgs');
  msgs.innerHTML+=`<div class="msg msg-u">${msg}</div>`;msgs.scrollTop=msgs.scrollHeight;
  iaH.push({role:'user',content:msg});document.getElementById('iaTyping').style.display='block';
  try{const d=await api('/ia/chat',{method:'POST',body:JSON.stringify({messages:iaH,system:`Eres el asistente IA privado del coach WolfMindset. Ayudas con progresión de carga, periodización, ajustes calóricos, generación de rutinas y dietas completas. ${COACH_LANG==='en'?'Always respond in English. Technical and concise.':'Respuestas técnicas y concisas en español.'}`})});iaH.push({role:'assistant',content:d.reply});document.getElementById('iaTyping').style.display='none';msgs.innerHTML+=`<div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>${d.reply}</div>`;msgs.scrollTop=msgs.scrollHeight;}
  catch(e){document.getElementById('iaTyping').style.display='none';msgs.innerHTML+=`<div class="msg msg-b"><div class="msg-sender">${USER?.nombre||'Coach'}</div>Error. Inténtalo de nuevo.</div>`;}
}

// ═══ CLIENTE ══════════════════════════════════════════
function klNav(s,btn){
  klTab=s;document.querySelectorAll('.bnav-bar .bni').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  renderKL();
}
function renderKL(){
  const el=document.getElementById('klContent');
  if(!CD){el.innerHTML='<div style="padding:40px;text-align:center;color:var(--tx3)">Cargando...</div>';return;}
  if(klTab==='entreno'){
    // Load today's sessions from server first, then render — ensures state is correct across devices
    const hoy = new Date().toISOString().split('T')[0];
    Promise.all([
      api('/clientes/'+CD.id+'/semana-estado'),
      api('/clientes/'+CD.id+'/sesiones').catch(()=>[])
    ]).then(([estado, sesiones])=>{
      // Sync server sessions to localStorage so getSesionEstado() works correctly
      sesiones.forEach(s => {
        const fechaSesion = (s.fecha||'').split('T')[0];
        if(fechaSesion === hoy && s.dia_nombre && s.estado) {
          localStorage.setItem('wm_sesion_'+CD.id+'_'+s.dia_nombre.replace(/\s/g,'_')+'_'+hoy, s.estado);
        }
      });
      if(estado.tiene_borrador){
        el.innerHTML = hProximaSemanaEnPreparacion();
      } else {
        el.innerHTML = hSeleccionDia();
      }
      if(LANG!=='es') setTimeout(()=>applyLang(el), 30);
    }).catch(()=>{ el.innerHTML = hSeleccionDia(); if(LANG!=='es') applyLang(el); });
    // Traducir nav bar siempre
    if(LANG!=='es') applyLang(document.querySelector('#sCliente .bnav-bar'));
    return;
  }
  else if(klTab==='dieta')el.innerHTML=hDieta();
  else if(klTab==='asistente'){el.innerHTML=hAsistente();setTimeout(_chatAfterRender,30);}
  else if(klTab==='progreso'){el.innerHTML=hProgreso2();setTimeout(()=>{cargarGraficasCliente();initPesoSection();},50);setTimeout(renderFotosProgreso,200);}
  else if(klTab==='logros')el.innerHTML=hBadgesCliente();
  else if(klTab==='perfil')el.innerHTML=hPerfil();
  // Aplicar traducción + nav bar
  if(LANG!=='es') {
    setTimeout(()=>{
      applyLang(el);
      applyLang(document.querySelector('#sCliente .bnav-bar'));
    }, 80);
  }
}

// ENTRENO CLIENTE (estilo Strong)
// ═══ ENTRENO CLIENTE - ESTILO STRONG ══════════════════
let activeInput = null; // {ei, si, field} — qué celda está activa
let runningTimers = {}; // ei_si -> {interval, secs, total, paused, endAt} — usa hora real para que no se congele al bloquear pantalla
let workoutStartTime = null;
let workoutTimerInt = null;
let doneShown = false;

// ═══ PANTALLA SELECCIÓN DE DÍA (estilo Hevy) ═══════════
let vistaActual = 'seleccion'; // 'seleccion' | 'preview' | 'entreno'

function calcularStreak(){
  let streak = 0;
  const hoy = new Date();
  for(let i=0; i<365; i++){
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    const dateStr = d.toISOString().slice(0,10);
    const found = Object.keys(localStorage).some(k => k.includes(dateStr) && k.startsWith('sesion_') && localStorage.getItem(k) === 'completado');
    if(found) streak++;
    else if(i > 0) break;
  }
  return streak;
}

function hStreakBanner(){
  const streak = calcularStreak();
  if(streak === 0) return '';
  const emoji = streak >= 30 ? '🐺' : streak >= 14 ? '🔥' : streak >= 7 ? '⚡' : '💪';
  const msg = streak >= 30 ? t('¡Bestia imparable!') : streak >= 14 ? t('¡Dos semanas seguidas!') : streak >= 7 ? t('¡Una semana de fuego!') : streak === 1 ? t('¡Primer día!') : t('¡Sigue así!');
  return`<div style="background:linear-gradient(135deg,rgba(245,158,11,.15),rgba(239,68,68,.1));border:0.5px solid rgba(245,158,11,.3);border-radius:14px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;gap:12px">
    <div style="font-size:32px;line-height:1">${emoji}</div>
    <div style="flex:1">
      <div style="font-size:20px;font-weight:800;color:var(--amb);font-family:'Bebas Neue',sans-serif;letter-spacing:.05em">${streak} ${LANG==='en'?`day${streak>1?'s':''}`:(`día${streak>1?'s':''} seguido${streak>1?'s':''}`)} </div>
      <div style="font-size:12px;color:var(--sv3);font-weight:600">${msg}</div>
    </div>
  </div>`;
}

function hMensajeCoach(){
  const msg = CD.mensaje_semana;
  if(!msg) return '';
  const corto = msg.length > 120;
  return`<div style="background:linear-gradient(135deg,rgba(37,99,235,.1),rgba(17,17,19,.9));border:0.5px solid rgba(59,130,246,.25);border-radius:14px;padding:12px 16px;margin-bottom:14px;display:flex;gap:10px;align-items:flex-start">
    <span style="font-size:22px;flex-shrink:0">🐺</span>
    <div style="flex:1;min-width:0;overflow:hidden">
      <div style="font-size:10px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">${t('Mensaje de tu coach')}</div>
      <div style="overflow:hidden">
        <div id="coach_msg_txt" data-clamp="3" data-expanded="0" style="font-size:13px;color:var(--sv2);line-height:1.6;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden">${msg}</div>
      </div>
      ${corto?`<button onclick="toggleCoachComment('coach_msg_txt',this)" style="background:none;border:none;color:var(--blg);font-size:11px;font-weight:700;cursor:pointer;margin-top:5px;padding:0;font-family:inherit">${t('Ver más')} ▾</button>`:''}
    </div>
  </div>`;
}

function hNotifBanner(){
  if(!('Notification' in window)) return '';
  if(Notification.permission === 'granted') return '';
  if(Notification.permission === 'denied') return ''; // ya rechazó, no molestar
  return`<div style="background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.3);border-radius:14px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:12px">
    <span style="font-size:22px;flex-shrink:0">🔔</span>
    <div style="flex:1">
      <div style="font-size:12px;font-weight:700;color:var(--amb);margin-bottom:2px">${t('Activa las notificaciones')}</div>
      <div style="font-size:11px;color:var(--tx3)">${t('Para que suene el timer aunque la pantalla esté bloqueada')}</div>
    </div>
    <button onclick="activarNotificaciones(this)" style="padding:6px 12px;background:var(--amb);border:none;border-radius:8px;color:#000;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0">${t('Activar')}</button>
  </div>`;
}

async function activarNotificaciones(btn){
  btn.textContent = '⏳';
  btn.disabled = true;
  const ok = await pedirPermisosNotificacion();
  // Recargar pantalla para que desaparezca el banner
  renderSeleccion();
  if(ok) {
    // Confirmar que funcionó
    setTimeout(()=>{
      try { new Notification('🐺 WolfMindset', { body: t('¡Notificaciones activadas! Te avisaremos cuando termine el descanso.'), icon:'/logo.png' }); } catch(e){}
    }, 500);
  }
}

function getISOWeek(){
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return d.getFullYear() + '_' + Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function necesitaCheckin(){
  return !localStorage.getItem('checkin_semana_' + getISOWeek());
}

function hCheckinBanner(){
  if(!necesitaCheckin()) return '';
  return`<div style="background:rgba(34,197,94,.06);border:0.5px solid rgba(34,197,94,.25);border-radius:14px;padding:12px 16px;margin-bottom:14px">
    <div style="font-size:12px;font-weight:700;color:var(--gnb);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">${t('📋 Check-in semanal')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div>
        <div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${t('😴 ¿Cómo dormiste?')}</div>
        <div style="display:flex;gap:4px">
          ${[1,2,3,4,5].map(n=>`<button onclick="setCheckin('sueno',${n})" id="ci_s${n}" style="flex:1;padding:5px 0;border:0.5px solid var(--br);border-radius:6px;background:var(--s3);color:var(--tx3);font-size:12px;cursor:pointer;font-family:inherit">${n}</button>`).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${t('⚡ Energía hoy')}</div>
        <div style="display:flex;gap:4px">
          ${[1,2,3,4,5].map(n=>`<button onclick="setCheckin('energia',${n})" id="ci_e${n}" style="flex:1;padding:5px 0;border:0.5px solid var(--br);border-radius:6px;background:var(--s3);color:var(--tx3);font-size:12px;cursor:pointer;font-family:inherit">${n}</button>`).join('')}
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <div style="flex:1">
        <div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${t('⚖️ Peso hoy (kg)')} (${pesoLabel()})</div>
        <input id="ci_peso" type="number" step="0.1" placeholder="Ej: 78.5" style="width:100%;padding:7px 10px;border:0.5px solid var(--br);border-radius:8px;background:var(--b);color:var(--sv);font-size:14px;font-weight:700;box-sizing:border-box;font-family:inherit"/>
      </div>
      <button onclick="guardarCheckin()" style="margin-top:18px;padding:8px 16px;background:var(--gn);border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0" data-i18n="Guardar">Guardar</button>
    </div>
  </div>`;
}

const _checkinData = {};
function setCheckin(campo, val){
  _checkinData[campo] = val;
  const prefix = campo === 'sueno' ? 'ci_s' : 'ci_e';
  for(let i=1;i<=5;i++){
    const btn = document.getElementById(prefix+i);
    if(btn){ btn.style.background = i===val ? 'var(--bl2)' : 'var(--s3)'; btn.style.color = i===val ? '#fff' : 'var(--tx3)'; btn.style.fontWeight = i===val ? '700' : '400'; }
  }
}

async function guardarCheckin(){
  const sueno = _checkinData.sueno || 3;
  const energia = _checkinData.energia || 3;
  const peso = parseFloat(document.getElementById('ci_peso')?.value) || 0;
  const semana = getISOWeek();

  // Guardar semana local
  localStorage.setItem('checkin_semana_' + semana, JSON.stringify({sueno, energia, peso, fecha: new Date().toISOString()}));

  // Guardar en BD para que el coach lo vea
  try {
    await api('/clientes/'+CD.id+'/checkin', {
      method: 'POST',
      body: JSON.stringify({ sueno, energia, peso, semana })
    });
  } catch(e){}

  // Guardar peso en BD si se indicó
  if(peso > 0){
    try { await api('/clientes/'+CD.id+'/pesos', {method:'POST', body:JSON.stringify({peso, grasa:null, cintura:null})}); } catch(e){}
  }

  // Recargar pantalla sin el banner
  renderSeleccion();
}

function renderSeleccion() {
  const el = document.getElementById('klContent');
  if(!el) return;
  el.innerHTML = hSeleccionDia();
  if(LANG !== 'es') setTimeout(()=>applyLang(el), 30);
}

function hSeleccionDia(){
  if(!CD.dias.length) return`<div style="padding:60px 20px;text-align:center;color:var(--tx3)"><div style="font-size:48px;margin-bottom:14px">🏋️</div><div style="font-size:16px;font-weight:600;color:var(--sv2)">${t('Tu coach está preparando tu plan')}</div></div>`;

  const cards = CD.dias.map((d,i)=>{
    const exNames = d.ejercicios.slice(0,3).map(e=>e.nombre).join(', ') + (d.ejercicios.length>3?'...':'');
    const lastSession = (CD.sesiones_resumen||[]).find(s=>s.dia_nombre===d.nombre);
    const lastStr = lastSession ? `Hace ${diasDesde(lastSession.fecha)}` : t('Sin realizar');
    const totalSeries = d.ejercicios.reduce((a,e)=>a+e.series,0);
    const estadoHoy = getSesionEstado(d.nombre);
    const yaHecha = !!estadoHoy;
    const borderColor = estadoHoy==='completado'?'rgba(34,197,94,.4)':estadoHoy==='incompleto'?'rgba(245,158,11,.3)':'var(--br)';
    const bgColor = estadoHoy==='completado'?'rgba(34,197,94,.05)':estadoHoy==='incompleto'?'rgba(245,158,11,.04)':'var(--s2)';
    return`<div onclick="${yaHecha?'':'abrirPreviewDia('+i+')'}" style="background:${bgColor};border:0.5px solid ${borderColor};border-radius:16px;padding:14px;cursor:${yaHecha?'default':'pointer'};transition:.15s">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div style="flex:1;min-width:0">
          <div style="font-size:16px;font-weight:700;color:var(--sv);margin-bottom:2px">${d.nombre}</div>
          <div style="font-size:12px;color:var(--blg);font-weight:600">${tc(d.grupo)||d.grupo}</div>
        </div>
        <div style="background:var(--s3);border-radius:8px;padding:4px 8px;text-align:center;flex-shrink:0;margin-left:8px">
          <div style="font-size:14px;font-weight:700;color:var(--sv)">${d.ejercicios.length}</div>
          <div style="font-size:9px;color:var(--tx3);text-transform:uppercase;letter-spacing:.05em">${t('ejerc.')}</div>
        </div>
      </div>
      ${estadoHoy
        ? `<span style="display:inline-flex;align-items:center;gap:4px;background:${estadoHoy==='completado'?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'};border:0.5px solid ${estadoHoy==='completado'?'rgba(34,197,94,.3)':'rgba(245,158,11,.3)'};border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;color:${estadoHoy==='completado'?'var(--gnb)':'var(--amb)'}">${estadoHoy==='completado'?t('✓ Completado hoy'):t('⚠ Incompleto hoy')}</span>`
        : `<div style="font-size:12px;color:var(--tx3);margin-bottom:8px;line-height:1.5">${exNames||'Sin ejercicios'}</div>
           <div style="display:flex;align-items:center;gap:5px">
             <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#52525b" stroke-width="1.3"/><path d="M8 5v3l2 2" stroke="#52525b" stroke-width="1.3" stroke-linecap="round"/></svg>
             <span style="font-size:11px;color:var(--tx3)">${lastStr}</span>
             <span style="margin-left:auto;font-size:11px;color:var(--tx3)">${totalSeries} series</span>
           </div>`
      }
    </div>`;
  }).join('');

  return`<div style="padding:16px 14px 8px">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.08em;color:var(--sv);margin-bottom:2px">${t('Entrenar')}</div>
    <div style="font-size:13px;color:var(--tx3);margin-bottom:14px">${t('Semana')} ${CD.semanas} · ${t(CD.objetivo||'')} </div>
    ${hStreakBanner()}
    ${hMensajeCoach()}
    ${hCheckinBanner()}
    ${hNotifBanner()}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${cards}</div>
  </div>`;
}
function diasDesde(fecha){
  const d = Math.floor((Date.now()-new Date(fecha).getTime())/86400000);
  if(d===0) return 'Hoy';
  if(d===1) return 'Ayer';
  return d+' días';
}

async function abrirPreviewDia(i){
  activeDia = i;
  vistaActual = 'preview';
  try {
    const sesiones = await api('/clientes/'+CD.id+'/sesiones');
    window._sesionesCache = sesiones;
  } catch(e) { window._sesionesCache = []; }
  const el = document.getElementById('klContent');
  el.innerHTML = hPreviewDia(i);
  setTimeout(()=>applyLang(el), 30);
}

function hPreviewDia(i){
  const d = CD.dias[i];
  const sesiones = window._sesionesCache || [];

  // Find last performance per ejercicio
  const ultimoPorEx = {};
  sesiones.forEach(s=>{
    if(s.dia_nombre !== d.nombre) return;
    s.series.forEach(sr=>{
      if(!ultimoPorEx[sr.ejercicio_nombre]||new Date(s.fecha)>new Date(ultimoPorEx[sr.ejercicio_nombre].fecha)){
        ultimoPorEx[sr.ejercicio_nombre]={...sr,fecha:s.fecha};
      }
    });
  });

  const lastSession = sesiones.find(s=>s.dia_nombre===d.nombre);
  const lastStr = lastSession ? `${t('Último')}: ${diasDesde(lastSession.fecha)}` : t('Sin realizar aún');

  const exList = d.ejercicios.map((e,ei)=>{
    const ult = ultimoPorEx[e.nombre];
    const ultStr = ult ? `${fmtPeso(ult.peso_real)} × ${ult.reps_real} reps` : '—';
    const imgUrl = e.imagen_url || (window.exConfig&&window.exConfig[e.nombre]?.imagen_url) || '';
    const bg = getExerciseBg(e.nombre);
    return`<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:0.5px solid var(--br)">
      ${renderExImg(e.nombre, 44, e.grupo||EX_GROUP_MAP[e.nombre]||'', e.imagen_url||'')}
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;color:var(--sv);margin-bottom:2px">${e.nombre}</div>
        <div style="font-size:12px;color:var(--tx3)">${e.series} × ${e.reps}${e.peso_objetivo>0?' · '+fmtPeso(e.peso_objetivo):''}</div>
        ${ult?`<div style="font-size:11px;color:var(--sv3);margin-top:1px">${t('Anterior')}: ${ultStr}</div>`:''}
        ${e.es_principal?`<span style="font-size:10px;background:rgba(245,158,11,.2);color:var(--amb);padding:1px 6px;border-radius:4px;font-weight:700">⭐</span>`:''}
      </div>
      <button onclick="event.stopPropagation();abrirDescripcion('${e.nombre.replace(/'/g,"\'")}')" style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,.15);border:0.5px solid rgba(59,130,246,.25);color:var(--blg);cursor:pointer;font-size:14px;font-weight:700;flex-shrink:0;display:flex;align-items:center;justify-content:center">?</button>
    </div>`;
  }).join('');

  return`<div style="display:flex;flex-direction:column;height:100%">
    <!-- Header -->
    <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--s);border-bottom:0.5px solid var(--br);flex-shrink:0">
      <button onclick="volverSeleccion()" style="width:34px;height:34px;border-radius:8px;background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);cursor:pointer;display:flex;align-items:center;justify-content:center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <div style="flex:1">
        <div style="font-size:16px;font-weight:700;color:var(--sv)">${d.nombre}</div>
        <div style="font-size:11px;color:var(--tx3)">${lastStr}</div>
      </div>
    </div>
    <!-- Exercise list -->
    <div style="flex:1;overflow-y:auto;padding-bottom:140px">
      <div style="padding:10px 16px 6px;font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.08em">${t(d.grupo)||d.grupo} · ${d.ejercicios.length} ${t('ejercicios')}</div>
      ${exList}
    </div>
    <!-- Entrenar button -->
    <div style="position:fixed;bottom:0;left:0;right:0;padding:12px 16px max(env(safe-area-inset-bottom),12px);padding-bottom:calc(max(env(safe-area-inset-bottom),12px) + 68px);background:rgba(9,9,11,.97);border-top:0.5px solid var(--br);z-index:200">
      <button onclick="empezarEntreno(${i})" style="width:100%;padding:16px;background:var(--bl2);color:#fff;border:none;border-radius:14px;font-size:17px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.02em">${t('Entrenar')}</button>
    </div>
  </div>`;
}

function volverSeleccion(){
  vistaActual = 'seleccion';
  renderSeleccion();
}

function empezarEntreno(i){
  activeDia = i;
  vistaActual = 'entreno';
  workoutStartTime = null;
  if(workoutTimerInt){clearInterval(workoutTimerInt);workoutTimerInt=null;}
  runningTimers = {};
  activeInput = null;
  doneShown = false;
  const klEl = document.getElementById('klContent');
  klEl.innerHTML = hEntreno();
  setTimeout(()=>{ applyLang(klEl); iniciarEntreno(); }, 100);
}

// Modal descripción ejercicio
function abrirDescripcion(nombre){
  const desc = EX_DESCRIPCIONES[nombre];
  const emoji = getExerciseEmoji(nombre);
  const bg = getExerciseBg(nombre);
  // Get imagen_url: exImages map (loaded at login, lightweight) > exConfig (coach) > CD fallback
  let imgUrl = (window.exImages && window.exImages[nombre])
    || (window.exConfig && window.exConfig[nombre]?.imagen_url) || '';
  if(!imgUrl && CD && CD.dias){
    CD.dias.forEach(d=>d.ejercicios.forEach(e=>{
      if(e.nombre===nombre && e.imagen_url && e.imagen_url !== '__HAS_IMAGE__') imgUrl=e.imagen_url;
    }));
  }

  // Cache de instrucciones traducidas
  const exTransKey = 'ex_trans_'+nombre.replace(/[^a-zA-Z0-9]/g,'_');
  const cachedSteps = LANG==='en' ? (()=>{ try{return JSON.parse(localStorage.getItem(exTransKey)||'null');}catch(e){return null;} })() : null;
  const stepsToShow = cachedSteps || desc;

  const pasos = stepsToShow ? stepsToShow.map((p,i)=>`<div style="display:flex;gap:12px;margin-bottom:10px">
    <div style="width:22px;height:22px;border-radius:50%;background:rgba(59,130,246,.2);color:var(--blg);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${i+1}</div>
    <div style="font-size:14px;color:var(--sv2);line-height:1.55">${p}</div>
  </div>`).join('') : `<div style="font-size:13px;color:var(--tx3)">${t('Descripción no disponible.')}</div>`;

  const modal = document.createElement('div');
  modal.id = 'desc_modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(9,9,11,.97);z-index:600;display:flex;flex-direction:column;overflow:hidden';

  // Guardar en variable global para evitar problemas de escaping en onclick
  window._descModalNombre = nombre;
  window._descModalPasos = desc || null;

  modal.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--s);border-bottom:0.5px solid var(--br);flex-shrink:0">
      <button onclick="document.getElementById('desc_modal').remove(); window._descModalNombre=null; window._descModalPasos=null;" style="width:34px;height:34px;border-radius:8px;background:var(--s2);border:0.5px solid var(--br);color:var(--sv2);cursor:pointer;font-size:20px;line-height:1">×</button>
      <div style="font-size:15px;font-weight:700;color:var(--sv);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${nombre}</div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px">
      <div style="width:100%;border-radius:14px;overflow:hidden;margin-bottom:16px;background:${bg}">
        ${imgUrl
          ? `<div style="width:100%;display:flex;align-items:center;justify-content:center;background:#0d1520;border-radius:14px">
               <img src="${imgUrl}" style="width:100%;object-fit:contain;border-radius:14px" onerror="this.parentElement.style.display='none'"/>
             </div>`
          : `<div style="padding:16px;display:flex;gap:12px;align-items:flex-start">
               <div style="flex-shrink:0;width:80px">${getMuscleMapSVG(nombre)}</div>
               <div style="flex:1">
                 <div style="font-size:10px;font-weight:700;color:var(--blg);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">${t("Músculos trabajados")}</div>
                 <div style="display:flex;flex-wrap:wrap;gap:5px">
                   ${getExerciseMuscles(nombre).map(m=>'<span style="font-size:11px;background:rgba(239,68,68,.15);color:#fca5a5;border:0.5px solid rgba(239,68,68,.3);padding:3px 8px;border-radius:10px;font-weight:600">'+t(m)+'</span>').join('')}
                 </div>
                 <div style="font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em;margin-top:10px;margin-bottom:5px">${t("Secundarios")}</div>
                 <div style="display:flex;flex-wrap:wrap;gap:5px">
                   ${getExerciseSecondary(nombre).map(m=>'<span style="font-size:11px;background:rgba(59,130,246,.1);color:#93c5fd;border:0.5px solid rgba(59,130,246,.2);padding:3px 8px;border-radius:10px">'+t(m)+'</span>').join('')}
                 </div>
               </div>
             </div>`
        }
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--blg);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">${t('INSTRUCCIONES')}</div>
      <div id="desc_pasos">${pasos}</div>
      ${LANG==='en' && desc ? `
      <button id="btn_trans_ex" onclick="traducirEjercicioIA(window._descModalNombre, window._descModalPasos)" title="Translate with AI"
        style="width:100%;margin-top:14px;padding:8px;background:rgba(59,130,246,.1);color:#93c5fd;border:0.5px solid rgba(59,130,246,.2);border-radius:10px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;touch-action:manipulation">
        <span style="font-size:20px" id="btn_trans_ex_txt">${cachedSteps ? '✅🇬🇧' : '🇬🇧'}</span>
      </button>` : ''}
    </div>`;
  document.body.appendChild(modal);
}


function hEntreno(){
  if(!CD.dias.length)return`<div style="padding:60px 20px;text-align:center;color:var(--tx3)"><div style="font-size:48px;margin-bottom:14px">🏋️</div><div style="font-size:16px;font-weight:600;color:var(--sv2)">${t('Tu coach está preparando tu plan')}</div></div>`;
  const d=CD.dias[activeDia]||CD.dias[0];
  const pills=CD.dias.map((day,i)=>`<button class="day-pill ${i===activeDia?'on':''}" onclick="selDia(${i})">${day.nombre}</button>`).join('');
  const doneSeries=d.ejercicios.reduce((a,e)=>a+(e._series?e._series.filter(s=>s.done).length:0),0);
  const totalSeries=d.ejercicios.reduce((a,e)=>a+e.series,0);
  const pct=totalSeries?Math.round(doneSeries/totalSeries*100):0;

  const exCards=d.ejercicios.map((e,ei)=>{
    if(!e._series)e._series=Array.from({length:e.series},(_,i)=>({done:false,peso:e.peso_objetivo,reps:parseFirstNum(e.reps),reps_real:parseFirstNum(e.reps),timer:null}));
    const exDone=e._series.every(s=>s.done);
    const ytUrl=e.youtube_url||EX_YT[e.nombre]||'';
    const cfg=(window.exConfig&&window.exConfig[e.nombre])||{};
   const key = e.nombre ? e.nombre.trim().toLowerCase() : '';
const imgUrl =
  (window.exImagesNormalized && window.exImagesNormalized[key]) ||
  (window.exImages && window.exImages[e.nombre]) ||
  e.imagen_url ||
  cfg.imagen_url ||
  '';
    const seriesRows=e._series.map((s,si)=>{
      const timerKey=`${ei}_${si}`;
      const rt=runningTimers[timerKey];
      const timerSecs=rt?getTimerRemaining(rt):0;
      const timerPct=rt?Math.round((timerSecs/rt.total)*100):0;
      return`<div class="strong-serie-wrap" id="sw_${ei}_${si}">
        <div class="strong-serie-row ${s.done?'done':''}" style="grid-template-columns:${e.rir!=null?'28px 1fr 36px 58px 52px 44px':'28px 1fr 36px 1fr 1fr'}">
          <div class="strong-serie-num">${si+1}</div>
          <div class="strong-serie-prev">${s.peso||0} × ${s.reps_real||s.reps||10}</div>
          <button class="strong-check ${s.done?'done':''}" onclick="toggleSerieStrong(${ei},${si})">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='peso'?'active':''}" onclick="openKeyboard(${ei},${si},'peso')">${s.peso||0}</button>
          <button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='reps'?'active':''}" onclick="openKeyboard(${ei},${si},'reps')">${s.reps_real||s.reps||10}</button>
          ${e.rir!=null?(si===e._series.length-1?`<button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='rir'?'active':''}" onclick="openKeyboard(${ei},${si},'rir')" style="font-size:13px">${s.rir_real!=null?s.rir_real:e.rir}</button>`:'<div></div>'):'<div></div>'}
        </div>
        ${s.done?`<div class="strong-timer-bar" id="tb_${ei}_${si}">
          <div class="strong-timer-fill ${rt&&timerSecs<=10?'urg':''}" id="tf_${ei}_${si}" style="width:${timerPct}%"></div>
          <span class="strong-timer-label" id="tl_${ei}_${si}">${rt?fmt(getTimerRemaining(rt)):'1:30'}</span>
        </div>`:''}
      </div>`;
    }).join('');

    return`<div class="strong-ex-card ${exDone?'done-ex':''}" id="exc_${ei}">
     <div class="strong-ex-header">

  <div style="display:flex;flex-direction:column;gap:4px;margin-right:6px">
    <button onclick="moveEx(${activeDia}, ${ei}, -1)" style="width:26px;height:22px;background:rgba(255,255,255,.06);border:0.5px solid var(--br);border-radius:6px;color:var(--tx);cursor:pointer">↑</button>
    <button onclick="moveEx(${activeDia}, ${ei}, 1)" style="width:26px;height:22px;background:rgba(255,255,255,.06);border:0.5px solid var(--br);border-radius:6px;color:var(--tx);cursor:pointer">↓</button>
  </div>

  ${renderExImg(e.nombre, 52, e.grupo||EX_GROUP_MAP[e.nombre]||'', imgUrl)}

  <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <div style="font-size:10px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.06em">${t(e.grupo||'')||''}</div>
            ${e.es_principal?`<span style="font-size:10px;background:rgba(245,158,11,.2);color:var(--amb);padding:1px 6px;border-radius:4px;font-weight:700">⭐ Principal</span>`:''}
            ${e.rir!=null?`<span style="font-size:10px;background:rgba(59,130,246,.15);color:var(--blg);padding:1px 6px;border-radius:4px;font-weight:700">RIR: ${e.rir}</span>`:''}
          </div>
          <div style="font-size:16px;font-weight:700;color:var(--sv)">${e.nombre}</div>
          <div style="font-size:11px;color:var(--tx3)">${e.musculos||''}</div>
        </div>
        ${ytUrl?`<button onclick="openVideo('${ytUrl}','${e.nombre}')" style="width:34px;height:34px;border-radius:8px;background:rgba(239,68,68,.15);border:0.5px solid rgba(239,68,68,.3);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></button>`:''}
      </div>
      ${e.nota_coach?`<div style="background:linear-gradient(135deg,rgba(180,130,0,0.18),rgba(245,158,11,0.1));border-left:3px solid #f59e0b;padding:8px 12px;margin:0 0 8px;display:flex;gap:8px;align-items:flex-start"><span style="font-size:14px">🐺</span><div><div style="font-size:9px;color:#fcd34d;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:1px">${t('Coach dice')}</div><div style="font-size:12px;color:#fde68a;font-weight:600">${e.nota_coach}</div></div></div>`:''}
      <div class="strong-serie-header" style="grid-template-columns:${e.rir!=null?'28px 1fr 36px 58px 52px 44px':'28px 1fr 36px 1fr 1fr'}">
        <span>${t('SET')}</span><span>${t('PREVIOUS')}</span><span>✓</span><span>${pesoLabel().toUpperCase()}</span><span>${t('REPS')}</span>${e.rir!=null?'<span>RIR</span>':''}
      </div>
      ${seriesRows}
      <!-- Nota del cliente para el coach -->
      <div style="padding:8px 14px 12px">
        <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">${t('💬 Nota para el coach (sensaciones, dolor, etc.)')}</div>
        <input id="nota_cliente_${ei}" type="text" placeholder="${t('Ej: Sentí el peso muy pesado, me dolió el hombro...')}" value="${e._nota_cliente||''}"
          style="width:100%;padding:8px 10px;border:0.5px solid var(--br);border-radius:8px;background:var(--s2);color:var(--sv);font-size:12px;font-family:inherit;box-sizing:border-box"
          onchange="CD.dias[activeDia].ejercicios[${ei}]._nota_cliente=this.value"/>
      </div>
    </div>`;
  }).join('');

  const wolfSrc = WOLF_UPPER_SRC; // mancuerna wolf for all days
  return`<div class="hero-day" style="position:relative;overflow:hidden">
    <img src="${wolfSrc}" style="position:absolute;right:-10px;bottom:-10px;height:120px;width:auto;opacity:.2;mix-blend-mode:screen;pointer-events:none;z-index:0"/>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1">
      <div>
        <div class="hero-day-lbl">${t('Entrenamiento')}</div>
        <div class="hero-day-name">${d.nombre}</div>
        <div class="hero-day-sub">${t(d.grupo)||d.grupo}</div>
      </div>
      <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        ${workoutStartTime?`<div id="workout_timer" style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gnb);letter-spacing:.08em">00:00</div><div style="font-size:9px;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em">${t('En curso')}</div>`:''}
        <button id="btn_terminar" onclick="terminarEntreno()" style="background:rgba(239,68,68,.2);color:#fca5a5;border:1px solid rgba(239,68,68,.4);border-radius:12px;padding:10px 18px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;min-width:100px;min-height:42px;-webkit-tap-highlight-color:transparent;touch-action:manipulation">${t('■ Terminar')}</button>
      </div>
    </div>
    ${pct>0?`<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.4);font-weight:600;margin-bottom:4px"><span>${t('Progreso')}</span><span>${doneSeries}/${totalSeries}</span></div><div style="height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--bl);border-radius:2px;transition:.5s"></div></div></div>`:''}
  </div>
  <div class="day-scroll">${pills}</div>
  <div style="padding:8px 14px 4px;font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.08em">${d.grupo}</div>
  ${exCards}
  ${d.ejercicios.length>0&&d.ejercicios.every(e=>e._series&&e._series.every(s=>s.done))?`<div style="margin:0 14px 20px;background:var(--gnd);border:0.5px solid rgba(34,197,94,.3);border-radius:14px;padding:18px;text-align:center"><div style="font-size:32px;margin-bottom:8px">🎉</div><div style="font-size:16px;font-weight:700;color:var(--gnb)">${t('¡Entreno completado!')}</div><div style="font-size:13px;color:var(--tx3);margin-top:4px">${t('Descansa y come bien.')}</div></div>`:''}
  ${renderKeyboard()}`;
}

function parseFirstNum(r){const m=String(r||10).match(/\d+/);return m?parseInt(m[0]):10;}

function renderKeyboard(){
  return`<div id="strong_keyboard" style="display:none;position:fixed;bottom:60px;left:0;right:0;z-index:400;background:var(--s2);border-top:1.5px solid var(--br2);padding:10px 14px 16px;box-shadow:0 -8px 32px rgba(0,0,0,.7)">
    <div id="kb_rir_hint" style="display:none;background:rgba(37,99,235,.1);border:0.5px solid rgba(59,130,246,.3);border-radius:8px;padding:6px 10px;margin-bottom:8px;font-size:11px;color:var(--blg);text-align:center">
      ${t('💪 ¿Cuántas reps más podrías haber hecho? (RIR = Reps In Reserve)')}<br>
      <span style="color:var(--tx3)">${t('0 = al fallo · 1 = casi al límite · 2-3 = cómodo · 4+ = fácil')}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:0 4px">
      <div style="font-size:11px;color:var(--tx3);font-weight:600;text-transform:uppercase;letter-spacing:.06em" id="kb_label">kg</div>
      <div style="font-size:22px;font-weight:700;color:var(--sv)" id="kb_display">0</div>
      <div style="display:flex;gap:8px">
        <button onclick="kbPause()" style="padding:6px 12px;background:var(--s3);border:0.5px solid var(--br);border-radius:8px;color:var(--sv2);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit" id="kb_pause_btn">⏸ Pausar</button>
        <button onclick="kbSkip()" style="padding:6px 14px;background:var(--bl2);border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Skip →</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
      ${[1,2,3,'⌫',4,5,6,'.',7,8,9,'✓',null,0,null,null].map((k,i)=>{
        if(k===null)return`<div></div>`;
        if(k==='✓')return`<button onclick="kbConfirm()" style="background:var(--bl2);color:#fff;border:none;border-radius:10px;padding:16px;font-size:18px;font-weight:700;cursor:pointer;font-family:inherit">✓</button>`;
        if(k==='⌫')return`<button onclick="kbDel()" style="background:var(--s3);color:var(--sv2);border:0.5px solid var(--br);border-radius:10px;padding:16px;font-size:18px;font-weight:700;cursor:pointer;font-family:inherit">⌫</button>`;
        return`<button onclick="kbNum('${k}')" style="background:var(--s3);color:var(--sv);border:0.5px solid var(--br);border-radius:10px;padding:16px;font-size:18px;font-weight:700;cursor:pointer;font-family:inherit">${k}</button>`;
      }).join('')}
    </div>
  </div>`;
}

let kbValue = '';

function openKeyboard(ei, si, field){
  activeInput = {ei, si, field};
  const e = CD.dias[activeDia].ejercicios[ei];
  if(field === 'peso') kbValue = String(e._series[si].peso || 0);
  else if(field === 'reps') kbValue = String(e._series[si].reps_real || e._series[si].reps || 10);
  else kbValue = String(e._series[si].rir_real != null ? e._series[si].rir_real : (e.rir != null ? e.rir : 2));
  const kb = document.getElementById('strong_keyboard');
  const lbl = document.getElementById('kb_label');
  const disp = document.getElementById('kb_display');
  if(kb){ kb.style.display='block'; }
  if(lbl) {
    lbl.textContent = field==='peso' ? pesoLabel() : field==='reps' ? 'reps' : 'RIR';
    // Hint especial para RIR
    lbl.style.color = field==='rir' ? 'var(--blg)' : '';
  }
  if(disp) {
    disp.textContent = kbValue;
    disp.style.color = field==='rir' ? 'var(--blg)' : '';
  }
  // Mostrar hint de RIR
  const hint = document.getElementById('kb_rir_hint');
  if(hint) hint.style.display = field==='rir' ? 'block' : 'none';
  // Padding + scroll so active row is visible above keyboard
  const bnav=document.querySelector('#sCliente .bnav-bar');
  const bnavH=bnav?bnav.offsetHeight:60;
  setTimeout(()=>{
    const kbH=kb?kb.offsetHeight:280;
    const scroll=document.querySelector('#sCliente .scroll');
    if(scroll)scroll.style.paddingBottom=(bnavH+kbH+20)+'px';
    const rowEl=document.getElementById('sw_'+ei+'_'+si);
    if(rowEl)rowEl.scrollIntoView({behavior:'smooth',block:'center'});
  },80);
  rerenderSerieHeaders();
}

function kbNum(n){
  if(kbValue==='0') kbValue=String(n);
  else kbValue+=String(n);
  const disp=document.getElementById('kb_display');
  if(disp)disp.textContent=kbValue;
}
function kbDel(){
  kbValue=kbValue.slice(0,-1)||'0';
  const disp=document.getElementById('kb_display');
  if(disp)disp.textContent=kbValue;
}
function kbConfirm(){
  if(!activeInput)return;
  const {ei,si,field}=activeInput;
  const e=CD.dias[activeDia].ejercicios[ei];
  const val=parseFloat(kbValue)||0;
  if(field==='peso'){
    e._series[si].peso=val;
    rerenderSerieRow(ei,si);
    // Auto-jump to reps
    setTimeout(()=>openKeyboard(ei,si,'reps'),80);
  } else if(field==='reps') {
    e._series[si].reps_real=val;
    // Si es la última serie Y el ejercicio tiene RIR → pedir RIR antes de confirmar
    const esUltimaSerie = si === e._series.length - 1;
    if(esUltimaSerie && e.rir != null && e._series[si].rir_real == null) {
      closeKeyboard();
      rerenderSerieRow(ei,si);
      setTimeout(()=>openKeyboard(ei,si,'rir'),80);
    } else {
      closeKeyboard();
      if(!e._series[si].done){
        e._series[si].done=true;
        soundDing();
        const allDone=CD.dias[activeDia].ejercicios.every(ex=>ex._series&&ex._series.every(s=>s.done));
        if(allDone && !doneShown){
          rerenderSerieRow(ei,si);
          mostrarDoneOverlay('completado', 0);
        } else {
          startTimerInline(ei, si, e.descanso||90);
          rerenderSerieRow(ei,si);
        }
      } else {
        rerenderSerieRow(ei,si);
      }
    }
  } else {
    // field === 'rir'
    e._series[si].rir_real=val;
    closeKeyboard();
    if(!e._series[si].done){
      e._series[si].done=true;
      soundDing();
      const allDone=CD.dias[activeDia].ejercicios.every(ex=>ex._series&&ex._series.every(s=>s.done));
      if(allDone && !doneShown){
        rerenderSerieRow(ei,si);
        mostrarDoneOverlay('completado', 0);
      } else {
        startTimerInline(ei, si, e.descanso||90);
        rerenderSerieRow(ei,si);
      }
    } else {
      rerenderSerieRow(ei,si);
    }
  }
}
function closeKeyboard(){
  const kb=document.getElementById('strong_keyboard');
  if(kb)kb.style.display='none';
  activeInput=null;
  const scroll=document.querySelector('#sCliente .scroll');
  if(scroll)scroll.style.paddingBottom='80px';
}
function kbPause(){
  if(!activeInput)return;
  const {ei,si}=activeInput;
  const key=`${ei}_${si}`;
  const rt=runningTimers[key];
  if(!rt)return;
  if(rt.paused){
    rt.paused=false;
    const btn=document.getElementById('kb_pause_btn');
    if(btn)btn.textContent='⏸ Pausar';
    resumeTimer(ei,si);
  }else{
    rt.secs = getTimerRemaining(rt);
    rt.paused=true;
    clearInterval(rt.interval);
    cancelarNotificacionDescanso(key);
    updateTimerBar(ei, si, rt);
    const btn=document.getElementById('kb_pause_btn');
    if(btn)btn.textContent='▶ Reanudar';
  }
}
function kbSkip(){
  if(!activeInput)return;
  const {ei,si}=activeInput;
  stopTimer(ei,si);
  closeKeyboard();
}

function toggleSerieStrong(ei,si){
  const e=CD.dias[activeDia].ejercicios[ei];
  if(!e._series)e._series=Array.from({length:e.series},(_,i)=>({done:false,peso:e.peso_objetivo,reps:parseFirstNum(e.reps),reps_real:parseFirstNum(e.reps)}));
  e._series[si].done=!e._series[si].done;

  if(e._series[si].done){
    soundDing();
    // Iniciar timer de descanso para esta serie
    startTimerInline(ei, si, e.descanso||90);
    // Abrir teclado apuntando a esta serie para editar kg si quiere
    openKeyboard(ei, si, 'peso');
  } else {
    stopTimer(ei,si);
    closeKeyboard();
  }

  rerenderSerieRow(ei,si);

  const allDone=CD.dias[activeDia].ejercicios.every(ex=>ex._series&&ex._series.every(s=>s.done));
  if(allDone && !doneShown){
    mostrarDoneOverlay('completado', 0);
  }
}

async function guardarSesion(){
  try{
    const d=CD.dias[activeDia];
    const series=[];
    d.ejercicios.forEach((e,ei)=>{
      const notaCliente = e._nota_cliente || document.getElementById('nota_cliente_'+ei)?.value || '';
      (e._series||[]).forEach((s,si)=>{
        if(s.done)series.push({
          ejercicio:e.nombre,
          serie_num:si+1,
          peso:s.peso||0,
          reps:s.reps_real||parseFirstNum(e.reps),
          rir:s.rir_real!=null?s.rir_real:(e.rir!=null?e.rir:2),
          nota_cliente: notaCliente
        });
      });
    });
    console.log('[WM] Guardando sesión completada:', d.nombre, series.length, 'series');
    const r = await api('/clientes/'+CD.id+'/sesiones',{
      method:'POST',
      body:JSON.stringify({dia_nombre:d.nombre,dia_grupo:d.grupo,duracion_min:getWorkoutDuration(),series,estado:'completado'})
    });
    console.log('[WM] Sesión guardada OK:', r);
    // Actualizar localStorage con estado del servidor
    const hoy = new Date().toISOString().split('T')[0];
    localStorage.setItem('wm_sesion_'+CD.id+'_'+d.nombre.replace(/\s/g,'_')+'_'+hoy, 'completado');
  }catch(e){
    console.error('[WM] Error guardando sesión:',e);
    // Reintentar una vez tras 3 segundos
    setTimeout(async ()=>{
      try{
        const d=CD.dias[activeDia];
        const series=[];
        d.ejercicios.forEach((e,ei)=>{
          const notaCliente = e._nota_cliente || '';
          (e._series||[]).forEach((s,si)=>{
            if(s.done)series.push({ejercicio:e.nombre,serie_num:si+1,peso:s.peso||0,reps:s.reps_real||parseFirstNum(e.reps),rir:s.rir_real!=null?s.rir_real:(e.rir!=null?e.rir:2),nota_cliente:notaCliente});
          });
        });
        await api('/clientes/'+CD.id+'/sesiones',{method:'POST',body:JSON.stringify({dia_nombre:d.nombre,dia_grupo:d.grupo,duracion_min:getWorkoutDuration(),series,estado:'completado'})});
        console.log('[WM] Sesión guardada OK (reintento)');
        const hoy = new Date().toISOString().split('T')[0];
        localStorage.setItem('wm_sesion_'+CD.id+'_'+d.nombre.replace(/\s/g,'_')+'_'+hoy, 'completado');
      }catch(e2){console.error('[WM] Error en reintento de sesión:',e2);}
    }, 3000);
  }
}

function getTimerRemaining(rt){
  if(!rt) return 0;
  if(rt.paused) return Math.max(0, Math.ceil(rt.secs || 0));
  if(rt.endAt) return Math.max(0, Math.ceil((rt.endAt - Date.now()) / 1000));
  return Math.max(0, Math.ceil(rt.secs || 0));
}

function tickTimerInline(ei, si, key){
  const rt = runningTimers[key];
  if(!rt) return;
  if(rt.paused){
    updateTimerBar(ei, si, rt);
    return;
  }
  rt.secs = getTimerRemaining(rt);
  updateTimerBar(ei, si, rt);
  if(rt.secs <= 0){
    if(rt.interval) clearInterval(rt.interval);
    delete runningTimers[key];
    updateTimerBar(ei, si, null);
    if(!doneShown) {
      soundBell();
      vibrate([150,80,150]);
      const exNow = CD?.dias[activeDia]?.ejercicios[ei];
      notificarDescansoTerminado(exNow?.nombre||'');
    }
  }
}

function startTimerInline(ei, si, total){
  // Stop ALL other running timers first
  Object.keys(runningTimers).forEach(k=>{
    if(k!==`${ei}_${si}` && runningTimers[k]){
      clearInterval(runningTimers[k].interval);
      // Cancelar notificación programada del timer anterior
      cancelarNotificacionDescanso(k);
      const [oei,osi] = k.split('_');
      const tb = document.getElementById('tb_'+oei+'_'+osi);
      if(tb) tb.style.display='none';
      delete runningTimers[k];
    }
  });
  const key=`${ei}_${si}`;
  if(runningTimers[key]){
    clearInterval(runningTimers[key].interval);
    cancelarNotificacionDescanso(key);
  }

  const safeTotal = Math.max(1, parseInt(total || 90, 10));
  runningTimers[key]={secs:safeTotal, total:safeTotal, paused:false, interval:null, endAt:Date.now() + safeTotal*1000};

  // Programar notificación desde el SW (mejor que setInterval cuando se bloquea la pantalla)
  const exNow = CD?.dias[activeDia]?.ejercicios[ei];
  if(!doneShown) programarNotificacionDescanso(exNow?.nombre||'', safeTotal, key);

  tickTimerInline(ei, si, key);
  runningTimers[key].interval=setInterval(()=>tickTimerInline(ei, si, key), 1000);
}

function resumeTimer(ei,si){
  const key=`${ei}_${si}`;
  const rt=runningTimers[key];
  if(!rt)return;
  if(rt.interval) clearInterval(rt.interval);
  rt.paused=false;
  rt.secs=Math.max(1, getTimerRemaining(rt));
  rt.endAt=Date.now() + rt.secs*1000;
  const exNow = CD?.dias[activeDia]?.ejercicios[ei];
  if(!doneShown) programarNotificacionDescanso(exNow?.nombre||'', rt.secs, key);
  tickTimerInline(ei, si, key);
  rt.interval=setInterval(()=>tickTimerInline(ei, si, key),1000);
}

function stopTimer(ei,si){
  const key=`${ei}_${si}`;
  if(runningTimers[key]){clearInterval(runningTimers[key].interval);delete runningTimers[key];}
  cancelarNotificacionDescanso(key);
  updateTimerBar(ei,si,null);
}

function updateTimerBar(ei,si,rt){
  const fill=document.getElementById(`tf_${ei}_${si}`);
  const label=document.getElementById(`tl_${ei}_${si}`);
  const bar=document.getElementById(`tb_${ei}_${si}`);
  if(!fill||!label)return;
  if(!rt){
    if(bar)bar.style.display='none';
    return;
  }
  // Asegurar que la barra es visible
  if(bar)bar.style.display='flex';
  const secs = getTimerRemaining(rt);
  rt.secs = secs;
  const pct=Math.max(0, Math.min(100, Math.round((secs/rt.total)*100)));
  fill.style.width=pct+'%';
  fill.className='strong-timer-fill'+(secs<=10?' urg':'');
  label.textContent=fmt(secs);
}

function rerenderSerieRow(ei,si){
  // Re-render just the exercise card to reflect changes
  const card=document.getElementById(`exc_${ei}`);
  if(!card)return;
  const e=CD.dias[activeDia].ejercicios[ei];
  const s=e._series[si];
  const row=document.getElementById(`sw_${ei}_${si}`);
  if(!row)return;
  const key=`${ei}_${si}`;
  const rt=runningTimers[key];
  const timerSecs=rt?getTimerRemaining(rt):0;
  const timerPct=rt?Math.round((timerSecs/rt.total)*100):100;
  row.innerHTML=`<div class="strong-serie-row ${s.done?'done':''}" style="grid-template-columns:${e.rir!=null?'28px 1fr 36px 58px 52px 44px':'28px 1fr 36px 1fr 1fr'}">
    <div class="strong-serie-num">${si+1}</div>
    <div class="strong-serie-prev">${s.peso||0} × ${s.reps_real||s.reps||10}</div>
    <button class="strong-check ${s.done?'done':''}" onclick="toggleSerieStrong(${ei},${si})">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='peso'?'active':''}" onclick="openKeyboard(${ei},${si},'peso')">${s.peso||0}</button>
    <button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='reps'?'active':''}" onclick="openKeyboard(${ei},${si},'reps')">${s.reps_real||s.reps||10}</button>
    ${e.rir!=null?(si===e._series.length-1?`<button class="strong-cell ${activeInput&&activeInput.ei===ei&&activeInput.si===si&&activeInput.field==='rir'?'active':''}" onclick="openKeyboard(${ei},${si},'rir')" style="font-size:13px">${s.rir_real!=null?s.rir_real:e.rir}</button>`:'<div></div>'):'<div></div>'}
  </div>
  ${s.done?`<div class="strong-timer-bar" id="tb_${ei}_${si}" ${!rt?'style="display:none"':''}>
    <div class="strong-timer-fill${rt&&rt.secs<=10?' urg':''}" id="tf_${ei}_${si}" style="width:${timerPct}%"></div>
    <span class="strong-timer-label" id="tl_${ei}_${si}">${rt?fmt(getTimerRemaining(rt)):fmt(e.descanso||90)}</span>
  </div>`:''}`;
}

function rerenderSerieHeaders(){
  // just update active highlights without full re-render
  if(!activeInput)return;
  const {ei,si}=activeInput;
  document.querySelectorAll('.strong-cell.active').forEach(el=>el.classList.remove('active'));
  const cells=document.querySelectorAll(`#sw_${ei}_${si} .strong-cell`);
  if(cells[0]&&activeInput.field==='peso')cells[0].classList.add('active');
  if(cells[1]&&activeInput.field==='reps')cells[1].classList.add('active');
}

function selDia(i){
  activeDia=i;
  runningTimers={};
  activeInput=null;
  workoutStartTime=null;
  if(workoutTimerInt){clearInterval(workoutTimerInt);workoutTimerInt=null;}
  // If we're in entreno, go to preview first; if already selecting, go to entreno
  if(vistaActual==='entreno'){
    const klEl = document.getElementById('klContent');
    klEl.innerHTML=hEntreno();
    setTimeout(()=>{ applyLang(klEl); iniciarEntreno(); }, 50);
  } else {
    abrirPreviewDia(i);
  }
}

// DIETA CLIENTE
function hDieta(){
  const esVeg = CD.dieta_tipo==='Vegano'||CD.dieta_tipo==='Vegetariano';
  const acc = esVeg ? '#22c55e' : '#3b82f6';
  const accLight = esVeg ? '#86efac' : '#93c5fd';
  const accDark = esVeg ? '#166534' : '#1e3a5f';
  const accBg = esVeg ? 'rgba(34,197,94,.12)' : 'rgba(37,99,235,.12)';

  if(!CD.comidas.length) return `
    <div style="padding:60px 20px;text-align:center;color:var(--tx3)">
      <div style="font-size:48px;margin-bottom:14px">🥗</div>
      <div style="font-size:16px;font-weight:600;color:var(--sv2)">${t('Tu coach está preparando tu dieta')}</div>
    </div>`;

  const mealNames = ['BREAKFAST','MAIN MEAL','SNACK / POST-WORKOUT','DINNER','MEAL 5','MEAL 6'];
  const mealNamesES = ['DESAYUNO','ALMUERZO','MERIENDA','CENA','COMIDA 5','COMIDA 6'];

  // Usar traducción cacheada si existe
  const dietaTransKey = 'dieta_trans_'+CD.id;
  const rawCache = LANG==='en' ? (() => { try { return JSON.parse(localStorage.getItem(dietaTransKey)||'null'); } catch(e){ return null; } })() : null;
  // Soporte para formato antiguo (solo array) y nuevo (objeto con foods/vars/sups/ther)
  const cachedTrans = rawCache && typeof rawCache === 'object' && !Array.isArray(rawCache) && rawCache.foods ? rawCache : (rawCache ? { foods: rawCache } : null);

  const comidas = CD.comidas.map((m,i)=>({
    numero: i+1,
    nombre: LANG==='en' ? (mealNames[i]||'MEAL '+(i+1)) : (m.nombre.replace(/^\d+\.\s*/,'').toUpperCase() || mealNamesES[i]),
    nombreEN: mealNames[i] || 'MEAL '+(i+1),
    alimentos: m.items.map((it,j)=>({
      nombre: (cachedTrans?.foods?.[i]?.[j]) ? cachedTrans.foods[i][j] : it.nombre,
      cantidad: it.gramos+'g'
    }))
  }));

  const frase = (cachedTrans?.frase) || CD._planFrase || 'Consistency fuels results. Discipline builds freedom.';

  // Each meal card matching template style
  const comidasHtml = comidas.map((m,mi)=>`
    <div style="display:flex;border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;margin-bottom:10px;background:rgba(255,255,255,.02)">
      <!-- Left: number box -->
      <div style="width:54px;background:${accDark};border-right:1px solid ${acc}40;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;padding:10px 0">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:${accLight};line-height:1">${m.numero}</div>
      </div>
      <!-- Right: content -->
      <div style="flex:1;padding:10px 12px;min-width:0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:#fff;letter-spacing:.1em">${m.nombre}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.35);letter-spacing:.05em">${m.alimentos.length} ${t('alimentos')}</div>
          </div>
          ${m.alimentos.some(a=>a.nombre.toLowerCase().match(/pollo|salmón|salmon|huevo|whey|pavo|carne|proteína/))
            ? `<div style="font-size:9px;font-weight:700;color:${accLight};border:0.5px solid ${acc};padding:2px 7px;border-radius:4px;letter-spacing:.08em;background:${accBg}">HIGH PROTEIN</div>`
            : ''}
        </div>
        <div id="cl_meal_${mi}" style="display:contents">
          ${m.alimentos.map(a=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,.05)">
            <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
              <div style="width:4px;height:4px;border-radius:50%;background:${acc};flex-shrink:0"></div>
              <div style="font-size:12px;color:rgba(255,255,255,.8);line-height:1.4">${a.nombre}</div>
            </div>
            <div style="font-size:13px;font-weight:700;color:${accLight};margin-left:8px;white-space:nowrap;font-family:'Bebas Neue',sans-serif">${a.cantidad}</div>
          </div>`).join('')}
        </div>
        ${(()=>{
          const vars = CD._planVariaciones?.[mi];
          if(!vars?.length) return '';
          return `<div style="border-top:0.5px solid rgba(255,255,255,.07);margin-top:6px;padding-top:8px">
            <div style="font-size:10px;color:rgba(255,255,255,.3);letter-spacing:.08em;margin-bottom:6px">${t('OPCIONES ALTERNATIVAS')}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button onclick="clienteVarSelect2(${mi},-1,this)" style="padding:4px 12px;border-radius:10px;border:1px solid ${acc};background:${accBg};color:${accLight};font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation">A</button>
              ${vars.map((v,vi)=>`<button onclick="clienteVarSelect2(${mi},${vi},this)" style="padding:4px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,.2);background:none;color:rgba(255,255,255,.45);font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation">${v.letra||String.fromCharCode(66+vi)} · ${(cachedTrans?.vars?.[mi]?.[vi]) || v.nombre||''}</button>`).join('')}
            </div>
          </div>`;
        })()}
      </div>
    </div>`).join('');

  return `<div id="dieta_view" style="background:#06080e;min-height:100vh;padding-bottom:100px">

    <!-- HERO HEADER -->
    <div style="position:relative;background:linear-gradient(135deg,#06080e 0%,#0d1520 50%,#06080e 100%);overflow:hidden;display:flex;align-items:stretch;min-height:160px;border-bottom:1px solid ${acc}40">
      <!-- Lobo musculoso decorativo derecha -->
      <img src="${WOLF_DIETA_SRC}"
        style="position:absolute;right:0;top:0;width:55%;height:100%;object-fit:cover;object-position:center top;mix-blend-mode:screen;opacity:.95;mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.3) 20%,rgba(0,0,0,1) 60%);-webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.3) 20%,rgba(0,0,0,1) 60%);pointer-events:none"/>
      <!-- Logo izquierda -->
      <div style="position:relative;z-index:2;padding:16px 16px 0 16px;width:56%;display:flex;flex-direction:column;justify-content:center">
        <img src="/logo.png" style="width:100%;max-width:180px;display:block;mix-blend-mode:screen;filter:brightness(1.1)"/>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:11px;color:${accLight};letter-spacing:.15em;margin-top:6px;opacity:.8">NUTRITION PLAN</div>
      </div>
    </div>
    <!-- MEALS LIST -->
    <div style="padding:14px 14px 0">${comidasHtml}</div>

    <!-- FOOTER -->
    <div style="margin:10px 14px 0;background:rgba(0,0,0,.4);border-top:2px solid ${acc};border-radius:0 0 12px 12px;padding:14px 16px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:24px">🐺</div>
        <div style="flex:1">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:12px;color:#fff;letter-spacing:.06em;line-height:1.5">${frase.toUpperCase()}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:11px;color:${acc};letter-spacing:.1em">FITNESS &</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:11px;color:${acc};letter-spacing:.1em">WELLNESS</div>
        </div>
      </div>
    </div>

    <!-- SUPLEMENTACIÓN -->
    ${(()=>{
      const sups = CD._planSuplementacion;
      const alimTher = CD._planAlimentosTerapeuticos;
      const supBase = LANG==='en' ? [
        {nombre:'Omega-3 (TG form)',dosis:'2-3g EPA+DHA/day',momento:'With main meals',motivo:'Reduces inflammation and improves recovery',icon:'🐟'},
        {nombre:'Creatine Monohydrate',dosis:'3-5g/day',momento:'Any time of day — daily consistency',motivo:'Increases strength, power and muscle mass. Most scientifically backed supplement',icon:'⚡'},
        {nombre:'Whey Protein',dosis:'20-40g as needed',momento:'Post-workout or when not reaching protein goals',motivo:'Supplement to reach your daily protein target',icon:'🥛'},
      ] : [
        {nombre:'Omega-3 (forma TG)',dosis:'2-3g EPA+DHA/día',momento:'Con las comidas principales',motivo:'Base para reducir inflamación y mejorar recuperación',icon:'🐟'},
        {nombre:'Creatina Monohidrato',dosis:'3-5g/día',momento:'Cualquier momento del día — consistencia diaria',motivo:'Aumenta fuerza, potencia y masa muscular. El suplemento más respaldado científicamente',icon:'⚡'},
        {nombre:'Proteína Whey',dosis:'20-40g según necesidad',momento:'Post-entreno o cuando no llegues a objetivos proteicos',motivo:'Complemento para alcanzar tu objetivo diario de proteína',icon:'🥛'},
      ];
      // Always show — base supplements are always recommended
      return `<div style="margin:10px 14px 0;background:rgba(168,85,247,.08);border:0.5px solid rgba(168,85,247,.25);border-radius:12px;padding:12px 14px">
        <div style="font-size:11px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px">🧪 ${LANG==='en'?'RECOMMENDED SUPPLEMENTATION':'Suplementación recomendada'}</div>
        <!-- Base supplements -->
        ${supBase.map(s=>`
        <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(168,85,247,.15);border:0.5px solid rgba(168,85,247,.3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${s.icon}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:#fff">${s.nombre} <span style="font-size:11px;color:#c084fc;font-weight:400">· ${s.dosis}</span></div>
            <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">⏰ ${s.momento}</div>
            <div style="font-size:10px;color:rgba(168,85,247,.7);margin-top:2px">${s.motivo}</div>
          </div>
        </div>`).join('')}
        <!-- Personalised supplements from IA -->
        ${(sups||[]).map((s,si)=>`
        <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(168,85,247,.15);border:0.5px solid rgba(168,85,247,.3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">💊</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:#fff">${cachedTrans?.sups?.[si]?.nombre||s.nombre} <span style="font-size:11px;color:#c084fc;font-weight:400">· ${s.dosis}</span></div>
            <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">⏰ ${cachedTrans?.sups?.[si]?.momento||s.momento}</div>
            ${s.motivo?`<div style="font-size:10px;color:rgba(168,85,247,.7);margin-top:2px">${cachedTrans?.sups?.[si]?.motivo||s.motivo}</div>`:''}
          </div>
        </div>`).join('')}
        ${(alimTher||[]).length?`
        <div style="border-top:0.5px solid rgba(168,85,247,.15);padding-top:8px;margin-top:4px">
          <div style="font-size:10px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">🥩 ${LANG==='en'?'Therapeutic foods':'Alimentos terapéuticos'}</div>
          ${(alimTher||[]).map((a,ai)=>`
          <div style="font-size:12px;color:rgba(255,255,255,.75);margin-bottom:4px">
            <b style="color:#fff">${cachedTrans?.ther?.[ai]?.alimento||a.alimento}</b> · ${cachedTrans?.ther?.[ai]?.frecuencia||a.frecuencia}
            ${a.motivo?`<span style="color:rgba(168,85,247,.7);font-size:11px"> — ${cachedTrans?.ther?.[ai]?.motivo||a.motivo}</span>`:''}
          </div>`).join('')}
        </div>`:''}
      </div>`;
    })()}

    <!-- NOTA PESOS EN CRUDO -->
    <div style="margin:10px 14px;background:${accBg};border:0.5px solid ${acc}60;border-radius:12px;padding:11px 14px">
      <div style="font-size:12px;color:rgba(255,255,255,.65);line-height:1.6">${LANG==="en"?'📌 All weights are <b style="color:#fff">raw/uncooked</b>. Drink 2-3L of water/day. Questions → use the <b style="color:'+accLight+'">assistant</b>.':`📌 Todos los pesos son <b style="color:#fff">en crudo</b>. Bebe 2-3L de agua/día. Dudas → usa el <b style="color:${accLight}">asistente</b>.`}</div>
    </div>

    <!-- CONSEJOS NUTRICIONALES FIJOS -->
    <div style="margin:10px 14px 0;border:0.5px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden">
      <div style="background:rgba(255,255,255,.04);padding:10px 14px;border-bottom:0.5px solid rgba(255,255,255,.06)">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;color:#fff;letter-spacing:.1em">📋 GUÍA NUTRICIONAL</div>
        <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:2px">${LANG==="en"?"Base rules to maximize your results":"Normas base para maximizar tus resultados"}</div>
      </div>
      <div style="padding:12px 14px;display:flex;flex-direction:column;gap:10px">

        <!-- Hidratación -->
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="font-size:20px;flex-shrink:0">💧</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:2px">${LANG==="en"?"Hydration":"Hidratación"}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.55);line-height:1.6">${LANG==="en"?'Always prioritize <b style="color:#93c5fd">water</b>. Coffee or tea without sugar — use sweetener if needed. Sodas: always <b style="color:#93c5fd">zero</b>, never regular. No boxed juices. No sugary drinks.':"Prioriza siempre el <b style=\"color:#93c5fd\">agua</b>. Si tomas café o té, sin azúcar — usa edulcorante si necesitas. Refrescos: siempre versión <b style=\"color:#93c5fd\">zero</b>, nunca normal. Sin zumos de caja. Sin bebidas azucaradas."}</div>
          </div>
        </div>

        <div style="height:0.5px;background:rgba(255,255,255,.06)"></div>

        <!-- Salsas y condimentos -->
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="font-size:20px;flex-shrink:0">🫙</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:2px">${LANG==="en"?"Sauces & condiments":"Salsas y condimentos"}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.55);line-height:1.6">
              ${LANG==="en"?'✅ <b style="color:#86efac">Allowed:</b> natural tomato, free spices (pepper, parsley, basil, oregano, turmeric...), salt, zero ketchup, mustard, low-sodium soy sauce.<br>❌ <b style="color:#fca5a5">Avoid:</b> sugary commercial sauces, excess mayo, regular BBQ sauce, industrial dressings.':`✅ <b style="color:#86efac">Permitido:</b> tomate al natural, especias libres (pimienta, perejil, albahaca, orégano, cúrcuma...), sal, ketchup zero, mostaza, salsa de soja baja en sodio.<br>❌ <b style="color:#fca5a5">Evitar:</b> salsas comerciales con azúcar, mayonesa en exceso, salsas tipo barbacoa normal, aderezos industriales.`}
            </div>
          </div>
        </div>

        <div style="height:0.5px;background:rgba(255,255,255,.06)"></div>

        <!-- Azúcares -->
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="font-size:20px;flex-shrink:0">🚫</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:2px">${LANG==="en"?"Added sugars":"Azúcares añadidos"}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.55);line-height:1.6">${LANG==="en"?"Avoid sugar in coffee, pastries, cookies, sugary drinks and boxed juices. To sweeten use sweetener (stevia, erythritol). Liquid calories don't fill you up.":"Evita azúcar en café, bollería, galletas, refrescos azucarados y zumos de caja. Si necesitas endulzar usa edulcorante (stevia, eritritol). Las calorías líquidas no sacian."}</div>
          </div>
        </div>

      </div>
    </div>

    <!-- BOTÓN TRADUCIR CON IA — solo en inglés y sin traducción cacheada -->
    ${LANG==='en' ? `
    <div style="padding:0 14px;margin-bottom:8px">
      <button id="btn_translate_diet" onclick="traducirDietaIA()" title="Translate with AI" style="width:100%;padding:10px;background:rgba(59,130,246,.1);color:#93c5fd;border:0.5px solid rgba(59,130,246,.25);border-radius:10px;cursor:pointer;font-family:inherit;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:6px">
        <span style="font-size:20px" id="btn_translate_diet_txt">${cachedTrans ? '✅🇬🇧' : '🇬🇧'}</span>
      </button>
    </div>` : ''}

    <!-- BOTÓN GUARDAR -->
    <div style="padding:0 14px">
      <button onclick="descargarDieta()" style="width:100%;padding:14px;background:${acc};color:${esVeg?'#000':'#fff'};border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Bebas Neue',sans-serif;letter-spacing:.1em;touch-action:manipulation">
        ${LANG==="en"?"⬇ SAVE AS IMAGE":"⬇ GUARDAR COMO IMAGEN"}
      </button>
    </div>
  </div>`;
}


// ── CHAT ASISTENTE (coach + IA fallback) ────────────────────────
// Historial persistente en memoria mientras la sesión está abierta.
// Se guarda también en localStorage para sobrevivir navegaciones entre tabs.
// Cada mensaje tiene: {role, content, sender, ts, via}
// via: 'coach' | 'ia'

let _chatMsgs = []; // [{role,content,sender,ts,via}]
let _chatPolling = null;
let _chatCoachOnline = false; // se actualiza al cargar

function _chatStorageKey(){ return 'wm_chat_'+CD.id+'_'+USER.id; }

function _chatSave(){
  try{ localStorage.setItem(_chatStorageKey(), JSON.stringify(_chatMsgs.slice(-80))); }catch(e){}
}

function _chatLoad(){
  try{
    const raw = localStorage.getItem(_chatStorageKey());
    if(raw) _chatMsgs = JSON.parse(raw);
  }catch(e){ _chatMsgs = []; }
  // Si no hay historial, añadir mensaje bienvenida
  if(!_chatMsgs.length){
    const greeting = LANG==='en'
      ? `Hi ${CD.nombre.split(' ')[0]}! I'm here to help with training, nutrition and recovery. Ask me anything.`
      : `¡Hola ${CD.nombre.split(' ')[0]}! Aquí para ayudarte con entreno, dieta y recuperación. Pregúntame lo que necesites.`;
    _chatMsgs = [{role:'assistant', content:greeting, sender:window._coachNombreAsistente||'Coach', ts:Date.now(), via:'ia'}];
    _chatSave();
  }
}

function _chatRenderAll(){
  const wrap = document.getElementById('chatMsgs');
  if(!wrap) return;
  wrap.innerHTML = _chatMsgs.map(m => _chatBubble(m)).join('');
  wrap.scrollTop = wrap.scrollHeight;
}

function _chatBubble(m){
  const isUser = m.role === 'user';
  const senderLabel = isUser ? '' : `<div class="msg-sender">${m.sender||'Coach'}</div>`;
  const time = m.ts ? `<div style="font-size:9px;opacity:.35;margin-top:3px;text-align:${isUser?'right':'left'}">${_chatFmtTime(m.ts)}</div>` : '';
  return `<div class="msg ${isUser?'msg-u':'msg-b'}">${senderLabel}${m.content}${time}</div>`;
}

function _chatFmtTime(ts){
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if(sameDay) return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  return d.toLocaleDateString([], {day:'numeric',month:'short'}) + ' ' + d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

function _chatUpdateStatus(online){
  _chatCoachOnline = online;
  const dot = document.getElementById('chat_status_dot');
  const lbl = document.getElementById('chat_status_lbl');
  if(!dot||!lbl) return;
  dot.style.background = online ? '#22c55e' : '#52525b';
  lbl.textContent = online
    ? (LANG==='en' ? 'Online' : 'En línea')
    : (LANG==='en' ? 'Usually replies soon' : 'Suele responder pronto');
}

async function _chatCheckCoachOnline(){
  try{
    const d = await api('/mensajes/estado').catch(()=>({online:false}));
    _chatUpdateStatus(d && d.online);
  }catch(e){ _chatUpdateStatus(false); }
}

// Cargar mensajes reales del coach desde el servidor
async function _chatLoadFromServer(){
  try{
    const msgs = await api('/mensajes/'+CD.id).catch(()=>null);
    if(!msgs || !msgs.length) return;
    // Mezclar con historial local — evitar duplicados por id
    const existingIds = new Set(_chatMsgs.filter(m=>m.id).map(m=>m.id));
    let added = false;
    msgs.forEach(m => {
      if(m.id && existingIds.has(m.id)) return;
      _chatMsgs.push({
        id: m.id,
        role: m.de_coach ? 'assistant' : 'user',
        content: m.contenido,
        sender: m.de_coach ? (window._coachNombreAsistente||'Coach') : CD.nombre,
        ts: new Date(m.created_at||Date.now()).getTime(),
        via: 'coach'
      });
      added = true;
    });
    if(added){
      _chatMsgs.sort((a,b)=>(a.ts||0)-(b.ts||0));
      _chatSave();
      _chatRenderAll();
    }
  }catch(e){}
}

function hAsistente(){
  _chatLoad();
  return `<div class="chat-wrap">
  <!-- Cabecera -->
  <div style="background:var(--s);border-bottom:0.5px solid var(--br);padding:11px 14px;flex-shrink:0;display:flex;align-items:center;gap:10px">
    <div style="position:relative;flex-shrink:0">
      <div style="width:40px;height:40px;border-radius:50%;background:var(--bl3);overflow:hidden;border:2px solid var(--bl2)">
        ${window._coachFoto
          ? `<img src="${window._coachFoto}" style="width:100%;height:100%;object-fit:cover"/>`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff">${(window._coachNombreAsistente||'C')[0].toUpperCase()}</div>`}
      </div>
      <div id="chat_status_dot" style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#f59e0b;border:2px solid var(--b)"></div>
    </div>
    <div style="flex:1;min-width:0">
      <div style="font-size:14px;font-weight:700;color:var(--sv);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${window._coachNombreAsistente||'Coach WolfMindset'}</div>
      <div style="font-size:11px;color:var(--tx3);margin-top:1px" id="chat_status_lbl">${LANG==='en'?'Usually replies soon':'Suele responder pronto'}</div>
    </div>
    <button onclick="_chatClear()" style="background:none;border:none;color:var(--tx3);font-size:10px;cursor:pointer;font-family:inherit;padding:4px 8px;border-radius:6px;border:0.5px solid var(--br)" title="${LANG==='en'?'Clear chat':'Borrar chat'}">${LANG==='en'?'Clear':'Borrar'}</button>
  </div>
  <!-- Mensajes -->
  <div class="chat-msgs" id="chatMsgs"></div>
  <div class="typing" id="chatTyping">${LANG==='en'?'typing...':'escribiendo...'}</div>
  <!-- Input -->
  <div class="chat-input-wrap">
    <input class="chat-inp" id="chatIn"
      placeholder="${LANG==='en'?'Write your message...':'Escribe tu mensaje...'}"
      onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat();}"/>
    <button class="chat-send" onclick="sendChat()">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 10l14-7-7 14V10H3z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg>
    </button>
  </div>
</div>`;
}

function _chatAfterRender(){
  _chatRenderAll();
  _chatCheckCoachOnline();
  _chatLoadFromServer();
  // El polling manual se elimina — SSE maneja las actualizaciones en tiempo real.
  // Solo mantenemos un refresco inicial al abrir el tab.
  if(_chatPolling) clearInterval(_chatPolling);
  _chatPolling = null;
}

function _chatClear(){
  if(!confirm(LANG==='en'?'Clear conversation history?':'¿Borrar el historial de conversación?')) return;
  _chatMsgs = [];
  _chatSave();
  _chatLoad(); // reinicia con bienvenida
  _chatRenderAll();
}

async function sendChat(){
  const inp = document.getElementById('chatIn');
  const msg = inp.value.trim();
  if(!msg) return;
  inp.value = '';
  inp.focus();

  const ts = Date.now();
  const userMsg = {role:'user', content:msg, sender:CD.nombre, ts, via:'user'};
  _chatMsgs.push(userMsg);
  _chatSave();
  _chatRenderAll();

  const typing = document.getElementById('chatTyping');
  if(typing) typing.style.display = 'block';

  try{
    // Un único hilo real en backend. La IA, si procede, responde desde /mensajes.
    // Así no se duplica el chat ni responde cuando el coach está activo.
    const d = await api('/mensajes', {method:'POST', body:JSON.stringify({cliente_id:CD.id, contenido:msg})});
    if(d && d.id) {
      userMsg.id = d.id;
      _chatSave();
    }
    // Refresco suave para traer el mensaje guardado si hacía falta; la respuesta coach/IA llega por SSE.
    setTimeout(_chatLoadFromServer, 600);
  }catch(e){
    if(typing) typing.style.display = 'none';
    const errMsg = {role:'assistant', content: LANG==='en'?'Cannot send right now. Try again in a moment.':'No puedo enviar ahora mismo. Inténtalo en un momento.', sender:window._coachNombreAsistente||'Coach', ts:Date.now(), via:'system'};
    _chatMsgs.push(errMsg);
    _chatSave();
    _chatRenderAll();
  }
}

// ══════════════════════════════════════════════════════
// COACH — PANEL MENSAJES
// ══════════════════════════════════════════════════════
window._coachMsgThread = null; // clienteId activo en el hilo
let _coachMsgPollInt = null;
let _coachMsgCache = {}; // {clienteId: [msg,...]}

function hMensajesCoach(){
  return `<div id="coach_msgs_wrap" style="height:100%;display:flex;flex-direction:column">
    <div id="iaChatPanelContainer"></div>
    <div id="coach_msgs_list"></div>
    <div id="coach_msgs_thread" style="display:none;flex:1;display:flex;flex-direction:column;min-height:0"></div>
  </div>`;
}

async function coachMsgsInit(){
  renderIaChatPanel(); // fire and forget — no bloquea la carga de mensajes
  window._coachMsgThread = null;
  await coachMsgsLoadList();
  if(_coachMsgPollInt) clearInterval(_coachMsgPollInt);
  _coachMsgPollInt = setInterval(async()=>{
    if(!document.getElementById('coach_msgs_wrap')){ clearInterval(_coachMsgPollInt); return; }
    if(window._coachMsgThread) await coachMsgsLoadThread(window._coachMsgThread, false);
    else await coachMsgsLoadList();
    cargarNotificacionesCoach();
  }, 10000);
}

async function coachMsgsLoadList(){
  const wrap = document.getElementById('coach_msgs_list');
  if(!wrap) return;
  let convs = [];
  try { convs = await api('/mensajes/conversaciones'); } catch(e){}

  if(!convs.length){
    wrap.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--tx3)">
      <div style="font-size:40px;margin-bottom:12px">💬</div>
      <div style="font-size:14px;font-weight:600;color:var(--sv2)">${tc('Sin mensajes aún')}</div>
      <div style="font-size:12px;margin-top:6px">${tc('Cuando un cliente te escriba aparecerá aquí')}</div>
    </div>`;
    return;
  }

  wrap.innerHTML = convs.map(c => {
    const a = ac(c.cliente_id % 8);
    const noLeidos = c.no_leidos || 0;
    const hora = c.ultimo_ts ? _chatFmtTime(new Date(c.ultimo_ts).getTime()) : '';
    return `<div onclick="coachMsgsAbrirHilo(${c.cliente_id},'${(c.cliente_nombre||'').replace(/'/g,"\\'")}','${(c.cliente_foto||'').replace(/'/g,"\\'")}','${(c.cliente_username||'').replace(/'/g,"\\'")}' )"
      style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:0.5px solid var(--br);cursor:pointer;background:${noLeidos?'rgba(59,130,246,.04)':'none'};transition:.15s"
      onmouseover="this.style.background='var(--s2)'" onmouseout="this.style.background='${noLeidos?'rgba(59,130,246,.04)':'none'}'">
      <div style="width:44px;height:44px;border-radius:50%;background:${a.bg};color:${a.tx};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;flex-shrink:0;overflow:hidden;border:1.5px solid ${noLeidos?'var(--bl2)':'var(--br)'}">
        ${c.cliente_foto ? `<img src="${c.cliente_foto}" style="width:100%;height:100%;object-fit:cover"/>` : (c.cliente_nombre||'?')[0].toUpperCase()}
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
          <div style="font-size:14px;font-weight:${noLeidos?'700':'600'};color:var(--sv);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px">${c.cliente_nombre||'Cliente'}</div>
          <div style="font-size:10px;color:var(--tx3);flex-shrink:0;margin-left:8px">${hora}</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:12px;color:${noLeidos?'var(--sv2)':'var(--tx3)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px">${c.ultimo_msg||''}</div>
          ${noLeidos ? `<span style="background:var(--bl2);color:#fff;font-size:9px;font-weight:700;border-radius:50%;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:6px;padding:0 3px">${noLeidos}</span>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

async function coachMsgsAbrirHilo(clienteId, nombre, foto, username){
  window._coachMsgThread = clienteId;
  const list = document.getElementById('coach_msgs_list');
  const thread = document.getElementById('coach_msgs_thread');
  if(list) list.style.display = 'none';
  if(thread){ thread.style.display = 'flex'; thread.style.flexDirection = 'column'; thread.style.flex = '1'; thread.style.minHeight = '0'; }

  thread.innerHTML = `
    <!-- Cabecera hilo -->
    <div style="background:var(--s);border-bottom:0.5px solid var(--br);padding:11px 14px;flex-shrink:0;display:flex;align-items:center;gap:10px">
      <button onclick="coachMsgsVolverLista()" style="background:none;border:none;color:var(--tx3);cursor:pointer;padding:4px;display:flex;align-items:center">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M12 4l-7 6 7 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div style="width:36px;height:36px;border-radius:50%;background:var(--bl3);overflow:hidden;flex-shrink:0;border:1.5px solid var(--bl2)">
        ${foto ? `<img src="${foto}" style="width:100%;height:100%;object-fit:cover"/>` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff">${(nombre||'?')[0].toUpperCase()}</div>`}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;color:var(--sv)">${nombre||'Cliente'}</div>
        <div style="font-size:11px;color:var(--tx3)">@${username||''}</div>
      </div>
      <button onclick="verCliente(${clienteId})" style="padding:6px 12px;background:var(--s2);border:0.5px solid var(--br);border-radius:8px;color:var(--sv2);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap">${tc('Ver ficha')}</button>
    </div>
    <!-- Mensajes -->
    <div id="coach_thread_msgs" class="chat-msgs" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px"></div>
    <div id="coach_thread_typing" class="typing" style="padding:4px 14px 2px">${tc('escribiendo...')}</div>
    <!-- Input -->
    <div class="chat-input-wrap">
      <input class="chat-inp" id="coach_thread_inp" placeholder="${tc('Escribe tu respuesta...')}"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();coachMsgsEnviar(${clienteId});}"/>
      <button class="chat-send" onclick="coachMsgsEnviar(${clienteId})">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 10l14-7-7 14V10H3z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg>
      </button>
    </div>`;

  await coachMsgsLoadThread(clienteId, true);
  // Marcar como leídos y renovar presencia del coach para apagar la IA en este hilo.
  api('/mensajes/'+clienteId+'/leer', {method:'PUT'}).catch(()=>{});
  if(window._coachActivePingInt) clearInterval(window._coachActivePingInt);
  window._coachActivePingInt = setInterval(() => {
    if(window._coachMsgThread === clienteId) api('/mensajes/'+clienteId+'/leer', {method:'PUT'}).catch(()=>{});
    else clearInterval(window._coachActivePingInt);
  }, 60000);
  cargarNotificacionesCoach();
}

async function coachMsgsLoadThread(clienteId, scrollDown){
  const wrap = document.getElementById('coach_thread_msgs');
  if(!wrap) return;
  let msgs = [];
  try { msgs = await api('/mensajes/'+clienteId); } catch(e){}
  _coachMsgCache[clienteId] = msgs;

  wrap.innerHTML = msgs.map(m => {
    const isCoach = m.de_coach;
    const hora = m.created_at ? _chatFmtTime(new Date(m.created_at).getTime()) : '';
    const via = m.via_ia ? `<span style="font-size:9px;background:rgba(37,99,235,.25);color:#93c5fd;padding:1px 5px;border-radius:4px;margin-left:5px">🤖 IA</span>` : '';
    return `<div class="msg ${isCoach?'msg-u':'msg-b'}" style="max-width:85%">
      ${!isCoach ? `<div class="msg-sender">${m.cliente_nombre||'Cliente'}</div>` : ''}
      ${m.contenido}
      <div style="font-size:9px;opacity:.5;margin-top:4px;text-align:${isCoach?'right':'left'};display:flex;align-items:center;justify-content:${isCoach?'flex-end':'flex-start'};gap:4px">${hora}${via}</div>
    </div>`;
  }).join('');

  if(scrollDown) wrap.scrollTop = wrap.scrollHeight;
  else {
    // Solo scroll si estaba abajo
    const diff = wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight;
    if(diff < 80) wrap.scrollTop = wrap.scrollHeight;
  }
}

async function coachMsgsEnviar(clienteId){
  const inp = document.getElementById('coach_thread_inp');
  if(!inp) return;
  const msg = inp.value.trim();
  if(!msg) return;
  inp.value = '';
  inp.focus();
  document.getElementById('coach_thread_typing').style.display = 'block';
  try {
    await api('/mensajes', {method:'POST', body:JSON.stringify({cliente_id:clienteId, contenido:msg, de_coach:true})});
  } catch(e) {
    // Mostrar igual en UI aunque falle el server
  }
  document.getElementById('coach_thread_typing').style.display = 'none';
  await coachMsgsLoadThread(clienteId, true);
  cargarNotificacionesCoach();
}

function coachMsgsVolverLista(){
  window._coachMsgThread = null;
  if(window._coachActivePingInt) { clearInterval(window._coachActivePingInt); window._coachActivePingInt = null; }
  const list = document.getElementById('coach_msgs_list');
  const thread = document.getElementById('coach_msgs_thread');
  if(thread) thread.style.display = 'none';
  if(list){ list.style.display = 'block'; coachMsgsLoadList(); }
}


function hProgreso2(){return`<div style="padding-top:8px">
  ${CD.mensaje_semana?`<div class="motiv-card"><div style="overflow:hidden"><div id="motiv_msg_txt" data-clamp="3" data-expanded="0" style="font-size:14px;color:var(--sv2);line-height:1.7;font-weight:500;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden">${CD.mensaje_semana}</div></div>${CD.mensaje_semana.length>100?`<button onclick="toggleCoachComment('motiv_msg_txt',this)" style="background:none;border:none;color:var(--blg);font-size:11px;font-weight:700;cursor:pointer;margin-top:6px;padding:0;font-family:inherit">${t('Ver más')} ▾</button>`:''}</div>`:''}
  <div class="stats-g">
    <div class="stat-card"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-weight:600">${t('Semanas')}</div><div style="font-size:22px;font-weight:700;color:var(--sv)">${CD.semanas}</div></div>
    <div class="stat-card"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-weight:600">${t('Objetivo')}</div><div style="font-size:15px;font-weight:700;color:var(--sv)">${t(CD.objetivo||'')}</div></div>
    <div class="stat-card"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-weight:600">${t('Nivel')}</div><div style="font-size:15px;font-weight:700;color:var(--sv)">${t(CD.nivel||'')}</div></div>
    <div class="stat-card"><div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-weight:600">${t('Días/sem')}</div><div style="font-size:22px;font-weight:700;color:var(--sv)">${CD.dias.length}</div></div>
  </div>
  <div id="progreso_graficas_wrap"></div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin:0 14px 6px">
    <div class="sec-lbl" style="margin:0">${t('Medición semanal')}</div>
    <div id="peso_edit_btn_wrap"></div>
  </div>
  <div id="peso_section" style="margin:0 14px 12px;background:var(--s);border:0.5px solid var(--br);border-radius:14px;padding:14px">
    <div id="peso_guardado_view" style="display:none;margin-bottom:10px">
      <div style="font-size:13px;color:var(--tx3);margin-bottom:4px">${t('Registrado esta semana')}</div>
      <div style="display:flex;align-items:baseline;gap:16px;flex-wrap:wrap">
        <div style="font-size:28px;font-weight:700;color:var(--sv);font-family:'Bebas Neue',sans-serif" id="peso_guardado_val">—</div>
        <div id="medidas_guardadas_view" style="font-size:13px;color:var(--tx3)"></div>
      </div>
    </div>
    <div id="peso_input_wrap">
      <div style="display:grid;grid-template-columns:1fr ${CD.sexo==='Mujer'?'1fr 1fr':'1fr'};gap:10px;margin-bottom:12px">
        <div>
          <div class="form-lbl">⚖️ ${t('Peso')} (${pesoLabel()})</div>
          <input class="inp" id="np" type="number" step="${isImperial()?'0.5':'0.1'}" placeholder="${pesoPlaceholder()}" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/>
        </div>
        <div>
          <div class="form-lbl">📏 ${t('Cintura')} (${cinturaLabel()})</div>
          <input class="inp" id="medida_cintura" type="number" step="0.1" placeholder="${cinturaPlaceholder()}" value="${CD.cintura_actual?(isImperial()?(CD.cintura_actual/2.54).toFixed(1):CD.cintura_actual):''}" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/>
        </div>
        ${CD.sexo==='Mujer'?`<div>
          <div class="form-lbl">📐 ${t('Cadera')} (${cinturaLabel()})</div>
          <input class="inp" id="medida_cadera" type="number" step="0.1" placeholder="${isImperial()?'38':'96'}" value="${CD.cadera?(isImperial()?(CD.cadera/2.54).toFixed(1):CD.cadera):''}" style="margin-bottom:0;font-size:18px;font-weight:700;text-align:center"/>
        </div>`:''}
      </div>
      <button class="btn" style="width:100%;padding:13px;font-size:15px" onclick="guardarMediciones()">${t('Guardar mediciones')}</button>
    </div>
  </div>
  <div class="sec-lbl">${t('Fotos de progreso')}</div>
  <div style="padding:0 14px 12px">
    <!-- 3 foto slots -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
      ${['frente','posterior','costado'].map(tipo=>`
      <div style="display:flex;flex-direction:column;gap:4px">
        <label for="fUp_${tipo}" style="cursor:pointer;display:block">
          <!-- Guide grid -->
          <div style="aspect-ratio:3/4;border:1.5px dashed rgba(59,130,246,.4);border-radius:10px;background:var(--s2);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden">
            <!-- Human silhouette SVG guide -->
            <svg viewBox="0 0 60 80" style="width:50%;opacity:.2;position:absolute" fill="none" xmlns="http://www.w3.org/2000/svg">
              ${tipo==='frente'?`
              <circle cx="30" cy="10" r="8" fill="#93c5fd"/>
              <path d="M18 22 Q30 18 42 22 L44 50 H16 Z" fill="#93c5fd"/>
              <path d="M16 25 L8 45 M44 25 L52 45" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>
              <path d="M20 50 L18 75 M40 50 L42 75" stroke="#93c5fd" stroke-width="5" stroke-linecap="round"/>
              `:tipo==='posterior'?`
              <circle cx="30" cy="10" r="8" fill="#93c5fd"/>
              <path d="M18 22 Q30 18 42 22 L44 50 H16 Z" fill="#93c5fd"/>
              <path d="M16 25 L8 45 M44 25 L52 45" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>
              <path d="M20 50 L18 75 M40 50 L42 75" stroke="#93c5fd" stroke-width="5" stroke-linecap="round"/>
              `:`
              <circle cx="28" cy="10" r="8" fill="#93c5fd"/>
              <path d="M22 22 Q28 18 36 22 L38 50 H18 Z" fill="#93c5fd"/>
              <path d="M18 25 L10 45 M38 25 L42 44" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>
              <path d="M20 50 L19 75 M36 50 L37 75" stroke="#93c5fd" stroke-width="5" stroke-linecap="round"/>
              `}
            </svg>
            <!-- Grid lines -->
            <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.08) 1px,transparent 1px);background-size:33% 25%"></div>
            <!-- Uploaded photo preview -->
            <div id="foto_preview_${tipo}" style="position:absolute;inset:0;display:none">
              <img id="foto_img_${tipo}" style="width:100%;height:100%;object-fit:cover"/>
              <div style="position:absolute;top:4px;right:4px;background:rgba(34,197,94,.9);border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px">✓</div>
            </div>
            <div style="position:relative;z-index:1;text-align:center;padding:6px">
              <div style="font-size:18px;margin-bottom:4px">📷</div>
              <div style="font-size:10px;font-weight:700;color:var(--sv2);text-transform:uppercase;letter-spacing:.05em">${t(tipo)}</div>
            </div>
          </div>
        </label>
        <input type="file" id="fUp_${tipo}" accept="image/*" style="display:none" onchange="uploadFotoTipo(event,'${tipo}')"/>
      </div>`).join('')}
    </div>
    <div style="font-size:11px;color:var(--tx3);text-align:center;margin-bottom:10px;line-height:1.5">
      ${t("Sube las 3 fotos para que tu coach pueda hacer una valoración completa.")}<br>
      📏 Posición: de pie, cuerpo entero, buena iluminación.
    </div>
    <!-- Analizar fotos solo disponible para coach desde su panel -->
  </div>
  <!-- Gráfica tendencia peso -->
  <div id="peso_tendencia_wrap" style="padding:0 14px 12px"></div>
  <input type="file" id="fUp" accept="image/*" style="display:none" onchange="uploadFoto(event)"/>
  <div id="fLoad" style="display:none;padding:0 14px 10px"><div class="ia-chip"><div class="ia-chip-title">Analizando tu progreso...</div></div></div>
  <!-- Fotos timeline con comentarios del coach -->
  <div id="fotos_timeline" style="padding:0 14px"></div>
  <div id="fAn" style="padding:0 14px 10px"></div>
</div>`;}

// Renderiza en el perfil del cliente sus fotos agrupadas por mes
// y muestra el comentario del coach (published_analysis) si existe
async function renderFotosProgreso() {
  const wrap = document.getElementById('fotos_timeline');
  if (!wrap) return;
  // Recargar datos frescos del servidor (el coach puede haber publicado un análisis)
  try {
    const fresh = await api('/clientes/'+CD.id);
    if(fresh?.fotos) CD.fotos = fresh.fotos;
  } catch(e) {}

  const fotos = CD?.fotos || [];
  if (!fotos.length) { wrap.innerHTML = ''; return; }

  const grupos = {};
  fotos.forEach(f => {
    const mes = f.fecha ? f.fecha.slice(0, 7) : 'sin-fecha';
    if (!grupos[mes]) grupos[mes] = [];
    grupos[mes].push(f);
  });

  const meses = Object.keys(grupos).sort().reverse();

  wrap.innerHTML = `<div class="sec-lbl" style="margin-top:4px">${t('Mis fotos')}</div>` + meses.map(mes => {
    const fotosMes = grupos[mes];
    const label = mes !== 'sin-fecha'
      ? new Date(mes+'-15').toLocaleDateString(LANG==='en'?'en-GB':'es-ES',{month:'long',year:'numeric'})
      : t('Sin fecha');
    const fotoConComentario = fotosMes.find(f => f.published_analysis);
    const comentarioCoach = fotoConComentario?.published_analysis;
    const mesId = mes.replace('-','_');

    const fotosHtml = fotosMes.map(f => {
      const tipoLabel = f.tipo==='posterior'?'🔙':f.tipo==='costado'?'↔️':'🫡';
      return `<div style="flex:1;min-width:80px;max-width:120px">
        <div style="font-size:9px;color:var(--tx3);text-align:center;margin-bottom:3px">${tipoLabel} ${t(f.tipo||'frente')}</div>
        <div style="border-radius:10px;overflow:hidden;aspect-ratio:3/4;background:var(--s2)">
          ${f.url&&!f.url.startsWith('foto_')
            ?`<img src="${f.url}" style="width:100%;height:100%;object-fit:cover"/>`
            :`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px">📷</div>`}
        </div>
      </div>`;
    }).join('');

    return `<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:14px;padding:14px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:700;color:var(--sv);margin-bottom:10px">📅 ${label}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:${comentarioCoach?'12px':'0'}">
        ${fotosHtml}
      </div>
      ${comentarioCoach?`
  <div style="border:0.5px solid rgba(59,130,246,.25);border-radius:10px;overflow:hidden">
    <button onclick="
      var body=document.getElementById('coach_acc_${mesId}');
      var arrow=document.getElementById('coach_arr_${mesId}');
      var open=body.style.maxHeight&&body.style.maxHeight!=='0px';
      body.style.maxHeight=open?'0px':body.scrollHeight+'px';
      body.style.opacity=open?'0':'1';
      arrow.style.transform=open?'rotate(0deg)':'rotate(180deg)';
    " style="width:100%;display:flex;align-items:center;justify-content:space-between;background:rgba(37,99,235,.07);border:none;padding:10px 12px;cursor:pointer;font-family:inherit;gap:8px">
      <div style="display:flex;align-items:center;gap:7px">
        <span style="font-size:15px">💬</span>
        <span style="font-size:10px;font-weight:700;color:var(--blg);text-transform:uppercase;letter-spacing:.07em">${t('Valoración del coach')}</span>
      </div>
      <span id="coach_arr_${mesId}" style="color:var(--blg);font-size:12px;transition:transform .3s;display:inline-block">▾</span>
    </button>
    <div id="coach_acc_${mesId}" style="max-height:0px;opacity:0;overflow:hidden;transition:max-height .35s ease,opacity .25s ease">
      <div style="padding:12px;font-size:13px;color:var(--sv);line-height:1.6;background:rgba(37,99,235,.04)">${comentarioCoach}</div>
    </div>
  </div>`:''}
    </div>`;
  }).join('');
}

function toggleCoachComment(id, btn){
  const el=document.getElementById(id);
  if(!el)return;
  const expanded = el.getAttribute('data-expanded')==='1';
  if(!expanded){
    el.style.display='block';
    el.style.webkitLineClamp='unset';
    el.style.overflow='visible';
    el.setAttribute('data-expanded','1');
    btn.textContent=t('Ver menos')+' ▴';
  } else {
    el.style.display='-webkit-box';
    el.style.webkitLineClamp=el.getAttribute('data-clamp')||'3';
    el.style.overflow='hidden';
    el.setAttribute('data-expanded','0');
    btn.textContent=t('Ver más')+' ▾';
  }
}

async function guardarMediciones(){
  const pesoInput = parseFloat(document.getElementById('np')?.value);
  const cinturaInput = parseFloat(document.getElementById('medida_cintura')?.value)||null;
  const caderaInput = parseFloat(document.getElementById('medida_cadera')?.value)||null;
  if(!pesoInput) return;
  const pesoKg = fromPeso(pesoInput);
  const cinturaCm = cinturaInput ? fromCintura(cinturaInput) : null;
  const caderaCm = caderaInput ? fromCintura(caderaInput) : null;
  await api('/clientes/'+CD.id+'/peso',{method:'POST',body:JSON.stringify({peso:pesoKg,grasa:null})});
  if(cinturaCm||caderaCm){
    const upd={};
    if(cinturaCm) upd.cintura_actual=cinturaCm;
    if(caderaCm) upd.cadera=caderaCm;
    await api('/clientes/'+CD.id+'/perfil',{method:'PUT',body:JSON.stringify(upd)});
  }
  await loadCD(CD.id);
  localStorage.setItem('wm_ultimo_peso_'+CD.id, Date.now());
  pesoModoVer(pesoKg, cinturaCm, caderaCm);
}
async function guardarPeso(){ return guardarMediciones(); }

function pesoModoVer(pesoKg, cinturaCm, caderaCm){
  const inp=document.getElementById('peso_input_wrap');
  const view=document.getElementById('peso_guardado_view');
  const val=document.getElementById('peso_guardado_val');
  const wrap=document.getElementById('peso_edit_btn_wrap');
  const medidasView=document.getElementById('medidas_guardadas_view');
  if(inp) inp.style.display='none';
  if(view) view.style.display='block';
  const pesoReal=pesoKg||CD.pesos?.slice(-1)[0]?.peso;
  if(val) val.textContent=fmtPeso(pesoReal)+' ✓';
  if(medidasView){
    const c=cinturaCm||CD.cintura_actual;
    const ca=caderaCm||CD.cadera;
    const parts=[];
    if(c) parts.push('📏 '+fmtCintura(c));
    if(ca) parts.push('📐 '+fmtCintura(ca));
    medidasView.textContent=parts.join(' · ');
  }
  if(wrap) wrap.innerHTML=`<button onclick="pesoModoEditar()" style="padding:6px 14px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">✏️ ${t('Corregir')}</button>`;
}

function pesoModoEditar(){
  const inp=document.getElementById('peso_input_wrap');
  const view=document.getElementById('peso_guardado_view');
  const wrap=document.getElementById('peso_edit_btn_wrap');
  if(inp) inp.style.display='block';
  if(view) view.style.display='none';
  if(wrap) wrap.innerHTML='';
  document.getElementById('np')?.focus();
}

function initPesoSection(){
  const ultima=parseInt(localStorage.getItem('wm_ultimo_peso_'+CD.id)||'0');
  const SEMANA=7*24*60*60*1000;
  const yaEsta = ultima && (Date.now()-ultima) < SEMANA;
  if(yaEsta){
    const ultimoPeso=CD.pesos?.length?CD.pesos[CD.pesos.length-1].peso:null;
    if(ultimoPeso) pesoModoVer(ultimoPeso, CD.cintura_actual, CD.cadera);
  }
  renderPesoTendencia();
}

function renderPesoTendencia(){
  const wrap = document.getElementById('peso_tendencia_wrap');
  if(!wrap) return;
  const pesos = (CD.pesos||[]).filter(p=>p.peso>0).slice(-20); // últimos 20 registros
  if(pesos.length < 3){ wrap.innerHTML=''; return; }

  // Media móvil de 3 puntos (tendencia suavizada)
  const tendencia = pesos.map((p,i,arr) => {
    if(i===0) return p.peso;
    if(i===arr.length-1) return p.peso;
    return (arr[i-1].peso + p.peso + arr[i+1].peso) / 3;
  });

  const W=320, H=110, PAD={t:12,r:10,b:28,l:38};
  const iW=W-PAD.l-PAD.r, iH=H-PAD.t-PAD.b;
  const pesoVals = pesos.map(p=>p.peso);
  const minP = Math.min(...pesoVals)*0.995;
  const maxP = Math.max(...pesoVals)*1.005;
  const scX = i => PAD.l + (pesos.length<2 ? iW/2 : i/(pesos.length-1)*iW);
  const scY = v => PAD.t + iH - ((v-minP)/(maxP-minP||1))*iH;

  // Línea real (puntos)
  const linePath = pesos.map((p,i)=>`${i===0?'M':'L'}${scX(i).toFixed(1)},${scY(p.peso).toFixed(1)}`).join(' ');
  // Línea tendencia suavizada
  const tendPath = tendencia.map((v,i)=>`${i===0?'M':'L'}${scX(i).toFixed(1)},${scY(v).toFixed(1)}`).join(' ');

  // Área bajo tendencia
  const areaPath = tendPath + ` L${scX(pesos.length-1).toFixed(1)},${(PAD.t+iH).toFixed(1)} L${scX(0).toFixed(1)},${(PAD.t+iH).toFixed(1)} Z`;

  // Dirección de la tendencia
  const diff = tendencia[tendencia.length-1] - tendencia[0];
  const objetivo = CD.objetivo||'';
  const esBajar = objetivo.toLowerCase().includes('def') || objetivo.toLowerCase().includes('perder');
  const esBueno = (esBajar && diff < 0) || (!esBajar && diff > 0);
  const trendColor = Math.abs(diff) < 0.3 ? '#a1a1aa' : esBueno ? '#22c55e' : '#f59e0b';
  const trendIcon = diff < -0.3 ? '↘' : diff > 0.3 ? '↗' : '→';
  const trendLabel = diff < -0.3
    ? `${isImperial()?(Math.abs(diff)*2.20462).toFixed(1):Math.abs(diff).toFixed(1)}${pesoLabel()} ${LANG==='en'?'less':'menos'}`
    : diff > 0.3 ? `+${isImperial()?(diff*2.20462).toFixed(1):diff.toFixed(1)}${pesoLabel()}`
    : (LANG==='en'?'Stable weight':'Peso estable');

  // Eje Y (3 labels)
  const yLabels = [minP, (minP+maxP)/2, maxP].map(v=>`
    <text x="${PAD.l-4}" y="${scY(v).toFixed(1)}" fill="#52525b" font-size="8.5" text-anchor="end" dominant-baseline="middle">${v.toFixed(1)}</text>
    <line x1="${PAD.l}" y1="${scY(v).toFixed(1)}" x2="${W-PAD.r}" y2="${scY(v).toFixed(1)}" stroke="#27272a" stroke-width="0.5"/>`).join('');

  // Eje X (fechas, máx 4)
  const step = Math.max(1, Math.floor(pesos.length/4));
  const xLabels = pesos.filter((_,i)=>i%step===0||i===pesos.length-1).map(p=>{
    const idx = pesos.indexOf(p);
    const d = new Date(p.fecha||'');
    const lbl = isNaN(d)?'?':`${d.getDate()}/${d.getMonth()+1}`;
    return `<text x="${scX(idx).toFixed(1)}" y="${H-5}" fill="#52525b" font-size="8.5" text-anchor="middle">${lbl}</text>`;
  }).join('');

  // Puntos
  const dots = pesos.map((p,i)=>`<circle cx="${scX(i).toFixed(1)}" cy="${scY(p.peso).toFixed(1)}" r="2.5" fill="#3b82f6" opacity=".7"/>`).join('');

  const trendColorName = trendColor==='#22c55e'?(LANG==='en'?'green':'verde'):trendColor==='#f59e0b'?(LANG==='en'?'amber':'ámbar'):(LANG==='en'?'grey':'gris');
  const legendText = LANG==='en'
    ? `Blue line: actual records · ${trendColorName.charAt(0).toUpperCase()+trendColorName.slice(1)} line: smoothed trend`
    : `Línea azul: registros reales · Línea ${trendColorName}: tendencia suavizada`;
  const recordsText = LANG==='en'
    ? `${pesos.length} records · ${fmtPeso(pesos[0]?.peso)} → ${fmtPeso(pesos[pesos.length-1]?.peso)}`
    : `${pesos.length} registros · ${fmtPeso(pesos[0]?.peso)} → ${fmtPeso(pesos[pesos.length-1]?.peso)}`;

  wrap.innerHTML = `
    <div class="sec-lbl" style="margin-bottom:6px">${t('📈 Tendencia de peso')}</div>
    <div style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;padding:10px 12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:11px;color:var(--tx3)">${recordsText}</div>
        <div style="font-size:13px;font-weight:700;color:${trendColor}">${trendIcon} ${trendLabel}</div>
      </div>
      <svg width="100%" viewBox="0 0 ${W} ${H}" style="overflow:visible">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${trendColor}" stop-opacity=".15"/>
            <stop offset="100%" stop-color="${trendColor}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${yLabels}${xLabels}
        <path d="${areaPath}" fill="url(#tg)"/>
        <path d="${linePath}" stroke="#3b82f6" stroke-width="1" fill="none" stroke-dasharray="3,3" opacity=".5"/>
        <path d="${tendPath}" stroke="${trendColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}
      </svg>
      <div style="font-size:9px;color:var(--tx3);margin-top:4px">${legendText}</div>
    </div>`;
}

async function uploadFoto(event){
  const file=event.target.files[0];if(!file)return;
  document.getElementById('fLoad').style.display='block';document.getElementById('fAn').innerHTML='';
  const reader=new FileReader();
  reader.onload=async function(e){
    const b64full=e.target.result,mt=b64full.split(';')[0].split(':')[1],img=b64full.split(',')[1];
    try{
      const d=await api('/ia/foto',{method:'POST',body:JSON.stringify({imageBase64:img,mediaType:mt,system:`Valoración de progreso WolfMindset. Analiza la foto (objetivo: ${CD.objetivo}, nivel: ${CD.nivel}, semana ${CD.semanas}). Directo, motivador. Sin mencionar tecnología. 4 frases: mejora visible, punto fuerte, motivación, recomendación concreta.`})});

      // ── Subir a Cloudinary si está configurado ──────────────────
      let urlFinal = 'foto_'+Date.now();
      const cloudName = window.CLOUDINARY_CLOUD_NAME;
      const uploadPreset = window.CLOUDINARY_UPLOAD_PRESET;
      if(cloudName && uploadPreset){
        try{
          const formData = new FormData();
          formData.append('file', b64full);
          formData.append('upload_preset', uploadPreset);
          formData.append('folder', 'wolfmindset/fotos');
          const cdnRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{method:'POST',body:formData});
          const cdnData = await cdnRes.json();
          if(cdnData.secure_url) urlFinal = cdnData.secure_url;
        }catch(ce){ console.log('Cloudinary error:', ce); }
      }

      await api('/clientes/'+CD.id+'/fotos',{method:'POST',body:JSON.stringify({url:urlFinal,analysis:d.reply})});
      await loadCD(CD.id);
      document.getElementById('fLoad').style.display='none';
      document.getElementById('fAn').innerHTML=`<div class="ia-chip"><div class="ia-chip-title">Valoración</div><div class="ia-result-body">${d.reply}</div></div>`;
    }
    catch(err){document.getElementById('fLoad').style.display='none';document.getElementById('fAn').innerHTML=`<div class="ia-chip"><div class="ia-result-body">Excelente actitud. La constancia es la clave.</div></div>`;}
  };reader.readAsDataURL(file);
}

// PERFIL CLIENTE
function hPerfil(){
  const c=CD;
  const tieneData = !!(c.peso_actual||c.altura||c.edad);
  setTimeout(()=>cargarSuscripcionPerfil(), 0);

  return`<div style="padding:16px 14px 8px">
    <div id="pf_header_bar" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.08em;color:var(--sv)">Mi perfil</div>
      ${tieneData?`<button id="pf_edit_btn" onclick="perfilModoEditar()" style="padding:7px 16px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation">✏️ Editar</button>`:''}
    </div>
    <div style="font-size:13px;color:var(--tx3);margin-bottom:16px">${tieneData?t('Tus datos personales.'):t('Rellena tus datos para que tu coach pueda personalizar tu plan al máximo.')}</div>
  </div>

  <div id="pf_form" style="background:var(--s);border:0.5px solid var(--br);border-radius:14px;margin:0 14px;padding:16px;display:${tieneData?'none':'block'};${tieneData?'pointer-events:none;opacity:.85':''}">
    <div style="font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px">${t('Datos personales')}</div>
    <div class="g2" style="gap:10px;margin-bottom:10px">
      <div><div class="form-lbl">${t('Peso')} (${pesoLabel()})</div><input class="inp" id="pf_peso" type="number" step="${isImperial()?'0.5':'0.1'}" placeholder="${pesoPlaceholder()}" value="${c.peso_actual?(isImperial()?(c.peso_actual*2.20462).toFixed(1):c.peso_actual):''}" style="margin-bottom:0"/></div>
      <div><div class="form-lbl">${t('Altura')} (${alturaLabel()})</div><input class="inp" id="pf_altura" type="text" placeholder="${alturaPlaceholder()}" value="${c.altura?(isImperial()?fmtAltura(c.altura):c.altura):''}" style="margin-bottom:0"/></div>
    </div>
    <div class="g2" style="gap:10px;margin-bottom:10px">
      <div><div class="form-lbl">Edad</div><input class="inp" id="pf_edad" type="number" value="${c.edad||''}" style="margin-bottom:0"/></div>
      <div><div class="form-lbl">Sexo</div><select class="inp" id="pf_sexo" style="margin-bottom:0">
        <option ${c.sexo==='Hombre'?'selected':''}>Hombre</option>
        <option ${c.sexo==='Mujer'?'selected':''}>Mujer</option>
      </select></div>
    </div>
    <div class="g2" style="gap:10px;margin-bottom:10px">
      <div><div class="form-lbl">${t('Cintura')} (${cinturaLabel()})</div><input class="inp" id="pf_cintura" type="number" step="0.1" placeholder="${cinturaPlaceholder()}" value="${c.cintura_actual?(isImperial()?(c.cintura_actual/2.54).toFixed(1):c.cintura_actual):''}" style="margin-bottom:0"/></div>
      <div><div class="form-lbl">${t('Cadera')} (${cinturaLabel()})</div><input class="inp" id="pf_cadera" type="number" step="0.1" placeholder="${isImperial()?'38':'96'}" value="${c.cadera?(isImperial()?(c.cadera/2.54).toFixed(1):c.cadera):''}" style="margin-bottom:0"/></div>
    </div>
    <div style="margin-bottom:10px"><div class="form-lbl">Nivel de actividad</div>
      <select class="inp" id="pf_actividad" style="margin-bottom:0">
        <option ${c.actividad==='Sedentario'?'selected':''}>Sedentario (poco o nada de ejercicio)</option>
        <option ${c.actividad==='Ligero'?'selected':''}>Ligero (1-2 días/semana)</option>
        <option ${c.actividad==='Moderada'?'selected':''}>Moderada (3-4 días/semana)</option>
        <option ${c.actividad==='Activo'?'selected':''}>Activo (5-6 días/semana)</option>
        <option ${c.actividad==='Muy activo'?'selected':''}>Muy activo (dobles entrenos)</option>
      </select>
    </div>
    <div style="margin-bottom:10px"><div class="form-lbl">Tipo de alimentación</div>
      <select class="inp" id="pf_dieta" style="margin-bottom:0">
        <option ${c.dieta_tipo==='Omnívoro'?'selected':''}>Omnívoro (como de todo)</option>
        <option ${c.dieta_tipo==='Vegetariano'?'selected':''}>Vegetariano</option>
        <option ${c.dieta_tipo==='Vegano'?'selected':''}>Vegano</option>
        <option ${c.dieta_tipo==='Sin gluten'?'selected':''}>Sin gluten</option>
        <option ${c.dieta_tipo==='Sin lactosa'?'selected':''}>Sin lactosa</option>
      </select>
    </div>
    <div style="margin-bottom:10px"><div class="form-lbl">${t("Alimentos que no me gustan o no puedo comer")}</div>
      <input class="inp" id="pf_alimentos_no" placeholder="Ej: brócoli, pescado, huevos..." value="${c.alimentos_no||''}" style="margin-bottom:0"/>
    </div>
    <div style="margin-bottom:10px"><div class="form-lbl">${t("Lesiones / zonas con dolor / alergias")}</div>
      <input class="inp" id="pf_lesiones" placeholder="Ej: rodilla derecha, lumbar..." value="${c.lesiones||''}" style="margin-bottom:0"/>
    </div>
    <div><div class="form-lbl">${t("Otras observaciones")}</div>
      <textarea class="ta" id="pf_ob" placeholder="Cualquier cosa que tu coach deba saber...">${c.observaciones||''}</textarea>
    </div>
    <div style="margin-top:10px;background:rgba(168,85,247,.06);border:0.5px solid rgba(168,85,247,.2);border-radius:12px;padding:12px">
      <div class="form-lbl" style="color:#c084fc;margin-bottom:6px">🧪 ¿Has tenido o tienes algún tipo de deficiencia?</div>
      <div style="font-size:11px;color:var(--tx3);margin-bottom:8px;line-height:1.5">Por ejemplo: anemia, vitamina D baja, ferritina baja, B12, omega-3... Tu coach lo tendrá en cuenta al preparar tu dieta.</div>
      <textarea class="ta" id="pf_deficiencias" placeholder="Ej: Vitamina D baja en última analítica, tendencia a anemia..." style="margin-bottom:0">${c.deficiencias||''}</textarea>
    </div>
  </div>

  <div style="padding:14px 14px 0">
    <div id="pf_btns" style="display:${tieneData?'none':'block'}">
      <button class="btn" style="width:100%;padding:13px;font-size:15px" onclick="guardarPerfil()">${t('Guardar perfil')}</button>
    </div>
    <div id="pf_msg" style="font-size:13px;text-align:center;margin-top:8px;height:20px"></div>
  </div>

  <!-- Selector de idioma movido al login -->
  <div id="pf_lang_block" style="margin:14px 14px 20px;background:var(--s2);border:0.5px solid var(--br);border-radius:14px;padding:14px;display:${tieneData?'none':'block'}">
    <div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">🌐 Idioma / Language</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button onclick="setLangLogin('es');setLang('es')" style="padding:10px;border-radius:10px;border:1.5px solid ${LANG==='es'?'var(--bl2)':'var(--br)'};background:${LANG==='es'?'rgba(59,130,246,.12)':'none'};color:${LANG==='es'?'var(--blg)':'var(--tx3)'};font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">
        🇪🇸 Español
      </button>
      <button onclick="setLangLogin('en');setLang('en')" style="padding:10px;border-radius:10px;border:1.5px solid ${LANG==='en'?'var(--bl2)':'var(--br)'};background:${LANG==='en'?'rgba(59,130,246,.12)':'none'};color:${LANG==='en'?'var(--blg)':'var(--tx3)'};font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">
        🇬🇧 English
      </button>
    </div>
    <div style="font-size:10px;color:var(--tx3);margin-top:8px;text-align:center">También puedes cambiarlo en la pantalla de inicio de sesión</div>
  </div>

  <!-- Sección cuenta -->
  <div style="margin:0 14px 24px;background:var(--s);border:0.5px solid var(--br);border-radius:14px;overflow:hidden">

    <!-- Cabecera sección -->
    <div style="padding:14px 16px 12px;border-bottom:0.5px solid var(--br)">
      <div style="font-size:11px;font-weight:700;color:var(--sv3);text-transform:uppercase;letter-spacing:.1em">🔐 ${t('Mi cuenta')}</div>
    </div>

    <!-- Foto de perfil — protagonista -->
    <div style="padding:20px 16px;border-bottom:0.5px solid var(--br);display:flex;flex-direction:column;align-items:center;gap:12px">
      <div id="pf_avatar_wrap" style="position:relative;cursor:pointer;touch-action:manipulation" onclick="document.getElementById('pf_foto_input').click()">
        <div id="pf_avatar" style="width:96px;height:96px;border-radius:50%;background:var(--bl3);display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:700;color:#fff;overflow:hidden;border:3px solid var(--bl2);box-shadow:0 0 0 4px rgba(37,99,235,.12)">
          ${USER.foto_perfil ? `<img src="${USER.foto_perfil}" style="width:100%;height:100%;object-fit:cover"/>` : `<span>${USER.nombre?USER.nombre[0].toUpperCase():'?'}</span>`}
        </div>
        <div id="pf_foto_badge" style="position:absolute;bottom:2px;right:2px;width:26px;height:26px;background:var(--bl2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;border:2.5px solid var(--b);transition:.2s">📷</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:16px;font-weight:700;color:var(--sv)">${USER.nombre}</div>
        <div style="font-size:13px;color:var(--blg);margin-top:2px">@${USER.username}</div>
        <div style="font-size:11px;color:var(--tx3);margin-top:5px">${t('Toca la foto para cambiarla')}</div>
      </div>
      <input type="file" id="pf_foto_input" accept="image/*" style="display:none" onchange="subirFotoPerfil(this)"/>
    </div>

    <!-- Suscripción del cliente -->
    <div style="padding:14px 16px;border-bottom:0.5px solid var(--br)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);display:flex;align-items:center;justify-content:center;font-size:15px">💳</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--sv)">${LANG==='en'?'Subscription':'Suscripción'}</div>
            <div style="font-size:11px;color:var(--tx3);margin-top:1px">${LANG==='en'?'Your active plan':'Tu plan contratado'}</div>
          </div>
        </div>
        <span id="pf_sub_badge" style="font-size:11px;font-weight:700;color:var(--tx3)">...</span>
      </div>
      <div id="pf_sub_info" style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;padding:12px">
        <div style="font-size:12px;color:var(--tx3);text-align:center">${LANG==='en'?'Loading subscription...':'Cargando suscripción...'}</div>
      </div>
    </div>

    <!-- Acordeón: Cambiar usuario -->
    <div style="border-bottom:0.5px solid var(--br)">
      <button onclick="pfToggleAcordeon('acc_user_body','acc_user_arrow')" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:none;border:none;cursor:pointer;font-family:inherit;touch-action:manipulation">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);display:flex;align-items:center;justify-content:center;font-size:15px">👤</div>
          <div style="text-align:left">
            <div style="font-size:13px;font-weight:700;color:var(--sv)">${t('Cambiar usuario')}</div>
            <div style="font-size:11px;color:var(--tx3);margin-top:1px">@${USER.username}</div>
          </div>
        </div>
        <span id="acc_user_arrow" style="font-size:12px;color:var(--tx3);transition:transform .2s">▼</span>
      </button>
      <div id="acc_user_body" style="display:none;padding:0 16px 16px">
        <div class="form-lbl">${t('Nuevo usuario')}</div>
        <input class="inp" id="acc_new_user" placeholder="${t('Mínimo 4 caracteres')}" style="margin-bottom:8px"/>
        <div class="form-lbl">${t('Confirmar con contraseña actual')}</div>
        <input class="inp" id="acc_pass_confirm_user" type="password" placeholder="${t('Tu contraseña actual')}" style="margin-bottom:10px"/>
        <button onclick="cambiarUsuario()" style="width:100%;padding:11px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation">✓ ${t('Cambiar usuario')}</button>
        <div id="acc_user_msg" style="font-size:12px;text-align:center;margin-top:8px;min-height:18px"></div>
      </div>
    </div>

    <!-- Acordeón: Cambiar contraseña -->
    <div>
      <button onclick="pfToggleAcordeon('acc_pass_body','acc_pass_arrow')" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:none;border:none;cursor:pointer;font-family:inherit;touch-action:manipulation">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,.1);border:0.5px solid rgba(59,130,246,.2);display:flex;align-items:center;justify-content:center;font-size:15px">🔑</div>
          <div style="text-align:left">
            <div style="font-size:13px;font-weight:700;color:var(--sv)">${t('Cambiar contraseña')}</div>
            <div style="font-size:11px;color:var(--tx3);margin-top:1px">${t('Mínimo 6 caracteres')}</div>
          </div>
        </div>
        <span id="acc_pass_arrow" style="font-size:12px;color:var(--tx3);transition:transform .2s">▼</span>
      </button>
      <div id="acc_pass_body" style="display:none;padding:0 16px 16px">
        <div class="form-lbl">${t('Contraseña actual')}</div>
        <input class="inp" id="acc_pass_old" type="password" placeholder="••••••" style="margin-bottom:8px"/>
        <div class="form-lbl">${t('Nueva contraseña')}</div>
        <input class="inp" id="acc_pass_new" type="password" placeholder="${t('Mínimo 6 caracteres')}" style="margin-bottom:8px"/>
        <div class="form-lbl">${t('Repetir contraseña')}</div>
        <input class="inp" id="acc_pass_rep" type="password" placeholder="${t('Repite la nueva contraseña')}" style="margin-bottom:10px"/>
        <button onclick="cambiarContrasena()" style="width:100%;padding:11px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation">✓ ${t('Cambiar contraseña')}</button>
        <div id="acc_pass_msg" style="font-size:12px;text-align:center;margin-top:8px;min-height:18px"></div>
      </div>
    </div>

  </div>`;
}

function pfFormatFecha(fecha){
  if(!fecha) return '—';
  const parts = String(fecha).split('-');
  if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return fecha;
}

async function cargarSuscripcionPerfil(){
  const box = document.getElementById('pf_sub_info');
  const badge = document.getElementById('pf_sub_badge');
  if(!box || !CD || !CD.id) return;

  try{
    const s = await api('/clientes/'+CD.id+'/suscripcion');

    if(!s || !s.fecha_fin){
      if(badge){
        badge.textContent = LANG==='en'?'No plan':'Sin plan';
        badge.style.color = 'var(--tx3)';
      }
      box.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;font-size:17px">🔒</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:var(--sv)">${LANG==='en'?'No active subscription':'Sin suscripción activa'}</div>
            <div style="font-size:11px;color:var(--tx3);margin-top:2px;line-height:1.4">${LANG==='en'?'Ask your coach to activate your plan.':'Habla con tu coach para activar tu plan.'}</div>
          </div>
        </div>`;
      return;
    }

    const vencida = !!s.vencida || s.estado === 'cancelada' || Number(s.dias_restantes||0) <= 0;
    const proxima = !!s.proxima_a_vencer && !vencida;
    const diasRestantes = vencida ? 0 : (s.dias_restantes ?? '—');
    const color = vencida ? '#fca5a5' : proxima ? 'var(--amb)' : 'var(--gnb)';
    const estadoTexto = vencida
      ? (LANG==='en'?'Expired':'Vencida')
      : proxima
        ? (LANG==='en'?'Ending soon':'Próxima a vencer')
        : (LANG==='en'?'Active':'Activa');

    const inicio = pfFormatFecha(s.fecha_inicio);
    const fin = pfFormatFecha(s.fecha_fin);
    const diasContratados = s.fecha_inicio && s.fecha_fin
      ? Math.max(0, Math.ceil((new Date(s.fecha_fin) - new Date(s.fecha_inicio)) / (1000*60*60*24)))
      : '—';

    if(badge){
      badge.textContent = (vencida?'🔴 ':proxima?'⚠️ ':'✅ ') + estadoTexto;
      badge.style.color = color;
    }

    box.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div style="background:rgba(255,255,255,.035);border:0.5px solid var(--br);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">${LANG==='en'?'Started':'Empezó'}</div>
          <div style="font-size:13px;font-weight:800;color:var(--sv)">${inicio}</div>
        </div>
        <div style="background:rgba(255,255,255,.035);border:0.5px solid var(--br);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">${LANG==='en'?'Ends':'Termina'}</div>
          <div style="font-size:13px;font-weight:800;color:${color}">${fin}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:rgba(255,255,255,.035);border:0.5px solid var(--br);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px">${LANG==='en'?'Contracted':'Contratada'}</div>
          <div style="font-size:19px;font-weight:900;color:var(--sv);line-height:1">${diasContratados}</div>
          <div style="font-size:10px;color:var(--tx3);margin-top:3px">${LANG==='en'?'days':'días'}</div>
        </div>
        <div style="background:rgba(37,99,235,.08);border:0.5px solid rgba(59,130,246,.18);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px">${LANG==='en'?'Remaining':'Restantes'}</div>
          <div style="font-size:19px;font-weight:900;color:${color};line-height:1">${diasRestantes}</div>
          <div style="font-size:10px;color:var(--tx3);margin-top:3px">${LANG==='en'?'days':'días'}</div>
        </div>
      </div>
      ${s.precio ? `<div style="margin-top:9px;font-size:11px;color:var(--tx3);text-align:center">💶 ${s.precio}€/${LANG==='en'?'month':'mes'}</div>` : ''}
    `;
  }catch(e){
    if(badge){
      badge.textContent = LANG==='en'?'Unavailable':'No disponible';
      badge.style.color = 'var(--tx3)';
    }
    box.innerHTML = `<div style="font-size:12px;color:var(--tx3);text-align:center">${LANG==='en'?'Could not load subscription.':'No se pudo cargar la suscripción.'}</div>`;
  }
}


// ── ACORDEÓN PERFIL ─────────────────────────────────────────────
function pfToggleAcordeon(bodyId, arrowId){
  const body = document.getElementById(bodyId);
  const arrow = document.getElementById(arrowId);
  if(!body) return;
  const open = body.style.display === 'block';
  body.style.display = open ? 'none' : 'block';
  if(arrow) arrow.style.transform = open ? '' : 'rotate(180deg)';
}

// ── FOTO DE PERFIL ──────────────────────────────────────────────
function updateCoachTopbar() {
  const av = document.getElementById('coach_topbar_avatar');
  const nm = document.getElementById('coach_topbar_nombre');
  const pill = document.getElementById('mobile_lang_pill');
  if(!av || !USER) return;
  // Update lang pill text
  if(pill) pill.textContent = COACH_LANG.toUpperCase();
  // Avatar
  if(USER.foto_perfil) {
    av.innerHTML = `<img src="${USER.foto_perfil}" style="width:100%;height:100%;object-fit:cover"/>`;
  } else {
    av.textContent = (USER.nombre||'C')[0].toUpperCase();
  }
  // Name — only show on desktop (hidden on mobile via CSS)
  if(nm) {
    nm.textContent = USER.nombre || USER.username || 'Coach';
    nm.style.display = window.innerWidth > 600 ? 'inline' : 'none';
  }
}

async function subirFotoCoach(input) {
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const max = 400;
      let w = img.width, h = img.height;
      if(w > h) { if(w > max){ h = Math.round(h*max/w); w = max; } }
      else { if(h > max){ w = Math.round(w*max/h); h = max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.82);
      try {
        await api('/me/foto', {method:'POST', body:JSON.stringify({foto: base64})});
        USER.foto_perfil = base64;
        localStorage.setItem('wm_user', JSON.stringify(USER));
        updateCoachTopbar();
      } catch(err) { alert('Error al subir foto'); }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function subirFotoPerfil(input) {
  const file = input.files[0];
  if(!file) return;
  // Resize to max 400x400 and compress
  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const max = 400;
      let w = img.width, h = img.height;
      if(w > h) { if(w > max){ h = Math.round(h*max/w); w = max; } }
      else { if(h > max){ w = Math.round(w*max/h); h = max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.82);
      try {
        await api('/me/foto', {method:'POST', body:JSON.stringify({foto: base64})});
        // Update in memory and localStorage
        USER.foto_perfil = base64;
        localStorage.setItem('wm_user', JSON.stringify(USER));
        // Update avatar in profile
        const av = document.getElementById('pf_avatar');
        if(av) av.innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover"/>`;
        // Update topbar/nav avatar everywhere
        actualizarAvatarsUI(base64);
      } catch(err) {
        alert(t('Error al subir foto'));
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function actualizarAvatarsUI(base64) {
  // Update all avatar elements that show the current user
  document.querySelectorAll('.mi-avatar').forEach(el => {
    el.innerHTML = base64 ? `<img src="${base64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : el.innerHTML;
  });
}

async function cambiarUsuario(){
  const newUser = document.getElementById('acc_new_user')?.value?.trim();
  const pass = document.getElementById('acc_pass_confirm_user')?.value;
  const msg = document.getElementById('acc_user_msg');
  if(!newUser || newUser.length < 4){ msg.style.color='#f87171'; msg.textContent=t('El usuario debe tener al menos 4 caracteres'); return; }
  if(!pass){ msg.style.color='#f87171'; msg.textContent=t('Escribe tu contraseña actual para confirmar'); return; }
  try{
    await api('/me',{method:'PUT',body:JSON.stringify({username:newUser, password_actual:pass})});
    USER.username = newUser;
    localStorage.setItem('wm_user', JSON.stringify(USER));
    if(localStorage.getItem('wm_saved_user')) localStorage.setItem('wm_saved_user', newUser);
    msg.style.color='#86efac'; msg.textContent='✓ '+t('Usuario actualizado');
    document.getElementById('acc_new_user').value='';
    document.getElementById('acc_pass_confirm_user').value='';
  }catch(e){ msg.style.color='#f87171'; msg.textContent=e.error||t('Error al cambiar usuario'); }
}

async function cambiarContrasena(){
  const old = document.getElementById('acc_pass_old')?.value;
  const newP = document.getElementById('acc_pass_new')?.value;
  const rep = document.getElementById('acc_pass_rep')?.value;
  const msg = document.getElementById('acc_pass_msg');
  if(!old){ msg.style.color='#f87171'; msg.textContent=t('Escribe tu contraseña actual'); return; }
  if(!newP || newP.length < 6){ msg.style.color='#f87171'; msg.textContent=t('La nueva contraseña debe tener al menos 6 caracteres'); return; }
  if(newP !== rep){ msg.style.color='#f87171'; msg.textContent=t('Las contraseñas no coinciden'); return; }
  try{
    await api('/me',{method:'PUT',body:JSON.stringify({password_actual:old, password_nueva:newP})});
    msg.style.color='#86efac'; msg.textContent='✓ '+t('Contraseña actualizada');
    // Update saved credentials if remember me was on
    if(localStorage.getItem('wm_saved_pass')) localStorage.setItem('wm_saved_pass', newP);
    document.getElementById('acc_pass_old').value='';
    document.getElementById('acc_pass_new').value='';
    document.getElementById('acc_pass_rep').value='';
  }catch(e){ msg.style.color='#f87171'; msg.textContent=e.error||t('Error al cambiar contraseña'); }
}

async function guardarPerfil(){
  const msg=document.getElementById('pf_msg');
  try{
    const pf = (id) => document.getElementById(id);
    await api('/clientes/'+CD.id+'/perfil',{method:'PUT',body:JSON.stringify({
      peso_actual: fromPeso(pf('pf_peso')?.value)||null,
      altura: fromAltura(pf('pf_altura')?.value)||null,
      edad: parseInt(pf('pf_edad')?.value)||null,
      sexo: pf('pf_sexo')?.value||'Hombre',
      actividad: pf('pf_actividad')?.value||'Moderada',
      cintura_actual: fromCintura(pf('pf_cintura')?.value)||null,
      cadera: fromCintura(pf('pf_cadera')?.value)||null,
      dieta_tipo: pf('pf_dieta')?.value||'Omnívoro',
      alimentos_no: pf('pf_alimentos_no')?.value||'',
      lesiones: pf('pf_lesiones')?.value||'',
      observaciones: pf('pf_ob')?.value||'',
      deficiencias: pf('pf_deficiencias')?.value||''
    })});
    await loadCD(CD.id);
    msg.style.color='#86efac';msg.textContent='✓ Profile saved ✓';
    // Switch to compact account view immediately after first save
    const formEl=document.getElementById('pf_form');
    const btnsEl=document.getElementById('pf_btns');
    const langEl=document.getElementById('pf_lang_block');
    const editBtn=document.getElementById('pf_edit_btn');
    if(formEl){formEl.style.display='none';formEl.style.pointerEvents='none';formEl.style.opacity='.85';}
    if(btnsEl){btnsEl.style.display='none';}
    if(langEl){langEl.style.display='none';}
    // Add edit button if not there
    if(!editBtn){
      const hdrDiv=document.getElementById('pf_header_bar');
      if(hdrDiv){
        const eb=document.createElement('button');
        eb.id='pf_edit_btn';
        eb.innerHTML='✏️ Editar';
        eb.style.cssText='padding:7px 16px;background:var(--bl2);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;touch-action:manipulation';
        eb.onclick=perfilModoEditar;
        hdrDiv.appendChild(eb);
      }
    }
    setTimeout(()=>{msg.textContent='';},2000);
  }catch(e){msg.style.color='#f87171';msg.textContent='Error guardando';}
}




// ═══ AUTO CALC MACROS ═════════════════════════════════
function autoCalcMacros(){
  const peso = parseFloat(document.getElementById('pf_peso')?.value || document.querySelector('#cContent [id="kcal"]')?.getAttribute('data-peso') || 0);
  // Get data from client form fields
  const pesoEl = document.getElementById('pf_peso');
  const alturaEl = document.getElementById('pf_altura');  
  const edadEl = document.getElementById('pf_edad');
  const sexoEl = document.getElementById('pf_sexo');
  const actividadEl = document.getElementById('pf_actividad');
  
  // Use stored CD data as fallback
  const p = parseFloat(pesoEl?.value) || (window._cid && CD ? CD.peso_actual : 0);
  const h = parseInt(alturaEl?.value) || (window._cid && CD ? CD.altura : 0);
  const e = parseInt(edadEl?.value) || (window._cid && CD ? CD.edad : 0);
  const sexo = sexoEl?.value || (window._cid && CD ? CD.sexo : 'Hombre');
  const actividad = actividadEl?.value || (window._cid && CD ? CD.actividad : 'Moderada');
  const obj = document.getElementById('obj')?.value || 'Volumen';
  
  if(!p || !h || !e) {
    alert('Rellena primero: peso, altura y edad del cliente en su perfil');
    return;
  }
  
  // Mifflin-St Jeor TMB
  let tmb;
  if(sexo === 'Hombre') tmb = Math.round(10*p + 6.25*h - 5*e + 5);
  else tmb = Math.round(10*p + 6.25*h - 5*e - 161);
  
  // Activity factor
  const factores = {
    'Sedentario':1.2,'Sedentario (poco o nada de ejercicio)':1.2,
    'Ligera':1.375,'Ligera (1-2 días/semana)':1.375,
    'Moderada':1.55,'Moderada (3-4 días/semana)':1.55,
    'Alta':1.725,'Alta (5-6 días/semana)':1.725,
    'Muy alta':1.9,'Muy alta (atleta, 2x día)':1.9,
  };
  const factor = factores[actividad] || 1.55;
  const tdee = Math.round(tmb * factor);
  
  // Adjust for goal
  let kcal, protMultiplier;
  if(obj.includes('Volumen')) { kcal = tdee + 300; protMultiplier = 2.0; }
  else if(obj.includes('Definición')) { kcal = Math.round(tdee * 0.85); protMultiplier = 2.1; }
  else if(obj.includes('Perder')) { kcal = Math.round(tdee * 0.85); protMultiplier = 2.1; }
  else if(obj.includes('Fuerza')) { kcal = tdee + 200; protMultiplier = 2.2; }
  else { kcal = tdee; protMultiplier = 2.0; } // Recomposición
  
  // Macros
  const prot = Math.round(p * protMultiplier);
  const fat = Math.round(p * 0.8);
  const carbs = Math.max(0, Math.round((kcal - prot*4 - fat*9) / 4));
  
  // Update fields
  const kcalEl = document.getElementById('kcal');
  const protEl = document.getElementById('prot');
  const fatEl = document.getElementById('fat');
  const carbsEl = document.getElementById('carbs');
  
  if(kcalEl) kcalEl.value = kcal;
  if(protEl) protEl.value = prot;
  if(fatEl) fatEl.value = fat;
  if(carbsEl) carbsEl.value = carbs;
  
  // Update visual bars
  recalcMacros('kcal');
  
  // Show confirmation
  const btn = event.target;
  const orig = btn.textContent;
  btn.textContent = `✓ ${kcal} kcal · ${prot}g P · ${carbs}g C · ${fat}g G`;
  btn.style.background = 'rgba(34,197,94,.2)';
  setTimeout(() => { btn.textContent = orig; btn.style.background = 'rgba(34,197,94,.1)'; }, 4000);
}

// ═══ CALCULADORA DE MACROS ════════════════════════════
function recalcMacros(changed){
  const kcal=parseInt(document.getElementById('kcal').value)||0;
  const prot=parseInt(document.getElementById('prot').value)||0;
  const fat=parseInt(document.getElementById('fat').value)||0;
  let carbs=parseInt(document.getElementById('carbs').value)||0;
  
  // Auto-adjust carbs when kcal, prot or fat changes
  if(changed==='kcal'||changed==='prot'||changed==='fat'){
    const usedKcal = prot*4 + fat*9;
    const remainingKcal = kcal - usedKcal;
    carbs = Math.max(0, Math.round(remainingKcal/4));
    document.getElementById('carbs').value = carbs;
  } else {
    // If carbs changed, update total kcal
    const totalKcal = prot*4 + fat*9 + carbs*4;
    document.getElementById('kcal').value = totalKcal;
  }
  
  // Update kcal labels
  const finalKcal = parseInt(document.getElementById('kcal').value)||0;
  const finalCarbs = parseInt(document.getElementById('carbs').value)||0;
  const el_pk=document.getElementById('prot_kcal');
  const el_fk=document.getElementById('fat_kcal');
  const el_ck=document.getElementById('carbs_kcal');
  if(el_pk)el_pk.textContent=(prot*4)+' kcal';
  if(el_fk)el_fk.textContent=(fat*9)+' kcal';
  if(el_ck)el_ck.textContent=(finalCarbs*4)+' kcal';
  
  // Update bar and percentages
  if(finalKcal>0){
    const pp=Math.round(prot*4/finalKcal*100);
    const fp=Math.round(fat*9/finalKcal*100);
    const cp=Math.round(finalCarbs*4/finalKcal*100);
    const bp=document.getElementById('bar_prot');
    const bf=document.getElementById('bar_fat');
    const bc=document.getElementById('bar_carbs');
    if(bp)bp.style.width=pp+'%';
    if(bf)bf.style.width=fp+'%';
    if(bc)bc.style.width=cp+'%';
    const ep=document.getElementById('prot_pct');
    const ef=document.getElementById('fat_pct');
    const ec=document.getElementById('carbs_pct');
    if(ep)ep.textContent=pp+'%';
    if(ef)ef.textContent=fp+'%';
    if(ec)ec.textContent=cp+'%';
  }
}

function calcTMBCoach(c){
  const p=parseFloat(c.peso_actual),h=parseInt(c.altura),e=parseInt(c.edad);
  if(!p||!h||!e)return'—';
  if(c.sexo==='Hombre')return Math.round(10*p+6.25*h-5*e+5);
  return Math.round(10*p+6.25*h-5*e-161);
}
function calcGastoCoach(c){
  const tmb=calcTMBCoach(c);if(tmb==='—')return'—';
  const factores={'Sedentario (poco o nada de ejercicio)':1.2,'Ligera (1-2 días/semana)':1.375,'Moderada (3-4 días/semana)':1.55,'Alta (5-6 días/semana)':1.725,'Muy alta (atleta, 2x día)':1.9,'Sedentario':1.2,'Ligera':1.375,'Moderada':1.55,'Alta':1.725,'Muy alta':1.9};
  return Math.round(tmb*(factores[c.actividad]||1.55));
}



// ═══ CALCULADORA COACH PRO + AUTOGUARDADO ═══════════════════════════
function calcularMacrosCoachCliente(c){
  const peso = parseFloat(c.peso_actual || c.peso || 0);
  const altura = parseInt(c.altura || 0);
  const edad = parseInt(c.edad || 0);
  const sexo = String(c.sexo || 'Hombre').toLowerCase();
  const actividad = String(c.actividad || 'Moderada').toLowerCase();
  const objetivo = String(c.objetivo || 'Mantenimiento').toLowerCase();

  if(!peso || !altura || !edad){
    return {
      kcal: parseInt(c.kcal_internas || 2000),
      prot: parseInt(c.prot || Math.round((peso || 75) * 2)),
      fat: parseInt(c.fat || Math.round((peso || 75) * 0.8)),
      carbs: parseInt(c.carbs || 200),
      tmb: 0,
      gasto: 0
    };
  }

  const tmb = Math.round(
    sexo.includes('mujer') || sexo.includes('female')
      ? (10 * peso + 6.25 * altura - 5 * edad - 161)
      : (10 * peso + 6.25 * altura - 5 * edad + 5)
  );

  let factor = 1.55;
  if(actividad.includes('sedent') || actividad.includes('bajo')) factor = 1.2;
  else if(actividad.includes('liger')) factor = 1.375;
  else if(actividad.includes('moder')) factor = 1.55;
  else if(actividad.includes('alta') || actividad.includes('activo') || actividad.includes('5-6')) factor = 1.725;
  else if(actividad.includes('muy') || actividad.includes('atleta')) factor = 1.9;

  const gasto = Math.round(tmb * factor);

  let kcal = gasto;
  if(objetivo.includes('defin') || objetivo.includes('perder') || objetivo.includes('grasa')){
    kcal = Math.round(gasto * 0.85); // déficit moderado 15%, no agresivo
  } else if(objetivo.includes('recomp')){
    kcal = Math.round(gasto * 0.92);
  } else if(objetivo.includes('vol') || objetivo.includes('ganar') || objetivo.includes('masa')){
    kcal = Math.round(gasto * 1.10);
  } else if(objetivo.includes('fuerza')){
    kcal = Math.round(gasto * 1.05);
  }

  const prot = Math.round(peso * 2.1);
  const fat = Math.round(peso * 0.8);
  const carbs = Math.max(0, Math.round((kcal - (prot * 4 + fat * 9)) / 4));

  return { kcal, prot, fat, carbs, tmb, gasto };
}

let _coachMacroSaveTimer = null;

function aplicarMacrosCoach(c, guardar=false){
  const calc = calcularMacrosCoachCliente(c);

  const kcalEl = document.getElementById('kcal');
  const protEl = document.getElementById('prot');
  const fatEl = document.getElementById('fat');
  const carbsEl = document.getElementById('carbs');

  if(kcalEl) kcalEl.value = calc.kcal;
  if(protEl) protEl.value = calc.prot;
  if(fatEl) fatEl.value = calc.fat;
  if(carbsEl) carbsEl.value = calc.carbs;

  recalcMacros('kcal');

  const w = document.getElementById('tmb_wrap_coach');
  if(w && calc.tmb && calc.gasto){
    w.innerHTML = `<div style="display:flex;gap:10px">
      <div style="flex:1;background:rgba(37,99,235,.08);border:0.5px solid rgba(59,130,246,.2);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:10px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.06em">TMB</div>
        <div style="font-size:18px;font-weight:700;color:var(--sv)">${calc.tmb}</div>
        <div style="font-size:10px;color:var(--tx3)">kcal reposo</div>
      </div>
      <div style="flex:1;background:rgba(34,197,94,.08);border:0.5px solid rgba(34,197,94,.2);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:10px;color:var(--gnb);font-weight:700;text-transform:uppercase;letter-spacing:.06em">Gasto total</div>
        <div style="font-size:18px;font-weight:700;color:var(--sv)">${calc.gasto}</div>
        <div style="font-size:10px;color:var(--tx3)">kcal/día</div>
      </div>
    </div>`;
  }

  if(guardar) autoGuardarMacrosCoach();
}

function autoGuardarMacrosCoach(){
  const btn = document.getElementById('btn_guardar_datos');
  const id = btn?.dataset?.clienteId || window._coachClienteId || window._lastClienteId;
  if(!id) return;

  clearTimeout(_coachMacroSaveTimer);
  _coachMacroSaveTimer = setTimeout(async ()=>{
    try{
      await api('/clientes/'+id,{method:'PUT',body:JSON.stringify({
        objetivo:document.getElementById('obj')?.value || '',
        nivel:document.getElementById('niv')?.value || '',
        kcal_internas:parseInt(document.getElementById('kcal')?.value)||0,
        prot:parseInt(document.getElementById('prot')?.value)||0,
        carbs:parseInt(document.getElementById('carbs')?.value)||0,
        fat:parseInt(document.getElementById('fat')?.value)||0,
        comida_libre:document.getElementById('clibre')?.value || '',
        mensaje_semana:document.getElementById('msgsem')?.value || '',
        notas_coach:document.getElementById('notasc')?.value || ''
      })});
      if(btn){
        const old = btn.textContent;
        btn.textContent = '✓ Guardado automático';
        setTimeout(()=>{ btn.textContent = old.includes('Guardado') ? 'Guardar' : old; }, 1200);
      }
    }catch(e){
      console.error('Error autoguardando macros', e);
    }
  }, 700);
}

function recalcularYGuardarCoach(){
  const base = window._coachClienteActual || {};
  const c = {
    ...base,
    objetivo: document.getElementById('obj')?.value || base.objetivo,
    nivel: document.getElementById('niv')?.value || base.nivel
  };
  aplicarMacrosCoach(c, true);
}


// ═══ RECORDATORIOS ════════════════════════════════════
function checkRecordatorios(){
  if(!CD)return;
  const ahora=Date.now();

  // Comprobar peso semanal (cada 7 días)
  const ultimoPeso=localStorage.getItem('wm_ultimo_peso_'+CD.id);
  const posponerPesoTs=parseInt(localStorage.getItem('wm_pos_peso_'+CD.id)||'0');
  const SEMANA=7*24*60*60*1000;
  const pesos=CD.pesos||[];
  const ultimoPesoFecha=pesos.length?new Date(pesos[pesos.length-1].fecha).getTime():0;
  const necesitaPeso=(ahora-ultimoPesoFecha)>SEMANA&&ahora>posponerPesoTs;
  
  // Comprobar foto mensual (cada 28 días)
  const posponerFotoTs=parseInt(localStorage.getItem('wm_pos_foto_'+CD.id)||'0');
  const MES=28*24*60*60*1000;
  const fotos=CD.fotos||[];
  const ultimaFotoFecha=fotos.length?new Date(fotos[fotos.length-1].fecha).getTime():0;
  const necesitaFoto=(ahora-ultimaFotoFecha)>MES&&ahora>posponerFotoTs;

  if(necesitaPeso){
    setTimeout(()=>{document.getElementById('pesoReminder').style.display='flex';applyLang(document.getElementById('pesoReminder'));},1500);
  } else if(necesitaFoto){
    setTimeout(()=>{document.getElementById('fotoReminder').style.display='flex';applyLang(document.getElementById('fotoReminder'));},2000);
  }
}

function irAPeso(){
  document.getElementById('pesoReminder').style.display='none';
  klNav('progreso',document.getElementById('bni3'));
}
function posponerPeso(){
  localStorage.setItem('wm_pos_peso_'+CD.id, Date.now()+(24*60*60*1000));
  document.getElementById('pesoReminder').style.display='none';
}
function irAFoto(){
  document.getElementById('fotoReminder').style.display='none';
  klNav('progreso',document.getElementById('bni3'));
}
function posponerFoto(){
  localStorage.setItem('wm_pos_foto_'+CD.id, Date.now()+(7*24*60*60*1000));
  document.getElementById('fotoReminder').style.display='none';
}



// INJURY WARNINGS
const INJURY_MAP={
  'rodilla':['Squat (Barbell)','Front Squat (Barbell)','Bulgarian Split Squat (Dumbbell)','Bulgarian Split Squat (Barbell)','Hack Squat (Machine)','Walking Lunge (Dumbbell)','Static Lunge (Barbell)','Step Up (Dumbbell)','Leg Extension (Machine)'],
  'knee':['Squat (Barbell)','Front Squat (Barbell)','Bulgarian Split Squat (Dumbbell)','Hack Squat (Machine)','Walking Lunge (Dumbbell)','Leg Extension (Machine)'],
  'lumbar':['Deadlift (Barbell)','Romanian Deadlift (Barbell)','Good Morning (Barbell)','Barbell Row (Overhand)','Overhead Press (Barbell)','Squat (Barbell)'],
  'lower back':['Deadlift (Barbell)','Romanian Deadlift (Barbell)','Good Morning (Barbell)','Barbell Row (Overhand)'],
  'hombro':['Overhead Press (Barbell)','Seated Overhead Press (Barbell)','Bench Press (Barbell)','Skull Crusher (Barbell)','Upright Row (Barbell)','Behind Neck Press'],
  'shoulder':['Overhead Press (Barbell)','Upright Row (Barbell)','Behind Neck Press'],
  'cervical':['Overhead Press (Barbell)','Seated Overhead Press (Barbell)','Shrug (Barbell)','Upright Row (Barbell)'],
  'muñeca':['Barbell Curl','EZ Bar Curl','Skull Crusher (Barbell)','Wrist Curl'],
  'wrist':['Barbell Curl','EZ Bar Curl','Skull Crusher (Barbell)'],
  'codo':['Skull Crusher (Barbell)','Skull Crusher (EZ Bar)','Close Grip Bench Press','Tricep Pushdown (Bar)'],
  'elbow':['Skull Crusher (Barbell)','Close Grip Bench Press'],
  'cadera':['Hip Thrust (Barbell)','Bulgarian Split Squat (Dumbbell)','Side Lunge (Dumbbell)'],
  'isquio':['Romanian Deadlift (Barbell)','Deadlift (Barbell)','Good Morning (Barbell)'],
  'hamstring':['Romanian Deadlift (Barbell)','Deadlift (Barbell)','Good Morning (Barbell)'],
};

function getInjuryWarnings(ejercicioNombre, lesiones){
  if(!lesiones)return[];
  const lesionesLower=lesiones.toLowerCase();
  const warnings=[];
  for(const[zona,ejercicios]of Object.entries(INJURY_MAP)){
    if(lesionesLower.includes(zona)&&ejercicios.includes(ejercicioNombre)){
      warnings.push(zona);
    }
  }
  return warnings;
}

// VIDEO PLAYER
function openVideo(url, nombre){
  const modal = document.getElementById('videoModal');
  const frame = document.getElementById('videoFrame');
  const title = document.getElementById('videoTitle');
  title.textContent = nombre || 'Técnica del ejercicio';
  // Convert YouTube URL to embed
  let embedUrl = url;
  if(url.includes('youtube.com/shorts/')){
    const id = url.split('shorts/')[1].split('?')[0];
    embedUrl = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
  } else if(url.includes('youtu.be/')){
    const id = url.split('youtu.be/')[1].split('?')[0];
    embedUrl = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
  } else if(url.includes('youtube.com/watch')){
    const id = new URLSearchParams(url.split('?')[1]).get('v');
    embedUrl = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
  }
  frame.src = embedUrl;
  modal.style.display = 'flex';
}
function closeVideo(){
  document.getElementById('videoModal').style.display = 'none';
  document.getElementById('videoFrame').src = '';
}


// REGISTRO PÚBLICO
async function resetearContrasena(userId){
  const inp = document.getElementById('nueva_pass_'+userId);
  const msg = document.getElementById('reset_msg_'+userId);
  const pass = inp?.value?.trim();
  if(!pass || pass.length < 4){ msg.style.color='#fca5a5'; msg.textContent='Mínimo 4 caracteres'; return; }
  try {
    const r = await api('/auth/reset-password', { method:'POST', body: JSON.stringify({ userId, newPassword: pass }) });
    if(r.ok){ msg.style.color='var(--gnb)'; msg.textContent='✓ Contraseña actualizada'; inp.value=''; }
    else { msg.style.color='#fca5a5'; msg.textContent = r.error || 'Error'; }
  } catch(e){ msg.style.color='#fca5a5'; msg.textContent='Error de conexión'; }
  setTimeout(()=>{ if(msg) msg.textContent=''; }, 3000);
}

function showRegistro(){show('sRegistro');}

// ── REGISTRO: preferencias de dieta con chips ─────────────────────
const _regFoodsSelected = new Set();
function regToggleFoodChip(btn, nombre){
  if(!btn || !nombre) return;
  if(_regFoodsSelected.has(nombre)){
    _regFoodsSelected.delete(nombre);
    btn.classList.remove('on');
  } else {
    _regFoodsSelected.add(nombre);
    btn.classList.add('on');
  }
  const inp=document.getElementById('reg_alimentos_pref');
  if(inp) inp.value=[..._regFoodsSelected].join(', ');
}
// Bilingual chip: stores the correct name depending on current _regLang
function regToggleFoodChipBilingual(btn, nombreEs, nombreEn){
  if(!btn) return;
  const nombre = _regLang === 'en' ? nombreEn : nombreEs;
  const other = _regLang === 'en' ? nombreEs : nombreEn;
  if(_regFoodsSelected.has(other)) _regFoodsSelected.delete(other);
  if(_regFoodsSelected.has(nombre)){
    _regFoodsSelected.delete(nombre);
    btn.classList.remove('on');
  } else {
    _regFoodsSelected.add(nombre);
    btn.classList.add('on');
  }
  const inp=document.getElementById('reg_alimentos_pref');
  if(inp) inp.value=[..._regFoodsSelected].join(', ');
}

function regGetDietPrefsText(){
  const comidas = document.getElementById('reg_num_comidas')?.value || '';
  const chips = [..._regFoodsSelected];
  const extra = (document.getElementById('reg_alimentos_extra')?.value || '').trim();
  const alimentos = [...chips, extra].filter(Boolean).join(', ');
  const partes=[];
  if(alimentos) partes.push(`Alimentos preferidos para crear dieta IA: ${alimentos}`);
  if(comidas) partes.push(`Número de comidas preferido: ${comidas}`);
  return partes.join('\n');
}
function regClearDietPrefs(){
  _regFoodsSelected.clear();
  document.querySelectorAll('.reg-food-chip.on').forEach(b=>b.classList.remove('on'));
  ['reg_alimentos_pref','reg_alimentos_extra'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const meals=document.getElementById('reg_num_comidas');
  if(meals) meals.value='4';
}
function extraerPreferenciasDietaCliente(c){
  const txt = `${c?.observaciones||''}\n${c?.notas||''}`;
  const out={alimentos:[],numComidas:''};
  const mAlim = txt.match(/Alimentos preferidos para crear dieta IA:\s*([^\n]+)/i);
  if(mAlim) out.alimentos = mAlim[1].split(',').map(x=>x.trim()).filter(Boolean);
  const mCom = txt.match(/Número de comidas preferido:\s*(\d+)/i);
  if(mCom) out.numComidas = mCom[1];
  return out;
}
function dbAplicarPreferenciasCliente(c){
  const prefs = extraerPreferenciasDietaCliente(c);
  if(prefs.numComidas){
    const sel=document.getElementById('db_num_comidas');
    if(sel && [...sel.options].some(o=>o.value===prefs.numComidas)) sel.value=prefs.numComidas;
  }
  if(prefs.alimentos?.length){
    _dbSeleccionados.clear();
    prefs.alimentos.forEach(a=>_dbSeleccionados.add(a));
    dbActualizarSelected();
  }
  return prefs;
}

function mostrarOlvideContrasena(){
  document.getElementById('olvide_user').value = document.getElementById('lu')?.value || '';
  document.getElementById('olvide_err').style.display = 'none';
  document.getElementById('olvide_ok').style.display = 'none';
  show('sOlvide');
}

async function solicitarReseteo(){
  const username = document.getElementById('olvide_user').value.trim();
  const errEl = document.getElementById('olvide_err');
  const okEl = document.getElementById('olvide_ok');
  errEl.style.display = 'none';
  okEl.style.display = 'none';
  if(!username){ errEl.textContent = 'Escribe tu nombre de usuario'; errEl.style.display='block'; return; }
  try {
    const r = await fetch('/api/auth/solicitar-reset', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username })
    });
    const d = await r.json();
    if(d.ok) { okEl.style.display='block'; }
    else { errEl.textContent = d.error || 'Error. Contacta con tu coach directamente.'; errEl.style.display='block'; }
  } catch(e) { errEl.textContent = 'Error de conexión.'; errEl.style.display='block'; }
}

async function doRegistro(){
  const nombre=document.getElementById('reg_nombre').value.trim();
  const email=document.getElementById('reg_email').value.trim();
  const pass=document.getElementById('reg_pass').value;
  const err=document.getElementById('reg_err');
  const ok=document.getElementById('reg_ok');
  err.style.display='none';ok.style.display='none';
  const username=document.getElementById('reg_username').value.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
  const tel=document.getElementById('reg_tel').value.trim();
  if(!nombre||!email||!tel||!pass){err.textContent='Nombre, email, teléfono y contraseña son obligatorios';err.style.display='block';return;}
  if(!username||username.length<3){err.textContent='El usuario debe tener al menos 3 caracteres (solo letras y números)';err.style.display='block';return;}
  if(pass.length<6){err.textContent='La contraseña debe tener al menos 6 caracteres';err.style.display='block';return;}
  try{
    await api('/auth/registro',{method:'POST',body:JSON.stringify({
      nombre,username,email,telefono:tel,password:pass,
      objetivo:document.getElementById('reg_obj').value,
      nivel:document.getElementById('reg_niv').value,
      peso_actual:parseFloat(document.getElementById('reg_peso').value)||0,
      altura:parseInt(document.getElementById('reg_altura').value)||0,
      edad:parseInt(document.getElementById('reg_edad').value)||0,
      sexo:document.getElementById('reg_sexo').value,
      actividad:document.getElementById('reg_act').value,
      dieta_tipo:document.getElementById('reg_dieta').value,
      alimentos_no:document.getElementById('reg_alimentos_no').value,
      lesiones:document.getElementById('reg_lesiones').value,
      observaciones:[document.getElementById('reg_obs').value.trim(), regGetDietPrefsText()].filter(Boolean).join('\n\n')
    })});
    ok.textContent='✓ Solicitud enviada. Tu coach la revisará y te dará acceso pronto. Puedes cerrar esta ventana.';
    ok.style.display='block';
    // Clear form
    ['reg_nombre','reg_username','reg_email','reg_tel','reg_pass','reg_peso','reg_altura','reg_edad','reg_alimentos_no','reg_lesiones','reg_obs'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    regClearDietPrefs();
  }catch(e){err.textContent=e.error||'Error al enviar solicitud';err.style.display='block';}
}

// PANEL PENDIENTES
function hPendientes(p){
  if(!p.length) return `<div style="text-align:center;padding:60px 20px;color:var(--tx3)"><div style="font-size:48px;margin-bottom:14px">✅</div><div style="font-size:15px;font-weight:600;color:var(--sv2)">${COACH_LANG==='en'?'No pending requests':'Sin solicitudes pendientes'}</div><div style="font-size:13px;margin-top:6px">${tc('Cuando alguien se registre aparecerá aquí')}</div></div>`;
  
  return `<div class="sec" style="margin-bottom:12px"><div class="sec-hdr">${p.length} ${COACH_LANG==='en'?`pending request${p.length!==1?'s':''}`:`solicitud${p.length!==1?'es':''} pendiente${p.length!==1?'s':''}`}</div>
  ${p.map(c=>`<div style="background:var(--s2);border:0.5px solid var(--br);border-radius:12px;padding:14px;margin-bottom:10px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <div>
        <div style="font-size:15px;font-weight:700;color:var(--sv)">${c.nombre}</div>
        <div style="font-size:12px;color:var(--blg);margin-top:2px">${c.email}${c.telefono?` · 📱 ${c.telefono}`:''}</div>
      </div>
      <span class="badge b-am">${COACH_LANG==='en'?'Pending':'Pendiente'}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">
      ${[[tc('Objetivo'),tc(c.objetivo)||c.objetivo],[tc('Nivel'),tc(c.nivel)||c.nivel],[COACH_LANG==='en'?'Weight':'Peso',c.peso_actual?fmtPeso(c.peso_actual):'—'],[COACH_LANG==='en'?'Height':'Altura',c.altura?fmtAltura(c.altura):'—'],[tc('Edad'),c.edad?c.edad+(COACH_LANG==='en'?' y':' años'):'—'],[tc('Sexo'),c.sexo?tc(c.sexo):'—']].map(([l,v])=>`<div style="background:var(--s);border:0.5px solid var(--br);border-radius:8px;padding:7px 9px"><div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;letter-spacing:.06em">${l}</div><div style="font-size:12px;font-weight:600;color:var(--sv2);margin-top:1px">${v}</div></div>`).join('')}
    </div>
    ${c.lesiones?`<div style="background:rgba(239,68,68,.08);border:0.5px solid rgba(239,68,68,.2);border-radius:8px;padding:8px 10px;font-size:12px;color:#fca5a5;margin-bottom:6px">⚠️ <span style="font-weight:700">${tc('Lesiones:')}</span> ${c.lesiones}</div>`:''}
    ${c.dieta_tipo&&c.dieta_tipo!=='Omnivoro'?`<div style="background:rgba(34,197,94,.08);border:0.5px solid rgba(34,197,94,.2);border-radius:8px;padding:8px 10px;font-size:12px;color:var(--gnb);margin-bottom:6px">🥗 <span style="font-weight:700">${tc('Dieta:')}</span> ${tc(c.dieta_tipo)}</div>`:''}
    ${c.alimentos_no?`<div style="background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.2);border-radius:8px;padding:8px 10px;font-size:12px;color:var(--amb);margin-bottom:6px">🚫 <span style="font-weight:700">${tc('No come:')}</span> ${c.alimentos_no}</div>`:''}
    ${c.observaciones?`<div style="background:rgba(245,158,11,.08);border:0.5px solid rgba(245,158,11,.2);border-radius:8px;padding:8px 10px;font-size:12px;color:var(--amb);margin-bottom:10px">📝 <span style="font-weight:700">${COACH_LANG==='en'?'Notes:':'Obs:'}</span> ${c.observaciones}</div>`:''}
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;padding:10px;background:#166534;color:#86efac" onclick="aprobarCliente(${c.id},'${c.nombre}')">✓ ${tc('Aprobar y crear')}</button>
      <button class="btn" style="flex:1;padding:10px;background:rgba(239,68,68,.15);color:#fca5a5;border:0.5px solid rgba(239,68,68,.3)" onclick="rechazarCliente(${c.id},'${c.nombre}')">✕ ${tc('Rechazar')}</button>
    </div>
  </div>`).join('')}</div>`;
}

async function aprobarCliente(userId, nombre){
  await api('/usuarios/'+userId+'/aprobar',{method:'PUT',body:JSON.stringify({})});
  const p=await api('/clientes-pendientes');
  document.getElementById('cContent').innerHTML=hPendientes(p);
  checkPendientes();
  alert('✓ '+nombre+(COACH_LANG==='en'?' approved. They can now access the app.':' aprobado. Ya puede acceder a la app.'));
}

async function rechazarCliente(userId, nombre){
  if(!confirm(tc('¿Rechazar y eliminar la solicitud de')+' '+nombre+'?'))return;
  await api('/usuarios/'+userId+'/rechazar',{method:'PUT',body:JSON.stringify({})});
  const p=await api('/clientes-pendientes');
  document.getElementById('cContent').innerHTML=hPendientes(p);
  checkPendientes();
}

async function checkPendientes(){
  try{
    const p=await api('/clientes-pendientes');
    const badge=document.getElementById('badge_pend');
    if(badge){
      if(p.length>0){badge.textContent=p.length;badge.style.display='inline';}
      else{badge.style.display='none';}
    }
  }catch(e){}
}


async function downloadImages(btn){
  btn.textContent='⏳ Descargando...';btn.disabled=true;
  try{
    const r=await fetch('/api/download-images',{method:'POST',headers:{Authorization:'Bearer '+TOKEN}});
    const d=await r.json();
    const s=await fetch('/api/images-status');
    const sd=await s.json();
    btn.textContent=`✓ ${sd.count} imágenes en BD`;
    btn.style.color='#86efac';
    btn.disabled=false;
  }catch(e){btn.textContent='Error';btn.disabled=false;}
}
// ═══ GESTOR IMÁGENES ══════════════════════════════════
async function abrirGestorImagenes(){
  const panel = document.getElementById('gestor_imagenes');
  if(!panel) return;
  const visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : 'block';
  if(!visible) await filtrarEjerciciosGestor();
}

async function filtrarEjerciciosGestor(){
  const grupo = document.getElementById('edit_ex_grupo_filter')?.value || 'All';
  const buscar = document.getElementById('edit_ex_buscar')?.value || '';
  const p = new URLSearchParams();
  if(grupo !== 'All') p.append('grupo', grupo);
  if(buscar) p.append('buscar', buscar);
  const [exs, configs] = await Promise.all([
    api('/ejercicios-db?' + p),
    api('/ejercicios-config')
  ]);
  const lista = document.getElementById('gestor_lista');
  if(!lista) return;
  if(!exs.length){ lista.innerHTML=`<div style="color:var(--tx3);font-size:13px;padding:12px">${tc('Sin resultados')}</div>`; return; }
  // Update global exConfig so renderExImg picks up fresh data
  window.exConfig = configs;
  lista.innerHTML = exs.map(e => {
    const cfg = configs[e.nombre] || {};
    const imgUrl = cfg.imagen_url || '';
    // If base64, show placeholder text in input instead of the raw data
    const inputVal = imgUrl.startsWith('data:') ? '' : imgUrl;
    const inputPlaceholder = imgUrl.startsWith('data:')
      ? (COACH_LANG==='en' ? '✅ Custom image uploaded' : '✅ Imagen subida')
      : (COACH_LANG==='en' ? 'Image or GIF URL...' : 'URL de imagen o GIF...');
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:0.5px solid var(--br)">
      ${renderExImg(e.nombre, 44, e.grupo)}
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:4px">${e.nombre} <span style="font-size:10px;color:var(--tx3);font-weight:400">${e.grupo}</span></div>
        <div style="display:flex;gap:6px;align-items:center">
          <input id="img_url_${e.id}" value="${inputVal}" placeholder="${inputPlaceholder}" style="flex:1;padding:5px 8px;border:0.5px solid var(--br);border-radius:7px;background:var(--s3);color:${imgUrl.startsWith('data:')?'var(--gnb)':'var(--tx)'};font-size:12px;font-family:'Inter',sans-serif" onkeydown="if(event.key==='Enter')guardarImagenEjercicio('${e.nombre.replace(/'/g,"\\'")}',${e.id})"/>
          <label style="padding:5px 8px;background:var(--s3);color:var(--tx3);border:0.5px solid var(--br);border-radius:7px;font-size:13px;cursor:pointer;flex-shrink:0;display:flex;align-items:center" title="${COACH_LANG==='en'?'Upload image':'Subir imagen'}">📁<input type="file" accept="image/*" style="display:none" onchange="subirImagenEjercicio('${e.nombre.replace(/'/g,"\\'")}',${e.id},this)"/></label>
          <button onclick="guardarImagenEjercicio('${e.nombre.replace(/'/g,"\\'")}',${e.id})" style="padding:5px 10px;background:var(--bl2);color:#fff;border:none;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">${tc('Guardar')}</button>
          <button onclick="borrarEjercicioDb(${e.id},'${e.nombre.replace(/'/g,"\'")}')" style="padding:5px 8px;background:rgba(239,68,68,.12);color:#fca5a5;border:0.5px solid rgba(239,68,68,.25);border-radius:7px;font-size:13px;cursor:pointer;font-family:inherit;flex-shrink:0" title="${COACH_LANG==='en'?'Delete exercise':'Eliminar ejercicio'}">✕</button>
        </div>
      </div>
      ${imgUrl ? `<span style="font-size:16px" title="Imagen guardada">✅</span>` : `<span style="font-size:16px;color:var(--tx3)" title="Sin imagen">○</span>`}
    </div>`;
  }).join('');
}

async function subirImagenEjercicio(nombre, exId, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const max = 600;
      let w = img.width, h = img.height;
      if (w > h) { if (w > max) { h = Math.round(h * max / w); w = max; } }
      else { if (h > max) { w = Math.round(w * max / h); h = max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.82);
      const urlInput = document.getElementById(`img_url_${exId}`);
      if (urlInput) urlInput.value = base64;
      try {
        await api('/ejercicios-config/' + encodeURIComponent(nombre), {
          method: 'PUT',
          body: JSON.stringify({ imagen_url: base64 })
        });
        if (urlInput) {
          urlInput.style.borderColor = '#22c55e';
          // Refresh image cache so it shows everywhere immediately
          if(!window.exImages) window.exImages = {};
          window.exImages[nombre] = base64;
          setTimeout(() => { urlInput.style.borderColor = ''; filtrarEjerciciosGestor(); }, 1500);
        }
      } catch (err) {
        if (urlInput) { urlInput.style.borderColor = '#ef4444'; setTimeout(() => urlInput.style.borderColor = '', 1500); }
        alert(COACH_LANG === 'en' ? 'Error uploading image' : 'Error al subir imagen');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function subirImagenNuevoEjercicio(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max = 600;
      let w = img.width, h = img.height;
      if (w > h) { if (w > max) { h = Math.round(h * max / w); w = max; } }
      else { if (h > max) { w = Math.round(w * max / h); h = max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const inp = document.getElementById('new_ex_imagen');
      if (inp) inp.value = canvas.toDataURL('image/jpeg', 0.82);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function guardarImagenEjercicio(nombre, exId){
  const input = document.getElementById(`img_url_${exId}`);
  if(!input) return;
  const url = input.value.trim();
  try {
    await api('/ejercicios-config/' + encodeURIComponent(nombre), {
      method: 'PUT',
      body: JSON.stringify({ imagen_url: url })
    });
    // Feedback visual
    input.style.borderColor = '#22c55e';
    setTimeout(() => { input.style.borderColor = ''; filtrarEjerciciosGestor(); }, 1500);
  } catch(e) {
    input.style.borderColor = '#ef4444';
    setTimeout(() => input.style.borderColor = '', 1500);
  }
}

async function crearEjercicioManual(){
  const nombre = document.getElementById('new_ex_nombre').value.trim();
  const grupo = document.getElementById('new_ex_grupo').value;
  const musculos = document.getElementById('new_ex_musculos').value.trim();
  const dificultad = document.getElementById('new_ex_dif').value;
  const imagen = document.getElementById('new_ex_imagen').value.trim();
  const msg = document.getElementById('new_ex_msg');
  if(!nombre){ msg.style.color='#f87171'; msg.textContent=COACH_LANG==='en'?'Name is required':'Nombre obligatorio'; return; }
  try {
    // Insertar en ejercicios_db via reload no funciona, usamos un endpoint directo
    const r = await fetch('/api/ejercicios-db-add', {
      method: 'POST',
      headers: {'Content-Type':'application/json', Authorization:'Bearer '+TOKEN},
      body: JSON.stringify({ nombre, grupo, musculos, dificultad, tipo:'Fuerza', equipo:'Barra' })
    });
    if(imagen){
      await api('/ejercicios-config/' + encodeURIComponent(nombre), {
        method: 'PUT',
        body: JSON.stringify({ imagen_url: imagen })
      });
    }
    msg.style.color='#86efac'; msg.textContent=COACH_LANG==='en'?'✓ Created':'✓ Creado';
    document.getElementById('new_ex_nombre').value='';
    document.getElementById('new_ex_musculos').value='';
    document.getElementById('new_ex_imagen').value='';
    await filtrarEjerciciosGestor();
  } catch(e){ msg.style.color='#f87171'; msg.textContent='Error: '+e.message; }
}
async function reloadEjercicios(){
  const btn = event.target;
  btn.textContent = '⏳ Cargando...';
  btn.disabled = true;
  try {
    const r = await fetch('/api/reload-ejercicios', {method:'POST', headers:{'Content-Type':'application/json', ...(TOKEN?{Authorization:'Bearer '+TOKEN}:{})}});
    const data = await r.json();
    if(data.ok){
      btn.textContent = '✓ ' + data.ejercicios + ' ejercicios cargados';
      btn.style.color = '#86efac';
    } else {
      btn.textContent = 'Error: ' + (data.error||'desconocido');
      btn.disabled = false;
    }
  } catch(e) {
    btn.textContent = 'Error de conexión';
    btn.disabled = false;
  }
}


// ═══ GRÁFICAS DE PROGRESO ══════════════════════════════════════
async function cargarGraficasCliente(){
  const wrap = document.getElementById('progreso_graficas_wrap');
  if(!wrap) return;
  try {
    const principales = [];
    (CD.dias||[]).forEach(d=>{
      (d.ejercicios||[]).forEach(e=>{
        if(e.es_principal && !principales.find(p=>p===e.nombre)) principales.push(e.nombre);
      });
    });

    const sesiones = await api('/clientes/'+CD.id+'/sesiones').catch(()=>[]);
    let prsHtml = '';
    let graficasHtml = '';

    if(sesiones.length) {
      const prs = {};
      const historial = {}; // { nombre: [{fecha, peso, reps}] }

      sesiones.forEach(s=>{
        s.series.forEach(sr=>{
          const p = sr.peso_real||0, r = sr.reps_real||0;
          if(!p) return;
          const rm1 = calcular1RM(p, r);
          if(!prs[sr.ejercicio_nombre] || rm1 > prs[sr.ejercicio_nombre].rm1) {
            prs[sr.ejercicio_nombre] = { rm1, peso:p, reps:r, fecha:s.fecha };
          }
          if(!historial[sr.ejercicio_nombre]) historial[sr.ejercicio_nombre] = [];
          historial[sr.ejercicio_nombre].push({ fecha:s.fecha, peso_real:p, reps_real:r, rir:sr.rir });
        });
      });

      // ── PRs ──────────────────────────────────────────────────────
      const prsList = Object.entries(prs)
        .sort((a,b)=>{ const pa=principales.includes(a[0])?1:0, pb=principales.includes(b[0])?1:0; return pb-pa; })
        .slice(0,8);
      if(prsList.length) {
        const locale = LANG==='en'?'en-GB':'es-ES';
        prsHtml = `<div class="sec-lbl" style="margin-top:4px">${t('🏆 Mis marcas personales')}</div>
          <div style="padding:0 14px 8px">
            ${prsList.map(([nom, d])=>{
              const esPrincipal = principales.includes(nom);
              const fechaStr = new Date(d.fecha).toLocaleDateString(locale,{day:'numeric',month:'short',year:'2-digit'});
              return `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:0.5px solid var(--br)">
                <div>
                  <div style="font-size:12px;font-weight:700;color:var(--sv)">${esPrincipal?'⭐ ':''}${nom}</div>
                  <div style="font-size:10px;color:var(--tx3)">${fmtPeso(d.peso)} × ${d.reps} ${t('reps')} · ${fechaStr}</div>
                </div>
                <div style="text-align:right;flex-shrink:0;margin-left:10px">
                  <div style="font-size:16px;font-weight:800;color:var(--gnb)">${fmtPeso(d.rm1)}</div>
                  <div style="font-size:9px;color:var(--tx3)">${t('1RM est.')}</div>
                </div>
              </div>`;
            }).join('')}
          </div>`;
      }

      // ── Gráficas ejercicios principales ──────────────────────────
      const principalesConHistorial = principales.filter(n => historial[n] && historial[n].length >= 2);
      if(principalesConHistorial.length) {
        graficasHtml = `<div class="sec-lbl" style="margin-top:4px">${t('Progreso ejercicios principales')}</div>
          <div style="padding:0 14px 8px">
            ${principalesConHistorial.slice(0,4).map(nom => renderGraficaSVG(nom, historial[nom])).join('')}
          </div>`;
      }
    }

    wrap.innerHTML = prsHtml + graficasHtml;

  } catch(e){ console.log('Error graficas:', e); }
}

function renderGraficaSVG(nombre, data){
  // Group by date - take max peso per session
  const byDate = {};
  data.forEach(d=>{
    const fecha = d.fecha ? d.fecha.split('T')[0] : d.fecha;
    if(!byDate[fecha] || d.peso_real > byDate[fecha].peso) {
      byDate[fecha] = { peso: d.peso_real, reps: d.reps_real, rir: d.rir };
    }
  });
  const puntos = Object.entries(byDate).sort((a,b)=>a[0].localeCompare(b[0]));
  if(puntos.length < 1) return '';

  const W=320, H=120, PAD={t:10,r:10,b:30,l:40};
  const iW=W-PAD.l-PAD.r, iH=H-PAD.t-PAD.b;
  const pesos = puntos.map(p=>p[1].peso);
  const minP = Math.max(0, Math.min(...pesos)*0.9);
  const maxP = Math.max(...pesos)*1.05 || 1;
  const scaleX = i => PAD.l + (puntos.length===1 ? iW/2 : i/(puntos.length-1)*iW);
  const scaleY = v => PAD.t + iH - ((v-minP)/(maxP-minP||1))*iH;

  // Line path
  const linePath = puntos.map((p,i)=>`${i===0?'M':'L'}${scaleX(i).toFixed(1)},${scaleY(p[1].peso).toFixed(1)}`).join(' ');
  // Area path
  const areaPath = linePath + ` L${scaleX(puntos.length-1).toFixed(1)},${(PAD.t+iH).toFixed(1)} L${scaleX(0).toFixed(1)},${(PAD.t+iH).toFixed(1)} Z`;

  // Y axis labels
  const yLabels = [minP, (minP+maxP)/2, maxP].map(v=>`
    <text x="${PAD.l-4}" y="${scaleY(v).toFixed(1)}" fill="#52525b" font-size="9" text-anchor="end" dominant-baseline="middle">${Math.round(v)}</text>
    <line x1="${PAD.l}" y1="${scaleY(v).toFixed(1)}" x2="${W-PAD.r}" y2="${scaleY(v).toFixed(1)}" stroke="#27272a" stroke-width="0.5"/>`).join('');

  // X axis labels (max 4)
  const step = Math.max(1, Math.floor(puntos.length/4));
  const xLabels = puntos.filter((_,i)=>i%step===0||i===puntos.length-1).map((p,_,arr)=>{
    const i = puntos.indexOf(p);
    const d = new Date(p[0]);
    const label = `${d.getDate()}/${d.getMonth()+1}`;
    return `<text x="${scaleX(i).toFixed(1)}" y="${H-6}" fill="#52525b" font-size="9" text-anchor="middle">${label}</text>`;
  }).join('');

  // Dots + tooltips
  const dots = puntos.map((p,i)=>`
    <circle cx="${scaleX(i).toFixed(1)}" cy="${scaleY(p[1].peso).toFixed(1)}" r="3" fill="#3b82f6" stroke="#1e3a5f" stroke-width="1.5"/>
    <title>${p[0]}: ${fmtPeso(p[1].peso)} × ${p[1].reps} reps${p[1].rir!=null?' · RIR '+p[1].rir:''}</title>`).join('');

  // Last value
  const last = puntos[puntos.length-1];
  const prev = puntos.length > 1 ? puntos[puntos.length-2] : null;
  const diff = prev ? (last[1].peso - prev[1].peso) : 0;
  const diffDisp = isImperial() ? diff*2.20462 : diff;
  const diffStr = diff > 0 ? `+${diffDisp.toFixed(1)}${pesoLabel()}` : diff < 0 ? `${diffDisp.toFixed(1)}${pesoLabel()}` : '';
  const diffColor = diff > 0 ? '#86efac' : diff < 0 ? '#fca5a5' : '#a1a1aa';

  return `<div style="background:var(--s);border:0.5px solid var(--br);border-radius:12px;padding:12px;margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
      <div style="font-size:12px;font-weight:700;color:var(--sv)">${nombre}</div>
      <div style="text-align:right">
        <span style="font-size:16px;font-weight:800;color:var(--sv)">${fmtPeso(last[1].peso)}</span>
        ${diffStr?` <span style="font-size:11px;font-weight:600;color:${diffColor}">${diffStr}</span>`:''}
      </div>
    </div>
    <div style="font-size:10px;color:var(--tx3);margin-bottom:8px">${puntos.length} ${LANG==='en'?(puntos.length===1?'session':'sessions'):(puntos.length===1?'sesión':'sesiones')}${last[1].rir!=null?' · RIR '+last[1].rir:''}</div>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;overflow:visible">
      <defs>
        <linearGradient id="grad_${nombre.replace(/\s/g,'_')}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.03"/>
        </linearGradient>
      </defs>
      ${yLabels}
      ${xLabels}
      <path d="${areaPath}" fill="url(#grad_${nombre.replace(/\s/g,'_')})" stroke="none"/>
      <path d="${linePath}" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>
  </div>`;
}

// Coach también puede ver gráficas en verCliente
async function cargarGraficasCoach(clienteId, ejerciciosPrincipales){
  const wrap = document.getElementById('graficas_coach_wrap');
  if(!wrap||!ejerciciosPrincipales.length) return;
  wrap.innerHTML = '';
  for(const ejercicio of ejerciciosPrincipales){
    const data = await api('/clientes/'+clienteId+'/progreso-ejercicio?ejercicio='+encodeURIComponent(ejercicio));
    if(!data.length) continue;
    wrap.innerHTML += renderGraficaSVG(ejercicio, data);
  }
}

// Reposition keyboard when Safari URL bar shows/hides
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',()=>{
    const kb=document.getElementById('strong_keyboard');
    if(!kb||kb.style.display==='none')return;
    const bnav=document.querySelector('#sCliente .bnav-bar');
    const bnavH=bnav?bnav.offsetHeight:60;
    const urlBarH=Math.max(0,window.innerHeight-window.visualViewport.height);
    kb.style.bottom=(bnavH+urlBarH)+'px';
  });
}

// ═══ SONIDOS ══════════════════════════════════════════
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let _actx = null;
function getACtx(){ if(!_actx) _actx = new AudioCtx(); return _actx; }

// ═══ VIBRACIÓN ════════════════════════════════════
function vibrate(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} }
function vibratePattern(pattern){ try{ if(navigator.vibrate) navigator.vibrate(pattern); }catch(e){} }

function soundDing(){ // Serie completada — ding suave
  try{
    const ctx=getACtx();
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type='sine'; o.frequency.setValueAtTime(880,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1100,ctx.currentTime+0.06);
    g.gain.setValueAtTime(0.4,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);
    o.start(ctx.currentTime); o.stop(ctx.currentTime+0.3);
  }catch(e){}
}

function soundComplete(){ // Entreno completado — fanfare épico
  try{
    const ctx=getACtx();
    // Fanfare: acorde ascendente tipo victoria
    const notes = [
      {freq:523, t:0,    dur:0.15},  // C5
      {freq:659, t:0.15, dur:0.15},  // E5
      {freq:784, t:0.30, dur:0.15},  // G5
      {freq:1047,t:0.45, dur:0.40},  // C6 largo
      {freq:784, t:0.50, dur:0.30},  // G5 acorde
      {freq:659, t:0.55, dur:0.25},  // E5 acorde
    ];
    notes.forEach(n=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='triangle';
      o.frequency.setValueAtTime(n.freq, ctx.currentTime+n.t);
      g.gain.setValueAtTime(0, ctx.currentTime+n.t);
      g.gain.linearRampToValueAtTime(0.35, ctx.currentTime+n.t+0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+n.t+n.dur);
      o.start(ctx.currentTime+n.t);
      o.stop(ctx.currentTime+n.t+n.dur+0.05);
    });
    // Vibración larga de celebración
    vibratePattern([200,100,200,100,400]);
  }catch(e){}
}

function soundBell(){ // Descanso terminado — campanita tabata
  try{
    const ctx=getACtx();
    [0, 0.18, 0.36].forEach((t,i)=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='sine';
      o.frequency.setValueAtTime(i===2?1318:1046,ctx.currentTime+t);
      g.gain.setValueAtTime(0,ctx.currentTime+t);
      g.gain.linearRampToValueAtTime(0.5,ctx.currentTime+t+0.01);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t+0.5);
      o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+0.5);
    });
  }catch(e){}
}

function iniciarEntreno(){
  workoutStartTime = Date.now();
  soundDing();
  if(workoutTimerInt) clearInterval(workoutTimerInt);
  workoutTimerInt = setInterval(()=>{
    const el = document.getElementById('workout_timer');
    if(!el){ clearInterval(workoutTimerInt); return; }
    const secs = Math.floor((Date.now()-workoutStartTime)/1000);
    const m = Math.floor(secs/60), s = secs%60;
    el.textContent = String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }, 1000);
  // Re-render hero to show timer
  const hero = document.querySelector('.hero-day');
  if(hero){
    const timerDiv = hero.querySelector('[onclick="iniciarEntreno()"]')?.parentElement;
    if(timerDiv) timerDiv.innerHTML =
      '<div id="workout_timer" style="font-family:Bebas Neue,sans-serif;font-size:22px;color:var(--gnb);letter-spacing:.08em">00:00</div>'+
      '<div style="font-size:9px;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em">En curso</div>';
  }
}

function getWorkoutDuration(){
  if(!workoutStartTime) return 0;
  return Math.round((Date.now()-workoutStartTime)/60000);
}

function rbEditEx(exId){
  // Load exercise data and open edit panel
  api('/ejercicios/'+exId).then(e=>{
    const panel = document.getElementById('rb_add_panel');
    const title = document.getElementById('rb_add_title');
    if(!panel||!title) return;
    title.textContent = e.nombre + ' — editando';
    document.getElementById('rb_add_nombre').value = e.nombre;
    document.getElementById('rb_add_musculos').value = e.musculos||'';
    document.getElementById('rb_add_series').value = e.series||3;
    document.getElementById('rb_add_reps').value = e.reps||'10-12';
    document.getElementById('rb_add_peso').value = e.peso_objetivo||0;
    document.getElementById('rb_add_descanso').value = e.descanso||90;
    const rirActivo = e.rir != null;
    document.getElementById('rb_add_rir_on').checked = rirActivo;
    document.getElementById('rb_rir_val_wrap').style.display = rirActivo ? 'block' : 'none';
    document.getElementById('rb_add_rir').value = e.rir!=null?e.rir:2;
    document.getElementById('rb_add_principal').checked = !!e.es_principal;
    document.getElementById('rb_add_yt').value = e.youtube_url||'';
    document.getElementById('rb_add_nota').value = e.nota_coach||'';
    // Switch button to update mode
    const btn = document.getElementById('rb_add_btn');
    btn.innerHTML = '✓ Guardar cambios';
    btn.onclick = ()=> rbConfirmEdit(exId);
    panel.style.display = 'flex';
  }).catch(()=>{
    // Fallback: just open panel with name prefilled
    rbAddEx(nombre,'');
  });
}

async function cargarGraficasCoach2(clienteId, ejerciciosPrincipales){
  // Temporalmente swap del wrap para reusar la misma lógica
  const wrap1 = document.getElementById('graficas_coach_wrap');
  const wrap2 = document.getElementById('graficas_coach_wrap2');
  if(!wrap2) return;
  // Insertar wrap2 como graficas_coach_wrap temporalmente
  if(wrap2) wrap2.id = 'graficas_coach_wrap';
  await cargarGraficasCoach(clienteId, ejerciciosPrincipales);
  if(wrap2) wrap2.id = 'graficas_coach_wrap2';
}


async function rbConfirmEdit(exId){
  const btn = document.getElementById('rb_add_btn');
  btn.innerHTML = '⏳ Guardando...'; btn.disabled = true;
  try{
    await api('/ejercicios/'+exId,{method:'PUT',body:JSON.stringify({
      series: parseInt(document.getElementById('rb_add_series').value)||3,
      reps: document.getElementById('rb_add_reps').value||'10-12',
      peso_objetivo: parseFloat(document.getElementById('rb_add_peso').value)||0,
      descanso: parseInt(document.getElementById('rb_add_descanso').value)||90,
      rir: document.getElementById('rb_add_rir_on').checked ? (parseInt(document.getElementById('rb_add_rir').value)||2) : null,
      es_principal: document.getElementById('rb_add_principal').checked?1:0,
      youtube_url: document.getElementById('rb_add_yt').value||'',
      nota_coach: document.getElementById('rb_add_nota').value||''
    })});
    btn.innerHTML = '✓ Añadir ejercicio';
    btn.onclick = rbConfirmAdd;
    btn.disabled = false;
    document.getElementById('rb_add_panel').style.display='none';
    await rbLoadDias();
  }catch(e){
    btn.innerHTML = 'Error - reintentar'; btn.disabled = false;
  }
}


// ═══ REVISIÓN SEMANAL ═══════════════════════════════════════════
// Volumen semanal recomendado por grupo muscular y nivel
const VOL_RECOMENDADO = {
  Principiante: { min:10, max:12, desc: COACH_LANG==='en'?'10-12 sets/week/group':'10-12 series/semana/grupo' },
  Intermedio:   { min:14, max:16, desc: COACH_LANG==='en'?'14-16 sets/week/group':'14-16 series/semana/grupo' },
  Avanzado:     { min:16, max:20, desc: COACH_LANG==='en'?'16-20+ sets/week/group':'16-20+ series/semana/grupo' },
};

// Calcula progresión sugerida basada en RIR real vs objetivo
function calcularProgresion(pesoActual, repsReales, rirReal, rirObjetivo, nivel) {
  const diff = rirReal - rirObjetivo; // positivo = le sobró margen → subir
  let nuevoPeso = pesoActual;
  let nota = '';
  
  if (diff >= 2) {
    // Sobró mucho margen — subir 5% o 2.5kg mínimo
    const subida = nivel === 'Avanzado' ? 0.025 : 0.05;
    nuevoPeso = Math.round((pesoActual * (1 + subida)) / 2.5) * 2.5;
    nota = `RIR ${rirReal} (obj ${rirObjetivo}) → +${(nuevoPeso-pesoActual).toFixed(1)}kg`;
  } else if (diff === 1) {
    // Pequeño margen — subir 2.5kg
    nuevoPeso = pesoActual + 2.5;
    nota = `RIR ${rirReal} (obj ${rirObjetivo}) → +2.5kg`;
  } else if (diff === 0) {
    // En el objetivo — mantener
    nota = `RIR ${rirReal} ✓ ${COACH_LANG==='en'?'keep weight':'mantener peso'}`;
  } else if (diff === -1) {
    // Justo al límite — mantener o bajar 2.5
    nota = `RIR ${rirReal} (obj ${rirObjetivo}) → ${COACH_LANG==='en'?'keep or -2.5kg':'mantener o -2.5kg'}`;
  } else {
    // No llegó al objetivo — bajar carga
    nuevoPeso = Math.max(0, pesoActual - 2.5);
    nota = `RIR ${rirReal} (obj ${rirObjetivo}) → -2.5kg`;
  }
  
  return { nuevoPeso, nota, subida: nuevoPeso > pesoActual, bajada: nuevoPeso < pesoActual };
}

async function cargarRevisionSemanal(clienteId, clienteData) {
  const wrap = document.getElementById('revision_semanal_content');
  const estado = document.getElementById('rev_estado');
  if (!wrap) return;

  try {
    const sesiones = await api('/clientes/' + clienteId + '/sesiones');
    
    if (!sesiones.length) {
      wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3);padding:4px 0">${COACH_LANG==='en'?'No sessions yet. Once the client completes workouts, the review will appear here.':'Sin sesiones registradas aún. Cuando el cliente complete entrenamientos aparecerá aquí la revisión.'}</div>`;
      return;
    }

    // Get the most recent session per day
    const porDia = {};
    sesiones.forEach(s => {
      const dia = s.dia_nombre;
      if (!porDia[dia] || new Date(s.fecha) > new Date(porDia[dia].fecha)) {
        porDia[dia] = s;
      }
    });

    // Build revision data: for each ejercicio in client's plan, find last performance
    const ejerciciosPlan = {};
    (clienteData.dias || []).forEach(d => {
      (d.ejercicios || []).forEach(e => {
        ejerciciosPlan[e.nombre] = { ...e, dia: d.nombre };
      });
    });

    // Map last performance per ejercicio
    const ultimoRendimiento = {};
    sesiones.forEach(s => {
      s.series.forEach(sr => {
        if (!ultimoRendimiento[sr.ejercicio_nombre] ||
            new Date(s.fecha) > new Date(ultimoRendimiento[sr.ejercicio_nombre].fecha)) {
          ultimoRendimiento[sr.ejercicio_nombre] = {
            ...sr,
            fecha: s.fecha,
            dia: s.dia_nombre
          };
        }
      });
    });

    // Volume analysis per muscle group
    const volPorGrupo = {};
    sesiones.filter(s => {
      const d = new Date(s.fecha);
      const semAgo = Date.now() - 7*24*60*60*1000;
      return d.getTime() > semAgo;
    }).forEach(s => {
      s.series.forEach(sr => {
        const ex = ejerciciosPlan[sr.ejercicio_nombre];
        if (!ex) return;
        const grupo = (ex.musculos || '').split(',')[0].trim() || 'Otros';
        if (!volPorGrupo[grupo]) volPorGrupo[grupo] = 0;
        volPorGrupo[grupo]++;
      });
    });

    const nivel = clienteData.nivel || 'Intermedio';
    const volRec = VOL_RECOMENDADO[nivel] || VOL_RECOMENDADO.Intermedio;

    // Build the UI
    let cambiosPendientes = {}; // ejercicio -> nuevoPeso

    const diasConEjercicios = (clienteData.dias || []).filter(d => d.ejercicios.length > 0);
    
    if (!diasConEjercicios.length) {
      wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3)">${COACH_LANG==='en'?'No routine assigned.':'Sin rutina asignada.'}</div>`;
      return;
    }

    // Count total pending adjustments
    let totalAjustes = 0;
    diasConEjercicios.forEach(d => {
      d.ejercicios.forEach(e => {
        const ult = ultimoRendimiento[e.nombre];
        if (ult && ult.rir != null) {
          const prog = calcularProgresion(e.peso_objetivo || 0, ult.reps_real, ult.rir, e.rir || 2, nivel);
          if (prog.subida || prog.bajada) totalAjustes++;
        }
      });
    });

    if (estado) estado.textContent = totalAjustes > 0 ? `· ${totalAjustes} ajuste${totalAjustes > 1 ? 's' : ''} ${COACH_LANG==='en'?'adjustment':'ajuste'}${totalAjustes > 1 ? 's' : ''} ${COACH_LANG==='en'?'suggested':'sugerido'}${totalAjustes > 1 ? 's' : ''}` : (COACH_LANG==='en'?'· Up to date':'· Al día');

    // Volume warning
    let volWarnings = '';
    Object.entries(volPorGrupo).forEach(([grupo, series]) => {
      if (series < volRec.min) {
        volWarnings += `<span style="background:rgba(245,158,11,.1);border:0.5px solid rgba(245,158,11,.2);border-radius:6px;padding:2px 8px;font-size:11px;color:var(--amb);margin-right:5px;margin-bottom:4px;display:inline-block">${grupo}: ${series} ${COACH_LANG==='en'?'sets':'series'} (min ${volRec.min})</span>`;
      } else if (series > volRec.max) {
        volWarnings += `<span style="background:rgba(239,68,68,.08);border:0.5px solid rgba(239,68,68,.2);border-radius:6px;padding:2px 8px;font-size:11px;color:#fca5a5;margin-right:5px;margin-bottom:4px;display:inline-block">${grupo}: ${series} ${COACH_LANG==='en'?'sets':'series'} (max ${volRec.max})</span>`;
      }
    });

    let html = '';

    // Volume summary
    html += `<div style="margin-bottom:14px">
      <div style="font-size:11px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">${COACH_LANG==='en'?'Volume this week':'Volumen esta semana'} · ${tc(nivel)} (${volRec.desc})</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px">`;
    
    Object.entries(volPorGrupo).forEach(([grupo, series]) => {
      const ok = series >= volRec.min && series <= volRec.max;
      const low = series < volRec.min;
      html += `<span style="background:${ok?'rgba(34,197,94,.1)':low?'rgba(245,158,11,.1)':'rgba(239,68,68,.08)'};border:0.5px solid ${ok?'rgba(34,197,94,.2)':low?'rgba(245,158,11,.2)':'rgba(239,68,68,.2)'};border-radius:6px;padding:3px 9px;font-size:11px;color:${ok?'var(--gnb)':low?'var(--amb)':'#fca5a5'};font-weight:600">${grupo} ${series}s</span>`;
    });
    
    if (!Object.keys(volPorGrupo).length) {
      html += `<span style="font-size:12px;color:var(--tx3)">${COACH_LANG==='en'?'No data this week':'Sin datos de esta semana'}</span>`;
    }
    
    html += `</div></div>`;

    // Per-exercise progression
    html += `<div style="font-size:11px;color:var(--blg);font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">${COACH_LANG==='en'?'Load progression':'Progresión de carga'}</div>`;

    diasConEjercicios.forEach(d => {
      html += `<div style="margin-bottom:14px">
        <div style="font-size:12px;font-weight:700;color:var(--sv2);margin-bottom:8px;padding-bottom:4px;border-bottom:0.5px solid var(--br)">${d.nombre} — ${d.grupo}</div>`;

      d.ejercicios.forEach(e => {
        const ult = ultimoRendimiento[e.nombre];
        const pesoObj = e.peso_objetivo || 0;
        
        let progRow = '';
        let nuevoPeso = pesoObj;
        let notaProg = '';
        let colorProg = 'var(--tx3)';
        let iconProg = '—';

        if (ult && ult.rir != null) {
          const prog = calcularProgresion(pesoObj, ult.reps_real, ult.rir, e.rir || 2, nivel);
          nuevoPeso = prog.nuevoPeso;
          notaProg = prog.nota;
          colorProg = prog.subida ? 'var(--gnb)' : prog.bajada ? '#fca5a5' : 'var(--sv3)';
          iconProg = prog.subida ? '↑' : prog.bajada ? '↓' : '=';
        }

        const exId = e.id;
        const inputId = `rev_peso_${exId}`;

        html += `<div style="padding:10px 0;border-bottom:0.5px solid rgba(39,39,42,.4)">
          <!-- Header -->
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:700;color:var(--sv);margin-bottom:2px">${e.nombre}</div>
              ${ult ? `<div style="font-size:11px;color:var(--sv3)">${COACH_LANG==='en'?'Last':'Último'}: ${ult.peso_real}kg×${ult.reps_real}${ult.rir != null ? ' · RIR '+ult.rir : ''}</div>` : '<div style="font-size:11px;color:var(--tx3)">Sin datos aún</div>'}
              ${notaProg ? `<div style="font-size:11px;color:${colorProg};font-weight:600;margin-top:1px">${iconProg} ${notaProg}</div>` : ''}
            </div>
          </div>
          <!-- Serie-by-serie table -->
          <div style="margin-bottom:6px">
            <div style="display:grid;grid-template-columns:28px 1fr 1fr 1fr;gap:4px;padding:4px 0;border-bottom:0.5px solid var(--br);margin-bottom:4px">
              <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;text-align:center">#</div>
              <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;text-align:center">Reps</div>
              <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;text-align:center">Kg obj</div>
              <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;text-align:center">Anterior</div>
            </div>
            ${Array.from({length: e.series}, (_,si) => {
              const ultSerie = ult ? si === e.series-1 ? ult : null : null;
              const pesoSerie = nuevoPeso;
              const repsSerie = e.reps;
              return `<div style="display:grid;grid-template-columns:28px 1fr 1fr 1fr;gap:4px;margin-bottom:4px;align-items:center">
                <div style="font-size:12px;font-weight:700;color:var(--sv3);text-align:center">${si+1}</div>
                <input id="rev_reps_${exId}_${si}" type="number" min="1" max="50" value="${parseFirstNum(repsSerie)||10}"
                  style="padding:6px 4px;border:0.5px solid var(--br);border-radius:8px;background:var(--s2);color:var(--sv);font-size:13px;font-weight:700;text-align:center;font-family:inherit;width:100%"/>
                <div style="display:flex;align-items:center;gap:2px">
                  <button onclick="revAjustarPeso('rev_kg_${exId}_${si}', -2.5)" style="width:20px;height:30px;border-radius:5px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);cursor:pointer;font-size:13px;font-weight:700;flex-shrink:0;padding:0">−</button>
                  <input id="rev_kg_${exId}_${si}" type="number" value="${pesoSerie}" step="2.5" min="0"
                    style="flex:1;min-width:0;padding:6px 2px;border:0.5px solid var(--br);border-radius:8px;background:var(--s2);color:var(--sv);font-size:13px;font-weight:700;text-align:center;font-family:inherit"/>
                  <button onclick="revAjustarPeso('rev_kg_${exId}_${si}', 2.5)" style="width:20px;height:30px;border-radius:5px;border:0.5px solid var(--br);background:var(--s2);color:var(--sv2);cursor:pointer;font-size:13px;font-weight:700;flex-shrink:0;padding:0">+</button>
                </div>
                <div style="font-size:11px;color:var(--tx3);text-align:center">${ult && si===e.series-1 ? fmtPeso(ult.peso_real) : '—'}</div>
              </div>`;
            }).join('')}
          </div>
          <input type="hidden" id="rev_series_${exId}" value="${e.series}"/>
          <!-- Nota coach -->
          <div>
            <div style="font-size:9px;color:var(--tx3);font-weight:700;text-transform:uppercase;margin-bottom:3px">Nota para el cliente</div>
            <input id="rev_nota_${exId}" type="text" value="${e.nota_coach||''}" placeholder="Ej: última serie al fallo, controla la bajada..."
              style="width:100%;padding:7px 10px;border:0.5px solid var(--br);border-radius:8px;background:var(--s2);color:var(--sv);font-size:12px;font-family:inherit"/>
          </div>
        </div>`;
      });

      html += `</div>`;
    });

    // Action buttons
    html += `<div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn" style="flex:1;padding:11px;background:var(--s2);border:0.5px solid var(--br);color:var(--sv2)" onclick="guardarBorrador(${clienteId})">${COACH_LANG==='en'?'💾 Save draft':'💾 Guardar borrador'}</button>
      <button class="btn" style="flex:1;padding:11px;background:var(--gn)" onclick="publicarSemana(${clienteId})">${COACH_LANG==='en'?'✓ Publish week':'✓ Publicar semana'}</button>
    </div>
    <button style="width:100%;margin-top:8px;padding:11px;background:rgba(245,158,11,.12);border:0.5px solid rgba(245,158,11,.3);border-radius:10px;color:var(--amb);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit" onclick="aplicarTodosAjustes(${clienteId})">⚡ Aplicar todos los ajustes sugeridos</button>
    <div style="margin-top:6px;font-size:11px;color:var(--tx3);text-align:center">El cliente no verá los cambios hasta que pulses "Publicar semana"</div>
    <div style="margin-top:10px">
      <button style="width:100%;padding:9px;background:rgba(37,99,235,.08);border:0.5px solid rgba(59,130,246,.2);border-radius:10px;color:var(--blg);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit" onclick="sugerirProgresionIA(${clienteId})">🤖 Sugerir progresión con IA</button>
      <div id="ia_progresion_result" style="margin-top:8px"></div>
    </div>`;

    wrap.innerHTML = html;

  } catch(err) {
    console.log('Error revision semanal:', err);
    wrap.innerHTML = `<div style="font-size:13px;color:var(--tx3)">${tc('Error cargando revisión.')}</div>`;
  }
}

function revAjustarPeso(inputId, delta) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const val = parseFloat(input.value) || 0;
  input.value = Math.max(0, val + delta);
  input.dispatchEvent(new Event('change'));
}

function revMarcarCambio(inputId, pesoOriginal) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const nuevo = parseFloat(input.value) || 0;
  const changed = nuevo !== pesoOriginal;
  input.style.borderColor = changed ? 'var(--bl)' : 'var(--br)';
  input.style.background = changed ? 'rgba(37,99,235,.1)' : 'var(--s2)';
  input.style.color = changed ? 'var(--blg)' : 'var(--sv)';
}

function recogerCambiosRevision(){
  const ejercicios = [];
  document.querySelectorAll('[id^="rev_series_"]').forEach(input => {
    const exId = input.id.replace('rev_series_', '');
    const series = parseInt(input.value) || 3;
    // Collect per-serie kg and reps
    const serieData = [];
    for(let si=0; si<series; si++){
      const kg = parseFloat(document.getElementById(`rev_kg_${exId}_${si}`)?.value) || 0;
      const reps = document.getElementById(`rev_reps_${exId}_${si}`)?.value || '10-12';
      serieData.push({kg, reps});
    }
    // Use first serie as peso_objetivo, join reps as string
    const pesoObj = serieData[0]?.kg || 0;
    const repsStr = [...new Set(serieData.map(s=>s.reps))].join('/');
    ejercicios.push({
      ejercicio_id: parseInt(exId),
      peso_objetivo: pesoObj,
      series,
      reps: repsStr,
      nota_coach: document.getElementById('rev_nota_'+exId)?.value || '',
      descanso: 90,
      series_data: serieData // full per-serie data for future use
    });
  });
  return ejercicios;
}

async function guardarBorrador(clienteId) {
  const btn = event.target;
  btn.textContent = '⏳ Guardando...'; btn.disabled = true;
  try {
    const ejercicios = recogerCambiosRevision();
    await api('/clientes/'+clienteId+'/borrador', {
      method: 'POST',
      body: JSON.stringify({ ejercicios })
    });
    btn.textContent = '💾 Borrador guardado';
    btn.style.background = 'var(--bl2)'; btn.style.color = '#fff';
    setTimeout(()=>{ btn.textContent='💾 Guardar borrador'; btn.style.background='var(--s2)'; btn.style.color='var(--sv2)'; btn.disabled=false; }, 2500);
    // Show pending banner
    const estado = document.getElementById('rev_estado');
    if(estado) estado.textContent = '· Borrador pendiente de publicar';
  } catch(e) { btn.textContent='Error'; btn.disabled=false; }
}

async function publicarSemana(clienteId) {
  const btn = event.target;
  if(!confirm(COACH_LANG==='en'?'Publish changes? The client will see the new routine immediately.':'¿Publicar los cambios? El cliente verá la nueva rutina inmediatamente.')) return;
  btn.textContent = '⏳ Publicando...'; btn.disabled = true;
  try {
    // First save current state as borrador, then publish
    const ejercicios = recogerCambiosRevision();
    await api('/clientes/'+clienteId+'/borrador', {
      method: 'POST',
      body: JSON.stringify({ ejercicios })
    });
    const result = await api('/clientes/'+clienteId+'/borrador/publicar', { method: 'POST' });
    btn.textContent = '✓ Publicado';
    btn.style.background = '#166534'; btn.style.color = '#86efac';
    const estado = document.getElementById('rev_estado');
    if(estado) estado.textContent = `· Publicado (${result.publicados} ejercicios actualizados)`;
    setTimeout(()=>{ btn.textContent='✓ Publicar semana'; btn.style.background='var(--gn)'; btn.style.color='#fff'; btn.disabled=false; }, 3000);
  } catch(e) { btn.textContent='Error'; btn.disabled=false; }
}

async function sugerirProgresionIA(clienteId) {
  const res = document.getElementById('ia_progresion_result');
  res.innerHTML = '<div class="ia-chip" style="padding:8px 12px"><div class="ia-chip-title">Analizando progreso...</div></div>';
  
  try {
    const [cliente, sesiones] = await Promise.all([
      api('/clientes/' + clienteId),
      api('/clientes/' + clienteId + '/sesiones')
    ]);
    
    const nivel = cliente.nivel;
    const volRec = VOL_RECOMENDADO[nivel] || VOL_RECOMENDADO.Intermedio;
    
    // Summarize last 4 sessions
    const resumenSesiones = sesiones.slice(0, 4).map(s => {
      const series = s.series.map(sr => `${sr.ejercicio_nombre}: ${sr.peso_real}kg×${sr.reps_real}${sr.rir != null ? ' RIR'+sr.rir : ''}`).join(', ');
      return `${s.dia_nombre} (${new Date(s.fecha).toLocaleDateString(LANG==='en'?'en-GB':'es-ES')}): ${series}`;
    }).join('\n');

    const ejerciciosPlan = (cliente.dias || []).flatMap(d =>
      d.ejercicios.map(e => `${e.nombre}: obj ${e.peso_objetivo}kg × ${e.reps}, RIR obj ${e.rir || 2}${e.es_principal ? ' [PRINCIPAL]' : ''}`)
    ).join('\n');

    const semanas = cliente.semanas || 1;
    const fase = semanas % 4 === 0 ? 'DESCARGA (semana 4 del mesociclo)' : `CARGA (semana ${semanas % 4 || 4} de 4)`;

    const prompt = `Analiza el progreso de este cliente y sugiere ajustes concretos para la próxima semana.

CLIENTE: ${cliente.nombre}
Nivel: ${nivel} | Objetivo: ${cliente.objetivo} | Semana ${semanas} | Fase: ${fase}
Volumen recomendado: ${volRec.desc}

RUTINA ACTUAL:
${ejerciciosPlan}

ÚLTIMAS SESIONES:
${resumenSesiones}

${COACH_LANG==='en'?'Respond in English, max 150 words.':'Responde en español, máximo 150 palabras.'} Sé directo y específico. Indica:
1. Qué ejercicios subir de carga y cuánto
2. Si hay que ajustar volumen (series/semana)
3. Si toca descarga o progresión
4. Alguna observación sobre el RIR del cliente`;

    const d = await api('/ia/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        system: COACH_LANG==='en'?'You are an expert coach in periodization and strength progression. Analyze real training data and give concrete practical recommendations. Always in English.':'Eres un coach experto en periodización y progresión de fuerza. Analizas datos reales de entreno y das recomendaciones concretas y prácticas. Responde en español.'
      })
    });

    res.innerHTML = `<div class="ia-chip"><div class="ia-chip-title">🤖 Sugerencia IA para próxima semana</div><div class="ia-result-body" style="white-space:pre-line">${d.reply}</div></div>`;

  } catch(e) {
    res.innerHTML = '<div style="font-size:12px;color:#f87171">Error. Verifica la API key.</div>';
  }
}


// ═══ DESCRIPCIONES DE EJERCICIOS EN ESPAÑOL ═══════════════════
const EX_DESCRIPCIONES = {
  // PECHO
  'Bench Press (Barbell)': ['Túmbate en el banco plano con los pies apoyados en el suelo.','Agarra la barra con las manos algo más separadas que los hombros, agarre prono.','Baja la barra de forma controlada hasta el pecho medio, codos a 45-75°.','Empuja la barra hacia arriba expulsando el aire hasta extender los brazos.','Mantén las escápulas retraídas y los glúteos apoyados en el banco durante todo el movimiento.'],
  'Bench Press (Dumbbell)': ['Túmbate en el banco plano con una mancuerna en cada mano sobre los muslos.','Lleva las mancuernas a la altura del pecho con los codos a 45-75°.','Empuja las mancuernas hacia arriba hasta casi juntar las manos arriba.','Baja de forma controlada sintiendo el estiramiento del pectoral.','Mantén las escápulas apretadas durante todo el movimiento.'],
  'Incline Bench Press (Barbell)': ['Ajusta el banco a 30-45° de inclinación.','Agarra la barra con las manos algo más separadas que los hombros.','Baja la barra de forma controlada hasta la parte superior del pecho.','Empuja hacia arriba y ligeramente hacia atrás siguiendo un arco natural.','Mantén los pies en el suelo y las escápulas retraídas.'],
  'Incline Bench Press (Dumbbell)': ['Ajusta el banco a 30-45° y siéntate con una mancuerna en cada muslo.','Lleva las mancuernas al pecho superior con los codos abiertos.','Empuja hacia arriba hasta casi juntar las mancuernas.','Baja de forma lenta y controlada sintiendo el estiramiento.','Enfoca la contracción en la parte superior del pectoral.'],
  'Decline Bench Press (Barbell)': ['Ajusta el banco en declive y asegura los pies.','Agarra la barra con agarre prono ligeramente más ancho que los hombros.','Baja la barra hasta la parte baja del pecho de forma controlada.','Empuja con fuerza hasta extender los brazos sin bloquear los codos.','Mantén la tensión en el pectoral durante todo el recorrido.'],
  'Chest Fly (Dumbbell)': ['Túmbate en banco plano con mancuernas arriba, palmas enfrentadas, codos ligeramente flexionados.','Abre los brazos en arco hacia los lados bajando hasta sentir estiramiento en el pecho.','Junta las mancuernas arriba apretando el pecho en la parte superior.','Mantén la ligera flexión de codo durante todo el movimiento.','Evita bajar demasiado para proteger el hombro.'],
  'Cable Crossover': ['Coloca los poleas en posición alta y sujeta un cable en cada mano.','Da un paso adelante para tensar los cables.','Con codos ligeramente flexionados, cruza las manos hacia el centro y abajo.','Aprieta el pecho en la posición final durante 1 segundo.','Vuelve de forma controlada sin dejar que los cables te abran en exceso.'],
  'Pec Deck Fly': ['Ajusta el asiento para que los codos queden a la altura de los hombros.','Coloca los antebrazos en las almohadillas con los codos doblados a 90°.','Junta los brazos al frente apretando el pecho en el centro.','Vuelve lentamente a la posición inicial sin soltar la tensión.','Mantén la espalda apoyada en el respaldo durante todo el movimiento.'],
  'Cable Fly (High to Low)': ['Coloca las poleas en posición alta.','Sujeta un cable en cada mano y da un paso adelante.','Con codos ligeramente flexionados, lleva las manos hacia abajo y al centro.','Aprieta el pecho en la posición final.','Vuelve lentamente a la posición inicial.'],
  'Cable Fly (Low to High)': ['Coloca las poleas en posición baja.','Sujeta un cable en cada mano y da un paso adelante.','Lleva las manos hacia arriba y al centro como si abrazaras un árbol.','Aprieta el pecho en la posición superior.','Vuelve lentamente a la posición inicial.'],
  'Chest Press (Machine)': ['Ajusta el asiento para que las agarraderas queden a la altura del pecho.','Agarra las manillas con agarre neutro o prono según la máquina.','Empuja hacia adelante hasta casi extender los brazos.','Vuelve de forma controlada sin dejar que el peso descanse.','Mantén la espalda apoyada en el respaldo durante todo el movimiento.'],
  'Chest Dip': ['Agárrate a las barras paralelas con las manos separadas al ancho de los hombros.','Inclina el torso hacia adelante para enfocar el trabajo en el pecho.','Baja doblando los codos hasta que los hombros queden por debajo de los codos.','Empuja hacia arriba hasta casi extender los brazos.','Mantén el control durante el descenso para proteger los hombros.'],
  'Pull Over (Dumbbell)': ['Túmbate transversalmente en un banco o longitudinalmente con los hombros apoyados.','Sujeta una mancuerna con ambas manos por encima del pecho con los brazos extendidos.','Baja la mancuerna por detrás de la cabeza en arco sintiendo el estiramiento.','Vuelve a la posición inicial apretando pecho y dorsal.','Mantén una ligera flexión de codo durante todo el movimiento.'],
  // ESPALDA
  'Deadlift (Barbell)': ['Coloca los pies bajo la barra, separados al ancho de las caderas.','Agarra la barra con las manos al ancho de los hombros, agarre prono o mixto.','Con la espalda recta y pecho alto, empuja el suelo con los pies para levantar.','Extiende caderas y rodillas al mismo tiempo manteniendo la barra pegada al cuerpo.','Baja de forma controlada invirtiendo el movimiento, caderas atrás primero.'],
  'Romanian Deadlift (Barbell)': ['Sujeta la barra a la altura de las caderas con agarre prono.','Con rodillas ligeramente flexionadas, empuja las caderas hacia atrás bajando la barra por las piernas.','Baja hasta sentir el estiramiento en los isquiotibiales, espalda recta.','Aprieta los glúteos y lleva las caderas al frente para volver arriba.','Mantén la barra cerca del cuerpo durante todo el movimiento.'],
  'Romanian Deadlift (Dumbbell)': ['Sujeta una mancuerna en cada mano frente a los muslos.','Con rodillas ligeramente flexionadas, empuja las caderas hacia atrás bajando las mancuernas.','Baja hasta sentir estiramiento en los isquiotibiales manteniendo la espalda recta.','Lleva las caderas al frente apretando glúteos para volver a la posición inicial.','Mantén las mancuernas cerca de las piernas durante todo el movimiento.'],
  'Pull Up (Overhand)': ['Agárrate a la barra con agarre prono, manos algo más separadas que los hombros.','Con los brazos extendidos, retrae las escápulas como primer movimiento.','Tira con los codos hacia abajo y los lados subiendo hasta que la barbilla supere la barra.','Baja de forma lenta y controlada hasta extender completamente los brazos.','Evita el balanceo del cuerpo durante el movimiento.'],
  'Pull Up (Underhand)': ['Agárrate a la barra con agarre supino, manos al ancho de los hombros.','Retrae las escápulas como primer movimiento.','Tira con los codos hacia las caderas subiendo hasta que la barbilla supere la barra.','Baja de forma lenta y controlada.','El agarre supino enfoca más el bíceps que el agarre prono.'],
  'Pull Up (Neutral Grip)': ['Agárrate a las barras paralelas con agarre neutro.','Retrae las escápulas como primer movimiento.','Sube hasta que los hombros queden a la altura de las manos.','Baja de forma lenta y controlada.','El agarre neutro reduce el estrés en el hombro.'],
  'Barbell Row (Overhand)': ['Inclínate hacia adelante con la espalda recta hasta casi horizontal.','Agarra la barra con agarre prono algo más ancho que los hombros.','Tira de la barra hacia el abdomen bajo apretando los omóplatos.','Baja la barra de forma controlada hasta extender los brazos.','Mantén la espalda recta durante todo el movimiento.'],
  'One-Arm Dumbbell Row': ['Apoya una rodilla y una mano en el banco para estabilizarte.','Agarra la mancuerna con la mano libre dejando el brazo extendido.','Tira la mancuerna hacia la cadera apretando el omóplato.','Baja de forma controlada hasta extender completamente el brazo.','Mantén el torso paralelo al suelo durante el movimiento.'],
  'Lat Pulldown (Wide Grip)': ['Ajusta el apoyo de rodillas y siéntate con los muslos bien sujetos.','Agarra la barra con agarre prono amplio, más ancho que los hombros.','Tira de la barra hacia el pecho superior apretando los codos hacia abajo.','Vuelve lentamente a la posición inicial controlando la extensión.','Inclínate ligeramente hacia atrás durante el tirón.'],
  'Lat Pulldown (Narrow Grip)': ['Siéntate con los muslos bien sujetos bajo el apoyo.','Agarra la barra estrecha o las agarraderas neutras.','Tira hacia el pecho apretando los codos hacia las caderas.','Vuelve lentamente controlando el estiramiento del dorsal.','El agarre estrecho permite mayor rango de movimiento.'],
  'Seated Row (Cable)': ['Siéntate con los pies apoyados y agarra el cable o agarradera.','Con la espalda recta, tira del cable hacia el abdomen.','Aprieta los omóplatos al final del movimiento durante 1 segundo.','Vuelve lentamente manteniendo el control del peso.','Evita redondear la espalda durante el movimiento.'],
  'Back Extension': ['Colócate en el banco romano con las caderas apoyadas en el borde.','Cruza los brazos o sujeta peso en el pecho, espalda neutra.','Baja el torso hasta unos 45-90° manteniendo la espalda recta.','Sube extendiendo las caderas hasta quedar en línea con las piernas.','Aprieta los glúteos en la posición superior.'],
  'Face Pull': ['Coloca la polea a la altura de la cara con cuerda.','Agarra los extremos de la cuerda con agarre neutro.','Tira hacia la cara separando las manos al final del movimiento.','Lleva los codos hacia atrás y arriba al nivel de los hombros.','Vuelve lentamente controlando el peso.'],
  'Shrug (Barbell)': ['Sujeta la barra frente al cuerpo con agarre prono, brazos extendidos.','Eleva los hombros hacia las orejas lo más alto posible.','Mantén la posición alta 1-2 segundos apretando los trapecios.','Baja los hombros de forma controlada.','Evita girar los hombros durante el movimiento.'],
  'Good Morning (Barbell)': ['Coloca la barra en la espalda alta como en sentadilla.','Con rodillas ligeramente flexionadas, inclínate hacia adelante empujando las caderas atrás.','Baja hasta que el torso quede casi paralelo al suelo.','Vuelve a la posición inicial apretando glúteos e isquiotibiales.','Mantén la espalda recta en todo momento.'],
  'T-Bar Row': ['Coloca los pies a ambos lados del eje con el pecho apoyado o inclinado.','Agarra las agarraderas y tira hacia el abdomen apretando los omóplatos.','Pausa 1 segundo apretando la espalda al final del movimiento.','Baja de forma controlada hasta extender los brazos.','Mantén la espalda recta durante todo el movimiento.'],
  'Rack Pull': ['Coloca la barra en el rack a la altura de las rodillas o medias piernas.','Agarra la barra con agarre prono o mixto, manos al ancho de hombros.','Empuja el suelo, extiende caderas y rodillas hasta quedar erguido.','Baja de forma controlada hasta el rack.','Es un peso muerto parcial ideal para trabajar la parte superior del tirón.'],
  'Sumo Deadlift': ['Coloca los pies más separados que los hombros con las puntas hacia fuera.','Baja la cadera y agarra la barra con las manos dentro de las rodillas.','Empuja el suelo hacia afuera con los pies mientras extiendes caderas y rodillas.','Mantén el pecho alto y la espalda recta durante el levantamiento.','Baja de forma controlada invirtiendo el movimiento.'],
  // HOMBROS
  'Overhead Press (Barbell)': ['De pie o sentado, sujeta la barra a la altura de los hombros con agarre prono.','Empuja la barra hacia arriba mientras llevas la cabeza ligeramente hacia atrás.','Extiende los brazos completamente arriba sin bloquear los codos.','Baja de forma controlada hasta la altura de los hombros.','Mantén el core activado para proteger la zona lumbar.'],
  'Seated Overhead Press (Barbell)': ['Siéntate con la espalda apoyada y la barra a la altura de los hombros.','Empuja la barra hacia arriba hasta extender los brazos.','Baja de forma controlada hasta la altura de los hombros.','Mantén la espalda apoyada en el respaldo durante todo el movimiento.','Evita arquear la espalda baja en exceso.'],
  'Seated Dumbbell Press': ['Siéntate con la espalda apoyada y una mancuerna en cada mano a la altura de los hombros.','Empuja las mancuernas hacia arriba hasta casi juntarlas en la parte superior.','Baja de forma controlada hasta la altura de los hombros.','Mantén el core activado durante todo el movimiento.','No permitas que los codos bajen por debajo de los hombros.'],
  'Arnold Press': ['Siéntate con las mancuernas a la altura de los hombros, palmas hacia ti.','Al empujar hacia arriba, gira las palmas hacia adelante.','Sube hasta casi extender los brazos con las palmas mirando al frente.','Baja invirtiendo el giro hasta la posición inicial.','El movimiento rotacional activa más fibras del deltoides.'],
  'Lateral Raise (Dumbbell)': ['De pie con una mancuerna en cada mano a los lados del cuerpo.','Con codos ligeramente flexionados, eleva los brazos hacia los lados hasta la altura de los hombros.','Pausa 1 segundo en la posición alta apretando el deltoides lateral.','Baja de forma lenta y controlada.','Evita usar impulso del cuerpo o subir más allá de los hombros.'],
  'Front Raise (Dumbbell)': ['De pie con una mancuerna en cada mano frente a los muslos.','Eleva un brazo o ambos hacia adelante hasta la altura de los hombros.','Mantén el codo ligeramente flexionado durante el movimiento.','Baja de forma controlada.','Evita balancear el cuerpo para generar impulso.'],
  'Reverse Fly (Dumbbell)': ['Inclínate hacia adelante con la espalda recta, mancuernas colgando.','Con codos ligeramente flexionados, eleva los brazos hacia los lados.','Aprieta los deltoides posteriores y romboides en la posición alta.','Baja de forma lenta y controlada.','Mantén la espalda recta durante todo el movimiento.'],
  'Upright Row (Barbell)': ['Sujeta la barra frente al cuerpo con agarre prono, manos al ancho de las caderas.','Tira la barra hacia arriba llevando los codos por encima de la barra.','Sube hasta que la barra llegue a la altura del pecho o el cuello.','Baja de forma controlada.','Evita el agarre muy estrecho para proteger los hombros.'],
  'Shoulder Press (Machine)': ['Ajusta el asiento para que las agarraderas queden a la altura de los hombros.','Empuja hacia arriba hasta casi extender los brazos.','Baja de forma controlada sin dejar que el peso descanse.','Mantén la espalda apoyada en el respaldo.','Evita arquear la espalda baja en exceso.'],
  'Cable Lateral Raise': ['Coloca la polea en posición baja y sujeta el cable con la mano del lado contrario.','Eleva el brazo hacia el lado hasta la altura del hombro.','Pausa 1 segundo en la posición alta.','Baja de forma lenta y controlada.','El cable mantiene tensión constante a diferencia de las mancuernas.'],
  // BÍCEPS
  'Barbell Curl': ['De pie con la barra sujeta en agarre supino al ancho de los hombros.','Con los codos pegados al cuerpo, flexiona los brazos subiendo la barra.','Aprieta el bíceps en la posición alta durante 1 segundo.','Baja de forma lenta y controlada.','Evita balancear el cuerpo para subir más peso.'],
  'EZ Bar Curl': ['Sujeta la barra EZ en las posiciones anguladas con agarre supino.','Con los codos pegados al cuerpo, flexiona los brazos.','Aprieta el bíceps en la posición alta.','Baja de forma lenta.','La barra EZ reduce el estrés en las muñecas.'],
  'Alternating Dumbbell Curl': ['De pie con una mancuerna en cada mano en posición neutra.','Flexiona un brazo girando la palma hacia arriba al subir.','Aprieta el bíceps en la posición alta.','Baja de forma controlada y repite con el otro brazo.','Alterna los brazos de forma controlada.'],
  'Hammer Curl (Dumbbell)': ['De pie con una mancuerna en cada mano, agarre neutro.','Flexiona los brazos manteniendo el agarre neutro durante todo el movimiento.','Aprieta el bíceps y braquial en la posición alta.','Baja de forma lenta y controlada.','El agarre neutro trabaja más el braquial y el braquiorradial.'],
  'Concentration Curl': ['Siéntate con las piernas separadas, codo apoyado en el muslo interno.','Flexiona el brazo subiendo la mancuerna hacia el hombro.','Aprieta el bíceps en la posición alta.','Baja lentamente manteniendo el codo apoyado.','Ideal para aislar el bíceps evitando compensaciones.'],
  'Preacher Curl (Barbell)': ['Apoya los brazos en el banco predicador con los codos al borde.','Con agarre supino, flexiona los brazos subiendo la barra.','Baja de forma lenta sin extender completamente para mantener tensión.','Aprieta el bíceps en la posición alta.','El banco predicador elimina el movimiento del cuerpo.'],
  'Cable Curl': ['De pie frente a la polea baja, agarra la barra con agarre supino.','Con los codos pegados al cuerpo, flexiona los brazos.','Aprieta el bíceps en la posición alta.','Baja de forma lenta manteniendo tensión constante.','El cable mantiene tensión durante todo el rango de movimiento.'],
  'Incline Dumbbell Curl': ['Siéntate en un banco inclinado con una mancuerna en cada mano.','Deja los brazos colgar completamente para máximo estiramiento.','Flexiona los brazos girando las palmas hacia arriba.','Aprieta el bíceps en la posición alta.','La posición inclinada aumenta el rango de movimiento.'],
  'Spider Curl': ['Apoya el pecho en un banco inclinado dejando los brazos colgar.','Agarra las mancuernas con agarre supino.','Flexiona los brazos apretando el bíceps en la posición alta.','Baja de forma muy lenta para máxima tensión.','El banco elimina cualquier impulso del cuerpo.'],
  'Reverse Curl (Barbell)': ['Sujeta la barra con agarre prono al ancho de los hombros.','Con los codos pegados al cuerpo, flexiona los brazos.','Trabaja principalmente el braquiorradial y el braquial.','Baja de forma lenta y controlada.','El agarre prono es más exigente para los antebrazos.'],
  // TRÍCEPS
  'Skull Crusher (Barbell)': ['Túmbate en banco plano con la barra sujeta con agarre prono.','Con los brazos extendidos hacia arriba, baja la barra hacia la frente o por detrás.','Mantén los codos fijos apuntando al techo.','Extiende los brazos volviendo a la posición inicial.','Mantén los codos en la misma posición durante todo el movimiento.'],
  'Skull Crusher (EZ Bar)': ['Túmbate en banco plano con la barra EZ en agarre prono.','Baja la barra hacia la frente manteniendo los codos fijos.','Extiende los brazos volviendo a la posición inicial.','La barra EZ reduce el estrés en las muñecas.','Mantén los codos apuntando al techo durante todo el movimiento.'],
  'Tricep Pushdown (Rope)': ['De pie frente a la polea alta con la cuerda sujeta con agarre neutro.','Con los codos pegados al cuerpo, extiende los brazos hacia abajo.','Separa los extremos de la cuerda al final del movimiento.','Vuelve lentamente hasta que los antebrazos queden paralelos al suelo.','Mantén los codos fijos durante todo el movimiento.'],
  'Tricep Pushdown (Bar)': ['De pie frente a la polea alta con la barra sujeta en agarre prono.','Con los codos pegados al cuerpo, extiende los brazos hacia abajo.','Aprieta el tríceps en la posición extendida.','Vuelve lentamente controlando el peso.','Mantén los codos fijos durante todo el movimiento.'],
  'Bench Dip': ['Coloca las manos en el borde de un banco, piernas extendidas al frente.','Baja doblando los codos hasta que los brazos queden a 90°.','Empuja hacia arriba extendiendo los codos.','Mantén el cuerpo cerca del banco durante el movimiento.','Para más dificultad eleva los pies en otro banco.'],
  'Close Grip Bench Press': ['Túmbate en banco plano y agarra la barra con las manos al ancho de los hombros.','Baja la barra de forma controlada hasta el pecho inferior.','Empuja hacia arriba manteniendo los codos cerca del cuerpo.','Trabaja principalmente el tríceps con apoyo del pectoral.','Los codos deben apuntar ligeramente hacia afuera, no al cuerpo.'],
  'Tricep Kickback (Dumbbell)': ['Inclínate con la espalda recta, codo del brazo de trabajo flexionado a 90°.','Extiende el antebrazo hacia atrás hasta quedar en línea con el torso.','Aprieta el tríceps en la posición extendida.','Vuelve lentamente a la posición inicial.','Mantén el codo fijo durante todo el movimiento.'],
  'Overhead Extension (Dumbbell)': ['De pie o sentado, sujeta una mancuerna con ambas manos por encima de la cabeza.','Baja la mancuerna por detrás de la cabeza doblando los codos.','Extiende los brazos volviendo a la posición inicial.','Mantén los codos apuntando al techo durante el movimiento.','Estira bien el tríceps en la posición baja.'],
  'Diamond Push Up': ['Colócate en posición de flexión con las manos juntas formando un rombo.','Baja el cuerpo de forma controlada manteniendo los codos cerca del cuerpo.','Empuja hacia arriba extendiendo los brazos.','Enfoca la contracción del tríceps en cada repetición.','El triángulo de manos enfoca el trabajo en el tríceps.'],
  // PIERNAS
  'Squat (Barbell)': ['Coloca la barra en la espalda alta, pies al ancho de hombros, puntas ligeramente abiertas.','Con el pecho alto, baja doblando rodillas y caderas simultáneamente.','Baja hasta que los muslos queden paralelos o más abajo al suelo.','Empuja el suelo para subir manteniendo las rodillas alineadas con los pies.','Mantén la espalda recta y el core activado durante todo el movimiento.'],
  'Front Squat (Barbell)': ['Coloca la barra en la clavícula con los codos elevados al frente.','Baja manteniendo el torso más vertical que en sentadilla trasera.','Baja hasta que los muslos queden paralelos al suelo.','Empuja el suelo para subir manteniendo los codos altos.','El torso vertical exige más movilidad de tobillo.'],
  'Bulgarian Split Squat (Dumbbell)': ['Coloca el pie trasero elevado en un banco, pie delantero al frente.','Baja la rodilla trasera hacia el suelo manteniendo el torso recto.','Baja hasta que la rodilla trasera casi toque el suelo.','Empuja con el pie delantero para subir.','Activa principalmente el cuádriceps y el glúteo de la pierna delantera.'],
  'Leg Press': ['Siéntate con la espalda apoyada, pies en la plataforma al ancho de hombros.','Desbloquea la máquina y baja la plataforma hasta que las rodillas formen 90°.','Empuja la plataforma hasta casi extender las piernas.','Mantén siempre la espalda baja apoyada en el respaldo.','No bloquees completamente las rodillas en la posición alta.'],
  'Hack Squat (Machine)': ['Coloca los hombros bajo los apoyos con la espalda en la plataforma.','Baja de forma controlada hasta que los muslos queden paralelos.','Empuja con los pies para subir sin bloquear las rodillas.','Mantén la espalda apoyada durante todo el movimiento.','La posición de los pies determina el énfasis muscular.'],
  'Leg Extension (Machine)': ['Ajusta el asiento y el rodillo para que caiga justo sobre los tobillos.','Extiende las piernas hasta quedar casi rectas apretando el cuádriceps.','Pausa 1 segundo en la posición extendida.','Baja lentamente controlando el descenso.','Evita balancear el cuerpo para completar el movimiento.'],
  'Lying Leg Curl (Machine)': ['Túmbate boca abajo en la máquina con el rodillo sobre los tobillos.','Flexiona las rodillas llevando los talones hacia los glúteos.','Aprieta los isquiotibiales en la posición alta.','Baja de forma lenta y controlada.','Evita elevar las caderas durante el movimiento.'],
  'Seated Leg Curl (Machine)': ['Siéntate con las piernas extendidas y el rodillo sobre los tobillos.','Flexiona las rodillas apretando los isquiotibiales.','Pausa 1 segundo en la posición de máxima contracción.','Vuelve lentamente a la posición inicial.','La posición sentada estira más el isquiotibial que la versión tumbada.'],
  'Hip Thrust (Barbell)': ['Apoya la espalda alta en un banco, barra sobre las caderas con protección.','Con los pies apoyados en el suelo, baja la cadera hacia el suelo.','Empuja las caderas hacia arriba apretando glúteos al máximo.','Pausa 1-2 segundos en la posición alta.','Mantén la barbilla metida y el core activado durante el movimiento.'],
  'Walking Lunge (Dumbbell)': ['De pie con una mancuerna en cada mano, da un paso largo adelante.','Baja la rodilla trasera hacia el suelo manteniendo el torso recto.','Empuja con el pie delantero y da el siguiente paso.','Alterna las piernas avanzando por el espacio.','Mantén el torso erguido y el core activado.'],
  'Standing Calf Raise (Machine)': ['Coloca los hombros bajo los apoyos con los dedos en el borde de la plataforma.','Eleva los talones lo máximo posible apretando los gemelos.','Pausa 1 segundo en la posición alta.','Baja completamente para estirar el gemelo.','El rango completo de movimiento es clave para los gemelos.'],
  'Seated Calf Raise (Plate Loaded)': ['Siéntate con las rodillas bajo el apoyo y los dedos en el borde de la plataforma.','Eleva los talones apretando el soleo.','Pausa 1 segundo en la posición alta.','Baja completamente para estirar.','Trabaja principalmente el soleo a diferencia de la versión de pie.'],
  'Hip Adductor (Machine)': ['Siéntate con los muslos apoyados en las almohadillas exteriores.','Junta las piernas apretando los aductores.','Pausa en la posición cerrada.','Vuelve lentamente controlando el movimiento.','Regula el rango de movimiento según tu movilidad.'],
  'Hip Abductor (Machine)': ['Siéntate con los muslos apoyados en las almohadillas interiores.','Abre las piernas hacia los lados apretando los abductores.','Pausa en la posición abierta.','Vuelve lentamente a la posición inicial.','Trabaja el glúteo medio y los músculos abductores.'],
  'Glute Kickback (Cable)': ['Coloca el tobillo en el accesorio de la polea baja.','De pie frente a la máquina, lleva la pierna hacia atrás y arriba.','Aprieta el glúteo en la posición alta.','Vuelve lentamente a la posición inicial.','Mantén el torso estable sujetándote a la máquina.'],
  'Step Up (Dumbbell)': ['De pie frente a un banco o cajón con una mancuerna en cada mano.','Sube un pie al cajón y empuja para elevar el cuerpo.','Sube completamente con la pierna activa antes de bajar.','Baja de forma controlada.','Alterna las piernas o completa todas las reps de un lado.'],
  'Goblet Squat': ['Sujeta una mancuerna o kettlebell con ambas manos frente al pecho.','Con los pies al ancho de hombros o más, baja en sentadilla.','Mantén el torso erguido y los codos dentro de las rodillas.','Baja hasta que los muslos queden paralelos o más abajo.','Empuja el suelo para volver a la posición inicial.'],
  // ABS
  'Crunch': ['Túmbate boca arriba con las rodillas flexionadas y pies en el suelo.','Coloca las manos detrás de la cabeza sin tirar del cuello.','Eleva los hombros del suelo apretando el abdomen.','Pausa 1 segundo en la posición alta.','Baja de forma controlada sin relajar completamente el abdomen.'],
  'Cable Crunch': ['Arrodíllate frente a la polea alta con la cuerda sujeta junto a la cabeza.','Flexiona el torso hacia el suelo apretando el abdomen.','Baja hasta que los codos casi toquen las rodillas.','Vuelve lentamente a la posición inicial.','Mantén las caderas fijas durante todo el movimiento.'],
  'Plank': ['Apoya los antebrazos y los dedos de los pies en el suelo.','Mantén el cuerpo en línea recta desde la cabeza hasta los talones.','Activa el core, glúteos y cuádriceps para mantener la posición.','Respira de forma controlada durante el tiempo de trabajo.','Evita que las caderas suban o bajen durante el ejercicio.'],
  'Hanging Leg Raise': ['Cuélgate de una barra con agarre prono, brazos extendidos.','Eleva las piernas rectas o con rodillas flexionadas hacia el pecho.','Aprieta el abdomen en la posición alta.','Baja de forma lenta y controlada.','Evita el balanceo para que el trabajo lo haga el core.'],
  'Ab Rollout': ['Arrodíllate con el rodillo en el suelo frente a ti.','Rueda hacia adelante extendiendo los brazos tanto como puedas.','Activa el core para volver a la posición inicial.','Mantén la espalda recta durante el movimiento.','Para progresar, realiza el movimiento desde posición de pie.'],
  'Russian Twist (Plate)': ['Siéntate con las rodillas flexionadas y el torso inclinado hacia atrás.','Sujeta un disco o mancuerna con ambas manos frente al pecho.','Gira el torso de lado a lado tocando el suelo con el peso.','Mantén el core activado durante todo el movimiento.','Para más dificultad eleva los pies del suelo.'],
  'Hanging Knee Raise': ['Cuélgate de una barra con agarre prono.','Eleva las rodillas hacia el pecho apretando el abdomen.','Pausa 1 segundo en la posición alta.','Baja de forma lenta y controlada.','Más sencillo que la elevación de piernas rectas.'],
  'Bicycle Crunch': ['Túmbate con las manos detrás de la cabeza y las piernas elevadas.','Lleva el codo derecho hacia la rodilla izquierda mientras extiendes la derecha.','Alterna el movimiento de forma fluida.','Aprieta el oblicuo en cada lado durante la rotación.','Mantén la zona lumbar pegada al suelo.'],
  'Leg Raise (Flat Bench)': ['Siéntate al borde del banco sujetándote con las manos.','Eleva las piernas rectas hasta quedar perpendiculares al torso.','Aprieta el abdomen en la posición alta.','Baja de forma lenta sin llegar a apoyar los talones.','Para más dificultad añade peso entre los tobillos.'],
  'Mountain Climber': ['Colócate en posición de plancha alta con los brazos extendidos.','Lleva una rodilla hacia el pecho de forma explosiva.','Vuelve a la posición inicial y repite con la otra pierna.','Alterna a ritmo rápido manteniendo el core activado.','Mantén las caderas bajas durante todo el movimiento.'],
  'Dragon Flag': ['Túmbate en un banco sujetando el respaldo por encima de la cabeza.','Eleva el cuerpo recto hasta quedar vertical apoyado en los hombros.','Baja el cuerpo de forma lenta y controlada manteniendo la línea.','Es uno de los ejercicios de core más exigentes.','Progresa desde la versión con rodillas flexionadas.'],
  'Decline Crunch': ['Túmbate en el banco declinado con los pies sujetos.','Coloca las manos detrás de la cabeza o cruzadas en el pecho.','Sube el torso hasta unos 45° apretando el abdomen.','Baja de forma controlada sin llegar a apoyar completamente la espalda.','La inclinación aumenta el rango de movimiento respecto al crunch normal.'],
};


// ═══ NOTIFICACIONES PUSH ══════════════════════════
async function pedirPermisoNotificaciones(){
  if(!('Notification' in window)) return false;
  if(Notification.permission === 'granted') {
    await registrarPushSubscription();
    return true;
  }
  if(Notification.permission === 'denied') return false;
  const perm = await Notification.requestPermission();
  if(perm === 'granted') await registrarPushSubscription();
  return perm === 'granted';
}

async function registrarPushSubscription(){
  try {
    if(!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const reg = await navigator.serviceWorker.ready;
    const { publicKey } = await api('/push/vapid-key');
    const appServerKey = urlBase64ToUint8Array(publicKey);

    let sub = await reg.pushManager.getSubscription();

    // iOS: always unsubscribe and resubscribe to get a fresh valid subscription
    // On other platforms only subscribe if not already subscribed
    if(IS_IOS && sub) {
      await sub.unsubscribe();
      sub = null;
    }

    if(!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appServerKey });
    }

    await api('/push/subscribe', { method:'POST', body: JSON.stringify({ subscription: sub.toJSON() }) });
    console.log('[Push] Subscribed OK, endpoint:', sub.endpoint.slice(-30));
  } catch(e) {
    console.log('[Push] Registration error:', e.message);
  }
}

// Re-register push when app comes back to foreground (iOS loses subscription)
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'visible' && TOKEN && Notification.permission === 'granted') {
    registrarPushSubscription().catch(()=>{});
  }
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// ── NOTIFICACIONES ────────────────────────────────────────────────
async function pedirPermisosNotificacion(){
  return pedirPermisoNotificaciones();
}

function swMsg(data){
  if(!('serviceWorker' in navigator)) return false;
  if(navigator.serviceWorker.controller){
    navigator.serviceWorker.controller.postMessage(data);
    return true;
  }
  // En la primera carga puede estar registrado pero aún no controlar la página.
  // Lo mandamos al SW activo cuando esté listo para no perder timers/notificaciones.
  navigator.serviceWorker.ready
    .then(reg => {
      const target = reg.active || navigator.serviceWorker.controller;
      if(target) target.postMessage(data);
    })
    .catch(()=>{});
  return true;
}

function notificarDescansoTerminado(nombreEjercicio){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const title = LANG==='en' ? '💪 Go for it!' : '💪 ¡A por ello!';
  const body = nombreEjercicio
    ? (LANG==='en' ? `Next set of ${nombreEjercicio}` : `Siguiente serie de ${nombreEjercicio}`)
    : (LANG==='en' ? 'Rest done — next set' : 'Descanso terminado — siguiente serie');
  const opts = { body, icon: '/logo.png', badge: '/logo.png', silent: false, tag: 'descanso', requireInteraction: false, vibrate: [150,80,150] };
  if(!swMsg({ type: 'SHOW_NOTIFICATION', title, options: opts })){
    try { new Notification(title, opts); } catch(e){}
  }
}

// iOS Safari kills SW when app goes to background — use server-side push timers
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

function programarNotificacionDescanso(nombreEjercicio, segundos, timerId){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const title = LANG==='en' ? '💪 Go for it!' : '💪 ¡A por ello!';
  const body = nombreEjercicio
    ? (LANG==='en' ? `Next set of ${nombreEjercicio}` : `Siguiente serie de ${nombreEjercicio}`)
    : (LANG==='en' ? 'Rest done' : 'Descanso terminado');

  // Always use server timer on iOS (SW dies in background/locked screen)
  // Also use server timer on any mobile as fallback
  if(TOKEN) {
    api('/push/timer', {
      method: 'POST',
      body: JSON.stringify({ timerId, segundos, title, body })
    }).catch(e => console.log('[Push timer] error:', e));
  }

  // Also schedule via SW (works when app is in foreground or Android)
  if(!IS_IOS) {
    swMsg({
      type: 'SCHEDULE_NOTIFICATION',
      title,
      options: { body, icon:'/logo.png', badge:'/logo.png', tag:'descanso-'+timerId, renotify:true, silent:false, requireInteraction:false, vibrate:[150,80,150] },
      delay: segundos*1000,
      timerId
    });
  }
}

function cancelarNotificacionDescanso(timerId){
  if(TOKEN) {
    api('/push/timer/cancel', { method:'POST', body: JSON.stringify({ timerId }) }).catch(()=>{});
  }
  if(!IS_IOS) {
    swMsg({ type: 'CANCEL_NOTIFICATION', timerId });
  }
}

function cancelarTodasNotificaciones(){
  if(TOKEN) {
    api('/push/timer/cancel', { method:'POST', body: JSON.stringify({}) }).catch(()=>{});
  }
  if(!IS_IOS) {
    swMsg({ type: 'CANCEL_ALL' });
  }
}

function valorarEntreno(emoji, btn){
  document.querySelectorAll('#valoracion_wrap button').forEach(b => {
    b.style.background = 'none';
    b.style.borderColor = 'var(--br)';
  });
  btn.style.background = 'rgba(59,130,246,.2)';
  btn.style.borderColor = 'var(--bl2)';
  const etiquetas = {'😴':'Cansado','😐':'Normal','💪':'Bien','🔥':'En llamas','🤕':'Lesión/dolor'};
  const label = etiquetas[emoji] || emoji;
  try {
    api('/clientes/'+CD.id+'/valoracion-sesion', {
      method: 'POST',
      body: JSON.stringify({ valoracion: emoji + ' ' + label })
    }).catch(()=>{});
  } catch(e) {}
}

function notificarEntrenoCompletado(nombre, minutos){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  try{
    new Notification('🐺 ¡Entreno completado!', {
      body: `${nombre}, has terminado en ${minutos} min. ¡Bestia!`,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'entreno-done',
      requireInteraction: false,
    });
  }catch(e){}
}

function notificarEntrenoIncompleto(nombre, series){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  try{
    new Notification('💪 Entreno registrado', {
      body: `${nombre}, has guardado tu sesión. Quedan ${series} serie${series>1?'s':''}. ¡Mañana lo rematas!`,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'entreno-incompleto',
      requireInteraction: false,
    });
  }catch(e){}
}

async function avisarCoachEntrenoIncompleto(pendientes){
  // Crear notificación al coach en la BD para que la vea en su panel
  try {
    const dia = CD.dias[activeDia];
    const mensaje = `⚠️ ${CD.nombre} dejó el entreno incompleto (${pendientes} serie${pendientes>1?'s':''} sin completar) — ${dia.nombre} ${dia.grupo}.`;
    await api('/notificaciones/coach', {
      method: 'POST',
      body: JSON.stringify({ tipo: 'entreno_incompleto', mensaje })
    }).catch(()=>{}); // silencioso si el endpoint no existe aún
  } catch(e) {}
}

// Programar recordatorio de peso (semanal)
function programarRecordatorioPeso(clienteId){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  // Guardar timestamp de próximo recordatorio
  const ultima = CD?.pesos?.length ? new Date(CD.pesos[CD.pesos.length-1].fecha).getTime() : 0;
  const proxima = ultima + 7*24*60*60*1000;
  const ahora = Date.now();
  if(proxima > ahora){
    const msHasta = proxima - ahora;
    // Solo programar si es en menos de 24h (visibilidad razonable)
    if(msHasta < 24*60*60*1000){
      setTimeout(()=>{
        if(!('Notification' in window) || Notification.permission !== 'granted') return;
        new Notification('⚖️ ¡Hora de pesarte!', {
          body: 'Han pasado 7 días. Pésate en ayunas y registra tu peso.',
          icon: '/logo.png',
          tag: 'peso-reminder',
          requireInteraction: true,
        });
        document.getElementById('pesoReminder').style.display='flex';applyLang(document.getElementById('pesoReminder'));
      }, msHasta);
    }
  }
}

// Programar recordatorio de foto (mensual)
function programarRecordatorioFoto(clienteId){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const ultima = CD?.fotos?.length ? new Date(CD.fotos[CD.fotos.length-1].fecha).getTime() : 0;
  const proxima = ultima + 28*24*60*60*1000;
  const ahora = Date.now();
  if(proxima > ahora){
    const msHasta = proxima - ahora;
    if(msHasta < 24*60*60*1000){
      setTimeout(()=>{
        if(!('Notification' in window) || Notification.permission !== 'granted') return;
        new Notification('📸 ¡Foto mensual!', {
          body: 'Ha pasado un mes. Sube tu foto de progreso.',
          icon: '/logo.png',
          tag: 'foto-reminder',
          requireInteraction: true,
        });
        document.getElementById('fotoReminder').style.display='flex';applyLang(document.getElementById('fotoReminder'));
      }, msHasta);
    }
  }
}


function terminarEntreno(){
  const d = CD.dias[activeDia];
  const totalSeries = d.ejercicios.reduce((a,e)=>a+e.series,0);
  const doneSeries = d.ejercicios.reduce((a,e)=>a+(e._series?e._series.filter(s=>s.done).length:0),0);
  const pendientes = totalSeries - doneSeries;

  if(pendientes > 0){
    const confirmar = confirm(
      `Quedan ${pendientes} serie${pendientes>1?'s':''} sin completar.\n\n¿Seguro que quieres terminar el entreno?\n\nTu coach verá las series incompletas.`
    );
    if(!confirmar) return;
  }

  // mostrarDoneOverlay se encarga de guardar
  mostrarDoneOverlay(pendientes>0?'incompleto':'completado', pendientes);
}

async function guardarSesionParcial(){
  try{
    const d = CD.dias[activeDia];
    const series = [];
    d.ejercicios.forEach((e,ei)=>{
      const notaCliente = e._nota_cliente || document.getElementById('nota_cliente_'+ei)?.value || '';
      (e._series||[]).forEach((s,si)=>{
        if(s.done) series.push({
          ejercicio: e.nombre,
          serie_num: si+1,
          peso: s.peso||0,
          reps: s.reps_real||parseFirstNum(e.reps),
          rir: s.rir_real!=null?s.rir_real:(e.rir!=null?e.rir:2),
          nota_cliente: notaCliente
        });
      });
    });
    await api('/clientes/'+CD.id+'/sesiones',{
      method:'POST',
      body:JSON.stringify({
        dia_nombre: d.nombre,
        dia_grupo: d.grupo,
        duracion_min: getWorkoutDuration(),
        series,
        estado: 'incompleto'
      })
    });
    // Sync to localStorage
    const hoy = new Date().toISOString().split('T')[0];
    localStorage.setItem('wm_sesion_'+CD.id+'_'+d.nombre.replace(/\s/g,'_')+'_'+hoy, 'incompleto');
  }catch(e){ console.log('Error guardando parcial:',e); }
}


async function borrarEjercicioDb(id, nombre){
  if(!confirm(`¿Eliminar "${nombre}" de la biblioteca?\n\nSe quitará de la lista de ejercicios disponibles. Los ejercicios ya asignados a rutinas no se verán afectados.`)) return;
  try{
    const r = await fetch('/api/ejercicios-db/'+id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer '+TOKEN }
    });
    if(r.ok){
      await filtrarEjerciciosGestor();
    } else {
      alert(COACH_LANG==='en'?'Delete failed. Please try again.':'Error al eliminar. Inténtalo de nuevo.');
    }
  }catch(e){
    alert('Error de conexión.');
  }
}


// ═══ ESTADO SESIÓN DEL DÍA ════════════════════════
function getSesionKey(diaNombre){
  const hoy = new Date().toISOString().split('T')[0];
  return 'wm_sesion_'+CD.id+'_'+diaNombre.replace(/\s/g,'_')+'_'+hoy;
}
function marcarSesionHecha(diaNombre, estado){ // 'completado' | 'incompleto'
  localStorage.setItem(getSesionKey(diaNombre), estado);
}
function getSesionEstado(diaNombre){
  return localStorage.getItem(getSesionKey(diaNombre)); // null | 'completado' | 'incompleto'
}

// ── SISTEMA DE BADGES ─────────────────────────────────────────────
const BADGES = [
  // Sesiones completadas
  { id:'first_session',  emoji:'🐣', titulo:'¡Primera vez!',        desc:'Completaste tu primera sesión. El viaje ha comenzado.',     check: s => s.total >= 1 },
  { id:'sessions_5',     emoji:'💪', titulo:'5 Sesiones',           desc:'5 entrenos completados. Ya estás cogiendo el hábito.',      check: s => s.total >= 5 },
  { id:'sessions_10',    emoji:'🔟', titulo:'10 Sesiones',          desc:'10 entrenos completados. Eres constante.',                  check: s => s.total >= 10 },
  { id:'sessions_25',    emoji:'🏅', titulo:'25 Sesiones',          desc:'25 entrenos. Estás construyendo algo serio.',               check: s => s.total >= 25 },
  { id:'sessions_50',    emoji:'🥈', titulo:'50 Sesiones',          desc:'50 sesiones completadas. Eres de los que no paran.',        check: s => s.total >= 50 },
  { id:'sessions_100',   emoji:'🥇', titulo:'100 Sesiones',         desc:'100 entrenos. Eres una máquina.',                           check: s => s.total >= 100 },

  // Racha
  { id:'streak_7',       emoji:'🔥', titulo:'7 días en racha',      desc:'Una semana seguida entrenando. ¡Fuego!',                    check: s => s.streak >= 7 },
  { id:'streak_14',      emoji:'⚡', titulo:'14 días en racha',     desc:'Dos semanas sin parar. Nada te detiene.',                   check: s => s.streak >= 14 },
  { id:'streak_30',      emoji:'🐺', titulo:'30 días en racha',     desc:'Un mes entero. Eres un auténtico Wolf.',                    check: s => s.streak >= 30 },

  // Peso levantado (PRs)
  { id:'pr_100kg',       emoji:'💯', titulo:'¡100 kg!',             desc:'Has levantado 100 kg en un ejercicio. Brutal.',             check: s => s.maxPeso >= 100 },
  { id:'pr_150kg',       emoji:'🦁', titulo:'¡150 kg!',             desc:'150 kg. Estás en otra liga.',                               check: s => s.maxPeso >= 150 },
  { id:'pr_200kg',       emoji:'👑', titulo:'¡200 kg!',             desc:'200 kg. Eres una leyenda.',                                 check: s => s.maxPeso >= 200 },

  // Tonelaje total
  { id:'ton_1000',       emoji:'🏋️', titulo:'1.000 kg movidos',    desc:'Has movido una tonelada en total. Literal.',                check: s => s.tonelaje >= 1000 },
  { id:'ton_10000',      emoji:'🚛', titulo:'10.000 kg movidos',    desc:'10 toneladas. Un camión entero. Increíble.',                check: s => s.tonelaje >= 10000 },
  { id:'ton_50000',      emoji:'🌋', titulo:'50.000 kg movidos',    desc:'50 toneladas acumuladas. Eres pura fuerza.',                check: s => s.tonelaje >= 50000 },

  // Mes perfecto
  { id:'perfect_month',  emoji:'📅', titulo:'Mes perfecto',         desc:'Todos los días del mes con al menos un entreno. Épico.',    check: s => s.mesPerfecto },
];

function getBadgesDesbloqueados(){
  return JSON.parse(localStorage.getItem('wolfBadges_'+CD.id) || '[]');
}
function setBadgesDesbloqueados(lista){
  localStorage.setItem('wolfBadges_'+CD.id, JSON.stringify(lista));
}

async function comprobarBadges(){
  try {
    // Recoger datos necesarios
    const sesiones = await api('/clientes/'+CD.id+'/sesiones').catch(()=>[]);
    const total = sesiones.filter(s=>s.estado==='completado').length;
    const streak = calcularStreak();

    // Máximo peso en cualquier serie
    let maxPeso = 0;
    let tonelaje = 0;
    sesiones.forEach(s=>{
      (s.series||[]).forEach(sr=>{
        const p = sr.peso_real||0, r = sr.reps_real||0;
        if(p > maxPeso) maxPeso = p;
        tonelaje += p * r;
      });
    });

    // Mes perfecto: todos los días del mes actual con sesión
    const hoy = new Date();
    const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth()+1, 0).getDate();
    const diasConSesion = new Set(
      sesiones
        .filter(s=>s.estado==='completado')
        .map(s=>new Date(s.fecha))
        .filter(d=>d.getMonth()===hoy.getMonth() && d.getFullYear()===hoy.getFullYear())
        .map(d=>d.getDate())
    ).size;
    const mesPerfecto = diasConSesion >= diasEnMes;

    const stats = { total, streak, maxPeso, tonelaje, mesPerfecto };
    const yaDesbloqueados = getBadgesDesbloqueados();
    const nuevos = BADGES.filter(b => !yaDesbloqueados.includes(b.id) && b.check(stats));

    if(nuevos.length > 0){
      // Guardar todos como desbloqueados
      setBadgesDesbloqueados([...yaDesbloqueados, ...nuevos.map(b=>b.id)]);
      // Mostrar en cadena (uno a uno con delay)
      mostrarBadgesEnCadena(nuevos, 0);
    }
  } catch(e) { console.log('Badge check error:', e); }
}

const _badgeQueue = [];
let _badgeActual = null;
function mostrarBadgesEnCadena(lista, i){
  if(i >= lista.length) return;
  const badge = lista[i];
  _badgeActual = badge;
  document.getElementById('badgeEmoji').textContent = badge.emoji;
  document.getElementById('badgeTitulo').textContent = badge.titulo;
  document.getElementById('badgeDesc').textContent = badge.desc;

  // Reiniciar animación
  const emoji = document.getElementById('badgeEmoji');
  emoji.style.animation = 'none';
  setTimeout(()=>{ emoji.style.animation = 'badgePop .5s cubic-bezier(.34,1.56,.64,1)'; }, 10);

  const ov = document.getElementById('badgeOv');
  ov.style.display = 'flex';
  applyLang(ov);
  _badgeQueue.length = 0;
  _badgeQueue.push({ lista, next: i+1 });

  // Vibrar
  vibrate([50,30,50,30,100]);
}

function cerrarBadge(){
  document.getElementById('badgeOv').style.display = 'none';
  if(_badgeQueue.length > 0){
    const { lista, next } = _badgeQueue.pop();
    if(next < lista.length){
      setTimeout(()=>mostrarBadgesEnCadena(lista, next), 300);
    }
  }
}

async function compartirLogro(){
  const emoji   = document.getElementById('badgeEmoji')?.textContent || '🏆';
  const titulo  = document.getElementById('badgeTitulo')?.textContent || '';
  const desc    = document.getElementById('badgeDesc')?.textContent || '';
  const nombre  = CD?.nombre || '';
  const btn     = document.getElementById('btnCompartirLogro');

  try {
    // Generate 1080x1080 shareable image
    const canvas = document.getElementById('badgeCanvas');
    const ctx    = canvas.getContext('2d');
    const W = 1080, H = 1080;

    // Background — dark gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#09090b');
    bg.addColorStop(0.5, '#0d1117');
    bg.addColorStop(1, '#09090b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Glow center
    const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 420);
    glow.addColorStop(0, 'rgba(245,158,11,0.18)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Outer decorative ring
    ctx.beginPath();
    ctx.arc(W/2, H/2, 400, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(245,158,11,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(W/2, H/2, 370, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(245,158,11,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Logo text top
    ctx.font = '700 32px "Bebas Neue", sans-serif';
    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText('WOLFMINDSET', W/2, 90);

    // Divider line
    ctx.beginPath();
    ctx.moveTo(W/2 - 80, 108);
    ctx.lineTo(W/2 + 80, 108);
    ctx.strokeStyle = 'rgba(245,158,11,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Big emoji
    ctx.font = '220px serif';
    ctx.textAlign = 'center';
    ctx.fillText(emoji, W/2, H/2 - 80);

    // "LOGRO DESBLOQUEADO" label
    ctx.font = '600 26px "Bebas Neue", sans-serif';
    ctx.fillStyle = 'rgba(245,158,11,0.8)';
    ctx.letterSpacing = '6px';
    ctx.fillText('LOGRO DESBLOQUEADO', W/2, H/2 + 80);

    // Achievement title
    ctx.font = '800 72px "Bebas Neue", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '2px';
    ctx.fillText(titulo.toUpperCase(), W/2, H/2 + 170);

    // Description
    ctx.font = '400 32px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.letterSpacing = '0px';
    // Word wrap
    const words = desc.split(' ');
    let line = '', lines = [], maxW = 600;
    for(const w of words){
      const test = line + w + ' ';
      if(ctx.measureText(test).width > maxW && line) { lines.push(line.trim()); line = w + ' '; }
      else line = test;
    }
    if(line) lines.push(line.trim());
    lines.forEach((l, i) => ctx.fillText(l, W/2, H/2 + 240 + i*44));

    // Client name bottom
    ctx.font = '700 38px "Bebas Neue", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.letterSpacing = '3px';
    ctx.fillText(nombre.toUpperCase(), W/2, H - 120);

    // Bottom divider
    ctx.beginPath();
    ctx.moveTo(W/2 - 120, H - 98);
    ctx.lineTo(W/2 + 120, H - 98);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Website
    ctx.font = '400 24px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.letterSpacing = '2px';
    ctx.fillText('wolfmindset.app', W/2, H - 64);

    // Try Web Share API (mobile) or download (desktop)
    const dataUrl = canvas.toDataURL('image/png');

    if(navigator.share && navigator.canShare) {
      // Convert to blob for sharing
      canvas.toBlob(async blob => {
        const file = new File([blob], `logro-${titulo.replace(/\s+/g,'-')}.png`, { type:'image/png' });
        try {
          await navigator.share({
            title: `¡Logro desbloqueado! ${titulo}`,
            text: `${emoji} ${titulo} — ${desc} #WolfMindset`,
            files: [file]
          });
        } catch(e) {
          // User cancelled or share failed — fallback to download
          _descargarImagenLogro(dataUrl, titulo);
        }
      }, 'image/png');
    } else {
      // Desktop: download image
      _descargarImagenLogro(dataUrl, titulo);
    }

  } catch(e) {
    console.log('compartirLogro error:', e);
    // Fallback: just close
    cerrarBadge();
  }
}

function _descargarImagenLogro(dataUrl, titulo){
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `logro-wolfmindset-${titulo.replace(/\s+/g,'-')}.png`;
  a.click();
}

// Ver todos los badges del cliente
function hBadgesCliente(){
  const desbloqueados = getBadgesDesbloqueados();
  const total = BADGES.length;
  const ok = desbloqueados.length;

  return`<div style="padding:16px 14px">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.06em;color:var(--sv);margin-bottom:4px">Mis Logros</div>
    <div style="font-size:12px;color:var(--tx3);margin-bottom:16px">${ok} de ${total} desbloqueados</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${BADGES.map(b=>{
        const ok = desbloqueados.includes(b.id);
        return`<div style="background:${ok?'rgba(59,130,246,.08)':'var(--s2)'};border:0.5px solid ${ok?'rgba(59,130,246,.3)':'var(--br)'};border-radius:12px;padding:12px;opacity:${ok?1:.45}">
          <div style="font-size:28px;margin-bottom:6px">${b.emoji}</div>
          <div style="font-size:12px;font-weight:700;color:${ok?'var(--sv)':'var(--tx3)'};margin-bottom:2px">${b.titulo}</div>
          <div style="font-size:10px;color:var(--tx3);line-height:1.4">${b.desc}</div>
          ${ok?'<div style="font-size:9px;color:var(--blg);font-weight:700;margin-top:4px;text-transform:uppercase">✓ Desbloqueado</div>':''}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function cerrarDoneOverlay(){
  document.getElementById('doneOv').classList.remove('show');
  // Go back to day selection showing completed status
  vistaActual = 'seleccion';
  klTab = 'entreno';
  renderSeleccion();
}

async function publicarRutinaAlCoach(){
  const btn = document.getElementById('btn_publicar_rutina');
  if(btn) { btn.disabled = true; btn.textContent = LANG==='en'?'⏳ Sending...':'⏳ Enviando...'; }
  try {
    const d = CD.dias[activeDia];
    const mensaje = LANG==='en'
      ? `✅ ${CD.nombre} completed training: ${d.nombre}${d.grupo?' ('+d.grupo+')':''} — ${getWorkoutDuration()} min`
      : `✅ ${CD.nombre} completó el entreno: ${d.nombre}${d.grupo?' ('+d.grupo+')':''} — ${getWorkoutDuration()} min`;
    await api('/notificaciones/coach', {
      method:'POST',
      body: JSON.stringify({ tipo:'rutina_publicada', mensaje })
    });
    if(btn) { btn.textContent = LANG==='en'?'✓ Sent':'✓ Enviado'; btn.style.background='#15803d'; }
    setTimeout(()=>{ cerrarDoneOverlay(); }, 1200);
  } catch(e) {
    if(btn) { btn.disabled=false; btn.innerHTML='📤 <span data-i18n="Publicar al coach">Publicar al coach</span>'; }
  }
}

// ═══════════════════════════════════════════════════════════════════
// PANEL DE CONTROL DEL BOT IA EN EL CHAT
// ═══════════════════════════════════════════════════════════════════

let _iaChatConfig = { bot_global: 0, clientes: [] };

async function cargarIaChatConfig() {
  try {
    if(!TOKEN) return _iaChatConfig;
    const r = await fetch('/api/ia-chat/config', {
      headers: { 'Authorization': 'Bearer ' + TOKEN }
    });
    if(!r.ok) return _iaChatConfig;
    _iaChatConfig = await r.json();
    return _iaChatConfig;
  } catch(e) { return _iaChatConfig; }
}

async function toggleBotGlobal(activo) {
  await fetch('/api/ia-chat/global', {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ activo })
  });
  _iaChatConfig.bot_global = activo ? 1 : 0;
  renderIaChatPanel();
}

async function toggleBotCliente(clienteId, activo) {
  await fetch(`/api/ia-chat/cliente/${clienteId}`, {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ activo })
  });
  const cl = _iaChatConfig.clientes.find(c => c.id === clienteId);
  if (cl) cl.ia_activa = activo ? 1 : 0;
  renderIaChatPanel();
}

async function renderIaChatPanel() {
  const el = document.getElementById('iaChatPanelContainer');
  if (!el) return;
  if (!_iaChatConfig.clientes.length) await cargarIaChatConfig();
  const globalOn = _iaChatConfig.bot_global;
  el.innerHTML = `
    <div style="background:rgba(255,255,255,.04);border:0.5px solid rgba(255,255,255,.1);border-radius:12px;padding:14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--sv)">🤖 Asistente IA</div>
          <div style="font-size:11px;color:var(--tx3);margin-top:2px">Responde automáticamente cuando está activo</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:${globalOn ? '#4ade80' : 'var(--tx3)'}">
            ${globalOn ? 'Global ON' : 'Global OFF'}
          </span>
          <div onclick="toggleBotGlobal(${globalOn ? 0 : 1})"
               style="width:40px;height:22px;border-radius:11px;background:${globalOn ? '#2563eb' : 'rgba(255,255,255,.15)'};
                      position:relative;cursor:pointer;transition:.2s;flex-shrink:0">
            <div style="position:absolute;top:3px;${globalOn ? 'right:3px' : 'left:3px'};
                        width:16px;height:16px;border-radius:50%;background:#fff;transition:.2s"></div>
          </div>
        </div>
      </div>
      <div style="font-size:10px;color:var(--tx3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em">Por cliente</div>
      <div style="display:flex;flex-direction:column;gap:5px;max-height:180px;overflow-y:auto">
        ${_iaChatConfig.clientes.map(c => {
          const on = c.ia_activa === 1;
          const efectivo = globalOn ? (c.ia_activa !== 0) : on;
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-radius:7px;background:rgba(255,255,255,.03)">
            <div style="display:flex;align-items:center;gap:7px">
              <div style="width:7px;height:7px;border-radius:50%;background:${efectivo ? '#4ade80' : 'rgba(255,255,255,.2)'}"></div>
              <span style="font-size:12px;color:var(--sv)">${c.nombre}</span>
              ${globalOn && !on ? '<span style="font-size:10px;color:var(--tx3)">(global)</span>' : ''}
            </div>
            <div onclick="toggleBotCliente(${c.id}, ${on ? 0 : 1})"
                 style="width:34px;height:18px;border-radius:9px;background:${on ? '#2563eb' : 'rgba(255,255,255,.15)'};
                        position:relative;cursor:pointer;transition:.2s;flex-shrink:0">
              <div style="position:absolute;top:2px;${on ? 'right:2px' : 'left:2px'};
                          width:14px;height:14px;border-radius:50%;background:#fff;transition:.2s"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:8px;padding-top:8px;border-top:0.5px solid rgba(255,255,255,.07);font-size:10px;color:var(--tx3)">
        Los mensajes del asistente aparecen marcados como vía IA en el hilo.
      </div>
    </div>
  `;
}
function moveEx(diaIndex, exIndex, dir){
  if(!CD || !CD.dias || !CD.dias[diaIndex]) return;

  const dia = CD.dias[diaIndex];
  const arr = dia.ejercicios || [];
  const newIndex = exIndex + dir;

  if(newIndex < 0 || newIndex >= arr.length) return;

  [arr[exIndex], arr[newIndex]] = [arr[newIndex], arr[exIndex]];

  arr.forEach((e,i)=>{
    e.orden = i;
  });

  const el = document.getElementById('klContent');
  if(el && typeof hEntreno === 'function'){
    el.innerHTML = hEntreno();
  }
}
async function tabMoveEx(clienteId, diaId, exIndex, dir){
  try{
    const c = await api('/clientes/'+clienteId);
    const dia = (c.dias || []).find(d => String(d.id) === String(diaId));
    if(!dia || !dia.ejercicios) return;

    const arr = dia.ejercicios;
    const newIndex = exIndex + dir;
    if(newIndex < 0 || newIndex >= arr.length) return;

    [arr[exIndex], arr[newIndex]] = [arr[newIndex], arr[exIndex]];

    arr.forEach((e,i)=> e.orden = i);

    window._coachClienteActual = c;
    switchClienteTab('entreno', document.querySelector('.ctab[onclick*="entreno"]'));

    for(let i=0;i<arr.length;i++){
      await api('/ejercicios/'+arr[i].id, {
        method:'PUT',
        body: JSON.stringify({ orden:i })
      });
    }

    window._coachClienteActual = await api('/clientes/'+clienteId);
  }catch(e){
    console.error('tabMoveEx error:', e);
    alert('Error moviendo ejercicio');
  }
}eActual = await api('/clientes/'+clienteId);
    switchClienteTab('entreno', document.querySelector('.ctab[onclick*="entreno"]'));

  }catch(e){
    console.error('tabMoveEx error:', e);
    alert('Error moviendo ejercicio: ' + (e.message || 'desconocido'));
  }
}
