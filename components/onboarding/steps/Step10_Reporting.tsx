"use client";

import { Sheet, PieChart, LayoutDashboard, Zap, XCircle } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const TRACKING_ICONS = [Sheet, PieChart, LayoutDashboard, Zap, XCircle];

export function Step10_Reporting({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  return (
    <StepCard
      title={t.step10.title}
      subtitle={t.step10.subtitle}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Tracking Method */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step10.trackingMethodLabel}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {t.step10.trackingMethods.map(({ value, label }, i) => {
              const Icon = TRACKING_ICONS[i];
              const selected = answers.trackingMethod === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateAnswers({ trackingMethod: value })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all",
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

        {/* Reporting Frequency */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step10.reportingFreqLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.step10.reportingFreqs.map((rf) => {
              const selected = answers.reportingFrequency === rf.value;
              return (
                <button
                  key={rf.value}
                  type="button"
                  onClick={() => updateAnswers({ reportingFrequency: rf.value })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {rf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Creator */}
        <div className="space-y-1.5">
          <Label htmlFor="reportCreator" className="text-zinc-300 text-sm font-medium">
            {t.step10.reportCreatorLabel}{" "}
            <span className="text-zinc-500 font-normal">{t.optional}</span>
          </Label>
          <Input
            id="reportCreator"
            value={answers.reportCreator}
            onChange={(e) => updateAnswers({ reportCreator: e.target.value })}
            placeholder={t.step10.reportPlaceholder}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Data Based Decisions */}
        <div className="space-y-1.5">
          <Label
            htmlFor="dataBasedDecisions"
            className="text-zinc-300 text-sm font-medium"
          >
            {t.step10.dataDecisionsLabel}{" "}
            <span className="text-zinc-500 font-normal">{t.optional}</span>
          </Label>
          <Textarea
            id="dataBasedDecisions"
            value={answers.dataBasedDecisions}
            onChange={(e) => updateAnswers({ dataBasedDecisions: e.target.value })}
            placeholder={t.step10.dataPlaceholder}
            rows={3}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>
      </div>
    </StepCard>
  );
}
