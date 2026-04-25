import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TasksClient } from "./TasksClient";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, name, user_id")
    .eq("onboarding_completed", true)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  // Fetch user_points for XP header
  let userPoints = { total_points: 0, level: 1 };
  const { data: pts } = await supabaseAdmin
    .from("user_points")
    .select("total_points, level")
    .eq("user_id", user.id)
    .eq("business_id", business.id)
    .maybeSingle();
  if (pts) userPoints = pts;

  return (
    <TasksClient
      businessId={business.id}
      initialXp={userPoints.total_points}
      initialLevel={userPoints.level}
    />
  );
}
