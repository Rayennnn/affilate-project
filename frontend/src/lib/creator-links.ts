import { createSupabaseServer } from "@/lib/supabase/server";

export type CreatorLink = {
  refCode: string;
  fullUrl: string;
  productName: string;
  brandName: string;
  commissionRate: number;
  clicks: number;
  conversions: number;
  earned: number;
};

export async function getCreatorLinks(): Promise<CreatorLink[]> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!creator) return [];

  const { data: rows } = await supabase
    .from("creator_dashboard")
    .select("*")
    .eq("creator_id", creator.id)
    .not("ref_code", "is", null);

  return (rows ?? [])
    .filter((r) => r.ref_code)
    .map((r) => ({
      refCode: r.ref_code as string,
      fullUrl: r.full_url as string,
      productName: r.product_name ?? "Product",
      brandName: r.brand_name ?? "Brand",
      commissionRate: Number(r.commission_rate ?? 0),
      clicks: Number(r.clicks ?? 0),
      conversions: Number(r.total_conversions ?? 0),
      earned: Number(r.total_earned ?? 0),
    }))
    .sort((a, b) => b.earned - a.earned);
}
