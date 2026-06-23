import { Building2, Link2, TrendingUp } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Building2,
    title: "Brands list products",
    description:
      "Partner brands upload their catalog with custom commission rates and campaign briefs.",
    visual: (
      <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
        <div className="space-y-2">
          {["Wireless Headphones", "Ergonomic Chair", "Smart Watch"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-lg bg-[var(--bg-input)] px-3 py-2 text-xs text-muted"
            >
              <span>{item}</span>
              <span className="font-semibold text-[var(--accent-lime)]">15%</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "02",
    icon: Link2,
    title: "Creators generate link",
    description:
      "Browse the marketplace, pick products you love, and get your unique trackable affiliate link.",
    visual: (
      <div className="mt-6 flex flex-col items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-violet)]/20">
          <span className="text-2xl font-bold text-[var(--accent-violet-light)]">$</span>
        </div>
        <button
          type="button"
          className="rounded-lg bg-[var(--accent-violet)] px-5 py-2 text-sm font-semibold text-white"
        >
          Generate Link
        </button>
      </div>
    ),
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Earn on every sale",
    description:
      "Share your link, drive sales, and watch commissions roll in with real-time tracking.",
    visual: (
      <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
        <div className="flex h-24 items-end gap-1">
          {[20, 35, 30, 50, 45, 70, 65, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-[var(--accent-lime)]"
              style={{ height: `${h}%`, opacity: 0.6 + i * 0.05 }}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-xs font-semibold text-[var(--accent-lime)]">
          +24% this week
        </p>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="products" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            How Creatorly Works
          </h2>
          <p className="mt-4 text-base text-muted">
            Three simple steps to start earning from the content you already
            create.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <span
                className="pointer-events-none absolute -top-4 left-0 text-[80px] leading-none font-bold text-[var(--step-number)] select-none"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {step.num}
              </span>
              <div className="relative pt-12">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <step.icon className="h-5 w-5 text-[var(--accent-violet-light)]" />
                </div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
