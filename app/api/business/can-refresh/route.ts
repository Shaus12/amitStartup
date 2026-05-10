import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";
import { getEffectivePlan, getPlanLimits } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  const businessId = new URL(req.url).searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const owned = await verifyBusinessAccess(supabase, businessId, user);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const plan = await getEffectivePlan(supabase, user!.id);
  const limits = getPlanLimits(plan);
  const COOLDOWN_MS = limits.refreshDays * 24 * 60 * 60 * 1000;

  const { data: latest, error } = await supabase
    .from("ai_analyses")
    .select("created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[can-refresh]", error);
    return NextResponse.json({ error: "Failed to check refresh eligibility" }, { status: 500 });
  }

  // No analysis yet → allow refresh (e.g. first run / edge case)
  if (!latest?.created_at) {
    return NextResponse.json({ canRefresh: true });
  }

  const created = new Date(latest.created_at).getTime();
  if (Number.isNaN(created)) {
    return NextResponse.json({ canRefresh: true });
  }

  const now = Date.now();
  if (now - created < COOLDOWN_MS) {
    const nextRefreshAt = new Date(created + COOLDOWN_MS).toISOString();
    return NextResponse.json({ canRefresh: false, nextRefreshAt });
  }

  return NextResponse.json({ canRefresh: true });
}
