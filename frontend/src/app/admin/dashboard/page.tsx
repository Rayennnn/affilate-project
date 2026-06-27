import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  Megaphone,
  Clock,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getAdminOverview } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin Console | Creatorly",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const overview = await getAdminOverview();

  const cards = [
    { label: "Brands", value: String(overview?.totalBrands ?? 0), icon: Building2, href: "/admin/brands" },
    { label: "Creators", value: String(overview?.totalCreators ?? 0), icon: Users, href: "/admin/creators" },
    { label: "Active Campaigns", value: String(overview?.activeCampaigns ?? 0), icon: Megaphone },
    {
      label: "Pending Conversions",
      value: String(overview?.pendingConversions ?? 0),
      icon: Clock,
      href: "/admin/conversions",
    },
    {
      label: "Sales Volume",
      value: formatCurrency(overview?.totalSalesVolume ?? 0),
      icon: DollarSign,
    },
    {
      label: "Platform Revenue",
      value: formatCurrency(overview?.totalPlatformRevenue ?? 0),
      icon: TrendingUp,
    },
    {
      label: "Pending Payouts",
      value: formatCurrency(overview?.pendingPayouts ?? 0),
      icon: Wallet,
      href: "/admin/payouts",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Platform overview
        </h2>
        <p className="mt-1 text-[var(--text-secondary)]">
          Live KPIs across brands, creators, conversions and payouts.
        </p>
      </div>

      {!overview && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-400">
          No data available. The admin overview requires an admin role to read platform tables.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => {
          const card = (
            <div className="h-full rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--accent-violet)]/40">
              <div className="mb-4 flex items-start justify-between">
                <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                <span className="rounded-lg bg-[var(--bg-hover)] p-2">
                  <Icon className="h-5 w-5 text-[var(--accent-violet-soft)]" />
                </span>
              </div>
              <p
                className="text-3xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {value}
              </p>
            </div>
          );
          return href ? (
            <Link key={label} href={href}>
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
