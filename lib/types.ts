export const CONDITIONS = ["Working", "Minor Fault", "Repair Needed", "Parts Only"] as const;
export type ProductCondition = (typeof CONDITIONS)[number];
export const CATEGORIES = ["Laptops", "Smartphones", "Tablets", "Monitors", "Computer Components", "Peripherals", "Audio", "Gaming", "Networking", "Other Electronics"] as const;
export type ProductCategory = (typeof CATEGORIES)[number];
export const CATEGORY_SUBCATEGORIES = { Laptops: ["Ultrabooks", "Business Laptops"], Smartphones: ["Smartphones"], Tablets: ["Tablets"], Monitors: ["Office Monitors", "Gaming Monitors"], "Computer Components": ["GPUs", "RAM", "Storage"], Peripherals: ["Keyboards", "Mice"], Audio: ["Headphones"], Gaming: ["Consoles"], Networking: ["Routers"], "Other Electronics": ["Other Electronics"] } as const satisfies Record<ProductCategory, readonly string[]>;
export const LISTING_TYPES = ["Complete Device", "Component", "Accessory", "Repair Project", "Parts / Donor"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export interface Product {
  id: string; title: string; brand: string; model: string; category: ProductCategory; subcategory: string; price: number; currency?: string;
  condition: ProductCondition; location: string; listingType: ListingType; filters: Record<string, unknown>; description: string;
  images: string[]; specifications: Record<string, string>; knownIssues: string[]; testedFunctions: string[]; sellerNotes: string;
  /** Persisted at listing creation. Never generated while products are read. */
  aiTags: string[];
}
