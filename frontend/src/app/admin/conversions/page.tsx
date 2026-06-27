import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Repeat } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getAdminConversions } from "@/lib/admin";
import { ConversionActions } from "@/components/admin/ConversionActions";

export const metadata: Metadata = { title: "Conversions | Admin" };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-[var(--accent-lime-bg)] text-[var(--accent-lime-bright)]",
  pending: "bg-amber-500/15 text-amber-400",
  paid: "bg-[var(--accent-violet)]/20 text-[var(--accent-violet-light)]",
  cancelled: "bg-red-500/15 text-red-400",
};

export default async function AdminConversionsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const conversions = await getAdminConversions();

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Conversions ({conversions.length})
        </h2>
        <p className="mt-1 text-[var(--text-secondary)]">
          Tracked sales. Confirm pending conversions to make them payable, or cancel fraud.
        </p>
      </div>

      {conversions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] py-20 text-center">
          <Repeat className="h-10 w-10 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)]">No conversions recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Sale</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Fee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--border-faint)] last:border-0">
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                      {c.productName}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-on-surface)]">{c.brandName}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-on-surface)]">
                      {formatCurrency(c.saleAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">
                      {formatCurrency(c.commission)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {formatCurrency(c.platformFee)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          STATUS_STYLES[c.status] ?? "bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <ConversionActions id={c.id} status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
