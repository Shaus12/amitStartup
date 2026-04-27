export interface AiOpportunityItem {
  id: string;
  businessId: string;
  departmentId: string | null;
  title: string;
  description: string;
  impactType: "time_savings" | "cost_savings" | "revenue" | "quality" | "time" | "money" | "growth";
  estimatedHoursSaved: number | null;
  estimatedCostSaved: number | null;
  implementationEffort: "low" | "medium" | "high" | null;
  category: "automation" | "ai_agent" | "ai_tool" | "process_change" | null;
  agentName: string | null;
  agentDescription: string | null;
  agentTools: string | null;
  setupComplexity: "plug_and_play" | "some_setup" | "custom_build" | null;
  dismissedAt: string | null;
  pinned: boolean;
  generatedAt: string;
  source: string;
  department?: { name: string; color: string } | null;
  isQuickWin?: boolean;
  notificationHook?: string | null;
  proofOfValue?: string | null;
}

export interface OpportunitySummary {
  totalHoursSaved: number;
  totalCostSaved: number;
  agentCount: number;
  opportunityCount: number;
}
