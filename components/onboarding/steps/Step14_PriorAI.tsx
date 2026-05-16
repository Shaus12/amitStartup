"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { Sparkles } from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step14_PriorAI({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  return (
    <StepCard
      title={t.step14.title}
      subtitle={t.step14.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!answers.priorAiUsage}
    >
      <div className="space-y-4">
        {t.step14.options.map((opt: { value: string; label: string }) => {
          const selected = answers.priorAiUsage === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateAnswers({ priorAiUsage: opt.value })}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-2xl border text-right transition-all group relative overflow-hidden",
                selected
                  ? "border-blue-500 bg-blue-500/10 text-blue-100 ring-1 ring-blue-500/30 shadow-[0_4px_20px_rgba(77,142,255,0.1)]"
                  : "border-[var(--bv-border)] bg-[var(--bv-surface)]/40 text-[var(--bv-muted)] hover:border-[var(--bv-border-subtle)] hover:text-[var(--bv-text-2)]"
              )}
            >
              <span className={cn(
                "text-[15px] font-bold transition-colors",
                selected ? "text-blue-100" : "text-[var(--bv-text-3)] group-hover:text-[var(--bv-text-1)]"
              )}>
                {opt.label}
              </span>
              
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                selected
                  ? "border-blue-500 bg-blue-500"
                  : "border-[var(--bv-border-subtle)] bg-[var(--bv-surface-raised)]"
              )}>
                {selected && (
                  <div className="h-2 w-2 rounded-full bg-[var(--bv-surface)]" />
                )}
              </div>

              {selected && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
              )}
              
              {/* Subtle hover effect for unselected */}
              {!selected && (
                   <Sparkles className="w-4 h-4 text-zinc-800 absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>
    </StepCard>
  );
}
