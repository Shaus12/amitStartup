"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { ImpactSummary } from "@/components/opportunities/ImpactSummary";
import { RobotGallery } from "@/components/opportunities/RobotGallery";
import { AiOpportunityItem } from "@/lib/types/opportunities";

interface OpportunitiesClientProps {
  businessId: string;
  businessName: string;
}

type FilterTab = "all" | "time" | "money" | "growth" | "quick_wins";

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "quick_wins", label: "⚡ ניצחונות מהירים" },
  { value: "time", label: "⏱ חיסכון בזמן" },
  { value: "money", label: "💰 חיסכון בעלויות" },
  { value: "growth", label: "📈 צמיחה" },
];

function SkeletonCard() {
  return (
    <div
      className="rounded-xl h-28 animate-pulse"
      style={{ backgroundColor: "#191b22", border: "1px solid #282a30" }}
    />
  );
}

export function OpportunitiesClient({ businessId, businessName }: OpportunitiesClientProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const {
    data: opportunities = [],
    isLoading,
    isError,
    error,
  } = useQuery<AiOpportunityItem[]>({
    queryKey: ["opportunities", businessId],
    queryFn: async () => {
      const res = await fetch(`/api/business/opportunities?businessId=${businessId}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "נכשל בטעינת ההזדמנויות");
      }
      const body = await res.json();
      return Array.isArray(body) ? body : (body.opportunities ?? []);
    },
  });

  const pinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const res = await fetch(`/api/business/opportunities`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pinned }),
      });
      if (!res.ok) throw new Error("נכשל בעדכון ההזדמנות");
      return res.json();
    },
    onMutate: async ({ id, pinned }) => {
      await queryClient.cancelQueries({ queryKey: ["opportunities", businessId] });
      const previous = queryClient.getQueryData<AiOpportunityItem[]>(["opportunities", businessId]);
      queryClient.setQueryData<AiOpportunityItem[]>(
        ["opportunities", businessId],
        (old) => old?.map((o) => (o.id === id ? { ...o, pinned } : o)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["opportunities", businessId], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["opportunities", businessId] }),
  });

  const dismissMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await fetch(`/api/business/opportunities`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, dismissedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("נכשל בהתעלמות מההזדמנות");
      return res.json();
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["opportunities", businessId] });
      const previous = queryClient.getQueryData<AiOpportunityItem[]>(["opportunities", businessId]);
      queryClient.setQueryData<AiOpportunityItem[]>(
        ["opportunities", businessId],
        (old) =>
          old?.map((o) =>
            o.id === id ? { ...o, dismissedAt: new Date().toISOString() } : o
          ) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["opportunities", businessId], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["opportunities", businessId] }),
  });

  function handlePin(id: string) {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;
    pinMutation.mutate({ id, pinned: !opp.pinned });
  }

  function handleDismiss(id: string) {
    dismissMutation.mutate({ id });
  }

  const activeOpportunities = useMemo(
    () => opportunities.filter((o) => !o.dismissedAt),
    [opportunities]
  );

  const summary = useMemo(() => ({
    totalHoursSaved: activeOpportunities.reduce((s, o) => s + (o.estimatedHoursSaved ?? 0), 0),
    totalCostSaved: activeOpportunities.reduce((s, o) => s + (o.estimatedCostSaved ?? 0), 0),
    agentCount: activeOpportunities.filter((o) => o.category === "ai_agent").length,
    opportunityCount: activeOpportunities.length,
  }), [activeOpportunities]);

  const filteredOpportunities = useMemo(() => {
    switch (activeTab) {
      case "quick_wins": return activeOpportunities.filter((o) => o.isQuickWin);
      case "time":       return activeOpportunities.filter((o) => o.impactType === "time"   || o.impactType === "time_savings");
      case "money":      return activeOpportunities.filter((o) => o.impactType === "money"  || o.impactType === "cost_savings");
      case "growth":     return activeOpportunities.filter((o) => o.impactType === "growth" || o.impactType === "revenue");
      default:           return activeOpportunities;
    }
  }, [activeOpportunities, activeTab]);

  return (
    <div className="min-h-full py-8 px-4 sm:px-6" style={{ backgroundColor: "#111319" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1
              className="text-xl font-bold"
              style={{ color: "#e2e2eb", fontFamily: "var(--font-manrope)" }}
            >
              הזדמנויות AI
            </h1>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: "rgba(77,142,255,0.12)", color: "#4d8eff", border: "1px solid rgba(77,142,255,0.2)" }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              מבוסס AI
            </span>
          </div>
          <p className="text-xs" style={{ color: "#424754", fontFamily: "var(--font-inter)" }}>
            {businessName}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <>
            <div className="rounded-xl h-20 animate-pulse mb-6" style={{ backgroundColor: "#191b22", border: "1px solid #282a30" }} />
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </>
        )}

        {/* Error */}
        {isError && (
          <div
            className="rounded-xl px-4 py-3.5 text-sm"
            style={{ backgroundColor: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}
          >
            {error instanceof Error ? error.message : "נכשל בטעינת ההזדמנויות"}
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            <ImpactSummary {...summary} />

            {/* Filter pills */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {FILTER_TABS.map((tab) => {
                const isActive = activeTab === tab.value;
                const count = tab.value === "all"
                  ? activeOpportunities.length
                  : tab.value === "quick_wins"
                  ? activeOpportunities.filter((o) => o.isQuickWin).length
                  : activeOpportunities.filter((o) =>
                      o.impactType === tab.value ||
                      (tab.value === "time"   && o.impactType === "time_savings") ||
                      (tab.value === "money"  && o.impactType === "cost_savings") ||
                      (tab.value === "growth" && o.impactType === "revenue")
                    ).length;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? "rgba(77,142,255,0.15)" : "#1e1f26",
                      border: isActive ? "1px solid rgba(77,142,255,0.35)" : "1px solid #282a30",
                      color: isActive ? "#4d8eff" : "#8c909f",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums"
                        style={{
                          backgroundColor: isActive ? "rgba(77,142,255,0.25)" : "#282a30",
                          color: isActive ? "#4d8eff" : "#424754",
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <RobotGallery
              opportunities={filteredOpportunities}
              onPin={handlePin}
              onDismiss={handleDismiss}
              businessId={businessId}
            />
          </>
        )}
      </div>
    </div>
  );
}
