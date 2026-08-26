import { descargar, fechaSlug, slugify } from "@/lib/download";
import type { CvAnalisis } from "./types";

function nombreBase(): string {
  return `AnalisisCV_${fechaSlug()}`;
}

/** Secciones de listas (para PDF/CSV/Excel), en orden. */
function secciones(a: CvAnalisis): { titulo: string; items: string[] }[] {
  return [
    { titulo: "Sugerencias priorizadas", items: a.sugerencias_priorizadas },
    { titulo: "Keywords faltantes", items: a.keywords_faltantes },
    { titulo: "Fortalezas", items: a.fortalezas },
    { titulo: "Debilidades", items: a.debilidades },
    { titulo: "Logros a reformular", items: a.logros_a_reformular },
    { titulo: "Alertas ATS", items: a.alertas_ats },
  ];
}

// ============================================================
//  CSV
// ============================================================
export async function buildCvCsv(a: CvAnalisis): Promise<string> {
  const Papa = (await import("papaparse")).default;

  const rows: { Sección: string; "#": number | string; Detalle: string }[] = [];
  rows.push({
    Sección: a.con_oferta ? "Puntaje de match" : "Puntaje de calidad",
    "#": "",
    Detalle: `${a.puntaje_match}/100`,
  });
  if (a.resumen_reescrito) {
    rows.push({ Sección: "Resumen reescrito", "#": "", Detalle: a.resumen_reescrito });
  }
  for (const s of secciones(a)) {
    s.items.forEach((item, i) =>
      rows.push({ Sección: s.titulo, "#": i + 1, Detalle: item })
    );
  }
  return Papa.unparse(rows);
}

export async function exportCvCSV(a: CvAnalisis): Promise<void> {
  const csv = await buildCvCsv(a);
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  descargar(blob, `${nombreBase()}.csv`);
}

// ============================================================
//  Excel (.xlsx)
// ============================================================
export async function buildCvWorkbook(a: CvAnalisis) {
  const XLSX = await import("xlsx");

  const resumen: (string | number)[][] = [
    ["Análisis de CV — Reporte"],
    [],
    ["Fecha", new Date().toLocaleString("es")],
    ["Modo", a.con_oferta ? "Contra oferta" : "Calidad general"],
    [a.con_oferta ? "Puntaje de match" : "Puntaje de calidad", `${a.puntaje_match}/100`],
  ];
  if (a.resumen_reescrito) {
    resumen.push([], ["Resumen reescrito"], [a.resumen_reescrito]);
  }

  const wb = XLSX.utils.book_new();
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  wsResumen["!cols"] = [{ wch: 24 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  const detalle = secciones(a).flatMap((s) =>
    s.items.map((item, i) => ({
      Sección: s.titulo,
      "#": i + 1,
      Detalle: item,
    }))
  );
  const wsDetalle = XLSX.utils.json_to_sheet(
    detalle.length ? detalle : [{ Sección: "—", "#": "", Detalle: "Sin datos" }]
  );
  wsDetalle["!cols"] = [{ wch: 24 }, { wch: 4 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle");

  return { XLSX, wb };
}

export async function exportCvXLSX(a: CvAnalisis): Promise<void> {
  const { XLSX, wb } = await buildCvWorkbook(a);
  XLSX.writeFile(wb, `${nombreBase()}.xlsx`);
}

// ============================================================
//  PDF
// ============================================================
export async function buildCvPdf(a: CvAnalisis) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = doc.internal.pageSize.getWidth() - marginX * 2;
  let y = 48;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 40) {
      doc.addPage();
      y = 48;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Análisis de CV — Reporte", marginX, y);

  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`Fecha: ${new Date().toLocaleString("es")}`, marginX, y);
  y += 16;
  doc.text(
    `Modo: ${a.con_oferta ? "Contra oferta" : "Calidad general del CV"}`,
    marginX,
    y
  );

  y += 30;
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(
    `${a.con_oferta ? "Match con la oferta" : "Calidad del CV"}: ${a.puntaje_match}/100`,
    marginX,
    y
  );

  // Resumen reescrito
  if (a.resumen_reescrito) {
    y += 26;
    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text("Resumen profesional reescrito", marginX, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    const lines = doc.splitTextToSize(a.resumen_reescrito, maxWidth);
    ensureSpace(lines.length * 13 + 8);
    doc.text(lines, marginX, y);
    y += lines.length * 13 + 8;
  }

  // Secciones de listas
  for (const s of secciones(a)) {
    if (!s.items.length) continue;
    y += 18;
    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(s.titulo, marginX, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    s.items.forEach((item) => {
      const lines = doc.splitTextToSize(`•  ${item}`, maxWidth);
      ensureSpace(lines.length * 13 + 4);
      doc.text(lines, marginX, y);
      y += lines.length * 13 + 4;
    });
  }

  return doc;
}

export async function exportCvPDF(a: CvAnalisis): Promise<void> {
  const doc = await buildCvPdf(a);
  doc.save(`${nombreBase()}.pdf`);
}

// ============================================================
//  CV optimizado en texto plano (.txt) — listo para ATS
// ============================================================
export function exportCvTxt(nombre: string, contenido: string): void {
  const blob = new Blob(["\uFEFF" + contenido], {
    type: "text/plain;charset=utf-8;",
  });
  descargar(blob, `CV_${slugify(nombre) || "optimizado"}_${fechaSlug()}.txt`);
}

// ============================================================
//  CV optimizado en PDF — texto real seleccionable (apto para ATS)
// ============================================================
/** Heurística simple: encabezados de sección van en MAYÚSCULAS y cortos. */
function esEncabezado(linea: string): boolean {
  const t = linea.trim();
  return (
    t.length > 0 &&
    t.length <= 42 &&
    /[A-ZÁÉÍÓÚÑ]/.test(t) &&
    t === t.toUpperCase() &&
    !/[.]$/.test(t)
  );
}

export async function buildCvOptimizadoPdf(contenido: string) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const marginTop = 54;
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = doc.internal.pageSize.getWidth() - marginX * 2;
  const lineH = 14;
  let y = marginTop;

  const ensure = (need: number) => {
    if (y + need > pageHeight - 48) {
      doc.addPage();
      y = marginTop;
    }
  };

  doc.setTextColor(20);

  const lineas = contenido.replace(/\r\n/g, "\n").split("\n");
  for (const linea of lineas) {
    if (linea.trim() === "") {
      y += lineH * 0.55;
      continue;
    }
    const encabezado = esEncabezado(linea);
    doc.setFont("helvetica", encabezado ? "bold" : "normal");
    doc.setFontSize(encabezado ? 11.5 : 10.5);

    if (encabezado) ensure(lineH * 1.4);
    const wrapped = doc.splitTextToSize(linea, maxWidth);
    for (const l of wrapped) {
      ensure(lineH);
      doc.text(l, marginX, y);
      y += lineH;
    }
    if (encabezado) y += 2;
  }

  return doc;
}

export async function exportCvOptimizadoPdf(
  nombre: string,
  contenido: string
): Promise<void> {
  const doc = await buildCvOptimizadoPdf(contenido);
  doc.save(`CV_${slugify(nombre) || "optimizado"}_${fechaSlug()}.pdf`);
}
