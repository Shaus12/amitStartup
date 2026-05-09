"use client";

import { useState } from "react";
import { CheckCircle2, Crown, Loader2, Lock, Sparkles, X } from "lucide-react";
import { UpgradeButton } from "@/components/subscription/UpgradeButton";

type Plan = "free" | "pro" | "business";

type BillingClientProps = {
  currentPlan: Plan;
  subscriptionUpdatedAt: string | null;
  subscriptionEndsAt: string | null;
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

function calculateEndDate(subscriptionUpdatedAt: string | null) {
  const startedAt = subscriptionUpdatedAt ? new Date(subscriptionUpdatedAt) : new Date();
  const endsAt = Number.isNaN(startedAt.getTime()) ? new Date() : startedAt;
  endsAt.setDate(endsAt.getDate() + 30);
  return endsAt.toISOString();
}

function formatDate(date: string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

export function BillingClient({
  currentPlan,
  subscriptionUpdatedAt,
  subscriptionEndsAt,
  userEmail,
}: BillingClientProps) {
  const plans = visiblePlans(currentPlan).map((plan) => PLAN_CARDS[plan]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [localEndsAt, setLocalEndsAt] = useState<string | null>(subscriptionEndsAt);
  const isCancellationPending = currentPlan !== "free" && Boolean(localEndsAt);
  const calculatedEndDate = localEndsAt ?? calculateEndDate(subscriptionUpdatedAt);

  async function handleCancelSubscription() {
    setCancelLoading(true);
    setCancelError(null);

    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = (await res.json()) as { subscription_ends_at?: unknown; error?: string };

      if (!res.ok || typeof data.subscription_ends_at !== "string") {
        throw new Error(data.error ?? "Cancellation failed");
      }

      setLocalEndsAt(data.subscription_ends_at);
      setCancelModalOpen(false);
    } catch (err) {
      console.error("[BillingClient] cancellation error:", err);
      setCancelError("אירעה שגיאה בביטול המנוי. נסה שוב.");
    } finally {
      setCancelLoading(false);
    }
  }

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
            {isCancellationPending && (
              <p className="mt-2 text-sm font-medium text-yellow-300">
                המנוי שלך פעיל עד {formatDate(localEndsAt)}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className="max-w-xl text-sm font-medium text-zinc-300">{bannerText(currentPlan)}</p>
            {currentPlan !== "free" && !isCancellationPending && (
              <button
                type="button"
                onClick={() => {
                  setCancelError(null);
                  setCancelModalOpen(true);
                }}
                className="h-10 rounded-xl border border-red-500/25 bg-red-500/10 px-4 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200"
              >
                בטל מנוי
              </button>
            )}
          </div>
        </div>
      </section>

      {isCancellationPending && (
        <div className="mb-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-center text-sm font-bold text-yellow-200">
          המנוי בוטל. תוכל להמשיך ליהנות עד {formatDate(localEndsAt)}
        </div>
      )}

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

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-right shadow-2xl">
            <button
              type="button"
              onClick={() => {
                if (!cancelLoading) setCancelModalOpen(false);
              }}
              disabled={cancelLoading}
              className="absolute left-3 top-3 inline-flex size-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white disabled:pointer-events-none disabled:opacity-50"
              aria-label="סגור"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            <h2 className="text-xl font-extrabold text-white">לבטל את המנוי?</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              הביטול ייכנס לתוקף בסוף תקופת החיוב הנוכחית. תוכל להמשיך ליהנות מהתוכנית עד{" "}
              <span className="font-bold text-white">{formatDate(calculatedEndDate)}</span>.
            </p>

            {cancelError && <p className="mt-4 text-sm font-medium text-red-400">{cancelError}</p>}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelLoading}
                className="h-11 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-bold text-zinc-300 transition-colors hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-50"
              >
                חזור
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-500 disabled:pointer-events-none disabled:opacity-60"
              >
                {cancelLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                אשר ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
