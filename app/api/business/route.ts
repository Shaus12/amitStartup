import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const business = await prisma.business.findFirst({
      where: { onboardingCompleted: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(business);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
