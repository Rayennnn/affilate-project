import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getBrandDashboardData } from "@/lib/brand-dashboard";
import { BrandStatCards } from "@/components/brand/BrandStatCards";
import { CampaignsTable } from "@/components/brand/CampaignsTable";

export const metadata: Metadata = {
  title: "Dashboard | Creatorly Brand",
};

export default async function BrandDashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await getBrandDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Welcome back, {data.storeName}
        </h2>
        <p className="mt-1 text-[var(--text-secondary)]">
          Here&apos;s how your campaigns and creators are performing.
        </p>
      </div>

      <BrandStatCards stats={data.stats} />
      <CampaignsTable campaigns={data.campaigns} />
    </div>
  );
}
