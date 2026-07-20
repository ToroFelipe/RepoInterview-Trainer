// Tipos del módulo "Simulador de Entrevista Conductual / RRHH".

export type FocoConductual =
  | "mixto"
  | "liderazgo"
  | "trabajo-en-equipo"
  | "resolucion-conflictos"
  | "fortalezas-debilidades"
  | "motivacion";

export interface BehavioralConfig {
  /** Rol/puesto al que apunta el candidato. */
  rol: string;
  cantidad: number;
  foco: FocoConductual;
}

/** Pregunta conductual generada por la IA. */
export interface PreguntaConductual {
  id: string;
  pregunta: string;
  /** Categoría legible (ej. "Liderazgo", "Resolución de conflictos"). */
  categoria: string;
  /** Qué evalúa el entrevistador con esta pregunta. */
  que_evalua: string;
}

/** Presencia de cada componente del método STAR en la respuesta. */
export interface Star {
  situacion: boolean;
  tarea: boolean;
  accion: boolean;
  resultado: boolean;
}

/** Evaluación de una respuesta conductual. */
export interface EvaluacionConductualPregunta {
  preguntaId: string;
  star: Star;
  puntaje: number; // 0–100
  fortalezas: string[];
  mejoras: string[];
  respuesta_modelo: string;
}

/** Resultado completo de la entrevista conductual. */
export interface EvaluacionConductual {
  puntaje_global: number; // 0–100
  recomendaciones_generales: string[];
  detalle: EvaluacionConductualPregunta[];
}

/** Entrada de historial de sesiones (persistida en localStorage). */
export interface SesionHistorial {
  id: string;
  rol: string;
  /** Fecha ISO. */
  fecha: string;
  puntaje_global: number;
  cantidad: number;
}
