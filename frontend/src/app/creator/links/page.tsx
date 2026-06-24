import type { Metadata } from "next";
import { Link2, MousePointerClick, Wallet } from "lucide-react";
import { AffiliateLinksTable } from "@/components/creator/dashboard/AffiliateLinksTable";
import { getCreatorLinks } from "@/lib/creator-links";

export const metadata: Metadata = {
  title: "My Links | Creatorly",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function LinksPage() {
  const { links, totalClicks, totalEarned, totalConversions } = await getCreatorLinks();

  const summary = [
    { label: "Active Links", value: String(links.length), icon: Link2 },
    { label: "Total Clicks", value: totalClicks.toLocaleString("en-US"), icon: MousePointerClick },
    { label: "Total Earned", value: formatCurrency(totalEarned), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          My Links
        </h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          {totalConversions > 0
            ? `${totalConversions.toLocaleString("en-US")} conversions across your affiliate links.`
            : "Share your links to start earning commissions."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map(({ label, value, icon: Icon }) => (
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

      <AffiliateLinksTable links={links} />
    </div>
  );
}
