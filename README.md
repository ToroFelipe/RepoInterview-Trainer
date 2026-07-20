# RepoInterview Trainer

**Prepárate para entrevistas técnicas a partir de un repositorio de GitHub.**

Pega la URL de un repositorio público, y una IA actúa como reclutador técnico: lee el
código, te hace preguntas sobre features, fragmentos de código, funciones y conceptos, y
al final te entrega una retroalimentación completa con puntaje, aciertos, errores y
recomendaciones de estudio. Puedes descargar el reporte en **PDF, CSV y Excel**.

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

```
src/
├── app/
│   ├── page.tsx              # SPA por fases: inicio → quiz → resultados
│   ├── layout.tsx            # Fuentes + metadata
│   ├── globals.css           # Tokens de color (CSS variables) y estilos base
│   └── api/
│       ├── repo/route.ts     # Lee el repo de GitHub y construye el "digest"
│       ├── questions/route.ts# Genera preguntas con Groq (JSON)
│       └── evaluate/route.ts # Evalúa las respuestas con Groq (JSON)
├── lib/
│   ├── github.ts             # Parseo de URL, árbol recursivo, raw, digest (con límites)
│   ├── groq.ts               # Cliente de Groq + fallback de modelo + modo JSON
│   ├── prompts.ts            # Prompts de sistema en español (reclutador + evaluador)
│   ├── json.ts               # Parseo seguro de JSON del LLM (limpia fences, recupera)
│   ├── export.ts             # Exportadores PDF / CSV / XLSX
│   ├── api.ts                # Cliente fetch del lado del navegador
│   ├── types.ts              # Tipos compartidos
│   └── cn.ts                 # Utilidad de clases (clsx + tailwind-merge)
├── store/
│   └── useAppStore.ts        # Estado global con Zustand
└── components/
    ├── ui/                   # Button, Card, Badge, Segmented (primitivos)
    ├── RepoForm.tsx          # Pantalla de inicio (URL + configuración)
    ├── QuizView.tsx          # Quiz interactivo
    ├── QuestionCard / CodeBlock.tsx  # Fragmentos con syntax highlighting
    ├── ResultsView.tsx       # Resultados + detalle + recomendaciones
    ├── ScoreRing.tsx         # Anillo de puntaje
    └── ExportButtons.tsx     # Descarga PDF / CSV / XLSX
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
