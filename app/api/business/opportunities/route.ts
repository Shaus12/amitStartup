import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";
import { getEffectivePlan, getPlanLimits } from "@/lib/subscription";

const VALID_STATUSES = new Set(["suggested", "backlog", "in_progress", "done"]);

type OpportunityRow = {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  estimated_hours_saved?: number | null;
  agent_tools?: string | null;
  department?: { name?: string | null; color?: string | null } | null;
  [key: string]: unknown;
};

type LinkedTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  estimated_hours: number | null;
  opportunity_id: string | null;
};

type OpportunityPatchBody = {
  id?: string;
  roadmapStatus?: string;
  status?: string;
  pinned?: boolean;
  dismissedAt?: string | null;
};

function extractTools(opportunity: OpportunityRow): string[] {
  const text = [opportunity.agent_tools, opportunity.description, opportunity.title]
    .filter(Boolean)
    .join(" ");
  const knownTools = [
    "Zapier",
    "Make",
    "ChatGPT",
    "ChatGPT Plus",
    "Claude",
    "Airtable",
    "Notion",
    "Slack",
    "Gmail",
    "Google Sheets",
    "Google Calendar",
    "HubSpot",
    "Monday",
    "Asana",
    "Trello",
    "ClickUp",
    "Fireflies.ai",
    "Instantly.ai",
    "Calendly",
    "WhatsApp Business",
    "Typeform",
    "Jotform",
    "Mailchimp",
    "Canva",
  ];

  return knownTools.filter((tool) => text.toLowerCase().includes(tool.toLowerCase())).slice(0, 4);
}

function buildImplementationTasks(opportunity: OpportunityRow) {
  const tools = extractTools(opportunity);
  const primaryTool = tools[0] ?? "כלי ה-AI המתאים";

  return [
    {
      title: "ממפים את התהליך הידני, נקודות הכאב ומדד הצלחה אחד ברור.",
      description: opportunity.description ?? null,
      estimated_hours: 1,
    },
    {
      title: `מגדירים את ${primaryTool} ומחברים אותו למידע או למערכת שבה הצוות כבר משתמש.`,
      description: tools.length > 0 ? `כלים רלוונטיים: ${tools.join(", ")}.` : null,
      estimated_hours: 2,
    },
    {
      title: "מריצים בדיקה על תרחיש אמיתי, מתקנים חריגות ומעבירים לשימוש שוטף.",
      description: null,
      estimated_hours: 1,
    },
  ];
}

async function ensureOpportunityTasks(opportunity: OpportunityRow) {
  const { data: existingTasks, error: existingError } = await supabase
    .from("tasks")
    .select("id")
    .eq("business_id", opportunity.business_id)
    .eq("opportunity_id", opportunity.id);

  if (existingError) throw existingError;
  if ((existingTasks?.length ?? 0) > 0) return;

  const { data: mainTask, error: mainTaskError } = await supabase
    .from("tasks")
    .insert({
      business_id: opportunity.business_id,
      title: opportunity.title,
      description: opportunity.description ?? null,
      estimated_hours: opportunity.estimated_hours_saved ?? null,
      opportunity_id: opportunity.id,
      department_name: opportunity.department?.name ?? null,
      status: "todo",
      parent_task_id: null,
    })
    .select("id")
    .single();

  if (mainTaskError) throw mainTaskError;

  const subtasks = buildImplementationTasks(opportunity).map((task) => ({
    business_id: opportunity.business_id,
    title: task.title,
    description: task.description,
    estimated_hours: task.estimated_hours,
    opportunity_id: opportunity.id,
    department_name: opportunity.department?.name ?? null,
    status: "todo",
    parent_task_id: mainTask.id,
  }));

  const { error: subtaskInsertError } = await supabase.from("tasks").insert(subtasks);
  if (subtaskInsertError) throw subtaskInsertError;
}

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

  const plan = await getEffectivePlan(supabase, user!.id);
  const limits = getPlanLimits(plan);

  try {
    const { data: opportunities, error } = await supabase
      .from("ai_opportunities")
      .select("*, department:departments(name, color)")
      .eq("business_id", businessId)
      .neq("archived", true)
      .order("estimated_hours_saved", { ascending: false });

    if (error) throw error;

    const opportunityIds = (opportunities || []).map((o) => o.id);
    const { data: tasks, error: tasksError } = opportunityIds.length > 0
      ? await supabase
          .from("tasks")
          .select("id, title, description, status, estimated_hours, opportunity_id, parent_task_id")
          .eq("business_id", businessId)
          .in("opportunity_id", opportunityIds)
          .order("created_at", { ascending: true })
      : { data: [], error: null };

    if (tasksError) throw tasksError;

    const tasksByOpportunity = new Map<string, LinkedTask[]>();
    for (const task of tasks || []) {
      if (!task.opportunity_id) continue;
      const list = tasksByOpportunity.get(task.opportunity_id) ?? [];
      list.push(task);
      tasksByOpportunity.set(task.opportunity_id, list);
    }

    const mapped = (opportunities || []).map((o, index) => ({
      ...o,
      businessId: o.business_id,
      departmentId: o.department_id,
      analysisId: o.analysis_id,
      impactType: o.impact_type,
      estimatedHoursSaved: o.estimated_hours_saved,
      estimatedCostSaved: o.estimated_cost_saved,
      implementationEffort: o.implementation_effort ?? null,
      agentName: o.agent_name ?? null,
      agentDescription: o.agent_description ?? null,
      agentTools: o.agent_tools ?? null,
      setupComplexity: o.setup_complexity ?? null,
      dismissedAt: o.dismissed_at ?? null,

      // Alias to new 'status' column for backwards UI compatibility
      roadmapStatus: o.status,
      status: o.status,
      pinned: o.pinned ?? false,
      isQuickWin: o.is_quick_win ?? false,
      notificationHook: o.notification_hook ?? null,
      proofOfValue: o.proof_of_value ?? null,
      tasks: tasksByOpportunity.get(o.id) ?? [],
      isLocked: index >= limits.opportunities,
    }));

    return NextResponse.json(mapped);
  } catch (err: unknown) {
    console.error("Opportunities route error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  try {
    const { id, roadmapStatus, status: newStatus, pinned, dismissedAt } = (await req.json()) as OpportunityPatchBody;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const finalStatus = newStatus || roadmapStatus;

    const updates: Record<string, string | boolean | null> = {};
    if (finalStatus !== undefined) {
      if (!VALID_STATUSES.has(finalStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = finalStatus === "backlog" ? "suggested" : finalStatus;
    }
    if (pinned !== undefined) updates.pinned = pinned;
    if (dismissedAt !== undefined) updates.dismissed_at = dismissedAt;

    // Fetch the opportunity to get its business_id for ownership check
    const { data: existing } = await supabase
      .from("ai_opportunities")
      .select("*, department:departments(name)")
      .eq("id", id)
      .single();

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const owned = await verifyBusinessAccess(supabase, existing.business_id, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: opp, error } = await supabase
      .from("ai_opportunities")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (updates.status === "in_progress") {
      await ensureOpportunityTasks(existing);
    }

    if (updates.status === "done") {
      const { error: taskUpdateError } = await supabase
        .from("tasks")
        .update({ status: "done", completed_at: new Date().toISOString() })
        .eq("business_id", existing.business_id)
        .eq("opportunity_id", id);

      if (taskUpdateError) throw taskUpdateError;
    }

    return NextResponse.json(opp);
  } catch (err: unknown) {
    console.error("Opportunities patch error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
