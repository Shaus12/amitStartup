import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ subscribed: false }, { status: 401 });
    }

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("status, current_period_end, plan_name, amount_ils")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isActive =
      sub?.status === "active" &&
      (!sub.current_period_end || new Date(sub.current_period_end) > new Date());

    return NextResponse.json({
      subscribed: isActive,
      status: sub?.status ?? "none",
      plan: sub?.plan_name ?? null,
      periodEnd: sub?.current_period_end ?? null,
    });
  } catch (err: any) {
    console.error("[payments/status] error:", err);
    return NextResponse.json({ subscribed: false }, { status: 500 });
  }
}
