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
