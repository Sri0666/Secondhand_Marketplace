import productData from "@/data/products.json";
import type { Product } from "@/lib/types";

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
