"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const EMPLOYEE_RANGES = ["Just me", "2–5", "6–20", "21–100", "100+"];

const STAFF_STRUCTURES = [
  { value: "in-house", label: "Mostly in-house / full-time" },
  { value: "remote-mix", label: "Mix of remote / freelancers" },
];

const DEPT_OPTIONS = [
  { value: true, label: "Yes, we have clear departments/teams" },
  { value: false, label: "No, everyone does a bit of everything" },
];

export function Step02_TeamSize({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  return (
    <StepCard
      title="Tell us about your team"
      subtitle="Understanding your team structure helps us identify the right areas for efficiency gains."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!answers.employeeRange}
    >
      <div className="space-y-7">
        {/* Employee Range */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            How many people work at your company?{" "}
            <span className="text-blue-400">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {EMPLOYEE_RANGES.map((range) => {
              const selected = answers.employeeRange === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => updateAnswers({ employeeRange: range })}
                  className={cn(
                    "flex-1 min-w-[80px] py-3 px-4 rounded-xl border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </div>

        {/* Staff Structure */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">How is your team structured?</p>
          <div className="space-y-2">
            {STAFF_STRUCTURES.map(({ value, label }) => {
              const selected = answers.staffStructure === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateAnswers({ staffStructure: value })}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Has Separate Departments */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            Do you have separate departments or teams?
          </p>
          <div className="space-y-2">
            {DEPT_OPTIONS.map(({ value, label }) => {
              const selected = answers.hasSeparateDepts === value;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateAnswers({ hasSeparateDepts: value })}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
