"use client";

import { useState } from "react";
import { BadgeCheck, Check, Instagram, Loader2, Users, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Applicant } from "@/lib/brand-applicants";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-red-500/15 text-red-400",
  completed: "bg-sky-500/15 text-sky-400",
};

function formatReach(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function ApplicantsList({ initial }: { initial: Applicant[] }) {
  const [applicants, setApplicants] = useState<Applicant[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  const decide = async (matchId: string, status: "approved" | "rejected") => {
    setBusy(matchId);
    const { error } = await supabase.from("matches").update({ status }).eq("id", matchId);
    if (!error) {
      setApplicants((list) => list.map((a) => (a.matchId === matchId ? { ...a, status } : a)));
    }
    setBusy(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Applicants
        </h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Review creators applying to your campaigns. Approving generates their affiliate link.
        </p>
      </div>

      {applicants.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-12 text-center text-sm text-[var(--text-secondary)]">
          No applicants yet.
        </div>
      ) : (
        <div className="space-y-3">
          {applicants.map((a) => (
            <div
              key={a.matchId}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-violet)]/15 text-[var(--accent-violet-light)]">
                <Users className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[var(--text-primary)] capitalize">{a.niche} creator</p>
                  {a.isVerified && <BadgeCheck className="h-4 w-4 text-[var(--accent-violet-light)]" />}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {formatReach(a.audienceSize)} audience · applied to{" "}
                  <span className="text-[var(--text-on-surface)]">{a.campaignName}</span> · {a.appliedAt}
                </p>
                {a.instagramUrl && (
                  <a
                    href={a.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--accent-violet-light)] hover:underline"
                  >
                    <Instagram className="h-3.5 w-3.5" /> Instagram
                  </a>
                )}
              </div>

              {a.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decide(a.matchId, "approved")}
                    disabled={busy === a.matchId}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-violet)] px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95 disabled:opacity-50"
                  >
                    {busy === a.matchId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(a.matchId, "rejected")}
                    disabled={busy === a.matchId}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-outline)] px-3.5 py-2 text-xs font-medium text-[var(--text-on-surface)] transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              ) : (
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    STATUS_STYLES[a.status] ?? STATUS_STYLES.pending
                  }`}
                >
                  {a.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
