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
}

export interface BusinessMapData {
  business: {
    id: string;
    name: string;
    industry: string | null;
  };
  departments: DepartmentWithProcesses[];
}
