import { NextResponse } from "next/server";
import { getProductById } from "@/lib/catalogue";
import { isAiConfigured } from "@/lib/ai";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Expected JSON request body." }, { status: 400 }); }
  const { productId, question } = body as { productId?: unknown; question?: unknown };
  if (typeof productId !== "string" || typeof question !== "string" || !question.trim()) return NextResponse.json({ error: "productId and question must be non-empty strings." }, { status: 400 });
  const product = getProductById(productId); if (!product) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  // TODO: Invoke getAiClient() here on the server only. Provide only `product`, `question`, and grounding instructions.
  // The prompt must say: answer from catalogue data; say information is missing when absent; never invent details.
  return NextResponse.json({ productId: product.id, answer: `Placeholder: ${product.title} is a demo listing. Its recorded condition is ${product.condition}. Model configuration is ${isAiConfigured() ? "available" : "not set"}.`, grounded: true });
}
