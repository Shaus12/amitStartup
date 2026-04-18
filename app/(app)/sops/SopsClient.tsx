"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Zap, Loader2, GitBranch } from "lucide-react";

interface Process {
  id: string;
  name: string;
  is_manual: boolean;
  frequency: string | null;
  time_spent_hrs_per_week: number | null;
}

interface Department {
  id: string;
  name: string;
  color: string;
  headcount: number | null;
  processes: Process[];
}

interface SubStep {
  name: string;
  automatable: boolean;
  description: string;
  tool?: string;
}

interface ProcessBreakdown {
  subSteps: SubStep[];
  automationPotential: "high" | "medium" | "low";
  timeEstimate: string;
}

interface SopsClientProps {
  businessId: string;
  businessName: string;
  departments: Department[];
}

function getDeptEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("market") || n.includes("שיווק")) return "📣";
  if (n.includes("sales") || n.includes("מכירות")) return "📈";
  if (n.includes("ops") || n.includes("operat") || n.includes("תפעול")) return "⚙️";
  if (n.includes("support") || n.includes("שירות")) return "🎧";
  if (n.includes("finance") || n.includes("כספ")) return "💰";
  if (n.includes("engineer") || n.includes("dev") || n.includes("פיתוח")) return "💻";
  if (n.includes("hr") || n.includes("משאבי")) return "👥";
  return "🏢";
}

function potentialColor(p: "high" | "medium" | "low") {
  if (p === "high") return { color: "#34d399", bg: "#34d39912", label: "פוטנציאל גבוה" };
  if (p === "medium") return { color: "#fbbf24", bg: "#fbbf2412", label: "פוטנציאל בינוני" };
  return { color: "#8c909f", bg: "#8c909f12", label: "פוטנציאל נמוך" };
}

function ProcessRow({
  process,
  businessId,
  departmentName,
}: {
  process: Process;
  businessId: string;
  departmentName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<ProcessBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadBreakdown() {
    if (breakdown || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/processes/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          processName: process.name,
          departmentName,
          isManual: process.is_manual,
          frequency: process.frequency,
          hoursPerWeek: process.time_spent_hrs_per_week,
        }),
      });
      if (!res.ok) throw new Error("שגיאה בטעינה");
      const data = await res.json();
      setBreakdown(data);
    } catch (e) {
      setError("לא הצלחתי לטעון את הפירוט");
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    setExpanded((v) => !v);
    if (!expanded && !breakdown) loadBreakdown();
  }

  const automatable = breakdown?.subSteps.filter((s) => s.automatable).length ?? 0;
  const total = breakdown?.subSteps.length ?? 0;

  return (
    <div
      style={{
        border: "1px solid #1e2030",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 6,
      }}
    >
      {/* Process header */}
      <button
        onClick={toggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          backgroundColor: expanded ? "#191b22" : "#13151d",
          border: "none",
          cursor: "pointer",
          textAlign: "right",
          transition: "background-color 0.15s",
        }}
      >
        <div style={{ flexShrink: 0, color: "#424754" }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#c2c6d6",
              fontFamily: "var(--font-inter)",
              direction: "rtl",
              textAlign: "right",
            }}
          >
            {process.name}
          </span>
          {process.is_manual && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 99,
                backgroundColor: "#fbbf2415",
                color: "#fbbf24",
                border: "1px solid #fbbf2430",
                fontFamily: "var(--font-inter)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              ידני
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {process.time_spent_hrs_per_week != null && (
            <span style={{ fontSize: 10, color: "#424754", fontFamily: "var(--font-inter)" }}>
              {process.time_spent_hrs_per_week}h/שבוע
            </span>
          )}
          {breakdown && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 99,
                backgroundColor: potentialColor(breakdown.automationPotential).bg,
                color: potentialColor(breakdown.automationPotential).color,
                fontFamily: "var(--font-inter)",
              }}
            >
              {automatable}/{total} אוטומטי
            </span>
          )}
        </div>
      </button>

      {/* Expanded sub-steps */}
      {expanded && (
        <div style={{ backgroundColor: "#111319", padding: "12px 14px 14px" }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8c909f" }}>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 12, fontFamily: "var(--font-inter)" }}>מנתח את התהליך...</span>
            </div>
          )}

          {error && (
            <span style={{ fontSize: 12, color: "#f87171", fontFamily: "var(--font-inter)" }}>{error}</span>
          )}

          {breakdown && (
            <>
              {/* Summary bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  backgroundColor: potentialColor(breakdown.automationPotential).bg,
                  border: `1px solid ${potentialColor(breakdown.automationPotential).color}25`,
                }}
              >
                <Zap size={12} style={{ color: potentialColor(breakdown.automationPotential).color, flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: potentialColor(breakdown.automationPotential).color,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {potentialColor(breakdown.automationPotential).label}
                </span>
                <span style={{ fontSize: 10, color: "#8c909f", fontFamily: "var(--font-inter)" }}>
                  · {breakdown.timeEstimate}
                </span>
              </div>

              {/* Sub-steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {breakdown.subSteps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 8,
                      backgroundColor: "#191b22",
                      border: `1px solid ${step.automatable ? "rgba(77,142,255,0.15)" : "#1e2030"}`,
                    }}
                  >
                    {/* Step number */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: step.automatable ? "rgba(77,142,255,0.15)" : "#1e2030",
                        color: step.automatable ? "#4d8eff" : "#424754",
                        fontSize: 9,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {i + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#e2e2eb",
                            fontFamily: "var(--font-inter)",
                            direction: "rtl",
                          }}
                        >
                          {step.name}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: 99,
                            backgroundColor: step.automatable ? "rgba(77,142,255,0.12)" : "#1e2030",
                            color: step.automatable ? "#4d8eff" : "#424754",
                            border: `1px solid ${step.automatable ? "rgba(77,142,255,0.25)" : "#282a30"}`,
                            fontFamily: "var(--font-inter)",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {step.automatable ? "⚡ אוטומטי" : "👤 ידני"}
                        </span>
                      </div>
                      {step.description && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "#8c909f",
                            fontFamily: "var(--font-inter)",
                            lineHeight: 1.4,
                            direction: "rtl",
                            margin: 0,
                          }}
                        >
                          {step.description}
                        </p>
                      )}
                      {step.tool && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: 4,
                            fontSize: 9,
                            color: "#34d399",
                            backgroundColor: "#34d39912",
                            border: "1px solid #34d39925",
                            borderRadius: 99,
                            padding: "1px 7px",
                            fontFamily: "var(--font-inter)",
                          }}
                        >
                          🤖 {step.tool}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function SopsClient({ businessId, businessName, departments }: SopsClientProps) {
  if (departments.length === 0) {
    return (
      <div
        style={{
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111319",
          color: "#33343b",
          fontFamily: "var(--font-inter)",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 48 }}>⚙️</div>
        <div style={{ fontSize: 14, color: "#424754", fontFamily: "var(--font-manrope)", fontWeight: 700 }}>
          אין מחלקות עדיין
        </div>
        <div style={{ fontSize: 12 }}>השלם את ה-Onboarding ליצירת מפת העסק</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", backgroundColor: "#111319" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <GitBranch size={20} style={{ color: "#4d8eff" }} />
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#e2e2eb",
                fontFamily: "var(--font-manrope)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              תהליכי עבודה
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "#424754", fontFamily: "var(--font-inter)", margin: 0 }}>
            {businessName} · לחץ על תהליך לפירוט מלא ואיתור נקודות אוטומציה
          </p>
        </div>

        {/* Departments */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {departments.map((dept) => {
            const emoji = getDeptEmoji(dept.name);
            const manualCount = dept.processes.filter((p) => p.is_manual).length;
            return (
              <div key={dept.id}>
                {/* Dept header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                    paddingBottom: 10,
                    borderBottom: `2px solid ${dept.color}30`,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                  <div style={{ flex: 1 }}>
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#e2e2eb",
                        fontFamily: "var(--font-manrope)",
                        margin: 0,
                        direction: "rtl",
                      }}
                    >
                      {dept.name}
                    </h2>
                    <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                      {dept.headcount != null && (
                        <span style={{ fontSize: 10, color: "#424754", fontFamily: "var(--font-inter)" }}>
                          {dept.headcount} עובדים
                        </span>
                      )}
                      <span style={{ fontSize: 10, color: "#424754", fontFamily: "var(--font-inter)" }}>
                        {dept.processes.length} תהליכים
                      </span>
                      {manualCount > 0 && (
                        <span style={{ fontSize: 10, color: "#fbbf24", fontFamily: "var(--font-inter)" }}>
                          {manualCount} ידניים
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: dept.color || "#4d8eff",
                    }}
                  />
                </div>

                {/* Processes */}
                {dept.processes.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#33343b", fontFamily: "var(--font-inter)", fontStyle: "italic" }}>
                    אין תהליכים רשומים
                  </p>
                ) : (
                  dept.processes.map((proc) => (
                    <ProcessRow
                      key={proc.id}
                      process={proc}
                      businessId={businessId}
                      departmentName={dept.name}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
