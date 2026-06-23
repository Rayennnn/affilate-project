"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    // Clear the local session (cookies) even if the network revoke call fails,
    // then hard-navigate so the middleware re-runs with no auth cookie.
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // ignore — we redirect regardless
    }
    window.location.assign("/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={
        className ??
        "flex items-center gap-2 rounded-lg border border-[var(--border-outline)] px-3 py-2 text-sm font-medium text-[var(--text-on-surface)] transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-50"
      }
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Log out
    </button>
  );
}
