import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { OnboardingAnswers } from "@/lib/types/onboarding";

export async function POST(req: NextRequest) {
  try {
    const answers: OnboardingAnswers = await req.json();

    // ── 1. Create business (only columns that exist in schema) ─────
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

    // ── 2. Create departments (only columns that exist in schema) ──
    const DEPT_COLORS = [
      "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
      "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
    ];

    if (answers.departments && answers.departments.length > 0) {
      const departmentsToInsert = answers.departments.map((d, i) => ({
        business_id: bizId,
        name: d.name,
        headcount: d.headcount ?? null,
        color: DEPT_COLORS[i % DEPT_COLORS.length],
        // position_x / position_y left as null — set by user dragging the map
      }));

      const { error: deptError } = await supabase
        .from("departments")
        .insert(departmentsToInsert);

      if (deptError) console.error("Department insert error:", deptError);
    }

    // ── 3. Store full answers snapshot in onboarding_sessions ──────
    // This is the source of truth for processes, tools, pain points,
    // bottlenecks, goals — everything the DB doesn't have its own table for.
    const { error: sessionError } = await supabase
      .from("onboarding_sessions")
      .insert({
        business_id: bizId,
        current_step: 17,
        completed: true,
        answers: answers, // full JSONB snapshot
      });

    if (sessionError) console.error("Failed to insert onboarding_session:", sessionError);

    return NextResponse.json({ businessId: bizId });
  } catch (err: any) {
    console.error("Onboarding error:", err);
    return NextResponse.json(
      { error: "Failed to save onboarding data", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
