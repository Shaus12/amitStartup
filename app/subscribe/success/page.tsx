"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function SubscribeSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Give webhook time to process, then redirect
    const t = setTimeout(() => router.push("/dashboard"), 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#111319" }}
      dir="rtl"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-3">התשלום בוצע בהצלחה!</h1>
        <p className="text-zinc-400 text-sm mb-2">המנוי שלך פעיל כעת.</p>
        <p className="text-zinc-600 text-xs">מועבר לדשבורד...</p>
      </div>
    </div>
  );
}
