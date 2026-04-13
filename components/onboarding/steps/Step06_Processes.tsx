"use client";

import { useState, KeyboardEvent } from "react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { ProcessInput } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useT, useLanguage } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

// English values are stored in DB; Hebrew labels are display-only
type SuggestionPair = { value: string; label: string };

const PROCESS_SUGGESTIONS_EN: Record<string, SuggestionPair[]> = {
  Sales: [
    { value: "Lead generation", label: "Lead generation" },
    { value: "Prospect outreach", label: "Prospect outreach" },
    { value: "Demo calls", label: "Demo calls" },
    { value: "Proposal creation", label: "Proposal creation" },
    { value: "Contract signing", label: "Contract signing" },
    { value: "CRM updates", label: "CRM updates" },
    { value: "Pipeline review", label: "Pipeline review" },
  ],
  Marketing: [
    { value: "Content creation", label: "Content creation" },
    { value: "Social media posting", label: "Social media posting" },
    { value: "Email campaigns", label: "Email campaigns" },
    { value: "Ad management", label: "Ad management" },
    { value: "SEO updates", label: "SEO updates" },
    { value: "Analytics reporting", label: "Analytics reporting" },
  ],
  Operations: [
    { value: "Onboarding new clients", label: "Onboarding new clients" },
    { value: "Project tracking", label: "Project tracking" },
    { value: "Vendor management", label: "Vendor management" },
    { value: "Process documentation", label: "Process documentation" },
    { value: "Inventory management", label: "Inventory management" },
  ],
  Finance: [
    { value: "Invoicing", label: "Invoicing" },
    { value: "Expense tracking", label: "Expense tracking" },
    { value: "Payroll", label: "Payroll" },
    { value: "Monthly reporting", label: "Monthly reporting" },
    { value: "Budget reviews", label: "Budget reviews" },
    { value: "Collections", label: "Collections" },
  ],
  "Customer Support": [
    { value: "Handling inquiries", label: "Handling inquiries" },
    { value: "Ticket management", label: "Ticket management" },
    { value: "Refund processing", label: "Refund processing" },
    { value: "Knowledge base updates", label: "Knowledge base updates" },
    { value: "Follow-up outreach", label: "Follow-up outreach" },
  ],
  "Customer Success": [
    { value: "Onboarding calls", label: "Onboarding calls" },
    { value: "Health check-ins", label: "Health check-ins" },
    { value: "Renewal management", label: "Renewal management" },
    { value: "Upsell outreach", label: "Upsell outreach" },
    { value: "Churn analysis", label: "Churn analysis" },
  ],
  Engineering: [
    { value: "Code reviews", label: "Code reviews" },
    { value: "Bug triage", label: "Bug triage" },
    { value: "Deployment", label: "Deployment" },
    { value: "Sprint planning", label: "Sprint planning" },
    { value: "Technical documentation", label: "Technical documentation" },
    { value: "On-call / incident response", label: "On-call / incident response" },
  ],
  HR: [
    { value: "Recruiting", label: "Recruiting" },
    { value: "Interviewing", label: "Interviewing" },
    { value: "Onboarding new hires", label: "Onboarding new hires" },
    { value: "Performance reviews", label: "Performance reviews" },
    { value: "Payroll", label: "Payroll" },
    { value: "Benefits administration", label: "Benefits administration" },
  ],
};

const PROCESS_SUGGESTIONS_HE: Record<string, SuggestionPair[]> = {
  Sales: [
    { value: "Lead generation", label: "יצירת לידים" },
    { value: "Prospect outreach", label: "פנייה ללקוחות פוטנציאליים" },
    { value: "Demo calls", label: "שיחות הדגמה" },
    { value: "Proposal creation", label: "כתיבת הצעות מחיר" },
    { value: "Contract signing", label: "חתימת חוזים" },
    { value: "CRM updates", label: "עדכון CRM" },
    { value: "Pipeline review", label: "סקירת צינור מכירות" },
  ],
  Marketing: [
    { value: "Content creation", label: "יצירת תוכן" },
    { value: "Social media posting", label: "פרסום ברשתות חברתיות" },
    { value: "Email campaigns", label: "קמפיינים באימייל" },
    { value: "Ad management", label: "ניהול פרסום" },
    { value: "SEO updates", label: "עדכוני SEO" },
    { value: "Analytics reporting", label: "דיווח אנליטיקה" },
  ],
  Operations: [
    { value: "Onboarding new clients", label: "קליטת לקוחות חדשים" },
    { value: "Project tracking", label: "מעקב פרויקטים" },
    { value: "Vendor management", label: "ניהול ספקים" },
    { value: "Process documentation", label: "תיעוד תהליכים" },
    { value: "Inventory management", label: "ניהול מלאי" },
  ],
  Finance: [
    { value: "Invoicing", label: "הנפקת חשבוניות" },
    { value: "Expense tracking", label: "מעקב הוצאות" },
    { value: "Payroll", label: "שכר" },
    { value: "Monthly reporting", label: "דיווח חודשי" },
    { value: "Budget reviews", label: "סקירת תקציב" },
    { value: "Collections", label: "גבייה" },
  ],
  "Customer Support": [
    { value: "Handling inquiries", label: "טיפול בפניות" },
    { value: "Ticket management", label: "ניהול טיקטים" },
    { value: "Refund processing", label: "עיבוד החזרים" },
    { value: "Knowledge base updates", label: "עדכון בסיס ידע" },
    { value: "Follow-up outreach", label: "פנייה מעקב" },
  ],
  "Customer Success": [
    { value: "Onboarding calls", label: "שיחות קליטה" },
    { value: "Health check-ins", label: "בדיקות מצב" },
    { value: "Renewal management", label: "ניהול חידושים" },
    { value: "Upsell outreach", label: "פנייה להרחבת שירות" },
    { value: "Churn analysis", label: "ניתוח נטישה" },
  ],
  Engineering: [
    { value: "Code reviews", label: "סקירות קוד" },
    { value: "Bug triage", label: "סיווג באגים" },
    { value: "Deployment", label: "פריסה" },
    { value: "Sprint planning", label: "תכנון ספרינט" },
    { value: "Technical documentation", label: "תיעוד טכני" },
    { value: "On-call / incident response", label: "כוננות / תגובה לאירועים" },
  ],
  HR: [
    { value: "Recruiting", label: "גיוס" },
    { value: "Interviewing", label: "ראיונות" },
    { value: "Onboarding new hires", label: "קליטת עובדים חדשים" },
    { value: "Performance reviews", label: "שיחות משוב" },
    { value: "Payroll", label: "שכר" },
    { value: "Benefits administration", label: "ניהול הטבות" },
  ],
};

const DEFAULT_SUGGESTIONS_EN: SuggestionPair[] = [
  { value: "Planning meetings", label: "Planning meetings" },
  { value: "Status updates", label: "Status updates" },
  { value: "Reporting", label: "Reporting" },
  { value: "Communication", label: "Communication" },
  { value: "Documentation", label: "Documentation" },
];

const DEFAULT_SUGGESTIONS_HE: SuggestionPair[] = [
  { value: "Planning meetings", label: "פגישות תכנון" },
  { value: "Status updates", label: "עדכוני סטטוס" },
  { value: "Reporting", label: "דיווח" },
  { value: "Communication", label: "תקשורת פנימית" },
  { value: "Documentation", label: "תיעוד" },
];

function getSuggestions(deptName: string, lang: "he" | "en"): SuggestionPair[] {
  const map = lang === "he" ? PROCESS_SUGGESTIONS_HE : PROCESS_SUGGESTIONS_EN;
  const defaults = lang === "he" ? DEFAULT_SUGGESTIONS_HE : DEFAULT_SUGGESTIONS_EN;
  const key = Object.keys(map).find(
    (k) => k.toLowerCase() === deptName.toLowerCase()
  );
  return key ? map[key] : defaults;
}

export function Step06_Processes({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const t = useT();
  const { lang } = useLanguage();

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
      title={t.step06.title}
      subtitle={t.step06.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={answers.processes.length === 0}
    >
      <div className="space-y-8">
        {answers.departments.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            {t.step06.noDepts}
          </p>
        ) : (
          answers.departments.map((dept) => {
            const suggestions = getSuggestions(dept.name, lang);
            const deptProcs = deptProcesses(dept.name);

            return (
              <div key={dept.name} className="space-y-3">
                {/* Section header */}
                <div className="flex items-center gap-2">
                  <h3 className="text-zinc-200 font-semibold text-sm">{dept.name}</h3>
                  <div className="h-px flex-1 bg-zinc-800" />
                  {deptProcs.length > 0 && (
                    <span className="text-blue-400 text-xs">
                      {t.step06.addedCount(deptProcs.length)}
                    </span>
                  )}
                </div>

                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => {
                    const added = isProcessAdded(suggestion.value, dept.name);
                    return (
                      <button
                        key={suggestion.value}
                        type="button"
                        onClick={() => toggleProcess(suggestion.value, dept.name)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-xs transition-all",
                          added
                            ? "border-blue-500 bg-blue-600/20 text-blue-300"
                            : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                        )}
                      >
                        {added ? "✓ " : "+ "}
                        {suggestion.label}
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
                  placeholder={t.step06.customPlaceholder(dept.name)}
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
                          {t.step06.frequencies.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
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
                          {proc.isManual ? t.step06.manualConfirmed : t.step06.manualQuestion}
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
