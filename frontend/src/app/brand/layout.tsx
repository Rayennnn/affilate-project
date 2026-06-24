import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import { BrandSidebar } from "@/components/brand/BrandSidebar";
import { BrandHeader } from "@/components/brand/BrandHeader";

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const brand = await getBrand(supabase, user.id);

  return (
    <div className="dashboard-scrollbar min-h-screen bg-[var(--bg-primary)] text-[var(--text-on-surface)]">
      <BrandSidebar />
      <BrandHeader storeName={brand?.store_name ?? "Your Store"} email={user.email ?? ""} />
      <main className="mx-auto ml-[240px] mt-16 min-h-screen max-w-[1280px] p-6">{children}</main>
    </div>
  );
}
