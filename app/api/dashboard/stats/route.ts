import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");
    
    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }

    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    const owned = await verifyBusinessAccess(supabase, businessId, user);
    if (!owned || !user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 1. Record user session (one row per user + business + calendar day)
    // Avoid upsert ... onConflict: DB may not have a matching UNIQUE for those columns (42P10).
    const today = new Date().toISOString().split("T")[0];

    const { data: existingSession } = await supabase
      .from("user_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("business_id", businessId)
      .eq("session_date", today)
      .maybeSingle();

    if (!existingSession) {
      const { error: sessionError } = await supabase.from("user_sessions").insert({
        user_id: user.id,
        business_id: businessId,
        session_date: today,
      });
      if (sessionError && sessionError.code !== "23505") {
        console.error("Session recording error", sessionError);
      }
    }

    // 2. Fetch all session dates to calculate streak
    const { data: sessions } = await supabase
      .from("user_sessions")
      .select("session_date")
      .eq("user_id", user.id)
      .eq("business_id", businessId)
      .order("session_date", { ascending: false });

    let currentStreak = 0;
    if (sessions && sessions.length > 0) {
      const sessionDates = new Set(sessions.map(s => s.session_date));
      let currentCheckDate = new Date(); 
      
      while (true) {
        const checkStr = currentCheckDate.toISOString().split('T')[0];
        if (sessionDates.has(checkStr)) {
          currentStreak++;
          currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      if (currentStreak === 0) currentStreak = 1;
    }

    // 3. Fetch completed tasks this week & total hours saved
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: doneTasks } = await supabase
      .from("tasks")
      .select("completed_at, estimated_hours, actual_hours_saved")
      .eq("business_id", businessId)
      .eq("status", "done");

    let tasksCompletedThisWeek = 0;
    let hoursSaved = 0;

    if (doneTasks) {
      for (const t of doneTasks) {
        if (t.completed_at && new Date(t.completed_at) >= weekAgo) {
          tasksCompletedThisWeek++;
        }
        hoursSaved += (t.actual_hours_saved ?? t.estimated_hours ?? 0);
      }
    }

    // 4. Fetch health score
    const { data: healthRecord } = await supabase
      .from("business_health_scores")
      .select("score")
      .eq("business_id", businessId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .single();

    const healthScore = healthRecord?.score ?? 0;

    return NextResponse.json({
      tasks_completed_this_week: tasksCompletedThisWeek,
      hours_saved: hoursSaved,
      health_score: healthScore,
      streak: currentStreak
    });

  } catch (err: any) {
    console.error("Stats tracking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
