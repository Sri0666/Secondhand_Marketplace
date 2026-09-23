import { CHAT_MODEL, getAiClient } from "@/lib/ai";
import type { Product } from "@/lib/types";

const MAX_TAGS = 6;
const TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+){0,2}$/;

export function validateAiTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter((tag) => TAG_PATTERN.test(tag)))].slice(0, MAX_TAGS);
}

/** Called only by the listing-creation workflow; failures deliberately return no tags. */
export async function generateListingTags(listing: Omit<Product, "id" | "aiTags">): Promise<string[]> {
  const client = getAiClient();
  if (!client) return [];
  const listingForAi = { title: listing.title, description: listing.description, brand: listing.brand, model: listing.model, category: listing.category, subcategory: listing.subcategory, condition: listing.condition, specifications: listing.specifications, knownIssues: listing.knownIssues, testedFunctions: listing.testedFunctions, listingType: listing.listingType };
  try {
    const completion = await client.chat.completions.create({ model: CHAT_MODEL, temperature: 0, messages: [{ role: "system", content: "You are an AI assistant for a second-hand electronics marketplace.\n\nGiven a product listing, generate 3 to 6 short, useful tags that help buyers discover and understand the item.\n\nFocus on:\n- intended use, e.g. gaming, study, coding, office-work\n- notable features, e.g. 5g, high-refresh-rate, portable, noise-cancelling\n- condition-related traits, e.g. repair-project, battery-issue, screen-damage\n- buyer-relevant qualities, e.g. lightweight, budget-friendly, high-performance\n- compatibility or form factor when useful\n\nRules:\n- Keep each tag concise, preferably 1 to 3 words.\n- Use lowercase kebab-case.\n- Do not simply repeat the product title, brand, model, category, or obvious specifications.\n- Do not invent features that are not supported by the listing.\n- Prefer useful semantic tags over generic tags such as electronics or device.\n- Avoid duplicate or near-duplicate tags.\n- Return only valid JSON.\n- Return exactly this structure:\n{\"tags\":[\"tag-one\",\"tag-two\",\"tag-three\"]}" }, { role: "user", content: `Listing:\n${JSON.stringify(listingForAi)}` }] });
    const content = completion.choices[0]?.message.content?.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "") ?? "";
    return validateAiTags((JSON.parse(content) as { tags?: unknown }).tags);
  } catch (error) { console.error("AI listing-tag generation failed", error); return []; }
}
