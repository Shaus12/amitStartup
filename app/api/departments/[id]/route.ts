import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { data: dept, error } = await supabase
      .from("departments")
      .update({
        position_x: body.positionX,
        position_y: body.positionY,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(dept);
  } catch (err: any) {
    console.error("Department update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
