/* ═══════════════════════════════════════════════════════════════════
   WolfMindset — 02_i18n_client.js
   Traducciones cliente (TRANSLATIONS), función t(), applyLang(), setLangLogin(), setLang()

   DEPENDENCIAS GLOBALES (definidas en 01_globals_init.js):
     TOKEN, USER, CD, LANG, COACH_LANG, API
   FUNCIONES COMPARTIDAS:
     api(), show(), t(), tc(), applyLang(), applyCoachLang()
   ═══════════════════════════════════════════════════════════════════ */


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
