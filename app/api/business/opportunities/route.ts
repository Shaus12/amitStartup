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
      .neq("archived", true)
      .order("estimated_hours_saved", { ascending: false });

    if (error) throw error;

    const mapped = (opportunities || []).map((o) => ({
      ...o,
      businessId: o.business_id,
      departmentId: o.department_id,
      analysisId: o.analysis_id,
      impactType: o.impact_type,
      estimatedHoursSaved: o.estimated_hours_saved,
      estimatedCostSaved: o.estimated_cost_saved,
      
      // Alias to new 'status' column for backwards UI compatibility
      roadmapStatus: o.status,
      isQuickWin: o.is_quick_win ?? false,
      notificationHook: o.notification_hook ?? null,
      proofOfValue: o.proof_of_value ?? null,
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
    const { id, roadmapStatus, status: newStatus } = await req.json();

    const finalStatus = newStatus || roadmapStatus;

    const updates: any = {};
    if (finalStatus !== undefined) updates.status = finalStatus;

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
