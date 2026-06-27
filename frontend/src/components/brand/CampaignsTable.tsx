import Link from "next/link";
import { Plus, Package } from "lucide-react";
import type { CampaignRow } from "@/lib/brand-dashboard";
import { formatCurrency } from "@/lib/brand-dashboard";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[var(--accent-lime-bg)] text-[var(--accent-lime-bright)]",
  paused: "bg-amber-500/15 text-amber-400",
  draft: "bg-[var(--bg-hover)] text-[var(--text-secondary)]",
  completed: "bg-[var(--accent-violet)]/20 text-[var(--accent-violet-light)]",
};

function budgetPercent(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.min(100, Math.round((spent / budget) * 100));
}

export function CampaignsTable({ campaigns }: { campaigns: CampaignRow[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3
          className="text-xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Your Campaigns
        </h3>
        <Link
          href="/brand/add-product"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Package className="h-10 w-10 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)]">No campaigns yet.</p>
          <Link
            href="/brand/add-product"
            className="text-sm font-semibold text-[var(--accent-violet-light)] hover:underline"
          >
            Launch your first product →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                <th className="pb-4 pr-4">Product</th>
                <th className="pb-4 pr-4">Status</th>
                <th className="pb-4 pr-4">Creators</th>
                <th className="pb-4 pr-4">Conversions</th>
                <th className="pb-4 pr-4">Sales</th>
                <th className="pb-4 pr-4">Budget</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const pct = budgetPercent(c.spent, c.budget);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--border-faint)] last:border-0"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-medium text-[var(--text-primary)]">{c.productName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatCurrency(c.commissionsDue)} commissions due
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          STATUS_STYLES[c.status] ?? STATUS_STYLES.draft
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm font-medium text-[var(--text-on-surface)]">
                      {c.activeCreators}
                    </td>
                    <td className="py-4 pr-4 text-sm font-medium text-[var(--text-on-surface)]">
                      {c.conversions.toLocaleString("en-US")}
                    </td>
                    <td className="py-4 pr-4 text-sm font-semibold text-[var(--text-primary)]">
                      {formatCurrency(c.sales)}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--bg-hover)]">
                          <div
                            className="h-full rounded-full bg-[var(--accent-violet-soft)]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--text-secondary)]">
                          {formatCurrency(c.spent)} / {formatCurrency(c.budget)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
