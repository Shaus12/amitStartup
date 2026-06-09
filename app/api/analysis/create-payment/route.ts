import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    return words.slice(0, 2).join(" ");
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
    const { phone, fullName } = body as { phone?: unknown; fullName?: unknown };
    const normalizedPhone = normalizePhone(phone);
    const normalizedFullName = ensureTwoWordName(fullName);

    if (!/^05\d{8}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }

    if (typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json({ error: "Invalid full name" }, { status: 400 });
    }

    const makeWebhookUrl = process.env.MAKE_SUBSCRIPTION_WEBHOOK_URL;
    if (!makeWebhookUrl) {
      console.error("[analysis/create-payment] Missing MAKE_SUBSCRIPTION_WEBHOOK_URL");
      return NextResponse.json({ error: "Payment provider is not configured" }, { status: 500 });
    }

    const makePayload = {
      user_id: user.id,
      user_email: user.email ?? "",
      user_name: normalizedFullName,
      phone: normalizedPhone,
      payment_type: "analysis",
      plan: "analysis",
      plan_name: "ניתוח עסקי מלא",
      plan_price: 1,
      success_url: `${appUrl()}/payment-success?type=analysis`,
    };

    console.log("[analysis/create-payment] Make payload:", makePayload);

    const makeRes = await fetch(makeWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePayload),
    });

    if (!makeRes.ok) {
      const errorText = await makeRes.text().catch(() => "");
      console.error("[analysis/create-payment] Make.com request failed", {
        status: makeRes.status,
        statusText: makeRes.statusText,
        body: errorText.slice(0, 500),
      });
      return NextResponse.json({ error: "Payment provider request failed" }, { status: 502 });
    }

    const rawText = await makeRes.text();
    const paymentUrl = extractPaymentUrl(rawText);

    if (!paymentUrl) {
      console.error("[analysis/create-payment] Missing payment_url in Make.com response", {
        body: rawText.slice(0, 500),
      });
      return NextResponse.json({ error: "Payment URL missing" }, { status: 502 });
    }

    return NextResponse.json({ payment_url: paymentUrl });
  } catch (err) {
    console.error("[analysis/create-payment] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
