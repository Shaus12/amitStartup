import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OpportunitiesClient } from "./OpportunitiesClient";

export default async function OpportunitiesPage() {
  const business = await prisma.business.findFirst({
    where: { onboardingCompleted: true },
    orderBy: { createdAt: "desc" },
  });
  if (!business) redirect("/onboarding");
  return <OpportunitiesClient businessId={business.id} businessName={business.name} />;
}
