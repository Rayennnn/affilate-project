import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { RoleShell } from "@/components/RoleShell";

export default async function BrandDashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <RoleShell workspace="Brand Workspace" email={user.email ?? ""}>
      <h2
        className="text-[32px] font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
      </h2>
      <p className="mt-2 text-[var(--text-secondary)]">
        Your brand dashboard — campaigns, creators and conversions will appear here.
      </p>
    </RoleShell>
  );
}
