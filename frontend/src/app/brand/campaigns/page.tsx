import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBrandCampaigns } from "@/lib/brand-campaigns";
import { CampaignsManager } from "@/components/brand/CampaignsManager";

export const metadata: Metadata = {
  title: "Campaigns | Brand",
};

export default async function BrandCampaignsPage() {
  const { hasBrand, brandId, campaigns } = await getBrandCampaigns();

  if (!hasBrand || !brandId) {
    return (
      <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-12 text-center">
        <h2
          className="text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Set up your store first
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[var(--text-secondary)]">
          You need a store before creating campaigns.
        </p>
        <Link
          href="/brand/settings"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Go to Settings <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return <CampaignsManager brandId={brandId} initialCampaigns={campaigns} />;
}
