import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type Plan = "pro" | "business";

const PLAN_DETAILS: Record<Plan, { price: 1 | 149; name: "Pro" | "Business" }> = {
  pro: { price: 1, name: "Pro" },
  business: { price: 149, name: "Business" },
};

function isPlan(value: unknown): value is Plan {
  return value === "pro" || value === "business";
}

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function extractPaymentUrl(rawText: string): string | null {
  try {
    const data = JSON.parse(rawText) as {
      payment_url?: unknown;
      paymentUrl?: unknown;
      redirectUrl?: unknown;
      url?: unknown;
      link?: unknown;
    };

    const value =
      data.payment_url ??
      data.paymentUrl ??
      data.redirectUrl ??
      data.url ??
      data.link;

    return typeof value === "string" && value ? value : null;
  } catch {
    const urlMatch = rawText.match(/https?:\/\/[^\s"'}\]]+/);
    return urlMatch?.[0]?.replace(/[.,;]+$/, "") ?? null;
  }
}

function normalizePhone(value: unknown): string {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function ensureTwoWordName(value: unknown): string {
  const name = typeof value === "string" ? value.trim() : "";
  const words = name.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return words.join(" ");
  }

  const fallbackWords = ["לקוח", "משתמש", "Bizmap", "AI"];
  const randomWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];

  if (words.length === 1) {
    return `${words[0]} ${randomWord}`;
  }

  return `לקוח ${randomWord}`;
}

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

    const body: unknown = await req.json();
    const { plan, userId, phone } = body as { plan?: unknown; userId?: unknown; phone?: unknown };

    if (!isPlan(plan) || typeof userId !== "string" || !userId) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const makeWebhookUrl = process.env.MAKE_SUBSCRIPTION_WEBHOOK_URL;
    if (!makeWebhookUrl) {
      console.error("[subscription/create-payment] Missing MAKE_SUBSCRIPTION_WEBHOOK_URL");
      return NextResponse.json({ error: "Payment provider is not configured" }, { status: 500 });
    }

    const planDetails = PLAN_DETAILS[plan];
    const normalizedPhone = normalizePhone(phone);
    const { data: userProfile, error: userProfileError } = await supabaseAdmin
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (userProfileError) {
      console.error("[subscription/create-payment] Failed to fetch user profile:", userProfileError);
    }

    const makeRes = await fetch(makeWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        user_email: user.email ?? "",
        user_name: ensureTwoWordName(userProfile?.full_name),
        phone: normalizedPhone,
        plan,
        plan_price: planDetails.price,
        plan_name: planDetails.name,
        callback_url: `${appUrl()}/api/subscription/webhook`,
      }),
    });

    if (!makeRes.ok) {
      const errorText = await makeRes.text().catch(() => "");
      console.error("[subscription/create-payment] Make.com request failed", {
        status: makeRes.status,
        statusText: makeRes.statusText,
        body: errorText.slice(0, 500),
      });
      return NextResponse.json({ error: "Payment provider request failed" }, { status: 502 });
    }

    const rawText = await makeRes.text();
    const paymentUrl = extractPaymentUrl(rawText);

    if (!paymentUrl) {
      console.error("[subscription/create-payment] Missing payment_url in Make.com response", {
        body: rawText.slice(0, 500),
      });
      return NextResponse.json({ error: "Payment URL missing" }, { status: 502 });
    }

    return NextResponse.json({ payment_url: paymentUrl });
  } catch (err) {
    console.error("[subscription/create-payment] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
