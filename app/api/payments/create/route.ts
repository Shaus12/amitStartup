import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { fullName, phone, plan, amount } = await req.json();

    if (!fullName || !phone) {
      return NextResponse.json({ error: "שם מלא וטלפון הם שדות חובה" }, { status: 400 });
    }

    // Fetch business name for context
    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("name")
      .eq("user_id", user.id)
      .eq("onboarding_completed", true)
      .limit(1)
      .maybeSingle();

    // Send to Make.com and wait for response (may contain a payment redirect URL)
    const makeRes = await fetch("https://hook.eu2.make.com/j3o4pi8wr4vbga6lufprk92qrjraqi9k", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        phone,
        email: user.email ?? "",
        businessName: business?.name ?? "",
        plan: plan ?? "pro",
        amount: amount ?? 199,
      }),
    });

    // If Make.com returns a URL, pass it back so the client can redirect
    let redirectUrl: string | null = null;
    try {
      const makeData = await makeRes.json();
      if (makeData?.url) redirectUrl = makeData.url;
      else if (makeData?.redirectUrl) redirectUrl = makeData.redirectUrl;
      else if (makeData?.paymentUrl) redirectUrl = makeData.paymentUrl;
    } catch {
      // Make.com returned non-JSON — that's fine, just show success
    }

    return NextResponse.json({ ok: true, redirectUrl });
  } catch (err: any) {
    console.error("[payments/create] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
