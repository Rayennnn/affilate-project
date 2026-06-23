import Image from "next/image";
import { Flame } from "lucide-react";
import type { Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-card-hover group overflow-hidden rounded-xl border border-[var(--border-outline)] bg-[var(--bg-card)] transition-all duration-300">
      <div className="relative h-56 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.hot && (
          <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-[var(--accent-lime-bright)] px-3 py-1 text-xs font-bold text-[var(--accent-lime-on)] shadow-lg">
            <Flame className="h-3.5 w-3.5 fill-[var(--accent-lime-on)]" />
            Hot
          </div>
        )}
        <div className="absolute top-4 right-4 rounded-full bg-[var(--accent-violet)]/90 px-3 py-1 text-xs font-bold text-[var(--accent-violet-on)] shadow-lg backdrop-blur-md">
          {product.commission}% Commission
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center overflow-hidden rounded p-1 ${product.brandLogoBg}`}
          >
            <Image
              src={product.brandLogo}
              alt={product.brand}
              width={24}
              height={24}
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xs font-medium tracking-tight text-[var(--text-secondary)] uppercase">
            {product.brand}
          </span>
        </div>

        <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-violet-light)]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="text-[var(--text-secondary)]">
            <span className="block text-xs">Market Price</span>
            <span className="font-bold text-[var(--text-primary)]">{product.price}</span>
          </div>
          <button
            type="button"
            className="rounded-lg border border-[var(--accent-violet-light)]/20 bg-[var(--accent-violet-light)]/10 px-4 py-2 text-sm font-medium text-[var(--accent-violet-light)] transition-all hover:bg-[var(--accent-violet)] hover:text-[var(--accent-violet-on)] active:scale-95"
          >
            Get Affiliate Link
          </button>
        </div>
      </div>
    </div>
  );
}
