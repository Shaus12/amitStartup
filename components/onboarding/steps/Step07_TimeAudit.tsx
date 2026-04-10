"use client";

import { useEffect } from "react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { TimeAuditEntry } from "@/lib/types/onboarding";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step07_TimeAudit({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

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
      title="Time audit"
      subtitle="This helps us calculate exactly how much time AI can save you each week."
      onNext={onNext}
      onBack={onBack}
      nextLabel="Continue"
    >
      <div className="space-y-6">
        {displayEntries.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            No processes added yet. Go back and add some processes first.
          </p>
        ) : (
          <>
            {displayEntries.map((item) => {
              const entry = getEntry(item.processName, item.departmentName);
              return (
                <div
                  key={`${item.departmentName}|${item.processName}`}
                  className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400 text-xs shrink-0">
                      {item.departmentName}
                    </span>
                    <span className="text-zinc-200 text-sm font-medium leading-tight">
                      {item.processName}
                    </span>
                  </div>

                  {/* Hours per week slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-zinc-400 text-xs">Hours per week</label>
                      <span className="text-blue-300 text-xs font-semibold">
                        {entry.hoursPerWeek}h
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={40}
                      step={0.5}
                      value={entry.hoursPerWeek}
                      onValueChange={(val) =>
                        updateEntry(item.processName, item.departmentName, {
                          hoursPerWeek: typeof val === "number" ? val : (val as number[])[0],
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-zinc-600 text-xs">
                      <span>0h</span>
                      <span>40h</span>
                    </div>
                  </div>

                  {/* People involved */}
                  <div className="flex items-center gap-3">
                    <label className="text-zinc-400 text-xs shrink-0">
                      People involved
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
                      = {(entry.hoursPerWeek * entry.peopleInvolved).toFixed(1)}h total/wk
                    </span>
                  </div>
                </div>
              );
            })}

            {totalHours > 0 && (
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-300 text-sm font-semibold">
                  {totalHours.toFixed(1)} total team-hours per week
                </p>
                <p className="text-blue-400/70 text-xs mt-0.5">
                  across {displayEntries.length} tracked process
                  {displayEntries.length !== 1 ? "es" : ""}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </StepCard>
  );
}
