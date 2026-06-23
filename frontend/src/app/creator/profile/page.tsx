import type { Metadata } from "next";
import { ProfileHero } from "@/components/creator/profile/ProfileHero";
import { ProfileAffiliateLinks } from "@/components/creator/profile/ProfileAffiliateLinks";
import { ProfileEarningsCard } from "@/components/creator/profile/ProfileEarningsCard";
import { ProfileTopEarner } from "@/components/creator/profile/ProfileTopEarner";
import { ProfileRecentActivity } from "@/components/creator/profile/ProfileRecentActivity";
import { ProfileCompletion } from "@/components/creator/profile/ProfileCompletion";
import { getCreatorProfileData } from "@/lib/creator-profile";

export const metadata: Metadata = {
  title: "Profile | Creatorly",
};

export default async function CreatorProfilePage() {
  const profile = await getCreatorProfileData();

  return (
    <div className="space-y-6">
      <ProfileHero profile={profile} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <ProfileAffiliateLinks links={profile.links} />
        <div className="flex flex-col gap-6">
          <ProfileEarningsCard earnings={profile.earnings} />
          <ProfileTopEarner topEarner={profile.topEarner} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <ProfileRecentActivity activities={profile.activities} />
        <ProfileCompletion completion={profile.completion} />
      </div>
    </div>
  );
}
