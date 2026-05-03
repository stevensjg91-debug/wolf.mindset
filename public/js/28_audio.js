/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 28_audio.js
   Sonidos y vibración: soundDing(), soundComplete(), soundBell(), vibrate()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

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

