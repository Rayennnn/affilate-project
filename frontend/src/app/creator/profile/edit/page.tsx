import type { Metadata } from "next";
import { EditProfileForm } from "@/components/creator/profile/EditProfileForm";
import {
  getDemoEditProfileData,
  nicheToCategories,
  reachFromAudience,
  slugUsername,
  type EditProfileInitialData,
} from "@/lib/creator-profile-edit";
import { CREATOR_AVATAR } from "@/data/products";

export const metadata: Metadata = {
  title: "Edit Profile | Creatorly",
};

async function getEditProfileData(): Promise<EditProfileInitialData> {
  const demo = getDemoEditProfileData();

  try {
    const { createSupabaseServer } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return demo;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const { data: creator } = await supabase
      .from("creators")
      .select("bio, niche, instagram_url, tiktok_url, youtube_url, audience_size, is_verified, iban")
      .eq("profile_id", user.id)
      .maybeSingle();

    const categories = nicheToCategories(creator?.niche);
    const hasPhoto = Boolean(profile?.avatar_url);
    const hasBio = Boolean(creator?.bio && creator.bio.length > 20);
    const hasTiktok = Boolean(creator?.tiktok_url);
    const hasYoutube = Boolean(creator?.youtube_url);
    const strengthItems = [hasPhoto, hasBio, hasTiktok, hasYoutube, creator?.is_verified].filter(Boolean).length;
    const profileStrength = Math.round((strengthItems / 5) * 100) || 85;

    return {
      displayName: profile?.full_name ?? demo.displayName,
      username: slugUsername(profile?.full_name ?? demo.displayName, profile?.email ?? user.email),
      bio: creator?.bio ?? demo.bio,
      avatarUrl: profile?.avatar_url ?? CREATOR_AVATAR,
      email: profile?.email ?? user.email ?? demo.email,
      instagramUrl: creator?.instagram_url ?? "",
      tiktokUrl: creator?.tiktok_url ?? "",
      youtubeUrl: creator?.youtube_url ?? "",
      twitterUrl: "",
      categories: categories.length > 0 ? categories : demo.categories,
      ageGroup: demo.ageGroup,
      location: demo.location,
      monthlyReach: reachFromAudience(creator?.audience_size ?? 75000),
      audienceSize: creator?.audience_size ?? 75000,
      profileStrength,
      twoFactorEnabled: true,
      paypalEmail: profile?.email ?? demo.paypalEmail,
      bankConnected: Boolean(creator?.iban),
    };
  } catch {
    return demo;
  }
}

export default async function EditProfilePage() {
  const initial = await getEditProfileData();

  return <EditProfileForm initial={initial} />;
}
