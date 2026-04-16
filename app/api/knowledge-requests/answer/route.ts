import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

export async function POST(req: NextRequest) {
  try {
    const { businessId, requestId, question, answer } = await req.json();
    if (!businessId || !requestId || !answer?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const owned = await verifyBusinessAccess(supabase, businessId, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Save the answer to business_knowledge
    await supabase.from("business_knowledge").insert({
      business_id: businessId,
      category: "insight",
      content: `שאלה: ${question}\nתשובה: ${answer.trim()}`,
      source: "user_input",
      metadata: { request_id: requestId },
    });

    // Update knowledge_request status to answered
    await supabase
      .from("knowledge_requests")
      .update({ status: "answered" })
      .eq("id", requestId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("knowledge-requests/answer error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
