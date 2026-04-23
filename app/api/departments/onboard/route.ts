import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { departmentId, businessId, processes, tools, hoursPerWeek, mainPain } = body as {
    departmentId: string;
    businessId: string;
    processes: string[];
    tools: string[];
    hoursPerWeek: number;
    mainPain: string;
  };

  if (!departmentId || !businessId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify business ownership
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .single();

  if (!business) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const inserts: object[] = [];

  // Insert processes
  for (const proc of (processes ?? [])) {
    const trimmed = proc.trim();
    if (!trimmed) continue;
    inserts.push({
      business_id: businessId,
      department_id: departmentId,
      category: "process",
      content: trimmed,
      metadata: {
        originalName: trimmed,
        isManual: true,
        hoursPerWeek: hoursPerWeek > 0 ? Math.round(hoursPerWeek / Math.max(processes.length, 1)) : null,
      },
    });
  }

  // Insert tools as insight
  if (tools && tools.length > 0) {
    inserts.push({
      business_id: businessId,
      department_id: departmentId,
      category: "insight",
      content: `כלים: ${tools.join(", ")}`,
      metadata: { tools },
    });
  }

  // Insert main pain
  if (mainPain?.trim()) {
    inserts.push({
      business_id: businessId,
      department_id: departmentId,
      category: "main_pain",
      content: mainPain.trim(),
      metadata: {},
    });
  }

  if (inserts.length > 0) {
    const { error } = await supabaseAdmin.from("business_knowledge").insert(inserts);
    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: "Failed to save department data" }, { status: 500 });
    }
  }

  // Trigger opportunity generation for this business
  try {
    const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    const generateRes = await fetch(`${appUrl}/api/opportunities/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    });
    if (!generateRes.ok) {
      console.error("Opportunity generation returned non-OK status:", generateRes.status);
    }
  } catch (e) {
    console.error("Opportunity gen error:", e);
  }

  return NextResponse.json({ success: true });
}
