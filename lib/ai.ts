import OpenAI from "openai";
import savedEmbeddings from "@/data/product-embeddings.json";
import type { Product } from "@/lib/types";
import type { ProductCondition } from "@/lib/types";

/** CognitioLabs gateway model identifiers. Keep these server-side and fixed. */
export const CHAT_MODEL = process.env.CLASSGW_MODEL || "gpt-5.6-terra";
export const EMBEDDING_MODEL = process.env.CLASSGW_EMBED_MODEL || "openai/text-embedding-3-small";
export const MAX_SEMANTIC_SEARCH_RESULTS = 12;

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
  return Boolean(gatewayConfig());
}

function gatewayConfig() {
  const apiKey = process.env.CLASSGW_KEY ?? process.env.COGNITIOLABS_API_KEY;
  const baseURL = process.env.CLASSGW_BASE_URL ?? process.env.COGNITIOLABS_BASE_URL;
  return apiKey && baseURL ? { apiKey, baseURL } : null;
}

export function getAiClient() {
  const config = gatewayConfig();
  return config ? new OpenAI(config) : null;
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
    model: CHAT_MODEL,
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

function isEmbedding(value: unknown): value is number[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function getSavedEmbeddings(products: Product[]) {
  const artifact = savedEmbeddings as unknown as {
    model?: unknown;
    products?: Array<{ id?: unknown; embedding?: unknown }>;
  };
  if (artifact.model !== EMBEDDING_MODEL || !Array.isArray(artifact.products)) {
    throw new Error("Product embeddings are missing or use a different model. Run npm run generate:embeddings.");
  }
  const vectorsById = new Map<string, number[]>();
  for (const item of artifact.products) {
    if (typeof item.id !== "string" || !isEmbedding(item.embedding)) {
      throw new Error("The saved product embedding artifact is invalid.");
    }
    vectorsById.set(item.id, item.embedding);
  }
  if (products.some((product) => !vectorsById.has(product.id))) {
    throw new Error("Product embeddings are out of date. Run npm run generate:embeddings.");
  }
  return vectorsById;
}

function cosineSimilarity(left: number[], right: number[]) {
  if (left.length !== right.length) return -1;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }
  return leftMagnitude && rightMagnitude ? dot / Math.sqrt(leftMagnitude * rightMagnitude) : -1;
}

/** Ranks already-authorized local listings; only the shopper query is embedded at request time. */
export async function rankProductsBySemanticSimilarity(query: string, products: Product[]) {
  if (!products.length) return [];
  const client = getAiClient();
  if (!client) throw new Error("AI search is not configured.");
  const vectorsById = getSavedEmbeddings(products);
  const queryResponse = await client.embeddings.create({ model: EMBEDDING_MODEL, input: query, encoding_format: "float" });
  const queryEmbedding = queryResponse.data[0]?.embedding;
  if (!isEmbedding(queryEmbedding)) throw new Error("The AI service returned an invalid search embedding.");

  return products
    .map((product) => ({ product, score: cosineSimilarity(queryEmbedding, vectorsById.get(product.id) ?? []) }))
    .sort((left, right) => right.score - left.score || left.product.price - right.product.price)
    .slice(0, MAX_SEMANTIC_SEARCH_RESULTS)
    .map(({ product }) => product);
}

/** Reorders a semantic shortlist without allowing the model to introduce other listings. */
export async function rerankSemanticCandidates(query: string, products: Product[]) {
  if (!products.length) return { products: [], explanation: "No eligible listings matched your search filters." };
  const client = getAiClient();
  if (!client) throw new Error("AI search is not configured.");

  const completion = await client.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "Rank the supplied second-hand marketplace candidates for the shopper query. Return JSON only as {\"productIds\": string[], \"explanation\": string}; do not include any other fields or prose. Include each supplied ID exactly once, in descending relevance. You may only use IDs present in the supplied candidates. explanation must be one short, high-level sentence about relevance to the query (maximum 160 characters); it must not name a product or state any product detail. Never invent products, product names, specifications, conditions, prices, compatibility, or any other listing details.",
      },
      {
        role: "user",
        content: `Shopper query:\n${query}\n\nSemantic-search candidates:\n${JSON.stringify(products)}`,
      },
    ],
  });

  const parsed = parseJsonObject(textFromCompletion(completion.choices[0]?.message.content ?? null));
  if (Object.keys(parsed).length !== 2 || !Array.isArray(parsed.productIds) || typeof parsed.explanation !== "string") {
    throw new Error("The AI service returned invalid candidate ranking data.");
  }
  const explanation = parsed.explanation.trim();
  if (!explanation || explanation.length > 160) throw new Error("The AI service returned an invalid candidate explanation.");
  const candidatesById = new Map(products.map((product) => [product.id, product]));
  const rankedIds = parsed.productIds.filter((id): id is string => typeof id === "string" && candidatesById.has(id));
  if (rankedIds.length !== products.length || new Set(rankedIds).size !== products.length) {
    throw new Error("The AI service returned an incomplete candidate ranking.");
  }
  return { products: rankedIds.map((id) => candidatesById.get(id)!), explanation };
}
