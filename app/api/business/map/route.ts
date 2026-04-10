import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    const departments = await prisma.department.findMany({
      where: { businessId },
      include: {
        processes: { orderBy: { sortOrder: "asc" } },
        painPoints: true,
        aiOpportunities: {
          where: { dismissedAt: null },
          select: { id: true, title: true, impactType: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, industry: true, businessType: true },
    });

    return NextResponse.json({ business, departments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
