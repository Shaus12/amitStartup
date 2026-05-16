"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function SubscribeErrorPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bv-bg)" }}
      dir="rtl"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-3">התשלום לא הושלם</h1>
        <p className="text-[var(--bv-text-3)] text-sm mb-8">
          משהו השתבש בתהליך התשלום. לא חויבת.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/subscribe")}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all"
          >
            נסה שוב
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2.5 rounded-xl border border-[var(--bv-border-subtle)] hover:border-zinc-600 text-[var(--bv-text-3)] hover:text-[var(--bv-text-2)] font-bold text-sm transition-all"
          >
            חזור לדשבורד
          </button>
        </div>
      </div>
    </div>
  );
}
