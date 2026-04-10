"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step13_PainPoints({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  return (
    <StepCard
      title="What's really hurting your business?"
      subtitle="Be as specific as possible — the more detail you give, the sharper our AI recommendations will be."
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
            What takes up too much of YOUR personal time as the owner?
          </Label>
          <Textarea
            id="painPoint1"
            value={answers.painPoint1}
            onChange={(e) => updateAnswers({ painPoint1: e.target.value })}
            placeholder="e.g. I spend 3 hours every Monday pulling together our weekly sales report from three different spreadsheets..."
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
            What do you wish you could automate or completely eliminate?
          </Label>
          <Textarea
            id="painPoint2"
            value={answers.painPoint2}
            onChange={(e) => updateAnswers({ painPoint2: e.target.value })}
            placeholder="e.g. Following up with leads who went cold — we lose track and they fall through the cracks..."
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
            What mistakes or errors happen most often in your business?
          </Label>
          <Textarea
            id="painPoint3"
            value={answers.painPoint3}
            onChange={(e) => updateAnswers({ painPoint3: e.target.value })}
            placeholder="e.g. Invoices go out with wrong amounts because pricing changes aren't communicated to the billing team in time..."
            rows={3}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>

        <p className="text-blue-400/70 text-xs leading-relaxed">
          The more specific you are, the better our AI recommendations will be.
        </p>
      </div>
    </StepCard>
  );
}
