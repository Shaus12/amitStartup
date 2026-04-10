"use client";

import { Mail, Phone, MessageSquare, FileText, Users } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PRIMARY_CONTACTS = [
  { label: "Email", icon: Mail },
  { label: "Phone", icon: Phone },
  { label: "Live Chat", icon: MessageSquare },
  { label: "Contact Form", icon: FileText },
  { label: "In Person", icon: Users },
];

const INQUIRY_VOLUMES = [
  "Less than 10/week",
  "10–50/week",
  "50–200/week",
  "200+/week",
];

const KNOWLEDGE_BASE_OPTIONS = [
  "Yes, documented",
  "Partial / informal",
  "No",
];

const RESPONSE_TIMES = [
  "Within 1 hour",
  "Same day",
  "1–2 days",
  "3+ days",
];

const SALES_PROCESSES = [
  "No formal process",
  "We use a pipeline/stages",
  "Automated sequences",
];

export function Step09_CustomerInteraction({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  return (
    <StepCard
      title="How do you interact with customers?"
      subtitle="Understanding your customer touchpoints helps us identify where AI can improve responsiveness and experience."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Primary Contact */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            How do most customers first contact you?
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PRIMARY_CONTACTS.map(({ label, icon: Icon }) => {
              const selected = answers.primaryContact === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateAnswers({ primaryContact: label })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-xs leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inquiry Volume */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            How many customer inquiries do you receive?
          </p>
          <div className="flex flex-wrap gap-2">
            {INQUIRY_VOLUMES.map((vol) => {
              const selected = answers.inquiryVolume === vol;
              return (
                <button
                  key={vol}
                  type="button"
                  onClick={() => updateAnswers({ inquiryVolume: vol })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {vol}
                </button>
              );
            })}
          </div>
        </div>

        {/* Knowledge Base */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            Do you have a knowledge base or documented FAQs?
          </p>
          <div className="flex flex-wrap gap-2">
            {KNOWLEDGE_BASE_OPTIONS.map((opt) => {
              const selected = answers.hasKnowledgeBase === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateAnswers({ hasKnowledgeBase: opt })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Avg Response Time */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            What's your typical response time?
          </p>
          <div className="flex flex-wrap gap-2">
            {RESPONSE_TIMES.map((rt) => {
              const selected = answers.avgResponseTime === rt;
              return (
                <button
                  key={rt}
                  type="button"
                  onClick={() => updateAnswers({ avgResponseTime: rt })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {rt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sales Process */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            How would you describe your sales process?
          </p>
          <div className="flex flex-wrap gap-2">
            {SALES_PROCESSES.map((sp) => {
              const selected = answers.salesProcess === sp;
              return (
                <button
                  key={sp}
                  type="button"
                  onClick={() => updateAnswers({ salesProcess: sp })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {sp}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
