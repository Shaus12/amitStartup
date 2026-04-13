"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Zap, Clock, DollarSign, ChevronRight, ChevronLeft, CheckCircle2, Circle, ArrowRight, Loader2 } from "lucide-react";

type RoadmapStatus = "backlog" | "in_progress" | "done";

interface Opportunity {
  id: string;
  title: string;
  agentName: string | null;
  agentDescription: string | null;
  setupComplexity: string | null;
  estimatedHoursSaved: number | null;
  estimatedCostSaved: number | null;
  roadmapStatus: RoadmapStatus;
  impactType: string;
  department: { name: string; color: string } | null;
}

interface Props { businessId: string; businessName: string }

const COLUMNS: { key: RoadmapStatus; label: string; desc: string; accent: string }[] = [
  { key: "backlog",     label: "Backlog",     desc: "Not started yet",      accent: "#424754" },
  { key: "in_progress", label: "In Progress", desc: "Actively deploying",   accent: "#4d8eff" },
  { key: "done",        label: "Done",        desc: "Deployed & running",   accent: "#34d399" },
];

const C = {
  bg: "#111319", s1: "#191b22", s2: "#1e1f26", s3: "#282a30", s4: "#33343b",
  outline: "#424754", muted: "#8c909f", sub: "#c2c6d6", text: "#e2e2eb",
  blue: "#4d8eff", green: "#34d399", amber: "#fbbf24",
};
const MF: React.CSSProperties = { fontFamily: "var(--font-manrope)" };
const IF: React.CSSProperties = { fontFamily: "var(--font-inter)" };

function normalizeComplexity(c: string | null): string | null {
  if (!c) return null;
  const lower = c.toLowerCase().replace(/[_\s-]/g, "");
  if (lower === "low" || lower === "plugandplay") return "Low";
  if (lower === "high" || lower === "custombuild") return "High";
  if (lower === "medium" || lower === "somesetup") return "Medium";
  return c; // fallback: show as-is
}

function complexityColor(c: string | null) {
  const n = normalizeComplexity(c);
  if (n === "Low")    return C.green;
  if (n === "High")   return C.amber;
  return C.blue;
}

export function RoadmapClient({ businessId, businessName }: Props) {
  const qc = useQueryClient();

  const { data: opps = [], isLoading } = useQuery<Opportunity[]>({
    queryKey: ["roadmap", businessId],
    queryFn: async () => {
      const r = await fetch(`/api/opportunities/roadmap?businessId=${businessId}`);
      if (!r.ok) throw new Error("Failed to load");
      const data = await r.json();
      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const { mutate: moveCard, isPending } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RoadmapStatus }) => {
      const r = await fetch("/api/opportunities/roadmap", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!r.ok) throw new Error("Failed to update");
      return r.json();
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["roadmap", businessId] });
      const prev = qc.getQueryData<Opportunity[]>(["roadmap", businessId]);
      qc.setQueryData<Opportunity[]>(["roadmap", businessId], (old = []) =>
        old.map((o) => (o.id === id ? { ...o, roadmapStatus: status } : o))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(["roadmap", businessId], ctx?.prev);
      toast.error("Failed to update status");
    },
  });

  const NEXT: Record<RoadmapStatus, RoadmapStatus | null> = {
    backlog: "in_progress", in_progress: "done", done: null,
  };
  const PREV: Record<RoadmapStatus, RoadmapStatus | null> = {
    backlog: null, in_progress: "backlog", done: "in_progress",
  };

  // Summary stats
  const doneOpps    = opps.filter((o) => o.roadmapStatus === "done");
  const activeOpps  = opps.filter((o) => o.roadmapStatus === "in_progress");
  const totalHrs    = doneOpps.reduce((s, o) => s + (o.estimatedHoursSaved ?? 0), 0);
  const totalSavings = doneOpps.reduce((s, o) => s + (o.estimatedCostSaved ?? 0), 0);
  const potentialHrs = opps.reduce((s, o) => s + (o.estimatedHoursSaved ?? 0), 0);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
      {/* Header */}
      <header className="shrink-0" style={{ backgroundColor: C.s1, borderBottom: `1px solid ${C.s3}` }}>
        <div className="flex items-center justify-between gap-6 px-6 h-14">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${C.blue}15`, border: `1px solid ${C.blue}25` }}>
              <Zap className="w-3.5 h-3.5" style={{ color: C.blue }} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate" style={{ ...MF, color: C.text }}>
                Implementation Roadmap
              </h1>
              <p className="text-[10px]" style={{ ...IF, color: C.outline }}>{businessName}</p>
            </div>
          </div>
          {/* Stats row */}
          <div className="hidden md:flex items-center gap-5">
            {[
              { label: "Total potential", val: `${Math.round(potentialHrs)}h/wk`, color: C.muted },
              { label: "In progress", val: activeOpps.length.toString(), color: C.blue },
              { label: "Hrs unlocked", val: `${Math.round(totalHrs)}h`, color: C.green },
              { label: "Monthly savings", val: totalSavings > 0 ? `$${Math.round(totalSavings).toLocaleString()}` : "–", color: C.green },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-right">
                <p className="text-sm font-bold tabular-nums" style={{ ...MF, color }}>{val}</p>
                <p className="text-[9px]" style={{ ...IF, color: C.outline }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Continue where you left off */}
      {activeOpps.length > 0 && (
        <div
          className="shrink-0 mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: `${C.blue}08`, border: `1px solid ${C.blue}20` }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.blue }} />
          <p className="text-xs" style={{ ...IF, color: C.sub }}>
            <span className="font-semibold" style={{ color: C.blue }}>{activeOpps.length} {activeOpps.length === 1 ? "agent" : "agents"} in progress</span>
            {" "}— continue where you left off
          </p>
        </div>
      )}

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full gap-2" style={{ color: C.muted }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm" style={IF}>Loading roadmap…</span>
          </div>
        ) : (
          <div className="flex gap-0 h-full min-w-[760px]">
            {COLUMNS.map((col, ci) => {
              const cards = opps.filter((o) => o.roadmapStatus === col.key);
              const colHrs = cards.reduce((s, o) => s + (o.estimatedHoursSaved ?? 0), 0);
              const colSav = cards.reduce((s, o) => s + (o.estimatedCostSaved ?? 0), 0);

              return (
                <div
                  key={col.key}
                  className="flex-1 flex flex-col"
                  style={{
                    borderRight: ci < 2 ? `1px solid ${C.s3}` : "none",
                    minWidth: 260,
                  }}
                >
                  {/* Column header */}
                  <div
                    className="px-4 py-3 shrink-0 sticky top-0 z-10"
                    style={{ backgroundColor: C.s1, borderBottom: `1px solid ${C.s3}` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.accent }} />
                        <span className="text-xs font-bold" style={{ ...MF, color: C.text }}>{col.label}</span>
                        <span
                          className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: C.s3, color: C.muted, ...IF }}
                        >{cards.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[9px]" style={{ color: C.outline, ...IF }}>
                      {colHrs > 0 && <span><span style={{ color: col.accent }}>{Math.round(colHrs)}h</span> saved/wk</span>}
                      {colSav > 0 && <span><span style={{ color: col.accent }}>${Math.round(colSav).toLocaleString()}</span>/mo</span>}
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ backgroundColor: C.bg }}>
                    {cards.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: C.s2, border: `1px solid ${C.s3}` }}>
                          {col.key === "done"
                            ? <CheckCircle2 className="w-4 h-4" style={{ color: C.s4 }} strokeWidth={1.5} />
                            : <Circle className="w-4 h-4" style={{ color: C.s4 }} strokeWidth={1.5} />}
                        </div>
                        <p className="text-xs" style={{ ...IF, color: C.s4 }}>No agents here yet</p>
                      </div>
                    )}
                    {cards.map((opp) => (
                      <KanbanCard
                        key={opp.id}
                        opp={opp}
                        col={col}
                        onNext={NEXT[opp.roadmapStatus] ? () => moveCard({ id: opp.id, status: NEXT[opp.roadmapStatus]! }) : undefined}
                        onPrev={PREV[opp.roadmapStatus] ? () => moveCard({ id: opp.id, status: PREV[opp.roadmapStatus]! }) : undefined}
                        isPending={isPending}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  opp, col, onNext, onPrev, isPending,
}: {
  opp: Opportunity;
  col: { key: RoadmapStatus; label: string; accent: string };
  onNext?: () => void;
  onPrev?: () => void;
  isPending: boolean;
}) {
  const C_local = C;
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: C_local.s2,
        border: `1px solid ${C_local.s3}`,
        opacity: col.key === "done" ? 0.75 : 1,
      }}
    >
      {/* Top accent */}
      <div className="h-[2px]" style={{ backgroundColor: col.accent }} />
      <div className="px-4 py-3.5">
        {/* Dept + complexity */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {opp.department && (
            <div className="flex items-center gap-1.5 text-[10px] truncate" style={{ ...IF, color: C_local.muted }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: opp.department.color }} />
              <span className="truncate">{opp.department.name}</span>
            </div>
          )}
          {opp.setupComplexity && (
            <span
              className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{ ...IF, backgroundColor: `${complexityColor(opp.setupComplexity)}12`, color: complexityColor(opp.setupComplexity) }}
            >{normalizeComplexity(opp.setupComplexity)}</span>
          )}
        </div>

        {/* Agent name */}
        <p className="text-sm font-bold mb-1 leading-snug" style={{ ...MF, color: C_local.text }}>
          {opp.agentName ?? opp.title}
        </p>
        {opp.agentDescription && (
          <p className="text-[11px] leading-relaxed mb-3 line-clamp-2" style={{ ...IF, color: C_local.muted }}>
            {opp.agentDescription}
          </p>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-3 mb-3.5">
          {opp.estimatedHoursSaved != null && (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: C_local.outline }}>
              <Clock className="w-2.5 h-2.5" strokeWidth={2} />
              <span className="font-semibold tabular-nums" style={{ color: C_local.sub }}>{opp.estimatedHoursSaved}h</span>
              <span style={IF}>/wk saved</span>
            </div>
          )}
          {opp.estimatedCostSaved != null && (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: C_local.outline }}>
              <DollarSign className="w-2.5 h-2.5" strokeWidth={2} />
              <span className="font-semibold tabular-nums" style={{ color: C_local.green }}>${Math.round(opp.estimatedCostSaved).toLocaleString()}</span>
              <span style={IF}>/mo</span>
            </div>
          )}
        </div>

        {/* Move controls */}
        <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${C_local.s3}` }}>
          {onPrev && (
            <button
              onClick={onPrev}
              disabled={isPending}
              className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded transition-all duration-150 active:scale-[0.97]"
              style={{ ...IF, color: C_local.muted, backgroundColor: C_local.s3 }}
            >
              <ChevronLeft className="w-3 h-3" strokeWidth={2} />
              Back
            </button>
          )}
          <div className="flex-1" />
          {onNext && (
            <button
              onClick={onNext}
              disabled={isPending}
              className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded transition-all duration-150 active:scale-[0.97]"
              style={{
                ...IF,
                color: col.key === "backlog" ? "#001a42" : col.key === "in_progress" ? "#001a42" : C_local.text,
                background: col.key === "backlog"
                  ? `linear-gradient(135deg, ${C_local.blue}, #adc6ff)`
                  : col.key === "in_progress"
                  ? `linear-gradient(135deg, ${C_local.green}, #6ee7b7)`
                  : C_local.s4,
              }}
            >
              {col.key === "backlog" ? "Start" : "Complete"}
              <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
