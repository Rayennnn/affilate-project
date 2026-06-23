import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

const avatars = [
  { bg: "bg-purple-500", initials: "ER" },
  { bg: "bg-pink-500", initials: "MK" },
  { bg: "bg-blue-500", initials: "JL" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-0 lg:pt-36">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-[var(--accent-violet)]/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-[var(--accent-lime)]/30 bg-[var(--accent-lime)]/10 px-4 py-1.5">
              <span className="text-xs font-semibold tracking-wider text-[var(--accent-lime)] uppercase">
                The new way to partner
              </span>
            </div>

            <h1
              className="text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[1.1]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Your Content. Their Sales. Your{" "}
              <span className="bg-gradient-to-r from-[var(--accent-lime)] to-[#d9f99d] bg-clip-text text-transparent">
                Commission.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted lg:text-lg">
              The ultimate ecosystem for ambitious digital entrepreneurs. Secure
              direct brand deals, track every click, and automate your earnings
              in real-time.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-violet)] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Sign up as a Creator
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="rounded-xl border border-[var(--hero-border)] bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-[var(--hero-border-hover)] hover:bg-[var(--hero-ghost-hover)]"
              >
                List Your Brand
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.initials}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--bg-page)] text-xs font-semibold text-white ${avatar.bg}`}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted">
                Join{" "}
                <span className="font-semibold text-white">2,400+ creators</span>{" "}
                already earning.
              </p>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="glow-purple rotate-[-4deg] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted uppercase">
                    Performance
                  </span>
                  <span className="rounded-full bg-[var(--accent-lime)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--accent-lime)]">
                    Live
                  </span>
                </div>
                <div className="flex h-32 items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-[var(--accent-violet)]/60"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[var(--hero-panel-bg)] p-3">
                    <p className="text-xs text-muted">Clicks</p>
                    <p className="text-lg font-bold text-white">18.4k</p>
                  </div>
                  <div className="rounded-lg bg-[var(--hero-panel-bg)] p-3">
                    <p className="text-xs text-muted">Conv. Rate</p>
                    <p className="text-lg font-bold text-white">4.2%</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-xl sm:-left-8">
                <p className="text-xs font-medium text-muted uppercase">
                  Total Sales
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">$12,450.00</p>
                  <TrendingUp className="h-4 w-4 text-[var(--accent-lime)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustBar() {
  const items = [
    "Trusted by over 5k+ creators",
    "100% commission tracking",
    "24/7 dedicated support",
    "Secure payout guarantee",
  ];

  return (
    <section className="mt-16 border-y border-[var(--navbar-border)] bg-[var(--bg-surface)] py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 lg:px-8">
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-2 text-sm text-muted before:h-1 before:w-1 before:rounded-full before:bg-[var(--accent-lime)] first:before:hidden"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
