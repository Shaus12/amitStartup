export interface DepartmentWithProcesses {
  id: string;
  name: string;
  color: string;
  headcount: number | null;
  // Real DB column names (snake_case from Supabase)
  position_x: number | null;
  position_y: number | null;
  // Relations from Supabase
  processes?: { name: string; frequency?: string | null; is_manual?: boolean }[];
  ai_opportunities?: { id: string; title: string; impact_type: string }[];
  // Legacy camelCase aliases (kept for components that use them)
  positionX?: number | null;
  positionY?: number | null;
  aiOpportunities?: { id: string; title: string; impactType: string }[];
}

export interface BusinessMapData {
  business: {
    id: string;
    name: string;
    industry: string | null;
  };
  departments: DepartmentWithProcesses[];
}
