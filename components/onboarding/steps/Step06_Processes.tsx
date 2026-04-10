"use client";

import { useState, KeyboardEvent } from "react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { ProcessInput } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PROCESS_SUGGESTIONS: Record<string, string[]> = {
  Sales: [
    "Lead generation",
    "Prospect outreach",
    "Demo calls",
    "Proposal creation",
    "Contract signing",
    "CRM updates",
    "Pipeline review",
  ],
  Marketing: [
    "Content creation",
    "Social media posting",
    "Email campaigns",
    "Ad management",
    "SEO updates",
    "Analytics reporting",
  ],
  Operations: [
    "Onboarding new clients",
    "Project tracking",
    "Vendor management",
    "Process documentation",
    "Inventory management",
  ],
  Finance: [
    "Invoicing",
    "Expense tracking",
    "Payroll",
    "Monthly reporting",
    "Budget reviews",
    "Collections",
  ],
  "Customer Support": [
    "Handling inquiries",
    "Ticket management",
    "Refund processing",
    "Knowledge base updates",
    "Follow-up outreach",
  ],
  "Customer Success": [
    "Onboarding calls",
    "Health check-ins",
    "Renewal management",
    "Upsell outreach",
    "Churn analysis",
  ],
  Engineering: [
    "Code reviews",
    "Bug triage",
    "Deployment",
    "Sprint planning",
    "Technical documentation",
    "On-call / incident response",
  ],
  HR: [
    "Recruiting",
    "Interviewing",
    "Onboarding new hires",
    "Performance reviews",
    "Payroll",
    "Benefits administration",
  ],
};

const DEFAULT_SUGGESTIONS = [
  "Planning meetings",
  "Status updates",
  "Reporting",
  "Communication",
  "Documentation",
];

const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly", "Ad-hoc"];

function getSuggestions(deptName: string): string[] {
  const key = Object.keys(PROCESS_SUGGESTIONS).find(
    (k) => k.toLowerCase() === deptName.toLowerCase()
  );
  return key ? PROCESS_SUGGESTIONS[key] : DEFAULT_SUGGESTIONS;
}

export function Step06_Processes({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

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
            frequency: "Weekly",
            isManual: false,
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
            frequency: "Weekly",
            isManual: false,
          },
        ],
      });
      setCustomInputs((prev) => ({ ...prev, [deptName]: "" }));
    }
  }

  const deptProcesses = (deptName: string) =>
    answers.processes.filter((p) => p.departmentName === deptName);

  return (
    <StepCard
      title="Key processes per department"
      subtitle="Select or add the main recurring processes each team is responsible for."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={answers.processes.length === 0}
    >
      <div className="space-y-8">
        {answers.departments.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            No departments added yet. Go back and add departments first.
          </p>
        ) : (
          answers.departments.map((dept) => {
            const suggestions = getSuggestions(dept.name);
            const deptProcs = deptProcesses(dept.name);

            return (
              <div key={dept.name} className="space-y-3">
                {/* Section header */}
                <div className="flex items-center gap-2">
                  <h3 className="text-zinc-200 font-semibold text-sm">{dept.name}</h3>
                  <div className="h-px flex-1 bg-zinc-800" />
                  {deptProcs.length > 0 && (
                    <span className="text-blue-400 text-xs">
                      {deptProcs.length} added
                    </span>
                  )}
                </div>

                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => {
                    const added = isProcessAdded(suggestion, dept.name);
                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => toggleProcess(suggestion, dept.name)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-xs transition-all",
                          added
                            ? "border-blue-500 bg-blue-600/20 text-blue-300"
                            : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                        )}
                      >
                        {added ? "✓ " : "+ "}
                        {suggestion}
                      </button>
                    );
                  })}
                </div>

                {/* Custom input */}
                <Input
                  value={customInputs[dept.name] ?? ""}
                  onChange={(e) =>
                    setCustomInputs((prev) => ({
                      ...prev,
                      [dept.name]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => handleCustomKeyDown(e, dept.name)}
                  placeholder={`Add a custom ${dept.name} process and press Enter`}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 text-sm focus:border-blue-500 focus:ring-blue-500/20 h-9"
                />

                {/* Added processes for this dept */}
                {deptProcs.length > 0 && (
                  <div className="space-y-1.5">
                    {deptProcs.map((proc) => (
                      <div
                        key={proc.name}
                        className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                      >
                        <span className="flex-1 text-xs text-zinc-200 font-medium truncate">
                          {proc.name}
                        </span>

                        {/* Frequency dropdown */}
                        <select
                          value={proc.frequency ?? "Weekly"}
                          onChange={(e) =>
                            updateProcess(proc.name, dept.name, {
                              frequency: e.target.value,
                            })
                          }
                          className="bg-zinc-700 border border-zinc-600 text-zinc-300 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-blue-500"
                        >
                          {FREQUENCY_OPTIONS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>

                        {/* Manual toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            updateProcess(proc.name, dept.name, {
                              isManual: !proc.isManual,
                            })
                          }
                          className={cn(
                            "px-2 py-1 rounded-md border text-xs transition-all whitespace-nowrap",
                            proc.isManual
                              ? "border-amber-500 bg-amber-600/20 text-amber-300"
                              : "border-zinc-600 text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          {proc.isManual ? "Manual ✓" : "Manual?"}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeProcess(proc.name, dept.name)}
                          className="text-zinc-600 hover:text-zinc-400 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </StepCard>
  );
}
