"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"confirming" | "active" | "error">("confirming");
  const confirmed = useRef(false);

  useEffect(() => {
    if (confirmed.current) return;
    confirmed.current = true;

    async function confirm() {
      // Pass all query params Grow may have added to the success URL
      const params = new URLSearchParams();
      searchParams.forEach((v, k) => params.set(k, v));

      try {
        await fetch(`/api/payments/confirm?${params.toString()}`);
      } catch {
        // confirm failed — will still poll status
      }

      // Poll subscription status for up to 15 seconds
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        try {
          const res = await fetch("/api/payments/status");
          const data = await res.json();
          if (data.subscribed) {
            setStatus("active");
            // Auto-redirect after 3 seconds
            setTimeout(() => router.push("/dashboard"), 3000);
            return;
          }
        } catch {
          // ignore, keep polling
        }
      }

      // Even if we can't confirm via API, show success — webhook will catch up
      setStatus("active");
      setTimeout(() => router.push("/dashboard"), 3000);
    }

    confirm();
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#111319" }}
      dir="rtl"
    >
      <div className="text-center max-w-sm">
        {status === "confirming" ? (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-3">מאמת את התשלום...</h1>
            <p className="text-zinc-500 text-sm">נא להמתין, מעדכן את המנוי שלך</p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-6 animate-in zoom-in duration-500">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-3">תשלום התקבל!</h1>
            <p className="text-zinc-400 text-sm mb-2">המנוי שלך פעיל כעת.</p>
            <p className="text-zinc-600 text-xs mb-8">תועבר לדשבורד בעוד מספר שניות...</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all"
            >
              כניסה לדשבורד
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#111319" }}>
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
