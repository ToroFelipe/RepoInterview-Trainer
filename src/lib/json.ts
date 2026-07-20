/**
 * Parseo seguro de JSON devuelto por un LLM.
 * Limpia fences de markdown (```json ... ```) y hace un intento de
 * recuperación extrayendo el primer objeto {...} o arreglo [...] balanceado.
 */
export function safeParseJson<T = unknown>(raw: string): T {
  if (!raw || typeof raw !== "string") {
    throw new Error("Respuesta vacía del modelo.");
  }

  let text = raw.trim();

  // Quita fences ```json ... ``` o ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Intento directo
  try {
    return JSON.parse(text) as T;
  } catch {
    // continúa con recuperación
  }

  // Recuperación: extrae el primer bloque JSON balanceado ({...} o [...])
  const extracted = extractBalanced(text);
  if (extracted) {
    return JSON.parse(extracted) as T;
  }

  throw new Error("No se pudo interpretar la respuesta del modelo como JSON.");
}

/** Extrae el primer objeto o arreglo JSON balanceado de un string. */
function extractBalanced(text: string): string | null {
  const startObj = text.indexOf("{");
  const startArr = text.indexOf("[");
  let start = -1;
  let open = "{";
  let close = "}";

  if (startObj === -1 && startArr === -1) return null;
  if (startArr === -1 || (startObj !== -1 && startObj < startArr)) {
    start = startObj;
    open = "{";
    close = "}";
  } else {
    start = startArr;
    open = "[";
    close = "]";
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === open) {
      depth++;
    } else if (ch === close) {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}
