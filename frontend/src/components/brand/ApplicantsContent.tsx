"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Instagram,
  Youtube,
  Check,
  X,
  Loader2,
  Users,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Applicant } from "@/lib/brand-applicants";

function formatAudience(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toLocaleString("en-US");
}

function nicheLabel(niche: string): string {
  return niche.charAt(0).toUpperCase() + niche.slice(1);
}

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-[var(--accent-lime-bg)] text-[var(--accent-lime-bright)]",
  rejected: "bg-red-500/15 text-red-400",
  completed: "bg-[var(--accent-violet)]/20 text-[var(--accent-violet-light)]",
};

export function ApplicantsContent({ applicants }: { applicants: Applicant[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pending = applicants.filter((a) => a.status === "pending");
  const decided = applicants.filter((a) => a.status !== "pending");

  const decide = async (matchId: string, status: "approved" | "rejected") => {
    setError(null);
    setBusyId(matchId);
    const { error: updateError } = await supabase
      .from("matches")
      .update({ status })
      .eq("id", matchId);
    setBusyId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-400" />
          <h3
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Pending applications ({pending.length})
          </h3>
        </div>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] py-14 text-center">
            <Users className="h-9 w-9 text-[var(--text-secondary)]" />
            <p className="text-[var(--text-secondary)]">No pending applications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pending.map((a) => (
              <div
                key={a.matchId}
                className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-hover)] text-sm font-bold text-[var(--accent-violet-light)]">
                      {nicheLabel(a.niche).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-[var(--text-primary)]">
                          {nicheLabel(a.niche)} creator
                        </p>
                        {a.isVerified && (
                          <BadgeCheck className="h-4 w-4 text-[var(--accent-violet-soft)]" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatAudience(a.audienceSize)} audience
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted-variant)]">
                    {a.instagramUrl && <Instagram className="h-4 w-4" />}
                    {a.youtubeUrl && <Youtube className="h-4 w-4" />}
                  </div>
                </div>

                <p className="mt-3 text-xs text-[var(--text-secondary)]">
                  Applied to{" "}
                  <span className="font-medium text-[var(--text-on-surface)]">
                    {a.productName}
                  </span>
                </p>
                {a.bio && (
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">{a.bio}</p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => decide(a.matchId, "approved")}
                    disabled={busyId === a.matchId}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent-violet)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95 disabled:opacity-60"
                  >
                    {busyId === a.matchId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(a.matchId, "rejected")}
                    disabled={busyId === a.matchId}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-outline)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] hover:text-red-400 active:scale-95 disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {decided.length > 0 && (
        <section>
          <h3
            className="mb-4 text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Reviewed
          </h3>
          <div className="overflow-hidden rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)]">
            <table className="w-full">
              <tbody>
                {decided.map((a) => (
                  <tr
                    key={a.matchId}
                    className="border-b border-[var(--border-faint)] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--text-primary)]">
                        {nicheLabel(a.niche)} creator
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">{a.productName}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          STATUS_STYLES[a.status] ?? "bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
