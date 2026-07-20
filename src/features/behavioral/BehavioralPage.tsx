"use client";

import { useEffect } from "react";
import { useBehavioralStore } from "./useBehavioralStore";
import { BehavioralSetup } from "./BehavioralSetup";
import { BehavioralQuiz } from "./BehavioralQuiz";
import { BehavioralResults } from "./BehavioralResults";

export function BehavioralPage() {
  const fase = useBehavioralStore((s) => s.fase);

  // Rehidrata la sesión y el historial guardados en localStorage.
  useEffect(() => {
    useBehavioralStore.persist.rehydrate();
  }, []);

  return (
    <>
      {fase === "inicio" && <BehavioralSetup />}
      {fase === "quiz" && <BehavioralQuiz />}
      {fase === "resultados" && <BehavioralResults />}
    </>
  );
}
