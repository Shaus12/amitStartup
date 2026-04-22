"use client";

import { useState } from "react";
import { ChevronLeft, Zap } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { OnboardingGateModal } from "@/components/onboarding/OnboardingGateModal";

interface Props {
  onBack: () => void;
}

export function QuickReviewStep({ onBack }: Props) {
  const { answers } = useOnboardingStore();
  const [gateOpen, setGateOpen] = useState(false);

  const onboardingPayload = { ...answers, quickMode: true } as unknown as Record<string, unknown>;

  return (
    <div className="w-full max-w-md mx-auto" style={{ fontFamily: "var(--font-inter)" }}>
      <OnboardingGateModal open={gateOpen} onClose={() => setGateOpen(false)} onboardingPayload={onboardingPayload} />

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

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          type="button"
          onClick={() => setGateOpen(true)}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #4d8eff, #adc6ff)",
            color: "#001a42",
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "var(--font-manrope)",
            transition: "all 0.2s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={18} />
            צור את מפת העסק
          </span>
        </button>

        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
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
