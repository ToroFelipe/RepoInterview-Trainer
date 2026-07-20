import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CvAnalisis } from "./types";

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

  setCv: (texto: string) => void;
  setOferta: (texto: string) => void;
  setResultado: (r: CvAnalisis | null) => void;
  limpiarResultado: () => void;
  reset: () => void;
}

export const useCvStore = create<CvState>()(
  persist(
    (set) => ({
      cvTexto: "",
      ofertaTexto: "",
      resultado: null,

      setCv: (cvTexto) => set({ cvTexto }),
      setOferta: (ofertaTexto) => set({ ofertaTexto }),
      setResultado: (resultado) => set({ resultado }),
      limpiarResultado: () => set({ resultado: null }),
      reset: () => set({ cvTexto: "", ofertaTexto: "", resultado: null }),
    }),
    {
      name: "repoiq-cv",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
      skipHydration: true,
      partialize: (s) => ({
        cvTexto: s.cvTexto,
        ofertaTexto: s.ofertaTexto,
        resultado: s.resultado,
      }),
    }
  )
);
