import type { Metadata } from "next";
import { Wallet, Clock, CheckCircle2 } from "lucide-react";
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

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  confirmed: "bg-[var(--accent-violet)]/20 text-[var(--accent-violet-light)]",
  processing: "bg-sky-500/15 text-sky-400",
  paid: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
  failed: "bg-red-500/15 text-red-400",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-[var(--bg-hover)] text-[var(--text-secondary)]";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
}

export default async function EarningsPage() {
  const { totalEarned, pending, paid, conversions, payouts } = await getCreatorEarnings();

  const cards = [
    { label: "Total Earned", value: formatCurrency(totalEarned), icon: Wallet },
    { label: "Pending Payout", value: formatCurrency(pending), icon: Clock },
    { label: "Total Paid", value: formatCurrency(paid), icon: CheckCircle2 },
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
        <p className="mt-2 text-[var(--text-secondary)]">Track your commissions and payouts.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-5"
          >
            <span className="rounded-lg bg-[var(--bg-hover)] p-2.5">
              <Icon className="h-5 w-5 text-[var(--accent-violet-soft)]" />
            </span>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p
                className="text-2xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Conversions */}
      <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        <h3
          className="mb-6 text-xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Recent Conversions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                <th className="pb-4 pr-4">Date</th>
                <th className="pb-4 pr-4">Product</th>
                <th className="pb-4 pr-4">Sale</th>
                <th className="pb-4 pr-4">Commission</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {conversions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-[var(--text-secondary)]">
                    No conversions yet.
                  </td>
                </tr>
              )}
              {conversions.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border-faint)] last:border-0">
                  <td className="py-4 pr-4 text-sm text-[var(--text-secondary)]">{c.date}</td>
                  <td className="py-4 pr-4 text-sm font-medium text-[var(--text-primary)]">
                    {c.productName}
                  </td>
                  <td className="py-4 pr-4 text-sm text-[var(--text-on-surface)]">
                    {formatCurrency(c.saleAmount)}
                  </td>
                  <td className="py-4 pr-4 text-sm font-semibold text-[var(--text-primary)]">
                    {formatCurrency(c.commission)}
                  </td>
                  <td className="py-4">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payouts */}
      <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        <h3
          className="mb-6 text-xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Payout History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                <th className="pb-4 pr-4">Period</th>
                <th className="pb-4 pr-4">Amount</th>
                <th className="pb-4 pr-4">Reference</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-[var(--text-secondary)]">
                    No payouts yet.
                  </td>
                </tr>
              )}
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border-faint)] last:border-0">
                  <td className="py-4 pr-4 text-sm text-[var(--text-secondary)]">{p.period}</td>
                  <td className="py-4 pr-4 text-sm font-semibold text-[var(--text-primary)]">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="py-4 pr-4 text-sm text-[var(--text-secondary)]">
                    {p.reference ?? "—"}
                  </td>
                  <td className="py-4">
                    <StatusBadge status={p.status} />
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
