import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_FEEDBACK_LENGTH = 800;

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rate = checkRateLimit(req, `feedback:${user.id}`, 8, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await req.json()) as { message?: string; businessId?: string };
    const message = body.message?.trim();
    const businessId = body.businessId;

    if (!message || !businessId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (message.length > MAX_FEEDBACK_LENGTH) {
      return NextResponse.json({ error: "Feedback is too long" }, { status: 400 });
    }

    const { error: insertError } = await authClient.from("platform_feedback").insert({
      business_id: businessId,
      user_id: user.id,
      message,
    });

    if (insertError) {
      console.error("Feedback insert error:", insertError);
      if (insertError.code === "42501") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Feedback route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
