// app/api/talentPipelLine/talentPipelineData.ts

export type Stage =
  // | "sourced"
  | "screening"
  | "interview"
  | "offer_sent"
  | "hired";

export interface Candidate {
  id: string;
  candidateId: string;
  initials: string;
  avatarColor: string;
  name: string;
  role: string;
  matchScore: number;
  scoreColor: "green" | "orange" | "yellow";
  tags: string[];
  location: string;
  experience: string;
  stage: Stage;
  meta?: string;
  isShortlisted?: boolean;
  priority?: number;
  notes?: string;
  availability?: string;

  jdId?: string;
  jobDescriptionId?: string;
}

export interface PipelineColumn {
  id: Stage;
  label: string;
  subtitle: string;
  badgeColor: string;
}

export const pipelineStats = [
  { icon: "person",   value: "—",   label: "Total in pipeline",   color: "bg-blue-50   text-blue-500"   },
  { icon: "check",    value: "—",   label: "Offers sent",         color: "bg-green-50  text-green-500"  },
  { icon: "calendar", value: "—",   label: "Interviews this week", color: "bg-orange-50 text-orange-400" },
  { icon: "pencil",   value: "22d", label: "Avg time to hire",    color: "bg-purple-50 text-purple-400" },
];

export const columns: PipelineColumn[] = [
  // { id: "sourced",    label: "Sourced",    subtitle: "From match engine", badgeColor: "bg-gray-700 text-white"   },
  { id: "screening",  label: "Screening",  subtitle: "Initial review",    badgeColor: "bg-orange-400 text-white" },
  { id: "interview",  label: "Interviews", subtitle: "Active interviews", badgeColor: "bg-orange-400 text-white" },
  { id: "offer_sent", label: "Offer Sent", subtitle: "Awaiting response", badgeColor: "bg-orange-400 text-white" },
  { id: "hired",      label: "Hired 🎉",   subtitle: "This quarter",      badgeColor: "bg-green-500 text-white"  },
];