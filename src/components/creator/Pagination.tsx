"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const pages = [1, 2, 3, 12];

export function Pagination() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        className="rounded-lg border border-[var(--border-outline)] p-2 transition-colors hover:bg-[var(--bg-hover)] active:opacity-60"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5 text-[var(--text-on-surface)]" />
      </button>

      {pages.slice(0, 3).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => setCurrentPage(page)}
          className={`h-10 w-10 rounded-lg font-bold transition-colors ${
            currentPage === page
              ? "bg-[var(--accent-violet-light)] text-[var(--accent-violet-on-dark)]"
              : "border border-[var(--border-outline)] hover:bg-[var(--bg-hover)] text-[var(--text-on-surface)]"
          }`}
        >
          {page}
        </button>
      ))}

      <span className="px-2 text-[var(--text-muted-variant)]">...</span>

      <button
        type="button"
        onClick={() => setCurrentPage(12)}
        className={`h-10 w-10 rounded-lg font-bold transition-colors ${
          currentPage === 12
            ? "bg-[var(--accent-violet-light)] text-[var(--accent-violet-on-dark)]"
            : "border border-[var(--border-outline)] hover:bg-[var(--bg-hover)] text-[var(--text-on-surface)]"
        }`}
      >
        12
      </button>

      <button
        type="button"
        className="rounded-lg border border-[var(--border-outline)] p-2 transition-colors hover:bg-[var(--bg-hover)] active:opacity-60"
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5 text-[var(--text-on-surface)]" />
      </button>
    </div>
  );
}
