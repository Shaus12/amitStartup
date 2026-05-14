"use client";

import { Star, X, Clock, DollarSign, Bot, Zap, ArrowRight, Layers, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { AiOpportunityItem } from "@/lib/types/opportunities";

interface OpportunityCardProps {
  opportunity: AiOpportunityItem;
  onPin: () => void;
  onDismiss: () => void;
}

const CATEGORY_STYLE: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  ai_agent: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", label: "סוכן AI", icon: <Bot className="w-3 h-3" /> },
  automation: { color: "#4d8eff", bg: "rgba(77,142,255,0.12)", label: "אוטומציה", icon: <Zap className="w-3 h-3" /> },
  ai_tool: { color: "#34d399", bg: "rgba(52,211,153,0.12)", label: "כלי AI", icon: <Zap className="w-3 h-3" /> },
  process_change: { color: "#fb923c", bg: "rgba(251,146,60,0.12)", label: "תהליך", icon: <Layers className="w-3 h-3" /> },
};

const EFFORT_STYLE: Record<string, { color: string; label: string }> = {
  low: { color: "#34d399", label: "ניצחון מהיר" },
  medium: { color: "#fbbf24", label: "מאמץ בינוני" },
  high: { color: "#f87171", label: "פרויקט גדול" },
};

const IMPACT_COLOR: Record<string, string> = {
  // New values from Claude
  time:   "#4d8eff",
  money:  "#34d399",
  growth: "#fbbf24",
  // Legacy values
  time_savings: "#4d8eff",
  cost_savings:  "#34d399",
  revenue:       "#fbbf24",
  quality:       "#a78bfa",
};

export function OpportunityCard({ opportunity, onPin, onDismiss }: OpportunityCardProps) {
  const router = useRouter();
  const isPinned = opportunity.pinned;
  const isLocked = opportunity.isLocked ?? false;
  const cat = CATEGORY_STYLE[opportunity.category ?? "automation"] ?? CATEGORY_STYLE.automation;
  const effort = opportunity.implementationEffort ? EFFORT_STYLE[opportunity.implementationEffort] : null;
  const accentColor = IMPACT_COLOR[opportunity.impactType] ?? "#4d8eff";

  if (isLocked) {
    return (
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--bv-surface-raised)",
          border: "1px solid var(--bv-border)",
        }}
      >
        <div className="p-4 filter blur-[2px] select-none pointer-events-none" aria-hidden="true">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-16 h-4 rounded-full" style={{ backgroundColor: "var(--bv-border)" }} />
            <span className="inline-block w-10 h-4 rounded-full" style={{ backgroundColor: "var(--bv-border)" }} />
          </div>
          <div className="w-3/4 h-3.5 rounded mb-1" style={{ backgroundColor: "var(--bv-border)" }} />
          <div className="w-1/2 h-3 rounded mb-3" style={{ backgroundColor: "var(--bv-surface-elevated)" }} />
          <div className="flex gap-2">
            <span className="inline-block w-20 h-6 rounded-full" style={{ backgroundColor: "var(--bv-surface-elevated)" }} />
            <span className="inline-block w-16 h-6 rounded-full" style={{ backgroundColor: "var(--bv-surface-elevated)" }} />
          </div>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ backgroundColor: "rgba(19,21,29,0.7)" }}
        >
          <Lock className="w-4 h-4" style={{ color: "var(--bv-text-3)" }} />
          <button
            onClick={() => router.push("/billing")}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: "rgba(77,142,255,0.15)", color: "#4d8eff", border: "1px solid rgba(77,142,255,0.3)" }}
          >
            שדרג עכשיו
          </button>
        </div>
      </div>
    );
  }

  const agentTools = opportunity.agentTools
    ? opportunity.agentTools.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all duration-150 group"
      style={{
        backgroundColor: "var(--bv-surface-raised)",
        border: isPinned ? `1px solid rgba(251,191,36,0.35)` : "1px solid var(--bv-border)",
        boxShadow: isPinned ? "0 0 0 1px rgba(251,191,36,0.1)" : "none",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = isPinned ? "rgba(251,191,36,0.5)" : "var(--bv-muted)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = isPinned ? "rgba(251,191,36,0.35)" : "var(--bv-border)"; }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: accentColor, opacity: 0.7 }}
      />

      <div className="pl-5 pr-4 py-4">
        {/* Top row: category + dept + actions */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category badge */}
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: cat.bg, color: cat.color }}
            >
              {cat.icon}
              {cat.label}
            </span>

            {/* Department chip */}
            {opportunity.department && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: (opportunity.department.color ?? "#4d8eff") + "20",
                  color: opportunity.department.color ?? "#4d8eff",
                }}
              >
                {opportunity.department.name}
              </span>
            )}

            {/* Effort */}
            {effort && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: effort.color + "15", color: effort.color }}
              >
                {effort.label}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onPin}
              aria-label={isPinned ? "הסר נעיצה" : "נעץ"}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: isPinned ? "#fbbf24" : "var(--bv-muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fbbf24"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isPinned ? "#fbbf24" : "var(--bv-muted)"; }}
            >
              <Star className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={onDismiss}
              aria-label="התעלם"
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "var(--bv-muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--bv-muted)"; }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-sm font-semibold mb-1 leading-snug"
          style={{ color: "var(--bv-text-1)", fontFamily: "var(--font-manrope)" }}
        >
          {opportunity.title}
        </h3>

        {/* Description — 2 lines max */}
        <p
          className="text-xs leading-relaxed mb-3 line-clamp-2"
          style={{ color: "var(--bv-text-3)", fontFamily: "var(--font-inter)" }}
        >
          {opportunity.description}
        </p>

        {/* Agent name pill */}
        {opportunity.agentName && (
          <div
            className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg"
            style={{ backgroundColor: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}
          >
            <Bot className="w-3 h-3 shrink-0" style={{ color: "#a78bfa" }} />
            <span className="text-[11px] font-semibold" style={{ color: "#a78bfa" }}>
              {opportunity.agentName}
            </span>
            {agentTools.length > 0 && (
              <>
                <span style={{ color: "var(--bv-muted)" }}>·</span>
                <span className="text-[10px]" style={{ color: "var(--bv-text-3)" }}>
                  {agentTools.join(", ")}
                  {(opportunity.agentTools?.split(",").length ?? 0) > 3 ? " +עוד" : ""}
                </span>
              </>
            )}
          </div>
        )}

        {/* Metrics row */}
        <div className="flex items-center gap-2 flex-wrap">
          {(opportunity.estimatedHoursSaved ?? 0) > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: "rgba(77,142,255,0.1)", color: "#4d8eff" }}
            >
              <Clock className="w-3 h-3" />
              {opportunity.estimatedHoursSaved} שע' חיסכון לשבוע
            </span>
          )}
          {(opportunity.estimatedCostSaved ?? 0) > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: "rgba(52,211,153,0.1)", color: "#34d399" }}
            >
              <DollarSign className="w-3 h-3" />
              ₪{(opportunity.estimatedCostSaved ?? 0).toLocaleString()} לחודש
            </span>
          )}
          {opportunity.setupComplexity && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px]"
              style={{ backgroundColor: "var(--bv-surface-elevated)", color: "var(--bv-muted)", border: "1px solid var(--bv-border)" }}
            >
              {opportunity.setupComplexity === "plug_and_play" ? "מוכן לשימוש" :
               opportunity.setupComplexity === "some_setup" ? "דורש התקנה" : "בנייה מותאמת"}
            </span>
          )}

          {/* Spacer + view arrow */}
          <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: "var(--bv-text-3)" }} />
        </div>
      </div>
    </div>
  );
}
