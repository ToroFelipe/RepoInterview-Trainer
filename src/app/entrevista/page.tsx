import type { Metadata } from "next";
import { BehavioralPage } from "@/features/behavioral/BehavioralPage";

export const metadata: Metadata = {
  title: "Entrevista por Competencias",
  description:
    "Practica preguntas de RRHH adaptadas a tu rol y recibe feedback con el método STAR: puntaje, fortalezas, mejoras y respuestas modelo.",
  alternates: { canonical: "/entrevista" },
};

export default function Page() {
  return <BehavioralPage />;
}
