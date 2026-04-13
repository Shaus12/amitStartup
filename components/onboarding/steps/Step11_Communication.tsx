"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step11_Communication({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  return (
    <StepCard
      title={t.step11.title}
      subtitle={t.step11.subtitle}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Internal Comms */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step11.internalCommsLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.step11.internalComms.map((ic) => {
              const selected = answers.internalComms === ic.value;
              return (
                <button
                  key={ic.value}
                  type="button"
                  onClick={() => updateAnswers({ internalComms: ic.value })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {ic.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meeting Hours */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step11.meetingHoursLabel}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {t.step11.meetingHours.map((mh) => {
              const selected = answers.meetingHoursPerWeek === mh.value;
              return (
                <button
                  key={mh.value}
                  type="button"
                  onClick={() => updateAnswers({ meetingHoursPerWeek: mh.value })}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      selected ? "text-blue-300" : "text-zinc-200"
                    )}
                  >
                    {mh.label}
                  </span>
                  <span className="text-xs text-zinc-500 leading-snug">
                    {mh.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Documented SOPs */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step11.sopLabel}
          </p>
          <div className="space-y-2">
            {t.step11.sopOptions.map((sop) => {
              const selected = answers.hasDocumentedSOPs === sop.value;
              return (
                <button
                  key={sop.value}
                  type="button"
                  onClick={() => updateAnswers({ hasDocumentedSOPs: sop.value })}
                  className={cn(
                    "w-full flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      selected ? "text-blue-300" : "text-zinc-200"
                    )}
                  >
                    {sop.label}
                  </span>
                  <span className="text-xs text-zinc-500 leading-snug">
                    {sop.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
