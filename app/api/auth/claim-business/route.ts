import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase-admin";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/claim-business
 * Called after client-side signUp succeeds.
 * Links the new auth user to the anonymous business they just created.
 */
export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    // Read the auth user from session cookies set by the browser client
    let response = NextResponse.next({ request: req });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set({ name, value, ...options });
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Upsert into public.users
    const { error: userError } = await supabaseAdmin.from("users").upsert({
      id: user.id,
      email: user.email!,
    });
    if (userError) console.error("Failed to upsert user row:", userError);

    // Link business to the new user — only if still unclaimed (user_id IS NULL)
    const { error: bizError } = await supabaseAdmin
      .from("businesses")
      .update({ user_id: user.id })
      .eq("id", businessId)
      .is("user_id", null);

    if (bizError) {
      console.error("Failed to claim business:", bizError);
      return NextResponse.json({ error: "Failed to link business" }, { status: 500 });
    }

    // Initialize user points (ignoring duplicates if they already exist)
    const { error: pointsError } = await supabaseAdmin.from("user_points").upsert({
      user_id: user.id,
      business_id: businessId,
      total_points: 0,
      level: 1
    }, { onConflict: 'user_id, business_id' });
    
    if (pointsError) console.error("Failed to init user points:", pointsError);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Claim business error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
