import type { Metadata } from "next";
import Link from "next/link";
import { Link2, Search } from "lucide-react";
import { getCreatorLinks } from "@/lib/creator-links";
import { CopyLinkButton } from "@/components/creator/dashboard/CopyLinkButton";

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
  const links = await getCreatorLinks();

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          My Links
        </h2>
        <p className="mt-1 text-[var(--text-secondary)]">
          Affiliate links generated once a brand approves your application.
        </p>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] py-20 text-center">
          <Link2 className="h-10 w-10 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)]">
            You don&apos;t have any affiliate links yet.
          </p>
          <Link
            href="/creator/browse-products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-violet-light)] hover:underline"
          >
            <Search className="h-4 w-4" />
            Browse the marketplace →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Clicks</th>
                  <th className="px-6 py-4">Conversions</th>
                  <th className="px-6 py-4">Earned</th>
                  <th className="px-6 py-4">Link</th>
                </tr>
              </thead>
              <tbody>
                {links.map((l) => (
                  <tr
                    key={l.refCode}
                    className="border-b border-[var(--border-faint)] last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--text-primary)]">{l.productName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{l.brandName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-[var(--accent-violet)]/20 px-3 py-1 text-xs font-semibold text-[var(--accent-violet-light)]">
                        {l.commissionRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[var(--text-on-surface)]">
                      {l.clicks.toLocaleString("en-US")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[var(--text-on-surface)]">
                      {l.conversions.toLocaleString("en-US")}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">
                      {formatCurrency(l.earned)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="max-w-[180px] truncate rounded bg-[var(--bg-hover)] px-2 py-1 text-xs text-[var(--text-secondary)]">
                          {l.fullUrl}
                        </code>
                        <CopyLinkButton url={l.fullUrl} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
