"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function ConversionActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const setStatus = async (next: "confirmed" | "cancelled") => {
    setBusy(true);
    const { error } = await supabase.from("conversions").update({ status: next }).eq("id", id);
    setBusy(false);
    if (!error) router.refresh();
  };

  // Terminal states have no further action.
  if (status === "cancelled" || status === "paid") {
    return <span className="text-xs text-[var(--text-placeholder)]">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {status === "pending" && (
        <button
          type="button"
          onClick={() => setStatus("confirmed")}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent-violet)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[var(--accent-violet-hover)] active:scale-95 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Confirm
        </button>
      )}
      <button
        type="button"
        onClick={() => setStatus("cancelled")}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-outline)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] hover:text-red-400 active:scale-95 disabled:opacity-60"
      >
        <X className="h-3.5 w-3.5" />
        Cancel
      </button>
    </div>
  );
}
