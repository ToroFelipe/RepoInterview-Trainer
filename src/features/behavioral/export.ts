import {
  descargar,
  fechaSlug,
  slugify,
  resolveAutoTable,
} from "@/lib/download";
import type {
  BehavioralConfig,
  PreguntaConductual,
  EvaluacionConductual,
  Star,
} from "./types";

export interface ReporteConductual {
  config: BehavioralConfig;
  preguntas: PreguntaConductual[];
  respuestas: Record<string, string>;
  evaluacion: EvaluacionConductual;
}

function nombreBase(config: BehavioralConfig): string {
  return `EntrevistaConductual_${slugify(config.rol || "sin-rol")}_${fechaSlug()}`;
}

/** Representación ASCII de STAR: letra si está presente, "–" si falta. */
function starStr(s: Star): string {
  return [
    s.situacion ? "S" : "–",
    s.tarea ? "T" : "–",
    s.accion ? "A" : "–",
    s.resultado ? "R" : "–",
  ].join(" ");
}

function toRows(data: ReporteConductual) {
  return data.preguntas.map((q, i) => {
    const e = data.evaluacion.detalle.find((d) => d.preguntaId === q.id);
    return {
      "#": i + 1,
      Categoría: q.categoria,
      Pregunta: q.pregunta,
      "Tu respuesta":
        (data.respuestas[q.id] ?? "").trim() || "(sin respuesta)",
      STAR: e ? starStr(e.star) : "–",
      Puntaje: e?.puntaje ?? 0,
      Fortalezas: e?.fortalezas.join(" · ") ?? "",
      Mejoras: e?.mejoras.join(" · ") ?? "",
      "Respuesta modelo": e?.respuesta_modelo ?? "",
    };
  });
}

// ============================================================
//  CSV
// ============================================================
export async function buildBehavioralCsv(
  data: ReporteConductual
): Promise<string> {
  const Papa = (await import("papaparse")).default;
  const encabezado = [
    `Rol,${data.config.rol || "—"}`,
    `Puntaje global,${data.evaluacion.puntaje_global}`,
    `Preguntas,${data.preguntas.length}`,
    "",
  ].join("\n");
  return encabezado + "\n" + Papa.unparse(toRows(data));
}

export async function exportBehavioralCSV(
  data: ReporteConductual
): Promise<void> {
  const csv = await buildBehavioralCsv(data);
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  descargar(blob, `${nombreBase(data.config)}.csv`);
}

// ============================================================
//  Excel (.xlsx)
// ============================================================
export async function buildBehavioralWorkbook(data: ReporteConductual) {
  const XLSX = await import("xlsx");

  const resumen: (string | number)[][] = [
    ["Entrevista Conductual — Reporte"],
    [],
    ["Rol", data.config.rol || "—"],
    ["Fecha", new Date().toLocaleString("es")],
    ["Puntaje global", data.evaluacion.puntaje_global],
    ["Preguntas", data.preguntas.length],
    [],
    ["Recomendaciones generales"],
    ...data.evaluacion.recomendaciones_generales.map((r) => [r]),
  ];

  const wb = XLSX.utils.book_new();
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  wsResumen["!cols"] = [{ wch: 22 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  const wsDetalle = XLSX.utils.json_to_sheet(toRows(data));
  wsDetalle["!cols"] = [
    { wch: 4 },
    { wch: 20 },
    { wch: 45 },
    { wch: 45 },
    { wch: 10 },
    { wch: 8 },
    { wch: 40 },
    { wch: 40 },
    { wch: 55 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle");

  return { XLSX, wb };
}

export async function exportBehavioralXLSX(
  data: ReporteConductual
): Promise<void> {
  const { XLSX, wb } = await buildBehavioralWorkbook(data);
  XLSX.writeFile(wb, `${nombreBase(data.config)}.xlsx`);
}

// ============================================================
//  PDF
// ============================================================
export async function buildBehavioralPdf(data: ReporteConductual) {
  const { jsPDF } = await import("jspdf");
  const autoTable = resolveAutoTable(await import("jspdf-autotable"));

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Entrevista Conductual — Reporte", marginX, y);

  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`Rol: ${data.config.rol || "—"}`, marginX, y);
  y += 16;
  doc.text(`Fecha: ${new Date().toLocaleString("es")}`, marginX, y);

  y += 30;
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(
    `Puntaje global: ${data.evaluacion.puntaje_global}/100`,
    marginX,
    y
  );

  const rows = toRows(data);
  autoTable(doc, {
    startY: y + 18,
    head: [["#", "Categoría", "Pregunta", "STAR", "Pts"]],
    body: rows.map((r) => [r["#"], r.Categoría, r.Pregunta, r.STAR, r.Puntaje]),
    styles: { fontSize: 9, cellPadding: 5, valign: "top" },
    headStyles: { fillColor: [22, 22, 26], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 90 },
      2: { cellWidth: 250 },
      3: { cellWidth: 60 },
      4: { cellWidth: 28 },
    },
    margin: { left: marginX, right: marginX },
  });

  interface WithAutoTable {
    lastAutoTable?: { finalY: number };
  }
  let cursorY =
    (doc as unknown as WithAutoTable).lastAutoTable?.finalY ?? y + 40;
  cursorY += 24;

  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = doc.internal.pageSize.getWidth() - marginX * 2;
  const ensureSpace = (needed: number) => {
    if (cursorY + needed > pageHeight - 40) {
      doc.addPage();
      cursorY = 48;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20);
  ensureSpace(30);
  doc.text("Detalle por pregunta", marginX, cursorY);
  cursorY += 20;

  data.preguntas.forEach((q, i) => {
    const e = data.evaluacion.detalle.find((d) => d.preguntaId === q.id);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20);
    const pregLines = doc.splitTextToSize(`${i + 1}. ${q.pregunta}`, maxWidth);
    ensureSpace(pregLines.length * 13 + 60);
    doc.text(pregLines, marginX, cursorY);
    cursorY += pregLines.length * 13 + 4;

    const escribir = (etiqueta: string, texto: string, color = 90) => {
      if (!texto) return;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(color);
      const lines = doc.splitTextToSize(`${etiqueta}: ${texto}`, maxWidth);
      ensureSpace(lines.length * 12 + 4);
      doc.text(lines, marginX, cursorY);
      cursorY += lines.length * 12 + 4;
    };

    escribir(
      `STAR (${e ? starStr(e.star) : "–"}, ${e?.puntaje ?? 0} pts) · Tu respuesta`,
      (data.respuestas[q.id] ?? "").trim() || "(sin respuesta)"
    );
    if (e?.fortalezas.length) escribir("Fortalezas", e.fortalezas.join(" · "));
    if (e?.mejoras.length) escribir("Mejoras", e.mejoras.join(" · "));
    if (e?.respuesta_modelo)
      escribir("Respuesta modelo", e.respuesta_modelo, 60);
    cursorY += 8;
  });

  if (data.evaluacion.recomendaciones_generales.length > 0) {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20);
    doc.text("Recomendaciones generales", marginX, cursorY);
    cursorY += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    data.evaluacion.recomendaciones_generales.forEach((r) => {
      const lines = doc.splitTextToSize(`•  ${r}`, maxWidth);
      ensureSpace(lines.length * 13 + 4);
      doc.text(lines, marginX, cursorY);
      cursorY += lines.length * 13 + 4;
    });
  }

  return doc;
}

export async function exportBehavioralPDF(
  data: ReporteConductual
): Promise<void> {
  const doc = await buildBehavioralPdf(data);
  doc.save(`${nombreBase(data.config)}.pdf`);
}
