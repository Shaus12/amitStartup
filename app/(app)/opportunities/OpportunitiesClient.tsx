"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { ImpactSummary } from "@/components/opportunities/ImpactSummary";
import { OpportunityList } from "@/components/opportunities/OpportunityList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AiOpportunityItem } from "@/lib/types/opportunities";

interface OpportunitiesClientProps {
  businessId: string;
  businessName: string;
}

type FilterTab = "all" | "ai_agents" | "time_savings" | "cost_savings";

function SkeletonCard() {
  return <div className="rounded-xl bg-zinc-800 border border-zinc-700 h-40 animate-pulse" />;
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
        throw new Error(text || "Failed to load opportunities");
      }
      return res.json();
    },
  });

  // Optimistic pin mutation
  const pinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const res = await fetch(`/api/business/opportunities`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pinned }),
      });
      if (!res.ok) throw new Error("Failed to update opportunity");
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
      if (context?.previous) {
        queryClient.setQueryData(["opportunities", businessId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities", businessId] });
    },
  });

  // Optimistic dismiss mutation
  const dismissMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await fetch(`/api/business/opportunities`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, dismissedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("Failed to dismiss opportunity");
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
      if (context?.previous) {
        queryClient.setQueryData(["opportunities", businessId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities", businessId] });
    },
  });

  function handlePin(id: string) {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;
    pinMutation.mutate({ id, pinned: !opp.pinned });
  }

  function handleDismiss(id: string) {
    dismissMutation.mutate({ id });
  }

  // Filter out dismissed opportunities
  const activeOpportunities = useMemo(
    () => opportunities.filter((o) => !o.dismissedAt),
    [opportunities]
  );

  // Compute impact summary
  const summary = useMemo(() => {
    return {
      totalHoursSaved: activeOpportunities.reduce(
        (sum, o) => sum + (o.estimatedHoursSaved ?? 0),
        0
      ),
      totalCostSaved: activeOpportunities.reduce(
        (sum, o) => sum + (o.estimatedCostSaved ?? 0),
        0
      ),
      agentCount: activeOpportunities.filter((o) => o.category === "ai_agent").length,
      opportunityCount: activeOpportunities.length,
    };
  }, [activeOpportunities]);

  // Filter by tab
  const filteredOpportunities = useMemo(() => {
    switch (activeTab) {
      case "ai_agents":
        return activeOpportunities.filter((o) => o.category === "ai_agent");
      case "time_savings":
        return activeOpportunities.filter((o) => o.impactType === "time_savings");
      case "cost_savings":
        return activeOpportunities.filter((o) => o.impactType === "cost_savings");
      default:
        return activeOpportunities;
    }
  }, [activeOpportunities, activeTab]);

  return (
    <div className="min-h-full bg-zinc-950 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-zinc-100">AI Opportunities</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/20 border border-indigo-600/30 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            AI-identified opportunities to save time, reduce costs, and grow{" "}
            <span className="text-zinc-300 font-medium">{businessName}</span>
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6 h-24 animate-pulse" />
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </>
        )}

        {/* Error state */}
        {isError && (
          <div className="rounded-xl bg-red-950/30 border border-red-800/40 px-5 py-4 text-sm text-red-400">
            {error instanceof Error ? error.message : "Failed to load opportunities"}
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            <ImpactSummary {...summary} />

            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as FilterTab)}
            >
              <TabsList className="mb-6 bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="ai_agents">AI Agents</TabsTrigger>
                <TabsTrigger value="time_savings">Time Savings</TabsTrigger>
                <TabsTrigger value="cost_savings">Cost Savings</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <OpportunityList
                  opportunities={filteredOpportunities}
                  onPin={handlePin}
                  onDismiss={handleDismiss}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
