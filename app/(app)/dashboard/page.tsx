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

  // Fetch the most recent completed business using the admin client (bypasses RLS)
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, name, user_id")
    .eq("onboarding_completed", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

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
