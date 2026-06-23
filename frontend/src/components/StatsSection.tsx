const stats = [
  { value: "$284k+", label: "Creator Earnings This Month" },
  { value: "2,400+", label: "Verified Active Creators" },
  { value: "180+", label: "Global Partner Brands" },
];

export function StatsSection() {
  return (
    <section className="border-y border-[var(--navbar-border)] bg-[var(--bg-surface)] py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 sm:grid-cols-3 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p
              className="text-4xl font-bold text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
