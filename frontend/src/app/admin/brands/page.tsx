import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BadgeCheck, Building2 } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getAdminBrands } from "@/lib/admin";
import { VerifyToggle } from "@/components/admin/VerifyToggle";

export const metadata: Metadata = { title: "Brands | Admin" };

export default async function AdminBrandsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const brands = await getAdminBrands();

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Brands ({brands.length})
        </h2>
        <p className="mt-1 text-[var(--text-secondary)]">
          Every store on the platform. Verify trusted brands.
        </p>
      </div>

      {brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] py-20 text-center">
          <Building2 className="h-10 w-10 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)]">No brands registered yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-[var(--border-outline)] text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id} className="border-b border-[var(--border-faint)] last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--text-primary)]">{b.storeName}</p>
                      {b.storeUrl && (
                        <a
                          href={b.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--accent-violet-light)] hover:underline"
                        >
                          {b.storeUrl}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[var(--text-on-surface)]">{b.ownerName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{b.ownerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      {b.isVerified ? (
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
                      <VerifyToggle table="brands" id={b.id} verified={b.isVerified} />
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
