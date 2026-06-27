import { DollarSign, Link2, TrendingUp } from "lucide-react";
import type { ProfileActivity } from "@/lib/creator-profile";

const iconMap = {
  earning: { Icon: DollarSign, bg: "bg-emerald-500/15", color: "text-emerald-400" },
  link: { Icon: Link2, bg: "bg-[var(--accent-violet)]/20", color: "text-[var(--accent-violet-light)]" },
  traffic: { Icon: TrendingUp, bg: "bg-orange-500/15", color: "text-orange-400" },
};

export function ProfileRecentActivity({ activities }: { activities: ProfileActivity[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
      <h2
        className="mb-6 text-xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Recent Activity
      </h2>

      {activities.length === 0 && (
        <p className="py-8 text-center text-sm text-[var(--text-secondary)]">No recent activity.</p>
      )}

      <div className="space-y-1">
        {activities.map((activity) => {
          const { Icon, bg, color } = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-xl px-2 py-4 transition-colors hover:bg-[var(--bg-hover)]"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--text-primary)]">{activity.title}</p>
                {activity.subtitle && (
                  <p className="text-sm text-[var(--text-secondary)]">{activity.subtitle}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-[var(--text-secondary)]">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
