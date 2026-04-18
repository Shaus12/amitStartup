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
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-5 shrink-0 rounded flex items-center justify-center transition-all border",
                    selected
                      ? "border-blue-500 bg-blue-500 shadow-[0_0_8px_rgba(77,142,255,0.6)]"
                      : "border-zinc-700 bg-zinc-800 group-hover:border-zinc-600"
                  )}
                >
                  {selected && <Check className="h-3 w-3 text-zinc-900" strokeWidth={4} />}
                </div>
                <span className={cn("text-sm font-semibold", selected ? "text-blue-100" : "text-zinc-400")}>
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
              className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none min-h-[100px]"
            />
          </div>
        )}
      </div>
    </StepCard>
  );
}
