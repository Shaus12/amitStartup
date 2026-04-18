"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ChevronLeft, Zap } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";

interface Props {
  onBack: () => void;
}

const STAGES = [
  "שומר פרטי עסק...",
  "יוצר מחלקות...",
  "בונה מפה ראשונית...",
  "הכנה לתצוגה...",
];

export function QuickReviewStep({ onBack }: Props) {
  const router = useRouter();
  const { answers, setBusinessId } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);

  async function handleSubmit() {
    setLoading(true);
    setProgress(0);
    setStageIdx(0);

    let current = 0;
    const intervalId = setInterval(() => {
      current = current + (80 - current) * 0.14;
      if (current >= 79.5) { clearInterval(intervalId); current = 80; }
      setProgress(Math.round(current));
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 2));
    }, 200);

    try {
      const onboardingRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, quickMode: true }),
      });

      if (!onboardingRes.ok) {
        clearInterval(intervalId);
        const err = await onboardingRes.json().catch(() => ({}));
        throw new Error(err.details || err.message || err.error || "Failed to save profile");
      }

      const { businessId } = await onboardingRes.json();
      setBusinessId(businessId);
      document.cookie = "onboarding_just_completed=1; path=/; max-age=3600";
      setProgress(80);
      setStageIdx(3);

      clearInterval(intervalId);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 500));
      router.push("/dashboard");
    } catch (err: any) {
      clearInterval(intervalId);
      toast.error(err.message || "שגיאה בשמירת הפרטים");
      setLoading(false);
      setProgress(0);
    }
  }

  return (
    <div
      className="w-full max-w-md mx-auto"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#e2e2eb",
            fontFamily: "var(--font-manrope)",
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          מוכן ליצירת מפה מהירה!
        </h2>
        <p style={{ fontSize: 13, color: "#8c909f", lineHeight: 1.6, margin: 0 }}>
          {answers.departments.length} מחלקות יתווספו למפה.
          <br />
          תוכל להשלים כל מחלקה בנפרד ישירות מהמפה.
        </p>
      </div>

      {/* Departments preview */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}>
        {answers.departments.map((dept) => (
          <div
            key={dept.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 99,
              backgroundColor: "#1e1f26",
              border: "1px solid #282a30",
              fontSize: 12,
              color: "#c2c6d6",
              fontWeight: 600,
            }}
          >
            <span>🔒</span>
            {dept.name}
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: "rgba(77,142,255,0.05)",
          border: "1px solid rgba(77,142,255,0.15)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 28,
          fontSize: 12,
          color: "#8c909f",
          lineHeight: 1.5,
          direction: "rtl",
          textAlign: "right",
        }}
      >
        💡 מחלקות עם 🔒 עדיין לא הושלמו — לחץ עליהן במפה להוספת פרטים ולפתיחת ניתוח AI מלא
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: loading ? "16px 24px" : "14px 24px",
            borderRadius: 14,
            border: "none",
            background: loading ? "#1e1f26" : "linear-gradient(135deg, #4d8eff, #adc6ff)",
            color: loading ? "#8c909f" : "#001a42",
            fontSize: 15,
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-manrope)",
            transition: "all 0.2s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span style={{ fontSize: 13, color: "#c2c6d6" }}>{STAGES[stageIdx]}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#4d8eff" }}>{progress}%</span>
              </div>
              <div style={{ width: "100%", height: 6, backgroundColor: "#282a30", borderRadius: 99, overflow: "hidden" }}>
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
              <Zap size={18} />
              צור את מפת העסק
            </span>
          )}
        </button>

        <button
          onClick={onBack}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            color: "#424754",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            justifyContent: "center",
            padding: "8px 0",
            fontFamily: "var(--font-inter)",
          }}
        >
          <ChevronLeft size={14} />
          חזור
        </button>
      </div>
    </div>
  );
}
