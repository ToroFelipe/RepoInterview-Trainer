import { NextResponse } from "next/server";
import { chatJson } from "@/lib/groq";
import { safeParseJson } from "@/lib/json";
import { SYSTEM_GENERAR, buildGenerarUser } from "@/lib/prompts";
import type { Pregunta, QuizConfig, TipoPregunta } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const TIPOS_VALIDOS: TipoPregunta[] = [
  "feature",
  "codigo",
  "funcion",
  "concepto",
  "termino",
];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      digest?: string;
      config?: Partial<QuizConfig>;
    };

    if (!body?.digest) {
      return NextResponse.json(
        { error: "Falta el digest del repositorio." },
        { status: 400 }
      );
    }

    const config: QuizConfig = {
      cantidad: clamp(Number(body.config?.cantidad) || 5, 1, 20),
      dificultad: body.config?.dificultad ?? "semi-senior",
      foco: body.config?.foco ?? "mixto",
    };

    // max_tokens dinámico: escala con la cantidad de preguntas pero acotado
    // para no exceder el límite de tokens/minuto del free tier de Groq.
    const maxTokens = Math.min(4200, Math.max(2600, config.cantidad * 400 + 1400));

    const raw = await chatJson({
      system: SYSTEM_GENERAR,
      user: buildGenerarUser(body.digest, config),
      temperature: 0.6,
      maxTokens,
    });

    const parsed = safeParseJson<{ preguntas?: Pregunta[] }>(raw);
    const preguntas = normalizePreguntas(parsed.preguntas, config.cantidad);

    if (preguntas.length === 0) {
      return NextResponse.json(
        {
          error:
            "La IA no devolvió preguntas válidas. Inténtalo de nuevo o prueba con otro repositorio.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ preguntas });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error generando las preguntas.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Sanea y normaliza las preguntas devueltas por la IA. */
function normalizePreguntas(
  raw: Pregunta[] | undefined,
  cantidad: number
): Pregunta[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((q) => q && typeof q.pregunta === "string" && q.pregunta.trim())
    .slice(0, cantidad)
    .map((q, i) => ({
      id: q.id?.toString().trim() || `q${i + 1}`,
      pregunta: q.pregunta.trim(),
      tipo: TIPOS_VALIDOS.includes(q.tipo) ? q.tipo : "concepto",
      contexto:
        typeof q.contexto === "string" && q.contexto.trim()
          ? q.contexto
          : undefined,
      archivo:
        typeof q.archivo === "string" && q.archivo.trim()
          ? q.archivo.trim()
          : undefined,
      respuesta_esperada:
        typeof q.respuesta_esperada === "string"
          ? q.respuesta_esperada
          : "",
    }));
}
