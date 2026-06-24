import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import { CampaignGrid } from "@/components/creator/CampaignGrid";
import { getBrowseCampaigns } from "@/lib/creator-campaigns";

export const metadata: Metadata = {
  title: "Browse Products | Creatorly",
  description: "Discover high-commission products for your audience.",
};

export default async function BrowseProductsPage() {
  const { creatorId, campaigns, avgCommission } = await getBrowseCampaigns();

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="text-[32px] leading-10 font-bold tracking-wide text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Marketplace
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            Discover high-commission products for your audience
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-4">
          <span className="rounded-lg bg-[var(--accent-lime-bg)] p-2">
            <TrendingUp className="h-5 w-5 text-[var(--accent-lime-bright)]" />
          </span>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Avg. Commission</p>
            <p
              className="text-xl font-semibold text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {avgCommission}%
            </p>
          </div>
        </div>
      </div>

      <CampaignGrid creatorId={creatorId} campaigns={campaigns} />
    </>
  );
}
