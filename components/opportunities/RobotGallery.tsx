"use client";

import { useState } from "react";
import { X, Clock, DollarSign, TrendingUp, Sparkles } from "lucide-react";
import { AiOpportunityItem } from "@/lib/types/opportunities";

const ROBOT_NAMES = [
  "ARIA", "MAX", "NEXO", "NOVA", "BOLT",
  "ZARA", "FLUX", "ECHO", "VEGA", "REBO",
  "ALGO", "DUSK", "KIRA", "OMEN", "BYTE",
];

function robotColor(impactType: string): string {
  if (impactType === "time" || impactType === "time_savings") return "#60a5fa";
  if (impactType === "money" || impactType === "cost_savings") return "#34d399";
  if (impactType === "growth" || impactType === "revenue") return "#fbbf24";
  if (impactType === "quality") return "#c084fc";
  return "#4d8eff";
}

function savingsLabel(opp: AiOpportunityItem): string {
  if (opp.estimatedHoursSaved && opp.estimatedCostSaved) {
    return `⏱ ${opp.estimatedHoursSaved}h/שבוע · ₪${opp.estimatedCostSaved.toLocaleString()}/חודש`;
  }
  if (opp.estimatedHoursSaved) return `⏱ חוסך ${opp.estimatedHoursSaved} שעות בשבוע`;
  if (opp.estimatedCostSaved) return `₪${opp.estimatedCostSaved.toLocaleString()} חיסכון לחודש`;
  return "הזדמנות AI";
}

function ImpactBadge({ impactType }: { impactType: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    time: { label: "⏱ זמן", color: "#60a5fa", bg: "#60a5fa18" },
    time_savings: { label: "⏱ זמן", color: "#60a5fa", bg: "#60a5fa18" },
    money: { label: "💰 כסף", color: "#34d399", bg: "#34d39918" },
    cost_savings: { label: "💰 כסף", color: "#34d399", bg: "#34d39918" },
    growth: { label: "📈 צמיחה", color: "#fbbf24", bg: "#fbbf2418" },
    revenue: { label: "📈 צמיחה", color: "#fbbf24", bg: "#fbbf2418" },
    quality: { label: "✨ איכות", color: "#c084fc", bg: "#c084fc18" },
  };
  const cfg = map[impactType] ?? { label: impactType, color: "#8c909f", bg: "#8c909f18" };
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 99,
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}35`,
        fontFamily: "var(--font-inter)",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

function RobotSVG({ color, isSelected, isAnimated }: { color: string; isSelected: boolean; isAnimated?: boolean }) {
  const glow = `${color}60`;
  return (
    <svg
      width="90"
      height="110"
      viewBox="0 0 90 110"
      style={{
        filter: isSelected ? `drop-shadow(0 0 12px ${glow})` : `drop-shadow(0 2px 6px rgba(0,0,0,0.5))`,
        transition: "filter 0.25s",
        animation: isAnimated ? "bv-float 3s ease-in-out infinite" : undefined,
      }}
    >
      {/* Antenna base */}
      <rect x="42" y="6" width="6" height="14" rx="3" fill={color} opacity={0.7} />
      {/* Antenna tip glowing circle */}
      <circle cx="45" cy="5" r="5" fill={color} />
      <circle cx="45" cy="5" r="3" fill="white" opacity={0.6} />

      {/* Head */}
      <rect x="18" y="20" width="54" height="36" rx="10" fill="#191b22" stroke={color} strokeWidth={1.8} />

      {/* Eyes */}
      <circle cx="33" cy="36" r="7" fill={color} opacity={0.25} />
      <circle cx="33" cy="36" r="5" fill={color} />
      <circle cx="35" cy="34" r="2" fill="white" opacity={0.7} />

      <circle cx="57" cy="36" r="7" fill={color} opacity={0.25} />
      <circle cx="57" cy="36" r="5" fill={color} />
      <circle cx="59" cy="34" r="2" fill="white" opacity={0.7} />

      {/* Mouth — smile */}
      <path d="M34 48 Q45 54 56 48" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.8} />

      {/* Neck */}
      <rect x="39" y="56" width="12" height="8" rx="3" fill="#1e2030" stroke={color} strokeWidth={1.2} opacity={0.7} />

      {/* Body */}
      <rect x="12" y="64" width="66" height="38" rx="12" fill="#191b22" stroke={color} strokeWidth={1.8} />

      {/* Chest panel */}
      <rect x="28" y="72" width="34" height="22" rx="6" fill={color} opacity={0.08} stroke={color} strokeWidth={1} />
      {/* Chest light ring */}
      <circle cx="45" cy="83" r="8" fill={color} opacity={0.15} />
      <circle cx="45" cy="83" r="5" fill={color} opacity={0.3} />
      <circle cx="45" cy="83" r="3" fill={color} />

      {/* Left arm */}
      <rect x="1" y="68" width="10" height="26" rx="5" fill="#191b22" stroke={color} strokeWidth={1.5} />
      <circle cx="6" cy="96" r="4" fill={color} opacity={0.4} />

      {/* Right arm */}
      <rect x="79" y="68" width="10" height="26" rx="5" fill="#191b22" stroke={color} strokeWidth={1.5} />
      <circle cx="84" cy="96" r="4" fill={color} opacity={0.4} />

      {/* Left leg */}
      <rect x="22" y="103" width="16" height="7" rx="3.5" fill="#191b22" stroke={color} strokeWidth={1.4} />
      {/* Right leg */}
      <rect x="52" y="103" width="16" height="7" rx="3.5" fill="#191b22" stroke={color} strokeWidth={1.4} />
    </svg>
  );
}

interface RobotCardProps {
  opp: AiOpportunityItem;
  name: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onPin: (id: string) => void;
  onDismiss: (id: string) => void;
  businessId?: string;
}

function RobotCard({ opp, name, index, isSelected, onSelect, onPin, onDismiss, businessId }: RobotCardProps) {
  const color = robotColor(opp.impactType);
  const savings = savingsLabel(opp);
  const isPinned = opp.pinned;
  const animDelay = index * 0.06;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        animation: `bv-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${animDelay}s both`,
      }}
    >
      {/* Robot + click area */}
      <div
        onClick={onSelect}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          padding: "16px 14px 14px",
          borderRadius: 16,
          border: isSelected ? `1.5px solid ${color}50` : "1.5px solid #1e2030",
          backgroundColor: isSelected ? `${color}08` : "#191b22",
          transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
          minWidth: 130,
          position: "relative",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = `${color}50`;
          el.style.backgroundColor = `${color}06`;
          el.style.transform = "translateY(-4px)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = isSelected ? `${color}50` : "#1e2030";
          el.style.backgroundColor = isSelected ? `${color}08` : "#191b22";
          el.style.transform = "translateY(0)";
        }}
      >
        {isPinned && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              fontSize: 10,
              color: "#fbbf24",
            }}
          >
            📌
          </div>
        )}

        <RobotSVG color={color} isSelected={isSelected} isAnimated={isSelected} />

        {/* Name badge */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color,
            fontFamily: "var(--font-inter)",
            textAlign: "center",
          }}
        >
          {name}
        </div>

        {/* Impact badge */}
        <ImpactBadge impactType={opp.impactType} />
      </div>

      {/* Savings headline below robot */}
      <div
        onClick={onSelect}
        style={{
          fontSize: 10,
          color: "#8c909f",
          fontFamily: "var(--font-inter)",
          textAlign: "center",
          maxWidth: 130,
          lineHeight: 1.4,
          cursor: "pointer",
          direction: "rtl",
        }}
      >
        {savings}
      </div>

      {/* Expanded detail card */}
      {isSelected && (
        <div
          style={{
            width: "100%",
            backgroundColor: "#13151d",
            border: `1px solid ${color}30`,
            borderRadius: 12,
            padding: "12px 14px",
            animation: "bv-fade-up 0.25s cubic-bezier(0.16,1,0.3,1) both",
            position: "relative",
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#424754",
              padding: 2,
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e2eb")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#424754")}
          >
            <X size={12} />
          </button>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#e2e2eb",
              fontFamily: "var(--font-manrope)",
              lineHeight: 1.4,
              marginBottom: 6,
              direction: "rtl",
              textAlign: "right",
              paddingLeft: 20,
            }}
          >
            {opp.title}
          </div>
          {opp.description && (
            <div
              style={{
                fontSize: 11,
                color: "#8c909f",
                fontFamily: "var(--font-inter)",
                lineHeight: 1.55,
                marginBottom: 8,
                direction: "rtl",
                textAlign: "right",
              }}
            >
              {opp.description}
            </div>
          )}

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, justifyContent: "flex-end" }}>
            {opp.estimatedHoursSaved != null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10,
                  color: "#60a5fa",
                  backgroundColor: "#60a5fa12",
                  border: "1px solid #60a5fa25",
                  borderRadius: 99,
                  padding: "2px 8px",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <Clock size={9} />
                {opp.estimatedHoursSaved}h / שבוע
              </div>
            )}
            {opp.estimatedCostSaved != null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10,
                  color: "#34d399",
                  backgroundColor: "#34d39912",
                  border: "1px solid #34d39925",
                  borderRadius: 99,
                  padding: "2px 8px",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <DollarSign size={9} />
                ₪{opp.estimatedCostSaved.toLocaleString()} / חודש
              </div>
            )}
          </div>

          {/* Add as task */}
          {businessId && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await fetch("/api/tasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ businessId, title: opp.title, opportunityId: opp.id }),
                  });
                  // Show brief confirmation
                  const btn = e.currentTarget;
                  btn.textContent = "✓ נוספה!";
                  btn.style.color = "#34d399";
                  btn.style.borderColor = "rgba(52,211,153,0.3)";
                  setTimeout(() => {
                    btn.textContent = "+ הוסף כמשימה";
                    btn.style.color = "#8c909f";
                    btn.style.borderColor = "#282a30";
                  }, 2000);
                } catch {}
              }}
              style={{
                width: "100%",
                fontSize: 10,
                fontWeight: 600,
                padding: "5px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
                backgroundColor: "#1e1f26",
                border: "1px solid #282a30",
                color: "#8c909f",
                marginBottom: 6,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(77,142,255,0.3)"; e.currentTarget.style.color = "#4d8eff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#282a30"; e.currentTarget.style.color = "#8c909f"; }}
            >
              + הוסף כמשימה
            </button>
          )}

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onPin(opp.id); }}
              style={{
                flex: 1,
                fontSize: 10,
                fontWeight: 600,
                padding: "5px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
                backgroundColor: isPinned ? "rgba(251,191,36,0.1)" : "#1e1f26",
                border: isPinned ? "1px solid rgba(251,191,36,0.3)" : "1px solid #282a30",
                color: isPinned ? "#fbbf24" : "#8c909f",
                transition: "all 0.15s",
              }}
            >
              {isPinned ? "📌 מוצמד" : "📌 הצמד"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(opp.id); }}
              style={{
                flex: 1,
                fontSize: 10,
                fontWeight: 600,
                padding: "5px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
                backgroundColor: "#1e1f26",
                border: "1px solid #282a30",
                color: "#8c909f",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#282a30"; e.currentTarget.style.color = "#8c909f"; }}
            >
              סגור
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface RobotGalleryProps {
  opportunities: AiOpportunityItem[];
  onPin: (id: string) => void;
  onDismiss: (id: string) => void;
  businessId?: string;
}

export function RobotGallery({ opportunities, onPin, onDismiss, businessId }: RobotGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (opportunities.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#33343b",
          fontFamily: "var(--font-inter)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
        <div style={{ fontSize: 14, color: "#424754", marginBottom: 6, fontFamily: "var(--font-manrope)", fontWeight: 700 }}>
          אין סוכנים עדיין
        </div>
        <div style={{ fontSize: 12 }}>הפעל ניתוח AI ליצירת הזדמנויות</div>
      </div>
    );
  }

  // Group pinned first
  const pinned = opportunities.filter((o) => o.pinned);
  const unpinned = opportunities.filter((o) => !o.pinned);
  const ordered = [...pinned, ...unpinned];

  const totalHrs = opportunities.reduce((s, o) => s + (o.estimatedHoursSaved ?? 0), 0);
  const totalCost = opportunities.reduce((s, o) => s + (o.estimatedCostSaved ?? 0), 0);

  return (
    <div>
      {/* Savings headline */}
      {(totalHrs > 0 || totalCost > 0) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "14px 20px",
            marginBottom: 24,
            backgroundColor: "#191b22",
            border: "1px solid #282a30",
            borderRadius: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={14} style={{ color: "#4d8eff" }} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#e2e2eb",
                fontFamily: "var(--font-manrope)",
              }}
            >
              הצוות שלך יחסוך לך
            </span>
          </div>
          {totalHrs > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={13} style={{ color: "#60a5fa" }} />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#60a5fa",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {totalHrs}h/שבוע
              </span>
            </div>
          )}
          {totalHrs > 0 && totalCost > 0 && (
            <span style={{ color: "#282a30", fontSize: 20 }}>·</span>
          )}
          {totalCost > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <TrendingUp size={13} style={{ color: "#34d399" }} />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#34d399",
                  fontFamily: "var(--font-inter)",
                }}
              >
                ₪{totalCost.toLocaleString()}/חודש
              </span>
            </div>
          )}
        </div>
      )}

      {/* Robot grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "flex-start",
        }}
      >
        {ordered.map((opp, idx) => {
          const name = ROBOT_NAMES[idx % ROBOT_NAMES.length];
          const isSelected = selectedId === opp.id;
          return (
            <RobotCard
              key={opp.id}
              opp={opp}
              name={name}
              index={idx}
              isSelected={isSelected}
              onSelect={() => setSelectedId(isSelected ? null : opp.id)}
              onPin={onPin}
              onDismiss={onDismiss}
              businessId={businessId}
            />
          );
        })}
      </div>
    </div>
  );
}
