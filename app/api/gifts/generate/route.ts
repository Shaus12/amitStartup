import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";
import { generateGiftWithClaude } from "@/lib/ai/gifts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const owned = await verifyBusinessAccess(supabase, businessId, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const [{ data: templates, error: templatesError }, { data: knowledgeRows, error: knowledgeError }, { data: business }] =
        await Promise.all([
          supabase
            .from("gift_templates")
            .select("id, name, selection_prompt, generation_prompt")
            .eq("active", true)
            .order("priority", { ascending: true }),
          supabase
            .from("business_knowledge")
            .select("category, content, metadata")
            .eq("business_id", businessId),
          supabase.from("businesses").select("name").eq("id", businessId).maybeSingle(),
        ]);

      if (templatesError) throw templatesError;
      if (knowledgeError) throw knowledgeError;
      if (!templates || templates.length === 0) {
        console.warn("[gifts/generate] No active templates", { businessId });
        return NextResponse.json({ ok: true, generated: false });
      }

      const gift = await generateGiftWithClaude({
        templates,
        knowledgeRows: knowledgeRows ?? [],
        businessName: business?.name ?? null,
        usageContext: {
          businessId,
          userId: user?.id ?? null,
        },
      });

      const { error: insertError } = await supabase.from("business_gifts").insert({
        business_id: businessId,
        template_id: gift.template.id,
        gift_type: gift.template.name,
        content: gift.content,
      });
      if (insertError) throw insertError;

      return NextResponse.json({ ok: true, generated: true });
    } catch (giftError) {
      // Gift is optional; failures are intentionally non-blocking.
      console.error("[gifts/generate] Gift generation failed silently", {
        businessId,
        error: giftError,
      });
      return NextResponse.json({ ok: true, generated: false });
    }
  } catch (err) {
    console.error("[gifts/generate] Request failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
