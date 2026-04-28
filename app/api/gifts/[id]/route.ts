import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const { data: gift, error: giftError } = await supabase
      .from("business_gifts")
      .select("id, business_id")
      .eq("id", id)
      .maybeSingle();
    if (giftError) throw giftError;
    if (!gift) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const owned = await verifyBusinessAccess(supabase, gift.business_id, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await supabase
      .from("business_gifts")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, viewed_at")
      .single();
    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      viewedAt: data.viewed_at,
    });
  } catch (err) {
    console.error("[gifts/:id] PATCH failed:", err);
    return NextResponse.json({ error: "Failed to update gift" }, { status: 500 });
  }
}
