import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionPlan = "free" | "trial" | "pro" | "business";

export interface SubscriptionUser {
  subscription_plan?: string | null;
  subscription_ends_at?: string | null;
  trial_ends_at?: string | null;
}

export interface PlanLimits {
  departments: number;
  opportunities: number;
  dailyMessages: number;
  refreshDays: number;
  gifts: number;
}

const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free:     { departments: 2,        opportunities: 3,        dailyMessages: 5,   refreshDays: 30, gifts: 1  },
  trial:    { departments: 10,       opportunities: 20,       dailyMessages: 50,  refreshDays: 7,  gifts: 5  },
  pro:      { departments: 10,       opportunities: 20,       dailyMessages: 50,  refreshDays: 7,  gifts: 5  },
  business: { departments: Infinity, opportunities: Infinity, dailyMessages: 200, refreshDays: 1,  gifts: 20 },
};

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

function resolveEffectivePlan(user: SubscriptionUser | null | undefined): SubscriptionPlan {
  if (!user) return "free";

  const now = new Date();
  const plan = (user.subscription_plan ?? "free") as SubscriptionPlan;
  const hasActiveSubscription =
    (plan === "pro" || plan === "business") &&
    (!user.subscription_ends_at || new Date(user.subscription_ends_at) > now);

  if (hasActiveSubscription) return plan;

  if (user.trial_ends_at && new Date(user.trial_ends_at) > now) {
    return "trial";
  }

  return "free";
}

export function getEffectivePlan(user: SubscriptionUser | null | undefined): SubscriptionPlan;
export function getEffectivePlan(supabase: SupabaseClient, userId: string): Promise<SubscriptionPlan>;
export function getEffectivePlan(
  userOrSupabase: SubscriptionUser | SupabaseClient | null | undefined,
  userId?: string
): SubscriptionPlan | Promise<SubscriptionPlan> {
  if (!userId) {
    return resolveEffectivePlan(userOrSupabase as SubscriptionUser | null | undefined);
  }

  const supabase = userOrSupabase as SupabaseClient;
  return Promise.resolve(supabase
    .from("users")
    .select("subscription_plan, subscription_ends_at, trial_ends_at")
    .eq("id", userId)
    .single())
    .then(({ data }) => resolveEffectivePlan(data));
}
