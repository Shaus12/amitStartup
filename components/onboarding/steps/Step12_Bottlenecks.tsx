"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { Check } from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step12_Bottlenecks({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  function toggleBottleneck(val: string) {
    const isSelected = answers.bottlenecks.includes(val);
    if (isSelected) {
      updateAnswers({ bottlenecks: answers.bottlenecks.filter((b) => b !== val) });
    } else {
      updateAnswers({ bottlenecks: [...answers.bottlenecks, val] });
    }
  }

  const isOtherSelected = answers.bottlenecks.includes("Other");

  return (
    <StepCard
      title={t.step12.title}
      subtitle={t.step12.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={answers.bottlenecks.length === 0}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-2">
          {t.step12.options.map((opt: { value: string; label: string }) => {
            const selected = answers.bottlenecks.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleBottleneck(opt.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-right transition-all group",
                  selected
                    ? "border-blue-500 bg-blue-500/10 text-blue-100 ring-1 ring-blue-500/30 shadow-[0_4px_20px_rgba(77,142,255,0.1)]"
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
              </button>
            );
          })}
        </div>

        {isOtherSelected && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <Textarea
              value={answers.biggestHeadache}
              onChange={(e) => updateAnswers({ biggestHeadache: e.target.value })}
              placeholder={t.step12.otherPlaceholder}
              className="bg-[var(--bv-surface-raised)]/50 border-[var(--bv-border-subtle)] text-[var(--bv-text-1)] placeholder:text-[var(--bv-muted)] focus:border-blue-500 focus:ring-blue-500/20 resize-none min-h-[100px]"
            />
          </div>
        )}
      </div>
    </StepCard>
  );
}
