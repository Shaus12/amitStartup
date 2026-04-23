import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = supabase
      .from("businesses")
      .select("*")
      .eq("onboarding_completed", true)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const { data: business, error } = await query.single();

    if (error) throw error;
    
    // Fetch additional data
    const [
      { data: healthScore },
      { count: openTasksCount },
      { data: userPoints }
    ] = await Promise.all([
      // Health Score
      supabase
        .from("business_health_scores")
        .select("*")
        .eq("business_id", business.id)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .single(),
      
      // Tasks count
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id)
        .neq("status", "done"),
        
      // User Points (if user is linked)
      business.user_id ? 
        supabase
          .from("user_points")
          .select("total_points, level")
          .eq("business_id", business.id)
          .eq("user_id", business.user_id)
          .single() 
        : Promise.resolve({ data: { total_points: 0, level: 1 } })
    ]);

    let finalHealthScore = healthScore;

    // Daily tip refresh check
    if (healthScore && healthScore.calculated_at) {
      const today = new Date().toISOString().split("T")[0];
      const calcDate = new Date(healthScore.calculated_at).toISOString().split("T")[0];
      
      if (calcDate < today) {
        // Import must be dynamic or handled if we didn't add it to the top
        const { generateDailyTip } = await import("@/lib/ai/analyzeBusinessData");
        
        // Fetch knowledge to generate tip
        const { data: knowledgeRows } = await supabase
          .from("business_knowledge")
          .select("category, content")
          .eq("business_id", business.id);

        const newTip = await generateDailyTip(knowledgeRows || []);
        
        const { data: updatedHS } = await supabase
          .from("business_health_scores")
          .update({
            daily_tip: newTip,
            calculated_at: new Date().toISOString()
          })
          .eq("id", healthScore.id)
          .select()
          .single();
          
        if (updatedHS) finalHealthScore = updatedHS;
      }
    }

    return NextResponse.json({
      ...business,
      latest_health_score: finalHealthScore?.score || null,
      open_tasks_count: openTasksCount || 0,
      total_points: userPoints?.total_points || 0,
      level: userPoints?.level || 1,
    });
  } catch (err: any) {
    console.error("Business route error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
