"use client";

import { useEffect } from "react";
import { useCvStore } from "./useCvStore";
import { CvAnalyzer } from "./CvAnalyzer";

export function CvPage() {
  // Rehidrata el CV y el último análisis guardados en localStorage.
  useEffect(() => {
    useCvStore.persist.rehydrate();
  }, []);

  return <CvAnalyzer />;
}
