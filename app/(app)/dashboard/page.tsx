import { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import { getEffectivePlan } from "@/lib/subscription";
import { getUserRoute } from "@/lib/user-routing";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ trial_error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userProfile } = await supabaseAdmin
    .from("users")
    .select("subscription_plan, subscription_ends_at, trial_ends_at")
    .eq("id", user.id)
    .maybeSingle();

  const effectivePlan = getEffectivePlan(userProfile);
  const hasPaidSubscription = effectivePlan === "pro" || effectivePlan === "business";

  // ── trial_error recovery ─────────────────────────────────────────────────────
  // When the client couldn't activate the trial (passed ?trial_error=1), try
  // once server-side before deciding whether to redirect to /checkout.
  const { trial_error: trialErrorParam } = await searchParams;
  const hasTrialError = trialErrorParam === "1";
  let showTrialErrorBanner = false;

  if (hasTrialError && !hasPaidSubscription && !userProfile?.trial_ends_at) {
    // Attempt server-side trial activation
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const { error: activationError } = await supabaseAdmin
      .from("users")
      .update({ trial_ends_at: trialEndsAt.toISOString() })
      .eq("id", user.id);

    if (activationError) {
      console.error("[dashboard] server-side trial activation failed:", activationError);
      // Activation failed — allow access but show the support banner
      showTrialErrorBanner = true;
    } else {
      // Activation succeeded — refresh the profile so the checks below pass
      userProfile && (userProfile.trial_ends_at = trialEndsAt.toISOString());
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  const route = await getUserRoute(supabaseAdmin, user.id);
  if (route !== "/dashboard" && !showTrialErrorBanner) {
    redirect(route);
  }

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, name, user_id")
    .eq("onboarding_completed", true)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding-chat");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh]" style={{ backgroundColor: "var(--bv-bg)" }} aria-hidden />
      }
    >
      <DashboardClient
        businessId={business.id}
        businessName={business.name}
        showTrialErrorBanner={showTrialErrorBanner}
      />
    </Suspense>
  );
}
