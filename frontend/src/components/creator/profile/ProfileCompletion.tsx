import { Check } from "lucide-react";
import type { CreatorProfileData } from "@/lib/creator-profile";

export function ProfileCompletion({
  completion,
}: {
  completion: CreatorProfileData["completion"];
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion.percent / 100) * circumference;

  return (
    <div className="rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)] p-6">
      <h2
        className="mb-6 text-xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Profile Completion
      </h2>

      <div className="flex flex-col items-center">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="var(--bg-hover)"
              strokeWidth="10"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="var(--accent-violet-light)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>
          <span
            className="absolute text-3xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {completion.percent}%
          </span>
        </div>

        <ul className="mt-6 w-full space-y-3">
          {completion.items.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  item.done
                    ? "border-emerald-400 bg-emerald-400/20 text-emerald-400"
                    : "border-[var(--border-outline)]"
                }`}
              >
                {item.done && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span
                className={`text-sm ${
                  item.done ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
