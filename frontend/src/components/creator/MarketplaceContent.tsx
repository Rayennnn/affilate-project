"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Search, Package, Loader2, Check, Clock, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { MarketplaceCampaign } from "@/lib/creator-marketplace";

type Props = {
  creatorId: string | null;
  campaigns: MarketplaceCampaign[];
  avgCommission: number;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: typeof Check }> = {
    pending: {
      label: "Pending review",
      className: "bg-amber-500/15 text-amber-400",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      className: "bg-[var(--accent-lime-bg)] text-[var(--accent-lime-bright)]",
      icon: Check,
    },
    completed: {
      label: "Completed",
      className: "bg-[var(--accent-violet)]/20 text-[var(--accent-violet-light)]",
      icon: Check,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-500/15 text-red-400",
      icon: X,
    },
  };
  const cfg = map[status] ?? map.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold ${cfg.className}`}
    >
      <Icon className="h-4 w-4" />
      {cfg.label}
    </span>
  );
}

export function MarketplaceContent({ creatorId, campaigns, avgCommission }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return campaigns;
    const q = query.toLowerCase();
    return campaigns.filter(
      (c) => c.productName.toLowerCase().includes(q) || c.brandName.toLowerCase().includes(q),
    );
  }, [campaigns, query]);

  const handleApply = async (campaignId: string) => {
    setError(null);
    if (!creatorId) {
      setError("No creator profile found for your account.");
      return;
    }
    setPendingId(campaignId);
    const { error: insertError } = await supabase.from("matches").insert({
      campaign_id: campaignId,
      creator_id: creatorId,
      status: "pending",
    });
    setPendingId(null);

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "You have already applied to this campaign."
          : insertError.message,
      );
      return;
    }
    router.refresh();
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            className="text-[32px] leading-10 font-bold tracking-wide text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Marketplace
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            Discover high-commission products for your audience
          </p>
        </div>

        {campaigns.length > 0 && (
          <div className="flex items-center gap-4 rounded-xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-4">
            <span className="rounded-lg bg-[var(--accent-lime-bg)] p-2">
              <TrendingUp className="h-5 w-5 text-[var(--accent-lime-bright)]" />
            </span>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Avg. Commission</p>
              <p
                className="text-xl font-semibold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {avgCommission}%
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 relative max-w-md">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-[var(--text-muted-variant)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products or brands…"
          className="w-full rounded-full border border-[var(--border-outline)] bg-[var(--bg-input-field)] py-2.5 pr-4 pl-10 text-sm text-[var(--text-on-surface)] outline-none transition-all placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-violet-light)] focus:ring-1 focus:ring-[var(--accent-violet-light)]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] py-20 text-center">
          <Package className="h-10 w-10 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)]">
            {campaigns.length === 0
              ? "No active campaigns available right now."
              : "No products match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="product-card-hover group flex flex-col overflow-hidden rounded-xl border border-[var(--border-outline)] bg-[var(--bg-card)] transition-all duration-300"
            >
              <div className="relative h-48 w-full bg-[var(--bg-hover)]">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.imageUrl}
                    alt={c.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-10 w-10 text-[var(--text-secondary)]" />
                  </div>
                )}
                <div className="absolute top-4 right-4 rounded-full bg-[var(--accent-violet)]/90 px-3 py-1 text-xs font-bold text-[var(--accent-violet-on)] shadow-lg backdrop-blur-md">
                  {c.commissionRate}% Commission
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <span className="mb-2 text-xs font-medium tracking-tight text-[var(--text-secondary)] uppercase">
                  {c.brandName}
                </span>
                <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-violet-light)]">
                  {c.productName}
                </h3>

                <div className="mt-auto">
                  {c.matchStatus ? (
                    <StatusBadge status={c.matchStatus} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApply(c.id)}
                      disabled={pendingId === c.id}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-violet)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingId === c.id && <Loader2 className="h-4 w-4 animate-spin" />}
                      {pendingId === c.id ? "Applying…" : "Apply to Promote"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
