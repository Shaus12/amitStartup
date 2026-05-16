"use client";

import { DollarSign } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step15_Budget({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  return (
    <StepCard
      title={t.step15.title}
      subtitle={t.step15.subtitle}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* AI Budget */}
        <div>
          <p className="text-[var(--bv-text-2)] text-sm font-medium mb-3">
            {t.step15.budgetLabel}
          </p>
          <div className="space-y-2">
            {t.step15.budgets.map((b) => {
              const selected = answers.aiBudget === b.value;
              return (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => updateAnswers({ aiBudget: b.value })}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-[var(--bv-border-subtle)] bg-[var(--bv-surface-raised)]/50 hover:border-[var(--bv-muted)]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center",
                      selected ? "bg-blue-600/20 text-blue-400" : "bg-[var(--bv-surface-elevated)] text-[var(--bv-muted)]"
                    )}
                  >
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        selected ? "text-blue-300" : "text-[var(--bv-text-1)]"
                      )}
                    >
                      {b.label}
                    </span>
                    <span className="text-xs text-[var(--bv-muted)] leading-snug">{b.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Built vs Custom */}
        <div>
          <p className="text-[var(--bv-text-2)] text-sm font-medium mb-3">
            {t.step15.builtLabel}
          </p>
          <div className="space-y-2">
            {t.step15.builtOptions.map((bvc) => {
              const selected = answers.aiPrefBuiltVsCustom === bvc.value;
              return (
                <button
                  key={bvc.value}
                  type="button"
                  onClick={() => updateAnswers({ aiPrefBuiltVsCustom: bvc.value })}
                  className={cn(
                    "w-full flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-[var(--bv-border-subtle)] bg-[var(--bv-surface-raised)]/50 hover:border-[var(--bv-muted)]"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      selected ? "text-blue-300" : "text-[var(--bv-text-1)]"
                    )}
                  >
                    {bvc.label}
                  </span>
                  <span className="text-xs text-[var(--bv-muted)] leading-snug">{bvc.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
