import { NextResponse } from "next/server";
import { chatJson } from "@/lib/groq";
import { safeParseJson } from "@/lib/json";
import { SYSTEM_CV_GEN, buildCvGenUser } from "@/features/cv/prompts";
import {
  clampPuntaje,
  limpiarLista,
  normalizeCvOptimizado,
} from "@/features/cv/normalize";
import type { CvAnalisis, CvOptimizado, CvRequest } from "@/features/cv/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CV_CHARS = 8_000;
const MAX_OFERTA_CHARS = 3_500;

/** Resumen del análisis usado como guía; opcional. */
interface OptimizarRequest extends CvRequest {
  resumen?: Partial<CvAnalisis>;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OptimizarRequest;

    const cv = (body?.cv ?? "").trim();
    if (cv.length < 40) {
      return NextResponse.json(
        { error: "Pega el texto de tu CV (al menos unas líneas)." },
        { status: 400 }
      );
    }

    const oferta = (body?.oferta ?? "").trim();
    const cvRecortado = cv.slice(0, MAX_CV_CHARS);
    const ofertaRecortada = oferta.slice(0, MAX_OFERTA_CHARS);

    const raw = await chatJson({
      system: SYSTEM_CV_GEN,
      user: buildCvGenUser(cvRecortado, ofertaRecortada, {
        puntaje_match: body?.resumen?.puntaje_match,
        keywords_faltantes: body?.resumen?.keywords_faltantes,
        alertas_ats: body?.resumen?.alertas_ats,
        logros_a_reformular: body?.resumen?.logros_a_reformular,
        sugerencias_priorizadas: body?.resumen?.sugerencias_priorizadas,
        resumen_reescrito: body?.resumen?.resumen_reescrito,
      }),
      temperature: 0.4,
      maxTokens: 4000,
    });

    const parsed = safeParseJson<{
      cv_optimizado?: Partial<CvOptimizado>;
      puntaje_ats?: unknown;
      requisitos_ats?: unknown;
    }>(raw);

    const cvOptimizado = normalizeCvOptimizado(parsed.cv_optimizado);
    if (!cvOptimizado) {
      return NextResponse.json(
        { error: "El modelo no pudo generar el CV optimizado. Inténtalo de nuevo." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      cv_optimizado: cvOptimizado,
      puntaje_ats: clampPuntaje(parsed.puntaje_ats),
      requisitos_ats: limpiarLista(parsed.requisitos_ats, 10),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error generando el CV optimizado.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}