import Link from "next/link";
import { Check } from "lucide-react";

const creatorFeatures = [
  "High-commission product catalog",
  "Dedicated relation management",
  "Personalized growth analytics",
];

const brandFeatures = [
  "Pay only for verified sales",
  "Real-time creator performance data",
  "Direct-to-creator messaging portal",
];

export function ValueProposition() {
  return (
    <section id="brands" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 lg:p-10">
            <h3
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Made for Creators
            </h3>
            <p className="mt-2 text-sm text-muted">
              Build your brand with the products you love.
            </p>
            <ul className="mt-8 space-y-4">
              {creatorFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-lime)]/20">
                    <Check className="h-3 w-3 text-[var(--accent-lime)]" />
                  </div>
                  <span className="text-sm text-[var(--feature-text)]">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 inline-block w-full rounded-xl bg-[var(--accent-violet-light)] py-3.5 text-center text-sm font-semibold text-[var(--accent-violet-on-dark)] transition-opacity hover:opacity-90"
            >
              Start Earning Now
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 lg:p-10">
            <h3
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Made for Brands
            </h3>
            <p className="mt-2 text-sm text-muted">
              Scale your brand with high-performing creators.
            </p>
            <ul className="mt-8 space-y-4">
              {brandFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-lime)]/20">
                    <Check className="h-3 w-3 text-[var(--accent-lime)]" />
                  </div>
                  <span className="text-sm text-[var(--feature-text)]">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 inline-block w-full rounded-xl border border-[var(--hero-border)] py-3.5 text-center text-sm font-semibold text-white transition-colors hover:border-[var(--hero-border-hover)] hover:bg-[var(--hero-ghost-hover)]"
            >
              Apply to List Brand
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
