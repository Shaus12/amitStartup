import { Clock, DollarSign, Bot, Sparkles } from "lucide-react";

interface ImpactSummaryProps {
  totalHoursSaved: number;
  totalCostSaved: number;
  agentCount: number;
  opportunityCount: number;
}

const STATS = [
  {
    key: "opps" as const,
    icon: Sparkles,
    color: "#4d8eff",
    bg: "rgba(77,142,255,0.1)",
    label: "הזדמנויות",
  },
  {
    key: "agents" as const,
    icon: Bot,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    label: "סוכני AI",
  },
  {
    key: "hours" as const,
    icon: Clock,
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    label: "שע' בשבוע",
  },
  {
    key: "cost" as const,
    icon: DollarSign,
    color: "#fb923c",
    bg: "rgba(251,146,60,0.1)",
    label: "חיסכון משוער",
  },
];

export function ImpactSummary({
  totalHoursSaved,
  totalCostSaved,
  agentCount,
  opportunityCount,
}: ImpactSummaryProps) {
  const values: Record<string, string | number> = {
    opps: opportunityCount,
    agents: agentCount,
    hours: `${Math.round(totalHoursSaved)}ש׳`,
    cost: totalCostSaved > 0 ? `₪${Math.round(totalCostSaved).toLocaleString()}` : "—",
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {STATS.map(({ key, icon: Icon, color, bg, label }) => (
        <div
          key={key}
          className="rounded-xl px-4 py-3.5"
          style={{ backgroundColor: "#191b22", border: "1px solid #282a30" }}
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ backgroundColor: bg, color }}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span
              className="text-[10px] font-medium"
              style={{ color: "#424754", fontFamily: "var(--font-inter)" }}
            >
              {label}
            </span>
          </div>
          <p
            className="text-xl font-bold tabular-nums leading-none"
            style={{ color, fontFamily: "var(--font-manrope)" }}
          >
            {values[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
