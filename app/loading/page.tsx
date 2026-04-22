import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoadingAnalysis } from "@/components/onboarding/LoadingAnalysis";

export default async function LoadingAnalysisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/onboarding");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center" style={{ backgroundColor: "#111319" }} />
      }
    >
      <LoadingAnalysis />
    </Suspense>
  );
}
