"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, ShieldOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  table: "brands" | "creators";
  id: string;
  verified: boolean;
};

export function VerifyToggle({ table, id, verified }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    const { error } = await supabase
      .from(table)
      .update({ is_verified: !verified })
      .eq("id", id);
    setBusy(false);
    if (!error) router.refresh();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 disabled:opacity-60 ${
        verified
          ? "bg-[var(--accent-lime-bg)] text-[var(--accent-lime-bright)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
          : "bg-[var(--accent-violet)] text-white hover:bg-[var(--accent-violet-hover)]"
      }`}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : verified ? (
        <ShieldOff className="h-3.5 w-3.5" />
      ) : (
        <BadgeCheck className="h-3.5 w-3.5" />
      )}
      {verified ? "Unverify" : "Verify"}
    </button>
  );
}
