import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type Plan = "free" | "pro" | "business";

function normalizePlan(plan: unknown): Plan {
  if (plan === "pro" || plan === "business") return plan;
  return "free";
}

function calculateSubscriptionEnd(subscriptionUpdatedAt: string | null | undefined) {
  const startedAt = subscriptionUpdatedAt ? new Date(subscriptionUpdatedAt) : new Date();
  const endsAt = Number.isNaN(startedAt.getTime()) ? new Date() : startedAt;
  endsAt.setDate(endsAt.getDate() + 30);
  return endsAt.toISOString();
}

export async function POST() {
  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userProfile, error: userProfileError } = await supabaseAdmin
      .from("users")
      .select("subscription_plan, subscription_updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (userProfileError) {
      console.error("[subscription/cancel] Failed to fetch user profile:", userProfileError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const plan = normalizePlan(userProfile?.subscription_plan);
    if (plan === "free") {
      return NextResponse.json({ error: "אין מנוי פעיל" }, { status: 400 });
    }

    const subscriptionEndsAt = calculateSubscriptionEnd(userProfile?.subscription_updated_at);

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ subscription_ends_at: subscriptionEndsAt })
      .eq("id", user.id);

    if (updateError) {
      console.error("[subscription/cancel] Failed to update subscription end date:", updateError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .eq("onboarding_completed", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (businessError) {
      console.error("[subscription/cancel] Failed to fetch business:", businessError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const { error: cancellationError } = await supabaseAdmin
      .from("cancellation_requests")
      .insert({
        user_id: user.id,
        business_id: business?.id ?? null,
        plan,
        status: "pending",
      });

    if (cancellationError) {
      console.error("[subscription/cancel] Failed to insert cancellation request:", cancellationError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ subscription_ends_at: subscriptionEndsAt });
  } catch (err) {
    console.error("[subscription/cancel] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
