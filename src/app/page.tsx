"use client";

import { Code2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { RepoForm } from "@/components/RepoForm";
import { QuizView } from "@/components/QuizView";
import { ResultsView } from "@/components/ResultsView";

export default function Home() {
  const fase = useAppStore((s) => s.fase);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-canvas/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
              <Code2 className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">
                RepoInterview Trainer
              </p>
              <p className="text-[11px] text-muted">
                Entrena. Responde. Aprende.
              </p>
            </div>
          </div>
          <FaseIndicador fase={fase} />
        </div>
      </header>

      {/* Contenido */}
      <main className="flex flex-1 items-start justify-center px-5 py-10 sm:py-14">
        {fase === "inicio" && <RepoForm />}
        {fase === "quiz" && <QuizView />}
        {fase === "resultados" && <ResultsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-5 text-center text-xs text-muted">
        Hecho para prepararte mejor · Las respuestas se procesan con IA y pueden
        contener errores.
      </footer>
    </div>
  );
}

function FaseIndicador({ fase }: { fase: string }) {
  const pasos = [
    { id: "inicio", label: "Repo" },
    { id: "quiz", label: "Quiz" },
    { id: "resultados", label: "Resultados" },
  ];
  const activeIndex = pasos.findIndex((p) => p.id === fase);

  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {pasos.map((p, i) => (
        <div key={p.id} className="flex items-center gap-1.5">
          <span
            className={
              i <= activeIndex
                ? "text-xs font-medium text-ink"
                : "text-xs text-muted"
            }
          >
            {p.label}
          </span>
          {i < pasos.length - 1 && (
            <span className="text-muted">·</span>
          )}
        </div>
      ))}
    </div>
  );
}
