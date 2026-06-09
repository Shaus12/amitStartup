import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionExpiredClient } from "./SubscriptionExpiredClient";

export default async function SubscriptionExpiredPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/checkout");
  }

  return <SubscriptionExpiredClient />;
}
