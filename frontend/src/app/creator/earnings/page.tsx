import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earnings | Creatorly",
};

export default function EarningsPage() {
  return (
    <div>
      <h2
        className="text-[32px] font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Earnings
      </h2>
      <p className="mt-2 text-[var(--text-secondary)]">Track your commissions and payouts here.</p>
    </div>
  );
}
