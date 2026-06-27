"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";

type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  features: string[];
  highlight?: boolean;
  cta: string;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    tagline: "For brands testing the waters.",
    monthly: 0,
    yearly: 0,
    features: [
      "Up to 2 active campaigns",
      "Up to 10 creators",
      "Basic conversion tracking",
      "Email support",
    ],
    cta: "Current plan",
  },
  {
    name: "Growth",
    tagline: "For scaling creator programs.",
    monthly: 49,
    yearly: 470,
    features: [
      "Unlimited campaigns",
      "Up to 100 creators",
      "Advanced analytics & charts",
      "Creator invitations",
      "Priority support",
    ],
    highlight: true,
    cta: "Upgrade to Growth",
  },
  {
    name: "Scale",
    tagline: "For high-volume marketplaces.",
    monthly: 149,
    yearly: 1430,
    features: [
      "Everything in Growth",
      "Unlimited creators",
      "Custom commission rules",
      "Dedicated account manager",
      "API access & webhooks",
    ],
    cta: "Talk to sales",
  },
];

export function UpgradePlanContent() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center">
        <div className="flex rounded-full border border-[var(--border-outline)] bg-[var(--bg-card)] p-1">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              !yearly
                ? "bg-[var(--accent-violet)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              yearly
                ? "bg-[var(--accent-violet)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Yearly
            <span className="ml-2 rounded-full bg-[var(--accent-lime-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--accent-lime-bright)]">
              -20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly;
          const suffix = plan.monthly === 0 ? "" : yearly ? "/yr" : "/mo";
          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-[var(--accent-violet)] bg-[var(--bg-card)] shadow-[0_0_0_1px_var(--accent-violet)]"
                  : "border-[var(--border-outline)] bg-[var(--bg-card)]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-[var(--accent-violet)] px-3 py-1 text-xs font-bold text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  Most popular
                </span>
              )}

              <h3
                className="text-xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{plan.tagline}</p>

              <div className="mt-6 flex items-end gap-1">
                <span
                  className="text-4xl font-bold text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  ${price}
                </span>
                <span className="mb-1 text-sm text-[var(--text-secondary)]">{suffix}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[var(--text-on-surface)]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-lime-bright)]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={plan.monthly === 0}
                className={`mt-8 w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-95 ${
                  plan.monthly === 0
                    ? "cursor-default border border-[var(--border-outline)] text-[var(--text-secondary)]"
                    : plan.highlight
                      ? "bg-[var(--accent-violet)] text-white hover:bg-[var(--accent-violet-hover)]"
                      : "border border-[var(--accent-violet-light)]/30 bg-[var(--accent-violet-light)]/10 text-[var(--accent-violet-light)] hover:bg-[var(--accent-violet)] hover:text-white"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-[var(--text-placeholder)]">
        Plans are billed via Konnect. You can change or cancel anytime.
      </p>
    </div>
  );
}
