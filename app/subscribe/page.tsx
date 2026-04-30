"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Zap, Shield, BarChart2, MessageSquare } from "lucide-react";

const FEATURES = [
  "ניתוח AI מעמיק של העסק שלך",
  "זיהוי הזדמנויות אוטומציה",
  "דשבורד בריאות עסקית",
  "צ'אט AI עם הנתונים שלך",
  "תכנון פרויקטים חכם",
  "דוחות ותובנות שבועיות",
];

const ICONS = [BarChart2, Zap, Shield, MessageSquare];

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/create", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error ?? "שגיאה ביצירת תשלום");
      }
      // Redirect to Grow payment page
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setError(err.message ?? "משהו השתבש, נסה שוב");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#111319" }}
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
            <Zap className="w-3.5 h-3.5" />
            תוכנית הגישה המלאה
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">
            BizMap Pro
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            כל הכלים שאתה צריך כדי להפוך את העסק שלך לחכם יותר
          </p>
        </div>

        {/* Pricing Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl">
          {/* Price */}
          <div className="flex items-end gap-1 mb-2">
            <span className="text-5xl font-extrabold text-white">1</span>
            <span className="text-xl font-bold text-white mb-1">₪</span>
            <span className="text-zinc-500 mb-2 mr-1">/ לחודש</span>
          </div>
          <p className="text-zinc-500 text-xs mb-8">
            חיוב חודשי, ניתן לביטול בכל עת
          </p>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Check className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-sm text-zinc-300">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {error && (
            <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                מעביר לדף תשלום...
              </>
            ) : (
              "התחל מנוי ← "
            )}
          </button>

          <p className="text-center text-zinc-600 text-xs mt-4">
            מאובטח על ידי Grow · תשלום מוצפן SSL
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            חזור לדשבורד
          </button>
        </div>
      </div>
    </div>
  );
}
