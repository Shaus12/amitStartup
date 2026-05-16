"use client";

import { useState, KeyboardEvent } from "react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { ProcessInput } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";
import { X, Sparkles, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step06_Processes({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [activeDept, setActiveDept] = useState<string>(answers.departments[0]?.name || "");
  const t = useT();

  const processNames = answers.processes.map((p) => p.name + "|" + p.departmentName);

  function isProcessAdded(processName: string, deptName: string) {
    return processNames.includes(processName + "|" + deptName);
  }

  function toggleProcess(processName: string, deptName: string) {
    const exists = isProcessAdded(processName, deptName);
    if (exists) {
      updateAnswers({
        processes: answers.processes.filter(
          (p) => !(p.name === processName && p.departmentName === deptName)
        ),
      });
    } else {
      updateAnswers({
        processes: [
          ...answers.processes,
          {
            name: processName,
            departmentName: deptName,
            frequency: "daily",
            isManual: true, // Default to true as the spec emphasizes manual waste
          },
        ],
      });
    }
  }

  function updateProcess(
    processName: string,
    deptName: string,
    changes: Partial<ProcessInput>
  ) {
    updateAnswers({
      processes: answers.processes.map((p) =>
        p.name === processName && p.departmentName === deptName
          ? { ...p, ...changes }
          : p
      ),
    });
  }

  function removeProcess(processName: string, deptName: string) {
    updateAnswers({
      processes: answers.processes.filter(
        (p) => !(p.name === processName && p.departmentName === deptName)
      ),
    });
  }

  function handleCustomKeyDown(e: KeyboardEvent<HTMLInputElement>, deptName: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = (customInputs[deptName] ?? "").trim();
      if (!trimmed || isProcessAdded(trimmed, deptName)) {
        setCustomInputs((prev) => ({ ...prev, [deptName]: "" }));
        return;
      }
      updateAnswers({
        processes: [
          ...answers.processes,
          {
            name: trimmed,
            departmentName: deptName,
            frequency: "daily",
            isManual: true,
          },
        ],
      });
      setCustomInputs((prev) => ({ ...prev, [deptName]: "" }));
    }
  }

  const deptProcs = answers.processes.filter((p) => p.departmentName === activeDept);
  const manualCount = answers.processes.filter(p => p.isManual).length;
  const showThresholdMsg = manualCount >= 3;

  return (
    <StepCard
      title={t.step06.title}
      subtitle={t.step06.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={answers.processes.length === 0}
    >
      <div className="space-y-6">
        {/* Department Filter Bar */}
        <div className="flex flex-col gap-3">
          <p className="text-[var(--bv-text-3)] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-3 h-3" />
            {t.step06.deptFilterLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {answers.departments.map((dept) => (
              <button
                key={dept.name}
                type="button"
                onClick={() => setActiveDept(dept.name)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                  activeDept === dept.name
                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                    : "border-[var(--bv-border)] bg-[var(--bv-surface)]/40 text-[var(--bv-muted)] hover:border-[var(--bv-border-subtle)]"
                )}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action area for active department */}
        {activeDept ? (
          <div className="p-5 rounded-2xl bg-[var(--bv-surface)]/40 border border-[var(--bv-border)]/60 shadow-inner space-y-5">
            <div>
              <p className="text-[var(--bv-text-2)] text-sm font-bold mb-3">
                {t.step06.processLabel} ב{activeDept}
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  (t.step06.suggestedProcesses as Record<string, string[] | undefined>)[activeDept] ?? []
                ).map((suggestion: string) => {
                  const added = isProcessAdded(suggestion, activeDept);
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => toggleProcess(suggestion, activeDept)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all",
                        added
                          ? "border-blue-500/50 bg-blue-600/10 text-blue-300"
                          : "border-[var(--bv-border)] bg-[var(--bv-surface-raised)]/50 text-[var(--bv-text-3)] hover:border-[var(--bv-border-subtle)] hover:text-[var(--bv-text-1)]"
                      )}
                    >
                      {added ? "✓ " : "+ "}
                      {suggestion}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
                <Input
                value={customInputs[activeDept] ?? ""}
                onChange={(e) =>
                    setCustomInputs((prev) => ({
                    ...prev,
                    [activeDept]: e.target.value,
                    }))
                }
                onKeyDown={(e) => handleCustomKeyDown(e, activeDept)}
                placeholder={t.step06.addProcessPlaceholder}
                className="bg-[var(--bv-surface)]/60 border-[var(--bv-border)] text-[var(--bv-text-1)] placeholder:text-[var(--bv-muted)] text-sm focus:border-blue-500 focus:ring-blue-500/20 h-10"
                />
            </div>

            {/* Added processes for this dept with configuration */}
            {deptProcs.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[var(--bv-border)]/40">
                    {deptProcs.map((proc) => (
                        <div key={proc.name} className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bv-surface-raised)]/30 border border-[var(--bv-border)]/60">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[var(--bv-text-1)]">{proc.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeProcess(proc.name, activeDept)}
                                    className="p-1 text-[var(--bv-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--bv-muted)] font-bold mb-2">{t.step06.frequencyLabel}</p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {t.step06.frequencies.map((f: any) => (
                                            <button
                                                key={f.value}
                                                onClick={() => updateProcess(proc.name, activeDept, { frequency: f.value })}
                                                className={cn(
                                                    "px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all",
                                                    proc.frequency === f.value 
                                                        ? "border-blue-500/50 bg-blue-500/10 text-blue-300" 
                                                        : "border-[var(--bv-border)] bg-[var(--bv-surface)]/60 text-[var(--bv-muted)] hover:border-[var(--bv-border-subtle)]"
                                                )}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--bv-muted)] font-bold mb-2">{t.step06.typeLabel}</p>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {t.step06.types.map((ty: any) => {
                                            const currentLevel = proc.automationLevel ?? (proc.isManual ? 'manual' : 'semi');
                                            const isSelected = currentLevel === ty.value;
                                            return (
                                                <button
                                                    key={ty.value}
                                                    onClick={() => updateProcess(proc.name, activeDept, { isManual: ty.value === 'manual', automationLevel: ty.value })}
                                                    className={cn(
                                                        "px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all text-center",
                                                        isSelected
                                                            ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                                            : "border-[var(--bv-border)] bg-[var(--bv-surface)]/60 text-[var(--bv-muted)] hover:border-[var(--bv-border-subtle)]"
                                                    )}
                                                >
                                                    {ty.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        ) : (
          <p className="text-[var(--bv-muted)] text-sm text-center py-10 opacity-50">
             בחר מחלקה כדי להוסיף תהליכים
          </p>
        )}

        {/* Threshold Message */}
        {showThresholdMsg && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <p className="text-sm font-bold text-blue-300">
                    {t.step06.thresholdMsg}
                </p>
            </div>
        )}
      </div>
    </StepCard>
  );
}
