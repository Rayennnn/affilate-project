"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, Store } from "lucide-react";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full rounded-xl border border-[var(--border-outline)] bg-[var(--bg-input-field)] px-4 py-3 text-sm text-[var(--text-on-surface)] placeholder:text-[var(--text-placeholder)] outline-none transition-colors focus:border-[var(--accent-violet-light)] focus:ring-1 focus:ring-[var(--accent-violet-light)]";

const labelClass = "mb-2 block text-sm font-medium text-[var(--text-secondary)]";

export function AddProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsStore, setNeedsStore] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    productName: "",
    productUrl: "",
    productImageUrl: "",
    commissionRate: "15",
    platformFeeRate: "20",
    budget: "1000",
    status: "draft",
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in to add a product.");
        setLoading(false);
        return;
      }

      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (brandError || !brand) {
        // No brands row yet — brand hasn't completed store onboarding (it's not
        // auto-created because store_name/store_url are required). Guide them to
        // Settings instead of showing a cryptic error.
        setNeedsStore(true);
        setLoading(false);
        return;
      }

      const commission = Number(form.commissionRate);
      const fee = Number(form.platformFeeRate);
      const budget = Number(form.budget);

      if (commission <= 0 || commission > 100) {
        setError("Commission rate must be between 1 and 100%.");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("campaigns").insert({
        brand_id: brand.id,
        product_name: form.productName,
        product_url: form.productUrl,
        product_image_url: form.productImageUrl || null,
        commission_rate: commission,
        platform_fee_rate: fee > 0 ? fee : 20,
        budget: budget >= 0 ? budget : 0,
        status: form.status,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/brand/dashboard");
        router.refresh();
      }, 1200);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (needsStore) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] py-20 text-center">
        <Store className="h-14 w-14 text-[var(--accent-violet)]" />
        <h3
          className="text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Set up your store first
        </h3>
        <p className="max-w-md text-[var(--text-secondary)]">
          You need to add your store details (name &amp; URL) before you can create
          campaigns.
        </p>
        <Link
          href="/brand/settings"
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95"
        >
          Set up store
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] py-20 text-center">
        <CheckCircle2 className="h-14 w-14 text-[var(--accent-lime-bright)]" />
        <h3
          className="text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Product launched!
        </h3>
        <p className="text-[var(--text-secondary)]">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6 sm:p-8"
    >
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="productName" className={labelClass}>
            Product name
          </label>
          <input
            id="productName"
            type="text"
            required
            value={form.productName}
            onChange={(e) => update("productName", e.target.value)}
            placeholder="Nova-X Studio Headphones"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="productUrl" className={labelClass}>
            Product URL (Converty link)
          </label>
          <input
            id="productUrl"
            type="url"
            required
            value={form.productUrl}
            onChange={(e) => update("productUrl", e.target.value)}
            placeholder="https://shop.converty.shop/p/nova-x"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="productImageUrl" className={labelClass}>
            Product image URL <span className="text-[var(--text-placeholder)]">(optional)</span>
          </label>
          <input
            id="productImageUrl"
            type="url"
            value={form.productImageUrl}
            onChange={(e) => update("productImageUrl", e.target.value)}
            placeholder="https://…/image.jpg"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="commissionRate" className={labelClass}>
            Commission rate (%)
          </label>
          <input
            id="commissionRate"
            type="number"
            min="1"
            max="100"
            step="0.5"
            required
            value={form.commissionRate}
            onChange={(e) => update("commissionRate", e.target.value)}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-[var(--text-placeholder)]">
            Paid to the creator per sale.
          </p>
        </div>

        <div>
          <label htmlFor="platformFeeRate" className={labelClass}>
            Platform fee (%)
          </label>
          <input
            id="platformFeeRate"
            type="number"
            min="1"
            max="100"
            step="0.5"
            required
            value={form.platformFeeRate}
            onChange={(e) => update("platformFeeRate", e.target.value)}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-[var(--text-placeholder)]">
            Creatorly&apos;s cut of the commission.
          </p>
        </div>

        <div>
          <label htmlFor="budget" className={labelClass}>
            Budget (DT)
          </label>
          <input
            id="budget"
            type="number"
            min="0"
            step="50"
            required
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Launch status
          </label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className={inputClass}
          >
            <option value="draft">Save as draft</option>
            <option value="active">Launch now (active)</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/brand/dashboard")}
          className="rounded-xl border border-[var(--border-outline)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating…" : "Create campaign"}
        </button>
      </div>
    </form>
  );
}
