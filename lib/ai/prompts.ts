// ── Analysis Prompt ───────────────────────────────────────────────────────────

export function buildAnalysisPrompt(
  knowledgeRows: Array<{ category: string; content: string; metadata?: any }>,
  departmentNames: string[]
): string {
  const grouped: Record<string, string[]> = {};
  for (const row of knowledgeRows) {
    if (!grouped[row.category]) grouped[row.category] = [];
    grouped[row.category].push(row.content);
  }

  const knowledgeSection = Object.entries(grouped)
    .map(([cat, items]) => `### ${cat.toUpperCase()}\n${items.map((i) => `- ${i}`).join("\n")}`)
    .join("\n\n");

  const deptList = departmentNames.length > 0
    ? departmentNames.map((d) => `- "${d}"`).join("\n")
    : "- (no departments provided — treat the whole business as one unit)";

  return `You are an elite business operations consultant and AI strategist. Your goal is to analyze the business onboarding data below and produce a deeply personal, insightful, and non-generic AI roadmap.

DEPARTMENTS IN THIS BUSINESS (you MUST include all of them in your response, using EXACT names):
${deptList}

BUSINESS KNOWLEDGE BASE:
${knowledgeSection || "(No onboarding data provided. Infer deeply based on industry, company size, and known patterns.)"}

If the knowledge includes category **ONBOARDING_JSON**, it is the full structured export of every onboarding answer — treat it as authoritative alongside the other rows (when details conflict, prefer ONBOARDING_JSON).

───────────────────────────────────────────────────────────────────
CORE ANALYSIS RULES:
───────────────────────────────────────────────────────────────────
1. INDUSTRY INTELLIGENCE: 
   Use known patterns for the business's industry + size combination. If data is missing, predict bottlenecks logically. For example, a pre-revenue 2-5 person marketing agency will predictably struggle with client acquisition, time tracking, proposal creation, and reporting. Reference these assumed bottlenecks even if not explicitly mentioned.

2. PAIN AMPLIFICATION: 
   For every pain point mentioned (or assumed), state its downstream effect (e.g., "this causes X which leads to Y"), estimate the real cost in time and money, and use a tone that makes the owner feel "they really understand my struggle."

3. SPECIFIC OPPORTUNITIES: 
   Every opportunity MUST feel custom-built. 
   - BAD: "Automate your email responses"
   - GOOD: "Your sales team spends ~3h/week on manual prospect outreach. An AI sequence tool like Instantly.ai could automate initial outreach, freeing those hours for closing deals."
   Always mention: A specific tool recommendation (use real product names like Zapier, Make, ChatGPT Plus, Instantly.ai, Fireflies.ai, etc.), a realistic time/cost saving estimate, and WHY it fits THIS specific business.

4. HEALTH SCORE LOGIC: 
   Scores must reflect reality, not optimism. Base the score on the ratio of manual vs automated processes, tool sophistication, and pain severity.
   - Under 40: Business has significant manual processes and high friction.
   - 40-70: Mixed state, some automation exists but major gaps remain.
   - 70-100: Well-optimized for their size.

5. DEPARTMENT-LEVEL DEPTH: 
   For each department:
   - Provide a realistic health score (do not default to 90+).
   - 'main_pain': Specific to THIS department's data, written in Hebrew, referencing actual processes or assumed bottlenecks.
   - 'first_action': A concrete, highly specific action mentioning a real tool, written in Hebrew.
   - Supply 2-3 highly specific opportunities (using real tool names) per department.

6. DAILY TIP: 
   Must be actionable immediately and specific to their biggest current pain. 
   - BAD: "Improve your marketing."
   - GOOD: "היום: הקדש 20 דקות לכתיבת 3 תבניות תגובה לשאלות נפוצות של לקוחות - זה יחסוך לך שעה בשבוע (Today: Spend 20 mins writing 3 FAQ templates...)."

7. SPARSE DATA HANDLING: 
   When data is minimal:
   - Explicitly state your assumptions in the opportunity descriptions or pain points.
   - Use industry benchmarks for estimates.
   - Weave a request for more information into the opportunity descriptions or main_pain (e.g., "Assuming you do manual outreach, X tool saves Y hours. Let me know your exact CRM to sharpen this.").
   - STILL produce 2-3 highly specific opportunities per department.

───────────────────────────────────────────────────────────────────
REQUIRED OUTPUT — return ONLY valid JSON matching this exact schema:
───────────────────────────────────────────────────────────────────
{
  "overall_health_score": <number 0-100 based on health score logic>,
  "daily_tip": "<one highly actionable, specific tip in HEBREW (עברית) based on biggest pain point>",
  "biggest_pain": "<one sentence in HEBREW (עברית) summarising the main business problem, its downstream effect, and real cost>",
  "departments": [
    {
      "department_name": "<EXACT name from the list above>",
      "health_score": <number 0-100>,
      "main_pain": "<one sentence in HEBREW (עברית) highlighting specific friction and cost>",
      "first_action": "<must be written in Hebrew (עברית) — a single concrete action mentioning a real tool>",
      "opportunities": [
        {
          "title": "<specific, action-oriented title mentioning a real tool — in English>",
          "description": "<detailed sentence explaining the bottleneck, the specific tool to fix it, and the customized impact — in English>",
          "impact_type": "time" | "money" | "growth",
          "estimated_hours_saved": <realistic number per week based on benchmarks>,
          "estimated_cost_saved": <realistic number in ILS per month based on benchmarks>,
          "priority": <1=highest … 5=lowest>
        }
      ]
    }
  ]
}

STRICT RULE: Return ONLY the JSON object. No markdown, no explanation, no code fences.
`;
}

// ── Chat Prompt ───────────────────────────────────────────────────────────────

export function buildChatPrompt(
  knowledgeRows: Array<{ category: string; content: string }>,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string
): { systemPrompt: string; messages: Array<{ role: "user" | "assistant"; content: string }> } {
  const grouped: Record<string, string[]> = {};
  for (const row of knowledgeRows) {
    if (!grouped[row.category]) grouped[row.category] = [];
    grouped[row.category].push(row.content);
  }

  const knowledgeSection = Object.entries(grouped)
    .map(([cat, items]) => `### ${cat.toUpperCase()}\n${items.map((i) => `- ${i}`).join("\n")}`)
    .join("\n\n");

  const systemPrompt = `You are an AI business advisor embedded in a business analysis platform. You have deep knowledge of this specific business based on their onboarding data. Be concise, practical, and specific to their context.

BUSINESS KNOWLEDGE BASE:
${knowledgeSection}

Answer questions about their business, suggest optimizations, help prioritize AI opportunities, and provide actionable advice. Always reference their specific data when relevant. Keep responses concise (2-4 paragraphs max unless they ask for detail).`;

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...conversationHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  return { systemPrompt, messages };
}

// ── Project Planning Prompts ──────────────────────────────────────────────────

export function buildConstraintQuestionPrompt(
  knowledgeRows: Array<{ category: string; content: string }>,
  goal: string,
  timeline: string
): string {
  const grouped: Record<string, string[]> = {};
  for (const row of knowledgeRows) {
    if (!grouped[row.category]) grouped[row.category] = [];
    grouped[row.category].push(row.content);
  }

  const knowledgeSection = Object.entries(grouped)
    .map(([cat, items]) => `### ${cat.toUpperCase()}\n${items.map((i) => `- ${i}`).join("\n")}`)
    .join("\n\n");

  return `You are an AI business advisor. The user wants to start a project.
Goal: ${goal}
Timeline: ${timeline}

BUSINESS KNOWLEDGE BASE:
${knowledgeSection || "(No context provided)"}

Based on their goal, timeline, and business context, ask a SINGLE follow-up question in Hebrew (עברית) about constraints, resources, team size, budget, or anything else highly relevant to planning this effectively. 
Return ONLY the question. Keep it under 15 words.`;
}

export function buildProjectPlanPrompt(
  knowledgeRows: Array<{ category: string; content: string }>,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const grouped: Record<string, string[]> = {};
  for (const row of knowledgeRows) {
    if (!grouped[row.category]) grouped[row.category] = [];
    grouped[row.category].push(row.content);
  }

  const knowledgeSection = Object.entries(grouped)
    .map(([cat, items]) => `### ${cat.toUpperCase()}\n${items.map((i) => `- ${i}`).join("\n")}`)
    .join("\n\n");

  const historySection = conversationHistory
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  return `You are an expert AI project manager. Create a detailed, realistic project plan based on the user's requirements.

BUSINESS KNOWLEDGE BASE:
${knowledgeSection || "(No context provided)"}

CONVERSATION CONTEXT:
${historySection}

You MUST follow the exact markdown format below. 
Do not deviate from this structure even slightly — it will be parsed programmatically:

יצרתי לך את הפרויקט הבא:

📋 **[project name]**
🎯 מטרה: [goal]
⏱ זמן משוער: [X שבועות]

משימות:
1. [task name] — [X שעות]
   - [subtask]
   - [subtask]
2. [task name] — [X שעות]
   - [subtask]

רוצה שאשמור את הפרויקט, או יש שינויים?

RULES:
- Everything (names, tasks, subtasks) must be in Hebrew (עברית).
- Break the project into 3-5 logical main tasks.
- Each main task must have 2-4 subtasks.
- Provide realistic hour estimates for tasks ("שעות", e.g. "3 שעות").
- Provide a realistic total duration in weeks ("שבועות").
- If you cannot follow this exact format, do not generate a project plan.`;
}
