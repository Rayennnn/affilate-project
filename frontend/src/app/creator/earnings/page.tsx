import type { Metadata } from "next";
import { Wallet, Clock, CheckCircle2, Receipt } from "lucide-react";
import { getCreatorEarnings } from "@/lib/creator-earnings";

export const metadata: Metadata = {
  title: "Earnings | Creatorly",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const CONV_STATUS: Record<string, string> = {
  confirmed: "bg-[var(--accent-lime-bg)] text-[var(--accent-lime-bright)]",
  pending: "bg-amber-500/15 text-amber-400",
  paid: "bg-[var(--accent-violet)]/20 text-[var(--accent-violet-light)]",
  cancelled: "bg-red-500/15 text-red-400",
};

export default async function EarningsPage() {
  const data = await getCreatorEarnings();

  const stats = [
    { label: "Total Earned", value: formatCurrency(data.totalEarned), icon: Wallet },
    { label: "Pending", value: formatCurrency(data.pending), icon: Clock },
    { label: "Paid Out", value: formatCurrency(data.paid), icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Earnings
        </h2>
        <p className="mt-1 text-[var(--text-secondary)]">
          Commissions from confirmed sales and your payout history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
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
          Recent conversions
        </h3>
        {data.conversions.length === 0 ? (
          <p className="py-10 text-center text-[var(--text-secondary)]">
            No conversions yet. Earnings appear here when customers buy through your links.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                  <th className="pb-4 pr-4">Product</th>
                  <th className="pb-4 pr-4">Sale</th>
                  <th className="pb-4 pr-4">Commission</th>
                  <th className="pb-4 pr-4">Status</th>
                  <th className="pb-4 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.conversions.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--border-faint)] last:border-0">
                    <td className="py-4 pr-4 font-medium text-[var(--text-primary)]">
                      {c.productName}
                    </td>
                    <td className="py-4 pr-4 text-sm text-[var(--text-on-surface)]">
                      {formatCurrency(c.saleAmount)}
                    </td>
                    <td className="py-4 pr-4 text-sm font-semibold text-[var(--text-primary)]">
                      {formatCurrency(c.commission)}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          CONV_STATUS[c.status] ?? "bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm text-[var(--text-secondary)]">
                      {formatDate(c.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        <h3
          className="mb-6 flex items-center gap-2 text-xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          <Receipt className="h-5 w-5 text-[var(--accent-violet-soft)]" />
          Payouts
        </h3>
        {data.payouts.length === 0 ? (
          <p className="py-10 text-center text-[var(--text-secondary)]">No payouts yet.</p>
        ) : (
          <div className="space-y-3">
            {data.payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border-faint)] p-4"
              >
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {formatCurrency(p.amount)}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {formatDate(p.periodStart)} – {formatDate(p.periodEnd)}
                    {p.reference ? ` · ${p.reference}` : ""}
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-[var(--bg-hover)] px-3 py-1 text-xs font-semibold capitalize text-[var(--text-secondary)]">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
