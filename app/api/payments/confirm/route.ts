import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { approveTransaction } from "@/lib/payments/grow";
import { activateSubscription } from "../webhook/route";

export const dynamic = "force-dynamic";

// Called by the thank-you page after Grow redirects the user back.
// Grow appends query params to the success URL: ?transactionCode=xxx&payerEmail=xxx&sum=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionCode = searchParams.get("transactionCode") ?? searchParams.get("transaction_code") ?? "";
    const payerEmail = searchParams.get("payerEmail") ?? searchParams.get("email") ?? "";
    const paymentSum = searchParams.get("sum") ?? searchParams.get("paymentSum") ?? "";
    const fullName = searchParams.get("fullName") ?? searchParams.get("full_name") ?? "";

    // Also check the logged-in user's email as a fallback
    let resolvedEmail = payerEmail;
    if (!resolvedEmail) {
      const authClient = await createClient();
      const { data: { user } } = await authClient.auth.getUser();
      resolvedEmail = user?.email ?? "";
    }

    if (transactionCode) {
      await approveTransaction(transactionCode);
      await activateSubscription({
        transactionCode,
        payerEmail: resolvedEmail,
        fullName,
        paymentSum,
      });
    } else if (resolvedEmail) {
      // No transaction code — just try to activate by email (may already be done by S2S webhook)
      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("id, status")
        .eq("payer_email", resolvedEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub && sub.status !== "active") {
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "active", current_period_start: new Date().toISOString(), current_period_end: periodEnd.toISOString() })
          .eq("id", sub.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[payments/confirm] error:", err);
    return NextResponse.json({ ok: true }); // don't break the thank-you page
  }
}
