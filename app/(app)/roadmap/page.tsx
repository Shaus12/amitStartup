import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoadmapClient } from "./RoadmapClient";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const business = await prisma.business.findFirst({
    where: { onboardingCompleted: true },
    orderBy: { createdAt: "desc" },
  });
  if (!business) redirect("/onboarding");
  return <RoadmapClient businessId={business.id} businessName={business.name} />;
}
