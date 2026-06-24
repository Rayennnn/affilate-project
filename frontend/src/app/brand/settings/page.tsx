import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import { BrandSettingsForm } from "@/components/brand/BrandSettingsForm";

export const metadata: Metadata = {
  title: "Settings | Brand",
};

export default async function BrandSettingsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const brand = await getBrand(supabase, user.id);
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <BrandSettingsForm
      initial={{
        fullName: profile?.full_name ?? "",
        storeName: brand?.store_name ?? "",
        storeUrl: brand?.store_url ?? "",
        description: brand?.description ?? "",
        gtmId: brand?.gtm_id ?? "",
        logoUrl: brand?.logo_url ?? "",
        hasBrand: Boolean(brand),
      }}
    />
  );
}
