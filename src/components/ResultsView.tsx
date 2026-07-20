"use client";

import { useState } from "react";
import {
  ChevronDown,
  Lightbulb,
  RotateCcw,
  Trophy,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TipoBadge, VeredictoBadge } from "@/components/ui/Badge";
import { CodeBlock } from "@/components/CodeBlock";
import { ScoreRing } from "@/components/ScoreRing";
import { ExportButtons } from "@/components/ExportButtons";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";
import type { Veredicto } from "@/lib/types";

const MENSAJE_PUNTAJE = (s: number) =>
  s >= 85
    ? "¡Excelente! Dominas este repositorio."
    : s >= 70
    ? "Muy bien. Estás casi listo para la entrevista."
    : s >= 50
    ? "Buen avance. Refuerza los puntos débiles."
    : "Hay camino por recorrer. Repasa y vuelve a intentarlo.";

// Color del chip numérico según veredicto (codificación cromática sin franja lateral).
const CHIP_VEREDICTO: Record<Veredicto, string> = {
  bien: "bg-good-soft text-good",
  parcial: "bg-partial-soft text-partial",
  mal: "bg-bad-soft text-bad",
};

export function ResultsView() {
  const { preguntas, respuestas, evaluacion, repoMeta, reiniciar } =
    useAppStore();
  const [abierta, setAbierta] = useState<string | null>(
    preguntas[0]?.id ?? null
  );

  if (!evaluacion || !repoMeta) return null;

  const { puntaje_global, resumen, recomendaciones } = evaluacion;

  return (
    <div className="mx-auto w-full max-w-3xl animate-fade-up">
      {/* Encabezado de resultados */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted">
            <Trophy className="size-3.5" />
            Resultados de la entrevista
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {repoMeta.owner}/{repoMeta.repo}
          </h1>
        </div>
        <Button variant="secondary" size="sm" onClick={reiniciar}>
          <RotateCcw className="size-3.5" />
          Nueva entrevista
        </Button>
      </div>

      {/* Tarjeta de puntaje */}
      <div className="rounded-4xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-sm sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <ScoreRing score={puntaje_global} />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-lg font-semibold text-ink">
              {MENSAJE_PUNTAJE(puntaje_global)}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="Bien" value={resumen.bien} tone="good" />
              <Stat label="Parcial" value={resumen.parcial} tone="partial" />
              <Stat label="Mal" value={resumen.mal} tone="bad" />
            </div>
          </div>
        </div>

        {/* Exportar */}
        <div className="mt-7 border-t border-border pt-6">
          <p className="mb-3 text-sm font-medium text-ink">
            Descargar reporte
          </p>
          <ExportButtons
            data={{ repoMeta, preguntas, respuestas, evaluacion }}
          />
        </div>
      </div>

      {/* Recomendaciones */}
      {recomendaciones.length > 0 && (
        <div className="mt-5 rounded-4xl border border-border bg-pastel-yellow/40 p-6 sm:p-7">
          <div className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <Lightbulb className="size-5 text-partial" />
            Recomendaciones de estudio
          </div>
          <ul className="space-y-2.5">
            {recomendaciones.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-partial" />
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detalle por pregunta */}
      <h2 className="mb-4 mt-8 text-lg font-semibold text-ink">
        Detalle por pregunta
      </h2>
      <div className="space-y-3">
        {preguntas.map((q, i) => {
          const evalQ = evaluacion.detalle.find((d) => d.preguntaId === q.id);
          if (!evalQ) return null;
          const open = abierta === q.id;
          const respUsuario = (respuestas[q.id] ?? "").trim();

          return (
            <div
              key={q.id}
              style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
              className="overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-soft backdrop-blur-sm transition-shadow animate-fade-up hover:shadow-card"
            >
              <button
                onClick={() => setAbierta(open ? null : q.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-5 text-left transition hover:bg-surface-muted/40"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                    CHIP_VEREDICTO[evalQ.correcta]
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-medium text-ink sm:text-[15px]">
                    {q.pregunta}
                  </span>
                </span>
                <span className="hidden shrink-0 sm:block">
                  <TipoBadge tipo={q.tipo} />
                </span>
                <VeredictoBadge veredicto={evalQ.correcta} />
                <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
                  {evalQ.puntaje}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted transition-transform",
                    open && "rotate-180"
                  )}
                />
              </button>

              {open && (
                <div className="space-y-4 border-t border-border px-5 pb-5 pt-4 animate-fade-in">
                  {q.contexto && (
                    <CodeBlock code={q.contexto} archivo={q.archivo} />
                  )}

                  {/* Respuesta del usuario */}
                  <Bloque
                    icon={<MessageSquare className="size-3.5" />}
                    titulo="Tu respuesta"
                  >
                    <p
                      className={cn(
                        "whitespace-pre-wrap text-sm leading-relaxed",
                        respUsuario ? "text-ink-soft" : "italic text-muted"
                      )}
                    >
                      {respUsuario || "No respondiste esta pregunta."}
                    </p>
                  </Bloque>

                  {/* Comentario de la IA */}
                  <Bloque
                    icon={<Lightbulb className="size-3.5" />}
                    titulo="Comentario del evaluador"
                  >
                    <p className="text-sm leading-relaxed text-ink-soft">
                      {evalQ.comentario}
                    </p>
                  </Bloque>

                  {/* Respuesta correcta */}
                  <Bloque
                    icon={<CheckCircle2 className="size-3.5 text-good" />}
                    titulo="Respuesta correcta"
                    className="bg-good-soft/50"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                      {evalQ.respuesta_correcta}
                    </p>
                  </Bloque>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "partial" | "bad";
}) {
  const styles = {
    good: "bg-good-soft text-good",
    partial: "bg-partial-soft text-partial",
    bad: "bg-bad-soft text-bad",
  }[tone];
  return (
    <div className={cn("rounded-2xl px-3 py-3 text-center", styles)}>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
    </div>
  );
}

function Bloque({
  icon,
  titulo,
  children,
  className,
}: {
  icon: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-surface-muted/50 p-4", className)}>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        {icon}
        {titulo}
      </div>
      {children}
    </div>
  );
}
