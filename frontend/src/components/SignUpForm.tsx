"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Zap, Package, Check, Sparkles, Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/AuthIcons";
import { getDashboardPath, type UserRole } from "@/lib/auth-redirect";
import { supabase } from "@/lib/supabase";

export function SignUpForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("creator");
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Creator-specific profile fields.
  const [niche, setNiche] = useState("");
  const [bio, setBio] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [audienceSize, setAudienceSize] = useState("");

  // Brand-specific store fields.
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [description, setDescription] = useState("");
  const [gtmId, setGtmId] = useState("");

  const passwordStrength = Math.min(
    100,
    (password.length / 12) * 100 + (/\d/.test(password) ? 15 : 0) + (/[A-Z]/.test(password) ? 15 : 0)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Role-specific required fields — fill the brands/creators row with real
    // data at signup (no auto-defaults).
    let roleData: Record<string, string | number> = {};
    if (role === "creator") {
      if (!niche.trim()) return setError("Please choose your niche.");
      if (!bio.trim()) return setError("Please add a short bio.");
      if (!instagramUrl.trim() && !tiktokUrl.trim() && !youtubeUrl.trim()) {
        return setError("Add at least one social link (Instagram, TikTok or YouTube).");
      }
      roleData = {
        niche: niche.trim(),
        bio: bio.trim(),
        instagram_url: instagramUrl.trim(),
        tiktok_url: tiktokUrl.trim(),
        youtube_url: youtubeUrl.trim(),
        audience_size: audienceSize.trim() || "0",
      };
    } else {
      if (!storeName.trim()) return setError("Please enter your store name.");
      if (!storeUrl.trim()) return setError("Please enter your store URL.");
      roleData = {
        store_name: storeName.trim(),
        store_url: storeUrl.trim(),
        description: description.trim(),
        gtm_id: gtmId.trim(),
      };
    }

    setIsLoading(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Consumed by the handle_new_user trigger to fill the brands/creators
        // row with these real values.
        data: { role, full_name: fullName, ...roleData },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    router.push(getDashboardPath(role));
  };

  const handleGoogleSignUp = async () => {
    if (!agreed) return;
    setIsLoading(true);
    setError("");
    // OAuth users default to 'creator' at the DB level, so pass the chosen role
    // through to /auth/callback, which applies it after the code exchange.
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: {
          prompt: 'consent',
        }
      }
    });

    if (googleError) {
      setError(googleError.message);
      setIsLoading(false);
    }
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
            {error && (
              <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                {error}
              </div>
            )}
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
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                />
              </div>
            </div>

            {role === "creator" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="niche" className="mb-2 block text-sm font-medium text-muted">
                      Niche
                    </label>
                    <select
                      id="niche"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                    >
                      <option value="">Select a niche</option>
                      {["Beauty", "Fashion", "Tech", "Fitness", "Food", "Travel", "Gaming", "Lifestyle", "Home", "Finance"].map((n) => (
                        <option key={n} value={n.toLowerCase()}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="audienceSize" className="mb-2 block text-sm font-medium text-muted">
                      Audience size <span className="text-[var(--placeholder-faint)]">(optional)</span>
                    </label>
                    <input
                      id="audienceSize"
                      type="number"
                      min="0"
                      value={audienceSize}
                      onChange={(e) => setAudienceSize(e.target.value)}
                      placeholder="10000"
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="mb-2 block text-sm font-medium text-muted">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell brands about your content & audience"
                    className="min-h-[80px] w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted">
                    Social links <span className="text-[var(--placeholder-faint)]">(at least one)</span>
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="Instagram URL"
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                    />
                    <input
                      type="url"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="TikTok URL"
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                    />
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="YouTube URL"
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="storeName" className="mb-2 block text-sm font-medium text-muted">
                      Store name
                    </label>
                    <input
                      id="storeName"
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Glow Cosmetics"
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="storeUrl" className="mb-2 block text-sm font-medium text-muted">
                      Store URL
                    </label>
                    <input
                      id="storeUrl"
                      type="url"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      placeholder="https://glow.converty.shop"
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium text-muted">
                    Description <span className="text-[var(--placeholder-faint)]">(optional)</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beauty & skincare brand"
                    className="min-h-[80px] w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                  />
                </div>

                <div>
                  <label htmlFor="gtmId" className="mb-2 block text-sm font-medium text-muted">
                    GTM Container ID <span className="text-[var(--placeholder-faint)]">(optional)</span>
                  </label>
                  <input
                    id="gtmId"
                    type="text"
                    value={gtmId}
                    onChange={(e) => setGtmId(e.target.value)}
                    placeholder="GTM-XXXXXX"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--placeholder-faint)] outline-none transition-colors focus:border-[var(--accent-violet)]/50 focus:ring-1 focus:ring-[var(--accent-violet)]/30"
                  />
                </div>
              </>
            )}

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
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={!agreed || isLoading}
              className="flex justify-center items-center gap-2 w-full rounded-xl bg-[var(--accent-violet)] py-3.5 text-sm font-semibold text-[var(--accent-violet-on)] shadow-[0_4px_24px_var(--auth-shadow)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
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
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={!agreed || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-auth-inner)] py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--social-hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            Sign up with Google
          </button>

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
