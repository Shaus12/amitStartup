import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { OpportunitiesClient } from "./OpportunitiesClient";

export default async function OpportunitiesPage() {
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("onboarding_completed", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!business) redirect("/onboarding");
  return <OpportunitiesClient businessId={business.id} businessName={business.name} />;
}
