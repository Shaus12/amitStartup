"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step07_SalesMarketing({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  const isFormValid =
    answers.closeRate &&
    answers.avgDealSize &&
    answers.timeSpentComms;

  return (
    <StepCard
      title={t.step07.title}
      subtitle={t.step07.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!isFormValid}
    >
      <div className="space-y-8 mt-4">
        {/* Metric 1: Close Rate */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-300">
            {t.step07.closeRateLabel}
          </label>
          <Input
            type="number"
            value={answers.closeRate}
            onChange={(e) => updateAnswers({ closeRate: e.target.value })}
            placeholder={t.step07.closeRatePlaceholder}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 h-11 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Metric 2: Avg Deal Size */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-300">
            {t.step07.avgDealSizeLabel}
          </label>
          <Input
            type="number"
            value={answers.avgDealSize}
            onChange={(e) => updateAnswers({ avgDealSize: e.target.value })}
            placeholder={t.step07.avgDealSizePlaceholder}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 h-11 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Metric 3: Time Spent Comms */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-300">
            {t.step07.timeSpentCommsLabel}
          </label>
          <Input
            type="number"
            value={answers.timeSpentComms}
            onChange={(e) => updateAnswers({ timeSpentComms: e.target.value })}
            placeholder={t.step07.timeSpentCommsPlaceholder}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 h-11 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </div>
    </StepCard>
  );
}
