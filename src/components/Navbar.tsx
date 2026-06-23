import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = ["Products", "Brands", "Creator Stories", "Resources"];

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--navbar-border)] bg-[var(--navbar-bg)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Creatorly
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-muted transition-colors hover:text-white"
            >
              {link}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden text-sm text-muted transition-colors hover:text-white sm:block"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[var(--accent-violet)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
