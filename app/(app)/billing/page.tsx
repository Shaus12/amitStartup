import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { BillingClient } from "./BillingClient";

type Plan = "free" | "pro" | "business";

function normalizePlan(plan: unknown): Plan {
  if (plan === "pro" || plan === "business") return plan;
  return "free";
}

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("onboarding_completed", true)
    .limit(1)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  const { data: userProfile } = await supabaseAdmin
    .from("users")
    .select("subscription_plan")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <BillingClient
      currentPlan={normalizePlan(userProfile?.subscription_plan)}
      userEmail={user.email ?? ""}
    />
  );
}
