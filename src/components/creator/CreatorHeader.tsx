import Image from "next/image";
import { Bell, Search } from "lucide-react";
import { CREATOR_AVATAR } from "@/data/products";
import { ThemeToggle } from "@/components/ThemeToggle";

export function CreatorHeader() {
  return (
    <header className="fixed top-0 right-0 z-40 flex h-16 w-[calc(100%-240px)] items-center justify-between border-b border-[var(--border-outline)] bg-[var(--bg-header)] px-6">
      <div className="flex max-w-xl flex-1 items-center gap-4">
        <div className="relative w-full">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-[var(--text-muted-variant)]" />
          <input
            type="text"
            placeholder="Search brands or products..."
            className="w-full rounded-full border border-[var(--border-outline)] bg-[var(--bg-input-field)] py-2 pr-4 pl-10 text-sm text-[var(--text-on-surface)] outline-none transition-all placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-violet-light)] focus:ring-1 focus:ring-[var(--accent-violet-light)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button
          type="button"
          className="cursor-pointer rounded-full p-2 transition-colors hover:bg-[var(--bg-hover)] active:opacity-80"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-[var(--accent-violet-light)]" />
        </button>
        <div className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-[var(--accent-violet-light)]/30 transition-all active:opacity-80">
          <Image
            src={CREATOR_AVATAR}
            alt="Creator profile"
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
