"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { Check, Target } from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step16_Goals({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  function toggleGoal(value: string) {
    const isSelected = answers.goals.includes(value);
    if (isSelected) {
      updateAnswers({ goals: answers.goals.filter((g) => g !== value) });
    } else if (answers.goals.length < 3) {
      updateAnswers({ goals: [...answers.goals, value] });
    }
  }

  return (
    <StepCard
      title={t.step16.title}
      subtitle={t.step16.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={answers.goals.length === 0}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <p className="text-[var(--bv-text-3)] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Target className="w-3 h-3" />
            {t.step16.maxSelectLabel}
          </p>
          <span className="text-xs font-mono text-[var(--bv-muted)]">
            {answers.goals.length}/3
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {t.step16.options.map((opt: { value: string; label: string }) => {
            const selected = answers.goals.includes(opt.value);
            const disabled = !selected && answers.goals.length >= 3;
            
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() => toggleGoal(opt.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-right transition-all group relative overflow-hidden",
                  selected
                    ? "border-blue-500 bg-blue-500/10 text-blue-100 ring-1 ring-blue-500/30 shadow-[0_4px_20px_rgba(77,142,255,0.1)]"
                    : disabled
                      ? "border-[var(--bv-border)]/30 bg-[var(--bv-surface)]/10 text-[var(--bv-muted)] cursor-not-allowed opacity-50"
                      : "border-[var(--bv-border)] bg-[var(--bv-surface)]/40 text-[var(--bv-muted)] hover:border-[var(--bv-border-subtle)] hover:text-[var(--bv-text-2)]"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-5 shrink-0 rounded flex items-center justify-center transition-all border",
                    selected
                      ? "border-blue-500 bg-blue-500 shadow-[0_0_8px_rgba(77,142,255,0.6)]"
                      : "border-[var(--bv-border-subtle)] bg-[var(--bv-surface-raised)] group-hover:border-[var(--bv-muted)]"
                  )}
                >
                  {selected && <Check className="h-3 w-3 text-zinc-900" strokeWidth={4} />}
                </div>
                <span className={cn("text-sm font-semibold", selected ? "text-blue-100" : "text-[var(--bv-text-3)]")}>
                    {opt.label}
                </span>
                
                {selected && (
                    <div className="absolute top-0 right-0 h-full w-1 bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </StepCard>
  );
}
