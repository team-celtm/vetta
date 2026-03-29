"use client";

import {
  hiresPerMonth,
  kpiCards,
  matchQualityTrend,
  poolDistribution,
  topSearchedRoles,
} from "@/app/api/AnalyticsPage/analyticsData";
import React, { useState } from "react";
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

// ── Icon helpers ──────────────────────────────────────────────────────────
const IconTarget = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
const IconCalendar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconBriefcase = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);
const IconDownload = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-4 h-4"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);
const IconChevron = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-4 h-4"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const IconArrowUp = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-3 h-3"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

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

// ── Custom Tooltip ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
        <p className="text-gray-400 text-xs mb-0.5">{label}</p>
        <p className="font-semibold text-gray-800">
          {payload[0].value}
          {payload[0].name === "score" ? "%" : ""}
        </p>
      </div>
    );
  }
  return null;
};

// ── KPI Card ───────────────────────────────────────────────────────────────
const KpiCard: React.FC<{ card: (typeof kpiCards)[0] }> = ({ card }) => {
  const Icon = iconMap[card.icon];
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpiBg[card.icon]}`}
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
        {card.badge}
      </div>
    </div>
  );
};

// ── Pool Donut ─────────────────────────────────────────────────────────────
const PoolDonut: React.FC = () => {
  const total = 1240;
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-base font-bold text-gray-900">Pool Distribution</h2>
      <p className="text-xs text-gray-400 mt-0.5 mb-5">By seniority level</p>
      <div className="flex items-center gap-6">
        <div className="relative w-36 h-36 flex-shrink-0">
          <PieChart width={144} height={144}>
            <Pie
              data={poolDistribution}
              cx={67}
              cy={67}
              innerRadius={44}
              outerRadius={67}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {poolDistribution.map((entry, i) => (
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
          {poolDistribution.map((d) => (
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
    </div>
  );
};

// ── Top Roles ──────────────────────────────────────────────────────────────
const TopRoles: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-base font-bold text-gray-900">Top Searched Roles</h2>
    <p className="text-xs text-gray-400 mt-0.5 mb-5">
      Most active JD categories
    </p>
    <ul className="space-y-4">
      {topSearchedRoles.map((role) => (
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
  </div>
);

// ── Hires Bar Chart ────────────────────────────────────────────────────────
const HiresChart: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-base font-bold text-gray-900">Hires per Month</h2>
    <p className="text-xs text-gray-400 mt-0.5 mb-4">
      Successful placements from Vetta matches
    </p>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={hiresPerMonth}
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
            {hiresPerMonth.map((_, i) => (
              <Cell
                key={i}
                fill={i === hiresPerMonth.length - 1 ? "#4F8EF7" : "#DBEAFE"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ── Match Quality Area Chart ───────────────────────────────────────────────
const MatchQualityChart: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-base font-bold text-gray-900">Match Quality Trend</h2>
    <p className="text-xs text-gray-400 mt-0.5 mb-4">
      Average match score across all searches
    </p>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={matchQualityTrend}
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
    {/* end label */}
    <div className="flex justify-end mt-1">
      <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
        94%
      </span>
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState("Last 30 days");
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          Analytics &amp; Insights
        </h1>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
            >
              {period} <IconChevron />
            </button>

            {open && (
              <div className="absolute mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {["Last 30 days", "Last 90 days", "Last 1 year"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setPeriod(option);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        period === option
                          ? "bg-gray-100 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {option}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
          {/* Export */}
          <button className="flex items-center gap-1.5 text-sm text-white bg-gray-900 rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors font-medium">
            <IconDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-7 max-w-screen-2xl mx-auto space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.id} card={card} />
          ))}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <HiresChart />
          </div>
          <div>
            <PoolDonut />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MatchQualityChart />
          </div>
          <div>
            <TopRoles />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
