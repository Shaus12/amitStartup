"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const BOTTLENECK_OPTIONS = [
  "Approval chains slow things down",
  "Missing information to move forward",
  "Manual handoffs between people",
  "Constantly switching between tools",
  "Unclear who owns what",
  "Waiting on customer responses",
  "Data scattered across systems",
  "Repetitive admin tasks eat up time",
];

export function Step12_Bottlenecks({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  function toggleBottleneck(item: string) {
    const isSelected = answers.bottlenecks.includes(item);
    if (isSelected) {
      updateAnswers({ bottlenecks: answers.bottlenecks.filter((b) => b !== item) });
    } else {
      updateAnswers({ bottlenecks: [...answers.bottlenecks, item] });
    }
  }

  return (
    <StepCard
      title="Where do things get stuck?"
      subtitle="Select everything that causes friction or slowdowns in your day-to-day operations."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Bottleneck Multi-select */}
        <div className="space-y-2">
          {BOTTLENECK_OPTIONS.map((item) => {
            const selected = answers.bottlenecks.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleBottleneck(item)}
                className={cn(
                  "w-full flex items-center gap-4 text-left px-4 py-3.5 rounded-xl border transition-all",
                  selected
                    ? "border-blue-500 bg-blue-600/10 text-zinc-100"
                    : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
                )}
              >
                <span
                  className={cn(
                    "h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600"
                      : "border-zinc-600 bg-transparent"
                  )}
                >
                  {selected && (
                    <svg
                      className="h-3 w-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </span>
                <span className="text-sm">{item}</span>
              </button>
            );
          })}
        </div>

        {answers.bottlenecks.length > 0 && (
          <p className="text-blue-400/80 text-xs">
            {answers.bottlenecks.length} bottleneck
            {answers.bottlenecks.length !== 1 ? "s" : ""} selected
          </p>
        )}

        {/* Biggest Headache */}
        <div className="space-y-1.5">
          <Label
            htmlFor="biggestHeadache"
            className="text-zinc-300 text-sm font-medium"
          >
            In your own words, what's your #1 operational headache?{" "}
            <span className="text-zinc-500 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="biggestHeadache"
            value={answers.biggestHeadache}
            onChange={(e) => updateAnswers({ biggestHeadache: e.target.value })}
            placeholder="In your own words: what's the #1 operational headache in your business right now?"
            rows={4}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>
      </div>
    </StepCard>
  );
}
