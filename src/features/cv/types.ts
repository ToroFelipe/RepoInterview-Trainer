// Tipos del módulo "Analizador y Optimizador de CV".

export interface CvAnalisis {
  /** 0–100. Match con la oferta; si no hay oferta, calidad general del CV. */
  puntaje_match: number;
  /** true si el análisis se hizo contra una oferta concreta. */
  con_oferta: boolean;
  /** Tecnologías/términos de la oferta ausentes en el CV. */
  keywords_faltantes: string[];
  /** Puntos fuertes detectados. */
  fortalezas: string[];
  /** Qué falta o está mal presentado. */
  debilidades: string[];
  /** Responsabilidades que conviene reescribir como logros con métricas. */
  logros_a_reformular: string[];
  /** Problemas de formato/keywords que podrían frenar filtros ATS. */
  alertas_ats: string[];
  /** Cambios ordenados de mayor a menor impacto. */
  sugerencias_priorizadas: string[];
  /** Versión mejorada del resumen/perfil del CV (opcional). */
  resumen_reescrito?: string;
}

/** Payload de entrada para /api/cv. */
export interface CvRequest {
  cv: string;
  oferta?: string;
}
