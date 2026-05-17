import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionPlan = "free" | "pro" | "business";

export interface PlanLimits {
  departments: number;
  opportunities: number;
  dailyMessages: number;
  refreshDays: number;
  gifts: number;
}

const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free:     { departments: 2,        opportunities: 3,        dailyMessages: 5,   refreshDays: 30, gifts: 1  },
  pro:      { departments: 10,       opportunities: 20,       dailyMessages: 50,  refreshDays: 7,  gifts: 5  },
  business: { departments: Infinity, opportunities: Infinity, dailyMessages: 200, refreshDays: 1,  gifts: 20 },
};

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export async function getEffectivePlan(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionPlan> {
  const { data } = await supabase
    .from("users")
    .select("subscription_plan, subscription_ends_at")
    .eq("id", userId)
    .single();

  if (!data) return "free";

  const plan = (data.subscription_plan ?? "free") as SubscriptionPlan;
  if (plan === "free") return "free";

  if (data.subscription_ends_at) {
    const endsAt = new Date(data.subscription_ends_at);
    if (endsAt < new Date()) return "free";
  }

  return plan;
}
