"use client";

interface SearchBarProps {
  query: string;
  category: string;
  condition: string;
  categories: string[];
  searching: boolean;
  onSearch: () => void;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onConditionChange: (value: string) => void;
}

export function SearchBar(props: SearchBarProps) {
  return <form onSubmit={(event) => { event.preventDefault(); props.onSearch(); }} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1fr_150px_180px_180px]"><input aria-label="Search listings" value={props.query} onChange={(event) => props.onQueryChange(event.target.value)} placeholder="Try ‘working laptop under 500’" className="min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 outline-none ring-moss focus:ring-2" /><button type="submit" disabled={props.searching || !props.query.trim()} className="rounded-lg bg-moss px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{props.searching ? "Searching…" : "AI search"}</button><select aria-label="Filter by category" value={props.category} onChange={(event) => props.onCategoryChange(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="">All categories</option>{props.categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><select aria-label="Filter by condition" value={props.condition} onChange={(event) => props.onConditionChange(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="">All conditions</option><option value="Working">Working</option><option value="Minor Fault">Minor Fault</option><option value="Repair Needed">Repair Needed</option><option value="Parts Only">Parts Only</option></select></form>;
}
