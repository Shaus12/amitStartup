import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

type ApiCallType = "analysis" | "daily_tip" | "chat" | "project_planning" | "knowledge_request";

type Usage = {
  input_tokens?: number;
  output_tokens?: number;
};

type UsageContext = {
  businessId?: string | null;
  userId?: string | null;
  callType: ApiCallType;
  model?: string | null;
  usage?: Usage | null;
};

function getRatePerMillion(model: string): { input: number; output: number } | null {
  const m = model.toLowerCase();

  if (m.includes("opus")) {
    return { input: 15, output: 75 };
  }

  if (m.includes("sonnet")) {
    return { input: 3, output: 15 };
  }

  return null;
}

function estimateCostUsd(model: string | null | undefined, inputTokens: number, outputTokens: number): number | null {
  if (!model) return null;
  const rates = getRatePerMillion(model);
  if (!rates) return null;

  return (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output;
}

export async function logClaudeApiUsage({
  businessId,
  userId,
  callType,
  model,
  usage,
}: UsageContext): Promise<void> {
  const inputTokens = usage?.input_tokens ?? 0;
  const outputTokens = usage?.output_tokens ?? 0;
  const estimatedCostUsd = estimateCostUsd(model, inputTokens, outputTokens);

  const { error } = await supabase.from("api_usage_logs").insert({
    business_id: businessId ?? null,
    user_id: userId ?? null,
    call_type: callType,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost_usd: estimatedCostUsd,
    model: model ?? null,
  });

  if (error) {
    console.error("Failed to log API usage:", {
      callType,
      businessId,
      userId,
      model,
      inputTokens,
      outputTokens,
      error,
    });
  }
}
