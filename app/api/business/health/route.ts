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

  // ── 1. Fetch the pre-calculated health score ──
  const { data: scoreRow } = await supabase
    .from("business_health_scores")
    .select("*")
    .eq("business_id", businessId)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .single();

  // ── 2. Fetch departments & opportunities to calculate per-department scores ──
  const [
    { data: departments },
    { data: opportunities },
    { data: knowledgeRows },
  ] = await Promise.all([
    supabase.from("departments").select("*").eq("business_id", businessId),
    supabase.from("ai_opportunities").select("*").eq("business_id", businessId),
    supabase.from("business_knowledge").select("*").eq("business_id", businessId).eq("category", "process"),
  ]);

  const depts = departments ?? [];
  const opps = opportunities ?? [];
  const processes = knowledgeRows ?? [];

  const deptScores = depts.map((dept) => {
    const dProcs = processes.filter((p) => p.department_id === dept.id);
    const dManual = dProcs.filter((p) => p.metadata?.isManual).length;
    const dOpps = opps.filter((o) => o.department_id === dept.id);
    const dManualPct = dProcs.length > 0 ? dManual / dProcs.length : 0;
    
    // Per-department score logic
    const s = Math.round(
      (1 - dManualPct) * 50 +
        (dOpps.filter((o) => o.status !== "suggested").length /
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

  if (!scoreRow) {
    // If no score exists yet (e.g. they haven't generated AI analysis), return a default
    return NextResponse.json({
      score: 50,
      breakdown: {},
      departments: deptScores,
    });
  }

  return NextResponse.json({
    score: scoreRow.score,
    breakdown: typeof scoreRow.breakdown === 'string' ? JSON.parse(scoreRow.breakdown) : scoreRow.breakdown,
    daily_tip: scoreRow.daily_tip,
    departments: deptScores,
  });
}
