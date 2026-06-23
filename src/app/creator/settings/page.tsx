import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Creatorly",
};

export default function SettingsPage() {
  return (
    <div>
      <h2
        className="text-[32px] font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Settings
      </h2>
      <p className="mt-2 text-[var(--text-secondary)]">Manage your account preferences.</p>
    </div>
  );
}
