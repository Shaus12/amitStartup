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
    const response = NextResponse.next({ request: req });
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

    // Legacy anonymous claim flow is disabled until it's bound to a server-issued claim session.
    // This prevents authenticated users from claiming arbitrary unowned business IDs.
    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id, user_id")
      .eq("id", businessId)
      .maybeSingle();
    if (businessError) {
      console.error("Failed to fetch business before claim:", businessError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    if (business.user_id === user.id) {
      return NextResponse.json({ success: true });
    }
    if (business.user_id !== null) {
      return NextResponse.json({ error: "Business already claimed" }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Anonymous claim flow is disabled. Please complete onboarding while signed in." },
      { status: 410 }
    );

  } catch (err: unknown) {
    console.error("Claim business error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
