import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

// Minimal authenticated chrome for the brand/admin areas (the creator area has
// its own sidebar layout). Server component — pass in the resolved identity.
export function RoleShell({
  workspace,
  email,
  children,
}: {
  workspace: string;
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-on-surface)]">
      <header className="flex items-center justify-between border-b border-[var(--border-outline)] bg-[var(--bg-header)] px-6 py-4">
        <Link href="/">
          <h1
            className="text-xl font-bold text-[var(--accent-violet-light)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Creatorly
          </h1>
          <p className="text-xs font-semibold tracking-wider text-[var(--text-muted-variant)] uppercase">
            {workspace}
          </p>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-[var(--text-muted-variant)] sm:inline">{email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
