"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";
import { SearchBar } from "./SearchBar";

export function CatalogueBrowser({ products, categories }: { products: Product[]; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [searchResults, setSearchResults] = useState(products);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const matches = useMemo(() => searchResults.filter((product) => (!category || product.category === category) && (!condition || product.condition === condition)), [searchResults, category, condition]);
  const activeFilters = [category && `Category: ${category}`, condition && `Condition: ${condition}`].filter(Boolean);

  async function runSearch() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) { setSearchResults(products); setMessage(""); setError(""); return; }
    setSearching(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: trimmedQuery }) });
      const payload = await response.json() as { results?: Product[]; notice?: string; error?: string };
      if (!response.ok || !payload.results) throw new Error(payload.error || "Search failed.");
      setSearchResults(payload.results); setMessage(payload.notice || "AI interpreted your search and ranked the local catalogue.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Search failed."); }
    finally { setSearching(false); }
  }

  return <section className="space-y-5"><SearchBar query={query} category={category} condition={condition} categories={categories} searching={searching} onSearch={runSearch} onQueryChange={setQuery} onCategoryChange={setCategory} onConditionChange={setCondition} /><div aria-live="polite" className="space-y-1"><p className="text-sm text-slate-500">Showing {matches.length} demo listing{matches.length === 1 ? "" : "s"}{activeFilters.length ? ` — ${activeFilters.join(" · ")}` : ""}</p>{message && <p className="text-sm text-slate-600">{message}</p>}{error && <p className="text-sm text-red-700">{error}</p>}</div><ProductGrid key={`${query}-${category}-${condition}`} products={matches} /></section>;
}
