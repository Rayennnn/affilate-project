import { TrendingUp } from "lucide-react";
import { ProductCard } from "@/components/creator/ProductCard";
import { ProductFilters } from "@/components/creator/ProductFilters";
import { Pagination } from "@/components/creator/Pagination";
import { products } from "@/data/products";

export function BrowseProductsContent() {
  return (
    <>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2
            className="text-[32px] leading-10 font-bold tracking-wide text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Marketplace
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            Discover high-commission products for your audience
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-4 rounded-xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-4">
            <span className="rounded-lg bg-[var(--accent-lime-bg)] p-2">
              <TrendingUp className="h-5 w-5 text-[var(--accent-lime-bright)]" />
            </span>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Avg. Commission</p>
              <p
                className="text-xl font-semibold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                18.5%
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProductFilters />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Pagination />
    </>
  );
}
