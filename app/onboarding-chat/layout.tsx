import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

export default async function OnboardingChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: business } = await supabaseAdmin
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

  return children;
}
