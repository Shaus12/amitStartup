import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRoute =
  | "/checkout"
  | "/onboarding-chat"
  | "/dashboard"
  | "/analysis-latest"
  | "/subscription-expired";

type UserRoutingProfile = {
  analysis_paid: boolean | null;
  onboarding_completed: boolean | null;
  trial_ends_at: string | null;
  subscription_plan: string | null;
  subscription_ends_at: string | null;
};

export async function getUserRoute(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRoute> {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(
        `
        analysis_paid,
        onboarding_completed,
        trial_ends_at,
        subscription_plan,
        subscription_ends_at
      `
      )
      .eq("id", userId)
      .maybeSingle<UserRoutingProfile>();

    if (error || !user) return "/checkout";

    if (!user.analysis_paid) return "/checkout";

    if (!user.onboarding_completed) return "/onboarding-chat";

    const now = new Date();
    const trialActive = Boolean(
      user.trial_ends_at && new Date(user.trial_ends_at) > now
    );

    const subActive =
      (user.subscription_plan === "pro" ||
        user.subscription_plan === "business") &&
      (!user.subscription_ends_at || new Date(user.subscription_ends_at) > now);

    if (trialActive || subActive) return "/dashboard";

    if (!user.trial_ends_at && !user.subscription_plan) return "/analysis-latest";

    return "/subscription-expired";
  } catch (err) {
    console.error("[user-routing] failed to resolve route:", err);
    return "/checkout";
  }
}
