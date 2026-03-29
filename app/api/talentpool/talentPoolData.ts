

export type Availability =
  | "Available now"
  | "Available in 2 weeks"
  | "Available in 1 month"
  | "Open to offers"
  | "Actively looking";

export interface TalentCandidate {
  id: string;
  initials: string;
  avatarColor: string;
  name: string;
  role: string;
  matchScore: number;
  scoreColor: "green" | "orange" | "blue";
  location: string;
  experience: string;
  skills: string[];
  availability: Availability;
}

// ── Summary Stats ──────────────────────────────────────────────────────────
export const poolStats = [
  { icon: "stack",    value: "1,240", label: "Total vetted",     color: "bg-blue-50 text-blue-400"   },
  { icon: "heart",    value: "387",   label: "Available now",    color: "bg-green-50 text-green-400" },
  { icon: "clock",    value: "42",    label: "Added this month", color: "bg-orange-50 text-orange-400" },
  { icon: "star",     value: "94%",   label: "Vet pass rate",    color: "bg-purple-50 text-purple-400" },
];

// ── Availability style map ─────────────────────────────────────────────────
export const availabilityStyle: Record<Availability, string> = {
  "Available now":        "text-green-500",
  "Available in 2 weeks": "text-orange-400",
  "Available in 1 month": "text-orange-400",
  "Open to offers":       "text-blue-500",
  "Actively looking":     "text-orange-500",
};

// ── Candidates ─────────────────────────────────────────────────────────────
export const talentPool: TalentCandidate[] = [
  {
    id: "tp1", initials: "AM", avatarColor: "bg-blue-500",
    name: "Aarav Mehta",   role: "Senior Product Manager",   matchScore: 96, scoreColor: "green",
    location: "Mumbai",    experience: "7 yrs",
    skills: ["Product Strategy", "Roadmapping", "SQL"],
    availability: "Available in 2 weeks",
  },
  {
    id: "tp2", initials: "PN", avatarColor: "bg-orange-400",
    name: "Priya Nair",    role: "Product Lead — B2B SaaS",  matchScore: 91, scoreColor: "green",
    location: "Bangalore", experience: "6 yrs",
    skills: ["B2B SaaS", "API Design", "Scrum"],
    availability: "Open to offers",
  },
  {
    id: "tp3", initials: "RK", avatarColor: "bg-teal-500",
    name: "Rohan Kapoor",  role: "Head of Product",          matchScore: 88, scoreColor: "orange",
    location: "Delhi/NCR", experience: "9 yrs",
    skills: ["Product Vision", "P&L Ownership", "Growth"],
    availability: "Actively looking",
  },
  {
    id: "tp4", initials: "SV", avatarColor: "bg-purple-400",
    name: "Sanya Verma",   role: "PM — Consumer Fintech",    matchScore: 82, scoreColor: "orange",
    location: "Hyderabad", experience: "5 yrs",
    skills: ["Consumer Apps", "A/B Testing", "Python"],
    availability: "Available now",
  },
  {
    id: "tp5", initials: "DK", avatarColor: "bg-purple-600",
    name: "Dev Krishnan",  role: "Senior PM — Platform",     matchScore: 79, scoreColor: "orange",
    location: "Chennai",   experience: "6 yrs",
    skills: ["Platform Products", "APIs", "Microservices"],
    availability: "Available in 1 month",
  },
  {
    id: "tp6", initials: "IB", avatarColor: "bg-teal-400",
    name: "Ishaan Bose",   role: "Product Manager",          matchScore: 71, scoreColor: "blue",
    location: "Pune",      experience: "4 yrs",
    skills: ["Feature PM", "Customer Success", "Jira"],
    availability: "Open to offers",
  },
  {
    id: "tp7", initials: "MJ", avatarColor: "bg-lime-500",
    name: "Meera Joshi",   role: "PM — Growth",              matchScore: 65, scoreColor: "blue",
    location: "Bangalore", experience: "3 yrs",
    skills: ["Growth", "Referrals", "Analytics"],
    availability: "Available now",
  },
  {
    id: "tp8", initials: "KS", avatarColor: "bg-indigo-600",
    name: "Kabir Sharma",  role: "Technical PM",             matchScore: 58, scoreColor: "blue",
    location: "Delhi/NCR", experience: "4 yrs",
    skills: ["Infra PM", "DevOps", "SRE"],
    availability: "Available in 2 weeks",
  },
];