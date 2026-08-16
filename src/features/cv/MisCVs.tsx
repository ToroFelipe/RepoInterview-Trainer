"use client";

import { useState } from "react";
import {
  FolderOpen,
  Download,
  Copy,
  Check,
  Trash2,
  Tag,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { exportCvTxt } from "./export";
import { useCvStore } from "./useCvStore";

export function MisCVs() {
  const cvsGuardados = useCvStore((s) => s.cvsGuardados);
  const eliminarCv = useCvStore((s) => s.eliminarCv);
  const [copiado, setCopiado] = useState<string | null>(null);

  if (!cvsGuardados.length) return null;

  async function copiar(id: string, contenido: string) {
    try {
      await navigator.clipboard.writeText(contenido);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 1800);
    } catch {
      /* sin clipboard: ignora */
    }
  }

  return (
    <section className="mt-10 animate-fade-up">
      <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
        <FolderOpen className="size-5" />
        Mis CVs optimizados
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted">
          {cvsGuardados.length}
        </span>
      </div>
      <p className="mb-4 text-sm text-ink-soft">
        Están guardados solo en tu navegador. Descárgalos o reutilízalos cuando
        quieras.
      </p>

      <div className="grid gap-4">
        {cvsGuardados.map((cv) => (
          <div
            key={cv.id}
            className="rounded-4xl border border-border bg-surface/80 p-5 shadow-soft backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink">{cv.nombre}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {cv.categoria && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-ink">
                      <Tag className="size-3" />
                      {cv.categoria}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(cv.fecha).toLocaleDateString("es")}
                  </span>
                </div>
                {cv.descripcion && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {cv.descripcion}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-ink">
                <span className="rounded-xl bg-good/10 px-2.5 py-1">
                  ATS {cv.puntaje_ats}/100
                </span>
                <span className="rounded-xl bg-primary/10 px-2.5 py-1">
                  Match {cv.puntaje_match}/100
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => exportCvTxt(cv.nombre, cv.contenido)}
              >
                <Download className="size-4" />
                Descargar
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => copiar(cv.id, cv.contenido)}
              >
                {copiado === cv.id ? (
                  <Check className="size-4 text-good" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copiado === cv.id ? "Copiado" : "Copiar"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-bad hover:bg-bad-soft"
                onClick={() => eliminarCv(cv.id)}
              >
                <Trash2 className="size-4" />
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
        <Sparkles className="size-3.5" />
        El CV se guarda como texto plano: es el formato que mejor lee cualquier
        ATS.
      </p>
    </section>
  );
}