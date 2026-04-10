import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OnboardingAnswers } from "@/lib/types/onboarding";

export async function POST(req: NextRequest) {
  try {
    const answers: OnboardingAnswers = await req.json();

    // Create business + all related records in a transaction
    const business = await prisma.$transaction(async (tx) => {
      const biz = await tx.business.create({
        data: {
          name: answers.businessName,
          ownerName: answers.ownerName,
          tagline: answers.tagline,
          industry: answers.industry,
          businessType: answers.businessType,
          employeeRange: answers.employeeRange,
          revenueRange: answers.revenueRange,
          targetCustomer: answers.targetCustomer,
          businessAge: answers.businessAge,
          growthTrajectory: answers.growthTrajectory,
          staffStructure: answers.staffStructure,
          hasSeparateDepts: answers.hasSeparateDepts,
          softwareSpend: answers.softwareSpend,
          aiComfortLevel: answers.aiComfortLevel,
          aiBudget: answers.aiBudget,
          aiPrefBuiltVsCustom: answers.aiPrefBuiltVsCustom,
          primaryContact: answers.primaryContact,
          inquiryVolume: answers.inquiryVolume,
          hasKnowledgeBase: answers.hasKnowledgeBase,
          avgResponseTime: answers.avgResponseTime,
          hasDocumentedSOPs: answers.hasDocumentedSOPs,
          meetingHoursPerWeek: answers.meetingHoursPerWeek,
          reportingFrequency: answers.reportingFrequency,
          reportCreator: answers.reportCreator,
          dataBasedDecisions: answers.dataBasedDecisions,
          topPriority90Days: answers.topPriority90Days,
          onboardingCompleted: true,
        },
      });

      // Create departments
      const deptMap = new Map<string, string>();
      const DEPT_COLORS = [
        "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
        "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
      ];

      for (let i = 0; i < answers.departments.length; i++) {
        const d = answers.departments[i];
        const dept = await tx.department.create({
          data: {
            businessId: biz.id,
            name: d.name,
            headcount: d.headcount,
            color: DEPT_COLORS[i % DEPT_COLORS.length],
            sortOrder: i,
          },
        });
        deptMap.set(d.name.toLowerCase(), dept.id);
      }

      // Create processes
      for (let i = 0; i < answers.processes.length; i++) {
        const p = answers.processes[i];
        const deptId = deptMap.get(p.departmentName.toLowerCase());
        if (!deptId) continue;

        // Find matching time audit entry
        const audit = answers.timeAudit.find(
          (t) =>
            t.processName.toLowerCase() === p.name.toLowerCase() &&
            t.departmentName.toLowerCase() === p.departmentName.toLowerCase()
        );

        await tx.process.create({
          data: {
            businessId: biz.id,
            departmentId: deptId,
            name: p.name,
            frequency: p.frequency,
            isManual: p.isManual ?? true,
            timeSpentHrsPerWeek: audit?.hoursPerWeek,
            peopleInvolved: audit?.peopleInvolved,
            sortOrder: i,
          },
        });
      }

      // Create tools
      for (const t of answers.tools) {
        await tx.toolUsed.create({
          data: {
            businessId: biz.id,
            name: t.name,
            category: t.category,
            monthlyCost: t.monthlyCost,
            isManualProcess: t.isManualProcess ?? false,
          },
        });
      }

      // Create manual tasks
      for (const task of answers.manualTasks) {
        await tx.manualTask.create({
          data: { businessId: biz.id, task },
        });
      }

      // Create pain points from all three pain point fields
      const painPointFields = [
        { text: answers.painPoint1, category: "time" },
        { text: answers.painPoint2, category: "cost" },
        { text: answers.painPoint3, category: "quality" },
      ];
      for (const { text, category } of painPointFields) {
        if (text?.trim()) {
          await tx.painPoint.create({
            data: {
              businessId: biz.id,
              description: text,
              severity: "high",
              category,
            },
          });
        }
      }
      if (answers.biggestHeadache?.trim()) {
        await tx.painPoint.create({
          data: {
            businessId: biz.id,
            description: answers.biggestHeadache,
            severity: "high",
            category: "operations",
          },
        });
      }

      // Create bottlenecks
      for (const type of answers.bottlenecks) {
        await tx.bottleneck.create({
          data: { businessId: biz.id, type },
        });
      }

      // Create goals
      for (let i = 0; i < answers.goals.length; i++) {
        await tx.businessGoal.create({
          data: {
            businessId: biz.id,
            goal: answers.goals[i],
            priority: i + 1,
          },
        });
      }

      return biz;
    });

    return NextResponse.json({ businessId: business.id });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}
