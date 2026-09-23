import { NextResponse } from "next/server";
import { getProductById } from "@/lib/catalogue";
import { getAiClient, isAiConfigured } from "@/lib/ai";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Expected JSON request body." }, { status: 400 }); }
  const { productId, question } = body as { productId?: unknown; question?: unknown };
  if (typeof productId !== "string" || typeof question !== "string" || !question.trim() || question.trim().length > 500) return NextResponse.json({ error: "productId and question must be non-empty strings (question maximum: 500 characters)." }, { status: 400 });
  const product = getProductById(productId); if (!product) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (!isAiConfigured()) return NextResponse.json({ error: "AI Q&A is not configured. Add the CLASSGW_* server variables to enable it." }, { status: 503 });

  try {
    const completion = await getAiClient()!.chat.completions.create({
      model: process.env.CLASSGW_MODEL!,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You answer questions about exactly one second-hand listing. Use only the supplied listing data; do not use outside product knowledge. If the answer is not recorded, clearly say that it is not stated in this listing. Do not invent specifications, guess, infer unrecorded compatibility, give safety advice, or claim to have inspected the item. Keep answers concise." },
        { role: "user", content: `Listing data:\n${JSON.stringify(product)}\n\nQuestion: ${question.trim()}` },
      ],
    });
    const answer = completion.choices[0]?.message.content?.trim();
    if (!answer) throw new Error("Empty AI response");
    return NextResponse.json({ productId: product.id, answer, grounded: true });
  } catch (error) {
    console.error("AI Q&A failed", error);
    return NextResponse.json({ error: "AI Q&A is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
