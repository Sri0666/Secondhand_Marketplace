"use client";

import { useMemo, useState } from "react";
import { CONDITIONS, LISTING_TYPES, type Product } from "@/lib/types";
import { CategoryMenu } from "./CategoryMenu";
import { ProductGrid } from "./ProductGrid";
import { SearchBar } from "./SearchBar";

type FilterField = "category" | "subcategory" | "brand" | "condition" | "listingType" | "minPrice" | "maxPrice" | "sort";
type FilterState = Record<FilterField, string> & { locations: string[] };
const input = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-moss focus:ring-2";

export function CatalogueBrowser({ products, categories }: { products: Product[]; categories: string[] }) {
  const priceBounds = useMemo(() => ({ min: Math.min(...products.map((product) => product.price)), max: Math.max(...products.map((product) => product.price)) }), [products]);
  const createInitialFilters = (): FilterState => ({ category: "", subcategory: "", brand: "", condition: "", listingType: "", locations: [], minPrice: String(priceBounds.min), maxPrice: String(priceBounds.max), sort: "newest" });
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(() => createInitialFilters());
  const [results, setResults] = useState(products);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const options = useMemo(() => ({ brands: [...new Set(products.map((product) => product.brand))].sort(), locations: [...new Set(products.map((product) => product.location))].sort() }), [products]);
  const matches = useMemo(() => results.filter((product) => (!filters.category || product.category === filters.category) && (!filters.subcategory || product.subcategory === filters.subcategory) && (!filters.brand || product.brand === filters.brand) && (!filters.condition || product.condition === filters.condition) && (!filters.listingType || product.listingType === filters.listingType) && (!filters.locations.length || filters.locations.includes(product.location)) && product.price >= Number(filters.minPrice) && product.price <= Number(filters.maxPrice)).sort((a, b) => filters.sort === "price-asc" ? a.price - b.price : filters.sort === "price-desc" ? b.price - a.price : 0), [results, filters]);
  const change = (field: FilterField, value: string) => setFilters((current) => ({ ...current, [field]: value }));
  const chooseCategory = (category: string, subcategory = "") => setFilters((current) => ({ ...current, category, subcategory }));
  const toggleLocation = (location: string) => setFilters((current) => ({ ...current, locations: current.locations.includes(location) ? current.locations.filter((item) => item !== location) : [...current.locations, location] }));
  const minPrice = Number(filters.minPrice);
  const maxPrice = Number(filters.maxPrice);
  const priceSpan = Math.max(priceBounds.max - priceBounds.min, 1);
  const minPosition = ((minPrice - priceBounds.min) / priceSpan) * 100;
  const maxPosition = ((maxPrice - priceBounds.min) / priceSpan) * 100;

  async function search() {
    const value = query.trim();
    if (!value) { setResults(products); setMessage("Showing all listings. Use the filters to narrow them down."); return; }
    setSearching(true); setError("");
    try {
      const response = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: value }) });
      const payload = await response.json() as { results?: Product[]; explanation?: string; notice?: string; error?: string };
      if (!response.ok || !payload.results) throw new Error(payload.error || "Search failed.");
      setResults(payload.results); setMessage(payload.explanation || payload.notice || "AI interpreted your search and ranked the catalogue.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Search failed."); } finally { setSearching(false); }
  }

  return <section className="space-y-5">
    <SearchBar query={query} searching={searching} onSearch={search} onQueryChange={setQuery} />
    <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-ink">Filters</h2><button type="button" onClick={() => setFilters(createInitialFilters())} className="text-sm font-semibold text-moss">Clear all</button></div>
        <CategoryMenu categories={categories} category={filters.category} subcategory={filters.subcategory} onChoose={chooseCategory} />
        <div className="space-y-4 pt-4">
          <label className="block text-sm font-medium text-slate-700">Brand<select value={filters.brand} onChange={(event) => change("brand", event.target.value)} className={input}><option value="">All brands</option>{options.brands.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="block text-sm font-medium text-slate-700">Condition<select value={filters.condition} onChange={(event) => change("condition", event.target.value)} className={input}><option value="">All conditions</option>{CONDITIONS.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="block text-sm font-medium text-slate-700">Listing type<select value={filters.listingType} onChange={(event) => change("listingType", event.target.value)} className={input}><option value="">All listing types</option>{LISTING_TYPES.map((value) => <option key={value}>{value}</option>)}</select></label>
          <fieldset><legend className="text-sm font-medium text-slate-700">Locations</legend><details className="group relative mt-1"><summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 [&::-webkit-details-marker]:hidden"><span>{filters.locations.length ? `${filters.locations.length} location${filters.locations.length === 1 ? "" : "s"} selected` : "Select locations"}</span><span aria-hidden="true" className="text-slate-400 transition group-open:rotate-180">⌄</span></summary><div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg">{options.locations.map((location) => <label key={location} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={filters.locations.includes(location)} onChange={() => toggleLocation(location)} className="h-4 w-4 accent-moss" />{location}</label>)}</div></details>{filters.locations.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{filters.locations.map((location) => <span key={location} className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-2.5 py-1 text-xs font-medium text-moss">{location}<button type="button" aria-label={`Remove ${location}`} onClick={() => toggleLocation(location)} className="rounded-full px-1 text-sm leading-none hover:bg-moss/20">×</button></span>)}</div>}</fieldset>
          <fieldset><legend className="text-sm font-medium text-slate-700">Price range</legend><div className="mt-1 flex items-center justify-between text-xs font-semibold text-moss"><span>S${minPrice}</span><span>S${maxPrice}</span></div><div className="relative mt-3 h-5"><div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-slate-200" /><div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-moss" style={{ left: `${minPosition}%`, width: `${maxPosition - minPosition}%` }} /><input aria-label="Minimum price" type="range" min={priceBounds.min} max={maxPrice} step="5" value={minPrice} onChange={(event) => change("minPrice", event.target.value)} className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-moss [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-moss [&::-webkit-slider-thumb]:bg-white" /><input aria-label="Maximum price" type="range" min={minPrice} max={priceBounds.max} step="5" value={maxPrice} onChange={(event) => change("maxPrice", event.target.value)} className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-moss [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-moss [&::-webkit-slider-thumb]:bg-white" /></div></fieldset>
        </div>
      </aside>
      <div className="space-y-3"><div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><div><p className="text-sm text-slate-500">Showing <span className="font-semibold text-ink">{matches.length}</span> listing{matches.length === 1 ? "" : "s"}</p>{message && <p className="mt-1 text-sm text-slate-600">{message}</p>}{error && <p className="mt-1 text-sm text-red-700">{error}</p>}</div><label className="flex items-center gap-2 text-sm font-medium text-slate-700">Sort by<select value={filters.sort} onChange={(event) => change("sort", event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none ring-moss focus:ring-2"><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select></label></div><ProductGrid products={matches} /></div>
    </div>
  </section>;
}
