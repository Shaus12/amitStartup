"use client";

import { ArrowLeft, ArrowRight, Shuffle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { createContext, useContext } from "react";

// Context so OnboardingWizard can inject onAutoFill without touching all 20 step files
const AutoFillContext = createContext<(() => void) | null>(null);

export function AutoFillProvider({
  onAutoFill,
  children,
}: {
  onAutoFill: () => void;
  children: React.ReactNode;
}) {
  return (
    <AutoFillContext.Provider value={onAutoFill}>
      {children}
    </AutoFillContext.Provider>
  );
}

interface StepCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  onAutoFill?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export function StepCard({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  onAutoFill: onAutoFillProp,
  nextLabel,
  nextDisabled = false,
  showBack = true,
}: StepCardProps) {
  const t = useT();
  const label = nextLabel ?? t.continue;
  const contextFill = useContext(AutoFillContext);
  const onAutoFill = onAutoFillProp ?? contextFill ?? undefined;

  return (
    <div className="w-full">
      <div className="mb-9">
        <h2
          className="text-[2rem] font-bold leading-tight mb-3"
          style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb", letterSpacing: "-0.02em" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-sm leading-relaxed max-w-[52ch]"
            style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="mb-6">{children}</div>

      {onAutoFill && (
        <button
          type="button"
          onClick={onAutoFill}
          className="w-full flex items-center justify-center gap-2 mb-4 py-2 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            backgroundColor: "rgba(77,142,255,0.06)",
            border: "1px dashed rgba(77,142,255,0.25)",
            color: "#4d8eff",
            fontFamily: "var(--font-inter)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(77,142,255,0.1)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(77,142,255,0.45)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(77,142,255,0.06)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(77,142,255,0.25)";
          }}
        >
          <Shuffle className="w-3 h-3" strokeWidth={2} />
          מלא כרגע באופן אקראי ותשנה נתונים אחר כך
        </button>
      )}

      <div className="flex items-center justify-between pt-6" style={{ borderTop: "1px solid #282a30" }}>
        <div>
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-medium transition-colors duration-150 group"
              style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c2c6d6")}
              onMouseLeave={e => (e.currentTarget.style.color = "#8c909f")}
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" strokeWidth={2} />
              {t.back}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
          style={{
            fontFamily: "var(--font-inter)",
            background: nextDisabled ? "#282a30" : "linear-gradient(135deg, #4d8eff, #adc6ff)",
            color: nextDisabled ? "#424754" : "#001a42",
            cursor: nextDisabled ? "not-allowed" : "pointer",
            boxShadow: nextDisabled ? "none" : "0 4px 16px rgba(77,142,255,0.25)",
          }}
        >
          {label}
          {!nextDisabled && <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
}
