"use client";

import { useMemo, useRef, useState } from "react";
import { CONDITIONS, LISTING_TYPES, type Product } from "@/lib/types";
import { CategoryMenu } from "./CategoryMenu";
import { ProductGrid } from "./ProductGrid";
import { SearchBar } from "./SearchBar";

type FilterField = "category" | "subcategory" | "brand" | "condition" | "listingType" | "minPrice" | "maxPrice" | "sort";
type FilterState = Record<FilterField, string> & { locations: string[] };
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
          <SingleFilterDropdown label="Brand" value={filters.brand} emptyLabel="All brands" options={options.brands} onChange={(value) => change("brand", value)} />
          <SingleFilterDropdown label="Condition" value={filters.condition} emptyLabel="All conditions" options={CONDITIONS} onChange={(value) => change("condition", value)} />
          <SingleFilterDropdown label="Listing type" value={filters.listingType} emptyLabel="All listing types" options={LISTING_TYPES} onChange={(value) => change("listingType", value)} />
          <fieldset><legend className="text-sm font-medium text-slate-700">Locations</legend><details className="group relative mt-1"><summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 [&::-webkit-details-marker]:hidden"><span>{filters.locations.length ? `${filters.locations.length} location${filters.locations.length === 1 ? "" : "s"} selected` : "Select locations"}</span><span aria-hidden="true" className="text-slate-400 transition group-open:rotate-180">⌄</span></summary><div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg">{options.locations.map((location) => <label key={location} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={filters.locations.includes(location)} onChange={() => toggleLocation(location)} className="h-4 w-4 accent-moss" />{location}</label>)}</div></details>{filters.locations.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{filters.locations.map((location) => <span key={location} className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-2.5 py-1 text-xs font-medium text-moss">{location}<button type="button" aria-label={`Remove ${location}`} onClick={() => toggleLocation(location)} className="rounded-full px-1 text-sm leading-none hover:bg-moss/20">×</button></span>)}</div>}</fieldset>
          <fieldset><legend className="text-sm font-medium text-slate-700">Price range</legend><div className="mt-1 flex items-center justify-between text-xs font-semibold text-moss"><span>S${minPrice}</span><span>S${maxPrice}</span></div><PriceRangeSlider bounds={priceBounds} minPrice={minPrice} maxPrice={maxPrice} onChange={(minimum, maximum) => setFilters((current) => ({ ...current, minPrice: String(minimum), maxPrice: String(maximum) }))} /></fieldset>
        </div>
      </aside>
      <div className="space-y-3"><div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><div><p className="text-sm text-slate-500">Showing <span className="font-semibold text-ink">{matches.length}</span> listing{matches.length === 1 ? "" : "s"}</p>{message && <p className="mt-1 text-sm text-slate-600">{message}</p>}{error && <p className="mt-1 text-sm text-red-700">{error}</p>}</div><label className="flex items-center gap-2 text-sm font-medium text-slate-700">Sort by<select value={filters.sort} onChange={(event) => change("sort", event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none ring-moss focus:ring-2"><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select></label></div><ProductGrid products={matches} /></div>
    </div>
  </section>;
}

function SingleFilterDropdown({ label, value, emptyLabel, options, onChange }: { label: string; value: string; emptyLabel: string; options: readonly string[]; onChange: (value: string) => void }) {
  const select = (nextValue: string, event: React.MouseEvent<HTMLButtonElement>) => {
    onChange(nextValue);
    const details = event.currentTarget.closest("details");
    if (details) details.open = false;
  };

  return <fieldset>
    <legend className="text-sm font-medium text-slate-700">{label}</legend>
    <details className="group relative mt-1">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 [&::-webkit-details-marker]:hidden">
        <span className="truncate">{value || emptyLabel}</span>
        <span aria-hidden="true" className="ml-2 text-slate-400 transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
        <button type="button" onClick={(event) => select("", event)} className={`w-full rounded-md px-2 py-2 text-left text-sm ${value ? "text-slate-700 hover:bg-slate-50" : "bg-emerald-50 font-semibold text-moss"}`}>{emptyLabel}</button>
        {options.map((option) => <button key={option} type="button" onClick={(event) => select(option, event)} className={`mt-1 w-full rounded-md px-2 py-2 text-left text-sm ${value === option ? "bg-emerald-50 font-semibold text-moss" : "text-slate-700 hover:bg-slate-50"}`}>{option}</button>)}
      </div>
    </details>
  </fieldset>;
}

function PriceRangeSlider({ bounds, minPrice, maxPrice, onChange }: { bounds: { min: number; max: number }; minPrice: number; maxPrice: number; onChange: (minimum: number, maximum: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<"min" | "max">("max");
  const span = Math.max(bounds.max - bounds.min, 1);
  const step = Math.min(5, span);
  const minPosition = ((minPrice - bounds.min) / span) * 100;
  const maxPosition = ((maxPrice - bounds.min) / span) * 100;

  const setFromPointer = (handle: "min" | "max", clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const { left, width } = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - left) / width));
    const next = Math.round((ratio * span) / step) * step + bounds.min;
    if (handle === "min") onChange(Math.min(next, maxPrice - step), maxPrice);
    else onChange(minPrice, Math.max(next, minPrice + step));
  };

  const handleKeyDown = (handle: "min" | "max", event: React.KeyboardEvent<HTMLButtonElement>) => {
    const current = handle === "min" ? minPrice : maxPrice;
    const lowerBound = handle === "min" ? bounds.min : minPrice + step;
    const upperBound = handle === "min" ? maxPrice - step : bounds.max;
    const increments: Record<string, number> = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: step * 5, PageDown: -step * 5 };
    let next = increments[event.key] === undefined ? current : current + increments[event.key];
    if (event.key === "Home") next = lowerBound;
    if (event.key === "End") next = upperBound;
    if (next === current) return;
    event.preventDefault();
    if (handle === "min") onChange(Math.max(lowerBound, Math.min(next, upperBound)), maxPrice);
    else onChange(minPrice, Math.max(lowerBound, Math.min(next, upperBound)));
  };

  const handlePointerDown = (handle: "min" | "max", event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setActiveHandle(handle);
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(handle, event.clientX);
  };

  const handlePointerMove = (handle: "min" | "max", event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) setFromPointer(handle, event.clientX);
  };

  const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = ((event.clientX - rect.left) / rect.width) * 100;
    const handle = Math.abs(position - minPosition) < Math.abs(position - maxPosition) ? "min" : "max";
    setActiveHandle(handle);
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(handle, event.clientX);
  };

  return <div ref={trackRef} onPointerDown={handleTrackPointerDown} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) setFromPointer(activeHandle, event.clientX); }} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} className="relative mt-3 h-6 touch-none cursor-pointer">
    <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
    <div className="pointer-events-none absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-moss" style={{ left: `${minPosition}%`, width: `${maxPosition - minPosition}%` }} />
    <button type="button" role="slider" aria-label="Minimum price" aria-valuemin={bounds.min} aria-valuemax={maxPrice - step} aria-valuenow={minPrice} aria-valuetext={`S$${minPrice}`} onFocus={() => setActiveHandle("min")} onKeyDown={(event) => handleKeyDown("min", event)} onPointerDown={(event) => handlePointerDown("min", event)} onPointerMove={(event) => handlePointerMove("min", event)} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-moss bg-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss ${activeHandle === "min" ? "z-20" : "z-10"}`} style={{ left: `${minPosition}%` }} />
    <button type="button" role="slider" aria-label="Maximum price" aria-valuemin={minPrice + step} aria-valuemax={bounds.max} aria-valuenow={maxPrice} aria-valuetext={`S$${maxPrice}`} onFocus={() => setActiveHandle("max")} onKeyDown={(event) => handleKeyDown("max", event)} onPointerDown={(event) => handlePointerDown("max", event)} onPointerMove={(event) => handlePointerMove("max", event)} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-moss bg-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss ${activeHandle === "max" ? "z-20" : "z-10"}`} style={{ left: `${maxPosition}%` }} />
  </div>;
}
