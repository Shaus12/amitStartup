import Anthropic from "@anthropic-ai/sdk";
import { logClaudeApiUsage } from "@/lib/ai/api-usage";

type GiftTemplate = {
  id: string;
  name: string;
  selection_prompt: string;
  generation_prompt: string;
};

type KnowledgeRow = {
  category: string;
  content: string;
  metadata?: unknown;
};

function extractTextContent(content: Anthropic.Messages.Message["content"]): string {
  const textBlock = content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const trimmed = textBlock.text.trim();
  if (!trimmed.startsWith("```")) return trimmed;

  return trimmed
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

function buildSelectionPrompt(templates: GiftTemplate[], knowledgeRows: KnowledgeRow[]) {
  return [
    "You are selecting the best business gift template.",
    "Pick exactly ONE template id from the provided list.",
    "Return ONLY valid JSON with this exact shape:",
    '{ "template_id": "<id>", "reasoning": "<short reason>" }',
    "",
    "Available templates:",
    JSON.stringify(
      templates.map((t) => ({
        id: t.id,
        name: t.name,
        selection_prompt: t.selection_prompt,
      })),
      null,
      2
    ),
    "",
    "Business knowledge context:",
    JSON.stringify(knowledgeRows, null, 2),
  ].join("\n");
}

function buildGenerationPrompt({
  generationPrompt,
  businessName,
  knowledgeRows,
}: {
  generationPrompt: string;
  businessName: string | null;
  knowledgeRows: KnowledgeRow[];
}) {
  return [
    generationPrompt,
    "",
    "פרטי העסק:",
    `שם העסק: ${businessName ?? "לא צוין"}`,
    "",
    "Business knowledge (JSON):",
    JSON.stringify(knowledgeRows, null, 2),
    "",
    "הנחיה חשובה: כתוב את כל התוכן בעברית בלבד, בצורה ברורה ומובנית עם כותרות ושורות חדשות.",
  ].join("\n");
}

export async function generateGiftWithClaude({
  templates,
  knowledgeRows,
  businessName,
  usageContext,
}: {
  templates: GiftTemplate[];
  knowledgeRows: KnowledgeRow[];
  businessName: string | null;
  usageContext?: { businessId?: string | null; userId?: string | null };
}): Promise<{ template: GiftTemplate; content: string; reasoning: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }
  if (templates.length === 0) {
    throw new Error("No active gift templates available");
  }

  const client = new Anthropic({ apiKey });

  const selectionResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: buildSelectionPrompt(templates, knowledgeRows) }],
  });
  await logClaudeApiUsage({
    businessId: usageContext?.businessId,
    userId: usageContext?.userId,
    callType: "gift_selection",
    model: "claude-sonnet-4-6",
    usage: selectionResponse.usage,
  });

  const selectionText = extractTextContent(selectionResponse.content);
  const parsed = JSON.parse(selectionText) as { template_id?: string; reasoning?: string };
  const selectedTemplate =
    templates.find((t) => t.id === parsed.template_id) ??
    templates[0];

  const generationResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2200,
    messages: [
      {
        role: "user",
        content: buildGenerationPrompt({
          generationPrompt: selectedTemplate.generation_prompt,
          businessName,
          knowledgeRows,
        }),
      },
    ],
  });
  await logClaudeApiUsage({
    businessId: usageContext?.businessId,
    userId: usageContext?.userId,
    callType: "gift_generation",
    model: "claude-sonnet-4-6",
    usage: generationResponse.usage,
  });

  return {
    template: selectedTemplate,
    content: extractTextContent(generationResponse.content),
    reasoning: parsed.reasoning ?? "",
  };
}
