"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Clock, Copy, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { BrowseCampaign, MatchStatus } from "@/lib/creator-campaigns";

type CardState = { status: MatchStatus; linkUrl: string | null };

export function CampaignGrid({
  creatorId,
  campaigns,
}: {
  creatorId: string | null;
  campaigns: BrowseCampaign[];
}) {
  const [state, setState] = useState<Record<string, CardState>>(() =>
    Object.fromEntries(campaigns.map((c) => [c.id, { status: c.status, linkUrl: c.linkUrl }])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const apply = async (campaignId: string) => {
    if (!creatorId) return;
    setBusy(campaignId);
    const { error } = await supabase
      .from("matches")
      .insert({ campaign_id: campaignId, creator_id: creatorId, status: "pending" });
    // 23505 = already applied; treat as pending too.
    if (!error || error.code === "23505") {
      setState((s) => ({ ...s, [campaignId]: { ...s[campaignId], status: "pending" } }));
    }
    setBusy(null);
  };

  const copy = async (campaignId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(campaignId);
      setTimeout(() => setCopied((c) => (c === campaignId ? null : c)), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-12 text-center text-sm text-[var(--text-secondary)]">
        No active campaigns right now. Check back soon.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((c) => {
        const cur = state[c.id] ?? { status: c.status, linkUrl: c.linkUrl };
        return (
          <div
            key={c.id}
            className="product-card-hover group overflow-hidden rounded-xl border border-[var(--border-outline)] bg-[var(--bg-card)] transition-all duration-300"
          >
            <div className="relative h-56 w-full">
              <Image
                src={c.imageUrl}
                alt={c.productName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-4 right-4 rounded-full bg-[var(--accent-violet)]/90 px-3 py-1 text-xs font-bold text-[var(--accent-violet-on)] shadow-lg backdrop-blur-md">
                {c.commissionRate}% Commission
              </div>
            </div>

            <div className="p-5">
              <span className="text-xs font-medium tracking-tight text-[var(--text-secondary)] uppercase">
                {c.brandName}
              </span>
              <h3 className="mt-1 mb-4 text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-violet-light)]">
                {c.productName}
              </h3>

              {cur.status === "none" && (
                <button
                  type="button"
                  onClick={() => apply(c.id)}
                  disabled={!creatorId || busy === c.id}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-violet)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-violet-on)] transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95 disabled:opacity-50"
                >
                  {busy === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Apply to promote
                </button>
              )}

              {cur.status === "pending" && (
                <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-400">
                  <Clock className="h-4 w-4" />
                  Pending approval
                </div>
              )}

              {(cur.status === "approved" || cur.status === "completed") && cur.linkUrl && (
                <button
                  type="button"
                  onClick={() => copy(c.id, cur.linkUrl as string)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--accent-violet-light)]/30 bg-[var(--accent-violet-light)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--accent-violet-light)] transition-all hover:bg-[var(--accent-violet)] hover:text-[var(--accent-violet-on)] active:scale-95"
                >
                  {copied === c.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === c.id ? "Copied!" : "Copy affiliate link"}
                </button>
              )}

              {(cur.status === "approved" || cur.status === "completed") && !cur.linkUrl && (
                <div className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-center text-sm font-semibold text-emerald-400">
                  Approved
                </div>
              )}

              {cur.status === "rejected" && (
                <div className="w-full rounded-lg border border-[var(--border-outline)] px-4 py-2.5 text-center text-sm font-medium text-[var(--text-secondary)]">
                  Not selected
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
