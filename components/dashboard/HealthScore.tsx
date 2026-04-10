"use client";

import { useQuery } from "@tanstack/react-query";

interface HealthData {
  score: number;
  breakdown: {
    manualScore: number;
    painScore: number;
    bottleneckScore: number;
    aiCoverageScore: number;
    completenessScore: number;
  };
  departments: {
    id: string; name: string; color: string;
    score: number; manualPct: number; painCount: number; oppCount: number;
  }[];
}

const C = {
  s1: "#191b22", s2: "#1e1f26", s3: "#282a30", s4: "#33343b",
  outline: "#424754", muted: "#8c909f", sub: "#c2c6d6", text: "#e2e2eb",
  blue: "#4d8eff", green: "#34d399", amber: "#fbbf24", red: "#f87171",
};
const MF: React.CSSProperties = { fontFamily: "var(--font-manrope)" };
const IF: React.CSSProperties = { fontFamily: "var(--font-inter)" };

function scoreColor(s: number) {
  if (s >= 75) return C.green;
  if (s >= 50) return C.blue;
  if (s >= 30) return C.amber;
  return C.red;
}
function scoreLabel(s: number) {
  if (s >= 75) return "Healthy";
  if (s >= 50) return "Fair";
  if (s >= 30) return "At Risk";
  return "Critical";
}

export function HealthScore({ businessId }: { businessId: string }) {
  const { data, isLoading } = useQuery<HealthData>({
    queryKey: ["health", businessId],
    queryFn: async () => {
      const r = await fetch(`/api/business/health?businessId=${businessId}`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    staleTime: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full animate-pulse" style={{ backgroundColor: C.s3 }} />
        <div className="h-3 w-16 rounded animate-pulse" style={{ backgroundColor: C.s3 }} />
      </div>
    );
  }

  const color = scoreColor(data.score);

  return (
    <div className="flex items-center gap-2 group relative">
      {/* Score ring */}
      <div className="relative w-9 h-9 shrink-0">
        <svg width="36" height="36" viewBox="0 0 36 36">
          {/* Track */}
          <circle cx="18" cy="18" r="14" fill="none" stroke={C.s3} strokeWidth="3" />
          {/* Fill */}
          <circle
            cx="18" cy="18" r="14"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(data.score / 100) * 87.96} 87.96`}
            transform="rotate(-90 18 18)"
            style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tabular-nums"
          style={{ ...MF, color }}
        >
          {data.score}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold leading-none" style={{ ...MF, color: C.text }}>{scoreLabel(data.score)}</p>
        <p className="text-[9px] mt-0.5" style={{ ...IF, color: C.outline }}>Business health</p>
      </div>

      {/* Hover tooltip */}
      <div
        className="absolute bottom-full left-0 mb-2 w-52 rounded-xl p-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
        style={{ backgroundColor: C.s2, border: `1px solid ${C.s3}`, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
      >
        <p className="text-[10px] font-bold mb-2" style={{ ...MF, color: C.text }}>Health Breakdown</p>
        {[
          { label: "Low manual work",    val: data.breakdown.manualScore,      max: 30 },
          { label: "Few pain points",    val: data.breakdown.painScore,        max: 25 },
          { label: "No bottlenecks",     val: data.breakdown.bottleneckScore,  max: 15 },
          { label: "AI coverage",        val: data.breakdown.aiCoverageScore,  max: 20 },
          { label: "Setup completeness", val: data.breakdown.completenessScore,max: 10 },
        ].map(({ label, val, max }) => (
          <div key={label} className="flex items-center gap-2 mb-1.5">
            <p className="text-[9px] flex-1 truncate" style={{ ...IF, color: C.muted }}>{label}</p>
            <div className="w-16 h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.s3 }}>
              <div className="h-full rounded-full" style={{ width: `${(val / max) * 100}%`, backgroundColor: scoreColor(Math.round((val / max) * 100)) }} />
            </div>
            <p className="text-[9px] w-6 text-right tabular-nums" style={{ ...IF, color: C.sub }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
