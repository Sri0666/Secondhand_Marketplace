import { NextResponse } from "next/server";
import { searchCatalogue } from "@/lib/catalogue";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Expected JSON request body." }, { status: 400 }); }
  const query = typeof (body as { query?: unknown }).query === "string" ? (body as { query: string }).query.trim() : "";
  if (!query) return NextResponse.json({ error: "query must be a non-empty string." }, { status: 400 });
  // TODO: Send only this query to the server-side CognitioLabs model to extract structured intent.
  // TODO: Use that intent to deterministically filter/rank this local catalogue. Never call a model from browser code.
  return NextResponse.json({ query, mode: "deterministic-placeholder", results: searchCatalogue(query) });
}
