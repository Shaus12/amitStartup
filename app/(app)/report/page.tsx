import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReportClient } from "./ReportClient";

export default async function ReportPage() {
  const business = await prisma.business.findFirst({
    where: { onboardingCompleted: true },
    orderBy: { createdAt: "desc" },
    include: {
      departments: {
        include: {
          processes: true,
          painPoints: true,
          aiOpportunities: { where: { dismissedAt: null } },
        },
      },
      goals: true,
      bottlenecks: true,
      tools: true,
      aiOpportunities: {
        where: { dismissedAt: null },
        include: { department: { select: { name: true, color: true } } },
        orderBy: { estimatedCostSaved: "desc" },
      },
    },
  });

  if (!business) redirect("/onboarding");
  return <ReportClient business={business as Parameters<typeof ReportClient>[0]["business"]} />;
}
