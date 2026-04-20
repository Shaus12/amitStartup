"use client";

import { useState, useEffect } from "react";
import { useOnboardingStore, TOTAL_STEPS } from "@/lib/hooks/useOnboardingStore";
import { useT } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { Step00_Welcome } from "@/components/onboarding/steps/Step00_Welcome";
import { Step02_TeamSize } from "@/components/onboarding/steps/Step02_TeamSize";
import { Step03_Revenue } from "@/components/onboarding/steps/Step03_Revenue";
import { Trans_After3 } from "@/components/onboarding/steps/Trans_After3";
import { Step04_Departments } from "@/components/onboarding/steps/Step04_Departments";
import { Step05_ToolsStack } from "@/components/onboarding/steps/Step05_ToolsStack";
import { Step06_Processes } from "@/components/onboarding/steps/Step06_Processes";
import { Trans_After6 } from "@/components/onboarding/steps/Trans_After6";
import { Step07_SalesMarketing } from "@/components/onboarding/steps/Step07_SalesMarketing";
import { Step12_Bottlenecks } from "@/components/onboarding/steps/Step12_Bottlenecks";
import { Step16_Goals } from "@/components/onboarding/steps/Step16_Goals";
import { Step14_PriorAI } from "@/components/onboarding/steps/Step14_PriorAI";
import { Step17_Review } from "@/components/onboarding/steps/Step17_Review";
import { QuickReviewStep } from "@/components/onboarding/steps/QuickReviewStep";
import { AutoFillProvider } from "@/components/onboarding/StepCard";
import { Zap, CheckCircle2 } from "lucide-react";

type StepProps = { onNext: () => void; onBack: () => void };

const STEPS: React.ComponentType<StepProps>[] = [
  Step00_Welcome, // 0
  Step02_TeamSize, // 1
  Step03_Revenue, // 2
  Trans_After3, // 3
  Step04_Departments, // 4
  Step05_ToolsStack, // 5
  Step06_Processes, // 6
  Trans_After6, // 7
  Step07_SalesMarketing, // 8
  Step12_Bottlenecks, // 9
  Step16_Goals, // 10
  Step14_PriorAI, // 11
  Step17_Review, // 12
] as React.ComponentType<StepProps>[];

const GROUP_STEP_RANGES = [[0, 2], [3, 6], [7, 8], [9, 9], [10, 11], [12, 12]];

function getCurrentGroupIndex(step: number) {
  return GROUP_STEP_RANGES.findIndex(([s, e]) => step >= s && step <= e);
}

const PANEL_HEADING_INDICES = [
  [0, 2],   // "Tell us about your business."
  [3, 6],   // "Map out your teams."
  [7, 8],  // "Where does time go?"
  [9, 9], // "Surface your friction."
  [10, 11], // "Define your AI goals."
  [12, 12], // "Review everything."
];

function getPanelHeadingIndex(step: number) {
  return PANEL_HEADING_INDICES.findIndex(([s, e]) => step >= s && step <= e);
}

// Quick mode: steps 0-4, then QuickReviewStep
const QUICK_LAST_STEP = 4;

function RegistrationModeSelector({ onSelect }: { onSelect: (mode: "quick" | "full") => void }) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6" style={{ backgroundColor: "#111319" }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, justifyContent: "center" }}>
          <img src="/logo.png" alt="BizMap Logo" style={{ width: 40, height: 40, objectFit: "contain" }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "#e2e2eb", fontFamily: "var(--font-manrope)" }}>BizMap</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#e2e2eb", fontFamily: "var(--font-manrope)", letterSpacing: "-0.02em", marginBottom: 8 }}>
            איך תרצה להתחיל?
          </h1>
          <p style={{ fontSize: 13, color: "#8c909f", fontFamily: "var(--font-inter)", lineHeight: 1.6 }}>
            בחר את האופן שמתאים לך — אפשר להשלים את הפרטים בכל עת
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Quick option */}
          <button
            onClick={() => onSelect("quick")}
            style={{
              width: "100%",
              padding: "18px 20px",
              borderRadius: 16,
              border: "1.5px solid #282a30",
              backgroundColor: "#191b22",
              cursor: "pointer",
              textAlign: "right",
              direction: "rtl",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(77,142,255,0.4)";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(77,142,255,0.04)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#282a30";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#191b22";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, #4d8eff20, #4d8eff08)",
                border: "1px solid rgba(77,142,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Zap size={18} color="#4d8eff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e2eb", fontFamily: "var(--font-manrope)", marginBottom: 3 }}>
                  הרשמה זריזה
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#4d8eff", marginRight: 8, fontFamily: "var(--font-inter)" }}>
                    ~2 דקות
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#8c909f", fontFamily: "var(--font-inter)", lineHeight: 1.5 }}>
                  שם העסק, גודל צוות, ומחלקות בלבד
                </div>
                <div style={{ fontSize: 11, color: "#424754", fontFamily: "var(--font-inter)", marginTop: 4 }}>
                  תוכל להשלים כל מחלקה בנפרד ישירות מהמפה
                </div>
              </div>
            </div>
          </button>

          {/* Full option */}
          <button
            onClick={() => onSelect("full")}
            style={{
              width: "100%",
              padding: "18px 20px",
              borderRadius: 16,
              border: "1.5px solid rgba(52,211,153,0.3)",
              background: "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.02))",
              cursor: "pointer",
              textAlign: "right",
              direction: "rtl",
              position: "relative",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(52,211,153,0.5)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(52,211,153,0.3)";
            }}
          >
            <div style={{
              position: "absolute", top: -10, left: 16,
              backgroundColor: "#34d399", color: "#052e16",
              fontSize: 10, fontWeight: 800, padding: "2px 10px",
              borderRadius: 99, fontFamily: "var(--font-inter)",
            }}>
              מומלץ
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "rgba(52,211,153,0.1)",
                border: "1px solid rgba(52,211,153,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckCircle2 size={18} color="#34d399" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e2eb", fontFamily: "var(--font-manrope)", marginBottom: 3 }}>
                  הרשמה מלאה
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#34d399", marginRight: 8, fontFamily: "var(--font-inter)" }}>
                    ~8 דקות
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#8c909f", fontFamily: "var(--font-inter)", lineHeight: 1.5 }}>
                  מיפוי מלא של תהליכים, כלים ואתגרים
                </div>
                <div style={{ fontSize: 11, color: "#34d399", fontFamily: "var(--font-inter)", marginTop: 4, opacity: 0.8 }}>
                  הגדר פעם אחת וזהו — ניתוח AI מדויק מהרגע הראשון
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function OnboardingWizard() {
  const { currentStep, nextStep, prevStep, reset, fillRandom, setStep, registrationMode, setRegistrationMode } = useOnboardingStore();
  const t = useT();
  const router = useRouter();
  const progressPercent = Math.round((currentStep / (TOTAL_STEPS - 1)) * 100);

  const [showSocialProof, setShowSocialProof] = useState(false);
  const [socialProofDismissed, setSocialProofDismissed] = useState(false);
  const [insightOverlay, setInsightOverlay] = useState<null | { emoji: string; title: string; body: string }>(null);
  const [stepDirection, setStepDirection] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (currentStep >= 5 && currentStep <= 7 && !socialProofDismissed) {
      const show = setTimeout(() => setShowSocialProof(true), 2000);
      const hide = setTimeout(() => setShowSocialProof(false), 6000);
      return () => { clearTimeout(show); clearTimeout(hide); };
    }
  }, [currentStep, socialProofDismissed]);

  // Group transition insights
  const GROUP_INSIGHTS: Record<number, { emoji: string; title: string; body: string }> = {
    1: { emoji: "🗂️", title: "מצוין! יסודות העסק מוכנים", body: "כבר יש לנו תמונה ראשונית של הפעילות שלך. עכשיו נמפה את המבנה הארגוני — המחלקות, הצוותים והכלים שאתם עובדים איתם." },
    2: { emoji: "⚙️", title: "המבנה ממופה!", body: "מעולה. עכשיו נצלול לעומק — נבדוק לאן הזמן הולך ואיפה יש עומסים שאפשר להפחית. זה המקום שבו רוב הכסף אבוד." },
    3: { emoji: "🔍", title: "תפעול מוכן לניתוח", body: "הנתונים שנתת כבר מראים דפוסים מעניינים. עכשיו נזהה את נקודות החיכוך — איפה הצוות נתקע ואיפה הכאב הכי גדול." },
    4: { emoji: "💡", title: "כמעט שם!", body: "אנחנו בשלב האחרון לפני הניתוח. נגדיר את יעדי ה-AI שלך כדי שההמלצות יהיו ממוקדות בדיוק בצרכים שלך." },
    5: { emoji: "🚀", title: "הכל מוכן לניתוח!", body: "בדקי את הסיכום וכשתאשר — BizMap ינתח את הנתונים ויחזיר לך מפת הזדמנויות AI מותאמת אישית לעסק שלך." },
  };

  const currentGroup = getCurrentGroupIndex(currentStep);
  const isFirstStepOfGroup = GROUP_STEP_RANGES[currentGroup]?.[0] === currentStep;

  useEffect(() => {
    if (currentGroup > 0 && isFirstStepOfGroup && GROUP_INSIGHTS[currentGroup]) {
      const timer = setTimeout(() => setInsightOverlay(GROUP_INSIGHTS[currentGroup]), 300);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Show mode selector before any step
  if (registrationMode === null) {
    return (
      <RegistrationModeSelector
        onSelect={(mode) => {
          setRegistrationMode(mode);
        }}
      />
    );
  }

  const isQuickMode = registrationMode === "quick";
  const isQuickReview = isQuickMode && currentStep > QUICK_LAST_STEP;

  const StepComponent = STEPS[currentStep] ?? STEPS[0];
  const groupIndex = getCurrentGroupIndex(currentStep);
  const headingIndex = getPanelHeadingIndex(currentStep);
  const groupLabel = t.wizard.groups[groupIndex] ?? "";
  const panelHeading = t.wizard.panelHeadings[headingIndex] ?? "";

  return (
    <div className="min-h-[100dvh] flex" style={{ backgroundColor: "#111319" }}>

      {/* ── Left brand panel ── */}
      <aside
        className="hidden md:flex md:w-[320px] lg:w-[380px] shrink-0 flex-col justify-between px-10 py-12 relative overflow-hidden"
        style={{ backgroundColor: "#191b22" }}
      >
        <div
          className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(77,142,255,0.08) 0%, transparent 65%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(173,198,255,0.04) 0%, transparent 70%)" }}
        />

        <div className="relative">
          <div className="flex items-center gap-3 mb-14">
            <img src="/logo.png" alt="BizMap Logo" className="w-8 h-8 object-contain" />
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb" }}
            >
              BizMap
            </span>
          </div>

          <div className="mb-2">
            <span
              className="text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ color: "#4d8eff" }}
            >
              {groupLabel}
            </span>
          </div>
          <h2
            className="text-2xl font-bold leading-snug mb-3"
            style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb", letterSpacing: "-0.02em" }}
          >
            {panelHeading}
          </h2>
          <p
            className="text-sm leading-relaxed max-w-[240px]"
            style={{ color: "#8c909f" }}
          >
            {t.wizard.panelSubtitle}
          </p>
        </div>

        <div className="relative">
          <div className="flex flex-col gap-0 mb-10">
            {t.wizard.groups.map((groupLbl, i) => {
              const done = i < groupIndex;
              const active = i === groupIndex;
              return (
                <div key={groupLbl} className="flex items-center gap-3 py-2.5 relative">
                  {i < t.wizard.groups.length - 1 && (
                    <div
                      className="absolute left-[5px] top-[26px] w-[1px] h-full"
                      style={{ backgroundColor: done ? "#4d8eff" : "#282a30" }}
                    />
                  )}
                  <div
                    className="w-3 h-3 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 relative z-10"
                    style={{
                      backgroundColor: done ? "#4d8eff" : active ? "transparent" : "#282a30",
                      border: active ? "2px solid #4d8eff" : done ? "none" : "2px solid #424754",
                      boxShadow: active ? "0 0 0 4px rgba(77,142,255,0.12)" : "none",
                    }}
                  >
                    {done && (
                      <svg width="6" height="5" viewBox="0 0 6 5" fill="none">
                        <path d="M1 2.5L2.5 4L5 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-xs font-medium transition-colors duration-200"
                    style={{
                      fontFamily: "var(--font-inter)",
                      color: active ? "#e2e2eb" : done ? "#4d8eff" : "#424754",
                    }}
                  >
                    {groupLbl}
                  </span>
                </div>
              );
            })}
          </div>

          <p
            className="text-[11px] font-medium tabular-nums"
            style={{ color: "#424754", fontFamily: "var(--font-inter)" }}
          >
            {t.wizard.stepOf(currentStep + 1, TOTAL_STEPS)}
          </p>
        </div>
      </aside>

      {/* ── Right form area (relative = reset button stays inside this column) ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="shrink-0 relative overflow-visible" style={{ backgroundColor: "#191b22", height: 6 }}>
          <div
            className="h-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #22c55e, #86efac)" }}
          />
          {progressPercent > 5 && (
            <span
              className="absolute top-1/2 -translate-y-1/2 text-[9px] font-bold tabular-nums leading-none"
              style={{
                left: `calc(${Math.min(progressPercent, 92)}% + 6px)`,
                color: "#22c55e",
                fontFamily: "var(--font-inter)",
              }}
            >
              {progressPercent}%
            </span>
          )}
        </div>

        <div
          className="flex md:hidden items-center justify-between gap-3 px-5 py-3 border-b min-w-0"
          style={{ borderColor: "#282a30" }}
        >
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <img src="/logo.png" alt="BizMap Logo" className="w-5 h-5 shrink-0 object-contain" />
            <span className="text-xs font-semibold truncate" style={{ color: "#c2c6d6", fontFamily: "var(--font-manrope)" }}>BizMap</span>
          </div>
          <span className="text-[11px] tabular-nums shrink-0" style={{ color: "#424754" }}>
            {currentStep + 1} / {TOTAL_STEPS}
          </span>
        </div>

        <div
          className="hidden md:flex shrink-0 justify-end items-center px-8 lg:px-12 pt-5 pb-2"
          style={{ borderBottom: "1px solid #282a30", minHeight: 44 }}
        />

        <div className="flex-1 flex items-center justify-center px-5 py-10 md:py-16 md:px-12 lg:px-20 overflow-hidden">
          <div
            key={animKey}
            className="w-full max-w-[540px]"
            style={{
              animation: `${stepDirection === "forward" ? "bv-step-in" : "bv-step-in-back"} 0.3s cubic-bezier(0.16,1,0.3,1) both`,
            }}
          >
            {isQuickReview ? (
              <QuickReviewStep
                onBack={() => {
                  setStepDirection("back");
                  setAnimKey((k) => k + 1);
                  prevStep();
                }}
              />
            ) : (
              <AutoFillProvider onAutoFill={() => {
                fillRandom();
                setStepDirection("forward");
                setAnimKey((k) => k + 1);
                setStep(11);
              }}>
                <StepComponent
                  onNext={() => {
                    setStepDirection("forward");
                    setAnimKey((k) => k + 1);
                    if (isQuickMode && currentStep === QUICK_LAST_STEP) {
                      // Skip to quick review step (step 5 is past the quick threshold)
                      nextStep();
                    } else {
                      nextStep();
                    }
                  }}
                  onBack={() => {
                    if (currentStep === 0) {
                      router.push("/");
                    } else {
                      setStepDirection("back");
                      setAnimKey((k) => k + 1);
                      prevStep();
                    }
                  }}
                />
              </AutoFillProvider>
            )}
          </div>
        </div>
      </div>

      {/* Group transition insight overlay */}
      {insightOverlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(17,19,25,0.85)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-8 text-center"
            style={{
              backgroundColor: "#1e1f26",
              border: "1px solid #282a30",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
              animation: "bv-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <div className="text-4xl mb-4">{insightOverlay.emoji}</div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb" }}
            >
              {insightOverlay.title}
            </h3>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ fontFamily: "var(--font-inter)", color: "#8c909f" }}
            >
              {insightOverlay.body}
            </p>
            <button
              onClick={() => setInsightOverlay(null)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
              style={{
                fontFamily: "var(--font-inter)",
                background: "linear-gradient(135deg, #22c55e, #86efac)",
                color: "#052e16",
              }}
            >
              המשך →
            </button>
          </div>
        </div>
      )}

      {/* Social proof toast */}
      {showSocialProof && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl"
          style={{
            backgroundColor: "#1e1f26",
            border: "1px solid #282a30",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            animation: "bv-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
            fontFamily: "var(--font-inter)",
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            style={{ backgroundColor: "#4d8eff20", color: "#4d8eff" }}
          >
            מ
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: "#e2e2eb" }}>מוחמד מנצרת</p>
            <p className="text-[10px]" style={{ color: "#8c909f" }}>מיפה זה עכשיו את 4 המחלקות שלו ✓</p>
          </div>
          <button
            onClick={() => { setShowSocialProof(false); setSocialProofDismissed(true); }}
            className="text-[10px] ml-2 leading-none"
            style={{ color: "#424754" }}
          >✕</button>
        </div>
      )}
    </div>
  );
}
