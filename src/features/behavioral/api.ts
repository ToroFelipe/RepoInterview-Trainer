import type {
  BehavioralConfig,
  PreguntaConductual,
  EvaluacionConductual,
} from "./types";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
  return data as T;
}

export function generarPreguntasConductuales(
  config: BehavioralConfig
): Promise<{ preguntas: PreguntaConductual[] }> {
  return postJson("/api/behavioral/generate", { config });
}

export function evaluarConductual(
  preguntas: PreguntaConductual[],
  respuestas: Record<string, string>
): Promise<EvaluacionConductual> {
  return postJson("/api/behavioral/evaluate", { preguntas, respuestas });
}
