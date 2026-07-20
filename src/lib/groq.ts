import OpenAI from "openai";

/**
 * Cliente de Groq mediante el SDK de OpenAI (API compatible).
 * La API key vive SOLO en el servidor (process.env). Nunca en el cliente.
 */

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

// Modelos vigentes en Groq (parametrizados por env).
// Default principal: openai/gpt-oss-120b (razonamiento).
// Fallback: llama-3.3-70b-versatile.
// NOTA: se evitan a propósito Llama 4 Scout/Maverick (deprecados en Groq).
export const MODEL_PRIMARY =
  process.env.GROQ_MODEL || "openai/gpt-oss-120b";
export const MODEL_FALLBACK =
  process.env.GROQ_MODEL_FALLBACK || "llama-3.3-70b-versatile";

let cached: OpenAI | null = null;

export function getGroqClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta GROQ_API_KEY. Agrégala en tu archivo .env.local (ver .env.example)."
    );
  }
  if (!cached) {
    cached = new OpenAI({
      apiKey,
      baseURL: GROQ_BASE_URL,
      timeout: 60_000,
      maxRetries: 1,
    });
  }
  return cached;
}

interface ChatJsonOptions {
  system: string;
  user: string;
  temperature?: number;
  /** Máximo de tokens de salida. */
  maxTokens?: number;
}

/**
 * Llama a Groq en modo JSON con fallback automático de modelo.
 * Devuelve el string crudo (para parsear con safeParseJson).
 */
export async function chatJson({
  system,
  user,
  temperature = 0.4,
  maxTokens = 4096,
}: ChatJsonOptions): Promise<string> {
  const client = getGroqClient();
  const models = [MODEL_PRIMARY, MODEL_FALLBACK].filter(
    (m, i, arr) => arr.indexOf(m) === i
  );

  let lastError: unknown = null;

  for (const model of models) {
    try {
      // Los modelos de razonamiento (gpt-oss) consumen "reasoning tokens"
      // dentro de max_tokens. Con reasoning_effort bajo dejamos más
      // presupuesto para el JSON de salida y ganamos velocidad.
      const extra: Record<string, unknown> = model.includes("gpt-oss")
        ? { reasoning_effort: "low" }
        : {};

      const completion = await client.chat.completions.create({
        model,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        ...extra,
      });
      const content = completion.choices[0]?.message?.content;
      if (content && content.trim()) {
        return content;
      }
      lastError = new Error("El modelo devolvió una respuesta vacía.");
    } catch (err) {
      lastError = err;
      // Intenta con el siguiente modelo del arreglo.
    }
  }

  throw normalizeGroqError(lastError);
}

function normalizeGroqError(err: unknown): Error {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 401) {
      return new Error(
        "La GROQ_API_KEY es inválida. Verifícala en https://console.groq.com/keys"
      );
    }
    if (err.status === 429) {
      return new Error(
        "Se alcanzó el límite de uso de Groq. Espera un momento e inténtalo de nuevo."
      );
    }
    if (err.status === 404) {
      return new Error(
        "El modelo configurado no está disponible en Groq. Revisa GROQ_MODEL en tu .env.local."
      );
    }
    return new Error(`Error de Groq (${err.status}): ${err.message}`);
  }
  if (err instanceof Error) return err;
  return new Error("Error desconocido al llamar a Groq.");
}
