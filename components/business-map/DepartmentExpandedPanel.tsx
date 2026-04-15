"use client";

import { DepartmentWithProcesses } from "@/lib/types/business-map";
import { X, Zap, GitBranch, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DepartmentPanelProps {
  department: DepartmentWithProcesses;
  onClose: () => void;
}

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
  return "🏢";
}

function deriveScore(dept: DepartmentWithProcesses): number {
  const totalProcs = dept.processes.length;
  if (totalProcs === 0 && dept.aiOpportunities.length === 0) return 72;
  const manualProcs = dept.processes.filter((p) => p.isManual).length;
  const manualPct = totalProcs > 0 ? manualProcs / totalProcs : 0;
  return Math.min(100, Math.max(10, Math.round((1 - manualPct * 0.6) * 100)));
}

function healthColor(score: number) {
  if (score >= 70) return { stroke: "#34d399", glow: "rgba(52,211,153,0.2)", label: "בריא" };
  if (score >= 40) return { stroke: "#fbbf24", glow: "rgba(251,191,36,0.2)", label: "בסיכון" };
  return { stroke: "#f87171", glow: "rgba(248,113,113,0.2)", label: "קריטי" };
}

function HealthRingLarge({ score }: { score: number }) {
  const size = 80;
  const sw = 6;
  const r = (size - sw * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const { stroke, label } = healthColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#282a30" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={stroke} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 6px ${stroke})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span style={{ fontSize: 18, fontWeight: 800, color: stroke, fontFamily: "var(--font-inter)" }}>{score}</span>
        <span style={{ fontSize: 9, color: "#8c909f", fontFamily: "var(--font-inter)", marginTop: 2 }}>{label}</span>
      </div>
    </div>
  );
}

function ImpactBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    time_savings: { label: "⏱ זמן", color: "#60a5fa", bg: "#60a5fa15" },
    cost_savings: { label: "💰 כסף", color: "#34d399", bg: "#34d39915" },
    revenue:      { label: "📈 הכנסה", color: "#fbbf24", bg: "#fbbf2415" },
    quality:      { label: "✨ איכות", color: "#c084fc", bg: "#c084fc15" },
  };
  const cfg = map[type] ?? { label: type, color: "#8c909f", bg: "#8c909f15" };
  return (
    <span
      style={{
        fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
        backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`,
        fontFamily: "var(--font-inter)", whiteSpace: "nowrap"
      }}
    >
      {cfg.label}
    </span>
  );
}

export function DepartmentExpandedPanel({ department, onClose }: DepartmentPanelProps) {
  const score = deriveScore(department);
  const { stroke } = healthColor(score);
  const emoji = getDeptEmoji(department.name);
  const manualCount = department.processes.filter((p) => p.isManual).length;
  const [creatingTask, setCreatingTask] = useState<string | null>(null);

  async function createTask(opp: { id: string; title: string }) {
    setCreatingTask(opp.id);
    try {
      const bid = (department as any).business_id ?? null;
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: bid,
          title: opp.title,
          opportunityId: opp.id,
        }),
      });
      if (!res.ok) throw new Error("failed");
      toast.success("משימה נוצרה בהצלחה ✓");
    } catch {
      toast.error("שגיאה ביצירת המשימה");
    } finally {
      setCreatingTask(null);
    }
  }

  return (
    <div
      className="absolute inset-y-0 right-0 z-50 flex flex-col overflow-hidden"
      style={{
        width: "clamp(320px, 38vw, 480px)",
        backgroundColor: "#111319",
        borderLeft: `1px solid ${stroke}30`,
        boxShadow: `-8px 0 40px rgba(0,0,0,0.6), 0 0 30px ${stroke}10`,
        animation: "bv-slide-in-right 0.25s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 20px 16px",
          borderBottom: "1px solid #1e2030",
          background: `linear-gradient(160deg, #16182180 0%, #111319 100%)`,
        }}
      >
        {/* Top glow bar */}
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, transparent, ${stroke}, transparent)`,
            position: "absolute", top: 0, left: 0, right: 0,
            boxShadow: `0 0 8px ${stroke}60`,
          }}
        />
        <div className="flex items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-3">
            <HealthRingLarge score={score} />
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 20 }}>{emoji}</span>
                <h2
                  style={{
                    fontSize: 18, fontWeight: 800, color: "#e2e2eb",
                    fontFamily: "var(--font-manrope)", letterSpacing: "-0.02em"
                  }}
                >
                  {department.name}
                </h2>
              </div>
              {department.headcount !== null && (
                <span style={{ fontSize: 11, color: "#424754", fontFamily: "var(--font-inter)" }}>
                  {department.headcount} אנשים
                </span>
              )}
              {/* Mini stats */}
              <div className="flex items-center gap-3 mt-1.5">
                <span style={{ fontSize: 10, color: "#8c909f", fontFamily: "var(--font-inter)" }}>
                  <span style={{ color: "#e2e2eb", fontWeight: 700 }}>{department.processes.length}</span> תהליכים
                </span>
                <span style={{ fontSize: 10, color: "#424754" }}>·</span>
                <span style={{ fontSize: 10, color: "#8c909f", fontFamily: "var(--font-inter)" }}>
                  <span style={{ color: "#fbbf24", fontWeight: 700 }}>{manualCount}</span> ידניים
                </span>
                <span style={{ fontSize: 10, color: "#424754" }}>·</span>
                <span style={{ fontSize: 10, color: "#8c909f", fontFamily: "var(--font-inter)" }}>
                  <span style={{ color: "#4d8eff", fontWeight: 700 }}>{department.aiOpportunities.length}</span> הזדמנויות AI
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              backgroundColor: "#1a1c24", border: "1px solid #282a30",
              color: "#8c909f", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#282a30";
              e.currentTarget.style.color = "#e2e2eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1a1c24";
              e.currentTarget.style.color = "#8c909f";
            }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "16px 20px" }}>

        {/* Processes */}
        <section style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={12} style={{ color: department.color || "#8c909f" }} />
            <span
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                color: "#424754", textTransform: "uppercase", fontFamily: "var(--font-inter)"
              }}
            >
              תהליכים ומשימות
            </span>
          </div>
          {department.processes.length === 0 ? (
            <p style={{ fontSize: 12, color: "#33343b", fontStyle: "italic", fontFamily: "var(--font-inter)" }}>
              אין תהליכים עדיין
            </p>
          ) : (
            <div className="space-y-2">
              {department.processes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2"
                  style={{
                    backgroundColor: "#1a1c24",
                    border: "1px solid #1e2030",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {p.isManual ? (
                      <AlertTriangle size={11} style={{ color: "#fbbf24", flexShrink: 0 }} />
                    ) : (
                      <CheckCircle2 size={11} style={{ color: "#34d399", flexShrink: 0 }} />
                    )}
                    <span
                      style={{
                        fontSize: 12, color: "#c2c6d6", fontFamily: "var(--font-inter)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}
                    >
                      {p.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.frequency && (
                      <span
                        style={{
                          fontSize: 9, color: "#424754", fontFamily: "var(--font-inter)",
                          backgroundColor: "#282a30", padding: "1px 6px", borderRadius: 999
                        }}
                      >
                        {p.frequency}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 9, fontWeight: 700,
                        color: p.isManual ? "#fbbf24" : "#34d399",
                        backgroundColor: p.isManual ? "#fbbf2415" : "#34d39915",
                        border: `1px solid ${p.isManual ? "#fbbf2430" : "#34d39930"}`,
                        padding: "2px 7px", borderRadius: 999,
                        fontFamily: "var(--font-inter)"
                      }}
                    >
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
          <div className="flex items-center gap-2 mb-3">
            <Zap size={12} style={{ color: "#4d8eff" }} />
            <span
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                color: "#424754", textTransform: "uppercase", fontFamily: "var(--font-inter)"
              }}
            >
              הזדמנויות AI
            </span>
          </div>
          {department.aiOpportunities.length === 0 ? (
            <p style={{ fontSize: 12, color: "#33343b", fontStyle: "italic", fontFamily: "var(--font-inter)" }}>
              אין הזדמנויות עדיין — הפעל ניתוח AI לקבלת המלצות
            </p>
          ) : (
            <div className="space-y-2">
              {department.aiOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  style={{
                    backgroundColor: "#4d8eff08",
                    border: "1px solid #4d8eff20",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      style={{
                        fontSize: 12, fontWeight: 600, color: "#e2e2eb",
                        fontFamily: "var(--font-manrope)", lineHeight: 1.4, flex: 1
                      }}
                    >
                      {opp.title}
                    </span>
                    <ImpactBadge type={opp.impactType} />
                  </div>
                  <button
                    onClick={() => createTask(opp)}
                    disabled={creatingTask === opp.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontSize: 10, fontWeight: 700,
                      color: creatingTask === opp.id ? "#424754" : "#4d8eff",
                      background: "transparent", border: "none", cursor: "pointer",
                      padding: 0, fontFamily: "var(--font-inter)"
                    }}
                    onMouseEnter={(e) => { if (creatingTask !== opp.id) e.currentTarget.style.color = "#adc6ff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = creatingTask === opp.id ? "#424754" : "#4d8eff"; }}
                  >
                    {creatingTask === opp.id ? "יוצר..." : "+ צור משימה"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
