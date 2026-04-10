"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const MANUAL_TASKS = [
  "Copy-paste data between tools",
  "Send similar emails or messages repeatedly",
  "Create weekly or monthly reports manually",
  "Schedule meetings back-and-forth",
  "Re-enter data from one system to another",
  "Follow up with leads or customers manually",
  "Answer the same customer questions repeatedly",
  "Create invoices and track payments manually",
  "Post to social media manually",
  "Review and approve routine documents",
];

export function Step08_ManualWork({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  function toggleTask(task: string) {
    const isSelected = answers.manualTasks.includes(task);
    if (isSelected) {
      updateAnswers({
        manualTasks: answers.manualTasks.filter((t) => t !== task),
      });
    } else {
      updateAnswers({
        manualTasks: [...answers.manualTasks, task],
      });
    }
  }

  return (
    <StepCard
      title="Which of these does your team do regularly?"
      subtitle="Select all that apply — these are prime candidates for AI automation."
      onNext={onNext}
      onBack={onBack}
      nextLabel="Continue"
    >
      <div className="space-y-2">
        {MANUAL_TASKS.map((task) => {
          const selected = answers.manualTasks.includes(task);
          return (
            <button
              key={task}
              type="button"
              onClick={() => toggleTask(task)}
              className={cn(
                "w-full flex items-center gap-4 text-left px-4 py-3.5 rounded-xl border transition-all",
                selected
                  ? "border-blue-500 bg-blue-600/10 text-zinc-100"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
              )}
            >
              {/* Checkbox indicator */}
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
              <span className="text-sm">{task}</span>
            </button>
          );
        })}
      </div>

      {answers.manualTasks.length > 0 && (
        <p className="mt-4 text-blue-400/80 text-xs">
          {answers.manualTasks.length} task
          {answers.manualTasks.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </StepCard>
  );
}
