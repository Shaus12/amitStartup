import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SopsClient } from "./SopsClient";

export default async function SopsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("onboarding_completed", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!business) redirect("/onboarding");

  // Fetch departments with processes
  const { data: departments } = await supabaseAdmin
    .from("departments")
    .select(`
      id, name, color, headcount,
      processes (id, name, is_manual, frequency, time_spent_hrs_per_week)
    `)
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  return (
    <SopsClient
      businessId={business.id}
      businessName={business.name}
      departments={departments ?? []}
    />
  );
}
