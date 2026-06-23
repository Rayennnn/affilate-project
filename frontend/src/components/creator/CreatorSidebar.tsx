"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Link2,
  Wallet,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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
    href: "/creator/profile",
    label: "Profile",
    icon: User,
    exact: false,
  },
  {
    href: "/creator/settings",
    label: "Settings",
    icon: Settings,
    exact: false,
  },
];

export function CreatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="fixed top-0 left-0 z-50 flex h-full w-[240px] flex-col border-r border-[var(--border-outline)] bg-[var(--bg-sidebar)] py-6">
      <div className="mb-10 px-6">
        <Link href="/creator/dashboard">
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

      <div className="mt-auto px-4 pb-6">
        <div className="mb-4 rounded-xl border border-[var(--accent-violet)]/30 bg-[var(--bg-hover)] p-4">
          <p className="mb-1 text-xs font-bold tracking-wider text-[var(--accent-violet-light)] uppercase">
            Pro Plan
          </p>
          <p className="text-sm text-[var(--text-muted-variant)]">Access advanced analytics.</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-muted-variant)] transition-all duration-200 hover:bg-[var(--bg-hover)] hover:text-red-400 active:scale-95"
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span className="text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}
