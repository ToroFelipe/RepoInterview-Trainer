import type { Config } from "tailwindcss";

/**
 * Design tokens derivados de las imágenes de referencia (style-1.jpg, style-2.jpg):
 * estética aireada y minimalista, esquinas muy redondeadas, sombras suaves,
 * negro de alto contraste para acciones primarias y acentos pastel para categorizar.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutros base
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        border: "var(--border)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        muted: "var(--muted)",
        // Primario (negro de alto contraste)
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        // Acentos pastel (categorías de pregunta y estados de evaluación)
        pastel: {
          lavender: "var(--pastel-lavender)",
          blue: "var(--pastel-blue)",
          peach: "var(--pastel-peach)",
          green: "var(--pastel-green)",
          yellow: "var(--pastel-yellow)",
          coral: "var(--pastel-coral)",
        },
        // Estados semánticos de evaluación
        good: "var(--good)",
        "good-soft": "var(--good-soft)",
        partial: "var(--partial)",
        "partial-soft": "var(--partial-soft)",
        bad: "var(--bad)",
        "bad-soft": "var(--bad-soft)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17,17,17,0.04), 0 8px 24px -12px rgba(17,17,17,0.10)",
        card: "0 1px 3px rgba(17,17,17,0.05), 0 20px 40px -24px rgba(17,17,17,0.14)",
        lift: "0 2px 6px rgba(17,17,17,0.06), 0 28px 56px -20px rgba(17,17,17,0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.3s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
