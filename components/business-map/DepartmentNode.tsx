"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Clock, Users, Activity, AlertTriangle, Zap, ChevronRight } from "lucide-react";

export interface DepartmentNodeData extends Record<string, unknown> {
  label: string;
  color: string;
  status: string;
  headcount: number | null;
  processes: {
    id: string;
    name: string;
    timeSpentHrsPerWeek: number | null;
    isManual: boolean;
    frequency: string | null;
  }[];
  painPointCount: number;
  opportunityCount: number;
  onSelect: () => void;
}

export type DepartmentNodeType = Node<DepartmentNodeData, "department">;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:           { label: "Healthy",  color: "#34d399" },
  at_risk:          { label: "At Risk",  color: "#f87171" },
  needs_attention:  { label: "Review",   color: "#fbbf24" },
};

const FREQ_LABEL: Record<string, string> = {
  daily:    "Daily",
  weekly:   "Wkly",
  monthly:  "Mo",
  "ad-hoc": "Ad-hoc",
};

export function DepartmentNode({ data }: NodeProps<DepartmentNodeType>) {
  const visibleProcesses = data.processes.slice(0, 5);
  const extraCount = Math.max(0, data.processes.length - 5);
  const totalHrs = data.processes.reduce((s, p) => s + (p.timeSpentHrsPerWeek ?? 0), 0);
  const manualCount = data.processes.filter(p => p.isManual).length;
  const manualPct = data.processes.length > 0 ? Math.round((manualCount / data.processes.length) * 100) : 0;
  const status = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.active;

  return (
    <>
      <Handle type="source" position={Position.Top}    className="opacity-0 !w-0 !h-0 !min-w-0 !min-h-0" />
      <Handle type="target" position={Position.Top}    className="opacity-0 !w-0 !h-0 !min-w-0 !min-h-0" />

      <div
        onClick={data.onSelect}
        className="w-[300px] cursor-pointer group transition-all duration-200"
        style={{
          backgroundColor: "#1e1f26",
          border: "1px solid #282a30",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 0 transparent`,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#424754";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${data.color}20`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#282a30";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)";
        }}
      >
        {/* Color accent bar */}
        <div className="h-[2px] w-full" style={{ backgroundColor: data.color }} />

        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: data.color }} />
            <h3
              className="text-sm font-bold truncate leading-tight"
              style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb" }}
            >
              {data.label}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
            <span
              className="text-[10px] font-semibold"
              style={{ color: status.color, fontFamily: "var(--font-inter)" }}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Metrics row */}
        <div
          className="px-4 pb-3 flex items-center gap-3"
          style={{ borderBottom: "1px solid #282a30" }}
        >
          {data.headcount !== null && (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "#424754" }}>
              <Users className="w-2.5 h-2.5" strokeWidth={2} />
              <span className="font-medium" style={{ color: "#8c909f" }}>{data.headcount}</span>
              <span style={{ fontFamily: "var(--font-inter)" }}>people</span>
            </div>
          )}
          {totalHrs > 0 && (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "#424754" }}>
              <Clock className="w-2.5 h-2.5" strokeWidth={2} />
              <span className="font-medium" style={{ color: "#8c909f" }}>{totalHrs}h</span>
              <span style={{ fontFamily: "var(--font-inter)" }}>/wk</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px]" style={{ color: "#424754" }}>
            <Activity className="w-2.5 h-2.5" strokeWidth={2} />
            <span className="font-medium" style={{ color: "#8c909f" }}>{data.processes.length}</span>
            <span style={{ fontFamily: "var(--font-inter)" }}>processes</span>
          </div>
        </div>

        {/* Process list */}
        <div className="px-4 py-3 space-y-2 min-h-[88px]">
          {visibleProcesses.length === 0 ? (
            <p className="text-[11px] italic py-2" style={{ color: "#33343b" }}>No processes added yet</p>
          ) : (
            visibleProcesses.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full shrink-0 mt-px" style={{ backgroundColor: data.color + "80" }} />
                <span
                  className="text-[11px] truncate flex-1 leading-tight"
                  style={{ color: "#c2c6d6", fontFamily: "var(--font-inter)" }}
                >
                  {p.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {p.frequency && (
                    <span className="text-[9px] font-medium uppercase tracking-wide" style={{ color: "#424754" }}>
                      {FREQ_LABEL[p.frequency] ?? p.frequency}
                    </span>
                  )}
                  {p.timeSpentHrsPerWeek !== null && p.timeSpentHrsPerWeek > 0 && (
                    <span className="text-[9px] font-semibold tabular-nums" style={{ color: "#8c909f" }}>
                      {p.timeSpentHrsPerWeek}h
                    </span>
                  )}
                  {p.isManual && (
                    <span className="text-[8px] font-bold tracking-wide uppercase" style={{ color: "#fbbf24", opacity: 0.7 }}>M</span>
                  )}
                </div>
              </div>
            ))
          )}
          {extraCount > 0 && (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "#33343b" }}>
              <ChevronRight className="w-2.5 h-2.5" />
              <span style={{ fontFamily: "var(--font-inter)" }}>{extraCount} more</span>
            </div>
          )}
        </div>

        {/* Manual workload bar */}
        {data.processes.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: "#33343b", fontFamily: "var(--font-inter)" }}
              >
                Manual workload
              </span>
              <span
                className="text-[9px] font-bold tabular-nums"
                style={{ color: "#424754", fontFamily: "var(--font-inter)" }}
              >
                {manualPct}%
              </span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: "#282a30" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${manualPct}%`,
                  backgroundColor: manualPct > 70 ? "#fbbf24" : manualPct > 40 ? "#4d8eff" : "#34d399",
                  boxShadow: `0 0 6px ${manualPct > 70 ? "#fbbf2460" : manualPct > 40 ? "#4d8eff60" : "#34d39960"}`,
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        {(data.painPointCount > 0 || data.opportunityCount > 0) && (
          <div
            className="px-4 py-2.5 flex items-center gap-3"
            style={{ borderTop: "1px solid #282a30" }}
          >
            {data.painPointCount > 0 && (
              <div className="flex items-center gap-1 text-[10px]" style={{ color: "#f87171", opacity: 0.8 }}>
                <AlertTriangle className="w-2.5 h-2.5" strokeWidth={2} />
                <span className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
                  {data.painPointCount} issue{data.painPointCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {data.opportunityCount > 0 && (
              <div className="flex items-center gap-1 text-[10px]" style={{ color: "#adc6ff", opacity: 0.8 }}>
                <Zap className="w-2.5 h-2.5" strokeWidth={2} />
                <span className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
                  {data.opportunityCount} AI suggestion{data.opportunityCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px]" style={{ color: "#424754", fontFamily: "var(--font-inter)" }}>View details</span>
              <ChevronRight className="w-2 h-2" style={{ color: "#424754" }} />
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0 !w-0 !h-0 !min-w-0 !min-h-0" />
      <Handle type="target" position={Position.Bottom} className="opacity-0 !w-0 !h-0 !min-w-0 !min-h-0" />
    </>
  );
}
