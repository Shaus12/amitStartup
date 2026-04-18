"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { DollarSign, Rocket, Calendar, Check } from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step03_Revenue({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  return (
    <StepCard
      title={t.step03.title}
      subtitle={t.step03.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!answers.revenueRange}
    >
      <div className="space-y-8">
        {/* Revenue Range */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <p className="text-zinc-300 text-sm font-bold uppercase tracking-wider">
              {t.step03.revenueLabel}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {t.step03.revenueRanges.map((r) => {
              const selected = answers.revenueRange === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => updateAnswers({ revenueRange: r.value })}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all text-right group",
                    selected
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-100 shadow-[0_4px_15px_rgba(16,185,129,0.1)]"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  )}
                >
                  <span className="text-sm font-bold">{r.label}</span>
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                    selected ? "bg-emerald-600 border-emerald-500" : "bg-zinc-800 border-zinc-700 group-hover:border-zinc-600"
                  )}>
                    {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Business Age */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <p className="text-zinc-300 text-sm font-bold uppercase tracking-wider">
              {t.step03.businessAgeLabel}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {t.step03.businessAges.map((ba) => {
              const selected = answers.businessAge === ba.value;
              return (
                <button
                  key={ba.value}
                  type="button"
                  onClick={() => updateAnswers({ businessAge: ba.value })}
                  className={cn(
                    "py-2.5 px-2 rounded-xl border text-xs font-bold text-center transition-all relative overflow-hidden",
                    selected
                      ? "border-blue-500 bg-blue-500/10 text-blue-100"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  )}
                >
                  {ba.label}
                  {selected && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Growth Trajectory */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-purple-500" />
            <p className="text-zinc-300 text-sm font-bold uppercase tracking-wider">
              {t.step03.growthLabel}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {t.step03.growthOptions.map((go) => {
              const selected = answers.growthTrajectory === go.value;
              return (
                <button
                  key={go.value}
                  type="button"
                  onClick={() => updateAnswers({ growthTrajectory: go.value })}
                  className={cn(
                    "py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all",
                    selected
                      ? "border-purple-500 bg-purple-500/10 text-purple-100 shadow-[0_4px_15px_rgba(168,85,247,0.1)]"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  )}
                >
                  {go.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Success indicator */}
        <div className="pt-4 flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400">
                    כבר בדרך הנכונה! ✓
                </span>
            </div>
        </div>
      </div>
    </StepCard>
  );
}
