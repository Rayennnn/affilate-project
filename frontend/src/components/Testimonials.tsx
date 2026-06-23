const testimonials = [
  {
    name: "Elena Rosa",
    handle: "@elenarosa",
    avatar: "ER",
    avatarBg: "bg-gradient-to-br from-pink-500 to-purple-600",
    quote:
      "Creatorly completely changed how I monetize my content. The automated payouts are incredible.",
    featured: false,
  },
  {
    name: "Marcus Chen",
    handle: "@marcuscreates",
    avatar: "MC",
    avatarBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    quote:
      "I've tried every affiliate platform. Creatorly's conversion rates and brand deals are unmatched.",
    featured: true,
  },
  {
    name: "Sofia Laurent",
    handle: "@sofialive",
    avatar: "SL",
    avatarBg: "bg-gradient-to-br from-orange-500 to-rose-500",
    quote:
      "The dashboard is beautiful and payouts are always on time. I recommend it to every creator.",
    featured: false,
  },
];

export function Testimonials() {
  return (
    <section id="creator-stories" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2
          className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Word on the Street
        </h2>

        <div className="mt-16 grid gap-6 md:grid-cols-3 md:items-center">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className={`rounded-2xl p-8 ${
                item.featured
                  ? "border border-[var(--accent-violet)] bg-[var(--accent-violet)] shadow-[0_0_40px_var(--shadow-color)] md:scale-105"
                  : "border border-[var(--border-subtle)] bg-[var(--bg-card)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white ${item.avatarBg}`}
                >
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p
                    className={`text-xs ${item.featured ? "text-white/70" : "text-muted"}`}
                  >
                    {item.handle}
                  </p>
                </div>
              </div>
              <p
                className={`mt-5 text-sm leading-relaxed ${
                  item.featured ? "text-white/90" : "text-[var(--testimonial-text)]"
                }`}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
