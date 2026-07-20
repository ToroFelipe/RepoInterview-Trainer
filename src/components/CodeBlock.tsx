"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/cn";

/** Deduce el lenguaje de sintaxis a partir de la extensión del archivo. */
function langFromPath(path?: string): string {
  if (!path) return "text";
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    java: "java",
    go: "go",
    rb: "ruby",
    php: "php",
    rs: "rust",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    kt: "kotlin",
    swift: "swift",
    json: "json",
    sql: "sql",
    sh: "bash",
    vue: "markup",
    svelte: "markup",
  };
  return map[ext] ?? "text";
}

interface CodeBlockProps {
  code: string;
  archivo?: string;
  className?: string;
}

export function CodeBlock({ code, archivo, className }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface-muted/60",
        className
      )}
    >
      {archivo && (
        <div className="flex items-center gap-2 border-b border-border/70 bg-surface/70 px-4 py-2">
          <span className="size-2 rounded-full bg-pastel-coral" />
          <span className="font-mono text-xs text-muted">{archivo}</span>
        </div>
      )}
      <div className="max-h-80 overflow-auto text-[13px]">
        <SyntaxHighlighter
          language={langFromPath(archivo)}
          style={oneLight}
          customStyle={{
            margin: 0,
            padding: "1rem 1.15rem",
            background: "transparent",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
          codeTagProps={{
            style: { fontFamily: "var(--font-mono)" },
          }}
          wrapLongLines
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
