"use client";

import { useState } from "react";
import { X, Lock, ChevronRight, Loader2 } from "lucide-react";

interface Props {
  departmentId: string;
  departmentName: string;
  businessId: string;
  onClose: () => void;
  onComplete: () => void;
}

const TOOL_OPTIONS = [
  "Excel / Google Sheets",
  "CRM (Salesforce, HubSpot וכד')",
  "WhatsApp / Telegram",
  "Email",
  "Slack / Teams",
  "Trello / Asana / Monday",
  "Google Drive / Docs",
  "ERP / מערכת ניהול",
  "מערכת הנהלת חשבונות",
  "לא משתמשים בכלים מיוחדים",
];

const STAGES = [
  "שומר פרטי מחלקה...",
  "מנתח תהליכים...",
  "מחשב הזדמנויות...",
  "מסיים...",
];

export function DepartmentOnboardingModal({
  departmentId,
  departmentName,
  businessId,
  onClose,
  onComplete,
}: Props) {
  const [processes, setProcesses] = useState<string[]>(["", ""]);
  const [tools, setTools] = useState<string[]>([]);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(0);
  const [mainPain, setMainPain] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function toggleTool(tool: string) {
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  }

  function setProcess(idx: number, val: string) {
    setProcesses((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }

  function addProcess() {
    setProcesses((prev) => [...prev, ""]);
  }

  function removeProcess(idx: number) {
    setProcesses((prev) => prev.filter((_, i) => i !== idx));
  }

  const filledProcesses = processes.filter((p) => p.trim().length > 0);
  const isValid = filledProcesses.length > 0;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    setProgress(0);
    setStageIdx(0);
    setError(null);

    let current = 0;
    const intervalId = setInterval(() => {
      current = current + (85 - current) * 0.14;
      if (current >= 84) { clearInterval(intervalId); current = 85; }
      setProgress(Math.round(current));
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 2));
    }, 200);

    try {
      const res = await fetch("/api/departments/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId,
          businessId,
          processes: filledProcesses,
          tools,
          hoursPerWeek,
          mainPain,
        }),
      });

      clearInterval(intervalId);
      if (!res.ok) throw new Error("שגיאה בשמירת הנתונים");
      setProgress(100);
      setStageIdx(STAGES.length - 1);
      await new Promise((r) => setTimeout(r, 500));
      onComplete();
    } catch (e: any) {
      clearInterval(intervalId);
      setError(e.message || "שגיאה. נסה שוב.");
      setLoading(false);
      setProgress(0);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "rgba(17,19,25,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "var(--bv-surface-raised)",
          border: "1px solid var(--bv-border)",
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          direction: "rtl",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid var(--bv-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            backgroundColor: "var(--bv-surface-raised)",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: "rgba(77,142,255,0.1)",
                border: "1px solid rgba(77,142,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Lock size={15} color="#4d8eff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--bv-text-1)", fontFamily: "var(--font-manrope)" }}>
                {departmentName}
              </div>
              <div style={{ fontSize: 11, color: "var(--bv-text-3)", fontFamily: "var(--font-inter)" }}>
                השלם פרטים לפתיחת ניתוח AI
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--bv-muted)", padding: 4, borderRadius: 6,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--bv-text-1)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--bv-muted)")}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Processes */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bv-text-2)", marginBottom: 4, fontFamily: "var(--font-inter)" }}>
              מהם התהליכים העיקריים במחלקה? *
            </div>
            <div style={{ fontSize: 11, color: "var(--bv-muted)", marginBottom: 10, fontFamily: "var(--font-inter)" }}>
              לדוגמה: גיוס לידים, מעקב אחרי הזמנות, דוחות שבועיים
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {processes.map((proc, idx) => (
                <div key={idx} style={{ display: "flex", gap: 6 }}>
                  <input
                    value={proc}
                    onChange={(e) => setProcess(idx, e.target.value)}
                    placeholder={`תהליך ${idx + 1}`}
                    style={{
                      flex: 1,
                      height: 38,
                      borderRadius: 8,
                      border: "1px solid var(--bv-border)",
                      backgroundColor: "var(--bv-surface)",
                      color: "var(--bv-text-1)",
                      fontSize: 12,
                      padding: "0 12px",
                      outline: "none",
                      fontFamily: "var(--font-inter)",
                      direction: "rtl",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(77,142,255,0.4)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--bv-border)")}
                  />
                  {processes.length > 1 && (
                    <button
                      onClick={() => removeProcess(idx)}
                      style={{
                        background: "none", border: "1px solid var(--bv-border)", cursor: "pointer",
                        color: "var(--bv-muted)", borderRadius: 8, padding: "0 8px",
                        fontSize: 12,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--bv-muted)")}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addProcess}
                style={{
                  alignSelf: "flex-start",
                  background: "none",
                  border: "1px dashed var(--bv-border)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 11,
                  color: "var(--bv-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-inter)",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#4d8eff")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--bv-muted)")}
              >
                + הוסף תהליך
              </button>
            </div>
          </div>

          {/* Tools */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bv-text-2)", marginBottom: 10, fontFamily: "var(--font-inter)" }}>
              אילו כלים משתמשים?
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TOOL_OPTIONS.map((tool) => {
                const selected = tools.includes(tool);
                return (
                  <button
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      border: selected ? "1px solid rgba(77,142,255,0.4)" : "1px solid var(--bv-border)",
                      backgroundColor: selected ? "rgba(77,142,255,0.1)" : "var(--bv-surface)",
                      color: selected ? "#4d8eff" : "var(--bv-text-3)",
                      cursor: "pointer",
                      fontFamily: "var(--font-inter)",
                      transition: "all 0.12s",
                    }}
                  >
                    {tool}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hours */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bv-text-2)", marginBottom: 10, fontFamily: "var(--font-inter)" }}>
              כמה שעות בשבוע הולכות לתהליכים ידניים?
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[2, 5, 10, 20, 30].map((h) => (
                <button
                  key={h}
                  onClick={() => setHoursPerWeek(h)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    border: hoursPerWeek === h ? "1.5px solid rgba(77,142,255,0.5)" : "1px solid var(--bv-border)",
                    backgroundColor: hoursPerWeek === h ? "rgba(77,142,255,0.1)" : "var(--bv-surface)",
                    color: hoursPerWeek === h ? "#4d8eff" : "var(--bv-text-3)",
                    cursor: "pointer",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Main pain */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bv-text-2)", marginBottom: 8, fontFamily: "var(--font-inter)" }}>
              מה הבעיה / כאב הכי גדול במחלקה?
            </div>
            <textarea
              value={mainPain}
              onChange={(e) => setMainPain(e.target.value)}
              placeholder="לדוגמה: יותר מדי זמן הולך על דוחות ידניים, חוסר מעקב על לידים..."
              rows={3}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid var(--bv-border)",
                backgroundColor: "var(--bv-surface)",
                color: "var(--bv-text-1)",
                fontSize: 12,
                padding: "10px 12px",
                outline: "none",
                fontFamily: "var(--font-inter)",
                direction: "rtl",
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: 1.5,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(77,142,255,0.4)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--bv-border)")}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "#f87171", marginBottom: 12, fontFamily: "var(--font-inter)" }}>{error}</div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            style={{
              width: "100%",
              padding: loading ? "14px 20px" : "13px 20px",
              borderRadius: 12,
              border: "none",
              background: !isValid || loading
                ? "var(--bv-surface-elevated)"
                : "linear-gradient(135deg, #4d8eff, #adc6ff)",
              color: !isValid || loading ? "var(--bv-muted)" : "#001a42",
              fontSize: 14,
              fontWeight: 800,
              cursor: !isValid || loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-manrope)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: loading ? 8 : 0,
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <span style={{ fontSize: 12, color: "var(--bv-text-2)" }}>{STAGES[stageIdx]}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#4d8eff" }}>{progress}%</span>
                </div>
                <div style={{ width: "100%", height: 5, backgroundColor: "var(--bv-border)", borderRadius: 99, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      width: `${progress}%`,
                      background: progress === 100
                        ? "linear-gradient(90deg, #22c55e, #86efac)"
                        : "linear-gradient(90deg, #4d8eff, #adc6ff)",
                      transition: "width 0.3s ease-out",
                    }}
                  />
                </div>
              </>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                פתח ניתוח AI למחלקה
                <ChevronRight size={16} />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
