/**
 * URL canónica del sitio. En Vercel se auto-detecta con la variable de entorno
 * VERCEL_PROJECT_PRODUCTION_URL (el dominio de producción estable). Puedes
 * forzarla con NEXT_PUBLIC_SITE_URL (útil si usas un dominio propio).
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const siteConfig = {
  name: "RepoInterview Trainer",
  shortName: "RepoInterview",
  title: "RepoInterview Trainer — Prepárate para tu entrevista técnica",
  description:
    "Practica entrevistas técnicas con IA: pega un repositorio público de GitHub y responde preguntas sobre su código, features y conceptos. Recibe puntaje, feedback y un plan de estudio.",
  tagline:
    "Pega un repo de GitHub y una IA te entrevista sobre features, código y conceptos — con puntaje y feedback.",
} as const;
