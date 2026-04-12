import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  try {
    const { id } = await params;

    // Fetch the department to get its business_id for ownership check
    const { data: dept } = await supabase
      .from("departments")
      .select("id, business_id")
      .eq("id", id)
      .single();

    if (!dept) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const owned = await verifyBusinessAccess(supabase, dept.business_id, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { data: updated, error } = await supabase
      .from("departments")
      .update({
        position_x: body.positionX,
        position_y: body.positionY,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Department update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
