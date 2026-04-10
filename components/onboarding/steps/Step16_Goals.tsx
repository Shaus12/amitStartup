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
  type LucideIcon,
} from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const GOAL_OPTIONS: { icon: LucideIcon; label: string; description: string }[] = [
  {
    icon: TrendingUp,
    label: "Grow revenue",
    description: "Increase sales, expand to new markets",
  },
  {
    icon: DollarSign,
    label: "Reduce costs",
    description: "Cut expenses, improve margins",
  },
  {
    icon: Clock,
    label: "Save time",
    description: "Eliminate manual work, free up hours",
  },
  {
    icon: Star,
    label: "Improve customer satisfaction",
    description: "Better support, faster responses",
  },
  {
    icon: Users,
    label: "Scale the team",
    description: "Hire, onboard, and grow the team",
  },
  {
    icon: CheckCircle,
    label: "Improve quality",
    description: "Fewer errors, better consistency",
  },
  {
    icon: Globe,
    label: "Enter new market",
    description: "Expand geographically or to new segments",
  },
];

export function Step16_Goals({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  function toggleGoal(label: string) {
    const isSelected = answers.goals.includes(label);
    if (isSelected) {
      updateAnswers({ goals: answers.goals.filter((g) => g !== label) });
    } else {
      updateAnswers({ goals: [...answers.goals, label] });
    }
  }

  return (
    <StepCard
      title="What are you trying to achieve?"
      subtitle="Select all that resonate with where you want to take your business."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Goals multi-select */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GOAL_OPTIONS.map(({ icon: Icon, label, description }) => {
            const selected = answers.goals.includes(label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleGoal(label)}
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
                    {description}
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
            {answers.goals.length} goal{answers.goals.length !== 1 ? "s" : ""} selected
          </p>
        )}

        {/* Top Priority */}
        <div className="space-y-1.5">
          <Label
            htmlFor="topPriority90Days"
            className="text-zinc-300 text-sm font-medium"
          >
            If you could only fix ONE thing in the next 90 days, what would it be?{" "}
            <span className="text-zinc-500 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="topPriority90Days"
            value={answers.topPriority90Days}
            onChange={(e) => updateAnswers({ topPriority90Days: e.target.value })}
            placeholder="If you could only fix ONE thing in the next 90 days, what would it be? Be specific."
            rows={4}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>
      </div>
    </StepCard>
  );
}
