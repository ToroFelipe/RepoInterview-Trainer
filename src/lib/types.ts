// Tipos compartidos entre cliente y servidor.

export type Dificultad = "junior" | "semi-senior" | "senior";
export type Foco = "features" | "codigo" | "conceptos" | "mixto";

export type TipoPregunta =
  | "feature"
  | "codigo"
  | "funcion"
  | "concepto"
  | "termino";

/** Pregunta generada por la IA. `respuesta_esperada` NO se muestra al usuario. */
export interface Pregunta {
  id: string;
  pregunta: string;
  tipo: TipoPregunta;
  /** Fragmento de código o archivo relevante (opcional). */
  contexto?: string;
  /** Ruta/archivo del que proviene el contexto (opcional, para syntax highlight). */
  archivo?: string;
  /** Referencia interna para la evaluación. No se muestra hasta el feedback. */
  respuesta_esperada: string;
}

/** Respuesta del usuario a una pregunta. */
export interface RespuestaUsuario {
  preguntaId: string;
  texto: string;
}

export type Veredicto = "bien" | "parcial" | "mal";

/** Evaluación de una pregunta individual. */
export interface EvaluacionPregunta {
  preguntaId: string;
  correcta: Veredicto;
  puntaje: number; // 0–100
  comentario: string;
  respuesta_correcta: string;
}

/** Resultado completo de la evaluación. */
export interface Evaluacion {
  puntaje_global: number; // 0–100
  resumen: {
    bien: number;
    parcial: number;
    mal: number;
  };
  detalle: EvaluacionPregunta[];
  recomendaciones: string[];
}

/** Metadatos del repositorio analizado. */
export interface RepoMeta {
  owner: string;
  repo: string;
  branch: string;
  descripcion?: string;
  lenguajes?: string[];
  stars?: number;
  url: string;
  /** Cantidad de archivos incluidos en el digest. */
  archivosIncluidos: number;
}

/** Payload que devuelve /api/repo. */
export interface RepoDigestResponse {
  meta: RepoMeta;
  digest: string;
}

/** Parámetros de configuración del quiz elegidos por el usuario. */
export interface QuizConfig {
  cantidad: number;
  dificultad: Dificultad;
  foco: Foco;
}

/** Respuesta de error estándar de las API routes. */
export interface ApiError {
  error: string;
}
