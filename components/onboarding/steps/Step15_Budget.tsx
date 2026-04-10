"use client";

import { DollarSign } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const AI_BUDGETS = [
  {
    label: "Free only — no budget right now",
    description: "Show me what's possible with free tools.",
  },
  {
    label: "Under $200/month",
    description: "Open to affordable subscriptions that pay for themselves.",
  },
  {
    label: "$200–$1,000/month",
    description: "Ready to invest in tools that make a real difference.",
  },
  {
    label: "$1,000+/month — serious about this",
    description: "AI is a strategic priority and we'll invest accordingly.",
  },
];

const BUILT_VS_CUSTOM = [
  {
    label: "Off-the-shelf — prefer proven tools I can plug in",
    description:
      "Give me existing products that work out of the box with minimal setup.",
  },
  {
    label: "Custom-built — open to purpose-built agents for my exact needs",
    description:
      "I want solutions designed specifically around my workflows, even if it takes more setup.",
  },
];

export function Step15_Budget({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  return (
    <StepCard
      title="What's your AI investment appetite?"
      subtitle="This helps us recommend solutions that fit your budget and technical preferences."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* AI Budget */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            What's your monthly budget for AI tools?
          </p>
          <div className="space-y-2">
            {AI_BUDGETS.map(({ label, description }) => {
              const selected = answers.aiBudget === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateAnswers({ aiBudget: label })}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center",
                      selected ? "bg-blue-600/20 text-blue-400" : "bg-zinc-700 text-zinc-500"
                    )}
                  >
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        selected ? "text-blue-300" : "text-zinc-200"
                      )}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-zinc-500 leading-snug">{description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Built vs Custom */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            Do you prefer off-the-shelf tools or custom-built solutions?
          </p>
          <div className="space-y-2">
            {BUILT_VS_CUSTOM.map(({ label, description }) => {
              const selected = answers.aiPrefBuiltVsCustom === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateAnswers({ aiPrefBuiltVsCustom: label })}
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
                    {label}
                  </span>
                  <span className="text-xs text-zinc-500 leading-snug">{description}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
