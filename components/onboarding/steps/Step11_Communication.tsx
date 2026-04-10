"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const INTERNAL_COMMS = [
  "Slack",
  "Microsoft Teams",
  "WhatsApp",
  "Email primarily",
  "In-person / mixed",
];

const MEETING_HOURS = [
  { label: "Less than 2 hrs", description: "Mostly async" },
  { label: "2–5 hrs", description: "A few standups or syncs" },
  { label: "5–10 hrs", description: "Regular meeting cadence" },
  { label: "10+ hrs", description: "Heavy meeting culture" },
];

const SOP_OPTIONS = [
  {
    label: "Yes, everything is documented",
    description: "We have written SOPs, wikis, or runbooks for our processes.",
  },
  {
    label: "Partial — some things written down",
    description: "Key processes are documented but plenty lives in people's heads.",
  },
  {
    label: "No — it's all in people's heads",
    description: "Knowledge is tribal and undocumented.",
  },
];

export function Step11_Communication({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  return (
    <StepCard
      title="How does your team communicate and operate?"
      subtitle="Internal communication patterns reveal a lot about where information gets lost or duplicated."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Internal Comms */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            Primary internal communication tool
          </p>
          <div className="flex flex-wrap gap-2">
            {INTERNAL_COMMS.map((tool) => {
              const selected = answers.internalComms === tool;
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => updateAnswers({ internalComms: tool })}
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

        {/* Meeting Hours */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            How many hours per week does your team spend in meetings?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MEETING_HOURS.map(({ label, description }) => {
              const selected = answers.meetingHoursPerWeek === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateAnswers({ meetingHoursPerWeek: label })}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all",
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
                  <span className="text-xs text-zinc-500 leading-snug">
                    {description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Documented SOPs */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            Are your processes and procedures documented?
          </p>
          <div className="space-y-2">
            {SOP_OPTIONS.map(({ label, description }) => {
              const selected = answers.hasDocumentedSOPs === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateAnswers({ hasDocumentedSOPs: label })}
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
                  <span className="text-xs text-zinc-500 leading-snug">
                    {description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
