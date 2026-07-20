import type {
  RepoDigestResponse,
  Pregunta,
  QuizConfig,
  RespuestaUsuario,
  Evaluacion,
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
      (data as { error?: string })?.error ||
        `Ocurrió un error (${res.status}).`
    );
  }
  return data as T;
}

export function analizarRepo(url: string): Promise<RepoDigestResponse> {
  return postJson<RepoDigestResponse>("/api/repo", { url });
}

export function generarPreguntas(
  digest: string,
  config: QuizConfig
): Promise<{ preguntas: Pregunta[] }> {
  return postJson<{ preguntas: Pregunta[] }>("/api/questions", {
    digest,
    config,
  });
}

export function evaluarRespuestas(
  preguntas: Pregunta[],
  respuestas: RespuestaUsuario[]
): Promise<Evaluacion> {
  return postJson<Evaluacion>("/api/evaluate", { preguntas, respuestas });
}
