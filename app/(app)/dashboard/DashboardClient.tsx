"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw, Network, FileText, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BusinessMap } from "@/components/business-map/BusinessMap";
import { BusinessMapData } from "@/lib/types/business-map";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { SaveMapModal } from "@/components/auth/SaveMapModal";
import { createClient } from "@/lib/supabase/client";

interface DashboardClientProps {
  businessId: string;
  businessName: string;
  showSaveModal?: boolean;
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

export function DashboardClient({ businessId, businessName, showSaveModal = false }: DashboardClientProps) {
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);

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

  async function handleRegenerateAnalysis() {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/opportunities/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      if (!res.ok) throw new Error(await res.text() || "Failed");
      toast.success("AI analysis updated");
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
                className="text-sm font-semibold truncate"
                style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb" }}
              >
                {businessName}
              </h1>
            </div>
            {!isLoading && data && (
              <div
                className="hidden sm:flex items-center gap-3 text-[10px]"
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
            {!showSaveModal && (
              <button
                id="sign-out-btn"
                onClick={handleSignOut}
                title="Sign out"
                className="inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-all duration-150"
                style={{
                  fontFamily: "var(--font-inter)",
                  backgroundColor: "transparent",
                  border: "1px solid transparent",
                  color: "#424754",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = "#c2c6d6";
                  (e.currentTarget as HTMLElement).style.borderColor = "#282a30";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = "#424754";
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                }}
              >
                <LogOut className="w-3 h-3" strokeWidth={2} />
              </button>
            )}
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

        {data && !isLoading && !isError && <BusinessMap data={data} />}
        {showSaveModal && <SaveMapModal businessId={businessId} businessName={businessName} />}

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
