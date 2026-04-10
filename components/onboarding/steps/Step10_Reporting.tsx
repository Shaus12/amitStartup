"use client";

import { Sheet, PieChart, LayoutDashboard, Zap, XCircle } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const TRACKING_METHODS = [
  { label: "Spreadsheets", icon: Sheet },
  { label: "BI Tool (Looker/Tableau)", icon: PieChart },
  { label: "Custom Dashboard", icon: LayoutDashboard },
  { label: "Gut feeling", icon: Zap },
  { label: "We don't track", icon: XCircle },
];

const REPORTING_FREQUENCIES = ["Daily", "Weekly", "Monthly", "Rarely"];

export function Step10_Reporting({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  return (
    <StepCard
      title="How do you track and report on performance?"
      subtitle="This tells us how data-driven your business is today and where we can add visibility."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-7">
        {/* Tracking Method */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            How do you currently track business performance?
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TRACKING_METHODS.map(({ label, icon: Icon }) => {
              const selected = answers.trackingMethod === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateAnswers({ trackingMethod: label })}
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
            How often do you review or share reports?
          </p>
          <div className="flex flex-wrap gap-2">
            {REPORTING_FREQUENCIES.map((freq) => {
              const selected = answers.reportingFrequency === freq;
              return (
                <button
                  key={freq}
                  type="button"
                  onClick={() => updateAnswers({ reportingFrequency: freq })}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {freq}
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Creator */}
        <div className="space-y-1.5">
          <Label htmlFor="reportCreator" className="text-zinc-300 text-sm font-medium">
            Who creates reports and how long does it take?{" "}
            <span className="text-zinc-500 font-normal">(optional)</span>
          </Label>
          <Input
            id="reportCreator"
            value={answers.reportCreator}
            onChange={(e) => updateAnswers({ reportCreator: e.target.value })}
            placeholder="Who creates reports and how long does it take?"
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Data Based Decisions */}
        <div className="space-y-1.5">
          <Label
            htmlFor="dataBasedDecisions"
            className="text-zinc-300 text-sm font-medium"
          >
            What business decisions do you make based on data?{" "}
            <span className="text-zinc-500 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="dataBasedDecisions"
            value={answers.dataBasedDecisions}
            onChange={(e) => updateAnswers({ dataBasedDecisions: e.target.value })}
            placeholder="What business decisions do you make based on data?"
            rows={3}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>
      </div>
    </StepCard>
  );
}
