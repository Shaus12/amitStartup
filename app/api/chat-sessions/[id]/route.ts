import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

async function getOwnedSession(sessionId: string, user: any) {
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id, business_id, title, created_at, updated_at")
    .eq("id", sessionId)
    .single();

  if (!session) return null;

  const owned = await verifyBusinessAccess(supabase, session.business_id, user);
  if (!owned) return null;

  return session;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const session = await getOwnedSession(id, user);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: messages, error } = await supabase
    .from("conversation_messages")
    .select("id, role, content, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ session, messages: messages || [] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title } = await req.json();

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const session = await getOwnedSession(id, user);
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const normalizedTitle =
      typeof title === "string" ? title.trim() : null;

    const { data: updated, error } = await supabase
      .from("chat_sessions")
      .update({
        title: normalizedTitle && normalizedTitle.length > 0 ? normalizedTitle : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, title, created_at, updated_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ session: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const session = await getOwnedSession(id, user);
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { error: messagesError } = await supabase
      .from("conversation_messages")
      .delete()
      .eq("session_id", id);

    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }

    const { error: sessionDeleteError } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", id);

    if (sessionDeleteError) {
      return NextResponse.json({ error: sessionDeleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
