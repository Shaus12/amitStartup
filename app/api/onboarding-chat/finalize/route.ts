import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { finalizeChatOnboarding } from "@/lib/onboarding/finalizeChatOnboarding";

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
    const businessId = await finalizeChatOnboarding(supabase, user, chatData);

    return NextResponse.json({ businessId });
  } catch (err: unknown) {
    console.error("Onboarding chat finalize error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
