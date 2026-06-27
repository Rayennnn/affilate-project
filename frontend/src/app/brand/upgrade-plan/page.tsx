import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { UpgradePlanContent } from "@/components/brand/UpgradePlanContent";

export const metadata: Metadata = {
  title: "Upgrade Plan | Creatorly Brand",
};

export default async function UpgradePlanPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Choose your plan
        </h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Scale your creator program with the right tools for your brand.
        </p>
      </div>

      <UpgradePlanContent />
    </div>
  );
}
