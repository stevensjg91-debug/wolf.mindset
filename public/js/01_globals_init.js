/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 01_globals_init.js
   Estado global, Service Worker, variables compartidas, unidades de medida

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

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
