import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { RoleShell } from "@/components/RoleShell";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <RoleShell workspace="Admin Console" email={user.email ?? ""}>
      <h2
        className="text-[32px] font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Admin Console
      </h2>
      <p className="mt-2 text-[var(--text-secondary)]">
        Platform overview, payouts and verifications will appear here.
      </p>
    </RoleShell>
  );
}
