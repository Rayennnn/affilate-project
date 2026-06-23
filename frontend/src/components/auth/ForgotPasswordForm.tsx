"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Lock, Mail, Loader2, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthBackground } from "@/components/auth/AuthBackground";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      setIsSuccess(true);
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) {
      setError(error.message);
    }
    setIsSubmitting(false);
  };

  const openEmailClient = (client: "gmail" | "outlook") => {
    if (client === "gmail") {
      window.open("https://mail.google.com", "_blank");
    } else {
      window.open("https://outlook.live.com", "_blank");
    }
  };

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
              <Lock className="h-7 w-7 text-[var(--accent-violet-light)]" />
            </div>

            <h1 className="text-center text-2xl font-bold text-white">
              Forgot your password?
            </h1>
            <p className="mt-3 text-center text-sm text-muted">
              No worries. Enter your email and we'll send you a reset link.
            </p>

            {/* Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold tracking-wider text-muted uppercase"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--placeholder-muted)]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@creator.com"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] pl-11 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] py-3.5 text-sm font-bold tracking-wide text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Check Email Icon */}
            <div className="mx-auto mb-6 relative flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] shadow-sm">
              <Mail className="h-7 w-7 text-white" />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#7C3AED] border-2 border-[var(--bg-auth-card)]">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>

            <h1 className="text-center text-2xl font-bold text-white">
              Check your inbox
            </h1>
            <p className="mt-3 text-center text-sm text-muted">
              We sent a password reset link to
              <br />
              <span className="text-[var(--accent-violet-light)] font-medium">{email}</span>
            </p>

            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-3 py-1.5 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" />
                Link expires in 15m
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => openEmailClient("gmail")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] py-3 text-sm font-medium text-white transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]"
              >
                <Mail className="h-4 w-4" />
                Open Gmail
              </button>
              <button
                type="button"
                onClick={() => openEmailClient("outlook")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] py-3 text-sm font-medium text-white transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]"
              >
                <span className="font-bold text-base">@</span>
                Open Outlook
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-muted">
              Didn't receive it?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isSubmitting}
                className="font-medium text-[var(--accent-violet-light)] hover:text-[var(--accent-violet-hover)] transition-colors disabled:opacity-50"
              >
                Resend Email
              </button>
            </div>
          </>
        )}

        {/* Common Back to Login */}
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 w-full px-6 flex flex-col items-center justify-between gap-4 text-xs text-muted sm:flex-row sm:bottom-8 sm:px-8">
        <p>© 2024 CreatorMarket Ecosystem. All rights reserved.</p>
        <div className="flex gap-6 font-medium">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
        </div>
      </div>
    </div>
  );
}
