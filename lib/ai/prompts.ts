export function buildAnalysisPrompt(businessContext: object): string {
  return `You are an expert business operations consultant and AI strategist. Analyze the following business and identify specific AI opportunities and deployable AI agents.

BUSINESS DATA:
${JSON.stringify(businessContext, null, 2)}

Return a JSON object with this exact structure:
{
  "opportunities": [
    {
      "title": "string - concise opportunity title",
      "description": "string - specific description tailored to this exact business",
      "impactType": "time_savings" | "cost_savings" | "revenue" | "quality",
      "estimatedHoursSaved": number or null (hours per week for the whole team),
      "estimatedCostSaved": number or null (dollars per month),
      "implementationEffort": "low" | "medium" | "high",
      "category": "automation" | "ai_agent" | "ai_tool" | "process_change",
      "departmentName": "string - must exactly match one of the provided department names, or null for company-wide",
      "agentName": "string or null - specific agent name if this is an AI agent recommendation",
      "agentDescription": "string or null - detailed day-to-day description of what the agent does",
      "agentTools": "string or null - specific tools/integrations required (e.g. 'Claude API, Zapier, HubSpot')",
      "setupComplexity": "plug_and_play" | "some_setup" | "custom_build" or null
    }
  ],
  "summary": {
    "topPriority": "string - the single most impactful thing they should do first",
    "totalHoursSaved": number,
    "totalMonthlySavings": number
  }
}

Rules:
- Generate 8-15 opportunities/agents. Mix quick wins (low effort) and high-impact items.
- Be SPECIFIC to this business. Reference actual processes, tools, and pain points they mentioned.
- For AI agents, describe exactly what the agent does day-to-day in plain language.
- Base time/cost estimates on the hours they reported spending on tasks.
- Prioritize based on their stated goals and top 90-day priority.
- Consider their AI comfort level and budget when suggesting setup complexity.
- Include at least 3 actual deployable AI agents (category: "ai_agent") with full agentName, agentDescription, and agentTools.

Return only valid JSON, no markdown.`;
}
