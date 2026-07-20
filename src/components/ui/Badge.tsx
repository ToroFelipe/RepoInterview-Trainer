import { cn } from "@/lib/cn";
import type { TipoPregunta, Veredicto } from "@/lib/types";

// Mapeo de tipo de pregunta → color pastel + etiqueta legible.
const TIPO_STYLE: Record<TipoPregunta, { bg: string; label: string }> = {
  feature: { bg: "bg-pastel-blue text-ink", label: "Feature" },
  codigo: { bg: "bg-pastel-lavender text-ink", label: "Código" },
  funcion: { bg: "bg-pastel-peach text-ink", label: "Función" },
  concepto: { bg: "bg-pastel-green text-ink", label: "Concepto" },
  termino: { bg: "bg-pastel-yellow text-ink", label: "Término" },
};

export function TipoBadge({ tipo }: { tipo: TipoPregunta }) {
  const s = TIPO_STYLE[tipo] ?? TIPO_STYLE.concepto;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        s.bg
      )}
    >
      {s.label}
    </span>
  );
}

const VEREDICTO_STYLE: Record<
  Veredicto,
  { bg: string; dot: string; label: string }
> = {
  bien: { bg: "bg-good-soft text-good", dot: "bg-good", label: "Bien" },
  parcial: {
    bg: "bg-partial-soft text-partial",
    dot: "bg-partial",
    label: "Parcial",
  },
  mal: { bg: "bg-bad-soft text-bad", dot: "bg-bad", label: "Mal" },
};

export function VeredictoBadge({ veredicto }: { veredicto: Veredicto }) {
  const s = VEREDICTO_STYLE[veredicto] ?? VEREDICTO_STYLE.parcial;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        s.bg
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
