export interface KpiCardData {
  id: string;
  value: string;
  label: string;
  badge: string;
  badgeType: "positive" | "negative" | "neutral";
  icon: string;
}
export interface HiresPerMonth   { month: string; hires: number; }
export interface PoolDistribution { label: string; value: number; color: string; }
export interface TopRole          { rank: number; title: string; count: number; maxCount: number; }
export interface MatchQualityPoint { month: string; score: number; }

export interface AnalyticsData {
  kpiCards:          KpiCardData[];
  hiresPerMonth:     HiresPerMonth[];
  poolDistribution:  PoolDistribution[];
  topSearchedRoles:  TopRole[];
  matchQualityTrend: MatchQualityPoint[];
}