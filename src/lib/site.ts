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
    "Tres herramientas con IA para preparar tu entrevista: entrena con un repositorio de GitHub, optimiza tu CV (match y ATS) y practica la entrevista conductual con el método STAR. Con puntaje, feedback y reportes descargables.",
  tagline:
    "Entrena con un repo, optimiza tu CV y practica la entrevista conductual — todo con IA, puntaje y feedback.",
} as const;
