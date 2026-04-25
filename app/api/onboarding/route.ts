import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { OnboardingAnswers, ONBOARDING_COMPLETED_STEP_INDEX } from "@/lib/types/onboarding";
import { buildOnboardingKnowledgeRows } from "@/lib/onboarding/knowledgeFromAnswers";
import type { SupabaseClient } from "@supabase/supabase-js";

async function rollbackOnboardingBusiness(
  supabase: SupabaseClient,
  businessId: string
) {
  const log = (err: { message?: string } | null) => {
    if (err) console.error("Onboarding rollback step error:", err);
  };
  log(
    (await supabase.from("user_points").delete().eq("business_id", businessId))
      .error
  );
  log(
    (await supabase.from("departments").delete().eq("business_id", businessId))
      .error
  );
  log(
    (await supabase
      .from("onboarding_sessions")
      .delete()
      .eq("business_id", businessId)).error
  );
  log(
    (await supabase
      .from("business_knowledge")
      .delete()
      .eq("business_id", businessId)).error
  );
  log(
    (await supabase.from("businesses").delete().eq("id", businessId)).error
  );
}

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const answers: OnboardingAnswers = await req.json();

    // ── 0. Ensure public.users row exists (FK: businesses.user_id → users.id) ──
    const { error: userRowError } = await supabase.from("users").upsert({
      id: user.id,
      email: user.email ?? "",
    });
    if (userRowError) {
      console.error("Failed to upsert users row:", userRowError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // Idempotency guard: if onboarding already created a business for this user, reuse it.
    const { data: existingBusiness, error: existingBusinessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .eq("onboarding_completed", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingBusinessError) {
      console.error("Failed to check existing business:", existingBusinessError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    if (existingBusiness?.id) {
      return NextResponse.json({ businessId: existingBusiness.id });
    }

    // ── 1. Create business (always tied to authenticated user) ─────
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        name: answers.businessName,
        owner_name: answers.ownerName,
        tagline: answers.tagline,
        industry: answers.industry || null,
        employee_range: answers.employeeRange,
        revenue_range: answers.revenueRange,
        ai_budget: answers.aiBudget,
        tech_comfort: answers.aiComfortLevel?.trim() || answers.priorAiUsage?.trim() || null,
        onboarding_completed: true,
        user_id: user.id,
      })
      .select()
      .single();

    if (bizError || !business) {
      console.error("Business insert error:", bizError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const bizId = business.id;

    const { error: pointsError } = await supabase.from("user_points").upsert(
      {
        user_id: user.id,
        business_id: bizId,
        total_points: 0,
        level: 1,
      },
      { onConflict: "user_id, business_id" }
    );
    if (pointsError) {
      console.error("Failed to init user_points:", pointsError);
      await rollbackOnboardingBusiness(supabase, bizId);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

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
        await rollbackOnboardingBusiness(supabase, bizId);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
      if (insertedDepts) {
        for (const d of insertedDepts) {
          deptNameToId[d.name] = d.id;
        }
      }
    }

    // ── 3. Full answers snapshot (used by department page, exports, etc.) ──
    const { error: sessionError } = await supabase.from("onboarding_sessions").insert({
      business_id: bizId,
      current_step: ONBOARDING_COMPLETED_STEP_INDEX,
      completed: true,
      answers,
    });

    if (sessionError) {
      console.error("Failed to insert onboarding_session:", sessionError);
      await rollbackOnboardingBusiness(supabase, bizId);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // ── 4. business_knowledge — consumed by /api/opportunities/generate & chat ──
    const knowledgeToInsert = buildOnboardingKnowledgeRows(answers, bizId, deptNameToId);

    if (knowledgeToInsert.length > 0) {
      const { error: knowledgeError } = await supabase.from("business_knowledge").insert(knowledgeToInsert);

      if (knowledgeError) {
        console.error("Failed to insert business knowledge:", knowledgeError);
        await rollbackOnboardingBusiness(supabase, bizId);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
    }

    return NextResponse.json({ businessId: bizId });
  } catch (err: unknown) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
