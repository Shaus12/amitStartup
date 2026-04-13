"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const AI_TOOLS = [
  "ChatGPT",
  "Google Gemini",
  "Microsoft Copilot",
  "AI email tools",
  "AI customer service",
  "Zapier AI",
  "Other",
];

export function Step14_PriorAI({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

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
      title={t.step14.title}
      subtitle={t.step14.subtitle}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Prior AI Usage */}
        <div className="space-y-2">
          {t.step14.priorUsageOptions.map((opt) => {
            const selected = answers.priorAiUsage === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  updateAnswers({ priorAiUsage: opt.value });
                  // Clear tools if switching to "Never"
                  if (opt.value === "Never used AI in the business") {
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
                  {opt.label}
                </span>
                <span className="text-xs text-zinc-500 leading-snug">{opt.desc}</span>
              </button>
            );
          })}
        </div>

        {/* AI Tools (conditional) */}
        {showToolPicker && answers.priorAiUsage && (
          <div>
            <p className="text-zinc-300 text-sm font-medium mb-3">
              {t.step14.toolsLabel}
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
            {t.step14.comfortLabel}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {t.step14.comfortLevels.map((cl) => {
              const selected = answers.aiComfortLevel === cl.value;
              return (
                <button
                  key={cl.value}
                  type="button"
                  onClick={() => updateAnswers({ aiComfortLevel: cl.value })}
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
                    {cl.label}
                  </span>
                  <span className="text-xs text-zinc-500 leading-snug">{cl.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
