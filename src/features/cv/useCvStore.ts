import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CvAnalisis, CvGuardado } from "./types";

// Storage seguro para SSR. A diferencia del trainer, aquí usamos localStorage:
// el usuario quiere no perder su CV pegado ni el último análisis al recargar.
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

interface CvState {
  cvTexto: string;
  ofertaTexto: string;
  resultado: CvAnalisis | null;
  /** CVs optimizados guardados localmente para reutilizarlos. */
  cvsGuardados: CvGuardado[];

  setCv: (texto: string) => void;
  setOferta: (texto: string) => void;
  setResultado: (r: CvAnalisis | null) => void;
  limpiarResultado: () => void;
  /** Guarda un CV optimizado en la biblioteca local (sin duplicados por id). */
  guardarCv: (cv: CvGuardado) => void;
  eliminarCv: (id: string) => void;
  reset: () => void;
}

export const useCvStore = create<CvState>()(
  persist(
    (set) => ({
      cvTexto: "",
      ofertaTexto: "",
      resultado: null,
      cvsGuardados: [],

      setCv: (cvTexto) => set({ cvTexto }),
      setOferta: (ofertaTexto) => set({ ofertaTexto }),
      setResultado: (resultado) => set({ resultado }),
      limpiarResultado: () => set({ resultado: null }),
      guardarCv: (cv) =>
        set((s) => ({
          cvsGuardados: [cv, ...s.cvsGuardados.filter((c) => c.id !== cv.id)],
        })),
      eliminarCv: (id) =>
        set((s) => ({
          cvsGuardados: s.cvsGuardados.filter((c) => c.id !== id),
        })),
      reset: () => set({ cvTexto: "", ofertaTexto: "", resultado: null }),
    }),
    {
      name: "repoiq-cv",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = persisted as Partial<CvState> | undefined;
        const resultado = p?.resultado
          ? {
              ...p.resultado,
              keywords_faltantes: Array.isArray(p.resultado.keywords_faltantes)
                ? p.resultado.keywords_faltantes
                : [],
              fortalezas: Array.isArray(p.resultado.fortalezas)
                ? p.resultado.fortalezas
                : [],
              debilidades: Array.isArray(p.resultado.debilidades)
                ? p.resultado.debilidades
                : [],
              logros_a_reformular: Array.isArray(p.resultado.logros_a_reformular)
                ? p.resultado.logros_a_reformular
                : [],
              alertas_ats: Array.isArray(p.resultado.alertas_ats)
                ? p.resultado.alertas_ats
                : [],
              sugerencias_priorizadas: Array.isArray(
                p.resultado.sugerencias_priorizadas
              )
                ? p.resultado.sugerencias_priorizadas
                : [],
              requisitos_ats: Array.isArray(p.resultado.requisitos_ats)
                ? p.resultado.requisitos_ats
                : [],
            }
          : null;
        return {
          ...current,
          ...p,
          resultado,
          cvsGuardados: Array.isArray(p?.cvsGuardados) ? p.cvsGuardados : [],
        };
      },
      partialize: (s) => ({
        cvTexto: s.cvTexto,
        ofertaTexto: s.ofertaTexto,
        resultado: s.resultado,
        cvsGuardados: s.cvsGuardados,
      }),
    }
  )
);
