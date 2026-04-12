import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const owned = await verifyBusinessAccess(supabase, businessId, user);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Fetch business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id, name, industry")
      .eq("id", businessId)
      .single();

    if (bizError) throw bizError;

    // Fetch departments with their AI opportunities
    const { data: departments, error: depError } = await supabase
      .from("departments")
      .select("*, ai_opportunities(id, title, impact_type)")
      .eq("business_id", businessId);

    if (depError) throw depError;

    // Fetch processes from the onboarding session JSONB snapshot
    const { data: session } = await supabase
      .from("onboarding_sessions")
      .select("answers")
      .eq("business_id", businessId)
      .limit(1)
      .single();

    const answers = (session?.answers as any) ?? {};
    const allProcesses: any[] = answers.processes ?? [];

    // Normalize departments to camelCase for the UI components
    const normalizedDepts = (departments ?? []).map((dept) => {
      // Filter processes that belong to this department from the JSONB snapshot
      const deptProcesses = allProcesses
        .filter((p) => p.departmentName?.toLowerCase() === dept.name?.toLowerCase())
        .map((p) => ({
          id: `${dept.id}-${p.name}`,
          name: p.name,
          frequency: p.frequency ?? null,
          timeSpentHrsPerWeek: p.hoursPerWeek ?? null,
          isManual: p.isManual ?? false,
          isRepetitive: false,
        }));

      return {
        id: dept.id,
        name: dept.name,
        color: dept.color,
        headcount: dept.headcount ?? null,
        // camelCase aliases for React Flow / UI components
        positionX: dept.position_x ?? 0,
        positionY: dept.position_y ?? 0,
        status: "active",
        sortOrder: 0,
        description: null,
        icon: null,
        // Processes from JSONB snapshot
        processes: deptProcesses,
        // Pain points placeholder (not stored in DB separately)
        painPoints: [],
        // AI opportunities — normalize to camelCase
        aiOpportunities: (dept.ai_opportunities ?? []).map((o: any) => ({
          id: o.id,
          title: o.title,
          impactType: o.impact_type,
        })),
      };
    });

    return NextResponse.json({ business, departments: normalizedDepts });
  } catch (err: any) {
    console.error("Map route error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
