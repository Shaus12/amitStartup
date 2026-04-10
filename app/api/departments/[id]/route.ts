import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const dept = await prisma.department.update({
      where: { id },
      data: {
        positionX: body.positionX,
        positionY: body.positionY,
      },
    });
    return NextResponse.json(dept);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
