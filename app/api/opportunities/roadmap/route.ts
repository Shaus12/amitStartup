import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/opportunities/roadmap  { id, status }
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !["backlog", "in_progress", "done"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const updated = await prisma.aiOpportunity.update({
      where: { id },
      data: { roadmapStatus: status },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// GET /api/opportunities/roadmap?businessId=xxx
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
  const opportunities = await prisma.aiOpportunity.findMany({
    where: { businessId, dismissedAt: null },
    include: { department: { select: { name: true, color: true } } },
    orderBy: { generatedAt: "desc" },
  });
  return NextResponse.json(opportunities);
}
