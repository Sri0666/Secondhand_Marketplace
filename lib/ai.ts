import OpenAI from "openai";
import type { ProductCondition } from "@/lib/types";

export interface SearchIntent {
  keywords?: string[];
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRamGB?: number;
  minStorageGB?: number;
  condition?: ProductCondition;
  acceptableIssues?: string[];
}

export function isAiConfigured() {
  return Boolean(process.env.CLASSGW_KEY && process.env.CLASSGW_BASE_URL && process.env.CLASSGW_MODEL);
}

export function getAiClient() {
  if (!isAiConfigured()) return null;
  return new OpenAI({ apiKey: process.env.CLASSGW_KEY, baseURL: process.env.CLASSGW_BASE_URL });
}

function textFromCompletion(content: string | null) {
  if (!content) throw new Error("The AI service returned an empty response.");
  return content.trim();
}

function parseJsonObject(value: string): Record<string, unknown> {
  const unfenced = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("The AI service returned invalid structured search data.");
  const parsed: unknown = JSON.parse(unfenced.slice(start, end + 1));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("The AI service returned invalid structured search data.");
  return parsed as Record<string, unknown>;
}

export async function getSearchIntent(query: string, categories: string[]): Promise<SearchIntent> {
  const client = getAiClient();
  if (!client) throw new Error("AI search is not configured.");

  const completion = await client.chat.completions.create({
    model: process.env.CLASSGW_MODEL!,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `Extract marketplace search filters. Return JSON only. Use only explicitly stated filters and omit all others. Allowed fields: {"keywords": string[], "category": string, "brand": string, "minPrice": number, "maxPrice": number, "minRamGB": number, "minStorageGB": number, "condition": "Working"|"Minor Fault"|"Repair Needed"|"Parts Only", "acceptableIssues": string[]}. acceptableIssues means issues the shopper explicitly says are acceptable; use concise issue terms. keywords must be concise product attributes or names; do not include category, brand, condition, price, RAM, storage, filler words, or unsupported claims. Category must be one of: ${categories.join(", ")}.`,
      },
      { role: "user", content: query },
    ],
  });

  const parsed = parseJsonObject(textFromCompletion(completion.choices[0]?.message.content ?? null));
  const validConditions = new Set<ProductCondition>(["Working", "Minor Fault", "Repair Needed", "Parts Only"]);
  const keywords = Array.isArray(parsed.keywords) ? parsed.keywords.filter((keyword): keyword is string => typeof keyword === "string").map((keyword) => keyword.trim()).filter(Boolean).slice(0, 8) : [];
  const intent: SearchIntent = {};
  if (keywords.length) intent.keywords = keywords;
  const acceptableIssues = Array.isArray(parsed.acceptableIssues) ? parsed.acceptableIssues.filter((issue): issue is string => typeof issue === "string").map((issue) => issue.trim()).filter(Boolean).slice(0, 8) : [];
  if (acceptableIssues.length) intent.acceptableIssues = acceptableIssues;
  if (typeof parsed.category === "string" && categories.includes(parsed.category)) intent.category = parsed.category;
  if (typeof parsed.brand === "string" && parsed.brand.trim()) intent.brand = parsed.brand.trim().slice(0, 100);
  for (const field of ["minPrice", "maxPrice", "minRamGB", "minStorageGB"] as const) {
    const value = parsed[field];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) intent[field] = value;
  }
  if (typeof parsed.condition === "string" && validConditions.has(parsed.condition as ProductCondition)) intent.condition = parsed.condition as ProductCondition;
  return intent;
}
