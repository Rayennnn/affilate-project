import { Store } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

export function BrandHeader({ storeName, email }: { storeName: string; email: string }) {
  return (
    <header className="fixed top-0 right-0 z-40 flex h-16 w-[calc(100%-240px)] items-center justify-between border-b border-[var(--border-outline)] bg-[var(--bg-header)] px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-violet)]/15">
          <Store className="h-5 w-5 text-[var(--accent-violet-light)]" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{storeName}</p>
          <p className="text-xs text-[var(--text-secondary)]">{email}</p>
        </div>
      </div>
      <LogoutButton />
    </header>
  );
}
