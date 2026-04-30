import { NextResponse } from "next/server";

// Payment gateway not yet configured — returns 503 so the UI can handle gracefully.
export async function POST() {
  return NextResponse.json({ error: "Payment gateway not configured yet" }, { status: 503 });
}
