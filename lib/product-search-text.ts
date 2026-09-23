import type { Product } from "@/lib/types";

/**
 * Converts a listing into a labelled, searchable text document.
 * This deliberately includes recorded facts only; it does not infer compatibility
 * or generate details that are absent from the listing.
 */
export function productToSearchableText(product: Product) {
  return [
    `Title: ${product.title}`,
    `Brand: ${product.brand}`,
    `Model: ${product.model}`,
    `Category: ${product.category}`,
    `Subcategory: ${product.subcategory}`,
    `Listing type: ${product.listingType}`,
    `Location: ${product.location}`,
    `Filter values: ${Object.entries(product.filters).map(([name, value]) => `${name}: ${Array.isArray(value) ? value.join(", ") : value}`).join("; ")}`,
    `AI tags: ${product.aiTags.join("; ")}`,
    `Condition: ${product.condition}`,
    `Description: ${product.description}`,
    `Specifications: ${Object.entries(product.specifications).map(([name, value]) => `${name}: ${value}`).join("; ")}`,
    `Known issues: ${product.knownIssues.join("; ")}`,
    `Tested functions: ${product.testedFunctions.join("; ")}`,
    `Seller notes: ${product.sellerNotes}`,
  ].join("\n");
}
