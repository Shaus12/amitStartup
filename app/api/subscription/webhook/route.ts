import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type Plan = "pro" | "business";
type PaymentStatus = "paid" | "failed";

function isPlan(value: unknown): value is Plan {
  return value === "pro" || value === "business";
}

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return value === "paid" || value === "failed";
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret === "") {
      console.error("[subscription/webhook] Missing WEBHOOK_SECRET");
      return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });
    }

    if (req.headers.get("x-webhook-secret") !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    const { user_id, plan, status, transaction_id } = body as {
      user_id?: unknown;
      plan?: unknown;
      status?: unknown;
      transaction_id?: unknown;
    };

    if (
      typeof user_id !== "string" ||
      !user_id ||
      !isPlan(plan) ||
      !isPaymentStatus(status) ||
      typeof transaction_id !== "string" ||
      !transaction_id
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (status === "paid") {
      const { error } = await supabaseAdmin
        .from("users")
        .update({
          subscription_plan: plan,
          subscription_updated_at: new Date().toISOString(),
        })
        .eq("id", user_id);

      if (error) {
        console.error("[subscription/webhook] Failed to update user subscription:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscription/webhook] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
