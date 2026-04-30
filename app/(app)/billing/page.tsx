import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { BillingClient } from "./BillingClient";

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

  // Subscription
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("status, plan_name, amount_ils, current_period_start, current_period_end, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Usage: total tokens + cost per call_type (last 30 days)
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: usageRows } = await supabaseAdmin
    .from("api_usage_logs")
    .select("call_type, input_tokens, output_tokens, estimated_cost_usd, created_at")
    .eq("business_id", business.id)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  return (
    <BillingClient
      sub={sub}
      usageRows={usageRows ?? []}
      userEmail={user.email ?? ""}
    />
  );
}
