"use client";

import { Mail, Phone, MessageSquare, FileText, Users } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const CONTACT_ICONS = [Mail, Phone, MessageSquare, FileText, Users];

export function Step09_CustomerInteraction({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  return (
    <StepCard
      title={t.step09.title}
      subtitle={t.step09.subtitle}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Primary Contact */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step09.primaryContactLabel}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {t.step09.contacts.map(({ value, label }, i) => {
              const Icon = CONTACT_ICONS[i];
              const selected = answers.primaryContact === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateAnswers({ primaryContact: value })}
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
            {t.step09.inquiryVolumeLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.step09.inquiryVolumes.map((iv) => {
              const selected = answers.inquiryVolume === iv.value;
              return (
                <button
                  key={iv.value}
                  type="button"
                  onClick={() => updateAnswers({ inquiryVolume: iv.value })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {iv.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Knowledge Base */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step09.knowledgeBaseLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.step09.knowledgeBaseOptions.map((kbo) => {
              const selected = answers.hasKnowledgeBase === kbo.value;
              return (
                <button
                  key={kbo.value}
                  type="button"
                  onClick={() => updateAnswers({ hasKnowledgeBase: kbo.value })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {kbo.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Avg Response Time */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step09.responseTimeLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.step09.responseTimes.map((rt) => {
              const selected = answers.avgResponseTime === rt.value;
              return (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => updateAnswers({ avgResponseTime: rt.value })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {rt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sales Process */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step09.salesProcessLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.step09.salesProcesses.map((sp) => {
              const selected = answers.salesProcess === sp.value;
              return (
                <button
                  key={sp.value}
                  type="button"
                  onClick={() => updateAnswers({ salesProcess: sp.value })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {sp.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
