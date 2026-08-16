"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { CvAnalisis, CvGuardado } from "./types";

const CATEGORIAS = [
  "frontend",
  "backend",
  "fullstack",
  "movil",
  "devops",
  "datos",
  "bbdd",
  "data_science",
  "QA",
  "cloud",
  "IA",
];

interface GuardarCvModalProps {
  abierto: boolean;
  analisis: CvAnalisis;
  /** Fragmento de la oferta usada (contexto para reutilizar el CV). */
  oferta?: string;
  /** Valores sugeridos por la IA, editables por el usuario. */
  inicial: { titulo: string; categoria: string; descripcion: string };
  onGuardar: (cv: CvGuardado) => void;
  onCerrar: () => void;
}

export function GuardarCvModal({
  abierto,
  analisis,
  oferta,
  inicial,
  onGuardar,
  onCerrar,
}: GuardarCvModalProps) {
  const [nombre, setNombre] = useState(inicial.titulo);
  const [categoria, setCategoria] = useState(inicial.categoria);
  const [descripcion, setDescripcion] = useState(inicial.descripcion);
  const [guardado, setGuardado] = useState(false);

  if (!abierto) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cv: CvGuardado = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nombre: nombre.trim() || "CV Optimizado",
      categoria: categoria.trim() || undefined,
      descripcion: descripcion.trim(),
      contenido: analisis.cv_optimizado?.contenido ?? "",
      puntaje_ats: analisis.puntaje_ats ?? 0,
      puntaje_match: analisis.puntaje_match,
      fecha: new Date().toISOString(),
      oferta: oferta?.trim() || undefined,
    };
    onGuardar(cv);
    setGuardado(true);
    setTimeout(() => {
      setGuardado(false);
      onCerrar();
    }, 1400);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-4xl border border-border bg-surface p-6 shadow-card animate-fade-up sm:p-7"
      >
        <button
          type="button"
          onClick={onCerrar}
          className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-xl text-muted transition hover:bg-surface-muted"
        >
          <X className="size-4" />
        </button>

        <h3 className="pr-8 text-lg font-semibold text-ink sm:text-xl">
          Guardar CV optimizado
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Se guardará en tu navegador para que lo descargues o reutilices
          cuando quieras.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Nombre del CV
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Dev Frontend React + TypeScript"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Categoría{" "}
              <span className="font-normal text-muted">(opcional)</span>
            </label>
            <input
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="frontend, backend, bbdd, fullstack…"
              list="cv-categorias"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink/30"
            />
            <datalist id="cv-categorias">
              {CATEGORIAS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Descripción breve
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="De qué trata este CV y para qué ofertas sirve…"
              className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-ink/30"
            />
            <p className="mt-1 text-xs text-muted">
              Te ayuda a reconocer el CV rápido y a reutilizarlo en otras
              ofertas.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            type="submit"
            className={cn("flex-1", guardado && "bg-good text-white")}
          >
            {guardado ? "Guardado ✓" : "Guardar CV"}
            {!guardado && <Save className="size-4" />}
          </Button>
          <Button type="button" variant="secondary" onClick={onCerrar}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}