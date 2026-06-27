"use client";

import { useState } from "react";
import type { ChartBar } from "@/lib/creator-dashboard";

type Period = "week" | "month";

export function EarningsVelocityChart({
  weekData,
  monthData,
}: {
  weekData: ChartBar[];
  monthData: ChartBar[];
}) {
  const [period, setPeriod] = useState<Period>("month");
  const data = period === "week" ? weekData : monthData;
  const max = Math.max(...data.map((b) => b.value), 1);

  return (
    <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3
            className="text-xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Earnings Velocity
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Projected growth based on current conversion rates.
          </p>
        </div>

        <div className="flex rounded-xl border border-[var(--border-outline)] bg-[var(--bg-hover)] p-1">
          {(["week", "month"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all active:scale-95 ${
                period === p
                  ? "bg-[var(--accent-violet)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-on-surface)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-8">
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-[var(--text-secondary)]">
            No earnings data yet.
          </div>
        ) : (
        <div className="flex h-[200px] items-end justify-between gap-3 px-2">
          {data.map((bar) => {
            const height = (bar.value / max) * 100;
            return (
              <div key={bar.label} className="relative flex flex-1 flex-col items-center gap-3">
                {bar.highlight && bar.tooltip && (
                  <div className="absolute -top-10 z-10 whitespace-nowrap rounded-lg border border-[var(--border-outline)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-on-surface)] shadow-lg">
                    {bar.tooltip}
                  </div>
                )}
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ${
                      bar.highlight
                        ? "bg-[var(--accent-violet-light)]"
                        : "bg-[var(--bg-muted-surface)]"
                    }`}
                    style={{ height: `${height}%`, minHeight: "8px" }}
                  />
                </div>
                <span className="text-xs text-[var(--text-secondary)]">{bar.label}</span>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
