"use client";

import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";

interface Props { onNext: () => void; onBack: () => void; }

const LEAD_OPTIONS = [
  { value: "organic", label: "🔍 אורגני / SEO" },
  { value: "referral", label: "👥 המלצות / פה לאוזן" },
  { value: "paid", label: "📢 פרסום ממומן" },
  { value: "walk_in", label: "🚶 עוברי אורח / כניסה ישירה" },
  { value: "social", label: "📱 רשתות חברתיות" },
  { value: "events", label: "🎪 אירועים / תערוכות" },
];

const AD_PLATFORMS = [
  { value: "google", label: "Google Ads" },
  { value: "meta", label: "Meta (Facebook/Instagram)" },
  { value: "tiktok", label: "TikTok" },
  { value: "waze", label: "Waze" },
  { value: "whatsapp", label: "WhatsApp Business" },
  { value: "email", label: "Email Marketing" },
  { value: "none", label: "לא מפרסמים כרגע" },
];

const BUDGET_OPTIONS = [
  { value: "0", label: "אין תקציב פרסום" },
  { value: "0-1000", label: "עד ₪1,000/חודש" },
  { value: "1000-3000", label: "₪1,000–3,000/חודש" },
  { value: "3000-7000", label: "₪3,000–7,000/חודש" },
  { value: "7000+", label: "₪7,000+/חודש" },
];

const LEAD_COUNT_OPTIONS = [
  { value: "0-10", label: "1–10 לידים" },
  { value: "10-30", label: "10–30 לידים" },
  { value: "30-100", label: "30–100 לידים" },
  { value: "100+", label: "100+ לידים" },
];

const C = {
  s2: "#1e1f26", s3: "#282a30", blue: "#4d8eff", glow: "#adc6ff",
  muted: "#8c909f", sub: "#c2c6d6", text: "#e2e2eb", outline: "#424754",
};

export function Step18_Marketing({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  function toggle(field: "leadSources" | "adPlatforms", value: string) {
    const arr = answers[field] as string[];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    updateAnswers({ [field]: next });
  }

  return (
    <StepCard
      title="שיווק ולידים"
      subtitle="נבין את מנוע הצמיחה של העסק שלך כדי לזהות הזדמנויות אוטומציה בתחום המכירות."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Monthly leads */}
        <div>
          <p className="text-xs font-semibold mb-3" style={{ color: C.sub, fontFamily: "var(--font-inter)" }}>
            כמה לידים מגיעים בממוצע בחודש?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {LEAD_COUNT_OPTIONS.map((opt) => {
              const active = answers.monthlyLeads === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateAnswers({ monthlyLeads: opt.value })}
                  className="px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 text-right"
                  style={{
                    backgroundColor: active ? `${C.blue}18` : C.s2,
                    border: `1px solid ${active ? C.blue : C.s3}`,
                    color: active ? C.glow : C.muted,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lead sources */}
        <div>
          <p className="text-xs font-semibold mb-3" style={{ color: C.sub, fontFamily: "var(--font-inter)" }}>
            מאיפה מגיעים הלקוחות? (ניתן לבחור כמה)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {LEAD_OPTIONS.map((opt) => {
              const active = answers.leadSources.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle("leadSources", opt.value)}
                  className="px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 text-right"
                  style={{
                    backgroundColor: active ? `${C.blue}18` : C.s2,
                    border: `1px solid ${active ? C.blue : C.s3}`,
                    color: active ? C.glow : C.muted,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Marketing budget */}
        <div>
          <p className="text-xs font-semibold mb-3" style={{ color: C.sub, fontFamily: "var(--font-inter)" }}>
            תקציב פרסום חודשי
          </p>
          <div className="grid grid-cols-2 gap-2">
            {BUDGET_OPTIONS.map((opt) => {
              const active = answers.marketingBudget === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateAnswers({ marketingBudget: opt.value })}
                  className="px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 text-right"
                  style={{
                    backgroundColor: active ? `${C.blue}18` : C.s2,
                    border: `1px solid ${active ? C.blue : C.s3}`,
                    color: active ? C.glow : C.muted,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ad platforms */}
        <div>
          <p className="text-xs font-semibold mb-3" style={{ color: C.sub, fontFamily: "var(--font-inter)" }}>
            פלטפורמות פרסום פעילות (ניתן לבחור כמה)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {AD_PLATFORMS.map((opt) => {
              const active = answers.adPlatforms.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle("adPlatforms", opt.value)}
                  className="px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 text-right"
                  style={{
                    backgroundColor: active ? `${C.blue}18` : C.s2,
                    border: `1px solid ${active ? C.blue : C.s3}`,
                    color: active ? C.glow : C.muted,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
