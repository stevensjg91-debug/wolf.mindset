# WolfMindset — Índice de módulos JS

## Orden de carga en index.html

```html
<!-- 1. Globals primero — siempre -->
<script src="/js/01_globals_init.js"></script>

<!-- 2. i18n -->
<script src="/js/02_i18n_client.js"></script>
<script src="/js/03_i18n_coach.js"></script>

<!-- 3. Utilidades y auth -->
<script src="/js/04_utils.js"></script>
<script src="/js/05_auth.js"></script>

<!-- 4. Panel Coach -->
<script src="/js/06_coach_clientes.js"></script>
<script src="/js/07_coach_entreno_editor.js"></script>
<script src="/js/08_coach_fotos.js"></script>
<script src="/js/09_coach_dieta_editor.js"></script>
<script src="/js/10_coach_nuevo_cliente.js"></script>
<script src="/js/11_coach_rutinas.js"></script>
<script src="/js/12_coach_equipo.js"></script>
<script src="/js/13_coach_dieta_builder.js"></script>
<script src="/js/14_coach_progreso.js"></script>
<script src="/js/15_coach_subs_notif.js"></script>
<script src="/js/16_coach_ia.js"></script>

<!-- 5. Panel Cliente -->
<script src="/js/17_cliente_entreno.js"></script>
<script src="/js/18_cliente_dieta.js"></script>
<script src="/js/19_chat.js"></script>
<script src="/js/20_cliente_progreso.js"></script>
<script src="/js/21_cliente_perfil.js"></script>

<!-- 6. Utilidades transversales -->
<script src="/js/22_macros_calc.js"></script>
<script src="/js/23_recordatorios.js"></script>
<script src="/js/24_video_registro.js"></script>
<script src="/js/25_pendientes.js"></script>
<script src="/js/26_gestor_imagenes.js"></script>
<script src="/js/27_graficas.js"></script>
<script src="/js/28_audio.js"></script>
<script src="/js/29_entreno_misc.js"></script>
<script src="/js/30_revision_semanal.js"></script>
<script src="/js/31_ex_descriptions.js"></script>
<script src="/js/32_push_notif.js"></script>
<script src="/js/33_badges_logros.js"></script>
```

## Mapa de módulos

| # | Archivo | Líneas | Contenido |
|---|---------|--------|-----------|
| 01 | globals_init.js | 160 | Estado global (TOKEN, USER, CD, LANG), Service Worker, unidades de medida |
| 02 | i18n_client.js | 752 | TRANSLATIONS, t(), applyLang(), setLangLogin(), setLang() |
| 03 | i18n_coach.js | 570 | COACH_TRANSLATIONS, tc(), setCoachLang(), applyCoachLang() |
| 04 | utils.js | 162 | api(), show(), emojis, colores, helpers imágenes ejercicios |
| 05 | auth.js | 177 | doLogin(), loadCD(), verificarSuscripcion(), doLogout(), auto-login |
| 06 | coach_clientes.js | 486 | renderCoach(), hClientes(), verCliente(), filtros, tareas pendientes |
| 07 | coach_entreno_editor.js | 217 | Editor inline de entreno en perfil cliente |
| 08 | coach_fotos.js | 317 | Fotos progreso coach, análisis IA, publicar análisis |
| 09 | coach_dieta_editor.js | 378 | Editor dieta coach, macros, rebalanceo IA |
| 10 | coach_nuevo_cliente.js | 221 | hNuevo(), crearCliente(), traducirEjercicioIA() |
| 11 | coach_rutinas.js | 489 | Rutinas builder completo |
| 12 | coach_equipo.js | 305 | Gestión de coaches, filtro IA ejercicios |
| 13 | coach_dieta_builder.js | 255 | Dieta builder con IA |
| 14 | coach_progreso.js | 467 | Dashboard, métricas avanzadas, 1RM |
| 15 | coach_subs_notif.js | 307 | Suscripciones, SSE, notificaciones coach |
| 16 | coach_ia.js | 78 | IA Coach panel |
| 17 | cliente_entreno.js | 848 | Entreno cliente estilo Strong, timers, guardarSesion |
| 18 | cliente_dieta.js | 222 | Vista dieta cliente |
| 19 | chat.js | 352 | Chat cliente+coach, hAsistente(), mensajes coach |
| 20 | cliente_progreso.js | 377 | Progreso cliente, fotos, peso, tendencias |
| 21 | cliente_perfil.js | 446 | Perfil cliente, foto de perfil, cuenta |
| 22 | macros_calc.js | 267 | Calculadoras de macros cliente y coach |
| 23 | recordatorios.js | 76 | Recordatorios peso/foto, avisos lesiones |
| 24 | video_registro.js | 174 | Video player, formulario registro público |
| 25 | pendientes.js | 67 | Panel solicitudes pendientes |
| 26 | gestor_imagenes.js | 176 | Gestor imágenes ejercicios |
| 27 | graficas.js | 176 | Gráficas SVG de progreso |
| 28 | audio.js | 64 | Sonidos y vibración |
| 29 | entreno_misc.js | 94 | iniciarEntreno(), getWorkoutDuration(), rbEditEx() |
| 30 | revision_semanal.js | 396 | Revisión semanal coach, progresión IA |
| 31 | ex_descriptions.js | 100 | Descripciones ejercicios en español |
| 32 | push_notif.js | 237 | Push notifications, recordatorios programados |
| 33 | badges_logros.js | 483 | Sistema de badges, logros, IA chat control |

## Guía para IA (Claude u otro modelo)

Cuando necesites modificar o extender esta app:

- **Bug en el login** → edita `05_auth.js`
- **Añadir traducción** → edita `02_i18n_client.js` (TRANSLATIONS) o `03_i18n_coach.js` (COACH_TRANSLATIONS)
- **Nuevo panel coach** → edita `06_coach_clientes.js` y `renderCoach()`, luego crea nuevo módulo
- **Cambio en el entreno** → `17_cliente_entreno.js`
- **Nueva gráfica** → `27_graficas.js`
- **Nuevo badge** → `33_badges_logros.js`
- **Push notifications** → `32_push_notif.js`
- **Cambio de macros** → `22_macros_calc.js`
- **Variables globales** → solo en `01_globals_init.js`
