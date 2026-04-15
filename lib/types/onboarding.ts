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

  // Step 16b - Marketing & Leads
  monthlyLeads: string;
  leadSources: string[];
  marketingBudget: string;
  adPlatforms: string[];

  // Step 16c - Notifications
  notificationsEnabled: boolean;
}

export const RANDOM_ANSWERS: OnboardingAnswers = {
  businessName: "גלרייה פרימיום",
  ownerName: "עמית כהן",
  tagline: "חנות אונליין לבגדי יוקרה",
  businessType: "E-Commerce / Retail",
  industry: "Fashion & Retail",
  targetCustomer: "B2C",
  employeeRange: "6-15",
  staffStructure: "Department leads with small teams",
  hasSeparateDepts: true,
  revenueRange: "2M-10M",
  businessAge: "3-5 years",
  growthTrajectory: "Growing fast",
  departments: [
    { name: "Sales", headcount: 3 },
    { name: "Marketing", headcount: 2 },
    { name: "Operations", headcount: 4 },
    { name: "Customer Support", headcount: 2 },
  ],
  tools: [
    { name: "Gmail", category: "Communication", isManualProcess: false, monthlyCost: 0 },
    { name: "WhatsApp Business", category: "Communication", isManualProcess: true, monthlyCost: 0 },
    { name: "Excel", category: "Productivity", isManualProcess: true, monthlyCost: 10 },
    { name: "Monday.com", category: "Project Management", isManualProcess: false, monthlyCost: 50 },
    { name: "Shopify", category: "E-Commerce", isManualProcess: false, monthlyCost: 80 },
  ],
  softwareSpend: "500-2000",
  processes: [
    { name: "Lead generation", departmentName: "Sales", frequency: "Daily", isManual: true },
    { name: "Proposal creation", departmentName: "Sales", frequency: "Weekly", isManual: true },
    { name: "Social media posting", departmentName: "Marketing", frequency: "Daily", isManual: true },
    { name: "Email campaigns", departmentName: "Marketing", frequency: "Weekly", isManual: false },
    { name: "Onboarding new clients", departmentName: "Operations", frequency: "Weekly", isManual: true },
    { name: "Inventory management", departmentName: "Operations", frequency: "Daily", isManual: true },
    { name: "Handling inquiries", departmentName: "Customer Support", frequency: "Daily", isManual: true },
    { name: "Ticket management", departmentName: "Customer Support", frequency: "Daily", isManual: true },
  ],
  timeAudit: [
    { processName: "Lead generation", departmentName: "Sales", hoursPerWeek: 10, peopleInvolved: 2 },
    { processName: "Proposal creation", departmentName: "Sales", hoursPerWeek: 8, peopleInvolved: 2 },
    { processName: "Social media posting", departmentName: "Marketing", hoursPerWeek: 12, peopleInvolved: 1 },
    { processName: "Email campaigns", departmentName: "Marketing", hoursPerWeek: 6, peopleInvolved: 1 },
    { processName: "Onboarding new clients", departmentName: "Operations", hoursPerWeek: 15, peopleInvolved: 2 },
    { processName: "Inventory management", departmentName: "Operations", hoursPerWeek: 20, peopleInvolved: 3 },
  ],
  manualTasks: [
    "Copy-paste data between tools",
    "Send similar emails or messages repeatedly",
    "Create weekly or monthly reports manually",
    "Follow up with leads or customers manually",
    "Answer the same customer questions repeatedly",
    "Create invoices and track payments manually",
  ],
  primaryContact: "Email and WhatsApp",
  inquiryVolume: "50-100",
  hasKnowledgeBase: "No",
  avgResponseTime: "2-4 hours",
  salesProcess: "Manual outreach + demo calls",
  trackingMethod: "Excel spreadsheets",
  reportingFrequency: "Weekly",
  reportCreator: "Operations manager",
  dataBasedDecisions: "Sometimes",
  internalComms: "WhatsApp groups",
  meetingHoursPerWeek: "6-10",
  hasDocumentedSOPs: "Partially",
  bottlenecks: ["Manual data entry", "Slow customer response", "Reporting takes too long"],
  biggestHeadache: "כל הדיווח נעשה ידנית ולוקח שעות כל שבוע",
  painPoint1: "מעקב ידני אחר לידים גורם להחמצת הזדמנויות",
  painPoint2: "ניהול מלאי ידני גורם לשגיאות ועיכובים",
  painPoint3: "שירות לקוחות איטי בגלל תשובות ידניות חוזרות",
  priorAiUsage: "Tried a few tools",
  priorAiTools: ["ChatGPT", "Canva AI"],
  aiComfortLevel: "Moderate",
  aiBudget: "500-2000",
  aiPrefBuiltVsCustom: "Prefer ready-made solutions",
  goals: ["Save time on repetitive tasks", "Improve customer response time", "Better reporting and analytics"],
  topPriority90Days: "Automate customer support and reduce response time by 80%",
  monthlyLeads: "50-100",
  leadSources: ["Organic search", "Social media", "Referrals"],
  marketingBudget: "5000-15000",
  adPlatforms: ["Meta", "Google"],
  notificationsEnabled: false,
};

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
  monthlyLeads: "",
  leadSources: [],
  marketingBudget: "",
  adPlatforms: [],
  notificationsEnabled: false,
};
