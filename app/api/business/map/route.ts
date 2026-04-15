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

      return {
        id: dept.id,
        name: dept.name,
        color: dept.color,
        headcount: dept.headcount ?? null,
        healthScore: dept.health_score ?? null,
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
        aiOpportunities: (dept.ai_opportunities ?? [])
          .filter((o: any) => o.archived !== true)
          .map((o: any) => ({
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

    return NextResponse.json({ business, departments: normalizedDepts });
  } catch (err: any) {
    console.error("Map route error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
