"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step00_Welcome({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  return (
    <StepCard
      title="Let's map your business"
      subtitle="Answer a few questions and we'll build your business overview — showing you exactly where AI can save you time and money."
      onNext={onNext}
      onBack={onBack}
      showBack={false}
      nextDisabled={!answers.businessName.trim()}
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="businessName" className="text-zinc-300 text-sm font-medium">
            Business name <span className="text-blue-400">*</span>
          </Label>
          <Input
            id="businessName"
            value={answers.businessName}
            onChange={(e) => updateAnswers({ businessName: e.target.value })}
            placeholder="Acme Inc."
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerName" className="text-zinc-300 text-sm font-medium">
            Your name
          </Label>
          <Input
            id="ownerName"
            value={answers.ownerName}
            onChange={(e) => updateAnswers({ ownerName: e.target.value })}
            placeholder="Jane Smith"
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tagline" className="text-zinc-300 text-sm font-medium">
            One-sentence description{" "}
            <span className="text-zinc-500 font-normal">(optional)</span>
          </Label>
          <Input
            id="tagline"
            value={answers.tagline}
            onChange={(e) => updateAnswers({ tagline: e.target.value })}
            placeholder="We help X do Y"
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </div>
    </StepCard>
  );
}
