import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("trial_ends_at")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("[trial/activate] fetch error:", fetchError);
    return NextResponse.json({ error: "Failed to activate trial" }, { status: 500 });
  }

  if (profile?.trial_ends_at) {
    return NextResponse.json({ success: true, trial_ends_at: profile.trial_ends_at });
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({ trial_ends_at: trialEndsAt.toISOString() })
    .eq("id", user.id);

  if (updateError) {
    console.error("[trial/activate] update error:", updateError);
    return NextResponse.json({ error: "Failed to activate trial" }, { status: 500 });
  }

  return NextResponse.json({ success: true, trial_ends_at: trialEndsAt.toISOString() });
}
