import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserRoute } from "@/lib/user-routing";
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

  if (!user) {
    redirect("/checkout");
  }

  const route = await getUserRoute(supabaseAdmin, user.id);
  if (route === "/checkout") {
    redirect("/checkout");
  }
  if (route === "/subscription-expired") {
    redirect("/subscription-expired");
  }
  if (route === "/dashboard") {
    redirect("/dashboard");
  }
  if (route === "/analysis-latest") {
    redirect("/analysis-latest");
  }

  return children;
}
