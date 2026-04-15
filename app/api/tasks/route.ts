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

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, title, description, opportunityId, estimatedHours } = await req.json();
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
