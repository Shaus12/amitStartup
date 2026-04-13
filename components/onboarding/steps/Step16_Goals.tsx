"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  Users,
  CheckCircle,
  Globe,
} from "lucide-react";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const GOAL_ICONS = [TrendingUp, DollarSign, Clock, Star, Users, CheckCircle, Globe];

export function Step16_Goals({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  function toggleGoal(value: string) {
    const isSelected = answers.goals.includes(value);
    if (isSelected) {
      updateAnswers({ goals: answers.goals.filter((g) => g !== value) });
    } else {
      updateAnswers({ goals: [...answers.goals, value] });
    }
  }

  return (
    <StepCard
      title={t.step16.title}
      subtitle={t.step16.subtitle}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Goals multi-select */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {t.step16.goals.map(({ value, label, desc }, i) => {
            const Icon = GOAL_ICONS[i];
            const selected = answers.goals.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleGoal(value)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                  selected
                    ? "border-blue-500 bg-blue-600/10"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                )}
              >
                <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", selected ? "text-blue-400" : "text-zinc-500")} strokeWidth={1.5} />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      selected ? "text-blue-300" : "text-zinc-200"
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-zinc-500 leading-snug">
                    {desc}
                  </span>
                </div>
                {/* Selection indicator */}
                <span
                  className={cn(
                    "ml-auto shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
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
              </button>
            );
          })}
        </div>

        {answers.goals.length > 0 && (
          <p className="text-blue-400/80 text-xs">
            {t.step16.selectedCount(answers.goals.length)}
          </p>
        )}

        {/* Top Priority */}
        <div className="space-y-1.5">
          <Label
            htmlFor="topPriority90Days"
            className="text-zinc-300 text-sm font-medium"
          >
            {t.step16.priorityLabel}{" "}
            <span className="text-zinc-500 font-normal">{t.optional}</span>
          </Label>
          <Textarea
            id="topPriority90Days"
            value={answers.topPriority90Days}
            onChange={(e) => updateAnswers({ topPriority90Days: e.target.value })}
            placeholder={t.step16.priorityPlaceholder}
            rows={4}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>
      </div>
    </StepCard>
  );
}
