import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeBusinessData } from "@/lib/ai/analyzeBusinessData";

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    // Fetch full business context
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        departments: true,
        processes: true,
        tools: true,
        painPoints: true,
        goals: true,
        manualTasks: true,
        bottlenecks: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const context = {
      business: {
        name: business.name,
        industry: business.industry,
        businessType: business.businessType,
        employeeRange: business.employeeRange,
        revenueRange: business.revenueRange,
        targetCustomer: business.targetCustomer,
        businessAge: business.businessAge,
        growthTrajectory: business.growthTrajectory,
        softwareSpend: business.softwareSpend,
        aiComfortLevel: business.aiComfortLevel,
        aiBudget: business.aiBudget,
        topPriority90Days: business.topPriority90Days,
      },
      departments: business.departments.map((d) => ({
        name: d.name,
        headcount: d.headcount,
      })),
      processes: business.processes.map((p) => ({
        name: p.name,
        department: business.departments.find((d) => d.id === p.departmentId)?.name,
        frequency: p.frequency,
        isManual: p.isManual,
        hoursPerWeek: p.timeSpentHrsPerWeek,
        peopleInvolved: p.peopleInvolved,
      })),
      tools: business.tools.map((t) => ({
        name: t.name,
        category: t.category,
        isManualProcess: t.isManualProcess,
        monthlyCost: t.monthlyCost,
      })),
      painPoints: business.painPoints.map((p) => p.description),
      manualTasks: business.manualTasks.map((m) => m.task),
      bottlenecks: business.bottlenecks.map((b) => b.type),
      goals: business.goals.map((g) => g.goal),
      customerInfo: {
        primaryContact: business.primaryContact,
        inquiryVolume: business.inquiryVolume,
        avgResponseTime: business.avgResponseTime,
        meetingHoursPerWeek: business.meetingHoursPerWeek,
        reportingFrequency: business.reportingFrequency,
        hasDocumentedSOPs: business.hasDocumentedSOPs,
      },
    };

    const result = await analyzeBusinessData(context);

    // Build department name → id map
    const deptMap = new Map(
      business.departments.map((d) => [d.name.toLowerCase(), d.id])
    );

    // Delete old non-pinned opportunities
    await prisma.aiOpportunity.deleteMany({
      where: { businessId, pinned: false, dismissedAt: null },
    });

    // Insert new opportunities
    await prisma.aiOpportunity.createMany({
      data: result.opportunities.map((opp) => ({
        businessId,
        departmentId: opp.departmentName
          ? (deptMap.get(opp.departmentName.toLowerCase()) ?? null)
          : null,
        title: opp.title,
        description: opp.description,
        impactType: opp.impactType,
        estimatedHoursSaved: opp.estimatedHoursSaved,
        estimatedCostSaved: opp.estimatedCostSaved,
        implementationEffort: opp.implementationEffort,
        category: opp.category,
        agentName: opp.agentName,
        agentDescription: opp.agentDescription,
        agentTools: opp.agentTools,
        setupComplexity: opp.setupComplexity,
        source: process.env.ANTHROPIC_API_KEY ? "claude" : "stub",
      })),
    });

    return NextResponse.json({
      count: result.opportunities.length,
      summary: result.summary,
    });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
