"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { KeyRound, CheckCircle2, Loader2, Eye, EyeOff, Circle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthBackground } from "@/components/auth/AuthBackground";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const reqs = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const strengthCount = Object.values(reqs).filter(Boolean).length;
  let strengthLabel = "Weak";
  let strengthColor = "bg-red-500";
  if (strengthCount === 4) {
    strengthLabel = "Strong";
    strengthColor = "bg-emerald-500";
  } else if (strengthCount >= 2) {
    strengthLabel = "Medium";
    strengthColor = "bg-yellow-500";
  }
  if (password.length === 0) {
    strengthColor = "bg-[var(--bg-auth-inner)]";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strengthCount < 4) {
      setError("Please meet all password requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      setIsSuccess(true);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <AuthBackground />

      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 z-10 sm:top-8 sm:left-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-violet)]">
            <div className="h-2 w-2 rounded-full bg-[var(--accent-violet-on)]" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            CreatorMarket
          </span>
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-auth-card)] p-8 shadow-2xl">
        {!isSuccess ? (
          <>
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] shadow-sm">
              <KeyRound className="h-7 w-7 text-[var(--accent-violet-light)]" />
            </div>

            <h1 className="text-center text-2xl font-bold text-white">
              Set new password
            </h1>
            <p className="mt-3 text-center text-sm text-muted">
              Must be different from your previous password.
            </p>

            {/* Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                  {error}
                </div>
              )}
              
              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wider text-muted uppercase">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 pr-11 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-muted)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition-colors hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Password strength</span>
                  <span className={password.length === 0 ? "text-muted" : "text-white"}>{password.length === 0 ? "" : strengthLabel}</span>
                </div>
                <div className="flex gap-2">
                  <div className={`h-1 flex-1 rounded-full ${password.length > 0 ? strengthColor : "bg-[var(--bg-auth-inner)]"}`} />
                  <div className={`h-1 flex-1 rounded-full ${strengthCount >= 2 ? strengthColor : "bg-[var(--bg-auth-inner)]"}`} />
                  <div className={`h-1 flex-1 rounded-full ${strengthCount === 4 ? strengthColor : "bg-[var(--bg-auth-inner)]"}`} />
                </div>
                <div className="space-y-2 mt-4">
                  {[
                    { met: reqs.length, text: "At least 8 characters" },
                    { met: reqs.upper, text: "At least one uppercase letter" },
                    { met: reqs.number, text: "At least one number" },
                    { met: reqs.special, text: "One special character (@$!%*?&)" },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted">
                      {req.met ? (
                        <CheckCircle className="h-4 w-4 text-[var(--accent-violet-light)]" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      <span className={req.met ? "text-white" : ""}>{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wider text-muted uppercase">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 pr-11 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-muted)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition-colors hover:text-[var(--text-primary)]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || strengthCount < 4 || !password || !confirmPassword}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] py-3.5 text-sm font-bold tracking-wide text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7C3AED] shadow-[0_0_24px_rgba(124,58,237,0.3)]">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-center text-2xl font-bold text-white">
              Password reset!
            </h1>
            <p className="mt-3 text-center text-sm text-muted">
              Your password has been successfully updated.
            </p>

            <div className="mt-8 text-center">
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-muted uppercase">
                Redirecting now...
              </p>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] py-3.5 text-sm font-medium text-white transition-colors"
              >
                Go to Login now →
              </Link>
            </div>
            
            <div className="mt-8 text-center text-xs text-muted">
              Having trouble? <Link href="#" className="font-medium text-white hover:underline border-b border-white pb-0.5">Contact support</Link>
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      {!isSuccess && (
        <div className="absolute bottom-6 w-full px-6 flex flex-col items-center justify-between gap-4 text-xs text-muted sm:flex-row sm:bottom-8 sm:px-8">
          <p>© 2024 CreatorMarket Ecosystem. All rights reserved.</p>
          <div className="flex gap-6 font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
          </div>
        </div>
      )}
      {isSuccess && (
        <div className="absolute bottom-6 w-full text-center text-xs text-muted">
          <p>© 2024 CreatorMarket Ecosystem. All rights reserved.</p>
        </div>
      )}
    </div>
  );
}
