import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { AnalysisParseError, analyzeBusinessData } from "@/lib/ai/analyzeBusinessData";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_KNOWLEDGE_ROWS = 20;
const MAX_KNOWLEDGE_TOKENS = 3000;
const APPROX_CHARS_PER_TOKEN = 4;

type ClaudeKnowledgeRow = { category: string; content: string; metadata?: unknown };
type DepartmentRow = { id: string; name: string };
type KnowledgeInsert = {
  business_id: string;
  department_id: string | null;
  category: string;
  content: string;
  source: string;
};

function approximateTokenCount(text: string): number {
  return Math.ceil(text.length / APPROX_CHARS_PER_TOKEN);
}

function limitKnowledgeContext(rows: ClaudeKnowledgeRow[], maxTokens: number): ClaudeKnowledgeRow[] {
  const maxChars = maxTokens * APPROX_CHARS_PER_TOKEN;
  let usedChars = 0;
  const limitedRows: ClaudeKnowledgeRow[] = [];

  for (const row of rows) {
    const prefix = `### ${row.category.toUpperCase()}\n- `;
    const separator = limitedRows.length > 0 ? "\n\n" : "";
    const overheadChars = separator.length + prefix.length;
    const remainingChars = maxChars - usedChars - overheadChars;

    if (remainingChars <= 0) break;

    const content =
      row.content.length > remainingChars
        ? `${row.content.slice(0, Math.max(0, remainingChars - 16)).trimEnd()}\n[truncated]`
        : row.content;

    limitedRows.push({ ...row, content });
    usedChars += overheadChars + content.length;

    if (row.content.length > content.length) break;
  }

  return limitedRows;
}

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    console.log("[generate] Starting for business:", businessId);

    const expectedInternalSecret = process.env.WEBHOOK_SECRET;
    const isInternalRequest =
      Boolean(expectedInternalSecret) &&
      req.headers.get("x-internal-secret") === expectedInternalSecret;

    let userId: string | null = null;
    if (!isInternalRequest) {
      const authClient = await createClient();
      const { data: { user } } = await authClient.auth.getUser();
      userId = user?.id ?? null;

      const owned = await verifyBusinessAccess(supabase, businessId, user);
      if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const rateLimit = checkRateLimit(req, `opportunities-generate:${user?.id ?? "anon"}`, 10, 60_000);
      if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    }

    // ── 1. Fetch departments + knowledge + latest onboarding snapshot ─────
    const [
      { data: knowledgeRows, error: knowledgeError },
      { data: departments },
      { data: sessionRows },
    ] = await Promise.all([
      supabase
        .from("business_knowledge")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(MAX_KNOWLEDGE_ROWS),
      supabase.from("departments").select("*").eq("business_id", businessId),
      supabase
        .from("onboarding_sessions")
        .select("answers")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (knowledgeError) throw knowledgeError;

    const depts = (departments ?? []) as DepartmentRow[];
    const deptNameToId = new Map<string, string>(
      depts.map((d) => [d.name.toLowerCase(), d.id])
    );
    const departmentNames = depts.map((d) => d.name);

    console.log("[generate] Departments found:", departmentNames);
    console.log("[generate] Knowledge rows:", knowledgeRows?.length ?? 0);

    // ── 2. Call Claude ─────────────────────────────────────────────────────
    const snapshotRows: { category: string; content: string; metadata?: unknown }[] = [];
    if (sessionRows?.answers && typeof sessionRows.answers === "object") {
      snapshotRows.push({
        category: "onboarding_json",
        content: JSON.stringify(sessionRows.answers),
      });
    }

    const safeKnowledgeRows = [
      ...snapshotRows,
      ...(knowledgeRows || []).map((r) => ({
        category: String(r.category ?? "uncategorized"),
        content: String(r.content ?? ""),
        metadata: r.metadata,
      })),
    ];
    const limitedKnowledgeRows = limitKnowledgeContext(safeKnowledgeRows, MAX_KNOWLEDGE_TOKENS);
    const approximateKnowledgeTokens = approximateTokenCount(
      limitedKnowledgeRows
        .map((row) => `### ${row.category.toUpperCase()}\n- ${row.content}`)
        .join("\n\n")
    );

    console.log(
      "[generate] Knowledge context sent to Claude:",
      limitedKnowledgeRows.length,
      "rows, approx",
      approximateKnowledgeTokens,
      "tokens"
    );

    const result = await analyzeBusinessData(limitedKnowledgeRows, departmentNames, {
      businessId,
      userId,
    });

    console.log("[generate] Claude returned", result.opportunities?.length ?? 0, "opportunities across", result.departments?.length ?? 0, "departments");

    // ── 3. Clean up stale AI data ──────────────────────────────────────────
    // Find which existing opportunities have tasks (must preserve these)
    const { data: tasksWithOpps } = await supabase
      .from("tasks")
      .select("opportunity_id")
      .eq("business_id", businessId)
      .not("opportunity_id", "is", null);

    const protectedOppIds = tasksWithOpps?.map((t) => t.opportunity_id).filter(Boolean) ?? [];
    console.log("[generate] Protected opportunity IDs (have tasks):", protectedOppIds.length);

    // Delete old opportunities that are NOT protected by tasks.
    const { data: existingOpps, error: existingOppsError } = await supabase
      .from("ai_opportunities")
      .select("id")
      .eq("business_id", businessId);
    if (existingOppsError) throw existingOppsError;

    const deletableOppIds = (existingOpps ?? [])
      .map((opp) => opp.id)
      .filter((id) => !protectedOppIds.includes(id));

    let delOppsErr: Error | null = null;
    let delOppsCount = 0;
    if (deletableOppIds.length > 0) {
      const deleteResult = await supabase
        .from("ai_opportunities")
        .delete({ count: "exact" })
        .eq("business_id", businessId)
        .in("id", deletableOppIds);
      delOppsErr = deleteResult.error;
      delOppsCount = deleteResult.count ?? 0;
    }
    if (delOppsErr) console.error("[generate] Delete opportunities ERROR:", delOppsErr);
    else console.log("[generate] Deleted opportunities count:", delOppsCount);

    // Delete old AI knowledge rows
    const { error: delKnowledgeErr, count: delKCount } = await supabase
      .from("business_knowledge")
      .delete()
      .eq("business_id", businessId)
      .eq("source", "ai_analysis");
    if (delKnowledgeErr) console.error("[generate] Delete knowledge ERROR:", delKnowledgeErr);
    else console.log("[generate] Deleted knowledge rows:", delKCount);

    // Delete old health scores
    const { error: delHealthErr } = await supabase
      .from("business_health_scores")
      .delete()
      .eq("business_id", businessId);
    if (delHealthErr) console.error("[generate] Delete health scores ERROR:", delHealthErr);

    // ── 4. Create fresh ai_analyses row ───────────────────────────────────
    const { data: analysis, error: analysisError } = await supabase
      .from("ai_analyses")
      .insert({ business_id: businessId, triggered_by: "user", status: "pending" })
      .select()
      .single();

    if (analysisError || !analysis) {
      throw analysisError || new Error("Failed to create analysis record");
    }

    // ── 5. Insert new opportunities ────────────────────────────────────────
    const allOpps = result.opportunities ?? [];
    if (allOpps.length > 0) {
      const oppsToInsert = allOpps.map((opp) => {
        const deptId = opp.department_name
          ? deptNameToId.get(opp.department_name.toLowerCase()) ?? null
          : null;
        return {
          business_id: businessId,
          analysis_id: analysis.id,
          department_id: deptId,
          title: opp.title,
          description: opp.description,
          impact_type: opp.impact_type,
          estimated_hours_saved: opp.estimated_hours_saved,
          estimated_cost_saved: opp.estimated_cost_saved,
          priority: opp.priority || 3,
          status: "suggested",
          is_quick_win: opp.is_quick_win ?? false,
          notification_hook: opp.notification_hook ?? null,
          proof_of_value: opp.proof_of_value ?? null,
        };
      });

      const { error: insertError } = await supabase.from("ai_opportunities").insert(oppsToInsert);
      if (insertError) {
        console.error("[generate] Insert opportunities error:", insertError);
        throw new Error(`Opportunity insert failed: ${insertError.message}`);
      }
      console.log("[generate] Inserted", oppsToInsert.length, "opportunities");
    }

    // ── 6. Save per-department health scores + pain/action insights ────────
    const deptAnalyses = result.departments ?? [];
    const knowledgeInserts: KnowledgeInsert[] = [];

    for (const deptResult of deptAnalyses) {
      const deptId = deptNameToId.get(deptResult.department_name.toLowerCase()) ?? null;

      if (deptId) {
        await supabase
          .from("departments")
          .update({ health_score: deptResult.health_score })
          .eq("id", deptId);
      }

      if (deptResult.main_pain) {
        knowledgeInserts.push({
          business_id: businessId,
          department_id: deptId,
          category: "main_pain",
          content: deptResult.main_pain,
          source: "ai_analysis",
        });
      }
      if (deptResult.first_action) {
        knowledgeInserts.push({
          business_id: businessId,
          department_id: deptId,
          category: "first_action",
          content: deptResult.first_action,
          source: "ai_analysis",
        });
      }
    }

    if (knowledgeInserts.length > 0) {
      const { error: kErr } = await supabase.from("business_knowledge").insert(knowledgeInserts);
      if (kErr) console.error("[generate] Knowledge insert error:", kErr);
      else console.log("[generate] Inserted", knowledgeInserts.length, "knowledge rows (main_pain/first_action)");
    }

    // ── 7. Mark analysis complete + save health score ──────────────────────
    await Promise.all([
      supabase.from("ai_analyses").update({ status: "completed" }).eq("id", analysis.id),
      supabase.from("business_health_scores").insert({
        business_id: businessId,
        score: result.overall_health_score,
        breakdown: { biggest_pain: result.biggest_pain },
        daily_tip: result.daily_tip,
        calculated_at: new Date().toISOString(),
      }),
    ]);

    console.log("[generate] Done. Opportunities:", allOpps.length, "Departments:", deptAnalyses.length);

    return NextResponse.json({
      count: allOpps.length,
      departments: deptAnalyses.length,
      summary: result.summary,
    });
  } catch (err: unknown) {
    console.error("[generate] FAILED:", err);
    if (err instanceof AnalysisParseError) {
      return NextResponse.json(
        {
          error: "Claude returned invalid or truncated JSON",
          partial: err.partial,
          responseLength: err.responseLength,
          responseTail: err.responseTail,
        },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
