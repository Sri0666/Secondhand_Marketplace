export const CONDITIONS = ["Working", "Minor Fault", "Repair Needed", "Parts Only"] as const;
export type ProductCondition = (typeof CONDITIONS)[number];

export interface Product {
  id: string;
  title: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  condition: ProductCondition;
  description: string;
  images: string[];
  specifications: Record<string, string>;
  knownIssues: string[];
  testedFunctions: string[];
  listingType: "Complete Device" | "Repair Project" | "Components";
  sellerNotes: string;
}
