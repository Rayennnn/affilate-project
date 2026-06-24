import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getApplicants } from "@/lib/brand-applicants";
import { ApplicantsList } from "@/components/brand/ApplicantsList";

export const metadata: Metadata = {
  title: "Applicants | Brand",
};

export default async function BrandApplicantsPage() {
  const { hasBrand, applicants } = await getApplicants();

  if (!hasBrand) {
    return (
      <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-12 text-center">
        <h2
          className="text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Set up your store first
        </h2>
        <Link
          href="/brand/settings"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Go to Settings <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return <ApplicantsList initial={applicants} />;
}
