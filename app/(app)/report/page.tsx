import { redirect } from "next/navigation";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { ReportClient } from "./ReportClient";

export default async function ReportPage() {
  // Fetch business
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("onboarding_completed", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!business) redirect("/onboarding");

  // Fetch supporting data in parallel
  const [
    { data: departments },
    { data: aiOpportunities },
    { data: session },
  ] = await Promise.all([
    supabase.from("departments").select("*").eq("business_id", business.id),
    supabase
      .from("ai_opportunities")
      .select("*, department:departments(name, color)")
      .eq("business_id", business.id)
      .order("estimated_cost_saved", { ascending: false }),
    supabase
      .from("onboarding_sessions")
      .select("answers")
      .eq("business_id", business.id)
      .limit(1)
      .single(),
  ]);

  const answers = (session?.answers as any) ?? {};

  // Reconstruct the shape that ReportClient expects, sourcing detail from JSONB
  const reportBusiness = {
    ...business,
    // Normalise field names ReportClient may use
    businessName: business.name,
    ownerName: business.owner_name,
    employeeRange: business.employee_range,
    revenueRange: business.revenue_range,
    aiComfortLevel: business.tech_comfort,
    aiBudget: business.ai_budget,
    onboardingCompleted: business.onboarding_completed,
    createdAt: business.created_at,
    // Detailed answers from JSONB snapshot
    ...answers,
    // Real relational data
    departments: (departments ?? []).map((dept) => ({
      ...dept,
      processes: (answers.processes ?? []).filter(
        (p: any) => p.departmentName?.toLowerCase() === dept.name?.toLowerCase()
      ),
      painPoints: [],
      aiOpportunities: (aiOpportunities ?? []).filter(
        (o: any) => o.department_id === dept.id
      ),
    })),
    goals: (answers.goals ?? []).map((goal: string, i: number) => ({
      id: `goal-${i}`,
      goal,
      priority: i + 1,
    })),
    bottlenecks: (answers.bottlenecks ?? []).map((type: string, i: number) => ({
      id: `bn-${i}`,
      type,
    })),
    tools: (answers.tools ?? []).map((t: any, i: number) => ({ id: `tool-${i}`, ...t })),
    aiOpportunities: aiOpportunities ?? [],
  };

  return <ReportClient business={reportBusiness as Parameters<typeof ReportClient>[0]["business"]} />;
}
