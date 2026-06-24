import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Users, ShoppingCart, Wallet, ArrowRight } from "lucide-react";
import { getBrandDashboard } from "@/lib/brand-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Brand",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  paused: "bg-amber-500/15 text-amber-400",
  draft: "bg-[var(--bg-hover)] text-[var(--text-secondary)]",
  completed: "bg-sky-500/15 text-sky-400",
};

export default async function BrandDashboardPage() {
  const data = await getBrandDashboard();

  if (!data.hasBrand) {
    return (
      <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-12 text-center">
        <h2
          className="text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Set up your store
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[var(--text-secondary)]">
          Add your store details to start creating campaigns and recruiting creators.
        </p>
        <Link
          href="/brand/settings"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Complete store setup <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const cards = [
    { label: "Campaigns", value: String(data.totals.campaigns), icon: Megaphone },
    { label: "Active Creators", value: String(data.totals.activeCreators), icon: Users },
    { label: "Conversions", value: String(data.totals.conversions), icon: ShoppingCart },
    { label: "Total Sales", value: formatCurrency(data.totals.sales), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="text-[32px] font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {data.storeName}
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Commissions due:{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {formatCurrency(data.totals.commissionsDue)}
            </span>
          </p>
        </div>
        <Link
          href="/brand/campaigns"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)]"
        >
          Manage Campaigns <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-5"
          >
            <div className="mb-4 flex items-start justify-between">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <span className="rounded-lg bg-[var(--bg-hover)] p-2">
                <Icon className="h-5 w-5 text-[var(--accent-violet-soft)]" />
              </span>
            </div>
            <p
              className="text-3xl font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        <h3
          className="mb-6 text-xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Campaign Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                <th className="pb-4 pr-4">Product</th>
                <th className="pb-4 pr-4">Status</th>
                <th className="pb-4 pr-4">Creators</th>
                <th className="pb-4 pr-4">Conversions</th>
                <th className="pb-4 pr-4">Sales</th>
                <th className="pb-4">Budget</th>
              </tr>
            </thead>
            <tbody>
              {data.campaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[var(--text-secondary)]">
                    No campaigns yet. Create your first one.
                  </td>
                </tr>
              )}
              {data.campaigns.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border-faint)] last:border-0">
                  <td className="py-4 pr-4 text-sm font-medium text-[var(--text-primary)]">{c.name}</td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        STATUS_STYLES[c.status] ?? STATUS_STYLES.draft
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-sm text-[var(--text-on-surface)]">{c.activeCreators}</td>
                  <td className="py-4 pr-4 text-sm text-[var(--text-on-surface)]">{c.conversions}</td>
                  <td className="py-4 pr-4 text-sm font-semibold text-[var(--text-primary)]">
                    {formatCurrency(c.sales)}
                  </td>
                  <td className="py-4 text-sm text-[var(--text-secondary)]">
                    {formatCurrency(c.spent)} / {formatCurrency(c.budget)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
