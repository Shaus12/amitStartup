import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });

  const [business, departments, processes, painPoints, bottlenecks, opportunities] =
    await Promise.all([
      prisma.business.findUnique({ where: { id: businessId } }),
      prisma.department.findMany({ where: { businessId } }),
      prisma.process.findMany({ where: { businessId } }),
      prisma.painPoint.findMany({ where: { businessId } }),
      prisma.bottleneck.findMany({ where: { businessId } }),
      prisma.aiOpportunity.findMany({ where: { businessId, dismissedAt: null } }),
    ]);

  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ── Scoring (0–100, higher = healthier) ──────────────────────────
  // 1. Manual workload (30pts) — penalise high % of manual processes
  const totalProcs = processes.length;
  const manualProcs = processes.filter((p) => p.isManual).length;
  const manualPct = totalProcs > 0 ? manualProcs / totalProcs : 0;
  const manualScore = Math.round((1 - manualPct) * 30);

  // 2. Pain point density (25pts) — fewer pain points relative to depts
  const highPain = painPoints.filter((p) => p.severity === "high").length;
  const medPain  = painPoints.filter((p) => p.severity === "medium").length;
  const painWeight = highPain * 2 + medPain * 1;
  const maxPain  = Math.max(departments.length * 3, 1);
  const painScore = Math.round(Math.max(0, 1 - painWeight / maxPain) * 25);

  // 3. Bottlenecks (15pts)
  const bottleneckScore = Math.round(Math.max(0, 1 - bottlenecks.length / 6) * 15);

  // 4. AI coverage (20pts) — how many opps are done or in progress
  const coveredOpps = opportunities.filter((o) => o.roadmapStatus !== "backlog").length;
  const aiCoverageScore = opportunities.length > 0
    ? Math.round((coveredOpps / opportunities.length) * 20)
    : 10; // neutral if none generated yet

  // 5. Business setup completeness (10pts)
  const completenessFields = [
    business.tagline, business.targetCustomer, business.aiComfortLevel,
    business.topPriority90Days, business.staffStructure,
  ];
  const filled = completenessFields.filter(Boolean).length;
  const completenessScore = Math.round((filled / completenessFields.length) * 10);

  const totalScore = manualScore + painScore + bottleneckScore + aiCoverageScore + completenessScore;

  // ── Per-department scores ────────────────────────────────────────
  const deptScores = departments.map((dept) => {
    const dProcs   = processes.filter((p) => p.departmentId === dept.id);
    const dManual  = dProcs.filter((p) => p.isManual).length;
    const dPain    = painPoints.filter((p) => p.departmentId === dept.id);
    const dHighP   = dPain.filter((p) => p.severity === "high").length;
    const dOpps    = opportunities.filter((o) => o.departmentId === dept.id);
    const dManualPct = dProcs.length > 0 ? dManual / dProcs.length : 0;
    const s = Math.round(
      (1 - dManualPct) * 50 +
      Math.max(0, 1 - dHighP / 3) * 30 +
      (dOpps.filter((o) => o.roadmapStatus !== "backlog").length / Math.max(dOpps.length, 1)) * 20
    );
    return {
      id: dept.id,
      name: dept.name,
      color: dept.color,
      score: Math.min(100, s),
      manualPct: Math.round(dManualPct * 100),
      painCount: dPain.length,
      oppCount: dOpps.length,
    };
  });

  return NextResponse.json({
    score: Math.min(100, totalScore),
    breakdown: { manualScore, painScore, bottleneckScore, aiCoverageScore, completenessScore },
    departments: deptScores,
  });
}
