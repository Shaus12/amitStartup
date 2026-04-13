"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { ToolInput } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const TOOL_CATEGORIES: { category: string; tools: string[] }[] = [
  {
    category: "CRM",
    tools: [
      "HubSpot",
      "Salesforce",
      "Pipedrive",
      "Notion CRM",
      "Airtable",
      "Spreadsheet only",
    ],
  },
  {
    category: "Communication",
    tools: ["Slack", "WhatsApp Business", "Microsoft Teams", "Email only"],
  },
  {
    category: "Finance",
    tools: ["QuickBooks", "Xero", "Excel/Sheets", "Manual invoicing"],
  },
  {
    category: "Project Mgmt",
    tools: ["Asana", "Monday.com", "Trello", "Jira", "ClickUp", "Nothing formal"],
  },
  {
    category: "Analytics",
    tools: [
      "Google Analytics",
      "Looker/Tableau",
      "Manual reports",
      "Nothing",
    ],
  },
  {
    category: "Support",
    tools: ["Zendesk", "Intercom", "Email inbox", "Nothing"],
  },
];

export function Step05_ToolsStack({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  function isSelected(toolName: string) {
    return answers.tools.some((t) => t.name === toolName);
  }

  function toggleTool(toolName: string, category: string) {
    const exists = isSelected(toolName);
    if (exists) {
      updateAnswers({
        tools: answers.tools.filter((t) => t.name !== toolName),
      });
    } else {
      updateAnswers({
        tools: [
          ...answers.tools,
          { name: toolName, category, isManualProcess: false },
        ],
      });
    }
  }

  function toggleManual(toolName: string) {
    updateAnswers({
      tools: answers.tools.map((t) =>
        t.name === toolName
          ? { ...t, isManualProcess: !t.isManualProcess }
          : t
      ),
    });
  }

  function getToolEntry(toolName: string): ToolInput | undefined {
    return answers.tools.find((t) => t.name === toolName);
  }

  return (
    <StepCard
      title={t.step05.title}
      subtitle={t.step05.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextLabel="Continue"
    >
      <div className="space-y-6">
        {TOOL_CATEGORIES.map(({ category, tools }) => (
          <div key={category}>
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => {
                const selected = isSelected(tool);
                const entry = getToolEntry(tool);
                return (
                  <div key={tool} className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => toggleTool(tool, category)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-sm transition-all",
                        selected
                          ? "border-blue-500 bg-blue-600/20 text-blue-300"
                          : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                      )}
                    >
                      {tool}
                    </button>
                    {selected && (
                      <button
                        type="button"
                        onClick={() => toggleManual(tool)}
                        className={cn(
                          "px-2 py-0.5 rounded-full border text-xs transition-all self-start",
                          entry?.isManualProcess
                            ? "border-amber-500 bg-amber-600/20 text-amber-300"
                            : "border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        {entry?.isManualProcess ? t.step05.manualConfirmed : t.step05.manualLabel}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Software Spend */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            {t.step05.spendLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.step05.spendRanges.map((sr) => {
              const selected = answers.softwareSpend === sr.value;
              return (
                <button
                  key={sr.value}
                  type="button"
                  onClick={() =>
                    updateAnswers({
                      softwareSpend: selected ? "" : sr.value,
                    })
                  }
                  className={cn(
                    "px-4 py-2 rounded-xl border text-sm transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {sr.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected tools summary */}
        {answers.tools.length > 0 && (
          <p className="text-zinc-500 text-xs">
            {t.step05.toolsSelected(answers.tools.length)}
            {answers.tools.filter((tool) => tool.isManualProcess).length > 0 &&
              ` · ${t.step05.manualFlagged(answers.tools.filter((tool) => tool.isManualProcess).length)}`}
          </p>
        )}
      </div>
    </StepCard>
  );
}
