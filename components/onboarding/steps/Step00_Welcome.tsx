"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step00_Welcome({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  return (
    <StepCard
      title={t.step00.title}
      subtitle={t.step00.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!answers.businessName.trim()}
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="businessName" className="text-zinc-300 text-sm font-medium">
            {t.step00.businessName} <span className="text-blue-400">*</span>
          </Label>
          <Input
            id="businessName"
            value={answers.businessName}
            onChange={(e) => updateAnswers({ businessName: e.target.value })}
            placeholder={t.step00.placeholderBusiness}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerName" className="text-zinc-300 text-sm font-medium">
            {t.step00.ownerName}
          </Label>
          <Input
            id="ownerName"
            value={answers.ownerName}
            onChange={(e) => updateAnswers({ ownerName: e.target.value })}
            placeholder={t.step00.placeholderOwner}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tagline" className="text-zinc-300 text-sm font-medium">
            {t.step00.tagline}{" "}
            <span className="text-zinc-500 font-normal">{t.optional}</span>
          </Label>
          <Input
            id="tagline"
            value={answers.tagline}
            onChange={(e) => updateAnswers({ tagline: e.target.value })}
            placeholder={t.step00.placeholderTagline}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </div>
    </StepCard>
  );
}
