// api/talentPipelineData.ts

export type Stage = "sourced" | "screening" | "interviews" | "offer_sent" | "hired";

export interface Candidate {
  id: string;
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
  meta?: string; // e.g. "Round 2", "₹42L pkg", "Joined Oct 1"
}

export interface PipelineColumn {
  id: Stage;
  label: string;
  subtitle: string;
  count: number;
  badgeColor: string;
}

// ── Summary Stats ──────────────────────────────────────────────────────────
export const pipelineStats = [
  { icon: "person",    value: "18",  label: "Total in pipeline",   color: "bg-blue-50   text-blue-500"   },
  { icon: "check",     value: "4",   label: "Offers sent",         color: "bg-green-50  text-green-500"  },
  { icon: "calendar",  value: "6",   label: "Interviews this week", color: "bg-orange-50 text-orange-400" },
  { icon: "pencil",    value: "22d", label: "Avg time to hire",    color: "bg-purple-50 text-purple-400" },
];

// ── Columns ────────────────────────────────────────────────────────────────
export const columns: PipelineColumn[] = [
  { id: "sourced",    label: "Sourced",    subtitle: "From match engine",  count: 6, badgeColor: "bg-gray-700 text-white"   },
  { id: "screening",  label: "Screening",  subtitle: "Initial review",     count: 4, badgeColor: "bg-orange-400 text-white" },
  { id: "interviews", label: "Interviews", subtitle: "Active interviews",  count: 4, badgeColor: "bg-orange-400 text-white" },
  { id: "offer_sent", label: "Offer Sent", subtitle: "Awaiting response",  count: 3, badgeColor: "bg-orange-400 text-white" },
  { id: "hired",      label: "Hired 🎉",   subtitle: "This quarter",       count: 2, badgeColor: "bg-green-500 text-white"  },
];

// ── Candidates ─────────────────────────────────────────────────────────────
export const candidates: Candidate[] = [
  // Sourced
  {
    id: "c1", initials: "AM", avatarColor: "bg-blue-500",
    name: "Aarav Mehta",    role: "Sr. PM",          matchScore: 96, scoreColor: "green",
    tags: ["Product Strategy", "Fintech"], location: "Mumbai", experience: "7 yrs", stage: "sourced",
  },
  {
    id: "c2", initials: "PN", avatarColor: "bg-orange-400",
    name: "Priya Nair",     role: "Product Lead",    matchScore: 91, scoreColor: "green",
    tags: ["B2B SaaS", "OKRs"], location: "Bangalore", experience: "6 yrs", stage: "sourced",
  },
  {
    id: "c3", initials: "MJ", avatarColor: "bg-green-500",
    name: "Meera Joshi",    role: "PM Growth",       matchScore: 65, scoreColor: "orange",
    tags: ["Growth", "Analytics"], location: "Bangalore", experience: "3 yrs", stage: "sourced",
  },
  {
    id: "c4", initials: "VP", avatarColor: "bg-teal-500",
    name: "Vijay Patel",    role: "PM Enterprise",   matchScore: 72, scoreColor: "orange",
    tags: ["Enterprise", "SaaS"], location: "Ahmedabad", experience: "5 yrs", stage: "sourced",
  },

  // Screening
  {
    id: "c5", initials: "RK", avatarColor: "bg-teal-500",
    name: "Rohan Kapoor",   role: "Head of Product", matchScore: 88, scoreColor: "green",
    tags: ["Product Vision", "P&L"], location: "Delhi", experience: "9 yrs", stage: "screening",
  },
  {
    id: "c6", initials: "DK", avatarColor: "bg-purple-500",
    name: "Dev Krishnan",   role: "Sr. PM Platform", matchScore: 79, scoreColor: "orange",
    tags: ["Platform", "APIs"], location: "Chennai", experience: "6 yrs", stage: "screening",
  },
  {
    id: "c7", initials: "AK", avatarColor: "bg-blue-400",
    name: "Ananya Kumar",   role: "PM BFSI",          matchScore: 76, scoreColor: "orange",
    tags: ["BFSI", "Compliance"], location: "Mumbai", experience: "5 yrs", stage: "screening",
  },
  {
    id: "c8", initials: "SM", avatarColor: "bg-lime-500",
    name: "Suresh Menon",   role: "Associate PM",    matchScore: 61, scoreColor: "orange",
    tags: ["Early Stage"], location: "Hyderabad", experience: "2 yrs", stage: "screening",
  },

  // Interviews
  {
    id: "c9",  initials: "SV", avatarColor: "bg-purple-400",
    name: "Sanya Verma",    role: "PM Fintech",      matchScore: 82, scoreColor: "green",
    tags: ["Consumer", "A/B Testing"], location: "Hyderabad", experience: "", stage: "interviews", meta: "Round 2",
  },
  {
    id: "c10", initials: "IB", avatarColor: "bg-blue-500",
    name: "Ishaan Bose",    role: "PM",              matchScore: 71, scoreColor: "orange",
    tags: ["CX", "Early Stage"], location: "Pune", experience: "", stage: "interviews", meta: "Round 1",
  },
  {
    id: "c11", initials: "NK", avatarColor: "bg-green-500",
    name: "Nisha Kapoor",   role: "Sr. PM",          matchScore: 85, scoreColor: "green",
    tags: ["Growth", "B2B"], location: "Bangalore", experience: "", stage: "interviews", meta: "Final Round",
  },
  {
    id: "c12", initials: "PD", avatarColor: "bg-orange-400",
    name: "Piyush Das",     role: "PM Infra",        matchScore: 74, scoreColor: "orange",
    tags: ["Platform"], location: "Noida", experience: "", stage: "interviews", meta: "Round 1",
  },

  // Offer Sent
  {
    id: "c13", initials: "RS", avatarColor: "bg-blue-500",
    name: "Rahul Sharma",   role: "Product Director", matchScore: 93, scoreColor: "green",
    tags: ["Director", "Platform"], location: "Bangalore", experience: "", stage: "offer_sent", meta: "₹42L pkg",
  },
  {
    id: "c14", initials: "KM", avatarColor: "bg-purple-500",
    name: "Kavya Menon",    role: "Sr. PM",           matchScore: 89, scoreColor: "green",
    tags: ["Fintech", "Data"], location: "Hyderabad", experience: "", stage: "offer_sent", meta: "₹32L pkg",
  },
  {
    id: "c15", initials: "TP", avatarColor: "bg-green-500",
    name: "Tanvi Patil",    role: "PM",               matchScore: 77, scoreColor: "orange",
    tags: ["Consumer"], location: "Pune", experience: "", stage: "offer_sent", meta: "₹22L pkg",
  },

  // Hired
  {
    id: "c16", initials: "VR", avatarColor: "bg-teal-500",
    name: "Vikram Rao",     role: "Head of Product",  matchScore: 94, scoreColor: "green",
    tags: ["Platform", "Leadership"], location: "Bangalore", experience: "", stage: "hired", meta: "Joined Oct 1",
  },
  {
    id: "c17", initials: "SB", avatarColor: "bg-orange-400",
    name: "Sneha Bajaj",    role: "Sr. PM",            matchScore: 87, scoreColor: "green",
    tags: ["Fintech", "Growth"], location: "Mumbai", experience: "", stage: "hired", meta: "Joined Sep 15",
  },
];