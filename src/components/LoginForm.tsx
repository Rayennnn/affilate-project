"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GoogleIcon, TwitterIcon } from "@/components/AuthIcons";
import { getDashboardPath, type UserRole } from "@/lib/auth-redirect";

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("creator");
  const [showPassword, setShowPassword] = useState(false);

  const goToDashboard = () => {
    router.push(getDashboardPath(role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToDashboard();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Background grid */}
      <div className="login-grid pointer-events-none absolute inset-0" />

      {/* Blurred dashboard shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[12%] left-[8%] h-32 w-56 rounded-2xl bg-[var(--blur-shape)] blur-sm" />
        <div className="absolute top-[18%] right-[10%] h-24 w-40 rounded-2xl bg-[var(--blur-shape)] blur-sm" />
        <div className="absolute bottom-[20%] left-[12%] h-28 w-48 rounded-2xl bg-[var(--blur-shape)] blur-sm" />
        <div className="absolute right-[15%] bottom-[28%] h-20 w-36 rounded-2xl bg-[var(--blur-shape)] blur-sm" />
        <div className="absolute top-[35%] left-[20%] h-16 w-28 rounded-xl bg-[var(--blur-shape)] blur-sm" />
        <div className="absolute top-[42%] right-[22%] h-14 w-24 rounded-xl bg-[var(--blur-shape)] blur-sm" />
      </div>

      {/* Earned today badge */}
      <div className="absolute top-6 right-6 z-10 sm:top-8 sm:right-8">
        <div className="flex items-center gap-2 rounded-full border border-[var(--accent-lime)]/30 bg-[var(--accent-lime)]/10 px-4 py-2 shadow-[0_0_24px_var(--accent-lime-glow)]">
          <span className="text-sm">💸</span>
          <span className="text-sm font-semibold text-lime">
            $12,430 earned today
          </span>
        </div>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-auth-card)] p-8 shadow-2xl">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-violet)]">
              <div className="h-2 w-2 rounded-full bg-[var(--accent-violet-on)]" />
            </div>
            <span className="text-lg font-bold text-white">Creatorly</span>
          </Link>
        </div>

        <h1 className="text-center text-2xl font-bold text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Log in to your account to continue
        </p>

        {/* Role toggle */}
        <div className="mt-8 flex rounded-xl border border-[var(--border-faint)] bg-[var(--bg-auth-inner)] p-1">
          <button
            type="button"
            onClick={() => setRole("creator")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              role === "creator"
                ? "bg-[var(--accent-violet)] text-[var(--accent-violet-on)] shadow-sm"
                : "text-muted hover:text-[var(--text-primary)]"
            }`}
          >
            I&apos;m a Creator
          </button>
          <button
            type="button"
            onClick={() => setRole("brand")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              role === "brand"
                ? "bg-[var(--accent-violet)] text-[var(--accent-violet-on)] shadow-sm"
                : "text-muted hover:text-[var(--text-primary)]"
            }`}
          >
            I&apos;m a Brand
          </button>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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
              placeholder="name@creatorly.com"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-muted"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 pr-11 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-muted)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition-colors hover:text-[var(--text-primary)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link
                href="#forgot-password"
                className="text-sm text-[var(--accent-violet-soft)] transition-colors hover:text-[var(--accent-violet-hover)]"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--accent-violet)] py-3.5 text-sm font-semibold text-[var(--accent-violet-on)] transition-opacity hover:opacity-90"
          >
            Log In
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-subtle)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[var(--bg-auth-card)] px-3 text-xs font-medium tracking-wider text-muted uppercase">
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
          >            <TwitterIcon />
            Twitter
          </button>
        </div>

        {/* Sign up link */}
        <p className="mt-8 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[var(--accent-violet-soft)] transition-colors hover:text-[var(--accent-violet-hover)]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}