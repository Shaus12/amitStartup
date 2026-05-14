"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ImpactSummary } from "@/components/opportunities/ImpactSummary";
import { RobotGallery } from "@/components/opportunities/RobotGallery";
import { AiOpportunityItem } from "@/lib/types/opportunities";

interface OpportunitiesClientProps {
  businessId: string;
  businessName: string;
}

type StatusFilterTab = "all" | "suggested" | "in_progress" | "done" | "quick_wins";
type CategoryFilterTab = "all" | "time" | "money" | "growth";

const STATUS_FILTER_TABS: { value: StatusFilterTab; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "suggested", label: "ממתין" },
  { value: "in_progress", label: "בביצוע" },
  { value: "done", label: "הושלם" },
  { value: "quick_wins", label: "ניצחונות מהירים" },
];

const CATEGORY_FILTER_TABS: { value: CategoryFilterTab; label: string }[] = [
  { value: "all", label: "כל הסוגים" },
  { value: "time", label: "⏱ חיסכון בזמן" },
  { value: "money", label: "💰 חיסכון בעלויות" },
  { value: "growth", label: "📈 צמיחה" },
];

function normalizedStatus(opp: AiOpportunityItem): string {
  const status = opp.roadmapStatus ?? "suggested";
  return status === "backlog" ? "suggested" : status;
}

function matchesCategory(opp: AiOpportunityItem, tab: CategoryFilterTab): boolean {
  if (tab === "all") return true;
  return (
    opp.impactType === tab ||
    (tab === "time" && opp.impactType === "time_savings") ||
    (tab === "money" && opp.impactType === "cost_savings") ||
    (tab === "growth" && opp.impactType === "revenue")
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-xl h-28 animate-pulse"
      style={{ backgroundColor: "var(--bv-surface-raised)", border: "1px solid var(--bv-border)" }}
    />
  );
}

export function OpportunitiesClient({ businessId, businessName }: OpportunitiesClientProps) {
  const queryClient = useQueryClient();
  const [activeStatusTab, setActiveStatusTab] = useState<StatusFilterTab>("all");
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryFilterTab>("all");

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

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "suggested" | "in_progress" | "done" }) => {
      const res = await fetch(`/api/business/opportunities`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("נכשל בעדכון סטטוס");
      return res.json();
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["opportunities", businessId] });
      const previous = queryClient.getQueryData<AiOpportunityItem[]>(["opportunities", businessId]);
      queryClient.setQueryData<AiOpportunityItem[]>(
        ["opportunities", businessId],
        (old) => old?.map((o) => (o.id === id ? { ...o, roadmapStatus: status, status } : o)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["opportunities", businessId], context.previous);
    },
    onSuccess: (_data, variables) => {
      if (variables.status !== "in_progress") return;
      toast.custom(
        () => (
          <div
            dir="rtl"
            className="rounded-xl px-4 py-3 text-sm shadow-lg"
            style={{
              backgroundColor: "var(--bv-surface-raised)",
              border: "1px solid var(--bv-border)",
              color: "var(--bv-text-1)",
              fontFamily: "var(--font-inter)",
            }}
          >
            <div className="font-semibold mb-1">
              ✅ ההזדמנות הועברה לביצוע — המשימות נוספו ללוח המשימות שלך
            </div>
            <a href="/tasks" className="text-xs font-bold" style={{ color: "#4d8eff" }}>
              עבור למשימות ←
            </a>
          </div>
        ),
        { duration: 6000 }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities", businessId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", businessId] });
    },
  });

  const taskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "done" | "todo" }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("נכשל בעדכון משימה");
      return res.json();
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["opportunities", businessId] });
      const previous = queryClient.getQueryData<AiOpportunityItem[]>(["opportunities", businessId]);
      
      queryClient.setQueryData<AiOpportunityItem[]>(
        ["opportunities", businessId],
        (old) => {
          if (!old) return old;
          return old.map(opp => {
            if (!opp.tasks) return opp;
            const hasTask = opp.tasks.some(t => t.id === id);
            if (!hasTask) return opp;
            return {
              ...opp,
              tasks: opp.tasks.map(t => t.id === id ? { ...t, status } : t)
            };
          });
        }
      );
      
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["opportunities", businessId], context.previous);
      toast.error("שגיאה בעדכון משימה");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities", businessId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", businessId] });
    },
  });

  function handleTaskToggle(taskId: string, isDone: boolean) {
    taskMutation.mutate({ id: taskId, status: isDone ? "done" : "todo" });
  }

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
    return activeOpportunities.filter((opp) => {
      const statusMatches =
        activeStatusTab === "all" ||
        (activeStatusTab === "quick_wins" && opp.isQuickWin) ||
        normalizedStatus(opp) === activeStatusTab;

      return statusMatches && matchesCategory(opp, activeCategoryTab);
    });
  }, [activeOpportunities, activeStatusTab, activeCategoryTab]);

  return (
    <div className="min-h-full py-8 px-4 sm:px-6" style={{ backgroundColor: "var(--bv-bg)" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--bv-text-1)", fontFamily: "var(--font-manrope)" }}
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
          <p className="text-xs" style={{ color: "var(--bv-muted)", fontFamily: "var(--font-inter)" }}>
            {businessName}
          </p>
          <div className="mt-5 text-center" dir="rtl">
            <h2
              className="text-base font-bold mb-2"
              style={{ color: "var(--bv-text-2)", fontFamily: "var(--font-manrope)" }}
            >
              הזדמנויות שAI זיהה בעסק שלך
            </h2>
            <p
              className="text-xs leading-relaxed mx-auto max-w-xl"
              style={{ color: "var(--bv-text-3)", fontFamily: "var(--font-inter)" }}
            >
              כל הזדמנות מייצגת תהליך שאפשר לייעל או לאוטומט — עם הערכה של כמה זמן וכסף היא שווה. לחץ על כל הזדמנות כדי לראות איך מיישמים אותה.
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <>
            <div className="rounded-xl h-20 animate-pulse mb-6" style={{ backgroundColor: "var(--bv-surface-raised)", border: "1px solid var(--bv-border)" }} />
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

            {/* Status filter tabs */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {STATUS_FILTER_TABS.map((tab) => {
                const isActive = activeStatusTab === tab.value;
                const count = tab.value === "all"
                  ? activeOpportunities.length
                  : tab.value === "quick_wins"
                    ? activeOpportunities.filter((o) => o.isQuickWin).length
                    : activeOpportunities.filter((o) => normalizedStatus(o) === tab.value).length;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveStatusTab(tab.value)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? "rgba(77,142,255,0.15)" : "var(--bv-surface-elevated)",
                      border: isActive ? "1px solid rgba(77,142,255,0.35)" : "1px solid var(--bv-border)",
                      color: isActive ? "#4d8eff" : "var(--bv-text-3)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {tab.value === "quick_wins" && "⚡ "}
                    {tab.label}
                    {count > 0 && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums"
                        style={{
                          backgroundColor: isActive ? "rgba(77,142,255,0.25)" : "var(--bv-border)",
                          color: isActive ? "#4d8eff" : "var(--bv-muted)",
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Secondary category filters */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {CATEGORY_FILTER_TABS.map((tab) => {
                const isActive = activeCategoryTab === tab.value;
                const count = activeOpportunities.filter((o) => matchesCategory(o, tab.value)).length;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveCategoryTab(tab.value)}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? "rgba(140,144,159,0.14)" : "transparent",
                      border: isActive ? "1px solid var(--bv-muted)" : "1px solid var(--bv-border)",
                      color: isActive ? "var(--bv-text-2)" : "var(--bv-text-3)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums"
                        style={{ backgroundColor: "var(--bv-border)", color: "var(--bv-text-3)" }}
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
              onStatusChange={(id, status) => statusMutation.mutate({ id, status: status === "backlog" ? "suggested" : status })}
              updatingStatusId={statusMutation.variables?.id ?? null}
              onTaskToggle={handleTaskToggle}
            />
          </>
        )}
      </div>
    </div>
  );
}
