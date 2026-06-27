import Link from "next/link";
import { Bell, Plus, Wallet } from "lucide-react";

type BrandHeaderProps = {
  storeName?: string;
  email?: string;
  balance?: string;
};

export function BrandHeader({
  storeName = "Your Store",
  email = "",
  balance = "$0.00",
}: BrandHeaderProps) {
  const initials = storeName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 right-0 z-40 flex h-16 w-[calc(100%-240px)] items-center justify-between border-b border-[var(--border-outline)] bg-[var(--bg-header)] px-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-[var(--text-muted-variant)] uppercase">
          Brand Workspace
        </p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{storeName}</p>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/brand/add-product"
          className="hidden items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-[var(--border-outline)] bg-[var(--bg-input-field)] px-3 py-1.5 md:flex">
          <Wallet className="h-4 w-4 text-[var(--accent-violet-light)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{balance}</span>
        </div>

        <button
          type="button"
          className="relative cursor-pointer rounded-full p-2 transition-colors hover:bg-[var(--bg-hover)] active:opacity-80"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-[var(--accent-violet-light)]" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            2
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{storeName}</p>
            <p className="text-xs text-[var(--text-secondary)]">{email}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--accent-violet)]/40 bg-[var(--bg-hover)] text-sm font-bold text-[var(--accent-violet-light)]">
            {initials || "BR"}
          </div>
        </div>
      </div>
    </header>
  );
}
