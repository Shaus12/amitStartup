"use client";

import { useRef } from "react";
import { Printer, Download, ArrowLeft, Activity, Clock, Users, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Business = {
  id: string; name: string; ownerName: string | null; tagline: string | null;
  industry: string; employeeRange: string; revenueRange: string | null;
  growthTrajectory: string | null;
  departments: {
    id: string; name: string; color: string; status: string; headcount: number | null;
    processes: { id: string; name: string; isManual: boolean; timeSpentHrsPerWeek: number | null; frequency: string | null }[];
    painPoints: { id: string; description: string; severity: string }[];
    aiOpportunities: any[];
  }[];
  goals: { id: string; goal: string }[];
  bottlenecks: { id: string; type: string; freeText: string | null }[];
  tools: { id: string; name: string; category: string; monthlyCost: number | null }[];
  aiOpportunities: {
    id: string; title: string; agentName: string | null; agentDescription: string | null;
    estimatedHoursSaved: number | null; estimatedCostSaved: number | null;
    setupComplexity: string | null; impactType: string; roadmapStatus: string;
    department: { name: string; color: string } | null;
  }[];
};

const C = {
  text: "#111318", muted: "#6b7280", border: "#e5e7eb",
  blue: "#2563eb", green: "#059669", amber: "#d97706", red: "#dc2626",
  blueBg: "#eff6ff", greenBg: "#f0fdf4",
};

function normalizeComplexity(c: string | null): string | null {
  if (!c) return null;
  const lower = c.toLowerCase().replace(/[_\s-]/g, "");
  if (lower === "low" || lower === "plugandplay") return "Low";
  if (lower === "high" || lower === "custombuild") return "High";
  if (lower === "medium" || lower === "somesetup") return "Medium";
  return c;
}

function scoreColor(s: string | null) {
  const n = normalizeComplexity(s);
  if (n === "Low")    return C.green;
  if (n === "High")   return C.red;
  return C.blue;
}

export function ReportClient({ business }: { business: Business }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const totalHrsSaved = business.aiOpportunities.reduce((s, o) => s + (o.estimatedHoursSaved ?? 0), 0);
  const totalCostSaved = business.aiOpportunities.reduce((s, o) => s + (o.estimatedCostSaved ?? 0), 0);
  const totalProcs = business.departments.reduce((s, d) => s + d.processes.length, 0);
  const manualProcs = business.departments.reduce((s, d) => s + d.processes.filter((p) => p.isManual).length, 0);
  const totalHrsPerWeek = business.departments.reduce((s, d) => s + d.processes.reduce((ss, p) => ss + (p.timeSpentHrsPerWeek ?? 0), 0), 0);

  function handlePrint() { window.print(); }

  return (
    <div>
      {/* Print toolbar (hidden when printing) */}
      <div
        className="print:hidden sticky top-0 z-50 flex items-center justify-between px-6 h-12"
        style={{ backgroundColor: "#111319", borderBottom: "1px solid #282a30" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2 text-xs" style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: "#424754", fontFamily: "var(--font-inter)" }}>
            {business.name} — AI Business Report
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-150 active:scale-[0.97]"
            style={{ backgroundColor: "#e2e2eb", color: "#0c0e14", fontFamily: "var(--font-inter)" }}
          >
            <Printer className="w-3 h-3" strokeWidth={2} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Report — white A4-style */}
      <div
        ref={reportRef}
        className="bg-white min-h-screen print:min-h-0"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <div className="max-w-[800px] mx-auto px-12 py-14 print:px-8 print:py-10">

          {/* Cover */}
          <div className="mb-12 pb-10" style={{ borderBottom: `2px solid ${C.border}` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.muted }}>AI Business Intelligence Report</p>
                <h1 className="text-4xl font-extrabold mb-2" style={{ color: C.text, fontFamily: "var(--font-manrope)", letterSpacing: "-0.03em" }}>
                  {business.name}
                </h1>
                {business.tagline && <p className="text-base" style={{ color: C.muted }}>{business.tagline}</p>}
              </div>
              <div className="text-right text-xs" style={{ color: C.muted }}>
                <p>Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                <p className="mt-1">Powered by BizView + Claude AI</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {[
                { val: business.departments.length.toString(), label: "Departments" },
                { val: totalProcs.toString(), label: "Processes mapped" },
                { val: `${Math.round(totalHrsSaved)}h/wk`, label: "Hours to reclaim", highlight: true },
                { val: `$${Math.round(totalCostSaved).toLocaleString()}`, label: "Monthly AI savings", highlight: true },
              ].map(({ val, label, highlight }) => (
                <div key={label} className="rounded-lg p-3" style={{ backgroundColor: highlight ? C.blueBg : "#f9fafb", border: `1px solid ${highlight ? "#bfdbfe" : C.border}` }}>
                  <p className="text-2xl font-extrabold" style={{ color: highlight ? C.blue : C.text, fontFamily: "var(--font-manrope)", letterSpacing: "-0.03em" }}>{val}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Business overview */}
          <Section title="Business Overview">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Industry", business.industry],
                ["Team size", business.employeeRange],
                ["Revenue", business.revenueRange ?? "—"],
                ["Growth", business.growthTrajectory ?? "—"],
                ["Owner", business.ownerName ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.muted }}>{k}</span>
                  <span className="font-medium" style={{ color: C.text }}>{v}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Department map */}
          <Section title="Department Map">
            <div className="space-y-4">
              {business.departments.map((dept) => {
                const hrs = dept.processes.reduce((s, p) => s + (p.timeSpentHrsPerWeek ?? 0), 0);
                const manualCount = dept.processes.filter((p) => p.isManual).length;
                const manualPct = dept.processes.length > 0 ? Math.round((manualCount / dept.processes.length) * 100) : 0;
                return (
                  <div key={dept.id} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                    <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#f9fafb", borderBottom: `1px solid ${C.border}` }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span className="text-sm font-bold" style={{ color: C.text, fontFamily: "var(--font-manrope)" }}>{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs" style={{ color: C.muted }}>
                        {dept.headcount && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {dept.headcount}</span>}
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {hrs}h/wk</span>
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {dept.processes.length} processes</span>
                        <span style={{ color: manualPct > 60 ? C.red : C.muted }}>{manualPct}% manual</span>
                      </div>
                    </div>
                    {dept.processes.length > 0 && (
                      <div className="px-4 py-2">
                        {dept.processes.map((p) => (
                          <div key={p.id} className="flex items-center justify-between py-1.5 text-xs" style={{ borderBottom: `1px solid #f3f4f6` }}>
                            <span style={{ color: C.text }}>{p.name}</span>
                            <div className="flex items-center gap-3" style={{ color: C.muted }}>
                              {p.timeSpentHrsPerWeek != null && <span>{p.timeSpentHrsPerWeek}h/wk</span>}
                              {p.isManual && <span className="font-semibold" style={{ color: C.amber }}>Manual</span>}
                              {p.frequency && <span>{p.frequency}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {dept.painPoints.length > 0 && (
                      <div className="px-4 py-2" style={{ backgroundColor: "#fff7ed", borderTop: `1px solid #fed7aa` }}>
                        {dept.painPoints.map((pp) => (
                          <div key={pp.id} className="flex items-start gap-2 py-1 text-xs">
                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.amber }} />
                            <span style={{ color: C.text }}>{pp.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* AI Opportunities */}
          <Section title="AI Agent Recommendations">
            <div className="space-y-4">
              {business.aiOpportunities.map((opp, i) => (
                <div key={opp.id} className="rounded-lg p-4" style={{ backgroundColor: C.greenBg, border: `1px solid #bbf7d0` }}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold tabular-nums w-5" style={{ color: C.muted }}>#{i + 1}</span>
                      <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: C.green }} strokeWidth={2} />
                      <p className="text-sm font-bold" style={{ color: C.text, fontFamily: "var(--font-manrope)" }}>{opp.agentName ?? opp.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {opp.estimatedHoursSaved != null && (
                        <span className="text-xs font-semibold" style={{ color: C.blue }}>{opp.estimatedHoursSaved}h/wk</span>
                      )}
                      {opp.estimatedCostSaved != null && (
                        <span className="text-xs font-semibold" style={{ color: C.green }}>${Math.round(opp.estimatedCostSaved).toLocaleString()}/mo</span>
                      )}
                      {opp.setupComplexity && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "white", color: scoreColor(opp.setupComplexity) }}>
                          {normalizeComplexity(opp.setupComplexity)} effort
                        </span>
                      )}
                    </div>
                  </div>
                  {opp.agentDescription && (
                    <p className="text-xs leading-relaxed ml-9" style={{ color: C.muted }}>{opp.agentDescription}</p>
                  )}
                  {opp.department && (
                    <div className="flex items-center gap-1.5 mt-2 ml-9">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: opp.department.color }} />
                      <span className="text-[10px]" style={{ color: C.muted }}>{opp.department.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Summary */}
          <Section title="Summary & Next Steps">
            <div className="space-y-3 text-sm" style={{ color: C.text }}>
              <p>Based on the analysis of <strong>{business.name}</strong>, the following priorities are recommended:</p>
              <ol className="space-y-2 pl-4 list-decimal">
                {business.aiOpportunities.slice(0, 3).map((opp) => (
                  <li key={opp.id}>
                    <strong>{opp.agentName ?? opp.title}</strong> — {opp.agentDescription?.slice(0, 100)}…
                  </li>
                ))}
              </ol>
              <div className="rounded-lg p-4 mt-4" style={{ backgroundColor: C.blueBg, border: `1px solid #bfdbfe` }}>
                <p className="font-semibold mb-1" style={{ color: C.blue, fontFamily: "var(--font-manrope)" }}>Projected Impact</p>
                <p>Deploying all {business.aiOpportunities.length} recommended agents would recover approximately <strong>{Math.round(totalHrsSaved)} hours per week</strong> and generate <strong>${Math.round(totalCostSaved).toLocaleString()} in monthly savings</strong>.</p>
              </div>
            </div>
          </Section>

          {/* Footer */}
          <div className="mt-16 pt-6 flex items-center justify-between text-[10px]" style={{ borderTop: `1px solid ${C.border}`, color: C.muted }}>
            <span>Generated by BizView Intelligence · bizview.app</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: "#111318", fontFamily: "var(--font-manrope)", letterSpacing: "-0.02em" }}>{title}</h2>
        <div className="flex-1 h-px" style={{ backgroundColor: "#e5e7eb" }} />
      </div>
      {children}
    </div>
  );
}
