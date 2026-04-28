import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const owned = await verifyBusinessAccess(supabase, businessId, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: gift, error } = await supabase
      .from("business_gifts")
      .select("id, business_id, template_id, gift_type, content, viewed_at, created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!gift) return NextResponse.json({ gift: null });

    return NextResponse.json({
      gift: {
        id: gift.id,
        businessId: gift.business_id,
        templateId: gift.template_id,
        giftType: gift.gift_type,
        content: gift.content,
        viewedAt: gift.viewed_at,
        createdAt: gift.created_at,
      },
    });
  } catch (err) {
    console.error("[gifts] GET failed:", err);
    return NextResponse.json({ error: "Failed to fetch gift" }, { status: 500 });
  }
}
