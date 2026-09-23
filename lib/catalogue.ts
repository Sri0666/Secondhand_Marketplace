import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SearchIntent } from "@/lib/ai";
import { CATEGORIES, type Product } from "@/lib/types";

type StoredProduct = Omit<Product, "aiTags"> & { aiTags?: unknown };

// Reading listings never invokes AI. Existing records use their persisted aiTags value.
const storedProducts = JSON.parse(readFileSync(join(process.cwd(), "data", "products.json"), "utf8")) as StoredProduct[];
export const products: Product[] = storedProducts.map((product) => ({ ...product, aiTags: Array.isArray(product.aiTags) && product.aiTags.every((tag) => typeof tag === "string") ? product.aiTags : [] }));
export const categories = [...CATEGORIES];
export function addListingToCatalogue(listing: Product) { products.push(listing); }
export function getProductById(id: string) { return products.find((product) => product.id === id); }
export function searchCatalogue(query: string) { const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean); return !terms.length ? products : products.filter((product) => terms.every((term) => [product.title, product.brand, product.model, product.category, product.subcategory, product.condition, product.listingType, product.location, product.description, ...product.aiTags, ...Object.values(product.filters)].join(" ").toLowerCase().includes(term))); }
export function searchCatalogueByIntent(intent: SearchIntent) { const terms = intent.keywords?.map((keyword) => keyword.toLowerCase()) ?? []; return filterCatalogueByIntent(intent).map((product) => ({ product, matches: terms.filter((term) => [product.title, product.brand, product.model, product.category, product.subcategory, product.description, ...product.aiTags, ...Object.values(product.filters), ...Object.values(product.specifications), ...product.knownIssues].join(" ").toLowerCase().includes(term)).length })).filter(({ matches }) => !terms.length || matches > 0).sort((a, b) => b.matches - a.matches || a.product.price - b.product.price).map(({ product }) => product); }
export function filterCatalogueByIntent(intent: SearchIntent) { return products.filter((product) => (!intent.category || product.category === intent.category) && (!intent.brand || product.brand.toLowerCase() === intent.brand.toLowerCase()) && (!intent.condition || product.condition === intent.condition) && (intent.minPrice === undefined || product.price >= intent.minPrice) && (intent.maxPrice === undefined || product.price <= intent.maxPrice) && (intent.minRamGB === undefined || capacityInGb(typeof product.filters.ram === "string" ? product.filters.ram : undefined) >= intent.minRamGB) && (intent.minStorageGB === undefined || capacityInGb(typeof product.filters.storage === "string" ? product.filters.storage : undefined) >= intent.minStorageGB)); }
function capacityInGb(value: string | undefined) { const match = value?.match(/(\d+(?:\.\d+)?)\s*(TB|GB)/i); return match ? Number(match[1]) * (match[2].toUpperCase() === "TB" ? 1024 : 1) : 0; }
