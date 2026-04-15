import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisPrompt, buildChatPrompt } from "./prompts";

// ── Output types ──────────────────────────────────────────────────────────────

export interface OpportunityResult {
  title: string;
  description: string;
  impact_type: string;          // "time" | "money" | "growth"
  estimated_hours_saved: number | null;
  estimated_cost_saved: number | null;
  priority: number;             // 1–5
  department_name: string | null;
}

export interface DepartmentAnalysis {
  department_name: string;
  health_score: number;
  main_pain: string;            // Hebrew
  first_action: string;         // English
  opportunities: OpportunityResult[];
}

export interface AnalysisResult {
  overall_health_score: number;
  daily_tip: string;            // Hebrew
  biggest_pain: string;         // Hebrew
  departments: DepartmentAnalysis[];
  // Flattened for backward compat with existing route / UI
  opportunities: OpportunityResult[];
  summary: {
    topPriority: string;
    totalHoursSaved: number;
    totalMonthlySavings: number;
  };
  healthScore: {
    score: number;
    breakdown: any;
    dailyTip: string;
  };
}

// ── Stub ──────────────────────────────────────────────────────────────────────

const STUB_RESULT: AnalysisResult = {
  overall_health_score: 65,
  daily_tip: "תחל בתיעוד כל התהליכים הידניים החוזרים שלך — זו נקודת ההתחלה לכל אוטומציה.",
  biggest_pain: "עסק עם עומסי עבודה ידניים גבוהים שמקשים על צמיחה.",
  departments: [
    {
      department_name: "Customer Support",
      health_score: 60,
      main_pain: "מענה ידני לפניות לקוחות גוזל זמן רב.",
      first_action: "Set up an AI-powered FAQ chatbot to handle the top 10 most common inquiries.",
      opportunities: [
        {
          title: "AI Support Triage Agent",
          description: "Deploy an AI agent that handles first-line customer support queries automatically.",
          impact_type: "time",
          estimated_hours_saved: 12,
          estimated_cost_saved: 1800,
          priority: 1,
          department_name: "Customer Support",
        },
        {
          title: "Automated Follow-up Emails",
          description: "Send automated follow-up emails after ticket resolution to improve CSAT.",
          impact_type: "growth",
          estimated_hours_saved: 3,
          estimated_cost_saved: 500,
          priority: 3,
          department_name: "Customer Support",
        },
      ],
    },
  ],
  opportunities: [],  // populated below after declaration
  summary: {
    topPriority: "Deploy Support Triage Agent",
    totalHoursSaved: 15,
    totalMonthlySavings: 2300,
  },
  healthScore: {
    score: 65,
    breakdown: {},
    dailyTip: "תחל בתיעוד כל התהליכים הידניים החוזרים שלך.",
  },
};
// Populate flattened opportunities from departments
STUB_RESULT.opportunities = STUB_RESULT.departments.flatMap((d) =>
  d.opportunities.map((o) => ({ ...o, department_name: d.department_name }))
);

// ── Main analysis function ────────────────────────────────────────────────────

export async function analyzeBusinessData(
  knowledgeRows: Array<{ category: string; content: string; metadata?: any }>,
  departmentNames: string[] = []
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (process.env.USE_AI_STUB === "true" || !apiKey) {
    await new Promise((r) => setTimeout(r, 1500));
    return STUB_RESULT;
  }

  const client = new Anthropic({ apiKey });
  const prompt = buildAnalysisPrompt(knowledgeRows, departmentNames);

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    let text = textBlock.text.trim();
    
    // Log raw response for debugging
    console.log("[Claude raw response excerpt]:", text.slice(0, 300));
    
    // Strip markdown code fences (handles ```json ... ``` or ``` ... ```)
    if (text.startsWith("```")) {
      text = text
        .replace(/^```(?:json)?\s*/, "")
        .replace(/\s*```\s*$/, "")
        .trim();
    }

    let parsed: {
      overall_health_score: number;
      daily_tip: string;
      biggest_pain: string;
      departments: DepartmentAnalysis[];
    };
    
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      console.error("[Claude JSON parse failed]. Raw text:", text.slice(0, 500));
      throw new Error(`JSON parse failed: ${(parseErr as Error).message}`);
    }

    // Validate the expected structure
    if (!parsed.departments || !Array.isArray(parsed.departments)) {
      console.error("[Unexpected Claude structure]:", JSON.stringify(parsed).slice(0, 300));
      throw new Error("Claude response missing 'departments' array");
    }

    console.log(`[Claude] Parsed ${parsed.departments.length} departments, opportunities:`,
      parsed.departments.map(d => `${d.department_name}: ${d.opportunities?.length ?? 0}`).join(", ")
    );


    // Flatten departments → opportunities for backward compat
    const allOpportunities: OpportunityResult[] = (parsed.departments ?? []).flatMap(
      (d) => (d.opportunities ?? []).map((o) => ({ ...o, department_name: d.department_name }))
    );

    const totalHours = allOpportunities.reduce((s, o) => s + (o.estimated_hours_saved ?? 0), 0);
    const totalSavings = allOpportunities.reduce((s, o) => s + (o.estimated_cost_saved ?? 0), 0);

    return {
      overall_health_score: parsed.overall_health_score,
      daily_tip: parsed.daily_tip,
      biggest_pain: parsed.biggest_pain,
      departments: parsed.departments ?? [],
      // Backward-compat fields
      opportunities: allOpportunities,
      summary: {
        topPriority: allOpportunities[0]?.title ?? "",
        totalHoursSaved: totalHours,
        totalMonthlySavings: totalSavings,
      },
      healthScore: {
        score: parsed.overall_health_score,
        breakdown: {},
        dailyTip: parsed.daily_tip,
      },
    };
  } catch (err: any) {
    console.error("Claude API error or JSON parsing failed:", err);
    throw new Error(`Claude analysis failed: ${err.message}`);
  }
}

// ── Chat function ─────────────────────────────────────────────────────────────

export async function callClaudeForChat(
  knowledgeRows: Array<{ category: string; content: string }>,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "AI is currently disabled. Please set the Anthropic API key.";

  const client = new Anthropic({ apiKey });
  const { systemPrompt, messages } = buildChatPrompt(knowledgeRows, conversationHistory, userMessage);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages as any,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? textBlock.text : "No response generated";
  } catch (e: any) {
    console.error("Claude chat error:", e);
    return `Error: ${e.message}`;
  }
}
