"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step03_Revenue({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  return (
    <StepCard
      title={t.step03.title}
      subtitle={t.step03.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!answers.revenueRange}
    >
      <div className="space-y-7">
        {/* Revenue Range */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step03.revenueLabel} <span className="text-blue-400">*</span>
          </p>
          <div className="space-y-2">
            {t.step03.revenueRanges.map((r) => {
              const selected = answers.revenueRange === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => updateAnswers({ revenueRange: r.value })}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Age */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">{t.step03.businessAgeLabel}</p>
          <div className="flex gap-2">
            {t.step03.businessAges.map((ba) => {
              const selected = answers.businessAge === ba.value;
              return (
                <button
                  key={ba.value}
                  type="button"
                  onClick={() => updateAnswers({ businessAge: ba.value })}
                  className={cn(
                    "flex-1 py-3 px-2 rounded-xl border text-xs font-medium text-center transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {ba.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Growth Trajectory */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">{t.step03.growthLabel}</p>
          <div className="flex gap-2">
            {t.step03.growthOptions.map((go) => {
              const selected = answers.growthTrajectory === go.value;
              return (
                <button
                  key={go.value}
                  type="button"
                  onClick={() => updateAnswers({ growthTrajectory: go.value })}
                  className={cn(
                    "flex-1 py-3 px-2 rounded-xl border text-xs font-medium text-center transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {go.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
