"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Info,
  Landmark,
  Shield,
} from "lucide-react";
import { CREATOR_AVATAR } from "@/data/products";
import { supabase } from "@/lib/supabase";
import {
  AGE_GROUPS,
  audienceFromReach,
  CATEGORY_OPTIONS,
  LOCATIONS,
  MONTHLY_REACH,
  type EditProfileInitialData,
} from "@/lib/creator-profile-edit";
import {
  computeStrength,
  ProfilePreviewCard,
  ProfileStrengthCard,
  strengthTip,
} from "@/components/creator/profile/ProfilePreviewCard";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">
      {children}
    </p>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <label className="text-sm font-medium text-[var(--text-on-surface)]">{children}</label>
      {hint && <span className="text-xs text-[var(--text-secondary)]">{hint}</span>}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--border-outline)] bg-[var(--bg-input-field)] px-4 py-2.5 text-sm text-[var(--text-on-surface)] outline-none transition-all placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-violet-light)] focus:ring-1 focus:ring-[var(--accent-violet-light)]";

export function EditProfileForm({ initial }: { initial: EditProfileInitialData }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [usernameAvailable] = useState(true);

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  const update = <K extends keyof EditProfileInitialData>(key: K, value: EditProfileInitialData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (cat: string) => {
    setForm((prev) => {
      const selected = prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : prev.categories.length < 5
          ? [...prev.categories, cat]
          : prev.categories;
      return { ...prev, categories: selected };
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      update("avatarUrl", URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    update("avatarUrl", CREATOR_AVATAR);
  };

  const handleDiscard = () => {
    setForm(saved);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({ full_name: form.displayName })
          .eq("id", user.id);

        const niche = form.categories.map((c) => c.toLowerCase()).join(",");

        // Upsert (not update) so it also works for creators who don't have a
        // creators row yet — onboarding. creators.profile_id is unique.
        await supabase.from("creators").upsert(
          {
            profile_id: user.id,
            bio: form.bio,
            niche: niche || "general",
            instagram_url: form.instagramUrl || null,
            tiktok_url: form.tiktokUrl || null,
            youtube_url: form.youtubeUrl || null,
            audience_size: audienceFromReach(form.monthlyReach),
          },
          { onConflict: "profile_id" },
        );
      }

      setSaved(form);
      router.push("/creator/profile");
      router.refresh();
    } catch {
      // keep form state on error
    } finally {
      setSaving(false);
    }
  };

  const strength = computeStrength(form);
  const usernameSlug = form.username.replace(/^@/, "");

  return (
    <>
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-1 text-sm text-[var(--text-secondary)]">
          <Link href="/creator/profile" className="transition-colors hover:text-[var(--accent-violet-light)]">
            Profile
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[var(--accent-violet-light)]">Edit Profile</span>
        </nav>
        <h1
          className="text-3xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Edit Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 pb-28 xl:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          {/* Profile Photo */}
          <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
            <SectionLabel>Profile Photo</SectionLabel>
            <div className="flex flex-wrap items-center gap-6">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[var(--accent-violet)]/30">
                <Image
                  src={form.avatarUrl}
                  alt={form.displayName}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-[var(--border-outline)] px-4 py-2 text-sm font-medium text-[var(--text-on-surface)] transition-colors hover:bg-[var(--bg-hover)]"
                >
                  Upload New Photo
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  Remove Photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </div>
            </div>
          </section>

          {/* Basic Info */}
          <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
            <SectionLabel>Basic Info</SectionLabel>
            <div className="space-y-5">
              <div>
                <FieldLabel hint={`${form.displayName.length}/50`}>Display Name</FieldLabel>
                <input
                  className={inputClass}
                  value={form.displayName}
                  maxLength={50}
                  onChange={(e) => update("displayName", e.target.value)}
                />
              </div>

              <div>
                <FieldLabel>Username</FieldLabel>
                <div className="relative">
                  <input
                    className={`${inputClass} pr-28`}
                    value={form.username}
                    onChange={(e) => update("username", e.target.value.startsWith("@") ? e.target.value : `@${e.target.value}`)}
                  />
                  {usernameAvailable && (
                    <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                      <Check className="h-3 w-3" />
                      Available
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  Your profile will be at: creatorly.io/{usernameSlug}
                </p>
              </div>

              <div>
                <FieldLabel hint={`${form.bio.length}/250`}>Bio</FieldLabel>
                <textarea
                  className={`${inputClass} min-h-[100px] resize-y`}
                  value={form.bio}
                  maxLength={250}
                  rows={4}
                  onChange={(e) => update("bio", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
            <SectionLabel>Social Links</SectionLabel>
            <div className="space-y-4">
              {[
                { key: "tiktokUrl" as const, label: "TikTok", placeholder: "tiktok.com/@username" },
                { key: "instagramUrl" as const, label: "Instagram", placeholder: "instagram.com/username" },
                { key: "youtubeUrl" as const, label: "YouTube", placeholder: "youtube.com/@channel" },
                { key: "twitterUrl" as const, label: "Twitter / X", placeholder: "x.com/username" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <input
                    className={inputClass}
                    value={form[key]}
                    placeholder={placeholder}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Niche & Categories */}
          <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel>Niche &amp; Categories</SectionLabel>
              <span className="text-xs text-[var(--text-secondary)]">Max 5 categories</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const selected = form.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                      selected
                        ? "border-[var(--accent-violet-light)] bg-[var(--accent-violet)]/20 text-[var(--accent-violet-light)]"
                        : "border-[var(--border-outline)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-on-surface)]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Audience Info */}
          <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
            <SectionLabel>Audience Info</SectionLabel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel>Primary Age Group</FieldLabel>
                <select
                  className={inputClass}
                  value={form.ageGroup}
                  onChange={(e) => update("ageGroup", e.target.value)}
                >
                  {AGE_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Primary Location</FieldLabel>
                <select
                  className={inputClass}
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Monthly Reach</FieldLabel>
                <select
                  className={inputClass}
                  value={form.monthlyReach}
                  onChange={(e) => update("monthlyReach", e.target.value)}
                >
                  {MONTHLY_REACH.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Payout Info */}
          <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
            <SectionLabel>Payout Info</SectionLabel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border-outline)] bg-[var(--bg-hover)] p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#003087] text-xs font-bold text-white">
                      PP
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">PayPal</p>
                      <p className="text-xs text-[var(--text-secondary)]">{form.paypalEmail}</p>
                    </div>
                  </div>
                  <Check className="h-5 w-5 text-[var(--accent-violet-light)]" />
                </div>
                <p className="mt-3 text-xs text-[var(--text-secondary)]">
                  Last verification: Jan 12, 2026
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-outline)] bg-[var(--bg-hover)] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-muted-surface)]">
                    <Landmark className="h-5 w-5 text-[var(--accent-violet-light)]" />
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">Bank Transfer</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {form.bankConnected ? "Connected via Plaid" : "Not connected"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Account & Security */}
          <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
            <SectionLabel>Account &amp; Security</SectionLabel>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-[var(--border-outline)] bg-[var(--bg-hover)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Email Address</p>
                  <p className="text-sm text-[var(--text-secondary)]">{form.email}</p>
                </div>
                <button type="button" className="text-sm font-medium text-[var(--accent-violet-light)] hover:underline">
                  Change Email
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--border-outline)] bg-[var(--bg-hover)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Password</p>
                  <p className="text-sm tracking-widest text-[var(--text-secondary)]">••••••••••</p>
                </div>
                <button type="button" className="text-sm font-medium text-[var(--accent-violet-light)] hover:underline">
                  Reset Password
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--border-outline)] bg-[var(--bg-hover)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[var(--accent-violet-light)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.twoFactorEnabled}
                  onClick={() => update("twoFactorEnabled", !form.twoFactorEnabled)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    form.twoFactorEnabled ? "bg-[var(--accent-violet)]" : "bg-[var(--bg-muted-surface)]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      form.twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <SectionLabel>Danger Zone</SectionLabel>
            </div>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl border border-[var(--border-outline)] px-4 py-2 text-sm font-medium text-[var(--text-on-surface)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                Deactivate Account
              </button>
              <button
                type="button"
                className="rounded-xl border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
              >
                Delete Account
              </button>
            </div>
          </section>
        </div>

        {/* Right sidebar preview */}
        <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <ProfilePreviewCard
            displayName={form.displayName}
            username={form.username}
            bio={form.bio}
            avatarUrl={form.avatarUrl}
            categories={form.categories}
            instagramUrl={form.instagramUrl}
            tiktokUrl={form.tiktokUrl}
            youtubeUrl={form.youtubeUrl}
          />
          <ProfileStrengthCard strength={strength} tip={strengthTip(form.youtubeUrl)} />
        </div>
      </div>

      {/* Sticky save bar */}
      {isDirty && (
        <div className="fixed right-0 bottom-0 left-[240px] z-50 border-t border-[var(--border-outline)] bg-[var(--bg-card)]/95 px-6 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1360px] items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[var(--text-on-surface)]">
              <Info className="h-4 w-4 text-[var(--accent-violet-light)]" />
              You have unsaved changes
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-[var(--accent-violet)] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
