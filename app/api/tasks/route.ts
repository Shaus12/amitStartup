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

  const { data: rawTasks, error } = await supabase
    .from("tasks")
    .select(`
      *,
      ai_opportunities (
        departments (
          name,
          color
        )
      )
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  const tasks = rawTasks.map((t: any) => {
    let deptName = t.department_name || null;
    let deptColor = null;
    
    if (t.ai_opportunities?.departments) {
      deptName = t.ai_opportunities.departments.name || deptName;
      deptColor = t.ai_opportunities.departments.color || null;
    }
    
    // Cleanup the nested join data to keep the response clean
    delete t.ai_opportunities;
    
    return {
      ...t,
      department_name: deptName,
      department_color: deptColor
    };
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, title, description, opportunityId, estimatedHours, parent_task_id, department_name } = await req.json();
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
        .eq("id", opportunityId);
    }

    return NextResponse.json(task);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
