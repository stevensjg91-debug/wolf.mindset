/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 18_cliente_dieta.js
   Vista dieta cliente: hDieta()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */

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


