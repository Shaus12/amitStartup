import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    const opportunities = await prisma.aiOpportunity.findMany({
      where: { businessId, dismissedAt: null },
      include: {
        department: { select: { name: true, color: true } },
      },
      orderBy: [{ pinned: "desc" }, { estimatedHoursSaved: "desc" }],
    });

    return NextResponse.json(opportunities);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, pinned, dismiss } = await req.json();
    const data: { pinned?: boolean; dismissedAt?: Date | null } = {};
    if (pinned !== undefined) data.pinned = pinned;
    if (dismiss !== undefined) data.dismissedAt = dismiss ? new Date() : null;

    const opp = await prisma.aiOpportunity.update({ where: { id }, data });
    return NextResponse.json(opp);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
