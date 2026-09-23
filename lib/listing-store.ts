import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CATEGORIES, CONDITIONS, LISTING_TYPES, type Product } from "@/lib/types";

const listingsPath = join(process.cwd(), "data", "products.json");
type NewListing = Omit<Product, "id" | "aiTags"> & { id?: string; aiTags?: unknown };

function stringArray(value: unknown) { return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : null; }
function slug(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80); }

export function validateNewListing(value: unknown): NewListing {
  if (!value || typeof value !== "object") throw new Error("Expected a listing object.");
  const item = value as Record<string, unknown>;
  const required = ["title", "brand", "model", "category", "subcategory", "condition", "location", "description", "listingType"] as const;
  if (required.some((field) => typeof item[field] !== "string" || !item[field].trim())) throw new Error("Missing required listing text fields.");
  const text = (field: typeof required[number]) => item[field] as string;
  if (typeof item.price !== "number" || !Number.isFinite(item.price) || item.price < 0) throw new Error("price must be a non-negative number.");
  if (!CATEGORIES.includes(item.category as Product["category"]) || !CONDITIONS.includes(item.condition as Product["condition"]) || !LISTING_TYPES.includes(item.listingType as Product["listingType"])) throw new Error("Listing category, condition, or listing type is invalid.");
  const images = stringArray(item.images); const knownIssues = stringArray(item.knownIssues); const testedFunctions = stringArray(item.testedFunctions);
  if (!images || !knownIssues || !testedFunctions || !item.specifications || typeof item.specifications !== "object" || Array.isArray(item.specifications) || !item.filters || typeof item.filters !== "object" || Array.isArray(item.filters)) throw new Error("images, specifications, filters, knownIssues, and testedFunctions are required.");
  if (Object.values(item.specifications as Record<string, unknown>).some((entry) => typeof entry !== "string")) throw new Error("specifications must contain string values.");
  return { title: text("title").trim(), brand: text("brand").trim(), model: text("model").trim(), category: text("category") as Product["category"], subcategory: text("subcategory").trim(), price: item.price, ...(typeof item.currency === "string" ? { currency: item.currency.trim() } : {}), condition: text("condition") as Product["condition"], location: text("location").trim(), listingType: text("listingType") as Product["listingType"], filters: item.filters as Record<string, unknown>, description: text("description").trim(), images, specifications: item.specifications as Record<string, string>, knownIssues, testedFunctions, sellerNotes: typeof item.sellerNotes === "string" ? item.sellerNotes.trim() : "", ...(typeof item.id === "string" ? { id: slug(item.id) } : {}), ...(Array.isArray(item.aiTags) ? { aiTags: item.aiTags } : {}) };
}

export async function persistListing(listing: Product) {
  const stored = JSON.parse(await readFile(listingsPath, "utf8")) as Product[];
  if (stored.some((item) => item.id === listing.id)) throw new Error("A listing with this id already exists.");
  stored.push(listing);
  await writeFile(listingsPath, `${JSON.stringify(stored, null, 2)}\n`, "utf8");
  return listing;
}

export function listingId(listing: NewListing) { return listing.id || `${slug(listing.brand)}-${slug(listing.model)}-${Date.now().toString(36)}`; }
