"use client";

import { useRouter } from "next/navigation";
import { CreditCard, Zap, Crown, BarChart2, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";

type Sub = {
  status: string;
  plan_name: string;
  amount_ils: number;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
} | null;

type UsageRow = {
  call_type: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number | null;
  created_at: string;
};

const CALL_TYPE_LABELS: Record<string, string> = {
  analysis: "ניתוח עסקי",
  chat: "צ'אט AI",
  daily_tip: "טיפ יומי",
  project_planning: "תכנון פרויקט",
  knowledge_request: "שאלת ידע",
  gift_selection: "בחירת מתנה",
  gift_generation: "יצירת מתנה",
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

function groupUsage(rows: UsageRow[]) {
  const map: Record<string, { calls: number; inputTokens: number; outputTokens: number; costUsd: number }> = {};
  for (const r of rows) {
    if (!map[r.call_type]) map[r.call_type] = { calls: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 };
    map[r.call_type].calls++;
    map[r.call_type].inputTokens += r.input_tokens ?? 0;
    map[r.call_type].outputTokens += r.output_tokens ?? 0;
    map[r.call_type].costUsd += r.estimated_cost_usd ?? 0;
  }
  return Object.entries(map).sort((a, b) => b[1].calls - a[1].calls);
}

export function BillingClient({ sub, usageRows, userEmail }: { sub: Sub; usageRows: UsageRow[]; userEmail: string }) {
  const router = useRouter();

  const isActive = sub?.status === "active" && (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
  const totalCalls = usageRows.length;
  const totalTokens = usageRows.reduce((s, r) => s + (r.input_tokens ?? 0) + (r.output_tokens ?? 0), 0);
  const totalCostUsd = usageRows.reduce((s, r) => s + (r.estimated_cost_usd ?? 0), 0);
  const grouped = groupUsage(usageRows);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-extrabold text-white mb-1">מנוי ושימוש</h1>
        <p className="text-zinc-500 text-sm">{userEmail}</p>
      </div>

      {/* Subscription Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-bold text-base">המנוי שלך</p>
              <p className="text-zinc-500 text-xs">חיוב חודשי</p>
            </div>
          </div>
          {isActive ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> פעיל
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" /> לא פעיל
            </span>
          )}
        </div>

        {sub ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "תוכנית", value: sub.plan_name === "basic" ? "ניסיון" : sub.plan_name === "pro" ? "Pro" : sub.plan_name },
              { label: "מחיר", value: `${sub.amount_ils}₪ / חודש` },
              { label: "התחלה", value: fmt(sub.current_period_start ?? sub.created_at) },
              { label: "חידוש", value: fmt(sub.current_period_end) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-zinc-800/40 px-4 py-3">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-white text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm mb-6">אין מנוי פעיל כרגע.</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/subscribe")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all"
          >
            <Crown className="w-4 h-4" />
            {isActive ? "שדרג תוכנית" : "בחר מסלול"}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-bold text-base">שימוש ב-30 יום האחרונים</p>
            <p className="text-zinc-500 text-xs">קריאות AI לפי סוג</p>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "סה״כ קריאות", value: totalCalls.toLocaleString(), icon: Zap, color: "blue" },
            { label: "טוקנים שנצרכו", value: totalTokens.toLocaleString(), icon: BarChart2, color: "purple" },
            { label: "עלות משוערת", value: `$${totalCostUsd.toFixed(4)}`, icon: CreditCard, color: "green" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl bg-zinc-800/40 px-4 py-3 text-center">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-lg font-extrabold ${color === "blue" ? "text-blue-400" : color === "purple" ? "text-purple-400" : "text-green-400"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Breakdown table */}
        {grouped.length > 0 ? (
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3">פירוט לפי סוג</p>
            {grouped.map(([type, data]) => (
              <div key={type} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-zinc-300 font-medium">
                    {CALL_TYPE_LABELS[type] ?? type}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-zinc-500">קריאות</p>
                    <p className="text-sm text-white font-bold">{data.calls}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">טוקנים</p>
                    <p className="text-sm text-white font-bold">{(data.inputTokens + data.outputTokens).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">עלות</p>
                    <p className="text-sm text-zinc-400">${(data.costUsd).toFixed(4)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-600 text-sm">
            אין נתוני שימוש ל-30 יום האחרונים
          </div>
        )}
      </div>
    </div>
  );
}
