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

    const makeWebhookUrl = process.env.MAKE_PAYMENT_WEBHOOK_URL;
    if (!makeWebhookUrl) {
      console.error("[payments/create] Missing MAKE_PAYMENT_WEBHOOK_URL");
      return NextResponse.json({ error: "Payment provider not configured" }, { status: 500 });
    }

    // Send to Make.com and wait for response (may contain a payment redirect URL)
    const makeRes = await fetch(makeWebhookUrl, {
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

    // Extract payment URL from Make.com response — handles JSON, plain text, or URL in any field
    let redirectUrl: string | null = null;
    try {
      const rawText = await makeRes.text();
      console.log("[payments/create] Make.com raw response:", rawText);

      // Try to extract a URL directly from the raw text (covers plain-text and JSON responses)
      const urlMatch = rawText.match(/https?:\/\/[^\s"'}\]]+/);
      if (urlMatch) {
        redirectUrl = urlMatch[0].replace(/[.,;]+$/, ""); // strip trailing punctuation
      } else {
        // Try parsing JSON and checking common field names
        try {
          const makeData = JSON.parse(rawText);
          redirectUrl =
            makeData?.url ??
            makeData?.redirectUrl ??
            makeData?.paymentUrl ??
            makeData?.link ??
            makeData?.payment_link ??
            null;
        } catch {
          // not JSON either — no redirect
        }
      }
    } catch {
      // response read failed — continue without redirect
    }

    return NextResponse.json({ ok: true, redirectUrl });
  } catch (err: any) {
    console.error("[payments/create] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
