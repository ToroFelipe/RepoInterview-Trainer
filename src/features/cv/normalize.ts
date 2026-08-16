// Normalizadores compartidos entre las rutas del analizador de CV.
import type { CvOptimizado } from "./types";

export const MAX_CONTENIDO_CHARS = 12_000;

export function clampPuntaje(n: unknown): number {
  const v = Math.round(Number(n));
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

export function limpiarLista(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim())
    .slice(0, max);
}

export function normalizeCvOptimizado(v: unknown): CvOptimizado | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Partial<CvOptimizado>;
  const contenido =
    typeof o.contenido === "string" && o.contenido.trim().length >= 240
      ? o.contenido.trim()
      : "";
  if (!contenido) return undefined;

  const nombre =
    typeof o.titulo === "string" && o.titulo.trim()
      ? o.titulo.trim()
      : "CV Optimizado";

  return {
    titulo: nombre.slice(0, 80),
    categoria:
      typeof o.categoria === "string" && o.categoria.trim()
        ? o.categoria.trim().slice(0, 40)
        : undefined,
    descripcion:
      typeof o.descripcion === "string" && o.descripcion.trim()
        ? o.descripcion.trim().slice(0, 300)
        : "",
    contenido: contenido.slice(0, MAX_CONTENIDO_CHARS),
  };
}