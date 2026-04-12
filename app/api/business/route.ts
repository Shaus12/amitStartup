import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    let query = supabase
      .from("businesses")
      .select("*")
      .eq("onboarding_completed", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.is("user_id", null);
    }

    const { data: business, error } = await query.single();

    if (error) throw error;

    return NextResponse.json(business);
  } catch (err: any) {
    console.error("Business route error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
