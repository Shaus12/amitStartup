"use client";

import { useState, KeyboardEvent } from "react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Input } from "@/components/ui/input";
import { DepartmentInput } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const SUGGESTIONS_BY_TYPE: Record<string, string[]> = {
  "SaaS / Software": [
    "Engineering",
    "Sales",
    "Marketing",
    "Customer Success",
    "Finance",
    "Operations",
  ],
  Agency: [
    "Client Services",
    "Creative",
    "Strategy",
    "Finance",
    "Operations",
    "Business Development",
  ],
  "E-commerce / Product": [
    "Marketing",
    "Operations",
    "Customer Support",
    "Finance",
    "Warehouse / Logistics",
  ],
};

const DEFAULT_SUGGESTIONS = [
  "Sales",
  "Marketing",
  "Operations",
  "Finance",
  "Customer Support",
  "HR",
];

function getSuggestions(businessType: string): string[] {
  return SUGGESTIONS_BY_TYPE[businessType] ?? DEFAULT_SUGGESTIONS;
}

export function Step04_Departments({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const [customInput, setCustomInput] = useState("");
  const t = useT();

  const suggestions = getSuggestions(answers.businessType);
  const deptNames = answers.departments.map((d) => d.name);

  function toggleSuggestion(name: string) {
    const exists = deptNames.includes(name);
    if (exists) {
      updateAnswers({
        departments: answers.departments.filter((d) => d.name !== name),
      });
    } else {
      updateAnswers({
        departments: [...answers.departments, { name }],
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
      departments: [...answers.departments, { name: trimmed }],
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
      <div className="space-y-6">
        {/* Suggested chips */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">{t.step04.suggestedLabel}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((name) => {
              const selected = deptNames.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleSuggestion(name)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-sm transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/20 text-blue-300"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {selected ? "✓ " : "+ "}
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom input */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-2">{t.step04.customLabel}</p>
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.step04.customPlaceholder}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Added departments list */}
        {answers.departments.length > 0 && (
          <div>
            <p className="text-zinc-300 text-sm font-medium mb-3">
              {t.step04.addedLabel(answers.departments.length)}
            </p>
            <div className="space-y-2">
              {answers.departments.map((dept: DepartmentInput) => (
                <div
                  key={dept.name}
                  className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5"
                >
                  <span className="flex-1 text-sm text-zinc-200 font-medium">
                    {dept.name}
                  </span>
                  <Input
                    type="number"
                    min={1}
                    value={dept.headcount ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateHeadcount(
                        dept.name,
                        val ? parseInt(val, 10) : undefined
                      );
                    }}
                    placeholder={t.step04.peoplePlaceholder}
                    className="w-24 h-8 bg-zinc-700/50 border-zinc-600 text-zinc-200 placeholder:text-zinc-500 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeDept(dept.name)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StepCard>
  );
}
