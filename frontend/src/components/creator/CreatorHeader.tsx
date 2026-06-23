import Image from "next/image";
import Link from "next/link";
import { Bell, Search, Wallet } from "lucide-react";
import { CREATOR_AVATAR } from "@/data/products";

type CreatorHeaderProps = {
  userName?: string;
  avatarUrl?: string;
  walletBalance?: string;
};

export function CreatorHeader({
  userName = "Alex Rivera",
  avatarUrl = CREATOR_AVATAR,
  walletBalance = "$1,240.00",
}: CreatorHeaderProps) {
  return (
    <header className="fixed top-0 right-0 z-40 flex h-16 w-[calc(100%-240px)] items-center justify-between border-b border-[var(--border-outline)] bg-[var(--bg-header)] px-6">
      <div className="flex max-w-xl flex-1 items-center gap-4">
        <div className="relative w-full">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-[var(--text-muted-variant)]" />
          <input
            type="text"
            placeholder="Search brands, products..."
            className="w-full rounded-full border border-[var(--border-outline)] bg-[var(--bg-input-field)] py-2 pr-4 pl-10 text-sm text-[var(--text-on-surface)] outline-none transition-all placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-violet-light)] focus:ring-1 focus:ring-[var(--accent-violet-light)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="relative cursor-pointer rounded-full p-2 transition-colors hover:bg-[var(--bg-hover)] active:opacity-80"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-[var(--accent-violet-light)]" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="hidden items-center gap-2 rounded-full border border-[var(--border-outline)] bg-[var(--bg-input-field)] px-3 py-1.5 md:flex">
          <Wallet className="h-4 w-4 text-[var(--accent-violet-light)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{walletBalance}</span>
        </div>

        <Link
          href="/creator/profile"
          className="flex items-center gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-[var(--bg-hover)]"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{userName}</p>
            <p className="text-xs text-[var(--text-secondary)]">Pro Creator</p>
          </div>

          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[var(--accent-violet)]/40 transition-all hover:border-[var(--accent-violet-light)]">
            <Image
              src={avatarUrl}
              alt={userName}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
