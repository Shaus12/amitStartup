import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

// PATCH /api/opportunities/roadmap  { id, status }
export async function PATCH(req: NextRequest) {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  try {
    const { id, status } = await req.json();
    if (!id || !["suggested", "in_progress", "done"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Fetch the opportunity to get its business_id for ownership check
    const { data: existing } = await supabase
      .from("ai_opportunities")
      .select("id, business_id")
      .eq("id", id)
      .single();

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const owned = await verifyBusinessAccess(supabase, existing.business_id, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: updated, error } = await supabase
      .from("ai_opportunities")
      .update({ status: status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// GET /api/opportunities/roadmap?businessId=xxx
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const owned = await verifyBusinessAccess(supabase, businessId, user);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: opportunities, error } = await supabase
    .from("ai_opportunities")
    .select("*, department:departments(name, color)")
    .eq("business_id", businessId)
    .neq("archived", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
  
  // adding roadmapStatus for UI backwards compat
  const mapped = (opportunities || []).map(o => ({
    ...o,
    roadmapStatus: o.status
  }));

  return NextResponse.json(mapped);
}
