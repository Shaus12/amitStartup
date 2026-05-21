import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { EMPTY_ANSWERS, ONBOARDING_COMPLETED_STEP_INDEX } from "@/lib/types/onboarding";
import { buildOnboardingKnowledgeRows } from "@/lib/onboarding/knowledgeFromAnswers";
import type { SupabaseClient } from "@supabase/supabase-js";

async function rollbackOnboardingBusiness(
  supabase: SupabaseClient,
  businessId: string
) {
  const log = (err: { message?: string } | null) => {
    if (err) console.error("Onboarding rollback step error:", err);
  };
  log((await supabase.from("user_points").delete().eq("business_id", businessId)).error);
  log((await supabase.from("departments").delete().eq("business_id", businessId)).error);
  log((await supabase.from("onboarding_sessions").delete().eq("business_id", businessId)).error);
  log((await supabase.from("business_knowledge").delete().eq("business_id", businessId)).error);
  log((await supabase.from("businesses").delete().eq("id", businessId)).error);
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

    const chatData = await req.json();

    // ── 0. Ensure public.users row exists ──
    const { error: userRowError } = await supabase.from("users").upsert({
      id: user.id,
      email: user.email ?? "",
    });
    if (userRowError) {
      console.error("Failed to upsert users row:", userRowError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // Idempotency check: if already completed, reuse business
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

    // Map chat JSON to OnboardingAnswers
    const mappedAnswers = { ...EMPTY_ANSWERS };
    
    // Direct mappings
    mappedAnswers.businessName = chatData.businessName || "העסק שלי";
    mappedAnswers.ownerName = chatData.ownerName || "";
    mappedAnswers.tagline = chatData.tagline || "";
    mappedAnswers.businessType = chatData.businessType || "";
    mappedAnswers.industry = chatData.industry || "";
    mappedAnswers.targetCustomer = chatData.targetCustomer || "";
    mappedAnswers.employeeRange = String(chatData.employeeRange || "");
    mappedAnswers.revenueRange = String(chatData.revenueRange || "");
    mappedAnswers.businessAge = String(chatData.businessAge || "");
    mappedAnswers.growthTrajectory = chatData.growthTrajectory || "";
    
    // Arrays
    mappedAnswers.departments = (chatData.departments || []).map((d: any) => ({
      name: d.name || "כללי",
      headcount: typeof d.headcount === 'number' ? d.headcount : undefined
    }));
    mappedAnswers.tools = (chatData.tools || []).map((t: any) => ({
      name: t.name || "",
      category: t.category || "כללי",
      isManualProcess: !!t.isManualProcess
    }));
    mappedAnswers.processes = (chatData.processes || []).map((p: any) => ({
      name: p.name || "",
      departmentName: p.departmentName || "כללי",
      frequency: p.frequency || "",
      isManual: !!p.isManual
    }));
    mappedAnswers.bottlenecks = chatData.bottlenecks || [];
    mappedAnswers.manualTasks = chatData.manualTasks || [];
    mappedAnswers.goals = chatData.goals || [];
    mappedAnswers.priorAiTools = chatData.currentAiTools || [];
    
    // Detailed mappings
    mappedAnswers.biggestHeadache = chatData.biggestHeadache || chatData.automationWish || "";
    mappedAnswers.painPoint1 = chatData.painPoints?.[0] || "";
    mappedAnswers.painPoint2 = chatData.painPoints?.[1] || "";
    mappedAnswers.painPoint3 = chatData.painPoints?.[2] || "";
    mappedAnswers.aiComfortLevel = chatData.aiComfortLevel || "";
    mappedAnswers.topPriority90Days = chatData.topPriority90Days || "";
    mappedAnswers.monthlyLeads = String(chatData.monthlyLeads || "");
    mappedAnswers.closeRate = String(chatData.closeRate || "");
    mappedAnswers.avgDealSize = String(chatData.avgDealSize || "");
    mappedAnswers.primaryContact = chatData.primaryContact || "";
    mappedAnswers.timeSpentComms = String(chatData.timeSpentComms || "");
    mappedAnswers.hasDocumentedSOPs = chatData.hasDocumentedSOPs ? "Yes" : "No";

    // ── 1. Create business ─────
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        name: mappedAnswers.businessName,
        owner_name: mappedAnswers.ownerName,
        tagline: mappedAnswers.tagline,
        industry: mappedAnswers.industry || null,
        employee_range: mappedAnswers.employeeRange,
        revenue_range: mappedAnswers.revenueRange,
        ai_budget: null,
        tech_comfort: mappedAnswers.aiComfortLevel?.trim() || null,
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

    // ── Init user_points
    const pointsPayload = {
      user_id: user.id,
      business_id: bizId,
      total_points: 0,
      level: 1,
    };
    
    let pointsError = null;
    const updateRes = await supabase
      .from("user_points")
      .update({ business_id: bizId })
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (updateRes.error) {
      pointsError = updateRes.error;
    } else if (!updateRes.data) {
      const insertRes = await supabase.from("user_points").insert(pointsPayload);
      pointsError = insertRes.error;
    }

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

    if (mappedAnswers.departments && mappedAnswers.departments.length > 0) {
      const departmentsToInsert = mappedAnswers.departments.map((d, i) => ({
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

    // ── 3. Full answers snapshot ──
    const { error: sessionError } = await supabase.from("onboarding_sessions").insert({
      business_id: bizId,
      current_step: ONBOARDING_COMPLETED_STEP_INDEX,
      completed: true,
      answers: mappedAnswers,
    });

    if (sessionError) {
      console.error("Failed to insert onboarding_session:", sessionError);
      await rollbackOnboardingBusiness(supabase, bizId);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // ── 4. business_knowledge ──
    const knowledgeToInsert = buildOnboardingKnowledgeRows(mappedAnswers, bizId, deptNameToId);

    // Add extra insights from chat that aren't mapped
    if (chatData.automationWish) {
      knowledgeToInsert.push({
        business_id: bizId,
        department_id: null,
        category: "insight",
        content: "If they could automate one thing tomorrow: " + chatData.automationWish,
        source: "onboarding",
      });
    }
    
    if (chatData.additionalInsights) {
      knowledgeToInsert.push({
        business_id: bizId,
        department_id: null,
        category: "insight",
        content: "Additional Claude Insights: " + chatData.additionalInsights,
        source: "onboarding",
      });
    }

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
    console.error("Onboarding chat finalize error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
