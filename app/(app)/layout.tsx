import { AppShell } from "@/components/layout/AppShell";
import { FloatingAgent } from "@/components/dashboard/FloatingAgent";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/subscription";
import Link from "next/link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const business = !user
    ? null
    : await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("onboarding_completed", true)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data);

  // If there is no completed business the page component (e.g. dashboard) will
  // redirect to /onboarding-chat.  Rendering the full sidebar shell before that
  // redirect resolves causes a visible flash of the app chrome.  Return only
  // the bare children wrapper so the redirect fires cleanly with no visible UI.
  if (!business) {
    return <>{children}</>;
  }

  const userProfile = !user
    ? null
    : await supabaseAdmin
      .from("users")
      .select("subscription_plan, subscription_ends_at, trial_ends_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => data);

  const effectivePlan = getEffectivePlan(userProfile);
  const trialEndsAt = userProfile?.trial_ends_at ? new Date(userProfile.trial_ends_at) : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppShell>
        {effectivePlan === "trial" && trialDaysLeft > 0 && (
          <div className="shrink-0 border-b border-amber-300/20 bg-amber-400/10 px-4 py-2 text-center text-sm font-medium text-amber-100">
            <span>⏳ נשארו לך {trialDaysLeft} ימים בניסיון החינמי · </span>
            <Link href="/billing" className="font-bold text-amber-200 underline underline-offset-4 hover:text-amber-100">
              שדרג
            </Link>
          </div>
        )}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
      </AppShell>
      {business && <FloatingAgent businessId={business.id} />}
      {business && <FeedbackWidget businessId={business.id} />}
    </div>
  );
}
