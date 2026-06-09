"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

const REDIRECT_SECONDS = 3;
const MAX_RETRIES = 3;

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [elapsedMs, setElapsedMs] = useState(0);
  const isAnalysisPayment = searchParams.get("type") === "analysis";
  const redirectPath = isAnalysisPayment ? "/onboarding-chat" : "/dashboard";

  // Error / retry state (only relevant for analysis payments)
  const [markPaidError, setMarkPaidError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const timersCancelledRef = useRef(false);

  const callMarkPaid = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/analysis/mark-paid", { method: "POST" });
      return res.ok;
    } catch (err) {
      console.error("[payment-success] mark-paid network error:", err);
      return false;
    }
  }, []);

  const goToRedirectPath = useCallback(async () => {
    if (!isAnalysisPayment) {
      router.push(redirectPath);
      return;
    }

    const ok = await callMarkPaid();
    if (ok) {
      router.push(redirectPath);
    } else {
      // Block redirect and surface the error
      timersCancelledRef.current = true;
      setMarkPaidError(true);
    }
  }, [isAnalysisPayment, redirectPath, router, callMarkPaid]);

  // Auto-countdown timer (runs once on mount)
  useEffect(() => {
    const startedAt = Date.now();
    const durationMs = REDIRECT_SECONDS * 1000;

    const interval = window.setInterval(() => {
      if (!timersCancelledRef.current) {
        setElapsedMs(Math.min(Date.now() - startedAt, durationMs));
      }
    }, 50);

    const timeout = window.setTimeout(() => {
      if (!timersCancelledRef.current) {
        void goToRedirectPath();
      }
    }, durationMs);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once; goToRedirectPath is called by the timeout

  const handleRetry = async () => {
    if (isRetrying) return;
    const nextCount = retryCount + 1;
    setRetryCount(nextCount);
    setIsRetrying(true);
    setMarkPaidError(false);

    const ok = await callMarkPaid();
    setIsRetrying(false);

    if (ok) {
      router.push(redirectPath);
    } else {
      setMarkPaidError(true);
    }
  };

  const progress = Math.min((elapsedMs / (REDIRECT_SECONDS * 1000)) * 100, 100);
  const exhaustedRetries = retryCount >= MAX_RETRIES;

  // ── Error state (mark-paid failed) ──────────────────────────────────────────
  if (markPaidError) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-4"
        style={{ backgroundColor: "var(--bv-bg)" }}
        dir="rtl"
      >
        <div className="w-full max-w-md text-center">
          <div className="mb-7 inline-flex size-24 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 shadow-[0_0_48px_rgba(239,68,68,0.18)]">
            <AlertCircle className="size-12 text-red-400" aria-hidden="true" />
          </div>

          <h1 className="mb-3 text-2xl font-extrabold text-white">
            שגיאה בעדכון התשלום
          </h1>

          {!exhaustedRetries ? (
            <>
              <p className="mb-6 text-base text-[var(--bv-muted)]">
                אירעה שגיאה בעדכון התשלום. לחץ כאן לנסות שוב
              </p>
              <button
                type="button"
                onClick={() => void handleRetry()}
                disabled={isRetrying}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[var(--bv-bg)] disabled:opacity-60"
              >
                <RefreshCw className={`size-4 ${isRetrying ? "animate-spin" : ""}`} aria-hidden="true" />
                {isRetrying ? "מנסה שוב..." : "נסה שוב"}
              </button>
              <p className="mt-3 text-xs text-[var(--bv-muted)]">
                ניסיון {retryCount} מתוך {MAX_RETRIES}
              </p>
            </>
          ) : (
            <>
              <p className="mb-4 text-base text-[var(--bv-muted)]">
                אם הבעיה נמשכת, צור קשר איתנו בכתובת{" "}
                <a
                  href="mailto:support@bizmapai.com"
                  className="font-semibold text-blue-400 underline hover:text-blue-300"
                >
                  support@bizmapai.com
                </a>
              </p>
              <p className="text-sm text-[var(--bv-muted)]">
                התשלום שלך התקבל בהצלחה — נסייע לך לסיים את ההגדרה בהקדם.
              </p>
            </>
          )}
        </div>
      </main>
    );
  }

  // ── Success / countdown state ────────────────────────────────────────────────
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--bv-bg)" }}
      dir="rtl"
    >
      <div className="w-full max-w-md text-center">
        <div className="mb-7 inline-flex size-24 animate-pulse items-center justify-center rounded-full border border-green-500/25 bg-green-500/10 shadow-[0_0_48px_rgba(34,197,94,0.18)]">
          <CheckCircle2 className="size-12 text-green-400" aria-hidden="true" />
        </div>

        <h1 className="mb-3 text-3xl font-extrabold text-white">התשלום התקבל בהצלחה! 🎉</h1>
        <p className="mb-2 text-lg font-bold text-[var(--bv-text-1)]">
          הניתוח שלך מוכן! מעביר אותך לשאלון...
        </p>
        <p className="mb-6 text-sm text-[var(--bv-muted)]">
          מועבר לשאלון תוך 3 שניות...
        </p>

        <div className="mb-7 h-2 overflow-hidden rounded-full bg-[var(--bv-surface-raised)]">
          <div
            className="h-full rounded-full bg-green-400 transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => void goToRedirectPath()}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[var(--bv-bg)]"
        >
          עבור לשאלון עכשיו
        </button>
      </div>
    </main>
  );
}
