import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BadgeCheck, Users } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getAdminCreators } from "@/lib/admin";
import { VerifyToggle } from "@/components/admin/VerifyToggle";

export const metadata: Metadata = { title: "Creators | Admin" };

function formatAudience(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toLocaleString("en-US");
}

export default async function AdminCreatorsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const creators = await getAdminCreators();

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Creators ({creators.length})
        </h2>
        <p className="mt-1 text-[var(--text-secondary)]">
          Every UGC creator on the platform. Verify trusted creators.
        </p>
      </div>

      {creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] py-20 text-center">
          <Users className="h-10 w-10 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)]">No creators registered yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                  <th className="px-6 py-4">Creator</th>
                  <th className="px-6 py-4">Niche</th>
                  <th className="px-6 py-4">Audience</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {creators.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--border-faint)] last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--text-primary)]">{c.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{c.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-[var(--text-on-surface)]">
                      {c.niche}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-on-surface)]">
                      {formatAudience(c.audienceSize)}
                    </td>
                    <td className="px-6 py-4">
                      {c.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-lime-bg)] px-3 py-1 text-xs font-semibold text-[var(--accent-lime-bright)]">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-[var(--bg-hover)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <VerifyToggle table="creators" id={c.id} verified={c.isVerified} />
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
