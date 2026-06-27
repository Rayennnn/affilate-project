"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type SettingsInitial = {
  fullName: string;
  email: string;
  niche: string;
  bio: string;
  audienceSize: number;
  iban: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  hasCreator: boolean;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border-outline)] bg-[var(--bg-input-field)] px-4 py-3 text-sm text-[var(--text-on-surface)] placeholder:text-[var(--text-placeholder)] outline-none transition-colors focus:border-[var(--accent-violet-light)] focus:ring-1 focus:ring-[var(--accent-violet-light)] disabled:opacity-60";
const labelClass = "mb-2 block text-sm font-medium text-[var(--text-secondary)]";

export function SettingsForm({ initial }: { initial: SettingsInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: initial.fullName,
    niche: initial.niche,
    bio: initial.bio,
    audienceSize: String(initial.audienceSize || ""),
    iban: initial.iban,
    instagramUrl: initial.instagramUrl,
    tiktokUrl: initial.tiktokUrl,
    youtubeUrl: initial.youtubeUrl,
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in.");
        setSaving(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: form.fullName })
        .eq("id", user.id);

      if (profileError) {
        setError(profileError.message);
        setSaving(false);
        return;
      }

      if (initial.hasCreator) {
        const { error: creatorError } = await supabase
          .from("creators")
          .update({
            niche: form.niche || "general",
            bio: form.bio || null,
            audience_size: Number(form.audienceSize) || 0,
            iban: form.iban || null,
            instagram_url: form.instagramUrl || null,
            tiktok_url: form.tiktokUrl || null,
            youtube_url: form.youtubeUrl || null,
          })
          .eq("profile_id", user.id);

        if (creatorError) {
          setError(creatorError.message);
          setSaving(false);
          return;
        }
      }

      setSaved(true);
      setSaving(false);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        <h3
          className="mb-5 text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Account
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Display name
            </label>
            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input id="email" type="email" value={initial.email} disabled className={inputClass} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        <h3
          className="mb-5 text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Creator profile
        </h3>
        {!initial.hasCreator && (
          <p className="mb-4 rounded-lg bg-[var(--bg-hover)] p-3 text-sm text-[var(--text-secondary)]">
            No creator record found — only your display name can be updated.
          </p>
        )}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="niche" className={labelClass}>
              Niche
            </label>
            <input
              id="niche"
              type="text"
              value={form.niche}
              onChange={(e) => update("niche", e.target.value)}
              placeholder="tech, beauty…"
              disabled={!initial.hasCreator}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="audienceSize" className={labelClass}>
              Audience size
            </label>
            <input
              id="audienceSize"
              type="number"
              min="0"
              value={form.audienceSize}
              onChange={(e) => update("audienceSize", e.target.value)}
              disabled={!initial.hasCreator}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="bio" className={labelClass}>
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              disabled={!initial.hasCreator}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="instagramUrl" className={labelClass}>
              Instagram URL
            </label>
            <input
              id="instagramUrl"
              type="url"
              value={form.instagramUrl}
              onChange={(e) => update("instagramUrl", e.target.value)}
              disabled={!initial.hasCreator}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="tiktokUrl" className={labelClass}>
              TikTok URL
            </label>
            <input
              id="tiktokUrl"
              type="url"
              value={form.tiktokUrl}
              onChange={(e) => update("tiktokUrl", e.target.value)}
              disabled={!initial.hasCreator}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="youtubeUrl" className={labelClass}>
              YouTube URL
            </label>
            <input
              id="youtubeUrl"
              type="url"
              value={form.youtubeUrl}
              onChange={(e) => update("youtubeUrl", e.target.value)}
              disabled={!initial.hasCreator}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        <h3
          className="mb-5 text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Payout
        </h3>
        <div>
          <label htmlFor="iban" className={labelClass}>
            IBAN
          </label>
          <input
            id="iban"
            type="text"
            value={form.iban}
            onChange={(e) => update("iban", e.target.value)}
            placeholder="TN59…"
            disabled={!initial.hasCreator}
            className={inputClass}
          />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-lime-bright)]">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
