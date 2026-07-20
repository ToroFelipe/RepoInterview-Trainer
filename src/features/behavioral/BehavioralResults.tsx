"use client";

import { useState } from "react";
import {
  ChevronDown,
  Lightbulb,
  RotateCcw,
  Trophy,
  MessageSquare,
  ThumbsUp,
  Wrench,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScoreRing } from "@/components/ScoreRing";
import { DownloadButtons } from "@/components/DownloadButtons";
import { cn } from "@/lib/cn";
import { useBehavioralStore } from "./useBehavioralStore";
import {
  exportBehavioralPDF,
  exportBehavioralCSV,
  exportBehavioralXLSX,
} from "./export";
import type { Star } from "./types";

const MENSAJE = (s: number) =>
  s >= 85
    ? "¡Excelente! Tus respuestas están muy bien estructuradas."
    : s >= 70
    ? "Muy bien. Pequeños ajustes y estarás listo."
    : s >= 50
    ? "Buen avance. Refuerza la estructura STAR."
    : "Practica el método STAR: te dará mucha más claridad.";

const STAR_LABEL: { key: keyof Star; label: string; full: string }[] = [
  { key: "situacion", label: "S", full: "Situación" },
  { key: "tarea", label: "T", full: "Tarea" },
  { key: "accion", label: "A", full: "Acción" },
  { key: "resultado", label: "R", full: "Resultado" },
];

function tonoPuntaje(s: number): string {
  return s >= 75
    ? "bg-good-soft text-good"
    : s >= 40
    ? "bg-partial-soft text-partial"
    : "bg-bad-soft text-bad";
}

export function BehavioralResults() {
  const { preguntas, respuestas, evaluacion, config, reiniciar } =
    useBehavioralStore();
  const [abierta, setAbierta] = useState<string | null>(
    preguntas[0]?.id ?? null
  );

  if (!evaluacion) return null;

  const { puntaje_global, recomendaciones_generales } = evaluacion;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 animate-fade-up sm:py-14">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted">
            <Trophy className="size-3.5" />
            Resultados de la entrevista conductual
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {config.rol.trim() || "Entrevista conductual"}
          </h1>
        </div>
        <Button variant="secondary" size="sm" onClick={reiniciar}>
          <RotateCcw className="size-3.5" />
          Nueva entrevista
        </Button>
      </div>

      {/* Puntaje */}
      <div className="rounded-4xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-sm sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <ScoreRing score={puntaje_global} />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-lg font-semibold text-ink">
              {MENSAJE(puntaje_global)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Puntaje promedio de estructura, claridad y resultados en tus{" "}
              {preguntas.length} respuestas.
            </p>
          </div>
        </div>

        <div className="mt-7 border-t border-border pt-6">
          <p className="mb-3 text-sm font-medium text-ink">Descargar reporte</p>
          <DownloadButtons
            onPdf={() =>
              exportBehavioralPDF({ config, preguntas, respuestas, evaluacion })
            }
            onCsv={() =>
              exportBehavioralCSV({ config, preguntas, respuestas, evaluacion })
            }
            onXlsx={() =>
              exportBehavioralXLSX({ config, preguntas, respuestas, evaluacion })
            }
          />
        </div>
      </div>

      {/* Recomendaciones */}
      {recomendaciones_generales.length > 0 && (
        <div className="mt-5 rounded-4xl border border-border bg-pastel-yellow/40 p-6 sm:p-7">
          <div className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <Lightbulb className="size-5 text-partial" />
            Recomendaciones generales
          </div>
          <ul className="space-y-2.5">
            {recomendaciones_generales.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-ink-soft"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-partial" />
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detalle */}
      <h2 className="mb-4 mt-8 text-lg font-semibold text-ink">
        Detalle por pregunta
      </h2>
      <div className="space-y-3">
        {preguntas.map((q, i) => {
          const e = evaluacion.detalle.find((d) => d.preguntaId === q.id);
          if (!e) return null;
          const open = abierta === q.id;
          const respUsuario = (respuestas[q.id] ?? "").trim();

          return (
            <div
              key={q.id}
              className="overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-soft backdrop-blur-sm transition-shadow animate-fade-up hover:shadow-card"
            >
              <button
                type="button"
                onClick={() => setAbierta(open ? null : q.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-5 text-left transition hover:bg-surface-muted/40"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                    tonoPuntaje(e.puntaje)
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-medium text-ink sm:text-[15px]">
                    {q.pregunta}
                  </span>
                </span>
                <StarChips star={e.star} compact />
                <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
                  {e.puntaje}
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
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-pastel-peach px-2.5 py-1 text-xs font-medium text-ink">
                      {q.categoria}
                    </span>
                    <StarChips star={e.star} />
                  </div>

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

                  {e.fortalezas.length > 0 && (
                    <Bloque
                      icon={<ThumbsUp className="size-3.5 text-good" />}
                      titulo="Fortalezas"
                    >
                      <ul className="space-y-1.5">
                        {e.fortalezas.map((f, j) => (
                          <li
                            key={j}
                            className="text-sm leading-relaxed text-ink-soft"
                          >
                            • {f}
                          </li>
                        ))}
                      </ul>
                    </Bloque>
                  )}

                  {e.mejoras.length > 0 && (
                    <Bloque
                      icon={<Wrench className="size-3.5 text-partial" />}
                      titulo="Cómo mejorarla"
                    >
                      <ul className="space-y-1.5">
                        {e.mejoras.map((m, j) => (
                          <li
                            key={j}
                            className="text-sm leading-relaxed text-ink-soft"
                          >
                            • {m}
                          </li>
                        ))}
                      </ul>
                    </Bloque>
                  )}

                  {e.respuesta_modelo && (
                    <Bloque
                      icon={<Sparkles className="size-3.5 text-good" />}
                      titulo="Respuesta modelo"
                      className="bg-good-soft/50"
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                        {e.respuesta_modelo}
                      </p>
                    </Bloque>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StarChips({ star, compact }: { star: Star; compact?: boolean }) {
  return (
    <span className={cn("hidden shrink-0 gap-1", compact ? "sm:flex" : "flex")}>
      {STAR_LABEL.map(({ key, label, full }) => {
        const on = star[key];
        return (
          <span
            key={key}
            title={full}
            className={cn(
              "flex size-5 items-center justify-center rounded-md text-[10px] font-bold",
              on ? "bg-good text-white" : "bg-surface-muted text-muted"
            )}
          >
            {label}
          </span>
        );
      })}
    </span>
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
