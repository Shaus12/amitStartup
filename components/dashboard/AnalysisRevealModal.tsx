"use client";

import { useMemo } from "react";
import type { AnalysisSummarySnapshot } from "@/lib/types/business-map";
import { useEaseOutCountUp } from "@/lib/hooks/useEaseOutCountUp";

const REVEAL_LS_PREFIX = "reveal_shown_";

export function revealStorageKey(businessId: string) {
  return `${REVEAL_LS_PREFIX}${businessId}`;
}

const BENCHMARK_LEADER = 8.4;

const HERO_TEAL = "#00d4aa";
const HERO_AMBER = "#f59e0b";
const CARD_BG = "#0f0f1a";

interface AnalysisRevealModalProps {
  open: boolean;
  onDismiss: () => void;
  businessId: string;
  summary: AnalysisSummarySnapshot | null;
}

function fmtHealth10(v: number | null) {
  if (v == null) return "—";
  return Math.abs(v - Math.round(v)) < 0.05 ? `${Math.round(v)}` : v.toFixed(1);
}

export function AnalysisRevealModal({ open, onDismiss, businessId, summary }: AnalysisRevealModalProps) {
  const hoursTarget = Math.round(summary?.hoursSavedPerMonth ?? 0);
  const moneyTarget = Math.round(summary?.moneySavedPerYear ?? 0);
  const hoursAnim = useEaseOutCountUp(hoursTarget, 1500, open);
  const moneyAnim = useEaseOutCountUp(moneyTarget, 1500, open);

  const oppCount = summary?.opportunityCount ?? 0;
  const deptCount = summary?.departmentCount ?? 0;
  const healthRaw = summary?.healthScoreOutOf10 ?? null;
  const quote = summary?.questionnaireQuote;

  const gapVsLeader = useMemo(() => {
    if (healthRaw == null) return null;
    return Math.max(0, BENCHMARK_LEADER - healthRaw);
  }, [healthRaw]);

  const currentPct = healthRaw != null ? Math.min(100, Math.max(0, (healthRaw / 10) * 100)) : null;

  function handleCta() {
    try {
      localStorage.setItem(revealStorageKey(businessId), "1");
    } catch {
      /* ignore */
    }
    onDismiss();
  }

  function handleBackdropDismiss() {
    onDismiss();
  }

  if (!open) return null;

  const hoursDisplay = Math.round(hoursAnim);
  const moneyDisplay = Math.round(moneyAnim);
  const moneyStr = moneyDisplay.toLocaleString("he-IL");
  const hoursLen = String(hoursDisplay).length;
  const moneyLen = moneyStr.length;

  const hoursFontClamp =
    hoursLen >= 6
      ? "clamp(1rem, min(5.5vw, 14cqw), 2.35rem)"
      : hoursLen >= 4
        ? "clamp(1.35rem, min(7vw, 18cqw), 3.25rem)"
        : "clamp(1.5rem, min(9vw, 22cqw), 4rem)";
  const moneyFontClamp =
    moneyLen >= 14
      ? "clamp(0.65rem, min(2.4vw, 6.5cqw), 1.45rem)"
      : moneyLen >= 11
        ? "clamp(0.8rem, min(3.2vw, 8.5cqw), 1.85rem)"
        : moneyLen >= 8
          ? "clamp(0.95rem, min(4vw, 11cqw), 2.35rem)"
          : "clamp(1.1rem, min(5.5vw, 14cqw), 3rem)";

  return (
    <div
      className="reveal-modal-overlay-anim fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden overscroll-y-contain"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      dir="rtl"
      aria-modal="true"
      role="dialog"
      aria-labelledby="reveal-modal-title"
      onClick={handleBackdropDismiss}
    >
      {/* Light veil + subtle blur so the dashboard stays readable */}
      <div
        className="pointer-events-none fixed inset-0 bg-black/35 backdrop-blur-[2px] backdrop-saturate-125 sm:backdrop-blur-[3px]"
        aria-hidden
      />

      {/* min-h centers short modals; tall modals stay fully scrollable */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full justify-center px-3 py-6 sm:px-4 sm:py-8">
        <div
          className="reveal-modal-card-anim my-auto w-full max-w-[600px] shrink-0 rounded-3xl p-px shadow-2xl touch-pan-y"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.85), rgba(20,184,166,0.55), rgba(99,102,241,0.5))",
            boxShadow: "0 48px 120px rgba(0,0,0,0.72)",
          }}
        >
          <div
            className="relative overflow-y-auto overscroll-contain rounded-[22px] p-5 sm:p-8 [-webkit-overflow-scrolling:touch]"
            style={{
              background: `linear-gradient(155deg, ${CARD_BG} 0%, #111118 52%, #090912 100%)`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              maxHeight: "calc(100dvh - 2.5rem - env(safe-area-inset-bottom, 0px))",
              scrollbarGutter: "stable",
            }}
          >
          <div id="reveal-modal-title" className="sr-only">
            סיכום ניתוח — benchmark והזדמנויות
          </div>

          {/* SECTION 1 — Hero metrics (LTR: hours left, money right). min-w-0 + no overflow clip so large ₪ values fit. */}
          <div
            className="grid grid-cols-2 gap-0 rounded-2xl border border-white/[0.06]"
            style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
            dir="ltr"
          >
            <div
              className="relative min-w-0 px-2 py-5 text-center sm:px-4 sm:py-7 border-e border-white/[0.08]"
              style={{ containerType: "inline-size" }}
            >
              <div
                className="mx-auto w-full max-w-full break-all tabular-nums font-black leading-[1.05] tracking-tight"
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: hoursFontClamp,
                  color: HERO_TEAL,
                  textShadow: "0 0 40px rgba(0,212,170,0.35)",
                  overflowWrap: "anywhere",
                }}
              >
                {hoursDisplay}
              </div>
              <div
                className="mt-3 text-[10px] font-bold uppercase tracking-widest sm:text-xs md:text-sm"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                שעות חיסכון בחודש
              </div>
            </div>
            <div
              className="relative min-w-0 px-2 py-5 text-center sm:px-4 sm:py-7"
              style={{ containerType: "inline-size" }}
            >
              <div
                className="mx-auto w-full max-w-full break-all tabular-nums font-black leading-[1.05] tracking-tight"
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: moneyFontClamp,
                  color: HERO_AMBER,
                  textShadow: "0 0 36px rgba(245,158,11,0.3)",
                  overflowWrap: "anywhere",
                }}
              >
                <span className="inline text-white/50" style={{ fontSize: "0.5em", marginRight: "0.08em" }}>
                  ₪
                </span>
                {moneyStr}
              </div>
              <div
                className="mt-3 text-[10px] font-bold uppercase tracking-widest sm:text-xs md:text-sm"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                חיסכון כספי בשנה
              </div>
            </div>
          </div>

          {/* SECTION 2 — Benchmark */}
          <div className="mt-10 text-center">
            <div
              className="text-[10px] font-black tracking-[0.35em] text-white/35"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              BENCHMARK
            </div>
            <h2
              className="mt-2 text-xl font-black text-white sm:text-2xl"
              style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif", letterSpacing: "-0.02em" }}
            >
              איפה אתה עומד מול עסקים דומים
            </h2>

            <div className="mt-6 px-1" dir="ltr">
              <div
                className="relative mx-auto h-4 w-full max-w-md overflow-hidden rounded-full"
                style={{
                  background: "linear-gradient(90deg, #ef4444 0%, #eab308 45%, #22c55e 100%)",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.35)",
                }}
              >
                <div className="absolute bottom-0 top-0 w-px bg-black/35" style={{ left: "56%" }} aria-hidden />
                <div className="absolute bottom-0 top-0 w-px bg-black/35" style={{ left: "84%" }} aria-hidden />

                {/* Market */}
                <div
                  className="absolute top-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: "56%" }}
                >
                  <span
                    className="h-3 w-3 rotate-45 rounded-sm border border-white/40 bg-[#1e1b4b]"
                    style={{ boxShadow: "0 0 12px rgba(167,139,250,0.5)" }}
                  />
                </div>
                {/* Leader */}
                <div
                  className="absolute top-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: "84%" }}
                >
                  <span
                    className="h-3 w-3 rotate-45 rounded-sm border border-amber-200/50 bg-amber-500/90"
                    style={{ boxShadow: "0 0 12px rgba(245,158,11,0.55)" }}
                  />
                </div>
                {/* You */}
                {currentPct != null && (
                  <div
                    className="absolute top-1/2 z-[2] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                    style={{ left: `${currentPct}%` }}
                  >
                    <span
                      className="h-4 w-4 rounded-full border-2 border-white bg-white/95"
                      style={{
                        boxShadow:
                          "0 0 0 4px rgba(255,255,255,0.15), 0 0 24px rgba(255,255,255,0.55), 0 0 40px rgba(20,184,166,0.35)",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="relative mx-auto mt-3 flex max-w-md justify-between text-[10px] font-semibold text-white/40">
                <span>0</span>
                <span>10</span>
              </div>
              <div className="relative mx-auto mt-2 h-8 max-w-md" dir="ltr">
                <span
                  className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-violet-300/95"
                  style={{ left: "56%" }}
                >
                  ממוצע השוק
                </span>
                <span
                  className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-amber-300/95"
                  style={{ left: "84%" }}
                >
                  מוביל הענף
                </span>
                {currentPct != null && (
                  <span
                    className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-teal-300"
                    style={{ left: `${currentPct}%` }}
                  >
                    הציון שלך
                  </span>
                )}
              </div>
            </div>

            {gapVsLeader != null && healthRaw != null ? (
              <p
                className="mx-auto mt-5 max-w-lg px-2 text-sm font-medium leading-relaxed sm:text-base"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {gapVsLeader < 0.15 ? (
                  <>אתה במרחק נגיעה ממובילי הענף — נמשיך לסגור את הפער עם ההמלצות במפה.</>
                ) : (
                  <>
                    יש לך פער של{" "}
                    <span className="font-black" style={{ color: HERO_TEAL }}>
                      {gapVsLeader.toFixed(1)}
                    </span>{" "}
                    נקודות מול מוביל הענף — זה בדיוק הפער שאנחנו סוגרים.
                  </>
                )}
              </p>
            ) : (
              <p className="mx-auto mt-5 max-w-lg text-sm text-white/40">אין עדיין ציון בריאות להשוואת benchmark.</p>
            )}
          </div>

          {/* SECTION 3 — Quote */}
          <div className="mt-10 border-t border-white/[0.06] pt-10">
            <p className="text-center text-xs font-medium text-white/40">מה אמרת בשאלון</p>
            {quote ? (
              <blockquote
                className="mx-auto mt-4 max-w-xl px-2 text-lg font-medium italic leading-relaxed sm:text-xl"
                style={{
                  color: "rgba(226,232,240,0.88)",
                  borderRight: "3px solid rgba(167,139,250,0.45)",
                  paddingRight: "1.25rem",
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                }}
              >
                {quote}
              </blockquote>
            ) : (
              <p className="mt-4 text-center text-sm text-white/35">אין ציטוט זמין מהשאלון</p>
            )}
            <p className="mx-auto mt-5 max-w-xl text-center text-[11px] leading-relaxed text-white/35">
              אנחנו לא ממציאים את הכאב. אתה הגדרת אותו, אנחנו רק מנהלים את הפתרון.
            </p>
          </div>

          {/* SECTION 4 — Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { v: oppCount, label: "הזדמנויות שזוהו" },
              { v: `${fmtHealth10(healthRaw)}/10`, label: "ציון בריאות" },
              { v: deptCount, label: "מחלקות שנותחו" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/[0.07] px-3 py-4 text-center"
                style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
              >
                <div
                  className="text-xl font-black tabular-nums text-white sm:text-2xl"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {s.v}
                </div>
                <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/35">{s.label}</div>
              </div>
            ))}
          </div>

          {/* SECTION 5 — CTA */}
          <button
            type="button"
            onClick={handleCta}
            className="mt-10 w-full rounded-2xl py-4 text-base font-black transition-all duration-200 hover:brightness-110 active:scale-[0.99]"
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              background: "linear-gradient(90deg, #7c3aed 0%, #5b21b6 35%, #0d9488 100%)",
              color: "#fff",
              boxShadow: "0 0 40px rgba(124,58,237,0.35), 0 0 60px rgba(20,184,166,0.15)",
              border: "none",
              cursor: "pointer",
            }}
          >
            ראה את המפה המלאה שלי ←
          </button>
          <p className="mt-3 text-center text-[11px] font-medium text-white/30">
            המפה כוללת המלצות מפורטות לכל מחלקה
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
