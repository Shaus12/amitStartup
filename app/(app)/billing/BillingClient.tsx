"use client";

import { CheckCircle2, Crown, Lock, Sparkles } from "lucide-react";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";

type Plan = "free" | "pro" | "business";

type BillingClientProps = {
  currentPlan: Plan;
  userEmail: string;
};

type PlanCard = {
  id: Plan;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
};

const PLAN_LABELS: Record<Plan, string> = {
  free: "חינמי",
  pro: "Pro",
  business: "Business",
};

const PLAN_CARDS: Record<Plan, PlanCard> = {
  free: {
    id: "free",
    name: "חינמי",
    price: "₪0 לחודש",
    features: [
      "2 מחלקות עם ניתוח מלא",
      "2 הזדמנויות פעילות במקביל",
      "2 תוצרים מותאמים אישית",
      "יועץ AI — 10 הודעות ביום",
      "רענון ניתוח אחת לחודש",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "₪79 לחודש",
    recommended: true,
    features: [
      "4 מחלקות עם ניתוח מלא",
      "5 הזדמנויות פעילות במקביל",
      "5 תוצרים מותאמים אישית",
      "יועץ AI — 50 הודעות ביום",
      "רענון ניתוח אחת לשבוע",
      "תמיכה מועדפת",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    price: "₪149 לחודש",
    features: [
      "מחלקות ללא הגבלה",
      "פרויקטים ללא הגבלה",
      "תוצרים ללא הגבלה",
      "יועץ AI — ללא הגבלה",
      "רענון ניתוח אחת לשבוע",
      "צוות — עובדים יכולים לצפות במערכת",
      "תמיכה VIP",
    ],
  },
};

function bannerText(plan: Plan) {
  if (plan === "pro") return "אתה על תוכנית Pro — תודה על התמיכה! 🎉";
  if (plan === "business") return "אתה על התוכנית המתקדמת ביותר — תודה! 🏆";
  return "שדרג כדי לקבל גישה מלאה לכל הפיצ'רים";
}

function visiblePlans(plan: Plan): Plan[] {
  if (plan === "business") return ["business"];
  if (plan === "pro") return ["pro", "business"];
  return ["free", "pro", "business"];
}

function PlanAction({ plan, currentPlan }: { plan: Plan; currentPlan: Plan }) {
  if (plan === currentPlan) {
    return (
      <button
        type="button"
        disabled
        className="mt-6 h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800/70 px-4 text-sm font-bold text-zinc-400"
      >
        התוכנית הנוכחית
      </button>
    );
  }

  if (plan === "free" || currentPlan === "business") {
    return null;
  }

  return (
    <div className="mt-6">
      <UpgradeButton
        plan={plan}
        label={plan === "pro" ? "שדרג ל-Pro" : "שדרג ל-Business"}
      />
    </div>
  );
}

function PricingCard({ plan, currentPlan }: { plan: PlanCard; currentPlan: Plan }) {
  const isCurrent = plan.id === currentPlan;
  const isPro = plan.id === "pro";

  return (
    <section
      className={`relative flex h-full flex-col rounded-2xl border p-6 transition-all ${
        isCurrent
          ? "border-blue-500 bg-blue-500/5"
          : isPro
            ? "border-purple-500/40 bg-zinc-900/70 shadow-[0_0_40px_rgba(168,85,247,0.12)]"
            : "border-zinc-800 bg-zinc-900/50"
      }`}
    >
      <div className="mb-5 flex min-h-8 flex-wrap items-center gap-2">
        {isCurrent && (
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
            התוכנית הנוכחית שלך
          </span>
        )}
        {plan.recommended && currentPlan === "free" && (
          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-300">
            הכי פופולרי ⭐
          </span>
        )}
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-xl border ${
              isPro
                ? "border-purple-500/25 bg-purple-500/10 text-purple-300"
                : plan.id === "business"
                  ? "border-green-500/25 bg-green-500/10 text-green-300"
                  : "border-zinc-700 bg-zinc-800 text-zinc-400"
            }`}
          >
            {plan.id === "business" ? (
              <Crown className="size-5" aria-hidden="true" />
            ) : plan.id === "pro" ? (
              <Sparkles className="size-5" aria-hidden="true" />
            ) : (
              <Lock className="size-5" aria-hidden="true" />
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-white">{plan.name}</h2>
        </div>
        <p className="text-3xl font-extrabold text-white">{plan.price}</p>
      </div>

      <ul className="flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-zinc-300">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-400" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <PlanAction plan={plan.id} currentPlan={currentPlan} />
    </section>
  );
}

export function BillingClient({ currentPlan, userEmail }: BillingClientProps) {
  const plans = visiblePlans(currentPlan).map((plan) => PLAN_CARDS[plan]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold text-blue-400">תוכניות</p>
        <h1 className="text-3xl font-extrabold text-white">בחר את התוכנית שמתאימה לעסק שלך</h1>
        <p className="mt-2 text-sm text-zinc-500">{userEmail}</p>
      </div>

      <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-500">התוכנית הנוכחית שלך</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{PLAN_LABELS[currentPlan]}</p>
          </div>
          <p className="max-w-xl text-sm font-medium text-zinc-300">{bannerText(currentPlan)}</p>
        </div>
      </section>

      {currentPlan === "business" && (
        <div className="mb-8 rounded-2xl border border-green-500/20 bg-green-500/10 p-5 text-center text-sm font-bold text-green-300">
          אתה על התוכנית המתקדמת ביותר
        </div>
      )}

      <div className={`grid gap-5 ${plans.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} currentPlan={currentPlan} />
        ))}
      </div>
    </div>
  );
}
