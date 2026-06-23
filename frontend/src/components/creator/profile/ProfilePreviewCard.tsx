"use client";

import Image from "next/image";
import type { EditProfileInitialData } from "@/lib/creator-profile-edit";

type ProfilePreviewCardProps = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  categories: string[];
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
};

export function ProfilePreviewCard({
  displayName,
  username,
  bio,
  avatarUrl,
  categories,
  instagramUrl,
  tiktokUrl,
  youtubeUrl,
}: ProfilePreviewCardProps) {
  const socials = [
    { url: tiktokUrl, label: "TikTok" },
    { url: instagramUrl, label: "Instagram" },
    { url: youtubeUrl, label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)]">
      <div className="relative h-28 bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[var(--accent-lime-bright)]">
        <div className="absolute inset-x-0 -bottom-10 flex justify-center">
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-[var(--bg-card)] bg-[var(--bg-hover)]">
            <Image
              src={avatarUrl}
              alt={displayName}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="px-5 pt-14 pb-5 text-center">
        <h3
          className="text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {displayName || "Your Name"}
        </h3>
        <p className="text-sm text-[var(--accent-violet-light)]">{username || "@username"}</p>
        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
          {bio || "Your bio will appear here..."}
        </p>

        {socials.length > 0 && (
          <div className="mt-4 flex justify-center gap-2">
            {socials.map((s) => (
              <span
                key={s.label}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-hover)] text-[10px] font-bold text-[var(--text-muted-variant)]"
              >
                {s.label[0]}
              </span>
            ))}
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-[var(--accent-violet)]/40 bg-[var(--accent-violet)]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[var(--accent-violet-light)] uppercase"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProfileStrengthCard({
  strength,
  tip,
}: {
  strength: number;
  tip: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-bold text-[var(--text-primary)]">Profile Strength</h4>
        <span className="text-sm font-bold text-[var(--accent-violet-light)]">{strength}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-hover)]">
        <div
          className="h-full rounded-full bg-[var(--accent-violet-light)] transition-all duration-500"
          style={{ width: `${strength}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">{tip}</p>
    </div>
  );
}

export function computeStrength(data: Pick<EditProfileInitialData, "avatarUrl" | "bio" | "tiktokUrl" | "youtubeUrl" | "instagramUrl">): number {
  let score = 0;
  if (data.avatarUrl) score += 20;
  if (data.bio.length > 20) score += 20;
  if (data.instagramUrl) score += 15;
  if (data.tiktokUrl) score += 15;
  if (data.youtubeUrl) score += 30;
  return Math.min(score, 100);
}

export function strengthTip(youtubeUrl: string): string {
  if (!youtubeUrl) {
    return "Tip: Add a YouTube link to reach 100% and get featured on the explorer page.";
  }
  return "Great job! Your profile is fully optimized for brand discovery.";
}
