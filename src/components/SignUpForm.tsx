"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Zap, Package, Check, Sparkles } from "lucide-react";
import { GoogleIcon, TwitterIcon } from "@/components/AuthIcons";
import { getDashboardPath, type UserRole } from "@/lib/auth-redirect";

export function SignUpForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("creator");
  const [agreed, setAgreed] = useState(false);
  const [password, setPassword] = useState("");

  const passwordStrength = Math.min(
    100,
    (password.length / 12) * 100 + (/\d/.test(password) ? 15 : 0) + (/[A-Z]/.test(password) ? 15 : 0)
  );

  const goToDashboard = () => {
    router.push(getDashboardPath(role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    goToDashboard();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-12">
      <div className="relative z-10 w-full max-w-[520px]">
        <div className="pointer-events-none absolute -top-8 left-1/2 h-32 w-[80%] -translate-x-1/2 rounded-full bg-[var(--auth-glow)] blur-3xl" />

        <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-auth-card-alt)] p-8 shadow-2xl sm:p-10">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-violet)]">
                <Sparkles className="h-4 w-4 text-[var(--accent-violet-on)]" />
              </div>
              <span className="text-lg font-bold text-white">Creatorly</span>
            </Link>
          </div>

          <h1 className="text-center text-2xl font-bold text-white sm:text-[28px]">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            Join thousands of creators and brands already earning
          </p>

          {/* Activity badge */}
          <div className="mt-5 flex justify-center">
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--accent-lime)]/30 bg-[var(--accent-lime)]/5 px-3.5 py-1.5">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-medium text-lime">
                47 creators joined this week
              </span>
            </div>
          </div>

          {/* Role selection cards */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("creator")}
              className={`relative rounded-xl border p-4 text-left transition-all ${
                role === "creator"
                  ? "border-[var(--accent-violet)] bg-[var(--accent-violet)]/10"
                  : "border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] hover:border-[var(--border-hover)]"
              }`}
            >
              {role === "creator" && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-violet)]">
                  <Check className="h-3 w-3 text-[var(--accent-violet-on)]" strokeWidth={3} />
                </div>
              )}
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
                  role === "creator" ? "bg-[var(--role-active-bg)]" : "bg-[var(--role-inactive-bg)]"
                }`}
              >
                <Zap
                  className={`h-4 w-4 ${role === "creator" ? "text-white" : "text-muted"}`}
                />
              </div>
              <span
                className={`text-sm font-medium leading-snug ${
                  role === "creator" ? "text-white" : "text-muted"
                }`}
              >
                I&apos;m a Creator / Influencer
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("brand")}
              className={`relative rounded-xl border p-4 text-left transition-all ${
                role === "brand"
                  ? "border-[var(--accent-violet)] bg-[var(--accent-violet)]/10"
                  : "border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] hover:border-[var(--border-hover)]"
              }`}
            >
              {role === "brand" && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-violet)]">
                  <Check className="h-3 w-3 text-[var(--accent-violet-on)]" strokeWidth={3} />
                </div>
              )}
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
                  role === "brand" ? "bg-[var(--role-active-bg)]" : "bg-[var(--role-inactive-bg)]"
                }`}
              >
                <Package
                  className={`h-4 w-4 ${role === "brand" ? "text-white" : "text-muted"}`}
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  role === "brand" ? "text-white" : "text-muted"
                }`}
              >
                I&apos;m a Brand
              </span>
            </button>
          </div>

          {/* Form */}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-muted"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-muted"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="handle"
                className="mb-2 block text-sm font-medium text-muted"
              >
                {role === "creator" ? "Creator Handle" : "Brand Name"}
              </label>
              <input
                id="handle"
                type="text"
                placeholder={role === "creator" ? "@yourcreator" : "Your Brand"}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-muted"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-muted)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-muted"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-muted)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                />
              </div>
            </div>

            {/* Password strength bar */}
            <div className="h-1 overflow-hidden rounded-full bg-[var(--border-subtle)]">
              <div
                className="h-full rounded-full bg-[var(--accent-violet)] transition-all duration-300"
                style={{ width: `${password ? passwordStrength : 50}%` }}
              />
            </div>

            {/* Terms checkbox */}
            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--checkbox-border)] bg-[var(--bg-auth-inner)] accent-[var(--accent-violet)]"
              />
              <span className="text-sm text-muted">
                I agree to the{" "}
                <Link
                  href="#terms"
                  className="text-[var(--accent-violet-soft)] transition-colors hover:text-[var(--accent-violet-hover)]"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#privacy"
                  className="text-[var(--accent-violet-soft)] transition-colors hover:text-[var(--accent-violet-hover)]"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={!agreed}
              className="w-full rounded-xl bg-[var(--accent-violet)] py-3.5 text-sm font-semibold text-[var(--accent-violet-on)] shadow-[0_4px_24px_var(--auth-shadow)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg-auth-card-alt)] px-3 text-xs font-medium tracking-wider text-muted uppercase">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={goToDashboard}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--social-hover-bg)]"
            >
              <GoogleIcon />
              Google
            </button>
            <button
              type="button"
              onClick={goToDashboard}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--social-hover-bg)]"
            >              <TwitterIcon />
              Twitter / X
            </button>
          </div>

          {/* Login link */}
          <p className="mt-8 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--accent-violet-soft)] transition-colors hover:text-[var(--accent-violet-hover)]"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
