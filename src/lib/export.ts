import type { RepoMeta, Pregunta, Evaluacion } from "./types";

export interface ReporteData {
  repoMeta: RepoMeta;
  preguntas: Pregunta[];
  respuestas: Record<string, string>;
  evaluacion: Evaluacion;
}

const VEREDICTO_LABEL: Record<string, string> = {
  bien: "Bien",
  parcial: "Parcial",
  mal: "Mal",
};

function fechaSlug(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function nombreBase(meta: RepoMeta): string {
  return `RepoInterview_${meta.owner}-${meta.repo}_${fechaSlug()}`.replace(
    /[^\w.-]/g,
    "_"
  );
}

/** Aplana el reporte en filas para CSV/Excel. */
function toRows(data: ReporteData) {
  return data.preguntas.map((q, i) => {
    const evalQ = data.evaluacion.detalle.find((d) => d.preguntaId === q.id);
    return {
      "#": i + 1,
      Tipo: q.tipo,
      Pregunta: q.pregunta,
      "Tu respuesta": (data.respuestas[q.id] ?? "").trim() || "(sin respuesta)",
      Veredicto: evalQ ? VEREDICTO_LABEL[evalQ.correcta] : "—",
      Puntaje: evalQ?.puntaje ?? 0,
      Comentario: evalQ?.comentario ?? "",
      "Respuesta correcta": evalQ?.respuesta_correcta ?? "",
    };
  });
}

function descargar(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
//  CSV
// ============================================================
export async function exportCSV(data: ReporteData): Promise<void> {
  const Papa = (await import("papaparse")).default;
  const rows = toRows(data);

  const encabezado = [
    `Repositorio,${data.repoMeta.owner}/${data.repoMeta.repo}`,
    `URL,${data.repoMeta.url}`,
    `Puntaje global,${data.evaluacion.puntaje_global}`,
    `Bien,${data.evaluacion.resumen.bien},Parcial,${data.evaluacion.resumen.parcial},Mal,${data.evaluacion.resumen.mal}`,
    "",
  ].join("\n");

  const csv = encabezado + "\n" + Papa.unparse(rows);
  // BOM para que Excel respete acentos.
  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  descargar(blob, `${nombreBase(data.repoMeta)}.csv`);
}

// ============================================================
//  Excel (.xlsx) con SheetJS
// ============================================================
export async function exportXLSX(data: ReporteData): Promise<void> {
  const XLSX = await import("xlsx");
  const rows = toRows(data);

  const resumen = [
    ["RepoInterview Trainer — Reporte"],
    [],
    ["Repositorio", `${data.repoMeta.owner}/${data.repoMeta.repo}`],
    ["URL", data.repoMeta.url],
    ["Fecha", new Date().toLocaleString("es")],
    ["Puntaje global", data.evaluacion.puntaje_global],
    ["Bien", data.evaluacion.resumen.bien],
    ["Parcial", data.evaluacion.resumen.parcial],
    ["Mal", data.evaluacion.resumen.mal],
    [],
    ["Recomendaciones de estudio"],
    ...data.evaluacion.recomendaciones.map((r) => [r]),
  ];

  const wb = XLSX.utils.book_new();
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  wsResumen["!cols"] = [{ wch: 22 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  const wsDetalle = XLSX.utils.json_to_sheet(rows);
  wsDetalle["!cols"] = [
    { wch: 4 },
    { wch: 12 },
    { wch: 45 },
    { wch: 45 },
    { wch: 10 },
    { wch: 9 },
    { wch: 50 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle");

  XLSX.writeFile(wb, `${nombreBase(data.repoMeta)}.xlsx`);
}

// ============================================================
//  PDF con jsPDF + autotable
// ============================================================
export async function exportPDF(data: ReporteData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("RepoInterview Trainer — Reporte", marginX, y);

  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(
    `Repositorio: ${data.repoMeta.owner}/${data.repoMeta.repo}`,
    marginX,
    y
  );
  y += 16;
  doc.text(`URL: ${data.repoMeta.url}`, marginX, y);
  y += 16;
  doc.text(`Fecha: ${new Date().toLocaleString("es")}`, marginX, y);

  // Bloque de puntaje
  y += 30;
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Puntaje global: ${data.evaluacion.puntaje_global}/100`, marginX, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(
    `Bien: ${data.evaluacion.resumen.bien}   ·   Parcial: ${data.evaluacion.resumen.parcial}   ·   Mal: ${data.evaluacion.resumen.mal}`,
    marginX,
    y
  );

  // Tabla de detalle
  const rows = toRows(data);
  autoTable(doc, {
    startY: y + 18,
    head: [["#", "Tipo", "Pregunta", "Tu respuesta", "Veredicto", "Pts"]],
    body: rows.map((r) => [
      r["#"],
      r.Tipo,
      r.Pregunta,
      r["Tu respuesta"],
      r.Veredicto,
      r.Puntaje,
    ]),
    styles: { fontSize: 9, cellPadding: 5, valign: "top" },
    headStyles: { fillColor: [22, 22, 26], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 55 },
      2: { cellWidth: 150 },
      3: { cellWidth: 150 },
      4: { cellWidth: 55 },
      5: { cellWidth: 28 },
    },
    margin: { left: marginX, right: marginX },
  });

  // Detalle extendido por pregunta (comentario + respuesta correcta)
  interface WithAutoTable {
    lastAutoTable?: { finalY: number };
  }
  let cursorY = (doc as unknown as WithAutoTable).lastAutoTable?.finalY ?? y + 40;
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
  doc.text("Detalle y respuestas correctas", marginX, cursorY);
  cursorY += 20;

  data.preguntas.forEach((q, i) => {
    const evalQ = data.evaluacion.detalle.find((d) => d.preguntaId === q.id);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20);
    const pregLines = doc.splitTextToSize(
      `${i + 1}. ${q.pregunta}`,
      maxWidth
    );
    ensureSpace(pregLines.length * 13 + 40);
    doc.text(pregLines, marginX, cursorY);
    cursorY += pregLines.length * 13 + 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(90);
    const comentario = doc.splitTextToSize(
      `Comentario (${evalQ ? VEREDICTO_LABEL[evalQ.correcta] : "—"}, ${
        evalQ?.puntaje ?? 0
      } pts): ${evalQ?.comentario ?? ""}`,
      maxWidth
    );
    doc.text(comentario, marginX, cursorY);
    cursorY += comentario.length * 12 + 2;

    const correcta = doc.splitTextToSize(
      `Respuesta correcta: ${evalQ?.respuesta_correcta ?? ""}`,
      maxWidth
    );
    ensureSpace(correcta.length * 12 + 16);
    doc.setTextColor(60);
    doc.text(correcta, marginX, cursorY);
    cursorY += correcta.length * 12 + 16;
  });

  // Recomendaciones
  if (data.evaluacion.recomendaciones.length > 0) {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20);
    doc.text("Recomendaciones de estudio", marginX, cursorY);
    cursorY += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    data.evaluacion.recomendaciones.forEach((r) => {
      const lines = doc.splitTextToSize(`•  ${r}`, maxWidth);
      ensureSpace(lines.length * 13 + 4);
      doc.text(lines, marginX, cursorY);
      cursorY += lines.length * 13 + 4;
    });
  }

  doc.save(`${nombreBase(data.repoMeta)}.pdf`);
}
