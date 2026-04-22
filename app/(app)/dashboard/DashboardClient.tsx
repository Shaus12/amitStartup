"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw, Network, FileText, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BusinessMap } from "@/components/business-map/BusinessMap";
import { BusinessMapData } from "@/lib/types/business-map";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { KnowledgeRequestPopup } from "@/components/dashboard/KnowledgeRequestPopup";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { createClient } from "@/lib/supabase/client";
import { AnalysisRevealModal, revealStorageKey } from "@/components/dashboard/AnalysisRevealModal";

interface DashboardClientProps {
  businessId: string;
  businessName: string;
}

function SkeletonNode() {
  return (
    <div
      className="w-[300px] rounded overflow-hidden animate-pulse"
      style={{ backgroundColor: "#1e1f26", border: "1px solid #282a30" }}
    >
      <div className="h-[2px]" style={{ backgroundColor: "#282a30" }} />
      <div className="p-4 space-y-3">
        <div className="h-3 rounded w-2/3" style={{ backgroundColor: "#282a30" }} />
        <div className="h-2 rounded w-1/2" style={{ backgroundColor: "#1e1f26" }} />
        <div className="space-y-2 pt-2">
          <div className="h-2 rounded w-full" style={{ backgroundColor: "#282a30" }} />
          <div className="h-2 rounded w-4/5" style={{ backgroundColor: "#282a30" }} />
          <div className="h-2 rounded w-3/5" style={{ backgroundColor: "#1e1f26" }} />
        </div>
      </div>
    </div>
  );
}

const DAILY_TIPS = [
  "בדוק אילו תהליכים חוזרים על עצמם — אלה ראשונים לאוטומציה",
  "תהליכים שכוללים 3+ אנשים הם בדרך כלל צוואר בקבוק — תעדף אותם",
  "כל שעה שחוסכים בשבוע = ~200 שעות בשנה. חשב את הערך הכספי",
  "עסקים שמיישמים 2-3 סוכני AI ראשונים חוסכים 40% מהזמן הידני",
  "סקור את דוח ההזדמנויות שלך — ייתכן שיש שם כסף מונח על השולחן",
  "תיעוד תהליכים ידנית הוא סימן שאפשר להפוך אותם לאוטומטיים",
  "מה לוקח לך הכי הרבה זמן ביום? זה המקום הראשון להתחיל",
];

export function DashboardClient({ businessId, businessName }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAnalysis = searchParams.get("fromAnalysis") === "1";
  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);

  const todayTip = DAILY_TIPS[Math.floor(Date.now() / 86400000) % DAILY_TIPS.length];

  const { data: opportunitiesSummary = [] } = useQuery<Array<{ estimatedHoursSaved: number | null; estimatedCostSaved: number | null; roadmapStatus: string }>>({
    queryKey: ["opportunities-summary", businessId],
    queryFn: async () => {
      const r = await fetch(`/api/business/opportunities?businessId=${businessId}`);
      if (!r.ok) return [];
      const body = await r.json();
      return Array.isArray(body) ? body : (body.opportunities ?? []);
    },
  });

  const doneOpps = opportunitiesSummary.filter((o) => o.roadmapStatus === "done");
  const totalHrsSaved = doneOpps.reduce((s, o) => s + (o.estimatedHoursSaved ?? 0), 0);
  const totalCostSaved = doneOpps.reduce((s, o) => s + (o.estimatedCostSaved ?? 0), 0);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const { data, isLoading, isError, error } = useQuery<BusinessMapData>({
    queryKey: ["business-map", businessId],
    queryFn: async () => {
      const res = await fetch(`/api/business/map?businessId=${businessId}`);
      if (!res.ok) throw new Error(await res.text() || "Failed to load");
      return res.json();
    },
  });

  useEffect(() => {
    if (!data) return;
    if (!fromAnalysis) return;

    let shown = false;
    try {
      shown = localStorage.getItem(revealStorageKey(businessId)) === "1";
    } catch {
      /* ignore */
    }
    if (!shown) setRevealOpen(true);
    router.replace("/dashboard", { scroll: false });
  }, [data, fromAnalysis, businessId, router]);

  const openAnalysisReveal = useCallback(() => {
    setRevealOpen(true);
  }, []);

  async function handleRegenerateAnalysis() {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/opportunities/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      if (!res.ok) throw new Error(await res.text() || "Failed");
      
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      await queryClient.invalidateQueries({ queryKey: ["business-map", businessId] });
      await queryClient.invalidateQueries({ queryKey: ["opportunities", businessId] });
      
      toast.success(`AI analysis updated (${result.count || 0} opportunities found)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsRegenerating(false);
    }
  }

  const deptCount = data?.departments?.length ?? 0;
  const processCount = data?.departments?.reduce((sum, d) => sum + (d.processes?.length ?? 0), 0) ?? 0;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#111319" }}>
      {/* Header */}
      <header
        className="shrink-0"
        style={{ backgroundColor: "#191b22", borderBottom: "1px solid #282a30" }}
      >
        <div className="flex items-center justify-between gap-6 px-6 h-14">
          {/* Left */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Network
                className="w-4 h-4 shrink-0"
                strokeWidth={1.5}
                style={{ color: "#424754" }}
              />
              <h1
                className="text-base font-bold truncate"
                style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb", letterSpacing: "-0.01em" }}
              >
                {businessName}
              </h1>
            </div>
            {!isLoading && data && (
              <div
                className="hidden sm:flex items-center gap-3 text-xs"
                style={{ color: "#424754", fontFamily: "var(--font-inter)" }}
              >
                <span>
                  <span className="font-semibold" style={{ color: "#8c909f" }}>{deptCount}</span>
                  {" "}departments
                </span>
                <div className="w-px h-3" style={{ backgroundColor: "#282a30" }} />
                <span>
                  <span className="font-semibold" style={{ color: "#8c909f" }}>{processCount}</span>
                  {" "}processes
                </span>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {!isLoading && data && <HealthScore businessId={businessId} />}
            <div className="w-px h-6 shrink-0" style={{ backgroundColor: "#282a30" }} />
            <button
              id="sign-out-btn"
              onClick={handleSignOut}
              title="התנתק"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150"
              style={{
                fontFamily: "var(--font-inter)",
                backgroundColor: "transparent",
                border: "1px solid #282a30",
                color: "#8c909f",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "#f87171";
                (e.currentTarget as HTMLElement).style.borderColor = "#f8717130";
                (e.currentTarget as HTMLElement).style.backgroundColor = "#f8717108";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "#8c909f";
                (e.currentTarget as HTMLElement).style.borderColor = "#282a30";
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <LogOut className="w-3 h-3" strokeWidth={2} />
              <span className="hidden sm:inline">התנתק</span>
            </button>
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all duration-150"
              style={{
                fontFamily: "var(--font-inter)",
                backgroundColor: "#1e1f26",
                border: "1px solid #282a30",
                color: "#c2c6d6",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#424754"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#282a30"; }}
            >
              <FileText className="w-3 h-3" strokeWidth={2} />
              Export PDF
            </Link>
            <button
              onClick={handleRegenerateAnalysis}
              disabled={isRegenerating}
              className="inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.98]"
              style={{
                fontFamily: "var(--font-inter)",
                backgroundColor: "#1e1f26",
                border: "1px solid #282a30",
                color: isRegenerating ? "#424754" : "#c2c6d6",
                cursor: isRegenerating ? "not-allowed" : "pointer",
                opacity: isRegenerating ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (!isRegenerating) e.currentTarget.style.borderColor = "#424754";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#282a30";
              }}
            >
              <RotateCcw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} strokeWidth={2} />
              {isRegenerating ? "Analyzing…" : "Refresh AI"}
            </button>
          </div>
        </div>

        {/* Sub-header hint */}
        {!isLoading && data && (
          <div
            className="px-6 pb-2.5 flex items-center gap-1.5 text-[10px]"
            style={{ color: "#424754", fontFamily: "var(--font-inter)" }}
          >
            <span>Drag nodes to rearrange</span>
            <span>·</span>
            <span>Click any department to see details</span>
          </div>
        )}
      </header>

      <DashboardStats businessId={businessId} />

      {/* Daily tip + savings banner */}
      <div className="shrink-0" style={{ borderBottom: "1px solid #1e1f26" }}>
        {totalHrsSaved > 0 && (
          <div
            className="px-6 py-2 flex items-center gap-3 flex-wrap"
            style={{ backgroundColor: "#111319", borderBottom: "1px solid #1e1f26" }}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#34d399" }} />
              <span className="text-xs font-semibold" style={{ color: "#34d399", fontFamily: "var(--font-inter)" }}>
                חסכת {totalHrsSaved.toFixed(0)} שעות
              </span>
            </div>
            {totalCostSaved > 0 && (
              <span className="text-xs" style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}>
                · ₪{totalCostSaved.toLocaleString()} חיסכון כספי מוערך
              </span>
            )}
          </div>
        )}
        <div
          className="px-6 py-2 flex items-start gap-2"
          style={{ backgroundColor: "#111319" }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest shrink-0 mt-px" style={{ color: "#4d8eff", fontFamily: "var(--font-inter)" }}>
            טיפ יומי
          </span>
          <span className="text-xs leading-relaxed" style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}>
            {todayTip}
          </span>
        </div>
      </div>

      {/* Map / loading / error */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-wrap gap-5 p-10 max-w-4xl justify-center">
              <SkeletonNode />
              <SkeletonNode />
              <SkeletonNode />
              <SkeletonNode />
            </div>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-sm px-6">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(255,180,171,0.06)", border: "1px solid rgba(255,180,171,0.15)" }}
              >
                <span style={{ color: "#ffb4ab" }} className="text-sm font-bold">!</span>
              </div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb" }}
              >
                Failed to load map
              </p>
              <p className="text-xs" style={{ color: "#424754" }}>
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
            </div>
          </div>
        )}

        {data && !isLoading && !isError && (
          <BusinessMap data={data} onOpenAnalysisReveal={openAnalysisReveal} />
        )}
        <KnowledgeRequestPopup businessId={businessId} />

        {data && (
          <AnalysisRevealModal
            open={revealOpen}
            onDismiss={() => setRevealOpen(false)}
            businessId={businessId}
            summary={data.analysisSummary ?? null}
          />
        )}

        {!isLoading && !isError && data && data.departments.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6">
              <p className="text-sm font-semibold mb-1" style={{ color: "#424754", fontFamily: "var(--font-manrope)" }}>
                No departments yet
              </p>
              <p className="text-xs" style={{ color: "#33343b" }}>
                Complete onboarding to generate your map.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
