import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  BehavioralConfig,
  PreguntaConductual,
  EvaluacionConductual,
  SesionHistorial,
} from "./types";

// localStorage: el usuario quiere no perder la sesión ni el historial al recargar.
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export type FaseConductual = "inicio" | "quiz" | "resultados";

interface BehavioralState {
  fase: FaseConductual;
  config: BehavioralConfig;
  preguntas: PreguntaConductual[];
  indiceActual: number;
  respuestas: Record<string, string>;
  evaluacion: EvaluacionConductual | null;
  historial: SesionHistorial[];

  setConfig: (config: Partial<BehavioralConfig>) => void;
  iniciar: (preguntas: PreguntaConductual[]) => void;
  responder: (preguntaId: string, texto: string) => void;
  irA: (indice: number) => void;
  siguiente: () => void;
  anterior: () => void;
  finalizar: (evaluacion: EvaluacionConductual) => void;
  reiniciar: () => void;
  respondidas: () => number;
}

const CONFIG_DEFAULT: BehavioralConfig = {
  rol: "",
  cantidad: 5,
  foco: "mixto",
};

export const useBehavioralStore = create<BehavioralState>()(
  persist(
    (set, get) => ({
      fase: "inicio",
      config: CONFIG_DEFAULT,
      preguntas: [],
      indiceActual: 0,
      respuestas: {},
      evaluacion: null,
      historial: [],

      setConfig: (config) =>
        set((s) => ({ config: { ...s.config, ...config } })),

      iniciar: (preguntas) =>
        set({
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
          indiceActual: Math.max(
            0,
            Math.min(s.preguntas.length - 1, indice)
          ),
        })),

      siguiente: () =>
        set((s) => ({
          indiceActual: Math.min(s.preguntas.length - 1, s.indiceActual + 1),
        })),

      anterior: () =>
        set((s) => ({ indiceActual: Math.max(0, s.indiceActual - 1) })),

      finalizar: (evaluacion) =>
        set((s) => {
          const entrada: SesionHistorial = {
            id: `${Date.now()}`,
            rol: s.config.rol.trim() || "Sin rol",
            fecha: new Date().toISOString(),
            puntaje_global: evaluacion.puntaje_global,
            cantidad: s.preguntas.length,
          };
          return {
            evaluacion,
            fase: "resultados",
            // Guarda hasta 10 sesiones recientes.
            historial: [entrada, ...s.historial].slice(0, 10),
          };
        }),

      reiniciar: () =>
        set({
          fase: "inicio",
          preguntas: [],
          indiceActual: 0,
          respuestas: {},
          evaluacion: null,
        }),

      respondidas: () => {
        const { respuestas } = get();
        return Object.values(respuestas).filter((t) => t.trim().length > 0)
          .length;
      },
    }),
    {
      name: "repoiq-behavioral",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
      skipHydration: true,
      partialize: (s) => ({
        fase: s.fase,
        config: s.config,
        preguntas: s.preguntas,
        indiceActual: s.indiceActual,
        respuestas: s.respuestas,
        evaluacion: s.evaluacion,
        historial: s.historial,
      }),
    }
  )
);
