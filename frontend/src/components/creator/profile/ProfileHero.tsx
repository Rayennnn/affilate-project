import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { CreatorProfileData } from "@/lib/creator-profile";

function SocialIcon({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-outline)] bg-[var(--bg-hover)] text-[var(--text-muted-variant)] transition-colors hover:border-[var(--accent-violet-light)] hover:text-[var(--accent-violet-light)]"
    >
      {children}
    </a>
  );
}

export function ProfileHero({ profile }: { profile: CreatorProfileData }) {
  const statItems = [
    { label: "Total Earned", value: profile.stats.totalEarned, highlight: true },
    { label: "Total Clicks", value: profile.stats.totalClicks },
    { label: "Conversions", value: profile.stats.conversions },
    { label: "Active Links", value: profile.stats.activeLinks },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)]">
      <div className="p-6 pb-0 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <div className="rounded-full bg-gradient-to-br from-[var(--accent-violet)] to-[#6366f1] p-1">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[var(--bg-card)] sm:h-32 sm:w-32">
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    fill
                    className="object-cover"
                    sizes="128px"
                    priority
                  />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-violet)] text-white shadow-lg">
                <Star className="h-3.5 w-3.5 fill-white" />
              </span>
              <span className="absolute right-2 bottom-2 h-4 w-4 rounded-full border-2 border-[var(--bg-card)] bg-emerald-400" />
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1
                  className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {profile.fullName}
                </h1>
                <span className="rounded-full bg-[var(--accent-violet)]/20 px-3 py-0.5 text-xs font-semibold text-[var(--accent-violet-light)]">
                  {profile.badge}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-[var(--accent-violet-light)]">
                {profile.handle}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                {profile.bio}
              </p>
              <div className="mt-4 flex justify-center gap-2 sm:justify-start">
                <SocialIcon href={profile.tiktokUrl} label="TikTok">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href={profile.instagramUrl} label="Instagram">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href={profile.youtubeUrl} label="YouTube">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </SocialIcon>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 sm:items-end">
            <Link
              href="/creator/profile/edit"
              className="rounded-xl border border-[var(--border-outline)] px-5 py-2.5 text-sm font-semibold text-[var(--text-on-surface)] transition-colors hover:bg-[var(--bg-hover)]"
            >
              Edit Profile
            </Link>
            <p className="text-xs text-[var(--text-secondary)]">{profile.memberSince}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 border-t border-[var(--border-outline)] sm:grid-cols-4">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="border-[var(--border-outline)] px-6 py-5 not-last:border-r sm:border-r"
          >
            <p className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
              {stat.label}
            </p>
            <p
              className={`mt-1 text-2xl font-bold sm:text-3xl ${
                stat.highlight ? "text-[var(--accent-lime-bright)]" : "text-[var(--text-primary)]"
              }`}
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
