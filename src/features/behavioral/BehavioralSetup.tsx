"use client";

import { useState } from "react";
import {
  Users,
  Sparkles,
  AlertCircle,
  Briefcase,
  Hash,
  Target,
  History,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { useBehavioralStore } from "./useBehavioralStore";
import { generarPreguntasConductuales } from "./api";
import type { FocoConductual } from "./types";

const CANTIDADES = [3, 5, 8, 10, 15];

const FOCOS: { value: FocoConductual; label: string }[] = [
  { value: "mixto", label: "Mixto" },
  { value: "liderazgo", label: "Liderazgo" },
  { value: "trabajo-en-equipo", label: "Trabajo en equipo" },
  { value: "resolucion-conflictos", label: "Conflictos" },
  { value: "fortalezas-debilidades", label: "Fortalezas" },
  { value: "motivacion", label: "Motivación" },
];

export function BehavioralSetup() {
  const config = useBehavioralStore((s) => s.config);
  const setConfig = useBehavioralStore((s) => s.setConfig);
  const iniciar = useBehavioralStore((s) => s.iniciar);
  const historial = useBehavioralStore((s) => s.historial);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const { preguntas } = await generarPreguntasConductuales(config);
      iniciar(preguntas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14">
      <div className="mb-8 text-center animate-fade-up">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-ink-soft backdrop-blur">
          <Users className="size-3.5" />
          Entrevista por competencias / RRHH
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Practica la entrevista
          <br />
          por competencias
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-ink-soft">
          Preguntas de RRHH adaptadas a tu rol. Responde y recibe feedback con
          el método STAR, puntaje y respuestas modelo.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-4xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-sm sm:p-8"
      >
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
          <Briefcase className="size-4 text-muted" />
          Rol o puesto al que apuntas
        </label>
        <input
          type="text"
          value={config.rol}
          onChange={(e) => setConfig({ rol: e.target.value })}
          placeholder="Ej. Desarrollador Frontend Semi-senior"
          disabled={cargando}
          spellCheck={false}
          className="h-13 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-ink/30 disabled:opacity-60"
        />

        <div className="mt-6 grid gap-5">
          <Config
            icon={<Hash className="size-4" />}
            label="Cantidad de preguntas"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                size="sm"
                value={String(config.cantidad)}
                onChange={(v) => setConfig({ cantidad: Number(v) })}
                options={CANTIDADES.map((n) => ({
                  value: String(n),
                  label: String(n),
                }))}
              />
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={config.cantidad}
                  onChange={(e) =>
                    setConfig({ cantidad: Number(e.target.value) })
                  }
                  className="accent-ink"
                  aria-label="Cantidad de preguntas"
                />
                <span className="w-6 text-sm font-semibold tabular-nums text-ink">
                  {config.cantidad}
                </span>
              </div>
            </div>
          </Config>

          <Config icon={<Target className="size-4" />} label="Foco">
            <Segmented<FocoConductual>
              size="sm"
              value={config.foco}
              onChange={(v) => setConfig({ foco: v })}
              options={FOCOS}
            />
          </Config>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-bad/25 bg-bad-soft px-4 py-3 text-sm text-bad animate-fade-in">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" size="lg" loading={cargando} className="mt-6 w-full">
          {cargando ? "Generando preguntas…" : "Empezar entrevista"}
          {!cargando && <Sparkles className="size-4" />}
        </Button>

        {cargando && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-surface-muted/60 p-4 text-sm text-ink-soft animate-fade-in">
            <Loader2 className="size-4 animate-spin" />
            Preparando tus preguntas de competencias…
          </div>
        )}
      </form>

      {/* Historial */}
      {historial.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
            <History className="size-4 text-muted" />
            Sesiones anteriores
          </div>
          <div className="space-y-2">
            {historial.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/70 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{h.rol}</p>
                  <p className="text-xs text-muted">
                    {new Date(h.fecha).toLocaleDateString("es")} ·{" "}
                    {h.cantidad} preguntas
                  </p>
                </div>
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                    h.puntaje_global >= 75
                      ? "bg-good-soft text-good"
                      : h.puntaje_global >= 40
                      ? "bg-partial-soft text-partial"
                      : "bg-bad-soft text-bad"
                  )}
                >
                  <Check className="size-3" />
                  {h.puntaje_global}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 text-center text-xs text-muted">
        Tu sesión e historial se guardan solo en tu navegador.
      </p>
    </div>
  );
}

function Config({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2 text-sm font-medium text-ink">
        <span className="text-muted">{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}
