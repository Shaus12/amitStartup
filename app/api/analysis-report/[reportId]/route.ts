import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reportId = (await params).reportId;
    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    const { data: report, error } = await supabaseAdmin
      .from("analysis_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error || !report) {
      console.error("Error fetching report:", error);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Verify ownership
    if (report.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to report" }, { status: 403 });
    }

    const existingBusinessId = typeof report.business_id === "string" ? report.business_id : null;
    let businessId = existingBusinessId;

    if (!businessId) {
      const { data: business, error: businessError } = await supabaseAdmin
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .eq("onboarding_completed", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (businessError) {
        console.error("Error fetching report business:", businessError);
      }

      businessId = business?.id ?? null;
    }

    return NextResponse.json({
      ...report,
      business_id: businessId,
      businessId,
    });
  } catch (err: any) {
    console.error("GET analysis-report error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
