"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

const pageStyles = `
  @keyframes expiredBlob1 {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -46px) scale(1.08); }
    66% { transform: translate(-22px, 24px) scale(0.92); }
    100% { transform: translate(0, 0) scale(1); }
  }

  @keyframes expiredBlob2 {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-34px, 48px) scale(1.16); }
    66% { transform: translate(18px, -24px) scale(0.86); }
    100% { transform: translate(0, 0) scale(1); }
  }

  @keyframes expiredBlob3 {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(38px, 18px) scale(0.92); }
    66% { transform: translate(-42px, -18px) scale(1.1); }
    100% { transform: translate(0, 0) scale(1); }
  }

  .subscription-expired-aurora {
    position: absolute;
    filter: blur(80px);
    opacity: 0.16;
    pointer-events: none;
  }
`;

const systemFeatures = [
  "מפה ויזואלית של העסק",
  "יועץ AI אישי",
  "לוח משימות חכם",
  "עדכונים ורענון ניתוח",
];

export function SubscriptionExpiredClient() {
  const router = useRouter();
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  const openLatestReport = async () => {
    if (loadingReport) return;
    setLoadingReport(true);
    setReportError("");

    try {
      const res = await fetch("/api/analysis-report/latest");
      const data = (await res.json().catch(() => ({}))) as {
        reportId?: string;
        error?: string;
      };

      if (!res.ok || !data.reportId) {
        throw new Error(data.error || "לא נמצא ניתוח שמור");
      }

      router.push(`/analysis/${data.reportId}`);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "לא ניתן לפתוח את הניתוח כרגע");
      setLoadingReport(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#050510] px-5 py-10 text-white sm:px-8"
    >
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="subscription-expired-aurora left-[-160px] top-[-150px] h-[520px] w-[520px] rounded-full sm:h-[650px] sm:w-[650px]"
          style={{
            background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
            animation: "expiredBlob1 8s infinite alternate",
          }}
        />
        <div
          className="subscription-expired-aurora bottom-[8%] right-[-130px] h-[470px] w-[470px] rounded-full sm:h-[560px] sm:w-[560px]"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            animation: "expiredBlob2 12s infinite alternate",
          }}
        />
        <div
          className="subscription-expired-aurora left-[14%] top-[34%] h-[360px] w-[360px] rounded-full sm:h-[440px] sm:w-[440px]"
          style={{
            background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)",
            animation: "expiredBlob3 10s infinite alternate",
          }}
        />
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center">
        <header className="mx-auto max-w-3xl text-center">
          <div className="text-6xl">⏰</div>
          <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-5xl">
            הגישה למערכת הסתיימה
          </h1>
          <p className="mt-4 text-base leading-7 text-indigo-100/78 sm:text-xl">
            הניסיון החינמי או המנוי שלך פג — אבל הניתוח שלך שמור ומחכה לך
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="rounded-lg bg-gradient-to-l from-indigo-400/55 via-violet-400/45 to-sky-400/55 p-px shadow-[0_24px_80px_rgba(79,70,229,0.24)]">
            <div className="flex h-full flex-col rounded-lg bg-[#0d1020]/95 p-6 backdrop-blur-xl sm:p-8">
              <h2 className="text-2xl font-black text-white">המשך להשתמש במערכת</h2>
              <ul className="mt-6 space-y-4">
                {systemFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-base leading-7 text-white/86">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/14 text-emerald-300 ring-1 ring-emerald-300/25">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-3xl font-black text-white">₪79 לחודש</div>
              <Link
                href="/billing"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-gradient-to-l from-indigo-500 via-violet-500 to-sky-500 px-6 py-3 text-base font-black text-white shadow-[0_18px_48px_rgba(79,70,229,0.36)] transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#0d1020]"
              >
                שדרג עכשיו ←
              </Link>
            </div>
          </article>

          <article className="flex flex-col rounded-lg border border-white/12 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
            <h2 className="text-2xl font-black text-white">חזור לניתוח שלך</h2>
            <p className="mt-5 flex-1 text-base leading-8 text-indigo-100/74 sm:text-lg">
              הניתוח המלא שרכשת תמיד זמין לך — בלי תשלום נוסף
            </p>
            <button
              type="button"
              onClick={() => void openLatestReport()}
              disabled={loadingReport}
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/14 bg-white/[0.07] px-6 py-3 text-base font-black text-white transition hover:bg-white/[0.105] focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#050510] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingReport && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              צפה בניתוח ←
            </button>
            {reportError && (
              <p className="mt-3 text-sm font-medium text-rose-200">{reportError}</p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
