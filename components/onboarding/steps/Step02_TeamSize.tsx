"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step02_TeamSize({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  return (
    <StepCard
      title={t.step02.title}
      subtitle={t.step02.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!answers.employeeRange}
    >
      <div className="space-y-7">
        {/* Employee Range */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step02.employeeRangeLabel}{" "}
            <span className="text-blue-400">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {t.step02.employeeRanges.map((er) => {
              const selected = answers.employeeRange === er.value;
              return (
                <button
                  key={er.value}
                  type="button"
                  onClick={() => updateAnswers({ employeeRange: er.value })}
                  className={cn(
                    "flex-1 min-w-[80px] py-3 px-4 rounded-xl border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {er.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Staff Structure */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">{t.step02.staffStructureLabel}</p>
          <div className="space-y-2">
            {t.step02.staffStructures.map((ss) => {
              const selected = answers.staffStructure === ss.value;
              return (
                <button
                  key={ss.value}
                  type="button"
                  onClick={() => updateAnswers({ staffStructure: ss.value })}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {ss.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Has Separate Departments */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step02.hasDeptLabel}
          </p>
          <div className="space-y-2">
            {t.step02.deptOptions.map((do_opt) => {
              const selected = answers.hasSeparateDepts === do_opt.value;
              return (
                <button
                  key={String(do_opt.value)}
                  type="button"
                  onClick={() => updateAnswers({ hasSeparateDepts: do_opt.value })}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {do_opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
