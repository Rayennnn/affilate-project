"use client";

import { useState } from "react";
import { Check, Loader2, Mail, ShieldCheck, Landmark } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type SettingsInitial = {
  fullName: string;
  email: string;
  iban: string;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border-outline)] bg-[var(--bg-input-field)] px-4 py-2.5 text-sm text-[var(--text-on-surface)] outline-none transition-all placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-violet-light)] focus:ring-1 focus:ring-[var(--accent-violet-light)]";

export function SettingsForm({ initial }: { initial: SettingsInitial }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const isDirty = form.fullName !== saved.fullName || form.iban !== saved.iban;

  const handleSave = async () => {
    setSaving(true);
    setSavedOk(false);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ full_name: form.fullName }).eq("id", user.id);
        await supabase.from("creators").update({ iban: form.iban || null }).eq("profile_id", user.id);
        setSaved(form);
        setSavedOk(true);
        setTimeout(() => setSavedOk(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    setResetMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetMsg(error ? error.message : "Reset link sent to your email.");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Settings
        </h2>
        <p className="mt-2 text-[var(--text-secondary)]">Manage your account and payout details.</p>
      </div>

      {/* Account */}
      <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        <p className="mb-4 text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">
          Account
        </p>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-on-surface)]">
              Full Name
            </label>
            <input
              className={inputClass}
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-on-surface)]">
              Email
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border-outline)] bg-[var(--bg-hover)] px-4 py-2.5">
              <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-secondary)]">{form.email}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Payout */}
      <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        <p className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">
          <Landmark className="h-4 w-4" /> Payout
        </p>
        <label className="mb-2 block text-sm font-medium text-[var(--text-on-surface)]">
          IBAN (for Konnect payouts)
        </label>
        <input
          className={inputClass}
          placeholder="TN59 0000 0000 0000 0000 0000"
          value={form.iban}
          onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))}
        />
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Your commissions are paid out to this account.
        </p>
      </section>

      {/* Security */}
      <section className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
        <p className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">
          <ShieldCheck className="h-4 w-4" /> Security
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Password</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {resetMsg || "Send a reset link to your email."}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePasswordReset}
            className="rounded-xl border border-[var(--border-outline)] px-4 py-2 text-sm font-medium text-[var(--text-on-surface)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            Reset Password
          </button>
        </div>
      </section>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-3">
        {savedOk && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Changes
        </button>
      </div>
    </div>
  );
}
