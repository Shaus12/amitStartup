import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data: business, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("onboarding_completed", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return NextResponse.json(business);
  } catch (err: any) {
    console.error("Business route error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
