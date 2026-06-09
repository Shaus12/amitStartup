import type { SupabaseClient } from "@supabase/supabase-js";
import { EMPTY_ANSWERS, ONBOARDING_COMPLETED_STEP_INDEX } from "@/lib/types/onboarding";
import { buildOnboardingKnowledgeRows } from "@/lib/onboarding/knowledgeFromAnswers";

type AuthUser = {
  id: string;
  email?: string | null;
};

type NormalizedDepartment = {
  name: string;
  headcount?: number;
};

function parseDepartments(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function departmentFallbackName(chatData: any): string {
  return (
    String(chatData.businessType || chatData.industry || "").trim() ||
    "תפעול כללי"
  );
}

function normalizeDepartments(chatData: any): NormalizedDepartment[] {
  const departments: NormalizedDepartment[] = [];

  for (const d of parseDepartments(chatData.departments)) {
    if (!d || typeof d !== "object") continue;
    const raw = d as { name?: unknown; headcount?: unknown };
    const name = String(raw.name || "").trim();
    if (!name) continue;
    const headcount = Number(raw.headcount);
    const normalized: NormalizedDepartment = { name };
    if (Number.isFinite(headcount) && headcount > 0) {
      normalized.headcount = headcount;
    }
    departments.push(normalized);
  }

  if (departments.length > 0) return departments;

  return [{ name: departmentFallbackName(chatData), headcount: 1 }];
}

async function ensureBusinessHasDepartment(
  supabase: SupabaseClient,
  businessId: string,
  businessName: string | null | undefined
) {
  const { count, error: countError } = await supabase
    .from("departments")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);

  if (countError) {
    throw new Error(`Failed to count departments: ${countError.message}`);
  }

  if ((count ?? 0) > 0) return;

  const { error: fallbackError } = await supabase.from("departments").insert({
    business_id: businessId,
    name: String(businessName || "").trim() || "כללי",
    headcount: 1,
    color: "#6366f1",
  });

  if (fallbackError) {
    throw new Error(`Default department insert error: ${fallbackError.message}`);
  }
}

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

export async function finalizeChatOnboarding(
  supabase: SupabaseClient,
  user: AuthUser,
  chatData: any
): Promise<string> {
  const { error: userRowError } = await supabase.from("users").upsert({
    id: user.id,
    email: user.email ?? "",
  });
  if (userRowError) {
    throw new Error(`Failed to upsert users row: ${userRowError.message}`);
  }

  const { data: existingBusiness, error: existingBusinessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .eq("onboarding_completed", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingBusinessError) {
    throw new Error(`Failed to check existing business: ${existingBusinessError.message}`);
  }
  if (existingBusiness?.id) {
    await ensureBusinessHasDepartment(
      supabase,
      existingBusiness.id,
      chatData.businessName || chatData.businessType || chatData.industry
    );
    return existingBusiness.id;
  }

  const mappedAnswers = { ...EMPTY_ANSWERS };

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

  mappedAnswers.departments = normalizeDepartments(chatData);
  mappedAnswers.tools = (chatData.tools || []).map((t: any) => ({
    name: t.name || "",
    category: t.category || "כללי",
    isManualProcess: !!t.isManualProcess,
  }));
  mappedAnswers.processes = (chatData.processes || []).map((p: any) => ({
    name: p.name || "",
    departmentName: p.departmentName || "כללי",
    frequency: p.frequency || "",
    isManual: !!p.isManual,
  }));
  mappedAnswers.bottlenecks = chatData.bottlenecks || [];
  mappedAnswers.manualTasks = chatData.manualTasks || [];
  mappedAnswers.goals = chatData.goals || [];
  mappedAnswers.priorAiTools = chatData.currentAiTools || [];
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
    throw new Error(`Business insert error: ${bizError?.message ?? "missing business"}`);
  }

  const bizId = business.id;
  const updateRes = await supabase
    .from("user_points")
    .update({ business_id: bizId })
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (updateRes.error) {
    await rollbackOnboardingBusiness(supabase, bizId);
    throw new Error(`Failed to update user_points: ${updateRes.error.message}`);
  }
  if (!updateRes.data) {
    const insertRes = await supabase.from("user_points").insert({
      user_id: user.id,
      business_id: bizId,
      total_points: 0,
      level: 1,
    });
    if (insertRes.error) {
      await rollbackOnboardingBusiness(supabase, bizId);
      throw new Error(`Failed to insert user_points: ${insertRes.error.message}`);
    }
  }

  const deptColors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
  ];
  const deptNameToId: Record<string, string> = {};

  if (mappedAnswers.departments.length > 0) {
    const { data: insertedDepts, error: deptError } = await supabase
      .from("departments")
      .insert(mappedAnswers.departments.map((d, i) => ({
        business_id: bizId,
        name: d.name,
        headcount: d.headcount ?? null,
        color: deptColors[i % deptColors.length],
      })))
      .select();

    if (deptError) {
      await rollbackOnboardingBusiness(supabase, bizId);
      throw new Error(`Department insert error: ${deptError.message}`);
    }
    for (const d of insertedDepts ?? []) {
      deptNameToId[d.name] = d.id;
    }
  }

  try {
    await ensureBusinessHasDepartment(supabase, bizId, mappedAnswers.businessName);
  } catch (err) {
    await rollbackOnboardingBusiness(supabase, bizId);
    throw err;
  }

  if (Object.keys(deptNameToId).length === 0) {
    const { data: fallbackDepts, error: fallbackFetchError } = await supabase
      .from("departments")
      .select("id, name")
      .eq("business_id", bizId);

    if (fallbackFetchError) {
      await rollbackOnboardingBusiness(supabase, bizId);
      throw new Error(`Failed to fetch fallback departments: ${fallbackFetchError.message}`);
    }

    for (const d of fallbackDepts ?? []) {
      deptNameToId[d.name] = d.id;
    }
  }

  const { error: sessionError } = await supabase.from("onboarding_sessions").insert({
    business_id: bizId,
    current_step: ONBOARDING_COMPLETED_STEP_INDEX,
    completed: true,
    answers: mappedAnswers,
  });
  if (sessionError) {
    await rollbackOnboardingBusiness(supabase, bizId);
    throw new Error(`Failed to insert onboarding_session: ${sessionError.message}`);
  }

  const knowledgeToInsert = buildOnboardingKnowledgeRows(mappedAnswers, bizId, deptNameToId);
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
      await rollbackOnboardingBusiness(supabase, bizId);
      throw new Error(`Failed to insert business knowledge: ${knowledgeError.message}`);
    }
  }

  return bizId;
}
