import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { AffiliateLinkRow } from "@/lib/creator-dashboard";
import { CopyLinkButton } from "@/components/creator/dashboard/CopyLinkButton";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatClicks(value: number): string {
  return value.toLocaleString("en-US");
}

export function AffiliateLinksTable({ links }: { links: AffiliateLinkRow[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3
          className="text-xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          My Affiliate Links
        </h3>
        <Link
          href="/creator/browse-products"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          + New Link
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
              <th className="pb-4 pr-4">Product</th>
              <th className="pb-4 pr-4">Brand</th>
              <th className="pb-4 pr-4">Commission</th>
              <th className="pb-4 pr-4">Clicks</th>
              <th className="pb-4 pr-4">Earnings</th>
              <th className="pb-4 w-10" />
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr
                key={link.refCode}
                className="border-b border-[var(--border-faint)] last:border-0"
              >
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-hover)]">
                      <Image
                        src={link.image}
                        alt={link.productName}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {link.productName}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">{link.category}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-4 text-sm text-[var(--text-on-surface)]">
                  {link.brandName}
                </td>
                <td className="py-4 pr-4">
                  <span className="inline-flex rounded-full bg-[var(--accent-violet)]/20 px-3 py-1 text-xs font-semibold text-[var(--accent-violet-light)]">
                    {link.commissionRate}% Commission
                  </span>
                </td>
                <td className="py-4 pr-4 text-sm font-medium text-[var(--text-on-surface)]">
                  {formatClicks(link.clicks)}
                </td>
                <td className="py-4 pr-4 text-sm font-semibold text-[var(--text-primary)]">
                  {formatCurrency(link.earnings)}
                </td>
                <td className="py-4">
                  <CopyLinkButton url={link.fullUrl} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
