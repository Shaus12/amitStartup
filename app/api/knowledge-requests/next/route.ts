import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";
import Anthropic from "@anthropic-ai/sdk";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ popup: null });

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const owned = await verifyBusinessAccess(supabase, businessId, user);
    if (!owned) return NextResponse.json({ popup: null });

    const today = new Date().toISOString().split("T")[0];

    // 1. Count how many popups were shown today
    const { count: shownTodayCount } = await supabase
      .from("knowledge_requests")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("last_shown_date", today);

    if ((shownTodayCount ?? 0) >= 2) {
      return NextResponse.json({ popup: null });
    }

    // 2. Check for an existing pending request not shown today
    const { data: existingPending } = await supabase
      .from("knowledge_requests")
      .select("*")
      .eq("business_id", businessId)
      .eq("status", "pending")
      .neq("last_shown_date", today)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let requestRow = existingPending;

    // 3. Generate a new question if no pending one exists
    if (!requestRow) {
      const { data: knowledgeRows } = await supabase
        .from("business_knowledge")
        .select("category, content")
        .eq("business_id", businessId);

      const apiKey = process.env.ANTHROPIC_API_KEY;
      let question = "מה האתגר הגדול ביותר שאתה מתמודד איתו בעסק כרגע?";

      if (apiKey && knowledgeRows && knowledgeRows.length > 0) {
        try {
          const client = new Anthropic({ apiKey });
          const response = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 120,
            system: `You are a business analyst AI. Analyze the business knowledge provided and identify the single most important piece of MISSING information that would help you give better advice to this business owner.
Return ONLY a concise question in Hebrew (עברית) — maximum 15 words. No extra text, no quotes, no explanation.`,
            messages: [
              {
                role: "user",
                content: `Business knowledge:\n${JSON.stringify(knowledgeRows, null, 2)}\n\nWhat is the single most important missing piece of information? Return only the Hebrew question.`,
              },
            ],
          });
          const textBlock = response.content.find((b) => b.type === "text");
          if (textBlock?.type === "text") {
            question = textBlock.text.trim().replace(/^["']|["']$/g, "");
          }
        } catch (err) {
          console.error("Claude question generation failed:", err);
        }
      }

      // Save the new question
      const { data: newRequest, error: insertErr } = await supabase
        .from("knowledge_requests")
        .insert({
          business_id: businessId,
          question,
          category: "insight",
          status: "pending",
          triggered_by: "auto",
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      requestRow = newRequest;
    }

    // 4. Mark it as shown today
    await supabase
      .from("knowledge_requests")
      .update({
        shown_at: new Date().toISOString(),
        last_shown_date: today,
        shown_today_count: (requestRow.shown_today_count ?? 0) + 1,
      })
      .eq("id", requestRow.id);

    return NextResponse.json({ popup: requestRow });
  } catch (err: any) {
    console.error("knowledge-requests/next error:", err);
    return NextResponse.json({ popup: null });
  }
}
