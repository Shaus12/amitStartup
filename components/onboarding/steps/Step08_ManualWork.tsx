"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { AlertTriangle, Flame } from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

// English values used for storage/comparison with answers.manualTasks
const MANUAL_TASK_VALUES = [
  "Copy-paste data between tools",
  "Send similar emails or messages repeatedly",
  "Create weekly or monthly reports manually",
  "Schedule meetings back-and-forth",
  "Re-enter data from one system to another",
  "Follow up with leads or customers manually",
  "Answer the same customer questions repeatedly",
  "Create invoices and track payments manually",
  "Post to social media manually",
  "Review and approve routine documents",
];

export function Step08_ManualWork({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  function toggleTask(task: string) {
    const isSelected = answers.manualTasks.includes(task);
    if (isSelected) {
      updateAnswers({
        manualTasks: answers.manualTasks.filter((t) => t !== task),
      });
    } else {
      updateAnswers({
        manualTasks: [...answers.manualTasks, task],
      });
    }
  }

  const selectedCount = answers.manualTasks.length;
  const isHigh = selectedCount >= 5;
  const isCritical = selectedCount >= 8;

  return (
    <StepCard
      title={t.step08.title}
      subtitle={t.step08.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextLabel="Continue"
    >
      <div className="space-y-2">
        {MANUAL_TASK_VALUES.map((taskValue, i) => {
          const selected = answers.manualTasks.includes(taskValue);
          return (
            <button
              key={taskValue}
              type="button"
              onClick={() => toggleTask(taskValue)}
              className="w-full flex items-center gap-4 text-left px-4 py-3.5 rounded-xl border transition-all duration-150"
              style={{
                backgroundColor: selected ? "rgba(77,142,255,0.08)" : "rgba(39,39,42,0.5)",
                borderColor: selected ? "rgba(77,142,255,0.5)" : "rgba(63,63,70,0.5)",
                color: selected ? "#e2e2eb" : "#a1a1aa",
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(63,63,70,0.9)";
                  (e.currentTarget as HTMLElement).style.color = "#e2e2eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(63,63,70,0.5)";
                  (e.currentTarget as HTMLElement).style.color = "#a1a1aa";
                }
              }}
            >
              <span
                className="h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: selected ? "#4d8eff" : "rgba(63,63,70,0.8)",
                  backgroundColor: selected ? "#4d8eff" : "transparent",
                }}
              >
                {selected && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                )}
              </span>
              <span className="text-sm">{t.step08.taskLabels[i]}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic urgency banner */}
      {isCritical && (
        <div
          className="mt-4 flex items-start gap-3 rounded-xl px-4 py-3.5"
          style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}
        >
          <Flame className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#f87171" }} />
          <div>
            <p className="text-xs font-bold" style={{ color: "#f87171" }}>
              {selectedCount} תהליכים ידניים — עסק זה מאבד שעות רבות בשבוע
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(248,113,113,0.7)" }}>
              עסקים עם רמת ידניות כזו חסכו בממוצע 30-45 שעות שבועיות לאחר יישום AI
            </p>
          </div>
        </div>
      )}
      {isHigh && !isCritical && (
        <div
          className="mt-4 flex items-start gap-3 rounded-xl px-4 py-3.5"
          style={{ backgroundColor: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)" }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#fb923c" }} />
          <div>
            <p className="text-xs font-bold" style={{ color: "#fb923c" }}>
              {selectedCount} תהליכים ידניים זוהו
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(251,146,60,0.7)" }}>
              יש כאן פוטנציאל חיסכון משמעותי — האנליזה שלנו תזהה בדיוק מה ניתן לאוטמט
            </p>
          </div>
        </div>
      )}
      {selectedCount > 0 && !isHigh && (
        <p className="mt-3 text-xs" style={{ color: "rgba(77,142,255,0.7)" }}>
          {t.step08.selectedCount(selectedCount)}
        </p>
      )}
    </StepCard>
  );
}
