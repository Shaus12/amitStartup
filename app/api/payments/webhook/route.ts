import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { approveTransaction } from "@/lib/payments/grow";

// Grow sends server-to-server webhooks as multipart/form-data POST.
// Configure this URL in your Grow dashboard (or via Make.com):
//   https://your-domain.com/api/payments/webhook

export async function POST(req: NextRequest) {
  try {
    // Grow sends form-data; some integrations send JSON — handle both
    let fields: Record<string, string> = {};

    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      fields = Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v ?? "")]));
    } else {
      const formData = await req.formData();
      for (const [k, v] of formData.entries()) fields[k] = String(v);
    }

    const {
      webhookKey = "",
      transactionCode = "",
      paymentSum = "",
      payerEmail = "",
      fullName = "",
      pageCode = "",
    } = fields;

    console.log("[payments/webhook]", { transactionCode, payerEmail, paymentSum, fullName });

    // Optional webhook key verification
    const expectedKey = process.env.GROW_WEBHOOK_KEY;
    if (expectedKey && webhookKey !== expectedKey) {
      console.error("[payments/webhook] Invalid webhook key");
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!transactionCode) {
      return new NextResponse("Missing transactionCode", { status: 400 });
    }

    // Step 1: Tell Grow we received the webhook
    await approveTransaction(transactionCode);

    // Step 2: Activate subscription in Supabase
    await activateSubscription({ transactionCode, payerEmail, fullName, paymentSum, pageCode });

    return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
    console.error("[payments/webhook] error:", err);
    return new NextResponse("OK", { status: 200 }); // always 200 to prevent Grow retries
  }
}

export async function activateSubscription({
  transactionCode,
  payerEmail,
  fullName,
  paymentSum,
  pageCode,
}: {
  transactionCode: string;
  payerEmail: string;
  fullName?: string;
  paymentSum?: string;
  pageCode?: string;
}) {
  const periodStart = new Date();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const update = {
    status: "active",
    grow_transaction_code: transactionCode,
    payer_name: fullName || null,
    current_period_start: periodStart.toISOString(),
    current_period_end: periodEnd.toISOString(),
  };

  // 1. Try to find existing pending subscription by email
  if (payerEmail) {
    const { data: existing } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("payer_email", payerEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("subscriptions").update(update).eq("id", existing.id);
      console.log("[activateSubscription] Updated existing subscription for", payerEmail);
      return;
    }

    // 2. No existing record — look up user by email in auth.users and create one
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const matchedUser = authUsers?.users?.find((u) => u.email === payerEmail);

    if (matchedUser) {
      const { data: business } = await supabaseAdmin
        .from("businesses")
        .select("id")
        .eq("user_id", matchedUser.id)
        .limit(1)
        .maybeSingle();

      await supabaseAdmin.from("subscriptions").insert({
        user_id: matchedUser.id,
        business_id: business?.id ?? null,
        payer_email: payerEmail,
        payer_name: fullName || null,
        plan_name: "basic",
        amount_ils: paymentSum ? Math.round(parseFloat(paymentSum)) : 1,
        ...update,
      });
      console.log("[activateSubscription] Created new subscription for", payerEmail);
      return;
    }
  }

  // 3. Fallback: try page code
  if (pageCode) {
    const { data: byPage } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("grow_page_code", pageCode)
      .limit(1)
      .maybeSingle();

    if (byPage) {
      await supabaseAdmin.from("subscriptions").update(update).eq("id", byPage.id);
      console.log("[activateSubscription] Updated subscription by pageCode");
    }
  }
}
