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
  department_name?: string | null;
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
    breakdown: unknown;
    dailyTip: string;
  };
}

type RawAnalysisResult = {
  overall_health_score: number;
  daily_tip: string;
  biggest_pain: string;
  departments: RawDepartmentAnalysis[];
};

type RawDepartmentAnalysis = Omit<DepartmentAnalysis, "department_name"> & {
  department_name?: string;
  name?: string;
};

type PartialAnalysisResult = Partial<Omit<RawAnalysisResult, "departments">> & {
  departments?: RawDepartmentAnalysis[];
};

type NormalizedAnalysisResult = Omit<RawAnalysisResult, "departments"> & {
  departments: DepartmentAnalysis[];
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class AnalysisParseError extends Error {
  partial: PartialAnalysisResult;
  responseLength: number;
  responseTail: string;

  constructor(message: string, partial: PartialAnalysisResult, responseText: string) {
    super(message);
    this.name = "AnalysisParseError";
    this.partial = partial;
    this.responseLength = responseText.length;
    this.responseTail = responseText.slice(-200);
  }
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

function stripMarkdownJsonFence(text: string): string {
  if (!text.startsWith("```")) return text;
  return text
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

function extractCompleteJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}

function extractNumberField(text: string, field: string): number | undefined {
  const match = text.match(new RegExp(`"${field}"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
  if (!match) return undefined;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : undefined;
}

function extractStringField(text: string, field: string): string | undefined {
  const match = text.match(new RegExp(`"${field}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`));
  if (!match) return undefined;
  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return match[1];
  }
}

function extractCompleteDepartmentObjects(text: string): RawDepartmentAnalysis[] {
  const keyIndex = text.indexOf("\"departments\"");
  if (keyIndex === -1) return [];
  const arrayStart = text.indexOf("[", keyIndex);
  if (arrayStart === -1) return [];

  const departments: RawDepartmentAnalysis[] = [];
  let objectStart = -1;
  let objectDepth = 0;
  let inString = false;
  let escaped = false;

  for (let i = arrayStart + 1; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
      continue;
    }

    if (ch === "{") {
      if (objectDepth === 0) objectStart = i;
      objectDepth++;
    } else if (ch === "}") {
      objectDepth--;
      if (objectDepth === 0 && objectStart !== -1) {
        try {
          departments.push(JSON.parse(text.slice(objectStart, i + 1)) as RawDepartmentAnalysis);
        } catch {
          // Ignore malformed department objects and keep scanning for later complete ones.
        }
        objectStart = -1;
      }
    } else if (ch === "]" && objectDepth === 0) {
      break;
    }
  }

  return departments;
}

function normalizeAnalysisResult(raw: RawAnalysisResult): NormalizedAnalysisResult {
  return {
    ...raw,
    departments: (raw.departments ?? []).map((department) => ({
      department_name: department.department_name ?? department.name ?? "Unknown",
      health_score: department.health_score,
      main_pain: department.main_pain,
      first_action: department.first_action,
      opportunities: department.opportunities ?? [],
    })),
  };
}

function parseAnalysisResponse(text: string): RawAnalysisResult {
  try {
    return JSON.parse(text) as RawAnalysisResult;
  } catch {
    const jsonObject = extractCompleteJsonObject(text);
    if (jsonObject) {
      return JSON.parse(jsonObject) as RawAnalysisResult;
    }
  }

  const partial: PartialAnalysisResult = {
    overall_health_score: extractNumberField(text, "overall_health_score"),
    daily_tip: extractStringField(text, "daily_tip"),
    biggest_pain: extractStringField(text, "biggest_pain"),
    departments: extractCompleteDepartmentObjects(text),
  };

  if (
    typeof partial.overall_health_score === "number" &&
    partial.daily_tip &&
    partial.biggest_pain &&
    partial.departments &&
    partial.departments.length > 0
  ) {
    console.warn(
      "[Claude JSON partial parse recovered]:",
      partial.departments.length,
      "complete departments"
    );
    return partial as RawAnalysisResult;
  }

  throw new AnalysisParseError("Claude response was not valid JSON and could not be safely recovered", partial, text);
}

// ── Main analysis function ────────────────────────────────────────────────────

export async function analyzeBusinessData(
  knowledgeRows: Array<{ category: string; content: string; metadata?: unknown }>,
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
    
    console.log("[Claude response length]:", text.length);
    console.log("[Claude response tail]:", text.slice(-200));
    console.log("[Claude raw response excerpt]:", text.slice(0, 300));

    text = stripMarkdownJsonFence(text);

    let parsed: NormalizedAnalysisResult;
    
    try {
      parsed = normalizeAnalysisResult(parseAnalysisResponse(text));
    } catch (parseErr) {
      console.error("[Claude JSON parse failed]. Raw text:", text.slice(0, 500));
      throw parseErr;
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
  } catch (err: unknown) {
    if (err instanceof AnalysisParseError) {
      console.error("Claude JSON parsing failed with partial data:", {
        partial: err.partial,
        responseLength: err.responseLength,
        responseTail: err.responseTail,
      });
      throw err;
    }
    console.error("Claude API error or JSON parsing failed:", err);
    throw new Error(`Claude analysis failed: ${errorMessage(err)}`);
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
      messages,
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
  } catch (e: unknown) {
    console.error("Claude chat error:", e);
    return `Error: ${errorMessage(e)}`;
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
  } catch (e: unknown) {
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
  } catch (e: unknown) {
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
  } catch (e: unknown) {
    console.error("Claude project plan error:", e);
    return `Error generating plan: ${errorMessage(e)}`;
  }
}
