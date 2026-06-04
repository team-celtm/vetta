

export interface InferredSkill {
  name: string;
  weight: number;
}

export interface JDStatus {
  id: string;
  status: "draft" | "inferring" | "active" | "paused" | "closed";
  title: string;
  inferred_skills: InferredSkill[];
  inferred_seniority: string | null;
  inferred_domain: string | null;
  inferred_personality?: {
    leadership: number;
    team_player: number;
    communication: number;
    data_driven: number;
    bias_to_action: number;
    extroversion: number;
  } | null;
  created_at?: string;
}