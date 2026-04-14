# WolfMindset — Plataforma de Coaching

## Despliegue en Railway (paso a paso)

### 1. Instalar Git si no lo tienes
- Mac: ya viene instalado
- Windows: https://git-scm.com/download/win

### 2. Crear cuenta en Railway
- Ve a https://railway.app y regístrate con GitHub

### 3. Subir el proyecto a GitHub
```bash
# En la carpeta wolfmindset:
git init
git add .
git commit -m "WolfMindset v1"
# Crea un repo en github.com (botón + > New repository)
git remote add origin https://github.com/TU_USUARIO/wolfmindset.git
git push -u origin main
```

### 4. Crear proyecto en Railway
1. En railway.app > New Project > Deploy from GitHub repo
2. Selecciona el repo `wolfmindset`
3. Railway lo detecta como Node.js automáticamente

### 5. Añadir variables de entorno en Railway
En tu proyecto > Variables > Add:
```
ANTHROPIC_API_KEY = sk-ant-XXXXXXXX   (tu clave de Anthropic)
JWT_SECRET        = wolfmindset_2024_clave_secreta_larga
NODE_ENV          = production
```

### 6. Obtener la URL
Railway genera automáticamente una URL tipo:
`wolfmindset-production.up.railway.app`

Esa URL la compartes con tus clientes.

---

## Acceso

**Coach:**
- URL: tu-app.up.railway.app
- Usuario: `wolf`  
- Contraseña: `1234` (cámbiala en src/database.js antes de subir)

**Clientes:**
- Tú los creas desde el panel coach > "Nuevo cliente"
- Cada cliente tiene su usuario y contraseña únicos
- En móvil: abrir la URL en Chrome/Safari > "Añadir a pantalla de inicio" → funciona como app

---

## Cambiar contraseña del coach
En `src/database.js`, línea:
```js
const hash = bcrypt.hashSync('1234', 10);
```
Cambia `'1234'` por tu contraseña antes de desplegar.

---

## Estructura
```
wolfmindset/
  src/
    server.js      — servidor Express
    database.js    — SQLite + seed
    auth.js        — login/registro
    routes.js      — API endpoints
  public/
    index.html     — toda la app frontend
    manifest.json  — PWA (instalable en móvil)
  package.json
  railway.toml
```
