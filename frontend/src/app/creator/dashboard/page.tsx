import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Creatorly",
};

export default function CreatorDashboardPage() {
  return (
    <div>
      <h2
        className="text-[32px] font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Dashboard
      </h2>
      <p className="mt-2 text-[var(--text-secondary)]">Your creator stats will appear here.</p>
    </div>
  );
}
