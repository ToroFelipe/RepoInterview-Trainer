"use client";

import { useState } from "react";
import {
  ThumbsUp,
  AlertTriangle,
  ListChecks,
  Tags,
  Trophy,
  ScanLine,
  Copy,
  Check,
  Sparkles,
  Download,
  Save,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ScoreRing } from "@/components/ScoreRing";
import { DownloadButtons } from "@/components/DownloadButtons";
import { Button } from "@/components/ui/Button";
import { exportCvPDF, exportCvCSV, exportCvXLSX, exportCvTxt } from "./export";
import { useCvStore } from "./useCvStore";
import { GuardarCvModal } from "./GuardarCvModal";
import type { CvAnalisis } from "./types";

const MENSAJE = (s: number) =>
  s >= 85
    ? "CV muy sólido. Solo detalles por pulir."
    : s >= 70
    ? "Buen CV. Con unos ajustes queda listo."
    : s >= 50
    ? "Base decente. Hay mejoras de alto impacto por hacer."
    : "Conviene reforzarlo bastante antes de postular.";

export function CvResults({ analisis }: { analisis: CvAnalisis }) {
  const guardarCv = useCvStore((s) => s.guardarCv);
  const ofertaTexto = useCvStore((s) => s.ofertaTexto);
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="mx-auto w-full max-w-3xl animate-fade-up">
      {/* Puntaje */}
      <div className="rounded-4xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-sm sm:p-8">
        <div className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted">
          <Trophy className="size-3.5" />
          {analisis.con_oferta
            ? "Match del CV con la oferta"
            : "Calidad general del CV"}
        </div>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <ScoreRing score={analisis.puntaje_match} />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-lg font-semibold text-ink">
              {MENSAJE(analisis.puntaje_match)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {analisis.con_oferta
                ? "Puntaje de compatibilidad entre tu CV y la descripción del puesto que pegaste."
                : "Evaluación de la calidad general de tu CV para tu rol. Pega una oferta para obtener un match específico."}
            </p>
          </div>
        </div>

        <div className="mt-7 border-t border-border pt-6">
          <p className="mb-3 text-sm font-medium text-ink">Descargar informe</p>
          <DownloadButtons
            onPdf={() => exportCvPDF(analisis)}
            onCsv={() => exportCvCSV(analisis)}
            onXlsx={() => exportCvXLSX(analisis)}
          />
        </div>
      </div>

      {/* CV optimizado generado */}
      {analisis.cv_optimizado ? (
        <CvOptimizadoCard
          analisis={analisis}
          onAbrirModal={() => setModalAbierto(true)}
        />
      ) : (
        !analisis.requisitos_ats.length && (
          <div className="mt-5 rounded-4xl border border-border bg-pastel-yellow/40 p-6 text-sm leading-relaxed text-ink-soft">
            No se pudo generar el CV optimizado en esta ejecución. Intenta
            analizar tu CV nuevamente.
          </div>
        )
      )}

      {/* Requisitos ATS + puntuación */}
      {(analisis.puntaje_ats !== undefined || analisis.requisitos_ats.length > 0) && (
        <AtsCard analisis={analisis} />
      )}

      {/* Resumen reescrito */}
      {analisis.resumen_reescrito && (
        <ResumenReescrito texto={analisis.resumen_reescrito} />
      )}

      {/* Sugerencias priorizadas (checklist) */}
      {analisis.sugerencias_priorizadas.length > 0 && (
        <div className="mt-5 rounded-4xl border border-border bg-surface/80 p-6 shadow-soft backdrop-blur-sm sm:p-7">
          <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
            <ListChecks className="size-5 text-ink" />
            Plan de mejora — ordenado por impacto
          </div>
          <ol className="space-y-2.5">
            {analisis.sugerencias_priorizadas.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-ink-soft">
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Keywords faltantes */}
      {analisis.keywords_faltantes.length > 0 && (
        <div className="mt-5 rounded-4xl border border-border bg-pastel-coral/40 p-6 sm:p-7">
          <div className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <Tags className="size-5 text-bad" />
            Keywords faltantes
          </div>
          <p className="mb-3 text-xs text-ink-soft">
            Términos {analisis.con_oferta ? "de la oferta" : "esperados del rol"}{" "}
            que no aparecen (o aparecen poco) en tu CV. Inclúyelos si de verdad
            los dominas.
          </p>
          <div className="flex flex-wrap gap-2">
            {analisis.keywords_faltantes.map((k, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink shadow-soft"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fortalezas / Debilidades */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <ListaSeccion
          icon={<ThumbsUp className="size-5 text-good" />}
          titulo="Fortalezas"
          items={analisis.fortalezas}
          tone="good"
        />
        <ListaSeccion
          icon={<AlertTriangle className="size-5 text-partial" />}
          titulo="Debilidades"
          items={analisis.debilidades}
          tone="partial"
        />
      </div>

      {/* Logros a reformular */}
      {analisis.logros_a_reformular.length > 0 && (
        <div className="mt-5 rounded-4xl border border-border bg-surface/80 p-6 shadow-soft backdrop-blur-sm sm:p-7">
          <div className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <Trophy className="size-5 text-partial" />
            Convierte responsabilidades en logros
          </div>
          <ul className="space-y-2.5">
            {analisis.logros_a_reformular.map((l, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
              >
                <Sparkles className="mt-0.5 size-4 shrink-0 text-partial" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alertas ATS */}
      {analisis.alertas_ats.length > 0 && (
        <div className="mt-5 rounded-4xl border border-border bg-pastel-yellow/40 p-6 sm:p-7">
          <div className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <ScanLine className="size-5 text-partial" />
            Alertas para filtros ATS
          </div>
          <ul className="space-y-2.5">
            {analisis.alertas_ats.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-partial" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analisis.cv_optimizado && (
        <GuardarCvModal
          abierto={modalAbierto}
          analisis={analisis}
          oferta={ofertaTexto}
          inicial={{
            titulo: analisis.cv_optimizado.titulo,
            categoria: analisis.cv_optimizado.categoria ?? "",
            descripcion: analisis.cv_optimizado.descripcion,
          }}
          onGuardar={guardarCv}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}

function CvOptimizadoCard({
  analisis,
  onAbrirModal,
}: {
  analisis: CvAnalisis;
  onAbrirModal: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const cv = analisis.cv_optimizado!;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(cv.contenido);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* ignora: entorno sin clipboard */
    }
  }

  return (
    <div className="mt-5 rounded-4xl border border-primary/20 bg-surface/80 p-6 shadow-card backdrop-blur-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <FileText className="size-5 text-primary" />
            CV optimizado para ATS
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            {cv.titulo}
          </h3>
          {cv.categoria && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-ink">
              <Tags className="size-3" />
              {cv.categoria}
            </span>
          )}
          {cv.descripcion && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              {cv.descripcion}
            </p>
          )}
        </div>
        <ScoreRing score={analisis.puntaje_ats ?? 0} size={96} />
      </div>

      <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-border bg-surface p-4 font-mono text-[13px] leading-relaxed text-ink whitespace-pre-wrap">
        {cv.contenido}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => exportCvTxt(cv.titulo, cv.contenido)}
        >
          <Download className="size-4" />
          Descargar .txt
        </Button>
        <Button size="sm" variant="secondary" onClick={copiar}>
          {copiado ? (
            <Check className="size-4 text-good" />
          ) : (
            <Copy className="size-4" />
          )}
          {copiado ? "Copiado" : "Copiar"}
        </Button>
        <Button size="sm" onClick={onAbrirModal} className="ml-auto">
          <Save className="size-4" />
          Guardar CV
        </Button>
      </div>
    </div>
  );
}

function AtsCard({ analisis }: { analisis: CvAnalisis }) {
  return (
    <div className="mt-5 rounded-4xl border border-border bg-surface/80 p-6 shadow-soft backdrop-blur-sm sm:p-7">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ScanLine className={cn("size-5", "text-partial")} />
        <span className="font-semibold text-ink">
          Puntuación y requisitos ATS
        </span>
        {analisis.puntaje_ats !== undefined && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-good/10 px-3 py-1 text-sm font-semibold text-ink">
            <Trophy className="size-4 text-good" />
            {analisis.puntaje_ats}/100
          </span>
        )}
      </div>
      {analisis.requisitos_ats.length > 0 && (
        <>
          <p className="mb-3 text-sm font-medium text-ink">
            Qué necesita tener tu CV para pasar los filtros ATS
          </p>
          <ul className="space-y-2.5">
            {analisis.requisitos_ats.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
              >
                <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", "bg-partial")} />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ResumenReescrito({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* ignora: entorno sin clipboard */
    }
  }

  return (
    <div className="mt-5 rounded-4xl border border-border bg-pastel-green/40 p-6 sm:p-7">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <Sparkles className="size-5 text-good" />
          Resumen profesional reescrito
        </div>
        <button
          type="button"
          onClick={copiar}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-soft transition hover:bg-surface-muted"
        >
          {copiado ? (
            <>
              <Check className="size-3.5 text-good" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copiar
            </>
          )}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
        {texto}
      </p>
    </div>
  );
}

function ListaSeccion({
  icon,
  titulo,
  items,
  tone,
}: {
  icon: React.ReactNode;
  titulo: string;
  items: string[];
  tone: "good" | "partial";
}) {
  if (!items.length) return null;
  const dot = tone === "good" ? "bg-good" : "bg-partial";
  return (
    <div className="rounded-4xl border border-border bg-surface/80 p-6 shadow-soft backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2 font-semibold text-ink">
        {icon}
        {titulo}
      </div>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
          >
            <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", dot)} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
