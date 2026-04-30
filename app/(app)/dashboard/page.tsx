import { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
    redirect("/onboarding");
  }

  // Subscription gate — redirect to /subscribe if no active subscription
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isSubscribed =
    sub?.status === "active" &&
    (!sub.current_period_end || new Date(sub.current_period_end) > new Date());

  if (!isSubscribed) {
    redirect("/subscribe");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh]" style={{ backgroundColor: "#111319" }} aria-hidden />
      }
    >
      <DashboardClient businessId={business.id} businessName={business.name} />
    </Suspense>
  );
}
