"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw, Network, FileText, LogOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
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

const DASHBOARD_TOUR_KEY_PREFIX = "dashboard_tour_completed_";

type TourStepConfig = {
  target: string;
  message: string;
  /** Preferred order for placing the tooltip beside the highlight (first that fits wins). */
  placementPriority: Array<"bottom" | "top" | "left" | "right">;
};

const DASHBOARD_TOUR_STEPS: TourStepConfig[] = [
  {
    target: "#tour-map-canvas",
    message:
      "זו המפה העסקית שלך 🗺️\nכל מחלקה מקבלת ציון בריאות — לחץ עליה לפרטים והמלצות",
    placementPriority: ["top", "bottom", "left", "right"],
  },
  {
    target: "#tour-aria-button",
    message:
      "זה ARIA, הסוכן החכם שלך 🤖\nשאל אותו כל שאלה על העסק שלך — הוא יודע הכל עליך",
    placementPriority: ["top", "left", "right", "bottom"],
  },
  {
    target: '[data-tour=\"tasks-sidebar-item\"]',
    message:
      "כאן תמצא את המשימות שלך ⚡\nהתחל מה-Quick Wins — משימות קטנות עם השפעה גדולה",
    placementPriority: ["right", "left", "bottom", "top"],
  },
  {
    target: "#tour-refresh-ai",
    message:
      "ככל שתוסיף מידע על העסק — הניתוח משתפר 🎯\nלחץ כאן בכל עת לקבל המלצות מעודכנות",
    placementPriority: ["bottom", "left", "right", "top"],
  },
];

const TOOLTIP_GAP = 16;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function rectsOverlap(
  a: { left: number; top: number; width: number; height: number },
  b: { left: number; top: number; width: number; height: number }
) {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

/** Place tooltip so it does not cover the padded highlight; prefer order in `priority`. */
function computeTooltipBesideHighlight(
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  highlightPad: number,
  priority: TourStepConfig["placementPriority"]
): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const blocked = {
    left: targetRect.left - highlightPad,
    top: targetRect.top - highlightPad,
    width: targetRect.width + highlightPad * 2,
    height: targetRect.height + highlightPad * 2,
  };

  const centerX = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
  const centerY = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;

  const candidates: Record<
    "bottom" | "top" | "left" | "right",
    { left: number; top: number }
  > = {
    bottom: {
      left: centerX,
      top: targetRect.bottom + highlightPad + TOOLTIP_GAP,
    },
    top: {
      left: centerX,
      top: targetRect.top - highlightPad - TOOLTIP_GAP - tooltipHeight,
    },
    right: {
      left: targetRect.right + highlightPad + TOOLTIP_GAP,
      top: centerY,
    },
    left: {
      left: targetRect.left - highlightPad - TOOLTIP_GAP - tooltipWidth,
      top: centerY,
    },
  };

  for (const dir of priority) {
    const raw = candidates[dir];
    const left = clamp(raw.left, 12, vw - tooltipWidth - 12);
    const top = clamp(raw.top, 12, vh - tooltipHeight - 12);
    const tooltip = { left, top, width: tooltipWidth, height: tooltipHeight };
    if (!rectsOverlap(tooltip, blocked)) {
      return { left, top };
    }
  }

  for (const dir of (["bottom", "top", "right", "left"] as const)) {
    if (priority.includes(dir)) continue;
    const raw = candidates[dir];
    const left = clamp(raw.left, 12, vw - tooltipWidth - 12);
    const top = clamp(raw.top, 12, vh - tooltipHeight - 12);
    const tooltip = { left, top, width: tooltipWidth, height: tooltipHeight };
    if (!rectsOverlap(tooltip, blocked)) {
      return { left, top };
    }
  }

  return { left: 12, top: Math.max(12, vh - tooltipHeight - 12) };
}

function DashboardTourOverlay({
  stepIndex,
  totalSteps,
  targetRect,
  message,
  placementPriority,
  onNext,
  onSkip,
}: {
  stepIndex: number;
  totalSteps: number;
  targetRect: DOMRect;
  message: string;
  placementPriority: TourStepConfig["placementPriority"];
  onNext: () => void;
  onSkip: () => void;
}) {
  const isLast = stepIndex === totalSteps - 1;
  const pad = 8;
  const highlightStyle = {
    top: targetRect.top - pad,
    left: targetRect.left - pad,
    width: targetRect.width + pad * 2,
    height: targetRect.height + pad * 2,
  };

  const tooltipWidthPx = Math.min(360, typeof window !== "undefined" ? window.innerWidth - 24 : 360);
  const wrappedLines = message.split("\n").reduce((sum, line) => {
    return sum + Math.max(1, Math.ceil(line.trim().length / 36));
  }, 0);
  const estimatedTooltipHeight = clamp(125 + wrappedLines * 22 + 52, 160, 310);

  const { left: tooltipLeft, top: tooltipTop } = computeTooltipBesideHighlight(
    targetRect,
    tooltipWidthPx,
    estimatedTooltipHeight,
    pad,
    placementPriority
  );

  const tooltipStyle: CSSProperties = {
    position: "fixed",
    zIndex: 10001,
    left: tooltipLeft,
    top: tooltipTop,
    width: tooltipWidthPx,
    maxHeight: "min(340px, calc(100vh - 24px))",
    overflowY: "auto",
    background: "#191b22",
    border: "1px solid #282a30",
    borderRadius: 14,
    boxShadow: "0 20px 55px rgba(0,0,0,0.6)",
    color: "#fff",
    padding: "14px 14px 12px",
    direction: "rtl",
    fontFamily: "var(--font-inter)",
    transition: "opacity 220ms ease",
  };

  return createPortal(
    <div
      className="fixed inset-0"
      style={{ zIndex: 10000, animation: "bv-fade-up 0.2s ease both" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.74)" }}
      />
      <div
        className="absolute rounded-xl"
        style={{
          ...highlightStyle,
          border: "2px solid rgba(77,142,255,0.8)",
          boxShadow:
            "0 0 0 9999px rgba(0,0,0,0.65), 0 0 24px rgba(77,142,255,0.55)",
          pointerEvents: "none",
        }}
      />
      <div style={tooltipStyle}>
        <p
          className="text-sm leading-relaxed whitespace-pre-line mb-3"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {message}
        </p>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] underline"
            style={{ color: "#8c909f" }}
          >
            דלג על הסיור
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[11px]" style={{ color: "#8c909f" }}>
              {stepIndex + 1} מתוך {totalSteps}
            </span>
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg px-3 py-1.5 text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #4d8eff, #adc6ff)",
                color: "#111319",
              }}
            >
              {isLast ? "בואו נתחיל! 🚀" : "הבא ←"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
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
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [tourTargetRect, setTourTargetRect] = useState<DOMRect | null>(null);
  const [tourReady, setTourReady] = useState(false);

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

  useEffect(() => {
    if (!fromAnalysis || !data) return;
    if (revealOpen) return;
    try {
      const done = localStorage.getItem(
        `${DASHBOARD_TOUR_KEY_PREFIX}${businessId}`
      );
      if (done === "1") return;
    } catch {
      // ignore storage errors
    }
    setTourStep(0);
    setTourReady(true);
  }, [fromAnalysis, data, revealOpen, businessId]);

  const currentTourConfig = useMemo(
    () =>
      tourStep == null
        ? null
        : DASHBOARD_TOUR_STEPS[tourStep] ?? null,
    [tourStep]
  );

  const finishTour = useCallback(() => {
    try {
      localStorage.setItem(`${DASHBOARD_TOUR_KEY_PREFIX}${businessId}`, "1");
    } catch {
      // ignore storage errors
    }
    setTourStep(null);
    setTourTargetRect(null);
    setTourReady(false);
  }, [businessId]);

  useEffect(() => {
    if (!tourReady || !currentTourConfig) return;

    const updateRect = () => {
      const el = document.querySelector(currentTourConfig.target);
      if (!el) {
        setTourTargetRect(null);
        return;
      }
      setTourTargetRect(el.getBoundingClientRect());
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    const id = window.setInterval(updateRect, 250);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      window.clearInterval(id);
    };
  }, [tourReady, currentTourConfig]);

  useEffect(() => {
    if (!tourReady || !currentTourConfig) return;
    if (tourTargetRect) return;
    const id = window.setTimeout(() => {
      setTourStep((prev) => {
        if (prev == null) return null;
        if (prev >= DASHBOARD_TOUR_STEPS.length - 1) {
          finishTour();
          return null;
        }
        return prev + 1;
      });
    }, 700);
    return () => window.clearTimeout(id);
  }, [tourReady, currentTourConfig, tourTargetRect, finishTour]);

  const nextTourStep = useCallback(() => {
    setTourStep((prev) => {
      if (prev == null) return null;
      if (prev >= DASHBOARD_TOUR_STEPS.length - 1) {
        finishTour();
        return null;
      }
      return prev + 1;
    });
  }, [finishTour]);

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
              className="hidden sm:inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all duration-150"
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
              ייצוא PDF
            </Link>
            <button
              id="tour-refresh-ai"
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
              <span className="hidden sm:inline">{isRegenerating ? "מנתח..." : "רענן ניתוח"}</span>
            </button>
          </div>
        </div>

        {/* Sub-header hint */}
        {!isLoading && data && (
          <div
            className="hidden sm:flex px-6 pb-2.5 items-center gap-1.5 text-[10px]"
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
          <div id="tour-map-canvas" className="h-full">
            <BusinessMap data={data} onOpenAnalysisReveal={openAnalysisReveal} />
          </div>
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
      {currentTourConfig && tourTargetRect && (
        <DashboardTourOverlay
          stepIndex={tourStep ?? 0}
          totalSteps={DASHBOARD_TOUR_STEPS.length}
          targetRect={tourTargetRect}
          message={currentTourConfig.message}
          placementPriority={currentTourConfig.placementPriority}
          onNext={nextTourStep}
          onSkip={finishTour}
        />
      )}
    </div>
  );
}
