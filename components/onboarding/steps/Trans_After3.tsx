"use client";

import { useT } from "@/lib/i18n";

export function Trans_After3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const t = useT();
  return (
    <div className="flex flex-col h-full justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-manrope)", color: "var(--bv-text-1)", letterSpacing: "-0.02em" }}>
          מעולה, אנחנו כבר מתחילים לזהות איך העסק שלך עובד
        </h2>
        <p className="text-base mb-10 leading-relaxed" style={{ color: "var(--bv-text-3)" }}>
          מה שענית עד עכשיו כבר נותן לנו תמונה די ברורה על איך העסק שלך עובד ובמיוחד איפה יש פוטנציאל לחסוך זמן וכסף. בשלב הבא נצלול פנימה ונראה איפה הפעולות היומיומיות שלך יכולות לעבוד בשבילך במקום שאתה תעבוד בשבילן.
        </p>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="text-sm font-medium transition-colors"
          style={{ color: "var(--bv-text-3)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--bv-text-1)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--bv-text-3)"}
        >
          {t.back}
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-transform active:scale-95"
          style={{
            background: "linear-gradient(135deg, #4d8eff, #adc6ff)",
            color: "#0f1115",
            boxShadow: "0 4px 14px rgba(77,142,255,0.4)"
          }}
        >
          {t.continue}
        </button>
      </div>
    </div>
  );
}
