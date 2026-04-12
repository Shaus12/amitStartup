import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { analyzeBusinessData } from "@/lib/ai/analyzeBusinessData";

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    // Fetch business, departments, and the full onboarding snapshot
    const [
      { data: business, error: bizError },
      { data: departments },
      { data: session },
    ] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase.from("departments").select("*").eq("business_id", businessId),
      supabase
        .from("onboarding_sessions")
        .select("answers")
        .eq("business_id", businessId)
        .limit(1)
        .single(),
    ]);

    if (bizError || !business) {
      throw bizError || new Error("Business not found");
    }

    const depts = departments ?? [];
    // Pull rich context from JSONB snapshot (processes, tools, pain points, etc.)
    const answers = (session?.answers as any) ?? {};

    const context = {
      business: {
        name: business.name,
        industry: business.industry,
        employeeRange: business.employee_range,
        revenueRange: business.revenue_range,
        aiComfortLevel: business.tech_comfort,
        aiBudget: business.ai_budget,
        topPriority90Days: answers.topPriority90Days,
        growthTrajectory: answers.growthTrajectory,
        softwareSpend: answers.softwareSpend,
        businessType: answers.businessType,
        targetCustomer: answers.targetCustomer,
      },
      departments: depts.map((d: any) => ({ name: d.name, headcount: d.headcount })),
      processes: answers.processes ?? [],
      tools: answers.tools ?? [],
      painPoints: [
        answers.painPoint1,
        answers.painPoint2,
        answers.painPoint3,
        answers.biggestHeadache,
      ].filter(Boolean),
      manualTasks: answers.manualTasks ?? [],
      bottlenecks: answers.bottlenecks ?? [],
      goals: answers.goals ?? [],
      customerInfo: {
        primaryContact: answers.primaryContact,
        inquiryVolume: answers.inquiryVolume,
        avgResponseTime: answers.avgResponseTime,
        meetingHoursPerWeek: answers.meetingHoursPerWeek,
        reportingFrequency: answers.reportingFrequency,
        hasDocumentedSOPs: answers.hasDocumentedSOPs,
      },
    };

    const result = await analyzeBusinessData(context);

    // Build department name → id map
    const deptMap = new Map(depts.map((d: any) => [d.name.toLowerCase(), d.id]));

    // Delete all previous opportunities for this business before regenerating
    await supabase.from("ai_opportunities").delete().eq("business_id", businessId);

    // Insert new opportunities using only columns that exist in ai_opportunities
    if (result.opportunities && result.opportunities.length > 0) {
      const oppsToInsert = result.opportunities.map((opp) => ({
        business_id: businessId,
        department_id: opp.departmentName
          ? (deptMap.get(opp.departmentName.toLowerCase()) ?? null)
          : null,
        title: opp.title,
        description: opp.description,
        impact_type: opp.impactType,
        estimated_hours_saved: opp.estimatedHoursSaved,
        estimated_cost_saved: opp.estimatedCostSaved,
        agent_name: opp.agentName,
        agent_description: opp.agentDescription,
        agent_tools: opp.agentTools,
        setup_complexity: opp.setupComplexity,
        implementation_effort: opp.implementationEffort,
        category: opp.category,
        roadmap_status: "backlog",
        source: process.env.ANTHROPIC_API_KEY ? "claude" : "stub",
      }));

      const { error: insertError } = await supabase
        .from("ai_opportunities")
        .insert(oppsToInsert);

      if (insertError) console.error("Failed to insert opportunities:", insertError);
    }

    return NextResponse.json({
      count: result.opportunities.length,
      summary: result.summary,
    });
  } catch (err: any) {
    console.error("Analysis error details:", err);
    return NextResponse.json({ 
      error: "Analysis failed", 
      details: err.message ?? String(err) 
    }, { status: 500 });
  }
}
