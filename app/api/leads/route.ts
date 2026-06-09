import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const VALID_SOURCES = new Set(["analysis_report", "dashboard"]);
const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 1200;

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidIsraeliPhone(phone: string) {
  return /^05\d{8}$/.test(normalizePhone(phone));
}

async function notifyLead(params: {
  name: string;
  phone: string;
  message: string | null;
  source: string;
  timestamp: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "BizMap <onboarding@resend.dev>",
        to: "amit@bizmapai.com",
        subject: `ליד חדש מ-BizMap — ${params.source}`,
        text: [
          `Name: ${params.name}`,
          `Phone: ${params.phone}`,
          `Message: ${params.message || "-"}`,
          `Source: ${params.source}`,
          `Timestamp: ${params.timestamp}`,
        ].join("\n"),
      }),
    });
  } catch (err) {
    console.error("[leads] email notification failed:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const body = (await req.json()) as {
      name?: unknown;
      phone?: unknown;
      message?: unknown;
      source?: unknown;
    };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? normalizePhone(body.phone) : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const source = typeof body.source === "string" ? body.source : "";

    if (!name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (name.length > MAX_NAME_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: "Fields are too long" }, { status: 400 });
    }
    if (!isValidIsraeliPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    if (!VALID_SOURCES.has(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const { error } = await supabaseAdmin.from("leads").insert({
      user_id: user?.id ?? null,
      name,
      phone,
      message: message || null,
      source,
    });

    if (error) {
      console.error("[leads] insert error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    void notifyLead({
      name,
      phone,
      message: message || null,
      source,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[leads] route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
