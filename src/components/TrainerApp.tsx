"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { RepoForm } from "@/components/RepoForm";
import { QuizView } from "@/components/QuizView";
import { ResultsView } from "@/components/ResultsView";

export function TrainerApp() {
  const fase = useAppStore((s) => s.fase);

  // Rehidrata el estado guardado (sessionStorage) tras montar, para recuperar
  // el progreso si el usuario recarga a mitad del quiz o en resultados.
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex flex-1 items-start justify-center px-5 py-10 sm:py-14">
      {fase === "inicio" && <RepoForm />}
      {fase === "quiz" && <QuizView />}
      {fase === "resultados" && <ResultsView />}
    </div>
  );
}
