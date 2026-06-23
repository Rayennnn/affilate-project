"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Link2,
  Wallet,
  Settings,
} from "lucide-react";

const navItems = [
  {
    href: "/creator/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: false,
  },
  {
    href: "/creator/browse-products",
    label: "Browse Products",
    icon: Search,
    exact: false,
  },
  { href: "/creator/links", label: "My Links", icon: Link2, exact: false },
  { href: "/creator/earnings", label: "Earnings", icon: Wallet, exact: false },
  {
    href: "/creator/settings",
    label: "Settings",
    icon: Settings,
    exact: false,
  },
];

export function CreatorSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="fixed top-0 left-0 z-50 flex h-full w-[240px] flex-col border-r border-[var(--border-outline)] bg-[var(--bg-sidebar)] py-6">
      <div className="mb-10 px-6">
        <Link href="/creator/browse-products">
          <h1
            className="text-2xl font-bold text-[var(--accent-violet-light)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Creatorly
          </h1>
        </Link>
        <p className="mt-1 text-xs font-semibold tracking-wider text-[var(--text-muted-variant)] uppercase">
          Creator Ecosystem
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 active:scale-95 ${
                active
                  ? "border-l-4 border-[var(--accent-violet-light)] bg-[var(--bg-hover)] text-[var(--accent-violet-light)]"
                  : "border-l-4 border-transparent text-[var(--text-muted-variant)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-on-surface)]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4">
        <div className="rounded-xl border border-[var(--border-outline)] bg-[var(--bg-hover)] p-4">
          <p className="mb-2 text-xs font-semibold text-[var(--text-muted-variant)]">
            Current Balance
          </p>
          <p
            className="text-2xl font-semibold text-[var(--accent-lime-bright)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            $12,450.80
          </p>
        </div>
      </div>
    </aside>
  );
}
