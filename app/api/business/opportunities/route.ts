import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    const { data: opportunities, error } = await supabase
      .from("ai_opportunities")
      .select("*, department:departments(name, color)")
      .eq("business_id", businessId)
      .order("estimated_hours_saved", { ascending: false });

    if (error) throw error;

    return NextResponse.json(opportunities || []);
  } catch (err: any) {
    console.error("Opportunities route error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, roadmapStatus } = await req.json();

    const { data: opp, error } = await supabase
      .from("ai_opportunities")
      .update({ roadmap_status: roadmapStatus })
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
