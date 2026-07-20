import { NextResponse } from "next/server";
import { chatJson } from "@/lib/groq";
import { safeParseJson } from "@/lib/json";
import {
  SYSTEM_EVALUAR_CONDUCTUAL,
  buildEvaluarConductualUser,
} from "@/features/behavioral/prompts";
import type {
  PreguntaConductual,
  EvaluacionConductual,
  EvaluacionConductualPregunta,
  Star,
} from "@/features/behavioral/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      preguntas?: PreguntaConductual[];
      respuestas?: Record<string, string>;
    };

    if (!Array.isArray(body?.preguntas) || body.preguntas.length === 0) {
      return NextResponse.json(
        { error: "Faltan las preguntas a evaluar." },
        { status: 400 }
      );
    }
    const respuestas =
      body.respuestas && typeof body.respuestas === "object"
        ? body.respuestas
        : {};

    const maxTokens = Math.min(
      4000,
      Math.max(2400, body.preguntas.length * 220 + 1200)
    );

    const raw = await chatJson({
      system: SYSTEM_EVALUAR_CONDUCTUAL,
      user: buildEvaluarConductualUser(body.preguntas, respuestas),
      temperature: 0.3,
      maxTokens,
    });

    const parsed = safeParseJson<{
      detalle?: EvaluacionConductualPregunta[];
      recomendaciones_generales?: string[];
    }>(raw);

    const evaluacion = normalizeEvaluacion(parsed, body.preguntas, respuestas);
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

function limpiarLista(v: unknown, max = 4): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim())
    .slice(0, max);
}

function normalizeStar(v: unknown): Star {
  const s = (v ?? {}) as Partial<Record<keyof Star, unknown>>;
  return {
    situacion: !!s.situacion,
    tarea: !!s.tarea,
    accion: !!s.accion,
    resultado: !!s.resultado,
  };
}

function normalizeEvaluacion(
  parsed: {
    detalle?: EvaluacionConductualPregunta[];
    recomendaciones_generales?: string[];
  },
  preguntas: PreguntaConductual[],
  respuestas: Record<string, string>
): EvaluacionConductual {
  const detalleMap = new Map(
    (parsed.detalle ?? []).map((d) => [d.preguntaId, d])
  );

  const detalle: EvaluacionConductualPregunta[] = preguntas.map((q) => {
    const d = detalleMap.get(q.id);
    const respondio = (respuestas[q.id] ?? "").trim().length > 0;

    if (!d) {
      return {
        preguntaId: q.id,
        star: {
          situacion: false,
          tarea: false,
          accion: false,
          resultado: false,
        },
        puntaje: respondio ? 40 : 0,
        fortalezas: [],
        mejoras: [
          respondio
            ? "No se pudo evaluar automáticamente. Estructura tu respuesta con Situación, Tarea, Acción y Resultado."
            : "No respondiste esta pregunta. Usa el método STAR para responder.",
        ],
        respuesta_modelo: "",
      };
    }

    return {
      preguntaId: q.id,
      star: normalizeStar(d.star),
      puntaje: clampPuntaje(d.puntaje),
      fortalezas: limpiarLista(d.fortalezas),
      mejoras: limpiarLista(d.mejoras),
      respuesta_modelo:
        typeof d.respuesta_modelo === "string" ? d.respuesta_modelo.trim() : "",
    };
  });

  const puntaje_global =
    detalle.length > 0
      ? Math.round(
          detalle.reduce((sum, d) => sum + d.puntaje, 0) / detalle.length
        )
      : 0;

  const recomendaciones_generales = limpiarLista(
    parsed.recomendaciones_generales,
    6
  );

  return { puntaje_global, recomendaciones_generales, detalle };
}
