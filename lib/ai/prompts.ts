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

  return `You are an expert business operations consultant and AI strategist. Analyze the business knowledge base below and return a structured JSON analysis.

DEPARTMENTS IN THIS BUSINESS (you MUST include all of them in your response, using EXACT names):
${deptList}

BUSINESS KNOWLEDGE BASE:
${knowledgeSection || "(No onboarding data provided — infer from industry / company size / tools if known)"}

───────────────────────────────────────────────────────────────────
REQUIRED OUTPUT — return ONLY valid JSON matching this exact schema:
───────────────────────────────────────────────────────────────────
{
  "overall_health_score": <number 0-100>,
  "daily_tip": "<one actionable tip in HEBREW — based on the biggest pain point>",
  "biggest_pain": "<one sentence in HEBREW summarising the main business problem>",
  "departments": [
    {
      "department_name": "<EXACT name from the list above>",
      "health_score": <number 0-100>,
      "main_pain": "<one sentence in HEBREW — biggest challenge for this department>",
      "first_action": "<one concrete action the owner can take TODAY — in English>",
      "opportunities": [
        {
          "title": "<specific, action-oriented title — in English>",
          "description": "<one sentence explaining why this applies to this specific business — in English>",
          "impact_type": "time" | "money" | "growth",
          "estimated_hours_saved": <realistic number per week>,
          "estimated_cost_saved": <realistic number in ILS per month>,
          "priority": <1=highest … 5=lowest>
        }
      ]
    }
  ]
}

───────────────────────────────────────────────────────────────────
STRICT RULES — violating any of these makes the output unusable:
───────────────────────────────────────────────────────────────────
1. You MUST include EVERY department listed above. No department may be omitted.
2. Every department MUST have at least 2 opportunities (aim for 2–3).
3. department_name MUST exactly match the provided names — no paraphrasing.
4. impact_type must be exactly one of: "time", "money", "growth".
5. Never invent facts. Make reasonable inferences from industry, company size, and tools.
6. When data is sparse, apply industry-standard benchmarks for the business type.
7. Vary impact_type and priority across opportunities — do not default everything to priority 3.
8. daily_tip, biggest_pain, and main_pain MUST be written in Hebrew (עברית).
9. Everything else (titles, descriptions, first_action) should be in English.
10. Return ONLY the JSON object. No markdown, no explanation, no code fences.`;
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
