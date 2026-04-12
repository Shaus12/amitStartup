import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OpportunitiesClient } from "./OpportunitiesClient";

export default async function OpportunitiesPage() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  let businessQuery = supabase
    .from("businesses")
    .select("id, name")
    .eq("onboarding_completed", true)
    .order("created_at", { ascending: false })
    .limit(1);

  if (user) {
    businessQuery = businessQuery.eq("user_id", user.id);
  } else {
    businessQuery = businessQuery.is("user_id", null);
  }

  const { data: business } = await businessQuery.single();

  if (!business) redirect("/onboarding");
  return <OpportunitiesClient businessId={business.id} businessName={business.name} />;
}
