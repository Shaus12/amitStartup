import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createPaymentProcess } from "@/lib/payments/grow";
import { checkRateLimit } from "@/lib/rate-limit";

const PLAN_AMOUNT_ILS = 29;

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(req, `payments-create:${user.id}`, 5, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Get user's business
    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("onboarding_completed", true)
      .limit(1)
      .maybeSingle();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { paymentUrl, pageCode } = await createPaymentProcess({
      sum: PLAN_AMOUNT_ILS,
      description: `מנוי חודשי - BizMap`,
      email: user.email,
      fullName: user.user_metadata?.full_name ?? undefined,
      successUrl: `${appUrl}/subscribe/success`,
      errorUrl: `${appUrl}/subscribe/error`,
      cancelUrl: `${appUrl}/subscribe`,
    });

    // Create a pending subscription record
    await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: user.id,
        business_id: business?.id ?? null,
        status: "inactive",
        plan_name: "basic",
        amount_ils: PLAN_AMOUNT_ILS,
        grow_page_code: pageCode,
        payer_email: user.email,
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ paymentUrl });
  } catch (err: any) {
    console.error("[payments/create] error:", err);
    return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 500 });
  }
}
