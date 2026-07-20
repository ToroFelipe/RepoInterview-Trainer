"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Github, FileSearch, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { MODULES, type ModuleId } from "@/lib/modules";

const ICONO: Record<ModuleId, React.ReactNode> = {
  trainer: <Github className="size-4" />,
  cv: <FileSearch className="size-4" />,
  entrevista: <Users className="size-4" />,
};

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-canvas/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
        {/* Marca */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-2xl transition hover:opacity-90"
        >
          <div className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Code2 className="size-5" />
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-ink">RepoInterview</p>
            <p className="text-[11px] text-muted">Prepárate con IA</p>
          </div>
        </Link>

        {/* Navegación entre módulos */}
        <nav className="flex items-center gap-1">
          {MODULES.map((m) => {
            const activo =
              pathname === m.href || pathname.startsWith(m.href + "/");
            return (
              <Link
                key={m.id}
                href={m.href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                  activo
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-ink-soft hover:bg-surface-muted"
                )}
              >
                {ICONO[m.id]}
                <span className="hidden sm:inline">{m.short}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
