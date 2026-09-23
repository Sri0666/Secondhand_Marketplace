import productData from "@/data/products.json";
import type { Product } from "@/lib/types";
import type { SearchIntent } from "@/lib/ai";

// JSON imports infer individual object shapes; this is the typed boundary for catalogue data.
export const products = productData as unknown as Product[];
export const categories = [...new Set(products.map((product) => product.category))];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function searchCatalogue(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return products;
  return products.filter((product) => {
    const text = [product.title, product.brand, product.model, product.category, product.condition, product.description].join(" ").toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export function searchCatalogueByIntent(intent: SearchIntent) {
  const normalizedTerms = intent.keywords?.map((keyword) => keyword.toLowerCase()) ?? [];
  const acceptableIssues = intent.acceptableIssues?.map((issue) => issue.toLowerCase()) ?? [];
  return products
    .filter((product) => !intent.category || product.category === intent.category)
    .filter((product) => !intent.brand || product.brand.toLowerCase() === intent.brand.toLowerCase())
    .filter((product) => !intent.condition || product.condition === intent.condition)
    .filter((product) => intent.minPrice === undefined || product.price >= intent.minPrice)
    .filter((product) => intent.maxPrice === undefined || product.price <= intent.maxPrice)
    .filter((product) => intent.minRamGB === undefined || specificationCapacityInGb(product.specifications.Memory) >= intent.minRamGB)
    .filter((product) => intent.minStorageGB === undefined || specificationCapacityInGb(product.specifications.Storage) >= intent.minStorageGB)
    .map((product) => {
      const text = [product.title, product.brand, product.model, product.category, product.condition, product.description, ...Object.values(product.specifications), ...product.knownIssues].join(" ").toLowerCase();
      const matchedTerms = normalizedTerms.filter((term) => text.includes(term)).length;
      const issueText = product.knownIssues.join(" ").toLowerCase();
      const acceptedIssueMatches = acceptableIssues.filter((issue) => issueText.includes(issue)).length;
      return { product, matchedTerms, acceptedIssueMatches };
    })
    .filter(({ matchedTerms }) => !normalizedTerms.length || matchedTerms > 0)
    .sort((left, right) => right.matchedTerms - left.matchedTerms || right.acceptedIssueMatches - left.acceptedIssueMatches || left.product.price - right.product.price)
    .map(({ product }) => product);
}

function specificationCapacityInGb(value: string | undefined) {
  if (!value) return 0;
  const match = value.match(/(\d+(?:\.\d+)?)\s*(TB|GB)/i);
  if (!match) return 0;
  const amount = Number(match[1]);
  return match[2].toUpperCase() === "TB" ? amount * 1024 : amount;
}
