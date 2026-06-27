import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getCreators } from "@/lib/brand-creators";
import { InviteCreatorsContent } from "@/components/brand/InviteCreatorsContent";

export const metadata: Metadata = {
  title: "Browse Creators | Creatorly Brand",
};

export default async function InviteCreatorsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const creators = await getCreators();

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Browse creators
        </h2>
        <p className="mt-1 text-[var(--text-secondary)]">
          Discover UGC creators on the network. Creators apply to your active campaigns — review
          them under{" "}
          <a href="/brand/applicants" className="text-[var(--accent-violet-light)] hover:underline">
            Applicants
          </a>
          .
        </p>
      </div>

      <InviteCreatorsContent creators={creators} />
    </div>
  );
}
