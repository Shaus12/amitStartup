import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function Home() {
  // Skip auth check if Supabase env vars are not configured
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .eq("onboarding_completed", true)
        .limit(1)
        .maybeSingle();
        
      if (business) {
        redirect("/dashboard");
      }
    }
  }

  return <LandingPage />;
}
