"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DepartmentWithProcesses } from "@/lib/types/business-map";

interface DepartmentDetailSheetProps {
  department: DepartmentWithProcesses | null;
  open: boolean;
  onClose: () => void;
}

function FrequencyBadge({ frequency }: { frequency: string | null }) {
  if (!frequency) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
      {frequency}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  switch (severity) {
    case "high":
      return (
        <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
          High
        </span>
      );
    case "medium":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
          Medium
        </span>
      );
    case "low":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
          Low
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
          {severity}
        </span>
      );
  }
}

function ImpactTypeBadge({ impactType }: { impactType: string }) {
  switch (impactType) {
    case "time_savings":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
          Time Savings
        </span>
      );
    case "cost_savings":
      return (
        <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
          Cost Savings
        </span>
      );
    case "revenue":
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
          Revenue
        </span>
      );
    case "quality":
      return (
        <span className="inline-flex items-center rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
          Quality
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
          {impactType}
        </span>
      );
  }
}

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-green-400",
    at_risk: "bg-red-400",
    needs_attention: "bg-amber-400",
  };
  const color = colorMap[status] ?? "bg-zinc-400";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />;
}

function StatusLabel({ status }: { status: string }) {
  const labelMap: Record<string, string> = {
    active: "Active",
    at_risk: "At Risk",
    needs_attention: "Needs Attention",
  };
  return (
    <span className="text-sm text-zinc-400">{labelMap[status] ?? status}</span>
  );
}

export function DepartmentDetailSheet({
  department,
  open,
  onClose,
}: DepartmentDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-zinc-900 border-zinc-800 overflow-y-auto"
      >
        {department && (
          <div className="flex flex-col gap-6 py-2">
            {/* Header */}
            <SheetHeader className="gap-2">
              <SheetTitle className="text-xl font-bold text-zinc-100">
                {department.name}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: department.color }}
                />
                <StatusDot status={department.status} />
                <StatusLabel status={department.status} />
                {department.headcount !== null && (
                  <span className="text-xs text-zinc-500 ml-2">
                    {department.headcount} people
                  </span>
                )}
              </div>
              {department.description && (
                <p className="text-sm text-zinc-400">{department.description}</p>
              )}
            </SheetHeader>

            {/* Key Processes */}
            <section>
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Key Processes
              </h3>
              {department.processes.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">None added</p>
              ) : (
                <ul className="space-y-3">
                  {department.processes.map((process) => (
                    <li
                      key={process.id}
                      className="flex flex-col gap-1.5 rounded-lg bg-zinc-800 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-medium text-zinc-100">
                          {process.name}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <FrequencyBadge frequency={process.frequency ?? null} />
                          {process.isManual && (
                            <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                              Manual
                            </span>
                          )}
                        </div>
                      </div>
                      {(process.timeSpentHrsPerWeek ?? 0) > 0 && (
                          <span className="text-xs text-zinc-500">
                            ~{process.timeSpentHrsPerWeek} hrs/week
                          </span>
                        )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Pain Points */}
            <section>
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Pain Points
              </h3>
              {department.painPoints.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">None added</p>
              ) : (
                <ul className="space-y-2.5">
                  {department.painPoints.map((pain) => (
                    <li
                      key={pain.id}
                      className="flex items-start gap-2 rounded-lg bg-zinc-800 px-3 py-2.5"
                    >
                      <SeverityBadge severity={pain.severity} />
                      <span className="text-sm text-zinc-300 leading-snug">
                        {pain.description}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* AI Opportunities */}
            <section>
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                AI Opportunities
              </h3>
              {department.aiOpportunities.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">None added</p>
              ) : (
                <ul className="space-y-2.5">
                  {department.aiOpportunities.map((opp) => (
                    <li
                      key={opp.id}
                      className="flex items-start gap-2 rounded-lg bg-zinc-800 px-3 py-2.5"
                    >
                      <ImpactTypeBadge impactType={opp.impactType} />
                      <span className="text-sm text-zinc-100 font-medium leading-snug">
                        {opp.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
