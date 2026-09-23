"use client";

interface SearchBarProps { query: string; searching: boolean; onSearch: () => void; onQueryChange: (value: string) => void; }

export function SearchBar({ query, searching, onSearch, onQueryChange }: SearchBarProps) {
  return <form onSubmit={(event) => { event.preventDefault(); onSearch(); }} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><input aria-label="Search listings" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search listings, or press Enter to browse all" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 outline-none ring-moss focus:ring-2" /><button type="submit" disabled={searching} className="rounded-lg bg-moss px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{searching ? "Searching…" : query.trim() ? "AI search" : "Show all"}</button></form>;
}
