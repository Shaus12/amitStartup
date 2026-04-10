export interface DepartmentInput {
  name: string;
  headcount?: number;
  lead?: string;
}

export interface ProcessInput {
  name: string;
  departmentName: string;
  frequency?: string;
  isManual?: boolean;
}

export interface TimeAuditEntry {
  processName: string;
  departmentName: string;
  hoursPerWeek: number;
  peopleInvolved: number;
}

export interface ToolInput {
  name: string;
  category: string;
  isManualProcess?: boolean;
  monthlyCost?: number;
}

export interface OnboardingAnswers {
  // Step 0 - Welcome
  businessName: string;
  ownerName: string;
  tagline: string;

  // Step 1 - Business Type
  businessType: string;
  industry: string;
  targetCustomer: string;

  // Step 2 - Team Size
  employeeRange: string;
  staffStructure: string;
  hasSeparateDepts: boolean;

  // Step 3 - Revenue
  revenueRange: string;
  businessAge: string;
  growthTrajectory: string;

  // Step 4 - Departments
  departments: DepartmentInput[];

  // Step 5 - Tools
  tools: ToolInput[];
  softwareSpend: string;

  // Step 6 - Processes (per dept)
  processes: ProcessInput[];

  // Step 7 - Time Audit
  timeAudit: TimeAuditEntry[];

  // Step 8 - Manual Work
  manualTasks: string[];

  // Step 9 - Customer Interaction
  primaryContact: string;
  inquiryVolume: string;
  hasKnowledgeBase: string;
  avgResponseTime: string;
  salesProcess: string;

  // Step 10 - Reporting
  trackingMethod: string;
  reportingFrequency: string;
  reportCreator: string;
  dataBasedDecisions: string;

  // Step 11 - Communication
  internalComms: string;
  meetingHoursPerWeek: string;
  hasDocumentedSOPs: string;

  // Step 12 - Bottlenecks
  bottlenecks: string[];
  biggestHeadache: string;

  // Step 13 - Pain Points
  painPoint1: string;
  painPoint2: string;
  painPoint3: string;

  // Step 14 - Prior AI
  priorAiUsage: string;
  priorAiTools: string[];
  aiComfortLevel: string;

  // Step 15 - Budget
  aiBudget: string;
  aiPrefBuiltVsCustom: string;

  // Step 16 - Goals
  goals: string[];
  topPriority90Days: string;
}

export const EMPTY_ANSWERS: OnboardingAnswers = {
  businessName: "",
  ownerName: "",
  tagline: "",
  businessType: "",
  industry: "",
  targetCustomer: "",
  employeeRange: "",
  staffStructure: "",
  hasSeparateDepts: true,
  revenueRange: "",
  businessAge: "",
  growthTrajectory: "",
  departments: [],
  tools: [],
  softwareSpend: "",
  processes: [],
  timeAudit: [],
  manualTasks: [],
  primaryContact: "",
  inquiryVolume: "",
  hasKnowledgeBase: "",
  avgResponseTime: "",
  salesProcess: "",
  trackingMethod: "",
  reportingFrequency: "",
  reportCreator: "",
  dataBasedDecisions: "",
  internalComms: "",
  meetingHoursPerWeek: "",
  hasDocumentedSOPs: "",
  bottlenecks: [],
  biggestHeadache: "",
  painPoint1: "",
  painPoint2: "",
  painPoint3: "",
  priorAiUsage: "",
  priorAiTools: [],
  aiComfortLevel: "",
  aiBudget: "",
  aiPrefBuiltVsCustom: "",
  goals: [],
  topPriority90Days: "",
};
