import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rateLimit = checkRateLimit(req, `process-breakdown:${user.id}`, 20, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { processName, departmentName, isManual, frequency, hoursPerWeek } = await req.json();
    if (!processName || !departmentName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const prompt = `You are a business process analyst. Break down the following business process into its constituent sub-steps. For each sub-step, determine if it can be automated with AI or software tools.

Process: "${processName}"
Department: "${departmentName}"
Is manual: ${isManual ? "yes" : "no"}
Frequency: ${frequency || "unknown"}
Hours per week: ${hoursPerWeek || "unknown"}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "subSteps": [
    {
      "name": "short step name in Hebrew",
      "automatable": true,
      "description": "brief description of this step in Hebrew (1-2 sentences)",
      "tool": "name of AI tool or software that can automate this (optional, only if clearly automatable)"
    }
  ],
  "automationPotential": "high|medium|low",
  "timeEstimate": "estimated time this process takes per week in Hebrew"
}

Rules:
- 3-7 sub-steps total
- Be specific and practical
- Hebrew language for all text
- Only include "tool" field if there's a clear automation tool (e.g., "Make.com", "Zapier", "ChatGPT", "Buffer")
- automationPotential: high if 60%+ steps automatable, medium if 30-60%, low if under 30%`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (message.content[0] as { type: string; text: string }).text.trim();
    const clean = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const data = JSON.parse(clean);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Breakdown error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
