"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step13_PainPoints({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  return (
    <StepCard
      title={t.step13.title}
      subtitle={t.step13.subtitle}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Pain Point 1 */}
        <div className="space-y-1.5">
          <Label
            htmlFor="painPoint1"
            className="text-zinc-300 text-sm font-medium"
          >
            {t.step13.pain1Label}
          </Label>
          <Textarea
            id="painPoint1"
            value={answers.painPoint1}
            onChange={(e) => updateAnswers({ painPoint1: e.target.value })}
            placeholder={t.step13.pain1Placeholder}
            rows={3}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>

        {/* Pain Point 2 */}
        <div className="space-y-1.5">
          <Label
            htmlFor="painPoint2"
            className="text-zinc-300 text-sm font-medium"
          >
            {t.step13.pain2Label}
          </Label>
          <Textarea
            id="painPoint2"
            value={answers.painPoint2}
            onChange={(e) => updateAnswers({ painPoint2: e.target.value })}
            placeholder={t.step13.pain2Placeholder}
            rows={3}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>

        {/* Pain Point 3 */}
        <div className="space-y-1.5">
          <Label
            htmlFor="painPoint3"
            className="text-zinc-300 text-sm font-medium"
          >
            {t.step13.pain3Label}
          </Label>
          <Textarea
            id="painPoint3"
            value={answers.painPoint3}
            onChange={(e) => updateAnswers({ painPoint3: e.target.value })}
            placeholder={t.step13.pain3Placeholder}
            rows={3}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>

        <p className="text-blue-400/70 text-xs leading-relaxed">
          {t.step13.hint}
        </p>
      </div>
    </StepCard>
  );
}
