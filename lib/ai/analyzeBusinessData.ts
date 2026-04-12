import { buildAnalysisPrompt } from "./prompts";

export interface OpportunityResult {
  title: string;
  description: string;
  impactType: string;
  estimatedHoursSaved: number | null;
  estimatedCostSaved: number | null;
  implementationEffort: string | null;
  category: string | null;
  departmentName: string | null;
  agentName: string | null;
  agentDescription: string | null;
  agentTools: string | null;
  setupComplexity: string | null;
}

export interface AnalysisResult {
  opportunities: OpportunityResult[];
  summary: {
    topPriority: string;
    totalHoursSaved: number;
    totalMonthlySavings: number;
  };
}

const STUB_RESULT: AnalysisResult = {
  opportunities: [
    {
      title: "Automate customer inquiry responses",
      description:
        "Deploy an AI agent that handles first-line customer support, answering FAQs and routing complex issues to the right team member. Based on your 50+ weekly inquiries, this could eliminate 80% of manual responses.",
      impactType: "time_savings",
      estimatedHoursSaved: 12,
      estimatedCostSaved: 1800,
      implementationEffort: "low",
      category: "ai_agent",
      departmentName: "Customer Support",
      agentName: "Support Triage Agent",
      agentDescription:
        "Monitors your email inbox and chat, reads incoming messages, searches your knowledge base for answers, responds automatically to common questions, and escalates complex issues with a full context summary to your team.",
      agentTools: "Claude API, Intercom or Gmail API, Notion/Confluence",
      setupComplexity: "some_setup",
    },
    {
      title: "AI-powered lead follow-up sequences",
      description:
        "An agent that monitors your CRM, detects stale leads, and sends personalized follow-up emails at the right time. Eliminates the manual follow-up task your sales team does every week.",
      impactType: "revenue",
      estimatedHoursSaved: 8,
      estimatedCostSaved: 3200,
      implementationEffort: "medium",
      category: "ai_agent",
      departmentName: "Sales",
      agentName: "Lead Nurture Agent",
      agentDescription:
        "Checks CRM daily for leads that haven't been contacted in 3+ days, generates personalized follow-up emails based on their profile and last interaction, sends them automatically, and logs all activity back in the CRM.",
      agentTools: "Claude API, HubSpot/Pipedrive API, Zapier",
      setupComplexity: "some_setup",
    },
    {
      title: "Automated weekly reporting",
      description:
        "Replace manual report creation with an AI agent that pulls data from your tools, compiles it into a formatted report, and sends it to stakeholders every Monday morning.",
      impactType: "time_savings",
      estimatedHoursSaved: 6,
      estimatedCostSaved: 900,
      implementationEffort: "medium",
      category: "ai_agent",
      departmentName: "Operations",
      agentName: "Weekly Report Agent",
      agentDescription:
        "Every Sunday night, pulls metrics from your analytics tools, financial dashboard, and project management system, compiles a structured executive summary with key highlights and flags, and sends it via email to your leadership team.",
      agentTools: "Claude API, Google Analytics API, QuickBooks API, Gmail",
      setupComplexity: "some_setup",
    },
    {
      title: "Eliminate copy-paste between tools",
      description:
        "Your team regularly copies data between systems. An automation layer can sync this automatically, eliminating hours of manual data entry per week.",
      impactType: "time_savings",
      estimatedHoursSaved: 5,
      estimatedCostSaved: 750,
      implementationEffort: "low",
      category: "automation",
      departmentName: null,
      agentName: null,
      agentDescription: null,
      agentTools: "Zapier or Make (formerly Integromat)",
      setupComplexity: "plug_and_play",
    },
    {
      title: "AI content creation for marketing",
      description:
        "Use AI to draft social media posts, blog articles, and email newsletters. Reduce content creation time by 70% while maintaining brand voice.",
      impactType: "time_savings",
      estimatedHoursSaved: 7,
      estimatedCostSaved: 1400,
      implementationEffort: "low",
      category: "ai_tool",
      departmentName: "Marketing",
      agentName: null,
      agentDescription: null,
      agentTools: "Claude API or ChatGPT, Buffer/Hootsuite",
      setupComplexity: "plug_and_play",
    },
    {
      title: "Meeting summarizer and action item extractor",
      description:
        "Automatically transcribe and summarize all meetings, extracting action items and assigning them in your project management tool. No more post-meeting note-taking.",
      impactType: "time_savings",
      estimatedHoursSaved: 4,
      estimatedCostSaved: 600,
      implementationEffort: "low",
      category: "ai_tool",
      departmentName: null,
      agentName: null,
      agentDescription: null,
      agentTools: "Otter.ai or Fireflies.ai, Notion/Asana integration",
      setupComplexity: "plug_and_play",
    },
    {
      title: "Invoice and payment tracking automation",
      description:
        "Automate invoice creation, sending, and payment reminders. Connect your finance tool to your CRM so invoices are created automatically when deals close.",
      impactType: "cost_savings",
      estimatedHoursSaved: 4,
      estimatedCostSaved: 2400,
      implementationEffort: "low",
      category: "automation",
      departmentName: "Finance",
      agentName: null,
      agentDescription: null,
      agentTools: "QuickBooks/Xero + Zapier or Stripe",
      setupComplexity: "plug_and_play",
    },
    {
      title: "AI-assisted hiring and candidate screening",
      description:
        "Use AI to screen resumes, rank candidates, and draft personalized outreach emails. Reduce time-to-hire significantly.",
      impactType: "time_savings",
      estimatedHoursSaved: 5,
      estimatedCostSaved: 2000,
      implementationEffort: "medium",
      category: "ai_tool",
      departmentName: "HR",
      agentName: null,
      agentDescription: null,
      agentTools: "Claude API, ATS integration (Lever/Greenhouse)",
      setupComplexity: "some_setup",
    },
  ],
  summary: {
    topPriority:
      "Deploy the Support Triage Agent first — it has the lowest setup effort and immediately frees up your team's time on the most repetitive task.",
    totalHoursSaved: 51,
    totalMonthlySavings: 13050,
  },
};

export async function analyzeBusinessData(
  businessContext: object
): Promise<AnalysisResult> {
  // Use env var if available, otherwise use the provided fallback key
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDCSGMvXPjN4BGWzI3uIZI8xeP6rbI1edo";

  if (process.env.USE_AI_STUB === "true" || !apiKey) {
    await new Promise((r) => setTimeout(r, 1500)); // simulate latency
    return STUB_RESULT;
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use gemini-2.5-flash for fast, high-quality JSON generation
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    // Force JSON output
    generationConfig: { responseMimeType: "application/json" } 
  });

  const prompt = buildAnalysisPrompt(businessContext);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up any potential markdown code block wrappers
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(text) as AnalysisResult;
    return parsed;
  } catch (err: any) {
    console.error("Gemini API error or JSON parsing failed:", err);
    throw new Error(`Gemini analysis failed: ${err.message}`);
  }
}
