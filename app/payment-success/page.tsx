"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

const REDIRECT_SECONDS = 3;

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const durationMs = REDIRECT_SECONDS * 1000;

    const interval = window.setInterval(() => {
      setElapsedMs(Math.min(Date.now() - startedAt, durationMs));
    }, 50);

    const timeout = window.setTimeout(() => {
      router.push("/dashboard");
    }, durationMs);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [router]);

  const progress = Math.min((elapsedMs / (REDIRECT_SECONDS * 1000)) * 100, 100);

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
        <p className="mb-2 text-lg font-bold text-zinc-200">ברוכים הבאים ל-BizMap Pro</p>
        <p className="mb-6 text-sm text-zinc-500">מועבר לדאשבורד שלך תוך 3 שניות...</p>

        <div className="mb-7 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-green-400 transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[var(--bv-bg)]"
        >
          עבור לדאשבורד עכשיו
        </button>
      </div>
    </main>
  );
}
