import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  // Check if there's an authenticated session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the business that belongs to this user (or the most recent unclaimed one for anonymous sessions)
  let businessQuery = supabaseAdmin
    .from("businesses")
    .select("id, name, user_id")
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

  // Show the "Save your map" modal if no auth session exists yet
  // (user just completed onboarding and hasn't created an account)
  const showSaveModal = !user;

  return (
    <DashboardClient
      businessId={business.id}
      businessName={business.name}
      showSaveModal={showSaveModal}
    />
  );
}
