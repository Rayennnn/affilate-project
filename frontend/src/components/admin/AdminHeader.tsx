import { ShieldCheck } from "lucide-react";

export function AdminHeader({ email }: { email?: string }) {
  return (
    <header className="fixed top-0 right-0 z-40 flex h-16 w-[calc(100%-240px)] items-center justify-between border-b border-[var(--border-outline)] bg-[var(--bg-header)] px-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-[var(--text-muted-variant)] uppercase">
          Admin Console
        </p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Platform management</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Administrator</p>
          <p className="text-xs text-[var(--text-secondary)]">{email}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--accent-violet)]/40 bg-[var(--bg-hover)] text-[var(--accent-violet-light)]">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
