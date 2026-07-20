import type { RepoMeta, RepoDigestResponse } from "./types";

// ============================================================
//  Presupuesto de lectura (ajusta aquí para más/menos contexto)
// ============================================================
/** Máximo de archivos de código a descargar e incluir. */
const MAX_FILES = 18;
/** Tamaño máximo por archivo (KB). Archivos más grandes se truncan. */
const MAX_FILE_SIZE_KB = 60;
/**
 * Tope total de caracteres del digest que se envía a la IA (presupuesto de tokens).
 * Calibrado para el free tier de Groq (~8k TPM en gpt-oss-120b): ~14k chars ≈ ~4k tokens,
 * dejando margen para el prompt de sistema y la salida del modelo.
 * Si usas un plan de pago, puedes subirlo (p. ej. 40_000).
 */
const MAX_TOTAL_CHARS = 11_000;
/** Máximo de caracteres tomados de un solo archivo dentro del digest. */
const MAX_CHARS_PER_FILE = 3_200;
/** Timeout por request de red (ms). */
const FETCH_TIMEOUT_MS = 15_000;

// Extensiones de código fuente consideradas relevantes.
const CODE_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs",
  "py", "java", "go", "rb", "php", "rs",
  "c", "cc", "cpp", "h", "hpp", "cs",
  "kt", "kts", "swift", "scala", "dart", "vue", "svelte",
  "sql", "sh", "ex", "exs", "clj", "lua", "r", "m",
]);

// Archivos de configuración / documentación prioritarios.
const PRIORITY_FILES = [
  "readme", "package.json", "tsconfig.json", "next.config",
  "vite.config", "requirements.txt", "pyproject.toml", "pom.xml",
  "build.gradle", "go.mod", "cargo.toml", "gemfile", "composer.json",
  "dockerfile", "docker-compose", "makefile", "pnpm-workspace",
];

// Directorios y archivos a ignorar siempre.
const IGNORE_DIRS = [
  "node_modules/", "dist/", "build/", ".next/", "out/", "vendor/",
  ".git/", "coverage/", "__pycache__/", ".venv/", "venv/", "target/",
  "bin/", "obj/", ".idea/", ".vscode/", "public/", "assets/",
  "images/", "img/", "fonts/", "locales/", "migrations/",
];

const IGNORE_FILES_REGEX =
  /(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|composer\.lock|poetry\.lock|Cargo\.lock|\.min\.(js|css)$|\.map$)/i;

// Extensiones binarias / no textuales.
const BINARY_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "bmp",
  "pdf", "zip", "gz", "tar", "rar", "7z", "mp4", "mp3", "wav",
  "woff", "woff2", "ttf", "eot", "otf", "exe", "dll", "so",
  "dylib", "class", "jar", "pyc", "wasm", "bin", "dat", "db",
]);

export interface GithubError extends Error {
  status?: number;
  code?:
    | "invalid_url"
    | "not_found"
    | "private"
    | "rate_limit"
    | "too_large"
    | "empty"
    | "network";
}

function ghError(
  message: string,
  code: GithubError["code"],
  status?: number
): GithubError {
  const e = new Error(message) as GithubError;
  e.code = code;
  e.status = status;
  return e;
}

/** Extrae { owner, repo } de una URL de GitHub en distintos formatos. */
export function parseGithubUrl(
  input: string
): { owner: string; repo: string } {
  if (!input || typeof input !== "string") {
    throw ghError("Debes ingresar una URL de GitHub.", "invalid_url");
  }
  let raw = input.trim();

  // Soporta formato "owner/repo" directo.
  const shorthand = raw.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (shorthand) {
    return { owner: shorthand[1], repo: stripGit(shorthand[2]) };
  }

  // Normaliza: agrega protocolo si falta, convierte git@ SSH a https.
  raw = raw.replace(/^git@github\.com:/i, "https://github.com/");
  if (!/^https?:\/\//i.test(raw)) {
    raw = "https://" + raw;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw ghError("La URL ingresada no es válida.", "invalid_url");
  }

  if (!/(^|\.)github\.com$/i.test(url.hostname)) {
    throw ghError(
      "La URL debe ser de github.com (un repositorio público).",
      "invalid_url"
    );
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) {
    throw ghError(
      "No pude identificar el owner y el repositorio en la URL.",
      "invalid_url"
    );
  }

  return { owner: parts[0], repo: stripGit(parts[1]) };
}

function stripGit(repo: string): string {
  return repo.replace(/\.git$/i, "");
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RepoInterview-Trainer",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw ghError(
        "La conexión con GitHub tardó demasiado. Inténtalo de nuevo.",
        "network"
      );
    }
    throw ghError("No se pudo conectar con GitHub.", "network");
  } finally {
    clearTimeout(timer);
  }
}

/** Detecta rate limit por headers/estado y lanza un error claro. */
function assertNotRateLimited(res: Response): void {
  const remaining = res.headers.get("x-ratelimit-remaining");
  if (
    res.status === 403 &&
    (remaining === "0" || res.headers.get("x-ratelimit-limit"))
  ) {
    throw ghError(
      "Se alcanzó el límite de peticiones de la API pública de GitHub (~60/hora sin token). " +
        "Espera un momento o configura un GITHUB_TOKEN en .env.local para subirlo a 5000/hora.",
      "rate_limit",
      403
    );
  }
}

interface GithubRepoInfo {
  default_branch: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  private: boolean;
  size: number;
}

interface TreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  size?: number;
}

/**
 * Lee un repositorio público y construye un digest para la IA.
 * Minimiza llamadas: 1 request de metadatos + 1 request de árbol recursivo
 * + N requests raw (solo de archivos seleccionados).
 */
export async function buildRepoDigest(
  githubUrl: string
): Promise<RepoDigestResponse> {
  const { owner, repo } = parseGithubUrl(githubUrl);

  // 1) Metadatos y branch por defecto.
  const infoRes = await fetchWithTimeout(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers: githubHeaders() }
  );

  if (infoRes.status === 404) {
    throw ghError(
      "No encontré ese repositorio. Verifica la URL y que sea público.",
      "not_found",
      404
    );
  }
  assertNotRateLimited(infoRes);
  if (infoRes.status === 403) {
    throw ghError("GitHub rechazó la petición (403).", "rate_limit", 403);
  }
  if (!infoRes.ok) {
    throw ghError(
      `GitHub respondió con un error (${infoRes.status}).`,
      "network",
      infoRes.status
    );
  }

  const info = (await infoRes.json()) as GithubRepoInfo;
  if (info.private) {
    throw ghError(
      "Ese repositorio es privado. Solo puedo analizar repositorios públicos.",
      "private"
    );
  }

  const branch = info.default_branch || "main";

  // 2) Árbol recursivo (una sola llamada).
  const treeRes = await fetchWithTimeout(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: githubHeaders() }
  );
  assertNotRateLimited(treeRes);
  if (!treeRes.ok) {
    throw ghError(
      `No pude leer la estructura del repositorio (${treeRes.status}).`,
      "network",
      treeRes.status
    );
  }

  const treeJson = (await treeRes.json()) as {
    tree: TreeEntry[];
    truncated: boolean;
  };

  const blobs = treeJson.tree.filter(
    (e) => e.type === "blob" && !shouldIgnore(e.path)
  );

  if (blobs.length === 0) {
    throw ghError(
      "El repositorio no tiene archivos de texto analizables.",
      "empty"
    );
  }

  // 3) Selecciona archivos relevantes (prioridad + código representativo).
  const selected = selectFiles(blobs);

  // 4) Descarga contenido raw de los seleccionados.
  const contents = await Promise.all(
    selected.map(async (entry) => {
      const content = await fetchRaw(owner, repo, branch, entry.path);
      return { path: entry.path, content };
    })
  );

  // 5) Construye el digest respetando el presupuesto de caracteres.
  const digest = assembleDigest({
    owner,
    repo,
    branch,
    description: info.description,
    tree: blobs.map((b) => b.path),
    truncated: treeJson.truncated,
    files: contents.filter((c) => c.content !== null) as {
      path: string;
      content: string;
    }[],
  });

  const meta: RepoMeta = {
    owner,
    repo,
    branch,
    descripcion: info.description ?? undefined,
    lenguajes: info.language ? [info.language] : undefined,
    stars: info.stargazers_count,
    url: `https://github.com/${owner}/${repo}`,
    archivosIncluidos: contents.filter((c) => c.content !== null).length,
  };

  return { meta, digest };
}

function shouldIgnore(path: string): boolean {
  const lower = path.toLowerCase();
  if (IGNORE_DIRS.some((d) => lower.includes(d))) return true;
  if (IGNORE_FILES_REGEX.test(lower)) return true;
  const ext = extOf(lower);
  if (BINARY_EXTENSIONS.has(ext)) return true;
  return false;
}

function extOf(path: string): string {
  const base = path.split("/").pop() ?? "";
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot + 1).toLowerCase() : "";
}

function isPriority(path: string): boolean {
  const base = (path.split("/").pop() ?? "").toLowerCase();
  return PRIORITY_FILES.some((p) => base.startsWith(p) || base === p);
}

/**
 * Selecciona hasta MAX_FILES: primero los prioritarios (README, configs),
 * luego los archivos de código más significativos, favoreciendo los que
 * están más cerca de la raíz y con un tamaño razonable.
 */
function selectFiles(blobs: TreeEntry[]): TreeEntry[] {
  const priority = blobs.filter((b) => isPriority(b.path));

  const code = blobs
    .filter((b) => CODE_EXTENSIONS.has(extOf(b.path)) && !isPriority(b.path))
    .filter((b) => (b.size ?? 0) <= MAX_FILE_SIZE_KB * 1024)
    .sort((a, b) => {
      // Menos profundidad primero; a igual profundidad, mayor tamaño (más sustancia).
      const depthA = a.path.split("/").length;
      const depthB = b.path.split("/").length;
      if (depthA !== depthB) return depthA - depthB;
      return (b.size ?? 0) - (a.size ?? 0);
    });

  const combined = [...priority, ...code];
  // Dedup por path preservando orden.
  const seen = new Set<string>();
  const unique = combined.filter((b) => {
    if (seen.has(b.path)) return false;
    seen.add(b.path);
    return true;
  });

  return unique.slice(0, MAX_FILES);
}

async function fetchRaw(
  owner: string,
  repo: string,
  branch: string,
  path: string
): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodeURI(
        path
      )}`,
      { headers: { "User-Agent": "RepoInterview-Trainer" } }
    );
    if (!res.ok) return null;
    const text = await res.text();
    // Trunca por archivo.
    if (text.length > MAX_CHARS_PER_FILE) {
      return (
        text.slice(0, MAX_CHARS_PER_FILE) +
        `\n\n/* … archivo truncado (${Math.round(
          text.length / 1024
        )} KB en total) … */`
      );
    }
    return text;
  } catch {
    return null;
  }
}

interface AssembleArgs {
  owner: string;
  repo: string;
  branch: string;
  description: string | null;
  tree: string[];
  truncated: boolean;
  files: { path: string; content: string }[];
}

/** Ensambla el digest final (árbol + descripción + archivos) con tope global. */
function assembleDigest(args: AssembleArgs): string {
  const parts: string[] = [];

  parts.push(`# REPOSITORIO: ${args.owner}/${args.repo}`);
  parts.push(`Branch por defecto: ${args.branch}`);
  if (args.description) parts.push(`Descripción: ${args.description}`);
  parts.push("");

  // Árbol de directorios (limitado para no gastar el presupuesto).
  parts.push("## ESTRUCTURA DE ARCHIVOS");
  const treeSlice = args.tree.slice(0, 160);
  parts.push(renderTree(treeSlice));
  if (args.tree.length > treeSlice.length || args.truncated) {
    parts.push(`… (+${args.tree.length - treeSlice.length} archivos más)`);
  }
  parts.push("");

  // Contenido de archivos hasta agotar el presupuesto.
  parts.push("## CONTENIDO DE ARCHIVOS SELECCIONADOS");
  let total = parts.join("\n").length;

  for (const file of args.files) {
    const lang = extOf(file.path);
    const block = `\n### ${file.path}\n\`\`\`${lang}\n${file.content}\n\`\`\`\n`;
    if (total + block.length > MAX_TOTAL_CHARS) {
      // Intenta incluir al menos un recorte si aún hay algo de espacio.
      const remaining = MAX_TOTAL_CHARS - total;
      if (remaining > 800) {
        parts.push(
          `\n### ${file.path}\n\`\`\`${lang}\n${file.content.slice(
            0,
            remaining - 200
          )}\n/* … truncado … */\n\`\`\`\n`
        );
      }
      break;
    }
    parts.push(block);
    total += block.length;
  }

  return parts.join("\n");
}

/** Renderiza una lista de paths como un árbol de directorios legible. */
function renderTree(paths: string[]): string {
  const sorted = [...paths].sort();
  const lines: string[] = [];
  const seenDirs = new Set<string>();

  for (const path of sorted) {
    const segments = path.split("/");
    for (let i = 0; i < segments.length; i++) {
      const isFile = i === segments.length - 1;
      const prefix = segments.slice(0, i).join("/");
      const key = segments.slice(0, i + 1).join("/");
      const indent = "  ".repeat(i);
      if (isFile) {
        lines.push(`${indent}${segments[i]}`);
      } else if (!seenDirs.has(key)) {
        seenDirs.add(key);
        lines.push(`${indent}${segments[i]}/`);
      }
      void prefix;
    }
  }
  return lines.join("\n");
}
