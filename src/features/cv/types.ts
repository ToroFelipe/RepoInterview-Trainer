// Tipos del módulo "Analizador y Optimizador de CV".

/** CV completo reescrito y optimizado para sistemas ATS. */
export interface CvOptimizado {
  /** Nombre corto del CV, ej. "Dev Frontend React + TypeScript". */
  titulo: string;
  /** Categoría del perfil, ej. "frontend", "backend", "bbdd", "fullstack". */
  categoria?: string;
  /** Descripción breve: de qué trata este CV y para qué ofertas sirve. */
  descripcion: string;
  /** CV completo en texto plano, listo para pegar en formularios ATS. */
  contenido: string;
}

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
  /** CV completo reescrito y optimizado para filtros ATS. */
  cv_optimizado?: CvOptimizado;
  /** 0–100. Qué tan optimizado queda el CV generado para pasar ATS. */
  puntaje_ats?: number;
  /** Buenas prácticas que un CV necesita cumplir para pasar filtros ATS. */
  requisitos_ats: string[];
}

/** CV optimizado guardado localmente para reutilizarlo en otras ofertas. */
export interface CvGuardado {
  id: string;
  nombre: string;
  categoria?: string;
  descripcion: string;
  contenido: string;
  puntaje_ats: number;
  puntaje_match: number;
  fecha: string;
  /** Fragmento de la oferta usada para generarlo (contexto de reutilización). */
  oferta?: string;
}

/** Payload de entrada para /api/cv. */
export interface CvRequest {
  cv: string;
  oferta?: string;
}
