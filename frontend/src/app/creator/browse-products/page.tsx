import type { Metadata } from "next";
import { MarketplaceContent } from "@/components/creator/MarketplaceContent";
import { getMarketplaceData } from "@/lib/creator-marketplace";

export const metadata: Metadata = {
  title: "Browse Products | Creatorly",
  description: "Discover high-commission products for your audience.",
};

export default async function BrowseProductsPage() {
  const data = await getMarketplaceData();

  return (
    <MarketplaceContent
      creatorId={data.creatorId}
      campaigns={data.campaigns}
      avgCommission={data.avgCommission}
    />
  );
}
