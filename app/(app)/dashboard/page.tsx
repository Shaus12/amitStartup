import { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, name, user_id")
    .eq("onboarding_completed", true)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh]" style={{ backgroundColor: "#111319" }} aria-hidden />
      }
    >
      <DashboardClient businessId={business.id} businessName={business.name} />
    </Suspense>
  );
}
