import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { RoadmapClient } from "./RoadmapClient";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("onboarding_completed", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!business) redirect("/onboarding");
  return <RoadmapClient businessId={business.id} businessName={business.name} />;
}
