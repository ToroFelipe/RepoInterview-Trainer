"use client";

import { cn } from "@/lib/cn";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-2xl border border-border bg-surface-muted/70 p-1",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-xl font-medium transition-all duration-150",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-ink-soft hover:bg-surface"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
