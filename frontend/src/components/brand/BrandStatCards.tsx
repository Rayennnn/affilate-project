import { DollarSign, ShoppingCart, Users, Clock } from "lucide-react";
import type { BrandStat } from "@/lib/brand-dashboard";

const icons = [DollarSign, ShoppingCart, Users, Clock];

export function BrandStatCards({ stats }: { stats: BrandStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = icons[index] ?? DollarSign;
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
