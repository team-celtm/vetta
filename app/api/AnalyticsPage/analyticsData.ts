// api/analyticsData.ts

export interface KpiCard {
  id: string;
  value: string;
  label: string;
  badge: string;
  badgeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface HiresPerMonth {
  month: string;
  hires: number;
}

export interface PoolDistribution {
  label: string;
  value: number;
  color: string;
}

export interface TopRole {
  rank: number;
  title: string;
  count: number;
  maxCount: number;
}

export interface MatchQualityPoint {
  month: string;
  score: number;
}

// ── KPI Cards ──────────────────────────────────────────────────────────────
export const kpiCards: KpiCard[] = [
  {
    id: 'match-accuracy',
    value: '94%',
    label: 'Match accuracy',
    badge: '+3.2% vs last month',
    badgeType: 'positive',
    icon: 'target',
  },
  {
    id: 'avg-match-time',
    value: '2.1s',
    label: 'Avg match time',
    badge: '40% faster',
    badgeType: 'positive',
    icon: 'bolt',
  },
  {
    id: 'avg-time-to-hire',
    value: '22d',
    label: 'Avg time-to-hire',
    badge: '8d vs industry',
    badgeType: 'positive',
    icon: 'calendar',
  },
  {
    id: 'active-roles',
    value: '18',
    label: 'Active roles',
    badge: '6 new this month',
    badgeType: 'neutral',
    icon: 'briefcase',
  },
];

// ── Hires Per Month ────────────────────────────────────────────────────────
export const hiresPerMonth: HiresPerMonth[] = [
  { month: 'May', hires: 3 },
  { month: 'Jun', hires: 5 },
  { month: 'Jul', hires: 4 },
  { month: 'Aug', hires: 7 },
  { month: 'Sep', hires: 6 },
  { month: 'Oct', hires: 8 },
];

// ── Pool Distribution ──────────────────────────────────────────────────────
export const poolDistribution: PoolDistribution[] = [
  { label: 'Senior',     value: 399, color: '#4F8EF7' },
  { label: 'Mid-level',  value: 248, color: '#34D399' },
  { label: 'Lead/Head',  value: 149, color: '#FBBF24' },
  { label: 'Associate',  value: 109, color: '#F87171' },
];

export const poolTotal = poolDistribution.reduce((s, d) => s + d.value, 0); // 905 → design shows 1,240

// ── Top Searched Roles ─────────────────────────────────────────────────────
export const topSearchedRoles: TopRole[] = [
  { rank: 1, title: 'Sr. Product Manager', count: 34, maxCount: 34 },
  { rank: 2, title: 'Head of Product',     count: 24, maxCount: 34 },
  { rank: 3, title: 'PM — Platform',       count: 20, maxCount: 34 },
  { rank: 4, title: 'Growth PM',           count: 15, maxCount: 34 },
  { rank: 5, title: 'Technical PM',        count: 12, maxCount: 34 },
];

// ── Match Quality Trend ────────────────────────────────────────────────────
export const matchQualityTrend: MatchQualityPoint[] = [
  { month: 'May', score: 62 },
  { month: 'Jun', score: 68 },
  { month: 'Jul', score: 73 },
  { month: 'Aug', score: 79 },
  { month: 'Sep', score: 87 },
  { month: 'Oct', score: 94 },
];