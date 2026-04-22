import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const owned = await verifyBusinessAccess(supabase, businessId, user);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Fetch business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id, name, industry")
      .eq("id", businessId)
      .single();

    if (bizError) throw bizError;

    // Fetch departments with their AI opportunities (non-archived)
    const { data: departments, error: depError } = await supabase
      .from("departments")
      .select("*, ai_opportunities(id, title, impact_type, status, archived)")
      .eq("business_id", businessId);

    if (depError) throw depError;

    // Fetch processes and insights from business_knowledge
    const { data: knowledgeRows, error: knowledgeError } = await supabase
      .from("business_knowledge")
      .select("*")
      .eq("business_id", businessId)
      .in("category", ["process", "insight", "pain_point", "main_pain", "first_action"]);
      
    if (knowledgeError) throw knowledgeError;

    const allProcesses = (knowledgeRows || []).filter(r => r.category === "process").map(r => ({
      id: r.id,
      department_id: r.department_id,
      name: r.metadata?.originalName || r.content,
      frequency: r.metadata?.frequency || null,
      isManual: r.metadata?.isManual || false,
    }));

    // Fetch opportunities that already have tasks
    const { data: existingTasks, error: tasksError } = await supabase
      .from("tasks")
      .select("opportunity_id")
      .eq("business_id", businessId)
      .not("opportunity_id", "is", null);

    if (tasksError) throw tasksError;

    const existingTaskOppIds = new Set(existingTasks?.map(t => t.opportunity_id) || []);

    function pickImpactfulQuote(rows: { content: string; category: string }[] | null): string | null {
      if (!rows?.length) return null;
      const scored = rows.map((r) => ({
        content: r.content,
        score: (r.category === "pain_point" ? 2000 : 0) + (typeof r.content === "string" ? r.content.length : 0),
      }));
      scored.sort((a, b) => b.score - a.score);
      return scored[0]?.content ?? null;
    }

    function toHealthOutOf10(raw: number | null | undefined): number | null {
      if (raw == null || Number.isNaN(Number(raw))) return null;
      const n = Number(raw);
      if (n <= 10) return Math.min(10, Math.max(0, n));
      return Math.min(10, Math.max(0, Math.round((n / 10) * 10) / 10));
    }

    // ── Business-wide analysis summary (reveal modal + summary card) ───────
    const [
      { data: allOppsRows },
      { data: latestHealth },
      { data: quoteCandidates },
    ] = await Promise.all([
      supabase
        .from("ai_opportunities")
        .select("estimated_hours_saved, estimated_cost_saved, archived")
        .eq("business_id", businessId),
      supabase
        .from("business_health_scores")
        .select("score")
        .eq("business_id", businessId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("business_knowledge")
        .select("content, category")
        .eq("business_id", businessId)
        .in("category", ["pain_point", "goal"])
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const activeOppsAll = (allOppsRows ?? []).filter((o: any) => o.archived !== true);
    const hoursSavedPerMonth = activeOppsAll.reduce(
      (s: number, o: any) => s + (Number(o.estimated_hours_saved) || 0),
      0
    );
    const moneyPerMonthSum = activeOppsAll.reduce(
      (s: number, o: any) => s + (Number(o.estimated_cost_saved) || 0),
      0
    );
    const rawHealth = latestHealth?.score != null ? Number(latestHealth.score) : null;
    const analysisSummary = {
      hoursSavedPerMonth: hoursSavedPerMonth,
      moneySavedPerYear: moneyPerMonthSum * 12,
      opportunityCount: activeOppsAll.length,
      healthScore: rawHealth,
      healthScoreOutOf10: toHealthOutOf10(rawHealth),
      departmentCount: (departments ?? []).length,
      questionnaireQuote: pickImpactfulQuote(quoteCandidates as { content: string; category: string }[] | null),
    };

    // Normalize departments to camelCase for the UI components
    const normalizedDepts = (departments ?? []).map((dept) => {
      // Filter processes that belong to this department
      const deptProcesses = allProcesses
        .filter((p) => p.department_id === dept.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          frequency: p.frequency,
          timeSpentHrsPerWeek: null,
          isManual: p.isManual,
          isRepetitive: false,
        }));

      const deptInsights = (knowledgeRows || []).filter(
        (r) => r.department_id === dept.id && (r.category === "insight" || r.category === "pain_point")
      );
      const mainPainRow = (knowledgeRows || []).find((r) => r.department_id === dept.id && r.category === "main_pain")
        || deptInsights.find((r) => r.content.startsWith("[main_pain]") || r.content.startsWith("Pain:") || r.category === "pain_point");
      const firstActionRow = (knowledgeRows || []).find((r) => r.department_id === dept.id && r.category === "first_action")
        || deptInsights.find((r) => r.content.startsWith("[first_action]") || r.content.startsWith("Action:"));

      const activeOpps = (dept.ai_opportunities ?? []).filter((o: any) => o.archived !== true);
      const isLocked = deptProcesses.length === 0 && activeOpps.length === 0;

      return {
        id: dept.id,
        name: dept.name,
        color: dept.color,
        headcount: dept.headcount ?? null,
        healthScore: dept.health_score ?? null,
        isLocked,
        mainPain: mainPainRow ? mainPainRow.content.replace(/^\[main_pain\]\s*/, "").replace(/^Pain:\s*/, "") : null,
        firstAction: firstActionRow ? firstActionRow.content.replace(/^\[first_action\]\s*/, "").replace(/^Action:\s*/, "") : null,
        // camelCase aliases for React Flow / UI components
        positionX: dept.position_x ?? 0,
        positionY: dept.position_y ?? 0,
        status: "active",
        sortOrder: 0,
        description: null,
        icon: null,
        // Processes from knowledge table
        processes: deptProcesses,
        painPoints: [],
        // AI opportunities — normalize to camelCase and filter non-archived
        aiOpportunities: activeOpps.map((o: any) => ({
            id: o.id,
            title: o.title,
            impactType: o.impact_type,
            status: o.status,
            estimatedHoursSaved: o.estimated_hours_saved,
            estimatedCostSaved: o.estimated_cost_saved,
            hasTask: existingTaskOppIds.has(o.id),
          })),
      };
    });

    return NextResponse.json({ business, departments: normalizedDepts, analysisSummary });
  } catch (err: any) {
    console.error("Map route error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
