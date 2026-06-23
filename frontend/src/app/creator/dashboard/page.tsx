import type { Metadata } from "next";
import { StatCards } from "@/components/creator/dashboard/StatCards";
import { AffiliateLinksTable } from "@/components/creator/dashboard/AffiliateLinksTable";
import { TopProducts } from "@/components/creator/dashboard/TopProducts";
import { NextPayoutCard } from "@/components/creator/dashboard/NextPayoutCard";
import { EarningsVelocityChart } from "@/components/creator/dashboard/EarningsVelocityChart";
import { getCreatorDashboardData } from "@/lib/creator-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Creatorly",
};

export default async function CreatorDashboardPage() {
  const data = await getCreatorDashboardData();

  return (
    <div className="space-y-6">
      <StatCards stats={data.stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <AffiliateLinksTable links={data.links} />

        <div className="flex flex-col gap-6">
          <TopProducts products={data.topProducts} />
          <NextPayoutCard amount={data.nextPayout.amount} date={data.nextPayout.date} />
        </div>
      </div>

      <EarningsVelocityChart weekData={data.chartWeek} monthData={data.chartMonth} />
    </div>
  );
}
