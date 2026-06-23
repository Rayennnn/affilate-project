import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Links | Creatorly",
};

export default function LinksPage() {
  return (
    <div>
      <h2
        className="text-[32px] font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        My Links
      </h2>
      <p className="mt-2 text-[var(--text-secondary)]">Your affiliate links will appear here.</p>
    </div>
  );
}
