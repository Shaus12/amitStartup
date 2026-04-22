"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import type { AnalysisSummarySnapshot } from "@/lib/types/business-map";
import { useEaseOutCountUp } from "@/lib/hooks/useEaseOutCountUp";

export const SUMMARY_CARD_NODE_ID = "__analysis_summary_card__";

export interface SummaryCardNodeData extends Record<string, unknown> {
  summary: AnalysisSummarySnapshot;
  onOpenReveal: () => void;
}

export type SummaryCardNodeType = Node<SummaryCardNodeData, "summaryCard">;

const CARD_W = 500;
const CARD_H = 152;

const TEAL = "#00d4aa";
const AMBER = "#f59e0b";
const PURPLE = "#a78bfa";

function scoreOutOf10(s: AnalysisSummarySnapshot): number | null {
  if (s.healthScoreOutOf10 != null) return s.healthScoreOutOf10;
  const h = s.healthScore;
  if (h == null) return null;
  if (h <= 10) return Math.min(10, Math.max(0, h));
  return Math.min(10, Math.max(0, Math.round((h / 10) * 10) / 10));
}

function fmtAnim10(v: number) {
  return Math.abs(v - Math.round(v)) < 0.08 ? `${Math.round(v)}` : v.toFixed(1);
}

function SummaryCardInner({ data }: NodeProps<SummaryCardNodeType>) {
  const { summary, onOpenReveal } = data;
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.25, rootMargin: "40px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hoursT = Math.round(summary.hoursSavedPerMonth ?? 0);
  const moneyT = Math.round(summary.moneySavedPerYear ?? 0);
  const oppsT = summary.opportunityCount ?? 0;
  const healthT = scoreOutOf10(summary);

  const hoursV = useEaseOutCountUp(hoursT, 1500, inView);
  const moneyV = useEaseOutCountUp(moneyT, 1500, inView);
  const oppsV = useEaseOutCountUp(oppsT, 1500, inView);
  const healthV = useEaseOutCountUp(healthT ?? 0, 1500, inView && healthT != null);

  const healthLabel =
    healthT == null ? "—" : `${fmtAnim10(healthV)}/10`;

  return (
    <div
      ref={rootRef}
      className="cursor-pointer select-none transition-transform duration-200 hover:scale-[1.01]"
      style={{
        width: CARD_W,
        height: CARD_H,
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
      onClick={() => onOpenReveal()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenReveal();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className="h-full rounded-2xl p-px"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.75), rgba(20,184,166,0.55), rgba(99,102,241,0.45))",
          boxShadow: "0 12px 48px rgba(0,0,0,0.55), 0 0 32px rgba(124,58,237,0.12)",
        }}
      >
        <div
          className="flex h-full flex-col overflow-hidden rounded-[14px]"
          style={{
            background: "linear-gradient(165deg, #0f0f1a 0%, #12121f 55%, #0a0a12 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div
            className="shrink-0 border-b border-white/[0.06] py-2 text-center text-[10px] font-black uppercase tracking-[0.28em]"
            style={{
              color: "#5eead4",
              background: "linear-gradient(90deg, rgba(124,58,237,0.12), rgba(20,184,166,0.08))",
            }}
          >
            ✦ סיכום הניתוח
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-4 gap-1 px-2 py-3">
            {[
              {
                value: `${Math.round(hoursV)}`,
                label: "שעות חיסכון / חודש",
                color: TEAL,
                glow: "rgba(0,212,170,0.35)",
              },
              {
                value: `₪${Math.round(moneyV).toLocaleString("he-IL")}`,
                label: "חיסכון כספי / שנה",
                color: AMBER,
                glow: "rgba(245,158,11,0.28)",
              },
              {
                value: `${Math.round(oppsV)}`,
                label: "הזדמנויות",
                color: PURPLE,
                glow: "rgba(167,139,250,0.35)",
              },
              {
                value: healthLabel,
                label: "ציון בריאות",
                color: "#f8fafc",
                glow: "rgba(248,250,252,0.12)",
              },
            ].map((col) => (
              <div key={col.label} className="flex flex-col items-center justify-center px-1 text-center">
                <span
                  className="text-lg font-black leading-none tabular-nums sm:text-xl"
                  style={{
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    color: col.color,
                    textShadow: `0 0 20px ${col.glow}`,
                  }}
                >
                  {col.value}
                </span>
                <span className="mt-1.5 text-[8px] font-bold uppercase leading-tight tracking-wide text-white/38">
                  {col.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const SummaryCard = memo(SummaryCardInner);
