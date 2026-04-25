"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already accepted (support legacy key as well).
    const hasAccepted =
      localStorage.getItem("cookie_consent_accepted") ||
      localStorage.getItem("privacy_consent_2025");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[99999] p-3 md:p-4 flex justify-center items-center backdrop-blur-xl"
      style={{
        backgroundColor: "rgba(17, 19, 25, 0.95)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.5)"
      }}
    >
      <div className="max-w-[1200px] w-full flex flex-col md:flex-row items-center justify-between gap-4 relative" dir="rtl">
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            <span className="text-[13px] font-bold text-gray-300 tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>
              פרטיות ועוגיות
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-gray-200" style={{ fontFamily: "var(--font-manrope)" }}>
            אנחנו משתמשים בעוגיות לצורך התחברות ואבטחה בלבד.
          </p>
          <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-inter)" }}>
            לפרטים נוספים ראה את{" "}
            <Link href="/privacy" className="underline text-gray-300">
              מדיניות הפרטיות
            </Link>{" "}
            ואת{" "}
            <Link href="/terms" className="underline text-gray-300">
              תנאי השימוש
            </Link>{" "}
            שלנו.
          </p>
        </div>
        
        <div className="shrink-0 w-full md:w-auto flex justify-end">
          <button 
            onClick={() => {
              localStorage.setItem("cookie_consent_accepted", "true");
              setIsVisible(false);
            }}
            className="w-full md:w-auto px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
            style={{
              background: "linear-gradient(135deg, #4d8eff, #adc6ff)",
              color: "#111319"
            }}
          >
            <span className="text-sm font-bold" style={{ fontFamily: "var(--font-manrope)" }}>אני מסכים/ה ✓</span>
            <Check size={16} strokeWidth={3} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
