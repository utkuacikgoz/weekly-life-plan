export type Weeks = 1 | 2 | 3 | 4;

export type PlanInput = {
  weeks: Weeks;
  location: string;
  budget: number;
  currency: "USD" | "THB" | "EUR"
};

export type Place = {
  name: string;
  url?: string;
  rating?: number;
  notes?: string;
  source: "google" | "booking" | "reddit" | "manual";
  tags?: string[];
};

export type BudgetBreakdown = {
  currency: string;
  weeks: number;
  lodging: number;
  food: number;
  transport: number;
  cowork: number;
  gym: number;
  buffer: number;
  total: number;
  assumptions: {
    foodPerDay: number;
    transportPerDay: number;
    coworkPerDay: number;
    gymPerWeek: number;
    bufferPct: number;
  };
  warnings: string[];
};

export type PlanOutput = {
  summary: {
    homeBaseArea: string;
    why: string[];
  };
  stays: Place[];      // 3
  gyms: Place[];       // 3
  coworks: Place[];    // 3
  social: Place[];     // 3-6
  schedule: {
    day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
    blocks: { label: string; start: string; end: string; note?: string }[];
  }[];
  budget: BudgetBreakdown;
  provenance: {
    generatedAt: string; // ISO
    seed: string;
    notes: string[];
  };
};

export type PlanArtifact = {
  id: string;
  title: string;
  input: PlanInput;
  versions: {
    version: number;
    createdAt: string; // ISO
    output: PlanOutput;
  }[];
};
