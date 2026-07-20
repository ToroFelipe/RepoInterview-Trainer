import { NextResponse } from "next/server";
import { chatJson } from "@/lib/groq";
import { safeParseJson } from "@/lib/json";
import { SYSTEM_EVALUAR, buildEvaluarUser } from "@/lib/prompts";
import type {
  Pregunta,
  RespuestaUsuario,
  Evaluacion,
  EvaluacionPregunta,
  Veredicto,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const VEREDICTOS: Veredicto[] = ["bien", "parcial", "mal"];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      preguntas?: Pregunta[];
      respuestas?: RespuestaUsuario[];
    };

    if (!Array.isArray(body?.preguntas) || body.preguntas.length === 0) {
      return NextResponse.json(
        { error: "Faltan las preguntas a evaluar." },
        { status: 400 }
      );
    }
    const respuestas = Array.isArray(body.respuestas) ? body.respuestas : [];

    // max_tokens dinámico acotado al free tier de Groq (~8-12k TPM).
    const maxTokens = Math.min(
      4200,
      Math.max(2600, body.preguntas.length * 380 + 1400)
    );

    const raw = await chatJson({
      system: SYSTEM_EVALUAR,
      user: buildEvaluarUser(body.preguntas, respuestas),
      temperature: 0.2,
      maxTokens,
    });

    const parsed = safeParseJson<{
      detalle?: EvaluacionPregunta[];
      recomendaciones?: string[];
    }>(raw);

    const evaluacion = normalizeEvaluacion(
      parsed,
      body.preguntas,
      respuestas
    );

    return NextResponse.json(evaluacion);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error evaluando las respuestas.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function clampPuntaje(n: unknown): number {
  const v = Math.round(Number(n));
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

/** Sanea la evaluación y calcula globales de forma robusta. */
function normalizeEvaluacion(
  parsed: { detalle?: EvaluacionPregunta[]; recomendaciones?: string[] },
  preguntas: Pregunta[],
  respuestas: RespuestaUsuario[]
): Evaluacion {
  const respMap = new Map(respuestas.map((r) => [r.preguntaId, r.texto]));
  const detalleMap = new Map(
    (parsed.detalle ?? []).map((d) => [d.preguntaId, d])
  );

  const detalle: EvaluacionPregunta[] = preguntas.map((q) => {
    const d = detalleMap.get(q.id);
    const respondio = (respMap.get(q.id) ?? "").trim().length > 0;

    if (!d) {
      return {
        preguntaId: q.id,
        correcta: respondio ? "parcial" : "mal",
        puntaje: respondio ? 40 : 0,
        comentario: respondio
          ? "No se pudo evaluar automáticamente esta respuesta."
          : "No respondiste esta pregunta.",
        respuesta_correcta: q.respuesta_esperada || "—",
      };
    }

    const correcta: Veredicto = VEREDICTOS.includes(d.correcta)
      ? d.correcta
      : "parcial";

    return {
      preguntaId: q.id,
      correcta,
      puntaje: clampPuntaje(d.puntaje),
      comentario:
        typeof d.comentario === "string" && d.comentario.trim()
          ? d.comentario.trim()
          : "—",
      respuesta_correcta:
        typeof d.respuesta_correcta === "string" && d.respuesta_correcta.trim()
          ? d.respuesta_correcta.trim()
          : q.respuesta_esperada || "—",
    };
  });

  const resumen = {
    bien: detalle.filter((d) => d.correcta === "bien").length,
    parcial: detalle.filter((d) => d.correcta === "parcial").length,
    mal: detalle.filter((d) => d.correcta === "mal").length,
  };

  const puntaje_global =
    detalle.length > 0
      ? Math.round(
          detalle.reduce((sum, d) => sum + d.puntaje, 0) / detalle.length
        )
      : 0;

  const recomendaciones = Array.isArray(parsed.recomendaciones)
    ? parsed.recomendaciones
        .filter((r) => typeof r === "string" && r.trim())
        .map((r) => r.trim())
        .slice(0, 6)
    : [];

  return { puntaje_global, resumen, detalle, recomendaciones };
}
