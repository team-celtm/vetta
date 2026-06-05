"use client";

import {
  AnalyticsData,
  HiresPerMonth,
  KpiCardData,
  MatchQualityPoint,
  PoolDistribution,
  TopRole,
} from "@/app/Types/analyticsPage.interface";
import { PERIOD_OPTIONS } from "@/utils/constants";
import { getOrgId } from "@/utils/Helpers";
import {
  IconArrowDown,
  IconArrowUp,
  IconBolt,
  IconBriefcase,
  IconCalendar,
  IconChevron,
  IconDownload,
  IconRefresh,
  IconTarget,
} from "@/utils/Svgs/IconHelpers";
import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PieChart, Pie } from "recharts";

const iconMap: Record<string, React.FC> = {
  target: IconTarget,
  bolt: IconBolt,
  calendar: IconCalendar,
  briefcase: IconBriefcase,
};
const kpiBg: Record<string, string> = {
  target: "bg-rose-50 text-rose-500",
  bolt: "bg-emerald-50 text-emerald-500",
  calendar: "bg-blue-50 text-blue-500",
  briefcase: "bg-purple-50 text-purple-500",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

const KpiSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm border border-gray-100">
    <Skeleton className="w-10 h-10 rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
    <Skeleton className="h-6 w-28 rounded-full" />
  </div>
);

const ChartSkeleton = ({ height = "h-48" }: { height?: string }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <Skeleton className="h-4 w-40 mb-2" />
    <Skeleton className="h-3 w-56 mb-6" />
    <Skeleton className={`${height} w-full`} />
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className="font-semibold text-gray-800">
        {payload[0].value}
        {payload[0].name === "score" ? "%" : ""}
      </p>
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard: React.FC<{ card: KpiCardData }> = ({ card }) => {
  const Icon = iconMap[card.icon] ?? IconBolt;
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpiBg[card.icon] ?? "bg-gray-50 text-gray-500"}`}
      >
        <Icon />
      </div>
      <div>
        <p className="text-4xl font-black text-gray-900 tracking-tight leading-none">
          {card.value}
        </p>
        <p className="text-sm text-gray-400 mt-1">{card.label}</p>
      </div>
      <div
        className={`text-xs font-medium flex items-center gap-1 rounded-full px-2.5 py-1 w-fit ${
          card.badgeType === "positive"
            ? "bg-emerald-50 text-emerald-600"
            : card.badgeType === "negative"
              ? "bg-rose-50 text-rose-600"
              : "bg-blue-50 text-blue-600"
        }`}
      >
        {card.badgeType === "positive" && <IconArrowUp />}
        {card.badgeType === "negative" && <IconArrowDown />}
        {card.badge}
      </div>
    </div>
  );
};

// ─── Pool Donut ───────────────────────────────────────────────────────────────

const PoolDonut: React.FC<{ data: PoolDistribution[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <h2 className="text-base font-bold text-gray-900">Pool Distribution</h2>
      <p className="text-xs text-gray-400 mt-0.5 mb-5">By seniority level</p>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No data available
        </p>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative w-36 h-36 flex-shrink-0">
            <PieChart width={144} height={144}>
              <Pie
                data={data}
                cx={67}
                cy={67}
                innerRadius={44}
                outerRadius={67}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-black text-gray-900 leading-none">
                {total.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">total</span>
            </div>
          </div>
          <ul className="space-y-2.5 flex-1">
            {data.map((d) => (
              <li key={d.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-sm text-gray-600">{d.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {d.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Top Roles ────────────────────────────────────────────────────────────────

const TopRoles: React.FC<{ data: TopRole[] }> = ({ data }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
    <h2 className="text-base font-bold text-gray-900">Top Searched Roles</h2>
    <p className="text-xs text-gray-400 mt-0.5 mb-5">
      Most active JD categories
    </p>
    {data.length === 0 ? (
      <p className="text-sm text-gray-400 text-center py-8">No roles yet</p>
    ) : (
      <ul className="space-y-4">
        {data.map((role) => (
          <li key={role.rank} className="flex items-center gap-3">
            <span className="text-xs text-gray-300 font-semibold w-4 flex-shrink-0">
              {role.rank}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700 truncate">
                  {role.title}
                </span>
                <span className="text-sm font-bold text-blue-600 ml-2">
                  {role.count}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                  style={{ width: `${(role.count / role.maxCount) * 100}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// ─── Hires Bar Chart ──────────────────────────────────────────────────────────

const HiresChart: React.FC<{ data: HiresPerMonth[] }> = ({ data }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-base font-bold text-gray-900">Hires per Month</h2>
    <p className="text-xs text-gray-400 mt-0.5 mb-4">
      Successful placements from matches
    </p>
    {data.length === 0 ? (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-gray-400">No hire data available</p>
      </div>
    ) : (
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barSize={28}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F9FAFB" }} />
            <Bar dataKey="hires" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === data.length - 1 ? "#4F8EF7" : "#DBEAFE"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

// ─── Match Quality Area Chart ─────────────────────────────────────────────────

const MatchQualityChart: React.FC<{ data: MatchQualityPoint[] }> = ({
  data,
}) => {
  const latestScore = data[data.length - 1]?.score ?? null;
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-base font-bold text-gray-900">Match Quality Trend</h2>
      <p className="text-xs text-gray-400 mt-0.5 mb-4">
        Average match score across all searches
      </p>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-gray-400">No match data available</p>
        </div>
      ) : (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 4, right: 24, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F8EF7" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#4F8EF7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#4F8EF7"
                  strokeWidth={2.5}
                  fill="url(#matchGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#4F8EF7", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {latestScore !== null && (
            <div className="flex justify-end mt-1">
              <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                {latestScore}%
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30");
  const [dropOpen, setDropOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(
    async (selectedPeriod: string, silent = false) => {
      const orgId = getOrgId();
      if (!orgId) {
        setError("Organisation not found. Please log in again.");
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/orgs/${orgId}/analytics?period=${selectedPeriod}`,
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Failed to load analytics.");
        }
        const json: AnalyticsData = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchAnalytics(period);
  }, [fetchAnalytics, period]);

  const handlePeriodChange = (val: string) => {
    setPeriod(val);
    setDropOpen(false);
    fetchAnalytics(val);
  };

  const currentPeriodLabel =
    PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "Last 30 days";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Analytics &amp; Insights
          </h1>
          {refreshing && (
            <span className="text-xs text-gray-400 flex items-center gap-1 animate-pulse">
              <IconRefresh /> Refreshing…
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="relative">
            <button
              onClick={() => setDropOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
            >
              {currentPeriodLabel} <IconChevron />
            </button>
            {dropOpen && (
              <div className="absolute mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 right-0">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handlePeriodChange(opt.value)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${period === opt.value ? "bg-gray-100 font-medium" : "text-gray-700"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchAnalytics(period, true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <IconRefresh /> Refresh
          </button>

          {/* Export */}
          <button className="flex items-center gap-1.5 text-sm text-white bg-gray-900 rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors font-medium">
            <IconDownload /> Export
          </button>
        </div>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <svg
            className="w-5 h-5 text-red-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button
            onClick={() => fetchAnalytics(period)}
            className="ml-auto text-sm text-red-600 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-8 py-7 max-w-screen-2xl mx-auto space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading
            ? [0, 1, 2, 3].map((i) => <KpiSkeleton key={i} />)
            : (data?.kpiCards ?? []).map((card) => (
                <KpiCard key={card.id} card={card} />
              ))}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {loading ? (
              <ChartSkeleton height="h-48" />
            ) : (
              <HiresChart data={data?.hiresPerMonth ?? []} />
            )}
          </div>
          <div>
            {loading ? (
              <ChartSkeleton height="h-48" />
            ) : (
              <PoolDonut data={data?.poolDistribution ?? []} />
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {loading ? (
              <ChartSkeleton height="h-48" />
            ) : (
              <MatchQualityChart data={data?.matchQualityTrend ?? []} />
            )}
          </div>
          <div>
            {loading ? (
              <ChartSkeleton height="h-64" />
            ) : (
              <TopRoles data={data?.topSearchedRoles ?? []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
