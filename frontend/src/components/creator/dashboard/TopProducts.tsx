import { TrendingUp } from "lucide-react";
import type { TopProduct } from "@/lib/creator-dashboard";

export function TopProducts({ products }: { products: TopProduct[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
      <div className="mb-5 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-[var(--accent-lime-bright)]" />
        <h3
          className="text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Top Products
        </h3>
      </div>

      {products.length === 0 && (
        <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
          No sales data yet.
        </p>
      )}

      <ul className="space-y-4">
        {products.map((product) => (
          <li key={product.rank} className="flex items-start gap-3">
            <span
              className="text-lg font-bold text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {product.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--text-primary)]">{product.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {product.category} · {product.revenue}
              </p>
            </div>
            <span
              className={`shrink-0 text-sm font-medium ${
                product.positive ? "text-[var(--accent-lime-bright)]" : "text-red-400"
              }`}
            >
              {product.change}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-6 w-full cursor-pointer rounded-xl border border-[var(--border-outline)] py-2.5 text-sm font-medium text-[var(--text-on-surface)] transition-colors hover:border-[var(--accent-violet-soft)] hover:text-[var(--accent-violet-light)] active:opacity-80"
      >
        View Detailed Leaderboard
      </button>
    </div>
  );
}
