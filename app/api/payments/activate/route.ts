import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Make.com calls this endpoint after receiving a Grow webhook.
// Secure this with the MAKE_WEBHOOK_SECRET env variable.
//
// Make.com scenario setup:
//   Trigger: Custom Webhook (from Grow)
//   Step 1: HTTP module → POST https://your-domain.com/api/payments/activate
//   Headers: { "x-make-secret": "{{MAKE_WEBHOOK_SECRET}}" }
//   Body (JSON): { "email": "{{payerEmail}}", "transactionCode": "{{transactionCode}}", "amount": "{{paymentSum}}" }

export async function POST(req: NextRequest) {
  // Verify secret
  const secret = req.headers.get("x-make-secret");
  const expectedSecret = process.env.MAKE_WEBHOOK_SECRET;
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, transactionCode, userId } = await req.json();

    if (!email && !userId) {
      return NextResponse.json({ error: "email or userId required" }, { status: 400 });
    }

    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Find subscription by email or userId
    const { data: sub, error } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq(userId ? "user_id" : "payer_email", userId ?? email)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (sub) {
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "active",
          grow_transaction_code: transactionCode ?? null,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq("id", sub.id);
    }

    console.log(`[payments/activate] Activated subscription for ${email ?? userId}`);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[payments/activate] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
