import { Wallet, MousePointerClick, ShoppingCart, Link2 } from "lucide-react";
import type { StatCard } from "@/lib/creator-dashboard";

const icons = [Wallet, MousePointerClick, ShoppingCart, Link2];

export function StatCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = icons[index] ?? Wallet;
        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-5"
          >
            <div className="mb-4 flex items-start justify-between">
              <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
              <span className="rounded-lg bg-[var(--bg-hover)] p-2">
                <Icon className="h-5 w-5 text-[var(--accent-violet-soft)]" strokeWidth={2} />
              </span>
            </div>
            <div className="flex items-end justify-between">
              <p
                className="text-3xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {stat.value}
              </p>
              {stat.change && (
                <span
                  className={`text-sm font-medium ${
                    stat.change.positive ? "text-[var(--accent-lime-bright)]" : "text-red-400"
                  }`}
                >
                  {stat.change.value}
                </span>
              )}
              {stat.status && (
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {stat.status}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
