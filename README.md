# RepoInterview Trainer

**Un pequeño ecosistema de preparación de entrevistas con IA — todo en español.**

La app agrupa **tres herramientas** con una navegación común, el mismo sistema de diseño
y un backend compartido (Groq vía API Routes, sin base de datos):

1. **RepoInterview Trainer** (`/trainer`) — pega la URL de un repositorio público y una IA
   actúa como reclutador técnico: lee el código, te hace preguntas sobre features,
   fragmentos, funciones y conceptos, y te da feedback con puntaje y plan de estudio.
2. **Analizador de CV** (`/cv`) — pega tu CV y, opcionalmente, una oferta. La IA evalúa el
   **match**, detecta **keywords faltantes**, **alertas ATS**, fortalezas/debilidades,
   reformula responsabilidades en **logros con métricas** y entrega mejoras priorizadas y
   un resumen reescrito.
3. **Entrevista por Competencias / RRHH** (`/entrevista`) — practica preguntas blandas adaptadas
   a tu rol y recibe feedback con el método **STAR** (Situación, Tarea, Acción, Resultado),
   puntaje, fortalezas, mejoras y **respuestas modelo**.

Los tres módulos permiten **descargar el reporte en PDF, CSV y Excel**. Todo el estado
vive en el navegador (`sessionStorage` para el trainer; `localStorage` para el CV y el
historial de sesiones de competencias). **No hay base de datos.**

---

## ✨ Qué hace

1. **Pegas** el link de un repositorio público de GitHub.
2. La app **lee** el repositorio: estructura de carpetas, README, archivos de
   configuración y una muestra representativa del código fuente.
3. Una IA (vía **Groq**) genera preguntas de entrevista **específicas a ese repo**.
4. **Respondes** las preguntas una por una, con syntax highlighting en los fragmentos de
   código.
5. La IA **evalúa** tus respuestas: veredicto (bien / parcial / mal), puntaje 0–100,
   comentario y la respuesta correcta esperada.
6. Ves un **resumen con puntaje global**, detalle expandible por pregunta y
   recomendaciones de estudio.
7. **Descargas** el reporte en PDF, CSV o Excel.

Todo el estado vive en tu navegador. **No hay base de datos ni se guarda nada en el
servidor.** Las claves de API se usan únicamente en el servidor (nunca se exponen al
cliente).

---

## 🧱 Stack

- **Next.js 15** (App Router) + **TypeScript** — frontend y backend en un solo proyecto.
- **Tailwind CSS** con tokens de diseño derivados de las imágenes de referencia.
- **API Routes de Next** como backend/proxy (para no exponer las API keys).
- **Zustand** para el estado (todo en la sesión del navegador).
- **Groq** mediante el SDK de OpenAI (API compatible).
- **react-syntax-highlighter** para el resaltado de código.
- **jsPDF + jspdf-autotable**, **papaparse** y **xlsx (SheetJS)** para exportar.

---

## ✅ Requisitos

- **Node.js 18.18+** (probado con Node 24).
- Una **API key de Groq** (gratis).
- _(Opcional)_ un **token de GitHub** para subir el límite de peticiones.

---

## 🔑 Cómo obtener la API key de Groq

1. Entra a **https://console.groq.com** y crea una cuenta (es gratis).
2. Ve a **https://console.groq.com/keys**.
3. Crea una nueva API key y cópiala (empieza con `gsk_...`).
4. Pégala en tu archivo `.env.local` (ver abajo).

> **Nota sobre el free tier:** Groq limita los tokens por minuto (TPM) en el plan
> gratuito. La app ya está calibrada para respetarlo (recorta el tamaño del código que
> envía y ajusta la longitud de la respuesta). Para repos muy grandes o muchas preguntas,
> conviene un plan de pago o reducir la cantidad de preguntas.

### _(Opcional)_ Token de GitHub

Sin token, la API pública de GitHub permite ~**60 peticiones/hora** por IP. Con un token
sube a ~**5000/hora**. Para repos públicos **no necesita ningún permiso/scope**:

1. Ve a **https://github.com/settings/tokens** → _Generate new token_.
2. No marques ningún scope (para repos públicos basta el acceso base).
3. Copia el token y ponlo en `GITHUB_TOKEN` dentro de `.env.local`.

---

## ⚙️ Configuración

Copia el archivo de ejemplo y completa tus valores:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```bash
# Obligatorio
GROQ_API_KEY=gsk_tu_key_aqui

# Opcionales (puedes dejar los defaults)
GROQ_MODEL=openai/gpt-oss-120b
GROQ_MODEL_FALLBACK=llama-3.3-70b-versatile

# Opcional (recomendado): sube el rate limit de GitHub
GITHUB_TOKEN=
```

### Modelos

| Variable              | Default                     | Rol                                        |
| --------------------- | --------------------------- | ------------------------------------------ |
| `GROQ_MODEL`          | `openai/gpt-oss-120b`       | Principal (razonamiento: analiza y evalúa) |
| `GROQ_MODEL_FALLBACK` | `llama-3.3-70b-versatile`   | Se usa si el principal falla               |

> ⚠️ Se evitan a propósito los modelos **Llama 4 Scout/Maverick** porque fueron
> deprecados en Groq. Ambos modelos están parametrizados por variable de entorno; si en el
> futuro cambian los modelos vigentes, actualízalos en `.env.local` sin tocar el código.
> Consulta los modelos disponibles en https://console.groq.com/docs/models

---

## ▶️ Cómo correrlo

```bash
npm install
npm run dev
```

Abre **http://localhost:3000**.

Para producción:

```bash
npm run build
npm run start
```

---

## 🗂️ Estructura del proyecto

La app está organizada por **feature** (`src/features/<módulo>`) para que agregar módulos
nuevos sea trivial. Lo transversal (cliente Groq, parseo JSON, primitivos de UI, utilidades
de descarga) se comparte.

```
src/
├── app/
│   ├── page.tsx                 # Dashboard: tarjetas de los 3 módulos
│   ├── layout.tsx               # Navbar + footer globales, fuentes y metadata
│   ├── trainer/page.tsx         # Módulo 1 (RepoInterview Trainer)
│   ├── cv/page.tsx              # Módulo 2 (Analizador de CV)
│   ├── entrevista/page.tsx      # Módulo 3 (Entrevista por Competencias)
│   ├── globals.css              # Tokens de color (CSS variables) y estilos base
│   └── api/
│       ├── repo|questions|evaluate/route.ts    # Backend del trainer
│       ├── cv/route.ts                          # Análisis de CV (Groq, JSON)
│       └── behavioral/generate|evaluate/route.ts# Entrevista competencias (Groq, JSON)
├── lib/                         # Transversal
│   ├── github.ts · groq.ts · json.ts · prompts.ts · types.ts
│   ├── export.ts               # Exportadores del trainer (PDF/CSV/XLSX)
│   ├── download.ts             # Helpers de descarga compartidos (blob, slug, autoTable)
│   ├── modules.ts              # Registro de los módulos (navbar + dashboard)
│   ├── site.ts · cn.ts
├── store/useAppStore.ts        # Estado del trainer (Zustand + sessionStorage)
├── features/
│   ├── cv/                     # types, prompts, api, useCvStore, export, componentes
│   └── behavioral/             # types, prompts, api, useBehavioralStore, export, componentes
└── components/
    ├── ui/                     # Button, Card, Badge, Segmented (primitivos)
    ├── Navbar.tsx              # Navegación entre módulos
    ├── DownloadButtons.tsx     # Botones de descarga genéricos (CV / competencias)
    ├── TrainerApp.tsx          # SPA por fases del trainer
    ├── RepoForm / QuizView / ResultsView / CodeBlock / ScoreRing / ExportButtons
```

### Presupuesto de lectura del repo

En [`src/lib/github.ts`](src/lib/github.ts) hay constantes comentadas y ajustables:

- `MAX_FILES` — máximo de archivos a incluir.
- `MAX_FILE_SIZE_KB` — tamaño máximo por archivo.
- `MAX_TOTAL_CHARS` — tope total del digest (presupuesto de tokens).
- `MAX_CHARS_PER_FILE` — recorte por archivo.

Están calibradas para el free tier de Groq. Si usas un plan de pago, puedes subirlas para
darle más contexto a la IA.

---

## 🔐 Seguridad y privacidad

- `GROQ_API_KEY` y `GITHUB_TOKEN` **solo** se usan en el servidor (API routes). Nunca
  llegan al cliente ni al bundle.
- El archivo `.env.local` está en `.gitignore` — **nunca lo subas al repositorio.**
- La URL de GitHub se **valida y sanitiza** antes de usarse.
- No se persiste nada: al recargar la página se pierde el estado (es intencional).

---

## 🧩 Manejo de errores (en español)

La app maneja y muestra mensajes claros para: URL inválida, repositorio no encontrado,
repositorio privado, límite de peticiones de GitHub excedido, repositorio sin archivos
analizables, API key de Groq inválida, y límites de uso de Groq.

---

## 📄 Formatos de exportación

- **PDF** — resumen, tabla de preguntas y detalle con respuestas correctas
  (`jsPDF` + `jspdf-autotable`).
- **CSV** — filas por pregunta con encabezado de resumen (`papaparse`, con BOM para Excel).
- **Excel (.xlsx)** — hojas "Resumen" y "Detalle" (`xlsx` / SheetJS).

El nombre del archivo incluye el repositorio y la fecha.

---

## 🔎 SEO y compartir en redes

La app trae identidad y metadatos listos, todo generado por código (sin assets
binarios) y coherente con el diseño:

- **Metadatos SEO**: título, descripción, keywords, canonical y `robots`/`sitemap`
  (`src/app/robots.ts`, `src/app/sitemap.ts`).
- **Tarjetas para redes** (WhatsApp, LinkedIn, X, Discord, Slack…): imagen Open
  Graph y Twitter de 1200×630 generada con `next/og`
  ([`src/app/opengraph-image.tsx`](src/app/opengraph-image.tsx)).
- **Ícono de la app**: favicon y apple-touch icon con el glifo `</>` de la marca
  ([`src/app/icon.tsx`](src/app/icon.tsx), `src/app/apple-icon.tsx`).
- **Web App Manifest** (`src/app/manifest.ts`): instalable como PWA, con
  `theme_color` y `background_color` de la marca.

Las URLs absolutas (OG, canonical, sitemap) se resuelven solas en Vercel. Si usas un
**dominio propio**, define `NEXT_PUBLIC_SITE_URL` (ver `.env.example`).

> Tras desplegar, valida las tarjetas en
> [opengraph.xyz](https://www.opengraph.xyz/) o el
> [Post Inspector de LinkedIn](https://www.linkedin.com/post-inspector/) pegando tu URL.

---

## ▲ Desplegar en Vercel

Este proyecto es un Next.js estándar; Vercel lo detecta y construye automáticamente
(`next build`). No requiere configuración especial.

### Opción A — GitHub + Vercel (recomendada)

1. **Sube el proyecto a GitHub.** Ya viene inicializado como repositorio git con un commit
   inicial, así que solo falta conectarlo a un remoto:

   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git branch -M main
   git push -u origin main
   ```

   > El archivo `.env.local` (con tu API key) está en `.gitignore` y **no se sube**. ✔️

2. **Importa el repo en Vercel:** entra a https://vercel.com/new, elige tu repositorio y
   pulsa _Import_. Vercel detectará Next.js automáticamente (no cambies los ajustes de
   build).

3. **Configura las variables de entorno** en Vercel antes de desplegar
   (_Settings → Environment Variables_, o durante el import):

   | Variable              | Obligatoria | Valor                                          |
   | --------------------- | ----------- | ---------------------------------------------- |
   | `GROQ_API_KEY`        | ✅ Sí       | Tu key de https://console.groq.com/keys        |
   | `GROQ_MODEL`          | Opcional    | `openai/gpt-oss-120b` (default)                |
   | `GROQ_MODEL_FALLBACK` | Opcional    | `llama-3.3-70b-versatile` (default)            |
   | `GITHUB_TOKEN`        | Opcional    | Sube el rate limit de GitHub a ~5000/hora      |

   Aplícalas a los entornos **Production**, **Preview** y **Development**.

4. **Deploy.** Vercel construye y publica. Cada `git push` posterior redespliega solo.

### Opción B — Vercel CLI

```bash
npm i -g vercel
vercel            # primer deploy (preview) — te pedirá login y configuración
vercel --prod     # deploy a producción
```

Añade las variables con `vercel env add GROQ_API_KEY` (y las opcionales) o desde el
dashboard.

### Notas de despliegue

- Las rutas de API declaran `maxDuration = 60` (segundos). Está dentro de los límites del
  plan **Hobby** (gratuito) de Vercel. Las llamadas reales a GitHub y Groq tardan pocos
  segundos, así que no deberías acercarte a ese tope.
- El límite de tokens/minuto del **free tier de Groq** aplica igual en producción: para
  quizzes de 3–10 preguntas va perfecto; para más, considera un plan de pago de Groq y
  sube las constantes del digest en [`src/lib/github.ts`](src/lib/github.ts).
- No hay dependencias nativas ni base de datos: el despliegue es 100% serverless y sin
  estado.

---

Hecho para ayudarte a llegar mejor preparado a tus entrevistas técnicas. Las respuestas se
procesan con IA y pueden contener errores: úsalas como guía de estudio, no como verdad
absoluta.
