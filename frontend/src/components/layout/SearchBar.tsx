import { Search } from "lucide-react";
import { useState } from "react";

export function SearchBar({ onSearch }: { onSearch?: (query: string) => void }) {
  const [query, setQuery] = useState("");
  return (
    <form className="hidden w-full max-w-xl md:block" onSubmit={(event) => { event.preventDefault(); onSearch?.(query.trim()); }} role="search">
      <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 text-slate-500 transition-colors focus-within:border-cyan-400/60">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search videos, channels, tweets" className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600" />
        <kbd className="hidden rounded-md border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-600 lg:inline">⌘ K</kbd>
      </label>
    </form>
  );
}
