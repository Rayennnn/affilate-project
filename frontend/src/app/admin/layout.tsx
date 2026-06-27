import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="dashboard-scrollbar min-h-screen bg-[var(--bg-primary)] text-[var(--text-on-surface)]">
      <AdminSidebar />
      <AdminHeader email={user?.email ?? ""} />
      <main className="mx-auto ml-[240px] mt-16 min-h-screen max-w-[1360px] p-6">
        {children}
      </main>
    </div>
  );
}
