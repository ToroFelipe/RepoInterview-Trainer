import { create } from "zustand";
import type {
  RepoMeta,
  Pregunta,
  RespuestaUsuario,
  Evaluacion,
  QuizConfig,
} from "@/lib/types";

export type Fase = "inicio" | "quiz" | "resultados";

interface AppState {
  fase: Fase;

  // Datos del repo y preguntas
  repoMeta: RepoMeta | null;
  digest: string | null;
  preguntas: Pregunta[];
  config: QuizConfig;

  // Progreso del quiz
  indiceActual: number;
  respuestas: Record<string, string>;

  // Evaluación
  evaluacion: Evaluacion | null;

  // Acciones
  setConfig: (config: Partial<QuizConfig>) => void;
  iniciarQuiz: (data: {
    repoMeta: RepoMeta;
    digest: string;
    preguntas: Pregunta[];
  }) => void;
  responder: (preguntaId: string, texto: string) => void;
  irA: (indice: number) => void;
  siguiente: () => void;
  anterior: () => void;
  setEvaluacion: (evaluacion: Evaluacion) => void;
  verResultados: () => void;
  reiniciar: () => void;

  // Selectores derivados
  getRespuestasArray: () => RespuestaUsuario[];
  respondidas: () => number;
}

const CONFIG_DEFAULT: QuizConfig = {
  cantidad: 5,
  dificultad: "semi-senior",
  foco: "mixto",
};

export const useAppStore = create<AppState>((set, get) => ({
  fase: "inicio",
  repoMeta: null,
  digest: null,
  preguntas: [],
  config: CONFIG_DEFAULT,
  indiceActual: 0,
  respuestas: {},
  evaluacion: null,

  setConfig: (config) =>
    set((s) => ({ config: { ...s.config, ...config } })),

  iniciarQuiz: ({ repoMeta, digest, preguntas }) =>
    set({
      repoMeta,
      digest,
      preguntas,
      fase: "quiz",
      indiceActual: 0,
      respuestas: {},
      evaluacion: null,
    }),

  responder: (preguntaId, texto) =>
    set((s) => ({ respuestas: { ...s.respuestas, [preguntaId]: texto } })),

  irA: (indice) =>
    set((s) => ({
      indiceActual: Math.max(0, Math.min(s.preguntas.length - 1, indice)),
    })),

  siguiente: () =>
    set((s) => ({
      indiceActual: Math.min(s.preguntas.length - 1, s.indiceActual + 1),
    })),

  anterior: () =>
    set((s) => ({ indiceActual: Math.max(0, s.indiceActual - 1) })),

  setEvaluacion: (evaluacion) => set({ evaluacion }),

  verResultados: () => set({ fase: "resultados" }),

  reiniciar: () =>
    set({
      fase: "inicio",
      repoMeta: null,
      digest: null,
      preguntas: [],
      indiceActual: 0,
      respuestas: {},
      evaluacion: null,
    }),

  getRespuestasArray: () => {
    const { respuestas } = get();
    return Object.entries(respuestas).map(([preguntaId, texto]) => ({
      preguntaId,
      texto,
    }));
  },

  respondidas: () => {
    const { respuestas } = get();
    return Object.values(respuestas).filter((t) => t.trim().length > 0).length;
  },
}));
