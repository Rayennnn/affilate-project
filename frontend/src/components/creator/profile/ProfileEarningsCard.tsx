import type { ProfileEarnings } from "@/lib/creator-profile";

export function ProfileEarningsCard({ earnings }: { earnings: ProfileEarnings }) {
  return (
    <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
      <p className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
        Earned This Month
      </p>
      <p
        className="mt-2 text-4xl font-bold text-[var(--accent-lime-bright)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {earnings.earnedThisMonth}
      </p>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs text-[var(--text-secondary)]">
          <span>Monthly Goal: {earnings.monthlyGoal}</span>
          <span className="font-semibold text-[var(--accent-lime-bright)]">{earnings.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-hover)]">
          <div
            className="h-full rounded-full bg-[var(--accent-lime-bright)] transition-all duration-500"
            style={{ width: `${earnings.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-2 border-t border-[var(--border-faint)] pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Pending</span>
          <span className="font-semibold text-[var(--text-primary)]">{earnings.pending}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Available</span>
          <span className="font-semibold text-[var(--accent-lime-bright)]">{earnings.available}</span>
        </div>
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        Withdraw Funds
      </button>
    </div>
  );
}
