import { Sidebar } from "@/components/layout/Sidebar";
import { FloatingAgent } from "@/components/dashboard/FloatingAgent";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const business = !user
    ? null
    : await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("onboarding_completed", true)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      {business && <FloatingAgent businessId={business.id} />}
      {business && <FeedbackWidget businessId={business.id} />}
    </div>
  );
}
