import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

// PATCH /api/opportunities/roadmap  { id, status }
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !["backlog", "in_progress", "done"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { data: updated, error } = await supabase
      .from("ai_opportunities")
      .update({ roadmap_status: status })
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

  const { data: opportunities, error } = await supabase
    .from("ai_opportunities")
    .select("*, department:departments(name, color)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }

  return NextResponse.json(opportunities || []);
}
