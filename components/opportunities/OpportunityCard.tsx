"use client";

import { Star, X, Clock, DollarSign, Bot, Zap, ArrowRight, Layers } from "lucide-react";
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
  low: { color: "#34d399", label: "ניצחון קל" },
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
  const isPinned = opportunity.pinned;
  const cat = CATEGORY_STYLE[opportunity.category ?? "automation"] ?? CATEGORY_STYLE.automation;
  const effort = opportunity.implementationEffort ? EFFORT_STYLE[opportunity.implementationEffort] : null;
  const accentColor = IMPACT_COLOR[opportunity.impactType] ?? "#4d8eff";

  const agentTools = opportunity.agentTools
    ? opportunity.agentTools.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all duration-150 group"
      style={{
        backgroundColor: "#191b22",
        border: isPinned ? `1px solid rgba(251,191,36,0.35)` : "1px solid #282a30",
        boxShadow: isPinned ? "0 0 0 1px rgba(251,191,36,0.1)" : "none",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = isPinned ? "rgba(251,191,36,0.5)" : "#424754"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = isPinned ? "rgba(251,191,36,0.35)" : "#282a30"; }}
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
              style={{ color: isPinned ? "#fbbf24" : "#424754" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fbbf24"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isPinned ? "#fbbf24" : "#424754"; }}
            >
              <Star className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={onDismiss}
              aria-label="התעלם"
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "#424754" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#424754"; }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-sm font-semibold mb-1 leading-snug"
          style={{ color: "#e2e2eb", fontFamily: "var(--font-manrope)" }}
        >
          {opportunity.title}
        </h3>

        {/* Description — 2 lines max */}
        <p
          className="text-xs leading-relaxed mb-3 line-clamp-2"
          style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}
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
                <span style={{ color: "#424754" }}>·</span>
                <span className="text-[10px]" style={{ color: "#8c909f" }}>
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
              {opportunity.estimatedHoursSaved}ש׳/שבוע — חיסכון
            </span>
          )}
          {(opportunity.estimatedCostSaved ?? 0) > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: "rgba(52,211,153,0.1)", color: "#34d399" }}
            >
              <DollarSign className="w-3 h-3" />
              ₪{(opportunity.estimatedCostSaved ?? 0).toLocaleString()}/חודש
            </span>
          )}
          {opportunity.setupComplexity && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px]"
              style={{ backgroundColor: "#1e1f26", color: "#424754", border: "1px solid #282a30" }}
            >
              {opportunity.setupComplexity === "plug_and_play" ? "מוכן לשימוש" :
               opportunity.setupComplexity === "some_setup" ? "דורש התקנה" : "בנייה מותאמת"}
            </span>
          )}

          {/* Spacer + view arrow */}
          <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: "#8c909f" }} />
        </div>
      </div>
    </div>
  );
}
