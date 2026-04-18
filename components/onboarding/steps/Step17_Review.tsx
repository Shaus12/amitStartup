"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ChevronLeft, Sparkles } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

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

const STAGES = [
  "שומר פרטי עסק...",
  "ממפה מחלקות ותהליכים...",
  "מנתח נתונים עם AI...",
  "מחשב הזדמנויות חיסכון...",
  "בונה מפת הזדמנויות...",
  "מסיים ניתוח...",
];

export function Step17_Review({ onBack }: Props) {
  const router = useRouter();
  const { answers, setBusinessId } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const t = useT();
  const goalOpts = goalOptionList(t);

  async function handleSubmit() {
    setLoading(true);
    setProgress(0);
    setStageIdx(0);

    // Simulate fast progress to 80%
    let current = 0;
    const intervalId = setInterval(() => {
      current = current + (80 - current) * 0.12;
      if (current >= 79.5) { clearInterval(intervalId); current = 80; }
      setProgress(Math.round(current));
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 2));
    }, 180);

    try {
      const onboardingRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!onboardingRes.ok) {
        clearInterval(intervalId);
        const err = await onboardingRes.json().catch(() => ({}));
        throw new Error(err.details || err.message || err.error || "Failed to save profile");
      }

      const { businessId } = await onboardingRes.json();
      setBusinessId(businessId);
      document.cookie = "onboarding_just_completed=1; path=/; max-age=3600";
      setProgress(55);
      setStageIdx(3);

      const genRes = await fetch("/api/opportunities/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      if (!genRes.ok) {
        const genBody = await genRes.json().catch(() => ({}));
        console.error("Opportunity generation failed:", genBody);
        toast.error(
          genBody.details || genBody.error || "העסק נשמר, אך יצירת מפת ההזדמנויות נכשלה. נסה \"רענון ניתוח\" מהדשבורד."
        );
      }

      clearInterval(intervalId);
      setProgress(100);
      setStageIdx(STAGES.length - 1);
      await new Promise((r) => setTimeout(r, 600));
      router.push("/dashboard");
    } catch (err: any) {
      clearInterval(intervalId);
      toast.error(err.message || "Error saving profile");
      setLoading(false);
      setProgress(0);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
           <Sparkles className="w-3 h-3" />
           {t.step17.title}
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter">
          {t.step17.headline}
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed">
          {t.step17.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Details */}
        <SummaryCard title={t.step17.sections.business}>
          <SummaryItem label={t.step17.labels.name} value={answers.businessName} />
          <SummaryItem label={t.step17.labels.type} value={answers.businessType} />
          <SummaryItem label={t.step17.labels.teamSize} value={answers.employeeRange} />
          <SummaryItem label={t.step17.labels.revenue} value={answers.revenueRange} />
        </SummaryCard>

        {/* Structure & Metrics */}
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

        {/* Totals */}
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

        {/* Goals */}
        <SummaryCard title={t.step17.sections.goals}>
          <div className="flex flex-wrap gap-2 pt-1">
            {answers.goals.map((goal, i) => {
                 const goalLabel = goalOpts.find((o) => o.value === goal)?.label || goal;
                 return (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-800 text-[12px] font-medium text-zinc-300">
                        {goalLabel}
                    </span>
                 );
            })}
          </div>
        </SummaryCard>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-sm font-bold transition-all disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          {t.step17.backBtn}
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={cn(
            "flex-1 w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-lg font-black transition-all shadow-xl shadow-blue-500/10",
            loading
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {loading ? (
            <div className="w-full flex flex-col items-center gap-3 py-1">
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-sm font-semibold text-blue-200">{STAGES[stageIdx]}</span>
                <span className="text-sm font-black tabular-nums text-blue-300">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-700/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: progress === 100
                      ? "linear-gradient(90deg, #22c55e, #86efac)"
                      : "linear-gradient(90deg, #3b82f6, #60a5fa)",
                  }}
                />
              </div>
            </div>
          ) : (
            <>{t.step17.generateBtn}</>
          )}
        </button>
      </div>
    </div>
  );
}
