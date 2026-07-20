import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt =
  "RepoInterview Trainer — Prepárate para tu entrevista técnica con IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const chips: [string, string][] = [
  ["Features", "#dcebfd"],
  ["Código", "#ebe7fb"],
  ["Conceptos", "#e4f4d9"],
  ["Puntaje + PDF", "#fcecdd"],
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #e6edf7 0%, #f6f5f3 48%, #f8ede1 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 76,
              height: 76,
              borderRadius: 22,
              background: "#16161a",
            }}
          >
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: "#16161a" }}>
            RepoInterview Trainer
          </div>
        </div>

        {/* Titular */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              fontSize: 70,
              fontWeight: 800,
              color: "#16161a",
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            Prepárate para tu entrevista técnica
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#4a4a50",
              lineHeight: 1.35,
              maxWidth: 860,
            }}
          >
            {siteConfig.tagline}
          </div>
        </div>

        {/* Chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {chips.map(([label, bg]) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                background: bg,
                color: "#16161a",
                fontSize: 25,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
