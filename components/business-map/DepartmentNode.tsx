"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Users, Zap, GitBranch, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export function useCountUp(target: number, durationMs = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    let startTime: number | null = null;
    let animationFrame: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(target * ease);
      if (progress < 1) animationFrame = requestAnimationFrame(step);
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, durationMs]);

  return Math.round(count);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiOpportunityItem {
  id: string;
  title: string;
  impactType: string;
  estimatedHoursSaved?: number | null;
  estimatedCostSaved?: number | null;
  hasTask?: boolean;
}

export interface DepartmentNodeData extends Record<string, unknown> {
  label: string;
  color: string;
  status: string;
  headcount: number | null;
  businessId?: string | null;
  isRoot?: boolean;
  isLocked?: boolean;
  onUnlock?: () => void;
  processes: {
    id: string;
    name: string;
    timeSpentHrsPerWeek: number | null;
    isManual: boolean;
    frequency: string | null;
  }[];
  aiOpportunities: AiOpportunityItem[];
  painPointCount: number;
  opportunityCount: number;
  healthScore?: number;
  mainPain?: string | null;
  firstAction?: string | null;
  isExpanded?: boolean;
  index?: number;
  onSelect: () => void;
  onClose?: () => void;
}

export type DepartmentNodeType = Node<DepartmentNodeData, "departmentNode">;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDeptEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("market") || n.includes("שיווק")) return "📣";
  if (n.includes("sales") || n.includes("מכירות")) return "📈";
  if (n.includes("onboard") || n.includes("קליטה") || n.includes("success")) return "🤝";
  if (n.includes("ops") || n.includes("operat") || n.includes("תפעול")) return "⚙️";
  if (n.includes("support") || n.includes("תמיכה") || n.includes("שירות")) return "🎧";
  if (n.includes("finance") || n.includes("כספ") || n.includes("חשבו")) return "💰";
  if (n.includes("engineer") || n.includes("dev") || n.includes("tech") || n.includes("פיתוח")) return "💻";
  if (n.includes("hr") || n.includes("people") || n.includes("משאבי")) return "👥";
  if (n.includes("product") || n.includes("מוצר")) return "📦";
  if (n.includes("data") || n.includes("analyt") || n.includes("נתונים")) return "📊";
  if (n.includes("legal") || n.includes("משפט")) return "⚖️";
  if (n.includes("design") || n.includes("עיצוב")) return "🎨";
  return "🏢";
}

function deriveHealthScore(data: DepartmentNodeData): number {
  const totalProcs = data.processes.length;
  if (totalProcs === 0 && data.opportunityCount === 0) return 72;
  const manualProcs = data.processes.filter((p) => p.isManual).length;
  const manualPct = totalProcs > 0 ? manualProcs / totalProcs : 0;
  const base = Math.round((1 - manualPct * 0.6) * 100);
  return Math.min(100, Math.max(10, base - Math.min(data.opportunityCount * 2, 10)));
}

function healthColor(score: number) {
  if (score >= 70) return { stroke: "#34d399", glow: "rgba(52,211,153,0.3)", label: "בריא" };
  if (score >= 40) return { stroke: "#fbbf24", glow: "rgba(251,191,36,0.3)", label: "בסיכון" };
  return { stroke: "#f87171", glow: "rgba(248,113,113,0.3)", label: "זקוק לשיפור" };
}

function impactConfig(type: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    time_savings: { label: "⏱ זמן", color: "#60a5fa", bg: "#60a5fa15" },
    cost_savings:  { label: "💰 כסף", color: "#34d399", bg: "#34d39915" },
    revenue:       { label: "📈 הכנסה", color: "#fbbf24", bg: "#fbbf2415" },
    quality:       { label: "✨ איכות", color: "#c084fc", bg: "#c084fc15" },
  };
  return map[type] ?? { label: type, color: "#8c909f", bg: "#8c909f15" };
}

// ─── Health Ring Component ────────────────────────────────────────────────────

function HealthRing({ score, size = 54, sw = 4 }: { score: number; size?: number; sw?: number }) {
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const offset = mounted ? circ - (score / 100) * circ : circ;
  const { stroke, label } = healthColor(score);
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#282a30" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={stroke} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 4px ${stroke})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span style={{ fontSize: size > 64 ? 18 : 12, fontWeight: 800, color: stroke, fontFamily: "var(--font-inter)" }}>{score}</span>
        <span style={{ fontSize: size > 64 ? 9 : 7, color: "#424754", fontFamily: "var(--font-inter)", marginTop: 1 }}>{label}</span>
      </div>
    </div>
  );
}

// ─── Compact Card ─────────────────────────────────────────────────────────────

function CompactCard({ data, score, healthStroke, healthGlow, emoji, processCount, manualCount }: {
  data: DepartmentNodeData;
  score: number;
  healthStroke: string;
  healthGlow: string;
  emoji: string;
  processCount: number;
  manualCount: number;
}) {
  const isRoot = data.isRoot ?? false;
  const isLocked = data.isLocked ?? false;
  const cardWidth = isRoot ? 290 : 220;

  const animIndex = data.index ?? 0;
  const staggerDelay = Math.min(animIndex * 100, 1000);

  const animP = useCountUp(processCount);
  const animO = useCountUp(data.opportunityCount);

  const isCritical = score < 40;
  const isExcellent = score >= 70;

  function handleClick() {
    if (isLocked) {
      data.onUnlock?.();
    } else {
      data.onSelect();
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer ${isCritical ? "critical-node" : ""} ${isExcellent ? "excellent-node" : ""}`}
      style={{
        opacity: 0,
        animation: `slide-up-fade 0.6s ease-out forwards`,
        animationDelay: `${staggerDelay}ms`,
        position: "relative",
        width: cardWidth,
        minHeight: isRoot ? 210 : 180,
        border: isRoot
          ? `2px solid ${healthStroke}70`
          : `2px solid ${healthStroke}40`,
        borderRadius: isRoot ? 20 : 16,
        overflow: "hidden",
        background: isRoot
          ? `linear-gradient(160deg, #1a1d2b 0%, #13151d 100%)`
          : "linear-gradient(160deg, #16182188 0%, #13151d 100%)",
        boxShadow: isRoot
          ? `0 8px 40px rgba(0,0,0,0.65), 0 0 28px ${healthGlow}, 0 0 0 1px ${healthStroke}20`
          : `0 6px 30px rgba(0,0,0,0.55), 0 0 18px ${healthGlow}`,
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = `${healthStroke}${isRoot ? "aa" : "80"}`;
        el.style.transform = "translateY(-4px) scale(1.02)";
        el.style.boxShadow = `0 16px 48px rgba(0,0,0,0.7), 0 0 ${isRoot ? "40" : "28"}px ${healthGlow}`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = `${healthStroke}${isRoot ? "70" : "40"}`;
        el.style.transform = "translateY(0) scale(1)";
        el.style.boxShadow = isRoot
          ? `0 8px 40px rgba(0,0,0,0.65), 0 0 28px ${healthGlow}, 0 0 0 1px ${healthStroke}20`
          : `0 6px 30px rgba(0,0,0,0.55), 0 0 18px ${healthGlow}`;
      }}
    >
      {/* Top glow bar */}
      <div style={{
        height: isRoot ? 4 : 3,
        background: `linear-gradient(90deg, transparent, ${healthStroke}, transparent)`,
        boxShadow: `0 0 ${isRoot ? "14px" : "10px"} ${healthStroke}80`,
      }} />

      {/* Root badge */}
      {isRoot && !isLocked && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          padding: "5px 12px",
          backgroundColor: `${healthStroke}10`,
          borderBottom: `1px solid ${healthStroke}20`,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: healthStroke, fontFamily: "var(--font-inter)", textTransform: "uppercase" }}>
            ★ מחלקה ראשית
          </span>
        </div>
      )}

      {/* Locked overlay */}
      {isLocked && (
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: "rgba(17,19,25,0.7)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          zIndex: 10,
          backdropFilter: "blur(2px)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(77,142,255,0.12)",
            border: "1.5px solid rgba(77,142,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4d8eff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e2eb", fontFamily: "var(--font-inter)" }}>
              {data.label}
            </div>
            <div style={{ fontSize: 10, color: "#4d8eff", fontFamily: "var(--font-inter)", marginTop: 3 }}>
              לחץ להשלמת פרטים
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: isRoot ? "16px 18px 14px" : "14px 16px 12px" }}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span style={{ fontSize: isRoot ? 28 : 22, lineHeight: 1 }}>{emoji}</span>
            <div className="min-w-0">
              <h3 className="font-bold truncate" style={{
                fontSize: isRoot ? 16 : 13,
                fontFamily: "var(--font-manrope)",
                color: "#e2e2eb",
                letterSpacing: isRoot ? "-0.01em" : undefined,
              }}>
                {data.label}
              </h3>
              {data.headcount !== null && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Users style={{ width: 9, height: 9, color: "#424754" }} strokeWidth={2} />
                  <span style={{ fontSize: 9, color: "#424754", fontFamily: "var(--font-inter)" }}>{data.headcount} אנשים</span>
                </div>
              )}
            </div>
          </div>
          <HealthRing score={score} size={isRoot ? 62 : 54} sw={isRoot ? 5 : 4} />
        </div>

        <div style={{ height: 1, backgroundColor: "#1e2030", marginBottom: 10 }} />

        {/* Stat badges */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex items-center gap-1.5 flex-1 rounded-lg px-2.5 py-1.5 backdrop-blur-md" style={{ backgroundColor: "#1a1d2790", border: "1px solid #282a30" }}>
            <GitBranch style={{ width: 10, height: 10, color: data.color || "#8c909f" }} strokeWidth={2} />
            <div>
              <div style={{ fontSize: isRoot ? 15 : 13, fontWeight: 700, color: "#e2e2eb", lineHeight: 1, fontFamily: "var(--font-inter)" }}>{animP}</div>
              <div style={{ fontSize: 8, color: "#424754", fontFamily: "var(--font-inter)", marginTop: 1 }}>תהליכים</div>
            </div>
            {manualCount > 0 && (
              <span className="ml-auto rounded-full px-1.5" style={{ fontSize: 8, backgroundColor: "#fbbf2415", color: "#fbbf24", border: "1px solid #fbbf2430", fontFamily: "var(--font-inter)" }}>
                {manualCount} ידני
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-1 rounded-lg px-2.5 py-1.5 backdrop-blur-md"
            style={{ backgroundColor: data.opportunityCount > 0 ? "#4d8eff20" : "#1a1d2790", border: data.opportunityCount > 0 ? "1px solid #4d8eff40" : "1px solid #282a30" }}>
            <Zap style={{ width: 10, height: 10, color: data.opportunityCount > 0 ? "#4d8eff" : "#424754" }} strokeWidth={2} />
            <div>
              <div style={{ fontSize: isRoot ? 15 : 13, fontWeight: 700, color: data.opportunityCount > 0 ? "#4d8eff" : "#424754", lineHeight: 1, fontFamily: "var(--font-inter)" }}>{animO}</div>
              <div style={{ fontSize: 8, color: "#424754", fontFamily: "var(--font-inter)", marginTop: 1 }}>הזדמנויות</div>
            </div>
          </div>
        </div>

        {/* Main pain preview for root removed per user request */}
        <div className="mt-3 flex items-center justify-end">
          <span style={{ fontSize: 9, color: "#424754", fontFamily: "var(--font-inter)" }}>לחץ להגדלה →</span>
        </div>
      </div>
    </div>
  );
}

// ─── Expanded Card ────────────────────────────────────────────────────────────

function ExpandedCard({ data, score, healthStroke, healthGlow, emoji, addedTasks, onTaskAdded }: {
  data: DepartmentNodeData;
  score: number;
  healthStroke: string;
  healthGlow: string;
  emoji: string;
  addedTasks: Set<string>;
  onTaskAdded: (id: string) => void;
}) {
  const [creatingTask, setCreatingTask] = useState<string | null>(null);
  const [toastData, setToastData] = useState<{ title: string; hours: number } | null>(null);

  const totalProcesses = data.processes.length;
  const manualCount = data.processes.filter((p) => p.isManual).length;
  let healthDesc = "";
  if (totalProcesses === 0) healthDesc = "אין נתונים מספיקים";
  else if (manualCount === 0) healthDesc = "כל התהליכים אוטומטיים";
  else if (manualCount === totalProcesses) healthDesc = "כל התהליכים ידניים";
  else healthDesc = `${manualCount} מתוך ${totalProcesses} תהליכים ידניים`;

  async function createTask(opp: AiOpportunityItem) {
    if (!data.businessId || addedTasks.has(opp.id) || opp.hasTask) return;
    setCreatingTask(opp.id);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: data.businessId, title: opp.title, opportunityId: opp.id, department_name: data.label }),
      });
      if (!res.ok) throw new Error("failed");
      onTaskAdded(opp.id);
      
      setToastData({ title: opp.title, hours: opp.estimatedHoursSaved ?? 2 });
      setTimeout(() => setToastData(null), 4000);
    } catch {
      toast.error("שגיאה ביצירת המשימה");
    } finally {
      setCreatingTask(null);
    }
  }

  return (
    <div
      dir="rtl"
      className="nowheel nodrag"
      style={{
        width: 400,
        border: `1.5px solid ${healthStroke}60`,
        borderRadius: 20,
        overflow: "hidden",
        background: "linear-gradient(160deg, #191c28 0%, #111319 100%)",
        boxShadow: `0 20px 80px rgba(0,0,0,0.8), 0 0 40px ${healthGlow}, 0 0 0 1px ${healthStroke}20`,
        animation: "bv-fade-up 0.3s cubic-bezier(0.16,1,0.3,1) both",
      }}
      // prevent drag from triggering inside expanded node
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Top glow bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, transparent, ${healthStroke}, transparent)`, boxShadow: `0 0 14px ${healthStroke}` }} />

      {/* Header */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #1e2030" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <HealthRing score={score} size={80} sw={6} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0" style={{ fontSize: 24 }}>{emoji}</span>
                <h2 className="truncate" style={{ fontSize: 19, fontWeight: 800, color: "#e2e2eb", fontFamily: "var(--font-manrope)", letterSpacing: "-0.02em" }}>
                  {data.label}
                </h2>
              </div>
              {data.headcount !== null && (
                <div className="flex items-center gap-1 mt-1">
                  <Users style={{ width: 10, height: 10, color: "#424754" }} strokeWidth={2} />
                  <span style={{ fontSize: 10, color: "#424754", fontFamily: "var(--font-inter)" }}>{data.headcount} אנשים</span>
                </div>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <span style={{ fontSize: 10, color: "#8c909f", fontFamily: "var(--font-inter)" }}>
                  <span style={{ color: "#e2e2eb", fontWeight: 700 }}>{data.processes.length}</span> תהליכים
                </span>
                <span style={{ color: "#424754", fontSize: 10 }}>·</span>
                <span style={{ fontSize: 10, color: "#8c909f", fontFamily: "var(--font-inter)" }}>
                  <span style={{ color: "#4d8eff", fontWeight: 700 }}>{data.opportunityCount}</span> הזדמנויות AI
                </span>
              </div>
              <div style={{ marginTop: 4, fontSize: 10, color: "#8c909f", fontFamily: "var(--font-inter)" }}>
                {healthDesc}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); data.onClose?.(); }}
            style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              backgroundColor: "#1a1c24", border: "1px solid #282a30",
              color: "#8c909f", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#282a30"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1a1c24"; e.currentTarget.style.color = "#8c909f"; }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div 
        className="nowheel"
        style={{ maxHeight: 460, overflowY: "auto", padding: "16px 20px" }}
        onWheel={(e) => e.stopPropagation()}
      >

        {/* Insights Callouts */}
        {(data.mainPain || data.firstAction) && (
          <div className="mb-6 flex flex-col gap-2">
            {data.mainPain && (
              <div style={{ backgroundColor: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#f87171", marginBottom: 2, fontFamily: "var(--font-inter)" }}>הכאב העיקרי 🔴</div>
                <div style={{ fontSize: 12, color: "#e2e2eb", lineHeight: 1.4 }}>{data.mainPain}</div>
              </div>
            )}
            {data.firstAction && (
              <div style={{ backgroundColor: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#34d399", marginBottom: 2, fontFamily: "var(--font-inter)" }}>פעולה ראשונה להיום ✅</div>
                <div style={{ fontSize: 12, color: "#e2e2eb", lineHeight: 1.4 }}>{data.firstAction}</div>
              </div>
            )}
          </div>
        )}

        {/* Processes */}
        <section style={{ marginBottom: 20 }}>
          <div className="flex items-center gap-2 mb-2">
            <GitBranch size={11} style={{ color: data.color || "#8c909f" }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#424754", textTransform: "uppercase", fontFamily: "var(--font-inter)" }}>
              תהליכים ומשימות
            </span>
          </div>

          {data.processes.length === 0 ? (
            <p style={{ fontSize: 11, color: "#33343b", fontStyle: "italic" }}>אין תהליכים עדיין</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.processes.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2"
                  style={{ backgroundColor: "#1a1c24", border: "1px solid #1e2030", borderRadius: 8, padding: "7px 11px" }}>
                  <div className="flex items-center gap-2 min-w-0">
                    {p.isManual
                      ? <AlertTriangle size={10} style={{ color: "#fbbf24", flexShrink: 0 }} />
                      : <CheckCircle2 size={10} style={{ color: "#34d399", flexShrink: 0 }} />
                    }
                    <span style={{ fontSize: 11, color: "#c2c6d6", fontFamily: "var(--font-inter)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.frequency && (
                      <span style={{ fontSize: 8, color: "#424754", backgroundColor: "#282a30", padding: "1px 6px", borderRadius: 999, fontFamily: "var(--font-inter)" }}>
                        {p.frequency}
                      </span>
                    )}
                    <span style={{
                      fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 999, fontFamily: "var(--font-inter)",
                      color: p.isManual ? "#fbbf24" : "#34d399",
                      backgroundColor: p.isManual ? "#fbbf2415" : "#34d39915",
                      border: `1px solid ${p.isManual ? "#fbbf2430" : "#34d39930"}`,
                    }}>
                      {p.isManual ? "ידני" : "אוטומטי"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI Opportunities */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={11} style={{ color: "#4d8eff" }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#424754", textTransform: "uppercase", fontFamily: "var(--font-inter)" }}>
              הזדמנויות AI
            </span>
          </div>

          {data.aiOpportunities.length === 0 ? (
            <p style={{ fontSize: 11, color: "#33343b", fontStyle: "italic" }}>הפעל ניתוח AI לקבלת המלצות</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.aiOpportunities.map((opp) => {
                const ic = impactConfig(opp.impactType);
                return (
                  <div key={opp.id} style={{ backgroundColor: "#4d8eff08", border: "1px solid #4d8eff20", borderRadius: 10, padding: "10px 12px" }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e2eb", fontFamily: "var(--font-manrope)", lineHeight: 1.4, flex: 1 }}>
                        {opp.title}
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, backgroundColor: ic.bg, color: ic.color, border: `1px solid ${ic.color}40`, whiteSpace: "nowrap" }}>
                        {ic.label}
                      </span>
                    </div>
                    {(opp.estimatedHoursSaved || opp.estimatedCostSaved) && (
                      <div className="flex items-center gap-3 mb-2">
                        {opp.estimatedHoursSaved && (
                          <span style={{ fontSize: 10, color: "#60a5fa", fontFamily: "var(--font-inter)" }}>⏱ {opp.estimatedHoursSaved}h/שבוע</span>
                        )}
                        {opp.estimatedCostSaved && (
                          <span style={{ fontSize: 10, color: "#34d399", fontFamily: "var(--font-inter)" }}>₪{opp.estimatedCostSaved.toLocaleString()}/חודש</span>
                        )}
                      </div>
                    )}
                    {(() => {
                      const isAlreadyExisting = opp.hasTask && !addedTasks.has(opp.id);
                      const isJustAdded = addedTasks.has(opp.id);
                      const isBtnDisabled = creatingTask === opp.id || isAlreadyExisting || isJustAdded;

                      const btnColor = isAlreadyExisting ? "#8c909f" : isJustAdded ? "#34d399" : (creatingTask === opp.id ? "#424754" : "#4d8eff");
                      const btnText = isAlreadyExisting ? "✓ כבר נוספה" : isJustAdded ? "✓ נוספה למשימות" : (creatingTask === opp.id ? "יוצר..." : "+ צור משימה");
                      const btnCursor = isAlreadyExisting || isJustAdded ? "default" : "pointer";

                      return (
                        <button
                          onClick={(e) => { e.stopPropagation(); createTask(opp); }}
                          disabled={isBtnDisabled}
                          style={{
                            fontSize: 10, fontWeight: 700, fontFamily: "var(--font-inter)",
                            color: btnColor,
                            background: "transparent", border: "none", cursor: btnCursor, padding: 0,
                          }}
                          onMouseEnter={(e) => { if (!isBtnDisabled) e.currentTarget.style.color = "#adc6ff"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = btnColor; }}
                        >
                          {btnText}
                        </button>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Custom Toast Portal for Task Creation */}
      {toastData && typeof document !== "undefined" && createPortal(
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, animation: "task-toast-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          backgroundColor: "#191c28", border: "1px solid #282a30", borderRadius: 12,
          padding: "16px 20px", boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(77,142,255,0.1)",
          width: 320, fontFamily: "var(--font-inter)"
        }}>
          <style>{`
            @keyframes task-toast-slide-up {
              0% { transform: translate(-50%, 60px); opacity: 0; }
              100% { transform: translate(-50%, 0); opacity: 1; }
            }
          `}</style>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#34d399", marginBottom: 6, fontFamily: "var(--font-manrope)" }}>משימה נוצרה</div>
          <div style={{ fontSize: 13, color: "#e2e2eb", marginBottom: 6, fontWeight: 500, lineHeight: 1.4 }}>{toastData.title}</div>
          <div style={{ fontSize: 11, color: "#8c909f", marginBottom: 12 }}>זמן משוער: {toastData.hours} שעות</div>
          <a href="/tasks" style={{ fontSize: 11, color: "#4d8eff", textDecoration: "none", fontWeight: 700 }}>
            צפה בכל המשימות &larr;
          </a>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function DepartmentNode({ data }: NodeProps<DepartmentNodeType>) {
  const score = data.healthScore ?? deriveHealthScore(data);
  const { stroke: healthStroke, glow: healthGlow } = healthColor(score);
  const emoji = getDeptEmoji(data.label);
  const processCount = data.processes.length;
  const manualCount = data.processes.filter((p) => p.isManual).length;
  
  // Track tasks added in this session so they stay green while the map is open
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());

  return (
    <>
      <style>{`
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-critical {
          0% { box-shadow: 0 0 10px rgba(248,113,113,0.1), 0 0 0 1px rgba(248,113,113,0.2); }
          50% { box-shadow: 0 0 35px rgba(248,113,113,0.6), 0 0 0 2px rgba(248,113,113,0.7); }
          100% { box-shadow: 0 0 10px rgba(248,113,113,0.1), 0 0 0 1px rgba(248,113,113,0.2); }
        }
        @keyframes shimmer-sweep {
          0% { transform: skewX(-20deg) translateX(-150%); }
          50% { transform: skewX(-20deg) translateX(150%); }
          100% { transform: skewX(-20deg) translateX(150%); }
        }
        .critical-node {
          animation: slide-up-fade 0.6s ease-out forwards, pulse-critical 3s ease-in-out infinite !important;
        }
        .excellent-node::after {
          content: "";
          position: absolute;
          top: 0; left: -20%; right: -20%; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(52,211,153, 0.15), transparent);
          animation: shimmer-sweep 4s infinite linear;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />

      {data.isExpanded ? (
        <ExpandedCard
          data={data}
          score={score}
          healthStroke={healthStroke}
          healthGlow={healthGlow}
          emoji={emoji}
          addedTasks={addedTasks}
          onTaskAdded={(id) => setAddedTasks((prev) => new Set(prev).add(id))}
        />
      ) : (
        <CompactCard data={data} score={score} healthStroke={healthStroke} healthGlow={healthGlow} emoji={emoji} processCount={processCount} manualCount={manualCount} />
      )}
    </>
  );
}
