"use client";

import { useState } from "react";
import { FileText, FileSpreadsheet, Table2, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Formato = "pdf" | "csv" | "xlsx";

interface DownloadButtonsProps {
  onPdf: () => Promise<void>;
  onCsv: () => Promise<void>;
  onXlsx: () => Promise<void>;
}

/** Botones genéricos de descarga (PDF/Excel/CSV) reutilizables por módulo. */
export function DownloadButtons({ onPdf, onCsv, onXlsx }: DownloadButtonsProps) {
  const [cargando, setCargando] = useState<Formato | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(formato: Formato) {
    setError(null);
    setCargando(formato);
    try {
      if (formato === "pdf") await onPdf();
      else if (formato === "csv") await onCsv();
      else await onXlsx();
    } catch {
      setError("No se pudo generar el archivo. Inténtalo de nuevo.");
    } finally {
      setCargando(null);
    }
  }

  const botones: { formato: Formato; label: string; icon: React.ReactNode }[] = [
    { formato: "pdf", label: "PDF", icon: <FileText className="size-4" /> },
    {
      formato: "xlsx",
      label: "Excel",
      icon: <FileSpreadsheet className="size-4" />,
    },
    { formato: "csv", label: "CSV", icon: <Table2 className="size-4" /> },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {botones.map((b) => (
          <button
            key={b.formato}
            type="button"
            onClick={() => handle(b.formato)}
            disabled={cargando !== null}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-soft transition",
              "hover:bg-surface-muted active:scale-[0.98] disabled:opacity-50"
            )}
          >
            {cargando === b.formato ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              b.icon
            )}
            {b.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-bad">{error}</p>}
    </div>
  );
}
