import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function Home() {
  const business = await prisma.business.findFirst({
    where: { onboardingCompleted: true },
    orderBy: { createdAt: "desc" },
  });

  if (business) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
