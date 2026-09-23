"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";
import { SearchBar } from "./SearchBar";

export function CatalogueBrowser({ products, categories }: { products: Product[]; categories: string[] }) {
  const [query, setQuery] = useState(""); const [category, setCategory] = useState(""); const [condition, setCondition] = useState("");
  const matches = useMemo(() => products.filter((product) => { const haystack = `${product.title} ${product.brand} ${product.model} ${product.category} ${product.condition} ${product.description}`.toLowerCase(); return (!query || query.toLowerCase().split(/\s+/).every((term) => haystack.includes(term))) && (!category || product.category === category) && (!condition || product.condition === condition); }), [products, query, category, condition]);
  return <section className="space-y-5"><SearchBar query={query} category={category} condition={condition} categories={categories} onQueryChange={setQuery} onCategoryChange={setCategory} onConditionChange={setCondition} /><p className="text-sm text-slate-500">{matches.length} demo listing{matches.length === 1 ? "" : "s"}</p><ProductGrid products={matches} /></section>;
}
