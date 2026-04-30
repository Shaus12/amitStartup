import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { approveTransaction } from "@/lib/payments/grow";

// Grow sends webhooks as multipart/form-data POST requests.
// Enable webhook in your Grow dashboard and point it to:
//   https://your-domain.com/api/payments/webhook
// Contact apisupport@grow.business to enable webhooks for your account.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const webhookKey = formData.get("webhookKey")?.toString() ?? "";
    const transactionCode = formData.get("transactionCode")?.toString() ?? "";
    const paymentSum = formData.get("paymentSum")?.toString() ?? "";
    const payerEmail = formData.get("payerEmail")?.toString() ?? "";
    const payerPhone = formData.get("payerPhone")?.toString() ?? "";
    const fullName = formData.get("fullName")?.toString() ?? "";
    const pageCode = formData.get("pageCode")?.toString() ?? "";

    // Verify webhook key matches what Grow sent you
    const expectedKey = process.env.GROW_WEBHOOK_KEY;
    if (expectedKey && webhookKey !== expectedKey) {
      console.error("[payments/webhook] Invalid webhook key");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!transactionCode) {
      return NextResponse.json({ error: "Missing transactionCode" }, { status: 400 });
    }

    console.log(`[payments/webhook] Received: transactionCode=${transactionCode} email=${payerEmail} sum=${paymentSum}`);

    // Step 1: Call approveTransaction to confirm we received the webhook
    await approveTransaction(transactionCode);

    // Step 2: Activate or renew the subscription
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Find subscription by email or page code
    let query = supabaseAdmin
      .from("subscriptions")
      .select("id, user_id")
      .eq("status", "inactive");

    if (payerEmail) {
      query = query.eq("payer_email", payerEmail);
    } else if (pageCode) {
      query = query.eq("grow_page_code", pageCode);
    }

    const { data: sub } = await query.limit(1).maybeSingle();

    if (sub) {
      // Activate existing pending subscription
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "active",
          grow_transaction_code: transactionCode,
          payer_email: payerEmail || sub.user_id,
          payer_name: fullName || null,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq("id", sub.id);
    } else if (payerEmail) {
      // Recurring payment (2nd+ month) — renew period
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "active",
          grow_transaction_code: transactionCode,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq("payer_email", payerEmail);
    }

    console.log(`[payments/webhook] Subscription activated for ${payerEmail}`);

    // Respond with 200 OK — required by Grow
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[payments/webhook] error:", err);
    // Still return 200 to avoid Grow retrying indefinitely
    return NextResponse.json({ ok: true });
  }
}
