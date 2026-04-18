"use client";

import { useState, KeyboardEvent } from "react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Input } from "@/components/ui/input";
import { DepartmentInput } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";
import { X, ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step04_Departments({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const [customInput, setCustomInput] = useState("");
  const t = useT();

  const deptNames = answers.departments.map((d) => d.name);

  function toggleSuggestion(name: string) {
    const exists = deptNames.includes(name);
    if (exists) {
      updateAnswers({
        departments: answers.departments.filter((d) => d.name !== name),
      });
    } else {
      updateAnswers({
        departments: [...answers.departments, { name, headcount: 0 }],
      });
    }
  }

  function addCustom() {
    const trimmed = customInput.trim();
    if (!trimmed || deptNames.includes(trimmed)) {
      setCustomInput("");
      return;
    }
    updateAnswers({
      departments: [...answers.departments, { name: trimmed, headcount: 0 }],
    });
    setCustomInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustom();
    }
  }

  function removeDept(name: string) {
    updateAnswers({
      departments: answers.departments.filter((d) => d.name !== name),
    });
  }

  function updateHeadcount(name: string, headcount: number | undefined) {
    updateAnswers({
      departments: answers.departments.map((d) =>
        d.name === name ? { ...d, headcount } : d
      ),
    });
  }

  return (
    <StepCard
      title={t.step04.title}
      subtitle={t.step04.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={answers.departments.length === 0}
    >
      <div className="space-y-8">
        {/* Predefined departments with descriptions */}
        <div>
          <p className="text-zinc-300 text-sm font-semibold mb-3">{t.step04.suggestedLabel}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {t.step04.departments.map((dept: { name: string, desc: string }) => {
              const selected = deptNames.includes(dept.name);
              return (
                <button
                  key={dept.name}
                  type="button"
                  onClick={() => toggleSuggestion(dept.name)}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-xl border text-right transition-all group relative overflow-hidden",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300 ring-1 ring-blue-500/50"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60"
                  )}
                >
                    <div className="flex items-center justify-between w-full mb-1">
                        <span className={cn("text-sm font-bold", selected ? "text-blue-300" : "text-zinc-200")}>
                            {dept.name}
                        </span>
                        {selected && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(77,142,255,0.8)]" />}
                    </div>
                  <span className="text-[11px] leading-snug opacity-70 font-medium">
                    {dept.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom input */}
        <div>
          <p className="text-zinc-300 text-sm font-semibold mb-2">{t.step04.customLabel}</p>
          <div className="flex gap-2">
            <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.step04.customPlaceholder}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
            />
            <button 
                onClick={addCustom}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
                הוסף
            </button>
          </div>
        </div>

        {/* Headcount question */}
        {answers.departments.length > 0 && (
          <div className="pt-6 border-t border-zinc-800/50">
            <div className="mb-4">
                <p className="text-zinc-300 text-sm font-semibold">
                {t.step04.headcountLabel}
                </p>
                <p className="text-zinc-500 text-[11px] italic mt-1 leading-relaxed">
                {t.step04.headcountHelper}
                </p>
            </div>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {answers.departments.map((dept: DepartmentInput) => (
                <div
                  key={dept.name}
                  className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 transition-colors hover:border-zinc-700"
                >
                  <span className="flex-1 text-sm text-zinc-200 font-semibold">
                    {dept.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        min={0}
                        value={dept.headcount ?? ""}
                        onChange={(e) => {
                        const val = e.target.value;
                        updateHeadcount(
                            dept.name,
                            val ? parseInt(val, 10) : 0
                        );
                        }}
                        placeholder={t.step04.peoplePlaceholder}
                        className="w-16 h-9 bg-zinc-800 border-zinc-700 text-zinc-100 text-center font-bold focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    <button
                        type="button"
                        onClick={() => removeDept(dept.name)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #282a30; border-radius: 10px; }
      `}</style>
    </StepCard>
  );
}
