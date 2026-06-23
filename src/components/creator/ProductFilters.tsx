"use client";

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";

export function ProductFilters() {
  const [minCommission, setMinCommission] = useState(15);

  return (
    <section className="mb-8 flex flex-wrap items-center gap-6 rounded-xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
      <div className="min-w-[200px] flex-1">
        <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
          Category
        </label>
        <div className="relative">
          <select className="w-full appearance-none rounded-lg border border-[var(--border-outline)] bg-[var(--bg-deepest)] px-4 py-2.5 text-[var(--text-on-surface)] outline-none transition-colors focus:border-[var(--accent-violet-light)]">
            <option>All Categories</option>
            <option>Tech & Gadgets</option>
            <option>Fashion & Lifestyle</option>
            <option>Health & Wellness</option>
            <option>Gaming</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[var(--text-muted-variant)]" />
        </div>
      </div>

      <div className="min-w-[240px] flex-1">
        <div className="mb-2 flex justify-between">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Min Commission
          </label>
          <span className="text-sm font-bold text-[var(--accent-violet-light)]">
            {minCommission}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          value={minCommission}
          onChange={(e) => setMinCommission(Number(e.target.value))}
          className="range-slider h-1.5 w-full appearance-none rounded-full bg-[var(--bg-muted-surface)] accent-[var(--accent-violet-light)]"
        />
      </div>

      <div className="min-w-[200px] flex-1">
        <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
          Brand Search
        </label>
        <input
          type="text"
          placeholder="Apple, Nike, Razer..."
          className="w-full rounded-lg border border-[var(--border-outline)] bg-[var(--bg-deepest)] px-4 py-2 text-[var(--text-on-surface)] outline-none transition-colors placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-violet-light)]"
        />
      </div>

      <div className="pt-6">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-[var(--accent-violet)] px-6 py-2.5 text-sm font-medium text-[var(--accent-violet-on)] transition-all hover:brightness-110 active:scale-95"
        >
          <Filter className="h-5 w-5" />
          Apply Filters
        </button>
      </div>
    </section>
  );
}
