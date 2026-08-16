"use client";

import { useState } from "react";
import {
  FileSearch,
  Sparkles,
  AlertCircle,
  Briefcase,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCvStore } from "./useCvStore";
import { analizarCv } from "./api";
import { CvResults } from "./CvResults";
import { MisCVs } from "./MisCVs";

export function CvAnalyzer() {
  const cvTexto = useCvStore((s) => s.cvTexto);
  const ofertaTexto = useCvStore((s) => s.ofertaTexto);
  const resultado = useCvStore((s) => s.resultado);
  const setCv = useCvStore((s) => s.setCv);
  const setOferta = useCvStore((s) => s.setOferta);
  const setResultado = useCvStore((s) => s.setResultado);
  const reset = useCvStore((s) => s.reset);

  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (cvTexto.trim().length < 40) {
      setError("Pega el texto de tu CV (al menos unas líneas).");
      return;
    }
    setAnalizando(true);
    try {
      const analisis = await analizarCv(cvTexto.trim(), ofertaTexto.trim());
      setResultado(analisis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
    } finally {
      setAnalizando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      {/* Encabezado */}
      <div className="mb-8 text-center animate-fade-up">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-ink-soft backdrop-blur">
          <FileSearch className="size-3.5" />
          Analizador y optimizador de CV
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Optimiza tu CV
          <br />
          para la oferta
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-ink-soft">
          Pega tu CV y, opcionalmente, la descripción del puesto. Una IA evalúa
          el match, detecta huecos y alertas ATS, reescribe tu CV en una
          versión optimizada para superar los filtros automáticos y lo guarda
          para reutilizarlo en otras ofertas.
        </p>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="rounded-4xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-sm sm:p-8"
      >
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
          <FileText className="size-4 text-muted" />
          Tu CV
        </label>
        <textarea
          value={cvTexto}
          onChange={(e) => setCv(e.target.value)}
          placeholder="Pega aquí el texto completo de tu CV…"
          rows={12}
          disabled={analizando}
          className="w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-ink/30 disabled:opacity-60"
        />

        <label className="mb-2 mt-5 flex items-center gap-2 text-sm font-medium text-ink">
          <Briefcase className="size-4 text-muted" />
          Descripción del puesto{" "}
          <span className="font-normal text-muted">(opcional)</span>
        </label>
        <textarea
          value={ofertaTexto}
          onChange={(e) => setOferta(e.target.value)}
          placeholder="Pega la oferta de trabajo para obtener un match específico…"
          rows={6}
          disabled={analizando}
          className="w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-ink/30 disabled:opacity-60"
        />

        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-bad/25 bg-bad-soft px-4 py-3 text-sm text-bad animate-fade-in">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" loading={analizando} className="flex-1">
            {analizando ? "Analizando tu CV…" : "Analizar CV"}
            {!analizando && <Sparkles className="size-4" />}
          </Button>
          {(cvTexto || ofertaTexto || resultado) && !analizando && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                reset();
                setError(null);
              }}
            >
              <Trash2 className="size-4" />
              Limpiar
            </Button>
          )}
        </div>
      </form>

      <p className="mt-5 text-center text-xs text-muted">
        Tu CV se guarda solo en tu navegador. No se envía a ninguna base de
        datos.
      </p>

      {/* Resultados */}
      {resultado && (
        <div className="mt-10">
          <CvResults analisis={resultado} />
        </div>
      )}

      {/* Biblioteca de CVs optimizados guardados */}
      <MisCVs />
    </div>
  );
}
