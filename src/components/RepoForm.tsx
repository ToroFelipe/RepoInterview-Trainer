"use client";

import { useState } from "react";
import {
  Github,
  Sparkles,
  AlertCircle,
  Target,
  Layers,
  Hash,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { useAppStore } from "@/store/useAppStore";
import { analizarRepo, generarPreguntas } from "@/lib/api";
import type { Dificultad, Foco } from "@/lib/types";

const CANTIDADES = [3, 5, 10, 15];

type Etapa = "idle" | "leyendo" | "generando";

export function RepoForm() {
  const config = useAppStore((s) => s.config);
  const setConfig = useAppStore((s) => s.setConfig);
  const iniciarQuiz = useAppStore((s) => s.iniciarQuiz);

  const [url, setUrl] = useState("");
  const [etapa, setEtapa] = useState<Etapa>("idle");
  const [error, setError] = useState<string | null>(null);

  const cargando = etapa !== "idle";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!url.trim()) {
      setError("Pega la URL de un repositorio público de GitHub.");
      return;
    }

    try {
      setEtapa("leyendo");
      const { meta, digest } = await analizarRepo(url.trim());

      setEtapa("generando");
      const { preguntas } = await generarPreguntas(digest, config);

      iniciarQuiz({ repoMeta: meta, digest, preguntas });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
      setEtapa("idle");
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up">
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-ink-soft backdrop-blur">
          <Sparkles className="size-3.5" />
          Entrevistas técnicas con IA
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Prepárate para tu
          <br />
          entrevista técnica
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-ink-soft">
          Pega un repositorio de GitHub y una IA te entrevistará como un
          reclutador técnico: preguntas sobre features, código y conceptos, con
          retroalimentación y puntaje al final.
        </p>
      </div>

      {/* Tarjeta del formulario */}
      <form
        onSubmit={handleSubmit}
        className="rounded-4xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-sm sm:p-8"
      >
        {/* Input de URL */}
        <label className="mb-2 block text-sm font-medium text-ink">
          Repositorio de GitHub
        </label>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 shadow-soft transition focus-within:border-ink/30">
          <Github className="size-5 shrink-0 text-muted" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="github.com/facebook/react"
            disabled={cargando}
            spellCheck={false}
            autoComplete="off"
            className="h-13 w-full bg-transparent py-3 text-[15px] text-ink outline-none placeholder:text-muted disabled:opacity-60"
          />
        </div>

        {/* Configuración */}
        <div className="mt-6 grid gap-5">
          <Config icon={<Hash className="size-4" />} label="Cantidad de preguntas">
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
                  min={1}
                  max={20}
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

          <Config icon={<Layers className="size-4" />} label="Dificultad">
            <Segmented<Dificultad>
              size="sm"
              value={config.dificultad}
              onChange={(v) => setConfig({ dificultad: v })}
              options={[
                { value: "junior", label: "Junior" },
                { value: "semi-senior", label: "Semi-senior" },
                { value: "senior", label: "Senior" },
              ]}
            />
          </Config>

          <Config icon={<Target className="size-4" />} label="Foco">
            <Segmented<Foco>
              size="sm"
              value={config.foco}
              onChange={(v) => setConfig({ foco: v })}
              options={[
                { value: "mixto", label: "Mixto" },
                { value: "features", label: "Features" },
                { value: "codigo", label: "Código" },
                { value: "conceptos", label: "Conceptos" },
              ]}
            />
          </Config>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-bad/25 bg-bad-soft px-4 py-3 text-sm text-bad animate-fade-in">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Botón */}
        <Button
          type="submit"
          size="lg"
          loading={cargando}
          className="mt-6 w-full"
        >
          {etapa === "leyendo"
            ? "Leyendo repositorio…"
            : etapa === "generando"
            ? "Generando preguntas…"
            : "Analizar repositorio"}
          {!cargando && <Sparkles className="size-4" />}
        </Button>
        {cargando && (
          <div className="mt-5 flex flex-col gap-2.5 rounded-2xl bg-surface-muted/60 p-4 animate-fade-in">
            <Paso
              estado={etapa === "leyendo" ? "activo" : "hecho"}
              label="Leyendo el repositorio"
            />
            <Paso
              estado={etapa === "generando" ? "activo" : "pendiente"}
              label="Generando las preguntas con IA"
            />
          </div>
        )}
      </form>

      <p className="mt-5 text-center text-xs text-muted">
        Solo repositorios <span className="font-medium">públicos</span>. No se
        guarda nada: todo vive en tu navegador.
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

function Paso({
  estado,
  label,
}: {
  estado: "pendiente" | "activo" | "hecho";
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
          estado === "hecho"
            ? "bg-good text-white"
            : estado === "activo"
            ? "bg-primary text-primary-foreground"
            : "bg-surface text-muted ring-1 ring-border"
        )}
      >
        {estado === "hecho" ? (
          <Check className="size-3" />
        ) : estado === "activo" ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <span className="size-1.5 rounded-full bg-current" />
        )}
      </span>
      <span
        className={cn(
          "text-sm transition-colors",
          estado === "pendiente" ? "text-muted" : "text-ink"
        )}
      >
        {label}
      </span>
    </div>
  );
}
