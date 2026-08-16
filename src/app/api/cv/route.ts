import { NextResponse } from "next/server";
import { chatJson } from "@/lib/groq";
import { safeParseJson } from "@/lib/json";
import { SYSTEM_CV, buildCvUser } from "@/features/cv/prompts";
import { clampPuntaje, limpiarLista } from "@/features/cv/normalize";
import type { CvAnalisis, CvRequest } from "@/features/cv/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Topes de entrada para respetar el límite de tokens/minuto del free tier de Groq.
const MAX_CV_CHARS = 8_000;
const MAX_OFERTA_CHARS = 3_500;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CvRequest;

    const cv = (body?.cv ?? "").trim();
    if (cv.length < 40) {
      return NextResponse.json(
        { error: "Pega el texto de tu CV (al menos unas líneas)." },
        { status: 400 }
      );
    }

    const oferta = (body?.oferta ?? "").trim();
    const tieneOferta = oferta.length > 0;

    const cvRecortado = cv.slice(0, MAX_CV_CHARS);
    const ofertaRecortada = tieneOferta
      ? oferta.slice(0, MAX_OFERTA_CHARS)
      : "";

    const raw = await chatJson({
      system: SYSTEM_CV,
      user: buildCvUser(cvRecortado, ofertaRecortada),
      temperature: 0.3,
      maxTokens: 3200,
    });

    const parsed = safeParseJson<Partial<CvAnalisis>>(raw);
    const analisis = normalizeCv(parsed, tieneOferta);

    return NextResponse.json(analisis);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error analizando el CV.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function normalizeCv(
  parsed: Partial<CvAnalisis>,
  tieneOferta: boolean
): CvAnalisis {
  const resumen =
    typeof parsed.resumen_reescrito === "string" &&
    parsed.resumen_reescrito.trim()
      ? parsed.resumen_reescrito.trim()
      : undefined;

  return {
    puntaje_match: clampPuntaje(parsed.puntaje_match),
    con_oferta: tieneOferta,
    keywords_faltantes: limpiarLista(parsed.keywords_faltantes, 20),
    fortalezas: limpiarLista(parsed.fortalezas),
    debilidades: limpiarLista(parsed.debilidades),
    logros_a_reformular: limpiarLista(parsed.logros_a_reformular),
    alertas_ats: limpiarLista(parsed.alertas_ats),
    sugerencias_priorizadas: limpiarLista(parsed.sugerencias_priorizadas),
    resumen_reescrito: resumen,
    requisitos_ats: [],
  };
}