export interface OrgData {
  id: string;
  name: string;
  industry: string;
  primary_city: string;
  plan: string;
  domain:string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

export interface SettingsData {
  org: OrgData;
  team_members: TeamMember[];
}