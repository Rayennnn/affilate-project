import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SettingsForm, type SettingsInitial } from "@/components/creator/SettingsForm";

export const metadata: Metadata = {
  title: "Settings | Creatorly",
};

export default async function SettingsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const { data: creator } = await supabase
    .from("creators")
    .select("niche, bio, audience_size, iban, instagram_url, tiktok_url, youtube_url")
    .eq("profile_id", user.id)
    .maybeSingle();

  const initial: SettingsInitial = {
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? user.email ?? "",
    niche: creator?.niche ?? "",
    bio: creator?.bio ?? "",
    audienceSize: Number(creator?.audience_size ?? 0),
    iban: creator?.iban ?? "",
    instagramUrl: creator?.instagram_url ?? "",
    tiktokUrl: creator?.tiktok_url ?? "",
    youtubeUrl: creator?.youtube_url ?? "",
    hasCreator: Boolean(creator),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Settings
        </h2>
        <p className="mt-1 text-[var(--text-secondary)]">
          Manage your account, creator profile and payout details.
        </p>
      </div>

      <SettingsForm initial={initial} />
    </div>
  );
}
