import Image from "next/image";
import Link from "next/link";
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

export function ProfileAffiliateLinks({ links }: { links: AffiliateLinkRow[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="text-xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          My Affiliate Links
        </h2>
        <Link
          href="/creator/links"
          className="text-sm font-medium text-[var(--accent-violet-light)] transition-opacity hover:opacity-80"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
              <th className="pb-4 pr-4">Product</th>
              <th className="pb-4 pr-4">Brand</th>
              <th className="pb-4 pr-4">Commission</th>
              <th className="pb-4 pr-4">Earnings</th>
              <th className="pb-4 w-10" />
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.refCode} className="border-b border-[var(--border-faint)] last:border-0">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-hover)]">
                      <Image
                        src={link.image}
                        alt={link.productName}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{link.productName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{link.category}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-4 text-sm text-[var(--text-on-surface)]">{link.brandName}</td>
                <td className="py-4 pr-4">
                  <span className="inline-flex rounded-md bg-[var(--accent-violet)]/20 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[var(--accent-violet-light)] uppercase">
                    {link.commissionRate}% Per Sale
                  </span>
                </td>
                <td className="py-4 pr-4 text-sm font-bold text-[var(--accent-lime-bright)]">
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
