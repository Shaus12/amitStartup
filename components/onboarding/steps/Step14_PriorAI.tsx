"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PRIOR_AI_USAGE = [
  {
    label: "Yes, we use AI tools regularly",
    description: "AI is part of our day-to-day workflow.",
  },
  {
    label: "We've tried a few things",
    description: "Experimented here and there but nothing consistent.",
  },
  {
    label: "Never used AI in the business",
    description: "This is new territory for us.",
  },
];

const AI_TOOLS = [
  "ChatGPT",
  "Google Gemini",
  "Microsoft Copilot",
  "AI email tools",
  "AI customer service",
  "Zapier AI",
  "Other",
];

const AI_COMFORT_LEVELS = [
  {
    label: "Low",
    description: "I need plug-and-play solutions, no tech setup",
  },
  {
    label: "Medium",
    description: "I can handle some configuration and setup",
  },
  {
    label: "High",
    description: "I'm open to custom-built AI agents and integrations",
  },
];

export function Step14_PriorAI({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  const showToolPicker = answers.priorAiUsage !== "Never used AI in the business";

  function toggleTool(tool: string) {
    const isSelected = answers.priorAiTools.includes(tool);
    if (isSelected) {
      updateAnswers({ priorAiTools: answers.priorAiTools.filter((t) => t !== tool) });
    } else {
      updateAnswers({ priorAiTools: [...answers.priorAiTools, tool] });
    }
  }

  return (
    <StepCard
      title="Have you used AI in your business before?"
      subtitle="Knowing your starting point helps us calibrate our recommendations — no right or wrong answers."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Prior AI Usage */}
        <div className="space-y-2">
          {PRIOR_AI_USAGE.map(({ label, description }) => {
            const selected = answers.priorAiUsage === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  updateAnswers({ priorAiUsage: label });
                  // Clear tools if switching to "Never"
                  if (label === "Never used AI in the business") {
                    updateAnswers({ priorAiTools: [] });
                  }
                }}
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

        {/* AI Tools (conditional) */}
        {showToolPicker && answers.priorAiUsage && (
          <div>
            <p className="text-zinc-300 text-sm font-medium mb-3">
              Which AI tools have you used? <span className="text-zinc-500 font-normal">(select all that apply)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {AI_TOOLS.map((tool) => {
                const selected = answers.priorAiTools.includes(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggleTool(tool)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                      selected
                        ? "border-blue-500 bg-blue-600/10 text-blue-300"
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    )}
                  >
                    {tool}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Comfort Level */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            How would you rate your technical comfort level with AI?
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {AI_COMFORT_LEVELS.map(({ label, description }) => {
              const selected = answers.aiComfortLevel === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateAnswers({ aiComfortLevel: label })}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-bold",
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
