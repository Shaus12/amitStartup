"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const REVENUE_RANGES = [
  "Pre-revenue",
  "Under $50k/yr",
  "$50k–$200k/yr",
  "$200k–$1M/yr",
  "$1M+/yr",
];

const BUSINESS_AGES = ["Less than 1 year", "1–3 years", "3+ years"];

const GROWTH_TRAJECTORIES = [
  { value: "scaling-fast", label: "Scaling fast" },
  { value: "steady-growth", label: "Steady growth" },
  { value: "flat", label: "Flat / stabilizing" },
];

export function Step03_Revenue({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  return (
    <StepCard
      title="Revenue & business stage"
      subtitle="This context shapes which AI opportunities will have the biggest impact for you."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!answers.revenueRange}
    >
      <div className="space-y-7">
        {/* Revenue Range */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            Annual revenue <span className="text-blue-400">*</span>
          </p>
          <div className="space-y-2">
            {REVENUE_RANGES.map((range) => {
              const selected = answers.revenueRange === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => updateAnswers({ revenueRange: range })}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Age */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">How long have you been operating?</p>
          <div className="flex gap-2">
            {BUSINESS_AGES.map((age) => {
              const selected = answers.businessAge === age;
              return (
                <button
                  key={age}
                  type="button"
                  onClick={() => updateAnswers({ businessAge: age })}
                  className={cn(
                    "flex-1 py-3 px-2 rounded-xl border text-xs font-medium text-center transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {age}
                </button>
              );
            })}
          </div>
        </div>

        {/* Growth Trajectory */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">Current growth trajectory</p>
          <div className="flex gap-2">
            {GROWTH_TRAJECTORIES.map(({ value, label }) => {
              const selected = answers.growthTrajectory === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateAnswers({ growthTrajectory: value })}
                  className={cn(
                    "flex-1 py-3 px-2 rounded-xl border text-xs font-medium text-center transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
