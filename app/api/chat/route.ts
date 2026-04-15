import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";
import { callClaudeForChat } from "@/lib/ai/analyzeBusinessData";

export async function POST(req: NextRequest) {
  try {
    const { businessId, message } = await req.json();
    if (!businessId || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const owned = await verifyBusinessAccess(supabase, businessId, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 1. Save user message
    await supabase.from("conversation_messages").insert({
      business_id: businessId,
      role: "user",
      content: message
    });

    // 2. Fetch context (business knowledge)
    const { data: knowledgeRows } = await supabase
      .from("business_knowledge")
      .select("category, content")
      .eq("business_id", businessId);

    // 3. Fetch recent history
    const { data: messages } = await supabase
      .from("conversation_messages")
      .select("role, content")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(10);
      
    // reverse to chronological
    const history = (messages || []).reverse();

    // 4. Call Claude
    const claudeResponse = await callClaudeForChat(
      knowledgeRows || [], 
      history.slice(0, -1), // exclude the newest one we just added to send as pure userMessage
      message
    );

    // 5. Save Claude response
    const { data: savedMsg, error } = await supabase
      .from("conversation_messages")
      .insert({
        business_id: businessId,
        role: "assistant",
        content: claudeResponse
      })
      .select()
      .single();
      
    if (error) console.error("Could not save assistant message:", error);

    return NextResponse.json({ response: claudeResponse, message: savedMsg });
  } catch (err: any) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
