import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

const ARIA_GREETING =
  "שלום! אני ARIA, הסוכן ה-AI שלך 🤖\nשאל אותי כל שאלה על העסק שלך — חיסכון בזמן, הזדמנויות, סדר עדיפויות.";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
  }

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const owned = await verifyBusinessAccess(supabase, businessId, user);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: sessions, error: sessionsError } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false });

  if (sessionsError) {
    return NextResponse.json({ error: sessionsError.message }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ sessions: [] });
  }

  const sessionIds = sessions.map((s) => s.id);
  const { data: rawMessages, error: messagesError } = await supabase
    .from("conversation_messages")
    .select("session_id, content, created_at")
    .in("session_id", sessionIds)
    .order("created_at", { ascending: false });

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  const lastMessageBySession = new Map<
    string,
    { content: string; created_at: string | null }
  >();

  for (const msg of rawMessages || []) {
    if (!lastMessageBySession.has(msg.session_id)) {
      lastMessageBySession.set(msg.session_id, {
        content: msg.content ?? "",
        created_at: msg.created_at ?? null,
      });
    }
  }

  const enriched = sessions.map((session) => {
    const last = lastMessageBySession.get(session.id);
    return {
      ...session,
      last_message_preview: last?.content?.slice(0, 60) || "",
      last_message_at: last?.created_at || session.updated_at,
    };
  });

  return NextResponse.json({ sessions: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const owned = await verifyBusinessAccess(supabase, businessId, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .insert({
        business_id: businessId,
        title: null,
      })
      .select("id, title, created_at, updated_at")
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: sessionError?.message || "Could not create session" },
        { status: 500 }
      );
    }

    const { data: greetingMessage } = await supabase
      .from("conversation_messages")
      .insert({
        business_id: businessId,
        session_id: session.id,
        role: "assistant",
        content: ARIA_GREETING,
      })
      .select("id, role, content, created_at")
      .single();

    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", session.id);

    return NextResponse.json({
      session,
      message: greetingMessage,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
