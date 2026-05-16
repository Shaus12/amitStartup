"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { OnboardingAnswers } from "@/lib/types/onboarding";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step05_ToolsStack({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  const questions = [
    { key: "leadsTracking" as keyof OnboardingAnswers, q: t.step05.questions.leads },
    { key: "clientManagement" as keyof OnboardingAnswers, q: t.step05.questions.clients },
    { key: "financeTracking" as keyof OnboardingAnswers, q: t.step05.questions.finance },
    { key: "taskManagement" as keyof OnboardingAnswers, q: t.step05.questions.tasks },
    { key: "dataTracking" as keyof OnboardingAnswers, q: t.step05.questions.data },
  ];

  const stackComplete =
    !!answers.softwareSpend &&
    questions.every((item) => !!String(answers[item.key] ?? "").trim());

  return (
    <StepCard
      title={t.step05.title}
      subtitle={t.step05.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!stackComplete}
    >
      <div className="space-y-8">
        {questions.map((item) => (
          <div key={item.key} className="space-y-3">
            <p className="text-[var(--bv-text-2)] text-sm font-semibold">{item.q.label}</p>
            <div className="flex flex-wrap gap-2">
              {item.q.options.map((opt: string) => {
                const selected = answers[item.key] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateAnswers({ [item.key]: opt })}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-[13px] font-medium transition-all whitespace-nowrap",
                      selected
                        ? "border-blue-500 bg-blue-600/10 text-blue-300"
                        : "border-[var(--bv-border)] bg-[var(--bv-surface)]/40 text-[var(--bv-muted)] hover:border-[var(--bv-border-subtle)] hover:text-[var(--bv-text-2)]"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Software Spend */}
        <div className="pt-6 border-t border-[var(--bv-border)]/50">
          <p className="text-[var(--bv-text-1)] text-[15px] font-bold mb-4">
            {t.step05.spendLabel}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {t.step05.spendRanges.map((sr) => {
              const selected = answers.softwareSpend === sr.value;
              return (
                <button
                  key={sr.value}
                  type="button"
                  onClick={() => updateAnswers({ softwareSpend: sr.value })}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-sm font-semibold transition-all text-center",
                    selected
                      ? "border-blue-500 bg-blue-600/20 text-blue-300 shadow-[0_0_15px_rgba(77,142,255,0.15)]"
                      : "border-[var(--bv-border)] bg-[var(--bv-surface)]/60 text-[var(--bv-muted)] hover:border-[var(--bv-border-subtle)] hover:text-[var(--bv-text-2)]"
                  )}
                >
                  {sr.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
