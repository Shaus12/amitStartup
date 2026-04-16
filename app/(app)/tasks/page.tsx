import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TasksClient } from "./TasksClient";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch business belonging to this user
  let businessQuery = supabaseAdmin
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

  // Fetch user_points for XP header
  let userPoints = { total_points: 0, level: 1 };
  if (user) {
    const { data: pts } = await supabaseAdmin
      .from("user_points")
      .select("total_points, level")
      .eq("user_id", user.id)
      .eq("business_id", business.id)
      .single();
    if (pts) userPoints = pts;
  }

  return (
    <TasksClient
      businessId={business.id}
      initialXp={userPoints.total_points}
      initialLevel={userPoints.level}
    />
  );
}
