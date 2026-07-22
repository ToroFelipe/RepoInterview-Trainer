// Utilidades compartidas para exportar/descargar archivos desde el navegador.
// Reutilizadas por los exportadores de cada módulo (CV, competencias, …).

/** Fecha en formato YYYY-MM-DD para nombrar archivos. */
export function fechaSlug(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Convierte un texto en un slug seguro para nombre de archivo. */
export function slugify(text: string): string {
  return (
    (text || "reporte")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\w.-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 60) || "reporte"
  );
}

/** Dispara la descarga de un Blob con el nombre indicado. */
export function descargar(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Resuelve la función autoTable de forma robusta: según el bundler/entorno,
// puede estar en `.default` (webpack/navegador) o en `.default.default` (Node ESM).
export type AutoTableFn = (doc: unknown, options: unknown) => void;
export function resolveAutoTable(mod: unknown): AutoTableFn {
  const m = mod as { default?: unknown };
  if (typeof m === "function") return m as AutoTableFn;
  if (typeof m.default === "function") return m.default as AutoTableFn;
  const inner = (m.default as { default?: unknown })?.default;
  if (typeof inner === "function") return inner as AutoTableFn;
  throw new Error("No se pudo cargar jspdf-autotable.");
}
