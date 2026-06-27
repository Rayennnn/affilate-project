"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BadgeCheck, Instagram, Youtube, Search } from "lucide-react";
import type { CreatorCard } from "@/lib/brand-creators";

function formatAudience(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toLocaleString("en-US");
}

const NICHE_LABELS: Record<string, string> = {
  tech: "Tech",
  beauty: "Beauty",
  fashion: "Fashion",
  fitness: "Fitness",
  gaming: "Gaming",
  lifestyle: "Lifestyle",
};

function nicheLabel(niche: string): string {
  return NICHE_LABELS[niche.toLowerCase()] ?? niche.charAt(0).toUpperCase() + niche.slice(1);
}

export function InviteCreatorsContent({ creators }: { creators: CreatorCard[] }) {
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState("all");

  const niches = useMemo(() => {
    const set = new Set(creators.map((c) => c.niche.toLowerCase()));
    return ["all", ...Array.from(set)];
  }, [creators]);

  const filtered = useMemo(() => {
    return creators.filter((c) => {
      const matchesNiche = niche === "all" || c.niche.toLowerCase() === niche;
      const matchesQuery =
        query.trim() === "" ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.bio.toLowerCase().includes(query.toLowerCase());
      return matchesNiche && matchesQuery;
    });
  }, [creators, niche, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-[var(--text-muted-variant)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators…"
            className="w-full rounded-full border border-[var(--border-outline)] bg-[var(--bg-input-field)] py-2.5 pr-4 pl-10 text-sm text-[var(--text-on-surface)] outline-none transition-all placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-violet-light)] focus:ring-1 focus:ring-[var(--accent-violet-light)]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {niches.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNiche(n)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all active:scale-95 ${
                niche === n
                  ? "bg-[var(--accent-violet)] text-white"
                  : "border border-[var(--border-outline)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              }`}
            >
              {n === "all" ? "All" : nicheLabel(n)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] py-16 text-center text-[var(--text-secondary)]">
          No creators match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((creator) => {
            return (
              <div
                key={creator.id}
                className="flex flex-col rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-5 transition-all duration-300 hover:border-[var(--accent-violet)]/40"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[var(--accent-violet)]/30">
                    <Image
                      src={creator.avatarUrl}
                      alt={creator.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold text-[var(--text-primary)]">
                        {creator.name}
                      </p>
                      {creator.isVerified && (
                        <BadgeCheck className="h-4 w-4 shrink-0 text-[var(--accent-violet-soft)]" />
                      )}
                    </div>
                    <span className="inline-flex rounded-full bg-[var(--bg-hover)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent-violet-light)]">
                      {nicheLabel(creator.niche)}
                    </span>
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 text-sm text-[var(--text-secondary)]">
                  {creator.bio}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p
                      className="text-lg font-bold text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {formatAudience(creator.audienceSize)}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">Audience</p>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted-variant)]">
                    {creator.instagramUrl && <Instagram className="h-4 w-4" />}
                    {creator.youtubeUrl && <Youtube className="h-4 w-4" />}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
