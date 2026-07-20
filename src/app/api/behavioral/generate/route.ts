import { NextResponse } from "next/server";
import { chatJson } from "@/lib/groq";
import { safeParseJson } from "@/lib/json";
import {
  SYSTEM_GENERAR_CONDUCTUAL,
  buildGenerarConductualUser,
} from "@/features/behavioral/prompts";
import type {
  BehavioralConfig,
  PreguntaConductual,
  FocoConductual,
} from "@/features/behavioral/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const FOCOS: FocoConductual[] = [
  "mixto",
  "liderazgo",
  "trabajo-en-equipo",
  "resolucion-conflictos",
  "fortalezas-debilidades",
  "motivacion",
];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { config?: Partial<BehavioralConfig> };

    const config: BehavioralConfig = {
      rol: (body.config?.rol ?? "").toString().slice(0, 120),
      cantidad: clamp(Number(body.config?.cantidad) || 5, 3, 15),
      foco: FOCOS.includes(body.config?.foco as FocoConductual)
        ? (body.config!.foco as FocoConductual)
        : "mixto",
    };

    const maxTokens = Math.min(3800, Math.max(1600, config.cantidad * 160 + 900));

    const raw = await chatJson({
      system: SYSTEM_GENERAR_CONDUCTUAL,
      user: buildGenerarConductualUser(config),
      temperature: 0.7,
      maxTokens,
    });

    const parsed = safeParseJson<{ preguntas?: PreguntaConductual[] }>(raw);
    const preguntas = normalizePreguntas(parsed.preguntas, config.cantidad);

    if (preguntas.length === 0) {
      return NextResponse.json(
        {
          error:
            "La IA no devolvió preguntas válidas. Inténtalo de nuevo.",
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

function normalizePreguntas(
  raw: PreguntaConductual[] | undefined,
  cantidad: number
): PreguntaConductual[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((q) => q && typeof q.pregunta === "string" && q.pregunta.trim())
    .slice(0, cantidad)
    .map((q, i) => ({
      id: q.id?.toString().trim() || `p${i + 1}`,
      pregunta: q.pregunta.trim(),
      categoria:
        typeof q.categoria === "string" && q.categoria.trim()
          ? q.categoria.trim()
          : "General",
      que_evalua:
        typeof q.que_evalua === "string" && q.que_evalua.trim()
          ? q.que_evalua.trim()
          : "",
    }));
}
