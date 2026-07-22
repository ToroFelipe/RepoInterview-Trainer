import Link from "next/link";
import { ArrowRight, Github, FileSearch, Users, Sparkles } from "lucide-react";
import { MODULES, type ModuleId } from "@/lib/modules";

const ICONO: Record<ModuleId, React.ReactNode> = {
  trainer: <Github className="size-6" />,
  cv: <FileSearch className="size-6" />,
  entrevista: <Users className="size-6" />,
};

export default function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:py-16">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center animate-fade-up">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-ink-soft backdrop-blur">
          <Sparkles className="size-3.5" />
          Preparación de entrevistas con IA
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Todo lo que necesitas para
          <br />
          tu próxima entrevista
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-ink-soft">
          Tres herramientas en un solo lugar: entrena con un repositorio,
          optimiza tu CV y practica la entrevista por competencias. Todo con IA y en
          español.
        </p>
      </div>

      {/* Tarjetas de módulos */}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => (
          <Link
            key={m.id}
            href={m.href}
            style={{ animationDelay: `${Math.min(i * 80, 320)}ms` }}
            className="group flex flex-col rounded-4xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-sm transition-all animate-fade-up hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div
              className={`mb-5 inline-flex size-12 items-center justify-center rounded-2xl text-ink ${m.accent}`}
            >
              {ICONO[m.id]}
            </div>
            <h2 className="text-lg font-semibold text-ink">{m.name}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
              {m.description}
            </p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
              Abrir herramienta
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-center text-xs text-muted">
        Sin cuentas ni base de datos · Todo vive en tu navegador · Las claves de
        API solo se usan en el servidor.
      </p>
    </div>
  );
}
