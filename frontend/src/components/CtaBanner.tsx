import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--accent-violet)] px-8 py-16 text-center lg:px-16 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="relative">
            <h2
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Ready to turn views into revenue?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/70">
              Join thousands of creators and brands building the future of
              commerce on Creatorly.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-[var(--cta-banner-btn-bg)] px-8 py-3.5 text-sm font-semibold text-[var(--cta-banner-btn-text)] transition-opacity hover:opacity-90"
              >
                Sign up as a Creator
              </Link>
              <Link
                href="/signup"
                className="rounded-xl border border-[var(--cta-banner-ghost-border)] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--cta-banner-ghost-hover)]"
              >
                List Your Brand
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
