import Link from "next/link";

const footerLinks = {
  Platform: ["For Creators", "For Brands"],
  Company: ["About Us", "Careers"],
  Legal: ["Terms of Service", "Privacy Policy"],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--navbar-border)] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="text-xl font-bold text-white">
              Creatorly
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Building the financial infrastructure for the next generation of
              digital entrepreneurs and creator-led commerce.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold tracking-wider text-white uppercase">
                {category}
              </h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--navbar-border)] pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            &copy; 2024 Creatorly Ecosystem Inc.
          </p>
          <p className="text-xs text-[var(--footer-muted)]">
            Proudly built with ❤️ for creators everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
