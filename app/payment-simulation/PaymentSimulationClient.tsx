"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export function PaymentSimulationClient() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let redirectTimer: number | undefined;
    const successTimer = window.setTimeout(async () => {
      setSuccess(true);
      await fetch("/api/analysis/mark-paid", { method: "POST" }).catch((error) => {
        console.error("[payment-simulation] Failed to mark analysis paid", error);
      });
      redirectTimer = window.setTimeout(() => {
        router.push("/onboarding-chat");
      }, 1000);
    }, 3000);

    return () => {
      window.clearTimeout(successTimer);
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#050510] px-5 text-center text-white"
    >
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.055] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-400/14 text-indigo-200 ring-1 ring-indigo-200/25">
          {success ? <CheckCircle2 className="h-8 w-8" /> : <Loader2 className="h-8 w-8 animate-spin" />}
        </div>
        <h1 className="mt-6 text-2xl font-black sm:text-3xl">
          {success ? "✓ התשלום בוצע בהצלחה!" : "מעבד תשלום..."}
        </h1>
        <p className="mt-3 text-base leading-7 text-indigo-100/78">
          {success ? "מעבירים אותך לשאלון..." : "(מצב בדיקה בלבד — לא מתבצע חיוב בפועל)"}
        </p>
      </section>
    </main>
  );
}
