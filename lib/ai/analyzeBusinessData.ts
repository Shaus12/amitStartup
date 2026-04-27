import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisPrompt, buildChatPrompt, buildConstraintQuestionPrompt, buildProjectPlanPrompt } from "./prompts";
import { logClaudeApiUsage } from "./api-usage";

// ── Output types ──────────────────────────────────────────────────────────────

export interface OpportunityResult {
  title: string;
  description: string;
  impact_type: string;          // "time" | "money" | "growth"
  estimated_hours_saved: number | null;
  estimated_cost_saved: number | null;
  priority: number;             // 1–5
  department_name: string | null;
  is_quick_win?: boolean;       // implementable <3h, no new tool, visible result same day
  notification_hook?: string;   // max 12-word motivating copy
  proof_of_value?: string;      // trust-building sentence tailored to their context
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
          is_quick_win: false,
          notification_hook: "Save 12 hours a week on customer support.",
          proof_of_value: "Small service businesses typically cut first-response time by 80% after deploying a triage agent.",
        },
        {
          title: "Automated Follow-up Emails",
          description: "Send automated follow-up emails after ticket resolution to improve CSAT.",
          impact_type: "growth",
          estimated_hours_saved: 3,
          estimated_cost_saved: 500,
          priority: 3,
          department_name: "Customer Support",
          is_quick_win: true,
          notification_hook: "Set up once, follow up automatically — forever.",
          proof_of_value: "Businesses that automate follow-ups see 20% higher repeat customer rates.",
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
  departmentNames: string[] = [],
  usageContext?: { businessId?: string | null; userId?: string | null }
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
    await logClaudeApiUsage({
      businessId: usageContext?.businessId,
      userId: usageContext?.userId,
      callType: "analysis",
      model: "claude-sonnet-4-6",
      usage: message.usage,
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
  userMessage: string,
  usageContext?: { businessId?: string | null; userId?: string | null }
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
    await logClaudeApiUsage({
      businessId: usageContext?.businessId,
      userId: usageContext?.userId,
      callType: "chat",
      model: "claude-sonnet-4-6",
      usage: response.usage,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? textBlock.text : "No response generated";
  } catch (e: any) {
    console.error("Claude chat error:", e);
    return `Error: ${e.message}`;
  }
}

// ── Daily Tip function ────────────────────────────────────────────────────────

export async function generateDailyTip(
  knowledgeRows: Array<{ category: string; content: string }>,
  usageContext?: { businessId?: string | null; userId?: string | null }
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "התמקד בתיעוד תהליכים ידניים כיום כדי לחסוך זמן מחר.";

  const client = new Anthropic({ apiKey });
  
  const systemPrompt = `You are a highly analytical business AI assistant for a small business.
Your goal is to generate a single, highly actionable daily tip in Hebrew (עברית) for the business owner.
The tip MUST perfectly target their biggest current pain point based on their business profile.
BAD: "שפר השיווק שלך" (Improve your marketing)
GOOD: "היום: הקדש 20 דקות לכתיבת 3 תבניות תגובה לשאלות נפוצות של לקוחות — זה יחסוך לך שעה בשבוע"
Return ONLY the Hebrew string. No quotes, no intro, no emojis.`;

  const userPrompt = `Here is the business knowledge:\n${JSON.stringify(knowledgeRows)}\n\nPlease provide a highly specific, 1-sentence actionable daily tip in Hebrew addressing their biggest bottleneck or pain.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 150,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    await logClaudeApiUsage({
      businessId: usageContext?.businessId,
      userId: usageContext?.userId,
      callType: "daily_tip",
      model: "claude-sonnet-4-6",
      usage: response.usage,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? textBlock.text.trim().replace(/^["']|["']$/g, '') : "בדוק את רשימת המשימות שלך וסגור משימות ישנות.";
  } catch (e: any) {
    console.error("Claude daily tip error:", e);
    return "זכור שכל דקה שאתה חוסך שווה יותר עבור העסק שלך.";
  }
}

// ── Project Planning functions ────────────────────────────────────────────────

export async function generateConstraintQuestion(
  knowledgeRows: Array<{ category: string; content: string }>,
  goal: string,
  timeline: string,
  usageContext?: { businessId?: string | null; userId?: string | null }
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "האם יש מגבלות תקציב או משאבים שכדאי לקחת בחשבון?";

  const client = new Anthropic({ apiKey });
  const prompt = buildConstraintQuestionPrompt(knowledgeRows, goal, timeline);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });
    await logClaudeApiUsage({
      businessId: usageContext?.businessId,
      userId: usageContext?.userId,
      callType: "project_planning",
      model: "claude-sonnet-4-6",
      usage: response.usage,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? textBlock.text.trim() : "האם יש מגבלות מסוימות לצוות?";
  } catch (e: any) {
    console.error("Claude constraint question error:", e);
    return "האם יש מגבלות מסוימות לצוות או לתקציב?";
  }
}

export async function generateProjectPlan(
  knowledgeRows: Array<{ category: string; content: string }>,
  conversationHistory: Array<{ role: string; content: string }>,
  usageContext?: { businessId?: string | null; userId?: string | null }
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "AI is disabled. Please configure your API key to generate a project.";

  const client = new Anthropic({ apiKey });
  const prompt = buildProjectPlanPrompt(knowledgeRows, conversationHistory);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    await logClaudeApiUsage({
      businessId: usageContext?.businessId,
      userId: usageContext?.userId,
      callType: "project_planning",
      model: "claude-sonnet-4-6",
      usage: response.usage,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? textBlock.text : "No plan generated";
  } catch (e: any) {
    console.error("Claude project plan error:", e);
    return `Error generating plan: ${e.message}`;
  }
}
