import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const body = await req.json();
    const { status, actualHoursSaved, actualMoneySaved } = body;

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    // Fetch existing task to check ownership
    const { data: existing } = await supabase
      .from("tasks")
      .select("id, business_id, status")
      .eq("id", taskId)
      .single();

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const owned = await verifyBusinessAccess(supabase, existing.business_id, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (actualHoursSaved !== undefined) updates.actual_hours_saved = actualHoursSaved;
    if (actualMoneySaved !== undefined) updates.actual_money_saved = actualMoneySaved;
    
    // If marking as done
    if (status === "done" && existing.status !== "done") {
      updates.completed_at = new Date().toISOString();
    }

    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;

    // Handle rewards if user is logged in
    if (status === "done" && existing.status !== "done" && user) {
      // Create point_event
      await supabase.from("point_events").insert({
        user_id: user.id,
        business_id: existing.business_id,
        event_type: "task_completed",
        points_earned: 50,
        reference_id: taskId
      });

      // 2. Add points
      const { data: currentPoints } = await supabase
        .from("user_points")
        .select("total_points")
        .eq("user_id", user.id)
        .eq("business_id", existing.business_id)
        .single();
        
      if (currentPoints) {
        await supabase
          .from("user_points")
          .update({ total_points: currentPoints.total_points + 50 })
          .eq("user_id", user.id)
          .eq("business_id", existing.business_id);
      }
    }

    let newScore = null;
    if (status === "done" && existing.status !== "done") {
      // Recalculate business health score
      let hoursSaved = existing.estimated_hours || 2; // Default if null
      if (existing.opportunity_id) {
        const { data: opp } = await supabase
          .from("ai_opportunities")
          .select("estimated_hours_saved")
          .eq("id", existing.opportunity_id)
          .single();
        if (opp?.estimated_hours_saved) hoursSaved = opp.estimated_hours_saved;
      }

      const { data: currentScoreRow } = await supabase
        .from("business_health_scores")
        .select("*")
        .eq("business_id", existing.business_id)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .single();
        
      if (currentScoreRow) {
        const calcScore = Math.min(100, Math.round(currentScoreRow.score + (hoursSaved * 0.5)));
        newScore = calcScore;
        await supabase
          .from("business_health_scores")
          .update({ score: calcScore })
          .eq("id", currentScoreRow.id);
      }
    }

    return NextResponse.json({ ...updatedTask, new_health_score: newScore });
  } catch (err: any) {
    console.error("Task patch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
