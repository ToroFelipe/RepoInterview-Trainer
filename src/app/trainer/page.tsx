import type { Metadata } from "next";
import { TrainerApp } from "@/components/TrainerApp";

export const metadata: Metadata = {
  title: { absolute: "RepoInterview Trainer — Entrena con un repo de GitHub" },
  description:
    "Pega un repositorio público de GitHub y una IA te entrevista sobre su código, features y conceptos, con puntaje, feedback y plan de estudio.",
  alternates: { canonical: "/trainer" },
};

export default function TrainerPage() {
  return <TrainerApp />;
}
