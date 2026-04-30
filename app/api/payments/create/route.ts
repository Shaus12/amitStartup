import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch their onboarding answers to get name + phone
    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("name, owner_name")
      .eq("user_id", user.id)
      .eq("onboarding_completed", true)
      .limit(1)
      .maybeSingle();

    const { data: session } = await supabaseAdmin
      .from("onboarding_sessions")
      .select("answers")
      .eq("business_id", business?.id ?? "")
      .limit(1)
      .maybeSingle();

    const answers = session?.answers as any;

    await fetch("https://hook.eu2.make.com/j3o4pi8wr4vbga6lufprk92qrjraqi9k", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: answers?.ownerName ?? business?.owner_name ?? "",
        phone: answers?.phone ?? "",
        email: user.email ?? "",
        businessName: business?.name ?? "",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[payments/create] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
