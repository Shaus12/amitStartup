import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

type RawTask = {
  department_name?: string | null;
  ai_opportunities?: {
    title?: string | null;
    is_quick_win?: boolean | null;
    notification_hook?: string | null;
    departments?: {
      name?: string | null;
      color?: string | null;
    } | null;
  } | null;
  [key: string]: unknown;
};

type CreateTaskBody = {
  businessId?: string;
  title?: string;
  description?: string | null;
  opportunityId?: string | null;
  estimatedHours?: number | null;
  parent_task_id?: string | null;
  department_name?: string | null;
};

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const owned = await verifyBusinessAccess(supabase, businessId, user);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: rawTasks, error } = await supabase
    .from("tasks")
    .select(`
      *,
      ai_opportunities (
        title,
        is_quick_win,
        notification_hook,
        departments (
          name,
          color
        )
      )
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Internal server error" }, { status: 500 });

  const tasks = ((rawTasks ?? []) as RawTask[]).map((t) => {
    let deptName = t.department_name || null;
    let deptColor = null;
    let isQuickWin = false;
    let notificationHook: string | null = null;
    let opportunityTitle: string | null = null;

    if (t.ai_opportunities) {
      deptName = t.ai_opportunities.departments?.name || deptName;
      deptColor = t.ai_opportunities.departments?.color || null;
      opportunityTitle = t.ai_opportunities.title ?? null;
      isQuickWin = t.ai_opportunities.is_quick_win ?? false;
      notificationHook = t.ai_opportunities.notification_hook ?? null;
    }

    // Cleanup the nested join data to keep the response clean
    delete t.ai_opportunities;

    return {
      ...t,
      department_name: deptName,
      department_color: deptColor,
      opportunity_title: opportunityTitle,
      is_quick_win: isQuickWin,
      notification_hook: notificationHook,
    };
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, title, description, opportunityId, estimatedHours, parent_task_id, department_name } = (await req.json()) as CreateTaskBody;
    if (!businessId || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const owned = await verifyBusinessAccess(supabase, businessId, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        business_id: businessId,
        title,
        description,
        opportunity_id: opportunityId || null,
        estimated_hours: estimatedHours || null,
        status: "todo",
        parent_task_id: parent_task_id || null,
        department_name: department_name || null,
      })
      .select()
      .single();

    if (error) throw error;
    
    // If linked to an opportunity, update opportunity status to in_progress
    if (opportunityId) {
      await supabase
        .from("ai_opportunities")
        .update({ status: "in_progress" })
        .eq("id", opportunityId)
        .eq("business_id", businessId);
    }

    return NextResponse.json(task);
  } catch (err: unknown) {
    console.error("Task create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
