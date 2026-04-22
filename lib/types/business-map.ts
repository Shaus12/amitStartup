export interface DepartmentWithProcesses {
  id: string;
  name: string;
  color: string;
  headcount: number | null;
  status: string;
  description?: string | null;
  // Relations from Supabase
  processes: { 
    id: string; 
    name: string; 
    frequency?: string | null; 
    is_manual?: boolean;
    time_spent_hrs_per_week?: number | null;
    // camelCase aliases
    isManual?: boolean;
    timeSpentHrsPerWeek?: number | null;
  }[];
  ai_opportunities: { id: string; title: string; impact_type: string }[];
  pain_points: { id: string; description: string; severity: string }[];
  // Legacy camelCase aliases (kept for components that use them)
  positionX?: number | null;
  positionY?: number | null;
  aiOpportunities: { id: string; title: string; impactType: string }[];
  painPoints: { id: string; description: string; severity: string }[];
  healthScore?: number | null;
  mainPain?: string | null;
  firstAction?: string | null;
  isLocked?: boolean;
}

/** Aggregated AI analysis figures for reveal modal + map summary node */
export interface AnalysisSummarySnapshot {
  hoursSavedPerMonth: number;
  moneySavedPerYear: number;
  opportunityCount: number;
  /** Raw score from DB (often 0–100) */
  healthScore: number | null;
  /** Normalized 0–10 for benchmark UI */
  healthScoreOutOf10: number | null;
  departmentCount: number;
  questionnaireQuote: string | null;
}

export interface BusinessMapData {
  business: {
    id: string;
    name: string;
    industry: string | null;
  };
  departments: DepartmentWithProcesses[];
  /** Present when map loads; used for first-visit reveal + summary card */
  analysisSummary: AnalysisSummarySnapshot;
}
