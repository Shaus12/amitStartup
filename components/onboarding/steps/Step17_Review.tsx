"use client";

import { useState } from "react";
import { CheckCircle2, ChevronLeft, Sparkles } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { OnboardingGateModal } from "@/components/onboarding/OnboardingGateModal";

interface Props {
  onBack: () => void;
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800/40 pb-2">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-zinc-500 font-medium">{label}</span>
      <span className="text-zinc-200 font-bold">{value}</span>
    </div>
  );
}

function goalOptionList(t: ReturnType<typeof useT>) {
  const s = t.step16 as { options?: { value: string; label: string }[]; goals?: { value: string; label: string }[] };
  return s.options ?? s.goals ?? [];
}

export function Step17_Review({ onBack }: Props) {
  const { answers } = useOnboardingStore();
  const [gateOpen, setGateOpen] = useState(false);
  const t = useT();
  const goalOpts = goalOptionList(t);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <OnboardingGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onboardingPayload={answers as unknown as Record<string, unknown>}
      />

      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
          <Sparkles className="w-3 h-3" />
          {t.step17.title}
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter">{t.step17.headline}</h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed">{t.step17.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard title={t.step17.sections.business}>
          <SummaryItem label={t.step17.labels.name} value={answers.businessName} />
          <SummaryItem label={t.step17.labels.type} value={answers.businessType} />
          <SummaryItem label={t.step17.labels.teamSize} value={answers.employeeRange} />
          <SummaryItem label={t.step17.labels.revenue} value={answers.revenueRange} />
        </SummaryCard>

        <SummaryCard title={t.step17.sections.metrics}>
          <SummaryItem
            label={t.step17.metricLabels.closeRate}
            value={answers.closeRate ? `${answers.closeRate}%` : undefined}
          />
          <SummaryItem
            label={t.step17.metricLabels.avgDeal}
            value={answers.avgDealSize ? `₪${answers.avgDealSize}` : undefined}
          />
          <SummaryItem
            label={t.step17.metricLabels.timeComms}
            value={answers.timeSpentComms ? `${answers.timeSpentComms}` : undefined}
          />
        </SummaryCard>

        <SummaryCard title={t.step17.sections.summary}>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-blue-100">
                {t.step17.summaryCounts(answers.departments.length, answers.processes.length)}
              </span>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title={t.step17.sections.goals}>
          <div className="flex flex-wrap gap-2 pt-1">
            {answers.goals.map((goal, i) => {
              const goalLabel = goalOpts.find((o) => o.value === goal)?.label || goal;
              return (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-800 text-[12px] font-medium text-zinc-300"
                >
                  {goalLabel}
                </span>
              );
            })}
          </div>
        </SummaryCard>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-sm font-bold transition-all"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          {t.step17.backBtn}
        </button>

        <button
          type="button"
          onClick={() => setGateOpen(true)}
          className={cn(
            "flex-1 w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-lg font-black transition-all shadow-xl shadow-blue-500/10",
            "bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {t.step17.generateBtn}
        </button>
      </div>
    </div>
  );
}
