import { BrandSidebar } from "@/components/brand/BrandSidebar";
import { BrandHeader } from "@/components/brand/BrandHeader";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/brand-dashboard";

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let storeName = "Your Store";
  let balance = "$0.00";

  if (user) {
    const { data: brand } = await supabase
      .from("brands")
      .select("store_name, konnect_deposit")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (brand?.store_name) storeName = brand.store_name;
    if (brand?.konnect_deposit != null) balance = formatCurrency(Number(brand.konnect_deposit));
  }

  return (
    <div className="dashboard-scrollbar min-h-screen bg-[var(--bg-primary)] text-[var(--text-on-surface)]">
      <BrandSidebar />
      <BrandHeader storeName={storeName} email={user?.email ?? ""} balance={balance} />
      <main className="mx-auto ml-[240px] mt-16 min-h-screen max-w-[1360px] p-6">
        {children}
      </main>
    </div>
  );
}
