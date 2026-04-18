import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SopsClient } from "./SopsClient";

export default async function SopsPage() {
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

  // Fetch departments
  const { data: departments } = await supabaseAdmin
    .from("departments")
    .select("id, name, color, headcount")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  // Fetch processes from business_knowledge (same source the business map uses)
  const { data: knowledgeRows } = await supabaseAdmin
    .from("business_knowledge")
    .select("id, department_id, content, metadata, category")
    .eq("business_id", business.id)
    .eq("category", "process");

  // Attach processes to departments
  const departmentsWithProcesses = (departments ?? []).map((dept) => {
    const deptProcesses = (knowledgeRows ?? [])
      .filter((r) => r.department_id === dept.id)
      .map((r) => ({
        id: r.id,
        name: r.metadata?.originalName || r.content,
        is_manual: r.metadata?.isManual ?? false,
        frequency: r.metadata?.frequency ?? null,
        time_spent_hrs_per_week: r.metadata?.hoursPerWeek ?? null,
      }));

    return {
      ...dept,
      processes: deptProcesses,
    };
  });

  return (
    <SopsClient
      businessId={business.id}
      businessName={business.name}
      departments={departmentsWithProcesses}
    />
  );
}
