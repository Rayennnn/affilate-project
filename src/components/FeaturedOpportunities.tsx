import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";

const featured = [
  {
    id: "1",
    brand: "LUMORA",
    name: "Cloud Ergonomic Chair",
    commission: 15,
    avgSale: "$450.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAb9R0oRaP-lVMvokYtSoxOqv-p7vowYzJr8Grl0El0GPIGv7GTpSJA4Z3XA8tl1XU3dfG9VjKr_SCbWh8ZrJ1ulFaoTbHGxCsawVq5rJT6crj5OPUZ6iZ0ityctJv8X0VU8VJdSw9NLHwTeET4BjHG7pQwUr7AmthZk6qOumFg0ZhCBWZdYvA6upQy5Q7NaBHxpdEpufNl-9aoVS3-BiNHdf0FiQJxwajOZqJRFQ5q12X9X_VzsRxKabwX9KbCDl2l_8h7bEwgoi08",
  },
  {
    id: "2",
    brand: "SONIC LABS",
    name: "Elite Wireless ANC",
    commission: 12,
    avgSale: "$299.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkiBTyt67XvIn06frVUpx8Ii8NK2V7q6KXuGAEgUGfpYIMAKWhVhAF7zKIy_EkceoSwF6BtRUpkvSgiY4bLLWeb85NoosLuvT2x7pIjRNcVoSt-u89XUZph-TAX9p-6wjOJ0xmdBQBNZpIjVnyg9MIySaTOnsRdbg7XdvKxnPheJRQhF__Vi7edBUkcF4rfNqc4YptHgFayNj0zePoeKVB6BLWOkOyR6HAUoEui_6xbwK8BXFRft4c7Y-PuplRm1_6tTS8nKeOG1a7",
  },
];

export function FeaturedOpportunities() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <h2
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Featured Opportunities
          </h2>
          <Link
            href="/creator/browse-products"
            className="flex items-center gap-1 text-sm font-medium text-[var(--accent-violet-light)] transition-colors hover:text-[var(--accent-violet-soft)]"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {featured.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="relative p-5">
                <p className="text-xs font-medium tracking-wider text-muted uppercase">
                  {product.brand}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-center gap-3">
                  <span className="rounded-full bg-[var(--accent-violet)]/20 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent-violet-light)]">
                    {product.commission}% commission
                  </span>
                  <span className="text-sm text-muted">
                    Avg Sale: {product.avgSale}
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute right-5 bottom-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-violet)] text-white transition-opacity hover:opacity-90"
                  aria-label="Add product"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
