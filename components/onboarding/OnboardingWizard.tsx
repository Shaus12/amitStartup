"use client";

import { useOnboardingStore, TOTAL_STEPS } from "@/lib/hooks/useOnboardingStore";
import { Step00_Welcome } from "@/components/onboarding/steps/Step00_Welcome";
import { Step01_BusinessType } from "@/components/onboarding/steps/Step01_BusinessType";
import { Step02_TeamSize } from "@/components/onboarding/steps/Step02_TeamSize";
import { Step03_Revenue } from "@/components/onboarding/steps/Step03_Revenue";
import { Step04_Departments } from "@/components/onboarding/steps/Step04_Departments";
import { Step05_ToolsStack } from "@/components/onboarding/steps/Step05_ToolsStack";
import { Step06_Processes } from "@/components/onboarding/steps/Step06_Processes";
import { Step07_TimeAudit } from "@/components/onboarding/steps/Step07_TimeAudit";
import { Step08_ManualWork } from "@/components/onboarding/steps/Step08_ManualWork";
import { Step09_CustomerInteraction } from "@/components/onboarding/steps/Step09_CustomerInteraction";
import { Step10_Reporting } from "@/components/onboarding/steps/Step10_Reporting";
import { Step11_Communication } from "@/components/onboarding/steps/Step11_Communication";
import { Step12_Bottlenecks } from "@/components/onboarding/steps/Step12_Bottlenecks";
import { Step13_PainPoints } from "@/components/onboarding/steps/Step13_PainPoints";
import { Step14_PriorAI } from "@/components/onboarding/steps/Step14_PriorAI";
import { Step15_Budget } from "@/components/onboarding/steps/Step15_Budget";
import { Step16_Goals } from "@/components/onboarding/steps/Step16_Goals";
import { Step17_Review } from "@/components/onboarding/steps/Step17_Review";

type StepProps = { onNext: () => void; onBack: () => void };

const STEPS: React.ComponentType<StepProps>[] = [
  Step00_Welcome, Step01_BusinessType, Step02_TeamSize, Step03_Revenue,
  Step04_Departments, Step05_ToolsStack, Step06_Processes, Step07_TimeAudit,
  Step08_ManualWork, Step09_CustomerInteraction, Step10_Reporting,
  Step11_Communication, Step12_Bottlenecks, Step13_PainPoints,
  Step14_PriorAI, Step15_Budget, Step16_Goals, Step17_Review,
] as React.ComponentType<StepProps>[];

const STEP_GROUPS = [
  { label: "Foundation", range: [0, 3] },
  { label: "Structure", range: [4, 6] },
  { label: "Operations", range: [7, 11] },
  { label: "Challenges", range: [12, 13] },
  { label: "AI Readiness", range: [14, 16] },
  { label: "Review", range: [17, 17] },
];

function getCurrentGroupIndex(step: number) {
  return STEP_GROUPS.findIndex(g => step >= g.range[0] && step <= g.range[1]);
}

export function OnboardingWizard() {
  const { currentStep, nextStep, prevStep } = useOnboardingStore();
  const progressPercent = Math.round((currentStep / (TOTAL_STEPS - 1)) * 100);
  const StepComponent = STEPS[currentStep] ?? STEPS[0];
  const groupIndex = getCurrentGroupIndex(currentStep);
  const currentGroup = STEP_GROUPS[groupIndex];

  return (
    <div className="min-h-[100dvh] flex" style={{ backgroundColor: "#111319" }}>

      {/* ── Left brand panel ── */}
      <aside
        className="hidden md:flex md:w-[320px] lg:w-[380px] shrink-0 flex-col justify-between px-10 py-12 relative overflow-hidden"
        style={{ backgroundColor: "#191b22" }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(77,142,255,0.08) 0%, transparent 65%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(173,198,255,0.04) 0%, transparent 70%)" }}
        />

        {/* Top: logo + phase info */}
        <div className="relative">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4d8eff, #adc6ff)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb" }}
            >
              BizView
            </span>
          </div>

          {/* Current phase */}
          <div className="mb-2">
            <span
              className="text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ color: "#4d8eff" }}
            >
              {currentGroup?.label}
            </span>
          </div>
          <h2
            className="text-2xl font-bold leading-snug mb-3"
            style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb", letterSpacing: "-0.02em" }}
          >
            {currentStep < 4 && "Tell us about your business."}
            {currentStep >= 4 && currentStep < 7 && "Map out your teams."}
            {currentStep >= 7 && currentStep < 12 && "Where does time go?"}
            {currentStep >= 12 && currentStep < 14 && "Surface your friction."}
            {currentStep >= 14 && currentStep < 17 && "Define your AI goals."}
            {currentStep >= 17 && "Review everything."}
          </h2>
          <p
            className="text-sm leading-relaxed max-w-[240px]"
            style={{ color: "#8c909f" }}
          >
            The more detail you provide, the sharper your AI recommendations will be.
          </p>
        </div>

        {/* Bottom: phase stepper + step counter */}
        <div className="relative">
          <div className="flex flex-col gap-0 mb-10">
            {STEP_GROUPS.map((g, i) => {
              const done = i < groupIndex;
              const active = i === groupIndex;
              return (
                <div
                  key={g.label}
                  className="flex items-center gap-3 py-2.5 relative"
                >
                  {/* Connector line */}
                  {i < STEP_GROUPS.length - 1 && (
                    <div
                      className="absolute left-[5px] top-[26px] w-[1px] h-full"
                      style={{ backgroundColor: done ? "#4d8eff" : "#282a30" }}
                    />
                  )}
                  {/* Dot */}
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
                    {g.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p
            className="text-[11px] font-medium tabular-nums"
            style={{ color: "#424754", fontFamily: "var(--font-inter)" }}
          >
            Step {currentStep + 1} of {TOTAL_STEPS}
          </p>
        </div>
      </aside>

      {/* ── Right form area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Progress bar */}
        <div className="h-[2px] shrink-0" style={{ backgroundColor: "#191b22" }}>
          <div
            className="h-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, #4d8eff, #adc6ff)",
            }}
          />
        </div>

        {/* Mobile logo bar */}
        <div
          className="flex md:hidden items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "#282a30" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4d8eff, #adc6ff)" }}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="text-xs font-semibold" style={{ color: "#c2c6d6", fontFamily: "var(--font-manrope)" }}>BizView</span>
          </div>
          <span className="text-[11px] tabular-nums" style={{ color: "#424754" }}>
            {currentStep + 1} / {TOTAL_STEPS}
          </span>
        </div>

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 md:py-16 md:px-12 lg:px-20">
          <div className="w-full max-w-[540px]">
            <StepComponent onNext={() => nextStep()} onBack={() => prevStep()} />
          </div>
        </div>
      </div>
    </div>
  );
}
