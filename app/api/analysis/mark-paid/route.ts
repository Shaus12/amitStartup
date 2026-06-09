import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({ analysis_paid: true })
    .eq("id", user.id);

  if (error) {
    console.error("[analysis/mark-paid] update error:", error);
    return NextResponse.json({ error: "Failed to mark analysis paid" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
