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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TipoBadge } from "@/components/ui/Badge";
import { CodeBlock } from "@/components/CodeBlock";
import { useAppStore } from "@/store/useAppStore";
import { evaluarRespuestas } from "@/lib/api";
import { cn } from "@/lib/cn";

export function QuizView() {
  const {
    preguntas,
    indiceActual,
    respuestas,
    repoMeta,
    responder,
    siguiente,
    anterior,
    irA,
    setEvaluacion,
    verResultados,
    reiniciar,
  } = useAppStore();

  const respondidas = useAppStore((s) => s.respondidas());
  const getRespuestasArray = useAppStore((s) => s.getRespuestasArray);

  const [evaluando, setEvaluando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pregunta = preguntas[indiceActual];
  const total = preguntas.length;
  const esUltima = indiceActual === total - 1;
  const progreso = ((indiceActual + 1) / total) * 100;

  if (!pregunta) return null;

  async function finalizar() {
    setError(null);
    setEvaluando(true);
    try {
      const evaluacion = await evaluarRespuestas(
        preguntas,
        getRespuestasArray()
      );
      setEvaluacion(evaluacion);
      verResultados();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al evaluar.");
      setEvaluando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Barra superior: repo + progreso */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {repoMeta?.owner}/{repoMeta?.repo}
          </p>
          <p className="text-xs text-muted">
            {respondidas} de {total} respondidas
          </p>
        </div>
        <button
          onClick={reiniciar}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-surface-muted"
        >
          <RotateCcw className="size-3.5" />
          Cambiar repo
        </button>
      </div>

      {/* Progreso */}
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

      {/* Tarjeta de la pregunta */}
      <div
        key={pregunta.id}
        className="rounded-4xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-sm animate-fade-up sm:p-8"
      >
        <div className="mb-4 flex items-center gap-2">
          <TipoBadge tipo={pregunta.tipo} />
        </div>

        <h2 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
          {pregunta.pregunta}
        </h2>

        {pregunta.contexto && (
          <div className="mt-5">
            <CodeBlock code={pregunta.contexto} archivo={pregunta.archivo} />
          </div>
        )}

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-ink">
            Tu respuesta
          </label>
          <textarea
            value={respuestas[pregunta.id] ?? ""}
            onChange={(e) => responder(pregunta.id, e.target.value)}
            placeholder="Escribe tu respuesta como en una entrevista real…"
            rows={6}
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

      {/* Navegación */}
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
          <Button onClick={finalizar} loading={evaluando}>
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

      {/* Overlay de evaluación */}
      {evaluando && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-soft">
          <Loader2 className="size-4 animate-spin" />
          La IA está corrigiendo tus respuestas…
        </div>
      )}

      {/* Puntos de navegación rápida */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {preguntas.map((q, i) => {
          const contestada = (respuestas[q.id] ?? "").trim().length > 0;
          const activo = i === indiceActual;
          return (
            <button
              key={q.id}
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
