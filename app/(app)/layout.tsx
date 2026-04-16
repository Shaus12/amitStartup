import { Sidebar } from "@/components/layout/Sidebar";
import { FloatingAgent } from "@/components/dashboard/FloatingAgent";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let businessQuery = supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("onboarding_completed", true)
    .order("created_at", { ascending: false })
    .limit(1);

  if (user) {
    businessQuery = businessQuery.eq("user_id", user.id);
  } else {
    businessQuery = businessQuery.is("user_id", null);
  }

  const { data: business } = await businessQuery.single();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      {business && <FloatingAgent businessId={business.id} />}
    </div>
  );
}
