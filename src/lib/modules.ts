// Registro central de los módulos de la app (el "ecosistema" de preparación).
// Añadir un módulo futuro = agregar una entrada aquí + su carpeta en src/features.
// El icono se mapea en los componentes (Navbar / dashboard) para no acoplar
// este registro a lucide-react.

export type ModuleId = "trainer" | "cv" | "entrevista";

export interface ModuleInfo {
  id: ModuleId;
  href: string;
  /** Nombre completo del módulo. */
  name: string;
  /** Etiqueta corta para la navegación. */
  short: string;
  /** Descripción de una línea para las tarjetas del dashboard. */
  description: string;
  /** Clase de acento pastel para la tarjeta/ícono. */
  accent: string;
}

export const MODULES: ModuleInfo[] = [
  {
    id: "trainer",
    href: "/trainer",
    name: "RepoInterview Trainer",
    short: "Repo",
    description:
      "Pega un repositorio público de GitHub y una IA te entrevista sobre su código, features y conceptos, con puntaje y feedback.",
    accent: "bg-pastel-blue",
  },
  {
    id: "cv",
    href: "/cv",
    name: "Analizador de CV",
    short: "CV",
    description:
      "Pega tu CV (y opcionalmente una oferta) y recibe el match, los huecos, alertas ATS y mejoras priorizadas por impacto.",
    accent: "bg-pastel-green",
  },
  {
    id: "entrevista",
    href: "/entrevista",
    name: "Entrevista por Competencias",
    short: "RRHH",
    description:
      "Practica preguntas blandas y de RRHH, y recibe feedback con el método STAR, puntaje y respuestas modelo.",
    accent: "bg-pastel-peach",
  },
];

export function getModule(id: ModuleId): ModuleInfo {
  return MODULES.find((m) => m.id === id)!;
}
