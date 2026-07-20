import type { Metadata } from "next";
import { CvPage } from "@/features/cv/CvPage";

export const metadata: Metadata = {
  title: "Analizador de CV",
  description:
    "Pega tu CV y una oferta opcional: una IA evalúa el match, detecta keywords faltantes, alertas ATS y te entrega mejoras priorizadas por impacto.",
  alternates: { canonical: "/cv" },
};

export default function Page() {
  return <CvPage />;
}
