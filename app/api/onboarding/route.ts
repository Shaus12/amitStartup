import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { OnboardingAnswers } from "@/lib/types/onboarding";

export async function POST(req: NextRequest) {
  try {
    const answers: OnboardingAnswers = await req.json();

    // ── 1. Create business ─────
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        name: answers.businessName,
        owner_name: answers.ownerName,
        tagline: answers.tagline,
        industry: answers.industry,
        employee_range: answers.employeeRange,
        revenue_range: answers.revenueRange,
        ai_budget: answers.aiBudget,
        tech_comfort: answers.aiComfortLevel,
        onboarding_completed: true,
      })
      .select()
      .single();

    if (bizError || !business) {
      console.error("Business insert error:", bizError);
      throw bizError || new Error("Business creation failed");
    }

    const bizId = business.id;

    // ── 2. Create departments ─────
    const DEPT_COLORS = [
      "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
      "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
    ];

    const deptNameToId: Record<string, string> = {};

    if (answers.departments && answers.departments.length > 0) {
      const departmentsToInsert = answers.departments.map((d, i) => ({
        business_id: bizId,
        name: d.name,
        headcount: d.headcount ?? null,
        color: DEPT_COLORS[i % DEPT_COLORS.length],
      }));

      const { data: insertedDepts, error: deptError } = await supabase
        .from("departments")
        .insert(departmentsToInsert)
        .select();

      if (deptError) {
        console.error("Department insert error:", deptError);
      } else if (insertedDepts) {
        for (const d of insertedDepts) {
          deptNameToId[d.name] = d.id;
        }
      }
    }

    // ── 3. Store full answers snapshot in onboarding_sessions ──────
    const { error: sessionError } = await supabase
      .from("onboarding_sessions")
      .insert({
        business_id: bizId,
        current_step: 17,
        completed: true,
        answers: answers,
      });

    if (sessionError) console.error("Failed to insert onboarding_session:", sessionError);

    // ── 4. Create business_knowledge rows ─────
    const knowledgeToInsert: any[] = [];

    // Processes
    if (answers.processes) {
      for (const p of answers.processes) {
        knowledgeToInsert.push({
          business_id: bizId,
          department_id: deptNameToId[p.departmentName] || null,
          category: 'process',
          content: `${p.name} (Frequency: ${p.frequency || 'N/A'}, Manual: ${p.isManual ? 'Yes' : 'No'})`,
          source: 'onboarding',
          metadata: { originalName: p.name, frequency: p.frequency, isManual: p.isManual }
        });
      }
    }

    // Tools
    if (answers.tools) {
      for (const t of answers.tools) {
        knowledgeToInsert.push({
          business_id: bizId,
          department_id: null,
          category: 'tool',
          content: `${t.name} (Category: ${t.category}, Manual: ${t.isManualProcess ? 'Yes' : 'No'})`,
          source: 'onboarding',
          metadata: { name: t.name, category: t.category, isManualProcess: t.isManualProcess }
        });
      }
    }

    // Pain Points
    const painPoints = [
      answers.painPoint1,
      answers.painPoint2,
      answers.painPoint3,
      answers.biggestHeadache,
    ].filter(Boolean);
    
    for (const pp of painPoints) {
      knowledgeToInsert.push({
        business_id: bizId,
        department_id: null,
        category: 'pain_point',
        content: String(pp),
        source: 'onboarding'
      });
    }

    if (answers.bottlenecks) {
      for (const bn of answers.bottlenecks) {
        knowledgeToInsert.push({
          business_id: bizId,
          department_id: null,
          category: 'pain_point',
          content: bn,
          source: 'onboarding'
        });
      }
    }

    // Goals
    const goals = [answers.topPriority90Days, ...(answers.goals || [])].filter(Boolean);
    for (const g of goals) {
      knowledgeToInsert.push({
        business_id: bizId,
        department_id: null,
        category: 'goal',
        content: String(g),
        source: 'onboarding'
      });
    }

    // Insights (General business info)
    const insights = [
      `Employee Range: ${answers.employeeRange}`,
      `Revenue Range: ${answers.revenueRange}`,
      `Industry: ${answers.industry}`,
      `AI Comfort Level: ${answers.aiComfortLevel}`,
      `Primary Contact: ${answers.primaryContact}`,
      `Inquiry Volume: ${answers.inquiryVolume}`,
      `Avg Response Time: ${answers.avgResponseTime}`
    ].filter(i => !i.endsWith("undefined") && !i.endsWith(""));

    for (const i of insights) {
      knowledgeToInsert.push({
        business_id: bizId,
        department_id: null,
        category: 'insight',
        content: i,
        source: 'onboarding'
      });
    }
    
    if (answers.manualTasks) {
       for (const mt of answers.manualTasks) {
          knowledgeToInsert.push({
            business_id: bizId,
            department_id: null,
            category: 'insight',
            content: `Manual Task: ${mt}`,
            source: 'onboarding'
          });
       }
    }

    if (knowledgeToInsert.length > 0) {
      const { error: knowledgeError } = await supabase
        .from('business_knowledge')
        .insert(knowledgeToInsert);
      
      if (knowledgeError) console.error("Failed to insert business knowledge:", knowledgeError);
    }

    return NextResponse.json({ businessId: bizId });
  } catch (err: any) {
    console.error("Onboarding error:", err);
    return NextResponse.json(
      { error: "Failed to save onboarding data", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
