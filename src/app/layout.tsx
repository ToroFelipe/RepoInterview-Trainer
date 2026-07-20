import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { siteUrl, siteConfig } from "@/lib/site";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.title,
    template: "%s · RepoInterview Trainer",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "entrevista técnica",
    "preparación de entrevistas",
    "preguntas de entrevista de programación",
    "GitHub",
    "quiz de código",
    "práctica de programación",
    "reclutador con IA",
    "code review",
    "desarrollo de software",
    "entrevistas de TI",
    "Groq",
    "Next.js",
  ],
  authors: [{ name: "Felipe Toro" }],
  creator: "Felipe Toro",
  category: "education",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#16161a",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <footer className="border-t border-border/60 py-5 text-center text-xs text-muted">
            Hecho para prepararte mejor · Las respuestas se procesan con IA y
            pueden contener errores.
          </footer>
        </div>
      </body>
    </html>
  );
}
