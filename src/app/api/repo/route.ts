import { NextResponse } from "next/server";
import { buildRepoDigest, type GithubError } from "@/lib/github";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    if (!body?.url) {
      return NextResponse.json(
        { error: "Falta la URL del repositorio." },
        { status: 400 }
      );
    }

    const result = await buildRepoDigest(body.url);
    return NextResponse.json(result);
  } catch (err) {
    const e = err as GithubError;
    const status =
      e.code === "not_found"
        ? 404
        : e.code === "rate_limit"
        ? 429
        : e.code === "invalid_url" || e.code === "private" || e.code === "empty"
        ? 400
        : 502;
    return NextResponse.json(
      { error: e.message || "No se pudo leer el repositorio." },
      { status }
    );
  }
}
