const brands = [
  "LUMORA",
  "SONIC LABS",
  "AURA",
  "VANTAGE",
  "MEDTECH",
  "ZENITH",
  "VELOCITY",
  "ARCANE",
  "PRISM",
  "NOVA",
  "ELEMENT",
  "ORBIT",
];

export function BrandLogos() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-10 text-center text-xs font-medium tracking-[0.2em] text-muted uppercase">
          Trusted by the world&apos;s best brands
        </p>
        <div className="grid grid-cols-3 gap-x-8 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-center text-sm font-bold tracking-wide text-[var(--brand-logo-text)]"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
