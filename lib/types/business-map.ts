export interface DepartmentWithProcesses {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  positionX: number;
  positionY: number;
  status: string;
  headcount: number | null;
  sortOrder: number;
  processes: {
    id: string;
    name: string;
    frequency: string | null;
    timeSpentHrsPerWeek: number | null;
    isManual: boolean;
    isRepetitive: boolean;
  }[];
  painPoints: { id: string; description: string; severity: string }[];
  aiOpportunities: { id: string; title: string; impactType: string }[];
}

export interface BusinessMapData {
  business: {
    id: string;
    name: string;
    industry: string;
    businessType: string;
  };
  departments: DepartmentWithProcesses[];
}
