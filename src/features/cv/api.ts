import type { CvAnalisis } from "./types";

/** Cliente del navegador para el analizador de CV. */
export async function analizarCv(
  cv: string,
  oferta?: string
): Promise<CvAnalisis> {
  let res: Response;
  try {
    res = await fetch("/api/cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv, oferta }),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Revisa tu conexión.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error || `Ocurrió un error (${res.status}).`
    );
  }
  return data as CvAnalisis;
}

/** Resultado de generar el CV optimizado para ATS. */
export interface OptimizarResultado {
  cv_optimizado: NonNullable<CvAnalisis["cv_optimizado"]>;
  puntaje_ats: number;
  requisitos_ats: string[];
}

/**
 * Genera el CV completo optimizado para ATS en una llamada aparte,
 * para no alargar la llamada de análisis (evita timeouts del server).
 */
export async function optimizarCv(
  cv: string,
  oferta: string,
  resumen: Partial<CvAnalisis>
): Promise<OptimizarResultado> {
  let res: Response;
  try {
    res = await fetch("/api/cv/optimizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv, oferta, resumen }),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Revisa tu conexión.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ||
        `Ocurrió un error generando el CV (${
          res.status === 504 ? "timeout" : res.status
        }).`
    );
  }
  return data as OptimizarResultado;
}