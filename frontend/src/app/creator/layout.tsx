import { CreatorSidebar } from "@/components/creator/CreatorSidebar";
import { CreatorHeader } from "@/components/creator/CreatorHeader";
import { createSupabaseServer } from "@/lib/supabase/server";
import { CREATOR_AVATAR } from "@/data/products";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userName = "Alex Rivera";
  let avatarUrl = CREATOR_AVATAR;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.full_name) userName = profile.full_name;
    if (profile?.avatar_url) avatarUrl = profile.avatar_url;
  }

  return (
    <div className="dashboard-scrollbar min-h-screen bg-[var(--bg-primary)] text-[var(--text-on-surface)]">
      <CreatorSidebar />
      <CreatorHeader userName={userName} avatarUrl={avatarUrl} />
      <main className="mx-auto ml-[240px] mt-16 min-h-screen max-w-[1360px] p-6">
        {children}
      </main>
    </div>
  );
}
