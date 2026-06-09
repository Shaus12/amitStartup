import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: report, error } = await supabaseAdmin
      .from("analysis_reports")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[analysis-report/latest] fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
    }

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ reportId: report.id });
  } catch (err) {
    console.error("[analysis-report/latest] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
