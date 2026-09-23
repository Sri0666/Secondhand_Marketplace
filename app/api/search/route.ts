import { NextResponse } from "next/server";
import { categories, searchCatalogue, searchCatalogueByIntent } from "@/lib/catalogue";
import { getSearchIntent, isAiConfigured } from "@/lib/ai";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Expected JSON request body." }, { status: 400 }); }
  const query = typeof (body as { query?: unknown }).query === "string" ? (body as { query: string }).query.trim() : "";
  if (!query || query.length > 300) return NextResponse.json({ error: "query must be between 1 and 300 characters." }, { status: 400 });
  if (!isAiConfigured()) return NextResponse.json({ query, mode: "local", results: searchCatalogue(query), notice: "AI search is not configured; showing local keyword results." });

  try {
    const intent = await getSearchIntent(query, categories);
    return NextResponse.json({ query, mode: "ai", intent, results: searchCatalogueByIntent(intent) });
  } catch (error) {
    console.error("AI search failed", error);
    return NextResponse.json({ query, mode: "local", results: searchCatalogue(query), notice: "AI search is temporarily unavailable; showing local keyword results." });
  }
}
