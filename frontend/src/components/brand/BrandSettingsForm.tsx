"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type BrandSettingsInitial = {
  fullName: string;
  storeName: string;
  storeUrl: string;
  description: string;
  gtmId: string;
  logoUrl: string;
  hasBrand: boolean;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border-outline)] bg-[var(--bg-input-field)] px-4 py-2.5 text-sm text-[var(--text-on-surface)] outline-none transition-all placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-violet-light)] focus:ring-1 focus:ring-[var(--accent-violet-light)]";

export function BrandSettingsForm({ initial }: { initial: BrandSettingsInitial }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof BrandSettingsInitial, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setError("");
    if (!form.storeName.trim() || !form.storeUrl.trim()) {
      setError("Store name and store URL are required.");
      return;
    }
    setSaving(true);
    setSavedOk(false);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("profiles").update({ full_name: form.fullName }).eq("id", user.id);

      const { error: err } = await supabase.from("brands").upsert(
        {
          profile_id: user.id,
          store_name: form.storeName.trim(),
          store_url: form.storeUrl.trim(),
          description: form.description.trim() || null,
          gtm_id: form.gtmId.trim() || null,
          logo_url: form.logoUrl.trim() || null,
        },
        { onConflict: "profile_id" },
      );

      if (err) {
        setError(err.message);
      } else {
        setSavedOk(true);
        setTimeout(() => setSavedOk(false), 2000);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {initial.hasBrand ? "Store Settings" : "Set up your store"}
        </h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          {initial.hasBrand
            ? "Update your store details."
            : "Add your store details to start creating campaigns."}
        </p>
      </div>

      <section className="space-y-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
            Your Name
          </label>
          <input
            className={inputClass}
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="Jane Doe"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
              Store Name *
            </label>
            <input
              className={inputClass}
              value={form.storeName}
              onChange={(e) => update("storeName", e.target.value)}
              placeholder="Glow Cosmetics"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
              Store URL *
            </label>
            <input
              className={inputClass}
              value={form.storeUrl}
              onChange={(e) => update("storeUrl", e.target.value)}
              placeholder="https://glow.converty.shop"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
            Description
          </label>
          <textarea
            className={`${inputClass} min-h-[90px] resize-y`}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Beauty & skincare brand"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
              GTM Container ID
            </label>
            <input
              className={inputClass}
              value={form.gtmId}
              onChange={(e) => update("gtmId", e.target.value)}
              placeholder="GTM-XXXXXX"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
              Logo URL
            </label>
            <input
              className={inputClass}
              value={form.logoUrl}
              onChange={(e) => update("logoUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {savedOk && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {initial.hasBrand ? "Save Changes" : "Create Store"}
        </button>
      </div>
    </div>
  );
}
