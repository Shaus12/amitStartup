import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BrainClient } from "./BrainClient";

export default async function BrainPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const { data: departments } = await supabaseAdmin
    .from("departments")
    .select("id, name, color")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  return (
    <BrainClient
      businessId={business.id}
      businessName={business.name}
      departments={departments ?? []}
    />
  );
}
