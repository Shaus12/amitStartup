"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Zap, Crown } from "lucide-react";

const FEATURES_BASIC = [
  "ניתוח AI בסיסי של העסק",
  "זיהוי הזדמנויות אוטומציה",
  "דשבורד בריאות עסקית",
  "גישה לצ'אט AI",
];

const FEATURES_PRO = [
  "כל מה שבמסלול הניסיון",
  "ניתוח AI מעמיק ומלא",
  "דוחות ותובנות שבועיות",
  "תכנון פרויקטים חכם",
  "תמיכה מועדפת",
  "עדכונים ושיפורים חדשים",
];

const PLANS = [
  {
    id: "trial",
    label: "ניסיון",
    amount: 1,
    description: "נסה את המערכת במחיר סמלי",
    features: FEATURES_BASIC,
    color: "blue",
    icon: Zap,
  },
  {
    id: "pro",
    label: "Pro",
    amount: 199,
    description: "גישה מלאה לכל הכלים",
    features: FEATURES_PRO,
    color: "purple",
    icon: Crown,
    popular: true,
  },
] as const;

function isValidIsraeliPhone(phone: string) {
  return /^05\d{8}$/.test(phone.replace(/[\s\-]/g, ""));
}

export default function SubscribePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"trial" | "pro">("pro");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

  const canSubmit =
    fullName.trim().split(" ").filter((w) => w.length >= 2).length >= 2 &&
    isValidIsraeliPhone(phone);

  async function handleSubscribe() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          plan: selectedPlan,
          amount: plan.amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setDone(true);
      }
    } catch (err: any) {
      setError(err.message ?? "משהו השתבש, נסה שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--bv-bg)" }}
      dir="rtl"
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-2">בחר מסלול</h1>
          <p className="text-[var(--bv-text-3)] text-sm">התחל עכשיו, שדרג בכל עת</p>
        </div>

        {done ? (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-10 text-center">
            <div className="text-4xl mb-4">✓</div>
            <p className="text-green-400 font-bold text-xl mb-2">הפרטים נשלחו בהצלחה!</p>
            <p className="text-[var(--bv-text-3)] text-sm">ניצור איתך קשר בקרוב עם פרטי התשלום.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 px-6 py-2.5 rounded-xl bg-[var(--bv-surface-raised)] hover:bg-[var(--bv-surface-elevated)] text-[var(--bv-text-2)] text-sm font-bold transition-all"
            >
              חזור לדשבורד
            </button>
          </div>
        ) : (
          <>
            {/* Plan selector */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {PLANS.map((p) => {
                const Icon = p.icon;
                const selected = selectedPlan === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative rounded-2xl border p-6 text-right transition-all ${
                      selected
                        ? p.color === "purple"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-blue-500 bg-blue-500/10"
                        : "border-[var(--bv-border)] bg-[var(--bv-surface)]/40 hover:border-[var(--bv-border-subtle)]"
                    }`}
                  >
                    {"popular" in p && p.popular && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        פופולרי
                      </span>
                    )}
                    <Icon
                      className={`w-5 h-5 mb-3 ${
                        selected
                          ? p.color === "purple"
                            ? "text-purple-400"
                            : "text-blue-400"
                          : "text-[var(--bv-muted)]"
                      }`}
                    />
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-3xl font-extrabold text-white">{p.amount}</span>
                      <span className="text-base font-bold text-white mb-0.5">₪</span>
                      <span className="text-[var(--bv-muted)] text-xs mb-1">/ חודש</span>
                    </div>
                    <p
                      className={`text-sm font-bold mb-1 ${
                        selected
                          ? p.color === "purple"
                            ? "text-purple-300"
                            : "text-blue-300"
                          : "text-[var(--bv-text-3)]"
                      }`}
                    >
                      {p.label}
                    </p>
                    <p className="text-xs text-[var(--bv-muted)]">{p.description}</p>
                    <ul className="mt-4 space-y-1.5">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-[var(--bv-text-3)]">
                          <Check className="w-3 h-3 text-[var(--bv-muted)] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Contact fields */}
            <div className="rounded-2xl border border-[var(--bv-border)] bg-[var(--bv-surface)]/40 p-6 space-y-4 mb-6">
              <p className="text-[var(--bv-text-2)] text-sm font-bold">פרטי יצירת קשר</p>

              <div>
                <label className="block text-xs text-[var(--bv-muted)] font-bold mb-1.5">
                  שם מלא <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="שם פרטי ושם משפחה"
                  className="w-full rounded-xl bg-[var(--bv-surface-raised)]/60 border border-[var(--bv-border-subtle)] text-[var(--bv-text-1)] placeholder:text-[var(--bv-muted)] px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                />
                {fullName && fullName.trim().split(" ").filter((w) => w.length >= 2).length < 2 && (
                  <p className="text-xs text-red-400 mt-1">יש להזין שם פרטי ושם משפחה</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-[var(--bv-muted)] font-bold mb-1.5">
                  טלפון נייד <span className="text-blue-400">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0500000000"
                  dir="ltr"
                  className="w-full rounded-xl bg-[var(--bv-surface-raised)]/60 border border-[var(--bv-border-subtle)] text-[var(--bv-text-1)] placeholder:text-[var(--bv-muted)] px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                />
                {phone && !isValidIsraeliPhone(phone) && (
                  <p className="text-xs text-red-400 mt-1">מספר טלפון ישראלי לא תקין (לדוגמה: 0501234567)</p>
                )}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading || !canSubmit}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${
                selectedPlan === "pro"
                  ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  שולח פרטים...
                </>
              ) : (
                `התחל מסלול ${plan.label} — ${plan.amount}₪ לחודש`
              )}
            </button>

            <div className="text-center mt-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-[var(--bv-muted)] hover:text-[var(--bv-text-3)] text-sm transition-colors"
              >
                חזור לדשבורד
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
