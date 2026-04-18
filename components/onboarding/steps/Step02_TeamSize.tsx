"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { Building2, Users, Users2, Check } from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step02_TeamSize({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();
  const allowedBusinessTypes = t.step02.businessTypes.map((b) => b.value);
  const businessTypeOk = allowedBusinessTypes.includes(answers.businessType);

  return (
    <StepCard
      title={t.step02.title}
      subtitle={t.step02.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!businessTypeOk || !answers.employeeRange}
    >
      <div className="space-y-8">
        {/* Business type */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <p className="text-zinc-300 text-sm font-bold uppercase tracking-wider">
              {t.step02.businessTypeLabel}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {t.step02.businessTypes.map((bt) => {
              const selected = answers.businessType === bt.value;
              return (
                <button
                  key={bt.value}
                  type="button"
                  onClick={() => updateAnswers({ businessType: bt.value })}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border text-right transition-all group",
                    selected
                      ? "border-blue-500 bg-blue-500/10 text-blue-100 shadow-[0_4px_15px_rgba(77,142,255,0.1)]"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <span className="text-sm font-bold leading-snug">{bt.label}</span>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                      selected ? "bg-blue-600 border-blue-500" : "bg-zinc-800 border-zinc-700 group-hover:border-zinc-600"
                    )}
                  >
                    {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Employee Range */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <p className="text-zinc-300 text-sm font-bold uppercase tracking-wider">
              {t.step02.employeeRangeLabel}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {t.step02.employeeRanges.map((er) => {
              const selected = answers.employeeRange === er.value;
              return (
                <button
                  key={er.value}
                  type="button"
                  onClick={() => updateAnswers({ employeeRange: er.value })}
                  className={cn(
                    "relative py-3 px-4 rounded-xl border text-sm font-bold transition-all overflow-hidden",
                    selected
                      ? "border-blue-500 bg-blue-500/10 text-blue-100 ring-1 ring-blue-500/30 shadow-[0_4px_15px_rgba(77,142,255,0.1)]"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  )}
                >
                  {er.label}
                  {selected && (
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Staff Structure */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4 text-blue-500" />
            <p className="text-zinc-300 text-sm font-bold uppercase tracking-wider">
              {t.step02.staffStructureLabel}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {t.step02.staffStructures.map((ss) => {
              const selected = answers.staffStructure === ss.value;
              return (
                <button
                  key={ss.value}
                  type="button"
                  onClick={() => updateAnswers({ staffStructure: ss.value })}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border text-right transition-all group",
                    selected
                      ? "border-blue-500 bg-blue-500/10 text-blue-100 shadow-[0_4px_15px_rgba(77,142,255,0.1)]"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <span className="text-sm font-bold">{ss.label}</span>
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                    selected ? "bg-blue-600 border-blue-500" : "bg-zinc-800 border-zinc-700 group-hover:border-zinc-600"
                  )}>
                    {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Department Option */}
        <section className="space-y-4">
           <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <p className="text-zinc-300 text-sm font-bold uppercase tracking-wider">
              {t.step02.hasDeptLabel}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {t.step02.deptOptions.map((opt) => {
               const selected = answers.hasSeparateDepts === opt.value;
               return (
                 <button
                   key={String(opt.value)}
                   type="button"
                   onClick={() => updateAnswers({ hasSeparateDepts: opt.value })}
                   className={cn(
                     "flex items-center gap-3 p-4 rounded-xl border transition-all",
                     selected
                       ? "border-blue-500 bg-blue-500/10 text-blue-100"
                       : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                   )}
                 >
                   <div className={cn(
                     "w-4 h-4 rounded-full border flex items-center justify-center",
                     selected ? "border-blue-500 bg-blue-500" : "border-zinc-700"
                   )}>
                     {selected && <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                   </div>
                   <span className="text-sm font-bold">{opt.label}</span>
                 </button>
               );
             })}
          </div>
        </section>
      </div>
    </StepCard>
  );
}
