"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import {
  Clock, Users, Zap, ChevronRight, AlertTriangle,
  Megaphone, TrendingUp, UserCheck, Settings, HeadphonesIcon,
  DollarSign, Code2, Users2, Package, BarChart3, Building2,
} from "lucide-react";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:           { label: "Healthy",  color: "#34d399", bg: "#34d39915" },
  at_risk:          { label: "At Risk",  color: "#f87171", bg: "#f8717115" },
  needs_attention:  { label: "Review",   color: "#fbbf24", bg: "#fbbf2415" },
};

// Map department names to lucide icons
function getDeptIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("market") || n.includes("שיווק")) return Megaphone;
  if (n.includes("sales") || n.includes("מכירות")) return TrendingUp;
  if (n.includes("onboard") || n.includes("קליטה") || n.includes("success") || n.includes("לקוחות")) return UserCheck;
  if (n.includes("ops") || n.includes("operat") || n.includes("תפעול")) return Settings;
  if (n.includes("support") || n.includes("תמיכה") || n.includes("שירות")) return HeadphonesIcon;
  if (n.includes("finance") || n.includes("כספ")) return DollarSign;
  if (n.includes("engineer") || n.includes("dev") || n.includes("tech") || n.includes("פיתוח")) return Code2;
  if (n.includes("hr") || n.includes("people") || n.includes("משאבי")) return Users2;
  if (n.includes("product") || n.includes("מוצר")) return Package;
  if (n.includes("analyt") || n.includes("data") || n.includes("נתונים")) return BarChart3;
  return Building2;
}

// Determine AI execution badge for a process
function getAIBadge(isManual: boolean, deptHasOpportunities: boolean): {
  label: string; color: string; bg: string; glow: string;
} {
  if (!isManual) {
    return { label: "100% AI", color: "#34d399", bg: "#34d39912", glow: "#34d39930" };
  }
  if (deptHasOpportunities) {
    return { label: "Partial AI", color: "#fbbf24", bg: "#fbbf2412", glow: "#fbbf2430" };
  }
  return { label: "Human Only", color: "#8c909f", bg: "#8c909f12", glow: "transparent" };
}

const FREQ_SHORT: Record<string, string> = {
  daily: "יומי", weekly: "שבועי", monthly: "חודשי", "ad-hoc": "לפי צורך",
  Daily: "יומי", Weekly: "שבועי", Monthly: "חודשי", "Ad-hoc": "לפי צורך",
};

export function DepartmentNode({ data }: NodeProps<DepartmentNodeType>) {
  const visibleProcesses = data.processes.slice(0, 6);
  const extraCount = Math.max(0, data.processes.length - 6);
  const totalHrs = data.processes.reduce((s, p) => s + (p.timeSpentHrsPerWeek ?? 0), 0);
  const status = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.active;
  const DeptIcon = getDeptIcon(data.label);
  const deptHasOpportunities = data.opportunityCount > 0;

  return (
    <>
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />

      <div
        onClick={data.onSelect}
        className="w-[280px] cursor-pointer group transition-all duration-200"
        style={{
          backgroundColor: "#13151d",
          border: `1px solid ${data.color}30`,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${data.color}15, inset 0 1px 0 ${data.color}10`,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${data.color}60`;
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px rgba(0,0,0,0.6), 0 0 20px ${data.color}20, 0 0 0 1px ${data.color}30`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${data.color}30`;
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${data.color}15, inset 0 1px 0 ${data.color}10`;
        }}
      >
        {/* Top glow bar */}
        <div
          className="h-[3px] w-full"
          style={{
            background: `linear-gradient(90deg, ${data.color}00, ${data.color}, ${data.color}00)`,
            boxShadow: `0 0 12px ${data.color}60`,
          }}
        />

        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            {/* Icon + name */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${data.color}18`, border: `1px solid ${data.color}30` }}
              >
                <DeptIcon className="w-4 h-4" style={{ color: data.color }} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h3
                  className="text-sm font-bold truncate leading-tight"
                  style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb" }}
                >
                  {data.label}
                </h3>
                {data.headcount !== null && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Users className="w-2.5 h-2.5" style={{ color: "#424754" }} strokeWidth={2} />
                    <span className="text-[10px]" style={{ color: "#424754", fontFamily: "var(--font-inter)" }}>
                      {data.headcount} אנשים
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status badge */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full shrink-0"
              style={{ backgroundColor: status.bg, border: `1px solid ${status.color}30` }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: status.color, fontFamily: "var(--font-inter)" }}
              >
                {status.label}
              </span>
            </div>
          </div>

          {/* Metrics strip */}
          <div className="flex items-center gap-3 flex-wrap">
            {totalHrs > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" style={{ color: "#424754" }} strokeWidth={2} />
                <span className="text-[10px] font-semibold tabular-nums" style={{ color: "#8c909f" }}>{totalHrs}h/wk</span>
              </div>
            )}
            {data.opportunityCount > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" style={{ color: "#4d8eff" }} strokeWidth={2} />
                <span className="text-[10px] font-semibold" style={{ color: "#4d8eff" }}>{data.opportunityCount} AI opp</span>
              </div>
            )}
            {data.painPointCount > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" style={{ color: "#f87171" }} strokeWidth={2} />
                <span className="text-[10px]" style={{ color: "#f8717180" }}>{data.painPointCount} issue{data.painPointCount > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4" style={{ height: 1, backgroundColor: "#282a30" }} />

        {/* SOPs / Processes */}
        <div className="px-4 py-3 space-y-1.5">
          <p
            className="text-[9px] font-bold uppercase tracking-widest mb-2"
            style={{ color: "#424754", fontFamily: "var(--font-inter)" }}
          >
            תהליכים ומשימות
          </p>

          {visibleProcesses.length === 0 ? (
            <p className="text-[11px] italic" style={{ color: "#33343b" }}>אין תהליכים עדיין</p>
          ) : (
            visibleProcesses.map(p => {
              const badge = getAIBadge(p.isManual, deptHasOpportunities);
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg"
                  style={{ backgroundColor: "#1a1c24" }}
                >
                  <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: data.color + "80" }} />
                  <span
                    className="text-[11px] truncate flex-1 leading-tight"
                    style={{ color: "#c2c6d6", fontFamily: "var(--font-inter)" }}
                  >
                    {p.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.timeSpentHrsPerWeek != null && p.timeSpentHrsPerWeek > 0 && (
                      <span className="text-[9px] tabular-nums font-medium" style={{ color: "#424754" }}>
                        {p.timeSpentHrsPerWeek}h
                      </span>
                    )}
                    {/* AI badge */}
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.color}30`,
                        boxShadow: badge.glow !== "transparent" ? `0 0 6px ${badge.glow}` : "none",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {extraCount > 0 && (
            <div
              className="flex items-center gap-1 pt-1 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: "#424754" }}
            >
              <ChevronRight className="w-2.5 h-2.5" />
              <span className="text-[10px]" style={{ fontFamily: "var(--font-inter)" }}>
                +{extraCount} more processes
              </span>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div
          className="px-4 py-2.5 flex items-center justify-between"
          style={{ borderTop: "1px solid #282a30" }}
        >
          <span className="text-[10px]" style={{ color: "#33343b", fontFamily: "var(--font-inter)" }}>
            {data.processes.length} תהליכים
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px]" style={{ color: data.color, fontFamily: "var(--font-inter)" }}>פרטים</span>
            <ChevronRight className="w-2.5 h-2.5" style={{ color: data.color }} />
          </div>
        </div>
      </div>
    </>
  );
}
