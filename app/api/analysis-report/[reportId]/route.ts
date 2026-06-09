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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("trial_ends_at, subscription_plan, subscription_ends_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching report user profile:", profileError);
    }

    const now = new Date();
    const trialStarted = Boolean(profile?.trial_ends_at);
    const trialActive = Boolean(profile?.trial_ends_at && new Date(profile.trial_ends_at) > now);
    const subscriptionActive =
      (profile?.subscription_plan === "pro" || profile?.subscription_plan === "business") &&
      (!profile.subscription_ends_at || new Date(profile.subscription_ends_at) > now);

    return NextResponse.json({
      ...report,
      business_id: businessId,
      businessId,
      trialStarted,
      trialActive,
      subscriptionActive,
      hasDashboardAccess: trialActive || subscriptionActive,
    });
  } catch (err: any) {
    console.error("GET analysis-report error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
