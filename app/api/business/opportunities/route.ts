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
    const { data: opportunities, error } = await supabase
      .from("ai_opportunities")
      .select("*, department:departments(name, color)")
      .eq("business_id", businessId)
      .order("estimated_hours_saved", { ascending: false });

    if (error) throw error;

    const mapped = (opportunities || []).map((o) => ({
      ...o,
      businessId: o.business_id,
      departmentId: o.department_id,
      impactType: o.impact_type,
      estimatedHoursSaved: o.estimated_hours_saved,
      estimatedCostSaved: o.estimated_cost_saved,
      agentName: o.agent_name,
      agentDescription: o.agent_description,
      agentTools: o.agent_tools,
      setupComplexity: o.setup_complexity,
      implementationEffort: o.implementation_effort,
      category: o.category || (o.agent_name ? "ai_agent" : "automation"),
      dismissedAt: o.dismissed_at,
      generatedAt: o.generated_at,
      roadmapStatus: o.roadmap_status,
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
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
    const { id, roadmapStatus, pinned, dismissedAt } = await req.json();

    const updates: any = {};
    if (roadmapStatus !== undefined) updates.roadmap_status = roadmapStatus;
    if (pinned !== undefined) updates.pinned = pinned;
    if (dismissedAt !== undefined) updates.dismissed_at = dismissedAt;

    // Fetch the opportunity to get its business_id for ownership check
    const { data: existing } = await supabase
      .from("ai_opportunities")
      .select("id, business_id")
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

    return NextResponse.json(opp);
  } catch (err: any) {
    console.error("Opportunities patch error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
