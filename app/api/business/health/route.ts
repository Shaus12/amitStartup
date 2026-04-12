import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const owned = await verifyBusinessAccess(supabase, businessId, user);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Fetch business, departments, AI opportunities, and the onboarding snapshot
  const [
    { data: business },
    { data: departments },
    { data: opportunities },
    { data: session },
  ] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", businessId).single(),
    supabase.from("departments").select("*").eq("business_id", businessId),
    supabase.from("ai_opportunities").select("*").eq("business_id", businessId),
    supabase
      .from("onboarding_sessions")
      .select("answers")
      .eq("business_id", businessId)
      .limit(1)
      .single(),
  ]);

  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Pull detailed data from the JSONB onboarding snapshot
  const answers = (session?.answers as any) ?? {};
  const processes: any[] = answers.processes ?? [];
  const painPoints: any[] = [
    ...(answers.painPoint1 ? [{ description: answers.painPoint1, severity: "high" }] : []),
    ...(answers.painPoint2 ? [{ description: answers.painPoint2, severity: "medium" }] : []),
    ...(answers.painPoint3 ? [{ description: answers.painPoint3, severity: "medium" }] : []),
    ...(answers.biggestHeadache ? [{ description: answers.biggestHeadache, severity: "high" }] : []),
  ];
  const bottlenecks: any[] = answers.bottlenecks ?? [];
  const depts = departments ?? [];
  const opps = opportunities ?? [];

  // ── Scoring (0–100) ───────────────────────────────────────────────
  // 1. Manual workload (30pts)
  const totalProcs = processes.length;
  const manualProcs = processes.filter((p) => p.isManual).length;
  const manualPct = totalProcs > 0 ? manualProcs / totalProcs : 0;
  const manualScore = Math.round((1 - manualPct) * 30);

  // 2. Pain point density (25pts)
  const highPain = painPoints.filter((p) => p.severity === "high").length;
  const medPain = painPoints.filter((p) => p.severity === "medium").length;
  const painWeight = highPain * 2 + medPain * 1;
  const maxPain = Math.max(depts.length * 3, 1);
  const painScore = Math.round(Math.max(0, 1 - painWeight / maxPain) * 25);

  // 3. Bottlenecks (15pts)
  const bottleneckScore = Math.round(Math.max(0, 1 - bottlenecks.length / 6) * 15);

  // 4. AI coverage (20pts)
  const coveredOpps = opps.filter((o) => o.roadmap_status !== "backlog").length;
  const aiCoverageScore = opps.length > 0 ? Math.round((coveredOpps / opps.length) * 20) : 10;

  // 5. Business setup completeness (10pts)
  const completenessFields = [
    business.tagline,
    business.industry,
    business.tech_comfort,
    business.ai_budget,
    business.employee_range,
  ];
  const filled = completenessFields.filter(Boolean).length;
  const completenessScore = Math.round((filled / completenessFields.length) * 10);

  const totalScore = manualScore + painScore + bottleneckScore + aiCoverageScore + completenessScore;

  // ── Per-department scores ─────────────────────────────────────────
  const deptScores = depts.map((dept) => {
    const dProcs = processes.filter(
      (p) => p.departmentName?.toLowerCase() === dept.name?.toLowerCase()
    );
    const dManual = dProcs.filter((p) => p.isManual).length;
    const dOpps = opps.filter((o) => o.department_id === dept.id);
    const dManualPct = dProcs.length > 0 ? dManual / dProcs.length : 0;
    const s = Math.round(
      (1 - dManualPct) * 50 +
        (dOpps.filter((o) => o.roadmap_status !== "backlog").length /
          Math.max(dOpps.length, 1)) *
          50
    );
    return {
      id: dept.id,
      name: dept.name,
      color: dept.color,
      score: Math.min(100, s),
      manualPct: Math.round(dManualPct * 100),
      oppCount: dOpps.length,
    };
  });

  return NextResponse.json({
    score: Math.min(100, totalScore),
    breakdown: { manualScore, painScore, bottleneckScore, aiCoverageScore, completenessScore },
    departments: deptScores,
  });
}
