"use client";

import { useState } from "react";
import { Loader2, Pause, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CampaignItem } from "@/lib/brand-campaigns";

type FormState = {
  productName: string;
  productUrl: string;
  productImageUrl: string;
  commissionRate: string;
  platformFeeRate: string;
  budget: string;
  status: string;
};

const EMPTY_FORM: FormState = {
  productName: "",
  productUrl: "",
  productImageUrl: "",
  commissionRate: "20",
  platformFeeRate: "20",
  budget: "1000",
  status: "active",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  paused: "bg-amber-500/15 text-amber-400",
  draft: "bg-[var(--bg-hover)] text-[var(--text-secondary)]",
  completed: "bg-sky-500/15 text-sky-400",
};

const inputClass =
  "w-full rounded-xl border border-[var(--border-outline)] bg-[var(--bg-input-field)] px-4 py-2.5 text-sm text-[var(--text-on-surface)] outline-none transition-all placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-violet-light)] focus:ring-1 focus:ring-[var(--accent-violet-light)]";

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function CampaignsManager({
  brandId,
  initialCampaigns,
}: {
  brandId: string;
  initialCampaigns: CampaignItem[];
}) {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CampaignItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setOpen(true);
  };

  const openEdit = (c: CampaignItem) => {
    setEditing(c);
    setForm({
      productName: c.productName,
      productUrl: c.productUrl,
      productImageUrl: c.productImageUrl ?? "",
      commissionRate: String(c.commissionRate),
      platformFeeRate: String(c.platformFeeRate),
      budget: String(c.budget),
      status: c.status,
    });
    setError("");
    setOpen(true);
  };

  const update = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setError("");
    const commission = Number(form.commissionRate);
    const fee = Number(form.platformFeeRate);
    if (!form.productName.trim() || !form.productUrl.trim()) {
      setError("Product name and URL are required.");
      return;
    }
    if (!(commission > 0 && commission <= 100) || !(fee > 0 && fee <= 100)) {
      setError("Commission and platform fee must be between 1 and 100.");
      return;
    }

    setSaving(true);
    const payload = {
      brand_id: brandId,
      product_name: form.productName.trim(),
      product_url: form.productUrl.trim(),
      product_image_url: form.productImageUrl.trim() || null,
      commission_rate: commission,
      platform_fee_rate: fee,
      budget: Number(form.budget) || 0,
      status: form.status,
    };

    if (editing) {
      const { data, error: err } = await supabase
        .from("campaigns")
        .update(payload)
        .eq("id", editing.id)
        .select(
          "id, product_name, product_url, product_image_url, commission_rate, platform_fee_rate, budget, spent, status",
        )
        .single();
      if (err) {
        setError(err.message);
      } else if (data) {
        setCampaigns((list) => list.map((c) => (c.id === data.id ? mapRow(data) : c)));
        setOpen(false);
      }
    } else {
      const { data, error: err } = await supabase
        .from("campaigns")
        .insert(payload)
        .select(
          "id, product_name, product_url, product_image_url, commission_rate, platform_fee_rate, budget, spent, status",
        )
        .single();
      if (err) {
        setError(err.message);
      } else if (data) {
        setCampaigns((list) => [mapRow(data), ...list]);
        setOpen(false);
      }
    }
    setSaving(false);
  };

  const toggleStatus = async (c: CampaignItem) => {
    const next = c.status === "active" ? "paused" : "active";
    setBusyId(c.id);
    const { error: err } = await supabase.from("campaigns").update({ status: next }).eq("id", c.id);
    if (!err) setCampaigns((list) => list.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
    setBusyId(null);
  };

  const remove = async (c: CampaignItem) => {
    if (!window.confirm(`Delete "${c.productName}"? This removes its links and stats.`)) return;
    setBusyId(c.id);
    const { error: err } = await supabase.from("campaigns").delete().eq("id", c.id);
    if (!err) setCampaigns((list) => list.filter((x) => x.id !== c.id));
    setBusyId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="text-[32px] font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Campaigns
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Create products for creators to promote.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95"
        >
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-12 text-center text-sm text-[var(--text-secondary)]">
          No campaigns yet. Create your first product to promote.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-[var(--text-primary)]">{c.productName}</h3>
                  <a
                    href={c.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs text-[var(--accent-violet-light)] hover:underline"
                  >
                    {c.productUrl}
                  </a>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    STATUS_STYLES[c.status] ?? STATUS_STYLES.draft
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Commission</p>
                  <p className="font-semibold text-[var(--text-primary)]">{c.commissionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Platform Fee</p>
                  <p className="font-semibold text-[var(--text-primary)]">{c.platformFeeRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Budget</p>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {fmt(c.spent)} / {fmt(c.budget)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-outline)] px-3 py-1.5 text-xs font-medium text-[var(--text-on-surface)] transition-colors hover:bg-[var(--bg-hover)]"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleStatus(c)}
                  disabled={busyId === c.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-outline)] px-3 py-1.5 text-xs font-medium text-[var(--text-on-surface)] transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-50"
                >
                  {c.status === "active" ? (
                    <>
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" /> Activate
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  disabled={busyId === c.id}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3
                className="text-xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {editing ? "Edit Campaign" : "New Campaign"}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
                  Product Name
                </label>
                <input
                  className={inputClass}
                  value={form.productName}
                  onChange={(e) => update("productName", e.target.value)}
                  placeholder="Vitamin C Serum"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
                  Product URL (Converty)
                </label>
                <input
                  className={inputClass}
                  value={form.productUrl}
                  onChange={(e) => update("productUrl", e.target.value)}
                  placeholder="https://store.converty.shop/p/..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
                  Image URL (optional)
                </label>
                <input
                  className={inputClass}
                  value={form.productImageUrl}
                  onChange={(e) => update("productImageUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
                    Commission %
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.commissionRate}
                    onChange={(e) => update("commissionRate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
                    Platform %
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.platformFeeRate}
                    onChange={(e) => update("platformFeeRate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
                    Budget
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.budget}
                    onChange={(e) => update("budget", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-on-surface)]">
                  Status
                </label>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mapRow(data: {
  id: string;
  product_name: string;
  product_url: string;
  product_image_url: string | null;
  commission_rate: number;
  platform_fee_rate: number;
  budget: number;
  spent: number;
  status: string;
}): CampaignItem {
  return {
    id: data.id,
    productName: data.product_name,
    productUrl: data.product_url,
    productImageUrl: data.product_image_url,
    commissionRate: Number(data.commission_rate ?? 0),
    platformFeeRate: Number(data.platform_fee_rate ?? 0),
    budget: Number(data.budget ?? 0),
    spent: Number(data.spent ?? 0),
    status: data.status,
  };
}
