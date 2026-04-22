"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Cpu } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";

const STAGES = [
  "מנתח נתונים עם AI...",
  "מחשב הזדמנויות חיסכון...",
  "בונה מפת הזדמנויות...",
  "מסיים ניתוח...",
];

function stageIndexForProgress(p: number) {
  if (p >= 95) return STAGES.length - 1;
  if (p >= 70) return 2;
  if (p >= 35) return 1;
  return 0;
}

/** Even bar motion while waiting: linear for ~first 40s, then slow approach to cap (never “stuck” at one number too long). */
const WAIT_CAP = 88;
const LINEAR_MS = 42_000;
const LINEAR_MAX = 72;
const TAIL_TAU_MS = 28_000;

function progressWhileWaiting(elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  if (elapsedMs <= LINEAR_MS) {
    return Math.min(WAIT_CAP, (elapsedMs / LINEAR_MS) * LINEAR_MAX);
  }
  const over = elapsedMs - LINEAR_MS;
  const span = WAIT_CAP - LINEAR_MAX;
  const tail = span * (1 - Math.exp(-over / TAIL_TAU_MS));
  return Math.min(WAIT_CAP, LINEAR_MAX + tail);
}

export function LoadingAnalysis() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("businessId");
  const [progress, setProgress] = useState(0);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  useEffect(() => {
    if (!businessId) {
      router.replace("/onboarding");
      return;
    }

    // Clear wizard state after we’re on the loading screen (avoids pre-navigation flash to step 0)
    resetOnboarding();

    const ac = new AbortController();
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(progressWhileWaiting(elapsed));
    }, 220);

    (async () => {
      try {
        const res = await fetch("/api/opportunities/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId }),
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.details || body.error || "יצירת הניתוח נכשלה");
        }
        window.clearInterval(intervalId);
        setProgress(100);
        await new Promise((r) => setTimeout(r, 550));
        if (ac.signal.aborted) return;
        router.replace("/dashboard?fromAnalysis=1");
        router.refresh();
      } catch (e) {
        window.clearInterval(intervalId);
        if (e instanceof Error && e.name === "AbortError") return;
        toast.error(e instanceof Error ? e.message : "שגיאה בניתוח");
        if (!ac.signal.aborted) {
          router.replace("/dashboard?fromAnalysis=1");
          router.refresh();
        }
      }
    })();

    return () => {
      ac.abort();
      window.clearInterval(intervalId);
    };
  }, [businessId, router, resetOnboarding]);

  const displayProgress = Math.min(100, Math.round(progress));
  const stageIdx = stageIndexForProgress(displayProgress);
  const done = displayProgress >= 100;

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-5 py-12"
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        background:
          "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(77,142,255,0.18), transparent 55%), radial-gradient(ellipse 90% 60% at 100% 50%, rgba(139,92,246,0.12), transparent 45%), #0b0c11",
      }}
      dir="rtl"
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full la-loading-blob-a la-loading-core-glow"
        style={{
          background: "radial-gradient(circle, rgba(77,142,255,0.45) 0%, transparent 68%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-20 h-[480px] w-[480px] rounded-full la-loading-blob-b la-loading-core-glow"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Slow rotating accent ring (decorative) */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06] la-loading-spin"
        style={{ marginTop: "-2rem" }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <div
          className="rounded-[28px] border p-10 sm:p-12 text-center"
          style={{
            borderColor: "rgba(77,142,255,0.22)",
            background:
              "linear-gradient(165deg, rgba(22,24,34,0.92) 0%, rgba(14,15,22,0.88) 50%, rgba(17,19,25,0.95) 100%)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px rgba(0,0,0,0.55), 0 0 120px rgba(77,142,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Orb + rings */}
          <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center">
            <span className="la-loading-ring pointer-events-none absolute inset-0 rounded-full border-2 border-blue-400/35" />
            <span className="la-loading-ring-d1 pointer-events-none absolute inset-3 rounded-full border border-violet-400/25" />
            <span className="la-loading-ring-d2 pointer-events-none absolute inset-6 rounded-full border border-cyan-400/20" />
            <div
              className="relative flex h-[76px] w-[76px] items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(145deg, rgba(77,142,255,0.35), rgba(139,92,246,0.2))",
                boxShadow:
                  "0 0 40px rgba(77,142,255,0.25), 0 0 0 1px rgba(255,255,255,0.12) inset, 0 12px 32px rgba(0,0,0,0.4)",
              }}
            >
              <Sparkles className="h-9 w-9 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]" strokeWidth={1.75} />
            </div>
          </div>

          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-200/90">
            <Cpu className="h-3.5 w-3.5 opacity-80" />
            ניתוח AI
          </div>

          <h1
            className="mt-4 text-2xl font-black tracking-tight text-white sm:text-[1.65rem]"
            style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
          >
            בונים את מפת ההזדמנויות
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "#6b7280" }}>
            מודל העומק שלך על העסק — רגע אחד של קסם, כמה שניות של חישובים.
          </p>

          <p
            key={stageIdx}
            className="la-loading-stage mt-8 min-h-[1.75rem] text-[15px] font-semibold leading-snug"
            style={{ color: "#a5b4fc" }}
          >
            {STAGES[stageIdx]}
          </p>

          <div className="mt-6 flex items-end justify-between gap-3 text-xs">
            <span style={{ color: "#525866" }}>התקדמות</span>
            <span
              className="font-black tabular-nums text-lg tracking-tight"
              style={{
                color: done ? "#86efac" : "#93c5fd",
                textShadow: done ? "0 0 24px rgba(134,239,172,0.35)" : "0 0 20px rgba(147,197,253,0.25)",
              }}
            >
              {displayProgress}%
            </span>
          </div>

          <div
            className="relative mt-3 h-3 w-full overflow-hidden rounded-full"
            style={{
              background: "linear-gradient(180deg, #151821 0%, #0f1118 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="relative h-full overflow-hidden rounded-full transition-[width] duration-300 ease-out"
              style={{
                width: `${displayProgress}%`,
                background: done
                  ? "linear-gradient(90deg, #22c55e, #4ade80, #86efac)"
                  : "linear-gradient(90deg, #2563eb, #4d8eff, #a78bfa, #60a5fa)",
                boxShadow: done
                  ? "0 0 20px rgba(74,222,128,0.45)"
                  : "0 0 24px rgba(77,142,255,0.35)",
              }}
            >
              <span
                className="la-loading-shimmer pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                style={{ left: 0 }}
              />
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-1.5">
            {STAGES.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === stageIdx ? 22 : 6,
                  background:
                    i < stageIdx
                      ? "linear-gradient(90deg, #4d8eff, #8b5cf6)"
                      : i === stageIdx
                        ? "linear-gradient(90deg, #60a5fa, #c4b5fd)"
                        : "rgba(255,255,255,0.12)",
                  opacity: i <= stageIdx ? 1 : 0.45,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
