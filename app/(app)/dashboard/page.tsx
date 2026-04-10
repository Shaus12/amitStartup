import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const business = await prisma.business.findFirst({
    where: { onboardingCompleted: true },
    orderBy: { createdAt: "desc" },
  });
  if (!business) redirect("/onboarding");
  return <DashboardClient businessId={business.id} businessName={business.name} />;
}
