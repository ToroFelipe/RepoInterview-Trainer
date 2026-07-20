"use client";

interface ScoreRingProps {
  score: number; // 0–100
  size?: number;
}

export function ScoreRing({ score, size = 132 }: ScoreRingProps) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Color según rango de puntaje.
  const color =
    score >= 75
      ? "var(--good)"
      : score >= 40
      ? "var(--partial)"
      : "var(--bad)";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Puntaje ${score} de 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums text-ink">
          {score}
        </span>
        <span className="text-xs font-medium text-muted">/ 100</span>
      </div>
    </div>
  );
}
