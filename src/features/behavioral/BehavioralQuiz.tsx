"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Star,
  AlertCircle,
  Loader2,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useBehavioralStore } from "./useBehavioralStore";
import { evaluarConductual } from "./api";

export function BehavioralQuiz() {
  const {
    preguntas,
    indiceActual,
    respuestas,
    config,
    responder,
    siguiente,
    anterior,
    irA,
    finalizar,
    reiniciar,
  } = useBehavioralStore();

  const respondidas = useBehavioralStore((s) => s.respondidas());

  const [evaluando, setEvaluando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pregunta = preguntas[indiceActual];
  const total = preguntas.length;
  const esUltima = indiceActual === total - 1;
  const progreso = ((indiceActual + 1) / total) * 100;

  if (!pregunta) return null;

  async function handleFinalizar() {
    setError(null);
    setEvaluando(true);
    try {
      const evaluacion = await evaluarConductual(preguntas, respuestas);
      finalizar(evaluacion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al evaluar.");
      setEvaluando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {config.rol.trim() || "Entrevista por competencias"}
          </p>
          <p className="text-xs text-muted">
            {respondidas} de {total} respondidas
          </p>
        </div>
        <button
          type="button"
          onClick={reiniciar}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-surface-muted"
        >
          <RotateCcw className="size-3.5" />
          Reiniciar
        </button>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
          <span>
            Pregunta {indiceActual + 1} de {total}
          </span>
          <span className="tabular-nums">{Math.round(progreso)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <div
        key={pregunta.id}
        className="rounded-4xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-sm animate-fade-up sm:p-8"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-pastel-peach px-2.5 py-1 text-xs font-medium text-ink">
            {pregunta.categoria}
          </span>
          {pregunta.que_evalua && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Eye className="size-3.5" />
              Evalúa: {pregunta.que_evalua}
            </span>
          )}
        </div>

        <h2 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
          {pregunta.pregunta}
        </h2>

        <div className="mt-4 rounded-2xl bg-surface-muted/50 px-4 py-3 text-xs leading-relaxed text-ink-soft">
          <span className="font-semibold">Consejo:</span> estructura tu respuesta
          con <span className="font-semibold">STAR</span> — Situación, Tarea,
          Acción y Resultado. Usa &ldquo;yo hice&rdquo; y cierra con un
          resultado concreto.
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-ink">
            Tu respuesta
          </label>
          <textarea
            value={respuestas[pregunta.id] ?? ""}
            onChange={(e) => responder(pregunta.id, e.target.value)}
            placeholder="Cuenta tu experiencia como en una entrevista real…"
            rows={8}
            className="w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-ink/30"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-bad/25 bg-bad-soft px-4 py-3 text-sm text-bad animate-fade-in">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={anterior}
          disabled={indiceActual === 0 || evaluando}
        >
          <ArrowLeft className="size-4" />
          Anterior
        </Button>

        {esUltima ? (
          <Button onClick={handleFinalizar} loading={evaluando}>
            {evaluando ? "Evaluando respuestas…" : "Finalizar y evaluar"}
            {!evaluando && <Check className="size-4" />}
          </Button>
        ) : (
          <Button variant="secondary" onClick={siguiente} disabled={evaluando}>
            Siguiente
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>

      {evaluando && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-soft">
          <Loader2 className="size-4 animate-spin" />
          La IA está evaluando tus respuestas con el método STAR…
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {preguntas.map((q, i) => {
          const contestada = (respuestas[q.id] ?? "").trim().length > 0;
          const activo = i === indiceActual;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => irA(i)}
              disabled={evaluando}
              aria-label={`Ir a la pregunta ${i + 1}`}
              className={cn(
                "flex size-8 items-center justify-center rounded-xl text-xs font-semibold transition",
                activo
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : contestada
                  ? "bg-good-soft text-good"
                  : "bg-surface-muted text-muted hover:bg-surface"
              )}
            >
              {contestada && !activo ? (
                <Star className="size-3.5 fill-current" />
              ) : (
                i + 1
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
