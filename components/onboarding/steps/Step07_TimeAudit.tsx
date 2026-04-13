"use client";

import { useEffect } from "react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { TimeAuditEntry } from "@/lib/types/onboarding";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";
import { AlertTriangle, Flame } from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step07_TimeAudit({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  // Pre-populate timeAudit from processes if not already set
  useEffect(() => {
    if (answers.timeAudit.length === 0 && answers.processes.length > 0) {
      const topProcesses = answers.processes.slice(0, 6);
      updateAnswers({
        timeAudit: topProcesses.map((p) => ({
          processName: p.name,
          departmentName: p.departmentName,
          hoursPerWeek: 0,
          peopleInvolved: 1,
        })),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayEntries =
    answers.timeAudit.length > 0
      ? answers.timeAudit
      : answers.processes.slice(0, 6).map((p) => ({
          processName: p.name,
          departmentName: p.departmentName,
          hoursPerWeek: 0,
          peopleInvolved: 1,
        }));

  function updateEntry(
    processName: string,
    departmentName: string,
    changes: Partial<TimeAuditEntry>
  ) {
    const currentAudit =
      answers.timeAudit.length > 0
        ? answers.timeAudit
        : displayEntries;

    const exists = currentAudit.some(
      (e) => e.processName === processName && e.departmentName === departmentName
    );

    if (exists) {
      updateAnswers({
        timeAudit: currentAudit.map((e) =>
          e.processName === processName && e.departmentName === departmentName
            ? { ...e, ...changes }
            : e
        ),
      });
    } else {
      updateAnswers({
        timeAudit: [
          ...currentAudit,
          {
            processName,
            departmentName,
            hoursPerWeek: 0,
            peopleInvolved: 1,
            ...changes,
          },
        ],
      });
    }
  }

  function getEntry(processName: string, departmentName: string): TimeAuditEntry {
    return (
      displayEntries.find(
        (e) => e.processName === processName && e.departmentName === departmentName
      ) ?? {
        processName,
        departmentName,
        hoursPerWeek: 0,
        peopleInvolved: 1,
      }
    );
  }

  const totalHours = displayEntries.reduce(
    (sum, e) => {
      const entry = getEntry(e.processName, e.departmentName);
      return sum + entry.hoursPerWeek * entry.peopleInvolved;
    },
    0
  );

  return (
    <StepCard
      title={t.step07.title}
      subtitle={t.step07.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextLabel="Continue"
    >
      <div className="space-y-6">
        {displayEntries.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            {t.step07.noProcesses}
          </p>
        ) : (
          <>
            {displayEntries.map((item) => {
              const entry = getEntry(item.processName, item.departmentName);
              const weeklyTotal = entry.hoursPerWeek * entry.peopleInvolved;
              const isHigh = entry.hoursPerWeek >= 15;
              const isCritical = entry.hoursPerWeek >= 25;
              return (
                <div
                  key={`${item.departmentName}|${item.processName}`}
                  className="rounded-xl p-4 space-y-3 transition-all duration-200"
                  style={{
                    backgroundColor: isCritical ? "rgba(248,113,113,0.06)" : isHigh ? "rgba(251,146,60,0.06)" : "rgba(39,39,42,0.5)",
                    border: isCritical ? "1px solid rgba(248,113,113,0.3)" : isHigh ? "1px solid rgba(251,146,60,0.25)" : "1px solid rgba(63,63,70,0.5)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400 text-xs shrink-0">
                      {item.departmentName}
                    </span>
                    <span className="text-zinc-200 text-sm font-medium leading-tight flex-1">
                      {item.processName}
                    </span>
                    {isCritical && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0" style={{ backgroundColor: "rgba(248,113,113,0.15)", color: "#f87171" }}>
                        <Flame className="w-3 h-3" /> בעיה קריטית
                      </span>
                    )}
                    {isHigh && !isCritical && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0" style={{ backgroundColor: "rgba(251,146,60,0.15)", color: "#fb923c" }}>
                        <AlertTriangle className="w-3 h-3" /> עומס גבוה
                      </span>
                    )}
                  </div>

                  {/* Hours per week slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-zinc-400 text-xs">{t.step07.hoursLabel}</label>
                      <span className="text-blue-300 text-xs font-semibold">
                        {entry.hoursPerWeek}h
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      step={0.5}
                      value={entry.hoursPerWeek}
                      onChange={(e) =>
                        updateEntry(item.processName, item.departmentName, {
                          hoursPerWeek: parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: isCritical ? "#f87171" : isHigh ? "#fb923c" : "#4d8eff" }}
                    />
                    {isCritical && (
                      <p className="text-[10px] leading-relaxed" style={{ color: "#f87171" }}>
                        🔥 תהליך זה לוקח יותר מ-25 שעות בשבוע — זה מועמד ראשון לאוטומציה מלאה
                      </p>
                    )}
                    {isHigh && !isCritical && (
                      <p className="text-[10px] leading-relaxed" style={{ color: "#fb923c" }}>
                        ⚡ עומס גבוה — עסקים דומים חסכו כאן 60-80% מהזמן עם AI
                      </p>
                    )}
                    <div className="flex justify-between text-zinc-600 text-xs">
                      <span>0h</span>
                      <span>40h</span>
                    </div>
                  </div>

                  {/* People involved */}
                  <div className="flex items-center gap-3">
                    <label className="text-zinc-400 text-xs shrink-0">
                      {t.step07.peopleLabel}
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      value={entry.peopleInvolved}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1) {
                          updateEntry(item.processName, item.departmentName, {
                            peopleInvolved: val,
                          });
                        }
                      }}
                      className="w-20 h-8 bg-zinc-700/50 border-zinc-600 text-zinc-200 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    <span className="text-zinc-500 text-xs">
                      {t.step07.totalWk((entry.hoursPerWeek * entry.peopleInvolved).toFixed(1))}
                    </span>
                  </div>
                </div>
              );
            })}

            {totalHours > 0 && (
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-300 text-sm font-semibold">
                  {t.step07.totalHours(totalHours.toFixed(1))}
                </p>
                <p className="text-blue-400/70 text-xs mt-0.5">
                  {t.step07.acrossProcesses(displayEntries.length)}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </StepCard>
  );
}
