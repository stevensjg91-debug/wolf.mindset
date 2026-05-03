/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 19_chat.js
   Chat cliente+coach: _chatLoad(), _chatSave(), sendChat(), hAsistente(), hMensajesCoach()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

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


